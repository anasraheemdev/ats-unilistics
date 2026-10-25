-- ============================================================================
-- Migration 003: Student Cases, Counsellor Assignments & Applications
-- Product: Unilistics (ATS for European Higher Education)
-- Guidelines: Follows supabase and supabase-postgres-best-practices
-- Core Architectural Distinction:
--   1 student -> 1 student_case (Case Room & Pipeline)
--   1 student_case -> N applications (Program/Intake submissions)
-- ============================================================================

-- 1. Student Cases Table
CREATE TABLE IF NOT EXISTS public.student_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_country TEXT NOT NULL REFERENCES public.countries(code) ON DELETE RESTRICT,
  target_degree TEXT NOT NULL CHECK (target_degree IN ('bachelors', 'masters')),
  target_intake_season TEXT NOT NULL,
  target_intake_year INTEGER NOT NULL,
  current_stage TEXT NOT NULL DEFAULT 'onboarding' CHECK (current_stage IN ('onboarding', 'attestation', 'dossier_assembly', 'submission', 'decision', 'visa_prep', 'relocation')),
  stage_status TEXT NOT NULL DEFAULT 'in_progress' CHECK (stage_status IN ('in_progress', 'completed', 'blocked', 'waiting_third_party')),
  next_required_action TEXT NOT NULL,
  next_action_due_date DATE NOT NULL,
  responsible_party TEXT NOT NULL CHECK (responsible_party IN ('student', 'counsellor', 'embassy', 'hec_mofa')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_student_case UNIQUE (student_id)
);

CREATE INDEX IF NOT EXISTS idx_student_cases_student_id ON public.student_cases(student_id);
CREATE INDEX IF NOT EXISTS idx_student_cases_stage ON public.student_cases(current_stage, stage_status);

-- 2. Counsellor Case Assignments Table (Row-level counsellor isolation)
CREATE TABLE IF NOT EXISTS public.case_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.student_cases(id) ON DELETE CASCADE,
  counsellor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT uq_case_counsellor UNIQUE (case_id, counsellor_id)
);

CREATE INDEX IF NOT EXISTS idx_case_assignments_counsellor ON public.case_assignments(counsellor_id, is_active);
CREATE INDEX IF NOT EXISTS idx_case_assignments_case ON public.case_assignments(case_id, is_active);

