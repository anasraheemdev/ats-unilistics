import React, { useState } from 'react';
import { SignInFormSchema } from '@/types/validation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { LogIn, Eye, EyeOff, ShieldAlert, ArrowRight } from 'lucide-react';
import { UserRole } from '@/types';
import { getSafePostLoginRedirect } from '@/config/routes';

interface SignInPageProps {
  onRoleChange: (newRole: UserRole) => void;
}

export const SignInPage: React.FC<SignInPageProps> = ({ onRoleChange }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        minHeight: 'calc(100vh - 5rem)',
        fontFamily: 'var(--font-family-base)',
      }}
      className="signin-split-layout"
    >
      {/* LEFT: Brand image panel */}
      <div
        className="signin-image-panel"
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: 'var(--brand-forest)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '3rem',
        }}
        aria-hidden="true"
      >
        <img
          src="/images/auth_split_student.jpg"
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center top',
          }}
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
        {/* Forest overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(25,38,31,0.85) 0%, rgba(36,91,66,0.45) 50%, rgba(36,91,66,0.15) 100%)',
          }}
        />
        {/* Brand tagline */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'var(--brand-citron)',
              color: 'var(--text-charcoal)',
              padding: '0.3rem 0.875rem',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '1rem',
            }}
          >
            Unilistics Portal
          </div>
          <h2
            style={{
              color: '#FFFFFF',
              fontSize: 'clamp(1.5rem, 2.5vw, 2.25rem)',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              margin: '0 0 0.75rem',
              lineHeight: 1.15,
            }}
          >
            Your path to European universities starts here.
          </h2>
          <p
            style={{
              color: 'rgba(255,255,255,0.75)',
              fontSize: '0.9375rem',
              lineHeight: 1.55,
              margin: 0,
              maxWidth: '400px',
            }}
          >
            Sign in to access your explorer catalogue or managed student workspace.
          </p>
        </div>
      </div>

      {/* RIGHT: Form panel */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 'clamp(2rem, 5vw, 4rem)',
          backgroundColor: 'var(--surface-canvas)',
          overflowY: 'auto',
        }}
      >
        <div style={{ maxWidth: '420px', width: '100%', margin: '0 auto' }}>
          {/* Logo + heading */}
          <div style={{ marginBottom: '2.5rem' }}>
            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                textDecoration: 'none',
                marginBottom: '2rem',
              }}
            >
              <img
                src="/images/brand/original-icon.svg"
                alt="Unilistics"
                width={28}
                height={28}
                style={{ objectFit: 'contain' }}
              />
              <span
                style={{
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  color: 'var(--text-charcoal)',
                  letterSpacing: '-0.02em',
                }}
              >
                unilistics
              </span>
            </Link>

            <h1
              style={{
                fontSize: 'clamp(1.5rem, 2.5vw, 2rem)',
                fontWeight: 800,
                color: 'var(--text-charcoal)',
                letterSpacing: '-0.025em',
                margin: '0 0 0.5rem',
              }}
            >
              Welcome back
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', margin: 0, lineHeight: 1.5 }}>
              Sign in to your account to continue.
            </p>
          </div>

          {/* Error alert */}
          {errorMsg && (
            <div style={{ marginBottom: '1.25rem' }}>
              <Alert variant="destructive" title="Sign-in failed">
                {errorMsg}
              </Alert>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            <Input
              id="signin-email"
              label="Email address"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
              }}
              error={errors.email}
              placeholder="you@example.com"
            />

            <div>
              <div style={{ position: 'relative' }}>
                <Input
                  id="signin-password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                  }}
                  error={errors.password}
                  placeholder="••••••••"
                  style={{ paddingRight: '3rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: errors.password ? 'calc(1.625rem + 0.75rem)' : '2.625rem',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    padding: '0.25rem',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.375rem' }}>
                <Link
                  to="/forgot-password"
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: 'var(--action-primary)',
                    textDecoration: 'none',
                  }}
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {requiresMfa && (
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: 'var(--color-warning-bg)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-warning-border)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.75rem',
                    color: 'var(--color-warning)',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                  }}
                >
                  <ShieldAlert size={16} aria-hidden="true" />
                  <span>Staff 2-Factor Authentication Required</span>
                </div>
                <Input
                  id="signin-mfa"
                  label="6-digit authenticator code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  placeholder="123456"
                  helperText="Required by security policy for staff accounts"
                />
              </div>
            )}

            <Button
              id="signin-submit-btn"
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              leftIcon={<LogIn size={18} aria-hidden="true" />}
              style={{ width: '100%', fontWeight: 700, marginTop: '0.25rem' }}
            >
              Sign In
            </Button>
          </form>

          {/* Divider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              margin: '1.75rem 0',
              color: 'var(--text-subtle)',
              fontSize: '0.8125rem',
            }}
          >
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
            <span>Don't have an account?</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
          </div>

          {/* Account creation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link
              to="/sign-up"
              id="signin-create-account-link"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                borderRadius: 'var(--radius-control)',
                border: '1.5px solid var(--border-refined)',
                backgroundColor: 'var(--surface-card)',
                color: 'var(--text-charcoal)',
                fontWeight: 600,
                fontSize: '0.9375rem',
                textDecoration: 'none',
                transition: 'border-color var(--transition-fast), background-color var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--action-primary)';
                (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--surface-hover)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-refined)';
                (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--surface-card)';
              }}
            >
              Create free Explorer account
              <ArrowRight size={16} aria-hidden="true" />
            </Link>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem',
                fontSize: '0.8125rem',
              }}
            >
              <Link
                to="/request-guidance"
                style={{ fontWeight: 600, color: 'var(--action-primary)', textDecoration: 'none' }}
              >
                Request Managed Guidance
              </Link>
              <span style={{ color: 'var(--border-refined)' }}>·</span>
              <Link
                to="/request-status"
                style={{ fontWeight: 600, color: 'var(--action-primary)', textDecoration: 'none' }}
              >
                Check Request Status
              </Link>
            </div>
          </div>

          <p
            style={{
              textAlign: 'center',
              fontSize: '0.75rem',
              color: 'var(--text-subtle)',
              lineHeight: 1.5,
              marginTop: '1.5rem',
            }}
          >
            By signing in, you agree to our{' '}
            <Link to="/terms" style={{ color: 'var(--action-primary)', textDecoration: 'underline' }}>
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" style={{ color: 'var(--action-primary)', textDecoration: 'underline' }}>
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 767px) {
          .signin-split-layout {
            grid-template-columns: 1fr !important;
          }
          .signin-image-panel {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default SignInPage;
