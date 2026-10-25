import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { UserCog, UserCheck, KeyRound } from 'lucide-react';

export const StaffSettingsPage: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.75rem',
        maxWidth: '820px',
        fontFamily: 'var(--font-family-base, "DM Sans", sans-serif)',
        color: 'var(--color-foreground)',
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.2rem 0.65rem',
              borderRadius: 'var(--radius-pill, 9999px)',
              backgroundColor: 'rgba(36, 91, 66, 0.08)',
              color: 'var(--color-primary, #245B42)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Staff Governance
          </span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
          System Settings & Role Provisioning
        </h1>
        <p style={{ color: 'var(--color-foreground-muted)', fontSize: '0.875rem', marginTop: '0.25rem', marginBottom: 0 }}>
          Platform privilege boundaries, human-in-the-loop operational rules, and database security access controls.
        </p>
      </div>

      <Alert variant="warning" title="Super Administrator Exclusivity">
        Under platform security ADR-002, staff roles (<code>counsellor</code>, <code>admin</code>, <code>super_admin</code>)
        can strictly only be provisioned, promoted, or revoked by a verified <strong>Super Administrator</strong> via
        server-side Edge Functions. Client-side mutations are rejected by Postgres Row-Level Security (RLS).
      </Alert>

      <div
        className="bento-card"
        style={{
          padding: '1.75rem',
          backgroundColor: 'var(--surface-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '24px',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0 }}>
            Active Staff Access Hierarchy
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted)', marginTop: '0.25rem', marginBottom: 0 }}>
            Role entitlements enforced by database policies across all admissions desks.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {/* Super Administrator */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem 1.25rem',
              backgroundColor: 'var(--surface-recessed)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(36, 91, 66, 0.1)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <KeyRound size={18} strokeWidth={2} />
              </div>
              <div>
                <strong style={{ fontSize: '0.9375rem', color: 'var(--color-foreground)' }}>Super Administrator</strong>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted)', marginTop: '0.125rem' }}>
                  Root authority. Staff role provisioning, security audits, database controls.
                </div>
              </div>
            </div>
            <Badge variant="primary" size="sm">Super Admin Only</Badge>
          </div>

          {/* Operational Administrator */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem 1.25rem',
              backgroundColor: 'var(--surface-recessed)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(36, 91, 66, 0.08)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <UserCog size={18} strokeWidth={2} />
              </div>
              <div>
                <strong style={{ fontSize: '0.9375rem', color: 'var(--color-foreground)' }}>Operational Administrator</strong>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted)', marginTop: '0.125rem' }}>
                  Access request vetting, counsellor case assignment, catalogue publishing.
                </div>
              </div>
            </div>
            <Badge variant="info" size="sm">Admin Role</Badge>
          </div>

          {/* Educational Counsellor */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem 1.25rem',
              backgroundColor: 'var(--surface-recessed)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(36, 91, 66, 0.08)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <UserCheck size={18} strokeWidth={2} />
              </div>
              <div>
                <strong style={{ fontSize: '0.9375rem', color: 'var(--color-foreground)' }}>Educational Counsellor</strong>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted)', marginTop: '0.125rem' }}>
                  Manages assigned student dossiers, reviews documents, executes manual submissions.
                </div>
              </div>
            </div>
            <Badge variant="success" size="sm">Assigned Cases Only</Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffSettingsPage;
