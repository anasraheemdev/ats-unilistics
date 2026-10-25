-- ============================================================================
-- Migration 006: Projections, Privileged RPCs & Explicit Permissions
-- Product: Unilistics (ATS for European Higher Education)
-- Guidelines: Follows supabase and supabase-postgres-best-practices
-- Security: security_invoker = true on views, search_path = '' on RPCs
-- ============================================================================

-- 1. Public-Safe Projections (WITH security_invoker = true)
CREATE OR REPLACE VIEW public.published_catalogue_universities
WITH (security_invoker = true)
AS
SELECT
  u.id,
  u.country_code,
  c.name AS country_name,
  u.name,
  u.native_name,
  u.city,
  u.institution_type,
  u.ranking_indicative,
  u.provenance
FROM public.universities u
JOIN public.countries c ON c.code = u.country_code
WHERE u.publication_status = 'published';

CREATE OR REPLACE VIEW public.published_catalogue_programs
WITH (security_invoker = true)
AS
SELECT
  p.id,
  p.university_id,
  u.name AS university_name,
  u.country_code,
  p.name AS program_name,
  p.degree_level,
  p.teaching_language,
  p.tuition_type,
  p.annual_tuition_eur,
  p.application_portal
FROM public.programs p
JOIN public.universities u ON u.id = p.university_id
WHERE p.publication_status = 'published'
  AND u.publication_status = 'published';

CREATE OR REPLACE VIEW public.published_catalogue_scholarships
WITH (security_invoker = true)
AS
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
  s.provenance
FROM public.scholarships s
JOIN public.countries c ON c.code = s.country_code
WHERE s.publication_status = 'published';

CREATE OR REPLACE VIEW public.student_case_overview
WITH (security_invoker = true)
AS
SELECT
  sc.id AS case_id,
  sc.student_id,
  p.full_name AS student_name,
  p.email AS student_email,
  sc.target_country,
  sc.target_degree,
  sc.target_intake_season,
  sc.target_intake_year,
  sc.current_stage,
  sc.stage_status,
  sc.next_required_action,
  sc.next_action_due_date,
  sc.responsible_party,
  sc.updated_at AS last_update_date,
  ca.counsellor_id AS assigned_counsellor_id,
  cp.full_name AS assigned_counsellor_name,
  cp.email AS assigned_counsellor_email
FROM public.student_cases sc
JOIN public.profiles p ON p.id = sc.student_id
LEFT JOIN public.case_assignments ca ON ca.case_id = sc.id AND ca.is_active = true
LEFT JOIN public.profiles cp ON cp.id = ca.counsellor_id;

