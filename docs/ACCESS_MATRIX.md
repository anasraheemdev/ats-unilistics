# Access Control & Authorization Matrix: Unilistics

**Version:** 2.0.0  
**Enforcement Principle:** Multi-layered defense. Zero reliance on client-side authorization. Every query, mutation, file operation, and privilege escalation is verified at the Postgres database engine (RLS), private security definer helper layer, and serverless edge functions.

---

## 1. Role & Entitlement Architecture

1. **`visitor` (Anonymous / Public):**
   - Unauthenticated guest.
   - May view active countries and published catalogue preview.
   - May submit access requests.
2. **`pending` (Registered User Pending Review):**
   - Profile created with `account_status = 'pending'`, zero entitlements granted.
   - Denied catalogue search and student case tools.
3. **`explorer` (Approved Explorer):**
   - Has active entitlement `explorer_catalogue`.
   - Full published catalogue search, filters, program details, and personal bookmarks.
   - Denied managed student case rooms and staff tools.
4. **`managed_student` (Approved Managed Student):**
   - Has active entitlement `managed_application_case` and linked `student_cases` record.
   - Explorer catalogue privileges + private case room, document vault, tasks, messages, and multiple application submissions.
5. **`counsellor` (Staff Advisor):**
   - Staff role `counsellor`.
   - Access restricted strictly to cases explicitly assigned via `case_assignments`.
   - May review documents, update assigned student tasks, post case messages, and author private internal notes.
   - Denied access to unassigned student cases.
6. **`admin` (Operational Administrator):**
   - Staff role `admin`.
   - Manages all cases, assigns counsellors, approves access requests, publishes catalogue data, and reviews audit events.
7. **`super_admin` (Root Platform Administrator):**
   - Staff role `super_admin`.
   - Exclusive authority to provision, promote, and demote staff roles (`counsellor`, `admin`, `super_admin`).
8. **`suspended` (Suspended Account):**
   - Profile `account_status = 'suspended'`.
   - Denied all authenticated access immediately, regardless of stale JWT claims.

---

## 2. Comprehensive Entity Access Matrix

### Legend
- **C:** Create / Insert
- **R:** Read / Select
- **U:** Update
- **D:** Delete
- **–:** No Access (Denied)
- **(own):** Restricted strictly to records owned by the authenticated user (`user_id = auth.uid()` or `case_id = student_case_id`).
- **(assigned):** Restricted strictly to cases where the counsellor is actively assigned via `case_assignments`.
- **(published):** Restricted strictly to records where `publication_status = 'published'`.

| Table / Entity | Visitor (Anon) | Pending | Approved Explorer | Managed Student | Counsellor (Assigned) | Counsellor (Unassigned) | Administrator | Super Admin |
|---|---|---|---|---|---|---|---|---|
| `countries` | **R** | **R** | **R** | **R** | **R** | **R** | **CRUD** | **CRUD** |
| `universities` | **R** (published) | **R** (published) | **R** (published) | **R** (published) | **CRUD** | **CRUD** | **CRUD** | **CRUD** |
| `programs` | **R** (published) | **R** (published) | **R** (published) | **R** (published) | **CRUD** | **CRUD** | **CRUD** | **CRUD** |
| `intakes` | **R** (published) | **R** (published) | **R** (published) | **R** (published) | **CRUD** | **CRUD** | **CRUD** | **CRUD** |
| `scholarships` | **R** (published) | **R** (published) | **R** (published) | **R** (published) | **CRUD** | **CRUD** | **CRUD** | **CRUD** |
| `bookmarks` | – | – | **CRD** (own) | **CRD** (own) | **CRD** (own) | **CRD** (own) | **CRD** (own) | **CRD** (own) |
| `workflow_templates` / `versions` | – | – | **R** (active) | **R** (active) | **CRUD** | **CRUD** | **CRUD** | **CRUD** |
| `workflow_steps` / `dependencies` | – | – | **R** | **R** | **CRUD** | **CRUD** | **CRUD** | **CRUD** |
| `guide_sources` / `versions` | – | – | **R** (verified) | **R** (verified) | **CRUD** | **CRUD** | **CRUD** | **CRUD** |
| `access_requests` | **C** | **R** (own email) | **R** (own email) | **R** (own email) | **R** | **R** | **RU** (approve/reject) | **CRUD** |
| `profiles` | – | **RU** (own) | **RU** (own) | **RU** (own) | **R** (assigned students) | – | **RU** | **CRUD** |
| `staff_roles` | – | – | – | – | **R** | **R** | **R** | **CRUD** (exclusive) |
| `entitlements` | – | – | **R** (own) | **R** (own) | **R** | **R** | **CRUD** | **CRUD** |
| `student_cases` | – | – | – | **R** (own) | **RU** (assigned) | – | **CRUD** | **CRUD** |
| `case_assignments` | – | – | – | **R** (own case) | **R** (assigned) | – | **CRUD** | **CRUD** |
| `applications` | – | – | – | **CRU** (own, drafting) | **RU** (assigned) | – | **CRUD** | **CRUD** |
| `tasks` | – | – | – | **R**, **U** (own status) | **CRUD** (assigned) | – | **CRUD** | **CRUD** |
| `document_metadata` | – | – | – | **CR** (own case) | **RU** (assigned) | – | **CRUD** | **CRUD** |
| `document_versions` | – | – | – | **CR** (own docs) | **R** (assigned) | – | **CRUD** | **CRUD** |
| `document_links` | – | – | – | **CR** (own case) | **CRUD** (assigned) | – | **CRUD** | **CRUD** |
| `messages` | – | – | – | **CR** (own case) | **CR** (assigned) | – | **CR** | **CRUD** |
| `internal_notes` (Staff Only) | – | – | – | – (blocked by RLS) | **CRU** (assigned) | – | **CRUD** | **CRUD** |
| `notifications` | – | – | **RU** (own) | **RU** (own) | **RU** (own) | **RU** (own) | **RU** (own) | **RU** (own) |
| `outbox` | – | – | – | – | – | – | **R** (service worker) | **CRUD** |
| `audit_events` (Immutable) | – | – | – | – | – | – | **R** | **R** |

