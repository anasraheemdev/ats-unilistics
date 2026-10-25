# Unilistics Application Security Review & Threat Model Audit

**Date**: October 23, 2026  
**Standards Baseline**: OWASP Application Security Verification Standard (ASVS) v4.0.3 (Level 2 Baseline) & OWASP Top 10 API Security Risks (2023)  
**Evaluation Scope**: Full-stack application architecture (Supabase Postgres RLS, Database RPCs/Views, Private Storage Policies, React Client, Edge Auth Handlers)  
**Test Frameworks & Tools Used**: Vitest v2.1.9, PGlite (PostgreSQL WASM v16), NPM Audit (Node v20.14.0), Playwright v1.49, Native Regex / Secret Scanners  
**Mandatory Disclaimer**: *Automated negative tests and internal code reviews establish baseline verification against known threat vectors but do NOT prove the absolute absence of vulnerabilities. Prior to production public deployment handling real applicant records, an independent third-party penetration test and statutory data privacy audit must be commissioned.*

---

## 1. System Threat Model & Trust Boundaries

Unilistics serves Pakistani students applying to higher education in Germany, France, Italy, and Romania. The platform handles sensitive student records (academic transcripts, attestation tickets, embassy appointment slips, and wire transfer receipts).

### 1.1 Threat Actors & Identities Evaluated

| Identity Persona | Trust Level | Capabilities & Access Boundary | Threat Vectors Evaluated |
| :--- | :--- | :--- | :--- |
| **Anonymous (Visitor)** | Zero Trust | May view $\le 50$ preview universities; can submit access requests. | Public preview bypass, scraping unpublished drafts, SQLi, SSRF, case room probing. |
| **Pending Applicant** | Zero Trust (Unverified) | Access request under administrative review. | Case room creation bypass, unauthorized document upload, status tampering. |
| **Rejected Applicant** | Untrusted | Access request denied with explanation. | Re-registration flooding, privilege bypass, access to catalogue. |
| **Explorer** | Authenticated (Catalogue) | Full search and filter over published universities, programs, scholarships. | IDOR into student case rooms, task manipulation, unauthorized document access. |
| **Managed Student A** | Authenticated (Tenant A) | Full access strictly to own case room, documents, tasks, and communications. | IDOR/BOLA into Student B records, document linking forgery, case stage tampering. |
| **Managed Student B** | Authenticated (Tenant B) | Full access strictly to own case room. | Cross-student data leakage, message injection into foreign cases. |
| **Counsellor (Assigned)** | Staff (Scoped) | Manage ONLY cases explicitly assigned via `case_assignments`. | Accessing unassigned cases, accessing other counsellors' notes, role escalation. |
| **Counsellor (Unassigned)**| Staff (Unscoped) | Staff credentials without assignment to target student. | Bypassing assignment boundary, unauthorized document review or approval. |
| **Administrator** | Privileged Staff | Access queue management, counsellor assignment, catalogue publishing. | Bypassing MFA, modifying immutable audit records, elevating to super admin. |
| **Suspended User** | Revoked | Account deactivated by administration. | Stale session replay, JWT reuse, private storage download. |

### 1.2 Core Trust Boundaries
```
[Public Internet / Client Browser]
       │
       ▼ (HTTPS / TLS 1.3 - WAF / Reverse Proxy)
[React 18 Single Page Application]
       │
       ├─ (Storage Boundary: STRICT NO-PERSISTENCE POLICY for Passports, CNICs, Financials)
       ▼ (Supabase JWT with explicit Sub, Role & AAL Claims)
[Supabase PostgREST / GoTrue / Private Storage API]
       │
       ▼ (Postgres Row-Level Security: TO authenticated / TO anon + Row Ownership)
[PostgreSQL Database (Views WITH security_invoker = true, Private Schema RPCs, GIN Indexes)]
```

---

## 2. Automated Negative Security Test Results

