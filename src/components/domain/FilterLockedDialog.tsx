import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, LogIn, UserPlus, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface FilterLockedDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initiatingElement?: HTMLElement | null;
  returnUrl?: string;
}

export const FilterLockedDialog: React.FC<FilterLockedDialogProps> = ({
  isOpen,
  onClose,
  initiatingElement,
  returnUrl = '/universities',
}) => {
  const navigate = useNavigate();
  const dialogRef = useRef<HTMLDivElement>(null);
  const primaryButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap & escape key handler
  useEffect(() => {
    if (!isOpen) return;

    // Focus primary button when modal opens
    const timer = setTimeout(() => {
      primaryButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        initiatingElement?.focus();
      } else if (e.key === 'Tab' && dialogRef.current) {
        // Simple focus trap
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
      initiatingElement?.focus();
    };
  }, [isOpen, onClose, initiatingElement]);

  if (!isOpen) return null;

  const handleSignIn = () => {
    onClose();
    navigate(`/sign-in?returnUrl=${encodeURIComponent(returnUrl)}`);
  };

  const handleSignUp = () => {
    onClose();
    navigate(`/sign-up?returnUrl=${encodeURIComponent(returnUrl)}`);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(13, 21, 17, 0.72)',
          backdropFilter: 'blur(4px)',
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog Surface */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="locked-dialog-title"
        aria-describedby="locked-dialog-desc"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '460px',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-panel)',
          boxShadow: 'var(--shadow-floating)',
          border: '1px solid var(--color-border)',
          padding: '2rem 1.75rem',
          zIndex: 101,
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            padding: '0.5rem',
            borderRadius: 'var(--radius-full)',
            border: 'none',
            backgroundColor: 'transparent',
            color: 'var(--color-foreground-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '36px',
            minHeight: '36px',
          }}
        >
          <X size={18} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}
            aria-hidden="true"
          >
            <Lock size={24} strokeWidth={2} />
          </div>

          <h2
            id="locked-dialog-title"
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: 'var(--color-foreground)',
              marginBottom: '0.5rem',
              fontFamily: 'var(--font-family-base)',
            }}
          >
            Catalogue Filters Locked
          </h2>

          <p
            id="locked-dialog-desc"
            style={{
              fontSize: '0.9375rem',
              color: 'var(--color-foreground-muted)',
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            Sign in or create an account to use filters and explore the full catalogue.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Button
            ref={primaryButtonRef}
            variant="primary"
            onClick={handleSignUp}
            leftIcon={<UserPlus size={18} />}
            style={{ width: '100%', minHeight: '48px' }}
          >
            Create Free Account (Sign Up)
          </Button>

          <Button
            variant="outline"
            onClick={handleSignIn}
            leftIcon={<LogIn size={18} />}
            style={{ width: '100%', minHeight: '48px' }}
          >
            Sign In to Existing Account
          </Button>

          <Button
            variant="ghost"
            onClick={onClose}
            style={{ width: '100%', minHeight: '40px', color: 'var(--color-foreground-muted)' }}
          >
            Continue browsing preview
          </Button>
        </div>
      </div>
    </div>
  );
};
