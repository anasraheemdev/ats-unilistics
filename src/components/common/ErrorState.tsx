import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Failed to load records',
  message = 'An error occurred while fetching information from the server.',
  onRetry,
}) => {
  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1.5rem',
        textAlign: 'center',
        backgroundColor: 'var(--color-destructive-bg)',
        border: '1px solid var(--color-destructive-border)',
        borderRadius: 'var(--radius-card, 24px)',
        margin: '1.5rem 0',
        fontFamily: 'var(--font-family-base)',
      }}
    >
      <div
        style={{
          color: 'var(--color-destructive)',
          marginBottom: '0.75rem',
        }}
        aria-hidden="true"
      >
        <AlertCircle size={36} strokeWidth={2} />
      </div>

      <h3
        style={{
          fontSize: '1.125rem',
          fontWeight: 700,
          color: 'var(--color-destructive)',
          marginBottom: '0.5rem',
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontSize: '0.875rem',
          color: 'var(--color-foreground)',
          maxWidth: '460px',
          lineHeight: 1.5,
          marginBottom: onRetry ? '1.5rem' : 0,
        }}
      >
        {message}
      </p>

      {onRetry && (
        <Button
          variant="outline"
          size="md"
          onClick={onRetry}
          leftIcon={<RotateCcw size={16} strokeWidth={2} />}
        >
          Try Again
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
