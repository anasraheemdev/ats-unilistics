import React from 'react';

interface LoadingStateProps {
  message?: string;
  minHeight?: string;
  variant?: 'spinner' | 'card-skeleton' | 'table-skeleton';
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading verified records...',
  minHeight = '240px',
  variant = 'spinner',
}) => {
  if (variant === 'card-skeleton') {
    return (
      <div
        role="status"
        aria-live="polite"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          width: '100%',
          padding: '1rem 0',
        }}
      >
        <span className="sr-only">{message}</span>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              padding: '1.5rem',
              borderRadius: 'var(--radius-card, 24px)',
              backgroundColor: 'var(--surface-card)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div
              style={{
                width: '60%',
                height: '20px',
                backgroundColor: 'var(--surface-recessed)',
                borderRadius: 'var(--radius-xs)',
                animation: 'skeleton-pulse 1.5s ease-in-out infinite',
              }}
            />
            <div
              style={{
                width: '90%',
                height: '14px',
                backgroundColor: 'var(--surface-recessed)',
                borderRadius: 'var(--radius-xs)',
                animation: 'skeleton-pulse 1.5s ease-in-out infinite',
              }}
            />
            <div
              style={{
                width: '40%',
                height: '14px',
                backgroundColor: 'var(--surface-recessed)',
                borderRadius: 'var(--radius-xs)',
                animation: 'skeleton-pulse 1.5s ease-in-out infinite',
              }}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight,
        gap: '1rem',
        padding: '2rem',
        color: 'var(--color-foreground-muted)',
        fontFamily: 'var(--font-family-base)',
      }}
    >
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          border: '3px solid var(--border-subtle)',
          borderTopColor: 'var(--action-primary)',
          animation: 'spin 0.8s linear infinite',
        }}
        aria-hidden="true"
      />
      <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{message}</span>
      <style>{`
        @keyframes skeleton-pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default LoadingState;
