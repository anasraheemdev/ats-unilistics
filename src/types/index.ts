export type UserRole =
  | 'visitor'
  | 'explorer'
  | 'managed_student'
  | 'counsellor'
  | 'admin'
  | 'super_admin';

export type DestinationCountry = 'germany' | 'france' | 'italy' | 'romania';
// Note: 'hungary' is intentionally deferred and excluded from active type.

export type DegreeLevel = 'bachelor' | 'master' | 'doctorate' | 'preparatory';

export type CaseStage =
  | 'onboarding'
  | 'attestation'
  | 'dossier_assembly'
  | 'submission'
  | 'decision'
  | 'visa_prep'
  | 'relocation'
  | 'completed'
  | 'withdrawn';

export type CaseStatus = 'active' | 'on_hold' | 'archived';

export type DocVerificationStatus = 'pending' | 'verified' | 'rejected';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'blocked';

export type TaskAssigneeRole = 'student' | 'counsellor';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  city?: string;
  highestEducation?: string;
  targetCountry?: DestinationCountry;
  targetDegree?: DegreeLevel;
  role: UserRole;
  isActive?: boolean;
  status?: string;
  entitlements?: string[];
  createdAt: string;
  updatedAt?: string;
}

export type PublicationStatus = 'draft' | 'review' | 'published' | 'archived';

export interface University {
  id: string;
  name: string;
  originalName?: string;
  country: DestinationCountry;
  city: string;
  websiteUrl?: string;
  institutionalType: string;
  tuitionBracket: 'Free / Semester Fee' | 'Subsidized' | 'Standard Non-EU' | 'Private';
  isPreview: boolean; // True for the 50 preview universities
  isPublished: boolean;
  publicationStatus?: PublicationStatus;
  programsCount?: number;
  ranking?: string;
}

export interface Program {
  id: string;
  universityId: string;
  universityName?: string;
  country: DestinationCountry;
  title: string;
  degreeLevel: DegreeLevel;
  instructionLanguage: 'English' | 'German' | 'French' | 'Italian' | 'Romanian';
  intakeSeasons: ('winter' | 'summer')[];
  tuitionPerYearEur?: number;
  durationSemesters: number;
  applicationDeadlineText: string;
  admissionRequirementsSummary: string;
  isPreview: boolean;
  isPublished: boolean;
  publicationStatus?: PublicationStatus;
}

export interface Scholarship {
  id: string;
  title: string;
  country: DestinationCountry;
  provider: string;
  coverageType: string;
  eligibilitySummary: string;
  applicationWindowText: string;
  officialUrl?: string;
  isPublished: boolean;
  publicationStatus?: PublicationStatus;
}

export interface CatalogueCountry {
  code: string;
  name: string;
  currency: string;
  publicationStatus: PublicationStatus;
  isDeferred?: boolean;
}

export interface CatalogueIntake {
  id: string;
  programId: string;
  programName?: string;
  season: 'winter' | 'summer' | 'fall' | 'spring';
  academicYear: number;
  deadlineDate: string;
  portalOpenDate?: string;
  publicationStatus: PublicationStatus;
}

export interface StudentCase {
  id: string;
  studentId: string;
  studentName: string;
  targetCountry: DestinationCountry;
  targetDegree: DegreeLevel;
  targetIntakeSeason: 'winter' | 'summer';
  targetIntakeYear: number;
  currentStage: CaseStage;
  status: CaseStatus;
  onboardingStatus?: 'pending' | 'completed';
  onboardingCompletedAt?: string;
  studyPreferences?: StudentStudyPreferences;
  assignedCounsellorId?: string;
  assignedCounsellorName?: string;
  assignedCounsellorEmail?: string;
  nextRequiredAction: string;
  nextActionDueDate: string;
  responsiblePerson: string; // e.g. "Student (Muhammad Ali)" or "Counsellor (Sara Ahmed)"
  lastUpdateDate: string;
  notes?: string;
  lockVersion?: number;
  createdAt: string;
  updatedAt: string;
}

export interface StudentStudyPreferences {
  targetCountries: DestinationCountry[];
  targetDegree: DegreeLevel;
  targetIntakes: string[];
  budgetPerYearEur?: number;
  fundingSource?: 'self_funded' | 'scholarship' | 'sponsor' | 'bank_loan';
  disciplineInterests?: string[];
  highestQualification?: string;
  gpaOrPercentage?: string;
  englishProficiency?: 'ielts' | 'toefl' | 'duolingo' | 'in_progress' | 'none';
  englishTestScore?: string;
  passportStatus?: 'valid' | 'expiring_soon' | 'in_process';
  additionalNotes?: string;
}

