import React, { useState } from 'react';
import { SignInFormSchema } from '@/types/validation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { LogIn, KeyRound, ShieldAlert } from 'lucide-react';
import { UserRole } from '@/types';
import { getSafePostLoginRedirect } from '@/config/routes';

interface SignInPageProps {
  onRoleChange: (newRole: UserRole) => void;
}

export const SignInPage: React.FC<SignInPageProps> = ({ onRoleChange }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [requiresMfa, setRequiresMfa] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rawTarget = searchParams.get('returnUrl') || searchParams.get('redirect');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setErrorMsg(null);

    const result = SignInFormSchema.safeParse({ email, password, mfaCode });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        if (field && !fieldErrors[field]) {
          fieldErrors[field] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    try {
      const user = await api.auth.signIn(email, password, mfaCode);
      onRoleChange(user.role);
      navigate(getSafePostLoginRedirect(rawTarget, user.role));
    } catch (err: any) {
      const message = err?.message || 'Invalid email or credentials. Please check your credentials.';
      if (message.includes('MFA / AAL2')) {
        setRequiresMfa(true);
      }
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async (role: UserRole) => {
    const user = await api.auth.switchRole(role);
    onRoleChange(user.role);
    navigate(getSafePostLoginRedirect(rawTarget, user.role));
  };

  return (
    <div className="container" style={{ maxWidth: '480px', padding: '3rem 1rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Platform Sign In
        </h1>
        <p style={{ color: 'var(--color-foreground-muted)', fontSize: '0.875rem' }}>
          Access your managed student case room or staff administration workspace.
        </p>
      </div>

      <Card padding="lg">
        {errorMsg && (
          <Alert variant="destructive" title="Authentication Feedback">
            {errorMsg}
          </Alert>
        )}

        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Input
            label="Registered Email Address"
            type="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
            }}
            error={errors.email}
            placeholder="e.g. student@example.com"
          />

          <div>
            <Input
              id="signin-password"
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
              }}
              error={errors.password}
              placeholder="••••••••"
            />
            <div style={{ textAlign: 'right', marginTop: '-0.5rem', marginBottom: '0.5rem' }}>
              <Link to="/forgot-password" style={{ fontSize: '0.8125rem', color: 'var(--color-primary)', textDecoration: 'none' }}>
                Forgot password?
              </Link>
            </div>
          </div>

          {requiresMfa && (
            <div style={{ padding: '1rem', backgroundColor: 'rgba(217, 119, 6, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(217, 119, 6, 0.25)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#b45309', fontWeight: 700, fontSize: '0.875rem' }}>
                <ShieldAlert size={16} />
                <span>Staff 2-Factor Authentication (AAL2)</span>
              </div>
              <Input
                label="6-Digit Authenticator TOTP Code"
                type="text"
                maxLength={6}
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                placeholder="123456"
                helperText="Required by security policy for staff accounts"
              />
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            leftIcon={<LogIn size={18} />}
            style={{ width: '100%', fontWeight: 700, marginTop: '0.5rem' }}
          >
            Sign In to Account
          </Button>
        </form>

        <div
          style={{
            marginTop: '1.5rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--color-border)',
            fontSize: '0.8125rem',
            color: 'var(--color-foreground-muted)',
            textAlign: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', marginBottom: '0.5rem' }}>
            <KeyRound size={14} aria-hidden="true" />
            <span>Don't have an account yet?</span>
          </div>
          <p style={{ marginBottom: '0.75rem', lineHeight: 1.4 }}>
            Explorer accounts are free and instant—browse all published universities, programs, and filters immediately.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
            <Link
              to="/sign-up"
              id="signin-create-account-link"
              className="btn-pill btn-pill-primary"
              style={{ padding: '0.5rem 1.25rem', fontSize: '0.8125rem', fontWeight: 700, width: '100%', textAlign: 'center' }}
            >
              Create Free Explorer Account
            </Link>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
              <Link to="/request-access" style={{ fontWeight: 600, color: 'var(--action-primary, #245B42)', textDecoration: 'none' }}>
                Request Managed Guidance
              </Link>
              <span>•</span>
              <Link to="/request-status" style={{ fontWeight: 600, color: 'var(--action-primary, #245B42)', textDecoration: 'none' }}>
                Check Status
              </Link>
            </div>
          </div>
        </div>

        {/* Development Quick Role Switcher for instant layout evaluation */}
        <div
          style={{
            marginTop: '1.5rem',
            padding: '1rem',
            backgroundColor: 'var(--color-surface-hover)',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--color-border)',
          }}
        >
          <span style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>
            [DEV ONLY] Quick Test Account Sign-In:
          </span>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Button variant="outline" size="sm" onClick={() => handleQuickDemoLogin('managed_student')}>
              Student Case Room
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleQuickDemoLogin('explorer')}>
              Explorer
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleQuickDemoLogin('admin')}>
              Admin Desk
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
