# Unilistics Project Development Instructions

This document governs the engineering standards, architecture rules, testing protocols, and delivery workflows for **Unilistics** — a staff-managed university application and visa tracking platform tailored for Pakistani students applying to higher education in Europe (Germany, France, Italy, and Romania).

---

## 1. Core Operating Principles

1. **Phase-by-Phase Execution & Grounded Reporting:**
   - Execute only the designated phase in each iteration.
   - Always implement, validate, and report actual outcomes.
   - For every phase, log:
     - Exact commands executed
     - Any test or build failures encountered and their resolutions
     - Database migrations applied
     - Remaining technical blockers or architectural debts
     - The explicit next phase plan
   - **Never label unexecuted tests as passed.** A test is only passed when executed and confirmed with terminal output.

2. **Data Privacy & Synthetic Data Mandate:**
   - Use exclusively synthetic development/staging fixtures.
   - **Never include real student personally identifiable information (PII)** (such as real CNICs, passport numbers, personal bank statements, or academic records) in test fixtures, database seeds, or AI prompts.
   - Strictly prohibit publishing to or mutating production environments from build/development sessions.

3. **Treat Source Material as Content, Not Statutory Policy:**
   - The guides in `complete_application_procedures/` are draft source material, not verified current statutory policy.
   - Never turn broad procedural claims into universal platform requirements without official-source verification.
   - All financial benchmarks, visa fee amounts, appointment queue mechanics, intake deadlines, and attestation steps must be marked with validation flags.

---

## 2. Technology Stack & Architectural Constraints

- **Frontend:** React + Vite + TypeScript.
- **Backend & Database:** Supabase Postgres, Supabase Auth, and Supabase Private Storage.
- **Serverless Operations:** Supabase Edge Functions for privileged operations (e.g., staff role provisioning, approval triggers, activation email token generation).
- **Design System:** Unified tokens following `ui-ux-pro-max` and `web-design-guidelines` (clean typography, WCAG 2.1 AA accessible contrast, responsive layouts, accessible forms and dialogs). No unrelated banner/slides skills or ad-hoc utility clutter.
- **No Client-Side Authorization as Sole Gate:**
  - Client-side checks and route guards are UX conveniences only.
  - Every data read, mutation, file upload, and state transition MUST be strictly enforced by Postgres Row-Level Security (RLS) policies or server-side Edge Functions.

---

## 3. Product & Access Control Contract

1. **Country Scope:**
   - Initial supported countries: **Germany, France, Italy, Romania**.
   - **Hungary** is deferred future scope, explicitly disabled in UI and database until reviewed content exists.

2. **Audience & Entitlement Tiers:**
   - **Visitor (Anonymous):** May view a fixed published preview set of at most 50 universities and limited program overviews. No student case access.
   - **Approved Explorer:** Can search and filter the full published catalogue of universities, programs, and scholarships. Cannot access managed student case tools.
   - **Approved Managed Student:** Possesses Explorer privileges plus access strictly to their own assigned case room, uploaded documents, action tasks, and staff communications.
   - **Counsellor (Staff):** Can access and manage ONLY cases explicitly assigned to them via the `case_assignments` table. Cannot access other counsellors' unassigned or private cases.
   - **Administrator:** Manages access requests, case assignments, catalogue publishing, and operational reporting.
   - **Super Administrator:** The only role authorized to provision, promote, or demote staff roles (`counsellor`, `admin`, `super_admin`).

3. **Separate Entitlements & Approval Flow:**
   - Explorer Catalogue Access and Managed Support are separate, independently granted entitlements.
   - Both require administrator approval before activation.

4. **Staff-Operated Operations (Human-in-the-Loop):**
   - Application submissions to universities and embassies are manually operated and tracked by counsellors.
   - **No web scraping agents**, no automated visa portal bot submissions, no automated admissions decisions, and no payment collection/checkout gateway in this release. All tuition payments and fees are documented via wire/SWIFT receipts.

5. **Authentication & Credential Security:**
   - Activation links (magic setup links) are sent via email for initial password setup.
   - Plaintext passwords must never be transmitted via email or logged.
   - **No university portal password vault.** Unilistics does not store or escrow external university login credentials.

---

## 4. Engineering & Code Guidelines

### Supabase & Postgres Best Practices
- Load and follow `.agents/skills/supabase` and `.agents/skills/supabase-postgres-best-practices`.
- Enable RLS on every exposed table (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`).
- Use the modern `TO authenticated` or `TO anon` syntax on policies. Do NOT use the deprecated `auth.role()`.
- Pair `TO authenticated` with row ownership predicates (`(select auth.uid()) = user_id`).
- UPDATE policies must define both `USING` and `WITH CHECK` clauses.
- Views in Postgres 15+ must be created `WITH (security_invoker = true)`.
- Index foreign key columns and frequently filtered columns (e.g., `case_id`, `student_id`, `counsellor_id`, `country`).
- Never add `SECURITY DEFINER` to bypass permission errors. If used in a private schema for an internal helper, include explicit `auth.uid()` validation.

### React & Performance Guidelines
- Follow `.agents/skills/vercel-react-best-practices`.
- Eliminate async waterfalls (`Promise.all` for independent fetches).
- Use direct imports instead of massive barrel files.
- Derive state during render instead of syncing in `useEffect`.
- Keep component state localized; avoid premature global stores.

### Web Interface & Accessibility Guidelines
- Adhere to `.agents/skills/web-design-guidelines`.
- Ensure all interactive elements have keyboard navigation, explicit focus rings, and unique descriptive HTML IDs for testing.
- Form inputs must have explicit `<label>` associations and accessible validation error messages.

### Testing & Verification
- Adhere to `.agents/skills/webapp-testing`.
- Write deterministic unit and integration tests (Vitest + React Testing Library).
- Validate end-to-end user journeys using Playwright via `scripts/with_server.py`.
- Run database RLS test suites before marking any security milestone complete.
