import React from 'react';
import { Card } from '@/components/ui/Card';
import { ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '2rem 1.25rem 4rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.25rem 0.65rem',
            borderRadius: 'var(--radius-pill, 9999px)',
            backgroundColor: 'var(--accent-peach-bg, #fff5f2)',
            color: 'var(--action-primary, #b72301)',
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginBottom: '0.75rem',
          }}
        >
          <ShieldCheck size={14} />
          <span>Data Privacy Mandate</span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-charcoal, #1a1a1a)', margin: 0 }}>
          Privacy Policy & Synthetic Data Protection
        </h1>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted, #636b78)', marginTop: '0.5rem' }}>
          Last reviewed: October 2026 • Compliant with synthetic development and student data isolation rules.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <Card padding="lg">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-charcoal, #1a1a1a)', marginTop: 0 }}>
            1. Scope & Core Privacy Commitment
          </h2>
          <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--text-charcoal, #1a1a1a)' }}>
            Unilistics operates as a staff-managed higher education application and visa tracking platform specifically designed for Pakistani students applying to universities in Germany, France, Italy, and Romania. We are strictly committed to safeguarding applicant privacy, protecting sensitive academic records, and maintaining transparent boundaries between public discovery and private managed case rooms.
          </p>
        </Card>

        <Card padding="lg">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-charcoal, #1a1a1a)', marginTop: 0 }}>
            2. Strict Prohibition on Real Student PII in Non-Production
          </h2>
          <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--text-charcoal, #1a1a1a)' }}>
            In accordance with the Unilistics Engineering and Data Governance standards:
          </p>
          <ul style={{ fontSize: '0.875rem', lineHeight: 1.6, paddingLeft: '1.25rem', color: 'var(--text-charcoal, #1a1a1a)' }}>
            <li>
              <strong>No Pakistani CNIC Numbers:</strong> Development fixtures, testing datasets, and non-production environments must never contain genuine Computerized National Identity Card (CNIC) numbers.
            </li>
            <li>
              <strong>No Authentic Passport Credentials:</strong> Genuine passport numbers or scanned bio-data pages are strictly forbidden in staging fixtures and automated tests.
            </li>
            <li>
              <strong>No Solvency Bank Statements:</strong> Financial records, bank maintenance certificates, or blocked account statements must be strictly synthetic in testing environments.
            </li>
          </ul>
        </Card>

        <Card padding="lg">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-charcoal, #1a1a1a)', marginTop: 0 }}>
            3. Data Collected by Entitlement Tier
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.75rem' }}>
            <div style={{ padding: '0.875rem', backgroundColor: 'var(--surface-recessed, #f3efe9)', borderRadius: 'var(--radius-sm, 6px)' }}>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: '0 0 0.35rem 0' }}>
                A. Anonymous Visitors
              </h3>
              <p style={{ fontSize: '0.8125rem', margin: 0, color: 'var(--text-muted, #636b78)' }}>
                No personal information is collected. Anonymous visitors browse a fixed public preview set of up to 50 verified universities.
              </p>
            </div>

            <div style={{ padding: '0.875rem', backgroundColor: 'var(--surface-recessed, #f3efe9)', borderRadius: 'var(--radius-sm, 6px)' }}>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: '0 0 0.35rem 0' }}>
                B. Self-Service Explorer Accounts
              </h3>
              <p style={{ fontSize: '0.8125rem', margin: 0, color: 'var(--text-muted, #636b78)' }}>
                We collect your full name, email address, password hash, and preferred destination corridor. This grants instant access to published university search, program filters, and saved opportunities.
              </p>
            </div>

            <div style={{ padding: '0.875rem', backgroundColor: 'var(--surface-recessed, #f3efe9)', borderRadius: 'var(--radius-sm, 6px)' }}>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: '0 0 0.35rem 0' }}>
                C. Approved Managed Students
              </h3>
              <p style={{ fontSize: '0.8125rem', margin: 0, color: 'var(--text-muted, #636b78)' }}>
                Upon administrative vetting and approval of your guidance request, your assigned counsellor collects attested degree documents, language proficiency test scores, and visa filing receipts strictly for application processing.
              </p>
            </div>
          </div>
        </Card>

        <Card padding="lg">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-charcoal, #1a1a1a)', marginTop: 0 }}>
            4. No External Portal Password Vault
          </h2>
          <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--text-charcoal, #1a1a1a)' }}>
            Unilistics operates an explicit <strong>zero-credential-escrow architecture</strong>. The platform does not store or escrow external university login passwords, Uni-Assist credentials, or embassy consular portal passwords. All external submissions are coordinated transparently with the student.
          </p>
        </Card>

        <Card padding="lg">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-charcoal, #1a1a1a)', marginTop: 0 }}>
            5. Row-Level Security & Access Isolation
          </h2>
          <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--text-charcoal, #1a1a1a)' }}>
            All user data, document uploads, and case communications are enforced at the database layer via Postgres Row-Level Security (RLS). Counsellors have access strictly to student cases explicitly assigned to them in the database.
          </p>
        </Card>

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Link to="/" style={{ color: 'var(--action-primary, #b72301)', fontWeight: 600, textDecoration: 'none' }}>
            ← Return to Unilistics Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};
