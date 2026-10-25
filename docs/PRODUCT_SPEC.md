# Product Specification: Unilistics

**Version:** 1.0.0  
**Status:** Approved for Implementation  
**Target Audience:** Pakistani Higher Education Applicants & Advisory Staff  
**Initial Destination Scope:** Germany, France, Italy, Romania (Hungary: Deferred Future Scope)

---

## 1. Executive Summary & Product Vision

Unilistics is a purpose-built, staff-managed university admissions and visa guidance platform engineered specifically for Pakistani students seeking higher education in Europe. 

Navigating foreign university admissions from Pakistan involves navigating intricate institutional frameworks (e.g., German *Studienkolleg* vs. direct entry, French *Études en France* campaigns, Italian *Universitaly* pre-enrollment, Romanian Ministry approvals), multi-tiered domestic document attestation hierarchies (BISE, IBCC, HEC, MOFA, and consular legalization), and stringent consular visa appointment backlogs in Islamabad and Karachi.

Unilistics bridges this gap by combining:
1. A curated, structured **University & Scholarship Discovery Engine** accessible via preview and approved explorer tiers.
2. A **Staff-Operated Case Management Room** providing managed students and assigned counsellors with end-to-end milestone tracking, private document vaults, attestation checklists, and task workflows.
3. A **High-Integrity Operational Model** where high-stakes filings, university submissions, and status changes are operated and verified manually by professional educational counsellors, eliminating errors and compliance violations.

---

## 2. User Personas & Tiered Entitlements

The platform serves six distinct user tiers. Access to data and tools is governed strictly by server-enforced entitlements.

### 2.1 Public & Student Personas

| Persona | Description | Access Rights & Capabilities |
|---|---|---|
| **Visitor (Anonymous / Guest)** | Prospective student or parent browsing the platform without an approved account. | • Fixed preview catalogue of **at most 50 universities** across Germany, France, Italy, and Romania.<br>• High-level program overviews.<br>• Submit an **Explorer Access Request** or **Managed Support Request**.<br>• No access to scholarships, detailed admission requirements, or student case rooms. |
| **Approved Explorer** | Student whose Explorer Request has been vetted and approved by an administrator. | • Access the **full published catalogue** of universities and academic programs.<br>• Filter by country, degree level (Bachelor's, Master's), language of instruction, tuition brackets, and intake seasons.<br>• Search and review verified European scholarship opportunities.<br>• Submit a **Managed Support Request** to upgrade to 1-on-1 counsellor support.<br>• Cannot access student case management, document vaults, or counsellor chat. |
| **Approved Managed Student** | Enrolled client student receiving dedicated institutional application and visa guidance. | • Possesses all Approved Explorer catalogue privileges.<br>• Access to their personal **Case Room**.<br>• Document Vault for uploading required attestations (BISE, IBCC, HEC, MOFA, Apostille, translations).<br>• Actionable checklist of case tasks with deadlines.<br>• Direct chronological case activity timeline and messaging with their assigned counsellor.<br>• Strict isolation: Cannot view any other student's cases, documents, or data. |

### 2.2 Staff Personas

| Persona | Description | Access Rights & Capabilities |
|---|---|---|
| **Counsellor (Staff)** | Operational education advisor managing active student application dossiers. | • Access to their dedicated **Counsellor Workspace**.<br>• View and manage **ONLY cases explicitly assigned** to them via `case_assignments`.<br>• Review, approve, or reject student-uploaded documents with verification notes.<br>• Create, assign, and mark case tasks (e.g., "Schedule MOFA appointment", "Order CIMEA statement").<br>• Record manual university portal application submissions, reference numbers, and intake outcomes.<br>• Communicate directly with assigned students within their case timelines.<br>• Strictly prohibited from viewing unassigned cases or cases assigned to other counsellors. |
| **Administrator** | Senior operational manager coordinating platform workflows and content. | • Review, approve, or reject **Explorer Access Requests** and **Managed Support Requests**.<br>• View all active, on-hold, and archived student cases across the platform.<br>• Assign and rebalance cases among available counsellors (`case_assignments`).<br>• Create, edit, and publish universities, academic programs, and scholarships.<br>• Manage catalogue preview visibility (toggling the preview set of 50 universities).<br>• View platform analytics, counselor workloads, and intake metrics. |
| **Super Administrator** | System owner holding root administrative authority. | • Possesses all Administrator capabilities.<br>• **Sole authority** to provision, promote, or revoke staff roles (`counsellor`, `admin`, `super_admin`).<br>• Inspect system-wide audit logs (`audit_logs`) tracking security and operational actions.<br>• Manage global system configuration and emergency controls. |

