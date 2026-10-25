-- ============================================================================
-- Migration 004: Tasks, Document Vault, Messages & Internal Notes
-- Product: Unilistics (ATS for European Higher Education)
-- Guidelines: Follows supabase and supabase-postgres-best-practices
-- Anti-forgery triggers & Strict internal notes isolation
-- ============================================================================

-- 1. Tasks Table (Case-level and application-level action items)
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.student_cases(id) ON DELETE CASCADE,
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to_role TEXT NOT NULL CHECK (assigned_to_role IN ('student', 'counsellor')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'verified', 'blocked')),
  category TEXT NOT NULL CHECK (category IN ('attestation', 'application', 'financial', 'visa', 'general')),
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_case_id ON public.tasks(case_id);
CREATE INDEX IF NOT EXISTS idx_tasks_app_id ON public.tasks(application_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);

-- 2. Document Metadata Table (Student Vault Dossier)
CREATE TABLE IF NOT EXISTS public.document_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.student_cases(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN (
    'matric_certificate', 'fsc_certificate', 'bachelors_transcript',
    'bachelors_degree', 'hec_attestation', 'mofa_apostille',
    'passport_scan', 'cv_resume', 'motivation_letter',
    'recommendation_letter', 'language_certificate', 'admission_offer',
    'blocked_account_proof', 'visa_application_form', 'embassy_appointment_slip', 'other'
  )),
  title TEXT NOT NULL,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verification_notes TEXT,
  verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_document_metadata_case ON public.document_metadata(case_id);
CREATE INDEX IF NOT EXISTS idx_document_metadata_status ON public.document_metadata(verification_status);