export type ApplicationStatus =
  | 'drafting'
  | 'ready_to_submit'
  | 'submitted_by_staff'
  | 'awaiting_decision'
  | 'conditional_offer'
  | 'unconditional_offer'
  | 'accepted_offer'
  | 'rejected'
  | 'withdrawn'
  | 'deferred'
  | 'visa_processing'
  | 'visa_approved'
  | 'visa_refused'
  | 'visa_administrative_processing';

export type ExternalApplicationStatus =
  | 'not_submitted'
  | 'submitted'
  | 'awaiting_decision'
  | 'conditional_offer'
  | 'unconditional_offer'
  | 'accepted_offer'
  | 'rejected'
  | 'withdrawn'
  | 'deferred'
  | 'visa_processing'
  | 'visa_approved'
  | 'visa_refused'
  | 'visa_administrative_processing';

export type DossierReviewStatus =
  | 'pending_documents'
  | 'under_counsellor_review'
  | 'dossier_approved'
  | 'revision_requested';

export type DecisionOutcomeType =
  | 'conditional_offer'
  | 'unconditional_offer'
  | 'accepted_offer'
  | 'rejected'
  | 'withdrawn'
  | 'deferred'
  | 'visa_approved'
  | 'visa_refused'
  | 'visa_administrative_processing';

export interface ApplicationSnapshotUniversity {
  id?: string;
  name: string;
  country: string;
  city: string;
  website_url?: string;
  tuition_notes?: string;
  snapshotted_at?: string;
}

export interface ApplicationSnapshotProgram {
  id?: string;
  title: string;
  degree_level: string;
  instruction_language: string;
  tuition_per_year_eur?: number;
  duration_semesters?: number;
  admission_requirements_summary?: string;
  snapshotted_at?: string;
}

export interface ApplicationSnapshotIntake {
  id?: string;
  season: string;
  academic_year: number;
  deadline_date: string;
  snapshotted_at?: string;
}

