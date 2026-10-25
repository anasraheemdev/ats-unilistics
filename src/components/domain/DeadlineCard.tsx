import React from 'react';
import { Card } from '@/components/ui/Card';
import { Calendar, User, Clock, AlertCircle } from 'lucide-react';
import { en } from '@/lib/i18n';

interface DeadlineCardProps {
  currentStage: string;
  nextRequiredAction: string;
  nextActionDueDate: string;
  responsiblePerson: string;
  lastUpdateDate: string;
}

export const DeadlineCard: React.FC<DeadlineCardProps> = ({
  currentStage,
  nextRequiredAction,
  nextActionDueDate,
  responsiblePerson,
  lastUpdateDate,
}) => {
  return (
    <Card
      variant="highlight"
      padding="lg"
      style={{
        marginBottom: '1.5rem',
        backgroundColor: 'var(--color-surface)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: 'var(--color-primary)',
          fontSize: '0.8125rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          marginBottom: '0.5rem',
        }}
      >
        <AlertCircle size={18} aria-hidden="true" />
        <span>Action Required Now • Stage: {currentStage}</span>
      </div>

      <h2
        style={{
          fontSize: '1.375rem',
          fontWeight: 700,
          color: 'var(--color-foreground)',
          lineHeight: 1.35,
          marginBottom: '1.25rem',
        }}
      >
        {nextRequiredAction}
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        {/* Due Date */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
          <div
            style={{
              padding: '0.375rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-destructive-bg)',
              color: 'var(--color-destructive)',
            }}
            aria-hidden="true"
          >
            <Calendar size={18} />
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-foreground-muted)', fontWeight: 600 }}>
              {en.overview.dueDate}
            </span>
            <strong style={{ fontSize: '0.9375rem', color: 'var(--color-destructive)' }}>
              {nextActionDueDate}
            </strong>
          </div>
        </div>

        {/* Responsible Person */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
          <div
            style={{
              padding: '0.375rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
            }}
            aria-hidden="true"
          >
            <User size={18} />
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-foreground-muted)', fontWeight: 600 }}>
              {en.overview.responsiblePerson}
            </span>
            <strong style={{ fontSize: '0.9375rem', color: 'var(--color-foreground)' }}>
              {responsiblePerson}
            </strong>
          </div>
        </div>

        {/* Last Update Date */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
          <div
            style={{
              padding: '0.375rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-surface-hover)',
              color: 'var(--color-foreground-muted)',
            }}
            aria-hidden="true"
          >
            <Clock size={18} />
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-foreground-muted)', fontWeight: 600 }}>
              {en.overview.lastUpdate}
            </span>
            <span style={{ fontSize: '0.9375rem', color: 'var(--color-foreground)', fontWeight: 500 }}>
              {lastUpdateDate}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};
