# Runtime Data Source Audit & Mock Elimination Matrix

**System**: Unilistics Application Tracking System  
**Audit Date**: October 23, 2026  
**Auditor**: Lead Fullstack & Supabase Engineer  
**Objective**: Identify and eliminate all fabricated runtime fallbacks, mock data arrays, and demo user personas in favor of authoritative Supabase tables, views, and RPCs.

---

## 1. Runtime Entity Audit & Authoritative Sources

| Displayed Entity / Metric | Previous Runtime Source | Target Authoritative Source | Access Rule (RLS / Role) | Calculation / Logic | Loading / Empty State | Verification Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **User Profile & Active Role** | Hardcoded `DEMO_USERS` in `api.auth.getCurrentUser()` | `public.profiles` joined with `auth.users` | Authenticated user (`auth.uid() = id`) | Real name, role, email from profile record | Skeleton avatar; redirects to `/sign-in` if unauthenticated | Verified Real DB |
| **Public University Preview** | In-memory `DEMO_UNIVERSITIES` fallback | View `public.published_catalogue_universities` | Anonymous or Authenticated | `WHERE is_published = true AND is_preview = true LIMIT 50` | Empty state: "No preview universities currently published" | Verified Real DB |
| **Full Catalogue (Explorer)** | In-memory `DEMO_UNIVERSITIES` fallback | View `public.published_catalogue_universities` | Approved Explorer or Managed Student | `WHERE is_published = true` with country/degree filters | Empty state: "No published universities match your criteria" | Verified Real DB |
| **Programs & Intakes** | In-memory `DEMO_PROGRAMS` fallback | View `public.published_catalogue_programs` | Approved Explorer or Managed Student | Real programs joined with `intakes` | Empty state: "No programs listed for this institution yet" | Verified Real DB |
| **Scholarships** | In-memory `DEMO_SCHOLARSHIPS` fallback | View `public.published_catalogue_scholarships` | Approved Explorer or Managed Student | Real scholarships with deadline & eligibility filters | Empty state: "No scholarships currently match filters" | Verified Real DB |
| **Saved Programs (Bookmarks)** | `localStorage` `unilistics_saved_bookmarks` | Table `public.bookmarks` | Authenticated Explorer / Student | `user_id = auth.uid()` | Empty state: "No programs saved yet. Explore the catalogue to bookmark programs." | Verified Real DB |
| **Student Case Room** | Hardcoded `DEMO_STUDENT_CASE` | Table `public.student_cases` | Student (`student_id = auth.uid()`) or assigned counsellor | 1:1 case per managed student; assigned counsellor UUID | Empty state: "No active student case found. Contact admissions to initiate support." | Verified Real DB |
| **Active Applications List** | Hardcoded `DEMO_APPLICATIONS` | Table `public.applications` | Case student or assigned counsellor | `case_id = user_case.id` | Empty state: "No active university applications yet." | Verified Real DB |
| **Application Milestones & Stage** | Simulated static stages | Table `public.case_workflow_steps` & `application_history` | Case student or assigned counsellor | Real stages derived from country workflow engine | Render real step status (`completed`, `in_progress`, `pending`) | Verified Real DB |
| **Task Completion Metric** ("3 of 7") | Hardcoded "3 of 7 tasks" in markup | Table `public.tasks` | Case student or assigned counsellor | `completed_count = tasks.filter(t => t.status === 'completed').length` / `total_count = tasks.length` | Display exact calculated integer count | Verified Dynamic Calc |
| **Verified Document Vault** | Hardcoded `DEMO_DOCUMENTS` | Table `public.document_metadata` & Storage `student-vault` | Student owner or assigned counsellor | Real document rows with `review_status`, `quarantine_status`, `file_path` | Empty state: "No documents uploaded yet. Upload your first academic certificate." | Verified Real DB |
| **Adviser Messaging Thread** | Hardcoded `DEMO_MESSAGES` (Elena / Sarah) | Table `public.messages` | Case student or assigned counsellor | `case_id = user_case.id ORDER BY created_at ASC` | Empty state: "No messages in this case thread yet. Post an inquiry below." | Verified Real DB |
| **Staff Queue Counts** (38/14/6/52) | Hardcoded numbers in JSX | Tables `access_requests`, `student_cases`, `tasks`, `document_metadata` | Counsellor / Admin role | Count queries matching exact operational queue definitions | Real integer counts from database | Verified Real DB |
| **Staff Candidate Roster** | Hardcoded candidate array | Table `public.student_cases` + `case_assignments` | Counsellor (assigned only) / Admin (all) | Real candidate rows with active stage & country | Empty state: "No active candidate cases in roster" | Verified Real DB |
| **Editorial Help Articles** | Hardcoded mock array | Table `public.help_articles` | Public / All authenticated | `editorial_status = 'published'` with full-text search index | Empty state: "No articles found matching query" | Verified Real DB |

---

## 2. Fabricated Data Disallowed from Production Runtime

The following marketing claims and synthetic artifacts have been completely purged from the application runtime:
- **Sample Students / Testimonials**: Fictional names such as "Elena Rostova", "Maya Patel", "Alex Chen", and stock profile images are removed from default runtime components.
- **Invented Admissions Metrics**: Removed claims of "4,812 programs", "£42M+ scholarships", "98.4% visa approval", and "94% algorithmic match score".
- **Fake Realtime / Presence Indicators**: Removed simulated "Available on live chat" and green online dots when actual presence is unknown.
- **Simulated External Sync**: Removed "UCAS/TUM Webhook Bridge Sync Active" and "Direct API Sync Active" banners.
- **Demo Mode Controls**: Removed developer debug buttons ("List / Loading / Empty" toggles) from user-facing screens.

---

## 3. Database Demo Records Cleanup Strategy

1. **Synthetic Seed Identification**:
   - Records with UUID prefixes matching `usr-demo-*`, `uni-demo-*`, or `cas-demo-*`.
2. **Cleanup Migration Protocol**:
   - In production databases, no synthetic fixtures are seeded.
   - For staging/development databases, test fixtures are kept in `src/test/fixtures/` and are never imported into production application bundles.
3. **Dry-Run Validation**:
   - All migrations in `supabase/migrations/` contain only schema definitions and idempotent seed procedures for verified country workflows (Germany, France, Italy, Romania).
