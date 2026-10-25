import React, { useState, useId } from 'react';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 0,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const tooltipId = useId();

  const showTooltip = () => {
    if (delay > 0) {
      const id = setTimeout(() => {
        setIsVisible(true);
      }, delay);
      setTimeoutId(id);
    } else {
      setIsVisible(true);
    }
  };

  const hideTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsVisible(false);
  };

  const positionStyles: Record<string, React.CSSProperties> = {
    top: {
      bottom: 'calc(100% + 8px)',
      left: '50%',
      transform: 'translateX(-50%)',
    },
    bottom: {
      top: 'calc(100% + 8px)',
      left: '50%',
      transform: 'translateX(-50%)',
    },
    left: {
      right: 'calc(100% + 8px)',
      top: '50%',
      transform: 'translateY(-50%)',
    },
    right: {
      left: 'calc(100% + 8px)',
      top: '50%',
      transform: 'translateY(-50%)',
    },
  };

  return (
    <div
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {React.cloneElement(children, {
        'aria-describedby': isVisible ? tooltipId : undefined,
      })}

      {isVisible && (
        <div
          id={tooltipId}
          role="tooltip"
          style={{
            position: 'absolute',
            zIndex: 1000,
            padding: '0.375rem 0.75rem',
            backgroundColor: 'var(--surface-elevated, #203326)',
            color: 'var(--text-charcoal, #F2F7F4)',
            fontSize: '0.75rem',
            fontWeight: 500,
            fontFamily: 'var(--font-family-base)',
            borderRadius: 'var(--radius-sm, 10px)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-floating)',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            lineHeight: 1.3,
            animation: 'tooltip-fade var(--transition-fast)',
            ...positionStyles[position],
          }}
        >
          {content}
        </div>
      )}
      <style>{`
        @keyframes tooltip-fade {
          from { opacity: 0; transform: scale(0.96) ${position === 'top' || position === 'bottom' ? 'translateX(-50%)' : 'translateY(-50%)'}; }
          to { opacity: 1; transform: scale(1) ${position === 'top' || position === 'bottom' ? 'translateX(-50%)' : 'translateY(-50%)'}; }
        }
      `}</style>
    </div>
  );
};

export default Tooltip;
