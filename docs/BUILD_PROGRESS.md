# Build Progress & Phase Execution Record: Unilistics

**Repository:** `ats-unilistics`  
**Current Phase:** Phase 2 — Development Foundation (Vite + React + TypeScript, Design Tokens, Routing, Layouts, Accessible Components & Responsive Verification)  
**Phase Status:** ✅ COMPLETED  
**Date:** 2026-10-22

---

## 1. Phase Execution History

### Phase 1: Discovery, Specification, Architecture & Workflow Extraction (Completed)
- Source guides in `complete_application_procedures/` analyzed and extracted.
- Architecture documents and ADRs created in `docs/` and `AGENTS.md`.

---

## 2. Phase 2 Objectives & Scope

1. **Vite + React + TypeScript Foundation:**
   - Standard Vite SPA with strictly React 18, React Router v6, TypeScript 5.5, TanStack Query v5, and Zod.
   - Pinned dependencies with reproducible `package-lock.json`.
   - Strictly avoid Next.js-only APIs.
2. **Design Tokens & Aesthetic Architecture:**
   - Unified CSS variables in `src/styles/tokens.css` based on `ui-ux-pro-max` (Accessible, Ethical color palette, WCAG 2.2 AA compliant contrast, 44px touch targets, visible focus rings).
   - Provisional text wordmark (`UNILISTICS PREVIEW`) with explicit warning that no graphical logo has been invented.
3. **Four Dedicated Portals & Layouts:**
   - **Public:** Directory Preview (capped at ≤ 50 universities), Access Request form, Sign In.
   - **Explorer:** 4-item navigation (`Explore`, `Saved`, `Request Application Support`, `Account`), full search/filters, scholarship catalogue.
   - **Student:** 7-item navigation (`Overview`, `My Applications`, `Documents`, `Tasks`, `Messages`, `Explore`, `Help`), private document vault, action task management, counsellor support panel.
   - **Staff:** Separate administrative boundary (`Staff Dashboard`, `Assigned Cases`, `Review Queue`, `Settings & Provisioning`).
4. **Student Overview Priorities (Contract Requirement):**
   - Prioritizes: (1) Current Stage, (2) Next Required Action, (3) Due Date, (4) Responsible Person, (5) Last Update.
   - Strictly NO fabricated completion percentages, acceptance odds, testimonials, or fake live metrics.
5. **Form Behavior & Data Privacy:**
   - Auto-saving save-and-resume drafts for long forms (`/request-access`) via safe localStorage.
   - Never persists sensitive files, passwords, or PII into browser storage.
   - Fully isolated, visibly labeled synthetic demo fixtures in `src/data/demoData.ts` (12 universities, programs, scholarships, student cases, tasks, documents).
6. **Tooling & CI:**
   - `.env.example` with variable names only (no secrets or service keys in `VITE_` variables).
   - `.eslintrc.cjs`, `.prettierrc`, `tsconfig.json`, `tsconfig.node.json`, and `.github/workflows/ci.yml`.
7. **Verification & Testing:**
   - Automated Vitest unit test suite (5 files, 9 tests passed).
   - Playwright end-to-end and responsive layout suite tested at 360px (mobile), 768px (tablet), and 1280px (desktop) via `with_server.py`.
   - TypeScript compiler validation (`tsc --noEmit`) and production bundle build (`vite build`).

---

## 3. Phase 2 Commands Executed & Outcomes

| # | Command / Tool Call | Working Directory | Intent / Purpose | Exit Code / Outcome |
|---|---|---|---|---|
| 1 | `npm install` | Workspace Root | Install runtime and dev dependencies (`react`, `react-router-dom`, `@tanstack/react-query`, `zod`, `lucide-react`, `vitest`, `playwright`, etc.) | Success (0): Generated reproducible `package-lock.json`. Peer conflict resolved by removing `@hookform/resolvers` in favor of direct Zod validation. |
| 2 | `npm run typecheck` (`tsc --noEmit`) | Workspace Root | Verify zero TypeScript errors across all foundations, layouts, components, and pages | Success (0): 0 type errors. |
| 3 | `npm test` (`vitest run`) | Workspace Root | Execute unit test suite for DeadlineCard, StageTimeline, AccessValidation, DraftStorage, BrandWordmark | Success (0): 5 test files passed, 9 tests passed in 6.81s. |
| 4 | `python .agents/skills/webapp-testing/scripts/with_server.py --server "npm run dev" --port 5173 -- python tests/test_browser_responsive.py` | Workspace Root | Verify responsive layouts, navigation, and save-and-resume form behavior at 1280px, 768px, and 360px viewports | Success (0): All checks passed. Mobile 360px overflow resolved by collapsing desktop switcher and hiding secondary wordmark tagline on narrow viewports. |
| 5 | `npm run build` (`tsc && vite build`) | Workspace Root | Verify production bundling and chunk compilation | Success (0): `dist/` created (index.html 0.97 kB, CSS 4.37 kB, JS 410.81 kB). |

---

## 4. Test & Verification Matrix

