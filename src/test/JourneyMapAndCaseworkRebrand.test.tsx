import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { JourneyMap } from '@/components/domain/JourneyMap';
import { JourneyTracks } from '@/components/domain/JourneyTracks';
import { JourneyStepDetailPanel } from '@/components/domain/JourneyStepDetailPanel';
import { StudentJourneyPage } from '@/pages/student/StudentJourneyPage';
import { CaseWorkflowStep, WorkflowStep, Application, StudentCase } from '@/types';
import { api } from '@/lib/api';

// Mock API for controlled tests
vi.mock('@/lib/api', () => ({
  api: {
    auth: {
      getCurrentUser: vi.fn(),
      signOut: vi.fn().mockResolvedValue({ success: true }),
    },
    student: {
      getOverviewCase: vi.fn(),
      getApplications: vi.fn(),
      getCaseWorkflowSteps: vi.fn(),
      getTasks: vi.fn().mockResolvedValue([]),
      getDocuments: vi.fn().mockResolvedValue([]),
      createTask: vi.fn(),
      completeOnboarding: vi.fn(),
    },
    workflows: {
      getTemplates: vi.fn(),
      getTemplateDetails: vi.fn(),
    },
    messages: {
      getCaseMessages: vi.fn().mockResolvedValue([]),
    },
    notifications: {
      getNotifications: vi.fn().mockResolvedValue([]),
      getUnreadCount: vi.fn().mockResolvedValue(0),
    },
  },
  formatUtcInTimezone: vi.fn((d) => d || ''),
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

// Synthetic test data
const mockCaseWorkflowSteps: CaseWorkflowStep[] = [
  {
    id: 'step-1',
    caseId: 'case-001',
    applicationId: 'app-tum-01',
    templateVersionId: 'ver-1',
    stepId: 'de-s1',
    stepKey: 'de_ua_attestation',
    title: 'HEC & MOFA Document Attestation',
    stage: 'attestation',
    responsibleActor: 'student',
    status: 'completed',
    completedAt: '2026-10-15T10:00:00Z',
    isParallel: false,
    targetOutcomeType: 'attestation',
    visibility: 'student_and_staff',
    sortOrder: 10,
  },
  {
    id: 'step-2',
    caseId: 'case-001',
    applicationId: 'app-tum-01',
    templateVersionId: 'ver-1',
    stepId: 'de-s2',
    stepKey: 'de_ua_submission',
    title: 'Uni-Assist Application & Fee Payment',
    stage: 'submission',
    responsibleActor: 'counsellor',
    status: 'in_progress',
    isParallel: false,
    targetOutcomeType: 'academic_admission',
    visibility: 'student_and_staff',
    sortOrder: 20,
  },
  {
    id: 'step-3',
    caseId: 'case-001',
    applicationId: 'app-tum-01',
    templateVersionId: 'ver-1',
    stepId: 'de-s3',
    stepKey: 'de_ua_decision',
    title: 'University Admission Offer & Enrollment Conditions',
    stage: 'decision',
    responsibleActor: 'counsellor',
    status: 'needs_action',
    isParallel: false,
    targetOutcomeType: 'academic_admission',
    visibility: 'student_and_staff',
    sortOrder: 30,
  },
  {
    id: 'step-4',
    caseId: 'case-001',
    applicationId: 'app-tum-01',
    templateVersionId: 'ver-1',
    stepId: 'de-s4',
    stepKey: 'de_ua_blocked_account',
    title: 'German Blocked Account (Sperrkonto)',
    stage: 'visa_prep',
    responsibleActor: 'student',
    status: 'blocked',
    reopenedReason: 'BAföG updated benchmark deposit proof required',
    isParallel: true,
    targetOutcomeType: 'visa_processing',
    visibility: 'student_and_staff',
    sortOrder: 40,
  },
  {
    id: 'step-5',
    caseId: 'case-001',
    applicationId: 'app-tum-01',
    templateVersionId: 'ver-1',
    stepId: 'de-s5',
    stepKey: 'de_ua_health_insurance',
    title: 'Statutory Health Insurance Policy',
    stage: 'visa_prep',
    responsibleActor: 'student',
    status: 'not_applicable',
    notApplicableReason: 'Exempt due to European reciprocal coverage agreement',
    isParallel: true,
    targetOutcomeType: 'visa_processing',
    visibility: 'student_and_staff',
    sortOrder: 50,
  },
  {
    id: 'step-6',
    caseId: 'case-001',
    applicationId: 'app-tum-01',
    templateVersionId: 'ver-1',
    stepId: 'de-s6',
    stepKey: 'de_ua_visa_filing',
    title: 'National Student Visa Filing & Biometrics',
    stage: 'visa_prep',
    responsibleActor: 'student',
    status: 'locked',
    isParallel: false,
    targetOutcomeType: 'visa_processing',
    visibility: 'student_and_staff',
    sortOrder: 60,
  },
];

const mockTemplateSteps: WorkflowStep[] = [
  {
    id: 'de-s1',
    versionId: 'ver-1',
    stepKey: 'de_ua_attestation',
    title: 'HEC & MOFA Document Attestation',
    description: 'University verification, HEC QR stamping, and MOFA authentication.',
    stage: 'attestation',
    sortOrder: 10,
    instructions: 'Submit original degree and transcripts via HEC online portal followed by in-person MOFA attestation.',
    responsibleActor: 'student',
    requiredEvidence: ['hec_attested_degree', 'mofa_authenticated_transcripts'],
    isParallel: false,
    verificationFlags: ['FLAG-012'],
    visibility: 'student_and_staff',
    targetOutcomeType: 'attestation',
    dependsOnStepKeys: [],
  },
  {
    id: 'de-s2',
    versionId: 'ver-1',
    stepKey: 'de_ua_submission',
    title: 'Uni-Assist Application & Fee Payment',
    description: 'Assemble certified copies and upload dossier to Uni-Assist portal.',
    stage: 'submission',
    sortOrder: 20,
    instructions: 'Submit application fee (€75 first choice, €30 subsequent). Verification Flag: fee schedules subject to change.',
    responsibleActor: 'counsellor',
    requiredEvidence: ['uniassist_fee_receipt'],
    isParallel: false,
    verificationFlags: ['FLAG-003'],
    visibility: 'student_and_staff',
    targetOutcomeType: 'academic_admission',
    dependsOnStepKeys: ['de_ua_attestation'],
  },
  {
    id: 'de-s4',
    versionId: 'ver-1',
    stepKey: 'de_ua_blocked_account',
    title: 'German Blocked Account (Sperrkonto)',
    description: 'Open and fund an approved German blocked account.',
    stage: 'visa_prep',
    sortOrder: 40,
    instructions: 'Deposit statutory subsistence proof. Verification Flag: BAföG statutory benchmark updates annually.',
    responsibleActor: 'student',
    requiredEvidence: ['sperrkonto_confirmation_document'],
    isParallel: true,
    verificationFlags: ['FLAG-001'],
    visibility: 'student_and_staff',
    targetOutcomeType: 'visa_processing',
    dependsOnStepKeys: ['de_ua_decision'],
  },
];

const mockStudentCase: StudentCase = {
  id: 'case-001',
  studentId: 'student-uuid-001',
  studentName: 'Amina Khan',
  targetCountry: 'germany',
  targetDegree: 'master',
  targetIntakeSeason: 'winter',
  targetIntakeYear: 2026,
  currentStage: 'submission',
  status: 'active',
  assignedCounsellorId: 'counsellor-01',
  assignedCounsellorName: 'Dr. Tariq Mahmood',
  nextRequiredAction: 'Review Uni-Assist submission dossier',
  nextActionDueDate: '2026-11-15T00:00:00Z',
  responsiblePerson: 'Student',
  lastUpdateDate: '2026-10-24T12:00:00Z',
  createdAt: '2026-09-01T00:00:00Z',
  updatedAt: '2026-10-24T12:00:00Z',
};

const mockApplications: Application[] = [
  {
    id: 'app-tum-01',
    caseId: 'case-001',
    programId: 'prog-inf-tum',
    intakeId: 'intake-w26',
    status: 'submitted_by_staff',
    submissionDeadline: '2026-11-30T00:00:00Z',
    dossierReviewStatus: 'under_counsellor_review',
    externalStatus: 'submitted',
    responsibleParty: 'counsellor',
    universitySnapshot: {
      name: 'Technical University of Munich (TUM)',
      country: 'germany',
      city: 'Munich',
    },
    programSnapshot: {
      title: 'M.Sc. Informatics',
      degree_level: 'master',
      instruction_language: 'en',
    },
    intakeSnapshot: {
      season: 'winter',
      academic_year: 2026,
      deadline_date: '2026-11-30',
    },
    lockVersion: 1,
    createdAt: '2026-09-10T00:00:00Z',
    updatedAt: '2026-10-20T00:00:00Z',
  },
  {
    id: 'app-polimi-02',
    caseId: 'case-001',
    programId: 'prog-mech-polimi',
    intakeId: 'intake-w26-it',
    status: 'drafting',
    submissionDeadline: '2026-12-15T00:00:00Z',
    dossierReviewStatus: 'pending_documents',
    externalStatus: 'not_submitted',
    responsibleParty: 'student',
    universitySnapshot: {
      name: 'Politecnico di Milano',
      country: 'italy',
      city: 'Milan',
    },
    programSnapshot: {
      title: 'M.Sc. Mechanical Engineering',
      degree_level: 'master',
      instruction_language: 'en',
    },
    intakeSnapshot: {
      season: 'winter',
      academic_year: 2026,
      deadline_date: '2026-12-15',
    },
    lockVersion: 1,
    createdAt: '2026-09-15T00:00:00Z',
    updatedAt: '2026-10-18T00:00:00Z',
  },
];

describe('Desktop Journey Map & Casework Rebrand Test Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.auth.getCurrentUser as any).mockResolvedValue({
      id: 'student-uuid-001',
      fullName: 'Amina Khan',
      email: 'amina.khan@example.com',
      role: 'managed_student',
    });
    (api.student.getOverviewCase as any).mockResolvedValue(mockStudentCase);
    (api.student.getApplications as any).mockResolvedValue(mockApplications);
    (api.student.getCaseWorkflowSteps as any).mockResolvedValue(mockCaseWorkflowSteps);
    (api.workflows.getTemplates as any).mockResolvedValue([
      { id: 'tmpl-de', countryCode: 'germany', name: 'Germany Master' },
      { id: 'tmpl-it', countryCode: 'italy', name: 'Italy Master' },
    ]);
    (api.workflows.getTemplateDetails as any).mockResolvedValue({
      template: { id: 'tmpl-de', countryCode: 'germany' },
      steps: mockTemplateSteps,
    });
  });

  describe('1. JourneyMap SVG Visual Architecture & Status Integrity', () => {
    it('renders the 3 restrained visual macro-regions: Prepare, Choose, and Move', () => {
      const onSelect = vi.fn();
      render(
        <JourneyMap
          steps={mockCaseWorkflowSteps}
          templateSteps={mockTemplateSteps}
          selectedStepId="step-2"
          onSelectStep={onSelect}
        />
      );

      expect(screen.getByText('Prepare')).toBeInTheDocument();
      expect(screen.getByText('Goals, profile and evidence')).toBeInTheDocument();
      expect(screen.getByText('Choose')).toBeInTheDocument();
      expect(screen.getByText('Explore and compare options')).toBeInTheDocument();
      expect(screen.getByText('Move')).toBeInTheDocument();
      expect(screen.getByText('Applications through arrival')).toBeInTheDocument();
    });

    it('renders the active location highlight and in-progress status', () => {
      const onSelect = vi.fn();
      render(
        <JourneyMap
          steps={mockCaseWorkflowSteps}
          templateSteps={mockTemplateSteps}
          selectedStepId="step-2"
          onSelectStep={onSelect}
        />
      );

      // In progress status must be rendered on the active node and in legend
      expect(screen.getAllByText('In progress').length).toBeGreaterThan(0);
      expect(screen.getByText('Active / In progress')).toBeInTheDocument();
    });

    it('explicitly maps statuses: completed shows Completed, blocked shows Review required (never collapsed into complete)', () => {
      const onSelect = vi.fn();
      render(
        <JourneyMap
          steps={mockCaseWorkflowSteps}
          templateSteps={mockTemplateSteps}
          selectedStepId="step-1"
          onSelectStep={onSelect}
        />
      );

      // Completed step text
      expect(screen.getAllByText('Completed').length).toBeGreaterThan(0);

      // Blocked step must display 'Review required' alert, NOT collapsed into completed
      const reviewRequiredLabels = screen.getAllByText('Review required');
      expect(reviewRequiredLabels.length).toBeGreaterThan(0);

      // Skipped step
      expect(screen.getAllByText('Skipped').length).toBeGreaterThan(0);
    });

    it('provides accessible keyboard button nodes (tabIndex=0, role=button, Enter/Space activation)', () => {
      const onSelect = vi.fn();
      render(
        <JourneyMap
          steps={mockCaseWorkflowSteps}
          templateSteps={mockTemplateSteps}
          selectedStepId="step-1"
          onSelectStep={onSelect}
        />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(mockCaseWorkflowSteps.length);

      // Verify clicking a node fires onSelectStep
      fireEvent.click(buttons[0]);
      expect(onSelect).toHaveBeenCalledWith(mockCaseWorkflowSteps[0]);

      // Verify Enter key fires onSelectStep
      fireEvent.keyDown(buttons[1], { key: 'Enter' });
      expect(onSelect).toHaveBeenCalledWith(mockCaseWorkflowSteps[1]);
    });

    it('renders the compact status legend at the bottom of the map', () => {
      const onSelect = vi.fn();
      render(
        <JourneyMap
          steps={mockCaseWorkflowSteps}
          templateSteps={mockTemplateSteps}
          selectedStepId="step-1"
          onSelectStep={onSelect}
        />
      );

      expect(screen.getByText('Blocked / Review required')).toBeInTheDocument();
      expect(screen.getByText('Skipped / N/A')).toBeInTheDocument();
      expect(screen.getByText('Not started')).toBeInTheDocument();
      expect(screen.getAllByText('Locked').length).toBeGreaterThan(0);
    });
  });

  describe('2. JourneyTracks Accessible Vertical Ordered List', () => {
    it('renders semantic ordered list grouped by Prepare, Choose, and Move', () => {
      const onSelect = vi.fn();
      render(
        <MemoryRouter>
          <JourneyTracks
            steps={mockCaseWorkflowSteps}
            templateSteps={mockTemplateSteps}
            selectedStepId="step-1"
            onSelectStep={onSelect}
            counsellorName="Dr. Tariq Mahmood"
          />
        </MemoryRouter>
      );

      expect(screen.getByText('Goals, academic profile and document evidence')).toBeInTheDocument();
      expect(screen.getByText('Explore universities, assemble dossiers and receive faculty offers')).toBeInTheDocument();
      expect(screen.getByText('Visa queue, financial guarantees, and relocation preparations')).toBeInTheDocument();
    });

    it('shows required evidence badges and action buttons for steps', () => {
      const onSelect = vi.fn();
      render(
        <MemoryRouter>
          <JourneyTracks
            steps={mockCaseWorkflowSteps}
            templateSteps={mockTemplateSteps}
            selectedStepId="step-1"
            onSelectStep={onSelect}
            counsellorName="Dr. Tariq Mahmood"
          />
        </MemoryRouter>
      );

      expect(screen.getByText('hec attested degree')).toBeInTheDocument();
      expect(screen.getByText('mofa authenticated transcripts')).toBeInTheDocument();
    });
  });

  describe('3. JourneyStepDetailPanel Real Casework Inspection', () => {
    it('renders step details, operational guidance, evidence checklist, and action button when unlocked', () => {
      const activeStep = mockCaseWorkflowSteps[0]; // HEC attestation
      const templateStep = mockTemplateSteps[0];

      render(
        <MemoryRouter>
          <JourneyStepDetailPanel
            step={activeStep}
            templateStep={templateStep}
            counsellorName="Dr. Tariq Mahmood"
          />
        </MemoryRouter>
      );

      expect(screen.getByText('HEC & MOFA Document Attestation')).toBeInTheDocument();
      expect(screen.getByText('Assigned to:')).toBeInTheDocument();
      expect(screen.getByText('Student Action')).toBeInTheDocument();
      expect(screen.getByText('Operational Guidance')).toBeInTheDocument();
      expect(screen.getByText(/Submit original degree and transcripts/)).toBeInTheDocument();
      expect(screen.getByText('Required Evidence (2)')).toBeInTheDocument();
      expect(screen.getByText('Hec Attested Degree')).toBeInTheDocument();
      expect(screen.getByText('View completed evidence')).toBeInTheDocument();
    });

    it('displays recorded reason and advisory action when step is blocked', () => {
      const blockedStep = mockCaseWorkflowSteps[3]; // German blocked account
      const templateStep = mockTemplateSteps[2];

      render(
        <MemoryRouter>
          <JourneyStepDetailPanel
            step={blockedStep}
            templateStep={templateStep}
            counsellorName="Dr. Tariq Mahmood"
          />
        </MemoryRouter>
      );

      expect(screen.getByText('Blocked / Review Required')).toBeInTheDocument();
      expect(screen.getByText(/BAföG updated benchmark deposit proof required/)).toBeInTheDocument();
      expect(screen.getByText('Message advisory team')).toBeInTheDocument();
    });

    it('explains why step is locked and provides no actionable form when locked', () => {
      const lockedStep = mockCaseWorkflowSteps[5]; // National visa filing

      render(
        <MemoryRouter>
          <JourneyStepDetailPanel
            step={lockedStep}
            templateStep={null}
            counsellorName="Dr. Tariq Mahmood"
            isLocked={true}
          />
        </MemoryRouter>
      );

      expect(screen.getByText('Milestone Locked')).toBeInTheDocument();
      expect(screen.getByText(/This milestone is currently locked/)).toBeInTheDocument();
      expect(screen.getByText('No student action required until milestone is unlocked')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Complete/i })).not.toBeInTheDocument();
    });

    it('renders empty prompt when no step is selected', () => {
      render(
        <MemoryRouter>
          <JourneyStepDetailPanel step={null} />
        </MemoryRouter>
      );

      expect(screen.getByText('Select a step to inspect')).toBeInTheDocument();
    });
  });

  describe('4. Master StudentJourneyPage Integration & View Synchronization', () => {
    it('renders quiet title, location pin banner, and view toggle (Map vs Tracks)', async () => {
      render(
        <QueryClientProvider client={createTestQueryClient()}>
          <MemoryRouter>
            <StudentJourneyPage />
          </MemoryRouter>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Your journey')).toBeInTheDocument();
      });

      expect(screen.getByText(/From preparation to arrival/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Map/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Tracks/i })).toBeInTheDocument();
    });

    it('toggles seamlessly between Map and Tracks presentations over the same workflow data', async () => {
      render(
        <QueryClientProvider client={createTestQueryClient()}>
          <MemoryRouter>
            <StudentJourneyPage />
          </MemoryRouter>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Your journey')).toBeInTheDocument();
      });

      // Default view on desktop is Map
      const tracksToggle = screen.getByRole('button', { name: /Tracks/i });
      fireEvent.click(tracksToggle);

      // Now Tracks view should display the section headings
      await waitFor(() => {
        expect(screen.getByText('Goals, academic profile and document evidence')).toBeInTheDocument();
      });

      // Switch back to Map
      const mapToggle = screen.getByRole('button', { name: /Map/i });
      fireEvent.click(mapToggle);

      await waitFor(() => {
        expect(screen.getByText('Active / In progress')).toBeInTheDocument();
      });
    });

    it('provides multi-application selector and switches application context without conflation', async () => {
      render(
        <QueryClientProvider client={createTestQueryClient()}>
          <MemoryRouter>
            <StudentJourneyPage />
          </MemoryRouter>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Your journey')).toBeInTheDocument();
      });

      expect(screen.getAllByText('Technical University of Munich (TUM)').length).toBeGreaterThan(0);
      const polimiButton = screen.getByText('Politecnico di Milano');
      expect(polimiButton).toBeInTheDocument();

      fireEvent.click(polimiButton);
      expect(api.student.getCaseWorkflowSteps).toHaveBeenCalledWith('case-001', 'app-polimi-02');
    });

    it('Scenario 1: No case with an approved template renders full locked preview without fake illustration', async () => {
      (api.student.getOverviewCase as any).mockResolvedValue(null);

      render(
        <QueryClientProvider client={createTestQueryClient()}>
          <MemoryRouter>
            <StudentJourneyPage />
          </MemoryRouter>
        </QueryClientProvider>
      );

      // Replaces oversized "No active student case found" illustration
      await waitFor(() => {
        expect(screen.getByText('Your journey')).toBeInTheDocument();
      });

      expect(screen.getByText('Template Preview · Overview')).toBeInTheDocument();
      expect(screen.getAllByText(/Your journey is waiting to be activated by the team/).length).toBeGreaterThan(0);
      expect(screen.queryByAltText('No active case illustration')).not.toBeInTheDocument();

      // Lock status indicators should be present on nodes and inspector
      expect(screen.getAllByText('Locked').length).toBeGreaterThan(0);
      expect(screen.getByText('No student action required until milestone is unlocked')).toBeInTheDocument();
    });

    it('Scenario 2: No progress / zero unlocks on an existing case shows all steps locked', async () => {
      const allLockedSteps: CaseWorkflowStep[] = mockCaseWorkflowSteps.map((s) => ({
        ...s,
        status: 'locked',
      }));
      (api.student.getCaseWorkflowSteps as any).mockResolvedValue(allLockedSteps);

      render(
        <QueryClientProvider client={createTestQueryClient()}>
          <MemoryRouter>
            <StudentJourneyPage />
          </MemoryRouter>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Your journey')).toBeInTheDocument();
      });

      expect(screen.getAllByText(/Your journey is waiting to be activated by the team/).length).toBeGreaterThan(0);
      expect(screen.getAllByText('Locked').length).toBeGreaterThan(0);
    });

    it('Scenario 3: An explicitly unlocked first step shows Available/In progress with 0 completed reported', async () => {
      const step1Unlocked: CaseWorkflowStep[] = mockCaseWorkflowSteps.map((s, idx) => ({
        ...s,
        status: idx === 0 ? 'in_progress' : 'locked',
        completedAt: undefined,
      }));
      (api.student.getCaseWorkflowSteps as any).mockResolvedValue(step1Unlocked);

      render(
        <QueryClientProvider client={createTestQueryClient()}>
          <MemoryRouter>
            <StudentJourneyPage />
          </MemoryRouter>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Your journey')).toBeInTheDocument();
      });

      // 0 of 6 milestones completed honestly reported
      expect(screen.getByText(/0 of 6 milestones completed/)).toBeInTheDocument();
      expect(document.getElementById('btn-continue-journey')).toBeInTheDocument();
    });

    it('Scenario 4: Template unavailable displays clear configuration gap notice without fabricating steps', async () => {
      (api.student.getOverviewCase as any).mockResolvedValue({
        ...mockStudentCase,
        targetCountry: 'romania',
      });
      (api.student.getApplications as any).mockResolvedValue([]);
      (api.workflows.getTemplates as any).mockResolvedValue([]); // No templates published

      render(
        <QueryClientProvider client={createTestQueryClient()}>
          <MemoryRouter>
            <StudentJourneyPage />
          </MemoryRouter>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Workflow template not yet published')).toBeInTheDocument();
      });

      expect(screen.getByText(/Administration has not published an approved workflow template/)).toBeInTheDocument();
    });

    it('Scenario 5: Failed fetch displays honest error state with Retry button (not a fake locked state)', async () => {
      const networkError = new Error('Network connection timeout');
      (networkError as any).status = 500;
      (api.student.getOverviewCase as any).mockRejectedValue(networkError);

      render(
        <QueryClientProvider client={createTestQueryClient()}>
          <MemoryRouter>
            <StudentJourneyPage />
          </MemoryRouter>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Unable to load admissions roadmap')).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /Try again/i })).toBeInTheDocument();
    });

    it('Scenario 6: Confirm viewing the map creates no case or progress records', async () => {
      (api.student.getOverviewCase as any).mockResolvedValue(null);

      render(
        <QueryClientProvider client={createTestQueryClient()}>
          <MemoryRouter>
            <StudentJourneyPage />
          </MemoryRouter>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Your journey')).toBeInTheDocument();
      });

      // Confirm no mutating API calls were made
      expect(api.student.completeOnboarding).not.toHaveBeenCalled();
      expect(api.student.createTask).not.toHaveBeenCalled();
    });

    it('links top Continue button to permitted action when journey is active', async () => {
      render(
        <QueryClientProvider client={createTestQueryClient()}>
          <MemoryRouter>
            <StudentJourneyPage />
          </MemoryRouter>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Your journey')).toBeInTheDocument();
      });

      const continueBtn = document.getElementById('btn-continue-journey');
      expect(continueBtn).toBeInTheDocument();
      expect(continueBtn?.textContent).toContain('Continue with');
    });
  });
});
