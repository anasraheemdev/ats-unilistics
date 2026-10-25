import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { api } from '@/lib/api';
import { Lock } from 'lucide-react';
import { UserRole } from '@/types';

interface ExpiredSessionModalProps {
  onReauthenticated?: (newRole: UserRole) => void;
}

export const ExpiredSessionModal: React.FC<ExpiredSessionModalProps> = ({ onReauthenticated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const handleSessionExpired = () => {
      // Auto-populate current user email if available
      api.auth.getCurrentUser().then((u) => {
        if (u?.email) setEmail(u.email);
      });
      setError(null);
      setSuccess(false);
      setPassword('');
      setIsOpen(true);
    };

    window.addEventListener('unilistics:session-expired', handleSessionExpired);
    return () => {
      window.removeEventListener('unilistics:session-expired', handleSessionExpired);
    };
  }, []);

  const handleReauth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Please provide your password to resume this session.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const user = await api.auth.signIn(email || 'student@unilistics.edu.pk', password);
      setSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
        setPassword('');
        if (onReauthenticated && user?.role) {
          onReauthenticated(user.role);
        }
      }, 700);
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturnToLogin = () => {
    setIsOpen(false);
    window.location.href = `/sign-in?returnUrl=${encodeURIComponent(window.location.pathname)}`;
  };

  if (!isOpen) return null;

  return (
    <Modal
      id="expired-session-dialog"
      isOpen={isOpen}
      onClose={() => {
        // Prevent accidental dismiss without explicit choice
      }}
      title="Secure Session Timeout"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <Button variant="ghost" size="sm" onClick={handleReturnToLogin} type="button">
            Go to Full Login
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleReauth}
            isLoading={isLoading}
            id="btn-reauth-submit"
            type="submit"
          >
            Resume Active Session
          </Button>
        </div>
      }
    >
      <form onSubmit={handleReauth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-info-bg)',
            border: '1px solid var(--color-info-border)',
            color: 'var(--color-info)',
            fontSize: '0.875rem',
          }}
        >
          <Lock size={20} aria-hidden="true" style={{ flexShrink: 0 }} />
          <span>
            Your session timed out after 15 minutes of inactivity. To protect student records, re-authenticate to preserve
            your current page progress.
          </span>
        </div>

        {error && (
          <Alert variant="destructive" title="Re-authentication Issue">
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" title="Session Resumed">
            Credentials confirmed. Returning to your active view...
          </Alert>
        )}

        <Input
          label="Account Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your.email@example.com"
          required
          disabled={isLoading}
          id="reauth-email"
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••••••"
          required
          disabled={isLoading}
          id="reauth-password"
          helperText="Enter your Unilistics password to resume immediately."
        />
      </form>
    </Modal>
  );
};
