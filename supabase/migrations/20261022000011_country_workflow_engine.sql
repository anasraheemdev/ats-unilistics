-- ============================================================================
-- Migration 011: Country Workflow Template Engine & Case Lifecycle Snapshots
-- Product: Unilistics (ATS for European Higher Education)
-- Scope: Germany, France, Italy, Romania (Hungary deferred)
-- Guidelines: Follows supabase and supabase-postgres-best-practices
-- Core Invariants:
--   1. Workflows are DRAFT candidate routes, not unchangeable statutes.
--   2. Academic admissions steps and visa outcomes are strictly separated.
--   3. Editing templates never silently mutates live student cases.
--   4. Dependency cycles are prevented by recursive graph validation.
--   5. Flagged claims carry explicit review provenance and source guide links.
-- ============================================================================

-- 1. Enhance Workflow Templates Table
ALTER TABLE public.workflow_templates DROP CONSTRAINT IF EXISTS uq_workflow_template;

ALTER TABLE public.workflow_templates
  ADD COLUMN IF NOT EXISTS application_route TEXT NOT NULL DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS intake_season TEXT NOT NULL DEFAULT 'any',
  ADD COLUMN IF NOT EXISTS jurisdiction TEXT NOT NULL DEFAULT 'any',
  ADD COLUMN IF NOT EXISTS publication_status TEXT NOT NULL DEFAULT 'draft' CHECK (publication_status IN ('draft', 'review', 'published', 'archived')),
  ADD COLUMN IF NOT EXISTS review_status TEXT NOT NULL DEFAULT 'unreviewed' CHECK (review_status IN ('unreviewed', 'in_review', 'staff_verified', 'deprecated')),
  ADD COLUMN IF NOT EXISTS source_file TEXT,
  ADD COLUMN IF NOT EXISTS source_section TEXT,
  ADD COLUMN IF NOT EXISTS provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE UNIQUE INDEX IF NOT EXISTS uq_workflow_template_route
  ON public.workflow_templates (country_code, degree_level, application_route, jurisdiction);

CREATE INDEX IF NOT EXISTS idx_workflow_templates_country_pub
  ON public.workflow_templates(country_code, publication_status);

-- 2. Enhance Workflow Versions Table
ALTER TABLE public.workflow_versions
  ADD COLUMN IF NOT EXISTS publication_status TEXT NOT NULL DEFAULT 'draft' CHECK (publication_status IN ('draft', 'review', 'published', 'archived')),
  ADD COLUMN IF NOT EXISTS change_summary TEXT,
  ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

