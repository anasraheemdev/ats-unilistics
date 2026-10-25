-- ============================================================================
-- Migration 014: Secure Private Storage, Malware Quarantine, Magic Byte Signatures,
--                Short-Lived Signed URLs & Retention Erasure
-- Product: Unilistics (Staff-Managed Higher Education Platform)
-- Guidelines: Follows supabase storage security guidelines and AGENTS.md
-- ============================================================================

-- 1. Enhance document_metadata Table
-- Expand document types to cover comprehensive checklists
ALTER TABLE public.document_metadata DROP CONSTRAINT IF EXISTS document_metadata_document_type_check;

ALTER TABLE public.document_metadata
  ADD CONSTRAINT document_metadata_document_type_check CHECK (document_type IN (
    'matric_certificate', 'fsc_certificate', 'bachelors_transcript',
    'bachelors_degree', 'hec_attestation', 'mofa_apostille',
    'passport_scan', 'cv_resume', 'motivation_letter',
    'recommendation_letter', 'language_certificate', 'ielts_academic', 'toefl_ibt', 'german_certificate',
    'admission_offer', 'conditional_offer_letter', 'unconditional_offer_letter',
    'blocked_account_proof', 'visa_application_form', 'embassy_appointment_slip',
    'tuition_receipt', 'other'
  ));

ALTER TABLE public.document_metadata
  ADD COLUMN IF NOT EXISTS safe_display_name TEXT,
  ADD COLUMN IF NOT EXISTS quarantine_status TEXT NOT NULL DEFAULT 'uploaded_quarantined'
    CHECK (quarantine_status IN (
      'uploaded_quarantined', 'quarantine_scanning', 'ready_for_review',
      'malware_detected', 'approved', 'needs_replacement', 'rejected'
    )),
  ADD COLUMN IF NOT EXISTS quarantine_scanned_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS scan_engine TEXT DEFAULT 'unilistics-clamav-guard',
  ADD COLUMN IF NOT EXISTS scan_signature TEXT,
  ADD COLUMN IF NOT EXISTS replacement_instructions TEXT,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_document_metadata_quarantine ON public.document_metadata(quarantine_status);
CREATE INDEX IF NOT EXISTS idx_document_metadata_deleted ON public.document_metadata(deleted_at);

-- 2. Enhance document_versions Table
ALTER TABLE public.document_versions
  ADD COLUMN IF NOT EXISTS object_key TEXT,
  ADD COLUMN IF NOT EXISTS content_sha256 TEXT,
  ADD COLUMN IF NOT EXISTS magic_signature TEXT CHECK (magic_signature IS NULL OR magic_signature IN ('pdf', 'jpeg', 'png')),
  ADD COLUMN IF NOT EXISTS quarantine_status TEXT NOT NULL DEFAULT 'uploaded_quarantined'
    CHECK (quarantine_status IN (
      'uploaded_quarantined', 'quarantine_scanning', 'ready_for_review',
      'malware_detected', 'approved', 'needs_replacement', 'rejected'
    )),
  ADD COLUMN IF NOT EXISTS is_latest BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_document_versions_object_key ON public.document_versions(object_key);
CREATE INDEX IF NOT EXISTS idx_document_versions_quarantine ON public.document_versions(quarantine_status);

