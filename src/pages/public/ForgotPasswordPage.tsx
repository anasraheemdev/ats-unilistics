import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ForgotPasswordSchema } from '@/types/validation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = ForgotPasswordSchema.safeParse({ email });
    if (!validation.success) {
      setError(validation.error.errors[0]?.message || 'Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.auth.forgotPassword(email);
      setIsSent(true);
    } catch {
      // Generic confirmation always shown to prevent enumeration
      setIsSent(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '440px', padding: '3rem 1rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Reset Password
        </h1>
        <p style={{ color: 'var(--color-foreground-muted)', fontSize: '0.875rem' }}>
          Enter your registered email address to receive password recovery instructions.
        </p>
      </div>

      <Card style={{ padding: '2rem' }}>
        {isSent ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <CheckCircle2 size={48} style={{ color: 'var(--color-success)', margin: '0 auto 1rem' }} />
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Check Your Inbox
            </h2>
            <p style={{ color: 'var(--color-foreground-muted)', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              If an account associated with <strong>{email}</strong> exists, password recovery instructions have been dispatched.
            </p>
            <Link to="/sign-in" style={{ textDecoration: 'none' }}>
              <Button variant="outline" style={{ width: '100%' }}>
                <ArrowLeft size={16} aria-hidden="true" />
                <span>Return to Sign In</span>
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {error && (
              <Alert variant="destructive" title="Validation Error">
                {error}
              </Alert>
            )}

            <Input
              type="email"
              label="Registered Email"
              placeholder="e.g. student@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Button type="submit" variant="primary" disabled={isSubmitting}>
              <Mail size={16} aria-hidden="true" />
              <span>{isSubmitting ? 'Transmitting Request...' : 'Send Recovery Instructions'}</span>
            </Button>

            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
              <Link to="/sign-in" style={{ fontSize: '0.8125rem', color: 'var(--color-primary)', textDecoration: 'none' }}>
                Remember your password? Sign in →
              </Link>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};
