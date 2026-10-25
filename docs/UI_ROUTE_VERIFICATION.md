# UI Route Verification & Accessibility Review Matrix

**Project**: Unilistics Application Tracking System  
**Audit Date**: October 23, 2026  
**Auditor**: Senior Product Designer & Frontend Engineer  
**Compliance Target**: WCAG 2.2 AA & Responsive Cross-Viewport Rigor  

---

## 1. Complete Route Inventory & Verification State Matrix

| Route Path | View / Page Component | Primary Persona | 360px | 390px | 768px | 1024px | 1440px | Tested States (Loaded, Empty, Error, Denied) |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| `/` | `LandingPage` | Visitor / Public | Pass | Pass | Pass | Pass | Pass | **Loaded**: 4 country corridors, search, 50-limit preview banner.<br>**Empty**: Filter reset.<br>**Keyboard**: Search input & cards accessible. |
| `/request-access` | `RequestAccessPage` | Visitor | Pass | Pass | Pass | Pass | Pass | **Loaded**: Two-tier choice (Explorer vs Managed).<br>**Empty**: Form validations active.<br>**Keyboard**: Form fields labelled with focus rings. |
| `/sign-in` | `SignInPage` | All Users | Pass | Pass | Pass | Pass | Pass | **Loaded**: Clean credential login form.<br>**Error**: Incorrect credentials / suspended account alert.<br>**Keyboard**: Submit on Enter. |
| `/forgot-password` | `ForgotPasswordPage` | Visitor / All | Pass | Pass | Pass | Pass | Pass | **Loaded**: Single-input recovery request.<br>**Success**: Confirmation screen rendered. |
| `/set-password` | `SetPasswordPage` | Activating Student | Pass | Pass | Pass | Pass | Pass | **Loaded**: Magic link password initialization with security criteria. |
| `/access-denied` | `AccessDeniedPage` | Unauthenticated / Unauthorized | Pass | Pass | Pass | Pass | Pass | **Loaded**: Plain-language explanation with redirect CTA. |
| `/student/overview` | `StudentOverviewPage` | Managed Student | Pass | Pass | Pass | Pass | Pass | **Loaded**: Editorial greeting, next action, applications, vault.<br>**Empty**: Friendly illustrations (`empty_applications.webp`). |
| `/student/applications` | `MyApplicationsPage` | Managed Student | Pass | Pass | Pass | Pass | Pass | **Loaded**: Milestone vertical journey, deadline callout.<br>**Empty**: `empty_applications.webp` with catalogue link. |
| `/student/documents` | `StudentDocumentsPage` | Managed Student | Pass | Pass | Pass | Pass | Pass | **Loaded**: 2-column bento vault + contextual chat.<br>**Empty**: `empty_vault.webp` with upload CTA.<br>**Upload Modal**: Header binary inspection. |
| `/student/messages` | `StudentMessagesPage` | Managed Student | Pass | Pass | Pass | Pass | Pass | **Loaded**: Chronological message bubbles + attachments.<br>**Empty**: `empty_messages.webp` advisory channel open. |
| `/student/tasks` | `StudentTasksPage` | Managed Student | Pass | Pass | Pass | Pass | Pass | **Loaded**: Interactive checkbox task list with due dates.<br>**Empty**: All tasks completed congratulatory card. |
| `/student/explore` | `StudentExplorePage` | Managed Student | Pass | Pass | Pass | Pass | Pass | **Loaded**: Full European catalogue with bookmarking. |
| `/explorer/catalogue` | `ExplorerCataloguePage` | Approved Explorer | Pass | Pass | Pass | Pass | Pass | **Loaded**: 2-column desktop filter + program cards.<br>**Empty**: Filter reset prompt.<br>**Bottom**: Support upgrade callout. |
| `/explorer/account` | `ExplorerAccountPage` | Approved Explorer | Pass | Pass | Pass | Pass | Pass | **Loaded**: Verified profile initials and entitlement badges. |
| `/explorer/saved` | `SavedProgramsPage` | Approved Explorer | Pass | Pass | Pass | Pass | Pass | **Loaded**: Bookmarked degree programs.<br>**Empty**: Explore catalogue prompt. |
| `/explorer/request-support` | `RequestSupportPage` | Approved Explorer | Pass | Pass | Pass | Pass | Pass | **Loaded**: Managed support upgrade form with priority goals. |
| `/staff/dashboard` | `StaffDashboardPage` | Counsellor / Admin | Pass | Pass | Pass | Pass | Pass | **Loaded**: 4 KPI queue cards, active candidate roster, fast action update terminal. |
| `/staff/cases` | `StaffCasesPage` | Counsellor / Admin | Pass | Pass | Pass | Pass | Pass | **Loaded**: Full case dossier, concurrency lock guard, internal notes. |
| `/staff/review-queue` | `StaffReviewQueuePage` | Staff | Pass | Pass | Pass | Pass | Pass | **Loaded**: Document verification and attestation queue. |
| `/staff/catalogue` | `StaffCataloguePage` | Admin | Pass | Pass | Pass | Pass | Pass | **Loaded**: Batch import/export CSV tools and publication switcher. |
| `/staff/workflows` | `StaffWorkflowsPage` | Admin | Pass | Pass | Pass | Pass | Pass | **Loaded**: Germany, France, Italy, Romania step engine. |
| `/help` | `HelpCentrePage` | All Users | Pass | Pass | Pass | Pass | Pass | **Loaded**: Searchable official guides for 4 countries. |

