-- ============================================================================
-- Migration 015: Operational Admin Workspace, Durable Outbox & Communications
-- Product: Unilistics (ATS for European Higher Education)
-- Guidelines: Follows supabase and supabase-postgres-best-practices
-- Strict counsellor assignment scoping & Explorer thread isolation
-- ============================================================================

-- 1. Evolve Public Messages: Document Attachment & Anti-Forgery
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS attachment_document_id UUID REFERENCES public.document_metadata(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_messages_attachment_doc ON public.messages(attachment_document_id);

-- Anti-forgery trigger: ensure attachment belongs to the exact same case
CREATE OR REPLACE FUNCTION private.validate_message_attachment_case()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_doc_case_id UUID;
  v_quarantine_status TEXT;
BEGIN
  IF NEW.attachment_document_id IS NOT NULL THEN
    SELECT case_id, quarantine_status INTO v_doc_case_id, v_quarantine_status
    FROM public.document_metadata
    WHERE id = NEW.attachment_document_id;

    IF v_doc_case_id IS NULL THEN
      RAISE EXCEPTION 'Referenced attachment document does not exist';
    END IF;

    IF v_doc_case_id <> NEW.case_id THEN
      RAISE EXCEPTION 'Cross-case message attachment injection is forbidden. Document case (%) does not match message case (%)',
        v_doc_case_id, NEW.case_id;
    END IF;

    -- Block attaching files that failed malware scan or are infected
    IF v_quarantine_status IN ('infected', 'scan_failed') THEN
      RAISE EXCEPTION 'Cannot attach document with quarantine status: %', v_quarantine_status;
    END IF;
  END IF;

  -- Content sanitization: ensure trimmed text and length > 0
  NEW.content := trim(NEW.content);
  IF length(NEW.content) = 0 THEN
    RAISE EXCEPTION 'Message content cannot be empty';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_message_attachment ON public.messages;
CREATE TRIGGER trg_validate_message_attachment
  BEFORE INSERT OR UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION private.validate_message_attachment_case();


-- 2. General Support Requests & Messages (Explorers / All Users Isolated from Case Rooms)
CREATE TABLE IF NOT EXISTS public.support_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL CHECK (length(trim(subject)) >= 3),
  category TEXT NOT NULL CHECK (category IN (
    'general', 'technical', 'catalogue', 'onboarding', 'visa_guidance', 'billing_inquiry'
  )),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN (
    'open', 'in_progress', 'waiting_on_user', 'resolved', 'closed'
  )),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN (
    'low', 'normal', 'high', 'urgent'
  )),
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_requests_user ON public.support_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_support_requests_status ON public.support_requests(status);
CREATE INDEX IF NOT EXISTS idx_support_requests_created ON public.support_requests(created_at);

CREATE TABLE IF NOT EXISTS public.support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.support_requests(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  message_body TEXT NOT NULL CHECK (length(trim(message_body)) > 0),
  is_staff_reply BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_messages_request ON public.support_messages(request_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_created ON public.support_messages(created_at);

-- Support tables RLS
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- Users see their own tickets; staff see all tickets
CREATE POLICY "support_requests_select_owner" ON public.support_requests
  FOR SELECT TO authenticated
  USING (
    (user_id = (SELECT auth.uid()) AND private.is_active_account((SELECT auth.uid())))
    OR private.is_admin((SELECT auth.uid()))
    OR EXISTS (SELECT 1 FROM public.staff_roles sr WHERE sr.user_id = (SELECT auth.uid()))
  );

CREATE POLICY "support_requests_insert_user" ON public.support_requests
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND private.is_active_account((SELECT auth.uid()))
  );

CREATE POLICY "support_requests_update_staff" ON public.support_requests
  FOR UPDATE TO authenticated
  USING (
    private.is_admin((SELECT auth.uid()))
    OR EXISTS (SELECT 1 FROM public.staff_roles sr WHERE sr.user_id = (SELECT auth.uid()))
    OR (user_id = (SELECT auth.uid()) AND status IN ('closed'))
  )
  WITH CHECK (
    private.is_admin((SELECT auth.uid()))
    OR EXISTS (SELECT 1 FROM public.staff_roles sr WHERE sr.user_id = (SELECT auth.uid()))
    OR (user_id = (SELECT auth.uid()) AND status IN ('closed'))
  );

-- Support messages policies
CREATE POLICY "support_messages_select" ON public.support_messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.support_requests sr
      WHERE sr.id = request_id
        AND (
          (sr.user_id = (SELECT auth.uid()) AND private.is_active_account((SELECT auth.uid())))
          OR private.is_admin((SELECT auth.uid()))
          OR EXISTS (SELECT 1 FROM public.staff_roles WHERE user_id = (SELECT auth.uid()))
        )
    )
  );