---

## 3. Database Projections (Views with `security_invoker = true`)

All projections use Postgres 15+ `WITH (security_invoker = true)` to inherit caller RLS rules:

1. `published_catalogue_universities`:
   - Filters `universities.publication_status = 'published'`.
   - Excludes internal staff provenance and draft universities from anonymous/explorer users.
2. `published_catalogue_programs`:
   - Joins published programs with published universities.
3. `published_catalogue_scholarships`:
   - Published state and regional scholarship awards.
4. `student_case_overview`:
   - Joins student case, student profile, active counsellor assignment, and counsellor contact.
   - Enforces RLS: students see only their case; counsellors see only assigned cases; admins see all cases.

---

## 4. Privileged Database Functions (RPCs)

All functions declare `SECURITY DEFINER`, `SET search_path = ''`, and enforce caller identity via `(SELECT auth.uid())`:

1. `public.request_platform_access`:
   - Accessible to: `anon`, `authenticated`.
   - Validates email format and required fields; inserts `access_requests` in `status = 'pending'`.
2. `public.approve_access_request`:
   - Accessible to: `authenticated` (Admin and Super Admin only).
   - Idempotent: checks status, creates profile, grants entitlements (`explorer_catalogue`, `managed_application_case`), creates `student_cases` with normalized country code (`de`, `fr`, `it`, `ro`), writes immutable audit event, and queues outbox activation notification.
3. `public.assign_case_counsellor`:
   - Accessible to: `authenticated` (Admin and Super Admin only).
   - Validates target is active counsellor; deactivates previous assignment; creates new active assignment; logs audit event.
4. `public.submit_document_review`:
   - Accessible to: `authenticated` (Assigned Counsellor or Admin only).
   - Validates decision (`verified` or `rejected`); updates `document_metadata`; logs audit event.

---

## 5. Storage Security (`student-vault`)

Bucket: `student-vault` (Private, public access disabled).  
Path Convention: `{case_id}/{document_type}/{version}_{filename}`

1. **SELECT:**
   - Student: allowed only if `path_tokens[1] = private.get_student_case_id(auth.uid())::text`.
   - Staff: allowed only if `private.can_access_case(path_tokens[1]::uuid, auth.uid())`.
2. **INSERT:**
   - Student: allowed only for paths prefixed with their own case ID.
   - Staff: allowed only for assigned cases.
3. **UPDATE (Upsert):**
   - Requires SELECT + INSERT + UPDATE. Governed by identical case ownership checks.
4. **DELETE:**
   - Allowed only for staff assigned to the case or administrators.

---

## 6. Serverless Edge Functions

1. **`provision-staff-role`:**
   - Caller requirement: `role = 'super_admin'`.
   - Mutates `public.staff_roles` and updates `auth.users.raw_app_meta_data`.
   - Logs immutable audit record.
2. **`send-activation-invite`:**
   - Dispatches single-use password setup link via transactional email provider.
   - Plaintext passwords never handled or logged.
