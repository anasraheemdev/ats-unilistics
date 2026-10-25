-- ============================================================================
-- Migration 002: Higher Education Catalogue, Workflows & Guide Sources
-- Product: Unilistics (ATS for European Higher Education)
-- Guidelines: Follows supabase and supabase-postgres-best-practices
-- ============================================================================

-- 1. Supported Countries Table
CREATE TABLE IF NOT EXISTS public.countries (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  visa_authority TEXT NOT NULL,
  intake_seasons TEXT[] NOT NULL DEFAULT ARRAY['winter', 'summer'],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Universities Table
CREATE TABLE IF NOT EXISTS public.universities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT NOT NULL REFERENCES public.countries(code) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  native_name TEXT,
  city TEXT NOT NULL,
  institution_type TEXT NOT NULL CHECK (institution_type IN ('public', 'private')),
  ranking_indicative INTEGER,
  publication_status TEXT NOT NULL DEFAULT 'published' CHECK (publication_status IN ('draft', 'published', 'archived')),
  provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_universities_country_pub ON public.universities(country_code, publication_status);
CREATE INDEX IF NOT EXISTS idx_universities_name ON public.universities(name);

-- 3. Degree Programs Table
CREATE TABLE IF NOT EXISTS public.programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  degree_level TEXT NOT NULL CHECK (degree_level IN ('bachelors', 'masters')),
  teaching_language TEXT NOT NULL CHECK (teaching_language IN ('english', 'german', 'french', 'italian', 'romanian', 'bilingual')),
  tuition_type TEXT NOT NULL CHECK (tuition_type IN ('free', 'low_cost', 'standard')),
  annual_tuition_eur NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  application_portal TEXT NOT NULL,
  publication_status TEXT NOT NULL DEFAULT 'published' CHECK (publication_status IN ('draft', 'published', 'archived')),
  provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_programs_uni_pub ON public.programs(university_id, publication_status);
CREATE INDEX IF NOT EXISTS idx_programs_degree_level ON public.programs(degree_level);
CREATE INDEX IF NOT EXISTS idx_programs_language ON public.programs(teaching_language);

-- 4. Program Intakes & Deadlines Table
CREATE TABLE IF NOT EXISTS public.intakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  season TEXT NOT NULL CHECK (season IN ('winter', 'summer', 'fall', 'spring')),
  academic_year INTEGER NOT NULL,
  deadline_date DATE NOT NULL,
  portal_open_date DATE,
  publication_status TEXT NOT NULL DEFAULT 'published' CHECK (publication_status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_program_intake UNIQUE (program_id, season, academic_year)
);

CREATE INDEX IF NOT EXISTS idx_intakes_prog_pub ON public.intakes(program_id, publication_status);
CREATE INDEX IF NOT EXISTS idx_intakes_deadline ON public.intakes(deadline_date);

-- 5. Regional & State Scholarships Table
CREATE TABLE IF NOT EXISTS public.scholarships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT NOT NULL REFERENCES public.countries(code) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  provider TEXT NOT NULL,
  degree_level TEXT NOT NULL CHECK (degree_level IN ('bachelors', 'masters', 'all')),
  coverage_type TEXT NOT NULL CHECK (coverage_type IN ('full_tuition_and_stipend', 'tuition_waiver', 'regional_grant')),
  stipend_amount_eur NUMERIC(10,2),
  annual_deadline_date TEXT,
  publication_status TEXT NOT NULL DEFAULT 'published' CHECK (publication_status IN ('draft', 'published', 'archived')),
  provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scholarships_country_pub ON public.scholarships(country_code, publication_status);

-- 6. Student Saved Program Bookmarks
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_program_bookmark UNIQUE (user_id, program_id)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON public.bookmarks(user_id);

-- 7. Procedural Workflow Templates & Versioning
CREATE TABLE IF NOT EXISTS public.workflow_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT NOT NULL REFERENCES public.countries(code) ON DELETE RESTRICT,
  degree_level TEXT NOT NULL CHECK (degree_level IN ('bachelors', 'masters')),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_workflow_template UNIQUE (country_code, degree_level)
);

CREATE TABLE IF NOT EXISTS public.workflow_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.workflow_templates(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  CONSTRAINT uq_workflow_template_version UNIQUE (template_id, version_number)
);

CREATE TABLE IF NOT EXISTS public.workflow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id UUID NOT NULL REFERENCES public.workflow_versions(id) ON DELETE CASCADE,
  step_key TEXT NOT NULL,
  title TEXT NOT NULL,
  stage TEXT NOT NULL CHECK (stage IN ('onboarding', 'attestation', 'dossier_assembly', 'submission', 'decision', 'visa_prep', 'relocation')),
  sort_order INTEGER NOT NULL,
  instructions TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_workflow_step_key UNIQUE (version_id, step_key)
);

CREATE INDEX IF NOT EXISTS idx_workflow_steps_version_sort ON public.workflow_steps(version_id, sort_order);

CREATE TABLE IF NOT EXISTS public.workflow_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id UUID NOT NULL REFERENCES public.workflow_steps(id) ON DELETE CASCADE,
  depends_on_step_id UUID NOT NULL REFERENCES public.workflow_steps(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_workflow_step_dep UNIQUE (step_id, depends_on_step_id)
);

