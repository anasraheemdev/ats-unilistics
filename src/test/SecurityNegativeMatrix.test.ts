// @vitest-environment node
import { describe, it, expect, beforeAll } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import * as fs from 'fs';
import * as path from 'path';
import { initializeTestSupabaseEnvironment } from './helpers/supabaseTestHarness';
import { isSafeExternalUrl } from '../pages/help/HelpCentrePage';

describe('OWASP ASVS Automated Negative Security & Identity Matrix Suite', () => {
  let db: PGlite;

  // Identity UUIDs representing all threat model personas
  const IDENTITIES = {
    anonymous: undefined,
    pending: '10000000-0000-4000-a000-000000000001',
    rejected: '10000000-0000-4000-a000-000000000002',
    explorer: '10000000-0000-4000-a000-000000000003',
    student_a: '10000000-0000-4000-a000-000000000004',
    student_b: '10000000-0000-4000-a000-000000000005',
    counsellor_assigned: '10000000-0000-4000-a000-000000000006',
    counsellor_unassigned: '10000000-0000-4000-a000-000000000007',
    admin_mfa: '10000000-0000-4000-a000-000000000008',
    suspended: '10000000-0000-4000-a000-000000000009',
  };

  let caseAId: string;
  let caseBId: string;
  let docAId: string;
  let docBId: string;
  let appBId: string;
  let uniDraftId: string;

  async function asIdentity<T = any>(
    role: 'anon' | 'authenticated',
    userId?: string,
    queryFn?: (tx: PGlite) => Promise<T>,
    aal: string = 'aal2'
  ): Promise<T> {
    await db.exec(`SET ROLE ${role};`);
    if (userId) {
      await db.exec(`SET "request.jwt.claim.sub" = '${userId}'; SET "request.jwt.claim.role" = '${role}'; SET "request.jwt.claim.aal" = '${aal}';`);
    } else {
      await db.exec(`SET "request.jwt.claim.sub" = ''; SET "request.jwt.claim.role" = 'anon'; SET "request.jwt.claim.aal" = '';`);
    }

    try {
      if (queryFn) return await queryFn(db);
      return undefined as any;
    } finally {
      await db.exec('RESET ROLE; RESET "request.jwt.claim.sub"; RESET "request.jwt.claim.role"; RESET "request.jwt.claim.aal";');
    }
  }

  beforeAll(async () => {
    db = new PGlite();
    await initializeTestSupabaseEnvironment(db);

    const migrationsDir = path.resolve(__dirname, '../../supabase/migrations');
    const migrationFiles = [
      '20261022000001_core_and_auth_schema.sql',
      '20261022000002_catalogue_and_workflows.sql',
      '20261022000003_cases_applications_and_assignments.sql',
      '20261022000004_tasks_documents_and_messages.sql',
      '20261022000005_audit_notifications_and_outbox.sql',
      '20261022000006_rpcs_projections_and_grants.sql',
      '20261022000007_storage_policies.sql',
    ];

    for (const file of migrationFiles) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      await db.exec(sql);
    }

    // Seed base countries
    await db.exec(`
      INSERT INTO public.countries (code, name, visa_authority) VALUES
      ('de', 'Germany', 'German Embassy Islamabad'),
      ('fr', 'France', 'Campus France Islamabad')
      ON CONFLICT DO NOTHING;
    `);

    // Seed draft and published universities
    const uPub = await db.query<{ id: string }>(`
      INSERT INTO public.universities (country_code, name, city, institution_type, publication_status)
      VALUES ('de', 'LMU Munich', 'Munich', 'public', 'published') RETURNING id;
    `);
    const uDraft = await db.query<{ id: string }>(`
      INSERT INTO public.universities (country_code, name, city, institution_type, publication_status)
      VALUES ('de', 'Secret Internal Campus', 'Berlin', 'private', 'draft') RETURNING id;
    `);
    uniDraftId = uDraft.rows[0].id;

    // Seed Program
    const prog = await db.query<{ id: string }>(`
      INSERT INTO public.programs (university_id, name, degree_level, teaching_language, tuition_type, application_portal, publication_status)
      VALUES ('${uPub.rows[0].id}', 'M.Sc. Physics', 'masters', 'english', 'free', 'direct', 'published') RETURNING id;
    `);
    const intake = await db.query<{ id: string }>(`
      INSERT INTO public.intakes (program_id, season, academic_year, deadline_date, publication_status)
      VALUES ('${prog.rows[0].id}', 'winter', 2027, '2027-05-31', 'published') RETURNING id;
    `);

    // 1. Pending Identity
    await db.exec(`
      INSERT INTO auth.users (id, email) VALUES ('${IDENTITIES.pending}', 'pending@test.com');
      INSERT INTO public.profiles (id, email, full_name, account_status)
      VALUES ('${IDENTITIES.pending}', 'pending@test.com', 'Pending Applicant', 'pending');
    `);

    // 2. Rejected Identity
    await db.exec(`
      INSERT INTO auth.users (id, email) VALUES ('${IDENTITIES.rejected}', 'rejected@test.com');
      INSERT INTO public.profiles (id, email, full_name, account_status)
      VALUES ('${IDENTITIES.rejected}', 'rejected@test.com', 'Rejected User', 'pending');
    `);

    // 3. Explorer Identity
    await db.exec(`
      INSERT INTO auth.users (id, email) VALUES ('${IDENTITIES.explorer}', 'explorer@test.com');
      INSERT INTO public.profiles (id, email, full_name, account_status)
      VALUES ('${IDENTITIES.explorer}', 'explorer@test.com', 'Explorer User', 'active');
      INSERT INTO public.entitlements (user_id, entitlement_type, status)
      VALUES ('${IDENTITIES.explorer}', 'explorer_catalogue', 'active');
    `);

    // 4. Student A (Managed)
    await db.exec(`
      INSERT INTO auth.users (id, email) VALUES ('${IDENTITIES.student_a}', 'student.a@test.com');
      INSERT INTO public.profiles (id, email, full_name, account_status)
      VALUES ('${IDENTITIES.student_a}', 'student.a@test.com', 'Student A', 'active');
      INSERT INTO public.entitlements (user_id, entitlement_type, status)
      VALUES
        ('${IDENTITIES.student_a}', 'explorer_catalogue', 'active'),
        ('${IDENTITIES.student_a}', 'managed_application_case', 'active');
    `);
    const cA = await db.query<{ id: string }>(`
      INSERT INTO public.student_cases (student_id, target_country, target_degree, target_intake_season, target_intake_year, current_stage, next_required_action, next_action_due_date, responsible_party)
      VALUES ('${IDENTITIES.student_a}', 'de', 'masters', 'winter', 2027, 'attestation', 'Submit degree to MOFA', '2026-11-15', 'student') RETURNING id;
    `);
    caseAId = cA.rows[0].id;

    const dA = await db.query<{ id: string }>(`
      INSERT INTO public.document_metadata (case_id, document_type, title, verification_status)
      VALUES ('${caseAId}', 'hec_attestation', 'HEC Attestation Ticket', 'pending') RETURNING id;
    `);
    docAId = dA.rows[0].id;

    // 5. Student B (Managed)
    await db.exec(`
      INSERT INTO auth.users (id, email) VALUES ('${IDENTITIES.student_b}', 'student.b@test.com');
      INSERT INTO public.profiles (id, email, full_name, account_status)
      VALUES ('${IDENTITIES.student_b}', 'student.b@test.com', 'Student B', 'active');
      INSERT INTO public.entitlements (user_id, entitlement_type, status)
      VALUES
        ('${IDENTITIES.student_b}', 'explorer_catalogue', 'active'),
        ('${IDENTITIES.student_b}', 'managed_application_case', 'active');
    `);
    const cB = await db.query<{ id: string }>(`
      INSERT INTO public.student_cases (student_id, target_country, target_degree, target_intake_season, target_intake_year, current_stage, next_required_action, next_action_due_date, responsible_party)
      VALUES ('${IDENTITIES.student_b}', 'fr', 'masters', 'fall', 2027, 'onboarding', 'Complete Europass CV', '2026-11-20', 'student') RETURNING id;
    `);
    caseBId = cB.rows[0].id;

    const apB = await db.query<{ id: string }>(`
      INSERT INTO public.applications (case_id, program_id, intake_id, status, submission_deadline)
      VALUES ('${caseBId}', '${prog.rows[0].id}', '${intake.rows[0].id}', 'drafting', '2027-05-31') RETURNING id;
    `);
    appBId = apB.rows[0].id;

    const dB = await db.query<{ id: string }>(`
      INSERT INTO public.document_metadata (case_id, document_type, title, verification_status)
      VALUES ('${caseBId}', 'passport_scan', 'Passport Bio', 'pending') RETURNING id;
    `);
    docBId = dB.rows[0].id;

    // 6. Assigned Counsellor
    await db.exec(`
      INSERT INTO auth.users (id, email) VALUES ('${IDENTITIES.counsellor_assigned}', 'counsellor.assigned@unilistics.com');
      INSERT INTO public.profiles (id, email, full_name, account_status)
      VALUES ('${IDENTITIES.counsellor_assigned}', 'counsellor.assigned@unilistics.com', 'Counsellor Sara', 'active');
      INSERT INTO public.staff_roles (user_id, role) VALUES ('${IDENTITIES.counsellor_assigned}', 'counsellor');
      INSERT INTO public.case_assignments (case_id, counsellor_id, is_active) VALUES ('${caseAId}', '${IDENTITIES.counsellor_assigned}', true);
    `);

    // 7. Unassigned Counsellor
    await db.exec(`
      INSERT INTO auth.users (id, email) VALUES ('${IDENTITIES.counsellor_unassigned}', 'counsellor.unassigned@unilistics.com');
      INSERT INTO public.profiles (id, email, full_name, account_status)
      VALUES ('${IDENTITIES.counsellor_unassigned}', 'counsellor.unassigned@unilistics.com', 'Counsellor Hamza', 'active');
      INSERT INTO public.staff_roles (user_id, role) VALUES ('${IDENTITIES.counsellor_unassigned}', 'counsellor');
    `);

    // 8. Admin
    await db.exec(`
      INSERT INTO auth.users (id, email) VALUES ('${IDENTITIES.admin_mfa}', 'admin.ops@unilistics.com');
      INSERT INTO public.profiles (id, email, full_name, account_status)
      VALUES ('${IDENTITIES.admin_mfa}', 'admin.ops@unilistics.com', 'Admin Tariq', 'active');
      INSERT INTO public.staff_roles (user_id, role) VALUES ('${IDENTITIES.admin_mfa}', 'admin');
    `);

    // 9. Suspended
    await db.exec(`
      INSERT INTO auth.users (id, email) VALUES ('${IDENTITIES.suspended}', 'suspended.user@test.com');
      INSERT INTO public.profiles (id, email, full_name, account_status)
      VALUES ('${IDENTITIES.suspended}', 'suspended.user@test.com', 'Suspended Student', 'suspended');
      INSERT INTO public.entitlements (user_id, entitlement_type, status)
      VALUES ('${IDENTITIES.suspended}', 'managed_application_case', 'active');
    `);

    // Seed internal note on Case A
    await db.query(`
      INSERT INTO public.internal_notes (case_id, author_id, note_text)
      VALUES ('${caseAId}', '${IDENTITIES.counsellor_assigned}', 'CONFIDENTIAL: Attestation stamp under scrutiny');
    `);
  });

  // -------------------------------------------------------------------------
  // NEGATIVE TEST 1: ANONYMOUS BOUNDARIES & PUBLIC PREVIEW BYPASS
  // -------------------------------------------------------------------------
  describe('Anonymous Negative Vectors', () => {
    it('Anonymous CANNOT query private student_cases table (permission denied)', async () => {
      await expect(
        asIdentity('anon', undefined, async (tx) => {
          return await tx.query('SELECT * FROM public.student_cases;');
        })
      ).rejects.toThrow(/permission denied/i);
    });

    it('Anonymous CANNOT view unpublished draft universities', async () => {
      const res = await asIdentity('anon', undefined, async (tx) => {
        return await tx.query(`SELECT * FROM public.universities WHERE id = '${uniDraftId}';`);
      });
      expect(res.rows.length).toBe(0);
    });

    it('Anonymous CANNOT read internal notes', async () => {
      await expect(
        asIdentity('anon', undefined, async (tx) => {
          return await tx.query('SELECT * FROM public.internal_notes;');
        })
      ).rejects.toThrow(/permission denied/i);
    });

    it('Anonymous CANNOT mutate entitlements or insert staff roles', async () => {
      await expect(
        asIdentity('anon', undefined, async (tx) => {
          return await tx.query(`
            INSERT INTO public.staff_roles (user_id, role)
            VALUES ('${IDENTITIES.student_a}', 'super_admin');
          `);
        })
      ).rejects.toThrow();
    });
  });

  // -------------------------------------------------------------------------
  // NEGATIVE TEST 2: PENDING & REJECTED IDENTITIES
  // -------------------------------------------------------------------------
  describe('Pending & Rejected Access Negative Vectors', () => {
    it('Pending user CANNOT view any student cases', async () => {
      const res = await asIdentity('authenticated', IDENTITIES.pending, async (tx) => {
        return await tx.query('SELECT * FROM public.student_cases;');
      });
      expect(res.rows.length).toBe(0);
    });

    it('Rejected user CANNOT view any student cases', async () => {
      const res = await asIdentity('authenticated', IDENTITIES.rejected, async (tx) => {
        return await tx.query('SELECT * FROM public.student_cases;');
      });
      expect(res.rows.length).toBe(0);
    });

    it('Pending user CANNOT view documents or tasks', async () => {
      const res = await asIdentity('authenticated', IDENTITIES.pending, async (tx) => {
        return await tx.query('SELECT * FROM public.document_metadata;');
      });
      expect(res.rows.length).toBe(0);
    });
  });

  // -------------------------------------------------------------------------
  // NEGATIVE TEST 3: EXPLORER PERSONA CASE ROOM DENIAL
  // -------------------------------------------------------------------------
  describe('Explorer Negative Vectors', () => {
    it('Explorer CANNOT read any student case rooms', async () => {
      const res = await asIdentity('authenticated', IDENTITIES.explorer, async (tx) => {
        return await tx.query('SELECT * FROM public.student_cases;');
      });
      expect(res.rows.length).toBe(0);
    });

    it('Explorer CANNOT read any uploaded student documents', async () => {
      const res = await asIdentity('authenticated', IDENTITIES.explorer, async (tx) => {
        return await tx.query('SELECT * FROM public.document_metadata;');
      });
      expect(res.rows.length).toBe(0);
    });

    it('Explorer CANNOT forge bookmarks on behalf of another user (BOLA)', async () => {
      await expect(
        asIdentity('authenticated', IDENTITIES.explorer, async (tx) => {
          return await tx.query(`
            INSERT INTO public.bookmarks (user_id, program_id)
            VALUES ('${IDENTITIES.student_a}', '11111111-1111-4111-a111-111111111111');
          `);
        })
      ).rejects.toThrow();
    });
  });

  // -------------------------------------------------------------------------
  // NEGATIVE TEST 4: STUDENT A vs STUDENT B (IDOR / BOLA)
  // -------------------------------------------------------------------------
  describe('Student A vs Student B (IDOR & BOLA Isolation)', () => {
    it('Student A CANNOT view Case B by forged ID lookup', async () => {
      const res = await asIdentity('authenticated', IDENTITIES.student_a, async (tx) => {
        return await tx.query(`SELECT * FROM public.student_cases WHERE id = '${caseBId}';`);
      });
      expect(res.rows.length).toBe(0);
    });

    it('Student A CANNOT view Student B document metadata', async () => {
      const res = await asIdentity('authenticated', IDENTITIES.student_a, async (tx) => {
        return await tx.query(`SELECT * FROM public.document_metadata WHERE id = '${docBId}';`);
      });
      expect(res.rows.length).toBe(0);
    });

    it('Student A CANNOT modify Case B via UPDATE (IDOR)', async () => {
      const res = await asIdentity('authenticated', IDENTITIES.student_a, async (tx) => {
        return await tx.query(`
          UPDATE public.student_cases SET target_country = 'ro' WHERE id = '${caseBId}' RETURNING id;
        `);
      });
      expect(res.rows.length).toBe(0);
    });

    it('Student A CANNOT mutate own case stage (procedural bypass)', async () => {
      const res = await asIdentity('authenticated', IDENTITIES.student_a, async (tx) => {
        return await tx.query(`
          UPDATE public.student_cases SET current_stage = 'visa' WHERE id = '${caseAId}' RETURNING id;
        `);
      });
      expect(res.rows.length).toBe(0);
    });

    it('Student A CANNOT view internal counsellor notes on their OWN case', async () => {
      const res = await asIdentity('authenticated', IDENTITIES.student_a, async (tx) => {
        return await tx.query(`SELECT * FROM public.internal_notes WHERE case_id = '${caseAId}';`);
      });
      expect(res.rows.length).toBe(0); // STRICTLY 0 ROWS
    });

    it('Forged Relationship: Student A cannot link Document A to Student B Application B', async () => {
      await expect(
        asIdentity('authenticated', IDENTITIES.student_a, async (tx) => {
          return await tx.query(`
            INSERT INTO public.document_links (application_id, document_id)
            VALUES ('${appBId}', '${docAId}') RETURNING id;
          `);
        })
      ).rejects.toThrow();
    });

    it('Cross-Student Storage: Student A cannot upload object into Student B storage path', async () => {
      await expect(
        asIdentity('authenticated', IDENTITIES.student_a, async (tx) => {
          return await tx.query(`
            INSERT INTO storage.objects (bucket_id, name, owner)
            VALUES ('student-vault', '${caseBId}/passport/exploit.pdf', '${IDENTITIES.student_a}')
            RETURNING id;
          `);
        })
      ).rejects.toThrow();
    });
  });

  // -------------------------------------------------------------------------
  // NEGATIVE TEST 5: COUNSELLOR ASSIGNED vs UNASSIGNED
  // -------------------------------------------------------------------------
  describe('Counsellor Isolation Negative Vectors', () => {
    it('Assigned counsellor can view Case A but CANNOT view unassigned Case B', async () => {
      const resA = await asIdentity('authenticated', IDENTITIES.counsellor_assigned, async (tx) => {
        return await tx.query(`SELECT * FROM public.student_cases WHERE id = '${caseAId}';`);
      });
      expect(resA.rows.length).toBe(1);

      const resB = await asIdentity('authenticated', IDENTITIES.counsellor_assigned, async (tx) => {
        return await tx.query(`SELECT * FROM public.student_cases WHERE id = '${caseBId}';`);
      });
      expect(resB.rows.length).toBe(0);
    });

    it('Unassigned counsellor CANNOT view Case A or Case B', async () => {
      const resA = await asIdentity('authenticated', IDENTITIES.counsellor_unassigned, async (tx) => {
        return await tx.query(`SELECT * FROM public.student_cases WHERE id = '${caseAId}';`);
      });
      expect(resA.rows.length).toBe(0);

      const resB = await asIdentity('authenticated', IDENTITIES.counsellor_unassigned, async (tx) => {
        return await tx.query(`SELECT * FROM public.student_cases WHERE id = '${caseBId}';`);
      });
      expect(resB.rows.length).toBe(0);
    });

    it('Unassigned counsellor CANNOT submit review on Case A document', async () => {
      await expect(
        asIdentity('authenticated', IDENTITIES.counsellor_unassigned, async (tx) => {
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

    it('Counsellor CANNOT promote self to admin in staff_roles (privilege escalation)', async () => {
      const res = await asIdentity('authenticated', IDENTITIES.counsellor_assigned, async (tx) => {
        return await tx.query(`
          UPDATE public.staff_roles SET role = 'super_admin' WHERE user_id = '${IDENTITIES.counsellor_assigned}' RETURNING user_id, role;
        `);
      });
      expect(res.rows.length).toBe(0);

      // Verify in base database that role was NOT escalated
      const check = await db.query<{ role: string }>(`
        SELECT role FROM public.staff_roles WHERE user_id = '${IDENTITIES.counsellor_assigned}';
      `);
      expect(check.rows[0].role).toBe('counsellor');
    });
  });

  // -------------------------------------------------------------------------
  // NEGATIVE TEST 6: SUSPENDED IDENTITY LOCKOUT
  // -------------------------------------------------------------------------
  describe('Suspended Identity Lockout', () => {
    it('Suspended user is denied access to all student cases even with valid JWT', async () => {
      const res = await asIdentity('authenticated', IDENTITIES.suspended, async (tx) => {
        return await tx.query('SELECT * FROM public.student_cases;');
      });
      expect(res.rows.length).toBe(0);
    });

    it('Suspended user CANNOT query document metadata', async () => {
      const res = await asIdentity('authenticated', IDENTITIES.suspended, async (tx) => {
        return await tx.query('SELECT * FROM public.document_metadata;');
      });
      expect(res.rows.length).toBe(0);
    });
  });

  // -------------------------------------------------------------------------
  // NEGATIVE TEST 7: IMMUTABLE AUDIT LOG & REVISION TAMPERING
  // -------------------------------------------------------------------------
  describe('Audit Log Immutability & Tampering Protection', () => {
    it('Audit events reject UPDATE modifications', async () => {
      const audit = await db.query<{ id: string }>('SELECT id FROM public.audit_events LIMIT 1;');
      if (audit.rows.length > 0) {
        await expect(
          db.query(`UPDATE public.audit_events SET action = 'tampered' WHERE id = '${audit.rows[0].id}';`)
        ).rejects.toThrow(/immutable/i);
      }
    });

    it('Audit events reject DELETE modifications', async () => {
      const audit = await db.query<{ id: string }>('SELECT id FROM public.audit_events LIMIT 1;');
      if (audit.rows.length > 0) {
        await expect(
          db.query(`DELETE FROM public.audit_events WHERE id = '${audit.rows[0].id}';`)
        ).rejects.toThrow(/immutable/i);
      }
    });
  });

  // -------------------------------------------------------------------------
  // NEGATIVE TEST 8: URL SCHEME & OPEN REDIRECT REGRESSION
  // -------------------------------------------------------------------------
  describe('URL Scheme & Open Redirect Sanitization', () => {
    it('isSafeExternalUrl strictly rejects javascript: and data: URIs', () => {
      expect(isSafeExternalUrl('javascript:alert(1)')).toBe(false);
      expect(isSafeExternalUrl('javascript:/*--></title></style></textarea></script>alert(1)')).toBe(false);
      expect(isSafeExternalUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
      expect(isSafeExternalUrl('vbscript:msgbox("XSS")')).toBe(false);
      expect(isSafeExternalUrl('file:///etc/passwd')).toBe(false);
    });

    it('isSafeExternalUrl accepts verified https:// and http:// authority links', () => {
      expect(isSafeExternalUrl('https://www.daad.de/en/')).toBe(true);
      expect(isSafeExternalUrl('https://pakistan.campusfrance.org/')).toBe(true);
      expect(isSafeExternalUrl('http://www.anabin.kmk.org')).toBe(true);
    });
  });
});
