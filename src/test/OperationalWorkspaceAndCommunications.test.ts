// @vitest-environment node
import { describe, it, expect, beforeAll } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import * as fs from 'fs';
import * as path from 'path';
import { initializeTestSupabaseEnvironment } from './helpers/supabaseTestHarness';
import {
  validateEmailPayloadPrivacy,
  sanitizeMessageText,
  formatUtcInTimezone,
  formatDeadlineDateOnly,
} from '../lib/api';

describe('Operational Admin Workspace, Case Messaging, Support Desk & Durable Outbox', () => {
  let db: PGlite;

  const TEST_USERS = {
    super_admin: '11111111-1111-4111-a111-111111111111',
    admin: '22222222-2222-4222-a222-222222222222',
    counsellor_sara: '33333333-3333-4333-a333-333333333333',
    counsellor_other: '44444444-4444-4444-a444-444444444444',
    student_a: '55555555-5555-4555-a555-555555555555',
    student_b: '66666666-6666-4666-a666-666666666666',
    explorer: '77777777-7777-4777-a777-777777777777',
  };

  let caseAId: string;
  let caseBId: string;
  let docAId: string;
  let docBId: string;

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
      { id: TEST_USERS.counsellor_other, email: 'other.counsellor@unilistics.local', name: 'Usman Other', staffRole: 'counsellor' },
      { id: TEST_USERS.student_a, email: 'student.a@test.com', name: 'Student A' },
      { id: TEST_USERS.student_b, email: 'student.b@test.com', name: 'Student B' },
      { id: TEST_USERS.explorer, email: 'explorer.user@test.com', name: 'Explorer User' },
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
          INSERT INTO public.staff_roles (user_id, role, assigned_by)
          VALUES ('${p.id}', '${p.staffRole}', '${TEST_USERS.super_admin}')
          ON CONFLICT (user_id) DO UPDATE SET role = '${p.staffRole}';
        `);
      }
    }

    // Seed Countries & Universities
    await db.exec(`
      INSERT INTO public.countries (code, name, visa_authority) VALUES
      ('de', 'Germany', 'German Embassy Islamabad'),
      ('it', 'Italy', 'Italian Embassy Islamabad')
      ON CONFLICT DO NOTHING;

      INSERT INTO public.universities (id, country_code, name, city, institution_type, publication_status)
      VALUES ('11111111-2222-3333-4444-555555555555', 'de', 'TU Munich', 'Munich', 'public', 'published')
      ON CONFLICT DO NOTHING;

      INSERT INTO public.programs (id, university_id, name, degree_level, teaching_language, tuition_type, application_portal, publication_status)
      VALUES ('22222222-3333-4444-5555-666666666666', '11111111-2222-3333-4444-555555555555', 'M.Sc. Informatics', 'masters', 'english', 'free', 'uni_assist', 'published')
      ON CONFLICT DO NOTHING;

      INSERT INTO public.intakes (id, program_id, season, academic_year, deadline_date, publication_status)
      VALUES ('33333333-4444-5555-6666-777777777777', '22222222-3333-4444-5555-666666666666', 'winter', 2027, '2027-05-31', 'published')
      ON CONFLICT DO NOTHING;
    `);

    // Entitlements: Student A and Student B have managed cases, Explorer has explorer_access only
    for (const sid of [TEST_USERS.student_a, TEST_USERS.student_b]) {
      await db.exec(`
        INSERT INTO public.entitlements (user_id, entitlement_type, status, granted_by)
        VALUES ('${sid}', 'managed_application_case', 'active', '${TEST_USERS.admin}')
        ON CONFLICT (user_id, entitlement_type) DO UPDATE SET status = 'active';
      `);
    }

    await db.exec(`
      INSERT INTO public.entitlements (user_id, entitlement_type, status, granted_by)
      VALUES ('${TEST_USERS.explorer}', 'explorer_catalogue', 'active', '${TEST_USERS.admin}')
      ON CONFLICT (user_id, entitlement_type) DO UPDATE SET status = 'active';
    `);

    // Create Case A (assigned to Sara) and Case B (unassigned)
    const caseARes = await db.query<{ id: string }>(`
      INSERT INTO public.student_cases (
        student_id, target_country, target_degree, target_intake_season, target_intake_year,
        current_stage, next_required_action, next_action_due_date, responsible_party, onboarding_status,
        updated_at
      ) VALUES (
        '${TEST_USERS.student_a}', 'de', 'masters', 'winter', 2027,
        'attestation', 'Submit Degree Attestation', CURRENT_DATE - 2, 'student', 'completed',
        NOW() - INTERVAL '10 days'
      ) RETURNING id;
    `);
    caseAId = caseARes.rows[0].id;

    const caseBRes = await db.query<{ id: string }>(`
      INSERT INTO public.student_cases (
        student_id, target_country, target_degree, target_intake_season, target_intake_year,
        current_stage, next_required_action, next_action_due_date, responsible_party, onboarding_status,
        updated_at
      ) VALUES (
        '${TEST_USERS.student_b}', 'it', 'masters', 'winter', 2027,
        'attestation', 'Upload Passport Scan', CURRENT_DATE + 5, 'student', 'completed',
        NOW()
      ) RETURNING id;
    `);
    caseBId = caseBRes.rows[0].id;

    // Case A assigned to Sara; Case B remains unassigned
    await db.exec(`
      INSERT INTO public.case_assignments (case_id, counsellor_id, assigned_by)
      VALUES ('${caseAId}', '${TEST_USERS.counsellor_sara}', '${TEST_USERS.admin}');
    `);

    // Add an access request awaiting review
    await db.exec(`
      INSERT INTO public.access_requests (email, full_name, requested_entitlement, target_country, status)
      VALUES ('prospective.student@test.com', 'Prospective Student', 'managed_application_case', 'germany', 'pending_review');
    `);

    // Add Documents: Doc A to Case A (ready_for_review), Doc B to Case B
    // Add Documents to document_metadata: Doc A to Case A, Doc B to Case B
    const docARes = await db.query<{ id: string }>(`
      INSERT INTO public.document_metadata (
        case_id, document_type, title, verification_status
      ) VALUES (
        '${caseAId}', 'hec_attestation', 'HEC Degree Attestation', 'pending'
      ) RETURNING id;
    `);
    docAId = docARes.rows[0].id;

    const docBRes = await db.query<{ id: string }>(`
      INSERT INTO public.document_metadata (
        case_id, document_type, title, verification_status
      ) VALUES (
        '${caseBId}', 'passport_scan', 'Passport Scan', 'pending'
      ) RETURNING id;
    `);
    docBId = docBRes.rows[0].id;

    // Add an overdue task to public.tasks for Case A
    await db.exec(`
      INSERT INTO public.tasks (
        case_id, title, assigned_to_role, status, category, due_date
      ) VALUES (
        '${caseAId}', 'Submit HEC attestation receipt', 'student', 'pending', 'attestation', CURRENT_DATE - 2
      );
    `);

    // Seed a failed notification in outbox
    await db.exec(`
      INSERT INTO public.outbox (
        event_type, recipient_email, subject, payload, status, retry_count, max_retries, failed_at, last_error
      ) VALUES (
        'task_due', 'student.a@test.com', 'Overdue task reminder',
        '{"user_id": "${TEST_USERS.student_a}", "body_text": "Please submit your attestation"}'::jsonb,
        'failed', 3, 3, NOW(), 'Simulated carrier bounce 550 User unknown'
      );
    `);
  });

  describe('1. Operational Workspace Real KPI Metrics & Counsellor Scoping', () => {
    it('Admin sees global operational metrics reflecting real database rows', async () => {
      const metrics = await asPersona('authenticated', TEST_USERS.admin, async (tx) => {
        const res = await tx.query<any>('SELECT public.get_operational_workspace_metrics() as metrics');
        return res.rows[0].metrics;
      });

      expect(metrics).toBeDefined();
      expect(Number(metrics.requests_awaiting_review)).toBeGreaterThanOrEqual(1);
      expect(Number(metrics.unassigned_cases)).toBeGreaterThanOrEqual(1); // Case B
      expect(Number(metrics.overdue_tasks)).toBeGreaterThanOrEqual(1); // Case A next_action_due_date was 2 days ago
      expect(Number(metrics.documents_awaiting_review)).toBeGreaterThanOrEqual(2); // Doc A and Doc B
      expect(Number(metrics.cases_without_recent_updates)).toBeGreaterThanOrEqual(1); // Case A updated 10 days ago
      expect(Number(metrics.failed_notifications)).toBeGreaterThanOrEqual(1); // Failed outbox item
    });

    it('Counsellor Sara sees strictly metrics scoped to her assigned cases', async () => {
      const metrics = await asPersona('authenticated', TEST_USERS.counsellor_sara, async (tx) => {
        const res = await tx.query<any>('SELECT public.get_operational_workspace_metrics() as metrics');
        return res.rows[0].metrics;
      });

      expect(metrics).toBeDefined();
      // Counsellor has zero visibility into unassigned cases or global access requests
      expect(Number(metrics.requests_awaiting_review)).toBe(0);
      expect(Number(metrics.unassigned_cases)).toBe(0);
      expect(Number(metrics.failed_notifications)).toBe(0);

      // Counsellor sees strictly Case A metrics
      expect(Number(metrics.overdue_tasks)).toBe(1); // Case A is assigned to Sara and overdue
      expect(Number(metrics.documents_awaiting_review)).toBe(1); // Doc A only (Doc B belongs to Case B)
      expect(Number(metrics.cases_without_recent_updates)).toBe(1); // Case A only
    });

    it('Other unassigned counsellor sees 0 for all operational metrics', async () => {
      const metrics = await asPersona('authenticated', TEST_USERS.counsellor_other, async (tx) => {
        const res = await tx.query<any>('SELECT public.get_operational_workspace_metrics() as metrics');
        return res.rows[0].metrics;
      });

      expect(Number(metrics.requests_awaiting_review)).toBe(0);
      expect(Number(metrics.unassigned_cases)).toBe(0);
      expect(Number(metrics.overdue_tasks)).toBe(0);
      expect(Number(metrics.documents_awaiting_review)).toBe(0);
      expect(Number(metrics.cases_without_recent_updates)).toBe(0);
      expect(Number(metrics.failed_notifications)).toBe(0);
    });

    it('Operational worklist items are accurately filtered by category and counsellor scope', async () => {
      // Admin queries overdue_tasks worklist
      const adminWorklist = await asPersona('authenticated', TEST_USERS.admin, async (tx) => {
        const res = await tx.query<any>(
          "SELECT public.get_operational_worklist('overdue_tasks') as worklist"
        );
        return res.rows[0].worklist || [];
      });
      expect(adminWorklist.some((item: any) => item.case_id === caseAId)).toBe(true);

      // Counsellor Sara queries overdue_tasks worklist
      const saraWorklist = await asPersona('authenticated', TEST_USERS.counsellor_sara, async (tx) => {
        const res = await tx.query<any>(
          "SELECT public.get_operational_worklist('overdue_tasks') as worklist"
        );
        return res.rows[0].worklist || [];
      });
      expect(saraWorklist.some((item: any) => item.case_id === caseAId)).toBe(true);

      // Unassigned counsellor queries overdue_tasks: receives empty array
      const otherWorklist = await asPersona('authenticated', TEST_USERS.counsellor_other, async (tx) => {
        const res = await tx.query<any>(
          "SELECT public.get_operational_worklist('overdue_tasks') as worklist"
        );
        return res.rows[0].worklist || [];
      });
      expect(otherWorklist.length).toBe(0);
    });
  });

  describe('2. Case Messaging, Staff Notes & Anti-Forgery Attachment Protection', () => {
    it('Staff can record a student-visible message and an internal staff note', async () => {
      // 1. Staff records student-visible message
      await asPersona('authenticated', TEST_USERS.counsellor_sara, async (tx) => {
        await tx.exec(`
          INSERT INTO public.messages (case_id, sender_id, content)
          VALUES ('${caseAId}', '${TEST_USERS.counsellor_sara}', 'Your transcripts have been reviewed.');
        `);
      });

      // 2. Staff records internal staff note in private internal_notes table
      await asPersona('authenticated', TEST_USERS.counsellor_sara, async (tx) => {
        await tx.exec(`
          INSERT INTO public.internal_notes (case_id, author_id, note_text)
          VALUES ('${caseAId}', '${TEST_USERS.counsellor_sara}', 'Internal note: Verify MOFA seal authenticity with Islamabad office.');
        `);
      });

      // 3. Student A queries messages: receives student-visible message
      const studentMessages = await asPersona('authenticated', TEST_USERS.student_a, async (tx) => {
        const res = await tx.query<any>(
          `SELECT * FROM public.messages WHERE case_id = '${caseAId}'`
        );
        return res.rows;
      });

      expect(studentMessages.length).toBe(1);
      expect(studentMessages[0].content).toContain('Your transcripts have been reviewed.');

      // Student A attempts to query internal_notes: receives 0 rows (strictly barred by RLS)
      const studentNotes = await asPersona('authenticated', TEST_USERS.student_a, async (tx) => {
        const res = await tx.query<any>(
          `SELECT * FROM public.internal_notes WHERE case_id = '${caseAId}'`
        );
        return res.rows;
      });
      expect(studentNotes.length).toBe(0);

      // 4. Counsellor Sara queries internal notes: receives the staff-only note
      const counsellorNotes = await asPersona('authenticated', TEST_USERS.counsellor_sara, async (tx) => {
        const res = await tx.query<any>(
          `SELECT * FROM public.internal_notes WHERE case_id = '${caseAId}' ORDER BY created_at ASC`
        );
        return res.rows;
      });
      expect(counsellorNotes.length).toBe(1);
      expect(counsellorNotes[0].note_text).toContain('MOFA seal authenticity');
    });

    it('Cross-Case Attachment Anti-Forgery: cannot attach Document B to Case A message', async () => {
      // Attempt to attach Document B (which belongs to Case B) to a message in Case A
      await expect(
        asPersona('authenticated', TEST_USERS.counsellor_sara, async (tx) => {
          await tx.exec(`
            INSERT INTO public.messages (case_id, sender_id, content, attachment_document_id)
            VALUES ('${caseAId}', '${TEST_USERS.counsellor_sara}', 'Forged attachment test', '${docBId}');
          `);
        })
      ).rejects.toThrow(/Cross-case message attachment injection is forbidden/);

      // Attaching Document A (which belongs to Case A) to Case A succeeds
      const successMsg = await asPersona('authenticated', TEST_USERS.counsellor_sara, async (tx) => {
        const res = await tx.query<any>(`
          INSERT INTO public.messages (case_id, sender_id, content, attachment_document_id)
          VALUES ('${caseAId}', '${TEST_USERS.counsellor_sara}', 'Valid attachment test', '${docAId}')
          RETURNING id;
        `);
        return res.rows[0];
      });
      expect(successMsg.id).toBeDefined();
    });

    it('Message sanitization utility neutralizes HTML scripts and dangerous tags', () => {
      const maliciousInput = '<script>alert("XSS")</script>Hello <b>World</b><img src=x onerror=alert(1)>';
      const sanitized = sanitizeMessageText(maliciousInput);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('onerror=');
      expect(sanitized).toContain('Hello');
    });
  });

  describe('3. Support Desk & Explorer Thread Isolation', () => {
    let supportTicketId: string;

    it('Explorer can create a support request and converse in support ticket thread', async () => {
      const ticketRes = await asPersona('authenticated', TEST_USERS.explorer, async (tx) => {
        const res = await tx.query<any>(`
          INSERT INTO public.support_requests (user_id, subject, category, priority, status)
          VALUES ('${TEST_USERS.explorer}', 'Eligibility question for TU Munich', 'general', 'normal', 'open')
          RETURNING id;
        `);
        return res.rows[0];
      });
      supportTicketId = ticketRes.id;
      expect(supportTicketId).toBeDefined();

      // Explorer adds message to support ticket
      await asPersona('authenticated', TEST_USERS.explorer, async (tx) => {
        await tx.exec(`
          INSERT INTO public.support_messages (request_id, sender_id, message_body)
          VALUES ('${supportTicketId}', '${TEST_USERS.explorer}', 'Does TU Munich require GRE for Pakistani CS graduates?');
        `);
      });

      // Explorer reads their support ticket messages
      const msgs = await asPersona('authenticated', TEST_USERS.explorer, async (tx) => {
        const res = await tx.query<any>(
          `SELECT * FROM public.support_messages WHERE request_id = '${supportTicketId}'`
        );
        return res.rows;
      });
      expect(msgs.length).toBe(1);
      expect(msgs[0].message_body).toContain('GRE for Pakistani CS graduates');
    });

    it('Strict Isolation: Explorer is blocked from reading or inserting into student cases or case messages', async () => {
      // Explorer queries student_cases
      const cases = await asPersona('authenticated', TEST_USERS.explorer, async (tx) => {
        const res = await tx.query<any>('SELECT * FROM public.student_cases');
        return res.rows;
      });
      expect(cases.length).toBe(0);

      // Explorer attempts to insert into managed case messages
      await expect(
        asPersona('authenticated', TEST_USERS.explorer, async (tx) => {
          await tx.exec(`
            INSERT INTO public.messages (case_id, sender_id, content)
            VALUES ('${caseAId}', '${TEST_USERS.explorer}', 'Unauthorized explorer intrusion');
          `);
        })
      ).rejects.toThrow();
    });

    it('Staff can view support requests and respond with guidance', async () => {
      // Admin views support requests
      const tickets = await asPersona('authenticated', TEST_USERS.admin, async (tx) => {
        const res = await tx.query<any>(
          `SELECT * FROM public.support_requests WHERE id = '${supportTicketId}'`
        );
        return res.rows;
      });
      expect(tickets.length).toBe(1);

      // Admin replies on support ticket
      await asPersona('authenticated', TEST_USERS.admin, async (tx) => {
        await tx.exec(`
          INSERT INTO public.support_messages (request_id, sender_id, message_body)
          VALUES ('${supportTicketId}', '${TEST_USERS.admin}', 'No GRE is required for EU degrees, but uni-assist VPD is mandatory.');
          UPDATE public.support_requests SET status = 'in_progress' WHERE id = '${supportTicketId}';
        `);
      });

      // Explorer views updated status and staff reply
      const explorerView = await asPersona('authenticated', TEST_USERS.explorer, async (tx) => {
        const req = await tx.query<any>(`SELECT status FROM public.support_requests WHERE id = '${supportTicketId}'`);
        const msgs = await tx.query<any>(`SELECT * FROM public.support_messages WHERE request_id = '${supportTicketId}'`);
        return { status: req.rows[0].status, count: msgs.rows.length };
      });
      expect(explorerView.status).toBe('in_progress');
      expect(explorerView.count).toBe(2);
    });
  });

  describe('4. Durable Outbox, Idempotency, Retries, Dead-Letter & Admin Resend', () => {
    const testIdempotencyKey = 'idemp-key-test-uuid-9999';

    it('Idempotent queuing: duplicate calls with same idempotency_key do not create duplicate outbox rows', async () => {
      // First call: Queues notification
      const firstRes = await asPersona('authenticated', TEST_USERS.admin, async (tx) => {
        const res = await tx.query<any>(`
          SELECT public.queue_transactional_notification(
            '${TEST_USERS.student_a}'::uuid,
            'task_due',
            'HEC Attestation Deadline Approaching',
            'Please upload your authenticated HEC degree scan.',
            'https://app.unilistics.com/student/tasks',
            '${testIdempotencyKey}',
            'task_due'
          ) as result;
        `);
        return res.rows[0].result;
      });

      expect(firstRes.success).toBe(true);
      expect(firstRes.outbox_id).toBeDefined();
      expect(firstRes.deduplicated).toBe(false);

      // Second call with same idempotency key
      const secondRes = await asPersona('authenticated', TEST_USERS.admin, async (tx) => {
        const res = await tx.query<any>(`
          SELECT public.queue_transactional_notification(
            '${TEST_USERS.student_a}'::uuid,
            'task_due',
            'HEC Attestation Deadline Approaching',
            'Please upload your authenticated HEC degree scan.',
            'https://app.unilistics.com/student/tasks',
            '${testIdempotencyKey}',
            'task_due'
          ) as result;
        `);
        return res.rows[0].result;
      });

      expect(secondRes.success).toBe(true);
      expect(secondRes.deduplicated).toBe(true);
      expect(secondRes.outbox_id).toBe(firstRes.outbox_id);

      // Verify total count in outbox for this idempotency key is exactly 1
      const countRes = await db.query<any>(`
        SELECT COUNT(*) as count FROM public.outbox WHERE idempotency_key = '${testIdempotencyKey}'
      `);
      expect(Number(countRes.rows[0].count)).toBe(1);
    });

    it('Worker bounded retries: moves to dead_letter/failed after max retries (3)', async () => {
      // Seed a queued item for retry testing
      const itemRes = await db.query<any>(`
        INSERT INTO public.outbox (
          event_type, recipient_email, subject, payload, status, retry_count, max_retries
        ) VALUES (
          'stage_change', 'student.b@test.com', 'Application Stage Update',
          '{"user_id": "${TEST_USERS.student_b}"}'::jsonb,
          'queued', 0, 3
        ) RETURNING id;
      `);
      const outboxId = itemRes.rows[0].id;

      // Simulate worker retry cycle: attempt 1, 2, 3
      for (let attempt = 1; attempt <= 3; attempt++) {
        await db.exec(`
          UPDATE public.outbox
          SET
            retry_count = retry_count + 1,
            last_error = 'Simulated timeout on provider endpoint (attempt ${attempt})',
            status = CASE WHEN retry_count + 1 >= max_retries THEN 'dead_letter' ELSE 'queued' END,
            failed_at = CASE WHEN retry_count + 1 >= max_retries THEN NOW() ELSE NULL END
          WHERE id = '${outboxId}';
        `);
      }

      // Check item reached dead_letter
      const finalItem = await db.query<any>(`
        SELECT status, retry_count FROM public.outbox WHERE id = '${outboxId}'
      `);
      expect(finalItem.rows[0].status).toBe('dead_letter');
      expect(finalItem.rows[0].retry_count).toBe(3);
    });

    it('Administrator Resend: resets dead-letter/failed item to queued for worker retry', async () => {
      // Find the dead_letter item from previous test
      const item = await db.query<any>(`
        SELECT id FROM public.outbox WHERE status = 'dead_letter' LIMIT 1;
      `);
      const targetId = item.rows[0].id;

      // Non-admin attempting to resend is rejected
      await expect(
        asPersona('authenticated', TEST_USERS.student_a, async (tx) => {
          await tx.query<any>(`SELECT public.admin_resend_outbox_message('${targetId}'::uuid)`);
        })
      ).rejects.toThrow(/Access denied/);

      // Admin resend succeeds
      const resendResult = await asPersona('authenticated', TEST_USERS.admin, async (tx) => {
        const res = await tx.query<any>(`SELECT public.admin_resend_outbox_message('${targetId}'::uuid) as result`);
        return res.rows[0].result;
      });

      expect(resendResult.success).toBe(true);
      expect(resendResult.new_status).toBe('queued');

      // Verify DB state is reset
      const resetItem = await db.query<any>(`
        SELECT status, retry_count, last_error FROM public.outbox WHERE id = '${targetId}'
      `);
      expect(resetItem.rows[0].status).toBe('queued');
      expect(resetItem.rows[0].retry_count).toBe(0);
      expect(resetItem.rows[0].last_error).toBeNull();
    });
  });

  describe('5. Evidence-Based Delivery Webhooks & Replay Prevention', () => {
    let webhookOutboxId: string;
    const providerMessageId = 'msg-sendgrid-pk-889977';
    const providerEventId = 'evt-sg-deliver-445566';

    it('Transitions from queued to provider_accepted; does NOT claim delivered without carrier evidence', async () => {
      const item = await db.query<any>(`
        INSERT INTO public.outbox (
          event_type, recipient_email, subject, payload, status
        ) VALUES (
          'document_review', 'student.a@test.com', 'Document Review Complete',
          '{"body": "Approved"}'::jsonb, 'queued'
        ) RETURNING id;
      `);
      webhookOutboxId = item.rows[0].id;

      // Provider accepts message and returns provider_message_id
      await db.exec(`
        UPDATE public.outbox
        SET
          status = 'provider_accepted',
          provider_message_id = '${providerMessageId}'
        WHERE id = '${webhookOutboxId}';
      `);

      const acceptedItem = await db.query<any>(`
        SELECT status, delivered_at FROM public.outbox WHERE id = '${webhookOutboxId}'
      `);
      expect(acceptedItem.rows[0].status).toBe('provider_accepted');
      expect(acceptedItem.rows[0].delivered_at).toBeNull(); // Never claim delivered prematurely!
    });

    it('Signed delivery webhook marks status delivered with evidence timestamp', async () => {
      const hookRes = await db.query<any>(`
        SELECT public.handle_email_webhook(
          'sendgrid',
          '${providerEventId}',
          'delivered',
          '${providerMessageId}',
          '{"ip": "198.51.100.1", "tls": true}'::jsonb,
          'sig-sha256-valid-signature-evidence'
        ) as result;
      `);

      expect(hookRes.rows[0].result.success).toBe(true);

      // Verify outbox item is now delivered
      const deliveredItem = await db.query<any>(`
        SELECT status, delivered_at FROM public.outbox WHERE id = '${webhookOutboxId}'
      `);
      expect(deliveredItem.rows[0].status).toBe('delivered');
      expect(deliveredItem.rows[0].delivered_at).not.toBeNull();
    });

    it('Webhook Replay: duplicate event ID is ignored idempotently without crashing', async () => {
      const replayRes = await db.query<any>(`
        SELECT public.handle_email_webhook(
          'sendgrid',
          '${providerEventId}',
          'delivered',
          '${providerMessageId}',
          '{"ip": "198.51.100.1", "tls": true}'::jsonb,
          'sig-sha256-valid-signature-evidence'
        ) as result;
      `);

      expect(replayRes.rows[0].result.success).toBe(true);
      expect(replayRes.rows[0].result.replay_ignored).toBe(true);

      // Event was only logged once in email_webhook_events
      const evtCount = await db.query<any>(`
        SELECT COUNT(*) as count FROM public.email_webhook_events
        WHERE provider = 'sendgrid' AND provider_event_id = '${providerEventId}'
      `);
      expect(Number(evtCount.rows[0].count)).toBe(1);
    });
  });

  describe('6. Email Privacy Validation & Account-Security Exemption Guarantee', () => {
    it('validateEmailPayloadPrivacy blocks sensitive PII (CNICs, passports, bank balances, chat logs)', () => {
      // 1. Rejects payload containing Pakistan CNIC (42101-1234567-1)
      expect(() => {
        validateEmailPayloadPrivacy({
          subject: 'Your Account Information',
          body_text: 'Student CNIC: 42101-1234567-1 has been verified.',
        });
      }).toThrow(/PRIVACY_VIOLATION/);

      // 2. Rejects payload containing passport numbers
      expect(() => {
        validateEmailPayloadPrivacy({
          subject: 'Passport Update',
          body_text: 'Your passport number PA1234567 is noted.',
        });
      }).toThrow(/PRIVACY_VIOLATION/);

      // 3. Rejects payload containing bank statements / balance
      expect(() => {
        validateEmailPayloadPrivacy({
          subject: 'Financial documents',
          body_text: 'Your account balance statement showing PKR 5,000,000 is verified.',
        });
      }).toThrow(/PRIVACY_VIOLATION/);

      // 4. Accepts minimal notification with secure web link
      expect(() => {
        validateEmailPayloadPrivacy({
          subject: 'Action Required: Document Review Update',
          body_text: 'Your assigned counsellor has reviewed your recent upload. Log in to view details.',
          link_url: 'https://app.unilistics.com/student/documents',
        });
      }).not.toThrow();
    });

    it('Mandatory Account-Security Exemption: security emails are queued even when user disabled email notifications', async () => {
      // User sets email_notifications = false
      await db.exec(`
        INSERT INTO public.notification_preferences (user_id, email_notifications, task_reminders)
        VALUES ('${TEST_USERS.student_a}', false, false)
        ON CONFLICT (user_id) DO UPDATE SET email_notifications = false, task_reminders = false;
      `);

      // 1. Normal task reminder notification is suppressed from outbox
      await db.query<any>(`
        SELECT public.queue_transactional_notification(
          '${TEST_USERS.student_a}'::uuid,
          'task_due',
          'Non-critical Reminder',
          'Please review deadlines',
          'https://app.unilistics.com',
          'suppressed-task-key-1',
          'task_due'
        ) as result;
      `);
      // Task notification created in-app notification, but outbox row was not queued
      const outboxTask = await db.query<any>(`
        SELECT * FROM public.outbox WHERE idempotency_key = 'suppressed-task-key-1'
      `);
      expect(outboxTask.rows.length).toBe(0);

      // 2. Account-Security notification (e.g. magic activation link, security alert) MUST be queued regardless
      const secRes = await db.query<any>(`
        SELECT public.queue_transactional_notification(
          '${TEST_USERS.student_a}'::uuid,
          'approval',
          'Security Alert: New Sign-in from Pakistan',
          'A new session was initiated on your Unilistics account.',
          'https://app.unilistics.com/security',
          'security-alert-key-1',
          'account_security'
        ) as result;
      `);
      expect(secRes.rows[0].result.success).toBe(true);

      const outboxSec = await db.query<any>(`
        SELECT * FROM public.outbox WHERE idempotency_key = 'security-alert-key-1'
      `);
      expect(outboxSec.rows.length).toBe(1);
      expect(outboxSec.rows[0].template_type).toBe('account_security');
    });
  });

  describe('7. Timezone Boundaries & Institution Deadline Date-Only Semantics', () => {
    it('formatUtcInTimezone formats UTC timestamps correctly for user destination timezones', () => {
      const utcString = '2026-10-23T12:00:00Z';

      // Pakistan Standard Time: UTC+5 -> 17:00
      const pktFormatted = formatUtcInTimezone(utcString, 'Asia/Karachi');
      expect(pktFormatted).toContain('5:00');
      expect(pktFormatted).toMatch(/(?:PKT|GMT\+5)/);

      // Central European Summer Time (Berlin, UTC+2 in summer/October)
      const cetFormatted = formatUtcInTimezone(utcString, 'Europe/Berlin');
      expect(cetFormatted).toBeDefined();
      expect(cetFormatted.length).toBeGreaterThan(5);
    });

    it('formatDeadlineDateOnly preserves calendar date without timezone shift drift', () => {
      const deadlineDate = '2027-05-31';
      const formatted = formatDeadlineDateOnly(deadlineDate);
      expect(formatted).toBe('31 May 2027');
    });
  });

  describe('8. Revoked and Deactivated Users Enforcement', () => {
    it('Suspended user is blocked from operational data queries', async () => {
      // Deactivate student B
      await db.exec(`
        UPDATE public.profiles SET account_status = 'suspended' WHERE id = '${TEST_USERS.student_b}';
      `);

      // Deactivated student cannot read student_cases
      const cases = await asPersona('authenticated', TEST_USERS.student_b, async (tx) => {
        const res = await tx.query<any>('SELECT * FROM public.student_cases');
        return res.rows;
      });
      expect(cases.length).toBe(0);
    });
  });
});
