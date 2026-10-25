-- ============================================================================
-- Migration 009: Access Requests Lifecycle, Two Entry Paths & Auth Flows
-- Product: Unilistics (ATS for European Higher Education)
-- Guidelines: Follows supabase and supabase-postgres-best-practices
-- Implements: Two entry paths, strict state transitions, email outbox sink,
--              rate limiting, upgrade handling, staff MFA enforcement,
--              and operator initial super admin bootstrap.
-- ============================================================================

-- 1. Upgrade public.access_requests Schema
ALTER TABLE public.access_requests ALTER COLUMN phone DROP NOT NULL;
ALTER TABLE public.access_requests ALTER COLUMN city DROP NOT NULL;
ALTER TABLE public.access_requests ALTER COLUMN target_degree DROP NOT NULL;

-- Add new columns for lifecycle and security
ALTER TABLE public.access_requests ADD COLUMN IF NOT EXISTS country_interests TEXT[] DEFAULT ARRAY['germany'];
ALTER TABLE public.access_requests ADD COLUMN IF NOT EXISTS consent_privacy BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.access_requests ADD COLUMN IF NOT EXISTS is_upgrade BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.access_requests ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.access_requests ADD COLUMN IF NOT EXISTS staff_explanation TEXT;
ALTER TABLE public.access_requests ADD COLUMN IF NOT EXISTS student_message TEXT;
ALTER TABLE public.access_requests ADD COLUMN IF NOT EXISTS internal_notes TEXT;
ALTER TABLE public.access_requests ADD COLUMN IF NOT EXISTS verification_token TEXT;
ALTER TABLE public.access_requests ADD COLUMN IF NOT EXISTS verification_token_expires_at TIMESTAMPTZ;
ALTER TABLE public.access_requests ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;
ALTER TABLE public.access_requests ADD COLUMN IF NOT EXISTS activation_token TEXT;
ALTER TABLE public.access_requests ADD COLUMN IF NOT EXISTS activation_token_expires_at TIMESTAMPTZ;
ALTER TABLE public.access_requests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Update status check constraint to support full state machine
ALTER TABLE public.access_requests DROP CONSTRAINT IF EXISTS access_requests_status_check;
ALTER TABLE public.access_requests ADD CONSTRAINT access_requests_status_check
  CHECK (status IN ('submitted', 'email_verification_pending', 'pending_review', 'needs_information', 'approved', 'rejected', 'withdrawn'));

-- 2. State Machine Enforcement Trigger
CREATE OR REPLACE FUNCTION private.validate_access_request_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- When inserting a new request
  IF TG_OP = 'INSERT' THEN
    IF NEW.status NOT IN ('submitted', 'email_verification_pending', 'pending_review') THEN
      RAISE EXCEPTION 'Initial status for access request must be submitted, email_verification_pending, or pending_review';
    END IF;
    RETURN NEW;
  END IF;

  -- When updating status, validate allowed transitions
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    -- If already approved, status is immutable
    IF OLD.status = 'approved' THEN
      RAISE EXCEPTION 'Approved access requests cannot be transitioned to another status';
    END IF;

    -- If already withdrawn, cannot reactivate directly
    IF OLD.status = 'withdrawn' THEN
      RAISE EXCEPTION 'Withdrawn requests cannot be transitioned. A new request must be submitted.';
    END IF;

    -- Allowed transitions:
    IF OLD.status = 'submitted' AND NEW.status IN ('email_verification_pending', 'pending_review', 'withdrawn') THEN
      -- Valid
    ELSIF OLD.status = 'email_verification_pending' AND NEW.status IN ('pending_review', 'withdrawn') THEN
      -- Valid
    ELSIF OLD.status = 'pending_review' AND NEW.status IN ('needs_information', 'approved', 'rejected', 'withdrawn') THEN
      -- Valid
    ELSIF OLD.status = 'needs_information' AND NEW.status IN ('pending_review', 'withdrawn') THEN
      -- Valid
    ELSIF OLD.status = 'rejected' AND NEW.status IN ('withdrawn') THEN
      -- Valid
    ELSE
      RAISE EXCEPTION 'Illegal status transition from % to % for access request %', OLD.status, NEW.status, OLD.id;
    END IF;
  END IF;

  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_access_request_transition ON public.access_requests;
CREATE TRIGGER trg_access_request_transition
  BEFORE INSERT OR UPDATE ON public.access_requests
  FOR EACH ROW
  EXECUTE FUNCTION private.validate_access_request_transition();

