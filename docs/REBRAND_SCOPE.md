# Unilistics ATS Presentation Rebrand Specification (Brand Kit v1.0)

**Document Status**: AUTHORITATIVE ACTIVE DESIGN SPECIFICATION  
**Effective Date**: October 25, 2026  
**Rebrand Authority**: Unilistics Brand Guidelines v1.0 (`theme/extracted_v1/brand-guidelines.html`), Brand Kit Assets (`theme/v1.0.zip`), and Reference Screenshots (`theme/*.jpeg`, `theme/*.jpg`).  
**Supersedes**: `docs/DESIGN_SYSTEM.md` (Warm Editorial Bento / Kinetic Horizon / Coral `#FF5733` direction).  

---

## 1. Executive Summary & Purpose

This specification governs the **presentation migration** of the existing Unilistics Application Tracking System (ATS). It is strictly a frontend styling, typography, component token, and layout presentation rebrand.

### Non-Negotiable Architectural Invariants:
1. **Zero Database Migrations**: The existing Supabase Postgres schema, tables (`universities`, `programs`, `scholarships`, `intakes`, `preview_allowlist`, `student_cases`, `case_applications`, etc.), Row Level Security (RLS) policies, and database functions remain completely unchanged.
2. **Preserve Business Logic & Workflows**: All auth flows, role management, entitlement verifications, magic setup token validation, quarantine storage pipelines, and workflow gates remain authoritative and functional.
3. **No Application Replacement or Mock Backends**: No scaffolding of a new app, mock backend services, or data contract resets.
4. **Authoritative Access Control**:
   - **Public & Explorer Users**: Top navigation bar only. No persistent application sidebar.
   - **Public Signed-out Navigation**: Home (`/`), Explore Universities (`/universities`), Contact (`/contact`), Sign in (`/sign-in`), and Sign up (`/sign-up`).
   - **Visitor Preview Cap**: Anonymous visitors see up to 50 allowed university previews and generic locked placeholders. Filter interactions prompt sign-in/sign-up.
   - **Verified Explorers**: May browse the full 512+ universities, 4,816+ degree programs, and 11+ scholarships with multi-criteria filters, and request managed support. No student dashboard access prior to administrative approval.
   - **Managed Students & Staff**: Retain their dedicated workspaces, role-specific sidebars, and protected case rooms.
   - **Admin-Controlled Gates**: Workflow gates remain strictly enforced by Postgres RLS and API validation. Reference copy in screenshots (such as *"Every chapter stays open"*) is presentation phrasing and does not override permissions.

---

## 2. Visual Authority & Brand Asset Inventory

### 2.1 Bundled Brand Assets (`theme/extracted_v1/`)
- **Brand Guidelines**: `brand-guidelines.html`
- **Typography**: `dm-sans-variable.ttf` (Single unified product family: **DM Sans**).
- **Logos & Vector Marks**:
  - `original-icon.svg`: For light surfaces (`#1b5a45`, `#103730`, `#134337`).
  - `reversed-icon.svg`: For dark surfaces (`#d7ee83`, `#78967b`, `#c7e78d`).
  - `monochrome-light.svg`: For high-contrast light monochrome use (`#edf2e9`).
  - `monochrome-dark.svg`: For dark monochrome use.
  - `horizontal-light-surface.png` & `horizontal-dark-surface.png`: Horizontal lockups with 36px icon, 20px lowercase `unilistics` wordmark, and 10px gap.
- **Brand Personality**: Clear, Supportive, Trustworthy, Composed.
- **Voice & Tone**: Plain language, sentence case, active verbs, no emoji, no fabricated acceptance odds or fake best-value claims.

---

## 3. Design System & CSS Token Architecture

The presentation migration updates `src/styles/tokens.css` and `src/styles/global.css` with the contrast-verified palette and token scale from Brand Kit v1.0.

### 3.1 Color Palette & Contrast Tokens

