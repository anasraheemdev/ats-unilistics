import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface BrandWordmarkProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

/**
 * Authentic Unilistics Brand Wordmark.
 * Integrates the official verified Unilistics logo mark alongside high-contrast typography.
 */
export const BrandWordmark: React.FC<BrandWordmarkProps> = ({
  size = 'md',
  showTagline = true,
  className,
}) => {
  const [imgError, setImgError] = useState(false);

  const dimensions = {
    sm: { img: 24, font: '1.125rem' },
    md: { img: 30, font: '1.375rem' },
    lg: { img: 36, font: '1.625rem' },
  };

  const currentDim = dimensions[size];

  return (
    <Link
      to="/"
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.625rem',
        textDecoration: 'none',
        color: 'var(--text-charcoal)',
      }}
      aria-label="Unilistics Home"
    >
      {!imgError && (
        <img
          src="/images/unilistics/unilistics-logo.png"
          alt="Unilistics"
          width={currentDim.img}
          height={currentDim.img}
          onError={() => setImgError(true)}
          style={{
            objectFit: 'contain',
            height: `${currentDim.img}px`,
            width: `${currentDim.img}px`,
            flexShrink: 0,
          }}
        />
      )}

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <span
            style={{
              fontFamily: 'var(--font-family-base)',
              fontWeight: 800,
              fontSize: currentDim.font,
              letterSpacing: '-0.025em',
              color: 'var(--text-charcoal)',
              lineHeight: 1.1,
            }}
          >
            UNILISTICS
          </span>
          <span
            style={{
              fontSize: '0.5625rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              backgroundColor: 'var(--accent-peach-bg)',
              color: 'var(--action-primary)',
              padding: '0.125rem 0.375rem',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--accent-peach-border)',
            }}
            title="Official verified application tracking system platform"
          >
            PREVIEW
          </span>
        </div>
        {showTagline && (
          <span
            className="brand-wordmark-tagline"
            style={{
              fontSize: '0.6875rem',
              color: 'var(--text-muted)',
              fontWeight: 500,
              letterSpacing: '0.01em',
              marginTop: '1px',
            }}
          >
            University & Visa Tracking • Pakistan
          </span>
        )}
      </div>
    </Link>
  );
};
