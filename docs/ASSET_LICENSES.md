# Unilistics Asset Licences & Attribution Record

**Document Version:** 1.0.0  
**Effective Date:** 2026-10-25  
**Governing Standard:** Open-Source Asset Compliance, License Integrity & Attribution Mandate  

---

## 1. Overview & Policy

All visual, typographic, and icon assets utilized within the Unilistics platform must adhere strictly to verified open-source or authorized client brand licensing.
- **Single Open-Source Interface Family:** Standardized exclusively on `lucide-react` for all UI controls, navigation, and feedback semantics.
- **Flaticon / Third-Party Policy:** Flaticon is an optional external asset source, not a blanket open-source license. External icons must not be introduced to create mixed visual styles. If any external raster or vector illustration is integrated, its specific author, source URL, license tier (e.g., Free with Attribution, CC-BY), and exact attribution requirements must be recorded in this document, and visible attribution rendered where legally required.
- **No Hotlinking & No Premium Assets:** No hotlinking to external unauthorized CDNs or purchasing premium locked assets. All assets must be bundled locally or served via audited static paths.

---

## 2. Active Asset Licences & Provenance

### 2.1 Typeface: DM Sans Variable Font
- **Asset Files:** `src/assets/fonts/dm-sans-variable.ttf`, `public/fonts/dm-sans-variable.ttf`
- **Authors:** The DM Sans Project Authors (Colophon Foundry, Jonny Pinhorn, Google Fonts)
- **Source Repository:** https://github.com/googlefonts/dm-fonts
- **License:** SIL Open Font License, Version 1.1 (OFL 1.1)
- **License Text:** Preserved in `src/assets/fonts/OFL.txt` and `public/fonts/OFL.txt`
- **Redistribution Terms:** Permitted for bundling, embedding, and web delivery under the condition that font files are not sold individually and the copyright notice and license text accompany distribution.

### 2.2 Icon Family: Lucide Icons (`lucide-react`)
- **Package Version:** `^0.468.0` (npm: `lucide-react`)
- **Authors:** Lucide Project Contributors & Feather Icons original authors (Cole Bemis)
- **Source Repository:** https://github.com/lucide-icons/lucide
- **License:** ISC License (Open Source, permissive)
- **License Text Summary:**
  ```text
  Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT).
  All other copyright (c) for Lucide are held by Lucide Contributors 2022.

  Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee
  is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.
  ```
- **Styling Rules:** Outline strokes (1.75–2.0px), consistent 20–24px standard dimensions (14–16px for inline badges), rounded line caps and joints, `aria-hidden="true"` on decorative icons, explicit `aria-label` on interactive buttons.

### 2.3 Brand Kit SVG Vector Marks
- **Asset Files:**
  - `public/images/brand/original-icon.svg` (Light theme mark: `#1B5A45`, `#103730`, `#134337`)
  - `public/images/brand/reversed-icon.svg` (Dark theme mark: `#78967B`, `#C7E78D`, `#D7EE83`)
  - `public/images/brand/monochrome-light.svg` (`#EDF2E9`)
  - `public/images/brand/monochrome-dark.svg` (`#19261F`)
  - `public/images/brand/horizontal-light-surface.png`
  - `public/images/brand/horizontal-dark-surface.png`
- **Ownership:** Official proprietary brand identity assets supplied in `theme/v1.0.zip` for the Unilistics platform.
- **Usage Constraints:** Proportions and geometries strictly preserved; no artificial drop shadows, glows, or recoloring outside verified theme fills.

### 2.4 Editorial Illustrations & Neutral Graphics
- **Policy:** As specified in guidelines, no client landmark illustrations were bundled in `v1.0.zip`. The platform employs clean, neutral SVG/CSS illustrations and data graphics (globe, documents, verified shields) utilizing the brand kit palette (`#245B42`, `#B4D0B6`, `#D7EE83`, `#19261F`) with transparent backgrounds and organic ground tapering.
- **Authenticity Mandate:** No AI-generated or invented campus images are ever presented as authentic institutional photography.
- **Charts & Progress Metrics:** Generated dynamically in vector SVG and pure CSS from live application data.

---

## 3. Compliance Verification Checklist
- [x] All interface icons sourced exclusively from `lucide-react`.
- [x] No mixed icon font ligatures or arbitrary emoji navigation.
- [x] Official SIL OFL 1.1 license text present alongside variable font binary.
- [x] Decorative icons tagged with `aria-hidden="true"`.
- [x] Icon-only buttons equipped with accessible `aria-label` attributes.
- [x] Zero hotlinked third-party image URLs.
