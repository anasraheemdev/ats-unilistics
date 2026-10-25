# Architecture Decision Records (ADRs) - Unilistics

This document registers architectural and technical decisions made for the **Unilistics** platform.

---

## ADR-001: Technology Stack Selection

### Context
Unilistics is a staff-managed university application and visa tracking platform designed for Pakistani students. Key requirements include:
- Fast, accessible, and responsive user experience for students on variable mobile/desktop network connections in Pakistan.
- Secure multi-tenant data storage, granular document privacy, and robust role-based access control (RBAC).
- Low operational maintenance overhead for a staff team managing student applications across four initial destination countries.

An inspection of the repository confirmed that no prior backend codebase exists.

### Decision
Adopt a modern, high-velocity, maintainable stack:
- **Frontend:** React 18 / 19 with Vite and TypeScript.
- **Backend & Database:** Supabase Postgres, Supabase Auth, and Supabase Private Storage.
- **Serverless Compute:** Supabase Edge Functions (Deno / TypeScript) for privileged actions.

### Rationale
1. **Preserving / Evaluating Existing Backend:** No legacy backend exists in the repository. Supabase provides a managed, production-grade Postgres database with native Row-Level Security (RLS), eliminating the need for an error-prone custom API gateway.
2. **Data-Centric Security:** Supabase Postgres enforces security directly at the database engine level via RLS, guaranteeing that access rules cannot be bypassed by client-side bugs or faulty API wrappers.
3. **Private Document Handling:** Supabase Storage natively integrates with Postgres RLS for private buckets, enabling secure generation of time-limited signed URLs for sensitive documents (e.g., passports, bank statements, degree certificates).
4. **Staff Workflow Ergonomics:** React + Vite provides lightning-fast HMR and small bundle sizes, conforming to Vercel React best practices.

### Consequences
- Requires strict adherence to Supabase Postgres best practices, particularly writing comprehensive RLS policies and avoiding security anti-patterns.
- Privileged operations (e.g., role provisioning, invitation tokens) must be executed via Edge Functions using `service_role` keys behind strict caller authentication.

---

## ADR-002: Authorization and Security Model

### Context
Unilistics manages sensitive student academic, identity, and financial records. Different classes of users (visitors, explorers, managed students, counsellors, administrators, super administrators) have strictly demarcated boundaries.

### Decision
1. **Database-Enforced Authorization:** No client-side authorization check will ever serve as the sole access control. All queries, mutations, file uploads, and status transitions must be authorized by Postgres RLS policies and/or Edge Function server-side checks.
2. **Dedicated Role & Permission Architecture:**
   - Store user roles in a dedicated relational table `user_roles(user_id, role)`.
   - Synchronize validated roles to `app_metadata` in the JWT to allow performant claim inspection without querying tables on every single request.
   - Do NOT use `user_metadata` for authorization decisions, as `user_metadata` can be manipulated by authenticated users.
3. **Super Administrator Exclusivity:** Staff roles (`counsellor`, `admin`, `super_admin`) can only be provisioned or altered by users holding the `super_admin` role via a dedicated, audited Edge Function.

### Rationale
- Eliminates Broken Object-Level Authorization (BOLA / IDOR).
- Protects student privacy across counsellors and non-assigned staff.

---

## ADR-003: Student Access Tier Separation

### Context
Unilistics serves students at different stages of commitment:
- Prospective visitors casually browsing study destinations.
- Engaged students seeking deep catalogue and scholarship information.
- Fully committed clients receiving 1-on-1 staff advisory services.

### Decision
Maintain a hard separation between access tiers:
1. **Visitor (Anonymous):** Fixed preview set of up to 50 curated universities and basic program outlines.
2. **Approved Explorer:** Full published catalogue of universities, degree programs, and scholarships. Requires admin approval of an Explorer Request.
3. **Approved Managed Student:** Complete Explorer privileges plus personal case room, document attestation checklist, application dossier tracking, and direct counsellor communication. Requires admin approval of a Managed Support Request.
4. **Separate Entitlements:** Catalogue Explorer approval does NOT automatically confer Managed Student status, and Managed Student onboarding is handled as an independent entitlement flow.

