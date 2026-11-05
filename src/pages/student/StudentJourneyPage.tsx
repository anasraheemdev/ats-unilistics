import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { StudentJourneyNav } from '@/components/layout/StudentJourneyNav';
import { JourneyMap, getStepChapterLabel } from '@/components/domain/JourneyMap';
import { JourneyTracks } from '@/components/domain/JourneyTracks';
import { JourneyStepDetailPanel } from '@/components/domain/JourneyStepDetailPanel';
import { CaseWorkflowStep, Application, WorkflowStep, CaseStage } from '@/types';
import { Link } from 'react-router-dom';
import {
  Map as MapIcon,
  ListOrdered,
  MapPin,
  ArrowRight,
  Building2,
  Lock,
  Info,
} from 'lucide-react';

// Approved 10-chapter reference blueprint for non-personalized overview
const REFERENCE_OVERVIEW_STEPS: {
  id: string;
  stepKey: string;
  title: string;
  stage: CaseStage;
  chapter: string;
  description: string;
  instructions: string;
  requiredEvidence: string[];
  sortOrder: number;
}[] = [
  {
    id: 'ref-step-1',
    stepKey: 'ref_study_goals',
    title: 'Study goals',
    stage: 'onboarding',
    chapter: 'Study goals',
    description: 'Target country selection, degree level definition, and academic intake horizon.',
    instructions: 'Define your desired country corridor (Germany, France, Italy, or Romania), degree discipline, and intake session with your counsellor.',
    requiredEvidence: ['academic_intake_preference'],
    sortOrder: 10,
  },
  {
    id: 'ref-step-2',
    stepKey: 'ref_profile',
    title: 'Your profile',
    stage: 'onboarding',
    chapter: 'Your profile',
    description: 'Academic background verification, GPA conversion, and language proficiency check.',
    instructions: 'Upload verified transcripts, grading scale benchmarks, and English or European language scores for preliminary evaluation.',
    requiredEvidence: ['transcripts_preliminary', 'language_certificate'],
    sortOrder: 20,
  },
  {
    id: 'ref-step-3',
    stepKey: 'ref_documents',
    title: 'Documents',
    stage: 'attestation',
    chapter: 'Documents',
    description: 'Statutory HEC & MOFA attestation, certified translations, and notarized document bundles.',
    instructions: 'Obtain statutory QR-code attestation from HEC and apostille/authentication from the Ministry of Foreign Affairs.',
    requiredEvidence: ['hec_attested_degree', 'mofa_authenticated_transcripts'],
    sortOrder: 30,
  },
  {
    id: 'ref-step-4',
    stepKey: 'ref_discover',
    title: 'Discover options',
    stage: 'dossier_assembly',
    chapter: 'Discover options',
    description: 'Explore accredited public university degree programs, tuition models, and admission quotas.',
    instructions: 'Review curriculum modules, faculty entrance prerequisites, and language certifications across target university departments.',
    requiredEvidence: [],
    sortOrder: 40,
  },
  {
    id: 'ref-step-5',
    stepKey: 'ref_shortlist',
    title: 'Your shortlist',
    stage: 'dossier_assembly',
    chapter: 'Your shortlist',
    description: 'Select primary and secondary target programs approved with your assigned counsellor.',
    instructions: 'Confirm final university choices and ensure deadlined application windows are locked into your casework schedule.',
    requiredEvidence: ['shortlist_selection_signoff'],
    sortOrder: 50,
  },
  {
    id: 'ref-step-6',
    stepKey: 'ref_applications',
    title: 'Applications',
    stage: 'submission',
    chapter: 'Applications',
    description: 'Official university portal or centralized clearing house (Uni-Assist / EEF) submission.',
    instructions: 'Your assigned counsellor reviews and formally submits application dossiers through institutional university portals.',
    requiredEvidence: ['submission_fee_receipt', 'portal_submission_confirmation'],
    sortOrder: 60,
  },
  {
    id: 'ref-step-7',
    stepKey: 'ref_offers',
    title: 'Offers',
    stage: 'decision',
    chapter: 'Offers',
    description: 'Faculty admission decisions, conditional offer letters, and enrollment terms.',
    instructions: 'Awaiting faculty evaluation. Upon receipt of admission, verify conditional requirements and tuition deposit instructions.',
    requiredEvidence: ['university_offer_letter'],
    sortOrder: 70,
  },
  {
    id: 'ref-step-8',
    stepKey: 'ref_visa',
    title: 'Visa',
    stage: 'visa_prep',
    chapter: 'Visa',
    description: 'Consular visa appointment, blocked account subsistence funding, and statutory health insurance.',
    instructions: 'Establish mandatory statutory subsistence proof (Sperrkonto / bank guarantee) and attend the Embassy visa interview.',
    requiredEvidence: ['financial_guarantee_proof', 'visa_application_receipt'],
    sortOrder: 80,
  },
  {
    id: 'ref-step-9',
    stepKey: 'ref_departure',
    title: 'Departure',
    stage: 'relocation',
    chapter: 'Departure',
    description: 'Pre-departure briefing, student flight arrangements, and temporary accommodation.',
    instructions: 'Finalize travel dates, transit documentation, and arrange initial student housing near your university campus.',
    requiredEvidence: ['flight_booking', 'accommodation_proof'],
    sortOrder: 90,
  },
  {
    id: 'ref-step-10',
    stepKey: 'ref_arrival',
    title: 'Arrival',
    stage: 'relocation',
    chapter: 'Arrival',
    description: 'In-person university enrollment, city registration (Bürgeramt), and residence permit.',
    instructions: 'Complete matriculation at the international office and register your residential address with local civil authorities.',
    requiredEvidence: ['matriculation_certificate', 'residence_registration'],
    sortOrder: 100,
  },
];

