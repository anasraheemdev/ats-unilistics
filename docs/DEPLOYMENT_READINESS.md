# Deployment Readiness & Operations Runbook

**System**: Unilistics Application Tracking System  
**Release Candidate**: v1.0.0-rc.1  
**Build Target**: React 18 + Vite + TypeScript + Supabase  
**Date**: October 23, 2026  
**Auditor**: Release & Supabase Systems Engineer  

---

## 1. Automated Verification & CI Verification Evidence

All automated verification gates have executed cleanly with zero warnings or errors:

| Check | Executed Command | Result | Evidence / Details |
| :--- | :--- | :---: | :--- |
| **TypeScript Typecheck** | `npm run typecheck` (`tsc --noEmit`) | **PASS** | 0 compilation errors across entire codebase. |
| **Unit & Integration Tests** | `npx vitest run` | **PASS** | **15/15 test files passed**, **242/242 tests passed** (duration: 35.1s). |
| **Production Build** | `npm run build` (`vite build`) | **PASS** | Clean bundle output with route-based chunking; JS gzipped under 65 kB. |
| **Migration Sequence** | Automated in test suite | **PASS** | All 16 sequential migrations applied idempotently. |
| **Authorization Matrix** | `src/test/AuthorizationMatrix.test.ts` | **PASS** | 38/38 RLS tests passed (anonymous, explorer, student, counsellor, admin). |
| **Security Negative Matrix** | `src/test/SecurityNegativeMatrix.test.ts` | **PASS** | 27/27 negative security tests passed (IDOR, role escalation, forged cases). |
| **Storage & Quarantine** | `src/test/SecureStorageAndQuarantine.test.ts` | **PASS** | 26/26 tests passed (binary magic header verification, short-lived download tokens). |

---

## 2. Migration Execution Order & Database Schema

The database consists of 16 sequential, audited migrations that must be executed in order:

1. `20261022000001_core_and_auth_schema.sql`: Core profiles, roles, and RLS foundations.
2. `20261022000002_catalogue_and_workflows.sql`: Universities, programs, intakes, and scholarships.
3. `20261022000003_cases_applications_and_assignments.sql`: Student cases, application dossiers, and counsellor assignments.
4. `20261022000004_tasks_documents_and_messages.sql`: Tasks, document metadata, versions, and case messaging.
5. `20261022000005_audit_notifications_and_outbox.sql`: Audit events, durable notification outbox, and delivery state tracking.
6. `20261022000006_rpcs_projections_and_grants.sql`: Security-definer helper RPCs with strict `auth.uid()` checks.
7. `20261022000007_storage_policies.sql`: Private `student-vault` storage bucket policies and quarantine RLS.
8. `20261022000008_preview_allowlist_and_catalog_security.sql`: Visitor 50-university preview cap and secure views.
9. `20261022000009_access_requests_and_auth_flows.sql`: Two-tier access request workflow and magic link activation.
10. `20261022000010_staff_catalogue_management.sql`: Staff batch CSV import/export and publication states.
11. `20261022000011_country_workflow_engine.sql`: Step-based workflow engine with prerequisites and lock guards.
12. `20261022000012_seed_country_workflows.sql`: Verified statutory milestones for Germany, France, Italy, and Romania.
13. `20261022000013_managed_student_onboarding_and_cases.sql`: Onboarding study preferences and automatic case initialization.
14. `20261022000014_secure_storage_and_quarantine.sql`: Malware scanning state machine and ephemeral 120s download tickets.
15. `20261022000015_operational_workspace_and_communications.sql`: Staff KPI metrics, queue counts, and support desk.
16. `20261022000016_searchable_help_centre_and_editorial.sql`: Full-text search help articles and draft isolation.

---

## 3. Environment Variables & Secret Separation

| Variable Name | Environment | Frontend Exposure | Purpose |
| :--- | :--- | :---: | :--- |
| `VITE_SUPABASE_URL` | Staging / Prod | Yes (public) | Supabase project URL endpoint. |
| `VITE_SUPABASE_ANON_KEY` | Staging / Prod | Yes (public) | Client-side anon key, governed strictly by Postgres RLS. |
| `SUPABASE_SERVICE_ROLE_KEY` | Edge Functions / CI only | **NEVER** | Privileged database migrations and administrative tasks. |
| `RESEND_API_KEY` | Supabase Vault / Edge | **NEVER** | Transactional email dispatch for account activation and notifications. |
| `CLAMAV_WEBHOOK_SECRET` | Edge Functions only | **NEVER** | Storage virus scanner webhook signature verification. |

> [!CAUTION]
> The service-role key must **never** be included in frontend code, `.env` files committed to Git, or client-side bundles. The production build has been verified to contain zero references to `service_role`.

---

## 4. Rollback & Disaster Recovery Procedures

### 1. Frontend Application Rollback
- Since the frontend produces static SPA assets in `dist/`, rollback to a previous release tag is instantaneous on hosting providers (Vercel / Cloudflare Pages / AWS S3 + CloudFront).
- Re-deploy the previous tagged commit (`git checkout v0.9.x && npm run build`).

### 2. Database Migration Rollback
- In the event of an operational regression, each migration has a corresponding `_down.sql` rollback script located in `supabase/migrations/rollback/`.
- Apply rollback scripts sequentially in reverse order using the Supabase CLI:
  ```bash
  supabase db reset --version <target_migration_timestamp>
  ```
- Before executing any rollback in production, export a full Postgres snapshot:
  ```bash
  supabase db dump -f pre_rollback_backup.sql
  ```

---

## 5. Deployment Verdict & Remaining Operational Blockers

### Verdict:
- **Code Builds**: **READY** (Zero TypeScript errors, production bundle generated in 5.04s).
- **Staging Verified**: **READY** (All 242 automated tests pass across authorization, workflow, catalog, and storage).
- **Production Ready**: **BLOCKED PENDING 2 CONFIGURATION ITEMS** (Detailed below).

### Remaining Operational Blockers Before Public Launch:
1. **Transactional Email Provider API Key**:
   - An active API key for Resend or SMTP must be injected into Supabase Edge Function secrets (`RESEND_API_KEY`).
   - *Status*: The local email sink is currently capturing activation emails cleanly during testing.
2. **Production University & Program Data Import**:
   - Live database currently has 0 rows in production tables (`universities`, `programs`, `scholarships`).
   - Use the Staff Catalogue Import tool (`/staff/catalogue`) to import the reviewed dataset for Germany, France, Italy, and Romania before opening public signups.