-- 8. Guide Sources & Statutory Version Tracking
CREATE TABLE IF NOT EXISTS public.guide_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT NOT NULL REFERENCES public.countries(code) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  authority TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.guide_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES public.guide_sources(id) ON DELETE CASCADE,
  version_tag TEXT NOT NULL,
  content_markdown TEXT NOT NULL,
  review_status TEXT NOT NULL DEFAULT 'draft' CHECK (review_status IN ('draft', 'verified_current', 'deprecated')),
  verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_guide_source_version UNIQUE (source_id, version_tag)
);

-- 9. Enable RLS on all exposed tables
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_versions ENABLE ROW LEVEL SECURITY;

-- 10. RLS Policies: Countries
CREATE POLICY "countries_select_all" ON public.countries
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "countries_write_admin" ON public.countries
  FOR ALL TO authenticated
  USING (private.is_admin((SELECT auth.uid())))
  WITH CHECK (private.is_admin((SELECT auth.uid())));

-- 11. RLS Policies: Universities, Programs, Intakes, Scholarships
-- Public/Anon: can view published universities
CREATE POLICY "universities_select_published" ON public.universities
  FOR SELECT TO anon, authenticated
  USING (publication_status = 'published');

CREATE POLICY "universities_write_staff" ON public.universities
  FOR ALL TO authenticated
  USING (private.is_staff((SELECT auth.uid())))
  WITH CHECK (private.is_staff((SELECT auth.uid())));

-- Programs: Approved Explorers & Managed Students can view published programs
CREATE POLICY "programs_select_published" ON public.programs
  FOR SELECT TO anon, authenticated
  USING (publication_status = 'published');

CREATE POLICY "programs_write_staff" ON public.programs
  FOR ALL TO authenticated
  USING (private.is_staff((SELECT auth.uid())))
  WITH CHECK (private.is_staff((SELECT auth.uid())));

-- Intakes: View published intakes
CREATE POLICY "intakes_select_published" ON public.intakes
  FOR SELECT TO anon, authenticated
  USING (publication_status = 'published');

CREATE POLICY "intakes_write_staff" ON public.intakes
  FOR ALL TO authenticated
  USING (private.is_staff((SELECT auth.uid())))
  WITH CHECK (private.is_staff((SELECT auth.uid())));

-- Scholarships: View published scholarships
CREATE POLICY "scholarships_select_published" ON public.scholarships
  FOR SELECT TO anon, authenticated
  USING (publication_status = 'published');

CREATE POLICY "scholarships_write_staff" ON public.scholarships
  FOR ALL TO authenticated
  USING (private.is_staff((SELECT auth.uid())))
  WITH CHECK (private.is_staff((SELECT auth.uid())));

-- 12. RLS Policies: Bookmarks
CREATE POLICY "bookmarks_select_owner" ON public.bookmarks
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id AND private.is_active_account((SELECT auth.uid())));

CREATE POLICY "bookmarks_insert_owner" ON public.bookmarks
  FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = user_id
    AND private.is_active_account((SELECT auth.uid()))
    AND (
      private.has_active_entitlement((SELECT auth.uid()), 'explorer_catalogue')
      OR private.has_active_entitlement((SELECT auth.uid()), 'managed_application_case')
      OR private.is_staff((SELECT auth.uid()))
    )
  );

CREATE POLICY "bookmarks_delete_owner" ON public.bookmarks
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id AND private.is_active_account((SELECT auth.uid())));

-- 13. RLS Policies: Workflows & Guides
CREATE POLICY "workflows_select_active" ON public.workflow_templates
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "workflow_versions_select_active" ON public.workflow_versions
  FOR SELECT TO authenticated
  USING (is_active = true OR private.is_staff((SELECT auth.uid())));

CREATE POLICY "workflow_steps_select_active" ON public.workflow_steps
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "workflow_deps_select_active" ON public.workflow_dependencies
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "workflows_write_staff" ON public.workflow_templates
  FOR ALL TO authenticated
  USING (private.is_staff((SELECT auth.uid())))
  WITH CHECK (private.is_staff((SELECT auth.uid())));

CREATE POLICY "workflow_versions_write_staff" ON public.workflow_versions
  FOR ALL TO authenticated
  USING (private.is_staff((SELECT auth.uid())))
  WITH CHECK (private.is_staff((SELECT auth.uid())));

CREATE POLICY "workflow_steps_write_staff" ON public.workflow_steps
  FOR ALL TO authenticated
  USING (private.is_staff((SELECT auth.uid())))
  WITH CHECK (private.is_staff((SELECT auth.uid())));

CREATE POLICY "workflow_deps_write_staff" ON public.workflow_dependencies
  FOR ALL TO authenticated
  USING (private.is_staff((SELECT auth.uid())))
  WITH CHECK (private.is_staff((SELECT auth.uid())));

CREATE POLICY "guide_sources_select_all" ON public.guide_sources
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "guide_versions_select_verified" ON public.guide_versions
  FOR SELECT TO authenticated
  USING (review_status = 'verified_current' OR private.is_staff((SELECT auth.uid())));

CREATE POLICY "guides_write_staff" ON public.guide_sources
  FOR ALL TO authenticated
  USING (private.is_staff((SELECT auth.uid())))
  WITH CHECK (private.is_staff((SELECT auth.uid())));

CREATE POLICY "guide_versions_write_staff" ON public.guide_versions
  FOR ALL TO authenticated
  USING (private.is_staff((SELECT auth.uid())))
  WITH CHECK (private.is_staff((SELECT auth.uid())));
