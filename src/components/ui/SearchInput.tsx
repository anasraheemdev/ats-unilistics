import React, { useRef } from 'react';
import { Search, X } from 'lucide-react';

export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  onClear?: () => void;
  shortcutHint?: string;
  containerStyle?: React.CSSProperties;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      label = 'Search',
      value,
      onChange,
      onClear,
      shortcutHint,
      placeholder = 'Search universities, programs, or keywords...',
      disabled,
      style,
      containerStyle,
      id,
      ...props
    },
    ref
  ) => {
    const internalInputRef = useRef<HTMLInputElement>(null);
    const resolvedRef = (ref || internalInputRef) as React.RefObject<HTMLInputElement>;
    const inputId = id || `search-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

    const handleClear = () => {
      if (onClear) {
        onClear();
      } else if (onChange) {
        const syntheticEvent = {
          target: { value: '' },
          currentTarget: { value: '' },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }
      resolvedRef.current?.focus();
    };

    const hasValue = Boolean(value && String(value).length > 0);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', width: '100%', ...containerStyle }}>
        {label && (
          <label
            htmlFor={inputId}
            className="sr-only"
          >
            {label}
          </label>
        )}

        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            width: '100%',
          }}
        >
          {/* Leading Search Icon */}
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
            <Search size={20} strokeWidth={2} />
          </div>

          <input
            ref={resolvedRef}
            id={inputId}
            type="search"
            value={value}
            onChange={onChange}
            disabled={disabled}
            placeholder={placeholder}
            style={{
              width: '100%',
              minHeight: 'var(--touch-target-default, 48px)',
              padding: '0.625rem 2.75rem 0.625rem 2.875rem', // Accommodate search icon and clear button
              borderRadius: 'var(--radius-control, 16px)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-foreground)',
              fontFamily: 'var(--font-family-base)',
              fontSize: '0.9375rem',
              lineHeight: 1.5,
              transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
              outline: 'none',
              ...style,
            }}
            {...props}
          />

          {/* Trailing Controls: Clear Button or Keyboard Shortcut Hint */}
          <div
            style={{
              position: 'absolute',
              right: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
            }}
          >
            {hasValue && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear search query"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-pill)',
                  border: 'none',
                  backgroundColor: 'var(--color-surface-hover)',
                  color: 'var(--color-foreground-muted)',
                  cursor: 'pointer',
                  transition: 'background-color var(--transition-fast), color var(--transition-fast)',
                }}
              >
                <X size={16} strokeWidth={2} aria-hidden="true" />
              </button>
            )}

            {!hasValue && shortcutHint && (
              <kbd
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '0.125rem 0.5rem',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  fontFamily: 'var(--font-family-base)',
                  color: 'var(--color-foreground-muted)',
                  backgroundColor: 'var(--surface-recessed)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-xs)',
                  letterSpacing: '0.04em',
                }}
                aria-hidden="true"
              >
                {shortcutHint}
              </kbd>
            )}
          </div>
        </div>
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';

export default SearchInput;
