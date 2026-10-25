# Unilistics Design System V2.0 Specification & Migration Guide

**Document Version:** 2.0.0  
**Effective Date:** 2026-10-25  
**Visual Direction:** Unilistics Forest Green & Citron Identity (Replacing Warm Editorial Bento & Coral)  
**Governing Architecture:** Single semantic token system supporting Light, Dark, and System appearance modes  

---

## 1. Executive Summary & Core Rules

This document specifies the authoritative design system tokens, typography rules, layout geometry, brand asset integration, and component contracts for **Unilistics ATS**.

### Primary Brand Principles
1. **Confirmed Palette Authority:**
   - Primary Light Action: **Forest Green (`#245B42`)** paired with crisp white text (`#FFFFFF`, contrast ratio **7.92:1 AAA**).
   - High-Energy Highlight: **Citron Lime (`#D7EE83`)** paired with dark ink text (`#19261F`, contrast ratio **12.29:1 AAA**). **White normal text on Citron is strictly prohibited** (1.28:1 fail).
   - Base Light Ink: **`#19261F`** (contrast ratio **14.69:1 AAA** on canvas).
   - Canvas: **Light Sand-Green Canvas (`#F6F8F5`)**.
   - Muted Surfaces: **`#EDF2E9` / `#EAEFE8`** derived from brand kit monochrome light and quiet sage.
   - Core Logo Marks: Sourced directly from `theme/extracted_v1/original-icon.svg` (light) and `reversed-icon.svg` (dark).
2. **Derived Dark UI Palette (Green-Black):**
   - The archive did not define every dark token. Dark UI tokens have been visually sampled and calibrated from the five official dark application screenshots.
   - Dark theme is **Green-Black (`#0D1511` / `#111D16` / `#16241B`)**, **not neutral charcoal or pure black**.
   - Primary action in dark mode uses the **Citron treatment (`#D7EE83`)** with dark ink text (`#19261F`).
3. **No Theme Layering:**
   - The legacy coral theme (`#FF5733`, `#B72301`) has been retired. Conflicting tokens have been replaced in place.
   - Legitimate semantic error reds (`#BE123C`, `#F87171`) are strictly preserved for validation errors, destructive actions, and blocked states.
4. **Typography:**
   - Variable **DM Sans** (local TTF font via `@font-face` with `font-display: swap`, verified weight axis `100 1000`).
   - Legacy Plus Jakarta Sans imports have been removed.

---

## 2. Confirmed Kit Values vs. Sampled/Derived Values