---

## 2. Responsive Viewport Verification Details

### 1. Compact Mobile (360px & 390px)
- **Navigation**: Floating desktop navigation collapses into a dedicated, thumb-friendly 5-destination bottom navigation bar (`.mobile-bottom-nav`) with minimum 44px tap targets.
- **Header**: Compact brand logo wordmark with quick notification bell. No text overflow or clipped headers.
- **Student Overview**: Greets the user, stacks the priority next action above target applications, and presents the advisor quick note in a mobile-optimized card.
- **Document Vault**: Upload zone stacks gracefully; document cards display compact category tags and prominent action buttons. Contextual chat moves into an accessible tab/drawer section.
- **Applications Journey**: Milestone track renders as an intuitive vertical timeline with clear checkmarks and active stage highlights.

### 2. Tablet (768px)
- **Layouts**: Bento grid adapts to 2-column layouts where suitable (e.g. Catalogue program cards, Staff queue cards in a 2x2 grid).
- **Navigation**: Bottom nav transitions to compact header navigation with readable labels.
- **Forms**: Dual-column form grids collapse into single readable columns with accessible tap targets and keyboard focus rings.

### 3. Desktop & Wide Displays (1024px & 1440px)
- **Max Content Width**: Bounded at `1440px` with responsive gutters to prevent awkward ultra-wide stretching.
- **Two-Column Bento Structures**:
  - `StudentDocumentsPage`: Left 65% document vault with category filter pills; right 35% sticky contextual advisor chat.
  - `ExplorerCataloguePage`: Left 280px filter sidebar with degree level & sort controls; right responsive grid of program bento cards.
  - `StaffDashboardPage`: Top 4 operational queue cards; bottom split between active candidate roster table and right-hand "Update Case Timeline" terminal.

---

## 3. WCAG 2.2 AA Accessibility Audit Results

| Accessibility Criterion | Standard | Implementation & Measured Status | Status |
| :--- | :--- | :--- | :---: |
| **Color Contrast (Normal Text)** | $\ge 4.5:1$ | Charcoal (`#1A1A1A`) and Dark Slate (`#2D3139`) on Warm Ivory (`#FDFBF7`) achieve $\ge 12.8:1$. Accessible Primary Action token (`#B72301`) on white achieves $5.6:1$. | Pass |
| **Color Contrast (Large Text & UI)**| $\ge 3.0:1$ | Category pills, badge borders, and input focus outlines exceed $3.5:1$. | Pass |
| **Tap Target Minimum Size** | $\ge 44 \times 44\text{px}$ | All mobile bottom navigation buttons, icon actions, and form submit controls have minimum 44px hitboxes. | Pass |
| **Keyboard Navigation & Focus** | Visible Focus Ring | All interactive elements (`button`, `a`, `input`, `select`, `textarea`) have distinct `2px solid #B72301` focus rings with `2px` offset. | Pass |
| **Form Labels & Error Association**| Explicit `<label>` | Form controls feature semantic `<label htmlFor="...">` attributes and `aria-describedby` associations for validation error alerts. | Pass |
| **Reduced Motion Preference** | `prefers-reduced-motion` | Global CSS rule in `tokens.css` zeroes transition durations and disables micro-animations when user prefers reduced motion. | Pass |
| **No Color-Alone States** | Icon + Text Badges | Status badges pair color with text and SVG icons (e.g. CheckCircle for approved, AlertTriangle for action required). | Pass |
