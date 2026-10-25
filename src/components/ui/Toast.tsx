import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type ToastVariant = 'success' | 'warning' | 'error' | 'info';

export interface ToastItem {
  id: string;
  variant: ToastVariant;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastItem, 'id'>) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ variant, title, message, duration = 4500 }: Omit<ToastItem, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, variant, title, message, duration }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (title: string, message?: string) => showToast({ variant: 'success', title, message }),
    [showToast]
  );
  const error = useCallback(
    (title: string, message?: string) => showToast({ variant: 'error', title, message }),
    [showToast]
  );
  const warning = useCallback(
    (title: string, message?: string) => showToast({ variant: 'warning', title, message }),
    [showToast]
  );
  const info = useCallback(
    (title: string, message?: string) => showToast({ variant: 'info', title, message }),
    [showToast]
  );

  const iconMap: Record<ToastVariant, React.ReactNode> = {
    success: <CheckCircle2 size={20} strokeWidth={2} style={{ color: 'var(--color-success)' }} />,
    warning: <AlertTriangle size={20} strokeWidth={2} style={{ color: 'var(--color-warning)' }} />,
    error: <AlertCircle size={20} strokeWidth={2} style={{ color: 'var(--color-destructive)' }} />,
    info: <Info size={20} strokeWidth={2} style={{ color: 'var(--color-info)' }} />,
  };

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      {/* Toast Notification Container */}
      <div
        aria-live="polite"
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          zIndex: 9999,
          maxWidth: '420px',
          width: 'calc(100vw - 3rem)',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.variant === 'error' ? 'alert' : 'status'}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              padding: '1rem 1.25rem',
              backgroundColor: 'var(--surface-card)',
              borderRadius: 'var(--radius-control, 16px)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-floating)',
              pointerEvents: 'auto',
              animation: 'toast-slide-up var(--transition-fast)',
              fontFamily: 'var(--font-family-base)',
            }}
          >
            <div style={{ flexShrink: 0, marginTop: '2px' }} aria-hidden="true">
              {iconMap[toast.variant]}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--color-foreground)',
                  marginBottom: toast.message ? '0.25rem' : 0,
                  lineHeight: 1.3,
                }}
              >
                {toast.title}
              </div>
              {toast.message && (
                <div
                  style={{
                    fontSize: '0.8125rem',
                    color: 'var(--color-foreground-muted)',
                    lineHeight: 1.5,
                  }}
                >
                  {toast.message}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss notification"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.25rem',
                border: 'none',
                backgroundColor: 'transparent',
                color: 'var(--color-foreground-muted)',
                cursor: 'pointer',
                borderRadius: 'var(--radius-xs)',
                flexShrink: 0,
              }}
            >
              <X size={16} strokeWidth={2} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes toast-slide-up {
          from { transform: translateY(12px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