### Unit & Integration Tests (Vitest)
- `src/test/DeadlineCard.test.tsx` (1 test): Validates all 5 mandatory contract fields (current stage, next required action, due date, responsible person, last update). [PASS]
- `src/test/StageTimeline.test.tsx` (1 test): Validates chronological stage progression and accessible step indicators. [PASS]
- `src/test/BrandWordmark.test.tsx` (1 test): Validates provisional text wordmark and PREVIEW badge. [PASS]
- `src/test/AccessValidation.test.ts` (3 tests): Validates Zod schemas for access requests, phone number validation, and passport formats. [PASS]
- `src/test/DraftStorage.test.ts` (3 tests): Validates safe save-and-resume behavior, non-persistence of sensitive data, and draft clearing. [PASS]

### Automated Browser & Responsive Tests (Playwright)
- **Desktop (1280px x 800px):**
  - Skip link keyboard navigation (`Tab` focus) verified. [PASS]
  - Provisional brand wordmark visible. [PASS]
  - Visitor preview catalogue restricted to ≤ 50 universities (18 rendered). [PASS]
  - Staff administrative portal boundary verified (`/staff`). [PASS]
  - Explorer 4-item navigation and catalogue verified (`/explorer`). [PASS]
- **Tablet (768px x 1024px):**
  - Layout responsive with zero horizontal overflow (`scrollWidth <= clientWidth`). [PASS]
- **Mobile (360px x 740px):**
  - Zero horizontal overflow at 360px. [PASS]
  - Mobile hamburger button opens mobile navigation drawer. [PASS]
  - Mobile navigation drawer collapses cleanly. [PASS]
  - Save-and-resume form auto-saves draft into safe storage, restores on reload, and clears on button click. [PASS]

---

## 5. Phase 3: Database Migrations, RLS Security Policies & Authorization Testing

**Phase Status:** ✅ COMPLETED  
**Date:** 2026-10-22

### Objectives & Deliverables
1. **7 Versioned SQL Migrations (`supabase/migrations/`):**
   - `20261022000001_core_and_auth_schema.sql`: schemas (`auth`, `private`), `profiles`, `staff_roles`, `entitlements`, `access_requests`, private security definer helper functions, initial RLS.
   - `20261022000002_catalogue_and_workflows.sql`: `countries`, `universities`, `programs`, `intakes`, `scholarships`, `bookmarks`, `workflow_templates`/`versions`, `workflow_steps`/`dependencies`, `guide_sources`/`versions`.
   - `20261022000003_cases_applications_and_assignments.sql`: `student_cases` (1 case room per student), `case_assignments` (row-level counsellor scoping), `applications` (multi-program submissions).
   - `20261022000004_tasks_documents_and_messages.sql`: `tasks`, `document_metadata`/`versions`, `document_links` (with anti-forgery cross-case trigger), `messages`, `internal_notes` (strictly staff-isolated).
   - `20261022000005_audit_notifications_and_outbox.sql`: `audit_events` (with immutability trigger preventing client UPDATE/DELETE), `notifications`, `outbox` (transactional message queue).
   - `20261022000006_rpcs_projections_and_grants.sql`: public projections `WITH (security_invoker = true)`, privileged RPCs (`request_platform_access`, `approve_access_request`, `assign_case_counsellor`, `submit_document_review`), explicit grants/revocations.
   - `20261022000007_storage_policies.sql`: `storage.buckets` (`student-vault`), `storage.objects` RLS for upload, read, and upsert.
2. **Access Control & Anti-Forgery Mechanisms:**
   - Default deny on all tables; row ownership predicates `(select auth.uid()) = user_id`.
   - Private helper functions (`private.is_staff`, `private.is_admin`, `private.is_assigned_counsellor`, `private.can_access_case`) execute with `SET search_path = ''`.
   - Dedicated `internal_notes` table completely isolated from students via RLS (never relying on frontend filtering).
   - Trigger `trg_validate_document_link` blocks cross-student application document forgery.
   - Trigger `trg_audit_events_immutable` prohibits UPDATE or DELETE on audit history.
   - Idempotent `approve_access_request` RPC creates user profiles, grants entitlements, initializes cases with normalized country codes, and records audit entries.
3. **Real Postgres Authorization Test Suite (`src/test/AuthorizationMatrix.test.ts`):**
   - Real PostgreSQL 18 embedded engine via `@electric-sql/pglite`.
   - Tested 8 distinct personas: `anon`, `pending`, `explorer`, `student_a`, `student_b`, `counsellor_assigned`, `counsellor_unassigned`, `admin`, `suspended`.
   - All 31 authorization and security test vectors executed and PASSED.

---

## 6. Phase 4: Secured Catalogue Browsing, Atomic 50-Item Allowlist & Gated Scholarships
**Phase Status:** ✅ COMPLETED  
**Date:** 2026-10-22

