# Technical Architecture: Unilistics

**Version:** 1.0.0  
**Stack:** React 18+ | Vite | TypeScript | Supabase (Postgres, Auth, Storage, Edge Functions)

---

## 1. High-Level System Architecture

Unilistics is architected as a secure, reactive client application connected to a managed Supabase backend. All business rules, access control, and document authorization are enforced directly in Postgres and Edge Functions.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             CLIENT LAYER (BROWSER)                          │
│                                                                             │
│  React 18/19 + Vite + TypeScript (Single-Page App)                          │
│  ├── Design System: CSS Variables / Tokens (Tailwind / Custom CSS)           │
│  ├── Pages: Visitor Preview, Explorer Catalogue, Managed Case Room, Staff   │
│  ├── Data Layer: Supabase JS Client + Cache/SWR (Eliminates Waterfalls)     │
│  └── Client Guards: Route accessibility & UI feedback (UX layer only)       │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTPS / WSS
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          SUPABASE PLATFORM SERVICES                         │
│                                                                             │
│  ┌───────────────────────┐  ┌──────────────────────┐  ┌──────────────────┐  │
│  │     Supabase Auth     │  │   Edge Functions     │  │ Supabase Storage │  │
│  │                       │  │ (Privileged Server)  │  │ (Private Bucket) │  │
│  │ • Email Magic Links   │  │ • Role Provisioning  │  │                  │  │
│  │ • Password Reset      │  │ • Request Approvals  │  │ • student-vault  │  │
│  │ • App Metadata Claims │  │ • Secure Invitations │  │ • Signed URLs    │  │
│  └───────────┬───────────┘  └──────────┬───────────┘  └────────┬─────────┘  │
│              │                         │                       │            │
│              ▼                         ▼                       ▼            │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                   SUPABASE POSTGRES ENGINE (v15+)                     │  │
│  │                                                                       │  │
│  │  • Relational Schema (Universities, Programs, Cases, Tasks, Documents)│  │
│  │  • Row-Level Security (RLS) on EVERY exposed table                     │  │
│  │  • Foreign Key Indexing & Query Optimization                          │  │
│  │  • Views created WITH (security_invoker = true)                       │  │
│  │  • Immutable Security Audit Log Triggers                              │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Frontend Architecture (React + Vite + TypeScript)

### 2.1 Component & Directory Structure
```
frontend/
├── src/
│   ├── assets/              # Static SVG logos, flag icons, illustrations
│   ├── components/          # Reusable design system UI components
│   │   ├── ui/              # Button, Card, Badge, Modal, Input, Table, Tabs
│   │   ├── layout/          # Navbar, Sidebar, Footer, Breadcrumbs
│   │   ├── catalogue/       # UniversityCard, ProgramFilter, ScholarshipCard
│   │   ├── case/            # StageTimeline, DocumentUploader, TaskList, CaseChat
│   │   └── staff/           # CaseAssignmentModal, DocumentReviewDrawer
│   ├── context/             # AuthContext, ToastContext
│   ├── hooks/               # useAuth, useCase, useDocuments, useTasks, useCatalogue
│   ├── lib/                 # supabaseClient.ts, api.ts, dateUtils.ts, constants.ts
│   ├── pages/               # Route components (lazy-loaded)
│   │   ├── public/          # LandingPage, PreviewCataloguePage, RequestAccessPage
│   │   ├── student/         # ExplorerPage, CaseRoomPage, DocumentVaultPage
│   │   └── staff/           # StaffDashboardPage, CaseDetailPage, ContentManagerPage
│   ├── styles/              # tokens.css, global.css
│   ├── App.tsx              # Application shell & route hierarchy
│   └── main.tsx             # Root bootstrap
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### 2.2 Design System & Styling Architecture
Adheres strictly to `.agents/skills/ui-ux-pro-max` and `.agents/skills/web-design-guidelines`:
- **Color Palette:** Professional slate, dark navy, deep emerald accent, with tailored warning/error states.
- **Typography:** Modern variable sans-serif font pairing (Inter / Plus Jakarta Sans) loaded with zero layout shift.
- **Micro-Interactions:** Subtle transition states on buttons, cards, and modal dialogs.
- **WCAG 2.1 AA Compliance:** Minimum 4.5:1 text contrast ratios, visible `:focus-visible` rings on all interactive elements, and accessible ARIA attributes on modals and tabs.

### 2.3 Performance & Vercel React Best Practices
Adheres strictly to `.agents/skills/vercel-react-best-practices`:
- **Eliminate Waterfalls:** Independent queries (e.g., student profile + active case + unread tasks) are fetched in parallel using `Promise.all()`.
- **Direct Imports:** No massive index barrel files (`export * from ...`) that bloat bundle traces.
- **Derived State:** State is derived during render rather than synced in `useEffect`.
- **Code Splitting:** Route pages are dynamically imported via `React.lazy()` with `Suspense` fallback skeletons.

---

## 3. Database Architecture (Supabase Postgres)

### 3.1 Justification of Backend Choice
An inspection of the workspace confirmed no existing backend exists. Supabase was chosen because:
1. **Zero-Maintenance Relational Infrastructure:** Managed Postgres database with connection pooling and automated backups.
2. **Built-in Row-Level Security (RLS):** True data-layer multi-tenancy preventing Broken Object-Level Authorization (BOLA).
3. **Unified Storage Integration:** S3-compatible private file storage controlled directly by Postgres RLS policies.
4. **Edge Computing:** Deno-based Edge Functions for privileged operations without managing a separate Node.js server.

### 3.2 Relational Entity Schema

```sql
-- Core Types
CREATE TYPE user_role_type AS ENUM (
  'visitor', 
  'explorer', 
  'managed_student', 
  'counsellor', 
  'admin', 
  'super_admin'
);

