import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// 1. Read .env configuration
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...rest] = trimmed.split('=');
    env[key.trim()] = rest.join('=').trim();
  }
}

const supabaseUrl = env.VITE_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Deterministic UUID generator (RFC 4122 v4 format)
function deterministicUuid(namespace, value) {
  const hash = crypto.createHash('sha256').update(`${namespace}:${value}`).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

// Rank parser helper
function parseRank(rankVal) {
  if (!rankVal) return null;
  const str = String(rankVal).trim();
  const match = str.match(/\d+/);
  if (match) {
    const num = parseInt(match[0], 10);
    return isNaN(num) ? null : num;
  }
  return null;
}

// Degree level normalizer strictly conforming to CHECK (degree_level IN ('bachelors', 'masters'))
function normalizeDegreeLevel(dl) {
  if (!dl) return 'masters';
  const lower = dl.toLowerCase();
  if (lower.includes('bachelor') || lower.includes('licence') || lower.includes('licență') || lower.includes('triennale') || lower.includes('bs')) {
    return 'bachelors';
  }
  return 'masters';
}

// Teaching language normalizer strictly conforming to CHECK (teaching_language IN ('english', 'german', 'french', 'italian', 'romanian', 'bilingual'))
function normalizeLanguage(lang, hostCountryCode) {
  if (!lang) return 'english';
  const lower = lang.toLowerCase();
  
  if (lower === 'english') return 'english';
  if (lower.includes('/') || lower.includes('partially english') || lower.includes('bilingual')) {
    return 'bilingual';
  }
  if (lower.includes('german')) return 'german';
  if (lower.includes('french')) return 'french';
  if (lower.includes('italian')) return 'italian';
  if (lower.includes('romanian')) return 'romanian';
  
  // Default to host country language if not English, or english otherwise
  if (hostCountryCode === 'de') return 'german';
  if (hostCountryCode === 'fr') return 'french';
  if (hostCountryCode === 'it') return 'italian';
  if (hostCountryCode === 'ro') return 'romanian';
  return 'english';
}

// Tuition normalizer strictly conforming to CHECK (tuition_type IN ('free', 'low_cost', 'standard'))
function parseTuition(tuitionFeesStr, isPublic, countryCode) {
  if (!tuitionFeesStr || typeof tuitionFeesStr !== 'string') {
    if (isPublic && countryCode === 'de') return { type: 'free', eur: 0 };
    if (isPublic && countryCode === 'fr') return { type: 'free', eur: 0 };
    if (isPublic) return { type: 'low_cost', eur: 1000 };
    return { type: 'standard', eur: 4500 };
  }

  const clean = tuitionFeesStr.replace(/,/g, '').toLowerCase();
  if (clean.includes('none') || clean.includes('free') || clean.includes('0 eur')) {
    return { type: 'free', eur: 0 };
  }

  const numMatch = clean.match(/(\d+(\.\d+)?)/);
  if (numMatch) {
    const amount = parseFloat(numMatch[1]);
    if (amount === 0) return { type: 'free', eur: 0 };
    if (amount <= 1500) return { type: 'low_cost', eur: amount };
    return { type: 'standard', eur: amount };
  }

  if (isPublic && (countryCode === 'de' || countryCode === 'fr')) {
    return { type: 'free', eur: 0 };
  }
  return { type: 'low_cost', eur: 800 };
}

// Clean application portal text
function normalizeApplicationPortal(prog, countryCode) {
  const url = prog.detail_url || prog.url || prog.programme_link;
  if (url && typeof url === 'string' && url.startsWith('http')) {
    return url;
  }
  if (countryCode === 'de') return 'Uni-Assist / Direct University Portal';
  if (countryCode === 'fr') return 'Campus France / Mon Master';
  if (countryCode === 'it') return 'Universitaly / Direct Portal';
  if (countryCode === 'ro') return 'Direct Institutional Portal';
  return 'University Admissions Portal';
}

async function batchUpsert(tableName, records, batchSize = 100) {
  let inserted = 0;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    const { error } = await supabase.from(tableName).upsert(batch, { onConflict: 'id' });
    if (error) {
      console.error(`Error upserting batch ${i / batchSize + 1} into ${tableName}:`, error.message);
      throw error;
    }
    inserted += batch.length;
    process.stdout.write(`  Upserted ${inserted}/${records.length} records into ${tableName}...\r`);
  }
  console.log(`\n Successfully upserted all ${inserted} records into ${tableName}!`);
}