-- 3. Document Versions Table (Underlying Storage Path & History)
CREATE TABLE IF NOT EXISTS public.document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.document_metadata(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_doc_version UNIQUE (document_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_document_versions_doc_id ON public.document_versions(document_id);

-- 4. Document Links Table (Linking Vault Documents to University Applications)
CREATE TABLE IF NOT EXISTS public.document_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES public.document_metadata(id) ON DELETE CASCADE,
  linked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_app_doc_link UNIQUE (application_id, document_id)
);

CREATE INDEX IF NOT EXISTS idx_document_links_app_id ON public.document_links(application_id);
CREATE INDEX IF NOT EXISTS idx_document_links_doc_id ON public.document_links(document_id);

-- 5. Student-Visible Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.student_cases(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_case_id ON public.messages(case_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);

-- 6. Staff Internal Notes Table (STRICTLY ISOLATED FROM STUDENTS)
CREATE TABLE IF NOT EXISTS public.internal_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.student_cases(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  note_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_internal_notes_case_id ON public.internal_notes(case_id);

-- 7. Anti-Forgery Triggers
-- 7a. Prevent forged cross-case document linking
CREATE OR REPLACE FUNCTION private.validate_document_link_case()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_app_case_id UUID;
  v_doc_case_id UUID;
BEGIN
  SELECT case_id INTO v_app_case_id FROM public.applications WHERE id = NEW.application_id;
  SELECT case_id INTO v_doc_case_id FROM public.document_metadata WHERE id = NEW.document_id;

  IF v_app_case_id IS NULL OR v_doc_case_id IS NULL THEN
    RAISE EXCEPTION 'Referenced application or document does not exist';
  END IF;

  IF v_app_case_id <> v_doc_case_id THEN
    RAISE EXCEPTION 'Cross-case document linking is forbidden. Document case (%) does not match application case (%)', v_doc_case_id, v_app_case_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_document_link ON public.document_links;
CREATE TRIGGER trg_validate_document_link
  BEFORE INSERT OR UPDATE ON public.document_links
  FOR EACH ROW
  EXECUTE FUNCTION private.validate_document_link_case();

-- 7b. Prevent forged task application assignment
CREATE OR REPLACE FUNCTION private.validate_task_application_case()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_app_case_id UUID;
BEGIN
  IF NEW.application_id IS NOT NULL THEN
    SELECT case_id INTO v_app_case_id FROM public.applications WHERE id = NEW.application_id;
    IF v_app_case_id <> NEW.case_id THEN
      RAISE EXCEPTION 'Cross-case task assignment is forbidden. Task case (%) does not match application case (%)', NEW.case_id, v_app_case_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_task_application ON public.tasks;
CREATE TRIGGER trg_validate_task_application
  BEFORE INSERT OR UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION private.validate_task_application_case();

-- 8. Enable RLS on all tables
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internal_notes ENABLE ROW LEVEL SECURITY;

-- 9. RLS Policies: Tasks
CREATE POLICY "tasks_select_student" ON public.tasks
  FOR SELECT TO authenticated
  USING (
    case_id = private.get_student_case_id((SELECT auth.uid()))
    AND private.is_active_account((SELECT auth.uid()))
  );

CREATE POLICY "tasks_select_staff" ON public.tasks
  FOR SELECT TO authenticated
  USING (
    private.is_admin((SELECT auth.uid()))
    OR private.is_assigned_counsellor(case_id, (SELECT auth.uid()))
  );

-- Student can only update status of their own student tasks to 'completed'
CREATE POLICY "tasks_update_student" ON public.tasks
  FOR UPDATE TO authenticated
  USING (
    case_id = private.get_student_case_id((SELECT auth.uid()))
    AND private.is_active_account((SELECT auth.uid()))
    AND assigned_to_role = 'student'
  )
  WITH CHECK (
    case_id = private.get_student_case_id((SELECT auth.uid()))
    AND private.is_active_account((SELECT auth.uid()))
    AND assigned_to_role = 'student'
    AND status IN ('pending', 'in_progress', 'completed')
  );

-- Staff can insert and update any tasks for assigned cases
CREATE POLICY "tasks_write_staff" ON public.tasks
  FOR ALL TO authenticated
  USING (
    private.is_admin((SELECT auth.uid()))
    OR private.is_assigned_counsellor(case_id, (SELECT auth.uid()))
  )
  WITH CHECK (
    private.is_admin((SELECT auth.uid()))
    OR private.is_assigned_counsellor(case_id, (SELECT auth.uid()))
  );

-- 10. RLS Policies: Document Metadata & Versions
CREATE POLICY "doc_meta_select_student" ON public.document_metadata
  FOR SELECT TO authenticated
  USING (
    case_id = private.get_student_case_id((SELECT auth.uid()))
    AND private.is_active_account((SELECT auth.uid()))
  );

CREATE POLICY "doc_meta_select_staff" ON public.document_metadata
  FOR SELECT TO authenticated
  USING (
    private.is_admin((SELECT auth.uid()))
    OR private.is_assigned_counsellor(case_id, (SELECT auth.uid()))
  );

CREATE POLICY "doc_meta_insert_student" ON public.document_metadata
  FOR INSERT TO authenticated
  WITH CHECK (
    case_id = private.get_student_case_id((SELECT auth.uid()))
    AND private.is_active_account((SELECT auth.uid()))
    AND verification_status = 'pending'
    AND verified_by IS NULL
  );

CREATE POLICY "doc_meta_write_staff" ON public.document_metadata
  FOR ALL TO authenticated
  USING (
    private.is_admin((SELECT auth.uid()))
    OR private.is_assigned_counsellor(case_id, (SELECT auth.uid()))
  )
  WITH CHECK (
    private.is_admin((SELECT auth.uid()))
    OR private.is_assigned_counsellor(case_id, (SELECT auth.uid()))
  );

-- Document Versions RLS
CREATE POLICY "doc_versions_select_student" ON public.document_versions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.document_metadata dm
      WHERE dm.id = document_id
        AND dm.case_id = private.get_student_case_id((SELECT auth.uid()))
    )
    AND private.is_active_account((SELECT auth.uid()))
  );

CREATE POLICY "doc_versions_select_staff" ON public.document_versions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.document_metadata dm
      WHERE dm.id = document_id
        AND (
          private.is_admin((SELECT auth.uid()))
          OR private.is_assigned_counsellor(dm.case_id, (SELECT auth.uid()))
        )
    )
  );

CREATE POLICY "doc_versions_insert_student" ON public.document_versions
  FOR INSERT TO authenticated
  WITH CHECK (
    uploaded_by = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.document_metadata dm
      WHERE dm.id = document_id
        AND dm.case_id = private.get_student_case_id((SELECT auth.uid()))
    )
    AND private.is_active_account((SELECT auth.uid()))
  );