CREATE POLICY "support_messages_insert" ON public.support_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.support_requests sr
      WHERE sr.id = request_id
        AND (
          (sr.user_id = (SELECT auth.uid()) AND private.is_active_account((SELECT auth.uid())))
          OR private.is_admin((SELECT auth.uid()))
          OR EXISTS (SELECT 1 FROM public.staff_roles WHERE user_id = (SELECT auth.uid()))
        )
    )
  );


-- 3. Notification Preferences Table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  in_app_notifications BOOLEAN NOT NULL DEFAULT true,
  task_reminders BOOLEAN NOT NULL DEFAULT true,
  case_updates BOOLEAN NOT NULL DEFAULT true,
  user_timezone TEXT NOT NULL DEFAULT 'Asia/Karachi',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notif_pref_select" ON public.notification_preferences
  FOR SELECT TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR private.is_admin((SELECT auth.uid()))
    OR EXISTS (SELECT 1 FROM public.staff_roles WHERE user_id = (SELECT auth.uid()))
  );

CREATE POLICY "notif_pref_upsert_owner" ON public.notification_preferences
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()) AND private.is_active_account((SELECT auth.uid())))
  WITH CHECK (user_id = (SELECT auth.uid()) AND private.is_active_account((SELECT auth.uid())));


-- 4. Evolve Public Notifications Table
ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS event_type TEXT,
  ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_notifications_event_type ON public.notifications(event_type);


-- 5. Evolve Outbox Table into Durable Transactional Outbox
-- Drop existing status check constraint if exists
DO $$
BEGIN
  ALTER TABLE public.outbox DROP CONSTRAINT IF EXISTS outbox_status_check;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

ALTER TABLE public.outbox
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT,
  ADD COLUMN IF NOT EXISTS recipient_email TEXT,
  ADD COLUMN IF NOT EXISTS subject TEXT,
  ADD COLUMN IF NOT EXISTS template_type TEXT,
  ADD COLUMN IF NOT EXISTS max_retries INTEGER NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS next_retry_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS provider_name TEXT,
  ADD COLUMN IF NOT EXISTS provider_message_id TEXT,
  ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS failed_at TIMESTAMPTZ;

-- Migrate legacy status values if any
UPDATE public.outbox SET status = 'queued' WHERE status = 'pending';
UPDATE public.outbox SET status = 'delivered' WHERE status = 'sent';

-- Add new status check constraint
ALTER TABLE public.outbox
  ADD CONSTRAINT outbox_status_check
  CHECK (status IN ('queued', 'processing', 'provider_accepted', 'delivered', 'failed', 'dead_letter'));

-- Unique idempotency key constraint
CREATE UNIQUE INDEX IF NOT EXISTS idx_outbox_idempotency_key
  ON public.outbox(idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_outbox_queue_dispatch
  ON public.outbox(status, next_retry_at)
  WHERE status IN ('queued', 'processing');


-- 6. Webhook Events Table (For Replay Protection & Evidence-Based Delivery)
CREATE TABLE IF NOT EXISTS public.email_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  provider_event_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  signature TEXT,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_webhook_provider_event UNIQUE (provider, provider_event_id)
);

ALTER TABLE public.email_webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "webhook_events_select_admin" ON public.email_webhook_events
  FOR SELECT TO authenticated
  USING (private.is_admin((SELECT auth.uid())));


