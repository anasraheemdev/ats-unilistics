/**
 * Centralized Canonical Route Constants & Safe Navigation Helpers
 * Prevents URL concatenation errors, external redirects, and malformed paths.
 */

export const ROUTES = {
  // Public Routes
  HOME: '/',
  UNIVERSITIES: '/universities',
  PROGRAMS: '/programs',
  SCHOLARSHIPS: '/scholarships',
  SAVED: '/saved',
  CONTACT: '/contact',
  HELP: '/help',
  SUPPORT: '/support',
  SUPPORT_DESK: '/support-desk',
  HOW_IT_WORKS: '/how-it-works',
  REQUEST_GUIDANCE: '/request-guidance',
  COUNTRY_CORRIDORS: '/country-corridors',
  CORRIDORS_AND_LEGAL: '/corridors-and-legal',
  SIGN_IN: '/sign-in',
  SIGN_UP: '/sign-up',
  SET_PASSWORD: '/set-password',
  FORGOT_PASSWORD: '/forgot-password',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  REQUEST_ACCESS: '/request-access',
  REQUEST_STATUS: '/request-status',
  REQUEST_SUPPORT: '/request-support',

  // Student Protected Routes
  STUDENT: {
    ROOT: '/student',
    APPLICATIONS: '/student/applications',
    DOCUMENTS: '/student/documents',
    TASKS: '/student/tasks',
    MESSAGES: '/student/messages',
    EXPLORE: '/student/explore',
    SCHOLARSHIPS: '/student/scholarships',
    SAVED: '/student/saved',
    HELP: '/student/help',
    SUPPORT: '/student/support',
    ACCOUNT: '/student/account',
  },

  // Counsellor / Staff Protected Routes
  STAFF: {
    ROOT: '/staff',
    CASES: '/staff/cases',
    APPLICATIONS: '/staff/applications',
    REVIEW_QUEUE: '/staff/review-queue',
    TASKS: '/staff/tasks',
    MESSAGES: '/staff/messages',
    WORKFLOWS: '/staff/workflows',
    SETTINGS: '/staff/settings',
    SUPPORT: '/staff/support',
  },

  // Admin Protected Routes
  ADMIN: {
    ROOT: '/admin',
    REQUESTS: '/admin/requests',
    STUDENTS: '/admin/students',
    APPLICATIONS: '/admin/applications',
    STAFF_ASSIGNMENTS: '/admin/staff-assignments',
    REVIEW_QUEUE: '/admin/review-queue',
    TASKS: '/admin/tasks',
    MESSAGES: '/admin/messages',
    CATALOGUE: '/admin/catalogue',
    PROGRAMS: '/admin/programs',
    SCHOLARSHIPS: '/admin/scholarships',
    IMPORTS: '/admin/imports',
    WORKFLOWS: '/admin/workflows',
    EDITORIAL: '/admin/editorial',
    NOTIFICATIONS: '/admin/notifications',
    AUDIT: '/admin/audit',
    SETTINGS: '/admin/settings',
  },
} as const;

/**
 * Validates an internal return URL strictly.
 * Rejects external URLs, protocol-relative URLs (//...), backslashes (\), embedded schemes,
 * and malformed origins to eliminate open redirect vulnerabilities.
 */
export function validateInternalReturnUrl(url: string | null | undefined, fallback: string = ROUTES.HOME): string {
  if (!url) return fallback;

  const trimmed = url.trim();

  // Must begin with a single slash, followed by an alphanumeric character or route character
  // Prohibits //, /\, ://, javascript:, data:, and localhost strings
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.startsWith('/\\')) {
    return fallback;
  }

  // Reject embedded protocol schemes or external hosts
  if (trimmed.includes('://') || trimmed.includes('javascript:') || trimmed.includes('data:')) {
    return fallback;
  }

  // Reject localhost or port embed tricks
  if (/localhost(:\d+)?/i.test(trimmed) || /127\.0\.0\.1(:\d+)?/.test(trimmed)) {
    return fallback;
  }

  return trimmed;
}

/**
 * Checks whether a validated route is authorized for a given user role.
 */
export function isRouteAllowedForRole(path: string, role: string): boolean {
  const normalized = path.split('?')[0].split('#')[0];

  // Admin and Super Admin can access all internal paths
  if (role === 'admin' || role === 'super_admin') {
    return true;
  }

  // Counsellors can access staff desks and public/discovery paths, but not admin routes
  if (role === 'counsellor') {
    if (normalized.startsWith('/admin')) return false;
    return true;
  }

  // Managed students can access student workspace and public/discovery paths, but not staff or admin
  if (role === 'managed_student') {
    if (normalized.startsWith('/staff') || normalized.startsWith('/admin')) return false;
    return true;
  }

  // Explorers can access catalogue, discovery, saved items, and account, but NOT student workspace, staff, or admin
  if (role === 'explorer') {
    if (
      normalized.startsWith('/student') ||
      normalized.startsWith('/staff') ||
      normalized.startsWith('/admin')
    ) {
      return false;
    }
    return true;
  }

  // Visitors (signed out) cannot access protected spaces or private saved items
  if (
    normalized.startsWith('/student') ||
    normalized.startsWith('/staff') ||
    normalized.startsWith('/admin') ||
    normalized.startsWith('/saved') ||
    normalized.startsWith('/explorer/account')
  ) {
    return false;
  }

  return true;
}

/**
 * Determines a strictly safe post-authentication redirect path.
 * Validates returnUrl against open redirect exploits and confirms user authorization.
 */
export function getSafePostLoginRedirect(
  returnUrl: string | null | undefined,
  role: string
): string {
  const defaultByRole: Record<string, string> = {
    managed_student: ROUTES.STUDENT.ROOT,
    explorer: ROUTES.UNIVERSITIES,
    counsellor: ROUTES.STAFF.ROOT,
    admin: ROUTES.ADMIN.ROOT,
    super_admin: ROUTES.ADMIN.ROOT,
    visitor: ROUTES.HOME,
  };

  const defaultPath = defaultByRole[role] || ROUTES.HOME;

  if (!returnUrl) {
    return defaultPath;
  }

  const safeUrl = validateInternalReturnUrl(returnUrl, '');
  if (!safeUrl) {
    return defaultPath;
  }

  // Check if role has authorization to access the requested return path
  if (!isRouteAllowedForRole(safeUrl, role)) {
    return defaultPath;
  }

  return safeUrl;
}

