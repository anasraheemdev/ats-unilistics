import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { SetPasswordSchema } from '@/types/validation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { KeyRound, CheckCircle2, ShieldCheck } from 'lucide-react';

export const SetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setErrorMsg(null);

    const validation = SetPasswordSchema.safeParse({ password, confirmPassword });
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        if (field && !fieldErrors[field]) fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    if (!token) {
      setErrorMsg('This activation link is missing a valid security token. Please check the link from your email.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.auth.setPassword(token, password);
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/sign-in');
      }, 2500);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to configure password. Link may be expired or already used.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '480px', padding: '3rem 1rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'center' }}>
          <Badge variant="primary">
            <KeyRound size={14} aria-hidden="true" />
            <span>Secure Account Activation</span>
          </Badge>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Configure Your Password
        </h1>
        <p style={{ color: 'var(--color-foreground-muted)', fontSize: '0.875rem' }}>
          {email ? `Setting up credentials for ${email}` : 'Set your secure account password to activate your portal'}
        </p>
      </div>

      <Card style={{ padding: '2rem' }}>
        {isSuccess ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <CheckCircle2 size={48} style={{ color: 'var(--color-success)', margin: '0 auto 1rem' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Account Activated!
            </h2>
            <p style={{ color: 'var(--color-foreground-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Your password has been saved. Redirecting you to sign in...
            </p>
            <Link to="/sign-in" style={{ textDecoration: 'none' }}>
              <Button variant="primary" style={{ width: '100%' }}>
                Go to Sign In
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {errorMsg && (
              <Alert variant="destructive" title="Activation Error">
                {errorMsg}
              </Alert>
            )}

            <Input
              type="password"
              label="New Password"
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
              }}
              error={errors.password}
              required
              helperText="Must be at least 8 characters long"
            />

            <Input
              type="password"
              label="Confirm Password"
              placeholder="Re-type your password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
              }}
              error={errors.confirmPassword}
              required
            />

            <div
              style={{
                fontSize: '0.8125rem',
                color: 'var(--color-foreground-muted)',
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'center',
              }}
            >
              <ShieldCheck size={16} style={{ color: 'var(--color-success)' }} />
              <span>Passwords are never sent or stored in plaintext.</span>
            </div>

            <Button type="submit" variant="primary" size="lg" disabled={isSubmitting} style={{ marginTop: '0.5rem' }}>
              {isSubmitting ? 'Saving Password...' : 'Activate & Enter Portal'}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
};
