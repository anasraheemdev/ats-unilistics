import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, id, required, style, ...props }, ref) => {
    const inputId = id || `input-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    const helperId = `${inputId}-helper`;
    const errorId = `${inputId}-error`;

    const describedBy = [error ? errorId : null, helperText ? helperId : null]
      .filter(Boolean)
      .join(' ') || undefined;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', marginBottom: '1rem' }}>
        <label
          htmlFor={inputId}
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            fontFamily: 'var(--font-family-base)',
            color: 'var(--color-foreground)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}
        >
          {label}
          {required && (
            <span style={{ color: 'var(--color-destructive)' }} aria-label="required">
              *
            </span>
          )}
        </label>

        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          style={{
            minHeight: 'var(--touch-target-default, 48px)', // 48px touch target from guidelines
            padding: '0.625rem 0.875rem',
            borderRadius: 'var(--radius-control)',          // 16px control radius from guidelines
            border: `1px solid ${error ? 'var(--color-destructive)' : 'var(--color-border)'}`,
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-foreground)',
            fontFamily: 'var(--font-family-base)',
            fontSize: '1rem',
            transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
            ...style,
          }}
          {...props}
        />

        {helperText && !error && (
          <span id={helperId} style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted)' }}>
            {helperText}
          </span>
        )}

        {error && (
          <span
            id={errorId}
            role="alert"
            style={{ fontSize: '0.8125rem', color: 'var(--color-destructive)', fontWeight: 500 }}
          >
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
