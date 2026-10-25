-- ============================================================================
-- Unilistics: Role Management & User Provisioning SQL Scripts
-- Run these scripts in the Supabase Dashboard -> SQL Editor
-- ============================================================================

-- ----------------------------------------------------------------------------
-- OPTION 1: Promote an Existing User (by Email) to ADMIN
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  v_email TEXT := 'admin@unilistics.com'; -- <--- REPLACE with your user's email
  v_user_id UUID;
BEGIN
  -- 1. Find user in auth.users
  SELECT id INTO v_user_id FROM auth.users WHERE email = LOWER(TRIM(v_email));
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found in auth.users. Please create or invite them first.', v_email;
  END IF;

  -- 2. Ensure profile exists and is active
  INSERT INTO public.profiles (id, email, full_name, account_status)
  VALUES (v_user_id, LOWER(TRIM(v_email)), 'Platform Admin', 'active')
  ON CONFLICT (id) DO UPDATE SET account_status = 'active';

  -- 3. Assign staff role = 'admin'
  INSERT INTO public.staff_roles (user_id, role)
  VALUES (v_user_id, 'admin')
  ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

  -- 4. Grant explorer catalogue entitlement
  INSERT INTO public.entitlements (user_id, entitlement_type, status)
  VALUES (v_user_id, 'explorer_catalogue', 'active')
  ON CONFLICT (user_id, entitlement_type) DO UPDATE SET status = 'active';

  RAISE NOTICE 'User % (ID: %) successfully assigned as ADMIN.', v_email, v_user_id;
END $$;


-- ----------------------------------------------------------------------------
-- OPTION 2: Promote an Existing User (by Email) to SUPER_ADMIN
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  v_email TEXT := 'superadmin@unilistics.com'; -- <--- REPLACE with your email
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = LOWER(TRIM(v_email));
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found in auth.users.', v_email;
  END IF;

  INSERT INTO public.profiles (id, email, full_name, account_status)
  VALUES (v_user_id, LOWER(TRIM(v_email)), 'Super Administrator', 'active')
  ON CONFLICT (id) DO UPDATE SET account_status = 'active';

  INSERT INTO public.staff_roles (user_id, role)
  VALUES (v_user_id, 'super_admin')
  ON CONFLICT (user_id) DO UPDATE SET role = 'super_admin';

  INSERT INTO public.entitlements (user_id, entitlement_type, status)
  VALUES (v_user_id, 'explorer_catalogue', 'active')
  ON CONFLICT (user_id, entitlement_type) DO UPDATE SET status = 'active';

  RAISE NOTICE 'User % (ID: %) successfully assigned as SUPER_ADMIN.', v_email, v_user_id;
END $$;


-- ----------------------------------------------------------------------------
-- OPTION 3: Promote an Existing User (by Email) to COUNSELLOR
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  v_email TEXT := 'counsellor@unilistics.com'; -- <--- REPLACE with your counsellor email
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = LOWER(TRIM(v_email));
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found in auth.users.', v_email;
  END IF;

  INSERT INTO public.profiles (id, email, full_name, account_status)
  VALUES (v_user_id, LOWER(TRIM(v_email)), 'Admissions Counsellor', 'active')
  ON CONFLICT (id) DO UPDATE SET account_status = 'active';

  INSERT INTO public.staff_roles (user_id, role)
  VALUES (v_user_id, 'counsellor')
  ON CONFLICT (user_id) DO UPDATE SET role = 'counsellor';

  INSERT INTO public.entitlements (user_id, entitlement_type, status)
  VALUES (v_user_id, 'explorer_catalogue', 'active')
  ON CONFLICT (user_id, entitlement_type) DO UPDATE SET status = 'active';

  RAISE NOTICE 'User % (ID: %) successfully assigned as COUNSELLOR.', v_email, v_user_id;
END $$;


-- ----------------------------------------------------------------------------
-- OPTION 4: Promote an Existing User to MANAGED_STUDENT (with case room)
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  v_email TEXT := 'student@unilistics.com'; -- <--- REPLACE with your student email
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = LOWER(TRIM(v_email));
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found in auth.users.', v_email;
  END IF;

  -- Ensure profile is active
  INSERT INTO public.profiles (id, email, full_name, account_status)
  VALUES (v_user_id, LOWER(TRIM(v_email)), 'Managed Student', 'active')
  ON CONFLICT (id) DO UPDATE SET account_status = 'active';

  -- Remove from staff_roles if previously staff
  DELETE FROM public.staff_roles WHERE user_id = v_user_id;

  -- Grant managed_application_case entitlement
  INSERT INTO public.entitlements (user_id, entitlement_type, status)
  VALUES (v_user_id, 'managed_application_case', 'active')
  ON CONFLICT (user_id, entitlement_type) DO UPDATE SET status = 'active';

  INSERT INTO public.entitlements (user_id, entitlement_type, status)
  VALUES (v_user_id, 'explorer_catalogue', 'active')
  ON CONFLICT (user_id, entitlement_type) DO UPDATE SET status = 'active';

  -- Ensure student_cases entry exists so student dashboard renders case room
  INSERT INTO public.student_cases (
    student_id, target_country, target_degree, target_intake_season, target_intake_year,
    current_stage, stage_status, next_required_action, responsible_party
  ) VALUES (
    v_user_id, 'germany', 'masters', 'winter', 2026,
    'profile_creation', 'in_progress', 'Complete initial document upload', 'student'
  )
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'User % (ID: %) successfully assigned as MANAGED_STUDENT.', v_email, v_user_id;
END $$;


-- ----------------------------------------------------------------------------
-- OPTION 5: Quick Verification Query (View All Current Users and Their Roles)
-- ----------------------------------------------------------------------------
SELECT 
  u.id,
  u.email,
  p.full_name,
  p.account_status,
  COALESCE(sr.role, 
    CASE 
      WHEN EXISTS (SELECT 1 FROM public.entitlements e WHERE e.user_id = u.id AND e.entitlement_type = 'managed_application_case' AND e.status = 'active') THEN 'managed_student'
      ELSE 'explorer'
    END
  ) AS effective_role,
  sr.role AS staff_role,
  ARRAY_AGG(DISTINCT e.entitlement_type) FILTER (WHERE e.status = 'active') AS active_entitlements,
  u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
LEFT JOIN public.staff_roles sr ON sr.user_id = u.id
LEFT JOIN public.entitlements e ON e.user_id = u.id
GROUP BY u.id, u.email, p.full_name, p.account_status, sr.role
ORDER BY u.created_at DESC;
