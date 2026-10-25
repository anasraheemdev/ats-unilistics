import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'panel' | 'highlight' | 'warning' | 'info';
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
    sm: '1rem',      // 16px
    md: '1.5rem',    // 24px panel padding from guidelines
    lg: '2rem',      // 32px section spacing from guidelines
  };

  const variantMap: Record<string, React.CSSProperties> = {
    default: {
      backgroundColor: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
    },
    panel: {
      backgroundColor: 'var(--surface-panel)',
      border: '1px solid var(--color-border)',
    },
    highlight: {
      backgroundColor: 'var(--color-surface)',
      border: '2px solid var(--action-primary)',
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
        borderRadius: 'var(--radius-card)', // 24px card radius
        boxShadow: 'var(--shadow-card)',    // Quiet shadow
        padding: paddingMap[padding],
        transition: 'border-color var(--transition-fast), background-color var(--transition-fast)',
        ...variantMap[variant],
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