export const StudentJourneyPage: React.FC = () => {
  // View toggle: Desktop default 'map', small screens default 'tracks'
  const [viewMode, setViewMode] = useState<'map' | 'tracks'>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return 'tracks';
    }
    return 'map';
  });

  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);

  // 1. Fetch Student Case
  const {
    data: studentCase,
    isLoading: caseLoading,
    error: caseError,
    refetch: refetchCase,
  } = useQuery({
    queryKey: ['student-journey-case'],
    queryFn: () => api.student.getOverviewCase(),
    retry: false,
  });

  const caseId = studentCase?.id || '';

  // 2. Fetch Applications for this case
  const {
    data: applications = [],
    isLoading: appsLoading,
  } = useQuery({
    queryKey: ['student-applications', caseId],
    queryFn: () => api.student.getApplications(),
    enabled: Boolean(caseId),
    retry: false,
  });

  useEffect(() => {
    if (applications.length > 0 && !selectedApplicationId) {
      setSelectedApplicationId(applications[0].id);
    }
  }, [applications, selectedApplicationId]);

  const activeApplication: Application | undefined = applications.find(
    (app) => app.id === selectedApplicationId
  ) || applications[0];

  // 3. Fetch Case Workflow Steps for the selected application
  const {
    data: rawCaseSteps = [],
    isLoading: stepsLoading,
    error: stepsError,
    refetch: refetchSteps,
  } = useQuery({
    queryKey: ['case-workflow-steps', caseId, activeApplication?.id],
    queryFn: () => api.student.getCaseWorkflowSteps(caseId, activeApplication?.id),
    enabled: Boolean(caseId),
    retry: false,
  });

  // 4. Fetch Available Country Templates
  const {
    data: templates = [],
    isLoading: templatesLoading,
    error: templatesError,
    refetch: refetchTemplates,
  } = useQuery({
    queryKey: ['workflow-templates-list'],
    queryFn: () => api.workflows.getTemplates(),
    retry: false,
  });

  // Determine country corridor
  const countryCode =
    activeApplication?.universitySnapshot?.country?.toLowerCase() ||
    studentCase?.targetCountry?.toLowerCase() ||
    '';

  // Matched template from published templates
  const matchedTemplate = countryCode
    ? templates.find((t) => t.countryCode?.toLowerCase() === countryCode)
    : templates[0];

  // 5. Fetch Full Template Steps
  const {
    data: templateData,
    isLoading: templateDetailsLoading,
  } = useQuery({
    queryKey: ['workflow-template-country', matchedTemplate?.id],
    queryFn: async () => {
      if (matchedTemplate?.id) {
        return api.workflows.getTemplateDetails(matchedTemplate.id);
      }
      return null;
    },
    enabled: Boolean(matchedTemplate?.id),
    retry: false,
  });

  const templateSteps: WorkflowStep[] = templateData?.steps || [];

  // Adapt view on small screen resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && viewMode === 'map') {
        setViewMode('tracks');
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode]);

  // Network / Fetch error state (honest failure handling)
  const isNetworkError = Boolean(
    (caseError && (caseError as any).status !== 404 && !(caseError as any).message?.includes('not found')) ||
    stepsError ||
    templatesError
  );

  if (isNetworkError) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <StudentJourneyNav />
        <ErrorState
          title="Unable to load admissions roadmap"
          message="A network or service communication error occurred while fetching your milestone records. No local data was changed."
          onRetry={() => {
            refetchCase();
            refetchSteps();
            refetchTemplates();
          }}
        />
      </div>
    );
  }

  // Loading state
  const isGlobalLoading = caseLoading || appsLoading || stepsLoading || templatesLoading || templateDetailsLoading;
  if (isGlobalLoading) {
    return <LoadingState message="Loading your admissions and visa journey..." />;
  }

  // --------------------------------------------------------------------------
  // Concept Separation: Template Preview vs. Active Student Case
  // --------------------------------------------------------------------------
  const isPreview = !studentCase;
  const isNonPersonalized = isPreview && !countryCode;

  // Check if an approved template is unavailable when a specific country was targeted
  const isTemplateUnavailable = Boolean(countryCode && !matchedTemplate && !isPreview);

  if (isTemplateUnavailable) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', fontFamily: 'var(--font-family-base, "DM Sans", sans-serif)' }}>
        <StudentJourneyNav />
        <div
          style={{
            padding: '2rem',
            backgroundColor: 'var(--dark-card, #122017)',
            borderRadius: '24px',
            border: '1px solid var(--dark-border, #1F3325)',
            color: 'var(--dark-text-crisp, #F2F7F4)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'rgba(215, 238, 131, 0.1)',
              color: 'var(--brand-citron, #D7EE83)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Info size={24} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
            Workflow template not yet published
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--dark-text-muted, #8DA394)', maxWidth: '520px', margin: 0, lineHeight: 1.5 }}>
            Administration has not published an approved workflow template for the {countryCode.toUpperCase()} destination corridor. Your assigned counsellor will configure your statutory milestones once statutory guidelines are reviewed.
          </p>
        </div>
      </div>
    );
  }

  // Synthesize steps according to state
  let effectiveSteps: CaseWorkflowStep[] = [];
  let isAllLocked = false;

  if (isPreview) {
    // Managed user without an active case: read-only template preview with every step locked
    isAllLocked = true;
    if (templateSteps.length > 0) {
      effectiveSteps = templateSteps.map((ts, idx) => ({
        id: `preview-${ts.id}`,
        caseId: 'preview-case',
        templateVersionId: ts.versionId,
        stepId: ts.id,
        stepKey: ts.stepKey,
        title: ts.title,
        stage: ts.stage,
        responsibleActor: ts.responsibleActor,
        status: 'locked' as any,
        isParallel: ts.isParallel,
        targetOutcomeType: ts.targetOutcomeType,
        visibility: ts.visibility,
        sortOrder: ts.sortOrder || (idx + 1) * 10,
        evidenceMetadata: {},
      }));
    } else {
      // 10-chapter reference overview
      effectiveSteps = REFERENCE_OVERVIEW_STEPS.map((r, idx) => ({
        id: r.id,
        caseId: 'preview-case',
        templateVersionId: 'ver-preview',
        stepId: r.id,
        stepKey: r.stepKey,
        title: r.title,
        stage: r.stage,
        responsibleActor: 'student',
        status: 'locked' as any,
        isParallel: r.chapter === 'Visa' && idx > 7,
        targetOutcomeType: 'academic_admission',
        visibility: 'student_and_staff',
        sortOrder: r.sortOrder,
        evidenceMetadata: {},
      }));
    }
  } else {
    // Student case exists: check persisted authorization
    const caseSteps = rawCaseSteps;
    const hasUnlocks = caseSteps.some((s) => s.status === 'in_progress' || s.status === 'needs_action' || s.status === 'completed' || s.status === 'available');

    if (caseSteps.length === 0 || !hasUnlocks) {
      // Case exists but journey has not started / 0 unlocks
      isAllLocked = true;
      if (templateSteps.length > 0) {
        effectiveSteps = templateSteps.map((ts, idx) => ({
          id: `locked-${ts.id}`,
          caseId: studentCase.id,
          templateVersionId: ts.versionId,
          stepId: ts.id,
          stepKey: ts.stepKey,
          title: ts.title,
          stage: ts.stage,
          responsibleActor: ts.responsibleActor,
          status: 'locked' as any,
          isParallel: ts.isParallel,
          targetOutcomeType: ts.targetOutcomeType,
          visibility: ts.visibility,
          sortOrder: ts.sortOrder || (idx + 1) * 10,
          evidenceMetadata: {},
        }));
      } else {
        effectiveSteps = caseSteps.map((s) => ({ ...s, status: 'locked' as any }));
      }
    } else {
      // Real persisted authorization wins
      effectiveSteps = caseSteps;
    }
  }

  // Active step for banner and default inspection
  const currentActiveStep = !isAllLocked
    ? effectiveSteps.find((s) => s.status === 'in_progress') ||
      effectiveSteps.find((s) => s.status === 'needs_action') ||
      effectiveSteps.find((s) => s.status === 'available') ||
      effectiveSteps.find((s) => s.status !== 'completed' && s.status !== 'not_applicable') ||
      effectiveSteps[0]
    : effectiveSteps[0];

  const inspectedStep: CaseWorkflowStep | null =
    effectiveSteps.find((s) => s.id === selectedStepId) || currentActiveStep || null;

  const inspectedTemplateStep = inspectedStep
    ? templateSteps.find((ts) => ts.stepKey === inspectedStep.stepKey || ts.id === inspectedStep.stepId) ||
      (REFERENCE_OVERVIEW_STEPS.find((r) => r.stepKey === inspectedStep.stepKey) as any)
    : null;

  // Completion metric calculation (honest, non-fabricated)
  const completedCount = isAllLocked ? 0 : effectiveSteps.filter((s) => s.status === 'completed').length;
  const totalCount = effectiveSteps.length;

  // Last-saved date derivation
  const lastSavedFormatted = studentCase?.updatedAt
    ? new Date(studentCase.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Not yet saved';

  // Action link for top Continue button (when unlocked)
  const continueActionUrl =
    currentActiveStep?.targetOutcomeType === 'attestation'
      ? '/student/documents'
      : currentActiveStep?.responsibleActor === 'student'
      ? '/student/tasks'
      : '/student/documents';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.75rem',
        fontFamily: 'var(--font-family-base, "DM Sans", sans-serif)',
      }}
    >
      {/* 1. Casework Subnavigation (Applications, Documents, Tasks, Messages) */}
      <StudentJourneyNav />

      {/* 2. Top Header & Journey Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1.25rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.35rem' }}>
            <h1
              style={{
                fontSize: 'clamp(1.75rem, 3.5vw, 2.25rem)',
                fontWeight: 800,
                color: 'var(--color-foreground, #19261F)',
                letterSpacing: '-0.025em',
                margin: 0,
              }}
            >
              Your journey
            </h1>

            {isPreview && (
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '0.2rem 0.625rem',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(215, 238, 131, 0.15)',
                  color: 'var(--action-primary, #245B42)',
                  border: '1px solid rgba(36, 91, 66, 0.25)',
                }}
              >
                {isNonPersonalized ? 'Template Preview · Overview' : 'Template Preview'}
              </span>
            )}
          </div>

          <p
            style={{
              fontSize: '0.9375rem',
              color: 'var(--color-foreground-muted, #58695E)',
              margin: 0,
              maxWidth: '680px',
              lineHeight: 1.45,
            }}
          >
            {isAllLocked ? (
              <span style={{ fontWeight: 600, color: 'var(--action-primary, #245B42)' }}>
                From preparation to arrival. Your journey is waiting to be activated by the team.
              </span>
            ) : (
              <span>
                From preparation to arrival. {completedCount} of {totalCount} milestones completed. Procedural pathway across your target university admission and visa requirements.
              </span>
            )}
          </p>
        </div>

        {/* View Switcher: Map vs Tracks */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div
            role="group"
            aria-label="Journey view options"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.25rem',
              backgroundColor: 'var(--surface-recessed, #EDF2E9)',
              borderRadius: 'var(--radius-pill, 9999px)',
              border: '1px solid var(--border-subtle, #E1E8DE)',
            }}
          >
            <button
              type="button"
              id="view-toggle-map"
              aria-pressed={viewMode === 'map'}
              onClick={() => setViewMode('map')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.4rem 1rem',
                borderRadius: 'var(--radius-pill, 9999px)',
                fontSize: '0.8125rem',
                fontWeight: viewMode === 'map' ? 700 : 500,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: viewMode === 'map' ? 'var(--brand-citron, #D7EE83)' : 'transparent',
                color: viewMode === 'map' ? '#19261F' : 'var(--text-ink, #19261F)',
                transition: 'all 150ms ease-out',
              }}
            >
              <MapIcon size={15} />
              <span>Map</span>
            </button>

            <button
              type="button"
              id="view-toggle-tracks"
              aria-pressed={viewMode === 'tracks'}
              onClick={() => setViewMode('tracks')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.4rem 1rem',
                borderRadius: 'var(--radius-pill, 9999px)',
                fontSize: '0.8125rem',
                fontWeight: viewMode === 'tracks' ? 700 : 500,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: viewMode === 'tracks' ? 'var(--brand-citron, #D7EE83)' : 'transparent',
                color: viewMode === 'tracks' ? '#19261F' : 'var(--text-ink, #19261F)',
                transition: 'all 150ms ease-out',
              }}
            >
              <ListOrdered size={15} />
              <span>Tracks</span>
            </button>
          </div>

          {/* Top Continue button (only shown when journey is unlocked and active step is actionable) */}
          {!isAllLocked && currentActiveStep && (
            <Link to={continueActionUrl} style={{ textDecoration: 'none' }}>
              <button
                type="button"
                id="btn-continue-journey"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.55rem 1.25rem',
                  borderRadius: 'var(--radius-pill, 9999px)',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  backgroundColor: 'var(--brand-citron, #D7EE83)',
                  color: '#19261F',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                  transition: 'background-color 150ms ease-out',
                }}
              >
                <span>Continue with {currentActiveStep.title.slice(0, 26)}</span>
                <ArrowRight size={16} />
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* 3. Location Pin / Status Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.875rem',
          padding: '0.875rem 1.25rem',
          backgroundColor: 'var(--surface-card, #FFFFFF)',
          borderRadius: '16px',
          border: '1px solid var(--border-subtle, #E1E8DE)',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: isAllLocked ? 'rgba(141, 163, 148, 0.15)' : 'var(--surface-recessed, #EDF2E9)',
            color: isAllLocked ? '#55635A' : 'var(--action-primary, #245B42)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {isAllLocked ? <Lock size={16} /> : <MapPin size={18} />}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-foreground, #19261F)' }}>
            {inspectedStep ? `${getStepChapterLabel(inspectedStep)} / ${inspectedStep.title}` : 'Roadmap Overview'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted, #58695E)' }}>
            {isAllLocked ? (
              <span>Milestone Locked • Your journey is waiting to be activated by the team</span>
            ) : (
              <span>Last saved {lastSavedFormatted} • Case #{studentCase?.id.slice(0, 8).toUpperCase()}</span>
            )}
          </div>
        </div>

        {activeApplication && (
          <div style={{ textAlign: 'right', display: 'none' }} className="sm:block">
            <span style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted, #58695E)' }}>Target:</span>
            <span style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-foreground, #19261F)' }}>
              {activeApplication.universitySnapshot.name}
            </span>
          </div>
        )}
      </div>

      {/* 4. Multi-Application Explicit Selector (When student has multiple applications) */}
      {!isPreview && applications.length > 1 && (
        <div
          role="region"
          aria-label="Application Selection"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--surface-recessed, #EDF2E9)',
            borderRadius: '16px',
            border: '1px solid var(--border-subtle, #E1E8DE)',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-ink, #19261F)' }}>
            Switch Application:
          </span>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {applications.map((app) => {
              const isActive = app.id === selectedApplicationId;
              return (
                <button
                  key={app.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => {
                    setSelectedApplicationId(app.id);
                    setSelectedStepId(null);
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.4rem 0.875rem',
                    borderRadius: 'var(--radius-pill, 9999px)',
                    fontSize: '0.8125rem',
                    fontWeight: isActive ? 700 : 500,
                    backgroundColor: isActive ? 'var(--action-primary, #245B42)' : 'var(--surface-card, #FFFFFF)',
                    color: isActive ? '#FFFFFF' : 'var(--text-ink, #19261F)',
                    border: '1px solid var(--border-subtle, #E1E8DE)',
                    cursor: 'pointer',
                    transition: 'all 150ms ease-out',
                  }}
                >
                  <Building2 size={14} />
                  <span>{app.universitySnapshot.name}</span>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      padding: '1px 6px',
                      borderRadius: '9999px',
                      backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : 'var(--surface-recessed, #EDF2E9)',
                      color: isActive ? '#FFFFFF' : 'var(--text-muted, #58695E)',
                    }}
                  >
                    {app.universitySnapshot.country?.toUpperCase()}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Main Content Grid: Broad Map Panel (Left) + Detail Inspector Panel (Right) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr)',
          gap: '1.5rem',
          alignItems: 'start',
        }}
        className="lg:grid-cols-[1fr_360px]"
      >
        {/* Left Column: Map or Tracks */}
        <div style={{ minWidth: 0 }}>
          {viewMode === 'map' ? (
            <JourneyMap
              steps={effectiveSteps}
              templateSteps={templateSteps}
              selectedStepId={inspectedStep?.id || null}
              onSelectStep={(step) => setSelectedStepId(step.id)}
              isAllLocked={isAllLocked}
            />
          ) : (
            <JourneyTracks
              steps={effectiveSteps}
              templateSteps={templateSteps}
              selectedStepId={inspectedStep?.id || null}
              onSelectStep={(step) => setSelectedStepId(step.id)}
              counsellorName={studentCase?.assignedCounsellorName}
              isAllLocked={isAllLocked}
            />
          )}
        </div>

        {/* Right Column: Step Detail Panel */}
        <div style={{ minWidth: 0 }}>
          <JourneyStepDetailPanel
            step={inspectedStep}
            templateStep={inspectedTemplateStep}
            counsellorName={studentCase?.assignedCounsellorName}
            isLocked={isAllLocked || inspectedStep?.status === 'locked'}
            isPreview={isPreview}
          />
        </div>
      </div>
    </div>
  );
};

export default StudentJourneyPage;