CREATE TYPE access_request_type AS ENUM ('explorer_catalogue', 'managed_support');
CREATE TYPE request_status_type AS ENUM ('pending', 'approved', 'rejected');

CREATE TYPE country_code_type AS ENUM ('germany', 'france', 'italy', 'romania');
-- Note: 'hungary' is intentionally omitted/disabled for initial release.

CREATE TYPE degree_level_type AS ENUM ('bachelor', 'master', 'doctorate', 'preparatory');
CREATE TYPE case_stage_type AS ENUM (
  'onboarding',
  'attestation',
  'dossier_assembly',
  'submission',
  'decision',
  'visa_prep',
  'relocation',
  'completed',
  'withdrawn'
);

CREATE TYPE case_status_type AS ENUM ('active', 'on_hold', 'archived');
CREATE TYPE doc_verification_status AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE task_status_type AS ENUM ('pending', 'in_progress', 'completed', 'blocked');
CREATE TYPE task_assignee_role AS ENUM ('student', 'counsellor');

-- 1. User Profiles (Extends auth.users)
CREATE TABLE public.user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text,
  city text,
  highest_education text,
  target_country country_code_type,
  target_degree degree_level_type,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- 2. User Roles (Separated from profile to protect privilege escalation)
CREATE TABLE public.user_roles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role_type DEFAULT 'visitor' NOT NULL,
  assigned_by uuid REFERENCES auth.users(id),
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- 3. Access Requests
CREATE TABLE public.access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  request_type access_request_type NOT NULL,
  status request_status_type DEFAULT 'pending' NOT NULL,
  submission_notes text,
  admin_notes text,
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- 4. Universities Directory
CREATE TABLE public.universities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  original_name text,
  country country_code_type NOT NULL,
  city text NOT NULL,
  website_url text,
  institutional_type text, -- Public / UAS / Grande Ecole / Private
  tuition_bracket text,    -- Free / Subsidized / Standard
  is_preview boolean DEFAULT false NOT NULL, -- True for the 50 visitor preview universities
  is_published boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- 5. Academic Programs
CREATE TABLE public.programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id uuid REFERENCES public.universities(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  degree_level degree_level_type NOT NULL,
  instruction_language text NOT NULL, -- English / German / French / Italian / Romanian
  intake_seasons text[] NOT NULL,     -- ['winter'], ['summer', 'winter']
  tuition_per_year_eur numeric(10,2),
  duration_semesters int DEFAULT 4,
  application_deadline_text text,
  admission_requirements_summary text,
  is_preview boolean DEFAULT false NOT NULL,
  is_published boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- 6. Scholarships
CREATE TABLE public.scholarships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  country country_code_type NOT NULL,
  provider text NOT NULL,
  coverage_type text NOT NULL, -- Full Tuition / Stipend / Housing Waiver
  eligibility_summary text NOT NULL,
  application_window_text text,
  official_url text,
  is_published boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- 7. Student Cases (Core Managed Case Room)
CREATE TABLE public.student_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES auth.users(id) ON DELETE RESTRICT NOT NULL,
  target_country country_code_type NOT NULL,
  target_degree degree_level_type NOT NULL,
  target_intake_season text NOT NULL,
  target_intake_year int NOT NULL,
  current_stage case_stage_type DEFAULT 'onboarding' NOT NULL,
  status case_status_type DEFAULT 'active' NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- 8. Case Assignments (Maps Counsellors to Cases)
CREATE TABLE public.case_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES public.student_cases(id) ON DELETE CASCADE NOT NULL,
  counsellor_id uuid REFERENCES auth.users(id) ON DELETE RESTRICT NOT NULL,
  assigned_by uuid REFERENCES auth.users(id) NOT NULL,
  assigned_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(case_id, counsellor_id)
);

