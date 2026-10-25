import React from 'react';
import { Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface SaveResumeDraftBannerProps {
  hasDraft: boolean;
  onClearDraft: () => void;
  lastSavedText?: string;
}

export const SaveResumeDraftBanner: React.FC<SaveResumeDraftBannerProps> = ({
  hasDraft,
  onClearDraft,
  lastSavedText = 'Form draft loaded from your previous session',
}) => {
  if (!hasDraft) return null;

  return (
    <div
      role="status"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        padding: '0.75rem 1rem',
        backgroundColor: 'var(--color-primary-light)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        marginBottom: '1.25rem',
        fontSize: '0.875rem',
        color: 'var(--color-primary)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Save size={16} aria-hidden="true" />
        <span>
          <strong>Draft Resumed:</strong> {lastSavedText}. (Sensitive files and passwords are never cached in browser storage).
        </span>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={onClearDraft}
        leftIcon={<Trash2 size={14} />}
        style={{ color: 'var(--color-destructive)', padding: '0.25rem 0.5rem', minHeight: '36px' }}
      >
        Clear Draft
      </Button>
    </div>
  );
};
