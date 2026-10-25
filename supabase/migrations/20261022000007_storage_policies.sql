-- ============================================================================
-- Migration 007: Supabase Private Storage Policies (student-vault)
-- Product: Unilistics (ATS for European Higher Education)
-- Guidelines: Follows supabase storage security guidelines
-- Object path convention: {case_id}/{document_type}/{version}_{filename}
-- ============================================================================

-- 1. Ensure student-vault private bucket exists
-- Note: storage schema, storage.buckets, and storage.objects are pre-installed and managed by Supabase Storage.

-- 2. Seed student-vault bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'student-vault',
  'student-vault',
  false,
  20971520, -- 20MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage RLS Policies: student-vault
-- Note: Row Level Security is already enabled on storage.objects by default in Supabase (owned by supabase_storage_admin).
-- Running 'ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY' as user 'postgres' fails with
-- ERROR 42501 (must be owner of table objects). We drop existing policies if present for idempotency.

-- SELECT: Student can view their own files; Staff can view files for accessible cases
DROP POLICY IF EXISTS "vault_select_student" ON storage.objects;
CREATE POLICY "vault_select_student" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'student-vault'
    AND path_tokens[1] = private.get_student_case_id((SELECT auth.uid()))::text
    AND private.is_active_account((SELECT auth.uid()))
  );

DROP POLICY IF EXISTS "vault_select_staff" ON storage.objects;
CREATE POLICY "vault_select_staff" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'student-vault'
    AND CASE
      WHEN path_tokens[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      THEN private.can_access_case(path_tokens[1]::uuid, (SELECT auth.uid()))
      ELSE false
    END
  );

-- INSERT: Student can upload to their own case path
DROP POLICY IF EXISTS "vault_insert_student" ON storage.objects;
CREATE POLICY "vault_insert_student" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'student-vault'
    AND path_tokens[1] = private.get_student_case_id((SELECT auth.uid()))::text
    AND private.is_active_account((SELECT auth.uid()))
  );

DROP POLICY IF EXISTS "vault_insert_staff" ON storage.objects;
CREATE POLICY "vault_insert_staff" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'student-vault'
    AND CASE
      WHEN path_tokens[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      THEN private.can_access_case(path_tokens[1]::uuid, (SELECT auth.uid()))
      ELSE false
    END
  );

-- UPDATE: Upsert requires SELECT + INSERT + UPDATE
DROP POLICY IF EXISTS "vault_update_student" ON storage.objects;
CREATE POLICY "vault_update_student" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'student-vault'
    AND path_tokens[1] = private.get_student_case_id((SELECT auth.uid()))::text
    AND private.is_active_account((SELECT auth.uid()))
  )
  WITH CHECK (
    bucket_id = 'student-vault'
    AND path_tokens[1] = private.get_student_case_id((SELECT auth.uid()))::text
    AND private.is_active_account((SELECT auth.uid()))
  );

DROP POLICY IF EXISTS "vault_update_staff" ON storage.objects;
CREATE POLICY "vault_update_staff" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'student-vault'
    AND CASE
      WHEN path_tokens[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      THEN private.can_access_case(path_tokens[1]::uuid, (SELECT auth.uid()))
      ELSE false
    END
  )
  WITH CHECK (
    bucket_id = 'student-vault'
    AND CASE
      WHEN path_tokens[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      THEN private.can_access_case(path_tokens[1]::uuid, (SELECT auth.uid()))
      ELSE false
    END
  );

-- DELETE: Only Staff can delete from vault
DROP POLICY IF EXISTS "vault_delete_staff" ON storage.objects;
CREATE POLICY "vault_delete_staff" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'student-vault'
    AND (
      private.is_admin((SELECT auth.uid()))
      OR CASE
        WHEN path_tokens[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        THEN private.is_assigned_counsellor(path_tokens[1]::uuid, (SELECT auth.uid()))
        ELSE false
      END
    )
  );
