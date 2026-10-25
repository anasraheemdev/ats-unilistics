import React, { createContext, useContext, useState, useId } from 'react';

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (value: string) => void;
  baseId: string;
}

const TabsContext = createContext<TabsContextValue | null>(null);

export interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  defaultValue,
  value,
  onValueChange,
  children,
  className,
}) => {
  const [internalTab, setInternalTab] = useState(defaultValue);
  const baseId = useId();

  const activeTab = value !== undefined ? value : internalTab;

  const setActiveTab = (val: string) => {
    if (value === undefined) {
      setInternalTab(val);
    }
    if (onValueChange) {
      onValueChange(val);
    }
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab, baseId }}>
      <div className={className} style={{ width: '100%' }}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

export interface TabListProps {
  children: React.ReactNode;
  ariaLabel: string;
  variant?: 'pill' | 'underline';
  style?: React.CSSProperties;
}

export const TabList: React.FC<TabListProps> = ({
  children,
  ariaLabel,
  variant = 'pill',
  style,
}) => {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: variant === 'pill' ? '0.375rem' : '1.5rem',
        padding: variant === 'pill' ? '0.25rem' : '0',
        backgroundColor: variant === 'pill' ? 'var(--surface-recessed)' : 'transparent',
        borderRadius: variant === 'pill' ? 'var(--radius-control)' : '0',
        borderBottom: variant === 'underline' ? '1px solid var(--border-subtle)' : 'none',
        overflowX: 'auto',
        maxWidth: '100%',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export interface TabTriggerProps {
  value: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  count?: number;
  disabled?: boolean;
}

export const TabTrigger: React.FC<TabTriggerProps> = ({
  value,
  children,
  icon,
  count,
  disabled,
}) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabTrigger must be used within Tabs');

  const isSelected = context.activeTab === value;
  const tabId = `${context.baseId}-tab-${value}`;
  const panelId = `${context.baseId}-panel-${value}`;

  return (
    <button
      role="tab"
      id={tabId}
      aria-selected={isSelected}
      aria-controls={panelId}
      tabIndex={isSelected ? 0 : -1}
      disabled={disabled}
      onClick={() => context.setActiveTab(value)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        padding: '0.625rem 1.125rem',
        minHeight: 'var(--touch-target-min, 44px)',
        borderRadius: 'var(--radius-control)',
        fontSize: '0.875rem',
        fontWeight: isSelected ? 600 : 500,
        fontFamily: 'var(--font-family-base)',
        color: isSelected ? 'var(--color-on-selected, #19261F)' : 'var(--color-foreground-muted)',
        backgroundColor: isSelected ? 'var(--surface-selected, #E2ECE0)' : 'transparent',
        border: '1px solid',
        borderColor: isSelected ? 'var(--border-selected, #245B42)' : 'transparent',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all var(--transition-fast)',
        whiteSpace: 'nowrap',
      }}
    >
      {icon && <span aria-hidden="true" style={{ display: 'inline-flex' }}>{icon}</span>}
      <span>{children}</span>
      {count !== undefined && (
        <span
          style={{
            fontSize: '0.75rem',
            padding: '0.125rem 0.5rem',
            borderRadius: 'var(--radius-pill)',
            backgroundColor: isSelected ? 'var(--action-primary)' : 'var(--surface-hover)',
            color: isSelected ? 'var(--color-on-primary)' : 'var(--color-foreground-muted)',
            fontWeight: 700,
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
};

export interface TabContentProps {
  value: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const TabContent: React.FC<TabContentProps> = ({
  value,
  children,
  style,
}) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabContent must be used within Tabs');

  const isSelected = context.activeTab === value;
  const tabId = `${context.baseId}-tab-${value}`;
  const panelId = `${context.baseId}-panel-${value}`;

  if (!isSelected) return null;

  return (
    <div
      role="tabpanel"
      id={panelId}
      aria-labelledby={tabId}
      tabIndex={0}
      style={{
        paddingTop: '1.25rem',
        outline: 'none',
        ...style,
      }}
    >
      {children}
    </div>
  );
};
