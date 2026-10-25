import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, formatUtcInTimezone } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import {
  HelpCircle,
  ExternalLink,
  MessageSquare,
  X,
  BookOpen,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '@/types';

interface ContextualHelpProps {
  stage?: string;
  documentCategory?: string;
  countryCode?: string;
  currentRole?: UserRole;
  buttonLabel?: string;
  inlineVariant?: 'badge' | 'button' | 'card';
}

export const ContextualHelp: React.FC<ContextualHelpProps> = ({
  stage,
  documentCategory,
  countryCode,
  currentRole = 'managed_student',
  buttonLabel,
  inlineVariant = 'button',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const { data: helpItem, isLoading } = useQuery({
    queryKey: ['contextual-help', stage, documentCategory, countryCode],
    queryFn: () => api.help.getContextualHelp({ stage, documentCategory, countryCode }),
    enabled: Boolean(stage || documentCategory),
  });

  if (!helpItem && !isLoading) {
    return null;
  }

  const isManagedStudent = currentRole === 'managed_student';

  const handleEscalate = () => {
    setIsOpen(false);
    if (isManagedStudent) {
      // Route to case advisory messaging with context
      navigate('/student/messages', {
        state: {
          prefilledContext: `Inquiry regarding ${helpItem?.title || stage || documentCategory} (${helpItem?.sourceSection || 'General Guide'}): `,
        },
      });
    } else {
      // Route to support desk ticket creation
      navigate('/support', {
        state: {
          prefilledSubject: `Question regarding ${helpItem?.title || stage || documentCategory}`,
          prefilledCategory: 'catalogue',
        },
      });
    }
  };

  return (
    <>
      {inlineVariant === 'badge' ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            color: 'var(--color-primary)',
            fontSize: '0.75rem',
            fontWeight: 600,
          }}
          title={`View official guide advice for ${helpItem?.title || 'this step'}`}
        >
          <HelpCircle size={13} aria-hidden="true" />
          <span>{buttonLabel || 'Guide Advice'}</span>
        </button>
      ) : inlineVariant === 'card' ? (
        <div
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--color-surface-hover)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={16} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
            <div style={{ fontSize: '0.8125rem' }}>
              <span style={{ fontWeight: 600 }}>{helpItem?.title || 'Procedural Guide Advice'}</span>
              <p style={{ margin: 0, color: 'var(--color-foreground-muted)', fontSize: '0.75rem' }}>
                {helpItem?.summary?.slice(0, 85)}...
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
            Explain Step
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(true)}
          leftIcon={<HelpCircle size={14} />}
          style={{ fontSize: '0.75rem', height: '28px', padding: '0 0.5rem' }}
        >
          {buttonLabel || 'Procedural Help'}
        </Button>
      )}

      {/* Contextual Guidance Modal */}
      {isOpen && helpItem && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={() => setIsOpen(false)}
        >
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '620px',
              width: '100%',
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              boxShadow: 'var(--shadow-xl)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                  <Badge variant="primary" size="sm">
                    {helpItem.countryCode === 'all' ? 'All EU Corridors' : helpItem.countryCode.toUpperCase()}
                  </Badge>
                  <Badge variant={helpItem.verificationStatus === 'verified' ? 'success' : 'warning'} size="sm">
                    {helpItem.verificationStatus === 'verified' ? 'Verified Statutory Policy' : 'Provisional Guide Content'}
                  </Badge>
                  {helpItem.isStale && (
                    <Badge variant="destructive" size="sm">
                      Review Pending (&gt;180d)
                    </Badge>
                  )}
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                  {helpItem.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-foreground-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Summary Box */}
            <div
              style={{
                padding: '0.875rem 1rem',
                backgroundColor: 'rgba(56, 189, 248, 0.08)',
                borderLeft: '4px solid var(--color-primary)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.875rem',
                lineHeight: 1.5,
              }}
            >
              {helpItem.summary}
            </div>

            {/* Main Content (Sanitized Markdown Body) */}
            <div
              style={{
                fontSize: '0.875rem',
                lineHeight: 1.6,
                color: 'var(--color-foreground)',
                whiteSpace: 'pre-wrap',
                fontFamily: 'inherit',
              }}
            >
              {helpItem.content}
            </div>

            {/* Source Citations & Official Link */}
            <div
              style={{
                padding: '0.75rem',
                backgroundColor: 'var(--color-surface-hover)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.375rem',
                color: 'var(--color-foreground-muted)',
              }}
            >
              <div>
                <strong>Reviewed Guide Section:</strong> {helpItem.sourceSection}
              </div>
              <div>
                <strong>Source Material:</strong> {helpItem.sourceFile}
              </div>
              {helpItem.lastReviewedAt && (
                <div>
                  <strong>Last Editorial Review:</strong> {formatUtcInTimezone(helpItem.lastReviewedAt)}
                </div>
              )}
              {helpItem.officialSourceUrl && (
                <div style={{ marginTop: '0.25rem' }}>
                  <a
                    href={helpItem.officialSourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: 'var(--color-primary)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    <span>Verify with Official Statutory Authority</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>

            {/* Statutory Disclaimer */}
            <Alert variant="warning" title="Procedural Integrity Reminder">
              Procedural guidelines, fee amounts, and embassy waitlists are reviewed operational material, not statutory law.
              Confirm current legal directives with your assigned educational counsellor before executing document attestations or funds wire transfers.
            </Alert>

            {/* Escalation Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
                Dismiss
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={handleEscalate}
                leftIcon={<MessageSquare size={14} />}
              >
                {isManagedStudent ? 'Ask My Counsellor About This' : 'Submit Support Inquiry'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
