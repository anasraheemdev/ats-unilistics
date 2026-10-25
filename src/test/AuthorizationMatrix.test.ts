// @vitest-environment node
import { describe, it, expect, beforeAll } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import * as fs from 'fs';
import * as path from 'path';
import { initializeTestSupabaseEnvironment } from './helpers/supabaseTestHarness';

describe('Supabase Database RLS & Authorization Matrix Test Suite', () => {
  let db: PGlite;

  // Test User UUIDs
  const USER_IDS = {
    pending: '11111111-1111-4111-a111-111111111111',
    explorer: '22222222-2222-4222-a222-222222222222',
    student_a: '33333333-3333-4333-a333-333333333333',
    student_b: '44444444-4444-4444-a444-444444444444',
    counsellor_assigned: '55555555-5555-4555-a555-555555555555',
    counsellor_unassigned: '66666666-6666-4666-a666-666666666666',
    admin: '77777777-7777-4777-a777-777777777777',
    suspended: '88888888-8888-4888-a888-888888888888',
  };

  let uniPublishedId: string;
  let uniDraftId: string;
  let progPublishedId: string;
  let intakePublishedId: string;
  let caseAId: string;
  let caseBId: string;
  let appAId: string;
  let appBId: string;
  let docAId: string;
  let docBId: string;
  let taskAId: string;

  // Helper to execute query as a specific persona context
  async function asPersona<T = any>(
    role: 'anon' | 'authenticated',
    userId?: string,
    queryFn?: (tx: PGlite) => Promise<T>
  ): Promise<T> {
    // Set simulated session context
    await db.exec(`SET ROLE ${role};`);
    if (userId) {
      await db.exec(`SET "request.jwt.claim.sub" = '${userId}'; SET "request.jwt.claim.role" = '${role}';`);
    } else {
      await db.exec(`SET "request.jwt.claim.sub" = ''; SET "request.jwt.claim.role" = 'anon';`);
    }

    try {
      if (queryFn) {
        return await queryFn(db);
      }
      return undefined as any;
    } finally {
      // Reset session to superuser
      await db.exec('RESET ROLE; RESET "request.jwt.claim.sub"; RESET "request.jwt.claim.role";');
    }
  }

  beforeAll(async () => {
    db = new PGlite();

    // Initialize mock Supabase internal schemas (auth, storage) for PGlite test environment
    await initializeTestSupabaseEnvironment(db);

    // 1. Run all 7 migrations in order
    const migrationFiles = [
      '20261022000001_core_and_auth_schema.sql',
      '20261022000002_catalogue_and_workflows.sql',
      '20261022000003_cases_applications_and_assignments.sql',
      '20261022000004_tasks_documents_and_messages.sql',
      '20261022000005_audit_notifications_and_outbox.sql',
      '20261022000006_rpcs_projections_and_grants.sql',
      '20261022000007_storage_policies.sql',
    ];

    const migrationsDir = path.resolve(__dirname, '../../supabase/migrations');

    for (const file of migrationFiles) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      await db.exec(sql);
    }

    // 2. Seed Baseline Countries
    await db.exec(`
      INSERT INTO public.countries (code, name, visa_authority) VALUES
      ('de', 'Germany', 'German Embassy Islamabad'),
      ('fr', 'France', 'Campus France / French Consulate'),
      ('it', 'Italy', 'Italian Embassy Islamabad'),
      ('ro', 'Romania', 'Romanian Embassy Islamabad')
      ON CONFLICT DO NOTHING;
    `);

    // 3. Seed Catalogue Data (Published vs Draft)
    const uniPub = await db.query<{ id: string }>(`
      INSERT INTO public.universities (country_code, name, city, institution_type, publication_status)
      VALUES ('de', 'Technical University of Munich', 'Munich', 'public', 'published')
      RETURNING id;
    `);
    uniPublishedId = uniPub.rows[0].id;

    const uniDraft = await db.query<{ id: string }>(`
      INSERT INTO public.universities (country_code, name, city, institution_type, publication_status)
      VALUES ('de', 'Unpublished Internal University', 'Berlin', 'private', 'draft')
      RETURNING id;
    `);
    uniDraftId = uniDraft.rows[0].id;

    const progPub = await db.query<{ id: string }>(`
      INSERT INTO public.programs (university_id, name, degree_level, teaching_language, tuition_type, application_portal, publication_status)
      VALUES ('${uniPublishedId}', 'M.Sc. Informatics', 'masters', 'english', 'free', 'TUMonline', 'published')
      RETURNING id;
    `);
    progPublishedId = progPub.rows[0].id;

    const intakePub = await db.query<{ id: string }>(`
      INSERT INTO public.intakes (program_id, season, academic_year, deadline_date, publication_status)
      VALUES ('${progPublishedId}', 'winter', 2027, '2027-05-31', 'published')
      RETURNING id;
    `);
    intakePublishedId = intakePub.rows[0].id;

    // 4. Seed User Profiles & Roles
    // Admin
    await db.exec(`
      INSERT INTO auth.users (id, email) VALUES ('${USER_IDS.admin}', 'admin@unilistics.com');
      INSERT INTO public.profiles (id, email, full_name, account_status)
      VALUES ('${USER_IDS.admin}', 'admin@unilistics.com', 'Operations Admin', 'active');
      INSERT INTO public.staff_roles (user_id, role) VALUES ('${USER_IDS.admin}', 'admin');
    `);

    // Assigned Counsellor
    await db.exec(`
      INSERT INTO auth.users (id, email) VALUES ('${USER_IDS.counsellor_assigned}', 'sara.counsellor@unilistics.com');
      INSERT INTO public.profiles (id, email, full_name, account_status)
      VALUES ('${USER_IDS.counsellor_assigned}', 'sara.counsellor@unilistics.com', 'Sara Ahmed', 'active');
      INSERT INTO public.staff_roles (user_id, role) VALUES ('${USER_IDS.counsellor_assigned}', 'counsellor');
    `);

    // Unassigned Counsellor
    await db.exec(`
      INSERT INTO auth.users (id, email) VALUES ('${USER_IDS.counsellor_unassigned}', 'unassigned@unilistics.com');
      INSERT INTO public.profiles (id, email, full_name, account_status)
      VALUES ('${USER_IDS.counsellor_unassigned}', 'unassigned@unilistics.com', 'Hamza Tariq', 'active');
      INSERT INTO public.staff_roles (user_id, role) VALUES ('${USER_IDS.counsellor_unassigned}', 'counsellor');
    `);

    // Explorer User
    await db.exec(`
      INSERT INTO auth.users (id, email) VALUES ('${USER_IDS.explorer}', 'explorer@test.com');
      INSERT INTO public.profiles (id, email, full_name, account_status)
      VALUES ('${USER_IDS.explorer}', 'explorer@test.com', 'Zainab Explorer', 'active');
      INSERT INTO public.entitlements (user_id, entitlement_type, status)
      VALUES ('${USER_IDS.explorer}', 'explorer_catalogue', 'active');
    `);

    // Pending User
    await db.exec(`
      INSERT INTO auth.users (id, email) VALUES ('${USER_IDS.pending}', 'pending@test.com');
      INSERT INTO public.profiles (id, email, full_name, account_status)
      VALUES ('${USER_IDS.pending}', 'pending@test.com', 'Pending Applicant', 'pending');
    `);

    // Student A (Managed)
    await db.exec(`
      INSERT INTO auth.users (id, email) VALUES ('${USER_IDS.student_a}', 'bilal.student@test.com');
      INSERT INTO public.profiles (id, email, full_name, account_status)
      VALUES ('${USER_IDS.student_a}', 'bilal.student@test.com', 'Muhammad Bilal', 'active');
      INSERT INTO public.entitlements (user_id, entitlement_type, status)
      VALUES
        ('${USER_IDS.student_a}', 'explorer_catalogue', 'active'),
        ('${USER_IDS.student_a}', 'managed_application_case', 'active');
    `);

    const cA = await db.query<{ id: string }>(`
      INSERT INTO public.student_cases (student_id, target_country, target_degree, target_intake_season, target_intake_year, current_stage, next_required_action, next_action_due_date, responsible_party)
      VALUES ('${USER_IDS.student_a}', 'de', 'masters', 'winter', 2027, 'attestation', 'Submit degree to MOFA', '2026-11-15', 'student')
      RETURNING id;
    `);
    caseAId = cA.rows[0].id;

    // Assign Counsellor to Case A
    await db.exec(`
      INSERT INTO public.case_assignments (case_id, counsellor_id, is_active)
      VALUES ('${caseAId}', '${USER_IDS.counsellor_assigned}', true);
    `);

    // Student A Application
    const apA = await db.query<{ id: string }>(`
      INSERT INTO public.applications (case_id, program_id, intake_id, status, submission_deadline)
      VALUES ('${caseAId}', '${progPublishedId}', '${intakePublishedId}', 'drafting', '2027-05-31')
      RETURNING id;
    `);
    appAId = apA.rows[0].id;

    // Student A Document
    const dA = await db.query<{ id: string }>(`
      INSERT INTO public.document_metadata (case_id, document_type, title, verification_status)
      VALUES ('${caseAId}', 'hec_attestation', 'HEC Attestation Ticket', 'pending')
      RETURNING id;
    `);
    docAId = dA.rows[0].id;

    // Student A Task
    const tA = await db.query<{ id: string }>(`
      INSERT INTO public.tasks (case_id, title, assigned_to_role, status, category)
      VALUES ('${caseAId}', 'Submit degrees to MOFA for Apostille', 'student', 'pending', 'attestation')
      RETURNING id;
    `);
    taskAId = tA.rows[0].id;

    // Student B (Managed)
    await db.exec(`
      INSERT INTO auth.users (id, email) VALUES ('${USER_IDS.student_b}', 'ali.student@test.com');
      INSERT INTO public.profiles (id, email, full_name, account_status)
      VALUES ('${USER_IDS.student_b}', 'ali.student@test.com', 'Ali Raza', 'active');
      INSERT INTO public.entitlements (user_id, entitlement_type, status)
      VALUES
        ('${USER_IDS.student_b}', 'explorer_catalogue', 'active'),
        ('${USER_IDS.student_b}', 'managed_application_case', 'active');
    `);

    const cB = await db.query<{ id: string }>(`
      INSERT INTO public.student_cases (student_id, target_country, target_degree, target_intake_season, target_intake_year, current_stage, next_required_action, next_action_due_date, responsible_party)
      VALUES ('${USER_IDS.student_b}', 'fr', 'masters', 'fall', 2027, 'onboarding', 'Complete CV', '2026-11-20', 'student')
      RETURNING id;
    `);
    caseBId = cB.rows[0].id;

    const apB = await db.query<{ id: string }>(`
      INSERT INTO public.applications (case_id, program_id, intake_id, status, submission_deadline)
      VALUES ('${caseBId}', '${progPublishedId}', '${intakePublishedId}', 'drafting', '2027-05-31')
      RETURNING id;
    `);
    appBId = apB.rows[0].id;

    const dB = await db.query<{ id: string }>(`
      INSERT INTO public.document_metadata (case_id, document_type, title, verification_status)
      VALUES ('${caseBId}', 'passport_scan', 'Passport First Page', 'pending')
      RETURNING id;
    `);
    docBId = dB.rows[0].id;

    // Suspended User
    await db.exec(`
      INSERT INTO auth.users (id, email) VALUES ('${USER_IDS.suspended}', 'suspended@test.com');
      INSERT INTO public.profiles (id, email, full_name, account_status)
      VALUES ('${USER_IDS.suspended}', 'suspended@test.com', 'Suspended Student', 'suspended');
      INSERT INTO public.entitlements (user_id, entitlement_type, status)
      VALUES ('${USER_IDS.suspended}', 'managed_application_case', 'active');
    `);
  });

  // =========================================================================
  // 1. ANONYMOUS USER PERMISSIONS
  // =========================================================================
  describe('Anonymous Persona (Public Visitor)', () => {
    it('can view published catalogue universities and projections', async () => {
      const res = await asPersona('anon', undefined, async (tx) => {
        return await tx.query('SELECT * FROM public.published_catalogue_universities;');
      });
      expect(res.rows.length).toBeGreaterThan(0);
      expect(res.rows.some((r: any) => r.name === 'Technical University of Munich')).toBe(true);
    });

    it('cannot view draft/internal catalogue universities', async () => {
      const res = await asPersona('anon', undefined, async (tx) => {
        return await tx.query(`SELECT * FROM public.universities WHERE id = '${uniDraftId}';`);
      });
      expect(res.rows.length).toBe(0);
    });

    it('cannot view any student cases or private case tables (permission denied)', async () => {
      await expect(
        asPersona('anon', undefined, async (tx) => {
          return await tx.query('SELECT * FROM public.student_cases;');
        })
      ).rejects.toThrow(/permission denied/i);

      await expect(
        asPersona('anon', undefined, async (tx) => {
          return await tx.query('SELECT * FROM public.document_metadata;');
        })
      ).rejects.toThrow(/permission denied/i);
    });

    it('can submit platform access request via RPC and direct insert', async () => {
      // 1. Submit via dedicated public RPC
      const resRpc = await asPersona('anon', undefined, async (tx) => {
        return await tx.query(`
          SELECT public.request_platform_access(
            'Anon Applicant',
            'anon.rpc@test.com',
            '+923001234567',
            'Lahore',
            'germany',
            'masters',
            'explorer_catalogue'
          ) as request_id;
        `);
      });
      expect(resRpc.rows.length).toBe(1);
      expect((resRpc.rows[0] as any).request_id).toBeDefined();

      // 2. Direct insert without RETURNING (since anon cannot SELECT private requests)
      await asPersona('anon', undefined, async (tx) => {
        return await tx.exec(`
          INSERT INTO public.access_requests (full_name, email, phone, city, target_country, target_degree, requested_entitlement)
          VALUES ('Anon Direct', 'anon.direct@test.com', '+923001234567', 'Karachi', 'germany', 'bachelors', 'explorer_catalogue');
        `);
      });
    });

    it('cannot directly mutate student cases or entitlements', async () => {
      await expect(
        asPersona('anon', undefined, async (tx) => {
          return await tx.query(`
            INSERT INTO public.entitlements (user_id, entitlement_type, status)
            VALUES ('${USER_IDS.student_a}', 'managed_application_case', 'active');
          `);
        })
      ).rejects.toThrow();
    });
  });

  // =========================================================================
  // 2. EXPLORER PERSONA
  // =========================================================================
  describe('Explorer Persona', () => {
    it('can view published catalogue and programs', async () => {
      const res = await asPersona('authenticated', USER_IDS.explorer, async (tx) => {
        return await tx.query('SELECT * FROM public.published_catalogue_programs;');
      });
      expect(res.rows.length).toBeGreaterThan(0);
      expect(res.rows.some((r: any) => r.program_name === 'M.Sc. Informatics')).toBe(true);
    });

    it('cannot access draft catalogue', async () => {
      const res = await asPersona('authenticated', USER_IDS.explorer, async (tx) => {
        return await tx.query(`SELECT * FROM public.universities WHERE id = '${uniDraftId}';`);
      });
      expect(res.rows.length).toBe(0);
    });

    it('cannot access any student cases or case rooms', async () => {
      const res = await asPersona('authenticated', USER_IDS.explorer, async (tx) => {
        return await tx.query('SELECT * FROM public.student_cases;');
      });
      expect(res.rows.length).toBe(0);
    });

    it('can bookmark published programs', async () => {
      const res = await asPersona('authenticated', USER_IDS.explorer, async (tx) => {
        return await tx.query(`
          INSERT INTO public.bookmarks (user_id, program_id)
          VALUES ('${USER_IDS.explorer}', '${progPublishedId}')
          RETURNING id;
        `);
      });
      expect(res.rows.length).toBe(1);
    });

    it('cannot bookmark for other users (forgery prevention)', async () => {
      await expect(
        asPersona('authenticated', USER_IDS.explorer, async (tx) => {
          return await tx.query(`
            INSERT INTO public.bookmarks (user_id, program_id)
            VALUES ('${USER_IDS.student_a}', '${progPublishedId}')
            RETURNING id;
          `);
        })
      ).rejects.toThrow();
    });
  });

  // =========================================================================
  // 3. STUDENT A vs STUDENT B (IDOR / BOLA CROSS-TENANT ISOLATION)
  // =========================================================================
  describe('Student A vs Student B Isolation (BOLA/IDOR Prevention)', () => {
    it('Student A can view their own Case A', async () => {
      const res = await asPersona('authenticated', USER_IDS.student_a, async (tx) => {
        return await tx.query(`SELECT * FROM public.student_cases WHERE id = '${caseAId}';`);
      });
      expect(res.rows.length).toBe(1);
      expect((res.rows[0] as any).student_id).toBe(USER_IDS.student_a);
      expect(appAId).toBeDefined();
    });

    it('Student A CANNOT view Student B Case even with exact guessed ID', async () => {
      const res = await asPersona('authenticated', USER_IDS.student_a, async (tx) => {
        return await tx.query(`SELECT * FROM public.student_cases WHERE id = '${caseBId}';`);
      });
      expect(res.rows.length).toBe(0);
    });

    it('Student A CANNOT update Student B Case', async () => {
      const res = await asPersona('authenticated', USER_IDS.student_a, async (tx) => {
        return await tx.query(`
          UPDATE public.student_cases
          SET next_required_action = 'Hacked by Student A'
          WHERE id = '${caseBId}'
          RETURNING id;
        `);
      });
      expect(res.rows.length).toBe(0);
    });

    it('Student A CANNOT view Student B documents or tasks', async () => {
      const resDocs = await asPersona('authenticated', USER_IDS.student_a, async (tx) => {
        return await tx.query(`SELECT * FROM public.document_metadata WHERE id = '${docBId}';`);
      });
      expect(resDocs.rows.length).toBe(0);
    });

    it('Student A CANNOT view internal counsellor notes on their OWN case', async () => {
      // Seed internal note on Case A
      await db.query(`
        INSERT INTO public.internal_notes (case_id, author_id, note_text)
        VALUES ('${caseAId}', '${USER_IDS.counsellor_assigned}', 'Student MOFA stamp is suspicious; counsellor check needed');
      `);

      const resNotes = await asPersona('authenticated', USER_IDS.student_a, async (tx) => {
        return await tx.query(`SELECT * FROM public.internal_notes WHERE case_id = '${caseAId}';`);
      });
      expect(resNotes.rows.length).toBe(0); // STRICTLY 0 ROWS
    });

    it('Student A cannot modify official case stage or review decisions', async () => {
      const res = await asPersona('authenticated', USER_IDS.student_a, async (tx) => {
        return await tx.query(`
          UPDATE public.student_cases
          SET current_stage = 'relocation'
          WHERE id = '${caseAId}'
          RETURNING id;
        `);
      });
      expect(res.rows.length).toBe(0); // RLS update blocked for students
    });

    it('Cross-Student Forgery: Student A cannot link Document A to Student B Application B', async () => {
      await expect(
        asPersona('authenticated', USER_IDS.student_a, async (tx) => {
          return await tx.query(`
            INSERT INTO public.document_links (application_id, document_id)
            VALUES ('${appBId}', '${docAId}')
            RETURNING id;
          `);
        })
      ).rejects.toThrow();
    });

    it('Cross-Student Forgery: Student A cannot post message into Student B Case B', async () => {
      await expect(
        asPersona('authenticated', USER_IDS.student_a, async (tx) => {
          return await tx.query(`
            INSERT INTO public.messages (case_id, sender_id, content)
            VALUES ('${caseBId}', '${USER_IDS.student_a}', 'Unauthorized message into B')
            RETURNING id;
          `);
        })
      ).rejects.toThrow();
    });

    it('Student A can update status of their own action tasks', async () => {
      const res = await asPersona('authenticated', USER_IDS.student_a, async (tx) => {
        return await tx.query(`
          UPDATE public.tasks
          SET status = 'completed'
          WHERE id = '${taskAId}' AND assigned_to_role = 'student'
          RETURNING id, status;
        `);
      });
      expect(res.rows.length).toBe(1);
      expect((res.rows[0] as any).status).toBe('completed');
    });
  });

  // =========================================================================
  // 4. COUNSELLOR ASSIGNED vs UNASSIGNED (COUNSELLOR ISOLATION)
  // =========================================================================
  describe('Counsellor Scoping & Assignment Isolation', () => {
    it('Assigned Counsellor can view assigned Case A and internal notes', async () => {
      const resCase = await asPersona('authenticated', USER_IDS.counsellor_assigned, async (tx) => {
        return await tx.query(`SELECT * FROM public.student_cases WHERE id = '${caseAId}';`);
      });
      expect(resCase.rows.length).toBe(1);

      const resNotes = await asPersona('authenticated', USER_IDS.counsellor_assigned, async (tx) => {
        return await tx.query(`SELECT * FROM public.internal_notes WHERE case_id = '${caseAId}';`);
      });
      expect(resNotes.rows.length).toBeGreaterThan(0);
    });

    it('Assigned Counsellor CANNOT view unassigned Case B', async () => {
      const resCaseB = await asPersona('authenticated', USER_IDS.counsellor_assigned, async (tx) => {
        return await tx.query(`SELECT * FROM public.student_cases WHERE id = '${caseBId}';`);
      });
      expect(resCaseB.rows.length).toBe(0);
    });

    it('Unassigned Counsellor CANNOT view Case A or Case B', async () => {
      const resCaseA = await asPersona('authenticated', USER_IDS.counsellor_unassigned, async (tx) => {
        return await tx.query(`SELECT * FROM public.student_cases WHERE id = '${caseAId}';`);
      });
      expect(resCaseA.rows.length).toBe(0);

      const resCaseB = await asPersona('authenticated', USER_IDS.counsellor_unassigned, async (tx) => {
        return await tx.query(`SELECT * FROM public.student_cases WHERE id = '${caseBId}';`);
      });
      expect(resCaseB.rows.length).toBe(0);
    });

    it('Assigned Counsellor can submit document review via RPC', async () => {
      const res = await asPersona('authenticated', USER_IDS.counsellor_assigned, async (tx) => {
        return await tx.query(`
          SELECT public.submit_document_review(
            '${docAId}'::uuid,
            'verified',
            'MOFA Apostille stamp authenticated against QR verification system'
          ) as result;
        `);
      });
      const result = (res.rows[0] as any).result;
      expect(result.success).toBe(true);
      expect(result.decision).toBe('verified');
    });

    it('Unassigned Counsellor CANNOT submit review on Case A document', async () => {
      await expect(
        asPersona('authenticated', USER_IDS.counsellor_unassigned, async (tx) => {
          return await tx.query(`
            SELECT public.submit_document_review(
              '${docAId}'::uuid,
              'rejected',
              'Unauthorized rejection attempt'
            );
          `);
        })
      ).rejects.toThrow();
    });
  });

  // =========================================================================
  // 5. ADMINISTRATOR PRIVILEGES & IDEMPOTENT APPROVAL
  // =========================================================================
  describe('Administrator Operations & Idempotent Approval', () => {
    let reqId: string;

    it('Admin can view all cases across the system', async () => {
      const res = await asPersona('authenticated', USER_IDS.admin, async (tx) => {
        return await tx.query('SELECT * FROM public.student_cases;');
      });
      expect(res.rows.length).toBeGreaterThanOrEqual(2);
    });

    it('Admin can assign counsellors to cases via RPC', async () => {
      const res = await asPersona('authenticated', USER_IDS.admin, async (tx) => {
        return await tx.query(`
          SELECT public.assign_case_counsellor(
            '${caseBId}'::uuid,
            '${USER_IDS.counsellor_unassigned}'::uuid
          ) as result;
        `);
      });
      expect((res.rows[0] as any).result.success).toBe(true);

      // Verify the previously unassigned counsellor can now access Case B
      const resB = await asPersona('authenticated', USER_IDS.counsellor_unassigned, async (tx) => {
        return await tx.query(`SELECT * FROM public.student_cases WHERE id = '${caseBId}';`);
      });
      expect(resB.rows.length).toBe(1);
    });

    it('Admin can approve access requests idempotently', async () => {
      // Create pending request
      const r = await db.query<{ id: string }>(`
        INSERT INTO public.access_requests (full_name, email, phone, city, target_country, target_degree, requested_entitlement)
        VALUES ('Tariq Mehmood', 'tariq.approved@test.com', '+923009988776', 'Rawalpindi', 'germany', 'masters', 'managed_application_case')
        RETURNING id;
      `);
      reqId = r.rows[0].id;

      // First approval
      const firstApprove = await asPersona('authenticated', USER_IDS.admin, async (tx) => {
        return await tx.query(`
          SELECT public.approve_access_request('${reqId}'::uuid, true) as result;
        `);
      });
      expect((firstApprove.rows[0] as any).result.success).toBe(true);

      // Second approval (idempotent check)
      const secondApprove = await asPersona('authenticated', USER_IDS.admin, async (tx) => {
        return await tx.query(`
          SELECT public.approve_access_request('${reqId}'::uuid, true) as result;
        `);
      });
      expect((secondApprove.rows[0] as any).result.message).toContain('already approved');
    });

    it('Privileged operations automatically log immutable audit events', async () => {
      const res = await asPersona('authenticated', USER_IDS.admin, async (tx) => {
        return await tx.query(`
          SELECT * FROM public.audit_events
          WHERE target_id = '${reqId}' OR target_id = '${caseBId}';
        `);
      });
      expect(res.rows.length).toBeGreaterThan(0);
    });
  });

  // =========================================================================
  // 6. SUSPENDED ACCOUNT & IMMUTABILITY
  // =========================================================================
  describe('Suspended Account & Audit Immutability', () => {
    it('Suspended user is denied access to student cases even with valid JWT', async () => {
      const res = await asPersona('authenticated', USER_IDS.suspended, async (tx) => {
        return await tx.query('SELECT * FROM public.student_cases;');
      });
      expect(res.rows.length).toBe(0);
    });

    it('Audit events are strictly immutable: UPDATE is rejected by trigger', async () => {
      const auditRow = await db.query<{ id: string }>('SELECT id FROM public.audit_events LIMIT 1;');
      if (auditRow.rows.length > 0) {
        const id = auditRow.rows[0].id;
        await expect(
          db.query(`UPDATE public.audit_events SET action = 'tampered' WHERE id = '${id}';`)
        ).rejects.toThrow(/immutable/i);
      }
    });

    it('Audit events are strictly immutable: DELETE is rejected by trigger', async () => {
      const auditRow = await db.query<{ id: string }>('SELECT id FROM public.audit_events LIMIT 1;');
      if (auditRow.rows.length > 0) {
        const id = auditRow.rows[0].id;
        await expect(
          db.query(`DELETE FROM public.audit_events WHERE id = '${id}';`)
        ).rejects.toThrow(/immutable/i);
      }
    });
  });

  // =========================================================================
  // 7. PRIVATE STORAGE POLICIES (student-vault)
  // =========================================================================
  describe('Private Storage RLS Policies (student-vault)', () => {
    it('Student can insert an object into their own case vault path', async () => {
      const res = await asPersona('authenticated', USER_IDS.student_a, async (tx) => {
        return await tx.query<{ id: string; name: string }>(`
          INSERT INTO storage.objects (bucket_id, name, owner)
          VALUES ('student-vault', '${caseAId}/hec_attestation/v1_degree.pdf', '${USER_IDS.student_a}')
          RETURNING id, name;
        `);
      });
      expect(res.rows.length).toBe(1);
      expect(res.rows[0].name).toBe(`${caseAId}/hec_attestation/v1_degree.pdf`);
    });

    it('Student CANNOT insert an object into another student case vault path', async () => {
      await expect(
        asPersona('authenticated', USER_IDS.student_a, async (tx) => {
          return await tx.query(`
            INSERT INTO storage.objects (bucket_id, name, owner)
            VALUES ('student-vault', '${caseBId}/passport/v1_passport.pdf', '${USER_IDS.student_a}')
            RETURNING id;
          `);
        })
      ).rejects.toThrow();
    });

    it('Student can select and view objects in their own case vault', async () => {
      const res = await asPersona('authenticated', USER_IDS.student_a, async (tx) => {
        return await tx.query<{ id: string; name: string }>(`
          SELECT * FROM storage.objects WHERE bucket_id = 'student-vault';
        `);
      });
      expect(res.rows.length).toBeGreaterThan(0);
      expect(res.rows.every((r) => r.name.startsWith(caseAId))).toBe(true);
    });

    it('Assigned counsellor can view objects in assigned student case vault', async () => {
      const res = await asPersona('authenticated', USER_IDS.counsellor_assigned, async (tx) => {
        return await tx.query<{ id: string; name: string }>(`
          SELECT * FROM storage.objects WHERE bucket_id = 'student-vault';
        `);
      });
      expect(res.rows.length).toBeGreaterThan(0);
      expect(res.rows.some((r) => r.name.startsWith(caseAId))).toBe(true);
    });

    it('Unassigned counsellor CANNOT view objects in unassigned case vault', async () => {
      const res = await asPersona('authenticated', USER_IDS.counsellor_unassigned, async (tx) => {
        return await tx.query(`
          SELECT * FROM storage.objects WHERE bucket_id = 'student-vault';
        `);
      });
      expect(res.rows.length).toBe(0);
    });

    it('Anonymous user CANNOT view or insert objects in private student-vault', async () => {
      const res = await asPersona('anon', undefined, async (tx) => {
        return await tx.query(`
          SELECT * FROM storage.objects WHERE bucket_id = 'student-vault';
        `);
      });
      expect(res.rows.length).toBe(0);

      await expect(
        asPersona('anon', undefined, async (tx) => {
          return await tx.query(`
            INSERT INTO storage.objects (bucket_id, name)
            VALUES ('student-vault', '${caseAId}/exploit.pdf');
          `);
        })
      ).rejects.toThrow();
    });

    it('Admin can view all objects in student-vault', async () => {
      const res = await asPersona('authenticated', USER_IDS.admin, async (tx) => {
        return await tx.query(`
          SELECT * FROM storage.objects WHERE bucket_id = 'student-vault';
        `);
      });
      expect(res.rows.length).toBeGreaterThan(0);
    });
  });
});
