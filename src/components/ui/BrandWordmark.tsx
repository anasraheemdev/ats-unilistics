import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '@/lib/theme';

interface BrandWordmarkProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  variant?: 'auto' | 'light' | 'dark' | 'monochrome';
}

/**
 * Authentic Unilistics Brand Wordmark.
 * Uses official brand kit SVG marks with intrinsic proportions,
 * lowercase "unilistics" wordmark in DM Sans Bold, ~10px gap,
 * and automatic light/dark icon switching.
 */
export const BrandWordmark: React.FC<BrandWordmarkProps> = ({
  size = 'md',
  showTagline = true,
  variant = 'auto',
  className,
}) => {
  const [imgError, setImgError] = useState(false);
  const { resolvedTheme } = useTheme();

  // Dimensions: Standard 36px; compact 24px; lg 44px
  // SVG natural aspect ratio is 512 / 459 (~1.1155)
  const dimensions = {
    sm: { width: 24, height: 21.5, fontSize: '1.125rem' }, // compact 24px
    md: { width: 36, height: 32.3, fontSize: '1.25rem' },  // standard 36px (~20px text)
    lg: { width: 44, height: 39.5, fontSize: '1.5rem' },
  };

  const currentDim = dimensions[size];

  // Resolve SVG mark based on theme
  let logoSrc = '/images/brand/original-icon.svg';
  if (variant === 'dark' || (variant === 'auto' && resolvedTheme === 'dark')) {
    logoSrc = '/images/brand/reversed-icon.svg';
  } else if (variant === 'monochrome') {
    logoSrc = resolvedTheme === 'dark'
      ? '/images/brand/monochrome-light.svg'
      : '/images/brand/monochrome-dark.svg';
  }

  return (
    <Link
      to="/"
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.625rem', // ~10px gap
        textDecoration: 'none',
        color: 'var(--text-charcoal)',
      }}
      aria-label="Unilistics Home"
    >
      {!imgError && (
        <img
          src={logoSrc}
          alt="unilistics mark"
          width={currentDim.width}
          height={currentDim.height}
          onError={() => setImgError(true)}
          style={{
            objectFit: 'contain',
            width: `${currentDim.width}px`,
            height: `${currentDim.height}px`,
            flexShrink: 0,
            display: 'block',
          }}
        />
      )}

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              fontFamily: 'var(--font-family-base)',
              fontWeight: 700, // DM Sans Bold
              fontSize: currentDim.fontSize,
              letterSpacing: '-0.025em',
              color: 'var(--text-charcoal)',
              lineHeight: 1.1,
            }}
          >
            unilistics
          </span>
          <span
            style={{
              fontSize: '0.5625rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              backgroundColor: 'var(--surface-selected)',
              color: 'var(--action-primary)',
              padding: '0.125rem 0.375rem',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--border-subtle)',
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

export default BrandWordmark;
