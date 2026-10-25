# Unilistics ATS Presentation Rebrand Progress Tracker

**Document Version**: 1.0.0  
**Last Updated**: October 25, 2026  
**Active Phase**: Phase 1 — Discovery, Baseline, Asset Audit & Scope Establishment  
**Git Checkpoint**: Branch `checkpoint-pre-rebrand` (Commit: `checkpoint: pre-rebrand working baseline (277 tests passing)`)  
**Design Authority**: [docs/REBRAND_SCOPE.md](file:///c:/Users/anasr/OneDrive/Desktop/ats-unilistics/docs/REBRAND_SCOPE.md)  

---

## 1. Baseline Verification & Health Check

Prior to initiating any frontend changes, the existing application baseline was validated through comprehensive automated testing and production compilation:

| Verification Stage | Command Executed | Result / Output | Status |
| :--- | :--- | :--- | :---: |
| **TypeScript Typecheck** | `npm run typecheck` | Clean exit with code 0 (`tsc --noEmit`). | **PASS** |
| **Automated Test Suite** | `npm test` (`vitest run`) | **18 test files passed (277 tests passed, 0 failed)** in 35.70s. | **PASS** |
| **Production Build** | `npm run build` | Transformed 1,758 modules; compiled `dist/` in 13.80s with 0 errors. | **PASS** |
| **Live Database Verification** | `DatabaseCatalogueLiveVerification.test.ts` | Verified 512 universities, 4,816 programs, 50 preview allowlist entries, and 11 scholarships directly in Supabase Postgres. | **PASS** |

---

## 2. Brand Asset & Design Token Audit

All brand assets from `theme/v1.0.zip` have been safely extracted into `theme/extracted_v1/` and cataloged without executing arbitrary content:

| Asset | Source Path | Target Application Destination | Usage in Rebrand |
| :--- | :--- | :--- | :--- |
| **DM Sans Font** | `theme/extracted_v1/dm-sans-variable.ttf` | `src/assets/fonts/dm-sans-variable.ttf` | Primary product typeface across all surfaces. |
| **Original Icon SVG** | `theme/extracted_v1/original-icon.svg` | `public/images/brand/original-icon.svg` | Light theme logo mark and navigation icon. |
| **Reversed Icon SVG** | `theme/extracted_v1/reversed-icon.svg` | `public/images/brand/reversed-icon.svg` | Dark theme logo mark and Citron highlight brand icon. |
| **Monochrome Light** | `theme/extracted_v1/monochrome-light.svg`| `public/images/brand/monochrome-light.svg` | High-contrast monochrome applications. |
| **Monochrome Dark** | `theme/extracted_v1/monochrome-dark.svg` | `public/images/brand/monochrome-dark.svg` | Dark monochrome applications. |
| **Brand Guidelines** | `theme/extracted_v1/brand-guidelines.html`| `docs/reference/brand-guidelines.html` | Authoritative reference copy, contrast ratios, and layout rules. |

---

## 3. Route & Component Rebrand Checklist

### 3.1 Design System & Base Styling
- [ ] Install local font `@font-face` for `DM Sans Variable` and update `index.html`.
- [ ] Replace warm coral tokens in `src/styles/tokens.css` with Forest (`#245b42`), Citron (`#d7ee83`), Sage (`#b4d0b6`), Light canvas (`#f6f8f5`), Light ink (`#19261f`), and Dark mode tokens (`#0d1511`, `#16241b`, `#203327`).
- [ ] Update `src/styles/global.css` for typography defaults, card radii (`1.5rem`), button controls (`1rem`), and accessible focus rings.
- [ ] Rebrand `src/components/ui/BrandWordmark.tsx` to support both light (`original-icon.svg`) and dark (`reversed-icon.svg`) with lowercase `unilistics` wordmark.

### 3.2 Shared UI Components
- [ ] `src/components/ui/Button.tsx` (Pill radius `9999px`, Forest primary on light, Citron primary on dark).
- [ ] `src/components/ui/Card.tsx` (Radius `1.5rem`, subtle `1px` border, soft background options).
- [ ] `src/components/ui/Badge.tsx` & `StatusBadge.tsx` (Sage, Citron, and Forest semantic variants).
- [ ] `src/components/ui/Input.tsx`, `Select.tsx`, `Textarea.tsx` (Radius `1rem`, accessible borders).
- [ ] `src/components/ui/Modal.tsx` (Rounded sheet dialogs with top radius `1.5rem`).
- [ ] `src/components/common/LoadingState.tsx` & `ErrorState.tsx` (Composed, quiet surfaces).

### 3.3 Navigation & Layout Containers
- [ ] `src/components/layout/PublicNavbar.tsx` (Signed-out nav: Home, Explore Universities, Contact, Sign in, Sign up).
- [ ] `src/components/layout/PublicLayout.tsx` & `PublicFooter.tsx`.
- [ ] `src/components/layout/ExplorerLayout.tsx` (Top nav only, full catalogue access for verified explorers).
- [ ] `src/components/layout/StudentLayout.tsx` (Dark/light mode support, persistent student sidebar).
- [ ] `src/components/layout/Sidebar.tsx` (Deep dark sidebar, Citron active pill, "Big plans. Small steps." footer card).
- [ ] `src/components/layout/Topbar.tsx` (Search pill `Ctrl K`, notification bell, initial avatar).
- [ ] `src/components/layout/CounsellorLayout.tsx` & `AdminLayout.tsx` (Staff workspaces).

### 3.4 Discovery Experience Pages
- [ ] `src/pages/discovery/UniversitiesDiscoveryPage.tsx` (Bento university card with Citron stat block, search pill with count badge).
- [ ] `src/pages/discovery/UniversityDetailPage.tsx` (Verified institutional profile, program tabs).
- [ ] `src/pages/discovery/ProgramsDiscoveryPage.tsx` (Program cards with language, tuition, deadline tags).
- [ ] `src/pages/discovery/ProgramDetailPage.tsx` (Curriculum profile, admissions requirements).
- [ ] `src/pages/discovery/ScholarshipsDiscoveryPage.tsx` & `ScholarshipDetailPage.tsx` (Gated explorer funding).
- [ ] `src/pages/discovery/SavedDiscoveryPage.tsx` (Student bookmarks).
- [ ] Global Search Sheet / Modal (`WhatsApp Image 2026-10-24 at 1.40.23 AM (1).jpeg`).

### 3.5 Public & Auth Pages
- [ ] `src/pages/public/HomePage.tsx` (Dedicated public homepage with new typography, palette, and assets).
- [ ] `src/pages/public/ContactPage.tsx` (Public contact form).
- [ ] `src/pages/public/SignInPage.tsx` & `SignUpPage.tsx` (Authentication cards with Forest/Citron actions).
- [ ] `src/pages/public/RequestAccessPage.tsx` & `RequestStatusPage.tsx`.
- [ ] `src/pages/explorer/ExplorerAccountPage.tsx` & `RequestSupportPage.tsx`.

### 3.6 Student & Staff Workspaces
- [ ] `src/pages/student/StudentOverviewPage.tsx` (Interactive journey map: Prepare, Choose, Move, "You are here" node).
- [ ] `src/pages/student/MyApplicationsPage.tsx` & `ApplicationDetailPage.tsx`.
- [ ] `src/pages/student/StudentDocumentsPage.tsx` (Document verification desk).
- [ ] `src/pages/student/StudentTasksPage.tsx` (Action tasks & deadlines).
- [ ] `src/pages/student/StudentMessagesPage.tsx` (Staff-student communications).
- [ ] `src/pages/staff/*` & `src/pages/admin/*` (Counsellor & Admin operations).

---

## 4. Phase-by-Phase Execution Log

### Phase 1: Discovery, Baseline & Scoping (COMPLETED)
- **Status**: Completed  
- **Actions Executed**:
  1. Extracted and audited `theme/v1.0.zip` (DM Sans font, 4 SVG marks, brand guidelines).
  2. Analyzed all 5 reference screenshots (`WhatsApp Image...`).
  3. Verified baseline build (`npm run build`) and test suite (`npm test`: 277/277 passed).
  4. Established git checkpoint (branch `checkpoint-pre-rebrand`).
  5. Created `docs/REBRAND_SCOPE.md` and marked superseded legacy design documents.
  6. Created `docs/REBRAND_PROGRESS.md` with full route and component checklist.

### Phase 2: Design Tokens, Typography & Brand Assets (NEXT PHASE)
- **Status**: Scheduled  
- **Planned Actions**:
  1. Copy font and SVG assets into project public/src directories.
  2. Update `src/styles/tokens.css` with the complete Forest/Citron/Sage/Dark token system.
  3. Update `src/styles/global.css` and `index.html` for font family and baseline element styles.
  4. Update `BrandWordmark.tsx` and run regression test `BrandWordmark.test.tsx`.
  5. Verify `npm run typecheck` and `npm test`.
