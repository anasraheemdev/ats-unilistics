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
import { getStepChapterLabel } from './JourneyMap';

export interface JourneyTracksProps {
  steps: CaseWorkflowStep[];
  templateSteps?: WorkflowStep[];
  selectedStepId?: string | null;
  onSelectStep: (step: CaseWorkflowStep) => void;
  counsellorName?: string;
  isAllLocked?: boolean;
}

export const JourneyTracks: React.FC<JourneyTracksProps> = ({
  steps,
  templateSteps = [],
  selectedStepId,
  onSelectStep,
  counsellorName: _counsellorName,
  isAllLocked = false,
}) => {
  // Group steps by region
  const prepareSteps: CaseWorkflowStep[] = [];
  const chooseSteps: CaseWorkflowStep[] = [];
  const moveSteps: CaseWorkflowStep[] = [];

  steps.forEach((step, idx) => {
    if (steps.length === 10) {
      if (idx < 3) prepareSteps.push(step);
      else if (idx < 5) chooseSteps.push(step);
      else moveSteps.push(step);
    } else {
      if (step.stage === 'onboarding' || step.stage === 'attestation' || step.stage === 'dossier_assembly') {
        prepareSteps.push(step);
      } else if (step.stage === 'submission' || step.stage === 'decision') {
        chooseSteps.push(step);
      } else {
        moveSteps.push(step);
      }
    }
  });

  const getTemplateForStep = (step: CaseWorkflowStep) => {
    return templateSteps.find((ts: WorkflowStep) => ts.stepKey === step.stepKey || ts.id === step.stepId);
  };

  const getStatusBadge = (status: WorkflowStepStatus, isStepLocked: boolean) => {
    if (isStepLocked) {
      return {
        label: 'Locked',
        bg: 'rgba(141, 163, 148, 0.1)',
        color: '#8DA394',
        border: 'rgba(141, 163, 148, 0.25)',
        icon: Lock,
      };
    }

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
          icon: Clock,
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
          backgroundColor: 'var(--dark-card, #122017)',
          borderRadius: '24px',
          padding: '1.5rem',
          border: '1px solid var(--dark-border, #1F3325)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem' }}>
              <span
                id={`heading-${regionBadge}`}
                style={{
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  color: 'var(--dark-text-crisp, #F2F7F4)',
                }}
              >
                {title}
              </span>
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '0.125rem 0.5rem',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(215, 238, 131, 0.1)',
                  color: 'var(--brand-citron, #D7EE83)',
                  border: '1px solid rgba(215, 238, 131, 0.25)',
                }}
              >
                {regionBadge}
              </span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--dark-text-muted, #8DA394)', margin: 0 }}>
              {subtitle}
            </p>
          </div>
        </div>

        <ol
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          {sectionSteps.map((step, idx) => {
            const isSelected = selectedStepId === step.id;
            const tStep = getTemplateForStep(step);
            const isStepLocked = isAllLocked || step.status === 'locked' || (step as any).isLocked;
            const badge = getStatusBadge(step.status, isStepLocked);
            const BadgeIcon = badge.icon;
            const action = !isStepLocked ? getActionTarget(step, tStep) : null;
            const chapter = getStepChapterLabel(step);

            return (
              <li
                key={step.id || `track-${idx}`}
                onClick={() => onSelectStep(step)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectStep(step);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-pressed={isSelected}
                aria-label={`Inspect milestone: ${step.title}, Status: ${badge.label}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  padding: '1rem 1.25rem',
                  backgroundColor: isSelected ? 'rgba(215, 238, 131, 0.08)' : 'var(--dark-card-inner, #16241B)',
                  borderRadius: '16px',
                  border: isSelected ? '1px solid var(--brand-citron, #D7EE83)' : '1px solid var(--dark-border, #1F3325)',
                  cursor: 'pointer',
                  transition: 'background-color 150ms ease, border-color 150ms ease',
                  outline: 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: badge.bg,
                      color: badge.color,
                      border: `1px solid ${badge.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '0.125rem',
                    }}
                  >
                    <BadgeIcon size={16} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontSize: '0.9375rem',
                          fontWeight: 700,
                          color: 'var(--dark-text-crisp, #F2F7F4)',
                        }}
                      >
                        {step.title}
                      </span>
                      {chapter && chapter !== step.title && (
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            fontWeight: 600,
                            padding: '0.1rem 0.4rem',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(255, 255, 255, 0.06)',
                            color: '#8DA394',
                          }}
                        >
                          {chapter}
                        </span>
                      )}
                      {step.isParallel && (
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            padding: '0.1rem 0.4rem',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(141, 163, 148, 0.1)',
                            color: '#8DA394',
                            border: '1px solid rgba(141, 163, 148, 0.2)',
                          }}
                        >
                          Parallel Branch
                        </span>
                      )}
                    </div>

                    {tStep?.description && (
                      <p
                        style={{
                          fontSize: '0.8125rem',
                          color: 'var(--dark-text-muted, #8DA394)',
                          margin: '0.25rem 0 0.5rem 0',
                          lineHeight: 1.4,
                        }}
                      >
                        {tStep.description}
                      </p>
                    )}

                    {/* Required evidence indicators */}
                    {tStep?.requiredEvidence && tStep.requiredEvidence.length > 0 && (
                      <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginTop: '0.375rem' }}>
                        {tStep.requiredEvidence.map((ev: string) => (
                          <span
                            key={ev}
                            style={{
                              fontSize: '0.6875rem',
                              fontFamily: 'monospace',
                              backgroundColor: 'rgba(255, 255, 255, 0.05)',
                              color: 'var(--dark-text-muted, #8DA394)',
                              padding: '0.125rem 0.375rem',
                              borderRadius: '4px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                          >
                            <FileCheck2 size={10} />
                            {ev.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: badge.color,
                      backgroundColor: badge.bg,
                      padding: '0.25rem 0.625rem',
                      borderRadius: '9999px',
                      border: `1px solid ${badge.border}`,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <BadgeIcon size={12} />
                    {badge.label}
                  </span>

                  {action && (
                    <Link
                      to={action.url}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        padding: '0.375rem 0.75rem',
                        borderRadius: 'var(--radius-control, 12px)',
                        backgroundColor: 'var(--brand-citron, #D7EE83)',
                        color: 'var(--color-slate-900, #19261F)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                    >
                      <span>{action.label}</span>
                      <ArrowRight size={12} />
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    );
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        fontFamily: 'var(--font-family-base, "DM Sans", sans-serif)',
      }}
    >
      {renderSection(
        'Prepare',
        'Goals, academic profile and document evidence',
        prepareSteps,
        'Phase 01'
      )}
      {renderSection(
        'Choose',
        'Explore universities, assemble dossiers and receive faculty offers',
        chooseSteps,
        'Phase 02'
      )}
      {renderSection(
        'Move',
        'Visa queue, financial guarantees, and relocation preparations',
        moveSteps,
        'Phase 03'
      )}
    </div>
  );
};
