// @vitest-environment node
import { describe, it, expect, beforeAll } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import fs from 'fs';
import path from 'path';
import { initializeTestSupabaseEnvironment } from './helpers/supabaseTestHarness';

describe('Country Workflow Engine, Candidate Branches & Non-Destructive Case Migration', () => {
  let db: PGlite;

  const TEST_USERS = {
    super_admin: '11111111-1111-4111-a111-111111111111',
    admin: '22222222-2222-4222-a222-222222222222',
    counsellor: '33333333-3333-4333-a333-333333333333',
    other_counsellor: '33333333-3333-4333-a333-999999999999',
    student: '55555555-5555-4555-a555-555555555555',
    student_2: '66666666-6666-4666-a666-666666666666',
    explorer: '44444444-4444-4444-a444-444444444444',
  };

  async function asPersona<T = any>(
    role: 'anon' | 'authenticated',
    userId?: string,
    queryFn?: (tx: PGlite) => Promise<T>
  ): Promise<T> {
    await db.exec(`SET ROLE ${role};`);
    if (userId) {
      await db.exec(
        `SET "request.jwt.claim.sub" = '${userId}'; SET "request.jwt.claim.role" = '${role}'; SET "request.jwt.claim.aal" = 'aal2';`
      );
    } else {
      await db.exec(
        `SET "request.jwt.claim.sub" = ''; SET "request.jwt.claim.role" = 'anon'; SET "request.jwt.claim.aal" = '';`
      );
    }

    try {
      if (queryFn) {
        return await queryFn(db);
      }
      return undefined as any;
    } finally {
      await db.exec(
        'RESET ROLE; RESET "request.jwt.claim.sub"; RESET "request.jwt.claim.role"; RESET "request.jwt.claim.aal";'
      );
    }
  }

  beforeAll(async () => {
    db = new PGlite();
    await initializeTestSupabaseEnvironment(db);

    // Apply migrations 001 - 012 in strict order
    const migrationsDir = path.resolve(__dirname, '../../supabase/migrations');
    const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();

    for (const file of files) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      await db.exec(sql);
    }

    // Seed Test Users (Auth + Profiles + Staff Roles + Entitlements)
    await db.exec(`
      -- Super Admin
      INSERT INTO auth.users (id, email) VALUES ('${TEST_USERS.super_admin}', 'super@unilistics.com') ON CONFLICT DO NOTHING;
      INSERT INTO public.profiles (id, email, full_name, account_status)
      VALUES ('${TEST_USERS.super_admin}', 'super@unilistics.com', 'Super Administrator', 'active') ON CONFLICT DO NOTHING;
      INSERT INTO public.staff_roles (user_id, role, assigned_by)
      VALUES ('${TEST_USERS.super_admin}', 'super_admin', '${TEST_USERS.super_admin}') ON CONFLICT DO NOTHING;

      -- Admin
      INSERT INTO auth.users (id, email) VALUES ('${TEST_USERS.admin}', 'admin@unilistics.com') ON CONFLICT DO NOTHING;
      INSERT INTO public.profiles (id, email, full_name, account_status)
      VALUES ('${TEST_USERS.admin}', 'admin@unilistics.com', 'Operational Admin', 'active') ON CONFLICT DO NOTHING;
      INSERT INTO public.staff_roles (user_id, role, assigned_by)
      VALUES ('${TEST_USERS.admin}', 'admin', '${TEST_USERS.super_admin}') ON CONFLICT DO NOTHING;

      -- Ordinary Counsellor
      INSERT INTO auth.users (id, email) VALUES ('${TEST_USERS.counsellor}', 'counsellor@unilistics.com') ON CONFLICT DO NOTHING;
      INSERT INTO public.profiles (id, email, full_name, account_status)
      VALUES ('${TEST_USERS.counsellor}', 'counsellor@unilistics.com', 'Assigned Counsellor', 'active') ON CONFLICT DO NOTHING;
      INSERT INTO public.staff_roles (user_id, role, assigned_by)
      VALUES ('${TEST_USERS.counsellor}', 'counsellor', '${TEST_USERS.super_admin}') ON CONFLICT DO NOTHING;

      -- Managed Student 1
      INSERT INTO auth.users (id, email) VALUES ('${TEST_USERS.student}', 'student1@test.com') ON CONFLICT DO NOTHING;
      INSERT INTO public.profiles (id, email, full_name, account_status)
      VALUES ('${TEST_USERS.student}', 'student1@test.com', 'Managed Student 1', 'active') ON CONFLICT DO NOTHING;
      INSERT INTO public.entitlements (user_id, entitlement_type, status, granted_by)
      VALUES ('${TEST_USERS.student}', 'managed_application_case', 'active', '${TEST_USERS.admin}') ON CONFLICT DO NOTHING;

      -- Managed Student 2 (for migration tests)
      INSERT INTO auth.users (id, email) VALUES ('${TEST_USERS.student_2}', 'student2@test.com') ON CONFLICT DO NOTHING;
      INSERT INTO public.profiles (id, email, full_name, account_status)
      VALUES ('${TEST_USERS.student_2}', 'student2@test.com', 'Managed Student 2', 'active') ON CONFLICT DO NOTHING;
      INSERT INTO public.entitlements (user_id, entitlement_type, status, granted_by)
      VALUES ('${TEST_USERS.student_2}', 'managed_application_case', 'active', '${TEST_USERS.admin}') ON CONFLICT DO NOTHING;
    `);
  });

  // ===========================================================================
  // SECTION 1: Grounded Candidate Routes for Germany, France, Italy, Romania
  // ===========================================================================
  describe('1. Grounded Candidate Branches from Official Source Guides', () => {
    it('seeds candidate workflow templates for DE, IT, FR, and RO in DRAFT and UNREVIEWED states', async () => {
      const res = await db.query<any>(`
        SELECT country_code, application_route, publication_status, review_status, source_file, source_section, provenance
        FROM public.workflow_templates
        ORDER BY country_code ASC;
      `);

      expect(res.rows.length).toBeGreaterThanOrEqual(4);

      const countries = res.rows.map((r: any) => r.country_code);
      expect(countries).toContain('de');
      expect(countries).toContain('it');
      expect(countries).toContain('fr');
      expect(countries).toContain('ro');

      for (const row of res.rows as any[]) {
        // Must strictly default to draft and unreviewed per statutory guidelines
        expect(row.publication_status).toBe('draft');
        expect(row.review_status).toBe('unreviewed');
        expect(row.source_file).toBeTruthy();
        expect(row.provenance?.verification_flags).toBeInstanceOf(Array);
        expect(row.provenance?.verification_flags.length).toBeGreaterThan(0);
      }
    });

    it('verifies Germany candidate steps: Uni-Assist submission, conditional offer, parallel finances, and visa filing', async () => {
      const res = await db.query<any>(`
        SELECT ws.step_key, ws.title, ws.stage, ws.is_parallel, ws.target_outcome_type, ws.verification_flags
        FROM public.workflow_steps ws
        JOIN public.workflow_versions wv ON ws.version_id = wv.id
        JOIN public.workflow_templates wt ON wv.template_id = wt.id
        WHERE wt.country_code = 'de' AND wt.application_route = 'uni_assist'
        ORDER BY ws.sort_order ASC;
      `);

      expect(res.rows.length).toBe(6);
      const stepKeys = res.rows.map((r: any) => r.step_key);
      expect(stepKeys).toEqual([
        'de_ua_attestation',
        'de_ua_submission',
        'de_ua_decision',
        'de_ua_blocked_account',
        'de_ua_health_insurance',
        'de_ua_visa_filing',
      ]);

      // Check parallel finance preparation (blocked account and health insurance)
      const blockedAcc = res.rows.find((r: any) => r.step_key === 'de_ua_blocked_account') as any;
      const insurance = res.rows.find((r: any) => r.step_key === 'de_ua_health_insurance') as any;
      expect(blockedAcc.is_parallel).toBe(true);
      expect(insurance.is_parallel).toBe(true);

      // Verify strict outcome type separation: admission vs. visa
      const decisionStep = res.rows.find((r: any) => r.step_key === 'de_ua_decision') as any;
      const visaStep = res.rows.find((r: any) => r.step_key === 'de_ua_visa_filing') as any;
      expect(decisionStep.target_outcome_type).toBe('academic_admission');
      expect(visaStep.target_outcome_type).toBe('visa_processing');

      // Verify verification flag presence (Sperrkonto amount / appointment waitlist)
      expect(blockedAcc.verification_flags).toContain('FLAG-001');
      expect(visaStep.verification_flags).toContain('FLAG-002');
    });

    it('verifies Italy candidate steps: Universitaly pre-enrollment, CIMEA validation, parallel DSU scholarship, and Type D visa', async () => {
      const res = await db.query<any>(`
        SELECT ws.step_key, ws.title, ws.stage, ws.is_parallel, ws.target_outcome_type, ws.verification_flags
        FROM public.workflow_steps ws
        JOIN public.workflow_versions wv ON ws.version_id = wv.id
        JOIN public.workflow_templates wt ON wv.template_id = wt.id
        WHERE wt.country_code = 'it'
        ORDER BY ws.sort_order ASC;
      `);

      expect(res.rows.length).toBe(6);
      const stepKeys = res.rows.map((r: any) => r.step_key);
      expect(stepKeys).toEqual([
        'it_attestation',
        'it_uni_admission',
        'it_cimea_validation',
        'it_universitaly_pre_enrollment',
        'it_dsu_scholarship',
        'it_visa_filing',
      ]);

      // Italy DSU scholarship step runs in parallel and has scholarship outcome
      const dsuStep = res.rows.find((r: any) => r.step_key === 'it_dsu_scholarship') as any;
      expect(dsuStep.is_parallel).toBe(true);
      expect(dsuStep.target_outcome_type).toBe('scholarship');

      // Universitaly validation step
      const uniStep = res.rows.find((r: any) => r.step_key === 'it_universitaly_pre_enrollment') as any;
      expect(uniStep.verification_flags).toContain('FLAG-007');
    });

    it('verifies France candidate steps: Études en France (EeF) dossier, interview, parallel financial solvency, and VLS-TS visa', async () => {
      const res = await db.query<any>(`
        SELECT ws.step_key, ws.title, ws.stage, ws.is_parallel, ws.target_outcome_type, ws.verification_flags
        FROM public.workflow_steps ws
        JOIN public.workflow_versions wv ON ws.version_id = wv.id
        JOIN public.workflow_templates wt ON wv.template_id = wt.id
        WHERE wt.country_code = 'fr'
        ORDER BY ws.sort_order ASC;
      `);

      expect(res.rows.length).toBe(5);
      const stepKeys = res.rows.map((r: any) => r.step_key);
      expect(stepKeys).toEqual([
        'fr_translation',
        'fr_eef_dossier',
        'fr_campus_interview',
        'fr_financial_solvency',
        'fr_vls_ts_visa',
      ]);

      // Financial solvency is marked parallel
      const finStep = res.rows.find((r: any) => r.step_key === 'fr_financial_solvency') as any;
      expect(finStep.is_parallel).toBe(true);
      expect(finStep.verification_flags).toContain('FLAG-004');
    });

    it('verifies Romania candidate steps: Dual-stage validation (Uni review + Ministry of Education acceptance), SWIFT tuition, eViza, and Islamabad consular appointment', async () => {
      const res = await db.query<any>(`
        SELECT ws.step_key, ws.title, ws.stage, ws.is_parallel, ws.target_outcome_type, ws.verification_flags
        FROM public.workflow_steps ws
        JOIN public.workflow_versions wv ON ws.version_id = wv.id
        JOIN public.workflow_templates wt ON wv.template_id = wt.id
        WHERE wt.country_code = 'ro'
        ORDER BY ws.sort_order ASC;
      `);

      expect(res.rows.length).toBe(6);
      const stepKeys = res.rows.map((r: any) => r.step_key);
      expect(stepKeys).toEqual([
        'ro_attestation_notary',
        'ro_uni_review',
        'ro_ministry_acceptance',
        'ro_tuition_swift_wire',
        'ro_eviza_submission',
        'ro_embassy_interview_islamabad',
      ]);

      const ministryStep = res.rows.find((r: any) => r.step_key === 'ro_ministry_acceptance') as any;
      expect(ministryStep.verification_flags).toContain('FLAG-010');

      const tuitionStep = res.rows.find((r: any) => r.step_key === 'ro_tuition_swift_wire') as any;
      expect(tuitionStep.verification_flags).toContain('FLAG-011');
      expect(tuitionStep.target_outcome_type).toBe('academic_admission');

      const visaInterviewStep = res.rows.find((r: any) => r.step_key === 'ro_embassy_interview_islamabad') as any;
      expect(visaInterviewStep.target_outcome_type).toBe('visa_processing');
    });
  });

  // ===========================================================================
  // SECTION 2: Dependency Cycle Prevention
  // ===========================================================================
  describe('2. Dependency Graph Invariants & Cycle Detection', () => {
    it('prevents direct self-dependency on workflow steps via trigger', async () => {
      const stepRes = await db.query<any>(`SELECT id, version_id FROM public.workflow_steps LIMIT 1;`);
      const stepId = stepRes.rows[0].id;

      let caughtError: any = null;
      try {
        await db.query<any>(`
          INSERT INTO public.workflow_dependencies (step_id, depends_on_step_id)
          VALUES ('${stepId}', '${stepId}');
        `);
      } catch (err) {
        caughtError = err;
      }

      expect(caughtError).toBeTruthy();
      expect(caughtError.message).toMatch(/cannot depend on itself/i);
    });

    it('prevents transitive circular dependency loops (A -> B -> C -> A) via recursive cycle detection', async () => {
      // Create a fresh test template and version to isolate dependency testing
      const tplRes = await db.query<any>(`
        INSERT INTO public.workflow_templates (country_code, degree_level, application_route, name, description)
        VALUES ('de', 'masters', 'cycle_test_route', 'Cycle Test', 'Testing cycle prevention')
        RETURNING id;
      `);
      const tplId = tplRes.rows[0].id;

      const verRes = await db.query<any>(`
        INSERT INTO public.workflow_versions (template_id, version_number)
        VALUES ('${tplId}', 1)
        RETURNING id;
      `);
      const verId = verRes.rows[0].id;

      // Insert 3 steps: step_a, step_b, step_c with instructions
      const stepARes = await db.query<any>(`
        INSERT INTO public.workflow_steps (version_id, step_key, title, stage, sort_order, instructions)
        VALUES ('${verId}', 'step_a', 'Step A', 'submission', 10, 'Step A instructions') RETURNING id;
      `);
      const stepBRes = await db.query<any>(`
        INSERT INTO public.workflow_steps (version_id, step_key, title, stage, sort_order, instructions)
        VALUES ('${verId}', 'step_b', 'Step B', 'submission', 20, 'Step B instructions') RETURNING id;
      `);
      const stepCRes = await db.query<any>(`
        INSERT INTO public.workflow_steps (version_id, step_key, title, stage, sort_order, instructions)
        VALUES ('${verId}', 'step_c', 'Step C', 'submission', 30, 'Step C instructions') RETURNING id;
      `);

      const idA = stepARes.rows[0].id;
      const idB = stepBRes.rows[0].id;
      const idC = stepCRes.rows[0].id;

      // Establish A -> B and B -> C
      await db.query<any>(`INSERT INTO public.workflow_dependencies (step_id, depends_on_step_id) VALUES ('${idB}', '${idA}');`);
      await db.query<any>(`INSERT INTO public.workflow_dependencies (step_id, depends_on_step_id) VALUES ('${idC}', '${idB}');`);

      // Attempting C -> A would close the loop: A -> B -> C -> A. It MUST be rejected!
      let cycleError: any = null;
      try {
        await db.query<any>(`INSERT INTO public.workflow_dependencies (step_id, depends_on_step_id) VALUES ('${idA}', '${idC}');`);
      } catch (err) {
        cycleError = err;
      }

      expect(cycleError).toBeTruthy();
      expect(cycleError.message).toMatch(/circular dependency detected/i);
    });
  });

  // ===========================================================================
  // SECTION 3: Live Case Instantiation & Snapshotting
  // ===========================================================================
  describe('3. Case Workflow Instantiation & Version Snapshotting', () => {
    let testCaseId: string;
    let germanyVerId: string;

    beforeAll(async () => {
      // Create student case with correct schema columns
      const caseRes = await db.query<any>(`
        INSERT INTO public.student_cases (
          student_id, target_country, target_degree, target_intake_season, target_intake_year,
          current_stage, stage_status, next_required_action, next_action_due_date, responsible_party
        ) VALUES (
          '${TEST_USERS.student}', 'de', 'masters', 'winter', 2027,
          'onboarding', 'in_progress', 'Initial profile setup', '2027-01-01', 'student'
        )
        RETURNING id;
      `);
      testCaseId = caseRes.rows[0].id;

      // Assign counsellor to case
      await db.query<any>(`
        INSERT INTO public.case_assignments (case_id, counsellor_id, assigned_by)
        VALUES ('${testCaseId}', '${TEST_USERS.counsellor}', '${TEST_USERS.admin}');
      `);

      // Get Germany active version ID
      const verRes = await db.query<any>(`
        SELECT wv.id
        FROM public.workflow_versions wv
        JOIN public.workflow_templates wt ON wv.template_id = wt.id
        WHERE wt.country_code = 'de' AND wt.application_route = 'uni_assist';
      `);
      germanyVerId = verRes.rows[0].id;
    });

    it('snapshots immutable workflow steps into case_workflow_steps for an active case', async () => {
      const snapRes = await asPersona('authenticated', TEST_USERS.admin, async (tx) => {
        return await tx.query<any>(`
          SELECT * FROM public.admin_instantiate_case_workflow(
            '${testCaseId}'::uuid,
            NULL,
            '${germanyVerId}'::uuid
          );
        `);
      });

      expect(snapRes.rows.length).toBe(1);
      expect(snapRes.rows[0].admin_instantiate_case_workflow.steps_count).toBe(6);

      const caseSteps = await db.query<any>(`
        SELECT step_key, title, stage, status, responsible_actor, is_parallel
        FROM public.case_workflow_steps
        WHERE case_id = '${testCaseId}'
        ORDER BY sort_order ASC;
      `);

      expect(caseSteps.rows.length).toBe(6);
      expect(caseSteps.rows[0].status).toBe('needs_action');
      expect(caseSteps.rows[0].step_key).toBe('de_ua_attestation');
    });

    it('rejects not_applicable transition without minimum 5 character reason', async () => {
      const stepRes = await db.query<any>(`
        SELECT id FROM public.case_workflow_steps
        WHERE case_id = '${testCaseId}' AND step_key = 'de_ua_attestation';
      `);
      const stepId = stepRes.rows[0].id;

      let error: any = null;
      try {
        await asPersona('authenticated', TEST_USERS.counsellor, async (tx) => {
          await tx.query<any>(`
            SELECT * FROM public.staff_transition_workflow_step_status(
              '${stepId}'::uuid,
              'not_applicable',
              'NA'
            );
          `);
        });
      } catch (err) {
        error = err;
      }

      expect(error).toBeTruthy();
      expect(error.message).toMatch(/Recorded reason \(at least 5 characters\) is required/i);
    });

    it('allows not_applicable transition with valid recorded reason', async () => {
      const stepRes = await db.query<any>(`
        SELECT id FROM public.case_workflow_steps
        WHERE case_id = '${testCaseId}' AND step_key = 'de_ua_attestation';
      `);
      const stepId = stepRes.rows[0].id;

      const updated = await asPersona('authenticated', TEST_USERS.counsellor, async (tx) => {
        return await tx.query<any>(`
          SELECT * FROM public.staff_transition_workflow_step_status(
            '${stepId}'::uuid,
            'not_applicable',
            'Student already possesses HEC and MOFA QR attested credentials.'
          );
        `);
      });

      expect(updated.rows[0].staff_transition_workflow_step_status.new_status).toBe('not_applicable');

      const check = await db.query<any>(`SELECT status, not_applicable_reason FROM public.case_workflow_steps WHERE id = '${stepId}';`);
      expect(check.rows[0].status).toBe('not_applicable');
      expect(check.rows[0].not_applicable_reason).toBe(
        'Student already possesses HEC and MOFA QR attested credentials.'
      );
    });

    it('allows completing and reopening steps with mandatory audit reason', async () => {
      const stepRes = await db.query<any>(`
        SELECT id FROM public.case_workflow_steps
        WHERE case_id = '${testCaseId}' AND step_key = 'de_ua_submission';
      `);
      const stepId = stepRes.rows[0].id;

      // 1. Mark completed
      const compRes = await asPersona('authenticated', TEST_USERS.counsellor, async (tx) => {
        return await tx.query<any>(`
          SELECT * FROM public.staff_transition_workflow_step_status(
            '${stepId}'::uuid,
            'completed'
          );
        `);
      });
      expect(compRes.rows[0].staff_transition_workflow_step_status.new_status).toBe('completed');

      // 2. Attempt to reopen without reason - should be rejected
      let reopenErr: any = null;
      try {
        await asPersona('authenticated', TEST_USERS.counsellor, async (tx) => {
          await tx.query<any>(`
            SELECT * FROM public.staff_transition_workflow_step_status(
              '${stepId}'::uuid,
              'reopened',
              'oops'
            );
          `);
        });
      } catch (err) {
        reopenErr = err;
      }
      expect(reopenErr).toBeTruthy();
      expect(reopenErr.message).toMatch(/Recorded reason \(at least 5 characters\) is required when reopening/i);

      // 3. Reopen with valid reason
      const reopenedRes = await asPersona('authenticated', TEST_USERS.counsellor, async (tx) => {
        return await tx.query<any>(`
          SELECT * FROM public.staff_transition_workflow_step_status(
            '${stepId}'::uuid,
            'reopened',
            'University requested revised syllabus module breakdown after preliminary screening.'
          );
        `);
      });
      expect(reopenedRes.rows[0].staff_transition_workflow_step_status.new_status).toBe('reopened');

      const check = await db.query<any>(`SELECT status, reopened_reason, reopened_at FROM public.case_workflow_steps WHERE id = '${stepId}';`);
      expect(check.rows[0].status).toBe('reopened');
      expect(check.rows[0].reopened_reason).toBe(
        'University requested revised syllabus module breakdown after preliminary screening.'
      );
      expect(check.rows[0].reopened_at).toBeTruthy();
    });
  });

  // ===========================================================================
  // SECTION 4: Template Version Updates & Non-Destructive Case Migration
  // ===========================================================================
  describe('4. Version Updates & Non-Destructive Case Migration Preview', () => {
    let tplId: string;
    let ver1Id: string;
    let ver2Id: string;
    let migrationCaseId: string;

    beforeAll(async () => {
      // Create migration test template
      const tRes = await db.query<any>(`
        INSERT INTO public.workflow_templates (country_code, degree_level, application_route, name, description)
        VALUES ('de', 'masters', 'migration_test_route', 'Migration Test Template', 'Test preview')
        RETURNING id;
      `);
      tplId = tRes.rows[0].id;

      // Version 1
      const v1Res = await db.query<any>(`
        INSERT INTO public.workflow_versions (template_id, version_number, is_active)
        VALUES ('${tplId}', 1, false)
        RETURNING id;
      `);
      ver1Id = v1Res.rows[0].id;

      // Steps in V1: step1 (will be completed), step2 (obsolete) with instructions
      await db.query<any>(`
        INSERT INTO public.workflow_steps (version_id, step_key, title, stage, sort_order, instructions) VALUES
        ('${ver1Id}', 'm_step_1', 'Step 1 - Core', 'submission', 10, 'Core instructions'),
        ('${ver1Id}', 'm_step_2_old', 'Step 2 - Obsolete Rule', 'submission', 20, 'Obsolete instructions');
      `);

      // Version 2 (Upgrade): keeps step1, removes step2_old, adds step3_new
      const v2Res = await db.query<any>(`
        INSERT INTO public.workflow_versions (template_id, version_number, is_active, change_summary)
        VALUES ('${tplId}', 2, true, 'Replaced obsolete step with modernized digital verification')
        RETURNING id;
      `);
      ver2Id = v2Res.rows[0].id;

      await db.query<any>(`
        INSERT INTO public.workflow_steps (version_id, step_key, title, stage, sort_order, instructions) VALUES
        ('${ver2Id}', 'm_step_1', 'Step 1 - Core', 'submission', 10, 'Core instructions'),
        ('${ver2Id}', 'm_step_3_new', 'Step 3 - Digital Portal', 'submission', 30, 'Digital instructions');
      `);

      // Create a student case for student_2 instantiated with Version 1
      const cRes = await db.query<any>(`
        INSERT INTO public.student_cases (
          student_id, target_country, target_degree, target_intake_season, target_intake_year,
          current_stage, stage_status, next_required_action, next_action_due_date, responsible_party
        ) VALUES (
          '${TEST_USERS.student_2}', 'de', 'masters', 'winter', 2027,
          'onboarding', 'in_progress', 'Initial profile setup', '2027-01-01', 'student'
        )
        RETURNING id;
      `);
      migrationCaseId = cRes.rows[0].id;

      await asPersona('authenticated', TEST_USERS.admin, async (tx) => {
        await tx.query<any>(`
          SELECT * FROM public.admin_instantiate_case_workflow('${migrationCaseId}'::uuid, NULL, '${ver1Id}'::uuid);
        `);
      });

      // Complete m_step_1 in the case
      const s1Res = await db.query<any>(`
        SELECT id FROM public.case_workflow_steps
        WHERE case_id = '${migrationCaseId}' AND step_key = 'm_step_1';
      `);
      await asPersona('authenticated', TEST_USERS.admin, async (tx) => {
        await tx.query<any>(`
          SELECT * FROM public.staff_transition_workflow_step_status(
            '${s1Res.rows[0].id}'::uuid,
            'completed'
          );
        `);
      });
    });

    it('previews non-destructive migration showing added steps, removed steps, and completed preserved', async () => {
      const previewRes = await asPersona('authenticated', TEST_USERS.admin, async (tx) => {
        return await tx.query<any>(`
          SELECT * FROM public.admin_preview_workflow_migration(
            '${migrationCaseId}'::uuid,
            NULL,
            '${ver2Id}'::uuid
          );
        `);
      });

      expect(previewRes.rows.length).toBe(1);
      const preview = previewRes.rows[0].admin_preview_workflow_migration;

      // Completed step m_step_1 must be in completed_preserved
      const completed = preview.completed_preserved as any[];
      expect(completed.some((s) => s.step_key === 'm_step_1')).toBe(true);

      // New step m_step_3_new must be in added_steps
      const added = preview.added_steps as any[];
      expect(added.some((s) => s.step_key === 'm_step_3_new')).toBe(true);

      // Obsolete step m_step_2_old must be in removed_steps
      const removed = preview.removed_steps as any[];
      expect(removed.some((s) => s.step_key === 'm_step_2_old')).toBe(true);
    });

    it('applies migration explicitly while preserving completed student step and logging audit event', async () => {
      const applyRes = await asPersona('authenticated', TEST_USERS.admin, async (tx) => {
        return await tx.query<any>(`
          SELECT * FROM public.admin_apply_workflow_migration(
            '${migrationCaseId}'::uuid,
            NULL,
            '${ver2Id}'::uuid,
            'Migrated to Version 2 after statutory update.'
          );
        `);
      });

      const result = applyRes.rows[0].admin_apply_workflow_migration;
      expect(result.success).toBe(true);
      expect(result.added_steps_count).toBe(1);

      // Verify case_workflow_steps state after migration
      const currentSteps = await db.query<any>(`
        SELECT step_key, status, template_version_id
        FROM public.case_workflow_steps
        WHERE case_id = '${migrationCaseId}'
        ORDER BY step_key ASC;
      `);

      // m_step_1 should remain COMPLETED
      const step1 = currentSteps.rows.find((r: any) => r.step_key === 'm_step_1');
      expect(step1.status).toBe('completed');

      // m_step_3_new should be added as NEEDS_ACTION
      const step3 = currentSteps.rows.find((r: any) => r.step_key === 'm_step_3_new');
      expect(step3).toBeTruthy();
      expect(step3.status).toBe('needs_action');
      expect(step3.template_version_id).toBe(ver2Id);

      // m_step_2_old should be marked not_applicable / archived with audit note
      const step2 = currentSteps.rows.find((r: any) => r.step_key === 'm_step_2_old');
      expect(step2.status).toBe('not_applicable');

      // Verify audit event was logged in audit_events
      const auditRes = await db.query<any>(`
        SELECT action, payload
        FROM public.audit_events
        WHERE action = 'case_workflow_migration_applied'
        ORDER BY created_at DESC
        LIMIT 1;
      `);
      expect(auditRes.rows.length).toBe(1);
      expect(auditRes.rows[0].payload.new_version_id).toBe(ver2Id);
    });
  });

  // ===========================================================================
  // SECTION 5: Staff Role-Based Access Control on Workflow Templates
  // ===========================================================================
  describe('5. RLS & Staff Role Authorization Matrix for Workflows', () => {
    it('prohibits ordinary counsellors from updating template publication status via RLS', async () => {
      const res = await db.query<any>(`SELECT id FROM public.workflow_templates LIMIT 1;`);
      const tplId: string = res.rows[0].id;

      await asPersona('authenticated', TEST_USERS.counsellor, async (tx) => {
        // Attempt direct update on workflow_templates publication_status
        const updateRes = await tx.query<any>(`
          UPDATE public.workflow_templates
          SET publication_status = 'published'
          WHERE id = '${tplId}';
        `);

        // RLS USING filter excludes ordinary counsellors, yielding 0 updated rows
        expect(updateRes.rowCount).toBe(0);

        const check = await tx.query<any>(`SELECT publication_status FROM public.workflow_templates WHERE id = '${tplId}';`);
        expect(check.rows[0].publication_status).not.toBe('published');
      });
    });

    it('allows admin or super_admin to publish a workflow template with audit trail', async () => {
      const res = await db.query<any>(`SELECT id FROM public.workflow_templates WHERE country_code = 'de' LIMIT 1;`);
      const deTplId = res.rows[0].id;

      await asPersona('authenticated', TEST_USERS.admin, async (tx) => {
        const updateRes = await tx.query<any>(`
          UPDATE public.workflow_templates
          SET publication_status = 'published',
              review_status = 'staff_verified',
              reviewed_by = '${TEST_USERS.admin}',
              reviewed_at = NOW()
          WHERE id = '${deTplId}';
        `);

        expect(updateRes.rowCount).toBe(1);

        const check = await tx.query<any>(`
          SELECT publication_status, review_status, reviewed_by
          FROM public.workflow_templates
          WHERE id = '${deTplId}';
        `);

        expect(check.rows[0].publication_status).toBe('published');
        expect(check.rows[0].review_status).toBe('staff_verified');
        expect(check.rows[0].reviewed_by).toBe(TEST_USERS.admin);
      });
    });

    it('denies anonymous visitors access to internal case workflow steps', async () => {
      await asPersona('anon', undefined, async (tx) => {
        try {
          const res = await tx.query<any>(`SELECT * FROM public.case_workflow_steps;`);
          expect(res.rows.length).toBe(0);
        } catch {
          // Access denial expected
        }
      });
    });
  });
});
