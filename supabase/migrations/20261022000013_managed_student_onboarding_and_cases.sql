-- ============================================================================
-- Migration 013: Managed Student Onboarding, Case Creation, Application Snapshots,
--                Audited Reassignment & Optimistic Concurrency
-- Product: Unilistics (Staff-Managed Higher Education Platform)
-- Guidelines: Follows supabase and supabase-postgres-best-practices
-- ============================================================================

-- 1. Enhance student_cases with Onboarding and Preferences
ALTER TABLE public.student_cases
  ADD COLUMN IF NOT EXISTS onboarding_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (onboarding_status IN ('pending', 'completed')),
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS study_preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS lock_version INTEGER NOT NULL DEFAULT 1;

CREATE INDEX IF NOT EXISTS idx_student_cases_onboarding ON public.student_cases(onboarding_status);

-- 2. Enhance applications with Snapshots, External Reporting, and Concurrency
-- Drop older status constraint to allow full outcome lifecycle
ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS applications_status_check;

ALTER TABLE public.applications
  ADD CONSTRAINT applications_status_check CHECK (status IN (
    'drafting', 'ready_to_submit', 'submitted_by_staff', 'awaiting_decision',
    'conditional_offer', 'unconditional_offer', 'accepted_offer', 'rejected',
    'withdrawn', 'deferred', 'visa_processing', 'visa_approved', 'visa_refused',
    'visa_administrative_processing'
  ));

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS university_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS program_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS intake_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS dossier_review_status TEXT NOT NULL DEFAULT 'pending_documents'
    CHECK (dossier_review_status IN ('pending_documents', 'under_counsellor_review', 'dossier_approved', 'revision_requested')),
  ADD COLUMN IF NOT EXISTS dossier_review_notes TEXT,
  ADD COLUMN IF NOT EXISTS external_status TEXT NOT NULL DEFAULT 'not_submitted'
    CHECK (external_status IN (
      'not_submitted', 'submitted', 'awaiting_decision', 'conditional_offer',
      'unconditional_offer', 'accepted_offer', 'rejected', 'withdrawn', 'deferred',
      'visa_processing', 'visa_approved', 'visa_refused', 'visa_administrative_processing'
    )),
  ADD COLUMN IF NOT EXISTS external_status_reported_by UUID REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS external_status_reported_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS external_evidence_reference TEXT,
  ADD COLUMN IF NOT EXISTS portal_url TEXT,
  ADD COLUMN IF NOT EXISTS portal_account_email TEXT,
  ADD COLUMN IF NOT EXISTS decision_outcome_type TEXT CHECK (decision_outcome_type IN (
    'conditional_offer', 'unconditional_offer', 'accepted_offer', 'rejected',
    'withdrawn', 'deferred', 'visa_approved', 'visa_refused', 'visa_administrative_processing'
  )),
  ADD COLUMN IF NOT EXISTS decision_reason TEXT,
  ADD COLUMN IF NOT EXISTS deferral_target_intake TEXT,
  ADD COLUMN IF NOT EXISTS next_action TEXT,
  ADD COLUMN IF NOT EXISTS next_action_due_date DATE,
  ADD COLUMN IF NOT EXISTS responsible_party TEXT NOT NULL DEFAULT 'counsellor'
    CHECK (responsible_party IN ('student', 'counsellor', 'university', 'embassy')),
  ADD COLUMN IF NOT EXISTS lock_version INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS last_staff_update_by UUID REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS last_staff_update_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_applications_dossier_status ON public.applications(dossier_review_status);
CREATE INDEX IF NOT EXISTS idx_applications_external_status ON public.applications(external_status);

-- 3. Enhance case_assignments with Deactivation Tracking
ALTER TABLE public.case_assignments
  ADD COLUMN IF NOT EXISTS unassigned_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS unassigned_by UUID REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS reassignment_reason TEXT;

-- 4. Application History Table (Chronological Audit & External Event Trail)
CREATE TABLE IF NOT EXISTS public.application_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES public.profiles(id),
  event_type TEXT NOT NULL CHECK (event_type IN ('created', 'status_transition', 'external_report', 'correction', 'reassignment')),
  from_status TEXT,
  to_status TEXT,
  reason TEXT,
  evidence_reference TEXT,
  reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_internal_only BOOLEAN NOT NULL DEFAULT false,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_application_history_app_id ON public.application_history(application_id, created_at);
