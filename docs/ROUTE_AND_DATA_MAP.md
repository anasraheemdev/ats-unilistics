# Unilistics Route and Data Map

This document inventories every route in the Unilistics platform, its layout container, role access constraints, primary data source (Postgres table or RPC), and empty vs. loaded states.

---

## 1. Public & Discovery Routes (`PublicLayout` and `ExplorerLayout`)

| Route | Allowed Roles | Layout Container | Navigation Parent | Query / RPC Source | Empty State Behavior | Loaded State Behavior |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/` | All (Visitors & Authenticated) | `PublicLayout` | Root | Static & `api.requests` | Loaded | Modern editorial homepage: Ambient light orbs, intake sync pill, hero with gradient guarantee, verified trust badges, instant program lookup bento, institutional partner ticker, 3 core architecture pillars, live Elena Rostova applicant experience tracker, transparency data standard, bottom CTA banner, advisory modal, and floating sync ticker. Visitors get the top floating navbar with no sidebar; signed-in users get their role sidebar menu. |
| `/sign-up` | Anonymous | `PublicLayout` | Public Header | `api.auth.signUp` | Form inputs ready. | Self-service Explorer registration form: Full Name, Email, Password, Target Country, Privacy consent. Creates explorer session without admin approval. |
| `/sign-in` | Anonymous | `PublicLayout` | Public Header | `api.auth.signIn` | Form inputs ready. | Email/password sign-in with links to sign up and forgot password. Directs explorers to `/universities` and students to `/student/overview`. |
| `/privacy` | All | `PublicLayout` | Public Footer | Static | N/A | Full data privacy and protection disclosures (synthetic fixtures, zero credential escrow, RLS isolation). |
| `/terms` | All | `PublicLayout` | Public Footer | Static | N/A | Platform terms detailing the dual-tier model, draft procedural content notice, and human-in-the-loop operations. |
| `/universities` | `visitor`, `explorer`, `managed_student`, `counsellor`, `admin` | `ExplorerLayout` / `PublicLayout` | Nav Header | `supabase.rpc('browse_universities')` or `api.universities.browse` | Displays honest empty state: *"No universities matching filter criteria. Adjust your search or country filter."* | For visitors: server-capped 50 preview universities, locked filters triggering `FilterLockedDialog`, blurred card silhouettes, and action panel. For explorers: full catalogue, open filters, search, and detail links. |
| `/universities/:id` | All | `ExplorerLayout` / `PublicLayout` | `/universities` | `supabase.from('universities').select('*').eq('id', id)` | Displays *"University not found"* ErrorState. Non-preview records show visitor gate. | Comprehensive institution profile with official city, country, institutional type, ranking notes, and offering list. |
| `/programs` | `visitor`, `explorer`, `managed_student`, `counsellor`, `admin` | `ExplorerLayout` / `PublicLayout` | Nav Header | `supabase.rpc('browse_programs')` or `api.programs.browse` | Displays honest empty state: *"No degree programs found matching filter criteria."* | Responsive program cards with degree level badge, teaching language, annual tuition bracket, and application portal details. |
| `/programs/:id` | All | `ExplorerLayout` / `PublicLayout` | `/programs` | `supabase.from('programs').select('*, universities(*)').eq('id', id)` | Displays *"Degree program not found"* ErrorState. | Full program curriculum details, intake dates, language requirements, and bookmark toggle. |
| `/scholarships` | `visitor`, `explorer`, `managed_student`, `counsellor`, `admin` | `ExplorerLayout` / `PublicLayout` | Nav Header | `supabase.rpc('browse_scholarships')` or `api.scholarships.browse` | For visitors: shows gated access CTA linking to `/sign-up` and `/sign-in`. For approved users with 0 rows: *"No scholarships available."* | Cards with coverage type, stipend amounts, annual deadline, and official scholarship portal link. |
| `/scholarships/:id`| `explorer`, `managed_student`, `counsellor`, `admin` | `ExplorerLayout` | `/scholarships` | `supabase.from('scholarships').select('*').eq('id', id)` | Displays *"Scholarship record not found"* ErrorState. | Full eligibility criteria, coverage breakdown, and verified application guidelines. |
| `/saved` | `explorer`, `managed_student`, `counsellor`, `admin` | `ExplorerLayout` | Nav Header | `api.bookmarks.getBookmarkedPrograms()` | Displays EmptyState: *"No saved programs yet. Bookmark curriculums from the catalogue."* with action button linking to `/programs`. | Grid of bookmarked degree tracks with quick removal toggle and detail link. |
| `/help` | All | `ExplorerLayout` / `PublicLayout` | Nav Header | `supabase.from('help_articles').select('*')` | Displays *"No articles match your search."* | Filterable procedure articles covering Germany (APS/Blocked Account), France (EeF/Campus France), Italy (Universitaly/CIMEA), and Romania (Scrisoare). |
| `/help/:slug` | All | `ExplorerLayout` / `PublicLayout` | `/help` | `supabase.from('help_articles').select('*').eq('slug', slug)` | Displays *"Article not found"* ErrorState. | Verified article content with official statutory citations and last-reviewed date. |
| `/request-access` | Anonymous | `PublicLayout` | Public Header | `supabase.rpc('submit_access_request')` | Clean submission form with education history and target country. | Displays submission confirmation with reference ticket ID. |
| `/request-support`| `explorer` | `ExplorerLayout` | Header CTA | `supabase.from('access_requests').insert(...)` | Managed guidance application form with academic transcript details and study objectives. | Success confirmation: *"Managed support request submitted for counsellor review."* Triggers pending banner in header. |
| `/request-status/:code` | All | `PublicLayout` | Self-contained | `supabase.rpc('check_access_request_status')` | Not found notice if tracking code is invalid. | Real-time status tracker (Pending, Under Review, Approved, or Rejected) with staff notes. |

---

## 2. Managed Student Routes (`StudentLayout`)

| Route | Allowed Roles | Navigation Parent | Query / RPC Source | Empty State Behavior | Loaded State Behavior |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/student/overview` | `managed_student` | Student Sidebar (`My Journey`) | `supabase.from('student_cases').select('*')` via `api.student.getOverviewCase()` | Displays honest empty state: *"No active case assigned yet. An admissions counsellor will initialize your casework shortly."* | Comprehensive case summary answering the 5 core questions: Stage, Next Required Action, Due Date, Responsible Person, and Last Updated Date. |
| `/student/applications` | `managed_student` | Student Sidebar (`My Applications`) | `supabase.from('applications').select('*')` via `api.student.getApplications()` | Displays EmptyState: *"No university applications logged yet. Your counsellor will add university tracks to your dossier."* | Multi-application tracker with individual status badges, deadlines, portal details, and link to detailed lifecycle tracker. |
| `/student/applications/:id` | `managed_student` | `/student/applications` | `api.student.getApplication(id)` | Displays *"Application dossier not found."* ErrorState. | Vertical lifecycle timeline with country-specific branches, locked stage rationale, related tasks, verified documents, and audit trail tabs. |
| `/student/documents` | `managed_student` | Student Sidebar (`Document Locker`) | `supabase.from('case_documents').select('*')` | Displays EmptyState: *"No documents uploaded yet. Upload your degree certificates and transcripts to begin verification."* | Document vault with upload button, quarantine scan badges, verification notes, and replacement upload requests. |
| `/student/tasks` | `managed_student` | Student Sidebar (`Action Tasks`) | `supabase.from('case_tasks').select('*')` | Displays EmptyState: *"No active tasks. You are all caught up!"* | Filterable list (Pending, In Progress, Completed) of actionable steps assigned to the student or counsellor. |
| `/student/messages` | `managed_student` | Student Sidebar (`Staff Messages`) | `supabase.from('case_messages').select('*')` | Displays EmptyState: *"No messages exchanged yet. Send a query to your assigned counsellor."* | Chronological chat thread with counsellor, message composition box, and document linking. |
| `/student/settings` | `managed_student` | Student Sidebar (`Account Settings`) | `api.auth.getCurrentUser()` | Defaults to current session profile. | Profile details, notification toggles, contact phone, and target intake preferences. |

