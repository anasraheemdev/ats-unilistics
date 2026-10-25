-- ============================================================================
-- Migration 005: Audit Events, Notifications & Transactional Outbox
-- Product: Unilistics (ATS for European Higher Education)
-- Guidelines: Follows supabase and supabase-postgres-best-practices
-- Immutability triggers on audit log & event queue
-- ============================================================================

-- 1. Audit Events Table (Immutable ledger of privileged operations)
CREATE TABLE IF NOT EXISTS public.audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_events_actor ON public.audit_events(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_action ON public.audit_events(action);
CREATE INDEX IF NOT EXISTS idx_audit_events_target ON public.audit_events(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_created_at ON public.audit_events(created_at);

-- 2. Prevent Clients From Rewriting or Deleting Audit History
CREATE OR REPLACE FUNCTION private.prevent_audit_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RAISE EXCEPTION 'Audit events are immutable and cannot be updated or deleted by clients.';
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_events_immutable ON public.audit_events;
CREATE TRIGGER trg_audit_events_immutable
  BEFORE UPDATE OR DELETE ON public.audit_events
  FOR EACH ROW
  EXECUTE FUNCTION private.prevent_audit_mutation();

-- 3. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  link_url TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, is_read);

-- 4. Transactional Outbox Table (Reliable asynchronous email/webhook queue)
CREATE TABLE IF NOT EXISTS public.outbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed')),
  retry_count INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_outbox_status_created ON public.outbox(status, created_at);

-- 5. Enable RLS
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outbox ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies: Audit Events
-- Only Admin/Super Admin can inspect audit events; no direct client mutations
CREATE POLICY "audit_events_select_admin" ON public.audit_events
  FOR SELECT TO authenticated
  USING (private.is_admin((SELECT auth.uid())));

-- 7. RLS Policies: Notifications
CREATE POLICY "notifications_select_owner" ON public.notifications
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id AND private.is_active_account((SELECT auth.uid())));

CREATE POLICY "notifications_update_owner" ON public.notifications
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id AND private.is_active_account((SELECT auth.uid())))
  WITH CHECK ((SELECT auth.uid()) = user_id AND private.is_active_account((SELECT auth.uid())));

-- 8. RLS Policies: Outbox
-- Outbox is an internal background mechanism; default deny to clients
CREATE POLICY "outbox_select_admin" ON public.outbox
  FOR SELECT TO authenticated
  USING (private.is_admin((SELECT auth.uid())));
