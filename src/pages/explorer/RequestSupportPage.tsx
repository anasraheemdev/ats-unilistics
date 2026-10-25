import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Alert } from '@/components/ui/Alert';
import { CheckCircle2, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { DestinationCountry } from '@/types';

export const RequestSupportPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [targetCorridor, setTargetCorridor] = useState<DestinationCountry>('germany');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const user = await api.auth.getCurrentUser();
      await api.requests.submitAccessRequest({
        fullName: user.fullName || 'Approved Explorer',
        email: user.email || 'explorer@unilistics.com',
        countryInterests: [targetCorridor],
        requestedService: 'managed_application_case',
        consentPrivacy: true,
        isUpgrade: true,
        studentMessage: notes,
      });
      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to submit upgrade request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>
          Request Managed Application Support
        </h1>
        <p style={{ color: 'var(--color-foreground-muted)', fontSize: '0.875rem' }}>
          Upgrade from Explorer Catalogue access to 1-on-1 counsellor case management.
        </p>
      </div>

      {submitted ? (
        <Card padding="lg" style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-success-bg, #ecfdf5)',
              color: 'var(--color-success, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}
          >
            <CheckCircle2 size={28} />
          </div>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Managed Support Upgrade Request Submitted
          </h2>
          <p style={{ color: 'var(--color-foreground-muted)', fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            An operational administrator will evaluate your case requirements and assign a specialized counsellor.
            <strong> Your existing Explorer Catalogue access remains fully active.</strong>
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/explorer" style={{ textDecoration: 'none' }}>
              <Button variant="primary">Return to Explorer Catalogue</Button>
            </Link>
            <Link to="/request-status" style={{ textDecoration: 'none' }}>
              <Button variant="outline">Check Request Status</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <Card padding="lg">
          <Alert variant="info" title="Independent Entitlement Notice">
            Managed Student status is an independent service tier requiring separate administrative approval.
            Your Explorer access will remain active without interruption while your request is vetted.
          </Alert>

          {errorMsg && (
            <Alert variant="destructive">
              {errorMsg}
            </Alert>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <Select
              label="Primary Target Corridor"
              required
              value={targetCorridor}
              onChange={(e) => setTargetCorridor(e.target.value as DestinationCountry)}
              options={[
                { value: 'germany', label: 'Germany (Zero Tuition / UAS & Uni)' },
                { value: 'france', label: 'France (Campus France / Subsidized)' },
                { value: 'italy', label: 'Italy (Universitaly / DSU Scholarships)' },
                { value: 'romania', label: 'Romania (Direct HSSC / Schengen Entry)' },
              ]}
            />

            <Textarea
              label="Target Universities & Notes for Advising Staff"
              placeholder="List specific programs you shortlisted from the catalogue or special attestation notes..."
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <div
              style={{
                padding: '0.875rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-surface-subtle)',
                fontSize: '0.8125rem',
                color: 'var(--color-foreground-muted)',
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'center',
              }}
            >
              <ShieldCheck size={18} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
              <span>Zero passport or financial documents are required to request upgrade.</span>
            </div>

            <Button type="submit" variant="accent" size="lg" disabled={isSubmitting} style={{ width: '100%', fontWeight: 700 }}>
              {isSubmitting ? 'Submitting Upgrade Request...' : 'Submit Managed Support Upgrade Request'}
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
};