-- 3. Applications Table (Multiple program submissions per student case)
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.student_cases(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE RESTRICT,
  intake_id UUID NOT NULL REFERENCES public.intakes(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'drafting' CHECK (status IN ('drafting', 'ready_to_submit', 'submitted_by_staff', 'conditional_offer', 'unconditional_offer', 'rejected', 'withdrawn')),
  portal_application_number TEXT,
  submission_deadline DATE NOT NULL,
  submitted_at TIMESTAMPTZ,
  offer_conditions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_case_program_intake UNIQUE (case_id, program_id, intake_id)
);

CREATE INDEX IF NOT EXISTS idx_applications_case_id ON public.applications(case_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);

-- 4. Private Case Access & Ownership Helpers
CREATE OR REPLACE FUNCTION private.get_student_case_id(p_user_id UUID)
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
  SELECT id FROM public.student_cases
  WHERE student_id = p_user_id;
$$;

CREATE OR REPLACE FUNCTION private.get_case_student_id(p_case_id UUID)
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
  SELECT student_id FROM public.student_cases
  WHERE id = p_case_id;
$$;

CREATE OR REPLACE FUNCTION private.is_assigned_counsellor(p_case_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.case_assignments
    WHERE case_id = p_case_id
      AND counsellor_id = p_user_id
      AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION private.can_access_case(p_case_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
  SELECT
    private.is_admin(p_user_id)
    OR private.is_assigned_counsellor(p_case_id, p_user_id)
    OR (private.get_case_student_id(p_case_id) = p_user_id AND private.is_active_account(p_user_id));
$$;

GRANT EXECUTE ON FUNCTION private.get_student_case_id(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION private.get_case_student_id(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_assigned_counsellor(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION private.can_access_case(UUID, UUID) TO authenticated;

REVOKE EXECUTE ON FUNCTION private.get_student_case_id(UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION private.get_case_student_id(UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION private.is_assigned_counsellor(UUID, UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION private.can_access_case(UUID, UUID) FROM PUBLIC, anon;

-- 5. Enable RLS on all exposed tables
ALTER TABLE public.student_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies: student_cases
-- Student owner can view their case
CREATE POLICY "student_cases_select_student" ON public.student_cases
  FOR SELECT TO authenticated
  USING (
    student_id = (SELECT auth.uid())
    AND private.is_active_account((SELECT auth.uid()))
  );

-- Staff can view cases: admin/super_admin see all, counsellors see only assigned cases
CREATE POLICY "student_cases_select_staff" ON public.student_cases
  FOR SELECT TO authenticated
  USING (
    private.is_admin((SELECT auth.uid()))
    OR private.is_assigned_counsellor(id, (SELECT auth.uid()))
  );

-- Only Staff can update official student case status, current_stage, or next action
CREATE POLICY "student_cases_update_staff" ON public.student_cases
  FOR UPDATE TO authenticated
  USING (
    private.is_admin((SELECT auth.uid()))
    OR private.is_assigned_counsellor(id, (SELECT auth.uid()))
  )
  WITH CHECK (
    private.is_admin((SELECT auth.uid()))
    OR private.is_assigned_counsellor(id, (SELECT auth.uid()))
  );

-- 7. RLS Policies: case_assignments
-- Student can view counsellor assignments on their own case
CREATE POLICY "case_assignments_select_student" ON public.case_assignments
  FOR SELECT TO authenticated
  USING (
    private.get_case_student_id(case_id) = (SELECT auth.uid())
    AND private.is_active_account((SELECT auth.uid()))
  );

-- Counsellor can view assignments where they are the counsellor
CREATE POLICY "case_assignments_select_counsellor" ON public.case_assignments
  FOR SELECT TO authenticated
  USING (
    counsellor_id = (SELECT auth.uid())
    AND private.is_staff((SELECT auth.uid()))
  );

-- Admin can view all assignments
CREATE POLICY "case_assignments_select_admin" ON public.case_assignments
  FOR SELECT TO authenticated
  USING (private.is_admin((SELECT auth.uid())));

-- Only Admin can mutate case assignments
CREATE POLICY "case_assignments_write_admin" ON public.case_assignments
  FOR ALL TO authenticated
  USING (private.is_admin((SELECT auth.uid())))
  WITH CHECK (private.is_admin((SELECT auth.uid())));

-- 8. RLS Policies: applications
-- Student can view applications for their own case
CREATE POLICY "applications_select_student" ON public.applications
  FOR SELECT TO authenticated
  USING (
    case_id = private.get_student_case_id((SELECT auth.uid()))
    AND private.is_active_account((SELECT auth.uid()))
  );

-- Staff can view applications for assigned cases or if admin
CREATE POLICY "applications_select_staff" ON public.applications
  FOR SELECT TO authenticated
  USING (
    private.is_admin((SELECT auth.uid()))
    OR private.is_assigned_counsellor(case_id, (SELECT auth.uid()))
  );

-- Student can create applications for their own case in 'drafting' status
CREATE POLICY "applications_insert_student" ON public.applications
  FOR INSERT TO authenticated
  WITH CHECK (
    case_id = private.get_student_case_id((SELECT auth.uid()))
    AND private.is_active_account((SELECT auth.uid()))
    AND status = 'drafting'
  );

-- Student can update applications only if still in 'drafting' status and cannot forge case_id
CREATE POLICY "applications_update_student" ON public.applications
  FOR UPDATE TO authenticated
  USING (
    case_id = private.get_student_case_id((SELECT auth.uid()))
    AND private.is_active_account((SELECT auth.uid()))
    AND status = 'drafting'
  )
  WITH CHECK (
    case_id = private.get_student_case_id((SELECT auth.uid()))
    AND private.is_active_account((SELECT auth.uid()))
    AND status IN ('drafting', 'ready_to_submit')
  );

-- Staff can update application status (e.g. submitted_by_staff, offers)
CREATE POLICY "applications_update_staff" ON public.applications
  FOR UPDATE TO authenticated
  USING (
    private.is_admin((SELECT auth.uid()))
    OR private.is_assigned_counsellor(case_id, (SELECT auth.uid()))
  )
  WITH CHECK (
    private.is_admin((SELECT auth.uid()))
    OR private.is_assigned_counsellor(case_id, (SELECT auth.uid()))
  );
