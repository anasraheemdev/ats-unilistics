import React from 'react';
import { CaseStage } from '@/types';
import { en } from '@/lib/i18n';
import { Check } from 'lucide-react';

interface StageTimelineProps {
  currentStage: CaseStage;
}

const STAGES_ORDER: CaseStage[] = [
  'onboarding',
  'attestation',
  'dossier_assembly',
  'submission',
  'decision',
  'visa_prep',
  'relocation',
];

export const StageTimeline: React.FC<StageTimelineProps> = ({ currentStage }) => {
  const currentIndex = STAGES_ORDER.indexOf(currentStage);

  return (
    <nav aria-label="Application Progress Stages" style={{ margin: '1.5rem 0' }}>
      <ol
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '0.75rem',
          listStyle: 'none',
          padding: 0,
          margin: 0,
        }}
      >
        {STAGES_ORDER.map((stageKey, idx) => {
          const isCurrent = stageKey === currentStage;
          const isPassed = currentIndex > idx;
          const stageName = en.stages[stageKey] || stageKey;

          let badgeBg = 'var(--surface-recessed)';
          let badgeBorder = 'var(--border-subtle)';
          let textColor = 'var(--color-foreground-muted)';

          if (isCurrent) {
            badgeBg = 'var(--surface-selected)';
            badgeBorder = 'var(--action-primary)';
            textColor = 'var(--action-primary)';
          } else if (isPassed) {
            badgeBg = 'var(--color-success-bg)';
            badgeBorder = 'var(--color-success-border)';
            textColor = 'var(--color-success)';
          }

          return (
            <li
              key={stageKey}
              aria-current={isCurrent ? 'step' : undefined}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.375rem',
                padding: '0.75rem 0.875rem',
                borderRadius: 'var(--radius-control, 16px)',
                backgroundColor: badgeBg,
                border: `1.5px solid ${badgeBorder}`,
                transition: 'all var(--transition-fast)',
                fontFamily: 'var(--font-family-base)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: textColor,
                }}
              >
                <span>Step {idx + 1}</span>
                {isPassed && <Check size={14} strokeWidth={2.5} aria-hidden="true" />}
                {isCurrent && (
                  <span
                    style={{
                      fontSize: '0.625rem',
                      textTransform: 'uppercase',
                      padding: '0.125rem 0.375rem',
                      backgroundColor: 'var(--action-primary)',
                      color: 'var(--color-on-primary)',
                      borderRadius: 'var(--radius-pill)',
                      fontWeight: 700,
                    }}
                  >
                    Current
                  </span>
                )}
              </div>

              <span
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: isCurrent ? 700 : 500,
                  color: isCurrent ? 'var(--action-primary)' : 'var(--color-foreground)',
                  lineHeight: 1.3,
                }}
              >
                {stageName}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default StageTimeline;
