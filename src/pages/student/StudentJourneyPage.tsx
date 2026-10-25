import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import { StudentJourneyNav } from '@/components/layout/StudentJourneyNav';
import { JourneyMap } from '@/components/domain/JourneyMap';
import { JourneyTracks } from '@/components/domain/JourneyTracks';
import { JourneyStepDetailPanel } from '@/components/domain/JourneyStepDetailPanel';
import { CaseWorkflowStep, Application, WorkflowStep } from '@/types';
import { Link } from 'react-router-dom';
import {
  Map as MapIcon,
  ListOrdered,
  MapPin,
  ArrowRight,
  Building2,
} from 'lucide-react';

export const StudentJourneyPage: React.FC = () => {
  // View toggle: On small screens default to 'tracks', on desktop default to 'map'
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
  } = useQuery({
    queryKey: ['student-journey-case'],
    queryFn: () => api.student.getOverviewCase(),
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
  });

  // Set initial selected application
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
    data: steps = [],
    isLoading: stepsLoading,
  } = useQuery({
    queryKey: ['case-workflow-steps', caseId, activeApplication?.id],
    queryFn: () => api.student.getCaseWorkflowSteps(caseId, activeApplication?.id),
    enabled: Boolean(caseId),
  });

  // 4. Fetch Country Template Details for rich instructions, required evidence, and flags
  const countryCode = activeApplication?.universitySnapshot?.country?.toLowerCase() || studentCase?.targetCountry?.toLowerCase() || 'germany';

  const { data: templateData } = useQuery({
    queryKey: ['workflow-template-country', countryCode],
    queryFn: async () => {
      const templates = await api.workflows.getTemplates();
      const match = templates.find((t) => t.countryCode.toLowerCase() === countryCode) || templates[0];
      if (match) {
        return api.workflows.getTemplateDetails(match.id);
      }
      return null;
    },
    enabled: Boolean(countryCode),
  });

  const templateSteps: WorkflowStep[] = templateData?.steps || [];

  // Identify current active step (first in-progress or needs-action step)
  const currentActiveStep =
    steps.find((s: CaseWorkflowStep) => s.status === 'in_progress') ||
    steps.find((s: CaseWorkflowStep) => s.status === 'needs_action') ||
    steps.find((s: CaseWorkflowStep) => s.status !== 'completed' && s.status !== 'not_applicable') ||
    steps[0];

  // Selected step for detail panel inspection
  const inspectedStep: CaseWorkflowStep | null =
    steps.find((s: CaseWorkflowStep) => s.id === selectedStepId) || currentActiveStep || null;

  const inspectedTemplateStep = inspectedStep
    ? templateSteps.find((ts) => ts.stepKey === inspectedStep.stepKey || ts.id === inspectedStep.stepId)
    : null;

  // Handle small-screen resizing safely
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && viewMode === 'map') {
        // Automatically adapt small screens to Tracks view
        setViewMode('tracks');
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode]);

  if (caseLoading || appsLoading || stepsLoading) {
    return <LoadingState message="Loading your admissions and visa journey..." />;
  }

  // Genuine empty state if no active case exists
  if (caseError || !studentCase) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <StudentJourneyNav />
        <EmptyState
          title="No active student case found"
          description="You do not have an active managed student case yet. Once your educational profile and country targets are approved by administration, your personalized milestone map will appear here."
          actionLabel="Request Managed Support"
          onAction={() => window.location.assign('/request-access?service=managed')}
          imageSrc="/images/unilistics/empty_applications.webp"
          imageAlt="No active case illustration"
        />
      </div>
    );
  }

  // Derive last-saved date text
  const lastUpdatedRaw = inspectedStep?.completedAt || studentCase.updatedAt || studentCase.lastUpdateDate || new Date().toISOString();
  const lastSavedDateFormatted = new Date(lastUpdatedRaw).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Action link for top Continue button
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

      {/* 2. Top Header & Utility Bar */}
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
          <h1
            style={{
              fontSize: 'clamp(1.75rem, 3.5vw, 2.25rem)',
              fontWeight: 800,
              color: 'var(--color-foreground, #19261F)',
              letterSpacing: '-0.025em',
              margin: '0 0 0.35rem 0',
            }}
          >
            Your journey
          </h1>
          <p
            style={{
              fontSize: '0.9375rem',
              color: 'var(--color-foreground-muted, #58695E)',
              margin: 0,
              maxWidth: '620px',
            }}
          >
            From preparation to arrival. Structured procedural milestones for your target university admission and visa application.
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

          {/* Top Primary "Continue" Action Button */}
          {currentActiveStep && (
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

      {/* 3. Real Last-Saved / Current Location Banner */}
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
            backgroundColor: 'var(--surface-recessed, #EDF2E9)',
            color: 'var(--action-primary, #245B42)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <MapPin size={18} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-foreground, #19261F)' }}>
            {inspectedStep ? `${inspectedStep.stage.toUpperCase()} / ${inspectedStep.title}` : 'Active Application Track'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted, #58695E)' }}>
            Last saved {lastSavedDateFormatted} • Case #{studentCase.id.slice(0, 8).toUpperCase()}
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

      {/* 4. Multi-Application Explicit Selector (Never conflate distinct timelines) */}
      {applications.length > 1 && (
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

      {/* 5. Main Content Grid: Broad Map Panel (Left) + Narrower Detail Panel (Right) */}
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
              steps={steps}
              templateSteps={templateSteps}
              selectedStepId={inspectedStep?.id || null}
              onSelectStep={(step) => setSelectedStepId(step.id)}
            />
          ) : (
            <JourneyTracks
              steps={steps}
              templateSteps={templateSteps}
              selectedStepId={inspectedStep?.id || null}
              onSelectStep={(step) => setSelectedStepId(step.id)}
              counsellorName={studentCase.assignedCounsellorName}
            />
          )}
        </div>

        {/* Right Column: Step Detail Panel */}
        <div style={{ minWidth: 0 }}>
          <JourneyStepDetailPanel
            step={inspectedStep}
            templateStep={inspectedTemplateStep}
            counsellorName={studentCase.assignedCounsellorName}
          />
        </div>
      </div>
    </div>
  );
};

export default StudentJourneyPage;
