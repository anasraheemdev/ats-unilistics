import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';

export const StaffSettingsPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>System Settings & Role Provisioning</h1>
        <p style={{ color: 'var(--color-foreground-muted)', fontSize: '0.875rem' }}>
          Platform privilege boundaries and security access controls.
        </p>
      </div>

      <Alert variant="warning" title="Super Administrator Exclusivity">
        Under platform security ADR-002, staff roles (<code>counsellor</code>, <code>admin</code>, <code>super_admin</code>)
        can strictly only be provisioned, promoted, or revoked by a verified <strong>Super Administrator</strong> via
        server-side Edge Functions. Client-side mutations are rejected by Postgres RLS.
      </Alert>

      <Card padding="lg">
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.75rem' }}>
          Active Staff Access Hierarchy
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: 'var(--color-surface-hover)', borderRadius: 'var(--radius-md)' }}>
            <div>
              <strong>Super Administrator</strong>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted)' }}>
                Root authority. Staff role provisioning, security audits, database controls.
              </div>
            </div>
            <Badge variant="primary" size="sm">Super Admin Only</Badge>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: 'var(--color-surface-hover)', borderRadius: 'var(--radius-md)' }}>
            <div>
              <strong>Operational Administrator</strong>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted)' }}>
                Access request vetting, counsellor case assignment, catalogue publishing.
              </div>
            </div>
            <Badge variant="info" size="sm">Admin Role</Badge>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: 'var(--color-surface-hover)', borderRadius: 'var(--radius-md)' }}>
            <div>
              <strong>Educational Counsellor</strong>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted)' }}>
                Manages assigned student dossiers, reviews documents, executes manual submissions.
              </div>
            </div>
            <Badge variant="success" size="sm">Assigned Cases Only</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
};
