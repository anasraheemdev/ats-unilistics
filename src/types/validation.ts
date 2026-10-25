import { z } from 'zod';

export const DestinationCountrySchema = z.enum(['germany', 'france', 'italy', 'romania'], {
  errorMap: () => ({ message: 'Please select a supported destination country (Germany, France, Italy, Romania)' }),
});

export const DegreeLevelSchema = z.enum(['bachelor', 'master', 'doctorate', 'preparatory'], {
  errorMap: () => ({ message: 'Please select a valid degree level' }),
});

export const RequestAccessFormSchema = z
  .object({
    fullName: z
      .string()
      .min(3, 'Full legal name must be at least 3 characters')
      .max(100, 'Full name exceeds 100 characters'),
    email: z
      .string()
      .email('Please enter a valid email address'),
    phone: z
      .string()
      .optional()
      .refine((val) => !val || /^[0-9+\s\-()]{9,18}$/.test(val), {
        message: 'Please enter a valid phone number (at least 9 digits) or leave blank',
      }),
    countryInterests: z
      .array(DestinationCountrySchema)
      .min(1, 'Please select at least one target country (Germany, France, Italy, Romania)')
      .optional(),
    targetCountry: DestinationCountrySchema.optional(),
    targetDegree: DegreeLevelSchema.optional(),
    city: z.string().optional(),
    highestEducation: z.string().optional(),
    statementOfIntent: z.string().optional(),
    requestedService: z.enum(['explorer_catalogue', 'managed_application_case', 'managed_support']).optional(),
    requestType: z.enum(['explorer_catalogue', 'managed_application_case', 'managed_support']).optional(),
    consentPrivacy: z.boolean().optional().default(true),
    isUpgrade: z.boolean().optional().default(false),
    studentMessage: z
      .string()
      .max(500, 'Note must be under 500 characters')
      .optional(),
  })
  .refine((data) => Boolean(data.countryInterests?.length || data.targetCountry), {
    message: 'Please select a supported destination country',
    path: ['countryInterests'],
  })
  .refine((data) => Boolean(data.requestedService || data.requestType), {
    message: 'Please select an entry path',
    path: ['requestedService'],
  });

export type RequestAccessFormData = z.infer<typeof RequestAccessFormSchema>;

export const SetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type SetPasswordFormData = z.infer<typeof SetPasswordSchema>;

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export type ForgotPasswordFormData = z.infer<typeof ForgotPasswordSchema>;

export const AdminReviewActionSchema = z.object({
  action: z.enum(['approve_explorer', 'approve_managed', 'request_information', 'reject']),
  explanation: z.string().optional(),
  internalNotes: z.string().optional(),
});

export type AdminReviewActionData = z.infer<typeof AdminReviewActionSchema>;

export const SignInFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  mfaCode: z.string().optional(),
});

export type SignInFormData = z.infer<typeof SignInFormSchema>;

export const CreateTaskSchema = z.object({
  title: z.string().min(3, 'Task title is required').max(120),
  description: z.string().max(500).optional(),
  assignedToRole: z.enum(['student', 'counsellor']),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Please enter a valid date (YYYY-MM-DD)'),
});

export type CreateTaskFormData = z.infer<typeof CreateTaskSchema>;

export const PublicationStatusSchema = z.enum(['draft', 'review', 'published', 'archived']);

// 1. URL Validation & SSRF Guard Helper
export const isValidPublicUrl = (url?: string | null): boolean => {
  if (!url || !url.trim()) return true;
  const trimmed = url.trim().toLowerCase();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) return false;

  // SSRF blocked hosts
  const blockedPatterns = [
    '://localhost',
    '://127.',
    '://0.0.0.0',
    '://10.',
    '://192.168.',
    '://172.16.',
    '://172.17.',
    '://172.18.',
    '://172.19.',
    '://172.2',
    '://172.3',
    '://169.254.',
    '://[::1]',
  ];

  return !blockedPatterns.some((pattern) => trimmed.includes(pattern));
};

// 2. Spreadsheet Formula Injection Defense
export const escapeFormulaInjection = (value: unknown): unknown => {
  if (typeof value !== 'string') return value;
  if (/^[=+\-@\t\r]/.test(value)) {
    return `'${value}`;
  }
  return value;
};

// 3. Rich Text Sanitizer
export const sanitizeRichText = (text?: string | null): string => {
  if (!text) return '';
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/javascript:/gi, '')
    .trim();
};

// 4. Catalogue CSV/JSON Row Validation Schemas
export const UniversityImportRowSchema = z.object({
  name: z.string().min(2, 'University name must be at least 2 characters'),
  country_code: z.enum(['de', 'fr', 'it', 'ro'], {
    errorMap: () => ({ message: 'Country must be a valid country code: de, fr, it, ro' }),
  }),
  city: z.string().min(2, 'City is required and must be at least 2 characters'),
  institution_type: z.enum(['public', 'private']).default('public'),
  native_name: z.string().optional(),
  ranking_indicative: z.preprocess((val) => (val === '' || val === undefined || val === null ? undefined : Number(val)), z.number().int().positive().optional()),
  website_url: z.string().optional().refine((val) => !val || isValidPublicUrl(val), { message: 'Website URL must be a valid public HTTP/HTTPS URL' }),
});

export const ProgramImportRowSchema = z.object({
  university_id: z.string().uuid().optional(),
  university_name: z.string().optional(),
  name: z.string().min(2, 'Program name is required'),
  degree_level: z.enum(['bachelors', 'masters']),
  teaching_language: z.enum(['english', 'german', 'french', 'italian', 'romanian', 'bilingual']),
  tuition_type: z.enum(['free', 'low_cost', 'standard']).default('free'),
  annual_tuition_eur: z.preprocess((val) => (val === '' || val === undefined || val === null ? 0 : Number(val)), z.number().min(0).default(0)),
  application_portal: z.string().default('Direct University Portal'),
}).refine((data) => Boolean(data.university_id || data.university_name), {
  message: 'Must provide either university_id (UUID) or university_name',
  path: ['university_id'],
});

export const ScholarshipImportRowSchema = z.object({
  name: z.string().min(2, 'Scholarship name is required'),
  country_code: z.enum(['de', 'fr', 'it', 'ro']),
  provider: z.string().min(2, 'Provider is required'),
  degree_level: z.enum(['bachelors', 'masters', 'all']).default('all'),
  coverage_type: z.enum(['full_tuition_and_stipend', 'tuition_waiver', 'regional_grant']),
  stipend_amount_eur: z.preprocess((val) => (val === '' || val === undefined || val === null ? undefined : Number(val)), z.number().min(0).optional()),
  annual_deadline_date: z.string().optional(),
  official_url: z.string().optional().refine((val) => !val || isValidPublicUrl(val), { message: 'Official URL must be a valid public HTTP/HTTPS URL' }),
});

export const IntakeImportRowSchema = z.object({
  program_id: z.string().uuid('Valid program_id UUID is required'),
  season: z.enum(['winter', 'summer', 'fall', 'spring']),
  academic_year: z.preprocess((val) => (val === '' || val === undefined || val === null ? undefined : Number(val)), z.number().int().min(2024).max(2035)),
  deadline_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Deadline date must be in YYYY-MM-DD format'),
  portal_open_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Portal open date must be in YYYY-MM-DD format').optional(),
});
