import React from 'react';
import { Card } from '@/components/ui/Card';
import { Mail, Phone, ShieldCheck, MapPin } from 'lucide-react';
import { en } from '@/lib/i18n';

interface SupportPanelProps {
  counsellorName?: string;
  counsellorEmail?: string;
  caseId: string;
}

export const SupportPanel: React.FC<SupportPanelProps> = ({
  counsellorName = 'Sara Ahmed',
  counsellorEmail = 'counsellor.sara@unilistics.local',
  caseId,
}) => {
  return (
    <Card
      padding="md"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        marginBottom: '1.5rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1rem',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary-light)',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
          }}
          aria-hidden="true"
        >
          {counsellorName.charAt(0)}
        </div>

        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted)', fontWeight: 600 }}>
            {en.overview.assignedCounsellor}
          </span>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-foreground)' }}>
            {counsellorName}
          </h4>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.8125rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-foreground)' }}>
          <Mail size={16} style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
          <a href={`mailto:${counsellorEmail}`} style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
            {counsellorEmail}
          </a>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-foreground-muted)' }}>
          <Phone size={16} aria-hidden="true" />
          <span>Direct Case Desk: +92 (51) 555-1234</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-foreground-muted)' }}>
          <MapPin size={16} aria-hidden="true" />
          <span>Regional Advisory Center: Islamabad, Pakistan</span>
        </div>

        <div
          style={{
            marginTop: '0.5rem',
            padding: '0.5rem 0.75rem',
            backgroundColor: 'var(--color-surface-hover)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
          }}
        >
          <ShieldCheck size={14} style={{ color: 'var(--color-accent)' }} aria-hidden="true" />
          <span>
            Case Ref: <code style={{ fontWeight: 600 }}>{caseId}</code>
          </span>
        </div>
      </div>
    </Card>
  );
};