### Rationale
- Protects commercial staff capacity from spam or unverified requests.
- Preserves the value of the curated university and scholarship database while providing an enticing public preview.

---

## ADR-004: Counsellor Scoping and Case Isolation

### Context
In an educational agency, counsellors manage distinct portfolios. A student's financial declarations, family details, and academic weaknesses must only be visible to their assigned counsellor and agency administrators.

### Decision
- Implement explicit case-level assignment via `case_assignments(case_id, counsellor_id, assigned_by, assigned_at)`.
- RLS policies on `student_cases`, `case_documents`, `case_tasks`, and `case_messages` strictly check:
  - If actor is student: `student_id = auth.uid()`
  - If actor is counsellor: `EXISTS (SELECT 1 FROM case_assignments WHERE case_id = student_cases.id AND counsellor_id = auth.uid())`
  - If actor is admin or super admin: `auth.is_admin() OR auth.is_super_admin()`

### Rationale
- Guarantees strict confidentiality between staff members.
- Prevents cross-counsellor leakage of sensitive client information.

---

## ADR-005: Staff-Operated Manual Submissions (No Automated Scraping / Filing)

### Context
University admission portals (Uni-Assist, Études en France, Universitaly, Romanian university portals) and consular visa booking systems (Embassy waitlists, eViza, VFS/Gerry's) actively deploy anti-bot protections, rate limits, and legal terms prohibiting third-party automated scraping or automated script submissions. Moreover, visa filings carry legal perjury liabilities.

### Decision
- **Human-in-the-Loop Operational Contract:** All external university portal entries, fee wire transfers, and embassy visa submissions are operated manually by designated staff counsellors.
- **No Scraping Agents / Submission Bots:** The initial release strictly excludes automated scraping bots, automated visa submission bots, and automated admission decision algorithms.
- **No Payment Processing Gateway:** Unilistics does not collect tuition or visa fees via credit card/Stripe in this release. All tuition payments and embassy fee settlements are recorded via staff-verified bank wire (SWIFT/IBAN) receipts and payment vouchers.

### Rationale
- Eliminates consular fraud risks and portal account bans.
- Accurately mirrors real-world high-stakes international admissions workflows.

---

## ADR-006: Credential Security & Password Management

### Context
Students often share external credentials carelessly. A platform storing external portal passwords faces severe liability if compromised.

### Decision
1. **Activation Links for User Onboarding:** New users, students, and staff receive cryptographically secure activation / magic links via email to establish their password. Plaintext passwords must never be transmitted via email.
2. **Strictly No University Portal Password Vault:** Unilistics will NOT store, escrow, or record student passwords for university portals (Uni-Assist, Campus France, Universitaly, eViza) or consular accounts. Staff guide students to manage their own portal accounts or perform submissions via authorized screen-share/direct client consultation.

### Rationale
- Compliance with global data protection standards and prevention of catastrophic credential spills.

---

## ADR-007: Private Storage Architecture for Sensitive Student Documents

### Context
Students upload high-resolution scans of passports, National Identity Cards (CNIC/NICOP), Family Registration Certificates (FRC), financial statements, and original academic degrees.

### Decision
- All files are stored in a private Supabase Storage bucket (`student-vault`). Public access is disabled.
- Storage objects follow a strict key convention: `cases/{case_id}/{document_id}/{filename}`.
- Object download and upload access is guarded by Postgres RLS on `storage.objects`.
- The frontend requests short-lived signed URLs (maximum TTL: 15 minutes) for document viewing.

### Rationale
- Completely prevents unauthorized indexing or direct URL guessing of student documents.

---

## ADR-008: Country Scope and Incremental Jurisdictions

### Context
Application procedures vary drastically across European destination countries. Draft guides exist for Germany, France, Italy, and Romania.

### Decision
- Phase 1 & 2 support is strictly constrained to **Germany, France, Italy, and Romania**.
- **Hungary** is deferred to future scope and explicitly disabled in UI filters and schema validators until verified procedural content is established and reviewed.

### Rationale
- Keeps implementation tight and prevents shipping unverified procedural workflows.
