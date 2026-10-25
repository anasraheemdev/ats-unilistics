// @vitest-environment node
import { describe, it, expect, beforeAll } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import fs from 'fs';
import path from 'path';
import { initializeTestSupabaseEnvironment } from './helpers/supabaseTestHarness';

describe('Access Requests Lifecycle, Entry Paths & Privileged Auth Flows', () => {
  let db: PGlite;

  const TEST_USERS = {
    admin: '11111111-1111-4111-a111-111111111111',
    counsellor: '22222222-2222-4222-a222-222222222222',
    existing_explorer: '33333333-3333-4333-a333-333333333333',
    suspended_user: '44444444-4444-4444-a444-444444444444',
  };

  async function asPersona<T = any>(
    role: 'anon' | 'authenticated',
    userId?: string,
    aal: 'aal1' | 'aal2' = 'aal2',
    queryFn?: (tx: PGlite) => Promise<T>
  ): Promise<T> {
    await db.exec(`SET ROLE ${role};`);
    if (userId) {
      await db.exec(
        `SET "request.jwt.claim.sub" = '${userId}'; SET "request.jwt.claim.role" = '${role}'; SET "request.jwt.claim.aal" = '${aal}';`
      );
    } else {
      await db.exec(`SET "request.jwt.claim.sub" = ''; SET "request.jwt.claim.role" = 'anon'; SET "request.jwt.claim.aal" = '';`);
    }

    try {
      if (queryFn) {
        return await queryFn(db);
      }
      return undefined as any;
    } finally {
      await db.exec('RESET ROLE; RESET "request.jwt.claim.sub"; RESET "request.jwt.claim.role"; RESET "request.jwt.claim.aal";');
    }
  }

  beforeAll(async () => {
    db = new PGlite();
    await initializeTestSupabaseEnvironment(db);

    // Apply all migrations 001 - 009 in strict order
    const migrationsDir = path.resolve(__dirname, '../../supabase/migrations');
    const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();

    for (const file of files) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      await db.exec(sql);
    }

    // Seed baseline countries for student_cases foreign key constraints
    await db.exec(`
      INSERT INTO public.countries (code, name, visa_authority) VALUES
        ('de', 'Germany', 'German Embassy Islamabad'),
        ('fr', 'France', 'Campus France / French Consulate'),
        ('it', 'Italy', 'Italian Embassy Islamabad'),
        ('ro', 'Romania', 'Romanian Embassy Islamabad')
      ON CONFLICT DO NOTHING;
    `);

    // Seed test users: Admin and Existing Explorer
    await db.exec(`
      INSERT INTO auth.users (id, email) VALUES
        ('${TEST_USERS.admin}', 'admin@unilistics.com'),
        ('${TEST_USERS.counsellor}', 'sara.counsellor@unilistics.com'),
        ('${TEST_USERS.existing_explorer}', 'explorer.user@test.com'),
        ('${TEST_USERS.suspended_user}', 'suspended@test.com')
      ON CONFLICT DO NOTHING;

      INSERT INTO public.profiles (id, email, full_name, account_status) VALUES
        ('${TEST_USERS.admin}', 'admin@unilistics.com', 'Operations Admin', 'active'),
        ('${TEST_USERS.counsellor}', 'sara.counsellor@unilistics.com', 'Sara Ahmed', 'active'),
        ('${TEST_USERS.existing_explorer}', 'explorer.user@test.com', 'Usman Tariq', 'active'),
        ('${TEST_USERS.suspended_user}', 'suspended@test.com', 'Suspended Student', 'suspended')
      ON CONFLICT DO NOTHING;

      INSERT INTO public.staff_roles (user_id, role) VALUES
        ('${TEST_USERS.admin}', 'admin'),
        ('${TEST_USERS.counsellor}', 'counsellor')
      ON CONFLICT DO NOTHING;

      -- Existing explorer has only explorer_catalogue entitlement
      INSERT INTO public.entitlements (user_id, entitlement_type, status, granted_by) VALUES
        ('${TEST_USERS.existing_explorer}', 'explorer_catalogue', 'active', '${TEST_USERS.admin}')
      ON CONFLICT DO NOTHING;
    `);
  });

  // =========================================================================
  // 1. TWO ENTRY PATHS
  // =========================================================================
  describe('Entry Path 1 & 2: Signup Request Submission', () => {
    let explorerReqId: string;
    let explorerToken: string;

    it('Entry Path 1: "Explore all universities" creates approval request in email_verification_pending', async () => {
      const res = await db.query<{ submit_access_request: any }>(`
        SELECT public.submit_access_request(
          'Bilal Ahmed',
          'bilal.explorer@test.com',
          '+923001234567',
          ARRAY['germany', 'france'],
          'explorer_catalogue',
          true,
          false
        );
      `);

      const result = res.rows[0].submit_access_request;
      expect(result.success).toBe(true);
      expect(result.status).toBe('email_verification_pending');
      expect(result.request_id).toBeDefined();
      expect(result.verification_token).toBeDefined();

      explorerReqId = result.request_id;
      explorerToken = result.verification_token;

      // Verify email queued in outbox_emails
      const outbox = await db.query<{ id: string; email_type: string }>(`
        SELECT * FROM public.outbox_emails WHERE request_id = '${explorerReqId}';
      `);
      expect(outbox.rows.length).toBe(1);
      expect(outbox.rows[0].email_type).toBe('email_verification');
    });

    it('Entry Path 2: "Get help with my applications" creates managed support request', async () => {
      const res = await db.query<{ submit_access_request: any }>(`
        SELECT public.submit_access_request(
          'Fatima Khan',
          'fatima.managed@test.com',
          NULL,
          ARRAY['italy'],
          'managed_application_case',
          true,
          false
        );
      `);

      const result = res.rows[0].submit_access_request;
      expect(result.success).toBe(true);
      expect(result.status).toBe('email_verification_pending');
      expect(result.request_id).toBeDefined();
      const managedReqId = result.request_id;
      expect(managedReqId).toBeTruthy();
    });

    it('Submitting request without required consent is strictly rejected', async () => {
      await expect(
        db.query(`
          SELECT public.submit_access_request(
            'Incomplete User',
            'noconsent@test.com',
            NULL,
            ARRAY['germany'],
            'explorer_catalogue',
            false
          );
        `)
      ).rejects.toThrow(/consent/i);
    });

    it('Email verification token transition: moves request from email_verification_pending to pending_review', async () => {
      const res = await db.query<{ verify_request_email: any }>(`
        SELECT public.verify_request_email('${explorerReqId}', '${explorerToken}');
      `);

      const result = res.rows[0].verify_request_email;
      expect(result.success).toBe(true);
      expect(result.status).toBe('pending_review');

      const check = await db.query<{ status: string }>(`
        SELECT status FROM public.access_requests WHERE id = '${explorerReqId}';
      `);
      expect(check.rows[0].status).toBe('pending_review');
    });
  });

  // =========================================================================
  // 2. PENDING ACCESS DENIAL & RLS GATING
  // =========================================================================
  describe('Pending Denial & Entitlement Gating', () => {
    it('Anonymous user or pending applicant cannot access private student cases', async () => {
      await expect(
        asPersona('anon', undefined, 'aal1', async (tx) => {
          return await tx.query('SELECT * FROM public.student_cases;');
        })
      ).rejects.toThrow();
    });

    it('Pending applicant cannot read other users private access requests', async () => {
      const pendingUserId = '55555555-5555-4555-a555-555555555555';
      await db.exec(`
        INSERT INTO auth.users (id, email) VALUES ('${pendingUserId}', 'pending.student@test.com') ON CONFLICT DO NOTHING;
        INSERT INTO public.profiles (id, email, full_name, account_status)
        VALUES ('${pendingUserId}', 'pending.student@test.com', 'Pending Student', 'pending') ON CONFLICT DO NOTHING;
      `);

      const res = await asPersona('authenticated', pendingUserId, 'aal1', async (tx) => {
        return await tx.query('SELECT * FROM public.access_requests;');
      });
      // Can only see their own, not other applicants
      expect(res.rows.every((r: any) => r.email === 'pending.student@test.com')).toBe(true);
    });
  });

  // =========================================================================
  // 3. ADMIN REVIEW: APPROVAL, IDEMPOTENCY & OUTBOX ENQUEUE
  // =========================================================================
  describe('Admin Review & Activation Enqueue', () => {
    let pendingReqId: string;
    let activationToken: string;

    beforeAll(async () => {
      const createRes = await db.query<{ id: string }>(`
        INSERT INTO public.access_requests (
          full_name, email, requested_entitlement, target_country, consent_privacy, status
        ) VALUES (
          'Tariq Mehmood', 'tariq.mehmood@test.com', 'managed_application_case', 'germany', true, 'pending_review'
        ) RETURNING id;
      `);
      pendingReqId = createRes.rows[0].id;
    });

    it('Admin with AAL2 MFA approves managed request, creates case room, and enqueues activation email', async () => {
      const res = await asPersona('authenticated', TEST_USERS.admin, 'aal2', async (tx) => {
        return await tx.query<{ admin_approve_access_request: any }>(`
          SELECT public.admin_approve_access_request('${pendingReqId}', 'managed_application_case', 'Verified via HEC ticket');
        `);
      });

      const result = res.rows[0].admin_approve_access_request;
      expect(result.success).toBe(true);
      expect(result.activation_token).toBeDefined();
      activationToken = result.activation_token;

      // Verify request marked approved
      const reqCheck = await db.query<{ status: string; internal_notes: string }>(`
        SELECT status, internal_notes FROM public.access_requests WHERE id = '${pendingReqId}';
      `);
      expect(reqCheck.rows[0].status).toBe('approved');
      expect(reqCheck.rows[0].internal_notes).toBe('Verified via HEC ticket');

      // Verify activation email enqueued in outbox_emails
      const emailCheck = await db.query<{ delivery_status: string; link_url: string }>(`
        SELECT delivery_status, link_url FROM public.outbox_emails
        WHERE request_id = '${pendingReqId}' AND email_type = 'activation_invite';
      `);
      expect(emailCheck.rows.length).toBe(1);
      expect(emailCheck.rows[0].link_url).toContain(activationToken);
    });

    it('Duplicate approval is strictly idempotent and does NOT duplicate records', async () => {
      const res = await asPersona('authenticated', TEST_USERS.admin, 'aal2', async (tx) => {
        return await tx.query<{ admin_approve_access_request: any }>(`
          SELECT public.admin_approve_access_request('${pendingReqId}', 'managed_application_case');
        `);
      });

      const result = res.rows[0].admin_approve_access_request;
      expect(result.success).toBe(true);
      expect(result.already_approved).toBe(true);

      // Verify only 1 student case exists for this user
      const cases = await db.query<{ count: string }>(`
        SELECT COUNT(*) as count FROM public.student_cases
        WHERE student_id = (SELECT user_id FROM public.access_requests WHERE id = '${pendingReqId}');
      `);
      expect(parseInt(cases.rows[0].count, 10)).toBe(1);
    });

    it('Controlled resend of activation email updates token and enqueues fresh delivery', async () => {
      const res = await asPersona('authenticated', TEST_USERS.admin, 'aal2', async (tx) => {
        return await tx.query<{ admin_resend_activation_email: any }>(`
          SELECT public.admin_resend_activation_email('${pendingReqId}');
        `);
      });

      const result = res.rows[0].admin_resend_activation_email;
      expect(result.success).toBe(true);
      expect(result.token).toBeDefined();

      const emails = await db.query<{ count: string }>(`
        SELECT COUNT(*) as count FROM public.outbox_emails
        WHERE request_id = '${pendingReqId}' AND email_type = 'activation_invite';
      `);
      expect(parseInt(emails.rows[0].count, 10)).toBe(2);
    });
  });

  // =========================================================================
  // 4. EXISTING EXPLORER UPGRADE TO MANAGED SUPPORT
  // =========================================================================
  describe('Existing Explorer Upgrade Request', () => {
    let upgradeReqId: string;

    it('Approved explorer requests upgrade to managed support without losing explorer entitlement', async () => {
      const res = await db.query<{ submit_access_request: any }>(`
        SELECT public.submit_access_request(
          'Usman Tariq',
          'explorer.user@test.com',
          '+923009999999',
          ARRAY['france'],
          'managed_application_case',
          true,
          true,
          'Shortlisted Sorbonne M.Sc.; requesting dossier review'
        );
      `);

      const result = res.rows[0].submit_access_request;
      expect(result.success).toBe(true);
      expect(result.status).toBe('pending_review'); // Existing verified user enters pending_review directly
      upgradeReqId = result.request_id;

      // Verify existing explorer entitlement is intact
      const entCheck = await db.query<{ status: string }>(`
        SELECT status FROM public.entitlements
        WHERE user_id = '${TEST_USERS.existing_explorer}' AND entitlement_type = 'explorer_catalogue';
      `);
      expect(entCheck.rows.length).toBe(1);
      expect(entCheck.rows[0].status).toBe('active');
    });

    it('Admin approval grants managed support entitlement while preserving explorer catalogue access', async () => {
      await asPersona('authenticated', TEST_USERS.admin, 'aal2', async (tx) => {
        await tx.query(`
          SELECT public.admin_approve_access_request('${upgradeReqId}', 'managed_application_case');
        `);
      });

      // User now has BOTH entitlements active
      const ents = await db.query<{ entitlement_type: string; status: string }>(`
        SELECT entitlement_type, status FROM public.entitlements
        WHERE user_id = '${TEST_USERS.existing_explorer}' AND status = 'active'
        ORDER BY entitlement_type;
      `);
      expect(ents.rows.length).toBe(2);
      expect(ents.rows.map((r) => r.entitlement_type)).toEqual(['explorer_catalogue', 'managed_application_case']);
    });
  });

  // =========================================================================
  // 5. REJECTION & NEEDS INFORMATION FLOWS
  // =========================================================================
  describe('Needs Information, Student Response & Rejection', () => {
    let testReqId: string;

    beforeAll(async () => {
      const res = await db.query<{ id: string }>(`
        INSERT INTO public.access_requests (
          full_name, email, requested_entitlement, target_country, consent_privacy, status
        ) VALUES (
          'Kamran Akmal', 'kamran@test.com', 'explorer_catalogue', 'germany', true, 'pending_review'
        ) RETURNING id;
      `);
      testReqId = res.rows[0].id;
    });

    it('Admin can request information with student-visible explanation', async () => {
      await asPersona('authenticated', TEST_USERS.admin, 'aal2', async (tx) => {
        await tx.query(`
          SELECT public.admin_request_information(
            '${testReqId}',
            'Please specify which engineering sub-discipline you are seeking admission for.',
            'Counsellor review note: missing target major'
          );
        `);
      });

      const check = await db.query<{ status: string; staff_explanation: string }>(`
        SELECT status, staff_explanation FROM public.access_requests WHERE id = '${testReqId}';
      `);
      expect(check.rows[0].status).toBe('needs_information');
      expect(check.rows[0].staff_explanation).toContain('engineering sub-discipline');
    });

    it('Student responds to information request, moving status back to pending_review', async () => {
      const res = await db.query<{ respond_to_information_request: any }>(`
        SELECT public.respond_to_information_request(
          '${testReqId}',
          'Intending to apply for M.Sc. Renewable Energy Systems.'
        );
      `);

      expect(res.rows[0].respond_to_information_request.status).toBe('pending_review');
    });

    it('Admin can reject request with an appropriate student-visible reason', async () => {
      await asPersona('authenticated', TEST_USERS.admin, 'aal2', async (tx) => {
        await tx.query(`
          SELECT public.admin_reject_access_request(
            '${testReqId}',
            'Target degree requires B2 German language certificate which is not yet present.',
            'Rejecting: no German certification'
          );
        `);
      });

      const check = await db.query<{ status: string; staff_explanation: string }>(`
        SELECT status, staff_explanation FROM public.access_requests WHERE id = '${testReqId}';
      `);
      expect(check.rows[0].status).toBe('rejected');
      expect(check.rows[0].staff_explanation).toContain('B2 German');
    });
  });

  // =========================================================================
  // 6. STAFF MFA ENFORCEMENT & SUPER ADMIN BOOTSTRAP
  // =========================================================================
  describe('Staff MFA & First Super Admin Bootstrap', () => {
    let dummyReqId: string;

    beforeAll(async () => {
      const res = await db.query<{ id: string }>(`
        INSERT INTO public.access_requests (
          full_name, email, requested_entitlement, target_country, consent_privacy, status
        ) VALUES (
          'MFA Test Applicant', 'mfatest@test.com', 'explorer_catalogue', 'germany', true, 'pending_review'
        ) RETURNING id;
      `);
      dummyReqId = res.rows[0].id;
    });

    it('Privileged admin action called with AAL1 (no MFA) is strictly rejected', async () => {
      await expect(
        asPersona('authenticated', TEST_USERS.admin, 'aal1', async (tx) => {
          return await tx.query(`
            SELECT public.admin_approve_access_request('${dummyReqId}');
          `);
        })
      ).rejects.toThrow(/MFA \/ AAL2/i);
    });

    it('Operator-only bootstrap succeeds when 0 super admins exist, and rejects second call', async () => {
      const superAdminId = '99999999-9999-4999-a999-999999999999';

      // First bootstrap
      const bootRes = await db.query<{ bootstrap_initial_super_admin: any }>(`
        SELECT public.bootstrap_initial_super_admin(
          '${superAdminId}',
          'first.superadmin@unilistics.com',
          'Chief Operator',
          'super-secure-bootstrap-key-2026'
        );
      `);
      expect(bootRes.rows[0].bootstrap_initial_super_admin.success).toBe(true);

      // Verify super admin role exists
      const roleCheck = await db.query<{ role: string }>(`
        SELECT role FROM public.staff_roles WHERE user_id = '${superAdminId}';
      `);
      expect(roleCheck.rows[0].role).toBe('super_admin');

      // Second bootstrap attempt is strictly blocked
      const secondId = '88888888-8888-4888-a888-888888888888';
      await expect(
        db.query(`
          SELECT public.bootstrap_initial_super_admin(
            '${secondId}',
            'hacker@unilistics.com',
            'Malicious Super Admin',
            'super-secure-bootstrap-key-2026'
          );
        `)
      ).rejects.toThrow(/Bootstrap is disabled/i);
    });
  });

  // =========================================================================
  // 7. SUSPENSION ENFORCEMENT
  // =========================================================================
  describe('Account Suspension Enforcement', () => {
    it('Suspended user is denied access to student cases and entitlements', async () => {
      const res = await asPersona('authenticated', TEST_USERS.suspended_user, 'aal1', async (tx) => {
        return await tx.query('SELECT * FROM public.student_cases;');
      });
      expect(res.rows.length).toBe(0);
    });
  });
});
