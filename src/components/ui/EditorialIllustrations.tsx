import React from 'react';

interface IllustrationProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Editorial Globe Illustration.
 * Palette: Forest Green (#245B42), Sage (#B4D0B6), Citron Highlight (#D7EE83).
 * Transparent background, softened linework, tapered ground.
 */
export const GlobeIllustration: React.FC<IllustrationProps> = ({
  size = 140,
  style,
  ...props
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ display: 'block', maxWidth: '100%', height: 'auto', ...style }}
      {...props}
    >
      {/* Organically tapered ground shadow */}
      <ellipse cx="80" cy="146" rx="56" ry="6" fill="var(--border-subtle, #DDE5DC)" opacity="0.6" />

      {/* Outer Glow / Soft Ambient Ring */}
      <circle cx="80" cy="74" r="50" fill="var(--surface-selected, #E2ECE0)" opacity="0.5" />

      {/* Main Globe Sphere */}
      <circle cx="80" cy="74" r="44" fill="var(--surface-card, #FFFFFF)" stroke="var(--action-primary, #245B42)" strokeWidth="2.5" />

      {/* Latitudes & Longitudes */}
      <ellipse cx="80" cy="74" rx="24" ry="44" stroke="var(--brand-sage, #B4D0B6)" strokeWidth="2" strokeDasharray="3 3" />
      <line x1="80" y1="30" x2="80" y2="118" stroke="var(--brand-sage, #B4D0B6)" strokeWidth="2" />
      <line x1="36" y1="74" x2="124" y2="74" stroke="var(--brand-sage, #B4D0B6)" strokeWidth="2" />
      <path d="M42 54 C54 62, 106 62, 118 54" stroke="var(--brand-sage, #B4D0B6)" strokeWidth="1.75" />
      <path d="M42 94 C54 86, 106 86, 118 94" stroke="var(--brand-sage, #B4D0B6)" strokeWidth="1.75" />

      {/* Orbital Discovery Ring */}
      <path
        d="M28 86 C32 46, 128 46, 132 86"
        stroke="var(--brand-citron, #D7EE83)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <circle cx="132" cy="86" r="5" fill="var(--action-primary, #245B42)" stroke="var(--brand-citron, #D7EE83)" strokeWidth="2" />

      {/* European Destination Node */}
      <circle cx="86" cy="52" r="4.5" fill="var(--action-primary, #245B42)" />
      <circle cx="86" cy="52" r="8" stroke="var(--action-primary, #245B42)" strokeWidth="1.5" strokeDasharray="2 2" />
    </svg>
  );
};

/**
 * Editorial Document Dossier Illustration.
 * Palette: Forest Green (#245B42), Sage (#B4D0B6), Citron Highlight (#D7EE83).
 */
export const DocumentIllustration: React.FC<IllustrationProps> = ({
  size = 140,
  style,
  ...props
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ display: 'block', maxWidth: '100%', height: 'auto', ...style }}
      {...props}
    >
      {/* Tapered ground */}
      <ellipse cx="80" cy="146" rx="52" ry="6" fill="var(--border-subtle, #DDE5DC)" opacity="0.6" />

      {/* Back Document Sheet */}
      <rect
        x="52"
        y="28"
        width="64"
        height="88"
        rx="8"
        fill="var(--surface-recessed, #EDF2E9)"
        stroke="var(--border-refined, #CBD7CA)"
        strokeWidth="2"
        transform="rotate(6 84 72)"
      />

      {/* Primary Dossier Document Sheet */}
      <rect
        x="44"
        y="32"
        width="68"
        height="92"
        rx="8"
        fill="var(--surface-card, #FFFFFF)"
        stroke="var(--action-primary, #245B42)"
        strokeWidth="2.5"
      />

      {/* Document Content Lines */}
      <line x1="56" y1="48" x2="82" y2="48" stroke="var(--action-primary, #245B42)" strokeWidth="3" strokeLinecap="round" />
      <line x1="56" y1="62" x2="98" y2="62" stroke="var(--brand-sage, #B4D0B6)" strokeWidth="2" strokeLinecap="round" />
      <line x1="56" y1="74" x2="94" y2="74" stroke="var(--brand-sage, #B4D0B6)" strokeWidth="2" strokeLinecap="round" />
      <line x1="56" y1="86" x2="78" y2="86" stroke="var(--brand-sage, #B4D0B6)" strokeWidth="2" strokeLinecap="round" />

      {/* Verified Stamp / Seal with Citron Highlight */}
      <circle cx="92" cy="102" r="14" fill="var(--brand-citron, #D7EE83)" stroke="var(--action-primary, #245B42)" strokeWidth="2" />
      <path
        d="M86 102 L90 106 L98 98"
        stroke="var(--text-charcoal, #19261F)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

/**
 * Editorial Search & Compass Illustration.
 */
export const SearchIllustration: React.FC<IllustrationProps> = ({
  size = 140,
  style,
  ...props
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ display: 'block', maxWidth: '100%', height: 'auto', ...style }}
      {...props}
    >
      {/* Ground base */}
      <ellipse cx="80" cy="146" rx="54" ry="6" fill="var(--border-subtle, #DDE5DC)" opacity="0.6" />

      {/* Ambient background disc */}
      <circle cx="72" cy="68" r="46" fill="var(--surface-selected, #E2ECE0)" opacity="0.6" />

      {/* Magnifying Glass Lens Outer */}
      <circle cx="68" cy="64" r="38" fill="var(--surface-card, #FFFFFF)" stroke="var(--action-primary, #245B42)" strokeWidth="3" />

      {/* Compass Needle inside lens */}
      <path
        d="M68 38 L76 64 L68 90 L60 64 Z"
        fill="var(--surface-recessed, #EDF2E9)"
        stroke="var(--brand-sage, #B4D0B6)"
        strokeWidth="1.5"
      />
      {/* North pointer in Citron */}
      <path
        d="M68 38 L76 64 L68 64 Z"
        fill="var(--brand-citron, #D7EE83)"
      />
      <circle cx="68" cy="64" r="3" fill="var(--action-primary, #245B42)" />

      {/* Lens Handle */}
      <line
        x1="95"
        y1="91"
        x2="128"
        y2="124"
        stroke="var(--action-primary, #245B42)"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <line
        x1="97"
        y1="93"
        x2="126"
        y2="122"
        stroke="var(--brand-citron, #D7EE83)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
};
