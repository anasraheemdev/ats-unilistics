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
        backgroundColor: 'var(--surface-card)',
        borderRadius: 'var(--radius-card, 24px)',
        border: '1px solid var(--border-subtle)',
        borderLeft: '4px solid var(--action-primary)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: 'var(--action-primary)',
          fontSize: '0.8125rem',
          fontWeight: 600,
          letterSpacing: '0.02em',
          marginBottom: '0.5rem',
          fontFamily: 'var(--font-family-base)',
        }}
      >
        <AlertCircle size={18} strokeWidth={2} aria-hidden="true" />
        <span>Action required now • Stage: {currentStage}</span>
      </div>

      <h2
        style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color: 'var(--color-foreground)',
          lineHeight: 1.35,
          marginBottom: '1.25rem',
          fontFamily: 'var(--font-family-base)',
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
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        {/* Due Date */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
          <div
            style={{
              padding: '0.5rem',
              borderRadius: 'var(--radius-control, 16px)',
              backgroundColor: 'var(--color-destructive-bg)',
              color: 'var(--color-destructive)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-hidden="true"
          >
            <Calendar size={18} strokeWidth={2} />
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
              padding: '0.5rem',
              borderRadius: 'var(--radius-control, 16px)',
              backgroundColor: 'var(--surface-selected)',
              color: 'var(--action-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-hidden="true"
          >
            <User size={18} strokeWidth={2} />
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
              padding: '0.5rem',
              borderRadius: 'var(--radius-control, 16px)',
              backgroundColor: 'var(--surface-recessed)',
              color: 'var(--color-foreground-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-hidden="true"
          >
            <Clock size={18} strokeWidth={2} />
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

export default DeadlineCard;
