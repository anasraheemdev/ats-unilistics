# Unilistics ATS Presentation Rebrand Progress Tracker

**Document Version**: 2.0.0  
**Last Updated**: October 25, 2026  
**Active Phase**: Phase 2 — Design Tokens, Typography, Brand Assets & Shared Controls (COMPLETED)  
**Git Checkpoint**: Branch `checkpoint-pre-rebrand` (Commit: `checkpoint: pre-rebrand working baseline (277 tests passing)`)  
**Design Authority**: [docs/REBRAND_SCOPE.md](file:///c:/Users/anasr/OneDrive/Desktop/ats-unilistics/docs/REBRAND_SCOPE.md)  
**Token & Design System Specification**: [docs/DESIGN_SYSTEM_V2.md](file:///c:/Users/anasr/OneDrive/Desktop/ats-unilistics/docs/DESIGN_SYSTEM_V2.md)  

---

## 1. Baseline Verification & Health Check

Prior to initiating and following each phase of frontend changes, the application baseline was validated through comprehensive automated testing and production compilation:

| Verification Stage | Command Executed | Result / Output | Status |
| :--- | :--- | :--- | :---: |
| **TypeScript Typecheck** | `npm run typecheck` | Clean exit with code 0 (`tsc --noEmit`). | **PASS** |
| **Automated Test Suite** | `npm test` (`vitest run`) | **18 test files passed (277 tests passed, 0 failed)** in 24.78s. | **PASS** |
| **Production Build** | `npm run build` | Transformed 1,759 modules; compiled `dist/` in 5.24s with 0 errors. | **PASS** |
| **Live Database Verification** | `DatabaseCatalogueLiveVerification.test.ts` | Verified 512 universities, 4,816 programs, 50 preview allowlist entries, and 11 scholarships directly in Supabase Postgres. | **PASS** |

---

## 2. Brand Asset & Design Token Audit

All brand assets from `theme/v1.0.zip` have been safely extracted into `theme/extracted_v1/`, copied to project directories, and integrated:

| Asset | Source Path | Target Application Destination | Usage in Rebrand | Status |
| :--- | :--- | :--- | :--- | :---: |
| **DM Sans Font** | `theme/extracted_v1/dm-sans-variable.ttf` | `src/assets/fonts/` & `public/fonts/` | Primary product typeface across all surfaces via `@font-face` (wght: 100-1000). | **ACTIVE** |
| **SIL OFL License** | Generated from upstream official repository | `src/assets/fonts/OFL.txt` & `public/fonts/OFL.txt` | Complete official SIL OFL 1.1 license text & provenance records. | **ACTIVE** |
| **Original Icon SVG** | `theme/extracted_v1/original-icon.svg` | `public/images/brand/original-icon.svg` | Light theme logo mark and navigation icon. | **ACTIVE** |
| **Reversed Icon SVG** | `theme/extracted_v1/reversed-icon.svg` | `public/images/brand/reversed-icon.svg` | Dark theme logo mark and Citron highlight brand icon. | **ACTIVE** |
| **Monochrome Light** | `theme/extracted_v1/monochrome-light.svg`| `public/images/brand/monochrome-light.svg` | High-contrast monochrome light applications. | **ACTIVE** |
| **Monochrome Dark** | `theme/extracted_v1/monochrome-dark.svg` | `public/images/brand/monochrome-dark.svg` | High-contrast monochrome dark applications. | **ACTIVE** |
| **Horizontal PNGs** | `theme/extracted_v1/horizontal-*.png` | `public/images/brand/` | Raster horizontal lockup references. | **ACTIVE** |
| **Design System v2** | `docs/DESIGN_SYSTEM_V2.md` | `docs/DESIGN_SYSTEM_V2.md` | Authoritative specification of confirmed vs derived tokens & contrast pairs. | **ACTIVE** |

---

## 3. Route & Component Rebrand Checklist

### 3.1 Design System & Base Styling
- [x] Install local font `@font-face` for `DM Sans Variable` and update `index.html`.
- [x] Replace warm coral tokens in `src/styles/tokens.css` with Forest (`#245b42`), Citron (`#d7ee83`), Sage (`#b4d0b6`), Light canvas (`#f6f8f5`), Light ink (`#19261f`), and Dark mode tokens (`#0d1511`, `#16241b`, `#203327`).
- [x] Update `src/styles/global.css` for typography defaults, card radii (`24px`), control radius (`16px`), and accessible focus rings.
- [x] Remove obsolete Plus Jakarta Sans and coral Tailwind CDN config script from `index.html`.
- [x] Implement pre-paint appearance initializer script in `index.html` (synchronously applies `data-theme` before first paint).
- [x] Implement `ThemeProvider` and `useTheme()` hook in `src/lib/theme.tsx` supporting light, dark, and system modes.
- [x] Rebrand `src/components/ui/BrandWordmark.tsx` to support both light (`original-icon.svg`) and dark (`reversed-icon.svg`) with lowercase `unilistics` in DM Sans Bold (700) ~20px with ~10px gap.

### 3.2 Shared UI Components
- [x] `src/components/ui/Button.tsx` (16px control radius, 48px touch target, Forest primary on light, Citron primary on dark, Citron highlight variant).
- [x] `src/components/ui/Card.tsx` (Radius `24px`, panel padding `24px`, section spacing `32px`, subtle border, quiet shadows).
- [x] `src/components/ui/Badge.tsx` & `StatusBadge.tsx` (Sage, Citron, and Forest semantic variants, pill geometry).
- [x] `src/components/ui/Input.tsx`, `Select.tsx`, `Textarea.tsx` (16px control radius, 48px touch target, accessible borders).
- [x] `src/components/ui/Modal.tsx` (24px radius, green-black backdrop `rgba(13, 21, 17, 0.72)`, 24px panel padding).
- [x] `src/components/ui/Alert.tsx` (16px radius, tokenized status colors).
- [x] `src/components/ui/SkipLink.tsx` (Pill geometry, high-contrast forest focus styling).

### 3.3 Navigation & Layout Containers (Next Step)
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

### Phase 2: Design Tokens, Typography, Brand Assets & Shared Controls (COMPLETED)
- **Status**: Completed  
- **Actions Executed**:
  1. Copied DM Sans variable font into `src/assets/fonts/` and `public/fonts/`. Verified variable font weight axis (`100 1000`) and preserved official SIL OFL 1.1 license and provenance text.
  2. Copied official SVG logo marks (`original-icon.svg`, `reversed-icon.svg`, `monochrome-light.svg`, `monochrome-dark.svg`, and PNGs) to `public/images/brand/`.
  3. Retired legacy warm coral theme from `src/styles/tokens.css` and `src/styles/global.css`. Implemented unified V2 semantic token system for Light and Dark modes.
  4. Purged obsolete Plus Jakarta Sans and coral Tailwind CDN script from `index.html`. Added synchronous pre-paint theme script.
  5. Implemented `ThemeProvider` and `useTheme()` in `src/lib/theme.tsx` supporting light, dark, and system modes.
  6. Rebranded `BrandWordmark.tsx` to use authentic SVG assets, lowercase "unilistics", and dark mode switching.
  7. Rebranded shared UI components: `Button.tsx`, `Card.tsx`, `Badge.tsx`, `StatusBadge.tsx`, `Input.tsx`, `Select.tsx`, `Textarea.tsx`, `Modal.tsx`, `Alert.tsx`.
  8. Created `docs/DESIGN_SYSTEM_V2.md` documenting confirmed vs. derived values, contrast ratios, and replacement mapping.
  9. Verified with `npm run typecheck` (0 errors), `npm test` (18/18 test files passed, 277/277 tests passed), and `npm run build` (compiled `dist/` in 5.24s).