| Category | Token Name | Hex Value | Kit Status | Usage & Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Action** | `--brand-forest` / `--action-primary` (light) | `#245B42` | **Confirmed (Kit)** | Light mode primary buttons, active links, focused navigation. |
| **Highlight** | `--brand-citron` / `--action-highlight` | `#D7EE83` | **Confirmed (Kit)** | Badges, callouts, and dark mode primary action. Dark ink text only. |
| **Ink** | `--text-charcoal` / `--text-primary` (light) | `#19261F` | **Confirmed (Kit)** | Headings, primary reading text, icon dark fills. |
| **Canvas** | `--surface-canvas` (light) | `#F6F8F5` | **Confirmed (Kit)** | Main app background, discovery canvas. |
| **Illustration** | `--brand-sage` | `#B4D0B6` | **Confirmed (Kit)** | Visual accents, quiet secondary badges. |
| **Monochrome** | `--surface-recessed` / `--color-secondary-light` | `#EDF2E9` | **Confirmed (Kit)** | Monochrome light surface, quiet panel card backgrounds. |
| **Logo Fill 1** | Original Icon Primary | `#1B5A45` | **Confirmed (Kit SVG)** | Top-right fold path in `original-icon.svg`. |
| **Logo Fill 2** | Original Icon Fold | `#103730` | **Confirmed (Kit SVG)** | Center shadow fold path in `original-icon.svg`. |
| **Logo Fill 3** | Original Icon Base | `#134337` | **Confirmed (Kit SVG)** | Curved bottom arc path in `original-icon.svg`. |
| **Logo Fill 4** | Reversed Icon Primary | `#D7EE83` | **Confirmed (Kit SVG)** | Top-right fold path in `reversed-icon.svg`. |
| **Logo Fill 5** | Reversed Icon Fold | `#78967B` | **Confirmed (Kit SVG)** | Center shadow fold path in `reversed-icon.svg`. |
| **Logo Fill 6** | Reversed Icon Base | `#C7E78D` | **Confirmed (Kit SVG)** | Curved bottom arc path in `reversed-icon.svg`. |
| **Dark Canvas** | `--surface-canvas` (dark) | `#0D1511` | **Sampled / Derived** | Deep green-black background sampled from dark screenshots. |
| **Dark Recessed**| `--surface-recessed` (dark) | `#111D16` | **Sampled / Derived** | Green-black recessed panel/sub-canvas. |
| **Dark Card** | `--surface-card` (dark) | `#16241B` | **Sampled / Derived** | Green-black card surface sampled from screenshot cards. |
| **Dark Panel** | `--surface-panel` (dark) | `#1C2A20` | **Sampled / Derived** | Nav panel, dialog footers, elevated lists. |
| **Dark Elevated** | `--surface-elevated` (dark) | `#203326` | **Sampled / Derived** | Floating dialogs, flyout menus, tooltips. |
| **Dark Border** | `--border-subtle` (dark) | `#203327` | **Sampled / Derived** | Quiet green-black card divider and stroke. |
| **Dark Border Refined** | `--border-refined` (dark) | `#2A4233` | **Sampled / Derived** | Interactive hover border in dark mode. |
| **Dark Text Crisp** | `--text-primary` (dark) | `#F2F7F4` | **Sampled / Derived** | High-contrast light text for dark mode (14.89:1 AAA). |
| **Dark Text Muted** | `--text-muted` (dark) | `#8DA394` | **Sampled / Derived** | Accessible supporting text in dark mode (5.99:1 AA). |
| **Dark Action** | `--action-primary` (dark) | `#D7EE83` | **Derived Treatment** | Matches screenshot pattern: Citron primary CTA with dark ink text. |
| **Semantic Error** | `--color-destructive` (light) | `#BE123C` | **Preserved Standard** | Form validation error, destructive delete button (6.29:1 AA). |
| **Semantic Error** | `--color-destructive` (dark) | `#F87171` | **Derived Standard** | Accessible error red in dark mode (5.83:1 AA). |

---

## 3. Legacy Token Replacement Mapping

| Legacy Token (v1.0 Warm Coral) | Obsolete Value | New Token (v2.0 Forest/Citron) | Light Value | Dark Value |
| :--- | :--- | :--- | :--- | :--- |
| `--brand-coral` | `#FF5733` | `--brand-citron` | `#D7EE83` | `#D7EE83` |
| `--brand-coral-hover` | `#FF6F4E` | `--action-highlight-hover` | `#C5DE6F` | `#C5DE6F` |
| `--brand-coral-gradient` | `linear-gradient(...)` | `--brand-citron` | `#D7EE83` | `#D7EE83` |
| `--action-primary` | `#B72301` | `--action-primary` | `#245B42` | `#D7EE83` |
| `--action-primary-hover` | `#9A1D00` | `--action-primary-hover` | `#1B4A35` | `#C5DE6F` |
| `--color-on-primary` | `#FFFFFF` | `--color-on-primary` | `#FFFFFF` | `#19261F` |
| `--color-primary-light` | `#FFFAFA` / `#FFEFEA` | `--color-primary-light` | `#E4EFE7` | `#203327` |
| `--focus-ring` | `2.5px solid #B72301` | `--focus-ring` | `2.5px solid #245B42` | `2.5px solid #D7EE83` |
| `--surface-canvas` | `#FDFBF7` | `--surface-canvas` | `#F6F8F5` | `#0D1511` |
| `--surface-recessed` | `#F9F6F0` | `--surface-recessed` | `#EDF2E9` | `#111D16` |
| `--surface-card` | `#FFFFFF` | `--surface-card` | `#FFFFFF` | `#16241B` |
| `--text-charcoal` | `#1A1A1A` | `--text-charcoal` | `#19261F` | `#F2F7F4` |
| `--text-body` | `#2D3139` | `--text-body` | `#23342B` | `#DCE5E0` |
| `--text-muted` | `#636B78` | `--text-muted` | `#607368` | `#8DA394` |
| `--border-subtle` | `#EBE6DE` | `--border-subtle` | `#DDE5DC` | `#203327` |
| `--font-family-base` | `'Plus Jakarta Sans'` | `--font-family-base` | `'DM Sans'` | `'DM Sans'` |
| `--radius-control` / `--radius-md` | `14px` | `--radius-control` | `16px` | `16px` |
| `--radius-card` | `24px` | `--radius-card` | `24px` | `24px` |
| `.btn-pill-coral` | coral gradient | `.btn-pill-citron` | `#D7EE83` on `#19261F` | `#D7EE83` on `#19261F` |

