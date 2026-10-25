import React from 'react';
import { CaseDocument } from '@/types';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { FileText, CheckCircle2, AlertCircle } from 'lucide-react';

interface DocumentCardProps {
  document: CaseDocument;
  onView?: (doc: CaseDocument) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ document, onView }) => {
  const formattedSize = (document.fileSizeBytes / (1024 * 1024)).toFixed(2) + ' MB';

  return (
    <Card
      padding="md"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        backgroundColor: 'var(--surface-card)',
        borderRadius: 'var(--radius-card, 24px)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '0.5rem',
            marginBottom: '0.75rem',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-control, 16px)',
              backgroundColor: 'var(--surface-selected)',
              color: 'var(--action-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
            aria-hidden="true"
          >
            <FileText size={20} strokeWidth={2} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'var(--surface-recessed)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--color-foreground-muted)',
              }}
            >
              v{document.currentVersionNumber || 1}
            </span>
            <StatusBadge status={document.quarantineStatus || document.verificationStatus} size="sm" />
          </div>
        </div>

        <h4
          style={{
            fontSize: '0.9375rem',
            fontWeight: 700,
            fontFamily: 'var(--font-family-base)',
            marginBottom: '0.25rem',
            color: 'var(--color-foreground)',
          }}
        >
          {document.title}
        </h4>

        <p
          style={{
            fontSize: '0.75rem',
            color: 'var(--color-foreground-muted)',
            fontFamily: 'var(--font-family-mono)',
            marginBottom: '0.75rem',
            wordBreak: 'break-all',
          }}
        >
          {document.safeDisplayName || document.fileName} • {formattedSize}
        </p>

        {/* Replacement Instructions for Student */}
        {document.replacementInstructions && (
          <div
            style={{
              padding: '0.625rem 0.75rem',
              borderRadius: 'var(--radius-control, 16px)',
              fontSize: '0.75rem',
              marginBottom: '0.75rem',
              backgroundColor: 'var(--color-warning-bg)',
              border: '1px solid var(--color-warning-border)',
              color: 'var(--color-warning)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 700, marginBottom: '2px' }}>
              <AlertCircle size={14} strokeWidth={2} aria-hidden="true" />
              <span>Replacement action required</span>
            </div>
            <p style={{ margin: 0, lineHeight: 1.4 }}>{document.replacementInstructions}</p>
          </div>
        )}

        {/* Verification / Review Notes */}
        {document.verificationNotes && !document.replacementInstructions && (
          <div
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius-control, 16px)',
              fontSize: '0.75rem',
              marginBottom: '0.75rem',
              backgroundColor:
                document.verificationStatus === 'verified'
                  ? 'var(--color-success-bg)'
                  : document.verificationStatus === 'rejected'
                  ? 'var(--color-destructive-bg)'
                  : 'var(--surface-recessed)',
              border: `1px solid ${
                document.verificationStatus === 'verified'
                  ? 'var(--color-success-border)'
                  : document.verificationStatus === 'rejected'
                  ? 'var(--color-destructive-border)'
                  : 'var(--border-subtle)'
              }`,
              color:
                document.verificationStatus === 'verified'
                  ? 'var(--color-success)'
                  : document.verificationStatus === 'rejected'
                  ? 'var(--color-destructive)'
                  : 'var(--color-foreground)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 600, marginBottom: '2px' }}>
              {document.verificationStatus === 'verified' ? (
                <CheckCircle2 size={14} strokeWidth={2} aria-hidden="true" />
              ) : (
                <AlertCircle size={14} strokeWidth={2} aria-hidden="true" />
              )}
              <span>
                {document.verifiedBy ? `Reviewed by ${document.verifiedBy}` : 'Counsellor review note'}
              </span>
            </div>
            <span>{document.verificationNotes}</span>
          </div>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '0.75rem',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '0.75rem',
          color: 'var(--color-foreground-muted)',
        }}
      >
        <span>Uploaded: {document.uploadedAt.split('T')[0]}</span>
        {onView && (
          <button
            type="button"
            onClick={() => onView(document)}
            style={{
              color: 'var(--action-primary)',
              fontWeight: 600,
              textDecoration: 'underline',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              padding: 0,
            }}
          >
            View / Download
          </button>
        )}
      </div>
    </Card>
  );
};

export default DocumentCard;