---

## 3. Counsellor / Staff Routes (`CounsellorLayout`)

| Route | Allowed Roles | Navigation Parent | Query / RPC Source | Empty State Behavior | Loaded State Behavior |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/staff/dashboard` | `counsellor`, `admin`, `super_admin` | Staff Sidebar (`Overview`) | Aggregated metrics via `api.staff` | All metric cards show `0` with neutral status. | Stat cards (Assigned Cases, Pending Reviews, Urgent Tasks), quick action buttons, and priority case list. |
| `/staff/cases` | `counsellor`, `admin`, `super_admin` | Staff Sidebar (`Assigned Cases`) | `supabase.from('student_cases').select('*')` enforced by RLS `case_assignments` | Displays EmptyState: *"No cases currently assigned to you."* | High-density case table with student name, stage, country, last active date, and deep-link to tabbed case workspace. |
| `/staff/review-queue` | `counsellor`, `admin`, `super_admin` | Staff Sidebar (`Review Queue`) | `supabase.from('case_documents').select('*').eq('verification_status', 'pending')` | Displays EmptyState: *"All document submissions and requests have been reviewed."* | Verification queue with document preview, malware scan status, approval/rejection triggers, and feedback note input. |
| `/staff/support-desk` | `counsellor`, `admin`, `super_admin` | Staff Sidebar (`Support Desk`) | Inbound inquiries queue via `api.support` | Displays *"No pending inquiries."* | Support ticket inbox with reply box and status resolution controls. |
| `/staff/workflows` | `counsellor`, `admin`, `super_admin` | Staff Sidebar (`Country Workflows`) | `supabase.from('country_workflows').select('*')` | Fallback procedure outline. | Step-by-step procedural blueprints for Germany, France, Italy, and Romania with statutory checkpoints. |
| `/staff/help-editorial`| `counsellor`, `admin`, `super_admin` | Staff Sidebar (`Help Editorial`) | `supabase.from('help_articles').select('*')` | Displays *"No articles drafted."* | Editorial drafting desk for creating, reviewing, and publishing procedural guides with internal staff notes strictly hidden from students. |
| `/staff/settings` | `counsellor`, `admin`, `super_admin` | Staff Sidebar (`Staff Settings`) | `api.auth.getCurrentUser()` | Defaults to current staff profile. | Staff notification preferences and office hours configuration. |

---

## 4. Administrator Routes (`AdminLayout`)

| Route | Allowed Roles | Navigation Parent | Query / RPC Source | Empty State Behavior | Loaded State Behavior |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/admin/overview` | `admin`, `super_admin` | Admin Sidebar (`Overview`) | `api.admin.getOperationalMetrics()` | Metric cards show `0` (0 pending requests, 0 unassigned cases). | Real-time operational dashboard with pending request queue, unassigned cases list, and working **Invite User** modal. |
| `/staff/catalogue` | `admin`, `super_admin` | Admin Sidebar (`Catalogue Desk`) | `supabase.from('universities')`, `programs`, `scholarships` | Shows honest empty tables when DB is fresh. | Tabbed publishing manager (Universities, Programs, Scholarships) with draft/publish toggles and preview allowlist controls. |
