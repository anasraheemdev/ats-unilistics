import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, id, required, style, type = 'text', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const computedType = isPassword ? (showPassword ? 'text' : 'password') : type;

    const inputId = id || `input-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
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

        <div style={{ position: 'relative', width: '100%' }}>
          <input
            ref={ref}
            id={inputId}
            type={computedType}
            required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              minHeight: 'var(--touch-target-default, 48px)', // 48px touch target from guidelines
              padding: isPassword ? '0.625rem 2.75rem 0.625rem 0.875rem' : '0.625rem 0.875rem',
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

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                padding: '0.25rem',
                color: 'var(--color-foreground-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '32px',
                minHeight: '32px',
              }}
            >
              {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
            </button>
          )}
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

Input.displayName = 'Input';

export default Input;