---

## 3. Core Feature Specifications

### 3.1 University & Program Discovery Engine

1. **Visitor Preview Limitation:**
   - Unauthenticated visitors are restricted to a fixed subset of at most **50 published universities** (distributed across Germany, France, Italy, and Romania).
   - Program views for visitors display high-level summaries only; specific admission requirements, ECTS credit alignments, and scholarship links are hidden behind the Explorer barrier.

2. **Full Published Catalogue (Approved Explorers & Students):**
   - Searchable and filterable by:
     - **Destination Country:** Germany, France, Italy, Romania (Hungary disabled).
     - **Degree Level:** Bachelor's (Undergraduate), Master's (Postgraduate), Preparatory Year (*Studienkolleg*, French Language Prep, Romanian Preparatory Year).
     - **Language of Instruction:** English, German, French, Italian, Romanian.
     - **Tuition Range:** Zero-tuition / Semester contribution only (Germany/France waivers), Subsidized (€170–€3,950/yr), Mid-tier (€2,000–€5,000/yr), Private.
     - **Intake Season:** Winter / Fall (September/October), Summer / Spring (February/April).
   - **Scholarship Directory:** Curated repository of verified regional and state funding programs (e.g., Italian DSU/ER.GO regional scholarships, French Eiffel/institutional grants, DAAD portals, Romanian government grants).

### 3.2 Access Request & Entitlement Lifecycle

```
[ Visitor ] 
    │
    ├─► Submits "Explorer Request" ──► [ Admin Review Queue ] ──► Approved ──► [ Approved Explorer ]
    │                                                                                 │
    └─► Submits "Managed Support"  ──► [ Admin Review Queue ] ──► Approved ──► [ Managed Student ]
                                                                             (Creates Case + Assigns Counsellor)
```

1. **Independent Entitlements:**
   - Explorer Catalogue Access and Managed Support are separate entitlements stored in the database.
   - A visitor may request Explorer access first, then later request Managed Support, or apply for Managed Support directly.
   - Administrators review and approve/reject each request independently with audit tracking.

2. **Secure Account Onboarding:**
   - Upon administrator approval, the platform issues a secure **activation link** (magic link) via email to the student's registered address.
   - **No plaintext passwords:** Passwords are created securely by the user upon clicking the activation token.
   - If an account already exists, granting a new entitlement immediately updates the user's role and refreshes their session claims.

### 3.3 Managed Student Case Room & Case Lifecycle

When an applicant is approved as a Managed Student, an active `student_cases` record is created and assigned to a Counsellor. The case transitions through seven structured procedural phases:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       MANAGED CASE LIFECYCLE                                │
│                                                                             │
│  [1. Onboarding & Academic Profile Audit]                                   │
│       │                                                                     │
│  [2. Pakistani Document Attestation & Legalization Pipeline]                 │
│       │                                                                     │
│  [3. University Program Selection & Dossier Assembly]                       │
│       │                                                                     │
│  [4. Manual Staff University Application Submission]                         │
│       │                                                                     │
│  [5. Admission Decision & Tuition Protocol Verification]                     │
│       │                                                                     │
│  [6. Consular Visa Dossier Assembly & Appointment Tracking]                 │
│       │                                                                     │
│  [7. Pre-Departure, Post-Arrival Settlement & Residence Permit]              │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Detailed Phase Breakdown:
1. **Onboarding & Academic Profile Audit:**
   - Academic qualification verification: 12-year HSSC (FSC/ICS) vs. 13-year A-Levels/IB vs. 16-year HEC Bachelor's.
   - Verification against target country entry criteria (e.g., German *Anabin* H+ institutional status, Italian 12 vs. 13 year requirement, French Licence eligibility).
2. **Pakistani Document Attestation & Legalization Pipeline:**
   - Interactive milestone checklist tracking:
     - Secondary credentials: Board of Intermediate and Secondary Education (BISE) verification -> Inter Board Coordination Commission (IBCC) attestation -> Ministry of Foreign Affairs (MOFA) Apostille / authentication.
     - Higher education credentials: HEC online verification and physical stamps -> MOFA Apostille / authentication.
     - Civil identity records: NADRA Family Registration Certificate (FRC), birth certificate, police character certificate.
     - Official translation (Italian / French / Romanian) and consular legalization where applicable.