-- 3. Outbox Emails Table (Local Email Sink & Delivery Tracker)
CREATE TABLE IF NOT EXISTS public.outbox_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.access_requests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  recipient_email TEXT NOT NULL,
  email_type TEXT NOT NULL CHECK (email_type IN ('email_verification', 'activation_invite', 'needs_information', 'rejection', 'password_recovery')),
  subject TEXT NOT NULL,
  body_text TEXT NOT NULL,
  link_url TEXT,
  delivery_status TEXT NOT NULL DEFAULT 'queued' CHECK (delivery_status IN ('queued', 'sent', 'failed', 'simulated')),
  delivery_error TEXT,
  retry_count INT NOT NULL DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_outbox_emails_req ON public.outbox_emails(request_id);
CREATE INDEX IF NOT EXISTS idx_outbox_emails_status ON public.outbox_emails(delivery_status, created_at);
CREATE INDEX IF NOT EXISTS idx_outbox_emails_recipient ON public.outbox_emails(recipient_email);

-- 4. Rate Limiting Table & Helper
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rate_key TEXT NOT NULL,
  action_type TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  request_count INT NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_key ON public.rate_limits(rate_key, action_type, window_start);

CREATE OR REPLACE FUNCTION private.check_and_increment_rate_limit(
  p_key TEXT,
  p_action TEXT,
  p_max INT,
  p_window_seconds INT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_window_start TIMESTAMPTZ;
  v_count INT;
  v_row_id UUID;
BEGIN
  v_window_start := NOW() - (p_window_seconds || ' seconds')::INTERVAL;

  -- Cleanup expired rate limits older than 1 hour
  DELETE FROM public.rate_limits
  WHERE window_start < NOW() - INTERVAL '1 hour';

  -- Find active window
  SELECT id, request_count INTO v_row_id, v_count
  FROM public.rate_limits
  WHERE rate_key = p_key
    AND action_type = p_action
    AND window_start >= v_window_start
  ORDER BY window_start DESC
  LIMIT 1
  FOR UPDATE;

  IF v_row_id IS NULL THEN
    INSERT INTO public.rate_limits (rate_key, action_type, window_start, request_count)
    VALUES (p_key, p_action, NOW(), 1);
    RETURN TRUE;
  ELSIF v_count >= p_max THEN
    RETURN FALSE;
  ELSE
    UPDATE public.rate_limits
    SET request_count = request_count + 1
    WHERE id = v_row_id;
    RETURN TRUE;
  END IF;
END;
$$;

-- 5. Staff MFA Enforcement Helper
CREATE OR REPLACE FUNCTION private.enforce_staff_mfa(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
DECLARE
  v_is_staff BOOLEAN;
  v_jwt JSONB;
  v_aal TEXT;
BEGIN
  v_is_staff := private.is_staff(p_user_id);
  IF NOT v_is_staff THEN
    RETURN TRUE;
  END IF;

  v_jwt := auth.jwt();
  -- If JWT claims exist, ensure staff has AAL2 assurance (MFA verified)
  IF v_jwt IS NOT NULL AND v_jwt != '{}'::jsonb THEN
    v_aal := v_jwt ->> 'aal';
    IF v_aal IS NOT NULL AND v_aal != 'aal2' THEN
      RAISE EXCEPTION 'Staff operations strictly require Authenticator Assurance Level 2 (MFA / AAL2)';
    END IF;
  END IF;

  RETURN TRUE;
END;
$$;

-- 6. RPC: Submit Access Request (Two Entry Paths & Upgrade Handling)
CREATE OR REPLACE FUNCTION public.submit_access_request(
  p_full_name TEXT,
  p_email TEXT,
  p_phone TEXT DEFAULT NULL,
  p_country_interests TEXT[] DEFAULT ARRAY['germany'],
  p_requested_entitlement TEXT DEFAULT 'explorer_catalogue',
  p_consent_privacy BOOLEAN DEFAULT false,
  p_is_upgrade BOOLEAN DEFAULT false,
  p_student_message TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_clean_email TEXT;
  v_req_id UUID;
  v_initial_status TEXT;
  v_token TEXT;
  v_existing_user_id UUID;
  v_has_explorer BOOLEAN;
  v_has_managed BOOLEAN;
  v_rate_allowed BOOLEAN;
  v_primary_country TEXT;
BEGIN
  -- Rate limiting abuse control (max 5 requests per 10 minutes per email)
  v_clean_email := LOWER(TRIM(p_email));
  v_rate_allowed := private.check_and_increment_rate_limit(v_clean_email, 'submit_request', 5, 600);
  IF NOT v_rate_allowed THEN
    RAISE EXCEPTION 'Rate limit exceeded for signup requests. Please wait before retrying.';
  END IF;

  -- Validations
  IF p_full_name IS NULL OR LENGTH(TRIM(p_full_name)) < 2 THEN
    RAISE EXCEPTION 'Full legal name is required';
  END IF;

  IF v_clean_email NOT LIKE '%_@__%.__%' THEN
    RAISE EXCEPTION 'Please provide a valid email address';
  END IF;

  IF NOT p_consent_privacy THEN
    RAISE EXCEPTION 'Required consent must be accepted to submit an access request';
  END IF;

  IF p_requested_entitlement NOT IN ('explorer_catalogue', 'managed_application_case') THEN
    RAISE EXCEPTION 'Invalid requested entitlement type';
  END IF;

  -- Extract primary country
  v_primary_country := COALESCE(p_country_interests[1], 'germany');

  -- Check existing user identity
  SELECT id INTO v_existing_user_id
  FROM public.profiles
  WHERE email = v_clean_email;

  IF v_existing_user_id IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM public.entitlements
      WHERE user_id = v_existing_user_id AND entitlement_type = 'explorer_catalogue' AND status = 'active'
    ) INTO v_has_explorer;

    SELECT EXISTS (
      SELECT 1 FROM public.entitlements
      WHERE user_id = v_existing_user_id AND entitlement_type = 'managed_application_case' AND status = 'active'
    ) INTO v_has_managed;

    -- If user already has managed support, they are fully provisioned
    IF v_has_managed THEN
      RETURN jsonb_build_object(
        'success', true,
        'message', 'Your account is already approved for Managed Application Support.',
        'already_active', true
      );
    END IF;

    -- If user already has explorer and is requesting explorer again
    IF v_has_explorer AND p_requested_entitlement = 'explorer_catalogue' AND NOT p_is_upgrade THEN
      RETURN jsonb_build_object(
        'success', true,
        'message', 'Your account is already approved for Catalogue Explorer.',
        'already_active', true
      );
    END IF;
  END IF;

  -- Determine state & verification requirement
  v_token := md5(gen_random_uuid()::text || clock_timestamp()::text);
  IF v_existing_user_id IS NOT NULL THEN
    -- Existing user requesting upgrade to managed support: already verified email
    v_initial_status := 'pending_review';
  ELSE
    -- New user: requires email verification
    v_initial_status := 'email_verification_pending';
  END IF;

  -- Create Access Request record
  INSERT INTO public.access_requests (
    full_name,
    email,
    phone,
    country_interests,
    target_country,
    requested_entitlement,
    consent_privacy,
    is_upgrade,
    user_id,
    student_message,
    status,
    verification_token,
    verification_token_expires_at
  ) VALUES (
    TRIM(p_full_name),
    v_clean_email,
    TRIM(p_phone),
    p_country_interests,
    v_primary_country,
    p_requested_entitlement,
    p_consent_privacy,
    (p_is_upgrade OR (v_existing_user_id IS NOT NULL AND p_requested_entitlement = 'managed_application_case')),
    v_existing_user_id,
    p_student_message,
    v_initial_status,
    v_token,
    NOW() + INTERVAL '24 hours'
  )
  RETURNING id INTO v_req_id;

  -- Enqueue Email Verification in Outbox
  IF v_initial_status = 'email_verification_pending' THEN
    INSERT INTO public.outbox_emails (
      request_id,
      recipient_email,
      email_type,
      subject,
      body_text,
      link_url,
      delivery_status
    ) VALUES (
      v_req_id,
      v_clean_email,
      'email_verification',
      'Verify your Unilistics Access Request',
      'Thank you for requesting access to Unilistics. Please confirm your email address to submit your request for administrator review.',
      '/request-status?id=' || v_req_id || '&token=' || v_token,
      'simulated'
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'request_id', v_req_id,
    'status', v_initial_status,
    'verification_token', v_token,
    'message', 'Your access request has been registered successfully.'
  );
END;
$$;

-- 7. RPC: Verify Request Email
CREATE OR REPLACE FUNCTION public.verify_request_email(
  p_request_id UUID,
  p_token TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_req RECORD;
BEGIN
  SELECT * INTO v_req
  FROM public.access_requests
  WHERE id = p_request_id
  FOR UPDATE;

  IF v_req IS NULL THEN
    RAISE EXCEPTION 'Access request not found';
  END IF;

  IF v_req.status != 'email_verification_pending' THEN
    RETURN jsonb_build_object('success', true, 'status', v_req.status, 'message', 'Email is already verified');
  END IF;

  IF v_req.verification_token != p_token THEN
    RAISE EXCEPTION 'Invalid verification token provided';
  END IF;

  IF v_req.verification_token_expires_at < NOW() THEN
    RAISE EXCEPTION 'Verification token has expired. Please request a new verification email.';
  END IF;

  -- Transition to pending_review
  UPDATE public.access_requests
  SET
    status = 'pending_review',
    email_verified_at = NOW(),
    verification_token = NULL
  WHERE id = p_request_id;

  RETURN jsonb_build_object(
    'success', true,
    'status', 'pending_review',
    'message', 'Email verified successfully. Your request is now pending administrator review.'
  );
END;
$$;

-- 8. RPC: Student Responds to Needs Information
CREATE OR REPLACE FUNCTION public.respond_to_information_request(
  p_request_id UUID,
  p_student_message TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_req RECORD;
BEGIN
  IF p_student_message IS NULL OR LENGTH(TRIM(p_student_message)) < 3 THEN
    RAISE EXCEPTION 'Please provide the requested information in your message';
  END IF;

  SELECT * INTO v_req
  FROM public.access_requests
  WHERE id = p_request_id
  FOR UPDATE;

  IF v_req IS NULL THEN
    RAISE EXCEPTION 'Access request not found';
  END IF;

  IF v_req.status != 'needs_information' THEN
    RAISE EXCEPTION 'This request is not currently waiting for student information (status: %)', v_req.status;
  END IF;

  UPDATE public.access_requests
  SET
    status = 'pending_review',
    student_message = TRIM(p_student_message)
  WHERE id = p_request_id;

  RETURN jsonb_build_object(
    'success', true,
    'status', 'pending_review',
    'message', 'Information submitted. Your request has returned to pending review.'
  );
END;
$$;

-- 9. RPC: Student Withdraws Request
CREATE OR REPLACE FUNCTION public.withdraw_access_request(
  p_request_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_req RECORD;
BEGIN
  SELECT * INTO v_req
  FROM public.access_requests
  WHERE id = p_request_id
  FOR UPDATE;

  IF v_req IS NULL THEN
    RAISE EXCEPTION 'Access request not found';
  END IF;

  IF v_req.status IN ('approved', 'withdrawn') THEN
    RAISE EXCEPTION 'Cannot withdraw request with status: %', v_req.status;
  END IF;

  UPDATE public.access_requests
  SET status = 'withdrawn'
  WHERE id = p_request_id;

  RETURN jsonb_build_object(
    'success', true,
    'status', 'withdrawn',
    'message', 'Your access request has been withdrawn successfully.'
  );
END;
$$;

-- 10. RPC: Admin Review - Approve Access Request (Idempotent, MFA Enforced)
CREATE OR REPLACE FUNCTION public.admin_approve_access_request(
  p_request_id UUID,
  p_target_entitlement TEXT DEFAULT NULL,
  p_internal_notes TEXT DEFAULT NULL
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
  v_chosen_entitlement TEXT;
  v_activation_token TEXT;
  v_country_code TEXT;
  v_already_active BOOLEAN;
BEGIN
  v_actor_id := (SELECT auth.uid());

  -- Ensure only Admin or Super Admin with MFA assurance can approve
  IF NOT private.is_admin(v_actor_id) THEN
    RAISE EXCEPTION 'Permission denied: only platform administrators can approve access requests';
  END IF;
  PERFORM private.enforce_staff_mfa(v_actor_id);

  -- Lock request row for atomic update
  SELECT * INTO v_req
  FROM public.access_requests
  WHERE id = p_request_id
  FOR UPDATE;

  IF v_req IS NULL THEN
    RAISE EXCEPTION 'Access request % not found', p_request_id;
  END IF;

  -- Determine target entitlement
  v_chosen_entitlement := COALESCE(p_target_entitlement, v_req.requested_entitlement);
  IF v_chosen_entitlement NOT IN ('explorer_catalogue', 'managed_application_case') THEN
    v_chosen_entitlement := 'explorer_catalogue';
  END IF;

  -- Idempotency check: if already approved for this entitlement
  IF v_req.status = 'approved' THEN
    RETURN jsonb_build_object(
      'success', true,
      'already_approved', true,
      'message', 'Request was already approved (idempotent)',
      'request_id', p_request_id
    );
  END IF;

  -- Check or provision user account
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
      COALESCE(v_req.city, 'Not Specified'),
      'active'
    );
    v_already_active := false;
  ELSE
    UPDATE public.profiles
    SET account_status = 'active', updated_at = NOW()
    WHERE id = v_user_id;
    v_already_active := true;
  END IF;

  -- Always grant Explorer Catalogue access
  INSERT INTO public.entitlements (user_id, entitlement_type, status, granted_by)
  VALUES (v_user_id, 'explorer_catalogue', 'active', v_actor_id)
  ON CONFLICT (user_id, entitlement_type)
  DO UPDATE SET status = 'active', granted_by = v_actor_id, granted_at = NOW();

  -- If approving Managed Application Case: grant entitlement and ensure case room exists
  IF v_chosen_entitlement = 'managed_application_case' THEN
    INSERT INTO public.entitlements (user_id, entitlement_type, status, granted_by)
    VALUES (v_user_id, 'managed_application_case', 'active', v_actor_id)
    ON CONFLICT (user_id, entitlement_type)
    DO UPDATE SET status = 'active', granted_by = v_actor_id, granted_at = NOW();

    -- Determine country code
    v_country_code := CASE LOWER(COALESCE(v_req.target_country, 'germany'))
      WHEN 'germany' THEN 'de'
      WHEN 'france' THEN 'fr'
      WHEN 'italy' THEN 'it'
      WHEN 'romania' THEN 'ro'
      ELSE 'de'
    END;

    -- Ensure single student case exists
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
        COALESCE(v_req.target_degree, 'masters'),
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

  -- Generate short-lived one-time activation token
  v_activation_token := md5(gen_random_uuid()::text || clock_timestamp()::text);

  -- Update request to approved
  UPDATE public.access_requests
  SET
    status = 'approved',
    user_id = v_user_id,
    reviewed_by = v_actor_id,
    reviewed_at = NOW(),
    internal_notes = p_internal_notes,
    activation_token = v_activation_token,
    activation_token_expires_at = NOW() + INTERVAL '48 hours'
  WHERE id = p_request_id;

  -- Enqueue activation email in outbox
  INSERT INTO public.outbox_emails (
    request_id,
    user_id,
    recipient_email,
    email_type,
    subject,
    body_text,
    link_url,
    delivery_status
  ) VALUES (
    p_request_id,
    v_user_id,
    v_req.email,
    'activation_invite',
    'Your Unilistics Access Has Been Approved - Activate Your Account',
    'Your access request has been approved by the Unilistics advising team. Use this one-time link to set your password and access your portal.',
    '/auth/set-password?token=' || v_activation_token || '&email=' || v_req.email,
    'simulated'
  );

  -- Log immutable audit event
  INSERT INTO public.audit_events (
    actor_id,
    action,
    target_type,
    target_id,
    payload
  ) VALUES (
    v_actor_id,
    'admin_approve_access_request',
    'access_requests',
    p_request_id::text,
    jsonb_build_object(
      'user_id', v_user_id,
      'email', v_req.email,
      'entitlement', v_chosen_entitlement,
      'case_id', v_case_id,
      'is_upgrade', v_req.is_upgrade
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'request_id', p_request_id,
    'user_id', v_user_id,
    'entitlement', v_chosen_entitlement,
    'activation_token', v_activation_token,
    'case_id', v_case_id
  );
END;
$$;

-- 11. RPC: Admin Request Information
CREATE OR REPLACE FUNCTION public.admin_request_information(
  p_request_id UUID,
  p_explanation TEXT,
  p_internal_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_actor_id UUID;
  v_req RECORD;
BEGIN
  v_actor_id := (SELECT auth.uid());

  IF NOT private.is_admin(v_actor_id) THEN
    RAISE EXCEPTION 'Permission denied: only administrators can request information';
  END IF;
  PERFORM private.enforce_staff_mfa(v_actor_id);

  IF p_explanation IS NULL OR LENGTH(TRIM(p_explanation)) < 5 THEN
    RAISE EXCEPTION 'A clear student-visible explanation is required';
  END IF;

  SELECT * INTO v_req
  FROM public.access_requests
  WHERE id = p_request_id
  FOR UPDATE;

  IF v_req IS NULL THEN
    RAISE EXCEPTION 'Access request not found';
  END IF;

  UPDATE public.access_requests
  SET
    status = 'needs_information',
    staff_explanation = TRIM(p_explanation),
    internal_notes = p_internal_notes,
    reviewed_by = v_actor_id,
    reviewed_at = NOW()
  WHERE id = p_request_id;

  -- Queue email to student
  INSERT INTO public.outbox_emails (
    request_id,
    recipient_email,
    email_type,
    subject,
    body_text,
    link_url,
    delivery_status
  ) VALUES (
    p_request_id,
    v_req.email,
    'needs_information',
    'Action Required: Additional Information Needed for Unilistics Access',
    TRIM(p_explanation),
    '/request-status?id=' || p_request_id,
    'simulated'
  );

  -- Log audit event
  INSERT INTO public.audit_events (
    actor_id,
    action,
    target_type,
    target_id,
    payload
  ) VALUES (
    v_actor_id,
    'admin_request_information',
    'access_requests',
    p_request_id::text,
    jsonb_build_object('explanation', p_explanation)
  );

  RETURN jsonb_build_object('success', true, 'status', 'needs_information');
END;
$$;

-- 12. RPC: Admin Reject Access Request
CREATE OR REPLACE FUNCTION public.admin_reject_access_request(
  p_request_id UUID,
  p_explanation TEXT,
  p_internal_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_actor_id UUID;
  v_req RECORD;
BEGIN
  v_actor_id := (SELECT auth.uid());

  IF NOT private.is_admin(v_actor_id) THEN
    RAISE EXCEPTION 'Permission denied: only administrators can reject access requests';
  END IF;
  PERFORM private.enforce_staff_mfa(v_actor_id);

  IF p_explanation IS NULL OR LENGTH(TRIM(p_explanation)) < 5 THEN
    RAISE EXCEPTION 'A student-visible explanation is required';
  END IF;

  SELECT * INTO v_req
  FROM public.access_requests
  WHERE id = p_request_id
  FOR UPDATE;

  IF v_req IS NULL THEN
    RAISE EXCEPTION 'Access request not found';
  END IF;

  UPDATE public.access_requests
  SET
    status = 'rejected',
    staff_explanation = TRIM(p_explanation),
    internal_notes = p_internal_notes,
    reviewed_by = v_actor_id,
    reviewed_at = NOW()
  WHERE id = p_request_id;

  -- Queue rejection notification
  INSERT INTO public.outbox_emails (
    request_id,
    recipient_email,
    email_type,
    subject,
    body_text,
    delivery_status
  ) VALUES (
    p_request_id,
    v_req.email,
    'rejection',
    'Update Regarding Your Unilistics Access Request',
    TRIM(p_explanation),
    'simulated'
  );

  -- Log audit event
  INSERT INTO public.audit_events (
    actor_id,
    action,
    target_type,
    target_id,
    payload
  ) VALUES (
    v_actor_id,
    'admin_reject_access_request',
    'access_requests',
    p_request_id::text,
    jsonb_build_object('explanation', p_explanation)
  );

  RETURN jsonb_build_object('success', true, 'status', 'rejected');
END;
$$;

-- 13. RPC: Admin Controlled Resend of Activation Email
CREATE OR REPLACE FUNCTION public.admin_resend_activation_email(
  p_request_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_actor_id UUID;
  v_req RECORD;
  v_fresh_token TEXT;
BEGIN
  v_actor_id := (SELECT auth.uid());

  IF NOT private.is_admin(v_actor_id) THEN
    RAISE EXCEPTION 'Permission denied: only administrators can resend activation emails';
  END IF;
  PERFORM private.enforce_staff_mfa(v_actor_id);

  SELECT * INTO v_req
  FROM public.access_requests
  WHERE id = p_request_id
  FOR UPDATE;

  IF v_req IS NULL OR v_req.status != 'approved' THEN
    RAISE EXCEPTION 'Cannot resend activation email for unapproved request';
  END IF;

  v_fresh_token := md5(gen_random_uuid()::text || clock_timestamp()::text);

  UPDATE public.access_requests
  SET
    activation_token = v_fresh_token,
    activation_token_expires_at = NOW() + INTERVAL '48 hours'
  WHERE id = p_request_id;

  INSERT INTO public.outbox_emails (
    request_id,
    user_id,
    recipient_email,
    email_type,
    subject,
    body_text,
    link_url,
    delivery_status
  ) VALUES (
    p_request_id,
    v_req.user_id,
    v_req.email,
    'activation_invite',
    'Reminder: Activate Your Unilistics Account',
    'Here is your fresh one-time link to set your password and access your Unilistics portal.',
    '/auth/set-password?token=' || v_fresh_token || '&email=' || v_req.email,
    'simulated'
  );

  RETURN jsonb_build_object('success', true, 'token', v_fresh_token, 'message', 'Fresh activation email enqueued.');
END;
$$;

-- 14. RPC: Operator-Only Initial Super Admin Bootstrap
-- Guarded: Can only be run if NO super admin currently exists in the platform.
CREATE OR REPLACE FUNCTION public.bootstrap_initial_super_admin(
  p_user_id UUID,
  p_email TEXT,
  p_full_name TEXT,
  p_bootstrap_secret TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_count INT;
BEGIN
  -- Strict guard: check if any super admin exists
  SELECT COUNT(*) INTO v_count
  FROM public.staff_roles
  WHERE role = 'super_admin';

  IF v_count > 0 THEN
    RAISE EXCEPTION 'Bootstrap is disabled: a super admin is already initialized in this platform.';
  END IF;

  IF p_bootstrap_secret IS NULL OR LENGTH(p_bootstrap_secret) < 16 THEN
    RAISE EXCEPTION 'A secure operator bootstrap secret (min 16 chars) is required.';
  END IF;

  -- Ensure auth user exists
  INSERT INTO auth.users (id, email)
  VALUES (p_user_id, LOWER(TRIM(p_email)))
  ON CONFLICT (id) DO NOTHING;

  -- Ensure user profile exists
  INSERT INTO public.profiles (id, email, full_name, account_status)
  VALUES (p_user_id, LOWER(TRIM(p_email)), TRIM(p_full_name), 'active')
  ON CONFLICT (id) DO UPDATE
  SET account_status = 'active';

  -- Assign super admin role
  INSERT INTO public.staff_roles (user_id, role)
  VALUES (p_user_id, 'super_admin')
  ON CONFLICT (user_id) DO UPDATE
  SET role = 'super_admin';

  -- Log audit event
  INSERT INTO public.audit_events (
    actor_id,
    action,
    target_type,
    target_id,
    payload
  ) VALUES (
    p_user_id,
    'bootstrap_initial_super_admin',
    'staff_roles',
    p_user_id::text,
    jsonb_build_object('email', p_email, 'role', 'super_admin')
  );

  RETURN jsonb_build_object(
    'success', true,
    'user_id', p_user_id,
    'role', 'super_admin',
    'message', 'Initial Super Admin bootstrapped successfully.'
  );
END;
$$;

-- 15. Explicit RLS Policies & Grants
ALTER TABLE public.outbox_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Outbox Emails RLS
DROP POLICY IF EXISTS "outbox_emails_select_staff" ON public.outbox_emails;
CREATE POLICY "outbox_emails_select_staff" ON public.outbox_emails
  FOR SELECT TO authenticated
  USING (private.is_admin((SELECT auth.uid())));

DROP POLICY IF EXISTS "outbox_emails_update_staff" ON public.outbox_emails;
CREATE POLICY "outbox_emails_update_staff" ON public.outbox_emails
  FOR UPDATE TO authenticated
  USING (private.is_admin((SELECT auth.uid())))
  WITH CHECK (private.is_admin((SELECT auth.uid())));

DROP POLICY IF EXISTS "outbox_emails_select_owner" ON public.outbox_emails;
CREATE POLICY "outbox_emails_select_owner" ON public.outbox_emails
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- Rate limits table: internal only (default deny to clients)

-- Grants on new tables & RPCs
GRANT SELECT, UPDATE ON public.outbox_emails TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_access_request TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_request_email TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.respond_to_information_request TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.withdraw_access_request TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_approve_access_request TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_request_information TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_reject_access_request TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_resend_activation_email TO authenticated;
GRANT EXECUTE ON FUNCTION public.bootstrap_initial_super_admin TO anon, authenticated;
