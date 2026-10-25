-- ============================================================================
-- Migration 016: Searchable Help Centre, Editorial Workflow & Contextual Help
-- Product: Unilistics (ATS for European Higher Education)
-- Guidelines: Follows supabase and supabase-postgres-best-practices
-- Content Source: Reviewed material from complete_application_procedures/
-- Hungary Scope: Explicitly absent / excluded until reviewed content exists
-- ============================================================================

-- 1. Help Articles Table
CREATE TABLE IF NOT EXISTS public.help_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL CHECK (length(trim(title)) >= 5),
  summary TEXT NOT NULL CHECK (length(trim(summary)) >= 10),
  content TEXT NOT NULL CHECK (length(trim(content)) >= 20),
  country_code TEXT NOT NULL CHECK (country_code IN ('de', 'fr', 'it', 'ro', 'all')),
  topic TEXT NOT NULL CHECK (topic IN (
    'attestation', 'admissions', 'language_proficiency', 'blocked_account',
    'visa_processing', 'pre_enrollment', 'apostille_and_legalization',
    'health_insurance', 'arrival_and_residence', 'general'
  )),
  degree_level_applicability TEXT NOT NULL DEFAULT 'all' CHECK (degree_level_applicability IN ('bachelors', 'masters', 'all')),
  stage_applicability TEXT,
  document_category_applicability TEXT,
  source_file TEXT NOT NULL,
  source_section TEXT NOT NULL,
  official_source_url TEXT,
  verification_status TEXT NOT NULL DEFAULT 'provisional' CHECK (verification_status IN ('verified', 'provisional', 'unverified')),
  editorial_status TEXT NOT NULL DEFAULT 'draft' CHECK (editorial_status IN ('draft', 'in_review', 'published', 'archived')),
  version INT NOT NULL DEFAULT 1,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  last_reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Search and filter indexes
CREATE INDEX IF NOT EXISTS idx_help_articles_status_country ON public.help_articles(editorial_status, country_code);
CREATE INDEX IF NOT EXISTS idx_help_articles_topic ON public.help_articles(topic);
CREATE INDEX IF NOT EXISTS idx_help_articles_stage ON public.help_articles(stage_applicability);
CREATE INDEX IF NOT EXISTS idx_help_articles_doc_cat ON public.help_articles(document_category_applicability);
CREATE INDEX IF NOT EXISTS idx_help_articles_search ON public.help_articles USING gin(
  to_tsvector('english', title || ' ' || summary || ' ' || content)
);

-- 2. Editorial State Transition Validation Trigger
CREATE OR REPLACE FUNCTION private.validate_help_article_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Hungary is strictly disabled across the platform until reviewed content is supplied
  IF NEW.country_code = 'hu' THEN
    RAISE EXCEPTION 'HUNGARY_DISABLED: Procedural guidance for Hungary is deferred future scope and prohibited.';
  END IF;

  -- Validate official source URL protocol if present
  IF NEW.official_source_url IS NOT NULL AND NEW.official_source_url !~* '^https?://' THEN
    RAISE EXCEPTION 'INVALID_SOURCE_URL: Official source URL must start with http:// or https://';
  END IF;

  -- Update version and timestamps on editorial publishing
  IF TG_OP = 'UPDATE' THEN
    IF OLD.editorial_status <> 'published' AND NEW.editorial_status = 'published' THEN
      NEW.last_reviewed_at := NOW();
      NEW.version := OLD.version + 1;
    END IF;
    NEW.updated_at := NOW();
  ELSIF TG_OP = 'INSERT' AND NEW.editorial_status = 'published' THEN
    NEW.last_reviewed_at := NOW();
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_help_article ON public.help_articles;
CREATE TRIGGER trg_validate_help_article
  BEFORE INSERT OR UPDATE ON public.help_articles
  FOR EACH ROW
  EXECUTE FUNCTION private.validate_help_article_transition();


-- 3. Row-Level Security Policies for Help Articles
ALTER TABLE public.help_articles ENABLE ROW LEVEL SECURITY;

