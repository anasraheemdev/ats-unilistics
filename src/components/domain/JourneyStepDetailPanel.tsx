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

interface JourneyStepDetailPanelProps {
  step: CaseWorkflowStep | null;
  templateStep?: WorkflowStep | null;
  counsellorName?: string;
  onClose?: () => void;
}

export const JourneyStepDetailPanel: React.FC<JourneyStepDetailPanelProps> = ({
  step,
  templateStep,
  counsellorName,
}) => {
  if (!step) {
    return (
      <div
        className="bento-card"
        style={{
          padding: '1.75rem',
          backgroundColor: 'var(--dark-card, #16241B)',
          border: '1px solid var(--dark-border, #203327)',
          borderRadius: '24px',
          color: 'var(--dark-text-crisp, #F2F7F4)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          minHeight: '380px',
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
      </div>
    );
  }

  // Derive status badge
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
          label: 'Not Applicable / Skipped',
          bg: 'rgba(141, 163, 148, 0.15)',
          color: 'var(--dark-text-muted, #8DA394)',
          border: 'rgba(141, 163, 148, 0.3)',
          icon: Info,
        };
      default:
        return {
          label: 'Not Started',
          bg: 'rgba(141, 163, 148, 0.15)',
          color: 'var(--dark-text-muted, #8DA394)',
          border: 'rgba(141, 163, 148, 0.3)',
          icon: Lock,
        };
    }
  };

  const statusBadge = getStatusBadge(step.status);
  const StatusIcon = statusBadge.icon;

  // Determine permitted action link
  const getActionTarget = () => {
    if (step.status === 'completed') {
      return {
        label: 'View completed evidence',
        url: '/student/documents',
        disabled: false,
      };
    }

    if (step.status === 'blocked') {
      return {
        label: 'Message advisory team',
        url: '/student/messages',
        disabled: false,
      };
    }

    if (step.targetOutcomeType === 'attestation' || (templateStep?.requiredEvidence && templateStep.requiredEvidence.length > 0)) {
      return {
        label: 'Upload required evidence →',
        url: '/student/documents',
        disabled: false,
      };
    }

    if (step.responsibleActor === 'student') {
      return {
        label: 'Open case task →',
        url: '/student/tasks',
        disabled: false,
      };
    }

    return {
      label: 'Consult with advisor →',
      url: '/student/messages',
      disabled: false,
    };
  };

  const actionTarget = getActionTarget();
  const evidenceList = templateStep?.requiredEvidence || [];
  const friendlyEvidenceName = (rawKey: string) => {
    return rawKey
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <aside
      aria-label="Step Details Panel"
      className="bento-card"
      style={{
        padding: '1.5rem',
        backgroundColor: 'var(--dark-card, #16241B)',
        border: '1px solid var(--dark-border, #203327)',
        borderRadius: '24px',
        color: 'var(--dark-text-crisp, #F2F7F4)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
      }}
    >
      {/* Top Status & Stage Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '3px 10px',
            borderRadius: '9999px',
            backgroundColor: statusBadge.bg,
            color: statusBadge.color,
            border: `1px solid ${statusBadge.border}`,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          <StatusIcon size={13} />
          {statusBadge.label}
        </span>

        <span style={{ fontSize: '0.75rem', color: 'var(--dark-text-muted, #8DA394)', fontWeight: 600 }}>
          Stage: {step.stage.toUpperCase()}
        </span>
      </div>

      {/* Title & Actor */}
      <div>
        <h3
          style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            margin: '0 0 0.35rem 0',
            color: 'var(--dark-text-crisp, #F2F7F4)',
            lineHeight: 1.3,
          }}
        >
          {step.title}
        </h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--dark-text-muted, #8DA394)', margin: 0 }}>
          Assigned to: <strong style={{ color: 'var(--brand-citron, #D7EE83)' }}>
            {step.responsibleActor === 'student' ? 'Student Action' : step.responsibleActor === 'counsellor' ? (counsellorName || 'Admissions Counsellor') : 'External Authority'}
          </strong>
        </p>
      </div>

      {/* Instructions / Description */}
      {(templateStep?.instructions || templateStep?.description) && (
        <div
          style={{
            padding: '0.875rem 1rem',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            fontSize: '0.8125rem',
            color: 'var(--dark-text-crisp, #F2F7F4)',
            lineHeight: 1.5,
          }}
        >
          <div style={{ fontWeight: 600, color: 'var(--brand-citron, #D7EE83)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Info size={14} /> Operational Guidance
          </div>
          <p style={{ margin: 0, color: 'var(--dark-text-muted, #8DA394)' }}>
            {templateStep.instructions || templateStep.description}
          </p>
        </div>
      )}

      {/* Blocked or Reopened Reason Alert */}
      {(step.status === 'blocked' || step.status === 'reopened') && (step.reopenedReason || step.notApplicableReason) && (
        <div
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '16px',
            fontSize: '0.8125rem',
            color: '#FCA5A5',
          }}
        >
          <strong>Reason recorded:</strong> {step.reopenedReason || step.notApplicableReason}
        </div>
      )}

      {/* Evidence Requirements Checklist */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--dark-text-crisp, #F2F7F4)' }}>
            Required Evidence ({evidenceList.length})
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--dark-text-muted, #8DA394)' }}>
            {step.status === 'completed' ? 'All verified' : 'Vault review'}
          </span>
        </div>

        {evidenceList.length === 0 ? (
          <p style={{ fontSize: '0.8125rem', color: 'var(--dark-text-muted, #8DA394)', fontStyle: 'italic', margin: 0 }}>
            No additional document uploads mandated for this step.
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
                  <FileCheck2 size={16} style={{ color: step.status === 'completed' ? 'var(--brand-citron, #D7EE83)' : 'var(--dark-text-muted, #8DA394)', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.8125rem', color: 'var(--dark-text-crisp, #F2F7F4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {friendlyEvidenceName(evKey)}
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: step.status === 'completed' ? 'var(--brand-citron, #D7EE83)' : 'var(--dark-text-muted, #8DA394)' }}>
                  {step.status === 'completed' ? 'Verified' : 'Required'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Statutory / Verification Flags */}
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

      {/* Primary Action Button */}
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
    </aside>
  );
};
export default JourneyStepDetailPanel;
