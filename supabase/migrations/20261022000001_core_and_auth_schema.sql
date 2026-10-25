-- ============================================================================
-- Migration 001: Core Schemas, Auth Support, Profiles & Entitlements
-- Product: Unilistics (ATS for European Higher Education)
-- Guidelines: Follows supabase and supabase-postgres-best-practices
-- ============================================================================

-- 1. Create private schema for security definer helpers and internal state
-- Note: auth schema, auth.users table, auth.uid(), and standard roles (anon, authenticated)
-- are pre-installed and managed natively by Supabase Auth (GoTrue).
CREATE SCHEMA IF NOT EXISTS private;

-- 4. User Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  city TEXT,
  account_status TEXT NOT NULL DEFAULT 'active' CHECK (account_status IN ('pending', 'active', 'suspended', 'revoked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_profiles_email UNIQUE (email)
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_account_status ON public.profiles(account_status);

-- 5. Server-Controlled Staff Roles Table (Never trust client-editable user_metadata)
CREATE TABLE IF NOT EXISTS public.staff_roles (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('counsellor', 'admin', 'super_admin')),
  assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_roles_role ON public.staff_roles(role);

-- 6. Entitlements Table (Explorer Catalogue vs Managed Application Case)
CREATE TABLE IF NOT EXISTS public.entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  entitlement_type TEXT NOT NULL CHECK (entitlement_type IN ('explorer_catalogue', 'managed_application_case')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'expired', 'revoked')),
  granted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  CONSTRAINT uq_user_entitlement UNIQUE (user_id, entitlement_type)
);

CREATE INDEX IF NOT EXISTS idx_entitlements_user_id ON public.entitlements(user_id);
CREATE INDEX IF NOT EXISTS idx_entitlements_user_status ON public.entitlements(user_id, status);

-- 7. Platform Access Requests Table
CREATE TABLE IF NOT EXISTS public.access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT NOT NULL,
  requested_entitlement TEXT NOT NULL CHECK (requested_entitlement IN ('explorer_catalogue', 'managed_application_case')),
  target_country TEXT NOT NULL CHECK (target_country IN ('germany', 'france', 'italy', 'romania')),
  target_degree TEXT NOT NULL CHECK (target_degree IN ('bachelors', 'masters')),
  academic_background TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_access_requests_email ON public.access_requests(email);
CREATE INDEX IF NOT EXISTS idx_access_requests_status ON public.access_requests(status);

-- 8. Private Security Definer Helpers (Principle of Least Privilege)
-- search_path set to '' to eliminate search path hijacking

