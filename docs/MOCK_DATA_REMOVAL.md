# Mock Data Removal & Production Runtime Audit

This document records the systematic elimination of hardcoded mock data, fictitious student profiles, invented counsellors, and synthetic fallback arrays from the Unilistics application runtime.

---

## 1. Eliminated Mock Sources

In prior iterations, the frontend imported or fell back to synthetic arrays in `@/data/demoData.ts` when database rows were absent. This masked empty database tables and created a misleading appearance of populated business operations.

All such runtime dependencies have been purged:

1. **`DEMO_UNIVERSITIES`**:
   - **Status**: Disconnected from runtime API.
   - **Resolution**: `api.universities.browse` and `api.universities.getPreviewList` query the live Supabase `browse_universities` RPC or return honest empty arrays `[]` when the database table has 0 rows.
2. **`DEMO_PROGRAMS`**:
   - **Status**: Disconnected from runtime API.
   - **Resolution**: `api.programs.browse` and `api.programs.getList` query `browse_programs` RPC or live Postgres table.
3. **`DEMO_SCHOLARSHIPS`**:
   - **Status**: Disconnected from runtime API.
   - **Resolution**: `api.scholarships.browse` and `api.scholarships.getList` query `browse_scholarships` RPC or live Postgres table.
4. **`DEMO_STUDENT_CASE` & `INITIAL_DEMO_CASES`**:
   - **Status**: Synthetic default cases deleted.
   - **Resolution**: `INITIAL_DEMO_CASES` initialized as `[]`. When no case row exists for a student, `api.student.getOverviewCase()` returns `null`, prompting the UI to display an honest empty case state: *"No active case assigned yet. An admissions counsellor will initialize your casework shortly."*
5. **`DEMO_APPLICATIONS` & `DEMO_APPLICATION_HISTORY`**:
   - **Status**: Synthetic application records removed from fallback chains.
   - **Resolution**: Query functions return `[]` when no applications exist in Postgres.
6. **`DEMO_DOCUMENTS` & `DEMO_TASKS` & `DEMO_MESSAGES`**:
   - **Status**: Removed from runtime fallbacks.
   - **Resolution**: Stored fallback arrays initialize to empty `[]`.
7. **Invented Staff & Student Personas ("Elena Rostova", "Sarah Jenkins", "Muhammad Bilal", "Sara Ahmed", "Usman Ghani")**:
   - **Status**: Removed.
   - **Resolution**: Names are dynamically derived from authenticated `UserProfile.fullName` or use neutral labels (e.g., *"Account"*, *"Assigned Counsellor"*, *"Student"*).

---

## 2. Test Fixture Isolation

Test files in `src/test/` continue to utilize synthetic test fixtures generated in memory or seeded into transaction-scoped Postgres tables. This complies with Section 1.2 of `AGENTS.md`:
> *"Use exclusively synthetic development/staging fixtures. Never include real student personally identifiable information (PII) in test fixtures, database seeds, or AI prompts."*

Test fixtures remain isolated in test files and are never bundled into the production runtime bundle (`dist/`).

---

## 3. Honest Empty State Validation

When connected to a fresh database with 0 rows:
- **Universities Discovery (`/universities`)**: Renders `<EmptyState>` with message *"No universities matching filter criteria. Adjust your search or country filter."*
- **Programs Discovery (`/programs`)**: Renders `<EmptyState>` with message *"No degree programs found matching filter criteria."*
- **Scholarships Discovery (`/scholarships`)**: Renders `<EmptyState>` with message *"No scholarships currently available."*
- **Student Overview (`/student/overview`)**: Renders clean placeholder card explaining that a counsellor will initialize the case.
- **My Applications (`/student/applications`)**: Renders `<EmptyState>` with message *"No university applications logged yet."*
- **Document Locker (`/student/documents`)**: Renders `<EmptyState>` with message *"No documents uploaded yet."*
- **Counsellor Cases (`/staff/cases`)**: Renders clean empty table stating *"No cases currently assigned to you."*
- **Admin Overview (`/admin/overview`)**: Displays live counts of `0` pending access requests and `0` unassigned cases, with working **Invite User** modal to initiate onboarding.
