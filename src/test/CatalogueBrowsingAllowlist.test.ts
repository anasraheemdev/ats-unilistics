// @vitest-environment node
import { describe, it, expect, beforeAll } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import * as fs from 'fs';
import * as path from 'path';
import { initializeTestSupabaseEnvironment } from './helpers/supabaseTestHarness';

describe('Secured Catalogue Browsing, Atomic 50-Item Allowlist & Gated Scholarships Test Suite', () => {
  let db: PGlite;

  // Test User UUIDs
  const USER_IDS = {
    pending: '11111111-1111-4111-a111-111111111111',
    explorer: '22222222-2222-4222-a222-222222222222',
    student: '33333333-3333-4333-a333-333333333333',
    admin: '77777777-7777-4777-a777-777777777777',
  };

  // IDs of seeded universities
  const allowlistedUniIds: string[] = [];
  const publishedNonAllowlistedUniIds: string[] = [];
  const draftUniIds: string[] = [];

  let previewAllowedProgramId: string;
  let nonPreviewProgramId: string;
  let nonAllowlistProgramId: string;
  let draftProgramId: string;
  let publishedScholarshipId: string;
  let draftScholarshipId: string;

  // Helper to execute query as a specific persona context
  async function asPersona<T = any>(
    role: 'anon' | 'authenticated',
    userId?: string,
    queryFn?: (tx: PGlite) => Promise<T>
  ): Promise<T> {
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
      await db.exec('RESET ROLE; RESET "request.jwt.claim.sub"; RESET "request.jwt.claim.role";');
    }
  }

  beforeAll(async () => {
    db = new PGlite();

    // Initialize mock Supabase internal schemas (auth, storage) for PGlite test environment
    await initializeTestSupabaseEnvironment(db);

    // 1. Run all 8 migrations in sequence
    const migrationFiles = [
      '20261022000001_core_and_auth_schema.sql',
      '20261022000002_catalogue_and_workflows.sql',
      '20261022000003_cases_applications_and_assignments.sql',
      '20261022000004_tasks_documents_and_messages.sql',
      '20261022000005_audit_notifications_and_outbox.sql',
      '20261022000006_rpcs_projections_and_grants.sql',
      '20261022000007_storage_policies.sql',
      '20261022000008_preview_allowlist_and_catalog_security.sql',
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

    // 3. Seed User Profiles & Entitlements
    // Staff Admin (must be first so granted_by foreign key succeeds)
    await db.exec(`
      INSERT INTO auth.users (id, email) VALUES ('${USER_IDS.admin}', 'admin@test.local');
      INSERT INTO public.profiles (id, email, full_name, account_status)
      VALUES ('${USER_IDS.admin}', 'admin@test.local', 'Admin User', 'active');
      INSERT INTO public.staff_roles (user_id, role)
      VALUES ('${USER_IDS.admin}', 'admin');
    `);

    // Pending Applicant (no active entitlement)
    await db.exec(`
      INSERT INTO auth.users (id, email) VALUES ('${USER_IDS.pending}', 'pending@test.local');
      INSERT INTO public.profiles (id, email, full_name, account_status)
      VALUES ('${USER_IDS.pending}', 'pending@test.local', 'Pending User', 'active');
    `);

    // Explorer (active explorer_catalogue entitlement)
    await db.exec(`
      INSERT INTO auth.users (id, email) VALUES ('${USER_IDS.explorer}', 'explorer@test.local');
      INSERT INTO public.profiles (id, email, full_name, account_status)
      VALUES ('${USER_IDS.explorer}', 'explorer@test.local', 'Explorer User', 'active');
      INSERT INTO public.entitlements (user_id, entitlement_type, status, granted_by)
      VALUES ('${USER_IDS.explorer}', 'explorer_catalogue', 'active', '${USER_IDS.admin}');
    `);

    // Managed Student (active managed_application_case entitlement)
    await db.exec(`
      INSERT INTO auth.users (id, email) VALUES ('${USER_IDS.student}', 'student@test.local');
      INSERT INTO public.profiles (id, email, full_name, account_status)
      VALUES ('${USER_IDS.student}', 'student@test.local', 'Managed Student', 'active');
      INSERT INTO public.entitlements (user_id, entitlement_type, status, granted_by)
      VALUES ('${USER_IDS.student}', 'managed_application_case', 'active', '${USER_IDS.admin}');
    `);

    // 4. Seed Synthetic Fixtures: 65 Universities Total
    // 4a. 45 Published Universities to be allowlisted
    const countries = ['de', 'fr', 'it', 'ro'];
    for (let i = 1; i <= 45; i++) {
      const c = countries[(i - 1) % countries.length];
      const res = await db.query<{ id: string }>(`
        INSERT INTO public.universities (country_code, name, city, institution_type, publication_status)
        VALUES ('${c}', 'Allowlisted University ${String(i).padStart(2, '0')}', 'City ${i}', 'public', 'published')
        RETURNING id;
      `);
      const uId = res.rows[0].id;
      allowlistedUniIds.push(uId);

      // Add to preview allowlist
      await db.exec(`
        INSERT INTO public.preview_allowlist (university_id, sort_order)
        VALUES ('${uId}', ${i});
      `);
    }

    // 4b. 12 Published Universities NOT in allowlist
    for (let i = 46; i <= 57; i++) {
      const c = countries[(i - 1) % countries.length];
      const res = await db.query<{ id: string }>(`
        INSERT INTO public.universities (country_code, name, city, institution_type, publication_status)
        VALUES ('${c}', 'Non-Allowlisted Published Uni ${i}', 'City ${i}', 'public', 'published')
        RETURNING id;
      `);
      publishedNonAllowlistedUniIds.push(res.rows[0].id);
    }

    // 4c. 8 Draft Universities (unpublished)
    for (let i = 58; i <= 65; i++) {
      const c = countries[(i - 1) % countries.length];
      const res = await db.query<{ id: string }>(`
        INSERT INTO public.universities (country_code, name, city, institution_type, publication_status)
        VALUES ('${c}', 'Draft Internal Uni ${i}', 'City ${i}', 'private', 'draft')
        RETURNING id;
      `);
      draftUniIds.push(res.rows[0].id);
    }

    // 5. Seed Synthetic Programs
    // Program 1: Allowlisted university + preview allowed
    const p1 = await db.query<{ id: string }>(`
      INSERT INTO public.programs (university_id, name, degree_level, teaching_language, tuition_type, annual_tuition_eur, application_portal, publication_status, is_preview_allowed)
      VALUES ('${allowlistedUniIds[0]}', 'M.Sc. Preview Permitted Computer Science', 'masters', 'english', 'free', 0, 'direct', 'published', true)
      RETURNING id;
    `);
    previewAllowedProgramId = p1.rows[0].id;

    // Program 2: Allowlisted university + preview NOT allowed (private/explorer only)
    const p2 = await db.query<{ id: string }>(`
      INSERT INTO public.programs (university_id, name, degree_level, teaching_language, tuition_type, annual_tuition_eur, application_portal, publication_status, is_preview_allowed)
      VALUES ('${allowlistedUniIds[0]}', 'M.Sc. Confidential Clinical Track', 'masters', 'english', 'free', 0, 'direct', 'published', false)
      RETURNING id;
    `);
    nonPreviewProgramId = p2.rows[0].id;

    // Program 3: Non-allowlisted published university (index 6 is strictly outside the 50 allowlist)
    const p3 = await db.query<{ id: string }>(`
      INSERT INTO public.programs (university_id, name, degree_level, teaching_language, tuition_type, annual_tuition_eur, application_portal, publication_status, is_preview_allowed)
      VALUES ('${publishedNonAllowlistedUniIds[6]}', 'B.Sc. Non-Allowlist Mechanical', 'bachelors', 'english', 'standard', 500, 'direct', 'published', true)
      RETURNING id;
    `);
    nonAllowlistProgramId = p3.rows[0].id;

    // Program 4: Draft program
    const p4 = await db.query<{ id: string }>(`
      INSERT INTO public.programs (university_id, name, degree_level, teaching_language, tuition_type, annual_tuition_eur, application_portal, publication_status, is_preview_allowed)
      VALUES ('${allowlistedUniIds[0]}', 'Draft Unpublished Syllabus', 'masters', 'english', 'free', 0, 'direct', 'draft', true)
      RETURNING id;
    `);
    draftProgramId = p4.rows[0].id;

    // 6. Seed Synthetic Scholarships
    const s1 = await db.query<{ id: string }>(`
      INSERT INTO public.scholarships (country_code, name, provider, degree_level, coverage_type, stipend_amount_eur, publication_status)
      VALUES ('it', 'Italian Regional DSU Need Grant', 'DSU Toscana', 'all', 'full_tuition_and_stipend', 7200, 'published')
      RETURNING id;
    `);
    publishedScholarshipId = s1.rows[0].id;

    const s2 = await db.query<{ id: string }>(`
      INSERT INTO public.scholarships (country_code, name, provider, degree_level, coverage_type, stipend_amount_eur, publication_status)
      VALUES ('de', 'Unpublished Internal Grant Draft', 'Internal Foundation', 'masters', 'tuition_waiver', 0, 'draft')
      RETURNING id;
    `);
    draftScholarshipId = s2.rows[0].id;
  });

  // ============================================================================
  // Requirement 1: Database-Enforced Global 50-Item Allowlist Limit
  // ============================================================================
  describe('Database Trigger: Atomic 50-Item Global Preview Allowlist Limit', () => {
    it('allows inserting up to 50 distinct universities in the allowlist', async () => {
      // We already inserted 45. Let's insert 5 more (universities 46 to 50)
      for (let i = 0; i < 5; i++) {
        const uId = publishedNonAllowlistedUniIds[i];
        await db.exec(`
          INSERT INTO public.preview_allowlist (university_id, sort_order)
          VALUES ('${uId}', ${46 + i});
        `);
      }

      const count = await db.query<{ count: string }>(`SELECT COUNT(*) FROM public.preview_allowlist;`);
      expect(Number(count.rows[0].count)).toBe(50);
    });

    it('atomically REJECTS adding a 51st university with an exception from the trigger', async () => {
      // 51st university insertion attempt
      const uId51 = publishedNonAllowlistedUniIds[5];
      await expect(
        db.exec(`
          INSERT INTO public.preview_allowlist (university_id, sort_order)
          VALUES ('${uId51}', 51);
        `)
      ).rejects.toThrow(/Preview allowlist cannot exceed 50 distinct universities/);
    });

    it('allows deleting an allowlisted university and re-inserting', async () => {
      // Remove one to bring count to 49
      const uIdToRemove = publishedNonAllowlistedUniIds[4];
      await db.exec(`DELETE FROM public.preview_allowlist WHERE university_id = '${uIdToRemove}';`);

      const countAfterDel = await db.query<{ count: string }>(`SELECT COUNT(*) FROM public.preview_allowlist;`);
      expect(Number(countAfterDel.rows[0].count)).toBe(49);

      // Now adding a university succeeds
      await db.exec(`
        INSERT INTO public.preview_allowlist (university_id, sort_order)
        VALUES ('${uIdToRemove}', 50);
      `);
      const countAfterReinsert = await db.query<{ count: string }>(`SELECT COUNT(*) FROM public.preview_allowlist;`);
      expect(Number(countAfterReinsert.rows[0].count)).toBe(50);
    });
  });

  // ============================================================================
  // Requirement 2: Anonymous User Visibility & Direct Query Boundaries
  // ============================================================================
  describe('Anonymous Visibility Limits Across Endpoints & Query Shapes', () => {
    it('ensures direct SELECT on universities returns ONLY the allowlisted set (at most 50)', async () => {
      const res = await asPersona('anon', undefined, async (tx) => {
        return tx.query<{ id: string; name: string }>(`SELECT id, name FROM public.universities;`);
      });

      expect(res.rows.length).toBe(50);
      // Verify every returned ID belongs to preview_allowlist
      const allowlistRows = await db.query<{ university_id: string }>(`SELECT university_id FROM public.preview_allowlist;`);
      const allowlistSet = new Set(allowlistRows.rows.map((r) => r.university_id));

      for (const row of res.rows) {
        expect(allowlistSet.has(row.id)).toBe(true);
      }
    });

    it('denies anonymous direct ID lookup on a published university outside the allowlist', async () => {
      const nonAllowlistId = publishedNonAllowlistedUniIds[6]; // Not in the 50 allowlist
      const res = await asPersona('anon', undefined, async (tx) => {
        return tx.query(`SELECT * FROM public.universities WHERE id = '${nonAllowlistId}';`);
      });
      expect(res.rows.length).toBe(0);
    });

    it('denies anonymous direct ID lookup on a draft university', async () => {
      const draftId = draftUniIds[0];
      const res = await asPersona('anon', undefined, async (tx) => {
        return tx.query(`SELECT * FROM public.universities WHERE id = '${draftId}';`);
      });
      expect(res.rows.length).toBe(0);
    });

    it('verifies mathematical union of paginated anonymous results cannot exceed the allowlist', async () => {
      const retrievedIds = new Set<string>();

      // Loop across 10 pages with varying offsets and page sizes
      for (let offset = 0; offset < 80; offset += 10) {
        const page = await asPersona('anon', undefined, async (tx) => {
          return tx.query<{ id: string }>(`SELECT id FROM public.universities ORDER BY name ASC LIMIT 10 OFFSET ${offset};`);
        });
        for (const r of page.rows) {
          retrievedIds.add(r.id);
        }
      }

      // Total distinct retrieved IDs across all pages cannot exceed 50
      expect(retrievedIds.size).toBe(50);
    });

    it('verifies browse_universities RPC enforces the allowlist limit for anonymous callers', async () => {
      const rpcResult = await asPersona('anon', undefined, async (tx) => {
        const q = await tx.query<{ browse_universities: any }>(`SELECT public.browse_universities(p_page := 1, p_page_size := 50);`);
        return q.rows[0].browse_universities;
      });

      expect(rpcResult.is_preview_restricted).toBe(true);
      expect(rpcResult.total_count).toBe(50);
      expect(rpcResult.items.length).toBe(50);
    });
  });

  // ============================================================================
  // Requirement 3: Programs Safe Visibility for Anonymous Users
  // ============================================================================
  describe('Programs Visibility & Leakage Prevention', () => {
    it('allows anonymous to query published program with is_preview_allowed=true on allowlisted uni', async () => {
      const res = await asPersona('anon', undefined, async (tx) => {
        return tx.query(`SELECT id, name FROM public.programs WHERE id = '${previewAllowedProgramId}';`);
      });
      expect(res.rows.length).toBe(1);
    });

    it('denies anonymous access to published program with is_preview_allowed=false', async () => {
      const res = await asPersona('anon', undefined, async (tx) => {
        return tx.query(`SELECT id, name FROM public.programs WHERE id = '${nonPreviewProgramId}';`);
      });
      expect(res.rows.length).toBe(0);
    });

    it('denies anonymous access to program belonging to non-allowlisted university', async () => {
      const res = await asPersona('anon', undefined, async (tx) => {
        return tx.query(`SELECT id, name FROM public.programs WHERE id = '${nonAllowlistProgramId}';`);
      });
      expect(res.rows.length).toBe(0);
    });

    it('denies anonymous access to draft program', async () => {
      const res = await asPersona('anon', undefined, async (tx) => {
        return tx.query(`SELECT id, name FROM public.programs WHERE id = '${draftProgramId}';`);
      });
      expect(res.rows.length).toBe(0);
    });

    it('denies anonymous access to non-allowlisted data through nested relationships', async () => {
      const res = await asPersona('anon', undefined, async (tx) => {
        return tx.query(`
          SELECT u.name AS uni_name, p.name AS prog_name
          FROM public.universities u
          JOIN public.programs p ON p.university_id = u.id
          WHERE p.id = '${nonAllowlistProgramId}';
        `);
      });
      expect(res.rows.length).toBe(0);
    });
  });

  // ============================================================================
  // Requirement 4: Scholarships Gated Enforcement at Database Level
  // ============================================================================
  describe('Scholarships Gated Access Controls', () => {
    it('returns ZERO rows for anonymous direct table query on scholarships (default deny)', async () => {
      const res = await asPersona('anon', undefined, async (tx) => {
        return tx.query(`SELECT * FROM public.scholarships;`);
      });
      expect(res.rows.length).toBe(0);
    });

    it('denies anonymous access by direct scholarship ID lookup', async () => {
      const res = await asPersona('anon', undefined, async (tx) => {
        return tx.query(`SELECT * FROM public.scholarships WHERE id = '${publishedScholarshipId}';`);
      });
      expect(res.rows.length).toBe(0);
    });

    it('returns is_gated=true and empty items array when anonymous calls browse_scholarships RPC', async () => {
      const rpcResult = await asPersona('anon', undefined, async (tx) => {
        const q = await tx.query<{ browse_scholarships: any }>(`SELECT public.browse_scholarships();`);
        return q.rows[0].browse_scholarships;
      });

      expect(rpcResult.is_gated).toBe(true);
      expect(rpcResult.items).toEqual([]);
      expect(rpcResult.total_count).toBe(0);
      expect(rpcResult.cta_message).toContain('Regional European scholarships are restricted to verified applicants');
    });

    it('returns is_gated=true for pending applicant without approved explorer entitlement', async () => {
      const rpcResult = await asPersona('authenticated', USER_IDS.pending, async (tx) => {
        const q = await tx.query<{ browse_scholarships: any }>(`SELECT public.browse_scholarships();`);
        return q.rows[0].browse_scholarships;
      });

      expect(rpcResult.is_gated).toBe(true);
      expect(rpcResult.items).toEqual([]);
    });

    it('allows approved explorer to query published scholarships', async () => {
      const res = await asPersona('authenticated', USER_IDS.explorer, async (tx) => {
        return tx.query<{ id: string; name: string }>(`SELECT id, name FROM public.scholarships;`);
      });
      expect(res.rows.length).toBe(1);
      expect(res.rows[0].name).toBe('Italian Regional DSU Need Grant');
    });

    it('allows approved explorer to call browse_scholarships RPC and retrieve items', async () => {
      const rpcResult = await asPersona('authenticated', USER_IDS.explorer, async (tx) => {
        const q = await tx.query<{ browse_scholarships: any }>(`SELECT public.browse_scholarships();`);
        return q.rows[0].browse_scholarships;
      });

      expect(rpcResult.is_gated).toBe(false);
      expect(rpcResult.total_count).toBe(1);
      expect(rpcResult.items.length).toBe(1);
      expect(rpcResult.items[0].provider).toBe('DSU Toscana');
    });

    it('prevents draft scholarship leakage to approved explorer', async () => {
      const res = await asPersona('authenticated', USER_IDS.explorer, async (tx) => {
        return tx.query(`SELECT * FROM public.scholarships WHERE id = '${draftScholarshipId}';`);
      });
      expect(res.rows.length).toBe(0);
    });
  });

  // ============================================================================
  // Requirement 5: Approved Explorer & Managed Student Full Catalogue Browsing
  // ============================================================================
  describe('Approved Account Full Catalogue Browsing', () => {
    it('allows approved explorer to browse all 57 published universities (allowlisted + non-allowlisted)', async () => {
      const res = await asPersona('authenticated', USER_IDS.explorer, async (tx) => {
        return tx.query(`SELECT id FROM public.universities WHERE publication_status = 'published';`);
      });
      expect(res.rows.length).toBe(57);
    });

    it('allows managed student to browse all 57 published universities', async () => {
      const res = await asPersona('authenticated', USER_IDS.student, async (tx) => {
        return tx.query(`SELECT id FROM public.universities WHERE publication_status = 'published';`);
      });
      expect(res.rows.length).toBe(57);
    });

    it('prevents approved explorer from viewing draft universities', async () => {
      const res = await asPersona('authenticated', USER_IDS.explorer, async (tx) => {
        return tx.query(`SELECT * FROM public.universities WHERE id = '${draftUniIds[0]}';`);
      });
      expect(res.rows.length).toBe(0);
    });

    it('returns is_preview_restricted=false when approved explorer calls browse_universities', async () => {
      const rpcResult = await asPersona('authenticated', USER_IDS.explorer, async (tx) => {
        const q = await tx.query<{ browse_universities: any }>(`SELECT public.browse_universities(p_page_size := 50);`);
        return q.rows[0].browse_universities;
      });

      expect(rpcResult.is_preview_restricted).toBe(false);
      expect(rpcResult.total_count).toBe(57);
    });
  });

  // ============================================================================
  // Requirement 6: Bookmarking for Approved Accounts
  // ============================================================================
  describe('Program Bookmarking Authorization & RPC', () => {
    it('rejects anonymous callers from toggling program bookmarks', async () => {
      await expect(
        asPersona('anon', undefined, async (tx) => {
          return tx.query(`SELECT public.toggle_program_bookmark('${previewAllowedProgramId}');`);
        })
      ).rejects.toThrow();
    });

    it('rejects pending unapproved users from saving bookmarks', async () => {
      await expect(
        asPersona('authenticated', USER_IDS.pending, async (tx) => {
          return tx.query(`SELECT public.toggle_program_bookmark('${previewAllowedProgramId}');`);
        })
      ).rejects.toThrow(/Approved Explorer or Managed Student access required/);
    });

    it('allows approved explorer to toggle bookmark on and off', async () => {
      // Toggle ON
      const toggleOn = await asPersona('authenticated', USER_IDS.explorer, async (tx) => {
        const res = await tx.query<{ toggle_program_bookmark: any }>(
          `SELECT public.toggle_program_bookmark('${previewAllowedProgramId}');`
        );
        return res.rows[0].toggle_program_bookmark;
      });

      expect(toggleOn.success).toBe(true);
      expect(toggleOn.is_bookmarked).toBe(true);

      // Verify row exists in bookmarks table
      const bmRow = await asPersona('authenticated', USER_IDS.explorer, async (tx) => {
        return tx.query(
          `SELECT * FROM public.bookmarks WHERE user_id = '${USER_IDS.explorer}' AND program_id = '${previewAllowedProgramId}';`
        );
      });
      expect(bmRow.rows.length).toBe(1);

      // Toggle OFF
      const toggleOff = await asPersona('authenticated', USER_IDS.explorer, async (tx) => {
        const res = await tx.query<{ toggle_program_bookmark: any }>(
          `SELECT public.toggle_program_bookmark('${previewAllowedProgramId}');`
        );
        return res.rows[0].toggle_program_bookmark;
      });

      expect(toggleOff.success).toBe(true);
      expect(toggleOff.is_bookmarked).toBe(false);

      // Verify row is deleted
      const bmRowAfter = await asPersona('authenticated', USER_IDS.explorer, async (tx) => {
        return tx.query(
          `SELECT * FROM public.bookmarks WHERE user_id = '${USER_IDS.explorer}' AND program_id = '${previewAllowedProgramId}';`
        );
      });
      expect(bmRowAfter.rows.length).toBe(0);
    });
  });
});
