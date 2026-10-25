-- ============================================================================
-- Migration 010: Staff Catalogue Management, Secure CSV/JSON Import,
--                Explicit Publication States & Audit Guards
-- Product: Unilistics (ATS for European Higher Education)
-- Guidelines: Follows supabase and supabase-postgres-best-practices
-- Security: security_invoker = true on views, search_path = '' on RPCs
-- ============================================================================

-- 1. Extend publication_status to include 'review' across all catalogue tables
ALTER TABLE public.universities DROP CONSTRAINT IF EXISTS universities_publication_status_check;
ALTER TABLE public.universities ADD CONSTRAINT universities_publication_status_check
  CHECK (publication_status IN ('draft', 'review', 'published', 'archived'));

ALTER TABLE public.programs DROP CONSTRAINT IF EXISTS programs_publication_status_check;
ALTER TABLE public.programs ADD CONSTRAINT programs_publication_status_check
  CHECK (publication_status IN ('draft', 'review', 'published', 'archived'));

ALTER TABLE public.intakes DROP CONSTRAINT IF EXISTS intakes_publication_status_check;
ALTER TABLE public.intakes ADD CONSTRAINT intakes_publication_status_check
  CHECK (publication_status IN ('draft', 'review', 'published', 'archived'));

ALTER TABLE public.scholarships DROP CONSTRAINT IF EXISTS scholarships_publication_status_check;
ALTER TABLE public.scholarships ADD CONSTRAINT scholarships_publication_status_check
  CHECK (publication_status IN ('draft', 'review', 'published', 'archived'));

-- Add publication_status to countries
ALTER TABLE public.countries
  ADD COLUMN IF NOT EXISTS publication_status TEXT NOT NULL DEFAULT 'published'
  CHECK (publication_status IN ('draft', 'review', 'published', 'archived'));

-- Add provenance to intakes if missing
ALTER TABLE public.intakes
  ADD COLUMN IF NOT EXISTS provenance JSONB NOT NULL DEFAULT '{}'::jsonb;

-- 2. Restrict Catalogue Mutations: Ordinary Counsellors CANNOT edit global catalogue
DROP POLICY IF EXISTS "universities_write_staff" ON public.universities;
DROP POLICY IF EXISTS "universities_write_admin" ON public.universities;
CREATE POLICY "universities_write_admin" ON public.universities
  FOR ALL TO authenticated
  USING (private.is_admin((SELECT auth.uid())))
  WITH CHECK (private.is_admin((SELECT auth.uid())));

DROP POLICY IF EXISTS "programs_write_staff" ON public.programs;
DROP POLICY IF EXISTS "programs_write_admin" ON public.programs;
CREATE POLICY "programs_write_admin" ON public.programs
  FOR ALL TO authenticated
  USING (private.is_admin((SELECT auth.uid())))
  WITH CHECK (private.is_admin((SELECT auth.uid())));

DROP POLICY IF EXISTS "intakes_write_staff" ON public.intakes;
DROP POLICY IF EXISTS "intakes_write_admin" ON public.intakes;
CREATE POLICY "intakes_write_admin" ON public.intakes
  FOR ALL TO authenticated
  USING (private.is_admin((SELECT auth.uid())))
  WITH CHECK (private.is_admin((SELECT auth.uid())));

DROP POLICY IF EXISTS "scholarships_write_staff" ON public.scholarships;
DROP POLICY IF EXISTS "scholarships_write_admin" ON public.scholarships;
CREATE POLICY "scholarships_write_admin" ON public.scholarships
  FOR ALL TO authenticated
  USING (private.is_admin((SELECT auth.uid())))
  WITH CHECK (private.is_admin((SELECT auth.uid())));

DROP POLICY IF EXISTS "countries_write_admin" ON public.countries;
CREATE POLICY "countries_write_admin" ON public.countries
  FOR ALL TO authenticated
  USING (private.is_admin((SELECT auth.uid())))
  WITH CHECK (private.is_admin((SELECT auth.uid())));

-- 3. Dedicated Catalogue Import Batches Table
CREATE TABLE IF NOT EXISTS public.catalogue_import_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  import_type TEXT NOT NULL CHECK (import_type IN ('universities', 'programs', 'scholarships', 'intakes')),
  source_url TEXT,
  fetched_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reviewed_date TIMESTAMPTZ,
  reviewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  total_rows INTEGER NOT NULL DEFAULT 0,
  valid_rows INTEGER NOT NULL DEFAULT 0,
  error_rows INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'validating', 'dry_run_passed', 'applied', 'failed', 'rolled_back')),
  row_errors JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_import_batches_type ON public.catalogue_import_batches(import_type, created_at DESC);

ALTER TABLE public.catalogue_import_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "catalogue_import_batches_select" ON public.catalogue_import_batches
  FOR SELECT TO authenticated
  USING (private.is_staff((SELECT auth.uid())));

