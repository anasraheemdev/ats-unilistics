import React from 'react';
import { Calendar } from 'lucide-react';

export interface DateInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
  helperText?: string;
}

export const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  ({ label, error, helperText, id, required, style, ...props }, ref) => {
    const inputId = id || `date-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    const helperId = `${inputId}-helper`;
    const errorId = `${inputId}-error`;

    const describedBy = [error ? errorId : null, helperText ? helperId : null]
      .filter(Boolean)
      .join(' ') || undefined;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', marginBottom: '1rem', width: '100%' }}>
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

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
          <div
            style={{
              position: 'absolute',
              left: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-foreground-muted)',
              pointerEvents: 'none',
            }}
            aria-hidden="true"
          >
            <Calendar size={20} strokeWidth={2} />
          </div>

          <input
            ref={ref}
            type="date"
            id={inputId}
            required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            style={{
              width: '100%',
              minHeight: 'var(--touch-target-default, 48px)',
              padding: '0.625rem 0.875rem 0.625rem 2.875rem', // Accommodate calendar icon
              borderRadius: 'var(--radius-control, 16px)',
              border: `1px solid ${error ? 'var(--color-destructive)' : 'var(--color-border)'}`,
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-foreground)',
              fontFamily: 'var(--font-family-base)',
              fontSize: '1rem',
              transition: 'border-color var(--transition-fast)',
              ...style,
            }}
            {...props}
          />
        </div>

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

DateInput.displayName = 'DateInput';

export default DateInput;
