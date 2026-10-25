# Unilistics ATS Presentation Rebrand Progress Tracker

**Document Version**: 2.0.0  
**Last Updated**: October 25, 2026  
**Active Phase**: Phase 6 — Desktop Journey Map & Casework Rebrand (COMPLETED)  
**Git Checkpoint**: Branch `master`  
**Design Authority**: [docs/REBRAND_SCOPE.md](file:///c:/Users/anasr/OneDrive/Desktop/ats-unilistics/docs/REBRAND_SCOPE.md)  
**Token & Design System Specification**: [docs/DESIGN_SYSTEM_V2.md](file:///c:/Users/anasr/OneDrive/Desktop/ats-unilistics/docs/DESIGN_SYSTEM_V2.md)  

---

## 1. Baseline Verification & Health Check

Prior to initiating and following each phase of frontend changes, the application baseline was validated through comprehensive automated testing and production compilation:

| Verification Stage | Command Executed | Result / Output | Status |
| :--- | :--- | :--- | :--- |
| **TypeScript Typecheck** | `npm run typecheck` | Clean exit with code 0 (`tsc --noEmit`). | **PASS** |
| **Automated Test Suite** | `npm test` (`vitest run`) | **22 test files passed (329 tests passed, 0 failed)** in 69.59s. | **PASS** |
| **Production Build** | `npm run build` | Transformed 1,767 modules; compiled `dist/` in 18.03s with 0 errors. | **PASS** |
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

- [x] `src/components/layout/PublicNavbar.tsx` (Signed-out nav: Home, Explore Universities, Contact, Sign in, Sign up).
- [x] `src/components/layout/PublicLayout.tsx` & `PublicFooter.tsx`.
- [x] `src/components/layout/ExplorerLayout.tsx` (Top nav only, full catalogue access for verified explorers).
- [x] `src/components/layout/StudentLayout.tsx` (Dark/light mode support, persistent student sidebar).
- [x] `src/components/layout/Sidebar.tsx` (Deep dark sidebar, Citron active pill, semantic Lucide icons, 24px panel radius).
- [x] `src/components/layout/Topbar.tsx` (Search pill `Ctrl K`, notification bell, initial avatar, >=44px touch targets).
- [x] `src/components/layout/CounsellorLayout.tsx` & `AdminLayout.tsx` (Staff workspaces with tokenized canvas and 44px min touch targets).
- [x] `src/components/ui/Checkbox.tsx` (Accessible native hidden input, 20px box, Forest/Citron, Check icon).
- [x] `src/components/ui/SearchInput.tsx` (20px search icon, clear button, Ctrl K shortcut badge, 48px touch target).
- [x] `src/components/ui/Tabs.tsx` (Tabs, TabList, TabTrigger, TabContent with calm green/sage selected state, ARIA tab roles).
- [x] `src/components/ui/Table.tsx` (Table, TableHeader, TableBody, TableRow, TableHead, TableCell with 24px container radius).
- [x] `src/components/ui/Toast.tsx` (ToastProvider, useToast hook, auto-dismissing notifications).
- [x] `src/components/ui/Tooltip.tsx` (Accessible role="tooltip", aria-describedby, green-black surface).
- [x] `src/components/ui/DateInput.tsx` (Leading Calendar icon, 16px radius, 48px touch target).
- [x] `src/components/ui/FileUpload.tsx` (UploadCloud icon, 24px radius, validation, progress bar, accessible removal).
- [x] `src/components/ui/EditorialIllustrations.tsx` (Globe, Document, Search vector illustrations in Forest/Sage/Citron).
- [x] `src/components/common/EmptyState.tsx`, `ErrorState.tsx`, `LoadingState.tsx` (Rebranded with Lucide icons and tokenized styling).
- [x] `src/components/domain/FilterLockedDialog.tsx`, `ContextualHelp.tsx`, `NotificationDrawer.tsx`, `SupportPanel.tsx` (Rebranded to DESIGN_SYSTEM_V2).
- [x] `docs/ASSET_LICENSES.md` (Open source licensing notices for DM Sans, Lucide, and Unilistics assets).

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

### Phase 2: Design Tokens, Typography, Brand Assets & Base Styles (COMPLETED)
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

### Phase 3: Migration of Shared Components & Controls to DESIGN_SYSTEM_V2 (COMPLETED)
- **Status**: Completed  
- **Actions Executed**:
  1. **Standardized Outline Icon Family**: Exclusively utilized `lucide-react` (v0.468.0). Named imports with consistent 20–24px sizing, 1.75–2px strokes, and rounded visual aesthetic. Mapped semantic icons: `House` (Today/Home), `Compass` (Discover), `Bookmark` (Saved), `Map` (Journey), `Settings` (Settings), `FileText` (documents/programs), `GraduationCap` (Universities), `Heart` (Scholarships), `Search`, `SlidersHorizontal`, `Bell`, `ChevronRight`, `ChevronDown`, `ArrowRight`, `ShieldCheck`, `CircleHelp`. All decorative SVGs set with `aria-hidden="true"` and icon-only buttons with descriptive `aria-label`.
  2. **Rebranded Interactive Shared Controls**:
     - `Button.tsx`: 16px control radius, 48px touch target, Forest primary on light mode, Citron primary on dark mode, Citron highlight variant, outline, destructive, ghost.
     - `Input.tsx` & `DateInput.tsx`: 16px control radius, 48px touch target, calendar icon, accessible error alert text.
     - `SearchInput.tsx`: Leading search icon, clear button, keyboard shortcut badge (`Ctrl K`), 48px target.
     - `Select.tsx` & `Textarea.tsx`: 16px control radius, 48px touch target, accessible error alert.
     - `Checkbox.tsx`: Accessible native hidden input, 20px box with 6px radius, Forest / Citron check fill, error message.
     - `Tabs.tsx`: Tabs, TabList, TabTrigger, TabContent with calm green/sage selected state, 44px min height, ARIA tab roles.
     - `Table.tsx`: Semantic table components with 24px container radius and horizontal scroll.
     - `Toast.tsx`: Auto-dismissing toast notifications (`CheckCircle2`, `AlertTriangle`, `AlertCircle`, `Info`) mounted in root app provider.
     - `Tooltip.tsx`: Accessible `role="tooltip"`, `aria-describedby`, green-black surface.
     - `FileUpload.tsx`: Drag & drop zone with `UploadCloud` icon, 24px radius, progress bar, accessible removal.
     - `Card.tsx` & `Modal.tsx`: 24px radius, 24px padding, green-black backdrop `rgba(13, 21, 17, 0.72)`.
     - `Badge.tsx` & `StatusBadge.tsx`: Pill geometry, tokenized semantics.
     - `EmptyState.tsx`, `ErrorState.tsx`, `LoadingState.tsx`: 24px radius, Lucide icons (stroke 2), accessible status roles.
     - `FilterLockedDialog.tsx`, `ContextualHelp.tsx`, `NotificationDrawer.tsx`, `SupportPanel.tsx`: Migrated to DESIGN_SYSTEM_V2 tokens, 24px panel radius, 16px control radius, `SlidersHorizontal`, `CircleHelp`.
  3. **Editorial SVG Illustrations**: Built coordinated vector set in `src/components/ui/EditorialIllustrations.tsx` (`GlobeIllustration`, `DocumentIllustration`, `SearchIllustration`) using Forest (`#245B42`), Sage (`#B4D0B6`), and Citron (`#D7EE83`) palette with transparent margins and tapered ground.
  4. **Open-Source Asset Licensing**: Recorded complete license terms in `docs/ASSET_LICENSES.md` for DM Sans (SIL OFL 1.1), Lucide (ISC), and Unilistics proprietary assets.
  5. **Verification & Testing**:
     - Created `src/test/SharedComponentsV2.test.tsx` containing 17 unit tests verifying all controls.
     - `npm run typecheck`: **0 errors**.
     - `npm test`: **19 test files passed, 294 tests passed, 0 failed**.
     ### Phase 4: Public & Explorer Layouts, Homepage, and Discovery Rebrand (COMPLETED)
- **Status**: Completed  
- **Actions Executed**:
  1. **Public Header & Explorer Layout**:
     - Preserved strict boundary contract: No sidebars for visitors or explorers. Top navigation only for public & explorer.
     - `PublicNavbar.tsx`: Restrained horizontal layout with authentic `BrandWordmark`, 5 canonical links (**Home**, **Explore Universities**, **Contact**, **Sign in**, **Sign up**). Decoupled `aria-hidden` backdrop from `role="dialog"` mobile menu drawer for full screen reader accessibility.
     - `DiscoveryLayout.tsx`: Retained top-nav-only layout with verified explorer account menu (user avatar, display name, Sign out) and navigation tabs (**Universities**, **Programs**, **Scholarships**, **Saved**). Integrated `PublicFooter.tsx` at the bottom of the discovery viewport providing coherent branding, active corridor disclosures (Germany, France, Italy, Romania; Hungary deferred), and legal/help links.
  2. **Rebranded Public Homepage (`HomePage.tsx`)**:
     - Overhauled with calm Forest (`#245B42`), Sage (`#B4D0B6`), and Citron (`#D7EE83`) surfaces and DM Sans typography.
     - Completely eliminated legacy coral gradients (`#FF5E36`, `#FF2A55`), peach orbs (`#FFF0EB`), and bloated hero metrics (e.g. "4,812 active degree intakes refreshed today").
     - Grounded exclusively in the 4 active corridors (Germany, France, Italy, Romania: TUM, Sorbonne, PoliMi, University of Bucharest) with honest human-in-the-loop managed guidance explanations.
     - Fully accessible interactive advisory consultation modal with `Esc` key handling and focus management.
  3. **Rebranded Discovery Experience & 24px University Cards**:
     - `UniversitiesDiscoveryPage.tsx`: Rendered compact contextual goal strip *only* when genuine user profile goals exist. Large clear search input with clear (`X`) button. Dedicated filter toggle button with live applied-filter count badge. Readable result count and sort controls. 24px rounded bordered university cards (`rounded-[24px]`) in deliberate responsive 3-column grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`). Cards feature neutral initials badge, country flag, institution type, two-tone program summary panel with quiet dividers (`#ebe6de`), honest tuition disclosure (never displaying unknown as 0; using "Tuition not published"), ministry verification disclosure, and "View university" CTA. Retained 50-item public preview cap, locked silhouettes, and `FilterLockedDialog` visitor gating.
     - `UniversityDetailPage.tsx`: 24px rounded cards, quiet dividers, two-tone program panel, and DM Sans styling.
     - `ProgramsDiscoveryPage.tsx` & `ProgramDetailPage.tsx`: Large search, separate filter button with count badge, 24px rounded cards, two-tone curriculum panel, and honest tuition display.
     - `ScholarshipsDiscoveryPage.tsx` & `ScholarshipDetailPage.tsx`: Large search, filter button with count badge, 24px rounded cards, two-tone funding summary panel, and visitor gated view.
     - `SavedDiscoveryPage.tsx`: 24px rounded cards, two-tone panel, and honest tuition handling.
  4. **Verification & Testing**:
     - Created `src/test/PublicAndExplorerLayoutRebrand.test.tsx` (8 unit/integration tests covering PublicNavbar, ExplorerLayout, HomePage, and UniversitiesDiscoveryPage).
     - `npm run typecheck`: **0 errors**.
     - `npm test`: **20 test files passed, 302 tests passed, 0 failed**.
     - `npm run build`: **compiled dist/ in 4.14s with 0 errors**.

### Phase 5: Approved Managed-Student Shell, Bottom Dock & Overview Rebrand (COMPLETED)
- **Status**: Completed  
- **Actions Executed**:
  1. **Desktop Slim Sidebar**:
     - Standardized desktop sidebar width to `216px` (within 204–224px reference scale) and `68px` collapsed.
     - Grouped destinations under **Main** (Today, Discover, Saved), **Journey** (Applications, Documents, Tasks & Deadlines, Messages, Scholarships), and **Support & Account** (Help Centre, Settings), ensuring zero feature loss.
     - Selected item styled with vibrant Citron pill background (`#D7EE83`), dark ink text and icon (`#19261F`), 16px radius, and subtle elevation.
     - Added optional supportive card ("Big plans. Small steps.") with academic cap icon and calm sage surface.
     - Obvious account controls with user initials avatar, display name, role label, and accessible Sign out button.
  2. **Mobile Bottom Navigation Dock (`StudentBottomDock.tsx`)**:
     - Implemented 5-destination bottom dock: **Today** (`/student`), **Discover** (`/student/explore`), **Saved** (`/student/saved`), **Journey** (`/student/applications`), and **Settings** (`/student/account`).
     - Added safe-area padding (`env(safe-area-inset-bottom)`) and minimum 48px touch targets.
     - Strictly quarantined to `StudentLayout` (managed students); absent from public/explorer and staff layouts.
     - Eliminated duplicate active navigation chrome at intermediate widths (hidden mobile hamburger for students while retained for staff operations).
  3. **Casework Sub-Navigation (`StudentJourneyNav.tsx`)**:
     - Sticky horizontal tab navigation for casework modules (**Applications**, **Documents**, **Tasks & Deadlines**, **Messages**) with live notification badges, ensuring seamless switching on both mobile and desktop.
  4. **Compact Top Utility Bar (`Topbar.tsx`)**:
     - Standardized to 64px height with fine 1px border.
     - Added operational search button and keyboard shortcut (`Ctrl+K` / `⌘K`) routing directly to student explore.
     - Added operational theme switcher button (`Sun`/`Moon`) toggling between light and dark modes via `useTheme()` with local persistence.
     - Embedded live `NotificationDrawer` and user identity pill with quick sign out.
  5. **Minimalist Student Overview (`StudentOverviewPage.tsx`)**:
     - Built with 24px rounded bento cards (`rounded-[24px]`) and `DESIGN_SYSTEM_V2` palette.
     - Grounded in genuine dynamic data: real priority next action with upload and mark-finished controls, actual tasks and deadlines, real target applications with status pills, and verified document vault files.
     - Honest assigned adviser status: displays real counsellor lead or clean empty state ("Adviser Pending Assignment - Unallocated to Staff").
     - Completely eliminated legacy peach styles, fake "Sultan" name, and fabricated "10 Available credits".
  6. **Verification & Testing**:
     - Created `src/test/StudentWorkspaceAndLayoutRebrand.test.tsx` (12 unit/integration tests).
     - `npm run typecheck`: **0 errors**.
     - `npm test`: **21 test files passed, 314 tests passed, 0 failed**.
     - `npm run build`: **compiled dist/ in 5.89s with 0 errors** (1,763 modules transformed).


### Phase 6: Desktop Journey Map & Casework Rebrand (COMPLETED)
- **Status**: Completed  
- **Authority**: Desktop Journey Reference Screenshot (`theme/WhatsApp Image 2026-10-24 at 1.50.13 AM.jpeg`)
- **Actions Executed**:
  1. **Interactive SVG Desktop Journey Map (`JourneyMap.tsx`)**:
     - Visual macro-regions: Restrained **Prepare**, **Choose**, and **Move** terrain bands with subtle green tint fills (`rgba(36, 91, 66, 0.08)` to `rgba(36, 91, 66, 0.16)`) and low-contrast decorative vector contour lines.
     - Dotted/dashed bezier dependency paths (`stroke-dasharray="4 6"`) showing step progression and parallel branches without visual clutter.
     - Citron checkmark button nodes (`#D7EE83`, dark text `#19261F`) for completed milestones.
     - Concentric animated location ring with floating `"You are here"` badge over the current active step.
     - Failure states preservation: blocked and reopened steps render distinct red/amber warning nodes with `"Review required"` alerts; never collapsed into "complete".
     - Fully accessible keyboard navigation (`tabIndex={0}`, `role="button"`, Enter/Space activation, and explicit focus rings).
     - Compact bottom status legend: Completed, In Progress, Review required, Skipped, Locked.
  2. **Accessible Vertical Ordered List Tracks (`JourneyTracks.tsx`)**:
     - Semantic `<ol>` grouped into Prepare, Choose, and Move macro-phases.
     - Displays status badges, required evidence tags, contextual guidance notes, and direct casework action buttons (`/student/documents`, `/student/tasks`, `/student/messages`).
     - Functions as the automatic mobile default on viewports `< md` (`< 768px`) to ensure small screens never suffer unreadable SVG scaling, while still allowing user toggle.
  3. **Floating Step Detail Bento Panel (`JourneyStepDetailPanel.tsx`)**:
     - 24px rounded dark bento card (`#16241b`, border `#203327`) displaying selected step title, stage, responsible actor, required evidence checklist from `requiredEvidence`, procedural benchmark flags (`FLAG-xxx`), and blocked/reopened alert banners with recorded justification.
     - Direct Citron action button routing to the appropriate casework surface.
  4. **Master Student Journey Workspace (`StudentJourneyPage.tsx`)**:
     - Quiet page header: "Your journey" with real target country and intake subtitle.
     - Location pin banner: "You are here: [Active Step Title]" with direct "Continue" action.
     - Multi-application selector: Allows switching between university applications (e.g. TUM vs PoliMi) with isolated workflow step states, preventing timeline conflation.
     - Top-right view switcher: Seamlessly toggles between `Map` and `Tracks` presentations over the exact same underlying `case_workflow_steps` records.
     - Genuine empty state: Displays honest "No Active Case Journey" screen with prompt to contact staff when no student case is assigned.
  5. **Casework Surfaces Rebrand to DESIGN_SYSTEM_V2**:
     - `MyApplicationsPage.tsx`: Overhauled with 24px cards, Forest/Citron tokens, removed legacy coral `#FFEFEA`, added direct "Interactive Journey Map" header CTA and per-card map links.
     - `ApplicationDetailPage.tsx`: Overhauled with 24px cards, removed `#accent-peach-bg`, linked to Journey Map.
     - `StudentTasksPage.tsx`: Rebranded accountability banner and task dialog with DESIGN_SYSTEM_V2 surfaces.
     - `StudentMessagesPage.tsx`: Rebranded header badge, adviser header, message bubbles, and paperclip icon.
     - `StudentDocumentsPage.tsx`: Rebranded dropzone, verification cards, adviser card, and ephemeral ticket colors.
     - `StudentJourneyNav.tsx`: Added `Journey Map` (`/student/journey`) tab with Map icon alongside Applications, Documents, Tasks, and Messages.
     - `StudentBottomDock.tsx`: Routed `Journey` dock destination directly to `/student/journey`.
     - `navigation.ts`: Added `Journey Map` item to `STUDENT_NAV_GROUPS`.
  6. **Comprehensive Automated Verification & Testing**:
     - Created `src/test/JourneyMapAndCaseworkRebrand.test.tsx` (15 unit/integration test cases covering SVG map rendering, Prepare/Choose/Move regions, "You are here" badge, status mapping integrity, keyboard navigation, tracks list, detail panel, multi-application isolation, view toggle, and empty state).
     - `npx tsc --noEmit`: **0 errors**.
     - `npx vitest run src/test/JourneyMapAndCaseworkRebrand.test.tsx`: **15/15 passed** (100%).
     - Full test suite `npm test`: **22 test files passed, 329 tests passed, 0 failed** (100%).
     - Production build `npm run build`: **compiled dist/ in 18.03s with 0 errors** (1,767 modules transformed).

### Phase 7: Final Rebrand Across Every Remaining Route & Component (COMPLETED)
- **Status**: Completed  
- **Authority**:
  - Search Modal Reference (Screenshot 3: `theme/WhatsApp Image 2026-10-24 at 1.40.23 AM (1).jpeg`)
  - Settings Reference (Screenshot 4: `034088e0-845a-4c51-b89b-a6be286014a9.jpg`)
  - Operational Workspaces Reference (Screenshot 5: `theme/WhatsApp Image 2026-10-24 at 1.40.24 AM (1).jpeg`)
- **Actions Executed**:
  1. **Accessible Search Modal Dialog (`SearchDialog.tsx`)**:
     - Matched light reference: pill search header, close control button, Esc key listener, focus trap.
     - 2-column mobile category tiles where they fit (Everything, Destinations, Universities, Programmes, Scholarships) with Forest green active background and Citron icons.
     - Restrained vector search illustration (curated SVG dossier dossier scene; zero stock photos or unverified raster graphics).
     - Plain quick-action rows leading directly to real, active pages.
     - Real per-user search history (`unilistics_recent_searches_${userId}`) strictly isolated per account with clear action; zero data leakage across accounts.
     - Discloses unsupported query scope (e.g. searching private student casework terms as an anonymous visitor) rather than fabricating global mock data.
     - Integrated seamlessly into `Topbar.tsx` (accessible via search button and `Ctrl+K`/`⌘K` shortcut) and `PublicNavbar.tsx`.
  2. **Airy Settings & Account Rebrand (`ExplorerAccountPage.tsx`)**:
     - Matched light reference: airy grouped rows, subtle section labels (Account, Preferences, Privacy & Legal, Support & Session), fine dividers, simple left icons, right chevrons.
     - Real profile card with uppercase initials avatar, user's full legal name, verified email, residence city, and entitlement tier badge.
     - Working accessible modals for **Personal Information** (viewing academic background and city) and **Login & Security** (password reset dispatch and verified email badge).
     - Working **Appearance** switcher using `useTheme()` with instant toggle between Light and Dark modes.
     - Working **Notifications** channel preferences dialog.
     - Strict compliance: absolutely NO "Credits and plans", test wallets, synthetic credit balances, or fake payment pricing.
  3. **Staff & Admin Operations Rebrand**:
     - `AdminOverviewPage.tsx`: Overhauled metric cards with `DESIGN_SYSTEM_V2` semantic tokens (Citron, Sage, Forest, Amber), eliminated hardcoded peach/coral tokens (`var(--accent-peach-bg)`, `#B78103`, `#FFF9E6`), aligned typography to `var(--color-foreground)` and `var(--color-foreground-muted)`.
     - `StaffDashboardPage.tsx`: Replaced legacy coral badges and accents (`#B72301`, `#FFEFEA`, `#FFF5F2`, `#FF5733`) with Forest/Citron tokens, updated case card selection states, fast action terminal, and file upload dropzones.
     - `StaffSettingsPage.tsx`: Rebranded with 24px bento cards, semantic status badges, and explicit Super Administrator privilege isolation notice.
     - `StaffHelpEditorialPage.tsx`: Modernized tab filter pills with `DESIGN_SYSTEM_V2` tokens, eliminating ad-hoc sky blue.
     - `SupportDeskPage.tsx`: Modernized general inquiry and explorer boundary notice.
  4. **Auth, Legal & Edge Routes Rebrand**:
     - `SignInPage.tsx`: Replaced legacy `#b72301` fallbacks with `var(--action-primary, #245B42)`.
     - `SignUpPage.tsx`: Replaced `#accent-peach-bg` and `#b72301` with Sage badges and Forest action tokens.
     - `TermsPage.tsx`: Overhauled header badges, text contrast, and links with `DESIGN_SYSTEM_V2` tokens.
     - `PrivacyPolicyPage.tsx`: Overhauled with `DESIGN_SYSTEM_V2` surfaces and verified synthetic data mandate.
     - `NotFoundPage.tsx` (404): Redesigned with 24px bento card, compass icon in Sage badge, and clean portal navigation links.
     - `ContactPage.tsx`: Replaced `#accent-peach-bg` and legacy text tokens with `DESIGN_SYSTEM_V2` tokens.
     - `ForgotPasswordPage.tsx` & `SetPasswordPage.tsx`: Verified clean design system compliance.
  5. **Dead Code & Legacy Asset Removal**:
     - Deleted obsolete, unreferenced pages containing legacy coral tokens: `src/pages/public/LandingPage.tsx`, `src/pages/explorer/ExplorerCataloguePage.tsx`, `src/pages/explorer/SavedProgramsPage.tsx`.
     - Removed legacy coral logos from `public/images/unilistics/`: `logo.png` (1.36 MB) and `unilistics-logo.png` (1.03 MB).
     - Verified zero active occurrences of old coral colors (`#FF5E36`, `#FF2A55`, `#FFEFEA`, `#B72301`, `#fff5f2`) across all components in `src`.
  6. **Comprehensive Automated Verification & Testing**:
     - Created `src/test/RemainingRoutesAndSettingsRebrand.test.tsx` (11 unit/integration tests for SearchDialog, ExplorerAccountPage settings, NotFoundPage, StaffSettingsPage, TermsPage, and PrivacyPolicyPage).
     - `npx vitest run src/test/RemainingRoutesAndSettingsRebrand.test.tsx`: **11/11 passed** (100%).
     - Full test suite `npm test`: **23 test files passed, 340 tests passed, 0 failed** (100%).
     - Production build `npm run build`: **compiled dist/ in 8.62s with 0 errors** (1,768 modules transformed).
