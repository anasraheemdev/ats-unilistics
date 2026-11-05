import React from 'react';
import {
  Cpu,
  Car,
  Binary,
  Zap,
  ShieldAlert,
  Globe,
} from 'lucide-react';

interface ProfessorVectorAvatarProps {
  professorId: string;
  name?: string;
  size?: number;
  className?: string;
}

export const ProfessorVectorAvatar: React.FC<ProfessorVectorAvatarProps> = ({
  professorId,
  name,
  size = 64,
  className = '',
}) => {
  // Select vector configuration based on professor ID
  const getAvatarConfig = () => {
    switch (professorId) {
      case 'prof-meier':
        return {
          bgColor: '#E6F0EB',
          accentColor: '#245B42',
          hairColor: '#303833',
          skinColor: '#F5D6B8',
          clothingColor: '#19261F',
          shirtColor: '#D7EE83',
          hasGlasses: true,
          gender: 'male',
          hairStyle: 'short',
          badgeIcon: Cpu,
          badgeBg: '#245B42',
          badgeColor: '#D7EE83',
        };
      case 'prof-rossi':
        return {
          bgColor: '#F7EDE6',
          accentColor: '#8C3B1E',
          hairColor: '#291811',
          skinColor: '#F8D8BE',
          clothingColor: '#245B42',
          shirtColor: '#FFFFFF',
          hasGlasses: false,
          gender: 'female',
          hairStyle: 'wavy',
          badgeIcon: Car,
          badgeBg: '#19261F',
          badgeColor: '#D7EE83',
        };
      case 'prof-laurent':
        return {
          bgColor: '#EBF2F7',
          accentColor: '#1E4968',
          hairColor: '#5C6975',
          skinColor: '#F3D2BA',
          clothingColor: '#1B3145',
          shirtColor: '#FFFFFF',
          hasGlasses: true,
          gender: 'male',
          hairStyle: 'bearded',
          badgeIcon: Binary,
          badgeBg: '#1B3145',
          badgeColor: '#FFFFFF',
        };
      case 'prof-becker':
        return {
          bgColor: '#EFF7ED',
          accentColor: '#3A7032',
          hairColor: '#C9A354',
          skinColor: '#FBE0C9',
          clothingColor: '#245B42',
          shirtColor: '#D7EE83',
          hasGlasses: true,
          gender: 'female',
          hairStyle: 'bob',
          badgeIcon: Zap,
          badgeBg: '#D7EE83',
          badgeColor: '#19261F',
        };
      case 'prof-popescu':
        return {
          bgColor: '#EBEBF5',
          accentColor: '#323770',
          hairColor: '#21242E',
          skinColor: '#F0CCA8',
          clothingColor: '#181C2B',
          shirtColor: '#FFFFFF',
          hasGlasses: true,
          gender: 'male',
          hairStyle: 'receding',
          badgeIcon: ShieldAlert,
          badgeBg: '#181C2B',
          badgeColor: '#D7EE83',
        };
      case 'prof-dupuis':
      default:
        return {
          bgColor: '#F6EBF0',
          accentColor: '#702E4E',
          hairColor: '#453228',
          skinColor: '#F6D5BD',
          clothingColor: '#522037',
          shirtColor: '#D7EE83',
          hasGlasses: true,
          gender: 'female',
          hairStyle: 'updo',
          badgeIcon: Globe,
          badgeBg: '#245B42',
          badgeColor: '#FFFFFF',
        };
    }
  };

  const cfg = getAvatarConfig();
  const BadgeIcon = cfg.badgeIcon;
  const badgeSize = Math.round(size * 0.35);

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: size,
        height: size,
        flexShrink: 0,
      }}
    >
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        role="img"
        aria-label={name ? `${name} Vector Avatar` : 'Professor Vector Avatar'}
        style={{
          borderRadius: '50%',
          border: '2px solid rgba(36, 91, 66, 0.25)',
          backgroundColor: cfg.bgColor,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          display: 'block',
        }}
      >
        <defs>
          <clipPath id={`avatar-clip-${professorId}`}>
            <circle cx="50" cy="50" r="48" />
          </clipPath>
          <linearGradient id={`bg-grad-${professorId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={cfg.bgColor} />
            <stop offset="100%" stopColor="#FFFFFF" />
          </linearGradient>
        </defs>

        <g clipPath={`url(#avatar-clip-${professorId})`}>
          {/* Subtle Background Radial Aura */}
          <circle cx="50" cy="50" r="48" fill={`url(#bg-grad-${professorId})`} />
          <circle cx="50" cy="30" r="32" fill={cfg.accentColor} opacity="0.08" />

          {/* Body / Shoulders & Suit */}
          <path
            d="M20 100 L24 82 C25 74 33 68 42 68 L58 68 C67 68 75 74 76 82 L80 100 Z"
            fill={cfg.clothingColor}
          />
          {/* Shirt / Collar */}
          <path d="M42 68 L50 82 L58 68 Z" fill={cfg.shirtColor} />
          <path d="M50 78 L50 88" stroke={cfg.accentColor} strokeWidth="1.5" />

          {/* Neck */}
          <rect x="44" y="52" width="12" height="18" fill={cfg.skinColor} rx="2" />

          {/* Head & Face */}
          <ellipse cx="50" cy="42" rx="19" ry="21" fill={cfg.skinColor} />

          {/* Hair Designs */}
          {cfg.hairStyle === 'short' && (
            <path
              d="M31 38 C30 25 38 18 50 18 C62 18 70 25 69 38 C67 27 60 23 50 23 C40 23 33 27 31 38 Z"
              fill={cfg.hairColor}
            />
          )}

          {cfg.hairStyle === 'wavy' && (
            <path
              d="M29 44 C27 28 35 16 50 16 C65 16 73 28 71 44 C75 52 74 62 70 65 C68 56 69 46 68 40 C65 24 57 21 50 21 C43 21 35 24 32 40 C31 46 32 56 30 65 C26 62 25 52 29 44 Z"
              fill={cfg.hairColor}
            />
          )}

          {cfg.hairStyle === 'bob' && (
            <path
              d="M30 42 C28 26 36 17 50 17 C64 17 72 26 70 42 C72 50 71 58 67 60 C66 48 68 38 66 32 C62 21 56 20 50 20 C44 20 38 21 34 32 C32 38 34 48 33 60 C29 58 28 50 30 42 Z"
              fill={cfg.hairColor}
            />
          )}

          {cfg.hairStyle === 'bearded' && (
            <>
              <path
                d="M32 36 C31 24 39 17 50 17 C61 17 69 24 68 36 C66 26 59 22 50 22 C41 22 34 26 32 36 Z"
                fill={cfg.hairColor}
              />
              <path
                d="M38 48 C37 58 43 64 50 64 C57 64 63 58 62 48 C60 52 56 55 50 55 C44 55 40 52 38 48 Z"
                fill={cfg.hairColor}
              />
            </>
          )}

          {cfg.hairStyle === 'receding' && (
            <path
              d="M31 38 C30 30 33 26 38 25 C39 29 43 30 50 30 C57 30 61 29 62 25 C67 26 70 30 69 38 C67 31 62 28 50 28 C38 28 33 31 31 38 Z"
              fill={cfg.hairColor}
            />
          )}

          {cfg.hairStyle === 'updo' && (
            <>
              <circle cx="50" cy="15" r="9" fill={cfg.hairColor} />
              <path
                d="M30 38 C29 25 38 19 50 19 C62 19 71 25 70 38 C68 28 61 23 50 23 C39 23 32 28 30 38 Z"
                fill={cfg.hairColor}
              />
            </>
          )}

          {/* Eyes & Brows */}
          <ellipse cx="44" cy="40" rx="2" ry="2.2" fill="#19261F" />
          <ellipse cx="56" cy="40" rx="2" ry="2.2" fill="#19261F" />
          <path d="M41 36 Q44 34 47 36" stroke="#19261F" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <path d="M53 36 Q56 34 59 36" stroke="#19261F" strokeWidth="1.2" fill="none" strokeLinecap="round" />

          {/* Glasses */}
          {cfg.hasGlasses && (
            <g stroke="#19261F" strokeWidth="1.6" fill="rgba(255,255,255,0.4)">
              <rect x="38" y="36" width="11" height="9" rx="2.5" />
              <rect x="51" y="36" width="11" height="9" rx="2.5" />
              <line x1="49" y1="40" x2="51" y2="40" />
            </g>
          )}

          {/* Nose & Friendly Smile */}
          <path d="M50 42 L49 46 L51 46" stroke="#C89D82" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <path d="M46 51 Q50 54 54 51" stroke="#9E6850" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </g>
      </svg>

      {/* Floating Research Discipline Insignia Badge */}
      <div
        style={{
          position: 'absolute',
          bottom: -2,
          right: -2,
          width: badgeSize,
          height: badgeSize,
          borderRadius: '50%',
          backgroundColor: cfg.badgeBg,
          color: cfg.badgeColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid #FFFFFF',
          boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
        }}
        title={`Academic Discipline: ${cfg.badgeIcon.name}`}
      >
        <BadgeIcon size={Math.round(badgeSize * 0.6)} strokeWidth={2.4} />
      </div>
    </div>
  );
};

