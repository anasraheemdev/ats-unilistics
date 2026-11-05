import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/ui/Alert';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { UserPlus, Eye, EyeOff, CheckCircle2, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import { DestinationCountry, UserRole } from '@/types';
import { getSafePostLoginRedirect } from '@/config/routes';

interface SignUpPageProps {
  onRoleChange: (newRole: UserRole) => void;
}

export const SignUpPage: React.FC<SignUpPageProps> = ({ onRoleChange }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [targetCountry, setTargetCountry] = useState<DestinationCountry>('germany');
  const [consentPrivacy, setConsentPrivacy] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/universities';

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) newErrors.fullName = 'Full name is required.';
    if (!email.trim() || !email.includes('@')) newErrors.email = 'A valid email address is required.';
    if (!password || password.length < 8) newErrors.password = 'Password must be at least 8 characters long.';
    if (!consentPrivacy) newErrors.consent = 'You must accept the Terms of Service and Privacy Policy.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!validate()) return;

    setIsLoading(true);
    try {
      const res = await api.auth.signUp({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        targetCountry,
        consentPrivacy,
      });

      onRoleChange('explorer');
      setSuccessMsg(res.message);

      setTimeout(() => {
        navigate(getSafePostLoginRedirect(returnUrl, 'explorer'));
      }, 700);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to create explorer account. Please verify your details.');
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = password.length === 0 ? 0 : password.length < 8 ? 1 : password.length < 12 ? 2 : 3;
  const strengthLabel = ['', 'Too short', 'Good', 'Strong'][passwordStrength];
  const strengthColor = ['', 'var(--color-destructive)', 'var(--color-warning)', 'var(--color-success)'][passwordStrength];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        minHeight: 'calc(100vh - 5rem)',
        fontFamily: 'var(--font-family-base)',
      }}
      className="signup-split-layout"
    >
      {/* LEFT: Info panel */}
      <div
        className="signup-info-panel"
        style={{
          backgroundColor: 'var(--brand-forest)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 'clamp(2.5rem, 5vw, 4rem)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background image */}
        <img
          src="/images/student_library_explorer.jpg"
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
          }}
          loading="eager"
          decoding="async"
        />
        {/* Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(36,91,66,0.9) 0%, rgba(25,38,31,0.85) 100%)',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              textDecoration: 'none',
              marginBottom: '3rem',
            }}
          >
            <img
              src="/images/brand/reversed-icon.svg"
              alt="Unilistics"
              width={28}
              height={28}
              style={{ objectFit: 'contain' }}
            />
            <span
              style={{
                fontSize: '1.125rem',
                fontWeight: 700,
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
              }}
            >
              unilistics
            </span>
          </Link>

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
              marginBottom: '1.25rem',
            }}
          >
            Free Explorer Account
          </div>

          <h2
            style={{
              color: '#FFFFFF',
              fontSize: 'clamp(1.5rem, 2.5vw, 2.25rem)',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              margin: '0 0 1.25rem',
              lineHeight: 1.2,
            }}
          >
            Discover universities across Germany, France, Italy, and Romania.
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {[
              'Full published catalogue — universities, programs, scholarships',
              'Advanced search and filtering by country, city, fee structure',
              'Save and shortlist your target institutions',
              'Access verified procedural guides and country information',
            ].map((feature) => (
              <div key={feature} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
                <CheckCircle2
                  size={18}
                  style={{ color: 'var(--brand-citron)', flexShrink: 0, marginTop: '2px' }}
                  aria-hidden="true"
                />
                <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', lineHeight: 1.45 }}>
                  {feature}
                </span>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: '2rem',
              padding: '1rem 1.25rem',
              backgroundColor: 'rgba(215, 238, 131, 0.12)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(215, 238, 131, 0.25)',
            }}
          >
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8125rem', margin: 0, lineHeight: 1.5 }}>
              <strong style={{ color: 'var(--brand-citron)' }}>Need managed guidance?</strong>{' '}
              Create your Explorer account first, then submit a separate guidance request. Managed support requires
              individual team review and approval.
            </p>
          </div>
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
          <div style={{ marginBottom: '2rem' }}>
            <h1
              style={{
                fontSize: 'clamp(1.5rem, 2.5vw, 2rem)',
                fontWeight: 800,
                color: 'var(--text-charcoal)',
                letterSpacing: '-0.025em',
                margin: '0 0 0.5rem',
              }}
            >
              Create your account
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', margin: 0, lineHeight: 1.5 }}>
              Instant self-service access. No approval required for Explorer tier.
            </p>
          </div>

          {errorMsg && (
            <div style={{ marginBottom: '1.25rem' }}>
              <Alert variant="destructive" title="Account creation failed">
                {errorMsg}
              </Alert>
            </div>
          )}

          {successMsg && (
            <div style={{ marginBottom: '1.25rem' }}>
              <Alert variant="success" title="Welcome to Unilistics">
                {successMsg}
              </Alert>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            <Input
              id="signup-name"
              label="Full name"
              type="text"
              required
              autoComplete="name"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }));
              }}
              error={errors.fullName}
              placeholder="e.g. Ahmed Khan"
            />

            <Input
              id="signup-email"
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
                  id="signup-password"
                  label="Create password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                  }}
                  error={errors.password}
                  placeholder="At least 8 characters"
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
              {password.length > 0 && (
                <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.25rem', flex: 1 }}>
                    {[1, 2, 3].map((level) => (
                      <div
                        key={level}
                        style={{
                          height: '3px',
                          flex: 1,
                          borderRadius: 'var(--radius-pill)',
                          backgroundColor: passwordStrength >= level ? strengthColor : 'var(--border-subtle)',
                          transition: 'background-color 0.2s ease',
                        }}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: strengthColor, fontWeight: 600, minWidth: '4rem' }}>
                    {strengthLabel}
                  </span>
                </div>
              )}
            </div>

            <Select
              id="signup-country"
              label="Primary destination interest"
              value={targetCountry}
              onChange={(e) => setTargetCountry(e.target.value as DestinationCountry)}
              options={[
                { value: 'germany', label: 'Germany — Free / Subsidized Tuition' },
                { value: 'france', label: 'France — Subsidized Public Higher Ed' },
                { value: 'italy', label: 'Italy — Universitaly & DSU Scholarships' },
                { value: 'romania', label: 'Romania — Direct University Acceptance' },
              ]}
            />

            {/* Privacy Consent */}
            <div>
              <label
                htmlFor="signup-consent"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.625rem',
                  fontSize: '0.8125rem',
                  color: 'var(--text-body)',
                  cursor: 'pointer',
                  lineHeight: 1.5,
                }}
              >
                <input
                  id="signup-consent"
                  type="checkbox"
                  checked={consentPrivacy}
                  onChange={(e) => {
                    setConsentPrivacy(e.target.checked);
                    if (errors.consent) setErrors((prev) => ({ ...prev, consent: '' }));
                  }}
                  style={{
                    marginTop: '0.15rem',
                    accentColor: 'var(--action-primary)',
                    cursor: 'pointer',
                    width: '16px',
                    height: '16px',
                    flexShrink: 0,
                  }}
                />
                <span>
                  I agree to the{' '}
                  <Link to="/terms" target="_blank" style={{ color: 'var(--action-primary)', textDecoration: 'underline' }}>
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" target="_blank" style={{ color: 'var(--action-primary)', textDecoration: 'underline' }}>
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {errors.consent && (
                <p
                  role="alert"
                  style={{
                    color: 'var(--color-destructive)',
                    fontSize: '0.75rem',
                    marginTop: '0.375rem',
                    margin: '0.375rem 0 0',
                  }}
                >
                  {errors.consent}
                </p>
              )}
            </div>

            <Button
              id="signup-submit-btn"
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              leftIcon={<UserPlus size={18} aria-hidden="true" />}
              style={{ width: '100%', fontWeight: 700, marginTop: '0.25rem' }}
            >
              Create Free Explorer Account
            </Button>
          </form>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              margin: '1.5rem 0',
              color: 'var(--text-subtle)',
              fontSize: '0.8125rem',
            }}
          >
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
            <span>Already have an account?</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
          </div>

          <Link
            to="/sign-in"
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
            Sign in to existing account
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .signup-split-layout {
            grid-template-columns: 1fr !important;
          }
          .signup-info-panel {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default SignUpPage;