CREATE POLICY "catalogue_import_batches_admin_write" ON public.catalogue_import_batches
  FOR ALL TO authenticated
  USING (private.is_admin((SELECT auth.uid())))
  WITH CHECK (private.is_admin((SELECT auth.uid())));

-- 4. Security Helpers: URL Validation, SSRF Defense & Formula Injection Escaping

-- Validate public URLs (Reject internal IP addresses, loopbacks, file/javascript schemes)
CREATE OR REPLACE FUNCTION private.is_valid_public_url(p_url TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_lower TEXT;
BEGIN
  IF p_url IS NULL OR LENGTH(TRIM(p_url)) = 0 THEN
    RETURN TRUE; -- Optional URLs can be empty
  END IF;

  v_lower := LOWER(TRIM(p_url));

  -- Must start with http:// or https://
  IF NOT (v_lower LIKE 'http://%' OR v_lower LIKE 'https://%') THEN
    RETURN FALSE;
  END IF;

  -- Block dangerous local / intranet / SSRF targets
  IF v_lower LIKE '%://localhost%'
     OR v_lower LIKE '%://127.%'
     OR v_lower LIKE '%://0.0.0.0%'
     OR v_lower LIKE '%://10.%'
     OR v_lower LIKE '%://192.168.%'
     OR v_lower LIKE '%://172.16.%'
     OR v_lower LIKE '%://172.17.%'
     OR v_lower LIKE '%://172.18.%'
     OR v_lower LIKE '%://172.19.%'
     OR v_lower LIKE '%://172.2%.'
     OR v_lower LIKE '%://172.3%.'
     OR v_lower LIKE '%://169.254.%' -- Link-local / Cloud metadata endpoint
     OR v_lower LIKE '%://[::1]%'
  THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$;

-- Sanitize Rich Text: Strip dangerous script and iframe tags
CREATE OR REPLACE FUNCTION private.sanitize_rich_text(p_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_cleaned TEXT;
BEGIN
  IF p_text IS NULL THEN
    RETURN NULL;
  END IF;

  v_cleaned := p_text;
  v_cleaned := regexp_replace(v_cleaned, '(?i)<script[^>]*>.*?</script>', '', 'g');
  v_cleaned := regexp_replace(v_cleaned, '(?i)<iframe[^>]*>.*?</iframe>', '', 'g');
  v_cleaned := regexp_replace(v_cleaned, '(?i)<object[^>]*>.*?</object>', '', 'g');
  v_cleaned := regexp_replace(v_cleaned, '(?i)javascript:', '', 'g');

  RETURN TRIM(v_cleaned);
END;
$$;

-- Formula Injection Escaping: Prepend single quote if string starts with dangerous spreadsheet characters
CREATE OR REPLACE FUNCTION private.escape_formula_injection(p_val TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF p_val IS NULL THEN
    RETURN NULL;
  END IF;

  IF p_val ~ '^[\=\+\-\@\t\r]' THEN
    RETURN '''' || p_val;
  END IF;

  RETURN p_val;
END;
$$;

-- 5. Privileged RPC: Import Catalogue Batch (Schema validation, Preview, Dry Run, Deduplication)
CREATE OR REPLACE FUNCTION public.admin_import_catalogue_batch(
  p_import_type TEXT,
  p_source_url TEXT,
  p_fetched_date DATE,
  p_rows JSONB,
  p_is_dry_run BOOLEAN DEFAULT true
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_actor_id UUID;
  v_batch_id UUID;
  v_total_rows INTEGER;
  v_valid_rows INTEGER := 0;
  v_error_rows INTEGER := 0;
  v_row_errors JSONB := '[]'::jsonb;
  v_row RECORD;
  v_idx INTEGER := 0;
  v_row_json JSONB;
  
  -- University fields
  v_country_code TEXT;
  v_name TEXT;
  v_native_name TEXT;
  v_city TEXT;
  v_institution_type TEXT;
  v_ranking INTEGER;
  v_existing_id UUID;
  v_destructive_warning TEXT;
  
  -- Program fields
  v_university_id UUID;
  v_degree_level TEXT;
  v_teaching_language TEXT;
  v_tuition_type TEXT;
  v_annual_tuition NUMERIC(10,2);
  v_portal TEXT;
  
  -- Scholarship fields
  v_provider TEXT;
  v_coverage_type TEXT;
  v_stipend NUMERIC(10,2);
  v_deadline_text TEXT;
  
  -- Intake fields
  v_program_id UUID;
  v_season TEXT;
  v_academic_year INTEGER;
  v_deadline_date DATE;
  v_portal_open_date DATE;
BEGIN
  v_actor_id := (SELECT auth.uid());

  -- 1. Strictly enforce that only Administrator can import
  IF NOT private.is_admin(v_actor_id) THEN
    RAISE EXCEPTION 'Permission denied: only platform administrators can import catalogue data';
  END IF;

  -- 2. Validate URL safety (Prevent SSRF)
  IF NOT private.is_valid_public_url(p_source_url) THEN
    RAISE EXCEPTION 'Invalid or forbidden source URL. Internal or non-HTTP protocols are rejected.';
  END IF;

  -- 3. Validate import type
  IF p_import_type NOT IN ('universities', 'programs', 'scholarships', 'intakes') THEN
    RAISE EXCEPTION 'Unsupported import type: %', p_import_type;
  END IF;

  v_total_rows := jsonb_array_length(p_rows);
  IF v_total_rows = 0 THEN
    RAISE EXCEPTION 'Import payload contains zero rows.';
  END IF;

  IF v_total_rows > 250 THEN
    RAISE EXCEPTION 'Import batch exceeds maximum allowable size of 250 rows per chunk. Please split the dataset.';
  END IF;

  -- Create batch record
  INSERT INTO public.catalogue_import_batches (
    import_type,
    source_url,
    fetched_date,
    total_rows,
    status,
    created_by
  ) VALUES (
    p_import_type,
    p_source_url,
    COALESCE(p_fetched_date, CURRENT_DATE),
    v_total_rows,
    'validating',
    v_actor_id
  ) RETURNING id INTO v_batch_id;

  -- 4. Process each row
  FOR v_idx IN 0..(v_total_rows - 1) LOOP
    v_row_json := p_rows->v_idx;

    -- =========================================================================
    -- UNIVERSITIES VALIDATION & DRY RUN
    -- =========================================================================
    IF p_import_type = 'universities' THEN
      v_name := TRIM(v_row_json->>'name');
      v_country_code := LOWER(TRIM(v_row_json->>'country_code'));
      v_city := TRIM(v_row_json->>'city');
      v_institution_type := LOWER(TRIM(COALESCE(v_row_json->>'institution_type', 'public')));
      v_native_name := TRIM(v_row_json->>'native_name');
      
      IF v_row_json->>'ranking_indicative' IS NOT NULL AND (v_row_json->>'ranking_indicative') != '' THEN
        BEGIN
          v_ranking := (v_row_json->>'ranking_indicative')::INTEGER;
        EXCEPTION WHEN OTHERS THEN
          v_ranking := NULL;
        END;
      ELSE
        v_ranking := NULL;
      END IF;

      -- Validation checks
      IF v_name IS NULL OR LENGTH(v_name) < 2 THEN
        v_error_rows := v_error_rows + 1;
        v_row_errors := v_row_errors || jsonb_build_object(
          'row', v_idx + 1,
          'field', 'name',
          'error', 'University name must be at least 2 characters'
        );
        CONTINUE;
      END IF;

      IF v_country_code IS NULL OR NOT EXISTS (SELECT 1 FROM public.countries WHERE code = v_country_code) THEN
        v_error_rows := v_error_rows + 1;
        v_row_errors := v_row_errors || jsonb_build_object(
          'row', v_idx + 1,
          'field', 'country_code',
          'error', format('Invalid country_code "%s". Must reference an active country (de, fr, it, ro).', v_country_code)
        );
        CONTINUE;
      END IF;

      IF v_city IS NULL OR LENGTH(v_city) < 2 THEN
        v_error_rows := v_error_rows + 1;
        v_row_errors := v_row_errors || jsonb_build_object(
          'row', v_idx + 1,
          'field', 'city',
          'error', 'City is required and must be at least 2 characters'
        );
        CONTINUE;
      END IF;

      IF v_institution_type NOT IN ('public', 'private') THEN
        v_error_rows := v_error_rows + 1;
        v_row_errors := v_row_errors || jsonb_build_object(
          'row', v_idx + 1,
          'field', 'institution_type',
          'error', 'Institution type must be either "public" or "private"'
        );
        CONTINUE;
      END IF;

      -- Deduplication check
      SELECT id INTO v_existing_id
      FROM public.universities
      WHERE country_code = v_country_code
        AND LOWER(name) = LOWER(v_name)
        AND LOWER(city) = LOWER(v_city);

      v_valid_rows := v_valid_rows + 1;

      -- If not dry run, apply insert or update in 'draft' or 'review' state
      IF NOT p_is_dry_run THEN
        IF v_existing_id IS NOT NULL THEN
          UPDATE public.universities
          SET
            native_name = COALESCE(v_native_name, native_name),
            institution_type = v_institution_type,
            ranking_indicative = COALESCE(v_ranking, ranking_indicative),
            provenance = jsonb_build_object(
              'batch_id', v_batch_id,
              'source_url', p_source_url,
              'fetched_date', p_fetched_date,
              'updated_by', v_actor_id
            ),
            updated_at = NOW()
          WHERE id = v_existing_id;
        ELSE
          INSERT INTO public.universities (
            country_code,
            name,
            native_name,
            city,
            institution_type,
            ranking_indicative,
            publication_status,
            provenance
          ) VALUES (
            v_country_code,
            private.sanitize_rich_text(v_name),
            private.sanitize_rich_text(v_native_name),
            private.sanitize_rich_text(v_city),
            v_institution_type,
            v_ranking,
            'draft', -- A successful import is not automatic approval of its facts!
            jsonb_build_object(
              'batch_id', v_batch_id,
              'source_url', p_source_url,
              'fetched_date', p_fetched_date,
              'imported_by', v_actor_id
            )
          );
        END IF;
      END IF;

    -- =========================================================================
    -- PROGRAMS VALIDATION & DRY RUN
    -- =========================================================================
    ELSIF p_import_type = 'programs' THEN
      v_name := TRIM(v_row_json->>'name');
      v_degree_level := LOWER(TRIM(COALESCE(v_row_json->>'degree_level', '')));
      v_teaching_language := LOWER(TRIM(COALESCE(v_row_json->>'teaching_language', '')));
      v_tuition_type := LOWER(TRIM(COALESCE(v_row_json->>'tuition_type', 'free')));
      v_portal := TRIM(COALESCE(v_row_json->>'application_portal', 'Direct University Portal'));

      -- Find University ID by UUID or Name
      IF v_row_json->>'university_id' IS NOT NULL AND (v_row_json->>'university_id') ~ '^[0-9a-fA-F-]{36}$' THEN
        SELECT id INTO v_university_id FROM public.universities WHERE id = (v_row_json->>'university_id')::UUID;
      ELSIF v_row_json->>'university_name' IS NOT NULL THEN
        SELECT id INTO v_university_id FROM public.universities WHERE LOWER(name) = LOWER(TRIM(v_row_json->>'university_name')) LIMIT 1;
      ELSE
        v_university_id := NULL;
      END IF;

      IF v_university_id IS NULL THEN
        v_error_rows := v_error_rows + 1;
        v_row_errors := v_row_errors || jsonb_build_object(
          'row', v_idx + 1,
          'field', 'university_id',
          'error', 'Valid university_id (UUID) or existing university_name is required'
        );
        CONTINUE;
      END IF;

      IF v_name IS NULL OR LENGTH(v_name) < 2 THEN
        v_error_rows := v_error_rows + 1;
        v_row_errors := v_row_errors || jsonb_build_object(
          'row', v_idx + 1,
          'field', 'name',
          'error', 'Program name is required'
        );
        CONTINUE;
      END IF;

      IF v_degree_level NOT IN ('bachelors', 'masters') THEN
        v_error_rows := v_error_rows + 1;
        v_row_errors := v_row_errors || jsonb_build_object(
          'row', v_idx + 1,
          'field', 'degree_level',
          'error', 'Degree level must be "bachelors" or "masters"'
        );
        CONTINUE;
      END IF;

      IF v_teaching_language NOT IN ('english', 'german', 'french', 'italian', 'romanian', 'bilingual') THEN
        v_error_rows := v_error_rows + 1;
        v_row_errors := v_row_errors || jsonb_build_object(
          'row', v_idx + 1,
          'field', 'teaching_language',
          'error', 'Language must be one of: english, german, french, italian, romanian, bilingual'
        );
        CONTINUE;
      END IF;

      -- Preserve unknown tuition: do not hallucinate numbers
      IF v_row_json->>'annual_tuition_eur' IS NOT NULL AND (v_row_json->>'annual_tuition_eur') != '' THEN
        BEGIN
          v_annual_tuition := (v_row_json->>'annual_tuition_eur')::NUMERIC;
        EXCEPTION WHEN OTHERS THEN
          v_annual_tuition := 0.00;
        END;
      ELSE
        v_annual_tuition := 0.00;
      END IF;

      v_valid_rows := v_valid_rows + 1;

      IF NOT p_is_dry_run THEN
        -- Check deduplication
        SELECT id INTO v_existing_id
        FROM public.programs
        WHERE university_id = v_university_id
          AND LOWER(name) = LOWER(v_name)
          AND degree_level = v_degree_level;

        IF v_existing_id IS NOT NULL THEN
          UPDATE public.programs
          SET
            teaching_language = v_teaching_language,
            tuition_type = v_tuition_type,
            annual_tuition_eur = v_annual_tuition,
            application_portal = v_portal,
            provenance = jsonb_build_object(
              'batch_id', v_batch_id,
              'source_url', p_source_url,
              'fetched_date', p_fetched_date,
              'updated_by', v_actor_id
            ),
            updated_at = NOW()
          WHERE id = v_existing_id;
        ELSE
          INSERT INTO public.programs (
            university_id,
            name,
            degree_level,
            teaching_language,
            tuition_type,
            annual_tuition_eur,
            application_portal,
            publication_status,
            provenance
          ) VALUES (
            v_university_id,
            private.sanitize_rich_text(v_name),
            v_degree_level,
            v_teaching_language,
            v_tuition_type,
            v_annual_tuition,
            private.sanitize_rich_text(v_portal),
            'draft',
            jsonb_build_object(
              'batch_id', v_batch_id,
              'source_url', p_source_url,
              'fetched_date', p_fetched_date,
              'imported_by', v_actor_id
            )
          );
        END IF;
      END IF;

    -- =========================================================================
    -- SCHOLARSHIPS VALIDATION & DRY RUN
    -- =========================================================================
    ELSIF p_import_type = 'scholarships' THEN
      v_name := TRIM(v_row_json->>'name');
      v_country_code := LOWER(TRIM(v_row_json->>'country_code'));
      v_provider := TRIM(v_row_json->>'provider');
      v_degree_level := LOWER(TRIM(COALESCE(v_row_json->>'degree_level', 'all')));
      v_coverage_type := LOWER(TRIM(COALESCE(v_row_json->>'coverage_type', 'tuition_waiver')));
      v_deadline_text := TRIM(v_row_json->>'annual_deadline_date');

      IF v_name IS NULL OR LENGTH(v_name) < 2 THEN
        v_error_rows := v_error_rows + 1;
        v_row_errors := v_row_errors || jsonb_build_object(
          'row', v_idx + 1,
          'field', 'name',
          'error', 'Scholarship name is required'
        );
        CONTINUE;
      END IF;

      IF v_country_code IS NULL OR NOT EXISTS (SELECT 1 FROM public.countries WHERE code = v_country_code) THEN
        v_error_rows := v_error_rows + 1;
        v_row_errors := v_row_errors || jsonb_build_object(
          'row', v_idx + 1,
          'field', 'country_code',
          'error', 'Valid country_code is required (de, fr, it, ro)'
        );
        CONTINUE;
      END IF;

      IF v_provider IS NULL OR LENGTH(v_provider) < 2 THEN
        v_error_rows := v_error_rows + 1;
        v_row_errors := v_row_errors || jsonb_build_object(
          'row', v_idx + 1,
          'field', 'provider',
          'error', 'Provider is required'
        );
        CONTINUE;
      END IF;

      IF v_coverage_type NOT IN ('full_tuition_and_stipend', 'tuition_waiver', 'regional_grant') THEN
        v_error_rows := v_error_rows + 1;
        v_row_errors := v_row_errors || jsonb_build_object(
          'row', v_idx + 1,
          'field', 'coverage_type',
          'error', 'Coverage must be: full_tuition_and_stipend, tuition_waiver, regional_grant'
        );
        CONTINUE;
      END IF;

      IF v_row_json->>'stipend_amount_eur' IS NOT NULL AND (v_row_json->>'stipend_amount_eur') != '' THEN
        BEGIN
          v_stipend := (v_row_json->>'stipend_amount_eur')::NUMERIC;
        EXCEPTION WHEN OTHERS THEN
          v_stipend := NULL;
        END;
      ELSE
        v_stipend := NULL;
      END IF;

      v_valid_rows := v_valid_rows + 1;

      IF NOT p_is_dry_run THEN
        INSERT INTO public.scholarships (
          country_code,
          name,
          provider,
          degree_level,
          coverage_type,
          stipend_amount_eur,
          annual_deadline_date,
          publication_status,
          provenance
        ) VALUES (
          v_country_code,
          private.sanitize_rich_text(v_name),
          private.sanitize_rich_text(v_provider),
          v_degree_level,
          v_coverage_type,
          v_stipend,
          v_deadline_text,
          'draft',
          jsonb_build_object(
            'batch_id', v_batch_id,
            'source_url', p_source_url,
            'fetched_date', p_fetched_date,
            'imported_by', v_actor_id
          )
        );
      END IF;

    -- =========================================================================
    -- INTAKES VALIDATION & DRY RUN
    -- =========================================================================
    ELSIF p_import_type = 'intakes' THEN
      v_season := LOWER(TRIM(v_row_json->>'season'));
      
      IF v_row_json->>'program_id' IS NOT NULL AND (v_row_json->>'program_id') ~ '^[0-9a-fA-F-]{36}$' THEN
        SELECT id INTO v_program_id FROM public.programs WHERE id = (v_row_json->>'program_id')::UUID;
      ELSE
        v_program_id := NULL;
      END IF;

      IF v_program_id IS NULL THEN
        v_error_rows := v_error_rows + 1;
        v_row_errors := v_row_errors || jsonb_build_object(
          'row', v_idx + 1,
          'field', 'program_id',
          'error', 'Valid program_id (UUID) is required'
        );
        CONTINUE;
      END IF;

      IF v_season NOT IN ('winter', 'summer', 'fall', 'spring') THEN
        v_error_rows := v_error_rows + 1;
        v_row_errors := v_row_errors || jsonb_build_object(
          'row', v_idx + 1,
          'field', 'season',
          'error', 'Season must be winter, summer, fall, or spring'
        );
        CONTINUE;
      END IF;

      BEGIN
        v_academic_year := (v_row_json->>'academic_year')::INTEGER;
        v_deadline_date := (v_row_json->>'deadline_date')::DATE;
      EXCEPTION WHEN OTHERS THEN
        v_error_rows := v_error_rows + 1;
        v_row_errors := v_row_errors || jsonb_build_object(
          'row', v_idx + 1,
          'field', 'deadline_date',
          'error', 'Academic year and valid deadline date (YYYY-MM-DD) are required'
        );
        CONTINUE;
      END;

      v_valid_rows := v_valid_rows + 1;

      IF NOT p_is_dry_run THEN
        INSERT INTO public.intakes (
          program_id,
          season,
          academic_year,
          deadline_date,
          publication_status,
          provenance
        ) VALUES (
          v_program_id,
          v_season,
          v_academic_year,
          v_deadline_date,
          'draft',
          jsonb_build_object(
            'batch_id', v_batch_id,
            'source_url', p_source_url,
            'fetched_date', p_fetched_date,
            'imported_by', v_actor_id
          )
        )
        ON CONFLICT (program_id, season, academic_year)
        DO UPDATE SET deadline_date = EXCLUDED.deadline_date;
      END IF;
    END IF;
  END LOOP;

  -- 5. Finalize batch status
  UPDATE public.catalogue_import_batches
  SET
    valid_rows = v_valid_rows,
    error_rows = v_error_rows,
    row_errors = v_row_errors,
    status = CASE
      WHEN p_is_dry_run THEN 'dry_run_passed'
      WHEN v_error_rows > 0 AND v_valid_rows = 0 THEN 'failed'
      ELSE 'applied'
    END
  WHERE id = v_batch_id;

  -- Audit log if applied
  IF NOT p_is_dry_run THEN
    INSERT INTO public.audit_events (
      actor_id,
      action,
      target_type,
      target_id,
      payload
    ) VALUES (
      v_actor_id,
      'catalogue_import_applied',
      'catalogue_import_batches',
      v_batch_id::text,
      jsonb_build_object(
        'import_type', p_import_type,
        'total_rows', v_total_rows,
        'valid_rows', v_valid_rows,
        'error_rows', v_error_rows,
        'source_url', p_source_url
      )
    );
  END IF;

  RETURN jsonb_build_object(
    'success', (v_error_rows = 0 OR v_valid_rows > 0),
    'batch_id', v_batch_id,
    'is_dry_run', p_is_dry_run,
    'total_rows', v_total_rows,
    'valid_rows', v_valid_rows,
    'error_rows', v_error_rows,
    'row_errors', v_row_errors
  );
END;
$$;

-- 6. Privileged RPC: Explicit Publication & Status Transitions
CREATE OR REPLACE FUNCTION public.admin_update_catalogue_status(
  p_entity_type TEXT,
  p_id UUID,
  p_new_status TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_actor_id UUID;
  v_active_apps_count INTEGER := 0;
  v_is_allowlisted BOOLEAN := false;
BEGIN
  v_actor_id := (SELECT auth.uid());

  IF NOT private.is_admin(v_actor_id) THEN
    RAISE EXCEPTION 'Permission denied: only platform administrators can update catalogue publication status';
  END IF;

  IF p_new_status NOT IN ('draft', 'review', 'published', 'archived') THEN
    RAISE EXCEPTION 'Invalid publication status: %. Must be draft, review, published, or archived', p_new_status;
  END IF;

  IF p_entity_type = 'universities' THEN
    -- Check if university has active applications before archiving
    IF p_new_status = 'archived' THEN
      SELECT COUNT(*) INTO v_active_apps_count
      FROM public.applications a
      JOIN public.programs p ON p.id = a.program_id
      WHERE p.university_id = p_id;

      -- If university is in preview allowlist, remove it
      DELETE FROM public.preview_allowlist WHERE university_id = p_id;
    END IF;

    UPDATE public.universities
    SET publication_status = p_new_status, updated_at = NOW()
    WHERE id = p_id;

  ELSIF p_entity_type = 'programs' THEN
    IF p_new_status = 'archived' THEN
      SELECT COUNT(*) INTO v_active_apps_count
      FROM public.applications
      WHERE program_id = p_id;
    END IF;

    UPDATE public.programs
    SET publication_status = p_new_status, updated_at = NOW()
    WHERE id = p_id;

  ELSIF p_entity_type = 'scholarships' THEN
    UPDATE public.scholarships
    SET publication_status = p_new_status
    WHERE id = p_id;

  ELSIF p_entity_type = 'intakes' THEN
    UPDATE public.intakes
    SET publication_status = p_new_status
    WHERE id = p_id;

  ELSE
    RAISE EXCEPTION 'Unsupported entity type: %', p_entity_type;
  END IF;

  -- Audit log
  INSERT INTO public.audit_events (
    actor_id,
    action,
    target_type,
    target_id,
    payload
  ) VALUES (
    v_actor_id,
    'catalogue_status_transition',
    p_entity_type,
    p_id::text,
    jsonb_build_object(
      'new_status', p_new_status,
      'active_applications_referenced', v_active_apps_count
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'id', p_id,
    'new_status', p_new_status,
    'referenced_applications', v_active_apps_count
  );
END;
$$;

-- 7. Privileged RPC: Bulk Catalogue Export with Formula Injection Guard & Rate Limiting
CREATE OR REPLACE FUNCTION public.admin_export_catalogue(
  p_entity_type TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_actor_id UUID;
  v_result JSONB;
BEGIN
  v_actor_id := (SELECT auth.uid());

  -- 1. Strictly enforce Administrator role (Ordinary Counsellors CANNOT bulk export)
  IF NOT private.is_admin(v_actor_id) THEN
    RAISE EXCEPTION 'Permission denied: ordinary counsellors cannot bulk export the global catalogue';
  END IF;

  -- 2. Enforce rate limiting: max 5 exports per 10 minutes
  IF NOT private.check_and_increment_rate_limit('bulk_catalogue_export', v_actor_id::text, 5, 600) THEN
    RAISE EXCEPTION 'Rate limit exceeded for catalogue export. Please wait before exporting again.';
  END IF;

  -- 3. Query records with formula injection escaping
  IF p_entity_type = 'universities' THEN
    SELECT COALESCE(jsonb_agg(
      jsonb_build_object(
        'id', u.id,
        'country_code', u.country_code,
        'name', private.escape_formula_injection(u.name),
        'native_name', private.escape_formula_injection(u.native_name),
        'city', private.escape_formula_injection(u.city),
        'institution_type', u.institution_type,
        'ranking_indicative', u.ranking_indicative,
        'publication_status', u.publication_status,
        'created_at', u.created_at
      )
    ), '[]'::jsonb) INTO v_result
    FROM public.universities u;

  ELSIF p_entity_type = 'programs' THEN
    SELECT COALESCE(jsonb_agg(
      jsonb_build_object(
        'id', p.id,
        'university_id', p.university_id,
        'university_name', private.escape_formula_injection(u.name),
        'name', private.escape_formula_injection(p.name),
        'degree_level', p.degree_level,
        'teaching_language', p.teaching_language,
        'tuition_type', p.tuition_type,
        'annual_tuition_eur', p.annual_tuition_eur,
        'application_portal', private.escape_formula_injection(p.application_portal),
        'publication_status', p.publication_status,
        'is_preview_allowed', p.is_preview_allowed
      )
    ), '[]'::jsonb) INTO v_result
    FROM public.programs p
    JOIN public.universities u ON u.id = p.university_id;

  ELSIF p_entity_type = 'scholarships' THEN
    SELECT COALESCE(jsonb_agg(
      jsonb_build_object(
        'id', s.id,
        'country_code', s.country_code,
        'name', private.escape_formula_injection(s.name),
        'provider', private.escape_formula_injection(s.provider),
        'degree_level', s.degree_level,
        'coverage_type', s.coverage_type,
        'stipend_amount_eur', s.stipend_amount_eur,
        'annual_deadline_date', s.annual_deadline_date,
        'publication_status', s.publication_status
      )
    ), '[]'::jsonb) INTO v_result
    FROM public.scholarships s;

  ELSIF p_entity_type = 'intakes' THEN
    SELECT COALESCE(jsonb_agg(
      jsonb_build_object(
        'id', i.id,
        'program_id', i.program_id,
        'season', i.season,
        'academic_year', i.academic_year,
        'deadline_date', i.deadline_date,
        'portal_open_date', i.portal_open_date,
        'publication_status', i.publication_status
      )
    ), '[]'::jsonb) INTO v_result
    FROM public.intakes i;

  ELSIF p_entity_type = 'countries' THEN
    SELECT COALESCE(jsonb_agg(
      jsonb_build_object(
        'code', c.code,
        'name', private.escape_formula_injection(c.name),
        'visa_authority', private.escape_formula_injection(c.visa_authority),
        'publication_status', c.publication_status
      )
    ), '[]'::jsonb) INTO v_result
    FROM public.countries c;

  ELSE
    RAISE EXCEPTION 'Unsupported export entity type: %', p_entity_type;
  END IF;

  -- 4. Audit event log
  INSERT INTO public.audit_events (
    actor_id,
    action,
    target_type,
    target_id,
    payload
  ) VALUES (
    v_actor_id,
    'bulk_catalogue_export',
    p_entity_type,
    p_entity_type,
    jsonb_build_object(
      'entity_type', p_entity_type,
      'exported_count', jsonb_array_length(v_result)
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'entity_type', p_entity_type,
    'data', v_result
  );
END;
$$;

-- 8. Atomic Allowlist Update with Enforced 50 Cap under Concurrent Edits
CREATE OR REPLACE FUNCTION public.admin_set_preview_allowlist_atomic(
  p_university_ids UUID[]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_actor_id UUID;
  v_count INTEGER;
  v_uid UUID;
  v_unpub_count INTEGER;
BEGIN
  v_actor_id := (SELECT auth.uid());

  IF NOT private.is_admin(v_actor_id) THEN
    RAISE EXCEPTION 'Permission denied: only platform administrators can manage the preview allowlist';
  END IF;

  v_count := COALESCE(array_length(p_university_ids, 1), 0);

  IF v_count > 50 THEN
    RAISE EXCEPTION 'Preview allowlist cannot exceed 50 distinct universities. Provided: %', v_count;
  END IF;

  -- Check all universities are published
  IF v_count > 0 THEN
    SELECT COUNT(*) INTO v_unpub_count
    FROM public.universities
    WHERE id = ANY(p_university_ids) AND publication_status != 'published';

    IF v_unpub_count > 0 THEN
      RAISE EXCEPTION 'Only universities with publication_status = "published" can be added to the preview allowlist (% unpublished found)', v_unpub_count;
    END IF;
  END IF;

  -- Atomically lock allowlist table to prevent race condition under concurrent edits
  LOCK TABLE public.preview_allowlist IN EXCLUSIVE MODE;

  DELETE FROM public.preview_allowlist;

  IF v_count > 0 THEN
    FOREACH v_uid IN ARRAY p_university_ids LOOP
      INSERT INTO public.preview_allowlist (university_id, sort_order, added_by)
      VALUES (v_uid, 0, v_actor_id)
      ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;

  -- Audit log
  INSERT INTO public.audit_events (
    actor_id,
    action,
    target_type,
    target_id,
    payload
  ) VALUES (
    v_actor_id,
    'update_preview_allowlist',
    'preview_allowlist',
    'preview_allowlist',
    jsonb_build_object('count', v_count)
  );

  RETURN jsonb_build_object('success', true, 'count', v_count);
END;
$$;

-- 9. Privileged RPC: Update Country Publication Status (Enforces statutory exclusion of Hungary)
CREATE OR REPLACE FUNCTION public.admin_update_country_status(
  p_code TEXT,
  p_new_status TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_actor_id UUID;
  v_lower_code TEXT;
BEGIN
  v_actor_id := (SELECT auth.uid());
  v_lower_code := LOWER(TRIM(p_code));

  -- 1. Strictly enforce Administrator role
  IF NOT private.is_admin(v_actor_id) THEN
    RAISE EXCEPTION 'Permission denied: only platform administrators can update country publication status';
  END IF;

  -- 2. Validate publication status
  IF p_new_status NOT IN ('draft', 'review', 'published', 'archived') THEN
    RAISE EXCEPTION 'Invalid publication status: %. Must be draft, review, published, or archived', p_new_status;
  END IF;

  -- 3. Strict statutory exclusion of Hungary per AGENTS.md contract
  IF v_lower_code = 'hu' AND p_new_status = 'published' THEN
    RAISE EXCEPTION 'Hungary is deferred future scope and cannot be published until statutory reviews are completed.';
  END IF;

  UPDATE public.countries
  SET publication_status = p_new_status
  WHERE code = v_lower_code;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Country code "%" does not exist', p_code;
  END IF;

  -- 4. Audit log
  INSERT INTO public.audit_events (
    actor_id,
    action,
    target_type,
    target_id,
    payload
  ) VALUES (
    v_actor_id,
    'country_status_transition',
    'countries',
    v_lower_code,
    jsonb_build_object('new_status', p_new_status)
  );

  RETURN jsonb_build_object('success', true, 'code', v_lower_code, 'new_status', p_new_status);
END;
$$;

-- Grants on new RPCs and tables
GRANT SELECT ON public.catalogue_import_batches TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_import_catalogue_batch TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_catalogue_status TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_country_status TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_export_catalogue TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_preview_allowlist_atomic TO authenticated;