export interface Application {
  id: string;
  caseId: string;
  programId: string;
  intakeId: string;
  status: ApplicationStatus;
  submissionDeadline: string;
  submittedAt?: string;
  portalApplicationNumber?: string;
  portalUrl?: string;
  portalAccountEmail?: string;
  offerConditions?: string;
  dossierReviewStatus: DossierReviewStatus;
  dossierReviewNotes?: string;
  externalStatus: ExternalApplicationStatus;
  externalStatusReportedBy?: string;
  externalStatusReportedByName?: string;
  externalStatusReportedAt?: string;
  externalEvidenceReference?: string;
  decisionOutcomeType?: DecisionOutcomeType;
  decisionReason?: string;
  deferralTargetIntake?: string;
  nextAction?: string;
  nextActionDueDate?: string;
  responsibleParty: 'student' | 'counsellor' | 'university' | 'embassy';
  universitySnapshot: ApplicationSnapshotUniversity;
  programSnapshot: ApplicationSnapshotProgram;
  intakeSnapshot: ApplicationSnapshotIntake;
  lockVersion: number;
  lastStaffUpdateBy?: string;
  lastStaffUpdateByName?: string;
  lastStaffUpdateAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationHistoryItem {
  id: string;
  applicationId: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  eventType: 'created' | 'status_transition' | 'external_report' | 'correction' | 'reassignment';
  fromStatus?: string;
  toStatus?: string;
  reason?: string;
  evidenceReference?: string;
  reportedAt: string;
  isInternalOnly: boolean;
  payload?: Record<string, any>;
  createdAt: string;
}

export type QuarantineStatus =
  | 'uploaded_quarantined'
  | 'quarantine_scanning'
  | 'ready_for_review'
  | 'malware_detected'
  | 'approved'
  | 'needs_replacement'
  | 'rejected';

export type DocumentReviewAction = 'approved' | 'needs_replacement' | 'rejected';

export interface DocumentVersion {
  id: string;
  documentId: string;
  versionNumber: number;
  objectKey: string;
  storagePath: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  magicSignature?: 'pdf' | 'jpeg' | 'png' | null;
  contentSha256?: string | null;
  quarantineStatus: QuarantineStatus;
  isLatest: boolean;
  uploadedBy: string;
  uploadedAt: string;
}

export interface DocumentUploadSession {
  success: boolean;
  documentId: string;
  versionNumber: number;
  objectKey: string;
  storagePath: string;
  bucketId: string;
  safeDisplayName: string;
  quarantineStatus: QuarantineStatus;
  message: string;
}

export interface AuthorizedDownloadTicket {
  success: boolean;
  documentId: string;
  versionNumber: number;
  storagePath: string;
  bucketId: string;
  safeDisplayName: string;
  mimeType: string;
  expiresInSeconds: number;
  contentDisposition: string;
  downloadUrl?: string;
  securityNotice: string;
}

export interface CaseDocument {
  id: string;
  caseId: string;
  studentId: string;
  documentType: string;
  title: string;
  fileName: string;
  safeDisplayName?: string;
  fileSizeBytes: number;
  mimeType: string;
  verificationStatus: DocVerificationStatus;
  quarantineStatus: QuarantineStatus;
  quarantineScannedAt?: string | null;
  scanEngine?: string | null;
  scanSignature?: string | null;
  verificationNotes?: string;
  replacementInstructions?: string | null;
  verifiedBy?: string;
  verifiedAt?: string;
  uploadedAt: string;
  currentVersionNumber?: number;
  versionsCount?: number;
  versions?: DocumentVersion[];
}

export interface CaseTask {
  id: string;
  caseId: string;
  title: string;
  description?: string;
  assignedToRole: TaskAssigneeRole;
  status: TaskStatus;
  dueDate: string;
  completedAt?: string;
  createdAt: string;
}

export interface CaseMessage {
  id: string;
  caseId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  messageBody: string;
  isInternalStaffNote: boolean;
  attachmentDocumentId?: string;
  attachmentFileName?: string;
  attachmentDocumentTitle?: string;
  attachmentQuarantineStatus?: QuarantineStatus;
  createdAt: string;
}

export type AccessRequestStatus =
  | 'submitted'
  | 'email_verification_pending'
  | 'pending_review'
  | 'needs_information'
  | 'approved'
  | 'rejected'
  | 'withdrawn';

export interface AccessRequest {
  id: string;
  userId?: string | null;
  fullName: string;
  email: string;
  phone?: string | null;
  countryInterests?: DestinationCountry[];
  targetCountry?: DestinationCountry;
  targetDegree?: DegreeLevel;
  requestType: 'explorer_catalogue' | 'managed_application_case';
  consentPrivacy?: boolean;
  isUpgrade?: boolean;
  status: AccessRequestStatus;
  staffExplanation?: string | null;
  studentMessage?: string | null;
  internalNotes?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  activationToken?: string | null;
  outboxDeliveryStatus?: 'queued' | 'sent' | 'failed' | 'simulated';
  createdAt: string;
  updatedAt?: string;
}

export interface OutboxEmailItem {
  id: string;
  requestId?: string | null;
  userId?: string | null;
  recipientEmail: string;
  emailType: 'email_verification' | 'activation_invite' | 'needs_information' | 'rejection' | 'password_recovery';
  subject: string;
  bodyText: string;
  linkUrl?: string | null;
  deliveryStatus: 'queued' | 'sent' | 'failed' | 'simulated';
  deliveryError?: string | null;
  retryCount: number;
  lastAttemptAt?: string | null;
  createdAt: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
  is_preview_restricted?: boolean;
  is_gated?: boolean;
  cta_message?: string;
}

export interface CatalogueUniversityItem {
  id: string;
  country_code: string;
  country_name: string;
  name: string;
  native_name?: string;
  city: string;
  institution_type: string;
  ranking_indicative?: number;
  total_programs_count: number;
}

export interface CatalogueProgramItem {
  id: string;
  university_id: string;
  university_name: string;
  country_code: string;
  country_name: string;
  program_name: string;
  degree_level: DegreeLevel;
  teaching_language: 'en' | 'de' | 'fr' | 'it' | 'ro' | string;
  tuition_type: 'free' | 'subsidized' | 'standard_non_eu' | 'private';
  annual_tuition_eur: number;
  application_portal: string;
  verified_date?: string | null;
  source_url?: string | null;
  next_intake_deadline?: string | null;
  is_bookmarked?: boolean;
}

export interface CatalogueScholarshipItem {
  id: string;
  country_code: string;
  country_name: string;
  name: string;
  provider: string;
  degree_level: string;
  coverage_type: string;
  stipend_amount_eur?: number | null;
  annual_deadline_date?: string | null;
  verified_date?: string | null;
  source_url?: string | null;
}

export interface BookmarkToggleResult {
  success: boolean;
  is_bookmarked: boolean;
  program_id: string;
}

export interface CatalogueImportRowError {
  row: number;
  field?: string;
  error: string;
}

export interface CatalogueImportBatch {
  id: string;
  importType: 'universities' | 'programs' | 'scholarships' | 'intakes' | 'countries';
  sourceUrl?: string;
  fetchedDate: string;
  reviewedDate?: string;
  reviewerId?: string;
  totalRows: number;
  validRows: number;
  errorRows: number;
  status: 'pending' | 'validating' | 'dry_run_passed' | 'applied' | 'failed' | 'rolled_back';
  rowErrors: CatalogueImportRowError[];
  createdBy?: string;
  createdAt: string;
}

export interface CatalogueImportDryRunResult {
  success: boolean;
  batch_id: string;
  is_dry_run: boolean;
  total_rows: number;
  valid_rows: number;
  error_rows: number;
  row_errors: CatalogueImportRowError[];
}

export interface CatalogueExportResult {
  success: boolean;
  entity_type: string;
  data: any[];
}

export type WorkflowStepStatus =
  | 'not_applicable'
  | 'blocked'
  | 'needs_action'
  | 'in_progress'
  | 'completed'
  | 'reopened'
  | 'locked'
  | 'available'
  | 'pending';

export interface WorkflowTemplate {
  id: string;
  countryCode: string;
  degreeLevel: string;
  applicationRoute: string;
  intakeSeason: string;
  jurisdiction: string;
  name: string;
  description: string;
  publicationStatus: PublicationStatus;
  reviewStatus: 'unreviewed' | 'in_review' | 'staff_verified' | 'deprecated';
  sourceFile?: string;
  sourceSection?: string;
  provenance: Record<string, any>;
  versionNumber?: number;
  stepsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowStep {
  id: string;
  versionId: string;
  stepKey: string;
  title: string;
  description: string;
  stage: CaseStage;
  sortOrder: number;
  instructions: string;
  responsibleActor: 'student' | 'counsellor' | 'agency' | 'external_authority';
  applicability?: Record<string, any>;
  requiredEvidence: string[];
  isParallel: boolean;
  verificationFlags: string[];
  sourceFile?: string;
  sourceSection?: string;
  visibility: 'student_and_staff' | 'staff_only';
  targetOutcomeType: 'academic_admission' | 'visa_processing' | 'scholarship' | 'attestation';
  dependsOnStepKeys?: string[];
}

export interface CaseWorkflowStep {
  id: string;
  caseId: string;
  applicationId?: string;
  templateVersionId: string;
  stepId: string;
  stepKey: string;
  title: string;
  stage: CaseStage;
  responsibleActor: 'student' | 'counsellor' | 'agency' | 'external_authority';
  status: WorkflowStepStatus;
  notApplicableReason?: string;
  reopenedReason?: string;
  dueDate?: string;
  completedAt?: string;
  completedBy?: string;
  reopenedAt?: string;
  reopenedBy?: string;
  evidenceMetadata?: Record<string, any>;
  isParallel: boolean;
  targetOutcomeType: 'academic_admission' | 'visa_processing' | 'scholarship' | 'attestation';
  visibility: 'student_and_staff' | 'staff_only';
  sortOrder: number;
}

export interface WorkflowMigrationPreview {
  targetVersionId: string;
  caseId: string;
  applicationId?: string;
  addedSteps: { step_key: string; title: string; stage: string }[];
  removedSteps: { step_key: string; title: string; status: string }[];
  completedPreserved: { step_key: string; title: string }[];
}

export interface OperationalWorkspaceMetrics {
  requestsAwaitingReview: number;
  unassignedCases: number;
  overdueTasks: number;
  documentsAwaitingReview: number;
  casesWithoutRecentUpdates: number;
  failedNotifications: number;
  userRole: 'admin' | 'counsellor';
  calculatedAt: string;
}

export type OperationalWorklistCategory =
  | 'requests_awaiting_review'
  | 'unassigned_cases'
  | 'overdue_tasks'
  | 'documents_awaiting_review'
  | 'cases_without_recent_updates'
  | 'failed_notifications';

export interface OperationalWorklistItem {
  id: string;
  category: OperationalWorklistCategory;
  title: string;
  subtitle: string;
  badgeText: string;
  badgeVariant: 'primary' | 'secondary' | 'warning' | 'danger' | 'success' | 'outline';
  detailLine: string;
  timestamp: string;
  caseId?: string;
  actionUrl?: string;
  raw: Record<string, any>;
}

export type SupportRequestCategory =
  | 'general'
  | 'technical'
  | 'catalogue'
  | 'onboarding'
  | 'visa_guidance'
  | 'billing_inquiry';

export type SupportRequestStatus =
  | 'open'
  | 'in_progress'
  | 'waiting_on_user'
  | 'resolved'
  | 'closed';

export type SupportRequestPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface SupportRequest {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  subject: string;
  category: SupportRequestCategory;
  status: SupportRequestStatus;
  priority: SupportRequestPriority;
  assignedTo?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SupportMessage {
  id: string;
  requestId: string;
  senderId: string;
  senderName?: string;
  messageBody: string;
  isStaffReply: boolean;
  createdAt: string;
}

export type OutboxDeliveryState =
  | 'queued'
  | 'processing'
  | 'provider_accepted'
  | 'delivered'
  | 'failed'
  | 'dead_letter';

export type OutboxTemplateType =
  | 'approval'
  | 'information_requested'
  | 'document_review'
  | 'task_due'
  | 'stage_change'
  | 'new_message'
  | 'account_security'
  | 'general';

export interface DurableOutboxItem {
  id: string;
  eventType: string;
  recipientEmail: string;
  subject: string;
  templateType: OutboxTemplateType;
  status: OutboxDeliveryState;
  idempotencyKey?: string | null;
  retryCount: number;
  maxRetries: number;
  nextRetryAt?: string | null;
  lastError?: string | null;
  providerName?: string | null;
  providerMessageId?: string | null;
  deliveredAt?: string | null;
  failedAt?: string | null;
  createdAt: string;
}

export interface NotificationPreference {
  userId: string;
  emailNotifications: boolean;
  inAppNotifications: boolean;
  taskReminders: boolean;
  caseUpdates: boolean;
  userTimezone: string;
  updatedAt: string;
}

export interface InAppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  linkUrl?: string | null;
  eventType?: string | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}

export type HelpArticleTopic =
  | 'attestation'
  | 'admissions'
  | 'language_proficiency'
  | 'blocked_account'
  | 'visa_processing'
  | 'pre_enrollment'
  | 'apostille_and_legalization'
  | 'health_insurance'
  | 'arrival_and_residence'
  | 'general';

export type HelpArticleEditorialStatus = 'draft' | 'in_review' | 'published' | 'archived';
export type HelpArticleVerificationStatus = 'verified' | 'provisional' | 'unverified';

export interface HelpArticle {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  countryCode: 'de' | 'fr' | 'it' | 'ro' | 'all';
  topic: HelpArticleTopic;
  degreeLevelApplicability: 'bachelors' | 'masters' | 'all';
  stageApplicability?: string | null;
  documentCategoryApplicability?: string | null;
  sourceFile: string;
  sourceSection: string;
  officialSourceUrl?: string | null;
  verificationStatus: HelpArticleVerificationStatus;
  editorialStatus: HelpArticleEditorialStatus;
  version: number;
  authorId?: string | null;
  reviewerId?: string | null;
  lastReviewedAt?: string | null;
  isStale?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContextualHelpItem {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  countryCode: string;
  topic: string;
  sourceFile: string;
  sourceSection: string;
  officialSourceUrl?: string | null;
  verificationStatus: HelpArticleVerificationStatus;
  lastReviewedAt?: string | null;
  isStale?: boolean;
}

export interface AiAssistantMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  citedArticles?: {
    slug: string;
    title: string;
    sourceSection: string;
    officialSourceUrl?: string | null;
  }[];
  isUnknown?: boolean;
  requiresHumanEscalation?: boolean;
  timestamp: string;
}

export interface AiAssistantConfig {
  enabled: boolean;
  modelName: string;
  maxHourlyQueries: number;
  providerStatus: 'unconfigured' | 'evaluating' | 'ready';
  blockerReason: string;
}