-- 3a. Public / Anonymous / Students / Explorers: Can ONLY select published articles (Drafts are strictly isolated!)
DROP POLICY IF EXISTS "help_articles_select_published" ON public.help_articles;
CREATE POLICY "help_articles_select_published" ON public.help_articles
  FOR SELECT TO anon, authenticated
  USING (
    editorial_status = 'published'
    AND country_code IN ('de', 'fr', 'it', 'ro', 'all')
  );

-- 3b. Staff / Admin: Can view all statuses (draft, in_review, published, archived) for editorial review
DROP POLICY IF EXISTS "help_articles_select_staff" ON public.help_articles;
CREATE POLICY "help_articles_select_staff" ON public.help_articles
  FOR SELECT TO authenticated
  USING (
    private.is_admin((SELECT auth.uid()))
    OR EXISTS (SELECT 1 FROM public.staff_roles sr WHERE sr.user_id = (SELECT auth.uid()))
  );

-- 3c. Staff / Admin: Can create, update, or archive help articles
DROP POLICY IF EXISTS "help_articles_write_staff" ON public.help_articles;
CREATE POLICY "help_articles_write_staff" ON public.help_articles
  FOR ALL TO authenticated
  USING (
    private.is_admin((SELECT auth.uid()))
    OR EXISTS (SELECT 1 FROM public.staff_roles sr WHERE sr.user_id = (SELECT auth.uid()))
  )
  WITH CHECK (
    private.is_admin((SELECT auth.uid()))
    OR EXISTS (SELECT 1 FROM public.staff_roles sr WHERE sr.user_id = (SELECT auth.uid()))
  );