-- 3. Enhance Workflow Steps Table
ALTER TABLE public.workflow_steps
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS responsible_actor TEXT NOT NULL DEFAULT 'student' CHECK (responsible_actor IN ('student', 'counsellor', 'agency', 'external_authority')),
  ADD COLUMN IF NOT EXISTS applicability JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS required_evidence TEXT[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS is_parallel BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS verification_flags TEXT[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS source_file TEXT,
  ADD COLUMN IF NOT EXISTS source_section TEXT,
  ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'student_and_staff' CHECK (visibility IN ('student_and_staff', 'staff_only')),
  ADD COLUMN IF NOT EXISTS target_outcome_type TEXT NOT NULL DEFAULT 'academic_admission' CHECK (target_outcome_type IN ('academic_admission', 'visa_processing', 'scholarship', 'attestation'));

-- 4. Cycle Detection in Workflow Step Dependencies
CREATE OR REPLACE FUNCTION private.detect_workflow_cycle(p_version_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_has_cycle BOOLEAN := false;
BEGIN
  WITH RECURSIVE dep_graph AS (
    SELECT
      wd.step_id,
      wd.depends_on_step_id,
      ARRAY[wd.step_id, wd.depends_on_step_id] AS path,
      false AS cycle
    FROM public.workflow_dependencies wd
    JOIN public.workflow_steps ws ON ws.id = wd.step_id
    WHERE ws.version_id = p_version_id

    UNION ALL

    SELECT
      dg.step_id,
      wd.depends_on_step_id,
      dg.path || wd.depends_on_step_id,
      wd.depends_on_step_id = ANY(dg.path)
    FROM dep_graph dg
    JOIN public.workflow_dependencies wd ON wd.step_id = dg.depends_on_step_id
    WHERE NOT dg.cycle
  )
  SELECT EXISTS (
    SELECT 1 FROM dep_graph WHERE cycle = true
  ) INTO v_has_cycle;

  RETURN v_has_cycle;
END;
$$;

-- Trigger to reject circular dependencies on insert
CREATE OR REPLACE FUNCTION private.trg_check_dependency_cycle()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_version_id UUID;
BEGIN
  SELECT version_id INTO v_version_id
  FROM public.workflow_steps
  WHERE id = NEW.step_id;

  IF NEW.step_id = NEW.depends_on_step_id THEN
    RAISE EXCEPTION 'Self-dependency detected: Step cannot depend on itself (step_id: %)', NEW.step_id;
  END IF;

  IF private.detect_workflow_cycle(v_version_id) THEN
    RAISE EXCEPTION 'Circular dependency detected in workflow version %. Insertion rejected.', v_version_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_workflow_dependency_cycle ON public.workflow_dependencies;
CREATE TRIGGER trg_workflow_dependency_cycle
  AFTER INSERT OR UPDATE ON public.workflow_dependencies
  FOR EACH ROW
  EXECUTE FUNCTION private.trg_check_dependency_cycle();

-- 5. Case / Application Workflow Execution Instances (Snapshotted State)
CREATE TABLE IF NOT EXISTS public.case_workflow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.student_cases(id) ON DELETE CASCADE,
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
  template_version_id UUID NOT NULL REFERENCES public.workflow_versions(id) ON DELETE RESTRICT,
  step_id UUID NOT NULL REFERENCES public.workflow_steps(id) ON DELETE RESTRICT,
  step_key TEXT NOT NULL,
  title TEXT NOT NULL,
  stage TEXT NOT NULL CHECK (stage IN ('onboarding', 'attestation', 'dossier_assembly', 'submission', 'decision', 'visa_prep', 'relocation')),
  responsible_actor TEXT NOT NULL CHECK (responsible_actor IN ('student', 'counsellor', 'agency', 'external_authority')),
  status TEXT NOT NULL DEFAULT 'needs_action' CHECK (status IN ('not_applicable', 'blocked', 'needs_action', 'in_progress', 'completed', 'reopened')),
  not_applicable_reason TEXT,
  reopened_reason TEXT,
  due_date DATE,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reopened_at TIMESTAMPTZ,
  reopened_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  evidence_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_parallel BOOLEAN NOT NULL DEFAULT false,
  target_outcome_type TEXT NOT NULL DEFAULT 'academic_admission' CHECK (target_outcome_type IN ('academic_admission', 'visa_processing', 'scholarship', 'attestation')),
  visibility TEXT NOT NULL DEFAULT 'student_and_staff' CHECK (visibility IN ('student_and_staff', 'staff_only')),
  sort_order INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_case_workflow_step UNIQUE (case_id, application_id, step_id)
);

CREATE INDEX IF NOT EXISTS idx_case_workflow_steps_case ON public.case_workflow_steps(case_id, status);
CREATE INDEX IF NOT EXISTS idx_case_workflow_steps_app ON public.case_workflow_steps(application_id, status);
CREATE INDEX IF NOT EXISTS idx_case_workflow_steps_stage ON public.case_workflow_steps(stage, status);

ALTER TABLE public.case_workflow_steps ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for Workflow Schema and Instances
-- Drop legacy permissive policies from migration 002
DROP POLICY IF EXISTS "workflows_select_active" ON public.workflow_templates;
DROP POLICY IF EXISTS "workflows_write_staff" ON public.workflow_templates;
DROP POLICY IF EXISTS "workflow_versions_select_active" ON public.workflow_versions;
DROP POLICY IF EXISTS "workflow_versions_write_staff" ON public.workflow_versions;
DROP POLICY IF EXISTS "workflow_steps_select_active" ON public.workflow_steps;
DROP POLICY IF EXISTS "workflow_steps_write_staff" ON public.workflow_steps;
DROP POLICY IF EXISTS "workflow_deps_select_active" ON public.workflow_dependencies;
DROP POLICY IF EXISTS "workflow_deps_write_staff" ON public.workflow_dependencies;

-- Platform administrators have full control over workflow templates & versions
DROP POLICY IF EXISTS "workflow_templates_select_staff" ON public.workflow_templates;
CREATE POLICY "workflow_templates_select_staff" ON public.workflow_templates
  FOR SELECT TO authenticated
  USING (private.is_staff((SELECT auth.uid())));

DROP POLICY IF EXISTS "workflow_templates_write_admin" ON public.workflow_templates;
CREATE POLICY "workflow_templates_write_admin" ON public.workflow_templates
  FOR ALL TO authenticated
  USING (private.is_admin((SELECT auth.uid())))
  WITH CHECK (private.is_admin((SELECT auth.uid())));

DROP POLICY IF EXISTS "workflow_versions_select_staff" ON public.workflow_versions;
CREATE POLICY "workflow_versions_select_staff" ON public.workflow_versions
  FOR SELECT TO authenticated
  USING (private.is_staff((SELECT auth.uid())));

DROP POLICY IF EXISTS "workflow_versions_write_admin" ON public.workflow_versions;
CREATE POLICY "workflow_versions_write_admin" ON public.workflow_versions
  FOR ALL TO authenticated
  USING (private.is_admin((SELECT auth.uid())))
  WITH CHECK (private.is_admin((SELECT auth.uid())));

DROP POLICY IF EXISTS "workflow_steps_select_staff" ON public.workflow_steps;
CREATE POLICY "workflow_steps_select_staff" ON public.workflow_steps
  FOR SELECT TO authenticated
  USING (private.is_staff((SELECT auth.uid())));

DROP POLICY IF EXISTS "workflow_steps_write_admin" ON public.workflow_steps;
CREATE POLICY "workflow_steps_write_admin" ON public.workflow_steps
  FOR ALL TO authenticated
  USING (private.is_admin((SELECT auth.uid())))
  WITH CHECK (private.is_admin((SELECT auth.uid())));

DROP POLICY IF EXISTS "workflow_dependencies_select_staff" ON public.workflow_dependencies;
CREATE POLICY "workflow_dependencies_select_staff" ON public.workflow_dependencies
  FOR SELECT TO authenticated
  USING (private.is_staff((SELECT auth.uid())));

DROP POLICY IF EXISTS "workflow_dependencies_write_admin" ON public.workflow_dependencies;
CREATE POLICY "workflow_dependencies_write_admin" ON public.workflow_dependencies
  FOR ALL TO authenticated
  USING (private.is_admin((SELECT auth.uid())))
  WITH CHECK (private.is_admin((SELECT auth.uid())));

-- Case Workflow Step Instances Policies
DROP POLICY IF EXISTS "case_workflow_steps_select_student" ON public.case_workflow_steps;
DROP POLICY IF EXISTS "case_workflow_steps_select_staff" ON public.case_workflow_steps;
DROP POLICY IF EXISTS "case_workflow_steps_update_staff" ON public.case_workflow_steps;
-- Students can view their own case steps that are marked student_and_staff
CREATE POLICY "case_workflow_steps_select_student" ON public.case_workflow_steps
  FOR SELECT TO authenticated
  USING (
    visibility = 'student_and_staff'
    AND EXISTS (
      SELECT 1 FROM public.student_cases sc
      WHERE sc.id = case_id AND sc.student_id = (SELECT auth.uid())
    )
  );

-- Counsellors can view & update steps for cases assigned to them
CREATE POLICY "case_workflow_steps_select_staff" ON public.case_workflow_steps
  FOR SELECT TO authenticated
  USING (
    private.is_admin((SELECT auth.uid()))
    OR EXISTS (
      SELECT 1 FROM public.case_assignments ca
      WHERE ca.case_id = case_id AND ca.counsellor_id = (SELECT auth.uid()) AND ca.is_active = true
    )
  );

CREATE POLICY "case_workflow_steps_update_staff" ON public.case_workflow_steps
  FOR UPDATE TO authenticated
  USING (
    private.is_admin((SELECT auth.uid()))
    OR EXISTS (
      SELECT 1 FROM public.case_assignments ca
      WHERE ca.case_id = case_id AND ca.counsellor_id = (SELECT auth.uid()) AND ca.is_active = true
    )
  )
  WITH CHECK (
    private.is_admin((SELECT auth.uid()))
    OR EXISTS (
      SELECT 1 FROM public.case_assignments ca
      WHERE ca.case_id = case_id AND ca.counsellor_id = (SELECT auth.uid()) AND ca.is_active = true
    )
  );

-- 7. Privileged RPC: Snapshot & Instantiate Case Workflow (Safe Isolation)
CREATE OR REPLACE FUNCTION public.admin_instantiate_case_workflow(
  p_case_id UUID,
  p_application_id UUID,
  p_template_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_actor_id UUID;
  v_version_id UUID;
  v_step RECORD;
  v_count INTEGER := 0;
BEGIN
  v_actor_id := (SELECT auth.uid());

  IF NOT (private.is_staff(v_actor_id)) THEN
    RAISE EXCEPTION 'Permission denied: only staff can instantiate case workflows.';
  END IF;

  -- 1. Find latest active version of template (or check if already a version_id)
  SELECT id INTO v_version_id
  FROM public.workflow_versions
  WHERE template_id = p_template_id
  ORDER BY version_number DESC
  LIMIT 1;

  IF v_version_id IS NULL THEN
    SELECT id INTO v_version_id
    FROM public.workflow_versions
    WHERE id = p_template_id;
  END IF;

  IF v_version_id IS NULL THEN
    RAISE EXCEPTION 'Workflow template or version % has no valid versions', p_template_id;
  END IF;

  -- 2. Snapshot steps into case_workflow_steps
  FOR v_step IN (
    SELECT
      id AS step_id,
      step_key,
      title,
      stage,
      responsible_actor,
      required_evidence,
      is_parallel,
      target_outcome_type,
      visibility,
      sort_order
    FROM public.workflow_steps
    WHERE version_id = v_version_id
    ORDER BY sort_order ASC
  ) LOOP
    INSERT INTO public.case_workflow_steps (
      case_id,
      application_id,
      template_version_id,
      step_id,
      step_key,
      title,
      stage,
      responsible_actor,
      status,
      is_parallel,
      target_outcome_type,
      visibility,
      sort_order
    ) VALUES (
      p_case_id,
      p_application_id,
      v_version_id,
      v_step.step_id,
      v_step.step_key,
      v_step.title,
      v_step.stage,
      v_step.responsible_actor,
      'needs_action',
      v_step.is_parallel,
      v_step.target_outcome_type,
      v_step.visibility,
      v_step.sort_order
    )
    ON CONFLICT (case_id, application_id, step_id) DO NOTHING;

    v_count := v_count + 1;
  END LOOP;

  -- Audit log
  INSERT INTO public.audit_events (
    actor_id,
    action,
    target_type,
    target_id,
    payload
  ) VALUES (
    v_actor_id,
    'workflow_instantiated',
    'student_cases',
    p_case_id::text,
    jsonb_build_object(
      'application_id', p_application_id,
      'template_id', p_template_id,
      'version_id', v_version_id,
      'steps_instantiated', v_count
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'version_id', v_version_id,
    'steps_count', v_count
  );
END;
$$;

-- 8. Privileged RPC: Preview Workflow Migration (Diff without silent mutation)
CREATE OR REPLACE FUNCTION public.admin_preview_workflow_migration(
  p_case_id UUID,
  p_application_id UUID,
  p_new_version_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_actor_id UUID;
  v_existing_steps JSONB;
  v_new_steps JSONB;
  v_added_steps JSONB := '[]'::jsonb;
  v_removed_steps JSONB := '[]'::jsonb;
  v_completed_preserved JSONB := '[]'::jsonb;
  v_rec RECORD;
BEGIN
  v_actor_id := (SELECT auth.uid());
  IF NOT private.is_staff(v_actor_id) THEN
    RAISE EXCEPTION 'Permission denied: only staff can preview workflow migrations';
  END IF;

  -- Collect existing live steps
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'step_key', cws.step_key,
      'title', cws.title,
      'status', cws.status,
      'stage', cws.stage
    )
  ), '[]'::jsonb) INTO v_existing_steps
  FROM public.case_workflow_steps cws
  WHERE cws.case_id = p_case_id
    AND ((p_application_id IS NULL AND cws.application_id IS NULL) OR cws.application_id = p_application_id);

  -- Collect new target version steps
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'step_key', ws.step_key,
      'title', ws.title,
      'stage', ws.stage
    )
  ), '[]'::jsonb) INTO v_new_steps
  FROM public.workflow_steps ws
  WHERE ws.version_id = p_new_version_id;

  -- Detect steps to add (present in new version, not in live case)
  FOR v_rec IN (
    SELECT ws.step_key, ws.title, ws.stage
    FROM public.workflow_steps ws
    WHERE ws.version_id = p_new_version_id
      AND ws.step_key NOT IN (
        SELECT cws.step_key FROM public.case_workflow_steps cws
        WHERE cws.case_id = p_case_id
          AND ((p_application_id IS NULL AND cws.application_id IS NULL) OR cws.application_id = p_application_id)
      )
  ) LOOP
    v_added_steps := v_added_steps || jsonb_build_object('step_key', v_rec.step_key, 'title', v_rec.title, 'stage', v_rec.stage);
  END LOOP;

  -- Detect steps that would be retired/removed
  FOR v_rec IN (
    SELECT cws.step_key, cws.title, cws.status
    FROM public.case_workflow_steps cws
    WHERE cws.case_id = p_case_id
      AND ((p_application_id IS NULL AND cws.application_id IS NULL) OR cws.application_id = p_application_id)
      AND cws.step_key NOT IN (
        SELECT ws.step_key FROM public.workflow_steps ws
        WHERE ws.version_id = p_new_version_id
      )
  ) LOOP
    v_removed_steps := v_removed_steps || jsonb_build_object('step_key', v_rec.step_key, 'title', v_rec.title, 'status', v_rec.status);
  END LOOP;

  -- Completed steps preserved
  FOR v_rec IN (
    SELECT cws.step_key, cws.title, cws.completed_at
    FROM public.case_workflow_steps cws
    WHERE cws.case_id = p_case_id
      AND ((p_application_id IS NULL AND cws.application_id IS NULL) OR cws.application_id = p_application_id)
      AND cws.status = 'completed'
  ) LOOP
    v_completed_preserved := v_completed_preserved || jsonb_build_object('step_key', v_rec.step_key, 'title', v_rec.title);
  END LOOP;

  RETURN jsonb_build_object(
    'target_version_id', p_new_version_id,
    'case_id', p_case_id,
    'application_id', p_application_id,
    'added_steps', v_added_steps,
    'removed_steps', v_removed_steps,
    'completed_preserved', v_completed_preserved
  );