| Role | Token Name | Hex Value | Contrast & Usage |
| :--- | :--- | :--- | :--- |
| **Forest Primary Action** | `--brand-forest` / `--action-primary` | `#245B42` | **7.92:1 (AAA)** vs White text. Primary button fills on light surfaces. |
| **Forest Action Hover** | `--action-primary-hover` | `#1B4A35` | **9.1:1 (AAA)** vs White text. Hover state for primary action buttons. |
| **Citron Highlight** | `--brand-citron` / `--accent-citron` | `#D7EE83` | **16.45:1 (AAA)** vs Dark Ink text (`#19261F`). Active tabs, primary buttons in dark mode, selected chips. |
| **Citron Hover** | `--accent-citron-hover` | `#C8E26C` | Hover state for dark mode buttons and active pills. |
| **Sage Illustration / Accent** | `--brand-sage` / `--surface-sage` | `#B4D0B6` | **12.64:1 (AAA)** vs Dark Ink text. Summary cards, illustration accents, soft badges. |
| **Sage Panel Background** | `--surface-sage-panel` | `#E1ECE0` | Soft background for metric banners and summary headers. |
| **Light Canvas** | `--surface-canvas` | `#F6F8F5` | Primary application viewport background (calm off-white). |
| **Light Surface Card** | `--surface-card` | `#FFFFFF` | Crisp white bento cards and modals. |
| **Light Recessed Surface** | `--surface-recessed` | `#EDF2E9` | Recessed input fields, inactive category tiles, search containers. |
| **Light Ink (Text Base)** | `--text-ink` / `--text-body` | `#19261F` | High-emphasis body copy and headings in light mode (**15.69:1 AAA** vs Light Canvas). |
| **Light Ink Muted** | `--text-muted` | `#58695E` | Secondary metadata, dates, breadcrumbs, helper copy (**5.2:1 AA**). |
| **Light Border Subtle** | `--border-subtle` | `#E1E8DE` | 1px border on cards and dividers. |
| **Dark Canvas** | `--dark-canvas` | `#0D1511` | Deep background for dark mode viewport and desktop sidebar. |
| **Dark Surface** | `--dark-surface` | `#111915` | Dark mode headers, nav bars, and recessed containers. |
| **Dark Card** | `--dark-card` | `#16241B` | University cards, journey map tiles, and supporting panels in dark mode. |
| **Dark Card Border** | `--dark-border` | `#203327` | Subtle 1px border for dark cards. |
| **Dark Text Crisp** | `--dark-text-crisp` | `#F2F7F4` | High-contrast heading and title text in dark mode. |
| **Dark Text Muted** | `--dark-text-muted` | `#8DA394` | Secondary text, status subtitles, and labels in dark mode. |

### 3.2 Typography Tokens

- **Font Family**: `'DM Sans', system-ui, -apple-system, sans-serif`
- **Font Source**: Loaded locally from `@/assets/fonts/dm-sans-variable.ttf` via `@font-face` with Google Fonts fallback.
- **Weights Used**:
  - `400` (Regular): Standard body copy, descriptions, table rows.
  - `500` (Medium): Supporting emphasis, secondary chips, filter labels.
  - `600` (SemiBold): Headings (h2, h3), tab labels, button controls.
  - `700` (Bold): Page hero titles (h1), wordmark text, prominent metrics.
- **Case Rule**: Plain sentence case across all navigation, headings, badges, and controls. Avoid all-caps typography except for ISO country codes (`DE`, `FR`, `IT`, `RO`).

### 3.3 Geometry & Layout Tokens

| Token Name | Value | Purpose |
| :--- | :--- | :--- |
| `--gutter-phone` | `1rem` (16px) | Mobile viewport side gutters |
| `--gutter-desktop` | `2.5rem` (40px) | Desktop viewport side gutters |
| `--padding-panel` | `1.5rem` (24px) | Inner padding for cards, drawers, and modal sheets |
| `--space-section` | `2rem` (32px) | Vertical rhythm between page sections |
| `--radius-control` | `1rem` (16px) | Form inputs, select dropdowns, search bars, filter buttons |
| `--radius-card` | `1.5rem` (24px) | Bento cards, university preview tiles, modal containers |
| `--radius-pill` | `9999px` | Action buttons, status chips, segmented map/track toggles |
| `--touch-min` | `3rem` (48px) | Touch target height for mobile controls (minimum $44\text{px}$) |

### 3.4 Motion Tokens

- `--duration-fade`: `180ms ease-out` (region and tab state changes)
- `--duration-drill`: `320ms cubic-bezier(0.16, 1, 0.3, 1)` (drawer/modal sheets and nested navigation)
- `--duration-continuity`: `360ms cubic-bezier(0.16, 1, 0.3, 1)` (card expand / detail transitions)
- `prefers-reduced-motion`: Durations collapse to `0.01ms` for motion sensitivity compliance.

---

## 4. Screenshot Mapping & Component Archetypes

### 4.1 Screenshot 1 (`WhatsApp Image 2026-10-24 at 1.50.13 AM.jpeg`)
- **Archetype**: Dark Desktop Workspace & Interactive Journey Tracker
- **Key Elements**:
  - Deep dark forest sidebar (`#0d1511`) with active Citron pill (`#d7ee83`), dark text, and rounded pill shape.
  - "Big plans. Small steps." motivational card in sidebar with academic cap icon.
  - Top header with search pill ("Search everything", `Ctrl K`), theme toggle, notification bell, user avatar initial.
  - Interactive journey map with 3 phases ("Prepare", "Choose", "Move"), terrain contours, dashed step tracks, Citron checkmark nodes, and "You are here" active badge.
  - Right supporting panel ("Documents", "Identity documents", "Academic evidence", and Citron pill "Continue chapter ->").