-- 4. Search Published Help Articles RPC
-- Exposes full-text search with ranking, filters, and contextual match fallback.
-- Guarantees that draft/internal guide drafts are NEVER exposed.
CREATE OR REPLACE FUNCTION public.search_published_help_articles(
  p_query TEXT DEFAULT NULL,
  p_country_code TEXT DEFAULT NULL,
  p_topic TEXT DEFAULT NULL,
  p_degree_level TEXT DEFAULT NULL,
  p_stage TEXT DEFAULT NULL,
  p_document_category TEXT DEFAULT NULL,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_results JSONB := '[]'::jsonb;
  v_clean_query TEXT;
BEGIN
  -- Strict guard: Hungary cannot be queried
  IF p_country_code = 'hu' THEN
    RETURN '[]'::jsonb;
  END IF;

  v_clean_query := trim(COALESCE(p_query, ''));

  SELECT jsonb_agg(sub) INTO v_results FROM (
    SELECT
      ha.id,
      ha.slug,
      ha.title,
      ha.summary,
      ha.content,
      ha.country_code,
      ha.topic,
      ha.degree_level_applicability,
      ha.stage_applicability,
      ha.document_category_applicability,
      ha.source_file,
      ha.source_section,
      ha.official_source_url,
      ha.verification_status,
      ha.editorial_status,
      ha.version,
      ha.last_reviewed_at,
      (ha.last_reviewed_at < (NOW() - INTERVAL '180 days')) AS is_stale,
      CASE
        WHEN v_clean_query <> '' THEN
          ts_rank(
            to_tsvector('english', ha.title || ' ' || ha.summary || ' ' || ha.content),
            plainto_tsquery('english', v_clean_query)
          )
        ELSE 1.0
      END AS rank_score
    FROM public.help_articles ha
    WHERE ha.editorial_status = 'published'
      AND ha.country_code IN ('de', 'fr', 'it', 'ro', 'all')
      AND (p_country_code IS NULL OR p_country_code = 'all' OR ha.country_code IN (p_country_code, 'all'))
      AND (p_topic IS NULL OR ha.topic = p_topic)
      AND (p_degree_level IS NULL OR ha.degree_level_applicability IN (p_degree_level, 'all'))
      AND (p_stage IS NULL OR ha.stage_applicability = p_stage)
      AND (p_document_category IS NULL OR ha.document_category_applicability = p_document_category)
      AND (
        v_clean_query = ''
        OR to_tsvector('english', ha.title || ' ' || ha.summary || ' ' || ha.content) @@ plainto_tsquery('english', v_clean_query)
        OR ha.title ILIKE ('%' || v_clean_query || '%')
        OR ha.summary ILIKE ('%' || v_clean_query || '%')
      )
    ORDER BY rank_score DESC, ha.last_reviewed_at DESC
    LIMIT p_limit OFFSET p_offset
  ) sub;

  RETURN COALESCE(v_results, '[]'::jsonb);
END;
$$;


-- 5. Contextual Help Lookup RPC
-- Fetches precise guidance for an unfamiliar stage or document category
CREATE OR REPLACE FUNCTION public.get_contextual_help_item(
  p_stage TEXT DEFAULT NULL,
  p_document_category TEXT DEFAULT NULL,
  p_country_code TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_item JSONB;
BEGIN
  IF p_country_code = 'hu' THEN
    RETURN NULL;
  END IF;

  SELECT jsonb_build_object(
    'id', ha.id,
    'slug', ha.slug,
    'title', ha.title,
    'summary', ha.summary,
    'content', ha.content,
    'country_code', ha.country_code,
    'topic', ha.topic,
    'source_file', ha.source_file,
    'source_section', ha.source_section,
    'official_source_url', ha.official_source_url,
    'verification_status', ha.verification_status,
    'last_reviewed_at', ha.last_reviewed_at,
    'is_stale', (ha.last_reviewed_at < (NOW() - INTERVAL '180 days'))
  ) INTO v_item
  FROM public.help_articles ha
  WHERE ha.editorial_status = 'published'
    AND ha.country_code IN ('de', 'fr', 'it', 'ro', 'all')
    AND (
      (p_document_category IS NOT NULL AND ha.document_category_applicability = p_document_category)
      OR
      (p_stage IS NOT NULL AND ha.stage_applicability = p_stage)
    )
    AND (p_country_code IS NULL OR ha.country_code IN (p_country_code, 'all'))
  ORDER BY
    (ha.document_category_applicability = p_document_category) DESC,
    (ha.country_code = p_country_code) DESC,
    ha.last_reviewed_at DESC
  LIMIT 1;

  RETURN v_item;
END;
$$;


-- 6. Staff Editorial State Transition RPC
CREATE OR REPLACE FUNCTION public.manage_help_article_editorial(
  p_article_id UUID,
  p_action TEXT,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_uid UUID;
  v_is_admin BOOLEAN;
  v_is_staff BOOLEAN;
  v_new_status TEXT;
  v_article RECORD;
BEGIN
  v_uid := (SELECT auth.uid());
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  v_is_admin := private.is_admin(v_uid);
  SELECT EXISTS (SELECT 1 FROM public.staff_roles WHERE user_id = v_uid) INTO v_is_staff;

  IF NOT v_is_admin AND NOT v_is_staff THEN
    RAISE EXCEPTION 'Access denied: Editorial actions require counsellor or administrator privileges';
  END IF;

  SELECT * INTO v_article
  FROM public.help_articles
  WHERE id = p_article_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Help article % not found', p_article_id;
  END IF;

  IF p_action = 'submit_review' THEN
    v_new_status := 'in_review';
  ELSIF p_action = 'publish' THEN
    v_new_status := 'published';
  ELSIF p_action = 'archive' THEN
    v_new_status := 'archived';
  ELSIF p_action = 'return_to_draft' THEN
    v_new_status := 'draft';
  ELSE
    RAISE EXCEPTION 'Invalid editorial action: %', p_action;
  END IF;

  UPDATE public.help_articles
  SET
    editorial_status = v_new_status,
    reviewer_id = v_uid,
    last_reviewed_at = CASE WHEN v_new_status = 'published' THEN NOW() ELSE last_reviewed_at END,
    version = CASE WHEN v_new_status = 'published' THEN version + 1 ELSE version END,
    updated_at = NOW()
  WHERE id = p_article_id;

  RETURN jsonb_build_object(
    'success', true,
    'article_id', p_article_id,
    'previous_status', v_article.editorial_status,
    'new_status', v_new_status,
    'reviewed_by', v_uid,
    'notes', p_notes
  );
END;
$$;


-- 7. Seed Reviewed Help Articles for Four Country Procedural Guides
-- Germany: Attestation, Uni-assist/VPD, Blocked Account, Visa Appointments
-- France: Études en France, Campus France Pakistan, Tuition Framework, VLS-TS Visa
-- Italy: Universitaly Pre-Enrollment, DOV vs CIMEA, CENT-S/Entrance Tests, D-Type Visa
-- Romania: Ministry Acceptance Letter, Translations & Apostille, Liquid Solvency, Type D/SD Visa

INSERT INTO public.help_articles (
  slug, title, summary, content, country_code, topic,
  degree_level_applicability, stage_applicability, document_category_applicability,
  source_file, source_section, official_source_url,
  verification_status, editorial_status, version, last_reviewed_at
) VALUES
-- GERMANY 1: HEC & MOFA Attestation Chain
(
  'de-hec-mofa-attestation-protocol',
  'HEC & MOFA Document Attestation Protocol for Germany',
  'Complete educational credential verification sequence for Pakistani Bachelor and Master applicants applying to German universities.',
  $md$### Official Attestation Sequence for Pakistani Qualifications

Before Pakistani academic credentials can be submitted to German universities, Uni-assist, or the German diplomatic missions in Islamabad or Karachi, documents must undergo an unbroken chain of statutory authentications:

1. **Secondary Qualifications (Matric & F.Sc / Intermediate):**
   - **Step 1: Board of Intermediate and Secondary Education (BISE):** Obtain primary board verification in an official sealed envelope (~PKR 800 per certificate).
   - **Step 2: Inter Board Coordination Commission (IBCC):** Submit the sealed BISE envelope to IBCC for QR-coded sticker authentication. Both original certificates and photocopies must be attested.
   - **Step 3: Ministry of Foreign Affairs (MOFA):** Present IBCC-attested documents to the MOFA liaison office (Islamabad, Lahore, Karachi, Peshawar, or Quetta) for official Apostille authentication.

2. **Higher Education Qualifications (4-Year Bachelor Degrees & Transcripts):**
   - **Step 1: University Controller of Examinations:** Obtain controller endorsement and verified transcripts from your degree-granting university.
   - **Step 2: Higher Education Commission (HEC):** Register on the HEC e-portal, schedule an appointment, and receive the official HEC QR sticker on original degree certificates and detailed mark sheets.
   - **Step 3: Ministry of Foreign Affairs (MOFA):** Secure MOFA Apostille authentication over the HEC verification stickers.

> **Validation Advisory:** Never laminate original attested documents. German consular officers require physical inspection of wet stamps and QR stickers on the reverse side of original degrees.$md$,
  'de', 'attestation', 'all', 'attestation', 'hec_attestation',
  'Complete German University Admission and Student Visa Guide for Pakistani Applicants_ Comprehensive Bachelor’s & Master’s Roadmap.md',
  'Section 3: Educational Document Attestation Protocol',
  'https://www.hec.gov.pk',
  'verified', 'published', 1, NOW()
),

-- GERMANY 2: Uni-Assist VPD (Preliminary Review Documentation)
(
  'de-uni-assist-vpd-procedure',
  'Understanding the Uni-Assist Vorprüfungsdokumentation (VPD)',
  'Operational guide on converting Pakistani percentage and CGPA grades into the German Bavarian formula via Uni-assist.',
  $md$### What is a Vorprüfungsdokumentation (VPD)?

A **VPD (Preliminary Review Documentation)** is an official evaluation certificate issued by *Uni-assist e.V.* on behalf of participating German public universities (such as TU Munich, LMU Munich, University of Cologne, and RWTH Aachen). It verifies:
- Whether your Pakistani educational background qualifies you for direct university entry (*Direktzugang*) or requires a preparatory foundation year (*Studienkolleg*).
- Your converted grade according to the official modified German Bavarian formula (where 1.0 is the highest grade and 4.0 is the minimum passing grade).

### Application Timeline & Processing
- **Standard Processing Time:** Uni-assist takes **4 to 6 weeks** to process dossiers from Pakistan. You should lodge your VPD request well before the university application deadline.
- **Handling Fee:** €75 for your first university choice; €30 for each additional target university within the same semester cycle.
- **Multi-Semester Validity:** Most university VPDs remain legally valid for **1 year** across multiple application cycles.$md$,
  'de', 'admissions', 'all', 'university_admissions', 'admission_offer',
  'Complete German University Admission and Student Visa Guide for Pakistani Applicants_ Comprehensive Bachelor’s & Master’s Roadmap.md',
  'Section 4: The Uni-Assist Infrastructure & VPD Protocols',
  'https://www.uni-assist.de',
  'verified', 'published', 1, NOW()
),

-- GERMANY 3: Blocked Account (Sperrkonto) Benchmark
(
  'de-blocked-account-sperrkonto-benchmark',
  'German Blocked Account (Sperrkonto) Living Expense Proof',
  'Statutory subsistence financial requirements, authorized providers, and transfer mechanics for Pakistani students.',
  $md$### Statutory Subsistence Benchmark

Under Section 16b of the German Residence Act (*Aufenthaltsgesetz*), all international non-EU students must demonstrate sufficient financial means for their first academic year.

- **Statutory Financial Benchmark:** Currently benchmarked between **€11,208 and €11,904 per year** (approximately €934 to €992 per month).
- **Authorized Providers:** Federal Foreign Office accredited providers include **Expatrio, Coracle, and Fintiba**.
- **Fund Release Mechanics:** Funds deposited into your *Sperrkonto* remain blocked until you arrive in Germany, open a local current account (*Girokonto*), and register your residential address (*Anmeldung*). Thereafter, statutory monthly disbursements (e.g. €934) are transferred automatically to your local bank account.

> **Statutory Notice:** Financial thresholds are established by federal ordinance. Always verify current amounts against official embassy circulars before executing wire transfers.$md$,
  'de', 'blocked_account', 'all', 'financial_proof', 'blocked_account_proof',
  'Complete German University Admission and Student Visa Guide for Pakistani Applicants_ Comprehensive Bachelor’s & Master’s Roadmap.md',
  'Section 6: Statutory Financial Requirements & The Blocked Account Mechanism',
  'https://pakistan.diplo.de',
  'verified', 'published', 1, NOW()
),

-- FRANCE 1: Études en France (EeF) & Campus France Pakistan
(
  'fr-etudes-en-france-campus-france-procedure',
  'Études en France (EeF) Portal & Campus France Pakistan Protocol',
  'Mandatory pre-consular application portal, campaign timelines, and oral interview procedures for Pakistani students.',
  $md$### Mandatory Centralized Architecture

All Pakistani residents applying to French public universities, *Licence*, or *Master* degree programs must process their academic dossiers through the official **Études en France (EeF)** platform managed by Campus France Pakistan.

### Operational Sequence:
1. **Account Creation:** Register on the official EeF portal under the "I am applying" tab.
2. **Program Selection:** Select up to **7 public university programs** across France under a single processing fee (~PKR 30,000).
3. **Application Window:** The annual campaign opens on **October 1** and closes in **mid-to-late November**.
4. **Campus France In-Person Interview:** Once conditional admission is secured, applicants must attend an in-person academic interview at the Alliance Française in Islamabad, Lahore, or Karachi.
5. **Attestation EeF:** Clearing the interview generates the official *Accord Préalable d'Inscription* / *Attestation EeF*, which is the mandatory pre-requisite for lodging a student visa with France-Visas.$md$,
  'fr', 'pre_enrollment', 'all', 'university_admissions', 'admission_offer',
  'Comprehensive Guide to French University Admission and Student Visas for Pakistani Applicants.md',
  'Section 2 & 4: Application Platforms & Campus France Pakistan Protocol',
  'https://www.campusfrance.org',
  'verified', 'published', 1, NOW()
),

-- FRANCE 2: Tuition Framework & Non-EU Subsidized Waivers
(
  'fr-tuition-waivers-subsidies',
  'French Public University Tuition Fees & Exonération Waivers',
  'Official tuition fee spectrum for Licence and Master programs, and institutional waiver pathways.',
  $md$### Public University Tuition Structure

The French Ministry of Higher Education defines differentiated annual tuition fees for non-EU students:
- **Licence (Bachelor):** €2,900 per academic year.
- **Master:** €3,770 to €3,950 per academic year.

### Partial Exemption Waivers (*Exonération des Droits Différenciés*):
Many public universities (e.g. University of Burgundy, Sorbonne Paris Nord) automatically grant institutional partial waivers to international students. When a waiver is granted:
- Bachelor tuition drops to the baseline domestic rate of **€170 per year**.
- Master tuition drops to the baseline domestic rate of **€243 per year**.
- In addition, all students pay the statutory student life and campus contribution (*CVEC*) of approximately **€103 per year**.$md$,
  'fr', 'admissions', 'all', 'university_admissions', 'admission_offer',
  'Comprehensive Guide to French University Admission and Student Visas for Pakistani Applicants.md',
  'Section 1: Institutional Landscape, Degree Pathways, and Financial Commitments',
  'https://www.enseignementsup-recherche.gouv.fr',
  'verified', 'published', 1, NOW()
),

-- ITALY 1: Universitaly Portal Pre-Enrollment & Riepilogo
(
  'it-universitaly-pre-enrollment-riepilogo',
  'Universitaly Portal Pre-Enrollment & The Riepilogo Summary',
  'Step-by-step pre-consular authorization workflow for Italian public universities and visa clearance.',
  $md$### What is Universitaly Pre-Enrollment?

Securing an admission offer from an Italian public university (e.g. Politecnico di Milano, Sapienza University of Rome) is step one. Step two is submitting a formal pre-enrollment request on the official Italian Ministry portal: **universitaly.it**.

### Key Rules & Mechanics:
- **Single Choice Constraint:** On the Universitaly portal, an applicant may select strictly **ONE university and ONE degree program** for pre-enrollment.
- **University Validation:** Your chosen university logs into the portal to review your dossier and validates your eligibility.
- **The Riepilogo Form:** Upon validation, the portal generates an official summary document (*Riepilogo della Domanda di Preiscrizione*).
- **Consular Transmission:** The Universitaly platform transmits your validated Riepilogo directly to the Italian Embassy in Islamabad or Consulate General in Karachi. You cannot submit a study visa without this verified form.$md$,
  'it', 'pre_enrollment', 'all', 'visa_filing', 'admission_offer',
  'Comprehensive Guide to Italian Higher Education Admissions, Pre-Enrollment, and Student Visa Processing_ A Definitive Blueprint for Pakistani Applicants.md',
  'Section 3: Universitaly Portal Mechanics & Institutional Pre-Enrollment',
  'https://www.universitaly.it',
  'verified', 'published', 1, NOW()
),

-- ITALY 2: Declaration of Value (DOV) vs CIMEA Comparability
(
  'it-declaration-of-value-dov-vs-cimea',
  'Declaration of Value (DOV) vs. CIMEA Comparability Statement',
  'Understanding the two legal pathways for Italian academic qualification equivalence.',
  $md$### Equivalence Verification for Italian Admissions

Italian public universities require verified proof that your Pakistani secondary or higher education degree is officially comparable to the Italian qualifications framework. There are two legal routes:

1. **CIMEA Comparability & Verification Statement:**
   - Issued by CIMEA (Information Centre on Academic Mobility and Equivalence).
   - Applied for online through the *Diplome* portal with digital verification.
   - Rapidly processed (typically 15 to 30 days) and universally accepted by Italian universities without requiring in-person embassy attestation.

2. **Declaration of Value (*Dichiarazione di Valore in Loco* / DOV):**
   - Issued directly by the Italian Embassy in Islamabad or Italian Consulate in Karachi.
   - Requires physical submission of original BISE, IBCC, HEC, and MOFA attested certificates, accompanied by authorized Italian translations.
   - Can experience lengthy consular backlogs during peak summer months.$md$,
  'it', 'attestation', 'all', 'attestation', 'hec_attestation',
  'Comprehensive Guide to Italian Higher Education Admissions, Pre-Enrollment, and Student Visa Processing_ A Definitive Blueprint for Pakistani Applicants.md',
  'Section 2.2: Declaration of Value (DOV) vs. CIMEA Comparability Statement',
  'https://www.cimea.it',
  'verified', 'published', 1, NOW()
),

-- ROMANIA 1: Ministry Acceptance Letter (Scrisoare de Acceptare)
(
  'ro-ministry-acceptance-letter-scrisoare',
  'Romanian Ministry Acceptance Letter (Scrisoare de Acceptare la Studii)',
  'Mandatory statutory authorization required for university enrollment and Romanian student visa issuance.',
  $md$### The Scrisoare de Acceptare la Studii

Unlike most EU member states where university acceptance alone satisfies visa filing, Romanian higher education law mandates that all non-EU students obtain an official **Ministry Letter of Acceptance (*Scrisoare de Acceptare la Studii*)** issued directly by the Romanian Ministry of Education (*Ministerul Educației*).

### Workflow:
1. **University File Submission:** Submit your attested academic dossier, passport, medical certificate, and birth certificate to the target Romanian university (e.g. University of Bucharest, Technical University of Cluj-Napoca).
2. **University Endorsement:** The university reviews your qualifications and forwards your file to the Ministry in Bucharest.
3. **Ministry Issuance:** The Ministry verifies academic eligibility and issues the official *Scrisoare de Acceptare* containing your national registration code.
4. **Visa Lodging:** You must present the physical, original *Scrisoare de Acceptare* when lodging your Type D/SD visa at the Embassy of Romania in Islamabad.$md$,
  'ro', 'admissions', 'all', 'university_admissions', 'admission_offer',
  'Comprehensive Guide to Romanian University Admission and Student Visas for Pakistani Applicants.md',
  'Section 3: The Ministry of Education Acceptance Letter (Scrisoare de Acceptare)',
  'https://www.edu.ro',
  'verified', 'published', 1, NOW()
),

-- ROMANIA 2: Financial Solvency & Absence of Blocked Account
(
  'ro-financial-solvency-no-blocked-account',
  'Romanian Financial Proofs: Advance Tuition & Liquid Solvency',
  'Why Romania requires no offshore blocked bank account (€11,208+) and how Pakistani applicants satisfy consular solvency.',
  $md$### No Blocked Account (*Sperrkonto*) Requirement

A major strategic advantage of higher education in Romania is the **absence of a blocked account requirement**. Under Romanian statutory frameworks (Government Ordinance #22/2009):

- **Advance Tuition:** Self-sponsored non-EU students pay tuition for the first academic year in advance directly to the university's official bank account after receiving the Ministry Acceptance Letter.
- **Liquid Living Funds:** Subsistence funds (benchmarked at approximately **€2,500 to €3,500**) can be maintained in a regular, liquid Pakistani bank account (in the student's name or sponsored by parents) with 6 months of verified banking history.
- **Capital Liquidity:** Families retain financial operational liquidity without locking up €11,904 in an offshore escrow account.$md$,
  'ro', 'blocked_account', 'all', 'financial_proof', 'blocked_account_proof',
  'Comprehensive Guide to Romanian University Admission and Student Visas for Pakistani Applicants.md',
  'Section 1 & 5: Capital Outlay Comparison & Embassy of Romania Visa Execution',
  'https://mae.ro',
  'verified', 'published', 1, NOW()
)
ON CONFLICT (slug) DO NOTHING;


-- 8. Role Grants for Authenticated and Anonymous Users
GRANT SELECT ON public.help_articles TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.help_articles TO authenticated;

GRANT EXECUTE ON FUNCTION public.search_published_help_articles TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_contextual_help_item TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.manage_help_article_editorial TO authenticated;
