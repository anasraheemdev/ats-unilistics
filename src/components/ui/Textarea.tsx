import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, id, required, style, rows = 4, ...props }, ref) => {
    const textareaId = id || `textarea-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    const helperId = `${textareaId}-helper`;
    const errorId = `${textareaId}-error`;

    const describedBy = [error ? errorId : null, helperText ? helperId : null]
      .filter(Boolean)
      .join(' ') || undefined;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', marginBottom: '1rem' }}>
        <label
          htmlFor={textareaId}
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

        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          style={{
            padding: '0.75rem 0.875rem',
            borderRadius: 'var(--radius-control)', // 16px control radius from guidelines
            border: `1px solid ${error ? 'var(--color-destructive)' : 'var(--color-border)'}`,
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-foreground)',
            fontFamily: 'var(--font-family-base)',
            fontSize: '1rem',
            lineHeight: 1.5,
            resize: 'vertical',
            transition: 'border-color var(--transition-fast)',
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

Textarea.displayName = 'Textarea';

export default Textarea;
