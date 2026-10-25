import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'highlight' | 'success' | 'warning' | 'destructive' | 'info';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  style,
  ...props
}) => {
  const variantStyles: Record<string, React.CSSProperties> = {
    default: {
      backgroundColor: 'var(--color-surface-hover)',
      color: 'var(--color-foreground)',
      border: '1px solid var(--color-border)',
    },
    primary: {
      backgroundColor: 'var(--color-primary-light)',
      color: 'var(--action-primary)',
      border: '1px solid var(--border-subtle)',
    },
    highlight: {
      backgroundColor: 'var(--brand-citron)',
      color: 'var(--color-on-highlight)',
      border: '1px solid var(--border-subtle)',
      fontWeight: 700,
    },
    success: {
      backgroundColor: 'var(--color-success-bg)',
      color: 'var(--color-success)',
      border: '1px solid var(--color-success-border)',
    },
    warning: {
      backgroundColor: 'var(--color-warning-bg)',
      color: 'var(--color-warning)',
      border: '1px solid var(--color-warning-border)',
    },
    destructive: {
      backgroundColor: 'var(--color-destructive-bg)',
      color: 'var(--color-destructive)',
      border: '1px solid var(--color-destructive-border)',
    },
    info: {
      backgroundColor: 'var(--color-info-bg)',
      color: 'var(--color-info)',
      border: '1px solid var(--color-info-border)',
    },
  };

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { padding: '0.125rem 0.5rem', fontSize: '0.75rem' },
    md: { padding: '0.25rem 0.75rem', fontSize: '0.8125rem' },
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.375rem',
        fontWeight: 600,
        fontFamily: 'var(--font-family-base)',
        borderRadius: 'var(--radius-pill)',
        lineHeight: 1.2,
        ...sizeStyles[size],
        ...variantStyles[variant],
        ...style,
      }}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
