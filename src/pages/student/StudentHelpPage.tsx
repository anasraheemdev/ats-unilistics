import React from 'react';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';

export const StudentHelpPage: React.FC = () => {
  const faqs = [
    {
      q: 'What is the required attestation order for Pakistani credentials?',
      a: 'For Matric & F.Sc: (1) BISE Board verification sealed envelope, (2) IBCC QR stamp, (3) MOFA Apostille authentication. For 4-Year Bachelor degrees: (1) University Controller endorsement, (2) HEC online ticket + QR sticker, (3) MOFA Apostille authentication.',
    },
    {
      q: 'Does Unilistics store my university portal passwords?',
      a: 'No. Under platform security contracts, Unilistics never requests, stores, or escrows external university, Campus France, or embassy portal passwords. Submissions are coordinated directly with your counsellor.',
    },
    {
      q: 'How does the German Blocked Account (Sperrkonto) work?',
      a: 'The German Federal Foreign Office requires international students to deposit statutory subsistence funds (benchmarked at approximately €11,208 to €11,904/year) into a regulated provider (Expatrio, Coracle, or Fintiba) prior to visa issuance.',
    },
    {
      q: 'Why is Hungary disabled on the platform?',
      a: 'Hungary is scheduled for future expansion. Procedural workflows for Stipendium Hungaricum and Hungarian consular guidelines are currently pending official review.',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Student Support & Procedural FAQ</h1>
        <p style={{ color: 'var(--color-foreground-muted)', fontSize: '0.875rem' }}>
          Grounded procedural guidance for Pakistani applicants to European universities.
        </p>
      </div>

      <Alert variant="warning" title="Statutory Notice">
        All financial thresholds, visa fee amounts, and embassy waitlist timelines represent current operational
        benchmarks and must be confirmed against official embassy channels.
      </Alert>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {faqs.map((faq, i) => (
          <Card key={i} padding="md">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-primary)' }}>
              {faq.q}
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-foreground)', lineHeight: 1.5 }}>
              {faq.a}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
};
