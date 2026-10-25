import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'highlight' | 'outline' | 'destructive' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      style,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      fontWeight: 600,
      fontFamily: 'var(--font-family-base)',
      borderRadius: 'var(--radius-control)', // 16px control radius from guidelines
      transition: 'background-color var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast), box-shadow var(--transition-fast)',
      textDecoration: 'none',
      whiteSpace: 'nowrap',
      minHeight: 'var(--touch-target-default, 48px)', // 48px practical touch target, >= 44px min
      minWidth: 'var(--touch-target-min, 44px)',
      cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
      opacity: disabled || isLoading ? 0.65 : 1,
      boxShadow: variant === 'ghost' ? 'none' : 'var(--shadow-sm)',
      ...style,
    };

    const sizeStyles: Record<string, React.CSSProperties> = {
      sm: { padding: '0.375rem 0.875rem', fontSize: '0.875rem', minHeight: '44px' },
      md: { padding: '0.625rem 1.25rem', fontSize: '0.9375rem', minHeight: '48px' },
      lg: { padding: '0.75rem 1.75rem', fontSize: '1rem', minHeight: '52px' },
    };

    const variantStyles: Record<string, React.CSSProperties> = {
      primary: {
        backgroundColor: 'var(--color-primary)',
        color: 'var(--color-on-primary)',
        border: '1px solid var(--color-primary)',
      },
      secondary: {
        backgroundColor: 'var(--color-secondary)',
        color: 'var(--color-on-secondary)',
        border: '1px solid var(--color-secondary)',
      },
      accent: {
        backgroundColor: 'var(--brand-citron)',
        color: 'var(--color-on-highlight)',
        border: '1px solid var(--brand-citron)',
        fontWeight: 700,
      },
      highlight: {
        backgroundColor: 'var(--brand-citron)',
        color: 'var(--color-on-highlight)',
        border: '1px solid var(--brand-citron)',
        fontWeight: 700,
      },
      outline: {
        backgroundColor: 'transparent',
        color: 'var(--action-primary)',
        border: '1px solid var(--color-border)',
      },
      destructive: {
        backgroundColor: 'var(--color-destructive)',
        color: 'var(--color-on-destructive)',
        border: '1px solid var(--color-destructive)',
      },
      ghost: {
        backgroundColor: 'transparent',
        color: 'var(--color-foreground)',
        border: '1px solid transparent',
      },
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        style={{
          ...baseStyle,
          ...sizeStyles[size],
          ...variantStyles[variant],
        }}
        {...props}
      >
        {isLoading && (
          <span
            style={{
              display: 'inline-block',
              width: '1em',
              height: '1em',
              border: '2px solid currentColor',
              borderRightColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 0.75s linear infinite',
            }}
            aria-hidden="true"
          />
        )}
        {!isLoading && leftIcon && <span aria-hidden="true">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span aria-hidden="true">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
