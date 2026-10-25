import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, LogIn, UserPlus, X } from 'lucide-react';

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
          backgroundColor: 'rgba(26, 28, 30, 0.45)',
          backdropFilter: 'blur(3px)',
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
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-card, 16px)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
          border: '1px solid var(--border-subtle, #ebe6de)',
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
            padding: '0.35rem',
            borderRadius: 'var(--radius-full, 9999px)',
            border: 'none',
            backgroundColor: 'transparent',
            color: 'var(--text-muted, #636b78)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
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
              backgroundColor: 'var(--accent-peach-bg, #ffefea)',
              color: 'var(--action-primary, #b72301)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}
            aria-hidden="true"
          >
            <Lock size={24} />
          </div>

          <h2
            id="locked-dialog-title"
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: 'var(--text-charcoal, #1a1a1a)',
              marginBottom: '0.5rem',
            }}
          >
            Catalogue Filters Locked
          </h2>

          <p
            id="locked-dialog-desc"
            style={{
              fontSize: '0.9375rem',
              color: 'var(--text-muted, #636b78)',
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            Sign in or create an account to use filters and explore the full catalogue.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            ref={primaryButtonRef}
            type="button"
            onClick={handleSignUp}
            className="btn-pill btn-pill-primary"
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              fontSize: '0.9375rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
            }}
          >
            <UserPlus size={18} aria-hidden="true" />
            <span>Create Free Account (Sign Up)</span>
          </button>

          <button
            type="button"
            onClick={handleSignIn}
            className="btn-pill btn-pill-outline"
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              fontSize: '0.9375rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
            }}
          >
            <LogIn size={18} aria-hidden="true" />
            <span>Sign In to Existing Account</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: '100%',
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'var(--text-muted, #636b78)',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              marginTop: '0.25rem',
            }}
          >
            Continue browsing preview
          </button>
        </div>
      </div>
    </div>
  );
};
