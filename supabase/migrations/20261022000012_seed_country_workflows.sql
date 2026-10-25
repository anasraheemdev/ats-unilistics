-- ============================================================================
-- Migration 012: Seed Grounded Candidate Draft Workflows for DE, FR, IT, RO
-- Product: Unilistics (ATS for European Higher Education)
-- Invariant: Workflows are explicitly DRAFT and UNREVIEWED.
-- No statutory claims of official legal advice; flagged claims carry review tags.
-- Idempotent: Can be run multiple times safely via ON CONFLICT DO UPDATE.
-- ============================================================================

DO $$
DECLARE
  v_tpl_id UUID;
  v_ver_id UUID;
  v_step_attest UUID;
  v_step_submit UUID;
  v_step_decision UUID;
  v_step_prep1 UUID;
  v_step_prep2 UUID;
  v_step_visa UUID;
BEGIN
  -- Ensure baseline supported countries exist in countries table
  INSERT INTO public.countries (code, name, visa_authority, is_active, publication_status) VALUES
    ('de', 'Germany', 'German Embassy Islamabad', true, 'published'),
    ('fr', 'France', 'Campus France / French Consulate', true, 'published'),
    ('it', 'Italy', 'Italian Embassy Islamabad', true, 'published'),
    ('ro', 'Romania', 'Romanian Embassy Islamabad', true, 'published')
  ON CONFLICT (code) DO UPDATE SET is_active = true, publication_status = 'published';

  -- ===========================================================================
  -- 1. GERMANY: Master's via Uni-Assist Route
  -- ===========================================================================
  INSERT INTO public.workflow_templates (
    country_code,
    degree_level,
    application_route,
    jurisdiction,
    name,
    description,
    publication_status,
    review_status,
    source_file,
    source_section,
    provenance
  ) VALUES (
    'de',
    'masters',
    'uni_assist',
    'any',
    'Germany Master''s Degree (Uni-Assist Route)',
    'Candidate procedural workflow for applicants using the centralized Uni-Assist evaluation portal, followed by conditional admission, blocked account, and consular visa processing.',
    'draft',
    'unreviewed',
    'Complete German University Admission and Student Visa Guide for Pakistani Applicants_ Comprehensive Bachelor’s & Master’s Roadmap.md',
    'Uni-Assist vs. Direct Portals & Pakistani Document Attestation',
    jsonb_build_object(
      'source_guide', 'complete_application_procedures/Complete German University Admission and Student Visa Guide for Pakistani Applicants_ Comprehensive Bachelor’s & Master’s Roadmap.md',
      'verification_flags', ARRAY['FLAG-001', 'FLAG-002', 'FLAG-003'],
      'notes', 'Blocked account benchmarks and visa waitlist lengths require annual official verification.'
    )
  )
  ON CONFLICT (country_code, degree_level, application_route, jurisdiction)
  DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    source_file = EXCLUDED.source_file,
    source_section = EXCLUDED.source_section,
    provenance = EXCLUDED.provenance
  RETURNING id INTO v_tpl_id;

  -- Version 1
  INSERT INTO public.workflow_versions (
    template_id,
    version_number,
    is_active,
    publication_status,
    change_summary
  ) VALUES (
    v_tpl_id,
    1,
    true,
    'draft',
    'Initial grounded draft candidate route extracted from German admission guide.'
  )
  ON CONFLICT (template_id, version_number)
  DO UPDATE SET change_summary = EXCLUDED.change_summary
  RETURNING id INTO v_ver_id;

  -- Steps
  INSERT INTO public.workflow_steps (version_id, step_key, title, description, stage, sort_order, instructions, responsible_actor, required_evidence, is_parallel, verification_flags, target_outcome_type)
  VALUES (v_ver_id, 'de_ua_attestation', 'HEC & MOFA Document Attestation', 'Complete university controller verification, HEC QR stamping, and Ministry of Foreign Affairs authentication on degree and transcripts.', 'attestation', 10, 'Submit original degree and transcripts to HEC portal, followed by in-person MOFA attestation.', 'student', ARRAY['hec_attested_degree', 'mofa_authenticated_transcripts'], false, ARRAY['FLAG-012'], 'attestation')
  ON CONFLICT (version_id, step_key) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    stage = EXCLUDED.stage,
    sort_order = EXCLUDED.sort_order,
    instructions = EXCLUDED.instructions,
    responsible_actor = EXCLUDED.responsible_actor,
    required_evidence = EXCLUDED.required_evidence,
    is_parallel = EXCLUDED.is_parallel,
    verification_flags = EXCLUDED.verification_flags,
    target_outcome_type = EXCLUDED.target_outcome_type
  RETURNING id INTO v_step_attest;

  INSERT INTO public.workflow_steps (version_id, step_key, title, description, stage, sort_order, instructions, responsible_actor, required_evidence, is_parallel, verification_flags, target_outcome_type)
  VALUES (v_ver_id, 'de_ua_submission', 'Uni-Assist Application & Fee Payment', 'Assemble certified copies, upload academic dossier to Uni-Assist portal, and submit administrative handling fee.', 'submission', 20, 'Submit application fee (€75 first choice, €30 subsequent). Verification Flag: Uni-Assist fee schedules are subject to change.', 'counsellor', ARRAY['uniassist_fee_receipt', 'uniassist_application_pdf'], false, ARRAY['FLAG-003'], 'academic_admission')
  ON CONFLICT (version_id, step_key) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    stage = EXCLUDED.stage,
    sort_order = EXCLUDED.sort_order,
    instructions = EXCLUDED.instructions,
    responsible_actor = EXCLUDED.responsible_actor,
    required_evidence = EXCLUDED.required_evidence,
    is_parallel = EXCLUDED.is_parallel,
    verification_flags = EXCLUDED.verification_flags,
    target_outcome_type = EXCLUDED.target_outcome_type
  RETURNING id INTO v_step_submit;

  INSERT INTO public.workflow_steps (version_id, step_key, title, description, stage, sort_order, instructions, responsible_actor, required_evidence, is_parallel, verification_flags, target_outcome_type)
  VALUES (v_ver_id, 'de_ua_decision', 'University Admission Offer & Enrollment Conditions', 'Receive departmental evaluation result and conditional/unconditional admission letter (Zulassungsbescheid).', 'decision', 30, 'Review offer conditions (language proof, preliminary ECTS credit validations).', 'counsellor', ARRAY['university_admission_letter'], false, '{}'::text[], 'academic_admission')
  ON CONFLICT (version_id, step_key) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    stage = EXCLUDED.stage,
    sort_order = EXCLUDED.sort_order,
    instructions = EXCLUDED.instructions,
    responsible_actor = EXCLUDED.responsible_actor,
    required_evidence = EXCLUDED.required_evidence,
    is_parallel = EXCLUDED.is_parallel,
    verification_flags = EXCLUDED.verification_flags,
    target_outcome_type = EXCLUDED.target_outcome_type
  RETURNING id INTO v_step_decision;

  INSERT INTO public.workflow_steps (version_id, step_key, title, description, stage, sort_order, instructions, responsible_actor, required_evidence, is_parallel, verification_flags, target_outcome_type)
  VALUES (v_ver_id, 'de_ua_blocked_account', 'German Blocked Account (Sperrkonto)', 'Open and fund an approved German blocked account (e.g. Coracle, Expatrio, Fintiba). Parallel with health insurance.', 'visa_prep', 40, 'Deposit statutory subsistence proof (historical benchmark: ~€11,208 to €11,904). Verification Flag: statutory BAföG benchmark changes annually.', 'student', ARRAY['sperrkonto_confirmation_document'], true, ARRAY['FLAG-001'], 'visa_processing')
  ON CONFLICT (version_id, step_key) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    stage = EXCLUDED.stage,
    sort_order = EXCLUDED.sort_order,
    instructions = EXCLUDED.instructions,
    responsible_actor = EXCLUDED.responsible_actor,
    required_evidence = EXCLUDED.required_evidence,
    is_parallel = EXCLUDED.is_parallel,
    verification_flags = EXCLUDED.verification_flags,
    target_outcome_type = EXCLUDED.target_outcome_type
  RETURNING id INTO v_step_prep1;

  INSERT INTO public.workflow_steps (version_id, step_key, title, description, stage, sort_order, instructions, responsible_actor, required_evidence, is_parallel, verification_flags, target_outcome_type)
  VALUES (v_ver_id, 'de_ua_health_insurance', 'Statutory / Travel Health Insurance', 'Obtain German statutory health insurance (TK, Barmer, AOK) or incoming Schengen travel insurance policy.', 'visa_prep', 50, 'Procure mandatory health insurance covering minimum €30,000 emergency care prior to visa submission.', 'student', ARRAY['health_insurance_certificate'], true, '{}'::text[], 'visa_processing')
  ON CONFLICT (version_id, step_key) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    stage = EXCLUDED.stage,
    sort_order = EXCLUDED.sort_order,
    instructions = EXCLUDED.instructions,
    responsible_actor = EXCLUDED.responsible_actor,
    required_evidence = EXCLUDED.required_evidence,
    is_parallel = EXCLUDED.is_parallel,
    verification_flags = EXCLUDED.verification_flags,
    target_outcome_type = EXCLUDED.target_outcome_type
  RETURNING id INTO v_step_prep2;

  INSERT INTO public.workflow_steps (version_id, step_key, title, description, stage, sort_order, instructions, responsible_actor, required_evidence, is_parallel, verification_flags, target_outcome_type)
  VALUES (v_ver_id, 'de_ua_visa_filing', 'National Student Visa Filing & Biometrics', 'Register on German Embassy waitlist (Islamabad/Karachi), attend in-person biometric appointment, and submit consular file.', 'visa_prep', 60, 'Attend interview with complete dossier. Verification Flag: waitlist queue times fluctuate seasonally.', 'student', ARRAY['visa_application_submission_receipt'], false, ARRAY['FLAG-002'], 'visa_processing')
  ON CONFLICT (version_id, step_key) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    stage = EXCLUDED.stage,
    sort_order = EXCLUDED.sort_order,
    instructions = EXCLUDED.instructions,
    responsible_actor = EXCLUDED.responsible_actor,
    required_evidence = EXCLUDED.required_evidence,
    is_parallel = EXCLUDED.is_parallel,
    verification_flags = EXCLUDED.verification_flags,
    target_outcome_type = EXCLUDED.target_outcome_type
  RETURNING id INTO v_step_visa;

  -- Dependencies
  INSERT INTO public.workflow_dependencies (step_id, depends_on_step_id) VALUES (v_step_submit, v_step_attest) ON CONFLICT (step_id, depends_on_step_id) DO NOTHING;
  INSERT INTO public.workflow_dependencies (step_id, depends_on_step_id) VALUES (v_step_decision, v_step_submit) ON CONFLICT (step_id, depends_on_step_id) DO NOTHING;
  INSERT INTO public.workflow_dependencies (step_id, depends_on_step_id) VALUES (v_step_prep1, v_step_decision) ON CONFLICT (step_id, depends_on_step_id) DO NOTHING;
  INSERT INTO public.workflow_dependencies (step_id, depends_on_step_id) VALUES (v_step_prep2, v_step_decision) ON CONFLICT (step_id, depends_on_step_id) DO NOTHING;
  INSERT INTO public.workflow_dependencies (step_id, depends_on_step_id) VALUES (v_step_visa, v_step_prep1) ON CONFLICT (step_id, depends_on_step_id) DO NOTHING;
  INSERT INTO public.workflow_dependencies (step_id, depends_on_step_id) VALUES (v_step_visa, v_step_prep2) ON CONFLICT (step_id, depends_on_step_id) DO NOTHING;


  -- ===========================================================================
  -- 2. ITALY: Master's via Universitaly with CIMEA Route
  -- ===========================================================================
  INSERT INTO public.workflow_templates (
    country_code,
    degree_level,
    application_route,
    jurisdiction,
    name,
    description,
    publication_status,
    review_status,
    source_file,
    source_section,
    provenance
  ) VALUES (
    'it',
    'masters',
    'universitaly_cimea',
    'any',
    'Italy Master''s Degree (Universitaly & CIMEA Route)',
    'Candidate procedural workflow for Italian university admission, CIMEA Statement of Comparability, Universitaly pre-enrollment validation, parallel DSU scholarship, and National Visa Type D.',
    'draft',
    'unreviewed',
    'Comprehensive Guide to Italian Higher Education Admissions, Pre-Enrollment, and Student Visa Processing_ A Definitive Blueprint for Pakistani Applicants.md',
    'Centralized Pre-Enrollment & Credential Validation',
    jsonb_build_object(
      'source_guide', 'complete_application_procedures/Comprehensive Guide to Italian Higher Education Admissions, Pre-Enrollment, and Student Visa Processing_ A Definitive Blueprint for Pakistani Applicants.md',
      'verification_flags', ARRAY['FLAG-007', 'FLAG-008', 'FLAG-009'],
      'notes', 'Universitaly circular deadlines, CIMEA fees, and 3-year FBR sponsor tax mandates require official review.'
    )
  )
  ON CONFLICT (country_code, degree_level, application_route, jurisdiction)
  DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    source_file = EXCLUDED.source_file,
    source_section = EXCLUDED.source_section,
    provenance = EXCLUDED.provenance
  RETURNING id INTO v_tpl_id;

  INSERT INTO public.workflow_versions (
    template_id,
    version_number,
    is_active,
    publication_status,
    change_summary
  ) VALUES (
    v_tpl_id,
    1,
    true,
    'draft',
    'Initial grounded draft candidate route for Italy Master''s degree.'
  )
  ON CONFLICT (template_id, version_number)
  DO UPDATE SET change_summary = EXCLUDED.change_summary
  RETURNING id INTO v_ver_id;

  INSERT INTO public.workflow_steps (version_id, step_key, title, description, stage, sort_order, instructions, responsible_actor, required_evidence, is_parallel, verification_flags, target_outcome_type)
  VALUES (v_ver_id, 'it_attestation', 'Pakistani Attestation & Sworn Italian Translation', 'Attest degrees and transcripts via HEC and MOFA; obtain certified translation from embassy-recognized sworn translator.', 'attestation', 10, 'Apostille / attest all academic documents and translate into Italian.', 'student', ARRAY['mofa_attested_degree', 'italian_sworn_translation'], false, ARRAY['FLAG-012'], 'attestation')
  ON CONFLICT (version_id, step_key) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    stage = EXCLUDED.stage,
    sort_order = EXCLUDED.sort_order,
    instructions = EXCLUDED.instructions,
    responsible_actor = EXCLUDED.responsible_actor,
    required_evidence = EXCLUDED.required_evidence,
    is_parallel = EXCLUDED.is_parallel,
    verification_flags = EXCLUDED.verification_flags,
    target_outcome_type = EXCLUDED.target_outcome_type
  RETURNING id INTO v_step_attest;

  INSERT INTO public.workflow_steps (version_id, step_key, title, description, stage, sort_order, instructions, responsible_actor, required_evidence, is_parallel, verification_flags, target_outcome_type)
  VALUES (v_ver_id, 'it_uni_admission', 'University Departmental Admission', 'Submit departmental application to target Italian university portal; receive formal academic acceptance letter.', 'submission', 20, 'Direct university review based on syllabus alignment and minimum GPA.', 'counsellor', ARRAY['italian_university_acceptance_letter'], false, '{}'::text[], 'academic_admission')
  ON CONFLICT (version_id, step_key) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    stage = EXCLUDED.stage,
    sort_order = EXCLUDED.sort_order,
    instructions = EXCLUDED.instructions,
    responsible_actor = EXCLUDED.responsible_actor,
    required_evidence = EXCLUDED.required_evidence,
    is_parallel = EXCLUDED.is_parallel,
    verification_flags = EXCLUDED.verification_flags,
    target_outcome_type = EXCLUDED.target_outcome_type
  RETURNING id INTO v_step_submit;

  INSERT INTO public.workflow_steps (version_id, step_key, title, description, stage, sort_order, instructions, responsible_actor, required_evidence, is_parallel, verification_flags, target_outcome_type)
  VALUES (v_ver_id, 'it_cimea_validation', 'CIMEA Statements of Comparability & Verification', 'File online CIMEA DiploMe request for Statements of Comparability and Verification. Runs in parallel with Universitaly setup.', 'attestation', 30, 'Request official comparability certificate. Verification Flag: verify whether target university accepts CIMEA in lieu of DOV.', 'student', ARRAY['cimea_comparability_certificate'], true, ARRAY['FLAG-008'], 'academic_admission')
  ON CONFLICT (version_id, step_key) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    stage = EXCLUDED.stage,
    sort_order = EXCLUDED.sort_order,
    instructions = EXCLUDED.instructions,
    responsible_actor = EXCLUDED.responsible_actor,
    required_evidence = EXCLUDED.required_evidence,
    is_parallel = EXCLUDED.is_parallel,
    verification_flags = EXCLUDED.verification_flags,
    target_outcome_type = EXCLUDED.target_outcome_type
  RETURNING id INTO v_step_prep1;

  INSERT INTO public.workflow_steps (version_id, step_key, title, description, stage, sort_order, instructions, responsible_actor, required_evidence, is_parallel, verification_flags, target_outcome_type)
  VALUES (v_ver_id, 'it_universitaly_pre_enrollment', 'Universitaly Pre-Enrollment Submission', 'Submit pre-enrollment application on universitaly.it with target program and university acceptance letter.', 'submission', 40, 'University and consular validation on Universitaly portal. Verification Flag: annual MUR pre-enrollment deadlines shift.', 'counsellor', ARRAY['universitaly_summary_pdf'], false, ARRAY['FLAG-007'], 'academic_admission')
  ON CONFLICT (version_id, step_key) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    stage = EXCLUDED.stage,
    sort_order = EXCLUDED.sort_order,
    instructions = EXCLUDED.instructions,
    responsible_actor = EXCLUDED.responsible_actor,
    required_evidence = EXCLUDED.required_evidence,
    is_parallel = EXCLUDED.is_parallel,
    verification_flags = EXCLUDED.verification_flags,
    target_outcome_type = EXCLUDED.target_outcome_type
  RETURNING id INTO v_step_decision;

  INSERT INTO public.workflow_steps (version_id, step_key, title, description, stage, sort_order, instructions, responsible_actor, required_evidence, is_parallel, verification_flags, target_outcome_type)
  VALUES (v_ver_id, 'it_dsu_scholarship', 'Regional Need-Based Scholarship (DSU / ER.GO)', 'Assemble family income certificate, FRC, and file ISEE-Parificato calculation for regional tuition waiver and stipend.', 'submission', 45, 'Runs in parallel with pre-enrollment and does not block university admission or visa filing.', 'student', ARRAY['dsu_scholarship_application_receipt'], true, '{}'::text[], 'scholarship')
  ON CONFLICT (version_id, step_key) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    stage = EXCLUDED.stage,
    sort_order = EXCLUDED.sort_order,
    instructions = EXCLUDED.instructions,
    responsible_actor = EXCLUDED.responsible_actor,
    required_evidence = EXCLUDED.required_evidence,
    is_parallel = EXCLUDED.is_parallel,
    verification_flags = EXCLUDED.verification_flags,
    target_outcome_type = EXCLUDED.target_outcome_type
  RETURNING id INTO v_step_prep2;

  INSERT INTO public.workflow_steps (version_id, step_key, title, description, stage, sort_order, instructions, responsible_actor, required_evidence, is_parallel, verification_flags, target_outcome_type)
  VALUES (v_ver_id, 'it_visa_filing', 'National Visa Type D (Studio) Submission', 'Assemble validated Universitaly summary, 3 consecutive years sponsor FBR tax returns, 6-month bank statement, and submit at Gerry''s/VFS.', 'visa_prep', 50, 'Submit consular file to Italian Embassy Islamabad or Consulate Karachi. Verification Flag: strict financial sponsor tax documentation.', 'student', ARRAY['visa_application_file_receipt'], false, ARRAY['FLAG-009'], 'visa_processing')
  ON CONFLICT (version_id, step_key) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    stage = EXCLUDED.stage,
    sort_order = EXCLUDED.sort_order,
    instructions = EXCLUDED.instructions,
    responsible_actor = EXCLUDED.responsible_actor,
    required_evidence = EXCLUDED.required_evidence,
    is_parallel = EXCLUDED.is_parallel,
    verification_flags = EXCLUDED.verification_flags,
    target_outcome_type = EXCLUDED.target_outcome_type
  RETURNING id INTO v_step_visa;

  INSERT INTO public.workflow_dependencies (step_id, depends_on_step_id) VALUES (v_step_submit, v_step_attest) ON CONFLICT (step_id, depends_on_step_id) DO NOTHING;
  INSERT INTO public.workflow_dependencies (step_id, depends_on_step_id) VALUES (v_step_prep1, v_step_submit) ON CONFLICT (step_id, depends_on_step_id) DO NOTHING;
  INSERT INTO public.workflow_dependencies (step_id, depends_on_step_id) VALUES (v_step_decision, v_step_submit) ON CONFLICT (step_id, depends_on_step_id) DO NOTHING;
  INSERT INTO public.workflow_dependencies (step_id, depends_on_step_id) VALUES (v_step_prep2, v_step_decision) ON CONFLICT (step_id, depends_on_step_id) DO NOTHING;
  INSERT INTO public.workflow_dependencies (step_id, depends_on_step_id) VALUES (v_step_visa, v_step_decision) ON CONFLICT (step_id, depends_on_step_id) DO NOTHING;
  INSERT INTO public.workflow_dependencies (step_id, depends_on_step_id) VALUES (v_step_visa, v_step_prep1) ON CONFLICT (step_id, depends_on_step_id) DO NOTHING;


  -- ===========================================================================
  -- 3. FRANCE: Master's via Études en France (EeF) Route
  -- ===========================================================================
  INSERT INTO public.workflow_templates (
    country_code,
    degree_level,
    application_route,
    jurisdiction,
    name,
    description,
    publication_status,
    review_status,
    source_file,
    source_section,
    provenance
  ) VALUES (
    'fr',
    'masters',
    'etudes_en_france_public',
    'any',
    'France Master''s Degree (Études en France Route)',
    'Candidate procedural workflow for applicants using the centralized Campus France Études en France (EeF) platform, academic interview, and VLS-TS visa.',
    'draft',
    'unreviewed',
    'Comprehensive Guide to French University Admission and Student Visas for Pakistani Applicants.md',
    'The Études en France (EeF) & Campus France Mechanism',
    jsonb_build_object(
      'source_guide', 'complete_application_procedures/Comprehensive Guide to French University Admission and Student Visas for Pakistani Applicants.md',
      'verification_flags', ARRAY['FLAG-004', 'FLAG-005', 'FLAG-006'],
      'notes', 'EeF campaign dates, localized PKR fees, and public university tuition fee waivers require verified review.'
    )
  )
  ON CONFLICT (country_code, degree_level, application_route, jurisdiction)
  DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    source_file = EXCLUDED.source_file,
    source_section = EXCLUDED.source_section,
    provenance = EXCLUDED.provenance
  RETURNING id INTO v_tpl_id;

  INSERT INTO public.workflow_versions (
    template_id,
    version_number,
    is_active,
    publication_status,
    change_summary
  ) VALUES (
    v_tpl_id,
    1,
    true,
    'draft',
    'Initial grounded draft candidate route for France Master''s degree.'
  )
  ON CONFLICT (template_id, version_number)
  DO UPDATE SET change_summary = EXCLUDED.change_summary
  RETURNING id INTO v_ver_id;

  INSERT INTO public.workflow_steps (version_id, step_key, title, description, stage, sort_order, instructions, responsible_actor, required_evidence, is_parallel, verification_flags, target_outcome_type)
  VALUES (v_ver_id, 'fr_translation', 'Academic Translation via Alliance Française', 'Obtain certified French translation of degrees and transcripts from Alliance Française in Pakistan.', 'attestation', 10, 'Alliance Française certified translation is recognized by Campus France Pakistan.', 'student', ARRAY['alliance_francaise_translation'], false, '{}'::text[], 'attestation')
  ON CONFLICT (version_id, step_key) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    stage = EXCLUDED.stage,
    sort_order = EXCLUDED.sort_order,
    instructions = EXCLUDED.instructions,
    responsible_actor = EXCLUDED.responsible_actor,
    required_evidence = EXCLUDED.required_evidence,
    is_parallel = EXCLUDED.is_parallel,
    verification_flags = EXCLUDED.verification_flags,
    target_outcome_type = EXCLUDED.target_outcome_type
  RETURNING id INTO v_step_attest;

  INSERT INTO public.workflow_steps (version_id, step_key, title, description, stage, sort_order, instructions, responsible_actor, required_evidence, is_parallel, verification_flags, target_outcome_type)
  VALUES (v_ver_id, 'fr_eef_dossier', 'Études en France (EeF) Online Application', 'Assemble electronic dossier with up to 7 public university choices and pay local campaign fee.', 'submission', 20, 'Submit dossier within annual campaign window. Verification Flag: campaign deadlines shift annually.', 'counsellor', ARRAY['eef_dossier_number_receipt'], false, ARRAY['FLAG-005'], 'academic_admission')
  ON CONFLICT (version_id, step_key) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    stage = EXCLUDED.stage,
    sort_order = EXCLUDED.sort_order,
    instructions = EXCLUDED.instructions,
    responsible_actor = EXCLUDED.responsible_actor,
    required_evidence = EXCLUDED.required_evidence,
    is_parallel = EXCLUDED.is_parallel,
    verification_flags = EXCLUDED.verification_flags,
    target_outcome_type = EXCLUDED.target_outcome_type
  RETURNING id INTO v_step_submit;

  INSERT INTO public.workflow_steps (version_id, step_key, title, description, stage, sort_order, instructions, responsible_actor, required_evidence, is_parallel, verification_flags, target_outcome_type)
  VALUES (v_ver_id, 'fr_campus_interview', 'Campus France In-Person Academic Interview', 'Attend pre-consular interview at Campus France center (Islamabad, Lahore, or Karachi).', 'submission', 30, 'Present original attested transcripts, language certificates, and statement of intent.', 'student', ARRAY['campus_france_interview_certificate'], false, '{}'::text[], 'academic_admission')
  ON CONFLICT (version_id, step_key) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    stage = EXCLUDED.stage,
    sort_order = EXCLUDED.sort_order,
    instructions = EXCLUDED.instructions,
    responsible_actor = EXCLUDED.responsible_actor,
    required_evidence = EXCLUDED.required_evidence,
    is_parallel = EXCLUDED.is_parallel,
    verification_flags = EXCLUDED.verification_flags,
    target_outcome_type = EXCLUDED.target_outcome_type
  RETURNING id INTO v_step_decision;

  INSERT INTO public.workflow_steps (version_id, step_key, title, description, stage, sort_order, instructions, responsible_actor, required_evidence, is_parallel, verification_flags, target_outcome_type)
  VALUES (v_ver_id, 'fr_financial_solvency', 'French Living Expense Proof (Bank / Prise en Charge)', 'Assemble 6-month bank statements demonstrating living expense threshold (~€615/mo) or French guarantor affidavit.', 'visa_prep', 40, 'Verification Flag: confirm minimum liquid reserve threshold for target city/institution.', 'student', ARRAY['financial_solvency_proof'], true, ARRAY['FLAG-004'], 'visa_processing')
  ON CONFLICT (version_id, step_key) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    stage = EXCLUDED.stage,
    sort_order = EXCLUDED.sort_order,
    instructions = EXCLUDED.instructions,
    responsible_actor = EXCLUDED.responsible_actor,
    required_evidence = EXCLUDED.required_evidence,
    is_parallel = EXCLUDED.is_parallel,
    verification_flags = EXCLUDED.verification_flags,
    target_outcome_type = EXCLUDED.target_outcome_type
  RETURNING id INTO v_step_prep1;

  INSERT INTO public.workflow_steps (version_id, step_key, title, description, stage, sort_order, instructions, responsible_actor, required_evidence, is_parallel, verification_flags, target_outcome_type)
  VALUES (v_ver_id, 'fr_vls_ts_visa', 'France-Visas Filing & VFS Biometrics', 'Complete online application on France-Visas portal, schedule biometric submission at VFS Global, and submit passport.', 'visa_prep', 50, 'File for Long-Stay Visa (VLS-TS). Target outcome is consular visa processing.', 'student', ARRAY['vfs_visa_submission_receipt'], false, '{}'::text[], 'visa_processing')
  ON CONFLICT (version_id, step_key) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    stage = EXCLUDED.stage,
    sort_order = EXCLUDED.sort_order,
    instructions = EXCLUDED.instructions,
    responsible_actor = EXCLUDED.responsible_actor,
    required_evidence = EXCLUDED.required_evidence,
    is_parallel = EXCLUDED.is_parallel,
    verification_flags = EXCLUDED.verification_flags,
    target_outcome_type = EXCLUDED.target_outcome_type
  RETURNING id INTO v_step_visa;

  INSERT INTO public.workflow_dependencies (step_id, depends_on_step_id) VALUES (v_step_submit, v_step_attest) ON CONFLICT (step_id, depends_on_step_id) DO NOTHING;
  INSERT INTO public.workflow_dependencies (step_id, depends_on_step_id) VALUES (v_step_decision, v_step_submit) ON CONFLICT (step_id, depends_on_step_id) DO NOTHING;
  INSERT INTO public.workflow_dependencies (step_id, depends_on_step_id) VALUES (v_step_prep1, v_step_decision) ON CONFLICT (step_id, depends_on_step_id) DO NOTHING;
  INSERT INTO public.workflow_dependencies (step_id, depends_on_step_id) VALUES (v_step_visa, v_step_decision) ON CONFLICT (step_id, depends_on_step_id) DO NOTHING;
  INSERT INTO public.workflow_dependencies (step_id, depends_on_step_id) VALUES (v_step_visa, v_step_prep1) ON CONFLICT (step_id, depends_on_step_id) DO NOTHING;


  -- ===========================================================================
  -- 4. ROMANIA: Dual-Stage Ministry of Education Acceptance Route
  -- ===========================================================================
  INSERT INTO public.workflow_templates (
    country_code,
    degree_level,
    application_route,
    jurisdiction,
    name,
    description,
    publication_status,
    review_status,
    source_file,
    source_section,
    provenance
  ) VALUES (
    'ro',
    'masters',
    'dual_stage_ministry',
    'any',
    'Romania Master''s Degree (Dual-Stage Ministry Route)',
    'Candidate procedural workflow for dual-stage validation: university evaluation, Romanian Ministry of Education Acceptance Letter, advance SWIFT tuition payment, and eViza consular filing.',
    'draft',
    'unreviewed',
    'Comprehensive Guide to Romanian University Admission and Student Visas for Pakistani Applicants.md',
    'Dual-Stage Statutory Admission Mechanism & Advance Tuition Payment',
    jsonb_build_object(
      'source_guide', 'complete_application_procedures/Comprehensive Guide to Romanian University Admission and Student Visas for Pakistani Applicants.md',
      'verification_flags', ARRAY['FLAG-010', 'FLAG-011', 'FLAG-012'],
      'notes', 'Advance tuition wire refund rules and gross minimum wage solvency formula require official review.'
    )
  )
  ON CONFLICT (country_code, degree_level, application_route, jurisdiction)
  DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    source_file = EXCLUDED.source_file,
    source_section = EXCLUDED.source_section,
    provenance = EXCLUDED.provenance
  RETURNING id INTO v_tpl_id;

  INSERT INTO public.workflow_versions (
    template_id,
    version_number,
    is_active,
    publication_status,
    change_summary
  ) VALUES (
    v_tpl_id,
    1,
    true,
    'draft',
    'Initial grounded draft candidate route for Romania Master''s degree.'
  )
  ON CONFLICT (template_id, version_number)
  DO UPDATE SET change_summary = EXCLUDED.change_summary
  RETURNING id INTO v_ver_id;

  INSERT INTO public.workflow_steps (version_id, step_key, title, description, stage, sort_order, instructions, responsible_actor, required_evidence, is_parallel, verification_flags, target_outcome_type)
  VALUES (v_ver_id, 'ro_attestation_notary', 'Academic Attestation & Romanian Translation', 'Attest degrees and transcripts via HEC and MOFA; obtain certified Romanian translation and notary certification.', 'attestation', 10, 'Complete primary domestic attestation pipeline.', 'student', ARRAY['hec_mofa_attested_degrees', 'romanian_notarized_translation'], false, ARRAY['FLAG-012'], 'attestation')
  ON CONFLICT (version_id, step_key) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    stage = EXCLUDED.stage,
    sort_order = EXCLUDED.sort_order,
    instructions = EXCLUDED.instructions,
    responsible_actor = EXCLUDED.responsible_actor,
    required_evidence = EXCLUDED.required_evidence,
    is_parallel = EXCLUDED.is_parallel,
    verification_flags = EXCLUDED.verification_flags,
    target_outcome_type = EXCLUDED.target_outcome_type
  RETURNING id INTO v_step_attest;

  INSERT INTO public.workflow_steps (version_id, step_key, title, description, stage, sort_order, instructions, responsible_actor, required_evidence, is_parallel, verification_flags, target_outcome_type)
  VALUES (v_ver_id, 'ro_uni_review', 'Institutional University Review', 'University international office verifies eligibility and issues conditional departmental clearance.', 'submission', 20, 'University department evaluates module alignment and issues preliminary clearance.', 'counsellor', ARRAY['university_conditional_clearance'], false, '{}'::text[], 'academic_admission')
  ON CONFLICT (version_id, step_key) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    stage = EXCLUDED.stage,
    sort_order = EXCLUDED.sort_order,
    instructions = EXCLUDED.instructions,
    responsible_actor = EXCLUDED.responsible_actor,
    required_evidence = EXCLUDED.required_evidence,
    is_parallel = EXCLUDED.is_parallel,
    verification_flags = EXCLUDED.verification_flags,
    target_outcome_type = EXCLUDED.target_outcome_type
  RETURNING id INTO v_step_submit;

  INSERT INTO public.workflow_steps (version_id, step_key, title, description, stage, sort_order, instructions, responsible_actor, required_evidence, is_parallel, verification_flags, target_outcome_type)
  VALUES (v_ver_id, 'ro_ministry_acceptance', 'Ministry of Education Acceptance Letter (Scrisoare de Acceptare)', 'University transmits dossier to Ministerul Educației for statutory degree equivalence. Official Acceptance Letter issued.', 'decision', 30, 'Mandatory statutory document legally required for Romanian student visa.', 'external_authority', ARRAY['ministry_acceptance_letter_pdf'], false, ARRAY['FLAG-010'], 'academic_admission')
  ON CONFLICT (version_id, step_key) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    stage = EXCLUDED.stage,
    sort_order = EXCLUDED.sort_order,
    instructions = EXCLUDED.instructions,
    responsible_actor = EXCLUDED.responsible_actor,
    required_evidence = EXCLUDED.required_evidence,
    is_parallel = EXCLUDED.is_parallel,
    verification_flags = EXCLUDED.verification_flags,
    target_outcome_type = EXCLUDED.target_outcome_type
  RETURNING id INTO v_step_decision;

  INSERT INTO public.workflow_steps (version_id, step_key, title, description, stage, sort_order, instructions, responsible_actor, required_evidence, is_parallel, verification_flags, target_outcome_type)
  VALUES (v_ver_id, 'ro_tuition_swift_wire', 'Advance First-Year Tuition SWIFT Payment', 'Remit full first-year tuition fee directly to university bank account via international SWIFT transfer.', 'decision', 40, 'University issues official fee payment receipt upon funds clearance. Verification Flag: confirm institutional refund terms upon visa refusal.', 'student', ARRAY['swift_wire_transfer_receipt', 'university_tuition_receipt'], false, ARRAY['FLAG-011'], 'academic_admission')
  ON CONFLICT (version_id, step_key) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    stage = EXCLUDED.stage,
    sort_order = EXCLUDED.sort_order,
    instructions = EXCLUDED.instructions,
    responsible_actor = EXCLUDED.responsible_actor,
    required_evidence = EXCLUDED.required_evidence,
    is_parallel = EXCLUDED.is_parallel,
    verification_flags = EXCLUDED.verification_flags,
    target_outcome_type = EXCLUDED.target_outcome_type
  RETURNING id INTO v_step_prep1;

  INSERT INTO public.workflow_steps (version_id, step_key, title, description, stage, sort_order, instructions, responsible_actor, required_evidence, is_parallel, verification_flags, target_outcome_type)
  VALUES (v_ver_id, 'ro_eviza_submission', 'eViza Online Electronic Portal Submission', 'Upload Ministry Acceptance Letter, SWIFT receipt, police certificate, and bank solvency to eviza.mae.ro.', 'visa_prep', 50, 'Online pre-validation by Romanian consular authorities before scheduling embassy appointment.', 'counsellor', ARRAY['eviza_application_dossier_pdf'], false, '{}'::text[], 'visa_processing')
  ON CONFLICT (version_id, step_key) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    stage = EXCLUDED.stage,
    sort_order = EXCLUDED.sort_order,
    instructions = EXCLUDED.instructions,
    responsible_actor = EXCLUDED.responsible_actor,
    required_evidence = EXCLUDED.required_evidence,
    is_parallel = EXCLUDED.is_parallel,
    verification_flags = EXCLUDED.verification_flags,
    target_outcome_type = EXCLUDED.target_outcome_type
  RETURNING id INTO v_step_prep2;

  INSERT INTO public.workflow_steps (version_id, step_key, title, description, stage, sort_order, instructions, responsible_actor, required_evidence, is_parallel, verification_flags, target_outcome_type)
  VALUES (v_ver_id, 'ro_embassy_interview_islamabad', 'Consular Biometrics & File Submission (Islamabad)', 'Attend in-person appointment at Embassy of Romania in Islamabad, submit physical file, and complete biometric interview.', 'visa_prep', 60, 'Long-Stay Student Visa (D/SD). Verification Flag: bank statement formula tied to Romanian gross minimum wage.', 'student', ARRAY['romanian_embassy_submission_receipt'], false, ARRAY['FLAG-010'], 'visa_processing')
  ON CONFLICT (version_id, step_key) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    stage = EXCLUDED.stage,
    sort_order = EXCLUDED.sort_order,
    instructions = EXCLUDED.instructions,
    responsible_actor = EXCLUDED.responsible_actor,
    required_evidence = EXCLUDED.required_evidence,
    is_parallel = EXCLUDED.is_parallel,
    verification_flags = EXCLUDED.verification_flags,
    target_outcome_type = EXCLUDED.target_outcome_type
  RETURNING id INTO v_step_visa;

  INSERT INTO public.workflow_dependencies (step_id, depends_on_step_id) VALUES (v_step_submit, v_step_attest) ON CONFLICT (step_id, depends_on_step_id) DO NOTHING;
  INSERT INTO public.workflow_dependencies (step_id, depends_on_step_id) VALUES (v_step_decision, v_step_submit) ON CONFLICT (step_id, depends_on_step_id) DO NOTHING;
  INSERT INTO public.workflow_dependencies (step_id, depends_on_step_id) VALUES (v_step_prep1, v_step_decision) ON CONFLICT (step_id, depends_on_step_id) DO NOTHING;
  INSERT INTO public.workflow_dependencies (step_id, depends_on_step_id) VALUES (v_step_prep2, v_step_prep1) ON CONFLICT (step_id, depends_on_step_id) DO NOTHING;
  INSERT INTO public.workflow_dependencies (step_id, depends_on_step_id) VALUES (v_step_visa, v_step_prep2) ON CONFLICT (step_id, depends_on_step_id) DO NOTHING;

END;
$$;
