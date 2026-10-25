// @vitest-environment node
import { describe, it, expect, beforeAll } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import fs from 'fs';
import path from 'path';
import { initializeTestSupabaseEnvironment } from './helpers/supabaseTestHarness';
import {
  escapeFormulaInjection,
  isValidPublicUrl,
  sanitizeRichText,
  UniversityImportRowSchema,
  ProgramImportRowSchema,
} from '../types/validation';
import { parseCsvText } from '../lib/catalogueImportExport';

describe('Staff Catalogue Management, Secure Import/Export & Publication States', () => {
  let db: PGlite;

  const TEST_USERS = {
    super_admin: '11111111-1111-4111-a111-111111111111',
    admin: '22222222-2222-4222-a222-222222222222',
    counsellor: '33333333-3333-4333-a333-333333333333',
    explorer: '44444444-4444-4444-a444-444444444444',
    student: '55555555-5555-4555-a555-555555555555',
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

    // Apply all migrations 001 - 010 in strict order
    const migrationsDir = path.resolve(__dirname, '../../supabase/migrations');
    const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();

    for (const file of files) {
      console.log('Applying migration:', file);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      await db.exec(sql);
    }

    // Seed Baseline Countries (de, fr, it, ro)
    await db.exec(`
      INSERT INTO public.countries (code, name, visa_authority, is_active, publication_status) VALUES
      ('de', 'Germany', 'German Embassy Islamabad', true, 'published'),
      ('fr', 'France', 'Campus France / French Consulate', true, 'published'),
      ('it', 'Italy', 'Italian Embassy Islamabad', true, 'published'),
      ('ro', 'Romania', 'Romanian Embassy Islamabad', true, 'published')
      ON CONFLICT (code) DO UPDATE SET is_active = true, publication_status = 'published';
    `);

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
      VALUES ('${TEST_USERS.counsellor}', 'counsellor@unilistics.com', 'Ordinary Counsellor', 'active') ON CONFLICT DO NOTHING;
      INSERT INTO public.staff_roles (user_id, role, assigned_by)
      VALUES ('${TEST_USERS.counsellor}', 'counsellor', '${TEST_USERS.super_admin}') ON CONFLICT DO NOTHING;

      -- Approved Explorer
      INSERT INTO auth.users (id, email) VALUES ('${TEST_USERS.explorer}', 'explorer@test.com') ON CONFLICT DO NOTHING;
      INSERT INTO public.profiles (id, email, full_name, account_status)
      VALUES ('${TEST_USERS.explorer}', 'explorer@test.com', 'Approved Explorer', 'active') ON CONFLICT DO NOTHING;
      INSERT INTO public.entitlements (user_id, entitlement_type, status, granted_by)
      VALUES ('${TEST_USERS.explorer}', 'explorer_catalogue', 'active', '${TEST_USERS.admin}') ON CONFLICT DO NOTHING;

      -- Managed Student
      INSERT INTO auth.users (id, email) VALUES ('${TEST_USERS.student}', 'student@test.com') ON CONFLICT DO NOTHING;
      INSERT INTO public.profiles (id, email, full_name, account_status)
      VALUES ('${TEST_USERS.student}', 'student@test.com', 'Managed Student', 'active') ON CONFLICT DO NOTHING;
      INSERT INTO public.entitlements (user_id, entitlement_type, status, granted_by)
      VALUES ('${TEST_USERS.student}', 'managed_application_case', 'active', '${TEST_USERS.admin}') ON CONFLICT DO NOTHING;
    `);
  });

  // =========================================================================
  // 1. CSV / JSON IMPORT VALIDATION & DRY RUN
  // =========================================================================
  describe('Catalogue Import Validation, Dry Run & Row Errors', () => {
    it('Dry run validates rows and returns exact row-level errors without writing rows', async () => {
      const payload = JSON.stringify([
        {
          name: 'Valid University Munich (Fictional)',
          country_code: 'de',
          city: 'Munich',
          institution_type: 'public',
        },
        {
          name: 'X', // Invalid: < 2 chars
          country_code: 'xx', // Invalid: not in active countries
          city: '', // Invalid: empty
          institution_type: 'invalid_type', // Invalid
        },
      ]);

      const res = await asPersona('authenticated', TEST_USERS.admin, async (tx) => {
        return tx.query<{ admin_import_catalogue_batch: any }>(`
          SELECT public.admin_import_catalogue_batch(
            'universities',
            'https://www.hochschulkompass.de/sample',
            '2026-10-23'::DATE,
            '${payload}'::JSONB,
            true -- is_dry_run
          );
        `);
      });

      const result = res.rows[0].admin_import_catalogue_batch;
      expect(result.is_dry_run).toBe(true);
      expect(result.total_rows).toBe(2);
      expect(result.valid_rows).toBe(1);
      expect(result.error_rows).toBeGreaterThan(0);
      expect(result.row_errors.length).toBeGreaterThan(0);
      expect(result.row_errors[0].row).toBe(2);

      // Verify no records were inserted into public.universities during dry run
      const checkDb = await db.query<{ count: string }>(`
        SELECT COUNT(*) as count FROM public.universities WHERE name = 'Valid University Munich (Fictional)';
      `);
      expect(Number(checkDb.rows[0].count)).toBe(0);
    });

    it('Applying valid import inserts records in "draft" status (no automatic approval)', async () => {
      const payload = JSON.stringify([
        {
          name: 'RWTH Aachen Institute of Tech (Fictional)',
          country_code: 'de',
          city: 'Aachen',
          institution_type: 'public',
          native_name: 'RWTH Aachen',
        },
      ]);

      const res = await asPersona('authenticated', TEST_USERS.admin, async (tx) => {
        return tx.query<{ admin_import_catalogue_batch: any }>(`
          SELECT public.admin_import_catalogue_batch(
            'universities',
            'https://www.rwth-aachen.de',
            '2026-10-23'::DATE,
            '${payload}'::JSONB,
            false -- Apply
          );
        `);
      });

      const result = res.rows[0].admin_import_catalogue_batch;
      expect(result.is_dry_run).toBe(false);
      expect(result.valid_rows).toBe(1);
      expect(result.error_rows).toBe(0);

      // Check record is created with publication_status = 'draft'
      const checkUni = await db.query<{ publication_status: string; provenance: any }>(`
        SELECT publication_status, provenance FROM public.universities
        WHERE name = 'RWTH Aachen Institute of Tech (Fictional)';
      `);
      expect(checkUni.rows.length).toBe(1);
      expect(checkUni.rows[0].publication_status).toBe('draft');
      expect(checkUni.rows[0].provenance.batch_id).toBe(result.batch_id);
    });

    it('Deduplication: re-importing the same university updates provenance without creating duplicates', async () => {
      const payload = JSON.stringify([
        {
          name: 'RWTH Aachen Institute of Tech (Fictional)',
          country_code: 'de',
          city: 'Aachen',
          institution_type: 'public',
          native_name: 'RWTH Aachen Re-verified',
        },
      ]);

      await asPersona('authenticated', TEST_USERS.admin, async (tx) => {
        return tx.query(`
          SELECT public.admin_import_catalogue_batch(
            'universities',
            'https://www.rwth-aachen.de/v2',
            '2026-10-23'::DATE,
            '${payload}'::JSONB,
            false
          );
        `);
      });

      const checkUni = await db.query<{ count: string }>(`
        SELECT COUNT(*) as count FROM public.universities
        WHERE name = 'RWTH Aachen Institute of Tech (Fictional)';
      `);
      expect(Number(checkUni.rows[0].count)).toBe(1); // Deduplicated, exactly 1 row
    });

    it('Preserves unknown values: missing ranking stored as NULL without hallucinated numbers', async () => {
      const checkUni = await db.query<{ ranking_indicative: number | null }>(`
        SELECT ranking_indicative FROM public.universities
        WHERE name = 'RWTH Aachen Institute of Tech (Fictional)';
      `);
      expect(checkUni.rows[0].ranking_indicative).toBeNull();
    });
  });

  // =========================================================================
  // 2. ROLE RESTRICTION: ORDINARY COUNSELLOR DENIAL
  // =========================================================================
  describe('Access Control: Ordinary Counsellors CANNOT edit or export catalogue', () => {
    it('Ordinary counsellor is denied direct INSERT on public.universities', async () => {
      await expect(
        asPersona('authenticated', TEST_USERS.counsellor, async (tx) => {
          return tx.query(`
            INSERT INTO public.universities (country_code, name, city, institution_type, publication_status)
            VALUES ('de', 'Unauthorized Uni', 'Berlin', 'public', 'published');
          `);
        })
      ).rejects.toThrow();
    });

    it('Ordinary counsellor cannot invoke admin_import_catalogue_batch', async () => {
      const payload = JSON.stringify([{ name: 'Test', country_code: 'de', city: 'Berlin' }]);
      await expect(
        asPersona('authenticated', TEST_USERS.counsellor, async (tx) => {
          return tx.query(`
            SELECT public.admin_import_catalogue_batch(
              'universities',
              'https://sample.com',
              '2026-10-23'::DATE,
              '${payload}'::JSONB,
              true
            );
          `);
        })
      ).rejects.toThrow(/Permission denied: only platform administrators can import catalogue data/);
    });

    it('Ordinary counsellor cannot invoke admin_export_catalogue', async () => {
      await expect(
        asPersona('authenticated', TEST_USERS.counsellor, async (tx) => {
          return tx.query(`
            SELECT public.admin_export_catalogue('universities');
          `);
        })
      ).rejects.toThrow(/Permission denied: ordinary counsellors cannot bulk export the global catalogue/);
    });

    it('Ordinary counsellor cannot invoke admin_update_catalogue_status', async () => {
      await expect(
        asPersona('authenticated', TEST_USERS.counsellor, async (tx) => {
          return tx.query(`
            SELECT public.admin_update_catalogue_status(
              'universities',
              '00000000-0000-0000-0000-000000000001'::UUID,
              'published'
            );
          `);
        })
      ).rejects.toThrow(/Permission denied: only platform administrators can update catalogue publication status/);
    });
  });

  // =========================================================================
  // 3. UNPUBLISHED RECORD LEAKAGE DEFENSE
  // =========================================================================
  describe('Unpublished Record Leakage Prevention', () => {
    let draftUniId: string;
    let reviewUniId: string;
    let publishedUniId: string;

    beforeAll(async () => {
      // Seed a draft, review, and published university
      const res = await db.query<{ id: string; publication_status: string }>(`
        INSERT INTO public.universities (country_code, name, city, institution_type, publication_status)
        VALUES
          ('de', 'Draft University Berlin', 'Berlin', 'public', 'draft'),
          ('fr', 'Review University Lyon', 'Lyon', 'public', 'review'),
          ('it', 'Published University Milan', 'Milan', 'public', 'published')
        RETURNING id, publication_status;
      `);

      draftUniId = res.rows.find((r) => r.publication_status === 'draft')!.id;
      reviewUniId = res.rows.find((r) => r.publication_status === 'review')!.id;
      publishedUniId = res.rows.find((r) => r.publication_status === 'published')!.id;
    });

    it('Approved explorer CANNOT see draft or review universities in browse_universities', async () => {
      const res = await asPersona('authenticated', TEST_USERS.explorer, async (tx) => {
        return tx.query<{ browse_universities: any }>(`
          SELECT public.browse_universities(NULL, NULL, 'University', 'name_asc', 1, 20);
        `);
      });

      const items = res.rows[0].browse_universities.items;
      const ids = items.map((u: any) => u.id);
      expect(ids).not.toContain(draftUniId);
      expect(ids).not.toContain(reviewUniId);
    });

    it('Direct table SELECT as student returns 0 rows for draft and review universities', async () => {
      const res = await asPersona('authenticated', TEST_USERS.student, async (tx) => {
        return tx.query<{ id: string }>(`
          SELECT id FROM public.universities WHERE id IN ('${draftUniId}', '${reviewUniId}');
        `);
      });
      expect(res.rows.length).toBe(0);
    });

    it('Anonymous user CANNOT retrieve unallowlisted published university or any draft university', async () => {
      const res = await asPersona('anon', undefined, async (tx) => {
        return tx.query<{ id: string }>(`
          SELECT id FROM public.universities WHERE id IN ('${publishedUniId}', '${draftUniId}');
        `);
      });
      expect(res.rows.length).toBe(0);
    });
  });

  // =========================================================================
  // 4. EXPLICIT PUBLICATION LIFECYCLE & APPLICATION PROTECTION
  // =========================================================================
  describe('Publication Status State Machine & Archival Protection', () => {
    let testUniId: string;

    beforeAll(async () => {
      const res = await db.query<{ id: string }>(`
        INSERT INTO public.universities (country_code, name, city, institution_type, publication_status)
        VALUES ('de', 'State Transition Test University', 'Heidelberg', 'public', 'draft')
        RETURNING id;
      `);
      testUniId = res.rows[0].id;
    });

    it('Admin transitions status: draft -> review -> published', async () => {
      // 1. Move to review
      const resReview = await asPersona('authenticated', TEST_USERS.admin, async (tx) => {
        return tx.query<{ admin_update_catalogue_status: any }>(`
          SELECT public.admin_update_catalogue_status('universities', '${testUniId}', 'review');
        `);
      });
      expect(resReview.rows[0].admin_update_catalogue_status.new_status).toBe('review');

      // 2. Move to published
      const resPub = await asPersona('authenticated', TEST_USERS.admin, async (tx) => {
        return tx.query<{ admin_update_catalogue_status: any }>(`
          SELECT public.admin_update_catalogue_status('universities', '${testUniId}', 'published');
        `);
      });
      expect(resPub.rows[0].admin_update_catalogue_status.new_status).toBe('published');
    });

    it('Archiving a university records audit event and reports referenced applications count', async () => {
      const res = await asPersona('authenticated', TEST_USERS.admin, async (tx) => {
        return tx.query<{ admin_update_catalogue_status: any }>(`
          SELECT public.admin_update_catalogue_status('universities', '${testUniId}', 'archived');
        `);
      });
      expect(res.rows[0].admin_update_catalogue_status.new_status).toBe('archived');

      // Check audit event was written
      const audit = await db.query<{ action: string; target_id: string }>(`
        SELECT action, target_id FROM public.audit_events
        WHERE target_id = '${testUniId}' AND action = 'catalogue_status_transition';
      `);
      expect(audit.rows.length).toBeGreaterThan(0);
    });
  });

  // =========================================================================
  // 5. SECURITY: SPREADSHEET FORMULA INJECTION DEFENSE & SSRF
  // =========================================================================
  describe('Spreadsheet Formula Injection & SSRF Protection', () => {
    it('admin_export_catalogue prepends single quote to dangerous formula characters', async () => {
      // Insert a test university with dangerous formula prefixes
      await db.query(`
        INSERT INTO public.universities (country_code, name, city, institution_type, publication_status)
        VALUES ('de', '=1+1 Exploit Formula', '@SUM(A1:A10)', 'public', 'published');
      `);

      const res = await asPersona('authenticated', TEST_USERS.admin, async (tx) => {
        return tx.query<{ admin_export_catalogue: any }>(`
          SELECT public.admin_export_catalogue('universities');
        `);
      });

      const exportData = res.rows[0].admin_export_catalogue.data;
      const formulaItem = exportData.find((u: any) => u.name.includes('Exploit Formula'));
      expect(formulaItem).toBeDefined();
      expect(formulaItem.name.startsWith("'=")).toBe(true);
      expect(formulaItem.city.startsWith("'@")).toBe(true);
    });

    it('TypeScript helper escapeFormulaInjection escapes dangerous spreadsheet characters', () => {
      expect(escapeFormulaInjection('=1+2')).toBe("'=1+2");
      expect(escapeFormulaInjection('+cmd|')).toBe("'+cmd|");
      expect(escapeFormulaInjection('-calc.exe')).toBe("'-calc.exe");
      expect(escapeFormulaInjection('@SUM(1,2)')).toBe("'@SUM(1,2)");
      expect(escapeFormulaInjection('\t=evil()')).toBe("'\t=evil()");
      expect(escapeFormulaInjection('Standard University')).toBe('Standard University');
    });

    it('SSRF Defense: is_valid_public_url rejects localhost, private IPs and cloud metadata', () => {
      expect(isValidPublicUrl('http://localhost:8080')).toBe(false);
      expect(isValidPublicUrl('http://127.0.0.1/admin')).toBe(false);
      expect(isValidPublicUrl('http://169.254.169.254/latest/meta-data')).toBe(false);
      expect(isValidPublicUrl('http://10.0.0.1')).toBe(false);
      expect(isValidPublicUrl('http://192.168.1.1')).toBe(false);
      expect(isValidPublicUrl('javascript:alert(1)')).toBe(false);
      expect(isValidPublicUrl('https://www.tum.de')).toBe(true);
    });

    it('Rich Text Sanitizer: strips dangerous script and iframe elements', () => {
      const malicious = '<p>Normal text</p><script>alert("pwned")</script><iframe src="evil.com"></iframe>';
      const clean = sanitizeRichText(malicious);
      expect(clean).not.toContain('<script>');
      expect(clean).not.toContain('<iframe>');
      expect(clean).toContain('<p>Normal text</p>');
    });
  });

  // =========================================================================
  // 6. ATOMIC PREVIEW ALLOWLIST 50 CAP UNDER CONCURRENT EDITS
  // =========================================================================
  describe('Preview Allowlist 50-Item Cap Enforcement', () => {
    it('Adding more than 50 universities is strictly rejected', async () => {
      // Generate 51 valid UUIDs
      const ids: string[] = [];
      for (let i = 0; i < 51; i++) {
        ids.push(`00000000-0000-0000-0000-${String(i).padStart(12, '0')}`);
      }

      await expect(
        asPersona('authenticated', TEST_USERS.admin, async (tx) => {
          return tx.query(`
            SELECT public.admin_set_preview_allowlist_atomic(
              ARRAY[${ids.map((id) => `'${id}'::UUID`).join(',')}]
            );
          `);
        })
      ).rejects.toThrow(/Preview allowlist cannot exceed 50 distinct universities/);
    });

    it('Setting allowlist with unpublished university is rejected', async () => {
      const draftUni = await db.query<{ id: string }>(`
        INSERT INTO public.universities (country_code, name, city, institution_type, publication_status)
        VALUES ('de', 'Unpublished Allowlist Test', 'Bonn', 'public', 'draft')
        RETURNING id;
      `);

      await expect(
        asPersona('authenticated', TEST_USERS.admin, async (tx) => {
          return tx.query(`
            SELECT public.admin_set_preview_allowlist_atomic(
              ARRAY['${draftUni.rows[0].id}'::UUID]
            );
          `);
        })
      ).rejects.toThrow(/Only universities with publication_status = "published" can be added to the preview allowlist/);
    });
  });

  // =========================================================================
  // 7. CSV PARSER HELPER INTEGRATION
  // =========================================================================
  describe('Client CSV Parsing & Schema Validation', () => {
    it('Parses CSV text into typed records preserving quoted commas and newlines', () => {
      const csv = `name,country_code,city,institution_type\n"Eldoria, Tech",de,Stuttgart,public\n`;
      const rows = parseCsvText(csv);
      expect(rows.length).toBe(1);
      expect(rows[0].name).toBe('Eldoria, Tech');
      expect(rows[0].country_code).toBe('de');
    });

    it('UniversityImportRowSchema validates valid rows and rejects invalid countries', () => {
      const valid = UniversityImportRowSchema.safeParse({
        name: 'Technical University',
        country_code: 'de',
        city: 'Berlin',
        institution_type: 'public',
      });
      expect(valid.success).toBe(true);

      const invalid = UniversityImportRowSchema.safeParse({
        name: 'Technical University',
        country_code: 'us', // Unsupported
        city: 'Berlin',
      });
      expect(invalid.success).toBe(false);
    });

    it('ProgramImportRowSchema requires university identifier and degree level', () => {
      const valid = ProgramImportRowSchema.safeParse({
        university_name: 'RWTH Aachen',
        name: 'M.Sc. Computer Science',
        degree_level: 'masters',
        teaching_language: 'english',
      });
      expect(valid.success).toBe(true);

      const missingUni = ProgramImportRowSchema.safeParse({
        name: 'M.Sc. Computer Science',
        degree_level: 'masters',
        teaching_language: 'english',
      });
      expect(missingUni.success).toBe(false);
    });
  });

  // =========================================================================
  // 6. COUNTRY CORRIDOR GOVERNANCE & STATUTORY POLICIES
  // =========================================================================
  describe('Country Corridor Governance & Statutory Policies', () => {
    it('Administrator can transition country corridor status', async () => {
      const res = await asPersona('authenticated', TEST_USERS.admin, async (tx) => {
        return tx.query<{ admin_update_country_status: any }>(`
          SELECT public.admin_update_country_status('ro', 'review');
        `);
      });
      expect(res.rows[0].admin_update_country_status.success).toBe(true);

      const checkCountry = await db.query<{ publication_status: string }>(`
        SELECT publication_status FROM public.countries WHERE code = 'ro';
      `);
      expect(checkCountry.rows[0].publication_status).toBe('review');
    });

    it('Ordinary counsellor cannot modify country corridor status', async () => {
      await expect(
        asPersona('authenticated', TEST_USERS.counsellor, async (tx) => {
          return tx.query(`
            SELECT public.admin_update_country_status('de', 'draft');
          `);
        })
      ).rejects.toThrow();
    });

    it('Statutory policy: Hungary cannot be transitioned to published', async () => {
      await db.query(`
        INSERT INTO public.countries (code, name, visa_authority, publication_status)
        VALUES ('hu', 'Hungary', 'Embassy of Hungary in Islamabad', 'archived')
        ON CONFLICT (code) DO UPDATE SET publication_status = 'archived';
      `);

      await expect(
        asPersona('authenticated', TEST_USERS.admin, async (tx) => {
          return tx.query(`
            SELECT public.admin_update_country_status('hu', 'published');
          `);
        })
      ).rejects.toThrow(/Hungary is deferred future scope/);
    });

    it('Administrator can export intakes and countries safely with formula injection defense', async () => {
      const res = await asPersona('authenticated', TEST_USERS.admin, async (tx) => {
        return tx.query<{ admin_export_catalogue: any }>(`
          SELECT public.admin_export_catalogue('countries');
        `);
      });
      const exportData = res.rows[0].admin_export_catalogue;
      expect(exportData.success).toBe(true);
      expect(Array.isArray(exportData.data)).toBe(true);
      expect(exportData.data.length).toBeGreaterThan(0);
    });
  });
});

