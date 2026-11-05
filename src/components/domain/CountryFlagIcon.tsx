import React from 'react';

interface CountryFlagIconProps {
  countryCode: 'de' | 'fr' | 'it' | 'ro' | 'eu' | 'pk' | string;
  width?: number;
  height?: number;
  className?: string;
}

export const CountryFlagIcon: React.FC<CountryFlagIconProps> = ({
  countryCode,
  width = 20,
  height = 14,
  className = '',
}) => {
  const code = countryCode.toLowerCase();

  switch (code) {
    case 'it':
      // Italy: Green, White, Red vertical tricolor
      return (
        <svg
          width={width}
          height={height}
          viewBox="0 0 20 14"
          className={className}
          style={{ borderRadius: '3px', display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
          aria-label="Flag of Italy"
          role="img"
        >
          <rect width="6.66" height="14" fill="#009246" />
          <rect x="6.66" width="6.66" height="14" fill="#FFFFFF" />
          <rect x="13.33" width="6.66" height="14" fill="#CE2B37" />
        </svg>
      );

    case 'de':
      // Germany: Black, Red, Gold horizontal tricolor
      return (
        <svg
          width={width}
          height={height}
          viewBox="0 0 20 14"
          className={className}
          style={{ borderRadius: '3px', display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
          aria-label="Flag of Germany"
          role="img"
        >
          <rect width="20" height="4.66" fill="#000000" />
          <rect y="4.66" width="20" height="4.66" fill="#DD0000" />
          <rect y="9.33" width="20" height="4.66" fill="#FFCE00" />
        </svg>
      );

    case 'fr':
      // France: Blue, White, Red vertical tricolor
      return (
        <svg
          width={width}
          height={height}
          viewBox="0 0 20 14"
          className={className}
          style={{ borderRadius: '3px', display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
          aria-label="Flag of France"
          role="img"
        >
          <rect width="6.66" height="14" fill="#002395" />
          <rect x="6.66" width="6.66" height="14" fill="#FFFFFF" />
          <rect x="13.33" width="6.66" height="14" fill="#ED2939" />
        </svg>
      );

    case 'ro':
      // Romania: Blue, Yellow, Red vertical tricolor
      return (
        <svg
          width={width}
          height={height}
          viewBox="0 0 20 14"
          className={className}
          style={{ borderRadius: '3px', display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
          aria-label="Flag of Romania"
          role="img"
        >
          <rect width="6.66" height="14" fill="#002B7F" />
          <rect x="6.66" width="6.66" height="14" fill="#FCD116" />
          <rect x="13.33" width="6.66" height="14" fill="#CE1126" />
        </svg>
      );

    case 'eu':
      // European Union Flag: Blue with gold star ring
      return (
        <svg
          width={width}
          height={height}
          viewBox="0 0 20 14"
          className={className}
          style={{ borderRadius: '3px', display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
          aria-label="Flag of the European Union"
          role="img"
        >
          <rect width="20" height="14" fill="#003399" />
          <circle cx="10" cy="7" r="4.2" fill="none" stroke="#FFCC00" strokeWidth="1.2" strokeDasharray="1 1.6" />
        </svg>
      );

    case 'pk':
      // Pakistan: Dark green with white bar and crescent
      return (
        <svg
          width={width}
          height={height}
          viewBox="0 0 20 14"
          className={className}
          style={{ borderRadius: '3px', display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
          aria-label="Flag of Pakistan"
          role="img"
        >
          <rect width="20" height="14" fill="#01411C" />
          <rect width="5" height="14" fill="#FFFFFF" />
          <circle cx="12.5" cy="7" r="3.2" fill="#FFFFFF" />
          <circle cx="13.5" cy="6.2" r="2.8" fill="#01411C" />
          <polygon points="13.8,4.5 14.3,5.8 15.6,5.8 14.5,6.6 14.9,7.8 13.8,7.1 12.8,7.8 13.2,6.6 12.1,5.8 13.4,5.8" fill="#FFFFFF" />
        </svg>
      );

    default:
      return (
        <span
          style={{
            display: 'inline-block',
            width,
            height,
            backgroundColor: '#E1E8DE',
            borderRadius: '2px',
          }}
        />
      );
  }
};