-- 7. Secure Queue Helper with Account-Security Override & Idempotency
CREATE OR REPLACE FUNCTION public.queue_transactional_notification(
  p_user_id UUID,
  p_event_type TEXT,
  p_subject TEXT,
  p_body_text TEXT,
  p_link_url TEXT DEFAULT NULL,
  p_idempotency_key TEXT DEFAULT NULL,
  p_template_type TEXT DEFAULT 'general'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_recipient_email TEXT;
  v_prefs RECORD;
  v_should_send_email BOOLEAN := true;
  v_should_send_in_app BOOLEAN := true;
  v_existing_outbox_id UUID;
  v_outbox_id UUID;
  v_notif_id UUID;
BEGIN
  -- 1. Deduplication check via idempotency key
  IF p_idempotency_key IS NOT NULL THEN
    SELECT id INTO v_existing_outbox_id
    FROM public.outbox
    WHERE idempotency_key = p_idempotency_key;

    IF v_existing_outbox_id IS NOT NULL THEN
      RETURN jsonb_build_object(
        'success', true,
        'deduplicated', true,
        'outbox_id', v_existing_outbox_id,
        'message', 'Notification already queued with idempotency key'
      );
    END IF;
  END IF;

  -- 2. Fetch user profile
  SELECT email INTO v_recipient_email
  FROM public.profiles
  WHERE id = p_user_id;

  IF v_recipient_email IS NULL THEN
    RAISE EXCEPTION 'Target user (%) not found in profiles', p_user_id;
  END IF;

  -- 3. Check notification preferences
  SELECT * INTO v_prefs
  FROM public.notification_preferences
  WHERE user_id = p_user_id;

  IF FOUND THEN
    -- Immutable Security Exception: Essential account-security messages cannot be suppressed!
    IF p_template_type = 'account_security' THEN
      v_should_send_email := true;
    ELSE
      v_should_send_email := v_prefs.email_notifications;
      IF p_template_type = 'task_due' AND NOT v_prefs.task_reminders THEN
        v_should_send_email := false;
      END IF;
      IF p_template_type = 'stage_change' AND NOT v_prefs.case_updates THEN
        v_should_send_email := false;
      END IF;
    END IF;
    v_should_send_in_app := v_prefs.in_app_notifications;
  END IF;

  -- 4. Insert in-app notification if permitted
  IF v_should_send_in_app THEN
    INSERT INTO public.notifications (
      user_id, title, body, link_url, event_type, is_read, created_at
    ) VALUES (
      p_user_id, p_subject, p_body_text, p_link_url, p_event_type, false, NOW()
    )
    RETURNING id INTO v_notif_id;
  END IF;

  -- 5. Insert durable outbox item if email permitted
  IF v_should_send_email THEN
    -- Enforce minimal email info: never embed passports, bank docs, or full chat transcripts
    INSERT INTO public.outbox (
      event_type,
      recipient_email,
      subject,
      payload,
      status,
      idempotency_key,
      template_type,
      max_retries,
      retry_count,
      next_retry_at
    ) VALUES (
      p_event_type,
      v_recipient_email,
      p_subject,
      jsonb_build_object(
        'user_id', p_user_id,
        'subject', p_subject,
        'body_text', p_body_text,
        'link_url', p_link_url,
        'template_type', p_template_type
      ),
      'queued',
      p_idempotency_key,
      p_template_type,
      3,
      0,
      NOW()
    )
    RETURNING id INTO v_outbox_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'deduplicated', false,
    'outbox_id', v_outbox_id,
    'notification_id', v_notif_id,
    'email_queued', v_should_send_email,
    'in_app_queued', v_should_send_in_app
  );
END;
$$;


-- 8. Operational Admin Workspace Metrics RPC
-- Strictly scoped: Counsellors see only their assigned cases, Admins see global metrics
CREATE OR REPLACE FUNCTION public.get_operational_workspace_metrics()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_uid UUID;
  v_is_admin BOOLEAN;
  v_is_staff BOOLEAN;
  v_user_role TEXT;
  v_requests_awaiting_review BIGINT := 0;
  v_unassigned_cases BIGINT := 0;
  v_overdue_tasks BIGINT := 0;
  v_documents_awaiting_review BIGINT := 0;
  v_cases_without_recent_updates BIGINT := 0;
  v_failed_notifications BIGINT := 0;