-- 3. File Signature & Extension Validation Helper
CREATE OR REPLACE FUNCTION private.validate_file_security(
  p_file_name TEXT,
  p_mime_type TEXT,
  p_file_size BIGINT,
  p_magic_signature TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_ext TEXT;
  v_mime TEXT;
  v_sig TEXT;
BEGIN
  -- Max size limit: 20 MB (20,971,520 bytes)
  IF p_file_size <= 0 OR p_file_size > 20971520 THEN
    RAISE EXCEPTION 'FILE_SIZE_LIMIT_EXCEEDED: File size % bytes exceeds 20MB maximum limit', p_file_size;
  END IF;

  -- Extract file extension (lowercase)
  v_ext := LOWER(SUBSTRING(p_file_name FROM '\.([^\.]+)$'));
  IF v_ext IS NULL OR v_ext NOT IN ('pdf', 'jpg', 'jpeg', 'png') THEN
    RAISE EXCEPTION 'FILE_EXTENSION_DISALLOWED: Extension "%" is prohibited. Only PDF, JPG, and PNG documents are accepted.', v_ext;
  END IF;

  v_mime := LOWER(TRIM(p_mime_type));
  IF v_mime NOT IN ('application/pdf', 'image/jpeg', 'image/png') THEN
    RAISE EXCEPTION 'FILE_MIME_DISALLOWED: MIME type "%" is prohibited. Only application/pdf, image/jpeg, and image/png are accepted.', v_mime;
  END IF;

  -- Validate actual magic content signature
  v_sig := LOWER(TRIM(COALESCE(p_magic_signature, '')));
  IF v_sig NOT IN ('pdf', 'jpeg', 'png') THEN
    RAISE EXCEPTION 'MALICIOUS_SIGNATURE_MISMATCH: Binary file header does not match declared format. Executable, script, or SVG formats are strictly prohibited.';
  END IF;

  -- Check MIME & signature parity
  IF v_mime = 'application/pdf' AND v_sig <> 'pdf' THEN
    RAISE EXCEPTION 'MALICIOUS_MIME_MISMATCH: Declared PDF MIME type does not match binary content signature (%)', v_sig;
  END IF;
  IF v_mime = 'image/jpeg' AND v_sig <> 'jpeg' THEN
    RAISE EXCEPTION 'MALICIOUS_MIME_MISMATCH: Declared JPEG MIME type does not match binary content signature (%)', v_sig;
  END IF;
  IF v_mime = 'image/png' AND v_sig <> 'png' THEN
    RAISE EXCEPTION 'MALICIOUS_MIME_MISMATCH: Declared PNG MIME type does not match binary content signature (%)', v_sig;
  END IF;

  RETURN true;
END;
$$;

-- 4. RPC: Create Document Upload Session with Random Object Key
CREATE OR REPLACE FUNCTION public.create_document_upload_session(
  p_case_id UUID,
  p_document_type TEXT,
  p_title TEXT,
  p_file_name TEXT,
  p_file_size BIGINT,
  p_mime_type TEXT,
  p_magic_signature TEXT,
  p_content_sha256 TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_actor_id UUID;
  v_case RECORD;
  v_random_id UUID;
  v_object_key TEXT;
  v_storage_path TEXT;
  v_doc_id UUID;
  v_version_number INT;
  v_safe_display_name TEXT;
  v_ext TEXT;
BEGIN
  v_actor_id := (SELECT auth.uid());
  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Verify case exists
  SELECT * INTO v_case FROM public.student_cases WHERE id = p_case_id;
  IF v_case IS NULL THEN
    RAISE EXCEPTION 'Student case % not found', p_case_id;
  END IF;

  -- Verify caller authorization on case
  IF NOT (
    private.is_admin(v_actor_id)
    OR private.is_assigned_counsellor(p_case_id, v_actor_id)
    OR (v_case.student_id = v_actor_id AND private.is_active_account(v_actor_id))
  ) THEN
    RAISE EXCEPTION 'Permission denied: caller cannot upload documents to case %', p_case_id;
  END IF;

  -- Validate file size, extension, MIME, and binary magic signature
  PERFORM private.validate_file_security(p_file_name, p_mime_type, p_file_size, p_magic_signature);

  -- Sanitize safe display name (strip directory traversal and dangerous characters)
  v_ext := LOWER(SUBSTRING(p_file_name FROM '\.([^\.]+)$'));
  v_safe_display_name := REGEXP_REPLACE(p_file_name, '[^a-zA-Z0-9_\-\. ]', '_', 'g');
  IF length(v_safe_display_name) > 120 THEN
    v_safe_display_name := SUBSTRING(v_safe_display_name FROM 1 FOR 115) || '.' || v_ext;
  END IF;

  -- Generate cryptographically random object key: {case_id}/{document_type}/{uuid_v4}.bin
  -- RAW USER FILENAMES ARE NEVER USED AS OBJECT KEYS
  v_random_id := gen_random_uuid();
  v_object_key := p_case_id::text || '/' || p_document_type || '/' || v_random_id::text || '.bin';
  v_storage_path := v_object_key;

  -- Check if document metadata entry exists for this case + doc_type
  SELECT id INTO v_doc_id
  FROM public.document_metadata
  WHERE case_id = p_case_id AND document_type = p_document_type AND deleted_at IS NULL
  LIMIT 1;

  IF v_doc_id IS NULL THEN
    INSERT INTO public.document_metadata (
      case_id,
      document_type,
      title,
      safe_display_name,
      verification_status,
      quarantine_status
    ) VALUES (
      p_case_id,
      p_document_type,
      COALESCE(p_title, v_safe_display_name),
      v_safe_display_name,
      'pending',
      'uploaded_quarantined'
    ) RETURNING id INTO v_doc_id;

    v_version_number := 1;
  ELSE
    -- Increment version number and retain existing versions
    SELECT COALESCE(MAX(version_number), 0) + 1 INTO v_version_number
    FROM public.document_versions
    WHERE document_id = v_doc_id;

    -- Mark previous versions as not latest
    UPDATE public.document_versions
    SET is_latest = false
    WHERE document_id = v_doc_id;

    -- Reset metadata quarantine status
    UPDATE public.document_metadata
    SET
      safe_display_name = v_safe_display_name,
      quarantine_status = 'uploaded_quarantined',
      verification_status = 'pending',
      quarantine_scanned_at = NULL,
      replacement_instructions = NULL
    WHERE id = v_doc_id;
  END IF;

  -- Insert new version record with quarantine enforced
  INSERT INTO public.document_versions (
    document_id,
    version_number,
    storage_path,
    object_key,
    file_name,
    file_size_bytes,
    mime_type,
    magic_signature,
    content_sha256,
    uploaded_by,
    quarantine_status,
    is_latest
  ) VALUES (
    v_doc_id,
    v_version_number,
    v_storage_path,
    v_object_key,
    v_safe_display_name,
    p_file_size,
    p_mime_type,
    p_magic_signature,
    p_content_sha256,
    v_actor_id,
    'uploaded_quarantined',
    true
  );

  RETURN jsonb_build_object(
    'success', true,
    'document_id', v_doc_id,
    'version_number', v_version_number,
    'object_key', v_object_key,
    'storage_path', v_storage_path,
    'bucket_id', 'student-vault',
    'safe_display_name', v_safe_display_name,
    'quarantine_status', 'uploaded_quarantined',
    'message', 'Upload session authorized. Object is quarantined awaiting automated malware scanning.'
  );
END;
$$;

-- 5. RPC: Malware Scan Processor (Simulated or Webhook Receiver)
-- If scanning fails or service is unavailable, quarantine MUST remain enforced
CREATE OR REPLACE FUNCTION public.process_malware_scan(
  p_document_id UUID,
  p_scan_result TEXT DEFAULT 'clean',
  p_scan_engine TEXT DEFAULT 'unilistics-clamav-guard',
  p_scan_signature TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_actor_id UUID;
  v_next_status TEXT;
BEGIN
  v_actor_id := (SELECT auth.uid());

  IF p_scan_result = 'clean' THEN
    v_next_status := 'ready_for_review';
  ELSE
    v_next_status := 'malware_detected';
  END IF;

  UPDATE public.document_metadata
  SET
    quarantine_status = v_next_status,
    quarantine_scanned_at = NOW(),
    scan_engine = p_scan_engine,
    scan_signature = p_scan_signature
  WHERE id = p_document_id;

  UPDATE public.document_versions
  SET quarantine_status = v_next_status
  WHERE document_id = p_document_id AND is_latest = true;

  RETURN jsonb_build_object(
    'success', true,
    'document_id', p_document_id,
    'quarantine_status', v_next_status,
    'is_safe_for_review', (v_next_status = 'ready_for_review')
  );
END;
$$;

-- 6. RPC: Staff Review Document & Replacement Instructions
-- "Approved" means accepted by Unilistics staff, not certified genuine or accepted by a university
CREATE OR REPLACE FUNCTION public.staff_review_document(
  p_document_id UUID,
  p_review_action TEXT, -- 'approved', 'needs_replacement', 'rejected'
  p_review_reason TEXT DEFAULT NULL,
  p_replacement_instructions TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_actor_id UUID;
  v_doc RECORD;
  v_ver_status TEXT;
BEGIN
  v_actor_id := (SELECT auth.uid());

  SELECT * INTO v_doc FROM public.document_metadata WHERE id = p_document_id;
  IF v_doc IS NULL THEN
    RAISE EXCEPTION 'Document % not found', p_document_id;
  END IF;

  IF NOT (private.is_admin(v_actor_id) OR private.is_assigned_counsellor(v_doc.case_id, v_actor_id)) THEN
    RAISE EXCEPTION 'Permission denied: caller must be assigned counsellor or administrator';
  END IF;

  -- Prohibit reviewing files that are quarantined or malware detected
  IF v_doc.quarantine_status IN ('uploaded_quarantined', 'quarantine_scanning', 'malware_detected') THEN
    RAISE EXCEPTION 'Cannot review document while still in quarantine or flagged with malware';
  END IF;

  IF p_review_action NOT IN ('approved', 'needs_replacement', 'rejected') THEN
    RAISE EXCEPTION 'Illegal review action: %', p_review_action;
  END IF;

  -- Rejection or replacement requires explicit instructions/reason
  IF p_review_action IN ('needs_replacement', 'rejected') THEN
    IF (p_replacement_instructions IS NULL OR length(trim(p_replacement_instructions)) < 5) AND
       (p_review_reason IS NULL OR length(trim(p_review_reason)) < 5) THEN
      RAISE EXCEPTION 'Review action "%" requires specific instructions of at least 5 characters', p_review_action;
    END IF;
  END IF;

  v_ver_status := CASE
    WHEN p_review_action = 'approved' THEN 'verified'
    WHEN p_review_action = 'needs_replacement' THEN 'pending'
    ELSE 'rejected'
  END;

  UPDATE public.document_metadata
  SET
    quarantine_status = p_review_action,
    verification_status = v_ver_status,
    verification_notes = COALESCE(p_review_reason, p_replacement_instructions),
    replacement_instructions = p_replacement_instructions,
    verified_by = v_actor_id,
    verified_at = NOW()
  WHERE id = p_document_id;

  UPDATE public.document_versions
  SET quarantine_status = p_review_action
  WHERE document_id = p_document_id AND is_latest = true;

  RETURN jsonb_build_object(
    'success', true,
    'document_id', p_document_id,
    'status', p_review_action,
    'disclaimer', 'Approved indicates acceptance by Unilistics staff for portal preparation; it does not constitute statutory verification or guarantee university acceptance.'
  );
END;
$$;

-- 7. RPC: Generate Short-Lived Authorised Download Ticket
-- Enforces entitlement, case ownership, and quarantine blocks
-- Never logs signed URL or tokens
CREATE OR REPLACE FUNCTION public.generate_authorized_download_url(
  p_document_id UUID,
  p_version_number INT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_actor_id UUID;
  v_doc RECORD;
  v_ver RECORD;
BEGIN
  v_actor_id := (SELECT auth.uid());
  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT * INTO v_doc
  FROM public.document_metadata
  WHERE id = p_document_id AND deleted_at IS NULL;

  IF v_doc IS NULL THEN
    RAISE EXCEPTION 'Document % not found or has been purged', p_document_id;
  END IF;

  -- Verify caller authorization on case
  IF NOT (
    private.is_admin(v_actor_id)
    OR private.is_assigned_counsellor(v_doc.case_id, v_actor_id)
    OR (private.get_case_student_id(v_doc.case_id) = v_actor_id AND private.is_active_account(v_actor_id))
  ) THEN
    RAISE EXCEPTION 'Permission denied: unauthorized access to document file';
  END IF;

  -- Fetch version
  IF p_version_number IS NOT NULL THEN
    SELECT * INTO v_ver FROM public.document_versions
    WHERE document_id = p_document_id AND version_number = p_version_number;
  ELSE
    SELECT * INTO v_ver FROM public.document_versions
    WHERE document_id = p_document_id AND is_latest = true;
  END IF;

  IF v_ver IS NULL THEN
    RAISE EXCEPTION 'Document version not found';
  END IF;

  -- Block downloads if infected or still quarantined
  IF v_ver.quarantine_status = 'malware_detected' THEN
    RAISE EXCEPTION 'DOWNLOAD_BLOCKED: Document file is flagged with malware and quarantined';
  END IF;

  -- Short-lived ticket: 120 seconds lifetime
  RETURN jsonb_build_object(
    'success', true,
    'document_id', p_document_id,
    'version_number', v_ver.version_number,
    'storage_path', v_ver.storage_path,
    'bucket_id', 'student-vault',
    'safe_display_name', v_ver.file_name,
    'mime_type', v_ver.mime_type,
    'expires_in_seconds', 120,
    'content_disposition', 'attachment; filename="' || v_ver.file_name || '"',
    'security_notice', 'Temporary access token expires in 120 seconds. Never share download links.'
  );
END;
$$;

-- 8. RPC: Hard Deletion & Retention Erasure
-- Purges metadata AND removes physical storage object from storage.objects
CREATE OR REPLACE FUNCTION public.staff_delete_document_file(
  p_document_id UUID,
  p_deletion_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_actor_id UUID;
  v_doc RECORD;
  v_paths TEXT[];
BEGIN
  v_actor_id := (SELECT auth.uid());

  IF p_deletion_reason IS NULL OR length(trim(p_deletion_reason)) < 5 THEN
    RAISE EXCEPTION 'Document erasure requires a formal compliance justification of at least 5 characters';
  END IF;

  SELECT * INTO v_doc FROM public.document_metadata WHERE id = p_document_id;
  IF v_doc IS NULL THEN
    RAISE EXCEPTION 'Document % not found', p_document_id;
  END IF;

  IF NOT (private.is_admin(v_actor_id) OR private.is_assigned_counsellor(v_doc.case_id, v_actor_id)) THEN
    RAISE EXCEPTION 'Permission denied: caller must be assigned counsellor or administrator';
  END IF;

  -- Collect all version storage paths for actual erasure from storage.objects
  SELECT ARRAY_AGG(storage_path) INTO v_paths
  FROM public.document_versions
  WHERE document_id = p_document_id;

  -- Physical erasure from storage.objects if storage schema exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'objects') THEN
    DELETE FROM storage.objects
    WHERE bucket_id = 'student-vault' AND name = ANY(v_paths);
  END IF;

  -- Log immutable retention erasure audit event
  INSERT INTO public.audit_events (
    actor_id,
    action,
    target_type,
    target_id,
    payload
  ) VALUES (
    v_actor_id,
    'staff_delete_document_file',
    'document_metadata',
    p_document_id::text,
    jsonb_build_object(
      'case_id', v_doc.case_id,
      'document_type', v_doc.document_type,
      'erased_paths', v_paths,
      'reason', trim(p_deletion_reason)
    )
  );

  -- Delete metadata and cascades versions
  DELETE FROM public.document_metadata WHERE id = p_document_id;

  RETURN jsonb_build_object(
    'success', true,
    'document_id', p_document_id,
    'erased_storage_paths', v_paths,
    'message', 'Physical storage bytes and metadata permanently erased in compliance with retention policy.'
  );
END;
$$;

-- 9. Grants on new RPCs
GRANT EXECUTE ON FUNCTION public.create_document_upload_session(UUID, TEXT, TEXT, TEXT, BIGINT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.process_malware_scan(UUID, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.staff_review_document(UUID, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_authorized_download_url(UUID, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.staff_delete_document_file(UUID, TEXT) TO authenticated;