CREATE INDEX IF NOT EXISTS idx_application_history_actor ON public.application_history(actor_id);

-- Enable RLS on application_history
ALTER TABLE public.application_history ENABLE ROW LEVEL SECURITY;

-- Students view history ONLY for their own applications and NEVER internal staff notes
CREATE POLICY "application_history_select_student" ON public.application_history
  FOR SELECT TO authenticated
  USING (
    is_internal_only = false
    AND EXISTS (
      SELECT 1 FROM public.applications a
      JOIN public.student_cases sc ON sc.id = a.case_id
      WHERE a.id = application_history.application_id
        AND sc.student_id = (SELECT auth.uid())
        AND private.is_active_account((SELECT auth.uid()))
    )
  );

-- Staff view all history for assigned cases or if admin
CREATE POLICY "application_history_select_staff" ON public.application_history
  FOR SELECT TO authenticated
  USING (
    private.is_admin((SELECT auth.uid()))
    OR EXISTS (
      SELECT 1 FROM public.applications a
      WHERE a.id = application_history.application_id
        AND private.is_assigned_counsellor(a.case_id, (SELECT auth.uid()))
    )
  );

-- Only Staff can insert history entries
CREATE POLICY "application_history_insert_staff" ON public.application_history
  FOR INSERT TO authenticated
  WITH CHECK (
    private.is_admin((SELECT auth.uid()))
    OR EXISTS (
      SELECT 1 FROM public.applications a
      WHERE a.id = application_history.application_id
        AND private.is_assigned_counsellor(a.case_id, (SELECT auth.uid()))
    )
  );

-- Grants
GRANT SELECT, INSERT ON public.application_history TO authenticated;
GRANT SELECT, UPDATE ON public.student_cases TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.applications TO authenticated;

-- 5. RPC: Student Complete Onboarding & Study Preferences
CREATE OR REPLACE FUNCTION public.student_complete_onboarding(
  p_study_preferences JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id UUID;
  v_case RECORD;
BEGIN
  v_user_id := (SELECT auth.uid());
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT * INTO v_case
  FROM public.student_cases
  WHERE student_id = v_user_id;

  IF v_case IS NULL THEN
    RAISE EXCEPTION 'No student case room exists for this user account';
  END IF;

  IF p_study_preferences IS NULL OR p_study_preferences = '{}'::jsonb THEN
    RAISE EXCEPTION 'Study preferences payload cannot be empty';
  END IF;

  UPDATE public.student_cases
  SET
    study_preferences = p_study_preferences,
    onboarding_status = 'completed',
    onboarding_completed_at = NOW(),
    current_stage = 'attestation',
    stage_status = 'in_progress',
    next_required_action = 'Submit educational transcripts for HEC attestation verification',
    next_action_due_date = CURRENT_DATE + INTERVAL '14 days',
    responsible_party = 'student',
    updated_at = NOW()
  WHERE id = v_case.id;

  -- Create default initial tasks if none exist
  IF NOT EXISTS (SELECT 1 FROM public.tasks WHERE case_id = v_case.id) THEN
    INSERT INTO public.tasks (case_id, title, description, assigned_to_role, status, category, due_date)
    VALUES
      (v_case.id, 'Upload Degree & Official Transcripts', 'Provide clear colour scans of final degree and semester transcripts.', 'student', 'pending', 'attestation', CURRENT_DATE + INTERVAL '7 days'),
      (v_case.id, 'Passport Scan Copy', 'Upload machine-readable passport identity pages valid for at least 18 months.', 'student', 'pending', 'general', CURRENT_DATE + INTERVAL '7 days');
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'case_id', v_case.id,
    'onboarding_status', 'completed',
    'message', 'Profile and study preferences successfully saved. Your case is ready for counsellor review.'
  );
END;
$$;

