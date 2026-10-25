-- ============================================================================
-- Migration 008: Atomic 50-Item Preview Allowlist, Gated Scholarships &
--                Server-Side Filtered & Paginated Catalogue Browsing
-- Product: Unilistics (ATS for European Higher Education)
-- Guidelines: Follows supabase and supabase-postgres-best-practices
-- ============================================================================

-- 1. Add is_preview_allowed to programs table
ALTER TABLE public.programs
ADD COLUMN IF NOT EXISTS is_preview_allowed BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_programs_preview ON public.programs(publication_status, is_preview_allowed);

-- 2. Dedicated Administrator-Selected Preview Allowlist Table
CREATE TABLE IF NOT EXISTS public.preview_allowlist (
  university_id UUID PRIMARY KEY REFERENCES public.universities(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  added_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_preview_allowlist_sort ON public.preview_allowlist(sort_order);

-- 3. Trigger: Atomically Enforce Maximum 50 Distinct Allowlisted Universities Globally
CREATE OR REPLACE FUNCTION private.enforce_preview_allowlist_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT COUNT(*) INTO v_count FROM public.preview_allowlist;
    IF v_count >= 50 THEN
      RAISE EXCEPTION 'Preview allowlist cannot exceed 50 distinct universities. Current count: %', v_count;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_preview_allowlist_limit ON public.preview_allowlist;
CREATE TRIGGER trg_enforce_preview_allowlist_limit
  BEFORE INSERT ON public.preview_allowlist
  FOR EACH ROW
  EXECUTE FUNCTION private.enforce_preview_allowlist_limit();

-- 4. Enable RLS on preview_allowlist
ALTER TABLE public.preview_allowlist ENABLE ROW LEVEL SECURITY;

-- Anonymous and authenticated can read the allowlist
CREATE POLICY "preview_allowlist_select" ON public.preview_allowlist
  FOR SELECT TO anon, authenticated
  USING (true);

-- Only Admin can mutate preview allowlist
CREATE POLICY "preview_allowlist_write_admin" ON public.preview_allowlist
  FOR ALL TO authenticated
  USING (private.is_admin((SELECT auth.uid())))
  WITH CHECK (private.is_admin((SELECT auth.uid())));

-- 5. Overhaul RLS Policies on Universities, Programs, Intakes, and Scholarships
-- Drop previous overly broad public policies
DROP POLICY IF EXISTS "universities_select_published" ON public.universities;
DROP POLICY IF EXISTS "programs_select_published" ON public.programs;
DROP POLICY IF EXISTS "intakes_select_published" ON public.intakes;
DROP POLICY IF EXISTS "scholarships_select_published" ON public.scholarships;

-- 5a. Universities RLS:
-- Anonymous: Can ONLY view published universities in the preview allowlist (<= 50)
CREATE POLICY "universities_select_anon" ON public.universities
  FOR SELECT TO anon
  USING (
    publication_status = 'published'
    AND id IN (SELECT university_id FROM public.preview_allowlist)
  );

-- Authenticated:
-- Approved Explorer / Managed Student / Staff: Can view all published universities
-- Pending / Unapproved: Can view ONLY preview allowlist
CREATE POLICY "universities_select_authenticated" ON public.universities
  FOR SELECT TO authenticated
  USING (
    (
      publication_status = 'published'
      AND (
        private.has_active_entitlement((SELECT auth.uid()), 'explorer_catalogue')
        OR private.has_active_entitlement((SELECT auth.uid()), 'managed_application_case')
        OR private.is_staff((SELECT auth.uid()))
        OR id IN (SELECT university_id FROM public.preview_allowlist)
      )
    )
    OR private.is_staff((SELECT auth.uid()))
  );

-- 5b. Programs RLS:
-- Anonymous: Can ONLY view published, explicitly preview-allowed programs belonging to allowlisted universities
CREATE POLICY "programs_select_anon" ON public.programs
  FOR SELECT TO anon
  USING (
    publication_status = 'published'
    AND is_preview_allowed = true
    AND university_id IN (SELECT university_id FROM public.preview_allowlist)
  );

-- Authenticated:
-- Approved Explorer / Managed Student / Staff: Can view all published programs
-- Pending: Can view ONLY preview-allowed programs
CREATE POLICY "programs_select_authenticated" ON public.programs
  FOR SELECT TO authenticated
  USING (
    (
      publication_status = 'published'
      AND (
        private.has_active_entitlement((SELECT auth.uid()), 'explorer_catalogue')
        OR private.has_active_entitlement((SELECT auth.uid()), 'managed_application_case')
        OR private.is_staff((SELECT auth.uid()))
        OR (
          is_preview_allowed = true
          AND university_id IN (SELECT university_id FROM public.preview_allowlist)
        )
      )
    )
    OR private.is_staff((SELECT auth.uid()))
  );

-- 5c. Intakes RLS:
CREATE POLICY "intakes_select_anon" ON public.intakes
  FOR SELECT TO anon
  USING (
    publication_status = 'published'
    AND program_id IN (
      SELECT p.id FROM public.programs p
      WHERE p.publication_status = 'published'
        AND p.is_preview_allowed = true
        AND p.university_id IN (SELECT university_id FROM public.preview_allowlist)
    )
  );

CREATE POLICY "intakes_select_authenticated" ON public.intakes
  FOR SELECT TO authenticated
  USING (
    (
      publication_status = 'published'
      AND (
        private.has_active_entitlement((SELECT auth.uid()), 'explorer_catalogue')
        OR private.has_active_entitlement((SELECT auth.uid()), 'managed_application_case')
        OR private.is_staff((SELECT auth.uid()))
        OR program_id IN (
          SELECT p.id FROM public.programs p
          WHERE p.publication_status = 'published'
            AND p.is_preview_allowed = true
            AND p.university_id IN (SELECT university_id FROM public.preview_allowlist)
        )
      )
    )
    OR private.is_staff((SELECT auth.uid()))
  );

-- 5d. Scholarships RLS (STRICTLY GATED FOR APPROVED ACCOUNTS):
-- Anonymous: ZERO ROWS (Default Deny - no policy for anon)
-- Authenticated: ONLY Approved Explorer / Managed Student / Staff
CREATE POLICY "scholarships_select_approved" ON public.scholarships
  FOR SELECT TO authenticated
  USING (
    (
      publication_status = 'published'
      AND (
        private.has_active_entitlement((SELECT auth.uid()), 'explorer_catalogue')
        OR private.has_active_entitlement((SELECT auth.uid()), 'managed_application_case')
        OR private.is_staff((SELECT auth.uid()))
      )
    )
    OR private.is_staff((SELECT auth.uid()))
  );

-- 6. Server-Side Bounded Query RPCs

-- 6a. Safe Universities Browser with Bounded Input & Pagination
CREATE OR REPLACE FUNCTION public.browse_universities(
  p_country TEXT DEFAULT NULL,
  p_institution_type TEXT DEFAULT NULL,
  p_search TEXT DEFAULT NULL,
  p_sort_by TEXT DEFAULT 'name_asc',
  p_page INTEGER DEFAULT 1,
  p_page_size INTEGER DEFAULT 12
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_uid UUID;
  v_is_approved BOOLEAN;
  v_page INTEGER;
  v_limit INTEGER;
  v_offset INTEGER;
  v_search TEXT;
  v_total INTEGER;
  v_items JSONB;
BEGIN
  v_uid := (SELECT auth.uid());

  -- Check if caller is an approved explorer or staff
  v_is_approved := (
    v_uid IS NOT NULL AND (
      private.has_active_entitlement(v_uid, 'explorer_catalogue')
      OR private.has_active_entitlement(v_uid, 'managed_application_case')
      OR private.is_staff(v_uid)
    )
  );

  -- Bound pagination parameters to eliminate resource exhaustion
  v_page := GREATEST(1, COALESCE(p_page, 1));
  v_limit := LEAST(GREATEST(1, COALESCE(p_page_size, 12)), 50);
  v_offset := (v_page - 1) * v_limit;

  -- Sanitize search input (max 100 characters)
  IF p_search IS NOT NULL AND LENGTH(TRIM(p_search)) > 0 THEN
    v_search := '%' || SUBSTRING(LOWER(TRIM(p_search)) FROM 1 FOR 100) || '%';
  ELSE
    v_search := NULL;
  END IF;

  -- Count total matching records according to user authorization level
  SELECT COUNT(*) INTO v_total
  FROM public.universities u
  JOIN public.countries c ON c.code = u.country_code
  WHERE u.publication_status = 'published'
    AND (
      v_is_approved = true
      OR u.id IN (SELECT university_id FROM public.preview_allowlist)
    )
    AND (p_country IS NULL OR p_country = 'all' OR u.country_code = LOWER(p_country))
    AND (p_institution_type IS NULL OR p_institution_type = 'all' OR u.institution_type = LOWER(p_institution_type))
    AND (v_search IS NULL OR LOWER(u.name) LIKE v_search OR LOWER(u.city) LIKE v_search OR LOWER(COALESCE(u.native_name, '')) LIKE v_search);

  -- Retrieve paginated slice with safe whitelisted sorting
  SELECT COALESCE(jsonb_agg(sub), '[]'::jsonb) INTO v_items
  FROM (
    SELECT
      u.id,
      u.country_code,
      c.name AS country_name,
      u.name,
      u.native_name,
      u.city,
      u.institution_type,
      u.ranking_indicative,
      (SELECT COUNT(*) FROM public.programs pr WHERE pr.university_id = u.id AND pr.publication_status = 'published') AS total_programs_count
    FROM public.universities u
    JOIN public.countries c ON c.code = u.country_code
    WHERE u.publication_status = 'published'
      AND (
        v_is_approved = true
        OR u.id IN (SELECT university_id FROM public.preview_allowlist)
      )
      AND (p_country IS NULL OR p_country = 'all' OR u.country_code = LOWER(p_country))
      AND (p_institution_type IS NULL OR p_institution_type = 'all' OR u.institution_type = LOWER(p_institution_type))
      AND (v_search IS NULL OR LOWER(u.name) LIKE v_search OR LOWER(u.city) LIKE v_search OR LOWER(COALESCE(u.native_name, '')) LIKE v_search)
    ORDER BY
      CASE WHEN p_sort_by = 'name_desc' THEN u.name END DESC,
      CASE WHEN p_sort_by = 'city_asc' THEN u.city END ASC,
      CASE WHEN p_sort_by = 'ranking_asc' THEN COALESCE(u.ranking_indicative, 9999) END ASC,
      CASE WHEN p_sort_by = 'name_asc' OR p_sort_by IS NULL THEN u.name END ASC,
      u.id ASC
    LIMIT v_limit OFFSET v_offset
  ) sub;

  RETURN jsonb_build_object(
    'items', v_items,
    'total_count', v_total,
    'page', v_page,
    'page_size', v_limit,
    'total_pages', CEIL(v_total::NUMERIC / v_limit),
    'is_preview_restricted', NOT v_is_approved
  );
END;
$$;

-- 6b. Safe Programs Browser with Bounded Input & Pagination
CREATE OR REPLACE FUNCTION public.browse_programs(
  p_country TEXT DEFAULT NULL,
  p_degree_level TEXT DEFAULT NULL,
  p_language TEXT DEFAULT NULL,
  p_tuition_type TEXT DEFAULT NULL,
  p_search TEXT DEFAULT NULL,
  p_sort_by TEXT DEFAULT 'title_asc',
  p_page INTEGER DEFAULT 1,
  p_page_size INTEGER DEFAULT 12
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_uid UUID;
  v_is_approved BOOLEAN;
  v_page INTEGER;
  v_limit INTEGER;
  v_offset INTEGER;
  v_search TEXT;
  v_total INTEGER;
  v_items JSONB;
BEGIN
  v_uid := (SELECT auth.uid());

  v_is_approved := (
    v_uid IS NOT NULL AND (
      private.has_active_entitlement(v_uid, 'explorer_catalogue')
      OR private.has_active_entitlement(v_uid, 'managed_application_case')
      OR private.is_staff(v_uid)
    )
  );

  v_page := GREATEST(1, COALESCE(p_page, 1));
  v_limit := LEAST(GREATEST(1, COALESCE(p_page_size, 12)), 50);
  v_offset := (v_page - 1) * v_limit;

  IF p_search IS NOT NULL AND LENGTH(TRIM(p_search)) > 0 THEN
    v_search := '%' || SUBSTRING(LOWER(TRIM(p_search)) FROM 1 FOR 100) || '%';
  ELSE
    v_search := NULL;
  END IF;

  SELECT COUNT(*) INTO v_total
  FROM public.programs p
  JOIN public.universities u ON u.id = p.university_id
  JOIN public.countries c ON c.code = u.country_code
  WHERE p.publication_status = 'published'
    AND u.publication_status = 'published'
    AND (
      v_is_approved = true
      OR (
        p.is_preview_allowed = true
        AND u.id IN (SELECT university_id FROM public.preview_allowlist)
      )
    )
    AND (p_country IS NULL OR p_country = 'all' OR u.country_code = LOWER(p_country))
    AND (p_degree_level IS NULL OR p_degree_level = 'all' OR p.degree_level = LOWER(p_degree_level) OR p.degree_level LIKE LOWER(p_degree_level) || '%')
    AND (p_language IS NULL OR p_language = 'all' OR p.teaching_language = LOWER(p_language) OR p.teaching_language LIKE LOWER(p_language) || '%')
    AND (p_tuition_type IS NULL OR p_tuition_type = 'all' OR p.tuition_type = LOWER(p_tuition_type))
    AND (v_search IS NULL OR LOWER(p.name) LIKE v_search OR LOWER(u.name) LIKE v_search);

  SELECT COALESCE(jsonb_agg(sub), '[]'::jsonb) INTO v_items
  FROM (
    SELECT
      p.id,
      p.university_id,
      u.name AS university_name,
      u.country_code,
      c.name AS country_name,
      p.name AS program_name,
      p.degree_level,
      p.teaching_language,
      p.tuition_type,
      p.annual_tuition_eur,
      p.application_portal,
      (p.provenance ->> 'verified_date') AS verified_date,
      (p.provenance ->> 'source_url') AS source_url,
      (
        SELECT i.deadline_date
        FROM public.intakes i
        WHERE i.program_id = p.id AND i.publication_status = 'published'
        ORDER BY i.deadline_date ASC
        LIMIT 1
      ) AS next_intake_deadline,
      (
        CASE WHEN v_uid IS NOT NULL THEN
          EXISTS (SELECT 1 FROM public.bookmarks b WHERE b.user_id = v_uid AND b.program_id = p.id)
        ELSE false END
      ) AS is_bookmarked
    FROM public.programs p
    JOIN public.universities u ON u.id = p.university_id
    JOIN public.countries c ON c.code = u.country_code
    WHERE p.publication_status = 'published'
      AND u.publication_status = 'published'
      AND (
        v_is_approved = true
        OR (
          p.is_preview_allowed = true
          AND u.id IN (SELECT university_id FROM public.preview_allowlist)
        )
      )
      AND (p_country IS NULL OR p_country = 'all' OR u.country_code = LOWER(p_country))
      AND (p_degree_level IS NULL OR p_degree_level = 'all' OR p.degree_level = LOWER(p_degree_level) OR p.degree_level LIKE LOWER(p_degree_level) || '%')
      AND (p_language IS NULL OR p_language = 'all' OR p.teaching_language = LOWER(p_language) OR p.teaching_language LIKE LOWER(p_language) || '%')
      AND (p_tuition_type IS NULL OR p_tuition_type = 'all' OR p.tuition_type = LOWER(p_tuition_type))
      AND (v_search IS NULL OR LOWER(p.name) LIKE v_search OR LOWER(u.name) LIKE v_search)
    ORDER BY
      CASE WHEN p_sort_by = 'title_desc' THEN p.name END DESC,
      CASE WHEN p_sort_by = 'tuition_asc' THEN p.annual_tuition_eur END ASC,
      CASE WHEN p_sort_by = 'tuition_desc' THEN p.annual_tuition_eur END DESC,
      CASE WHEN p_sort_by = 'title_asc' OR p_sort_by IS NULL THEN p.name END ASC,
      p.id ASC
    LIMIT v_limit OFFSET v_offset
  ) sub;

  RETURN jsonb_build_object(
    'items', v_items,
    'total_count', v_total,
    'page', v_page,
    'page_size', v_limit,
    'total_pages', CEIL(v_total::NUMERIC / v_limit),
    'is_preview_restricted', NOT v_is_approved
  );
END;
$$;

-- 6c. Safe Scholarships Browser (GATED: Only Approved Accounts Can Query)
CREATE OR REPLACE FUNCTION public.browse_scholarships(
  p_country TEXT DEFAULT NULL,
  p_degree_level TEXT DEFAULT NULL,
  p_coverage_type TEXT DEFAULT NULL,
  p_search TEXT DEFAULT NULL,
  p_page INTEGER DEFAULT 1,
  p_page_size INTEGER DEFAULT 12
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_uid UUID;
  v_is_approved BOOLEAN;
  v_page INTEGER;
  v_limit INTEGER;
  v_offset INTEGER;
  v_search TEXT;
  v_total INTEGER;
  v_items JSONB;
BEGIN
  v_uid := (SELECT auth.uid());

  v_is_approved := (
    v_uid IS NOT NULL AND (
      private.has_active_entitlement(v_uid, 'explorer_catalogue')
      OR private.has_active_entitlement(v_uid, 'managed_application_case')
      OR private.is_staff(v_uid)
    )
  );

  -- Gated enforcement: anonymous or unapproved accounts return empty gated response without leaking rows
  IF NOT v_is_approved THEN
    RETURN jsonb_build_object(
      'items', '[]'::jsonb,
      'total_count', 0,
      'page', 1,
      'page_size', p_page_size,
      'total_pages', 0,
      'is_gated', true,
      'cta_message', 'Regional European scholarships are restricted to verified applicants. Please request platform access to browse verified funding options.'
    );
  END IF;

  v_page := GREATEST(1, COALESCE(p_page, 1));
  v_limit := LEAST(GREATEST(1, COALESCE(p_page_size, 12)), 50);
  v_offset := (v_page - 1) * v_limit;

  IF p_search IS NOT NULL AND LENGTH(TRIM(p_search)) > 0 THEN
    v_search := '%' || SUBSTRING(LOWER(TRIM(p_search)) FROM 1 FOR 100) || '%';
  ELSE
    v_search := NULL;
  END IF;

  SELECT COUNT(*) INTO v_total
  FROM public.scholarships s
  JOIN public.countries c ON c.code = s.country_code
  WHERE s.publication_status = 'published'
    AND (p_country IS NULL OR p_country = 'all' OR s.country_code = LOWER(p_country))
    AND (p_degree_level IS NULL OR p_degree_level = 'all' OR s.degree_level = LOWER(p_degree_level) OR s.degree_level = 'all')
    AND (p_coverage_type IS NULL OR p_coverage_type = 'all' OR s.coverage_type = LOWER(p_coverage_type))
    AND (v_search IS NULL OR LOWER(s.name) LIKE v_search OR LOWER(s.provider) LIKE v_search);

  SELECT COALESCE(jsonb_agg(sub), '[]'::jsonb) INTO v_items
  FROM (
    SELECT
      s.id,
      s.country_code,
      c.name AS country_name,
      s.name,
      s.provider,
      s.degree_level,
      s.coverage_type,
      s.stipend_amount_eur,
      s.annual_deadline_date,
      (s.provenance ->> 'verified_date') AS verified_date,
      (s.provenance ->> 'source_url') AS source_url
    FROM public.scholarships s
    JOIN public.countries c ON c.code = s.country_code
    WHERE s.publication_status = 'published'
      AND (p_country IS NULL OR p_country = 'all' OR s.country_code = LOWER(p_country))
      AND (p_degree_level IS NULL OR p_degree_level = 'all' OR s.degree_level = LOWER(p_degree_level) OR s.degree_level = 'all')
      AND (p_coverage_type IS NULL OR p_coverage_type = 'all' OR s.coverage_type = LOWER(p_coverage_type))
      AND (v_search IS NULL OR LOWER(s.name) LIKE v_search OR LOWER(s.provider) LIKE v_search)
    ORDER BY s.name ASC, s.id ASC
    LIMIT v_limit OFFSET v_offset
  ) sub;

  RETURN jsonb_build_object(
    'items', v_items,
    'total_count', v_total,
    'page', v_page,
    'page_size', v_limit,
    'total_pages', CEIL(v_total::NUMERIC / v_limit),
    'is_gated', false
  );
END;
$$;

-- 7. Bookmark Toggle RPC (For Approved Accounts)
CREATE OR REPLACE FUNCTION public.toggle_program_bookmark(
  p_program_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_uid UUID;
  v_is_approved BOOLEAN;
  v_exists BOOLEAN;
BEGIN
  v_uid := (SELECT auth.uid());

  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required to save programs';
  END IF;

  v_is_approved := (
    private.has_active_entitlement(v_uid, 'explorer_catalogue')
    OR private.has_active_entitlement(v_uid, 'managed_application_case')
    OR private.is_staff(v_uid)
  );

  IF NOT v_is_approved THEN
    RAISE EXCEPTION 'Approved Explorer or Managed Student access required to save programs';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.bookmarks
    WHERE user_id = v_uid AND program_id = p_program_id
  ) INTO v_exists;

  IF v_exists THEN
    DELETE FROM public.bookmarks WHERE user_id = v_uid AND program_id = p_program_id;
    RETURN jsonb_build_object('success', true, 'is_bookmarked', false, 'program_id', p_program_id);
  ELSE
    INSERT INTO public.bookmarks (user_id, program_id)
    VALUES (v_uid, p_program_id);
    RETURN jsonb_build_object('success', true, 'is_bookmarked', true, 'program_id', p_program_id);
  END IF;
END;
$$;

-- 8. Grants for RPCs and Allowlist Table
GRANT SELECT ON public.preview_allowlist TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.browse_universities TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.browse_programs TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.browse_scholarships TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.toggle_program_bookmark TO authenticated;