### Objectives & Deliverables
1. **Migration 008 (`20261022000008_preview_allowlist_and_catalog_security.sql`):**
   - Added `is_preview_allowed` flag on `programs`.
   - Created `preview_allowlist` table (`university_id UUID PRIMARY KEY`, `sort_order`, `added_by`, `added_at`).
   - Implemented database trigger `trg_enforce_preview_allowlist_limit` that atomically rejects adding a 51st university globally (`COUNT(*) >= 50`).
   - Overhauled RLS policies on `universities`, `programs`, `intakes`, and `scholarships`:
     - Anonymous users can only query published universities in `preview_allowlist` (≤ 50) and explicitly preview-allowed programs belonging to them.
     - Scholarships table has default deny for anonymous users (0 rows returned at engine level).
     - Approved explorers and managed students browse all published university, program, and scholarship records.
   - Created safe server-side browsing RPCs with bounded inputs, pagination, and whitelisted sorting:
     - `public.browse_universities(p_country, p_institution_type, p_search, p_sort_by, p_page, p_page_size)`
     - `public.browse_programs(p_country, p_degree_level, p_language, p_tuition_type, p_search, p_sort_by, p_page, p_page_size)`
     - `public.browse_scholarships(p_country, p_degree_level, p_coverage_type, p_search, p_page, p_page_size)` (returns `is_gated: true, items: []` for unapproved/anonymous callers).
     - `public.toggle_program_bookmark(p_program_id)` (requires approved explorer or student entitlement).
2. **Frontend UI & API Implementation:**
   - **`LandingPage.tsx`:** Displays administrator-approved preview institutions (bounded at ≤ 50 globally), real count display, bounded search, pagination, and public data copyability disclosure.
   - **`ExplorerCataloguePage.tsx`:** Server-side paginated academic programs and scholarships browsing.
     - Programs display country, degree level, teaching language, verified source link, verified date, next intake deadline, and bookmark toggle.
     - Scholarships tab renders honest gated CTA card with preserved redirect parameters (`/sign-in?redirect=...` and `/request-access?redirect=...`). No frontend overlay/blur over downloaded private data.
     - Non-guarantee and non-statutory disclaimers displayed on all catalogue views.
   - **`SignInPage.tsx`:** Reads `redirect` search parameter and preserves user destination after successful sign in or role switch.
   - **`SavedProgramsPage.tsx`:** Connected to bookmark API for saving and removing degree tracks.
   - **`StudentExplorePage.tsx`:** Updated with server-side paginated browsing and bookmark support.
3. **Automated Verification Suite (`src/test/CatalogueBrowsingAllowlist.test.ts`):**
   - Seeded synthetic fixtures with 65 universities (45 allowlisted, 12 non-allowlisted published, 8 draft).
   - Validated:
     - Trigger atomically rejects 51st allowlisted university (`RAISE EXCEPTION`).
     - Anonymous queries across all endpoints (direct table SELECT, ID lookup, RPC, nested joins, pagination) are strictly bounded to the allowlist (size ≤ 50).
     - Direct ID query on published non-allowlisted university returns 0 rows for anonymous.
     - Direct ID query on draft university returns 0 rows.
     - Anonymous direct table query on scholarships returns 0 rows (default deny).
     - Anonymous `browse_scholarships` RPC returns `is_gated: true, items: []`.
     - Approved accounts browse all 57 published universities and scholarships.
     - Bookmark toggle succeeds for approved accounts and is rejected for anonymous callers.

---

## 7. Full Test & Verification Summary

| Suite / Check | Command | Tests Run | Result | Notes |
|---|---|---|---|---|
| **Vitest Full Test Suite** | `npm test` (`vitest run`) | 7 files, 67 tests | **PASSED (67/67)** | 31 Core RLS tests + 27 Catalogue Allowlist tests + 9 UI/validation tests passed in 6.06s. |
| **Catalogue & Allowlist Suite** | `npx vitest run src/test/CatalogueBrowsingAllowlist.test.ts` | 27 tests | **PASSED (27/27)** | Tested atomic 50 limit trigger, anonymous query bounds, gated scholarships, and bookmarks against PostgreSQL 18 in PGlite. |
| **Core RLS Authorization Suite** | `npx vitest run src/test/AuthorizationMatrix.test.ts` | 31 tests | **PASSED (31/31)** | Verified BOLA/IDOR prevention, counsellor isolation, cross-student forgery block, and audit immutability. |
| **TypeScript Typecheck** | `npm run typecheck` (`tsc --noEmit`) | Full repo | **PASSED (0 errors)** | Zero type errors across components, schemas, RPCs, and test harness. |
| **Production Bundle** | `npm run build` (`tsc && vite build`) | Full repo | **PASSED (0 errors)** | Compiled `dist/` in 3.89s (CSS 4.37 kB, JS 439.20 kB). |

---

## 8. Next Phase Plan: Phase 5 (Edge Functions & Transactional Outbox Worker)

1. **Step 5.1 — Edge Functions:**
   - Author `provision-staff-role` Edge Function (super admin role changes with audit log).
   - Author `send-activation-invite` Edge Function (magic token generation without exposing plaintext credentials).
2. **Step 5.2 — Transactional Outbox Consumer:**
   - Background worker processing `public.outbox` events into email dispatch.
3. **Step 5.3 — Storage Upload Integration:**
   - Integrate React frontend document vault with private `student-vault` signed upload URLs.
