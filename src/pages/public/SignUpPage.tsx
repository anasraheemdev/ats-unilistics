import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/ui/Alert';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { UserPlus, Sparkles } from 'lucide-react';
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
        // Safe relative navigation strictly validated for explorer role
        navigate(getSafePostLoginRedirect(returnUrl, 'explorer'));
      }, 700);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to create explorer account. Please verify your details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '520px', margin: '0 auto', padding: '3rem 1rem 4rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.25rem 0.65rem',
            borderRadius: 'var(--radius-pill, 9999px)',
            backgroundColor: 'rgba(36, 91, 66, 0.08)',
            color: 'var(--color-primary, #245B42)',
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginBottom: '0.75rem',
          }}
        >
          <Sparkles size={14} />
          <span>Self-Service Registration</span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-charcoal, #1a1a1a)', margin: 0 }}>
          Create Free Explorer Account
        </h1>
        <p style={{ color: 'var(--text-muted, #636b78)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
          Instant, self-service access to browse the full published university catalogue and search filters. No administrative approval required for Explorer tier.
        </p>
      </div>

      <Card padding="lg">
        {errorMsg && (
          <Alert variant="destructive" title="Account Creation Feedback">
            {errorMsg}
          </Alert>
        )}

        {successMsg && (
          <Alert variant="success" title="Welcome to Unilistics">
            {successMsg}
          </Alert>
        )}

        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Input
            id="signup-name"
            label="Full Name"
            type="text"
            required
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }));
            }}
            error={errors.fullName}
            placeholder="e.g. Fatima Ali"
          />

          <Input
            id="signup-email"
            label="Email Address"
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

          <Input
            id="signup-password"
            label="Create Password"
            type="password"
            required
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
            }}
            error={errors.password}
            placeholder="At least 8 characters"
            helperText="Must be at least 8 characters long"
          />

          <Select
            id="signup-country"
            label="Primary Destination Interest"
            value={targetCountry}
            onChange={(e) => setTargetCountry(e.target.value as DestinationCountry)}
            options={[
              { value: 'germany', label: 'Germany 🇩🇪 (Free / Subsidized Tuition)' },
              { value: 'france', label: 'France 🇫🇷 (Subsidized Public Higher Ed)' },
              { value: 'italy', label: 'Italy 🇮🇹 (Universitaly & DSU Scholarships)' },
              { value: 'romania', label: 'Romania 🇷🇴 (Direct University Acceptance)' },
            ]}
          />

          {/* Privacy Consent Checkbox */}
          <div>
            <label
              htmlFor="signup-consent"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.625rem',
                fontSize: '0.8125rem',
                color: 'var(--text-charcoal, #1a1a1a)',
                cursor: 'pointer',
                lineHeight: 1.4,
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
                  accentColor: 'var(--action-primary, #245B42)',
                  cursor: 'pointer',
                  width: '16px',
                  height: '16px',
                }}
              />
              <span>
                I agree to the{' '}
                <Link to="/terms" target="_blank" style={{ color: 'var(--action-primary, #245B42)', textDecoration: 'underline' }}>
                  Terms of Service
                </Link>{' '}
                and understand that data is handled in accordance with the{' '}
                <Link to="/privacy-policy" target="_blank" style={{ color: 'var(--action-primary, #245B42)', textDecoration: 'underline' }}>
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
            {errors.consent && (
              <p style={{ color: 'var(--color-danger, #dc2626)', fontSize: '0.75rem', marginTop: '0.35rem', margin: 0 }}>
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
            leftIcon={<UserPlus size={18} />}
            style={{ width: '100%', fontWeight: 700, marginTop: '0.5rem' }}
          >
            Create Free Explorer Account
          </Button>
        </form>

        <div
          style={{
            marginTop: '1.5rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '0.8125rem',
            color: 'var(--color-foreground-muted)',
            textAlign: 'center',
          }}
        >
          <p style={{ margin: '0 0 0.5rem 0' }}>
            Already have an account?{' '}
            <Link to="/sign-in" style={{ fontWeight: 600, color: 'var(--action-primary, #245B42)', textDecoration: 'none' }}>
              Sign In
            </Link>
          </p>
          <p style={{ margin: 0, fontSize: '0.75rem', lineHeight: 1.4 }}>
            Looking for managed 1-on-1 application guidance? Create your explorer account first, then submit a guidance request from your account menu.
          </p>
        </div>
      </Card>
    </div>
  );
};