-- 9. Case Documents (Metadata for student-vault objects)
CREATE TABLE public.case_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES public.student_cases(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES auth.users(id) ON DELETE RESTRICT NOT NULL,
  document_type text NOT NULL, -- matric_cert, intermediate_cert, bachelors_degree, transcript, frc, bank_statement, etc.
  file_path text NOT NULL,     -- S3 path in student-vault
  file_name text NOT NULL,
  file_size_bytes bigint NOT NULL,
  mime_type text NOT NULL,
  verification_status doc_verification_status DEFAULT 'pending' NOT NULL,
  verification_notes text,
  verified_by uuid REFERENCES auth.users(id),
  verified_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- 10. Case Tasks (Interactive Action Items)
CREATE TABLE public.case_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES public.student_cases(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  assigned_to_role task_assignee_role NOT NULL,
  status task_status_type DEFAULT 'pending' NOT NULL,
  due_date date,
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- 11. Case Messages & Communication (Supports Staff-Internal Notes)
CREATE TABLE public.case_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES public.student_cases(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES auth.users(id) ON DELETE RESTRICT NOT NULL,
  message_body text NOT NULL,
  is_internal_staff_note boolean DEFAULT false NOT NULL, -- If true, completely hidden from students via RLS
  created_at timestamptz DEFAULT now() NOT NULL
);

-- 12. Security Audit Logs
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  details jsonb,
  created_at timestamptz DEFAULT now() NOT NULL
);
```

### 3.3 Postgres Indexes & Performance Tuning
Conforming to `.agents/skills/supabase-postgres-best-practices`:
- Foreign keys are indexed to prevent sequential scans during cascading joins.
- Filter indices on high-cardinality status columns.
```sql
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_access_requests_user_id ON public.access_requests(user_id);
CREATE INDEX idx_access_requests_status ON public.access_requests(status);
CREATE INDEX idx_universities_country ON public.universities(country);
CREATE INDEX idx_universities_preview ON public.universities(is_preview) WHERE is_preview = true;
CREATE INDEX idx_programs_university_id ON public.programs(university_id);
CREATE INDEX idx_programs_degree_level ON public.programs(degree_level);
CREATE INDEX idx_student_cases_student_id ON public.student_cases(student_id);
CREATE INDEX idx_student_cases_country ON public.student_cases(target_country);
CREATE INDEX idx_case_assignments_case_id ON public.case_assignments(case_id);
CREATE INDEX idx_case_assignments_counsellor_id ON public.case_assignments(counsellor_id);
CREATE INDEX idx_case_documents_case_id ON public.case_documents(case_id);
CREATE INDEX idx_case_documents_student_id ON public.case_documents(student_id);
CREATE INDEX idx_case_tasks_case_id ON public.case_tasks(case_id);
CREATE INDEX idx_case_messages_case_id ON public.case_messages(case_id);
```

---

## 4. Storage Architecture (Supabase Private Storage)

- **Bucket Identifier:** `student-vault` (Private, Public Access Denied).
- **Directory Hierarchy:** `cases/{case_id}/{document_id}/{filename}`.
- **Access Flow:**
  1. Student requests a presigned upload URL from the client or Edge Function.
  2. File is uploaded directly to the private S3 bucket.
  3. Metadata record is inserted into `public.case_documents` with RLS verification.
  4. When viewing, the authorized counsellor or student invokes `supabase.storage.from('student-vault').createSignedUrl(file_path, 900)` (15-minute TTL).
  5. Postgres RLS on `storage.objects` validates that the caller owns the case or is an assigned counsellor before returning the signed download URL.

---

## 5. Edge Functions Architecture

Edge Functions execute privileged logic using the Supabase Service Role key while verifying caller authorization tokens.

1. **`provision-staff-role`:**
   - Input: `{ target_user_id: string, new_role: 'counsellor' | 'admin' | 'super_admin' }`
   - Authorization: Strictly requires caller's JWT to possess `super_admin` claim.
   - Action: Mutates `public.user_roles` and updates `auth.users.app_metadata`. Logs to `audit_logs`.
2. **`process-access-request`:**
   - Input: `{ request_id: string, decision: 'approved' | 'rejected', notes?: string, assigned_counsellor_id?: string }`
   - Authorization: Requires `admin` or `super_admin`.
   - Action: Updates `access_requests`. If approved for Managed Support, creates `student_cases` record, assigns `counsellor_id` in `case_assignments`, and triggers activation invite if account is unactivated.
3. **`send-activation-invite`:**
   - Input: `{ email: string, redirect_to: string }`
   - Authorization: Internal server or Admin caller.
   - Action: Calls `supabase.auth.admin.generateLink({ type: 'invite' })` and sends transactional notification. No plaintext passwords exist.

---

## 6. Testing & Quality Assurance Plan

Adheres strictly to `.agents/skills/webapp-testing`:
1. **Unit & Component Testing:** Vitest + React Testing Library for frontend component rendering, form validation, and access state handling.
2. **Database & RLS Policy Verification:** Automated SQL test scripts verifying:
   - Visitors cannot read unpublished or non-preview universities.
   - Explorers cannot read student cases or documents.
   - Managed students cannot read other students' cases or documents.
   - Counsellors cannot read unassigned cases.
   - Students cannot view `is_internal_staff_note = true` messages.
3. **End-to-End Browser Testing:** Playwright test suites run via `scripts/with_server.py` to test complete browser workflows (signup request -> admin approval -> counsellor case assignment -> student document upload -> counsellor verification).
