import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'highlight' | 'warning' | 'info';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  style,
  ...props
}) => {
  const paddingMap = {
    none: '0',
    sm: '0.75rem',
    md: '1.25rem',
    lg: '1.75rem',
  };

  const variantMap: Record<string, React.CSSProperties> = {
    default: {
      backgroundColor: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
    },
    highlight: {
      backgroundColor: 'var(--color-surface)',
      border: '2px solid var(--color-primary)',
    },
    warning: {
      backgroundColor: 'var(--color-warning-bg)',
      border: '1px solid var(--color-warning-border)',
    },
    info: {
      backgroundColor: 'var(--color-info-bg)',
      border: '1px solid var(--color-info-border)',
    },
  };

  return (
    <div
      style={{
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        padding: paddingMap[padding],
        ...variantMap[variant],
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
};
