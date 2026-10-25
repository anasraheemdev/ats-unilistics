import React from 'react';
import { Card } from '@/components/ui/Card';
import { FileText, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TermsPage: React.FC = () => {
  return (
    <div
      style={{
        maxWidth: '860px',
        margin: '0 auto',
        padding: '2rem 1.25rem 4rem',
        fontFamily: 'var(--font-family-base, "DM Sans", sans-serif)',
        color: 'var(--color-foreground)',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
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
          <FileText size={14} />
          <span>Platform Terms</span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-foreground)', margin: 0, letterSpacing: '-0.02em' }}>
          Terms of Service & Procedural Disclaimers
        </h1>
        <p style={{ fontSize: '0.9375rem', color: 'var(--color-foreground-muted)', marginTop: '0.5rem' }}>
          Effective: October 2026 • Governs Explorer catalogue usage and Managed Guidance requests.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <Card padding="lg">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-foreground)', marginTop: 0 }}>
            1. Entitlement Tiers & Independent Access Approval
          </h2>
          <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--color-foreground)' }}>
            Unilistics maintains an explicit two-tier service architecture:
          </p>
          <ul style={{ fontSize: '0.875rem', lineHeight: 1.6, paddingLeft: '1.25rem', color: 'var(--color-foreground)' }}>
            <li>
              <strong>Self-Service Explorer Access:</strong> Explorer account creation is self-service and subject to standard email verification. It grants full search access to published European university listings, degree programs, and scholarships. <em>It does not require administrative approval.</em>
            </li>
            <li>
              <strong>Staff-Managed Application Guidance:</strong> Access to a 1-on-1 counsellor, application milestone tracking, document verification, and consular guidance is an independent service tier. <em>Managed support requires an explicit request and administrative review and approval before activation.</em>
            </li>
          </ul>
        </Card>

        <Card padding="lg">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <AlertTriangle size={18} style={{ color: 'var(--color-warning, #d97706)' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-foreground)', margin: 0 }}>
              2. Procedural Guides as Content, Not Statutory Policy
            </h2>
          </div>
          <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--color-foreground)' }}>
            Application guides, tuition benchmarks, consular queue notes, and attestation steps provided on the platform are draft procedural reference materials. They do not constitute official statutory legal or immigration advice. Consular appointment mechanics, visa fees, and intake deadlines are subject to unannounced revision by foreign embassies (Islamabad / Karachi) and university faculties.
          </p>
        </Card>

        <Card padding="lg">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-foreground)', marginTop: 0 }}>
            3. Human-in-the-Loop Operations (No Autonomous Bots)
          </h2>
          <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--color-foreground)' }}>
            All university admissions submissions and consular visa filings are manually coordinated and operated by human counsellors and the student. Unilistics does not deploy web scraping bots, automated visa portal reservation bots, or artificial intelligence decision engines for admissions.
          </p>
        </Card>

        <Card padding="lg">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-foreground)', marginTop: 0 }}>
            4. Applicant Responsibilities
          </h2>
          <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--color-foreground)' }}>
            Applicants agree to provide accurate, genuine academic credentials and truthful statements. Falsification of transcripts, fraudulent English language test results, or fraudulent bank documents will result in immediate termination of the case room and reporting to the relevant academic institutions.
          </p>
        </Card>

        <Card padding="lg">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-foreground)', marginTop: 0 }}>
            5. No Guarantee of Admission or Visa Issuance
          </h2>
          <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--color-foreground)' }}>
            Unilistics and its counsellors provide expert guidance and dossier preparation. However, final admissions decisions remain solely with university academic senates, and final student visa decisions remain solely with the sovereign embassies and consular officers of Germany, France, Italy, and Romania.
          </p>
        </Card>

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Link to="/" style={{ color: 'var(--action-primary, #245B42)', fontWeight: 600, textDecoration: 'none' }}>
            ← Return to Unilistics Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
