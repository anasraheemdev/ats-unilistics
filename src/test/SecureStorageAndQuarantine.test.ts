// @vitest-environment node
import { describe, it, expect, beforeAll } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import * as fs from 'fs';
import * as path from 'path';
import { initializeTestSupabaseEnvironment } from './helpers/supabaseTestHarness';
import { validateClientFileSecurity } from '../lib/api';

describe('Secure Private Storage, Malware Quarantine, Magic Byte Signatures & Retention Erasure', () => {
  let db: PGlite;

  const TEST_USERS = {
    super_admin: '11111111-1111-4111-a111-111111111111',
    admin: '22222222-2222-4222-a222-222222222222',
    counsellor_sara: '33333333-3333-4333-a333-333333333333',
    counsellor_unassigned: '44444444-4444-4444-a444-444444444444',
    student_a: '55555555-5555-4555-a555-555555555555',
    student_b: '66666666-6666-4666-a666-666666666666',
  };

  let caseAId: string;
  let caseBId: string;
  let appAId: string;
  let appBId: string;
  let docAId: string;

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
      { id: TEST_USERS.counsellor_unassigned, email: 'other.counsellor@unilistics.local', name: 'Usman Other', staffRole: 'counsellor' },
      { id: TEST_USERS.student_a, email: 'student.a@test.com', name: 'Student A' },
      { id: TEST_USERS.student_b, email: 'student.b@test.com', name: 'Student B' },
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

    // Ensure entitlements for student_a and student_b
    for (const sid of [TEST_USERS.student_a, TEST_USERS.student_b]) {
      await db.exec(`
        INSERT INTO public.entitlements (user_id, entitlement_type, status, granted_by)
        VALUES ('${sid}', 'managed_application_case', 'active', '${TEST_USERS.admin}')
        ON CONFLICT (user_id, entitlement_type) DO UPDATE SET status = 'active';
      `);
    }

    // Create Case A (Student A) & Case B (Student B)
    const caseARes = await db.query<{ id: string }>(`
      INSERT INTO public.student_cases (
        student_id, target_country, target_degree, target_intake_season, target_intake_year,
        current_stage, next_required_action, next_action_due_date, responsible_party, onboarding_status
      ) VALUES (
        '${TEST_USERS.student_a}', 'de', 'masters', 'winter', 2027,
        'attestation', 'Upload official transcripts', CURRENT_DATE + 14, 'student', 'completed'
      ) RETURNING id;
    `);
    caseAId = caseARes.rows[0].id;

    const caseBRes = await db.query<{ id: string }>(`
      INSERT INTO public.student_cases (
        student_id, target_country, target_degree, target_intake_season, target_intake_year,
        current_stage, next_required_action, next_action_due_date, responsible_party, onboarding_status
      ) VALUES (
        '${TEST_USERS.student_b}', 'it', 'masters', 'winter', 2027,
        'attestation', 'Upload passport scan', CURRENT_DATE + 14, 'student', 'completed'
      ) RETURNING id;
    `);
    caseBId = caseBRes.rows[0].id;

    // Assign Counsellor Sara to Case A only
    await db.exec(`
      INSERT INTO public.case_assignments (case_id, counsellor_id, assigned_by)
      VALUES ('${caseAId}', '${TEST_USERS.counsellor_sara}', '${TEST_USERS.admin}');
    `);

    // Create Applications on Case A and Case B
    const appARes = await db.query<{ id: string }>(`
      INSERT INTO public.applications (case_id, program_id, intake_id, status, submission_deadline, responsible_party)
      VALUES ('${caseAId}', '22222222-3333-4444-5555-666666666666', '33333333-4444-5555-6666-777777777777', 'drafting', '2027-05-31', 'counsellor')
      RETURNING id;
    `);
    appAId = appARes.rows[0].id;

    const appBRes = await db.query<{ id: string }>(`
      INSERT INTO public.applications (case_id, program_id, intake_id, status, submission_deadline, responsible_party)
      VALUES ('${caseBId}', '22222222-3333-4444-5555-666666666666', '33333333-4444-5555-6666-777777777777', 'drafting', '2027-05-31', 'counsellor')
      RETURNING id;
    `);
    appBId = appBRes.rows[0].id;
  });

  // 1. UPLOAD SESSION & SERVER-SIDE VALIDATION
  describe('Upload Session & Server-Side Security Validation', () => {
    it('creates upload session with cryptographically random object key and safe display name', async () => {
      const res = await asPersona('authenticated', TEST_USERS.student_a, async (tx) => {
        const query = await tx.query<any>(`
          SELECT public.create_document_upload_session(
            '${caseAId}'::uuid,
            'hec_attestation',
            'HEC Bachelor Degree Attestation',
            'Degree_Transcript_Official.pdf',
            2500000::bigint,
            'application/pdf',
            'pdf',
            'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
          ) AS session;
        `);
        return query.rows[0].session;
      });

      expect(res.success).toBe(true);
      expect(res.bucket_id).toBe('student-vault');
      expect(res.quarantine_status).toBe('uploaded_quarantined');
      expect(res.object_key).toMatch(new RegExp(`^${caseAId}/hec_attestation/[0-9a-f\\-]{36}\\.bin$`));
      expect(res.safe_display_name).toBe('Degree_Transcript_Official.pdf');
      docAId = res.document_id;
    });

    it('rejects prohibited file extensions (.exe, .svg, .sh)', async () => {
      await expect(
        asPersona('authenticated', TEST_USERS.student_a, async (tx) => {
          await tx.query(`
            SELECT public.create_document_upload_session(
              '${caseAId}'::uuid,
              'passport_scan',
              'Passport Scan',
              'malicious_exploit.svg',
              15000::bigint,
              'image/svg+xml',
              'svg'
            );
          `);
        })
      ).rejects.toThrow(/FILE_EXTENSION_DISALLOWED/);
    });

    it('rejects prohibited MIME types (e.g. text/html, application/x-msdownload)', async () => {
      await expect(
        asPersona('authenticated', TEST_USERS.student_a, async (tx) => {
          await tx.query(`
            SELECT public.create_document_upload_session(
              '${caseAId}'::uuid,
              'passport_scan',
              'Passport Scan',
              'fake_document.pdf',
              25000::bigint,
              'text/html',
              'pdf'
            );
          `);
        })
      ).rejects.toThrow(/FILE_MIME_DISALLOWED/);
    });

    it('rejects malicious MIME / binary magic content signature mismatch', async () => {
      await expect(
        asPersona('authenticated', TEST_USERS.student_a, async (tx) => {
          await tx.query(`
            SELECT public.create_document_upload_session(
              '${caseAId}'::uuid,
              'cv_resume',
              'Curriculum Vitae',
              'Resume.pdf',
              45000::bigint,
              'application/pdf',
              'jpeg'
            );
          `);
        })
      ).rejects.toThrow(/MALICIOUS_MIME_MISMATCH/);
    });

    it('rejects oversized files exceeding 20MB limit', async () => {
      const oversizeBytes = 25 * 1024 * 1024; // 25MB
      await expect(
        asPersona('authenticated', TEST_USERS.student_a, async (tx) => {
          await tx.query(`
            SELECT public.create_document_upload_session(
              '${caseAId}'::uuid,
              'passport_scan',
              'Passport High Res',
              'Passport_Oversize.pdf',
              ${oversizeBytes}::bigint,
              'application/pdf',
              'pdf'
            );
          `);
        })
      ).rejects.toThrow(/FILE_SIZE_LIMIT_EXCEEDED/);
    });
  });

  // 2. MALWARE QUARANTINE & SCAN ENFORCEMENT
  describe('Malware Quarantine & Scanner Production Blocker', () => {
    it('enforces quarantine on initial upload; download ticket is blocked if malware detected', async () => {
      // Simulate malware detection
      await asPersona('authenticated', TEST_USERS.student_a, async (tx) => {
        await tx.query(`
          SELECT public.process_malware_scan(
            '${docAId}'::uuid,
            'infected',
            'unilistics-clamav-guard',
            'Eicar-Test-Signature'
          );
        `);
      });

      // Verification check on metadata and versions
      const meta = await db.query<{ quarantine_status: string }>(`
        SELECT quarantine_status FROM public.document_metadata WHERE id = '${docAId}';
      `);
      expect(meta.rows[0].quarantine_status).toBe('malware_detected');

      // Attempting download ticket must throw DOWNLOAD_BLOCKED
      await expect(
        asPersona('authenticated', TEST_USERS.student_a, async (tx) => {
          await tx.query(`
            SELECT public.generate_authorized_download_url('${docAId}'::uuid);
          `);
        })
      ).rejects.toThrow(/DOWNLOAD_BLOCKED/);
    });

    it('clean malware scan transitions document to ready_for_review and enables download ticket', async () => {
      // Mark scan clean
      await asPersona('authenticated', TEST_USERS.student_a, async (tx) => {
        await tx.query(`
          SELECT public.process_malware_scan(
            '${docAId}'::uuid,
            'clean',
            'unilistics-clamav-guard',
            NULL
          );
        `);
      });

      const meta = await db.query<{ quarantine_status: string }>(`
        SELECT quarantine_status FROM public.document_metadata WHERE id = '${docAId}';
      `);
      expect(meta.rows[0].quarantine_status).toBe('ready_for_review');

      // Now authorized download ticket can be generated (120s TTL)
      const ticket = await asPersona('authenticated', TEST_USERS.student_a, async (tx) => {
        const q = await tx.query<any>(`
          SELECT public.generate_authorized_download_url('${docAId}'::uuid) AS ticket;
        `);
        return q.rows[0].ticket;
      });

      expect(ticket.success).toBe(true);
      expect(ticket.expires_in_seconds).toBe(120);
      expect(ticket.content_disposition).toContain('attachment; filename="Degree_Transcript_Official.pdf"');
    });
  });

  // 3. VERSION PRESERVATION & REPLACEMENT INSTRUCTIONS
  describe('Document Versioning & Staff Review Replacement Flow', () => {
    it('staff review requires instructions of at least 5 characters for needs_replacement', async () => {
      await expect(
        asPersona('authenticated', TEST_USERS.counsellor_sara, async (tx) => {
          await tx.query(`
            SELECT public.staff_review_document(
              '${docAId}'::uuid,
              'needs_replacement',
              'bad',
              'bad'
            );
          `);
        })
      ).rejects.toThrow(/requires specific instructions of at least 5 characters/);
    });

    it('assigned counsellor flags needs_replacement with clear instructions', async () => {
      const reviewRes = await asPersona('authenticated', TEST_USERS.counsellor_sara, async (tx) => {
        const q = await tx.query<any>(`
          SELECT public.staff_review_document(
            '${docAId}'::uuid,
            'needs_replacement',
            'HEC QR code is cropped at bottom border',
            'Please re-scan degree scroll showing all 4 corners and complete HEC QR barcode ticket.'
          ) AS res;
        `);
        return q.rows[0].res;
      });

      expect(reviewRes.success).toBe(true);
      expect(reviewRes.status).toBe('needs_replacement');

      const docCheck = await db.query<any>(`
        SELECT quarantine_status, replacement_instructions FROM public.document_metadata WHERE id = '${docAId}';
      `);
      expect(docCheck.rows[0].quarantine_status).toBe('needs_replacement');
      expect(docCheck.rows[0].replacement_instructions).toContain('Please re-scan degree scroll');
    });

    it('student uploads replacement version (v2); v1 is preserved and v2 is marked latest', async () => {
      const v2Session = await asPersona('authenticated', TEST_USERS.student_a, async (tx) => {
        const q = await tx.query<any>(`
          SELECT public.create_document_upload_session(
            '${caseAId}'::uuid,
            'hec_attestation',
            'HEC Bachelor Degree Scroll (Re-scanned)',
            'Degree_Transcript_Official_v2.pdf',
            3100000::bigint,
            'application/pdf',
            'pdf',
            'a1b2c3d4e5f67890123456789012345678901234567890123456789012345678'
          ) AS session;
        `);
        return q.rows[0].session;
      });

      expect(v2Session.version_number).toBe(2);

      // Verify versions table preserves both v1 and v2
      const versions = await db.query<any>(`
        SELECT version_number, file_name, is_latest FROM public.document_versions
        WHERE document_id = '${docAId}'
        ORDER BY version_number ASC;
      `);

      expect(versions.rows.length).toBe(2);
      expect(versions.rows[0].version_number).toBe(1);
      expect(versions.rows[0].is_latest).toBe(false);
      expect(versions.rows[1].version_number).toBe(2);
      expect(versions.rows[1].is_latest).toBe(true);
    });

    it('staff approval records reviewer, disclaimer, and sets status to verified/approved', async () => {
      // Scan v2 clean
      await asPersona('authenticated', TEST_USERS.student_a, async (tx) => {
        await tx.query(`
          SELECT public.process_malware_scan('${docAId}'::uuid, 'clean');
        `);
      });

      const approval = await asPersona('authenticated', TEST_USERS.counsellor_sara, async (tx) => {
        const q = await tx.query<any>(`
          SELECT public.staff_review_document(
            '${docAId}'::uuid,
            'approved',
            'QR code validated on HEC registry; degree confirmed genuine.'
          ) AS res;
        `);
        return q.rows[0].res;
      });

      expect(approval.success).toBe(true);
      expect(approval.disclaimer).toContain('Approved indicates acceptance by Unilistics staff for portal preparation');

      const meta = await db.query<any>(`
        SELECT verification_status, quarantine_status, verified_by FROM public.document_metadata WHERE id = '${docAId}';
      `);
      expect(meta.rows[0].verification_status).toBe('verified');
      expect(meta.rows[0].quarantine_status).toBe('approved');
      expect(meta.rows[0].verified_by).toBe(TEST_USERS.counsellor_sara);
    });
  });

  // 4. CROSS-STUDENT ISOLATION & GUESSED KEY ENFORCEMENT
  describe('Cross-Student & RLS Access Isolation', () => {
    it('Student B CANNOT read Student A document metadata', async () => {
      const docs = await asPersona('authenticated', TEST_USERS.student_b, async (tx) => {
        const q = await tx.query(`
          SELECT * FROM public.document_metadata WHERE case_id = '${caseAId}';
        `);
        return q.rows;
      });
      expect(docs.length).toBe(0);
    });

    it('Student B CANNOT create upload session on Student A case', async () => {
      await expect(
        asPersona('authenticated', TEST_USERS.student_b, async (tx) => {
          await tx.query(`
            SELECT public.create_document_upload_session(
              '${caseAId}'::uuid,
              'passport_scan',
              'Forged Passport',
              'hacker_passport.pdf',
              100000::bigint,
              'application/pdf',
              'pdf'
            );
          `);
        })
      ).rejects.toThrow(/Permission denied/);
    });

    it('Student B CANNOT generate authorized download URL for Student A document', async () => {
      await expect(
        asPersona('authenticated', TEST_USERS.student_b, async (tx) => {
          await tx.query(`
            SELECT public.generate_authorized_download_url('${docAId}'::uuid);
          `);
        })
      ).rejects.toThrow(/Permission denied/);
    });

    it('Student B CANNOT access Student A storage objects via guessed keys in storage.objects', async () => {
      // Seed object in storage.objects
      await db.exec(`
        INSERT INTO storage.objects (bucket_id, name, owner)
        VALUES ('student-vault', '${caseAId}/hec_attestation/secret_file.bin', '${TEST_USERS.student_a}')
        ON CONFLICT DO NOTHING;
      `);

      const guessed = await asPersona('authenticated', TEST_USERS.student_b, async (tx) => {
        const q = await tx.query(`
          SELECT * FROM storage.objects WHERE bucket_id = 'student-vault' AND name = '${caseAId}/hec_attestation/secret_file.bin';
        `);
        return q.rows;
      });
      expect(guessed.length).toBe(0);
    });
  });

  // 5. COUNSELLOR REVOCATION & ASSIGNMENT SCOPING
  describe('Counsellor Revocation & Access Matrix', () => {
    it('unassigned counsellor CANNOT generate download ticket or review Case A document', async () => {
      await expect(
        asPersona('authenticated', TEST_USERS.counsellor_unassigned, async (tx) => {
          await tx.query(`
            SELECT public.generate_authorized_download_url('${docAId}'::uuid);
          `);
        })
      ).rejects.toThrow(/Permission denied/);

      await expect(
        asPersona('authenticated', TEST_USERS.counsellor_unassigned, async (tx) => {
          await tx.query(`
            SELECT public.staff_review_document('${docAId}'::uuid, 'approved');
          `);
        })
      ).rejects.toThrow(/Permission denied/);
    });

    it('revoking counsellor Sara from Case A immediately blocks download ticket generation', async () => {
      // Revoke assignment
      await db.exec(`
        DELETE FROM public.case_assignments
        WHERE case_id = '${caseAId}' AND counsellor_id = '${TEST_USERS.counsellor_sara}';
      `);

      await expect(
        asPersona('authenticated', TEST_USERS.counsellor_sara, async (tx) => {
          await tx.query(`
            SELECT public.generate_authorized_download_url('${docAId}'::uuid);
          `);
        })
      ).rejects.toThrow(/Permission denied/);
    });
  });

  // 6. FORGED DOCUMENT LINKING PREVENTION
  describe('Anti-Forgery Cross-Case Document Linking', () => {
    it('prevents linking Case A document to Case B application via trg_validate_document_link', async () => {
      await expect(
        asPersona('authenticated', TEST_USERS.admin, async (tx) => {
          await tx.query(`
            INSERT INTO public.document_links (application_id, document_id)
            VALUES ('${appBId}'::uuid, '${docAId}'::uuid);
          `);
        })
      ).rejects.toThrow(/Cross-case document linking is forbidden/);
    });

    it('allows linking Case A document to Case A application', async () => {
      const linkRes = await asPersona<{ id: string }>('authenticated', TEST_USERS.admin, async (tx) => {
        const q = await tx.query<{ id: string }>(`
          INSERT INTO public.document_links (application_id, document_id)
          VALUES ('${appAId}'::uuid, '${docAId}'::uuid)
          RETURNING id;
        `);
        return q.rows[0];
      });
      expect(linkRes.id).toBeDefined();
    });
  });

  // 7. RETENTION ERASURE & AUDIT
  describe('Retention Policy & Physical Erasure', () => {
    it('requires at least 5 character compliance justification for erasure', async () => {
      await expect(
        asPersona('authenticated', TEST_USERS.admin, async (tx) => {
          await tx.query(`
            SELECT public.staff_delete_document_file('${docAId}'::uuid, 'del');
          `);
        })
      ).rejects.toThrow(/formal compliance justification of at least 5 characters/);
    });

    it('permanently erases metadata, cascades versions, deletes storage.objects bytes, and records audit event', async () => {
      // Seed version storage paths in storage.objects
      const paths = await db.query<{ storage_path: string }>(`
        SELECT storage_path FROM public.document_versions WHERE document_id = '${docAId}';
      `);

      for (const p of paths.rows) {
        await db.exec(`
          INSERT INTO storage.objects (bucket_id, name, owner)
          VALUES ('student-vault', '${p.storage_path}', '${TEST_USERS.student_a}')
          ON CONFLICT DO NOTHING;
        `);
      }

      const eraseRes = await asPersona('authenticated', TEST_USERS.admin, async (tx) => {
        const q = await tx.query<any>(`
          SELECT public.staff_delete_document_file(
            '${docAId}'::uuid,
            'Student requested GDPR right to erasure compliance purge'
          ) AS res;
        `);
        return q.rows[0].res;
      });

      expect(eraseRes.success).toBe(true);
      expect(eraseRes.erased_storage_paths.length).toBe(2);

      // Verify metadata is deleted
      const metaCheck = await db.query(`SELECT * FROM public.document_metadata WHERE id = '${docAId}';`);
      expect(metaCheck.rows.length).toBe(0);

      // Verify versions are cascade deleted
      const verCheck = await db.query(`SELECT * FROM public.document_versions WHERE document_id = '${docAId}';`);
      expect(verCheck.rows.length).toBe(0);

      // Verify physical storage objects are deleted
      const storageCheck = await db.query(`
        SELECT * FROM storage.objects
        WHERE bucket_id = 'student-vault' AND name = ANY(ARRAY['${paths.rows.map((p) => p.storage_path).join("','")}']);
      `);
      expect(storageCheck.rows.length).toBe(0);

      // Verify immutable audit event
      const audit = await db.query<any>(`
        SELECT * FROM public.audit_events
        WHERE action = 'staff_delete_document_file' AND target_id = '${docAId}';
      `);
      expect(audit.rows.length).toBe(1);
      expect(audit.rows[0].payload.reason).toContain('GDPR right to erasure');
    });
  });

  // 8. CLIENT-SIDE FILE SECURITY VALIDATION HELPER
  describe('Client-Side File Security Validation Helper', () => {
    it('accepts valid PDF with %PDF- header', async () => {
      const pdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x35]);
      const mockFile = {
        name: 'attestation.pdf',
        size: 150000,
        type: 'application/pdf',
        arrayBuffer: async () => pdfBytes.buffer,
      };

      const result = await validateClientFileSecurity(mockFile);
      expect(result.valid).toBe(true);
      expect(result.magicSignature).toBe('pdf');
    });

    it('accepts valid JPEG with 0xFF 0xD8 0xFF header', async () => {
      const jpegBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
      const mockFile = {
        name: 'passport.jpg',
        size: 320000,
        type: 'image/jpeg',
        arrayBuffer: async () => jpegBytes.buffer,
      };

      const result = await validateClientFileSecurity(mockFile);
      expect(result.valid).toBe(true);
      expect(result.magicSignature).toBe('jpeg');
    });

    it('accepts valid PNG with 0x89 PNG header', async () => {
      const pngBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
      const mockFile = {
        name: 'transcript.png',
        size: 450000,
        type: 'image/png',
        arrayBuffer: async () => pngBytes.buffer,
      };

      const result = await validateClientFileSecurity(mockFile);
      expect(result.valid).toBe(true);
      expect(result.magicSignature).toBe('png');
    });

    it('rejects fake PDF containing HTML script tags', async () => {
      const fakePdf = new TextEncoder().encode('<html><body><script>alert(1)</script></body></html>');
      const mockFile = {
        name: 'fake_invoice.pdf',
        size: 1200,
        type: 'application/pdf',
        arrayBuffer: async () => fakePdf.buffer,
      };

      const result = await validateClientFileSecurity(mockFile);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('MALICIOUS_SIGNATURE_MISMATCH');
    });

    it('rejects files larger than 20MB', async () => {
      const mockFile = {
        name: 'huge_scan.pdf',
        size: 22 * 1024 * 1024,
        type: 'application/pdf',
        arrayBuffer: async () => new ArrayBuffer(16),
      };

      const result = await validateClientFileSecurity(mockFile);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('FILE_SIZE_LIMIT_EXCEEDED');
    });
  });
});