Automated negative regression tests were executed via [src/test/SecurityNegativeMatrix.test.ts](file:///c:/Users/anasr/OneDrive/Desktop/ats-unilistics/src/test/SecurityNegativeMatrix.test.ts) and [src/test/AuthorizationMatrix.test.ts](file:///c:/Users/anasr/OneDrive/Desktop/ats-unilistics/src/test/AuthorizationMatrix.test.ts) against real Postgres migrations in PGlite:

```
Test Files  2 passed (2)
     Tests  65 passed (65)
```

### Detailed Attack Vector Verification Matrix

| ASVS Category | Threat Vector / Attack Test | Persona Tested | Outcome | Enforcement Mechanism |
| :--- | :--- | :--- | :--- | :--- |
| **V4.1 (BOLA/IDOR)** | Student A attempts direct query for Student B Case ID (`case_id = caseB`) | `student_a` | **BLOCKED** (0 rows returned) | Postgres RLS `student_cases` ownership check `(auth.uid() = student_id)` |
| **V4.1 (BOLA/IDOR)** | Student A attempts direct query for Student B Document (`id = docB`) | `student_a` | **BLOCKED** (0 rows returned) | Postgres RLS `document_metadata` joined on student case |
| **V4.1 (BOLA/IDOR)** | Student A attempts `UPDATE` on Student B Case stage | `student_a` | **BLOCKED** (0 rows affected) | Postgres RLS `student_cases` `USING` clause prevents cross-tenant mutation |
| **V4.1 (BOLA/IDOR)** | Student A attempts forged document link to Student B Application | `student_a` | **BLOCKED** (Exception raised) | Foreign key RLS & private helper verifying application ownership |
| **V4.1 (BOLA/IDOR)** | Student A attempts to post message into Student B Case | `student_a` | **BLOCKED** (Exception raised) | `messages` RLS predicate verifying active case participant |
| **V4.2 (Assignment)**| Assigned counsellor queries assigned Student A Case | `counsellor_assigned` | **ALLOWED** (1 row returned) | RLS `case_assignments` check |
| **V4.2 (Assignment)**| Assigned counsellor queries unassigned Student B Case | `counsellor_assigned` | **BLOCKED** (0 rows returned) | Scoped RLS: Counsellor must be active in `case_assignments` |
| **V4.2 (Assignment)**| Unassigned counsellor attempts document review on Case A | `counsellor_unassigned` | **BLOCKED** (Exception raised) | RPC `submit_document_review` validates `private.can_access_case` |
| **V4.3 (Privilege)** | Counsellor attempts `UPDATE public.staff_roles SET role = 'super_admin'` | `counsellor_assigned` | **BLOCKED** (0 rows affected) | RLS prevents staff role self-mutation; role remains `counsellor` |
| **V4.3 (Privilege)** | Student attempts to mutate entitlements to grant `managed_support` | `student_a` | **BLOCKED** (0 rows affected) | RLS prevents non-admin insert/update on `entitlements` |
| **V4.4 (Suspension)**| Suspended user queries case room with valid JWT | `suspended` | **BLOCKED** (0 rows returned) | RLS joins `profiles.account_status = 'active'` |
| **V4.5 (Secrecy)**   | Student A queries `internal_notes` on their own case | `student_a` | **BLOCKED** (0 rows returned) | `internal_notes` RLS strictly grants access `TO staff` only |
| **V4.6 (Preview)**   | Anonymous queries draft/unpublished university records | `anon` | **BLOCKED** (0 rows returned) | `universities` RLS enforces `publication_status = 'published'` |
| **V4.6 (Preview)**   | Anonymous queries `student_cases` or `document_metadata` | `anon` | **BLOCKED** (Permission denied) | Tables granted `TO authenticated` only; zero `anon` grants |
| **V4.7 (Audit)**     | Attacker attempts `UPDATE` or `DELETE` on `audit_events` | `admin` | **BLOCKED** (Exception raised) | Postgres trigger `prevent_audit_tampering()` enforces immutability |
| **V8.3 (Storage)**   | Student A attempts upload into Student B's vault path | `student_a` | **BLOCKED** (Policy violation) | Storage bucket RLS enforces path prefix matching `auth.uid()` case |
| **V8.3 (Storage)**   | Unassigned counsellor attempts to list objects in unassigned vault | `counsellor_unassigned` | **BLOCKED** (0 rows returned) | Storage bucket RLS enforces active `case_assignments` link |
| **V2.8 (MFA)**       | Staff executes privileged role promotion without AAL2 | `admin_mfa` (aal1) | **BLOCKED** (Exception raised) | `private.enforce_staff_mfa` checks `auth.jwt() ->> 'aal' = 'aal2'` |

---

## 3. OWASP ASVS v4.0.3 Verification Assessment

### V1: Architecture, Design and Threat Modeling
- **Data Minimization (ASVS 1.1.2)**: Student registration collects minimal identity data. Educational credentials, passport scans, and financial documents are only permitted inside the assigned case room.
- **Client-Side Authorization Gate Elimination (ASVS 1.4.1)**: UI guards are UX conveniences only. All security boundaries are enforced by Postgres RLS, database RPCs, and Supabase Storage bucket policies.
- **View Security (ASVS 1.4.3)**: All views (`published_catalogue_universities`, `published_catalogue_programs`, `student_active_case_summary`) are created `WITH (security_invoker = true)` in Postgres 15+, preventing RLS bypass via view queries.

### V2: Authentication & Multi-Factor
- **Activation Tokens (ASVS 2.1.1)**: Magic setup links for account activation are generated server-side with high-entropy cryptographic tokens (32 bytes hex) and 72-hour expiration.
- **Credential Storage (ASVS 2.1.2)**: Plaintext passwords are never logged, emailed, or stored in browser cache.
- **Privileged Staff MFA (ASVS 2.8.1)**: Administrative functions (`admin_review_access_request`, `admin_provision_staff_role`, `admin_revoke_staff_role`, `admin_resend_activation_email`) strictly execute `private.enforce_staff_mfa()` verifying `auth.jwt() ->> 'aal' = 'aal2'`.

### V3: Session Management
- **In-Place Session Recovery (ASVS 3.3.1)**: `ExpiredSessionModal` catches `unilistics:session-expired` events, presenting an accessible re-authentication dialog that preserves unsubmitted form drafts without hard page reloads.
- **Cross-Account Cache Isolation (ASVS 3.5.1)**: `api.auth.signOut()` and `switchRole()` immediately purge all React Query cache keys (`queryClient.clear()`) and clear all draft keys (`api.drafts.clearAll()`).

### V4: Access Control (Authorization)
- **Role-Level Security (ASVS 4.1.1)**: Row Level Security is enabled on 100% of exposed tables (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`).
- **TO authenticated Syntax (ASVS 4.1.2)**: All policies use modern `TO authenticated` or `TO anon` syntax. Deprecated `auth.role()` calls are completely eliminated.
- **UPDATE Policy Dual-Clauses (ASVS 4.1.3)**: Every UPDATE policy specifies both `USING` and `WITH CHECK` clauses.

### V5: Malicious Input Handling & Sanitization
- **Strict Browser Storage Filter (ASVS 5.1.1)**: `api.drafts.save` strictly strips keys matching `passport`, `cnic`, `bank`, `financial`, `solvency`, `balance`, `salary`, `wire`, `swift`, `iban`, `card`, `cvv`, `password`, `token`, and `document_content`. Values matching CNIC/passport regex or base64 data URLs are rejected.
- **Markdown & HTML Sanitization (ASVS 5.2.1)**: `sanitizeMarkdownHtml()` sanitizes Markdown strings by stripping executable tags (`<script>`, `<iframe>`, `<object>`, `<embed>`), inline DOM event handlers (`onload`, `onerror`), and dangerous URI schemes (`javascript:`, `data:`). React text node rendering provides secondary automatic HTML escaping.
- **Link Protocol Validation (ASVS 5.2.2)**: External authority reference links in Help Centre and Editorial workflows are strictly validated via `isSafeExternalUrl()` to allow only `https://` and `http://` protocols.

### V8: Data Protection & Private Storage
- **File Quarantine Pipeline (ASVS 8.3.1)**: Uploaded files are placed in `student-vault` with `quarantine_status = 'quarantined'`. Files remain non-downloadable until the automated malware scanning pipeline verifies the binary signature.
- **Client Binary Header Verification (ASVS 8.3.2)**: `validateClientFileSecurity()` inspects the magic byte signature (e.g. `%PDF-` for PDFs, `\xFF\xD8\xFF` for JPEGs, `\x89PNG` for PNGs). Executables, SVGs, and scripts masquerading as documents are rejected before transmission.
- **Ephemeral Download Tickets (ASVS 8.3.3)**: Document downloads require an ephemeral signed URL issued with a strict 120-second time-to-live (TTL).

---

## 4. Scan Reports & Artifact Verification

### 4.1 Dependency Vulnerability Audit (`npm audit`)
- **Execution Date**: October 23, 2026
- **Tool**: NPM CLI v10.7.0 / Vitest v2.1.9
- **Findings**:
  - `tinypool` ($\le$ 2.1.1) & `@vitest/mocker` ($\le$ 4.1.11): Prototype pollution in development worker test harness. **Triage**: Development and build-time only (`devDependencies`). Not bundled into production client artifact.
  - `esbuild` ($\le$ 0.24.2): Dev server request handling vulnerability. **Triage**: Development dev server only; production bundle is statically compiled.
  - `react-router` (6.0.0 - 7.17.0): Open redirect bypass via backslash in `<Link>` / `useNavigate` (CVE-2025-68470). **Remediated**: Implemented `sanitizeRedirectPath()` in [src/pages/public/SignInPage.tsx](file:///c:/Users/anasr/OneDrive/Desktop/ats-unilistics/src/pages/public/SignInPage.tsx) which strictly prohibits backslashes (`\`), protocol-relative URLs (`//`), and external schemes.

### 4.2 Secret & Credential Scanning
- **Scope**: Entire repository, `.env*` files, Git tracking configuration, and production `dist/` directory.
- **Findings**:
  - `.env` file contains synthetic development keys. **Verification**: `.env` is confirmed excluded from Git via `.gitignore` (`git status -s .env` returns empty).
  - Production Bundle Inspection: Scanned all 36 compiled files in `dist/assets/`. Zero instances of `service_role`, `SUPABASE_SERVICE_ROLE_KEY`, private encryption keys, or plaintext database passwords exist in the production bundle.
  - Client Environment Scope: Only public client parameters (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_ENABLE_AI_ASSISTANT`) are referenced.

---

## 5. Security Findings & Remediation Log

### Finding SEC-01: Open Redirect via Backslash Navigation Bypass (CVE-2025-68470)
- **Severity**: Medium
- **Location**: [src/pages/public/SignInPage.tsx](file:///c:/Users/anasr/OneDrive/Desktop/ats-unilistics/src/pages/public/SignInPage.tsx)
- **Vulnerability**: The authentication redirection handler previously only checked `redirectParam.startsWith('/') && !redirectParam.startsWith('//')`. An attacker could supply `?redirect=/\attacker.com` or `?redirect=/\\attacker.com`, which certain browsers resolve as a protocol-relative external domain.
- **Remediation**: Implemented `sanitizeRedirectPath()` which strictly requires a single leading `/`, explicitly rejects backslashes (`/\\` or `/\`), rejects `://`, and falls back to role default paths.
- **Regression Test**: Verified in automated suite and browser audit.

### Finding SEC-02: Potential XSS via Arbitrary Protocol in Authority Reference Links
- **Severity**: Medium
- **Location**: [src/pages/help/HelpCentrePage.tsx](file:///c:/Users/anasr/OneDrive/Desktop/ats-unilistics/src/pages/help/HelpCentrePage.tsx) & [src/pages/staff/StaffHelpEditorialPage.tsx](file:///c:/Users/anasr/OneDrive/Desktop/ats-unilistics/src/pages/staff/StaffHelpEditorialPage.tsx)
- **Vulnerability**: The `officialSourceUrl` field was rendered directly inside `<a href={selectedArticle.officialSourceUrl}>`. If an author or compromised account entered `javascript:alert(document.cookie)`, clicking the link would execute arbitrary script.
- **Remediation**:
  1. Added `isSafeExternalUrl()` helper requiring `https:` or `http:` URL schemes.
  2. Guarded anchor rendering in [src/pages/help/HelpCentrePage.tsx](file:///c:/Users/anasr/OneDrive/Desktop/ats-unilistics/src/pages/help/HelpCentrePage.tsx).
  3. Enforced URL scheme validation inside `api.help.upsertArticle()` in [src/lib/api.ts](file:///c:/Users/anasr/OneDrive/Desktop/ats-unilistics/src/lib/api.ts).
- **Regression Test**: Automated test in [src/test/SecurityNegativeMatrix.test.ts](file:///c:/Users/anasr/OneDrive/Desktop/ats-unilistics/src/test/SecurityNegativeMatrix.test.ts) confirms `javascript:`, `data:`, and `vbscript:` are strictly rejected.

### Finding SEC-03: Local Storage PII Leakage Risk During Form Save-and-Resume
- **Severity**: High (Data Privacy Mandate)
- **Location**: [src/lib/api.ts](file:///c:/Users/anasr/OneDrive/Desktop/ats-unilistics/src/lib/api.ts) (`api.drafts.save`)
- **Vulnerability**: Serializing arbitrary form states to `localStorage` could inadvertently persist sensitive student identity tokens (CNIC, passport numbers, bank solvency records, or base64 attachments) in unencrypted browser storage.
- **Remediation**: Updated `api.drafts.save` with strict regex key filtering and string pattern rejections. Added `clearAll()` on logout and role switching.
- **Regression Test**: Verified in [src/test/DraftStorage.test.ts](file:///c:/Users/anasr/OneDrive/Desktop/ats-unilistics/src/test/DraftStorage.test.ts).

---

## 6. Residual Risk Register & Operational Ownership

| Risk ID | Residual Risk Description | Impact | Likelihood | Compensating Control | Operational Owner |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **RISK-01** | Dev-dependency prototype pollution in Vitest / Tinypool | Low | Low | Tooling is dev-only; not packaged in production artifact. Update Vitest when v5 LTS stabilizes. | DevSecOps Lead |
| **RISK-02** | Stale static guide files in repository source drafts | Low | Medium | Static guide files in `complete_application_procedures/` are strictly excluded from client search; only reviewed database articles are exposed. | Editorial Lead |
| **RISK-03** | Rate limiting bypass on public access request submission | Medium | Low | Rate limits and CAPTCHA must be configured at the Cloudflare / WAF edge in production deployment. | Infrastructure Lead |
| **RISK-04** | Malware scanner worker offline in production storage | Medium | Low | Files remain in `quarantined` state by default; downloads are blocked if scan status is not `clean`. | Backend Platform Lead |

---

## 7. Sign-Off & Verification Evidence

- **All Critical & High Findings**: **RESOLVED** prior to release.
- **Vitest Security & RLS Test Suites**: **15 test files, 242 tests passing**.
- **Production Build**: **Clean (0 errors, 0 bundle warnings, 251.5 kB entry bundle)**.
- **Next Required Step**: Commission external penetration test against the live staging cluster prior to onboarding real student cohorts.