END;
$$;

-- 9. Privileged RPC: Apply Workflow Migration with Audit Log
CREATE OR REPLACE FUNCTION public.admin_apply_workflow_migration(
  p_case_id UUID,
  p_application_id UUID,
  p_new_version_id UUID,
  p_migration_notes TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_actor_id UUID;
  v_step RECORD;
  v_added_count INTEGER := 0;
BEGIN
  v_actor_id := (SELECT auth.uid());
  IF NOT private.is_admin(v_actor_id) THEN
    RAISE EXCEPTION 'Permission denied: only platform administrators can execute case workflow migrations';
  END IF;

  -- Add new steps without destroying existing completed progress
  FOR v_step IN (
    SELECT
      id AS step_id,
      step_key,
      title,
      stage,
      responsible_actor,
      required_evidence,
      is_parallel,
      target_outcome_type,
      visibility,
      sort_order
    FROM public.workflow_steps
    WHERE version_id = p_new_version_id
      AND step_key NOT IN (
        SELECT cws.step_key FROM public.case_workflow_steps cws
        WHERE cws.case_id = p_case_id
          AND ((p_application_id IS NULL AND cws.application_id IS NULL) OR cws.application_id = p_application_id)
      )
  ) LOOP
    INSERT INTO public.case_workflow_steps (
      case_id,
      application_id,
      template_version_id,
      step_id,
      step_key,
      title,
      stage,
      responsible_actor,
      status,
      is_parallel,
      target_outcome_type,
      visibility,
      sort_order
    ) VALUES (
      p_case_id,
      p_application_id,
      p_new_version_id,
      v_step.step_id,
      v_step.step_key,
      v_step.title,
      v_step.stage,
      v_step.responsible_actor,
      'needs_action',
      v_step.is_parallel,
      v_step.target_outcome_type,
      v_step.visibility,
      v_step.sort_order
    );
    v_added_count := v_added_count + 1;
  END LOOP;

  -- Retire obsolete uncompleted steps that no longer exist in the target version
  UPDATE public.case_workflow_steps
  SET status = 'not_applicable',
      not_applicable_reason = 'Archived during template version upgrade: ' || COALESCE(p_migration_notes, 'Template upgraded to version ' || p_new_version_id::text),
      updated_at = NOW()
  WHERE case_id = p_case_id
    AND ((p_application_id IS NULL AND application_id IS NULL) OR application_id = p_application_id)
    AND status != 'completed'
    AND NOT EXISTS (
      SELECT 1 FROM public.workflow_steps ws
      WHERE ws.version_id = p_new_version_id AND ws.step_key = case_workflow_steps.step_key
    );

  -- Audit log the migration
  INSERT INTO public.audit_events (
    actor_id,
    action,
    target_type,
    target_id,
    payload
  ) VALUES (
    v_actor_id,
    'case_workflow_migration_applied',
    'student_cases',
    p_case_id::text,
    jsonb_build_object(
      'application_id', p_application_id,
      'new_version_id', p_new_version_id,
      'added_count', v_added_count,
      'migration_notes', p_migration_notes
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'case_id', p_case_id,
    'new_version_id', p_new_version_id,
    'added_steps_count', v_added_count
  );
END;
$$;

-- 10. Privileged RPC: Step Execution State Transition (not_applicable with reason, reopened with reason, completed)
CREATE OR REPLACE FUNCTION public.staff_transition_workflow_step_status(
  p_step_instance_id UUID,
  p_new_status TEXT,
  p_reason TEXT DEFAULT NULL,
  p_evidence_metadata JSONB DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_actor_id UUID;
  v_step RECORD;
  v_has_access BOOLEAN := false;
BEGIN
  v_actor_id := (SELECT auth.uid());

  IF p_new_status NOT IN ('not_applicable', 'blocked', 'needs_action', 'in_progress', 'completed', 'reopened') THEN
    RAISE EXCEPTION 'Invalid status: %', p_new_status;
  END IF;

  SELECT * INTO v_step
  FROM public.case_workflow_steps
  WHERE id = p_step_instance_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Workflow step instance % not found', p_step_instance_id;
  END IF;

  -- Verify actor is assigned counsellor or admin
  IF private.is_admin(v_actor_id) THEN
    v_has_access := true;
  ELSIF EXISTS (
    SELECT 1 FROM public.case_assignments ca
    WHERE ca.case_id = v_step.case_id AND ca.counsellor_id = v_actor_id AND ca.is_active = true
  ) THEN
    v_has_access := true;
  END IF;

  IF NOT v_has_access THEN
    RAISE EXCEPTION 'Permission denied: only assigned counsellors or administrators can transition workflow step status.';
  END IF;

  IF p_new_status = 'not_applicable' AND (p_reason IS NULL OR LENGTH(TRIM(p_reason)) < 5) THEN
    RAISE EXCEPTION 'Recorded reason (at least 5 characters) is required when marking a step Not Applicable.';
  END IF;

  IF p_new_status = 'reopened' AND (p_reason IS NULL OR LENGTH(TRIM(p_reason)) < 5) THEN
    RAISE EXCEPTION 'Recorded reason (at least 5 characters) is required when reopening a step.';
  END IF;

  UPDATE public.case_workflow_steps
  SET
    status = p_new_status,
    not_applicable_reason = CASE WHEN p_new_status = 'not_applicable' THEN p_reason ELSE not_applicable_reason END,
    reopened_reason = CASE WHEN p_new_status = 'reopened' THEN p_reason ELSE reopened_reason END,
    completed_at = CASE WHEN p_new_status = 'completed' THEN NOW() ELSE completed_at END,
    completed_by = CASE WHEN p_new_status = 'completed' THEN v_actor_id ELSE completed_by END,
    reopened_at = CASE WHEN p_new_status = 'reopened' THEN NOW() ELSE reopened_at END,
    reopened_by = CASE WHEN p_new_status = 'reopened' THEN v_actor_id ELSE reopened_by END,
    evidence_metadata = COALESCE(p_evidence_metadata, evidence_metadata),
    updated_at = NOW()
  WHERE id = p_step_instance_id;

  -- Audit log
  INSERT INTO public.audit_events (
    actor_id,
    action,
    target_type,
    target_id,
    payload
  ) VALUES (
    v_actor_id,
    'workflow_step_status_transition',
    'case_workflow_steps',
    p_step_instance_id::text,
    jsonb_build_object(
      'old_status', v_step.status,
      'new_status', p_new_status,
      'reason', p_reason
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'step_instance_id', p_step_instance_id,
    'new_status', p_new_status
  );
END;
$$;

-- Grants on new functions
GRANT EXECUTE ON FUNCTION public.admin_instantiate_case_workflow TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_preview_workflow_migration TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_apply_workflow_migration TO authenticated;
GRANT EXECUTE ON FUNCTION public.staff_transition_workflow_step_status TO authenticated;

-- Explicit table grants for authenticated role governed by RLS
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workflow_templates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workflow_versions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workflow_steps TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workflow_dependencies TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.case_workflow_steps TO authenticated;

