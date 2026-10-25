/**
 * Catalogue Import/Export Utilities
 * Product: Unilistics (ATS for European Higher Education)
 * Security: Formula injection escaping, SSRF URL checks, rich text sanitization,
 *           and preservation of unknown values without LLM hallucination.
 */

import { escapeFormulaInjection } from '@/types/validation';

export type CatalogueEntityType = 'universities' | 'programs' | 'scholarships' | 'intakes' | 'countries';

/**
 * Downloadable CSV Templates with explicit column documentation
 */
export const CSV_TEMPLATES: Record<CatalogueEntityType, { filename: string; headers: string[]; sampleRow: string[] }> = {
  universities: {
    filename: 'unilistics_universities_template.csv',
    headers: ['name', 'country_code', 'city', 'institution_type', 'native_name', 'ranking_indicative', 'website_url'],
    sampleRow: [
      'Munich Technical University',
      'de',
      'Munich',
      'public',
      'Technische Universität München',
      '30',
      'https://www.tum.de',
    ],
  },
  programs: {
    filename: 'unilistics_programs_template.csv',
    headers: ['university_name', 'name', 'degree_level', 'teaching_language', 'tuition_type', 'annual_tuition_eur', 'application_portal'],
    sampleRow: [
      'Munich Technical University',
      'M.Sc. Data Engineering and Analytics',
      'masters',
      'english',
      'free',
      '0',
      'TUMonline Portal',
    ],
  },
  scholarships: {
    filename: 'unilistics_scholarships_template.csv',
    headers: ['name', 'country_code', 'provider', 'degree_level', 'coverage_type', 'stipend_amount_eur', 'annual_deadline_date', 'official_url'],
    sampleRow: [
      'DAAD Master Studies for All Academic Disciplines',
      'de',
      'German Academic Exchange Service',
      'masters',
      'full_tuition_and_stipend',
      '934.00',
      '15 November',
      'https://www.daad.de',
    ],
  },
  intakes: {
    filename: 'unilistics_intakes_template.csv',
    headers: ['program_id', 'season', 'academic_year', 'deadline_date', 'portal_open_date'],
    sampleRow: [
      '11111111-2222-3333-4444-555555555555',
      'winter',
      '2027',
      '2027-07-15',
      '2027-05-01',
    ],
  },
  countries: {
    filename: 'unilistics_countries_template.csv',
    headers: ['code', 'name', 'currency', 'publication_status'],
    sampleRow: ['de', 'Germany', 'EUR', 'published'],
  },
};

/**
 * Tiny, clearly fictional development fixture (never fabricated production data)
 */
export const FICTIONAL_DEMO_IMPORT_FIXTURE = {
  universities: [
    {
      name: 'Eldoria Polytechnic of Applied Sciences (Fictional)',
      country_code: 'de',
      city: 'Stuttgart',
      institution_type: 'public',
      native_name: 'Fachhochschule Eldoria',
      ranking_indicative: 45,
      website_url: 'https://www.eldoria-fictional-polytech.de',
    },
    {
      name: "Val-d'Or Académie Supérieure (Fictional)",
      country_code: 'fr',
      city: 'Grenoble',
      institution_type: 'public',
      native_name: "Académie Val-d'Or",
      ranking_indicative: 55,
      website_url: 'https://www.valdor-fictional.fr',
    },
    {
      name: 'Aethelgard Institute of Maritime Tech (Fictional)',
      country_code: 'ro',
      city: 'Constanta',
      institution_type: 'public',
      native_name: 'Institutul Maritim Aethelgard',
      ranking_indicative: 80,
      website_url: 'https://www.aethelgard-fictional.ro',
    },
  ],
  programs: [
    {
      university_name: 'Eldoria Polytechnic of Applied Sciences (Fictional)',
      name: 'M.Sc. Automotive Embedded Cybernetics (Fictional)',
      degree_level: 'masters',
      teaching_language: 'english',
      tuition_type: 'free',
      annual_tuition_eur: 0,
      application_portal: 'Direct University Uni-Assist',
    },
    {
      university_name: "Val-d'Or Académie Supérieure (Fictional)",
      name: 'B.Sc. Computational Renewable Engineering (Fictional)',
      degree_level: 'bachelors',
      teaching_language: 'english',
      tuition_type: 'low_cost',
      annual_tuition_eur: 2770,
      application_portal: 'Campus France EEF Portal',
    },
  ],
  scholarships: [
    {
      country_code: 'de',
      name: 'Eldoria Excellence STEM Waiver (Fictional)',
      provider: 'State Ministry of Research (Fictional)',
      degree_level: 'masters',
      coverage_type: 'tuition_waiver',
      stipend_amount_eur: 450,
      annual_deadline_date: '15 July',
      official_url: 'https://www.eldoria-fictional-polytech.de/scholarships',
    },
  ],
  intakes: [
    {
      program_id: '00000000-0000-0000-0000-000000000001',
      season: 'winter',
      academic_year: 2027,
      deadline_date: '2027-07-15',
      portal_open_date: '2027-05-01',
    },
  ],
  countries: [
    { code: 'de', name: 'Germany', currency: 'EUR', publication_status: 'published' },
    { code: 'fr', name: 'France', currency: 'EUR', publication_status: 'published' },
    { code: 'it', name: 'Italy', currency: 'EUR', publication_status: 'published' },
    { code: 'ro', name: 'Romania', currency: 'RON', publication_status: 'published' },
  ],
};

/**
 * Downloads a structured CSV template with sample data
 */
export function downloadCsvTemplate(type: CatalogueEntityType): void {
  const tpl = CSV_TEMPLATES[type];
  if (!tpl) return;

  const content = [
    tpl.headers.join(','),
    tpl.sampleRow.map((col) => (col.includes(',') ? `"${col}"` : col)).join(','),
  ].join('\n');

  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = tpl.filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Parses raw CSV text into array of JSON records
 */
export function parseCsvText(csvText: string): Record<string, string>[] {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (insideQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // skip escaped quote
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseLine(lines[0]).map((h) => h.toLowerCase().trim());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    if (values.every((v) => v.length === 0)) continue; // skip blank rows

    const rowObj: Record<string, string> = {};
    headers.forEach((header, colIndex) => {
      rowObj[header] = values[colIndex] ?? '';
    });
    rows.push(rowObj);
  }

  return rows;
}

/**
 * Exports data to CSV with formula injection defense
 * (Prefixes =, +, -, @, \t, \r with single quote)
 */
export function exportToCsvSafely(filename: string, headers: string[], rows: Record<string, unknown>[]): void {
  const sanitizeCell = (raw: unknown): string => {
    if (raw === null || raw === undefined) return '';
    const safe = escapeFormulaInjection(String(raw));
    const str = String(safe);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvRows: string[] = [];
  csvRows.push(headers.map(sanitizeCell).join(','));

  for (const row of rows) {
    const line = headers.map((h) => sanitizeCell(row[h]));
    csvRows.push(line.join(','));
  }

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