---

## 4. Accessibility & Contrast Verification (WCAG 2.2 AA)

All color combinations have been verified with mathematical relative luminance calculations:

| Contrast Pair | Foreground | Background | Actual Ratio | Standard Met | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Light Action Button** | `#FFFFFF` | `#245B42` | **7.92 : 1** | WCAG AAA (>= 7:1) | **PASS** |
| **Light Citron Highlight** | `#19261F` | `#D7EE83` | **12.29 : 1** | WCAG AAA (>= 7:1) | **PASS** |
| **Light Canvas Reading** | `#19261F` | `#F6F8F5` | **14.69 : 1** | WCAG AAA (>= 7:1) | **PASS** |
| **Light Card Surface Reading** | `#19261F` | `#FFFFFF` | **15.69 : 1** | WCAG AAA (>= 7:1) | **PASS** |
| **White on Citron** | `#FFFFFF` | `#D7EE83` | **1.28 : 1** | Failed (< 4.5:1) | **STRICTLY PROHIBITED** |
| **Dark Mode Primary Action** | `#19261F` | `#D7EE83` | **12.29 : 1** | WCAG AAA (>= 7:1) | **PASS** |
| **Dark Mode Canvas Reading** | `#F2F7F4` | `#0D1511` | **17.12 : 1** | WCAG AAA (>= 7:1) | **PASS** |
| **Dark Mode Surface Reading** | `#F2F7F4` | `#16241B` | **14.89 : 1** | WCAG AAA (>= 7:1) | **PASS** |
| **Dark Mode Muted Text** | `#8DA394` | `#16241B` | **5.99 : 1** | WCAG AA (>= 4.5:1) | **PASS** |
| **Light Semantic Red** | `#BE123C` | `#FFFFFF` | **6.29 : 1** | WCAG AA (>= 4.5:1) | **PASS** |
| **Dark Semantic Red** | `#F87171` | `#16241B` | **5.83 : 1** | WCAG AA (>= 4.5:1) | **PASS** |

---

## 5. Typography Specification & License Record

### Font Loading
- **Local Font:** `src/assets/fonts/dm-sans-variable.ttf` and `public/fonts/dm-sans-variable.ttf`.
- **OpenType Attributes:** Single variable weight axis `wght` spanning `100` to `1000`.
- **CSS Declaration:**
  ```css
  @font-face {
    font-family: 'DM Sans';
    src: url('/fonts/dm-sans-variable.ttf') format('truetype-variations'),
         url('/fonts/dm-sans-variable.ttf') format('truetype');
    font-weight: 100 1000;
    font-style: normal;
    font-display: swap;
  }
  ```
- **Web Fallback:** `<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap" rel="stylesheet" />` in `index.html`.

### Typographic Hierarchy
- **Reading / Body Text:** `font-weight: 400` (`--font-weight-regular`). Line height: 1.6.
- **Supporting / Labels / Metas:** `font-weight: 500` (`--font-weight-medium`).
- **Headings & Control Labels:** `font-weight: 600` (`--font-weight-semibold`). Line height: 1.25.
- **Brand Wordmark & Hero Titles:** `font-weight: 700` (`--font-weight-bold`).

