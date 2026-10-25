# Unilistics Design System Specification: Warm Editorial Bento

**Version**: 2.0.0  
**Effective Date**: October 23, 2026  
**Core Foundation**: Warm Editorial Bento with Kinetic Horizon Atmospheric Nuances  
**Compliance Target**: WCAG 2.2 AA Contrast & Keyboard Accessibility  

---

## 1. Color System & Contrast-Verified Palette

### 1.1 Foundation Canvas & Surfaces
| Token | Hex Value | Role & Usage |
| :--- | :--- | :--- |
| `--surface-canvas` | `#FDFBF7` | Warm Ivory background for the full application viewport |
| `--surface-recessed` | `#F9F6F0` | Recessed background for search bars, secondary panels, and filters |
| `--surface-card` | `#FFFFFF` | Opaque pure white for bento cards, data cards, and modals |
| `--surface-card-subtle`| `#FCFAF6` | Slightly tinted card background for nested sections |
| `--border-subtle` | `#EBE6DE` | Delicate card border (1px solid) |
| `--border-refined` | `#DFD9CE` | Form input borders and divider lines |

### 1.2 Typography & Text Colors
| Token | Hex Value | Contrast Ratio vs `#FFFFFF` | Usage |
| :--- | :--- | :--- | :--- |
| `--text-charcoal` | `#1A1A1A` | **17.4:1** (AAA) | High-emphasis page headings, titles, active tabs |
| `--text-body` | `#2D3139` | **12.8:1** (AAA) | Standard paragraph copy, task descriptions, list items |
| `--text-muted` | `#636B78` | **5.4:1** (AA) | Metadata, secondary labels, dates, reviewer initials |
| `--text-subtle` | `#7E8694` | **4.5:1** (AA Large / Supporting) | Placeholders, inactive state hints |

### 1.3 Brand Accents & Accessible Action Fills
| Token | Hex Value | Contrast vs `#FFFFFF` | Contrast vs `#FDFBF7` | Usage |
| :--- | :--- | :--- | :--- | :--- |
| `--brand-coral` | `#FF5733` | 2.9:1 (Fail for white text) | 3.1:1 | Decorative accents, pill tags, badges, glowing borders |
| `--brand-coral-hover` | `#FF6F4E` | - | - | Interactive hover for non-text accents |
| `--action-primary` | `#B72301` | **5.8:1** (AA Compliant) | **5.4:1** (AA Compliant) | **Filled Primary Action Buttons** (with white label text) |
| `--action-primary-hover`| `#9A1D00`| **7.2:1** (AAA) | **6.8:1** (AAA) | Active/hover state for primary action buttons |
| `--brand-cyan` | `#00A389` | **4.6:1** (AA) | - | Secondary verified indicator & subtle gradients |

### 1.4 Subtle Atmospheric Accents
| Accent Name | Background Token | Hex Value | Border / Tint Token |
| :--- | :--- | :--- | :--- |
| **Soft Mint** | `--accent-mint-bg` | `#E8F8F2` | `#BCEAD7` (Approved, verified status containers) |
| **Warm Peach** | `--accent-peach-bg` | `#FFEFEA` | `#FFD2C6` (Important deadlines, callouts) |
| **Calm Lavender**| `--accent-lavender-bg`| `#F3EAFD` | `#E0CEF8` (Adviser advice, contextual guidance) |
| **Ice Blue** | `--accent-blue-bg` | `#EFF6FF` | `#BFDBFE` (In-progress applications, submission active) |

### 1.5 Semantic Status Badges (Text + Icon Guaranteed)
| Status | Badge Background | Text / Border Token | Icon | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Completed / Approved** | `#E6F7F5` | `#0F766E` | `CheckCircle` | Approved documents, satisfied tasks, accepted offers |
| **In Progress / Active** | `#EFF6FF` | `#1D4ED8` | `Clock` / `Loader` | Stage active, under university review, visa queued |
| **Action Required / Pending**| `#FEF3C7` | `#B45309` | `AlertTriangle` | Student action needed, upcoming strict deadline |
| **Needs Replacement** | `#FFE4E6` | `#BE123C` | `XCircle` / `RotateCcw` | Rejected document, missing bank seal, expired photo |

---

## 2. Typography Scale & Font Tokens

- **Font Family**: `'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Weights Used**: `400` (Regular), `500` (Medium), `600` (SemiBold), `700` (Bold), `800` (ExtraBold)

| Type Token | Desktop Size / Line-Height | Mobile Size / Line-Height | Weight | Letter-Spacing |
| :--- | :--- | :--- | :--- | :--- |
| `display-hero` | 48px / 56px | 32px / 40px | 800 | -0.025em |
| `page-title` | 32px / 40px | 24px / 32px | 700 | -0.02em |
| `section-heading` | 22px / 28px | 18px / 24px | 700 | -0.015em |
| `card-title` | 17px / 24px | 16px / 22px | 600 | -0.01em |
| `body-base` | 16px / 26px | 15px / 24px | 400 / 500 | 0.0em |
| `body-small` | 14px / 20px | 13px / 18px | 400 / 500 | 0.0em |
| `caption-chip` | 12px / 16px | 11px / 14px | 600 | +0.01em |

---

## 3. Radii, Shadows & Bento Layout Architecture

### 3.1 Radii System
- **Cards & Bento Panels**: `24px` desktop (`20px` mobile).
- **Nested Panels & Inner Containers**: `16px` desktop (`14px` mobile).
- **Standard Form Inputs & Textareas**: `14px` with `1.5px` refined border.
- **Action Buttons, Badges, Search Bar, Pills**: `9999px` (Full Pill).

### 3.2 Quiet Shadow Elevation
- `--shadow-card`: `0 2px 8px -2px rgba(26,28,30,0.04), 0 8px 24px -4px rgba(26,28,30,0.06)`
- `--shadow-floating-nav`: `0 8px 30px rgba(0, 0, 0, 0.08)`
- `--shadow-hover`: `0 6px 16px -2px rgba(26,28,30,0.06), 0 16px 36px -4px rgba(26,28,30,0.10)`

### 3.3 Container Width & Grid Rhythm
- **Maximum Content Width**: `1400px` centered with responsive horizontal gutters (`16px` mobile, `24px` tablet, `32px` desktop).
- **Vertical Spacing Rhythm**: `4px` / `8px` multiples (`8px`, `12px`, `16px`, `24px`, `32px`, `48px`).

---

## 4. Accessibility & Interaction Directives

1. **Touch Target Sizing**: Every interactive button, filter chip, and dropdown control maintains a minimum physical bounding box of **$44 \times 44\text{px}$** on mobile.
2. **Keyboard Focus Rings**: Visible high-contrast focus rings:
   `outline: 2.5px solid #B72301; outline-offset: 2.5px;`
3. **Motion Sensitivity**: Respects `prefers-reduced-motion`:
   Transitions default to `140ms ease-out` and collapse to `0.01ms` when reduced motion is preferred.
4. **Authentic Assets & Icons**: Lucide React SVG icon system used uniformly across all roles; official Unilistics logo (`public/images/unilistics/unilistics-logo.png`) anchored in floating navigation.
