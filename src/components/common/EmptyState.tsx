import React from 'react';
import { FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionLink?: string;
  icon?: React.ReactNode;
  imageSrc?: string;
  imageAlt?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  actionLink,
  icon,
  imageSrc,
  imageAlt = '',
}) => {
  return (
    <div
      className="bento-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3.5rem 2rem',
        textAlign: 'center',
        backgroundColor: 'var(--surface-card)',
        borderRadius: 'var(--radius-card, 24px)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-sm)',
        margin: '1.5rem 0',
      }}
    >
      {imageSrc ? (
        <div style={{ marginBottom: '1.25rem', maxWidth: '180px', maxHeight: '180px' }}>
          <img
            src={imageSrc}
            alt={imageAlt}
            width={160}
            height={160}
            loading="lazy"
            style={{
              objectFit: 'contain',
              width: '100%',
              height: 'auto',
              borderRadius: 'var(--radius-control, 16px)',
            }}
          />
        </div>
      ) : (
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--surface-recessed)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--action-primary)',
            marginBottom: '1.25rem',
            border: '1px solid var(--border-subtle)',
          }}
          aria-hidden="true"
        >
          {icon || <FolderOpen size={30} strokeWidth={2} />}
        </div>
      )}

      <h3
        style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          fontFamily: 'var(--font-family-base)',
          color: 'var(--color-foreground)',
          marginBottom: '0.5rem',
          letterSpacing: '-0.015em',
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontSize: '0.9375rem',
          fontFamily: 'var(--font-family-base)',
          color: 'var(--color-foreground-muted)',
          maxWidth: '460px',
          lineHeight: 1.6,
          marginBottom: actionLabel ? '1.75rem' : 0,
        }}
      >
        {description}
      </p>

      {actionLabel && actionLink && (
        <Link to={actionLink} style={{ textDecoration: 'none' }}>
          <Button variant="primary" size="md">
            {actionLabel}
          </Button>
        </Link>
      )}

      {actionLabel && onAction && !actionLink && (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