BEGIN
  v_uid := (SELECT auth.uid());
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  v_is_admin := private.is_admin(v_uid);
  SELECT EXISTS (SELECT 1 FROM public.staff_roles WHERE user_id = v_uid) INTO v_is_staff;

  IF NOT v_is_admin AND NOT v_is_staff THEN
    RAISE EXCEPTION 'Access denied: Operational workspace requires staff or admin role';
  END IF;

  IF v_is_admin THEN
    v_user_role := 'admin';

    -- 1. Requests awaiting review (Submitted, pending_review, needs_information)
    SELECT count(*) INTO v_requests_awaiting_review
    FROM public.access_requests
    WHERE status IN ('submitted', 'pending_review', 'email_verification_pending', 'needs_information');

    -- 2. Unassigned cases (No active counsellor assigned in case_assignments)
    SELECT count(*) INTO v_unassigned_cases
    FROM public.student_cases sc
    WHERE NOT EXISTS (
      SELECT 1 FROM public.case_assignments ca
      WHERE ca.case_id = sc.id AND ca.is_active = true
    );

    -- 3. Overdue tasks across all active cases
    SELECT count(*) INTO v_overdue_tasks
    FROM public.tasks t
    JOIN public.student_cases sc ON sc.id = t.case_id
    WHERE t.status NOT IN ('completed', 'verified')
      AND t.due_date < CURRENT_DATE
      AND sc.stage_status <> 'archived';

    -- 4. Documents awaiting review across all cases
    SELECT count(*) INTO v_documents_awaiting_review
    FROM public.document_metadata dm
    WHERE dm.verification_status = 'pending';

    -- 5. Cases without recent updates (>7 days)
    SELECT count(*) INTO v_cases_without_recent_updates
    FROM public.student_cases sc
    WHERE sc.stage_status <> 'archived'
      AND sc.updated_at < (NOW() - INTERVAL '7 days');

    -- 6. Failed or dead-letter notifications
    SELECT count(*) INTO v_failed_notifications
    FROM public.outbox
    WHERE status IN ('failed', 'dead_letter');

  ELSE
    -- Staff Counsellor Scoping: strictly only their assigned cases
    v_user_role := 'counsellor';

    -- Counsellors do not manage access requests awaiting review
    v_requests_awaiting_review := 0;

    -- Counsellors do not see unassigned cases pool
    v_unassigned_cases := 0;

    -- Overdue tasks strictly for their assigned cases
    SELECT count(*) INTO v_overdue_tasks
    FROM public.tasks t
    JOIN public.student_cases sc ON sc.id = t.case_id
    WHERE t.status NOT IN ('completed', 'verified')
      AND t.due_date < CURRENT_DATE
      AND sc.stage_status <> 'archived'
      AND private.is_assigned_counsellor(t.case_id, v_uid);

    -- Documents awaiting review strictly for their assigned cases
    SELECT count(*) INTO v_documents_awaiting_review
    FROM public.document_metadata dm
    WHERE dm.verification_status = 'pending'
      AND private.is_assigned_counsellor(dm.case_id, v_uid);

    -- Cases without recent updates strictly for their assigned cases
    SELECT count(*) INTO v_cases_without_recent_updates
    FROM public.student_cases sc
    WHERE sc.stage_status <> 'archived'
      AND sc.updated_at < (NOW() - INTERVAL '7 days')
      AND private.is_assigned_counsellor(sc.id, v_uid);

    -- Counsellors do not oversee systemic outbox dispatch failures
    v_failed_notifications := 0;
  END IF;

  RETURN jsonb_build_object(
    'requests_awaiting_review', v_requests_awaiting_review,
    'unassigned_cases', v_unassigned_cases,
    'overdue_tasks', v_overdue_tasks,
    'documents_awaiting_review', v_documents_awaiting_review,
    'cases_without_recent_updates', v_cases_without_recent_updates,
    'failed_notifications', v_failed_notifications,
    'user_role', v_user_role,
    'calculated_at', NOW()
  );
END;
$$;