CREATE POLICY "doc_versions_write_staff" ON public.document_versions
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.document_metadata dm
      WHERE dm.id = document_id
        AND (
          private.is_admin((SELECT auth.uid()))
          OR private.is_assigned_counsellor(dm.case_id, (SELECT auth.uid()))
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.document_metadata dm
      WHERE dm.id = document_id
        AND (
          private.is_admin((SELECT auth.uid()))
          OR private.is_assigned_counsellor(dm.case_id, (SELECT auth.uid()))
        )
    )
  );

-- 11. RLS Policies: Document Links
CREATE POLICY "doc_links_select_student" ON public.document_links
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.applications a
      WHERE a.id = application_id
        AND a.case_id = private.get_student_case_id((SELECT auth.uid()))
    )
    AND private.is_active_account((SELECT auth.uid()))
  );

CREATE POLICY "doc_links_select_staff" ON public.document_links
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.applications a
      WHERE a.id = application_id
        AND (
          private.is_admin((SELECT auth.uid()))
          OR private.is_assigned_counsellor(a.case_id, (SELECT auth.uid()))
        )
    )
  );

CREATE POLICY "doc_links_insert_student" ON public.document_links
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.applications a
      JOIN public.document_metadata dm ON dm.id = document_id
      WHERE a.id = application_id
        AND a.case_id = private.get_student_case_id((SELECT auth.uid()))
        AND dm.case_id = private.get_student_case_id((SELECT auth.uid()))
    )
    AND private.is_active_account((SELECT auth.uid()))
  );

CREATE POLICY "doc_links_write_staff" ON public.document_links
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.applications a
      WHERE a.id = application_id
        AND (
          private.is_admin((SELECT auth.uid()))
          OR private.is_assigned_counsellor(a.case_id, (SELECT auth.uid()))
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.applications a
      WHERE a.id = application_id
        AND (
          private.is_admin((SELECT auth.uid()))
          OR private.is_assigned_counsellor(a.case_id, (SELECT auth.uid()))
        )
    )
  );

-- 12. RLS Policies: Messages
CREATE POLICY "messages_select_student" ON public.messages
  FOR SELECT TO authenticated
  USING (
    case_id = private.get_student_case_id((SELECT auth.uid()))
    AND private.is_active_account((SELECT auth.uid()))
  );

CREATE POLICY "messages_select_staff" ON public.messages
  FOR SELECT TO authenticated
  USING (
    private.is_admin((SELECT auth.uid()))
    OR private.is_assigned_counsellor(case_id, (SELECT auth.uid()))
  );

CREATE POLICY "messages_insert_student" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = (SELECT auth.uid())
    AND case_id = private.get_student_case_id((SELECT auth.uid()))
    AND private.is_active_account((SELECT auth.uid()))
  );

CREATE POLICY "messages_insert_staff" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = (SELECT auth.uid())
    AND (
      private.is_admin((SELECT auth.uid()))
      OR private.is_assigned_counsellor(case_id, (SELECT auth.uid()))
    )
  );

-- 13. RLS Policies: Internal Notes (STRICTLY STAFF ONLY - NEVER ACCESSIBLE TO STUDENTS)
CREATE POLICY "internal_notes_select_staff" ON public.internal_notes
  FOR SELECT TO authenticated
  USING (
    private.is_admin((SELECT auth.uid()))
    OR private.is_assigned_counsellor(case_id, (SELECT auth.uid()))
  );

CREATE POLICY "internal_notes_insert_staff" ON public.internal_notes
  FOR INSERT TO authenticated
  WITH CHECK (
    author_id = (SELECT auth.uid())
    AND (
      private.is_admin((SELECT auth.uid()))
      OR private.is_assigned_counsellor(case_id, (SELECT auth.uid()))
    )
  );

CREATE POLICY "internal_notes_update_staff" ON public.internal_notes
  FOR UPDATE TO authenticated
  USING (
    author_id = (SELECT auth.uid())
    AND (
      private.is_admin((SELECT auth.uid()))
      OR private.is_assigned_counsellor(case_id, (SELECT auth.uid()))
    )
  )
  WITH CHECK (
    author_id = (SELECT auth.uid())
    AND (
      private.is_admin((SELECT auth.uid()))
      OR private.is_assigned_counsellor(case_id, (SELECT auth.uid()))
    )
  );