-- 2. Privileged RPC: Request Platform Access
CREATE OR REPLACE FUNCTION public.request_platform_access(
  p_full_name TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_city TEXT,
  p_target_country TEXT,
  p_target_degree TEXT,
  p_requested_entitlement TEXT,
  p_academic_background TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_request_id UUID;
BEGIN
  -- Basic format validations
  IF p_email IS NULL OR p_email NOT LIKE '%_@__%.__%' THEN
    RAISE EXCEPTION 'Invalid email address provided';
  END IF;

  IF p_full_name IS NULL OR LENGTH(TRIM(p_full_name)) < 2 THEN
    RAISE EXCEPTION 'Full legal name is required';
  END IF;

  INSERT INTO public.access_requests (
    full_name,
    email,
    phone,
    city,
    target_country,
    target_degree,
    requested_entitlement,
    academic_background,
    status
  ) VALUES (
    TRIM(p_full_name),
    LOWER(TRIM(p_email)),
    TRIM(p_phone),
    TRIM(p_city),
    LOWER(TRIM(p_target_country)),
    LOWER(TRIM(p_target_degree)),
    p_requested_entitlement,
    p_academic_background,
    'pending'
  )
  RETURNING id INTO v_request_id;

  RETURN v_request_id;
END;
$$;

-- 3. Privileged RPC: Approve Access Request (Idempotent)
CREATE OR REPLACE FUNCTION public.approve_access_request(
  p_request_id UUID,
  p_grant_managed BOOLEAN DEFAULT false
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_actor_id UUID;
  v_req RECORD;
  v_user_id UUID;
  v_case_id UUID;
  v_country_code TEXT;
BEGIN
  v_actor_id := (SELECT auth.uid());

  -- Ensure only Admin or Super Admin can approve
  IF NOT private.is_admin(v_actor_id) THEN
    RAISE EXCEPTION 'Permission denied: only platform administrators can approve access requests';
  END IF;

  -- Lock request row for update
  SELECT * INTO v_req
  FROM public.access_requests
  WHERE id = p_request_id
  FOR UPDATE;

  IF v_req IS NULL THEN
    RAISE EXCEPTION 'Access request % not found', p_request_id;
  END IF;

  IF v_req.status = 'approved' THEN
    RETURN jsonb_build_object('success', true, 'message', 'Request was already approved (idempotent)', 'request_id', p_request_id);
  END IF;

  -- Check if user already exists by email, or create user profile
  SELECT id INTO v_user_id FROM public.profiles WHERE email = v_req.email;

  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (id, email) VALUES (v_user_id, v_req.email)
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.profiles (
      id,
      email,
      full_name,
      phone,
      city,
      account_status
    ) VALUES (
      v_user_id,
      v_req.email,
      v_req.full_name,
      v_req.phone,
      v_req.city,
      'active'
    );
  ELSE
    UPDATE public.profiles
    SET account_status = 'active', updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  -- Grant Explorer Catalogue entitlement
  INSERT INTO public.entitlements (
    user_id,
    entitlement_type,
    status,
    granted_by
  ) VALUES (
    v_user_id,
    'explorer_catalogue',
    'active',
    v_actor_id
  )
  ON CONFLICT (user_id, entitlement_type)
  DO UPDATE SET status = 'active', granted_by = v_actor_id, granted_at = NOW();

  -- Grant Managed Student entitlement & create Student Case if requested
  IF p_grant_managed OR v_req.requested_entitlement = 'managed_application_case' THEN
    INSERT INTO public.entitlements (
      user_id,
      entitlement_type,
      status,
      granted_by
    ) VALUES (
      v_user_id,
      'managed_application_case',
      'active',
      v_actor_id
    )
    ON CONFLICT (user_id, entitlement_type)
    DO UPDATE SET status = 'active', granted_by = v_actor_id, granted_at = NOW();

    -- Normalize country code
    v_country_code := CASE LOWER(v_req.target_country)
      WHEN 'germany' THEN 'de'
      WHEN 'france' THEN 'fr'
      WHEN 'italy' THEN 'it'
      WHEN 'romania' THEN 'ro'
      ELSE LOWER(v_req.target_country)
    END;

    -- Create case if not exists
    SELECT id INTO v_case_id FROM public.student_cases WHERE student_id = v_user_id;
    IF v_case_id IS NULL THEN
      INSERT INTO public.student_cases (
        student_id,
        target_country,
        target_degree,
        target_intake_season,
        target_intake_year,
        current_stage,
        stage_status,
        next_required_action,
        next_action_due_date,
        responsible_party
      ) VALUES (
        v_user_id,
        v_country_code,
        v_req.target_degree,
        'winter',
        2027,
        'onboarding',
        'in_progress',
        'Upload verified bachelor transcript and HEC attestation receipt',
        CURRENT_DATE + INTERVAL '14 days',
        'student'
      ) RETURNING id INTO v_case_id;
    END IF;
  END IF;

  -- Mark request approved
  UPDATE public.access_requests
  SET
    status = 'approved',
    reviewed_by = v_actor_id,
    reviewed_at = NOW()
  WHERE id = p_request_id;

  -- Write audit event
  INSERT INTO public.audit_events (
    actor_id,
    action,
    target_type,
    target_id,
    payload
  ) VALUES (
    v_actor_id,
    'approve_access_request',
    'access_requests',
    p_request_id::text,
    jsonb_build_object(
      'user_id', v_user_id,
      'email', v_req.email,
      'granted_managed', (p_grant_managed OR v_req.requested_entitlement = 'managed_application_case'),
      'case_id', v_case_id
    )
  );

  -- Enqueue activation outbox email
  INSERT INTO public.outbox (
    event_type,
    payload
  ) VALUES (
    'access_request_approved',
    jsonb_build_object(
      'user_id', v_user_id,
      'email', v_req.email,
      'full_name', v_req.full_name
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'user_id', v_user_id,
    'case_id', v_case_id,
    'request_id', p_request_id
  );
END;
$$;

-- 4. Privileged RPC: Assign Case Counsellor
CREATE OR REPLACE FUNCTION public.assign_case_counsellor(
  p_case_id UUID,
  p_counsellor_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_actor_id UUID;
  v_is_counsellor BOOLEAN;
BEGIN
  v_actor_id := (SELECT auth.uid());

  IF NOT private.is_admin(v_actor_id) THEN
    RAISE EXCEPTION 'Permission denied: only platform administrators can assign case counsellors';
  END IF;

  -- Verify target counsellor role
  SELECT EXISTS (
    SELECT 1 FROM public.staff_roles sr
    JOIN public.profiles p ON p.id = sr.user_id
    WHERE sr.user_id = p_counsellor_id
      AND p.account_status = 'active'
      AND sr.role IN ('counsellor', 'admin', 'super_admin')
  ) INTO v_is_counsellor;

  IF NOT v_is_counsellor THEN
    RAISE EXCEPTION 'Target user (%) is not an active staff member', p_counsellor_id;
  END IF;

  -- Deactivate previous assignments
  UPDATE public.case_assignments
  SET is_active = false
  WHERE case_id = p_case_id AND is_active = true;

  -- Insert or activate new assignment
  INSERT INTO public.case_assignments (
    case_id,
    counsellor_id,
    assigned_by,
    is_active
  ) VALUES (
    p_case_id,
    p_counsellor_id,
    v_actor_id,
    true
  )
  ON CONFLICT (case_id, counsellor_id)
  DO UPDATE SET is_active = true, assigned_by = v_actor_id, assigned_at = NOW();

  -- Audit log
  INSERT INTO public.audit_events (
    actor_id,
    action,
    target_type,
    target_id,
    payload
  ) VALUES (
    v_actor_id,
    'assign_case_counsellor',
    'student_cases',
    p_case_id::text,
    jsonb_build_object('counsellor_id', p_counsellor_id)
  );

  RETURN jsonb_build_object('success', true, 'case_id', p_case_id, 'counsellor_id', p_counsellor_id);
END;
$$;

-- 5. Privileged RPC: Submit Document Review
CREATE OR REPLACE FUNCTION public.submit_document_review(
  p_document_id UUID,
  p_decision TEXT,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_actor_id UUID;
  v_case_id UUID;
BEGIN
  v_actor_id := (SELECT auth.uid());

  IF p_decision NOT IN ('verified', 'rejected') THEN
    RAISE EXCEPTION 'Invalid review decision. Must be verified or rejected';
  END IF;

  SELECT case_id INTO v_case_id
  FROM public.document_metadata
  WHERE id = p_document_id;

  IF v_case_id IS NULL THEN
    RAISE EXCEPTION 'Document % not found', p_document_id;
  END IF;

  -- Check that actor is assigned counsellor or admin
  IF NOT (private.is_admin(v_actor_id) OR private.is_assigned_counsellor(v_case_id, v_actor_id)) THEN
    RAISE EXCEPTION 'Permission denied: you are not assigned to review documents for case %', v_case_id;
  END IF;

  UPDATE public.document_metadata
  SET
    verification_status = p_decision,
    verification_notes = p_notes,
    verified_by = v_actor_id,
    verified_at = NOW()
  WHERE id = p_document_id;

  -- Audit log
  INSERT INTO public.audit_events (
    actor_id,
    action,
    target_type,
    target_id,
    payload
  ) VALUES (
    v_actor_id,
    'submit_document_review',
    'document_metadata',
    p_document_id::text,
    jsonb_build_object('decision', p_decision, 'notes', p_notes, 'case_id', v_case_id)
  );

  RETURN jsonb_build_object('success', true, 'document_id', p_document_id, 'decision', p_decision);
END;
$$;

-- 6. Explicit Grants & Revocations
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Catalogue & Public Tables
GRANT SELECT ON public.countries TO anon, authenticated;
GRANT SELECT ON public.universities TO anon, authenticated;
GRANT SELECT ON public.programs TO anon, authenticated;
GRANT SELECT ON public.intakes TO anon, authenticated;
GRANT SELECT ON public.scholarships TO anon, authenticated;

-- Projections
GRANT SELECT ON public.published_catalogue_universities TO anon, authenticated;
GRANT SELECT ON public.published_catalogue_programs TO anon, authenticated;
GRANT SELECT ON public.published_catalogue_scholarships TO anon, authenticated;
GRANT SELECT ON public.student_case_overview TO authenticated;

-- Authenticated User Tables (Controlled by RLS)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookmarks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_cases TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.applications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.case_assignments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.document_metadata TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.document_versions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.document_links TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.internal_notes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.staff_roles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.entitlements TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.access_requests TO authenticated;
GRANT SELECT ON public.audit_events TO authenticated;

-- Public Access Request Submissions
GRANT INSERT, SELECT (id, status) ON public.access_requests TO anon;

-- RPC Execution Grants
GRANT EXECUTE ON FUNCTION public.request_platform_access TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.approve_access_request TO authenticated;
GRANT EXECUTE ON FUNCTION public.assign_case_counsellor TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_document_review TO authenticated;

-- Block public access to private schema
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated;
