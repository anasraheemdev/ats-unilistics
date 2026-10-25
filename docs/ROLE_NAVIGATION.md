# Unilistics Role-Based Navigation Architecture

## 1. Overview & Core Layout Hierarchy

Unilistics enforces role-separated layouts and navigational hierarchies to guarantee security boundaries and an intuitive user experience for all user tiers.

The application mounts five distinct layout shells:
1. **Public Layout (`PublicLayout.tsx`)**: Dedicated public website experience for anonymous visitors and account access flows (`/`, `/contact`, `/privacy`, `/terms`, `/sign-in`, `/sign-up`, `/forgot-password`, `/set-password`, `/request-access`, `/request-status`, and 404 safe fallback). Features a fixed top `PublicNavbar` and `PublicFooter` with **strictly no sidebar**.
2. **Explorer Layout (`ExplorerLayout.tsx`)**: Dedicated discovery catalog experience for authenticated explorers (`/universities`, `/programs`, `/scholarships`, `/saved`, `/request-support`, `/help`, `/support`, `/explorer/account`). Features `PublicNavbar` with role-aware explorer dropdown, pending guidance banner (if request submitted), and `PublicFooter` with **strictly no sidebar**.
3. **Student Workspace Layout (`StudentLayout.tsx`)**: Dedicated case room for approved managed students. Wrapped in `<ProtectedRoute allowedRoles={['managed_student']}>`. Features a sticky persistent sidebar with student journey navigation groups, topbar with breadcrumb trail, real notification count drawer, and account menu.
4. **Counsellor Casework Layout (`CounsellorLayout.tsx`)**: High-density operational workspace for counsellors. Wrapped in `<ProtectedRoute allowedRoles={['counsellor', 'admin', 'super_admin']}>`. Persistent sidebar with assigned case queue, document verification desk, workflows, and review queues.
5. **Administrator Workspace Layout (`AdminLayout.tsx`)**: Central operational control center. Wrapped in `<ProtectedRoute allowedRoles={['admin', 'super_admin']}>`. Persistent sidebar with approval queues, case assignment engine, catalogue publishing desk, audit logging, and user provisioning.

---

## 2. Navigation Experience Matrix by State

| State | Default Destination | Navigation | Access & Permissions |
| :--- | :--- | :--- | :--- |
| **Signed out (Visitor)** | Public homepage (`/`) | Top Floating nav bar & footer; **no sidebar** | Fixed preview set of up to 50 universities; restricted filter interface with Lock indicators; public Contact desk at `/contact`; self-service sign up available at `/sign-up`. Attempting to access `/student/...` or `/staff/...` displays dedicated "Sign in to continue" gate without mounting private UI. |
| **Signed-in Verified Explorer** | Catalogue (`/universities`) | Top navigation & footer; **no sidebar** | Full published catalogue & filters; saved items (`/saved`); own account settings; requesting `/student/...` displays "Application guidance is required" gate (or pending review banner); prohibited from staff and admin workspaces. |
| **Explorer with Guidance Request Pending** | Catalogue (`/universities`) | Top navigation & footer; **no sidebar** | Retains full explorer catalogue access; requesting student routes shows "Application guidance request is under review" gate with submitted date; prohibited from student case room until approved. |
| **Invited / Approved Managed Student** | Student overview (`/student`) | Persistent student sidebar and dashboard header | Dedicated case room, action tasks, document locker, staff messages; access strictly limited to own assigned case records; prohibited from staff and admin routes. |
| **Authorised Staff (Counsellor / Admin)** | Role dashboard (`/staff` or `/admin`) | Persistent staff sidebar and header | Casework queue (restricted to assigned cases via RLS), review queue, support desk, catalogue publishing desk, access request reviews, workflows, or operational reports according to role. |

---

## 3. Detailed Navigation Configuration by Role

### A. Signed-Out Visitor (`PublicLayout`)
- **Default Landing**: `/` (Dedicated public homepage)
- **Top Navigation Items (Strictly Canonical 5-Item Public Navbar)**:
  1. `Logo & Home` (`/`)
  2. `Explore Universities` (`/universities`)
  3. `Contact` (`/contact`)
  4. `Sign in` (`/sign-in`)
  5. `Sign up` (`/sign-up` - visually prominent CTA)
- **Prohibited Public Controls**:
  - No Student Portal, Staff Workspace, My Applications, Documents, Tasks & Deadlines, or Messages links.
  - No private notification count badges.
  - No dashboard search bar.
  - No public role switcher or demo session dropdown.
  - No sidebar menu.
- **Catalogue Experience**:
  - Up to 50 preview universities returned via server-side allowlist.
  - Locked filter buttons (`FilterLockedDialog` triggered on interaction).
  - Blurred card silhouettes with *"Explore more universities"* CTA panel.

### B. Signed-In Verified Explorer (`ExplorerLayout`)
- **Default Landing**: `/universities`
- **Top Navigation Items**:
  - `Logo & Home` (`/`)
  - `Explore Universities` (`/universities`)
  - `Contact` (`/contact`)
  - `Saved` (`/saved`)
  - `Request Guidance` / Explorer Account menu (`/explorer/account` & Sign Out)
