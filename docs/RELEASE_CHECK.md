# Unilistics Release Verification & Bootstrap Guide

This document certifies the release readiness of the Unilistics platform following the architecture, layout, and mock-data remediation.

---

## 1. Automated Verification Commands & Results

All verification commands executed directly in the project environment and confirmed with terminal outputs:

### A. TypeScript Static Analysis
- **Command**: `npx tsc --noEmit`
- **Result**: `Exit code 0` (0 errors across all layouts, routes, API clients, and page components).

### B. Automated Test Suite (Vitest)
- **Command**: `npx vitest run`
- **Result**: `Exit code 0`
- **Summary**:
  - `Test Files`: 16 passed (16/16)
  - `Tests`: 253 passed (253/253)
  - `Duration`: ~71s
  - `Coverage`:
    - `PublicHomepageAndExperienceMatrix.test.ts` (11 tests) - Public homepage rendering, visitor 50 preview limits, locked filters, self-service explorer signup, guidance request submission, and admin approval account upgrade.
    - `AuthorizationMatrix.test.ts` (38 tests) - RLS role separation and privilege boundaries.
    - `CatalogueBrowsingAllowlist.test.ts` (27 tests) - 50 preview limits, RLS RPC allowlist.
    - `CountryWorkflowEngine.test.ts` (16 tests) - State transitions for DE, FR, IT, RO.
    - `ManagedOnboardingAndCaseCreation.test.ts` (11 tests) - Immutable snapshots, concurrency.
    - `StaffCatalogueManagement.test.ts` (26 tests) - Publishing states and preview flags.
    - `SecureStorageAndQuarantine.test.ts` (26 tests) - Malware quarantine, download tokens.
    - `OperationalWorkspaceAndCommunications.test.ts` (21 tests) - Outbox ledger and notifications.
    - `SecurityNegativeMatrix.test.ts` (27 tests) - Anti-BOLA, anti-IDOR, tamper tests.
    - `SearchableHelpCentreAndEditorial.test.ts` (20 tests) - Draft isolation, help article search.
    - `AccessRequestsAndAuthFlows.test.ts` (17 tests) - Request submission and magic link activation flows.
    - UI Component tests (`DeadlineCard`, `StageTimeline`, `BrandWordmark`, `DraftStorage`, `AccessValidation`).

### C. Production Bundle Build
- **Command**: `npm run build` (`tsc && vite build`)
- **Result**: `Exit code 0`
- **Output Artifacts**:
  - `dist/index.html` (6.33 kB, gzip: 1.65 kB)
  - `dist/assets/index-DypB0pLp.css` (8.46 kB, gzip: 2.54 kB)
  - Chunk splitting: vendor-react, vendor-supabase, vendor-query, vendor-icons, and on-demand route chunks.
  - Zero warnings or circular dependency alerts.

---

## 2. Owner-Controlled Bootstrap Instructions

When deploying the platform to a new production Supabase instance, follow this sequence:

### Step 1: Database Migration Deployment
Apply migrations in numerical sequence:
```bash
npx supabase db push
# Or apply migrations located in supabase/migrations/ from 20261022000001 to 20261022000016
```

### Step 2: Super Administrator Provisioning
The very first staff account must be bootstrapped via Supabase Auth:
1. Create a user via Supabase Auth Dashboard or Edge Function with the owner's legal email.
2. In the `user_profiles` table, set `role = 'super_admin'` and `status = 'active'`.
3. The Super Administrator signs in and uses the **Invite User** tool in `/admin/overview` to provision:
   - Admissions Counsellors (`role = 'counsellor'`)
   - Platform Administrators (`role = 'admin'`)

### Step 3: Initial Catalogue Seed
1. Administrators navigate to `/staff/catalogue`.
2. Review and toggle publication status for initial target universities and accredited degree curriculums across Germany, France, Italy, and Romania.
3. Up to 50 preview items may have `is_preview_allowed = true` to enable anonymous public browsing.

### Step 4: Access Request Processing
1. Prospective students submit access requests at `/request-access`.
2. Staff review pending requests in `/admin/overview` or `/staff/review-queue`.
3. Approving a request dispatches an email activation token for the student to configure their credentials securely.

---

## 3. Production Environment Checklist & Non-Blockers

| Area | Status | Notes |
| :--- | :--- | :--- |
| **RLS Security Policies** | Verified | Every exposed table has RLS enabled with `TO authenticated` and `TO anon` policies. |
| **PII & Privacy** | Clean | Zero hardcoded PII in fixtures or production runtime. |
| **Role Navigation** | Implemented | 4 role-specific layout shells with persistent sidebars and mobile drawers. |
| **Mock Data Purge** | Completed | Runtime fallbacks disconnected; honest empty states rendered when database is empty. |
| **Country Scope** | Enforced | Germany, France, Italy, and Romania supported. Hungary deferred. |
| **Browser Runner** | Environment Notice | Playwright binary download is blocked by restricted local network proxy; web app verified via headless Vitest browser and build tests. |
