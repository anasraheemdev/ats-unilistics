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
  ShieldCheck,
} from 'lucide-react';
import { getStepChapterLabel } from './JourneyMap';

export interface JourneyStepDetailPanelProps {
  step: CaseWorkflowStep | null;
  templateStep?: WorkflowStep | null;
  counsellorName?: string;
  onClose?: () => void;
  isLocked?: boolean;
  isPreview?: boolean;
}

export const JourneyStepDetailPanel: React.FC<JourneyStepDetailPanelProps> = ({
  step,
  templateStep,
  counsellorName,
  isLocked = false,
  isPreview = false,
}) => {
  if (!step) {
    return (
      <aside
        className="bento-card"
        style={{
          padding: '1.75rem',
          backgroundColor: 'var(--dark-card, #122017)',
          border: '1px solid var(--dark-border, #1F3325)',
          borderRadius: '24px',
          color: 'var(--dark-text-crisp, #F2F7F4)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          minHeight: '380px',
        }}
        aria-label="Milestone Inspector"
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
            marginBottom: '1rem',
          }}
        >
          <Info size={22} />
        </div>
        <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
          Select a step to inspect
        </h4>
        <p style={{ fontSize: '0.8125rem', color: 'var(--dark-text-muted, #8DA394)', margin: 0, maxWidth: '240px' }}>
          Click on any node in the map or tracks list to view requirements, evidence items, and actions.
        </p>
      </aside>
    );
  }

  const effectiveLocked = isLocked || step.status === 'locked' || (step as any).isLocked;

  // Derive status badge
  const getStatusBadge = (status: WorkflowStepStatus) => {
    if (effectiveLocked) {
      return {
        label: 'Locked',
        bg: 'rgba(141, 163, 148, 0.12)',
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
          label: 'In Progress / Active',
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

  const statusBadge = getStatusBadge(step.status);
  const StatusIcon = statusBadge.icon;
  const chapter = getStepChapterLabel(step);

  // Friendly actor label
  const actorLabel =
    step.responsibleActor === 'counsellor'
      ? `Counsellor (${counsellorName || 'Assigned Staff'})`
      : step.responsibleActor === 'student'
      ? 'Student Action'
      : 'Joint / Advisory Team';

  // Action target routing (only used when unlocked)
  const getActionTarget = () => {
    if (step.status === 'completed') {
      return { label: 'View completed evidence', url: '/student/documents' };
    }
    if (step.status === 'blocked' || step.status === 'reopened') {
      return { label: 'Message advisory team', url: '/student/messages' };
    }
    if (step.targetOutcomeType === 'attestation') {
      return { label: 'Prepare attestation documents', url: '/student/documents' };
    }
    if (step.responsibleActor === 'student') {
      return { label: 'Go to action checklist', url: '/student/tasks' };
    }
    return { label: 'View case documents', url: '/student/documents' };
  };

  const actionTarget = getActionTarget();

  const evidenceList =
    templateStep?.requiredEvidence && templateStep.requiredEvidence.length > 0
      ? templateStep.requiredEvidence
      : Object.keys(step.evidenceMetadata || {});

  const friendlyEvidenceName = (name: string) => {
    return name
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <aside
      className="bento-card"
      style={{
        padding: '1.5rem',
        backgroundColor: 'var(--dark-card, #122017)',
        border: '1px solid var(--dark-border, #1F3325)',
        borderRadius: '24px',
        color: 'var(--dark-text-crisp, #F2F7F4)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.28)',
      }}
      aria-label="Selected Milestone Detail Panel"
    >
      {/* 1. Header with Chapter and Status Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--brand-citron, #D7EE83)',
              }}
            >
              {chapter}
            </span>
            {step.isParallel && (
              <span
                style={{
                  fontSize: '0.625rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  padding: '0.1rem 0.35rem',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(141, 163, 148, 0.1)',
                  color: '#8DA394',
                }}
              >
                Parallel
              </span>
            )}
          </div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0, color: 'var(--dark-text-crisp, #F2F7F4)', lineHeight: 1.3 }}>
            {step.title}
          </h3>
        </div>

        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '0.3rem 0.625rem',
            borderRadius: '9999px',
            backgroundColor: statusBadge.bg,
            color: statusBadge.color,
            border: `1px solid ${statusBadge.border}`,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            flexShrink: 0,
          }}
        >
          <StatusIcon size={13} />
          {statusBadge.label}
        </span>
      </div>

      {/* 2. Explanatory Locked Banner (if locked) */}
      {effectiveLocked && (
        <div
          style={{
            padding: '0.875rem',
            backgroundColor: 'rgba(141, 163, 148, 0.08)',
            border: '1px solid rgba(141, 163, 148, 0.2)',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#B4D0B6', fontWeight: 700, fontSize: '0.8125rem' }}>
            <Lock size={15} />
            <span>Milestone Locked</span>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--dark-text-muted, #8DA394)', margin: 0, lineHeight: 1.45 }}>
            {isPreview
              ? 'Your journey is waiting to be activated by the team. Once your educational profile and target country are approved, staff will unlock this milestone.'
              : 'This milestone is currently locked. It will be activated by the advisory team once prerequisites are met.'}
          </p>
        </div>
      )}

      {/* 3. Operational Metadata Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '0.75rem',
          padding: '0.75rem',
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.04)',
          fontSize: '0.75rem',
        }}
      >
        <div>
          <span style={{ color: 'var(--dark-text-muted, #8DA394)', display: 'block', marginBottom: '0.2rem' }}>
            Assigned to:
          </span>
          <span style={{ fontWeight: 700, color: 'var(--dark-text-crisp, #F2F7F4)' }}>
            {actorLabel}
          </span>
        </div>

        <div>
          <span style={{ color: 'var(--dark-text-muted, #8DA394)', display: 'block', marginBottom: '0.2rem' }}>
            Stage Category:
          </span>
          <span style={{ fontWeight: 700, color: 'var(--dark-text-crisp, #F2F7F4)', textTransform: 'capitalize' }}>
            {step.stage?.replace(/_/g, ' ') || 'General'}
          </span>
        </div>
      </div>

      {/* 4. Blocked / Reopened Reason Alert */}
      {(step.status === 'blocked' || step.status === 'reopened') && (step.reopenedReason || (step as any).blockedReason) && (
        <div
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#F87171', fontWeight: 700, fontSize: '0.8125rem' }}>
            <AlertTriangle size={15} />
            <span>Advisory Review Notice:</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.8125rem', color: '#FECACA', lineHeight: 1.4 }}>
            {step.reopenedReason || (step as any).blockedReason}
          </p>
        </div>
      )}

      {/* 5. Operational Instructions / Guidance */}
      {templateStep?.instructions && (
        <div>
          <h4
            style={{
              fontSize: '0.8125rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: 'var(--dark-text-muted, #8DA394)',
              margin: '0 0 0.4rem 0',
            }}
          >
            Operational Guidance
          </h4>
          <p
            style={{
              fontSize: '0.8125rem',
              lineHeight: 1.5,
              color: 'var(--dark-text-crisp, #F2F7F4)',
              margin: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              padding: '0.75rem',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            {templateStep.instructions}
          </p>
        </div>
      )}

      {/* 6. Required Evidence Checklist */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <h4
            style={{
              fontSize: '0.8125rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: 'var(--dark-text-muted, #8DA394)',
              margin: 0,
            }}
          >
            Required Evidence ({evidenceList.length})
          </h4>
        </div>

        {evidenceList.length === 0 ? (
          <p style={{ fontSize: '0.8125rem', color: 'var(--dark-text-muted, #8DA394)', margin: 0, fontStyle: 'italic' }}>
            No documentary uploads required for this milestone.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {evidenceList.map((evKey) => (
              <div
                key={evKey}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.625rem 0.875rem',
                  backgroundColor: 'rgba(0, 0, 0, 0.25)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', minWidth: 0 }}>
                  <FileCheck2
                    size={16}
                    style={{
                      color: step.status === 'completed' ? 'var(--brand-citron, #D7EE83)' : 'var(--dark-text-muted, #8DA394)',
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: '0.8125rem', color: 'var(--dark-text-crisp, #F2F7F4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {friendlyEvidenceName(evKey)}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: step.status === 'completed' ? 'var(--brand-citron, #D7EE83)' : 'var(--dark-text-muted, #8DA394)',
                  }}
                >
                  {step.status === 'completed' ? 'Verified' : 'Required'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 7. Verification Flags */}
      {templateStep?.verificationFlags && templateStep.verificationFlags.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem',
            padding: '0.625rem 0.875rem',
            backgroundColor: 'rgba(215, 238, 131, 0.05)',
            border: '1px solid rgba(215, 238, 131, 0.15)',
            borderRadius: '12px',
            fontSize: '0.75rem',
            color: 'var(--dark-text-muted, #8DA394)',
          }}
        >
          <ShieldCheck size={15} style={{ color: 'var(--brand-citron, #D7EE83)', flexShrink: 0, marginTop: '2px' }} />
          <span>
            Procedural benchmark: Flags {templateStep.verificationFlags.join(', ')}. Official guidelines subject to periodic consular or statutory updates.
          </span>
        </div>
      )}

      {/* 8. Action Area */}
      {effectiveLocked ? (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-control, 16px)',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--dark-border, #1F3325)',
            color: 'var(--dark-text-muted, #8DA394)',
            fontSize: '0.8125rem',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            marginTop: '0.5rem',
          }}
        >
          <Lock size={14} />
          <span>No student action required until milestone is unlocked</span>
        </div>
      ) : (
        <Link to={actionTarget.url} style={{ textDecoration: 'none', marginTop: '0.5rem' }}>
          <button
            type="button"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.25rem',
              backgroundColor: 'var(--brand-citron, #D7EE83)',
              color: '#19261F',
              borderRadius: 'var(--radius-pill, 9999px)',
              fontWeight: 700,
              fontSize: '0.875rem',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 150ms ease-out',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--accent-citron-hover, #C8E26C)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--brand-citron, #D7EE83)';
            }}
          >
            <span>{actionTarget.label}</span>
            <ArrowRight size={16} />
          </button>
        </Link>
      )}
    </aside>
  );
};
export default JourneyStepDetailPanel;
