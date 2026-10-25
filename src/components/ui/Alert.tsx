import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

export interface AlertProps {
  variant?: 'info' | 'warning' | 'success' | 'destructive';
  title?: string;
  children: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
}) => {
  const configs = {
    info: {
      bg: 'var(--color-info-bg)',
      border: 'var(--color-info-border)',
      color: 'var(--color-info)',
      icon: Info,
    },
    warning: {
      bg: 'var(--color-warning-bg)',
      border: 'var(--color-warning-border)',
      color: 'var(--color-warning)',
      icon: AlertTriangle,
    },
    success: {
      bg: 'var(--color-success-bg)',
      border: 'var(--color-success-border)',
      color: 'var(--color-success)',
      icon: CheckCircle2,
    },
    destructive: {
      bg: 'var(--color-destructive-bg)',
      border: 'var(--color-destructive-border)',
      color: 'var(--color-destructive)',
      icon: AlertCircle,
    },
  };

  const current = configs[variant];
  const IconComponent = current.icon;

  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        padding: '1rem 1.25rem',
        borderRadius: 'var(--radius-control)', // 16px control radius
        backgroundColor: current.bg,
        border: `1px solid ${current.border}`,
        marginBottom: '1rem',
        fontFamily: 'var(--font-family-base)',
      }}
    >
      <IconComponent
        size={20}
        style={{ color: current.color, flexShrink: 0, marginTop: '2px' }}
        aria-hidden="true"
      />
      <div style={{ flex: 1, fontSize: '0.875rem', color: 'var(--color-foreground)', lineHeight: 1.5 }}>
        {title && (
          <div style={{ fontWeight: 700, color: current.color, marginBottom: '0.25rem' }}>
            {title}
          </div>
        )}
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Alert;
