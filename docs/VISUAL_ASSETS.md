# Unilistics Visual Assets Register & Provenance Log

**Version**: 1.0.0  
**Effective Date**: October 23, 2026  
**Asset Directory**: `public/images/unilistics/`  
**License**: Proprietary / Project-Licensed Assets  

---

## 1. Brand Identity Assets

| Asset Name | Relative File Path | Sourced / Generated | Source Provenance / URL | Dimensions | Size | Route / Component Usage | Alt Text / Accessibility Treatment |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Official Unilistics Logo Mark** | `public/images/unilistics/unilistics-logo.png` | Sourced | Direct production fetch from `https://www.unilistics.com/unilistics-logo.png` | 1000 x 1120 | 1.0 MB (High-res source) | Floating Navbar, BrandWordmark, Document Headers | `"Unilistics Official Brand Logo"` |

---

## 2. Integrated Editorial Illustrations

All illustrations have been generated using Antigravity AI multimodal generation with consistent Warm Editorial Bento parameters (Warm Ivory `#FDFBF7` canvas, Brand Coral `#FF5733` accents, Mint `#E8F8F2` & Lavender details, soft dimensional shadows, no embedded text or letters).

| Asset Name | Formats & Paths | Type | Intended Dimensions | WebP Size | PNG Size | Route & Component Placement | Alt Text / Meaningful Copy |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero Study Abroad** | `public/images/unilistics/hero_study_abroad.webp`<br/>`public/images/unilistics/hero_study_abroad.png` | AI Generated | 1200 x 675 (16:9) | **57.7 kB** | 1.0 MB | Public Discovery (`/`), Request Access hero banner | `"Editorial illustration showing European university architecture, study visa travel documents, and educational milestones"` |
| **Empty Document Vault** | `public/images/unilistics/empty_vault.webp`<br/>`public/images/unilistics/empty_vault.png` | AI Generated | 600 x 600 (1:1) | **12.3 kB** | 328 kB | Student Documents (`/student/documents`), Staff Review Queue empty state | `"Stylized secure document vault with brass lock and verified badge"` |
| **Empty Applications Roadmap** | `public/images/unilistics/empty_applications.webp`<br/>`public/images/unilistics/empty_applications.png` | AI Generated | 600 x 600 (1:1) | **25.0 kB** | 360 kB | Student Overview (`/student`), Applications (`/student/applications`) | `"Illustration of an academic admissions milestone pathway with compass and graduation cap"` |
| **Empty Messages Dialogue** | `public/images/unilistics/empty_messages.webp`<br/>`public/images/unilistics/empty_messages.png` | AI Generated | 600 x 600 (1:1) | **7.1 kB** | 269 kB | Student Case Messages (`/student/messages`), Staff Adviser Chat Drawer | `"Editorial speech bubbles in coral and mint with an origami message plane"` |
| **Request Confirmed Seal** | `public/images/unilistics/request_confirmed.webp`<br/>`public/images/unilistics/request_confirmed.png` | AI Generated | 600 x 600 (1:1) | **11.0 kB** | 371 kB | Access Request Confirmation (`/request-access`), Password Reset, Email Verification | `"Sealed verification envelope with coral wax stamp and official green laurel badge"` |

---

## 3. Production Delivery Directives

1. **Format Negotiation**: High-efficiency WebP files are prioritized in modern browsers with PNG fallback.
2. **Performance Constraints**:
   - Above-the-fold hero image: $\approx 57\text{ kB}$ (well within the $\le 150\text{ kB}$ threshold).
   - Empty state visuals: all between $7\text{ kB}$ and $25\text{ kB}$ (well within the $\le 50\text{ kB}$ threshold).
3. **Responsive Presentation**: Explicit `width` and `height` attributes prevent Cumulative Layout Shift (CLS $\le 0.05$).
4. **Authenticity Guarantee**:
   - Zero fictional university campus photographs or fabricated institutional seals.
   - All charts, status badges, timelines, and metrics are rendered strictly in accessible semantic HTML/SVG code.
