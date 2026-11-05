# Unilistics Project Context Recovery & Implementation Status

**Document Version:** 2.0.0  
**Date:** November 5, 2026  
**Context Recovery Checkpoint:** Master branch commit `3d2f00d` (Reversible backup: `backup-master-at-40f8063`)  
**Primary Design Authority:** Forest/Citron Brand Kit (`#245B42`, `#D7EE83`, `#B4D0B6`, `#F6F8F5`, `#19261F`, DM Sans)  
**Target Architectural Contract:** [AGENTS.md](file:///c:/Users/anasr/OneDrive/Desktop/ATS-Unilistics/AGENTS.md)  

---

## 1. Product Purpose, Boundaries & Operating Scope

- **Core Platform:** Unilistics is a staff-managed higher education application tracking system (ATS) tailored for Pakistani students applying to European universities (Germany, France, Italy, and Romania).
- **Human-in-the-Loop Operations:** Casework, portal submissions (uni-assist, Études en France, Universitaly), and visa dossiers are operated and verified manually by counsellors.
- **Strict Boundary Mandates:**
  - **No Multi-Agent Application Engines / Scrapers:** The platform does NOT run autonomous web scrapers, automated embassy booking bots, or AI application decision agents.
  - **No Artificial Gamification / AI Claims:** No AI matching scores, professor directories, credit wallets, payment collection gateways, or subscription paywalls. Tuition payments and official fees are tracked strictly via authentic wire/SWIFT bank receipts.
  - **Country Scope:** Active corridors are **Germany**, **France**, **Italy**, and **Romania**. Hungary is strictly deferred future scope and is disabled in UI and database.
  - **Content vs Statutory Policy:** Procedural guides in `complete_application_procedures/` are editorial reference material, not statutory legal policies. All financial benchmarks, visa fee thresholds, and attestation rules require explicit verification disclaimers.
  - **Synthetic Data Mandate:** No real student personally identifiable information (PII) is included in tests, seeds, or UI prompts.

---

## 2. Connected Services & Design Authority

### Google Stitch MCP Verification
Connected and verified through `StitchMCP` tool suite:

| Stitch Project ID | Project Title | Screen Resource ID | Screen Title | Design System / Asset ID |
|---|---|---|---|---|
| `projects/17035558956159211590` | **Unilistics Web Platform Redesign** | `screens/bd809af792c3437c90378f160138d02d` | Unilistics Home (2560x11014) | `assets/806237e0b54b4fb6bf77c0a4255a0fee` (Forest Editorial Academic) |
| `projects/6572812195579706581` | **Unilistics Programs and Scholarships Catalogue** | `screens/31f22d0bad314dff8686e97f2cd41e11` | Degree Programs Catalogue (2560x3970) | `assets/b2713a55b45e481da870f4bc278738d2` (Dark Forest & Citron) |
| `projects/16758138486601924731` | **Unilistics Journey Map Redesign** | `screens/51909ec8664d40ae952f3a701ff11a8a` | European Higher Education Journey Map (2560x2776) | `assets/a697425601be4eec8d2dd9a44efdcc3c` (Forest Academic Prestige) |

### Design Tokens & Brand Kit
- **Primary Forest Green:** `#245B42` (`--action-primary`)
- **Electric Citron Accent:** `#D7EE83` (`--brand-citron`)
- **Sage Neutral:** `#B4D0B6` (`--brand-sage`)
- **Light Canvas:** `#F6F8F5` (`--surface-canvas`)
- **Light Ink:** `#19261F` (`--color-foreground`)
- **Typography:** `DM Sans` (wght: 100-1000) for all headings, body text, and controls.
- **Controls & Panels:** `16px` border radius on controls, `24px` on cards, subtle hairlines (`#E1E8DE`).
- **Brand SVG Assets:** `original-icon.svg` (light mode), `reversed-icon.svg` (dark mode), lowercase `unilistics` wordmark.

---

## 3. Canonical Page Inventory & Implementation Status

| # | Route | Page Title / Component | Implementation File | Status | Notes |
|---|---|---|---|---|---|
| 1 | `/` | **Home** | [HomePage.tsx](file:///c:/Users/anasr/OneDrive/Desktop/ATS-Unilistics/src/pages/public/HomePage.tsx) | **Verified** | Kollegio-inspired editorial hero, active corridor cards, 4-stage process overview, self-service vs managed comparison, FAQ accordion, closing CTA, accessible advisory modal. |
| 2 | `/how-it-works` | **How It Works** | [HowItWorksPage.tsx](file:///c:/Users/anasr/OneDrive/Desktop/ATS-Unilistics/src/pages/public/HowItWorksPage.tsx) | **Verified** | 4 canonical communication stages: Explore & Account; Guidance Request & Review; Dossier Assembly; Decisions & Pre-Departure. |
| 3 | `/country-corridors` | **Country Corridors** | [CorridorsAndLegalPage.tsx](file:///c:/Users/anasr/OneDrive/Desktop/ATS-Unilistics/src/pages/public/CorridorsAndLegalPage.tsx) | **Verified** | Germany (APS/Uni-assist), France (Campus France EEF), Italy (Universitaly/CIMEA), Romania (Ministry Letter) with clear statutory distinctions. |
| 4 | `/support` | **Support & Guidance Hub** | [SupportHubPage.tsx](file:///c:/Users/anasr/OneDrive/Desktop/ATS-Unilistics/src/pages/public/SupportHubPage.tsx) | **Verified** | Direct hub linking to How It Works, Request Guidance, Help Centre, Support Desk, and Request Status. |
| 5 | `/request-guidance` | **Request Managed Guidance** | [RequestGuidancePage.tsx](file:///c:/Users/anasr/OneDrive/Desktop/ATS-Unilistics/src/pages/public/RequestGuidancePage.tsx) | **Verified** | Public intake form, real authenticated submission, duplicate-request blocking, pending/approved status cards. |
| 6 | `/help` | **Help Centre & Guides** | [HelpCentrePage.tsx](file:///c:/Users/anasr/OneDrive/Desktop/ATS-Unilistics/src/pages/help/HelpCentrePage.tsx) | **Verified & Active** | Search, corridor filters, procedural articles, AI helper. Repaired: `ReactMarkdown` + `remark-gfm` rendering with sanitized URLs, accessible dialog modal, Escape dismiss, and background scroll lock. |
| 7 | `/support-desk` | **Support Desk** | [SupportDeskPage.tsx](file:///c:/Users/anasr/OneDrive/Desktop/ATS-Unilistics/src/pages/support/SupportDeskPage.tsx) | **Verified** | Authenticated ticket creation, real conversation threads, own-ticket history, category/priority tagging. |
| 8 | `/request-status` | **Check Request Status** | [RequestStatusPage.tsx](file:///c:/Users/anasr/OneDrive/Desktop/ATS-Unilistics/src/pages/public/RequestStatusPage.tsx) | **Verified** | Authenticated user query, real status timeline, response submission to staff clarification requests. No unauthenticated email lookup. |
| 9 | `/contact` | **Contact Admissions Operations** | [ContactPage.tsx](file:///c:/Users/anasr/OneDrive/Desktop/ATS-Unilistics/src/pages/public/ContactPage.tsx) | **Verified** | Working enquiry form with real validation. Purged unverified street address, unverified operating hours, and fake SLA response guarantees. |
| 10 | `/corridors-and-legal` | **Corridors & Legal Overview** | [CorridorsAndLegalPage.tsx](file:///c:/Users/anasr/OneDrive/Desktop/ATS-Unilistics/src/pages/public/CorridorsAndLegalPage.tsx) | **Verified** | Consolidated overview linking to corridors, Privacy, Terms, and Help Centre. |
| 11 | `/privacy` | **Privacy Policy** | [PrivacyPolicyPage.tsx](file:///c:/Users/anasr/OneDrive/Desktop/ATS-Unilistics/src/pages/public/PrivacyPolicyPage.tsx) | **Verified** | Comprehensive synthetic development policy, student data isolation, and retention disclosure. |
| 12 | `/terms` | **Terms of Service** | [TermsPage.tsx](file:///c:/Users/anasr/OneDrive/Desktop/ATS-Unilistics/src/pages/public/TermsPage.tsx) | **Verified** | Entitlement tier separation, admissions non-guarantee, and platform obligations. |
| 13 | `/sign-in` | **Sign In** | [SignInPage.tsx](file:///c:/Users/anasr/OneDrive/Desktop/ATS-Unilistics/src/pages/public/SignInPage.tsx) | **Verified** | Supabase Auth, password visibility toggle, MFA support, returnUrl sanitization. |
| 14 | `/sign-up` | **Create Free Account** | [SignUpPage.tsx](file:///c:/Users/anasr/OneDrive/Desktop/ATS-Unilistics/src/pages/public/SignUpPage.tsx) | **Verified** | Explorer signup, country selection, password strength check, policy agreement. |

---

## 4. User States & Security Architecture

1. **Visitor (Anonymous):**
   - Top navigation and footer only. No sidebar or mobile dock.
   - Public university preview capped at $\le 50$ accredited institutions (enforced via DB trigger `trg_enforce_preview_allowlist_limit` and RLS).
   - Scholarships directory is gated with direct sign-in / sign-up action.
2. **Approved Explorer:**
   - Self-service account creation and verification.
   - Unrestricted browsing of full university, program, and scholarship catalogue.
   - Can submit 1 guidance request. Guidance pending state retains full explorer access.
   - Top navbar with account pill menu and quick sign out. No managed sidebar.
3. **Approved Managed Student:**
   - Granted strictly by admin approval or secure invitation workflow.
   - Dynamic workspace shell resolution: persistent desktop sidebar (256px / 76px) + topbar, or mobile bottom dock.
   - Access to private case room, document vault, action tasks, counsellor messaging, and Journey Map.
   - Read-only template preview shown when case is waiting for staff activation (all steps locked, zero fake progress).
4. **Staff / Administrator:**
   - Scoped workspace (`/staff`, `/admin`). Counsellors access ONLY explicitly assigned cases.
   - RLS policies and database functions strictly enforce tenant and role isolation.

---

## 5. Verification & Health Summary

- **TypeScript Compilation:** `npm run typecheck` (`tsc --noEmit`) passes with **0 errors**.
- **Vitest Unit & Integration Suites:** **23 test files passed (339 passed, 7 skipped live smoke tests, 0 failed)** in ~30s.
- **Production Build:** `npm run build` (`tsc && vite build`) built cleanly in 9.08s across all 53 split bundles.
- **Database Migrations:** 16 Supabase Postgres migrations verified against embedded PGlite.

---

## 6. Current Deliverables & Artifacts

- **Recovery Documentation:** [PROJECT_RECOVERY_STATUS.md](file:///c:/Users/anasr/OneDrive/Desktop/ATS-Unilistics/docs/PROJECT_RECOVERY_STATUS.md)
- **Artifact Report:** `project_recovery_status.md` in conversation brain
- **Connected Stitch Projects:** `projects/17035558956159211590` (Home), `projects/6572812195579706581` (Catalogue), `projects/16758138486601924731` (Journey Map).
