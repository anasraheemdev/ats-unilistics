import React from 'react';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: React.ReactNode;
  description?: string;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, error, id, checked, disabled, onChange, style, ...props }, ref) => {
    const inputId = id || `checkbox-${Math.random().toString(36).substring(2, 9)}`;
    const errorId = `${inputId}-error`;
    const descId = `${inputId}-desc`;

    const describedBy = [error ? errorId : null, description ? descId : null]
      .filter(Boolean)
      .join(' ') || undefined;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '0.75rem' }}>
        <label
          htmlFor={inputId}
          style={{
            display: 'inline-flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            cursor: disabled ? 'not-allowed' : 'pointer',
            minHeight: 'var(--touch-target-min, 44px)',
            padding: '0.375rem 0',
            opacity: disabled ? 0.6 : 1,
            userSelect: 'none',
          }}
        >
          {/* Hidden Accessible Native Checkbox */}
          <input
            ref={ref}
            type="checkbox"
            id={inputId}
            checked={checked}
            disabled={disabled}
            onChange={onChange}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            style={{
              position: 'absolute',
              width: '1px',
              height: '1px',
              padding: 0,
              margin: '-1px',
              overflow: 'hidden',
              clip: 'rect(0, 0, 0, 0)',
              whiteSpace: 'nowrap',
              border: 0,
            }}
            {...props}
          />

          {/* Styled Checkbox Box */}
          <div
            style={{
              position: 'relative',
              width: '20px',
              height: '20px',
              minWidth: '20px',
              borderRadius: 'var(--radius-xs, 6px)',
              border: error
                ? '2px solid var(--color-destructive)'
                : checked
                ? '2px solid var(--action-primary)'
                : '2px solid var(--border-refined, #CBD7CA)',
              backgroundColor: checked ? 'var(--action-primary)' : 'var(--color-surface)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '2px',
              transition: 'background-color var(--transition-fast), border-color var(--transition-fast)',
              color: 'var(--color-on-primary)',
              ...style,
            }}
            aria-hidden="true"
          >
            {checked && <Check size={14} strokeWidth={3} />}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
            <span
              style={{
                fontSize: '0.9375rem',
                fontWeight: 500,
                color: 'var(--color-foreground)',
                lineHeight: 1.4,
              }}
            >
              {label}
            </span>
            {description && (
              <span id={descId} style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted)', lineHeight: 1.4 }}>
                {description}
              </span>
            )}
          </div>
        </label>

        {error && (
          <span
            id={errorId}
            role="alert"
            style={{
              fontSize: '0.8125rem',
              color: 'var(--color-destructive)',
              fontWeight: 500,
              marginLeft: '2rem',
            }}
          >
            {error}
          </span>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