-- 6. RPC: Staff Create University Application with Snapshots
CREATE OR REPLACE FUNCTION public.staff_create_application(
  p_case_id UUID,
  p_program_id UUID,
  p_intake_id UUID,
  p_submission_deadline DATE DEFAULT NULL,
  p_portal_url TEXT DEFAULT NULL,
  p_portal_account_email TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_actor_id UUID;
  v_case RECORD;
  v_program RECORD;
  v_university RECORD;
  v_intake RECORD;
  v_deadline DATE;
  v_app_id UUID;
  v_uni_snap JSONB;
  v_prog_snap JSONB;
  v_intake_snap JSONB;
BEGIN
  v_actor_id := (SELECT auth.uid());
  IF NOT (private.is_admin(v_actor_id) OR private.is_assigned_counsellor(p_case_id, v_actor_id)) THEN
    RAISE EXCEPTION 'Permission denied: caller must be assigned counsellor or administrator';
  END IF;

  SELECT * INTO v_case FROM public.student_cases WHERE id = p_case_id;
  IF v_case IS NULL THEN
    RAISE EXCEPTION 'Student case % not found', p_case_id;
  END IF;

  -- Fetch program details
  SELECT * INTO v_program FROM public.programs WHERE id = p_program_id;
  IF v_program IS NULL THEN
    RAISE EXCEPTION 'Program % not found in catalogue', p_program_id;
  END IF;

  -- Fetch university details
  SELECT * INTO v_university FROM public.universities WHERE id = v_program.university_id;

  -- Fetch intake details
  SELECT * INTO v_intake FROM public.intakes WHERE id = p_intake_id;

  v_deadline := COALESCE(p_submission_deadline, v_intake.deadline_date, CURRENT_DATE + INTERVAL '60 days');

  -- Build immutable snapshots
  v_uni_snap := jsonb_build_object(
    'id', v_university.id,
    'name', v_university.name,
    'country', v_university.country_code,
    'city', v_university.city,
    'snapshotted_at', NOW()
  );

  v_prog_snap := jsonb_build_object(
    'id', v_program.id,
    'title', v_program.name,
    'degree_level', v_program.degree_level,
    'instruction_language', v_program.teaching_language,
    'tuition_per_year_eur', v_program.annual_tuition_eur,
    'snapshotted_at', NOW()
  );

  v_intake_snap := jsonb_build_object(
    'id', v_intake.id,
    'season', v_intake.season,
    'academic_year', v_intake.academic_year,
    'deadline_date', v_deadline,
    'snapshotted_at', NOW()
  );

  INSERT INTO public.applications (
    case_id,
    program_id,
    intake_id,
    status,
    submission_deadline,
    portal_url,
    portal_account_email,
    university_snapshot,
    program_snapshot,
    intake_snapshot,
    dossier_review_status,
    external_status,
    responsible_party,
    next_action,
    next_action_due_date,
    last_staff_update_by,
    last_staff_update_at
  ) VALUES (
    p_case_id,
    p_program_id,
    p_intake_id,
    'drafting',
    v_deadline,
    p_portal_url,
    p_portal_account_email,
    v_uni_snap,
    v_prog_snap,
    v_intake_snap,
    'pending_documents',
    'not_submitted',
    'counsellor',
    'Review candidate dossier against program prerequisites',
    CURRENT_DATE + INTERVAL '7 days',
    v_actor_id,
    NOW()
  ) RETURNING id INTO v_app_id;

  -- Record chronological history event
  INSERT INTO public.application_history (
    application_id,
    actor_id,
    event_type,
    from_status,
    to_status,
    reason,
    is_internal_only,
    payload
  ) VALUES (
    v_app_id,
    v_actor_id,
    'created',
    NULL,
    'drafting',
    'Application initiated and snapshotted from catalogue by counsellor',
    false,
    jsonb_build_object('program', v_program.name, 'university', v_university.name)
  );

  RETURN jsonb_build_object(
    'success', true,
    'application_id', v_app_id,
    'case_id', p_case_id,
    'university_name', v_university.name,
    'program_title', v_program.name
  );
END;
$$;

-- 7. RPC: Validated Staff Update with Optimistic Concurrency Control
CREATE OR REPLACE FUNCTION public.staff_update_application(
  p_application_id UUID,
  p_expected_lock_version INT,
  p_dossier_review_status TEXT DEFAULT NULL,
  p_dossier_review_notes TEXT DEFAULT NULL,
  p_external_status TEXT DEFAULT NULL,
  p_external_evidence_reference TEXT DEFAULT NULL,
  p_submitted_at TIMESTAMPTZ DEFAULT NULL,
  p_offer_conditions TEXT DEFAULT NULL,
  p_decision_outcome_type TEXT DEFAULT NULL,
  p_decision_reason TEXT DEFAULT NULL,
  p_deferral_target_intake TEXT DEFAULT NULL,
  p_portal_application_number TEXT DEFAULT NULL,
  p_portal_url TEXT DEFAULT NULL,
  p_portal_account_email TEXT DEFAULT NULL,
  p_next_action TEXT DEFAULT NULL,
  p_next_action_due_date DATE DEFAULT NULL,
  p_responsible_party TEXT DEFAULT NULL,
  p_is_correction BOOLEAN DEFAULT false,
  p_correction_reason TEXT DEFAULT NULL,
  p_is_internal_only BOOLEAN DEFAULT false
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_actor_id UUID;
  v_app RECORD;
  v_new_internal_status TEXT;
  v_new_external_status TEXT;
  v_new_submitted_at TIMESTAMPTZ;
  v_new_evidence TEXT;
  v_event_type TEXT;
  v_history_reason TEXT;
BEGIN
  v_actor_id := (SELECT auth.uid());

  -- Lock row for concurrency check
  SELECT * INTO v_app
  FROM public.applications
  WHERE id = p_application_id
  FOR UPDATE;

  IF v_app IS NULL THEN
    RAISE EXCEPTION 'Application % not found', p_application_id;
  END IF;

  IF NOT (private.is_admin(v_actor_id) OR private.is_assigned_counsellor(v_app.case_id, v_actor_id)) THEN
    RAISE EXCEPTION 'Permission denied: caller must be assigned counsellor or administrator';
  END IF;

  -- Optimistic Concurrency Check
  IF v_app.lock_version <> p_expected_lock_version THEN
    RAISE EXCEPTION 'OPTIMISTIC_LOCK_CONFLICT: Record was modified by another staff member (current version: %, expected: %). Please refresh.', v_app.lock_version, p_expected_lock_version;
  END IF;

  -- Corrections require mandatory non-empty reason
  IF p_is_correction THEN
    IF p_correction_reason IS NULL OR length(trim(p_correction_reason)) < 5 THEN
      RAISE EXCEPTION 'Authorised corrections require a specific explanation of at least 5 characters';
    END IF;
    v_event_type := 'correction';
    v_history_reason := trim(p_correction_reason);
  ELSE
    v_event_type := 'status_transition';
    v_history_reason := COALESCE(p_decision_reason, p_dossier_review_notes, 'Status transition updated by counsellor');
  END IF;

  v_new_external_status := COALESCE(p_external_status, v_app.external_status);
  v_new_submitted_at := COALESCE(p_submitted_at, v_app.submitted_at);
  v_new_evidence := COALESCE(p_external_evidence_reference, v_app.external_evidence_reference, p_portal_application_number);

  -- External submission validation:
  -- Transitioning external status to 'submitted' or 'awaiting_decision' REQUIRES evidence/reference and submitted date
  IF v_new_external_status IN ('submitted', 'awaiting_decision') THEN
    IF v_new_submitted_at IS NULL THEN
      v_new_submitted_at := NOW();
    END IF;
    IF v_new_evidence IS NULL OR length(trim(v_new_evidence)) = 0 THEN
      RAISE EXCEPTION 'External submission requires official application reference or submission receipt evidence';
    END IF;
  END IF;

  -- Decision outcome validation
  IF p_decision_outcome_type IS NOT NULL THEN
    IF p_decision_outcome_type = 'conditional_offer' AND (p_offer_conditions IS NULL OR length(trim(p_offer_conditions)) < 3) THEN
      RAISE EXCEPTION 'Conditional offers must specify the exact academic or language conditions required by university';
    END IF;
    IF p_decision_outcome_type IN ('rejected', 'visa_refused') AND (p_decision_reason IS NULL OR length(trim(p_decision_reason)) < 3) THEN
      RAISE EXCEPTION 'Outcome % requires recorded official reason or consular refusal code', p_decision_outcome_type;
    END IF;
    IF p_decision_outcome_type = 'deferred' AND (p_deferral_target_intake IS NULL OR length(trim(p_deferral_target_intake)) < 3) THEN
      RAISE EXCEPTION 'Deferred applications must specify the future target intake semester';
    END IF;
  END IF;

  -- Derive application general status from external and dossier statuses
  v_new_internal_status := CASE
    WHEN v_new_external_status IN ('visa_approved', 'visa_refused', 'visa_administrative_processing') THEN v_new_external_status
    WHEN v_new_external_status = 'accepted_offer' THEN 'accepted_offer'
    WHEN v_new_external_status = 'unconditional_offer' THEN 'unconditional_offer'
    WHEN v_new_external_status = 'conditional_offer' THEN 'conditional_offer'
    WHEN v_new_external_status = 'rejected' THEN 'rejected'
    WHEN v_new_external_status = 'deferred' THEN 'deferred'
    WHEN v_new_external_status = 'withdrawn' THEN 'withdrawn'
    WHEN v_new_external_status IN ('submitted', 'awaiting_decision') THEN 'submitted_by_staff'
    WHEN COALESCE(p_dossier_review_status, v_app.dossier_review_status) = 'dossier_approved' THEN 'ready_to_submit'
    ELSE 'drafting'
  END;

  -- Perform optimistic update and increment lock_version
  UPDATE public.applications
  SET
    status = v_new_internal_status,
    dossier_review_status = COALESCE(p_dossier_review_status, dossier_review_status),
    dossier_review_notes = COALESCE(p_dossier_review_notes, dossier_review_notes),
    external_status = v_new_external_status,
    external_status_reported_by = v_actor_id,
    external_status_reported_at = NOW(),
    external_evidence_reference = v_new_evidence,
    submitted_at = v_new_submitted_at,
    portal_application_number = COALESCE(p_portal_application_number, portal_application_number),
    portal_url = COALESCE(p_portal_url, portal_url),
    portal_account_email = COALESCE(p_portal_account_email, portal_account_email),
    offer_conditions = COALESCE(p_offer_conditions, offer_conditions),
    decision_outcome_type = COALESCE(p_decision_outcome_type, decision_outcome_type),
    decision_reason = COALESCE(p_decision_reason, decision_reason),
    deferral_target_intake = COALESCE(p_deferral_target_intake, deferral_target_intake),
    next_action = COALESCE(p_next_action, next_action),
    next_action_due_date = COALESCE(p_next_action_due_date, next_action_due_date),
    responsible_party = COALESCE(p_responsible_party, responsible_party),
    last_staff_update_by = v_actor_id,
    last_staff_update_at = NOW(),
    lock_version = v_app.lock_version + 1,
    updated_at = NOW()
  WHERE id = p_application_id;

  -- Insert chronological history
  INSERT INTO public.application_history (
    application_id,
    actor_id,
    event_type,
    from_status,
    to_status,
    reason,
    evidence_reference,
    reported_at,
    is_internal_only,
    payload
  ) VALUES (
    p_application_id,
    v_actor_id,
    v_event_type,
    v_app.external_status,
    v_new_external_status,
    v_history_reason,
    v_new_evidence,
    NOW(),
    p_is_internal_only,
    jsonb_build_object(
      'dossier_status', COALESCE(p_dossier_review_status, v_app.dossier_review_status),
      'internal_status', v_new_internal_status,
      'is_correction', p_is_correction,
      'portal_application_number', COALESCE(p_portal_application_number, v_app.portal_application_number)
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'application_id', p_application_id,
    'new_lock_version', v_app.lock_version + 1,
    'status', v_new_internal_status,
    'external_status', v_new_external_status,
    'reported_at', NOW()
  );
END;
$$;

-- 8. RPC: Audited Case Reassignment
CREATE OR REPLACE FUNCTION public.admin_reassign_case(
  p_case_id UUID,
  p_new_counsellor_id UUID,
  p_reassignment_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_actor_id UUID;
  v_case RECORD;
  v_new_counsellor RECORD;
  v_prev_counsellor_id UUID;
BEGIN
  v_actor_id := (SELECT auth.uid());
  IF NOT private.is_admin(v_actor_id) THEN
    RAISE EXCEPTION 'Permission denied: only platform administrators can reassign student cases';
  END IF;

  IF p_reassignment_reason IS NULL OR length(trim(p_reassignment_reason)) < 5 THEN
    RAISE EXCEPTION 'Case reassignment requires an audit justification of at least 5 characters';
  END IF;

  SELECT * INTO v_case FROM public.student_cases WHERE id = p_case_id;
  IF v_case IS NULL THEN
    RAISE EXCEPTION 'Student case % not found', p_case_id;
  END IF;

  -- Verify target counsellor exists and is staff
  SELECT * INTO v_new_counsellor FROM public.profiles WHERE id = p_new_counsellor_id;
  IF v_new_counsellor IS NULL OR NOT private.is_staff(p_new_counsellor_id) THEN
    RAISE EXCEPTION 'Designated user is not active staff';
  END IF;

  -- Identify currently active counsellor if any
  SELECT counsellor_id INTO v_prev_counsellor_id
  FROM public.case_assignments
  WHERE case_id = p_case_id AND is_active = true
  LIMIT 1;

  -- Deactivate previous assignment(s) immediately
  UPDATE public.case_assignments
  SET
    is_active = false,
    unassigned_at = NOW(),
    unassigned_by = v_actor_id,
    reassignment_reason = trim(p_reassignment_reason)
  WHERE case_id = p_case_id AND is_active = true;

  -- Insert or activate new assignment
  INSERT INTO public.case_assignments (
    case_id,
    counsellor_id,
    assigned_by,
    assigned_at,
    is_active,
    reassignment_reason
  ) VALUES (
    p_case_id,
    p_new_counsellor_id,
    v_actor_id,
    NOW(),
    true,
    trim(p_reassignment_reason)
  )
  ON CONFLICT (case_id, counsellor_id)
  DO UPDATE SET
    is_active = true,
    assigned_by = v_actor_id,
    assigned_at = NOW(),
    unassigned_at = NULL,
    unassigned_by = NULL,
    reassignment_reason = trim(p_reassignment_reason);

  -- Log immutable platform audit event
  INSERT INTO public.audit_events (
    actor_id,
    action,
    target_type,
    target_id,
    payload
  ) VALUES (
    v_actor_id,
    'admin_reassign_case',
    'student_cases',
    p_case_id::text,
    jsonb_build_object(
      'previous_counsellor_id', v_prev_counsellor_id,
      'new_counsellor_id', p_new_counsellor_id,
      'new_counsellor_name', v_new_counsellor.full_name,
      'reason', trim(p_reassignment_reason)
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'case_id', p_case_id,
    'previous_counsellor_id', v_prev_counsellor_id,
    'new_counsellor_id', p_new_counsellor_id,
    'message', 'Case reassignment successfully executed. Previous counsellor access has been revoked.'
  );
END;
$$;

-- 9. Anti-tamper Trigger: Student upload or self-completed task must NOT mark application submitted or visa approved
CREATE OR REPLACE FUNCTION private.prevent_student_application_auto_progression()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- If actor is student, they cannot modify official external submission fields
  IF NOT private.is_staff((SELECT auth.uid())) THEN
    IF NEW.external_status <> OLD.external_status AND NEW.external_status IN ('submitted', 'awaiting_decision', 'conditional_offer', 'unconditional_offer', 'accepted_offer', 'visa_approved') THEN
      RAISE EXCEPTION 'Students cannot mutate official external submission or visa outcome statuses';
    END IF;
    IF NEW.status <> OLD.status AND NEW.status IN ('submitted_by_staff', 'conditional_offer', 'unconditional_offer', 'accepted_offer', 'visa_approved') THEN
      RAISE EXCEPTION 'Students cannot mark applications submitted or visa approved';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_student_auto_progression ON public.applications;
CREATE TRIGGER trg_prevent_student_auto_progression
  BEFORE UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION private.prevent_student_application_auto_progression();

-- Grants on new RPCs
GRANT EXECUTE ON FUNCTION public.student_complete_onboarding(JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.staff_create_application(UUID, UUID, UUID, DATE, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.staff_update_application(UUID, INT, TEXT, TEXT, TEXT, TEXT, TIMESTAMPTZ, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, DATE, TEXT, BOOLEAN, TEXT, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_reassign_case(UUID, UUID, TEXT) TO authenticated;