### License & Provenance
- **Name:** DM Sans 9pt Regular
- **Authors:** The DM Sans Project Authors (Colophon Foundry, Jonny Pinhorn)
- **License:** SIL Open Font License, Version 1.1 (`https://scripts.sil.org/OFL`)
- **Documentation:** Recorded in `src/assets/fonts/OFL.txt` and `public/fonts/OFL.txt`.

---

## 6. Layout Geometry & Motion Guidelines

- **Mobile Gutter:** `16px` (`--gutter-mobile`, `1rem`).
- **Desktop Gutter:** `40px` (`--gutter-desktop`, `2.5rem`).
- **Panel Padding:** `24px` (`--padding-panel`, `1.5rem`).
- **Section Spacing:** `32px` (`--space-section`, `2rem`).
- **Control Radius:** `16px` (`--radius-control`). Applied to buttons, inputs, selects, textareas, and small cards.
- **Card Radius:** `24px` (`--radius-card`). Applied to content cards, modal sheets, and main panels.
- **Touch Target:** Practical standard `48px` (`--touch-target-default`), never below `44px` (`--touch-target-min`).
- **Motion Tokens:**
  - Context Fade: `180ms ease-out` (`--transition-fade`).
  - Drill Navigation: `320ms ease-out` (`--transition-drill`).
  - Continuity: `360ms cubic-bezier(0.16, 1, 0.3, 1)` (`--transition-continuity`).
  - Reduced Motion: `@media (prefers-reduced-motion: reduce)` resets duration to `0.01ms`.

---

## 7. Appearance Support & Pre-Paint Execution

- **Modes Supported:** `light`, `dark`, `system`.
- **Pre-Paint Script:** Located in `index.html` `<head>`. Executes synchronously before first paint to prevent layout flash or color snapping:
  ```html
  <script>
    (function() {
      try {
        var stored = localStorage.getItem('unilistics-theme') || localStorage.getItem('theme');
        var systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        var theme = (stored === 'dark' || stored === 'light') ? stored : (systemDark ? 'dark' : 'light');
        document.documentElement.setAttribute('data-theme', theme);
        if (theme === 'dark') document.documentElement.classList.add('dark');
      } catch (e) {}
    })();
  </script>
  ```
- **React Provider:** `src/lib/theme.tsx` exposes `useTheme()`, synchronizes media queries for `system`, updates `data-theme` on `:root`, and persists user choices.
- **Portaled Modals:** Rendered modals inherit `data-theme` attributes from `document.documentElement`, ensuring dark mode stays intact inside portals.

---

## 8. Verification & Component Status Checklist

- [x] Variable DM Sans font loaded locally with `@font-face` and swap.
- [x] Official SIL OFL 1.1 license text recorded in `src/assets/fonts/OFL.txt`.
- [x] Plus Jakarta Sans and coral Tailwind CDN scripts purged from `index.html`.
- [x] Single semantic token system implemented in `src/styles/tokens.css`.
- [x] Base layout and button styles updated in `src/styles/global.css`.
- [x] Authentic brand assets copied to `public/images/brand/`:
  - `original-icon.svg` (light mode mark)
  - `reversed-icon.svg` (dark mode mark)
  - `monochrome-dark.svg`
  - `monochrome-light.svg`
  - `horizontal-light-surface.png`
  - `horizontal-dark-surface.png`
- [x] Shared UI Components updated with 16px control / 24px card radii:
  - `BrandWordmark.tsx` (lowercase `unilistics`, DM Sans Bold 700, 36px/24px SVG marks, 10px gap).
  - `Button.tsx` (Forest primary, Citron highlight, 16px radius, 48px touch target).
  - `Card.tsx` (24px radius, 24px panel padding, quiet borders).
  - `Badge.tsx` & `StatusBadge.tsx` (tokenized semantics, pill geometry).
  - `Input.tsx`, `Select.tsx`, `Textarea.tsx` (16px radius, 48px target).
  - `Modal.tsx` (24px radius, green-black backdrop, 24px padding).
  - `Alert.tsx` (16px radius, tokenized status colors).
- [x] Regression testing: All 18 test files (277 tests) passed.
- [x] TypeScript typechecking: 0 errors.
- [x] Vite production build: 0 errors.