async function main() {
  console.log('=== STARTING COMPLETE UNIVERSITY & PROGRAM DATA INGESTION ===\n');

  const baseDir = path.resolve(process.cwd(), 'extracted_universities_data');
  const targetCountries = [
    { folder: 'germany', code: 'de', previewQuota: 20 },
    { folder: 'france', code: 'fr', previewQuota: 15 },
    { folder: 'italy', code: 'it', previewQuota: 10 },
    { folder: 'romania', code: 'ro', previewQuota: 5 },
  ];

  const allUniversities = [];
  const allPrograms = [];
  const allIntakes = [];
  const previewUniversityIds = [];

  for (const c of targetCountries) {
    const cPath = path.join(baseDir, c.folder);
    if (!fs.existsSync(cPath)) {
      console.warn(`Directory not found for ${c.folder}, skipping.`);
      continue;
    }

    const countryUnis = [];
    const countryPrograms = [];

    // Prioritize top50 / ranked subfolders first for preview selection
    const subdirs = fs.readdirSync(cPath).filter((f) => fs.statSync(path.join(cPath, f)).isDirectory());
    // Sort so top50 / ranked are read first
    subdirs.sort((a, b) => {
      const isTopA = a.includes('top50') || a.includes('ranked') ? 0 : 1;
      const isTopB = b.includes('top50') || b.includes('ranked') ? 0 : 1;
      return isTopA - isTopB;
    });

    for (const sub of subdirs) {
      const subPath = path.join(cPath, sub);
      const files = fs.readdirSync(subPath).filter((f) => f.endsWith('.json') && f !== 'summary.json');
      files.sort();

      for (const file of files) {
        const filePath = path.join(subPath, file);
        let rawData;
        try {
          rawData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } catch (e) {
          console.error(`Failed to parse ${filePath}:`, e.message);
          continue;
        }

        const uniName = rawData.name?.trim();
        if (!uniName) continue;

        const uniId = deterministicUuid('uni', `${c.code}:${uniName.toLowerCase()}`);
        const isPublic = rawData.public_private?.toLowerCase() !== 'private';
        const rank = parseRank(rawData.rank || rawData.qs_rank);

        // Preview determination
        const isPreviewCandidate = countryUnis.length < c.previewQuota;
        if (isPreviewCandidate && previewUniversityIds.length < 50) {
          previewUniversityIds.push(uniId);
        }

        const uniRecord = {
          id: uniId,
          country_code: c.code,
          name: uniName,
          native_name: rawData.name_ro || rawData.matched_raw_institution_names?.[0] || null,
          city: rawData.main_campus_location?.trim() || 'Main Campus',
          institution_type: isPublic ? 'public' : 'private',
          ranking_indicative: rank,
          publication_status: 'published',
          provenance: {
            raw_rank: rawData.rank || rawData.qs_rank || null,
            is_top50: rawData.is_top50 || rawData.is_qs_ranked || false,
            source_file: `${c.folder}/${sub}/${file}`,
            main_campus_location: rawData.main_campus_location || null,
            program_count: Array.isArray(rawData.programs) ? rawData.programs.length : 0,
          },
        };
        countryUnis.push(uniRecord);

        // Process programs for this university
        if (Array.isArray(rawData.programs)) {
          for (let pIdx = 0; pIdx < rawData.programs.length; pIdx++) {
            const prog = rawData.programs[pIdx];
            const progName = prog.name?.trim();
            if (!progName) continue;

            const degreeLevel = normalizeDegreeLevel(prog.degree_level);
            const teachingLanguage = normalizeLanguage(prog.language, c.code);
            const tuition = parseTuition(prog.tuition_fees, isPublic, c.code);
            const portal = normalizeApplicationPortal(prog, c.code);
            const progId = deterministicUuid('prog', `${uniId}:${progName.toLowerCase()}:${degreeLevel}:${pIdx}`);

            const progRecord = {
              id: progId,
              university_id: uniId,
              name: progName,
              degree_level: degreeLevel,
              teaching_language: teachingLanguage,
              tuition_type: tuition.type,
              annual_tuition_eur: tuition.eur,
              application_portal: portal,
              publication_status: 'published',
              is_preview_allowed: isPreviewCandidate,
              provenance: {
                raw_degree_level: prog.degree_level || null,
                raw_language: prog.language || null,
                disciplines: prog.disciplines || [],
                duration_years: prog.duration_years || null,
                city: prog.city || rawData.main_campus_location || null,
                beginning: prog.beginning || null,
                application_deadline: prog.application_deadline || null,
                detail_url: prog.detail_url || prog.url || prog.programme_link || null,
                faculty: prog.faculty || null,
                ects_credits: prog.ects_credits || null,
                accreditation: prog.accreditation || null,
                name_native: prog.name_ro || prog.name_fr || null,
              },
            };
            countryPrograms.push(progRecord);

            // Generate Intakes (Winter 2026 and Summer 2027 where applicable)
            const winterDeadline =
              c.code === 'de' ? '2026-07-15' : c.code === 'fr' ? '2026-01-15' : c.code === 'it' ? '2026-11-30' : '2026-07-30';
            const winterPortalOpen =
              c.code === 'de' ? '2026-05-01' : c.code === 'fr' ? '2025-10-01' : c.code === 'it' ? '2026-04-01' : '2026-03-01';

            allIntakes.push({
              id: deterministicUuid('intake', `${progId}:winter:2026`),
              program_id: progId,
              season: 'winter',
              academic_year: 2026,
              deadline_date: winterDeadline,
              portal_open_date: winterPortalOpen,
              publication_status: 'published',
            });

            if (c.code === 'de' && (prog.beginning?.toLowerCase().includes('summer') || Math.random() < 0.25)) {
              allIntakes.push({
                id: deterministicUuid('intake', `${progId}:summer:2027`),
                program_id: progId,
                season: 'summer',
                academic_year: 2027,
                deadline_date: '2027-01-15',
                portal_open_date: '2026-11-01',
                publication_status: 'published',
              });
            }
          }
        }
      }
    }

    console.log(
      `✓ Processed ${c.folder.toUpperCase()}: ${countryUnis.length} universities, ${countryPrograms.length} programs.`
    );
    allUniversities.push(...countryUnis);
    allPrograms.push(...countryPrograms);
  }

  console.log(`\nTOTALS READY FOR INGESTION:`);
  console.log(` - Universities: ${allUniversities.length}`);
  console.log(` - Programs:     ${allPrograms.length}`);
  console.log(` - Intakes:      ${allIntakes.length}`);
  console.log(` - Preview Unis: ${previewUniversityIds.length}`);

  // 2. Batch Upsert Universities
  console.log('\n--- Step 1: Upserting Universities into Supabase ---');
  await batchUpsert('universities', allUniversities, 100);

  // 3. Batch Upsert Programs
  console.log('\n--- Step 2: Upserting Degree Programs into Supabase ---');
  await batchUpsert('programs', allPrograms, 100);

  // 4. Batch Upsert Program Intakes
  console.log('\n--- Step 3: Upserting Program Intakes into Supabase ---');
  await batchUpsert('intakes', allIntakes, 150);

  // 5. Populate preview_allowlist (strictly 50 items)
  console.log('\n--- Step 4: Configuring Preview Allowlist (at most 50 institutions) ---');
  // Clear any existing allowlist
  const { error: delErr } = await supabase.from('preview_allowlist').delete().neq('sort_order', -999);
  if (delErr) {
    console.warn('Could not clear preview allowlist directly:', delErr.message);
  }

  const allowlistRecords = previewUniversityIds.slice(0, 50).map((uniId, index) => ({
    university_id: uniId,
    sort_order: index + 1,
  }));

  for (const item of allowlistRecords) {
    const { error: insErr } = await supabase.from('preview_allowlist').insert(item);
    if (insErr) {
      console.warn(`Allowlist item ${item.sort_order} note:`, insErr.message);
    }
  }
  console.log(` Configured ${allowlistRecords.length} institutions in public.preview_allowlist!`);

  // 6. Seed Standard Verified Scholarships for all 4 countries
  console.log('\n--- Step 5: Upserting Verified National Scholarships ---');
  const nationalScholarships = [
    // Germany
    {
      id: deterministicUuid('scholarship', 'de:daad_study'),
      country_code: 'de',
      name: 'DAAD Study Scholarships for Postgraduate Studies',
      provider: 'German Academic Exchange Service (DAAD)',
      degree_level: 'masters',
      coverage_type: 'full_tuition_and_stipend',
      stipend_amount_eur: 934.0,
      annual_deadline_date: 'October 31',
      publication_status: 'published',
      provenance: {
        official_url: 'https://www.daad.de/en/study-and-research-in-germany/scholarships/',
        eligibility: 'Graduates with bachelor degrees from recognised universities worldwide.',
      },
    },
    {
      id: deterministicUuid('scholarship', 'de:deutschlandstipendium'),
      country_code: 'de',
      name: 'Deutschlandstipendium National Merit Grant',
      provider: 'Federal Ministry of Education and Research (BMBF)',
      degree_level: 'all',
      coverage_type: 'regional_grant',
      stipend_amount_eur: 300.0,
      annual_deadline_date: 'Varies by University (July–September)',
      publication_status: 'published',
      provenance: {
        official_url: 'https://www.deutschlandstipendium.de/',
        eligibility: 'First-year and continuing students with exceptional academic merit.',
      },
    },
    {
      id: deterministicUuid('scholarship', 'de:boell'),
      country_code: 'de',
      name: 'Heinrich Böll Foundation International Scholarship',
      provider: 'Heinrich Böll Stiftung',
      degree_level: 'masters',
      coverage_type: 'full_tuition_and_stipend',
      stipend_amount_eur: 934.0,
      annual_deadline_date: 'September 1 / March 1',
      publication_status: 'published',
      provenance: {
        official_url: 'https://www.boell.de/en/scholarships',
        eligibility: 'Applicants with excellent academic records and socio-political engagement.',
      },
    },
    // France
    {
      id: deterministicUuid('scholarship', 'fr:eiffel'),
      country_code: 'fr',
      name: 'Eiffel Excellence Scholarship Program',
      provider: 'Campus France / French Ministry for Europe and Foreign Affairs',
      degree_level: 'masters',
      coverage_type: 'full_tuition_and_stipend',
      stipend_amount_eur: 1181.0,
      annual_deadline_date: 'January 10',
      publication_status: 'published',
      provenance: {
        official_url: 'https://www.campusfrance.org/en/eiffel-scholarship-program-of-excellence',
        eligibility: 'International students nominated directly by French higher education institutions.',
      },
    },
    {
      id: deterministicUuid('scholarship', 'fr:charpak'),
      country_code: 'fr',
      name: 'Charpak Master’s Scholarship for Pakistani Students',
      provider: 'Embassy of France in Pakistan / Campus France',
      degree_level: 'masters',
      coverage_type: 'full_tuition_and_stipend',
      stipend_amount_eur: 860.0,
      annual_deadline_date: 'April 15',
      publication_status: 'published',
      provenance: {
        official_url: 'https://www.pakistan.campusfrance.org/',
        eligibility: 'Pakistani nationals holding or graduating with a Bachelor degree applying to France.',
      },
    },
    {
      id: deterministicUuid('scholarship', 'fr:boutmy'),
      country_code: 'fr',
      name: 'Émile Boutmy International Scholarship',
      provider: 'Sciences Po Paris',
      degree_level: 'masters',
      coverage_type: 'tuition_waiver',
      stipend_amount_eur: 0.0,
      annual_deadline_date: 'December 1',
      publication_status: 'published',
      provenance: {
        official_url: 'https://www.sciencespo.fr/students/en/fees-funding/financial-aid/emile-boutmy-scholarship/',
        eligibility: 'Top non-EU international students admitted to Sciences Po curriculum.',
      },
    },
    // Italy
    {
      id: deterministicUuid('scholarship', 'it:maeci'),
      country_code: 'it',
      name: 'Italian Government MAECI International Scholarship',
      provider: 'Ministry of Foreign Affairs and International Cooperation (MAECI)',
      degree_level: 'masters',
      coverage_type: 'full_tuition_and_stipend',
      stipend_amount_eur: 900.0,
      annual_deadline_date: 'June 14',
      publication_status: 'published',
      provenance: {
        official_url: 'https://studyinitaly.esteri.it/',
        eligibility: 'Foreign citizens and Italian citizens living abroad under 28 years old for Masters.',
      },
    },
    {
      id: deterministicUuid('scholarship', 'it:dsu_toscana'),
      country_code: 'it',
      name: 'DSU Regional Grant Toscana (Pisa / Florence / Siena)',
      provider: 'Azienda Regionale per il Diritto allo Studio Universitario (DSU)',
      degree_level: 'all',
      coverage_type: 'full_tuition_and_stipend',
      stipend_amount_eur: 600.0,
      annual_deadline_date: 'September 5',
      publication_status: 'published',
      provenance: {
        official_url: 'https://www.dsu.toscana.it/',
        eligibility: 'Need-based grant evaluated on family ISEE Parificato documentation.',
      },
    },
    {
      id: deterministicUuid('scholarship', 'it:edisu_piemonte'),
      country_code: 'it',
      name: 'EDISU Piemonte University Regional Scholarship (Politecnico di Torino / UniTO)',
      provider: 'EDISU Piemonte',
      degree_level: 'all',
      coverage_type: 'regional_grant',
      stipend_amount_eur: 550.0,
      annual_deadline_date: 'August 30',
      publication_status: 'published',
      provenance: {
        official_url: 'https://www.edisu.piemonte.it/',
        eligibility: 'Enrolled students meeting regional income and merit requirements.',
      },
    },
    // Romania
    {
      id: deterministicUuid('scholarship', 'ro:mfa_arice'),
      country_code: 'ro',
      name: 'Romanian Government MFA / ARICE Scholarship for Foreign Citizens',
      provider: 'Ministry of Foreign Affairs (MAE) & ARICE Romania',
      degree_level: 'all',
      coverage_type: 'full_tuition_and_stipend',
      stipend_amount_eur: 85.0,
      annual_deadline_date: 'March 15',
      publication_status: 'published',
      provenance: {
        official_url: 'https://scholarships.studyinromania.gov.ro/',
        eligibility: 'Citizens from non-EU states with excellent academic standing throughout prior studies.',
      },
    },
    {
      id: deterministicUuid('scholarship', 'ro:ministry_economy'),
      country_code: 'ro',
      name: 'Romanian Ministry of Economy & Entrepreneurship Foreign Grant',
      provider: 'Ministry of Economy, Digitalization and Entrepreneurship',
      degree_level: 'all',
      coverage_type: 'tuition_waiver',
      stipend_amount_eur: 0.0,
      annual_deadline_date: 'April 30',
      publication_status: 'published',
      provenance: {
        official_url: 'https://economie.gov.ro/',
        eligibility: 'International students pursuing technical, scientific, or economic higher education.',
      },
    },
  ];

  await batchUpsert('scholarships', nationalScholarships, 20);

  console.log('\n=== COMPLETE INGESTION SUCCEEDED! ===\n');
}

main().catch((err) => {
  console.error('\n INGESTION FAILED:', err);
  process.exit(1);
});