CREATE OR REPLACE FUNCTION private.is_active_account(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = p_user_id AND account_status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION private.is_staff(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.staff_roles sr
    JOIN public.profiles p ON p.id = sr.user_id
    WHERE sr.user_id = p_user_id
      AND p.account_status = 'active'
      AND sr.role IN ('counsellor', 'admin', 'super_admin')
  );
$$;

CREATE OR REPLACE FUNCTION private.is_admin(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.staff_roles sr
    JOIN public.profiles p ON p.id = sr.user_id
    WHERE sr.user_id = p_user_id
      AND p.account_status = 'active'
      AND sr.role IN ('admin', 'super_admin')
  );
$$;

CREATE OR REPLACE FUNCTION private.is_super_admin(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.staff_roles sr
    JOIN public.profiles p ON p.id = sr.user_id
    WHERE sr.user_id = p_user_id
      AND p.account_status = 'active'
      AND sr.role = 'super_admin'
  );
$$;

CREATE OR REPLACE FUNCTION private.has_active_entitlement(p_user_id UUID, p_type TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.entitlements e
    JOIN public.profiles p ON p.id = e.user_id
    WHERE e.user_id = p_user_id
      AND p.account_status = 'active'
      AND e.entitlement_type = p_type
      AND e.status = 'active'
      AND (e.expires_at IS NULL OR e.expires_at > NOW())
  );
$$;

-- Grant usage on private schema and execution on helpers to authenticated role for RLS policy evaluation
GRANT USAGE ON SCHEMA private TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_active_account(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_staff(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_super_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION private.has_active_entitlement(UUID, TEXT) TO authenticated;

-- Strictly deny public and anon access to private schema
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon;
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA private FROM PUBLIC, anon;

-- 9. Enable Row-Level Security on all exposed tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;

-- 10. RLS Policies: Profiles
-- Owner can select their own profile (if active)
CREATE POLICY "profiles_select_owner" ON public.profiles
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = id);

-- Staff can select all active profiles
CREATE POLICY "profiles_select_staff" ON public.profiles
  FOR SELECT TO authenticated
  USING (private.is_staff((SELECT auth.uid())));

-- Owner can update selected personal fields (name, phone, city)
-- WITH CHECK prevents reassigning ID or setting account_status to unauthorized values
CREATE POLICY "profiles_update_owner" ON public.profiles
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = id AND private.is_active_account((SELECT auth.uid())))
  WITH CHECK ((SELECT auth.uid()) = id AND private.is_active_account((SELECT auth.uid())));

-- 11. RLS Policies: Staff Roles
-- Staff can view staff roles
CREATE POLICY "staff_roles_select_staff" ON public.staff_roles
  FOR SELECT TO authenticated
  USING (private.is_staff((SELECT auth.uid())));

-- Only Super Admin can mutate staff roles
CREATE POLICY "staff_roles_insert_super_admin" ON public.staff_roles
  FOR INSERT TO authenticated
  WITH CHECK (private.is_super_admin((SELECT auth.uid())));

CREATE POLICY "staff_roles_update_super_admin" ON public.staff_roles
  FOR UPDATE TO authenticated
  USING (private.is_super_admin((SELECT auth.uid())))
  WITH CHECK (private.is_super_admin((SELECT auth.uid())));

CREATE POLICY "staff_roles_delete_super_admin" ON public.staff_roles
  FOR DELETE TO authenticated
  USING (private.is_super_admin((SELECT auth.uid())));

-- 12. RLS Policies: Entitlements
-- Owner can view their own active entitlements
CREATE POLICY "entitlements_select_owner" ON public.entitlements
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id AND private.is_active_account((SELECT auth.uid())));

-- Staff can view all entitlements
CREATE POLICY "entitlements_select_staff" ON public.entitlements
  FOR SELECT TO authenticated
  USING (private.is_staff((SELECT auth.uid())));

-- Only Admin can mutate entitlements
CREATE POLICY "entitlements_insert_admin" ON public.entitlements
  FOR INSERT TO authenticated
  WITH CHECK (private.is_admin((SELECT auth.uid())));

CREATE POLICY "entitlements_update_admin" ON public.entitlements
  FOR UPDATE TO authenticated
  USING (private.is_admin((SELECT auth.uid())))
  WITH CHECK (private.is_admin((SELECT auth.uid())));

-- 13. RLS Policies: Access Requests
-- Anyone (anon and authenticated) can submit an access request
CREATE POLICY "access_requests_insert_public" ON public.access_requests
  FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'pending' AND reviewed_by IS NULL);

-- User can view access requests with their matching verified email
CREATE POLICY "access_requests_select_owner" ON public.access_requests
  FOR SELECT TO authenticated
  USING (email = (SELECT email FROM public.profiles WHERE id = (SELECT auth.uid())));

-- Staff can view and review all access requests
CREATE POLICY "access_requests_select_staff" ON public.access_requests
  FOR SELECT TO authenticated
  USING (private.is_staff((SELECT auth.uid())));

CREATE POLICY "access_requests_update_admin" ON public.access_requests
  FOR UPDATE TO authenticated
  USING (private.is_admin((SELECT auth.uid())))
  WITH CHECK (private.is_admin((SELECT auth.uid())));
