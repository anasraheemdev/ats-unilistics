/**
 * Internationalization (i18n) Foundation
 * Configured with standard plain English baseline.
 * Future language translations (e.g. Urdu, German, French, Italian, Romanian) can be loaded modularly.
 * Note: Statutory visa rules and official procedures are maintained in English baseline to prevent translation inaccuracies.
 */

export const en = {
  app: {
    title: 'Unilistics',
    provisionalTag: 'OFFICIAL SYSTEM • DEV BUILD',
    subtitle: 'Staff-Managed University & Visa Tracking for Pakistani Applicants',
    skipToMain: 'Skip to main content',
  },
  nav: {
    // Visitor Navigation
    explorePreview: 'University Preview',
    requestAccess: 'Request Access',
    signIn: 'Staff & Student Sign In',
    // Student Navigation
    overview: 'Overview',
    myApplications: 'My Applications',
    documents: 'Documents',
    tasks: 'Tasks',
    messages: 'Messages',
    explore: 'Explore',
    help: 'Help',
    // Explorer Navigation
    saved: 'Saved',
    requestSupport: 'Request Application Support',
    account: 'Account',
    // Staff Navigation
    staffDashboard: 'Dashboard',
    staffCases: 'Assigned Cases',
    staffReviewQueue: 'Review Queue',
    staffSettings: 'System Settings',
    signOut: 'Sign Out',
  },
  stages: {
    onboarding: 'Onboarding & Profile Audit',
    attestation: 'Document Legalization & Attestation',
    dossier_assembly: 'Program Selection & Dossier Assembly',
    submission: 'Staff University Portal Submission',
    decision: 'Admission Decision & Tuition Protocol',
    visa_prep: 'Consular Visa Preparation & Appointment',
    relocation: 'Pre-Departure, Travel & Settlement',
    completed: 'Matriculated & Completed',
    withdrawn: 'Application Withdrawn',
  },
  status: {
    pending: 'Pending Action',
    in_progress: 'In Progress',
    completed: 'Completed',
    blocked: 'Action Blocked',
    verified: 'Verified by Staff',
    rejected: 'Requires Correction',
    active: 'Active Case',
    on_hold: 'On Hold',
    archived: 'Archived',
  },
  overview: {
    currentStage: 'Current Procedural Stage',
    nextAction: 'Next Required Action',
    dueDate: 'Action Due Date',
    responsiblePerson: 'Responsible Person',
    lastUpdate: 'Last Updated On',
    assignedCounsellor: 'Assigned Educational Counsellor',
    noActiveDeadlines: 'No urgent deadlines pending',
  },
  drafts: {
    resumedNotice: 'A saved draft from your previous session has been loaded.',
    savedNotice: 'Your form input has been saved locally.',
    clearDraft: 'Clear Draft',
  },
};

export type TranslationKey = typeof en;

export function t<K1 extends keyof TranslationKey, K2 extends keyof TranslationKey[K1]>(
  section: K1,
  key: K2
): string {
  const value = en[section]?.[key];
  return (typeof value === 'string' ? value : String(key)) as string;
}