### 4.2 Screenshot 2 (`WhatsApp Image 2026-10-24 at 1.40.23 AM.jpeg`)
- **Archetype**: Dark Mobile Discovery & Bento University Cards
- **Key Elements**:
  - Dark mobile top bar with clean "Discover" title, centered reversed logo mark, search & notification actions.
  - Search pill with magnifying glass and right filter button containing Citron badge counter ("3").
  - Dark university card (`#16241b`, border `#203327`, radius `1.5rem`) with initials badge, institution name, country flag, public/private tag.
  - Bento metric split: Left Citron block (`#d7ee83`, dark text) showing programmes count ("1 Programmes listed"); Right dark block showing degree levels and English globe tag.
  - Tuition display: bold amount, currency, explanatory subtext, and "Sources & review" accordion.
  - Bottom action row: "Compare" pill button and primary Citron pill button ("View university ->").
  - Mobile 5-tab bottom navigation (Today, Discover, Saved, Journey, Settings).

### 4.3 Screenshot 3 (`WhatsApp Image 2026-10-24 at 1.40.23 AM (1).jpeg`)
- **Archetype**: Light Search Dialog & Categorized Filter Sheet
- **Key Elements**:
  - Rounded top modal sheet (`#ffffff`, radius `1.5rem`).
  - Search input bar with search icon, filter settings icon, and close button.
  - "I'm looking for..." 2-column grid tiles: "Everything" (dark forest active), "Destinations", "Universities", "Programmes", "Scholarships".
  - Soft editorial illustration: document with magnifying glass and plus icon in sage, citron, and forest green tones.
  - "Find your next study option" explanatory heading.
  - "Quick actions" list with soft sage active highlight (`#e6efe4`, `#1b4332` text) for "Browse universities".

### 4.4 Screenshot 4 (`034088e0-845a-4c51-b89b-a6be286014a9.jpg`)
- **Archetype**: Light Mobile Settings & Grouped Action Lists
- **Key Elements**:
  - Clean light header with "Settings" title and centered original Unilistics logo.
  - User profile row with circular sage avatar initial, user full name, and "Personal information" subtext.
  - Grouped setting sections: "Study", "Account", "Preferences", "Support" with muted section labels.
  - White rounded rows with subtle horizontal dividers, outline Lucide icons, high-contrast labels, and right navigation chevrons.
  - Generous touch heights ($48\text{px}$) and accessible active states.

### 4.5 Screenshot 5 (`WhatsApp Image 2026-10-24 at 1.40.24 AM.jpeg`)
- **Archetype**: Sage Summary Panel & Underline Tab Navigation
- **Key Elements**:
  - Sage green summary panel (`#e1ece0`) with subtle concentric contour lines, big bold stat ("10", "Available credits" / "Active applications"), and white status pill ("Free account" / "Verified Explorer").
  - Dropdown activity trigger in panel.
  - Plain underline tab navigation: Active tab with Forest green text and 2px Forest underline bar; Inactive tab in muted ink.
  - Clean white option cards with bold metric, description, and right arrow action.
  - *Note*: Presentation pattern only. No wallet or payment features are introduced.

---

## 5. Scope Boundaries & Phasing

| Phase | Description | Deliverables | Status |
| :--- | :--- | :--- | :---: |
| **Phase 1** | Discovery, Audit, Baseline, and Rebrand Scoping | Extract assets, inspect screenshots, establish git checkpoint, create `REBRAND_SCOPE.md` & `REBRAND_PROGRESS.md`, baseline test suite verification. | **Active / Current** |
| **Phase 2** | Design Tokens, Typography & Brand Assets | Install DM Sans font, replace old tokens in `tokens.css` and `global.css`, integrate SVG logos, update `BrandWordmark`. | Pending Phase 1 sign-off |
| **Phase 3** | Layouts & Shared Navigation Redesign | Rebrand `PublicLayout`, `ExplorerLayout`, `StudentLayout`, `CounsellorLayout`, `AdminLayout`, `PublicNavbar`, `Sidebar`, `Topbar`, `PublicFooter`. | Pending Phase 2 |
| **Phase 4** | Discovery Experience Redesign | Rebrand `/universities`, `/universities/:id`, `/programs`, `/programs/:id`, `/scholarships`, `/saved`, and search modal sheet. | Pending Phase 3 |
| **Phase 5** | Public & Account Pages Redesign | Rebrand `/`, `/contact`, `/sign-in`, `/sign-up`, `/request-access`, `/request-status`, `/explorer/account`. | Pending Phase 4 |
| **Phase 6** | Student & Staff Workspaces Presentation | Rebrand Journey tracker, `/student/*`, `/staff/*`, `/admin/*` dashboards to matching dark/light themes. | Pending Phase 5 |
| **Phase 7** | Verification, Accessibility & Visual Regression | Run full test suite, typecheck, build validation, browser verification with screenshots. | Pending Phase 6 |
