// @vitest-environment node
import { describe, it, expect, beforeAll } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import fs from 'fs';
import path from 'path';
import { initializeTestSupabaseEnvironment } from './helpers/supabaseTestHarness';

describe('Managed Student Onboarding, Case Applications, Snapshots & Concurrency', () => {
  let db: PGlite;

  const TEST_USERS = {
    super_admin: '11111111-1111-4111-a111-111111111111',
    admin: '22222222-2222-4222-a222-222222222222',
    counsellor_sara: '33333333-3333-4333-a333-333333333333',
    counsellor_usman: '33333333-3333-4333-a333-999999999999',
    student_bilal: '55555555-5555-4555-a555-555555555555',
    student_ayesha: '66666666-6666-4666-a666-666666666666',
    other_student: '77777777-7777-4777-a777-777777777777',
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

    // Apply migrations 001 - 013 in strict order
    const migrationsDir = path.resolve(__dirname, '../../supabase/migrations');
    const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();

    for (const file of files) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      await db.exec(sql);
    }

    // Seed test personas into auth.users, public.profiles, and public.staff_roles
    const personas = [
      { id: TEST_USERS.super_admin, email: 'super.admin@unilistics.local', name: 'Super Admin', staffRole: 'super_admin' },
      { id: TEST_USERS.admin, email: 'admin.ops@unilistics.local', name: 'Zainab Admin', staffRole: 'admin' },
      { id: TEST_USERS.counsellor_sara, email: 'sara.counsellor@unilistics.local', name: 'Sara Ahmed', staffRole: 'counsellor' },
      { id: TEST_USERS.counsellor_usman, email: 'usman.counsellor@unilistics.local', name: 'Usman Ghani', staffRole: 'counsellor' },
      { id: TEST_USERS.student_bilal, email: 'bilal.student@test.com', name: 'Muhammad Bilal' },
      { id: TEST_USERS.student_ayesha, email: 'ayesha.student@test.com', name: 'Ayesha Noor' },
      { id: TEST_USERS.other_student, email: 'other.student@test.com', name: 'Other Student' },
    ];

    for (const p of personas) {
      await db.exec(`
        INSERT INTO auth.users (id, email) VALUES ('${p.id}', '${p.email}') ON CONFLICT (id) DO NOTHING;
        INSERT INTO public.profiles (id, email, full_name, account_status)
        VALUES ('${p.id}', '${p.email}', '${p.name}', 'active')
        ON CONFLICT (id) DO UPDATE SET full_name = '${p.name}';
      `);

      if (p.staffRole) {
        await db.exec(`
          INSERT INTO public.staff_roles (user_id, role)
          VALUES ('${p.id}', '${p.staffRole}')
          ON CONFLICT (user_id) DO UPDATE SET role = '${p.staffRole}';
        `);
      }
    }

    // Ensure entitlement for managed students
    for (const sid of [TEST_USERS.student_bilal, TEST_USERS.student_ayesha, TEST_USERS.other_student]) {
      await db.exec(`
        INSERT INTO public.entitlements (user_id, entitlement_type, status, granted_by)
        VALUES ('${sid}', 'managed_application_case', 'active', '${TEST_USERS.admin}')
        ON CONFLICT (user_id, entitlement_type) DO UPDATE SET status = 'active';
      `);
    }
  });

  // 1. Managed approval enables onboarding; it does not fabricate an application submission
  it('Managed approval creates a case in onboarding status without fabricating application submissions', async () => {
    // Admin creates case for student_bilal
    const caseRes = await db.query(`
      INSERT INTO public.student_cases (
        student_id, target_country, target_degree, target_intake_season, target_intake_year,
        current_stage, stage_status, next_required_action, next_action_due_date, responsible_party,
        onboarding_status
      ) VALUES (
        '${TEST_USERS.student_bilal}', 'de', 'masters', 'winter', 2027,
        'onboarding', 'in_progress', 'Complete student profile and study preferences', CURRENT_DATE + 14, 'student',
        'pending'
      ) RETURNING id;
    `);

    const caseId = (caseRes.rows[0] as any).id;
    expect(caseId).toBeDefined();

    // Verify applications table for this case is completely empty (no fabricated submissions)
    const appsRes = await db.query(`
      SELECT COUNT(*) as count FROM public.applications WHERE case_id = '${caseId}';
    `);
    expect(Number((appsRes.rows[0] as any).count)).toBe(0);

    // Initial assignment to Sara
    await db.exec(`
      INSERT INTO public.case_assignments (case_id, counsellor_id, assigned_by, is_active)
      VALUES ('${caseId}', '${TEST_USERS.counsellor_sara}', '${TEST_USERS.admin}', true);
    `);
  });

  // 2. Student completes onboarding & study preferences
  it('Student completes profile and shares study preferences via student_complete_onboarding RPC', async () => {
    const preferences = {
      targetCountries: ['germany'],
      targetDegree: 'master',
      targetIntakes: ['winter_2027'],
      budgetPerYearEur: 12000,
      fundingSource: 'self_funded',
      highestQualification: '4-Year BS Computer Science (FAST-NUCES)',
      gpaOrPercentage: '3.32 / 4.00 (84%)',
      englishProficiency: 'ielts',
      englishTestScore: 'Overall 7.5 (L:8.0, R:7.5, W:7.0, S:7.0)',
      passportStatus: 'valid',
      additionalNotes: 'Seeking public universities in Germany with zero tuition.',
    };

    const res = await asPersona('authenticated', TEST_USERS.student_bilal, async (tx) => {
      return await tx.query(`
        SELECT public.student_complete_onboarding('${JSON.stringify(preferences)}') as result;
      `);
    });

    const output = (res.rows[0] as any).result;
    expect(output.success).toBe(true);
    expect(output.onboarding_status).toBe('completed');

    // Verify database state: onboarding_status = 'completed', stage advanced to attestation
    const checkCase = await db.query(`
      SELECT onboarding_status, current_stage, study_preferences FROM public.student_cases WHERE student_id = '${TEST_USERS.student_bilal}';
    `);
    const c = checkCase.rows[0] as any;
    expect(c.onboarding_status).toBe('completed');
    expect(c.current_stage).toBe('attestation');
    expect(c.study_preferences.highestQualification).toBe('4-Year BS Computer Science (FAST-NUCES)');
  });

  // 3. Staff create university application with immutable snapshots
  it('Staff create university application and preserve snapshots when catalogue entries change', async () => {
    // 3a. Ensure catalogue university and program exist
    const uniRes = await db.query(`
      INSERT INTO public.universities (country_code, name, native_name, city, institution_type, publication_status)
      VALUES ('de', 'Technical University of Munich', 'TUM', 'Munich', 'public', 'published')
      RETURNING id;
    `);
    const uniId = (uniRes.rows[0] as any).id;

    const progRes = await db.query(`
      INSERT INTO public.programs (university_id, name, degree_level, teaching_language, tuition_type, annual_tuition_eur, application_portal, publication_status)
      VALUES ('${uniId}', 'M.Sc. Informatics', 'masters', 'english', 'free', 0.00, 'Direct Portal', 'published')
      RETURNING id;
    `);
    const progId = (progRes.rows[0] as any).id;

    const intakeRes = await db.query(`
      INSERT INTO public.intakes (program_id, season, academic_year, deadline_date)
      VALUES ('${progId}', 'winter', 2027, '2027-05-31')
      RETURNING id;
    `);
    const intakeId = (intakeRes.rows[0] as any).id;

    // Fetch case id
    const caseRes = await db.query(`SELECT id FROM public.student_cases WHERE student_id = '${TEST_USERS.student_bilal}';`);
    const caseId = (caseRes.rows[0] as any).id;

    // Staff counsellor Sara creates application
    const createRes = await asPersona('authenticated', TEST_USERS.counsellor_sara, async (tx) => {
      return await tx.query(`
        SELECT public.staff_create_application(
          '${caseId}', '${progId}', '${intakeId}', '2027-05-31', 'https://campus.tum.de', 'bilal.student@test.com'
        ) as result;
      `);
    });

    const createOutput = (createRes.rows[0] as any).result;
    expect(createOutput.success).toBe(true);
    const appId = createOutput.application_id;
    expect(appId).toBeDefined();

    // 3b. Verify snapshot was captured
    const appRecord = await db.query(`
      SELECT university_snapshot, program_snapshot, lock_version, status, external_status
      FROM public.applications WHERE id = '${appId}';
    `);
    const app = appRecord.rows[0] as any;
    expect(app.university_snapshot.name).toBe('Technical University of Munich');
    expect(app.program_snapshot.title).toBe('M.Sc. Informatics');
    expect(app.lock_version).toBe(1);
    expect(app.status).toBe('drafting');
    expect(app.external_status).toBe('not_submitted');

    // 3c. Now mutate or archive the catalogue entry
    await db.exec(`
      UPDATE public.universities SET name = 'Renamed Munich Institute' WHERE id = '${uniId}';
      UPDATE public.programs SET name = 'M.Sc. Advanced AI' WHERE id = '${progId}';
    `);

    // 3d. Verify application snapshot is COMPLETELY UNTOUCHED & PRESERVED
    const appRecordAfter = await db.query(`
      SELECT university_snapshot, program_snapshot FROM public.applications WHERE id = '${appId}';
    `);
    const appAfter = appRecordAfter.rows[0] as any;
    expect(appAfter.university_snapshot.name).toBe('Technical University of Munich');
    expect(appAfter.program_snapshot.title).toBe('M.Sc. Informatics');
  });

  // 4. Student self-completed task or upload must NOT automatically mark application submitted or visa approved
  it('Student cannot forge or mutate external submission or visa outcome statuses directly', async () => {
    const caseRes = await db.query(`SELECT id FROM public.student_cases WHERE student_id = '${TEST_USERS.student_bilal}';`);
    const caseId = (caseRes.rows[0] as any).id;

    const appRes = await db.query(`SELECT id FROM public.applications WHERE case_id = '${caseId}' LIMIT 1;`);
    const appId = (appRes.rows[0] as any).id;

    // Student attempts to update external_status to 'submitted' or 'visa_approved'
    await expect(
      asPersona('authenticated', TEST_USERS.student_bilal, async (tx) => {
        return await tx.query(`
          UPDATE public.applications
          SET external_status = 'submitted'
          WHERE id = '${appId}';
        `);
      })
    ).rejects.toThrow();

    await expect(
      asPersona('authenticated', TEST_USERS.student_bilal, async (tx) => {
        return await tx.query(`
          UPDATE public.applications
          SET status = 'visa_approved'
          WHERE id = '${appId}';
        `);
      })
    ).rejects.toThrow();
  });

  // 5. Validated staff transitions require evidence/reference for external submissions
  it('Transitioning external status to submitted or awaiting_decision fails if evidence/reference is missing', async () => {
    const caseRes = await db.query(`SELECT id FROM public.student_cases WHERE student_id = '${TEST_USERS.student_bilal}';`);
    const caseId = (caseRes.rows[0] as any).id;
    const appRes = await db.query(`SELECT id, lock_version FROM public.applications WHERE case_id = '${caseId}' LIMIT 1;`);
    const appId = (appRes.rows[0] as any).id;
    const lockVer = Number((appRes.rows[0] as any).lock_version);

    // Call without evidence reference
    await expect(
      asPersona('authenticated', TEST_USERS.counsellor_sara, async (tx) => {
        return await tx.query(`
          SELECT public.staff_update_application(
            p_application_id := '${appId}',
            p_expected_lock_version := ${lockVer},
            p_external_status := 'submitted',
            p_external_evidence_reference := NULL,
            p_portal_application_number := NULL
          );
        `);
      })
    ).rejects.toThrow(/External submission requires official application reference or submission receipt evidence/);
  });

  // 6. Submitting with valid evidence succeeds, increments lock_version, and records history
  it('Transitioning external status with evidence succeeds and increments lock_version', async () => {
    const caseRes = await db.query(`SELECT id FROM public.student_cases WHERE student_id = '${TEST_USERS.student_bilal}';`);
    const caseId = (caseRes.rows[0] as any).id;
    const appRes = await db.query(`SELECT id, lock_version FROM public.applications WHERE case_id = '${caseId}' LIMIT 1;`);
    const appId = (appRes.rows[0] as any).id;
    const lockVer = Number((appRes.rows[0] as any).lock_version);

    const res = await asPersona('authenticated', TEST_USERS.counsellor_sara, async (tx) => {
      return await tx.query(`
        SELECT public.staff_update_application(
          p_application_id := '${appId}',
          p_expected_lock_version := ${lockVer},
          p_external_status := 'awaiting_decision',
          p_portal_application_number := 'TUM-2027W-88914',
          p_external_evidence_reference := 'TUM-CONFIRMATION-PDF-20261015.pdf',
          p_submitted_at := NOW(),
          p_dossier_review_status := 'dossier_approved',
          p_dossier_review_notes := 'All degrees, SOP, and IELTS verified. Dossier approved for submission.'
        ) as result;
      `);
    });

    const output = (res.rows[0] as any).result;
    expect(output.success).toBe(true);
    expect(output.new_lock_version).toBe(lockVer + 1);
    expect(output.external_status).toBe('awaiting_decision');
    expect(output.status).toBe('submitted_by_staff');
  });

  // 7. Optimistic concurrency control: prevents stale overwrites
  it('Optimistic concurrency control rejects updates with stale expected_lock_version', async () => {
    const caseRes = await db.query(`SELECT id FROM public.student_cases WHERE student_id = '${TEST_USERS.student_bilal}';`);
    const caseId = (caseRes.rows[0] as any).id;
    const appRes = await db.query(`SELECT id FROM public.applications WHERE case_id = '${caseId}' LIMIT 1;`);
    const appId = (appRes.rows[0] as any).id;

    // Passing stale expected version = 1 when DB is now at 2
    await expect(
      asPersona('authenticated', TEST_USERS.counsellor_sara, async (tx) => {
        return await tx.query(`
          SELECT public.staff_update_application(
            p_application_id := '${appId}',
            p_expected_lock_version := 1,
            p_next_action := 'Concurrent conflict test'
          );
        `);
      })
    ).rejects.toThrow(/OPTIMISTIC_LOCK_CONFLICT/);
  });

  // 8. Authorised corrections require justification of >= 5 characters
  it('Authorised corrections require a reason of at least 5 characters', async () => {
    const caseRes = await db.query(`SELECT id FROM public.student_cases WHERE student_id = '${TEST_USERS.student_bilal}';`);
    const caseId = (caseRes.rows[0] as any).id;
    const appRes = await db.query(`SELECT id, lock_version FROM public.applications WHERE case_id = '${caseId}' LIMIT 1;`);
    const appId = (appRes.rows[0] as any).id;
    const lockVer = Number((appRes.rows[0] as any).lock_version);

    // Empty or short correction reason fails
    await expect(
      asPersona('authenticated', TEST_USERS.counsellor_sara, async (tx) => {
        return await tx.query(`
          SELECT public.staff_update_application(
            p_application_id := '${appId}',
            p_expected_lock_version := ${lockVer},
            p_is_correction := true,
            p_correction_reason := 'fix'
          );
        `);
      })
    ).rejects.toThrow(/Authorised corrections require a specific explanation of at least 5 characters/);

    // Valid correction reason succeeds and increments lock version
    const res = await asPersona('authenticated', TEST_USERS.counsellor_sara, async (tx) => {
      return await tx.query(`
        SELECT public.staff_update_application(
          p_application_id := '${appId}',
          p_expected_lock_version := ${lockVer},
          p_portal_application_number := 'TUM-2027W-88914-CORRECTED',
          p_is_correction := true,
          p_correction_reason := 'Corrected portal submission reference suffix from university email'
        ) as result;
      `);
    });

    const output = (res.rows[0] as any).result;
    expect(output.success).toBe(true);
  });

  // 9. Outcome validations: conditional offers, rejection, deferral
  it('Validates outcome-specific fields (offer conditions, rejection reasons, deferral intakes)', async () => {
    const caseRes = await db.query(`SELECT id FROM public.student_cases WHERE student_id = '${TEST_USERS.student_bilal}';`);
    const caseId = (caseRes.rows[0] as any).id;
    const appRes = await db.query(`SELECT id, lock_version FROM public.applications WHERE case_id = '${caseId}' LIMIT 1;`);
    const appId = (appRes.rows[0] as any).id;
    let lockVer = Number((appRes.rows[0] as any).lock_version);

    // 9a. Conditional offer without conditions fails
    await expect(
      asPersona('authenticated', TEST_USERS.counsellor_sara, async (tx) => {
        return await tx.query(`
          SELECT public.staff_update_application(
            p_application_id := '${appId}',
            p_expected_lock_version := ${lockVer},
            p_decision_outcome_type := 'conditional_offer',
            p_offer_conditions := NULL
          );
        `);
      })
    ).rejects.toThrow(/Conditional offers must specify the exact academic or language conditions/);

    // 9b. Rejection without decision reason fails
    await expect(
      asPersona('authenticated', TEST_USERS.counsellor_sara, async (tx) => {
        return await tx.query(`
          SELECT public.staff_update_application(
            p_application_id := '${appId}',
            p_expected_lock_version := ${lockVer},
            p_decision_outcome_type := 'rejected',
            p_decision_reason := NULL
          );
        `);
      })
    ).rejects.toThrow(/requires recorded official reason/);

    // 9c. Conditional offer with proper conditions succeeds
    const condRes = await asPersona('authenticated', TEST_USERS.counsellor_sara, async (tx) => {
      return await tx.query(`
        SELECT public.staff_update_application(
          p_application_id := '${appId}',
          p_expected_lock_version := ${lockVer},
          p_external_status := 'conditional_offer',
          p_decision_outcome_type := 'conditional_offer',
          p_offer_conditions := 'Submit attested bachelor degree scroll and achieve B2 German before second semester'
        ) as result;
      `);
    });
    expect((condRes.rows[0] as any).result.success).toBe(true);
    lockVer = (condRes.rows[0] as any).result.new_lock_version;

    // 9d. Accepted offer succeeds
    const acceptRes = await asPersona('authenticated', TEST_USERS.counsellor_sara, async (tx) => {
      return await tx.query(`
        SELECT public.staff_update_application(
          p_application_id := '${appId}',
          p_expected_lock_version := ${lockVer},
          p_external_status := 'accepted_offer',
          p_decision_outcome_type := 'accepted_offer'
        ) as result;
      `);
    });
    expect((acceptRes.rows[0] as any).result.success).toBe(true);
    lockVer = (acceptRes.rows[0] as any).result.new_lock_version;

    // 9e. Distinct visa outcomes (visa_approved)
    const visaRes = await asPersona('authenticated', TEST_USERS.counsellor_sara, async (tx) => {
      return await tx.query(`
        SELECT public.staff_update_application(
          p_application_id := '${appId}',
          p_expected_lock_version := ${lockVer},
          p_external_status := 'visa_approved',
          p_decision_outcome_type := 'visa_approved',
          p_external_evidence_reference := 'GERMAN-VISA-STICKER-PAGE-SCAN-2026.pdf'
        ) as result;
      `);
    });
    expect((visaRes.rows[0] as any).result.success).toBe(true);
  });

  // 10. Students see only their own case histories and NEVER internal notes
  it('RLS enforces students see only their own application history and NEVER internal staff notes', async () => {
    const caseRes = await db.query(`SELECT id FROM public.student_cases WHERE student_id = '${TEST_USERS.student_bilal}';`);
    const caseId = (caseRes.rows[0] as any).id;
    const appRes = await db.query(`SELECT id, lock_version FROM public.applications WHERE case_id = '${caseId}' LIMIT 1;`);
    const appId = (appRes.rows[0] as any).id;
    const lockVer = Number((appRes.rows[0] as any).lock_version);

    // Insert an internal-only history entry
    await asPersona('authenticated', TEST_USERS.counsellor_sara, async (tx) => {
      return await tx.query(`
        SELECT public.staff_update_application(
          p_application_id := '${appId}',
          p_expected_lock_version := ${lockVer},
          p_dossier_review_notes := 'Internal faculty board meets monthly; student is competitive',
          p_is_internal_only := true
        );
      `);
    });

    // 10a. Staff queries history -> Sees all entries including internal-only
    const staffHistory = await asPersona('authenticated', TEST_USERS.counsellor_sara, async (tx) => {
      return await tx.query(`SELECT * FROM public.application_history WHERE application_id = '${appId}';`);
    });
    expect(staffHistory.rows.some((r: any) => r.is_internal_only === true)).toBe(true);

    // 10b. Student Bilal queries history -> ONLY sees non-internal entries!
    const studentHistory = await asPersona('authenticated', TEST_USERS.student_bilal, async (tx) => {
      return await tx.query(`SELECT * FROM public.application_history WHERE application_id = '${appId}';`);
    });
    expect(studentHistory.rows.length).toBeGreaterThan(0);
    expect(studentHistory.rows.every((r: any) => r.is_internal_only === false)).toBe(true);

    // 10c. Other student queries history for Bilal's app -> Sees 0 rows (strict isolation)
    const otherStudentHistory = await asPersona('authenticated', TEST_USERS.other_student, async (tx) => {
      return await tx.query(`SELECT * FROM public.application_history WHERE application_id = '${appId}';`);
    });
    expect(otherStudentHistory.rows.length).toBe(0);
  });

  // 11. Audited case reassignment and immediate access revocation for previous counsellor
  it('Audited case reassignment immediately revokes future access from the previous counsellor', async () => {
    const caseRes = await db.query(`SELECT id FROM public.student_cases WHERE student_id = '${TEST_USERS.student_bilal}';`);
    const caseId = (caseRes.rows[0] as any).id;

    // Verify Sara initially CAN access the case
    const saraBefore = await asPersona('authenticated', TEST_USERS.counsellor_sara, async (tx) => {
      return await tx.query(`SELECT id FROM public.student_cases WHERE id = '${caseId}';`);
    });
    expect(saraBefore.rows.length).toBe(1);

    // Admin reassigns case from Sara to Usman with mandatory audit justification
    const reassignRes = await asPersona('authenticated', TEST_USERS.admin, async (tx) => {
      return await tx.query(`
        SELECT public.admin_reassign_case(
          '${caseId}',
          '${TEST_USERS.counsellor_usman}',
          'Reassigning student case to senior German corridor lead for consular waitlist handling'
        ) as result;
      `);
    });
    expect((reassignRes.rows[0] as any).result.success).toBe(true);

    // 11a. Usman (new counsellor) CAN now access the case
    const usmanAfter = await asPersona('authenticated', TEST_USERS.counsellor_usman, async (tx) => {
      return await tx.query(`SELECT id FROM public.student_cases WHERE id = '${caseId}';`);
    });
    expect(usmanAfter.rows.length).toBe(1);

    // 11b. Sara (previous counsellor) IMMEDIATELY LOSES ACCESS (0 rows returned via RLS)
    const saraAfter = await asPersona('authenticated', TEST_USERS.counsellor_sara, async (tx) => {
      return await tx.query(`SELECT id FROM public.student_cases WHERE id = '${caseId}';`);
    });
    expect(saraAfter.rows.length).toBe(0);

    // 11c. Sara also cannot query applications for this case
    const saraAppsAfter = await asPersona('authenticated', TEST_USERS.counsellor_sara, async (tx) => {
      return await tx.query(`SELECT id FROM public.applications WHERE case_id = '${caseId}';`);
    });
    expect(saraAppsAfter.rows.length).toBe(0);

    // 11d. Audit event was logged with previous and new counsellor IDs
    const auditRes = await db.query(`
      SELECT payload FROM public.audit_events
      WHERE action = 'admin_reassign_case' AND target_id = '${caseId}';
    `);
    expect(auditRes.rows.length).toBe(1);
    const auditPayload = (auditRes.rows[0] as any).payload;
    expect(auditPayload.previous_counsellor_id).toBe(TEST_USERS.counsellor_sara);
    expect(auditPayload.new_counsellor_id).toBe(TEST_USERS.counsellor_usman);
  });
});