3. **University Program Selection & Dossier Assembly:**
   - Counsellor and student finalize target university choices (up to country-specific limits, e.g., 7 in French *Études en France*, multi-uni in Uni-Assist).
   - Dossier compilation: Motivation Letter / SOP tailored to specific faculties, Europass CV, academic transcripts, language proficiency test reports (IELTS / TestDaF / DELF), academic letters of recommendation.
4. **Manual Staff University Application Submission:**
   - Designated counsellor performs manual application entry on relevant external portals (Uni-Assist, Universitaly, Études en France, Romanian university admissions).
   - Staff logs external application reference numbers, submission timestamps, and upload confirmations into the case activity log.
5. **Admission Decision & Tuition Protocol Verification:**
   - Tracking conditional offers, direct admissions, entrance test invites (e.g., Italian TOLC/IMAT, German *Aufnahmetest*), or Romanian Ministry Letters of Acceptance (*Scrisoare de Acceptare la Studii*).
   - Verification of advance tuition payments, bank wire transfers (SWIFT MT103), and university official fee receipts.
6. **Consular Visa Dossier Assembly & Appointment Tracking:**
   - Financial solvency compliance: Blocked account opening & funding (German *Sperrkonto* €11,208+), French living expense guarantor / bank certificate (€615/mo), Italian sponsorship affidavit + 6-month bank statement + FBR tax returns (3 years), Romanian minimum wage calculation.
   - Consular appointment queue tracking: Islamabad Embassy vs. Karachi Consulate waitlist booking, Gerry's / VFS Global slot booking, eViza application filing.
   - Visa interview preparation and document checklist validation.
7. **Pre-Departure, Post-Arrival Settlement & Residence Permit:**
   - In-country health insurance activation (German TK/AOK, French *Sécurité Sociale*, Italian SSN, Romanian health fund).
   - Municipal accommodation registration (*Anmeldung*, Italian *Codice Fiscale*, French OFII / CAF, Romanian IGI residence permit card).

### 3.4 Document Vault & Privacy Controls

- All uploaded files reside in private storage (`student-vault`) under strict RLS isolation.
- File categories: Identity, Academic Transcripts, Attestations, Financial Proof, Language Certifications, Application Dossiers, Consular Filings.
- Verification badges: Each uploaded document carries a status: `Pending Review`, `Verified by Staff`, `Rejected / Requires Correction`. Staff must include a reason when rejecting a document.

### 3.5 Action Tasks & Case Timeline

- **Tasks:** Actionable checklist items assigned to either the Student (e.g., "Schedule IBCC appointment in Lahore", "Order bank maintenance certificate") or the Counsellor (e.g., "Submit Uni-Assist dossier", "Review revised SOP draft").
- **Activity & Timeline:** A chronological audit feed logging status updates, stage advancements, document uploads, and staff notes.
- **Internal Staff Notes:** Counsellors can post internal notes visible only to staff, kept strictly private from the student.

---

## 4. Platform Boundaries & Non-Goals

To maintain strict regulatory, legal, and operational integrity, the following capabilities are **explicitly out of scope** for this release:

1. **No Scraping Agents:** Unilistics will not deploy automated crawlers, scrapers, or headless browsers to scrape university portals or embassy websites.
2. **No Automated Application Submissions:** The platform will not attempt automated form-filling bots into Uni-Assist, Campus France, Universitaly, or Romanian institutional portals. All applications are reviewed and submitted by human counsellors.
3. **No Automated Visa Submissions or Appointment Sniping:** Visa filings carry legal perjury declarations and embassy appointment portals actively ban automated IP addresses. Appointment booking is tracked and managed manually.
4. **No Automated Admissions Decisions:** The platform does not make algorithmic admission determinations. All eligibility evaluations are conducted by staff based on official criteria.
5. **No Payment Gateway / Processing:** Unilistics does not collect university tuition fees, blocked account deposits, or visa fees directly. All financial transactions occur directly through official banking channels (SWIFT wire, verified escrow services like Expatrio/Coracle/Fintiba) and are recorded via payment receipts.
6. **No University Portal Password Vault:** Unilistics will not store student passwords for external university, embassy, or government portals.
7. **No Client-Side-Only Security:** Zero tolerance for client-only authorization checks. All permissions are verified by the database engine and serverless functions.