-- 9. Operational Worklist Query RPC
-- Returns structured actionable items for the selected workspace queue
CREATE OR REPLACE FUNCTION public.get_operational_worklist(
  p_category TEXT,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_uid UUID;
  v_is_admin BOOLEAN;
  v_is_staff BOOLEAN;
  v_items JSONB := '[]'::jsonb;
BEGIN
  v_uid := (SELECT auth.uid());
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  v_is_admin := private.is_admin(v_uid);
  SELECT EXISTS (SELECT 1 FROM public.staff_roles WHERE user_id = v_uid) INTO v_is_staff;

  IF NOT v_is_admin AND NOT v_is_staff THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  IF p_category = 'requests_awaiting_review' THEN
    IF NOT v_is_admin THEN
      RETURN '[]'::jsonb;
    END IF;

    SELECT jsonb_agg(sub) INTO v_items FROM (
      SELECT
        ar.id,
        ar.full_name AS student_name,
        ar.email,
        ar.request_type,
        ar.status,
        ar.target_country,
        ar.created_at,
        ar.student_message
      FROM public.access_requests ar
      WHERE ar.status IN ('submitted', 'pending_review', 'email_verification_pending', 'needs_information')
      ORDER BY ar.created_at ASC
      LIMIT p_limit OFFSET p_offset
    ) sub;

  ELSIF p_category = 'unassigned_cases' THEN
    IF NOT v_is_admin THEN
      RETURN '[]'::jsonb;
    END IF;

    SELECT jsonb_agg(sub) INTO v_items FROM (
      SELECT
        sc.id AS case_id,
        p.full_name AS student_name,
        p.email AS student_email,
        sc.target_country,
        sc.target_degree,
        sc.current_stage,
        sc.created_at,
        sc.updated_at
      FROM public.student_cases sc
      JOIN public.profiles p ON p.id = sc.student_id
      WHERE NOT EXISTS (
        SELECT 1 FROM public.case_assignments ca
        WHERE ca.case_id = sc.id AND ca.is_active = true
      )
      ORDER BY sc.created_at ASC
      LIMIT p_limit OFFSET p_offset
    ) sub;

  ELSIF p_category = 'overdue_tasks' THEN
    SELECT jsonb_agg(sub) INTO v_items FROM (
      SELECT
        t.id AS task_id,
        t.case_id,
        p.full_name AS student_name,
        sc.target_country,
        t.title AS task_title,
        t.due_date,
        t.assigned_to_role,
        t.status AS task_status,
        t.created_at
      FROM public.tasks t
      JOIN public.student_cases sc ON sc.id = t.case_id
      JOIN public.profiles p ON p.id = sc.student_id
      WHERE t.status NOT IN ('completed', 'verified')
        AND t.due_date < CURRENT_DATE
        AND sc.stage_status <> 'archived'
        AND (v_is_admin OR private.is_assigned_counsellor(t.case_id, v_uid))
      ORDER BY t.due_date ASC
      LIMIT p_limit OFFSET p_offset
    ) sub;

  ELSIF p_category = 'documents_awaiting_review' THEN
    SELECT jsonb_agg(sub) INTO v_items FROM (
      SELECT
        dm.id AS document_id,
        dm.case_id,
        p.full_name AS student_name,
        sc.target_country,
        dm.title AS document_title,
        dm.document_type,
        dm.verification_status,
        dm.created_at
      FROM public.document_metadata dm
      JOIN public.student_cases sc ON sc.id = dm.case_id
      JOIN public.profiles p ON p.id = sc.student_id
      WHERE dm.verification_status = 'pending'
        AND (v_is_admin OR private.is_assigned_counsellor(dm.case_id, v_uid))
      ORDER BY dm.created_at ASC
      LIMIT p_limit OFFSET p_offset
    ) sub;

  ELSIF p_category = 'cases_without_recent_updates' THEN
    SELECT jsonb_agg(sub) INTO v_items FROM (
      SELECT
        sc.id AS case_id,
        p.full_name AS student_name,
        sc.target_country,
        sc.target_degree,
        sc.current_stage,
        sc.next_required_action,
        sc.updated_at
      FROM public.student_cases sc
      JOIN public.profiles p ON p.id = sc.student_id
      WHERE sc.stage_status <> 'archived'
        AND sc.updated_at < (NOW() - INTERVAL '7 days')
        AND (v_is_admin OR private.is_assigned_counsellor(sc.id, v_uid))
      ORDER BY sc.updated_at ASC
      LIMIT p_limit OFFSET p_offset
    ) sub;

  ELSIF p_category = 'failed_notifications' THEN
    IF NOT v_is_admin THEN
      RETURN '[]'::jsonb;
    END IF;

    SELECT jsonb_agg(sub) INTO v_items FROM (
      SELECT
        o.id AS outbox_id,
        o.recipient_email,
        o.subject,
        o.template_type,
        o.status,
        o.retry_count,
        o.max_retries,
        o.last_error,
        o.created_at,
        o.failed_at
      FROM public.outbox o
      WHERE o.status IN ('failed', 'dead_letter')
      ORDER BY o.created_at DESC
      LIMIT p_limit OFFSET p_offset
    ) sub;
  END IF;

  RETURN COALESCE(v_items, '[]'::jsonb);
END;
$$;


-- 10. Administrator Resend for Failed / Dead-Letter Outbox Messages
CREATE OR REPLACE FUNCTION public.admin_resend_outbox_message(
  p_outbox_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_uid UUID;
  v_current_status TEXT;
BEGIN
  v_uid := (SELECT auth.uid());
  IF v_uid IS NULL OR NOT private.is_admin(v_uid) THEN
    RAISE EXCEPTION 'Access denied: Only administrators may reset or resend outbox items';
  END IF;

  SELECT status INTO v_current_status
  FROM public.outbox
  WHERE id = p_outbox_id;

  IF v_current_status IS NULL THEN
    RAISE EXCEPTION 'Outbox item % not found', p_outbox_id;
  END IF;

  UPDATE public.outbox
  SET
    status = 'queued',
    retry_count = 0,
    last_error = NULL,
    next_retry_at = NOW(),
    failed_at = NULL
  WHERE id = p_outbox_id;

  RETURN jsonb_build_object(
    'success', true,
    'outbox_id', p_outbox_id,
    'new_status', 'queued',
    'message', 'Outbox message reset to queued state for immediate retry'
  );
END;
$$;


-- 11. Delivery Webhook Handler (Evidence-Based Transitions & Replay Protection)
CREATE OR REPLACE FUNCTION public.handle_email_webhook(
  p_provider TEXT,
  p_provider_event_id TEXT,
  p_event_type TEXT,
  p_provider_message_id TEXT,
  p_payload JSONB DEFAULT '{}'::jsonb,
  p_signature TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_existing_event_id UUID;
  v_target_outbox_id UUID;
BEGIN
  -- 1. Replay prevention: check if this provider event was already processed
  SELECT id INTO v_existing_event_id
  FROM public.email_webhook_events
  WHERE provider = p_provider AND provider_event_id = p_provider_event_id;

  IF v_existing_event_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', true,
      'replay_ignored', true,
      'message', 'Webhook event already processed'
    );
  END IF;

  -- 2. Record webhook event in immutable ledger
  INSERT INTO public.email_webhook_events (
    provider, provider_event_id, event_type, payload, signature, processed_at
  ) VALUES (
    p_provider, p_provider_event_id, p_event_type, p_payload, p_signature, NOW()
  );

  -- 3. Match outbox item by provider_message_id
  IF p_provider_message_id IS NOT NULL THEN
    SELECT id INTO v_target_outbox_id
    FROM public.outbox
    WHERE provider_message_id = p_provider_message_id;

    IF v_target_outbox_id IS NOT NULL THEN
      IF p_event_type IN ('delivered', 'delivery_success') THEN
        UPDATE public.outbox
        SET
          status = 'delivered',
          delivered_at = NOW(),
          last_error = NULL
        WHERE id = v_target_outbox_id;
      ELSIF p_event_type IN ('bounce', 'failed', 'dropped', 'spam_report') THEN
        UPDATE public.outbox
        SET
          status = 'failed',
          failed_at = NOW(),
          last_error = COALESCE(p_payload->>'error', 'Delivery rejected by provider')
        WHERE id = v_target_outbox_id;
      END IF;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'replay_ignored', false,
    'event_type', p_event_type,
    'outbox_id', v_target_outbox_id
  );
END;
$$;


-- 12. Role Grants for Authenticated and Service Role
GRANT SELECT, INSERT, UPDATE, DELETE ON public.support_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.support_messages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_preferences TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_webhook_events TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.outbox TO authenticated;

GRANT EXECUTE ON FUNCTION public.queue_transactional_notification TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_operational_workspace_metrics TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_operational_worklist TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_resend_outbox_message TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_email_webhook TO authenticated;