- **Sidebar**: **None**. Full-width responsive container.
- **Access Boundary**:
  - Direct access to student routes (`/student/*`) is blocked by `ProtectedRoute`, presenting the "Application guidance is required" gate with Request Guidance and Continue Exploring actions.
  - If a guidance request is already pending, displays current request status and submission timestamp.

### C. Managed Student (`StudentLayout`)
- **Default Landing**: `/student/overview`
- **Sidebar Groups (Sticky 256px)**:
  - **My Journey**:
    - `Overview` (`/student/overview`) - Current stage, next required action, due date, responsible person, and last updated date.
    - `My Applications` (`/student/applications`) - Multi-application progress tracking, vertical lifecycle timeline, locked stage rationale, and portal details.
    - `Document Locker` (`/student/documents`) - Secure document uploads, quarantine scanning state, and attestation verification statuses.
    - `Action Tasks` (`/student/tasks`) - Actionable tasks assigned to student or counsellor with due dates.
    - `Staff Messages` (`/student/messages`) - Threaded communications with assigned counsellor.
  - **Explore**:
    - `Explore Catalogue` (`/universities`) - Direct access to the degree and university catalog.
    - `Application Guides` (`/help`) - Verified admissions and visa procedure documentation.
  - **Account**:
    - `Account Settings` (`/student/settings`) - Profile, notification preferences, and contact details.

### D. Counsellor / Staff (`CounsellorLayout`)
- **Default Landing**: `/staff/dashboard`
- **Sidebar Groups (Sticky 256px)**:
  - **Casework**:
    - `Overview` (`/staff/dashboard`) - High-priority alerts, urgent deadlines, and case status breakdown.
    - `Assigned Cases` (`/staff/cases`) - Active cases strictly assigned via `case_assignments` RLS.
    - `Review Queue` (`/staff/review-queue`) - Document review, malware verification queue, and guidance request reviews.
    - `Support Desk` (`/staff/support-desk`) - Inbound student support inquiries.
  - **Resources**:
    - `Country Workflows` (`/staff/workflows`) - Official procedures for Germany, France, Italy, and Romania.
    - `Help Editorial` (`/staff/help-editorial`) - Internal staff notes and published procedure articles.
    - `Catalogue Browser` (`/universities`) - Cross-reference published catalogue entries.
  - **Account**:
    - `Staff Settings` (`/staff/settings`) - Profile and session preferences.

### E. Administrator (`AdminLayout`)
- **Default Landing**: `/admin/overview`
- **Sidebar Groups (Sticky 256px)**:
  - **Operations**:
    - `Overview` (`/admin/overview`) - Live operational metrics, pending request queue, unassigned cases, and user account provisioning modal.
    - `Access Requests` (`/staff/review-queue`) - Approval and rejection of Managed Guidance requests (seamlessly upgrades explorer account).
    - `Case Assignments` (`/staff/cases`) - Workload balancing and counsellor reassignments.
    - `Catalogue Desk` (`/staff/catalogue`) - University, program, and scholarship publishing states.
    - `Communications` (`/staff/support-desk`) - Outbox audit and email delivery status.
  - **System**:
    - `Staff Operations` (`/staff/dashboard`) - Direct access to staff casework desk.
    - `Application Guides` (`/help`) - Knowledge base and editorial management.

---

## 4. Sidebar Responsive Mechanics & Accessibility (Managed Roles)

- **Desktop (>= 1024px)**:
  - Sticky sidebar fixed at `256px` (`16rem`).
  - Smoothly collapsible to `72px` (`4.5rem`) icon-only mode with tooltip labels.
  - Toggle collapse button (`[aria-label="Collapse sidebar"]` / `[aria-label="Expand sidebar"]`).
  - Active routes highlighted with `var(--action-primary-subtle)` background and `var(--action-primary)` text and left border indicator.
  - Full keyboard accessibility with tab order and focus rings (`focus-visible: 2px solid var(--action-primary)`).
- **Tablet & Mobile (< 1024px)**:
  - Desktop sidebar hidden via CSS media query (`display: none`).
  - Topbar renders a high-contrast hamburger button (`[aria-label="Open navigation menu"]`).
  - Slide-out mobile drawer (`280px` wide) with semi-transparent backdrop (`rgba(0, 0, 0, 0.45)`).
  - Traps focus while open and listens for `Escape` keypress to close.
  - Automatically closes upon route navigation (`useEffect` listening to `location.pathname`).

---

## 5. Topbar Specifications

- **Height**: Fixed 64px (`4rem`), sticky positioning with `z-index: 30`.
- **Breadcrumbs (Staff & Student)**:
  - Computed dynamically from active URL path segments.
  - Uses semantic `<nav aria-label="Breadcrumb">` with `<ol>` and `<li>` items.
  - Displays readable labels (e.g., `Staff / Cases / Application Detail`).
- **Real Notifications Drawer**:
  - Displays real unread notification count badge (sourced from `api.notifications.getUnreadCount()`).
  - Interactive popover listing in-app alerts and notifications with marked-as-read triggers.
- **Account Menu**:
  - Displays verified user avatar initials or neutral fallback icon.
  - Shows verified full legal name and email address.
  - Provides quick link to account settings and secure sign-out trigger (`api.auth.signOut()`).
