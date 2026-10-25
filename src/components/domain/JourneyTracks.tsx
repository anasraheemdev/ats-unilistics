import React from 'react';
import { Link } from 'react-router-dom';
import { CaseWorkflowStep, WorkflowStep, WorkflowStepStatus } from '@/types';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Lock,
  ArrowRight,
  FileCheck2,
  Info,
} from 'lucide-react';

interface JourneyTracksProps {
  steps: CaseWorkflowStep[];
  templateSteps?: WorkflowStep[];
  selectedStepId?: string | null;
  onSelectStep: (step: CaseWorkflowStep) => void;
  counsellorName?: string;
}

export const JourneyTracks: React.FC<JourneyTracksProps> = ({
  steps,
  templateSteps = [],
  selectedStepId,
  onSelectStep,
  counsellorName,
}) => {
  // Group steps by region
  const prepareSteps: CaseWorkflowStep[] = [];
  const chooseSteps: CaseWorkflowStep[] = [];
  const moveSteps: CaseWorkflowStep[] = [];

  steps.forEach((step) => {
    if (step.stage === 'onboarding' || step.stage === 'attestation' || step.stage === 'dossier_assembly') {
      prepareSteps.push(step);
    } else if (step.stage === 'submission' || step.stage === 'decision') {
      chooseSteps.push(step);
    } else {
      moveSteps.push(step);
    }
  });

  const getTemplateForStep = (step: CaseWorkflowStep) => {
    return templateSteps.find((ts: WorkflowStep) => ts.stepKey === step.stepKey || ts.id === step.stepId);
  };

  const getStatusBadge = (status: WorkflowStepStatus) => {
    switch (status) {
      case 'completed':
        return {
          label: 'Completed',
          bg: 'rgba(215, 238, 131, 0.15)',
          color: 'var(--brand-citron, #D7EE83)',
          border: 'rgba(215, 238, 131, 0.3)',
          icon: CheckCircle2,
        };
      case 'in_progress':
        return {
          label: 'In Progress',
          bg: 'rgba(56, 189, 248, 0.15)',
          color: '#38BDF8',
          border: 'rgba(56, 189, 248, 0.3)',
          icon: Clock,
        };
      case 'needs_action':
        return {
          label: 'Action Required',
          bg: 'rgba(251, 191, 36, 0.15)',
          color: '#FBBF24',
          border: 'rgba(251, 191, 36, 0.3)',
          icon: Clock,
        };
      case 'blocked':
        return {
          label: 'Blocked / Review Required',
          bg: 'rgba(239, 68, 68, 0.15)',
          color: '#F87171',
          border: 'rgba(239, 68, 68, 0.3)',
          icon: AlertTriangle,
        };
      case 'reopened':
        return {
          label: 'Revision Requested',
          bg: 'rgba(245, 158, 11, 0.15)',
          color: '#FBBF24',
          border: 'rgba(245, 158, 11, 0.3)',
          icon: AlertTriangle,
        };
      case 'not_applicable':
        return {
          label: 'Skipped / N/A',
          bg: 'rgba(141, 163, 148, 0.15)',
          color: '#8DA394',
          border: 'rgba(141, 163, 148, 0.3)',
          icon: Info,
        };
      default:
        return {
          label: 'Not Started',
          bg: 'rgba(141, 163, 148, 0.15)',
          color: '#8DA394',
          border: 'rgba(141, 163, 148, 0.3)',
          icon: Lock,
        };
    }
  };

  const getActionTarget = (step: CaseWorkflowStep, tStep?: WorkflowStep) => {
    if (step.status === 'completed') {
      return { label: 'View documents', url: '/student/documents' };
    }
    if (step.status === 'blocked') {
      return { label: 'Message advisor', url: '/student/messages' };
    }
    if (step.targetOutcomeType === 'attestation' || (tStep?.requiredEvidence && tStep.requiredEvidence.length > 0)) {
      return { label: 'Upload evidence', url: '/student/documents' };
    }
    if (step.responsibleActor === 'student') {
      return { label: 'Complete action', url: '/student/tasks' };
    }
    return { label: 'Review details', url: '/student/messages' };
  };

  const renderSection = (title: string, subtitle: string, sectionSteps: CaseWorkflowStep[], regionBadge: string) => {
    if (sectionSteps.length === 0) return null;

    return (
      <section
        key={title}
        aria-labelledby={`heading-${regionBadge}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          backgroundColor: 'var(--dark-card, #16241B)',
          borderRadius: '24px',
          padding: '1.5rem',
          border: '1px solid var(--dark-border, #203327)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3
              id={`heading-${regionBadge}`}
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--dark-text-crisp, #F2F7F4)',
                margin: '0 0 0.25rem 0',
              }}
            >
              {title}
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--dark-text-muted, #8DA394)', margin: 0 }}>
              {subtitle}
            </p>
          </div>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              padding: '3px 10px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(215, 238, 131, 0.1)',
              color: 'var(--brand-citron, #D7EE83)',
              border: '1px solid rgba(215, 238, 131, 0.25)',
            }}
          >
            {sectionSteps.filter((s) => s.status === 'completed').length} of {sectionSteps.length} complete
          </span>
        </div>

        <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {sectionSteps.map((step, idx) => {
            const isSelected = selectedStepId === step.id;
            const tStep = getTemplateForStep(step);
            const statusBadge = getStatusBadge(step.status);
            const StatusIcon = statusBadge.icon;
            const action = getActionTarget(step, tStep);

            return (
              <li
                key={step.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.875rem',
                  padding: '1.25rem',
                  borderRadius: '16px',
                  backgroundColor: isSelected ? 'rgba(215, 238, 131, 0.06)' : 'rgba(0, 0, 0, 0.2)',
                  border: isSelected ? '1px solid var(--brand-citron, #D7EE83)' : '1px solid rgba(255, 255, 255, 0.05)',
                  transition: 'all 150ms ease-out',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem', minWidth: 0 }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: statusBadge.bg,
                        color: statusBadge.color,
                        border: `1px solid ${statusBadge.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        flexShrink: 0,
                        marginTop: '2px',
                      }}
                    >
                      {step.status === 'completed' ? '✓' : idx + 1}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            backgroundColor: statusBadge.bg,
                            color: statusBadge.color,
                            border: `1px solid ${statusBadge.border}`,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                          }}
                        >
                          <StatusIcon size={12} />
                          {statusBadge.label}
                        </span>

                        <span style={{ fontSize: '0.75rem', color: 'var(--dark-text-muted, #8DA394)' }}>
                          Actor: <strong style={{ color: 'var(--dark-text-crisp, #F2F7F4)' }}>
                            {step.responsibleActor === 'student' ? 'Student' : step.responsibleActor === 'counsellor' ? (counsellorName || 'Counsellor') : 'Consular Authority'}
                          </strong>
                        </span>
                      </div>

                      <h4
                        style={{
                          fontSize: '1.0625rem',
                          fontWeight: 700,
                          color: 'var(--dark-text-crisp, #F2F7F4)',
                          margin: '0 0 0.25rem 0',
                        }}
                      >
                        {step.title}
                      </h4>

                      {(tStep?.instructions || tStep?.description) && (
                        <p style={{ fontSize: '0.8125rem', color: 'var(--dark-text-muted, #8DA394)', margin: 0, lineHeight: 1.5 }}>
                          {tStep.instructions || tStep.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions & Inspection Button */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', alignSelf: 'flex-start' }}>
                    <button
                      type="button"
                      onClick={() => onSelectStep(step)}
                      style={{
                        padding: '0.375rem 0.875rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: isSelected ? 'var(--brand-citron, #D7EE83)' : 'transparent',
                        color: isSelected ? '#19261F' : 'var(--dark-text-muted, #8DA394)',
                        border: isSelected ? 'none' : '1px solid rgba(141, 163, 148, 0.3)',
                        borderRadius: 'var(--radius-pill, 9999px)',
                        cursor: 'pointer',
                        transition: 'all 150ms ease-out',
                      }}
                    >
                      {isSelected ? 'Inspecting' : 'Inspect Details'}
                    </button>

                    <Link to={action.url} style={{ textDecoration: 'none' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          padding: '0.375rem 0.875rem',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: 'var(--brand-citron, #D7EE83)',
                          color: '#19261F',
                          borderRadius: 'var(--radius-pill, 9999px)',
                        }}
                      >
                        <span>{action.label}</span>
                        <ArrowRight size={13} />
                      </span>
                    </Link>
                  </div>
                </div>

                {/* Evidence Checklist Badges */}
                {tStep?.requiredEvidence && tStep.requiredEvidence.length > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      flexWrap: 'wrap',
                      paddingTop: '0.5rem',
                      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    <span style={{ fontSize: '0.75rem', color: 'var(--dark-text-muted, #8DA394)', fontWeight: 600 }}>
                      Evidence:
                    </span>
                    {tStep.requiredEvidence.map((ev: string) => (
                      <span
                        key={ev}
                        style={{
                          fontSize: '0.6875rem',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          backgroundColor: 'rgba(0, 0, 0, 0.3)',
                          color: step.status === 'completed' ? 'var(--brand-citron, #D7EE83)' : 'var(--dark-text-muted, #8DA394)',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        <FileCheck2 size={11} />
                        {ev.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </section>
    );
  };

  return (
    <div
      aria-label="Journey Tracks and Milestones Checklist"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        fontFamily: 'var(--font-family-base, "DM Sans", sans-serif)',
      }}
    >
      {renderSection('Prepare', 'Goals, academic profile and document evidence', prepareSteps, 'prepare')}
      {renderSection('Choose', 'Explore universities, assemble dossiers and receive faculty offers', chooseSteps, 'choose')}
      {renderSection('Move', 'Visa queue, financial guarantees, and relocation preparations', moveSteps, 'move')}
    </div>
  );
};

export default JourneyTracks;
