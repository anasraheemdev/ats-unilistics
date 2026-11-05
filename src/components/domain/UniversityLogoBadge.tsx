import React from 'react';

interface UniversityLogoBadgeProps {
  universityId: string;
  name: string;
  size?: number;
}

export const UniversityLogoBadge: React.FC<UniversityLogoBadgeProps> = ({
  universityId,
  name,
  size = 54,
}) => {
  switch (universityId) {
    case 'uni-polimi':
      // Politecnico di Milano official-style logo
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Politecnico di Milano Logo"
        >
          <rect width="100" height="100" rx="16" fill="#FFFFFF" />
          {/* POLIMI wordmark with geometric styling */}
          <text
            x="50"
            y="58"
            fontFamily="'DM Sans', 'Helvetica Neue', Arial, sans-serif"
            fontWeight="900"
            fontSize="26"
            letterSpacing="-0.04em"
            fill="#0F334C"
            textAnchor="middle"
          >
            POLIMI
          </text>
          <circle cx="50" cy="24" r="6" fill="#0F334C" />
          <path
            d="M32 24 C32 14, 68 14, 68 24"
            stroke="#0F334C"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'uni-tum':
      // Technical University of Munich official TUM blue mark
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="TUM Logo"
        >
          <rect width="100" height="100" rx="16" fill="#0065BD" />
          {/* Geometric TUM letters */}
          <text
            x="50"
            y="64"
            fontFamily="'DM Sans', Arial, sans-serif"
            fontWeight="900"
            fontSize="34"
            letterSpacing="-0.03em"
            fill="#FFFFFF"
            textAnchor="middle"
          >
            TUM
          </text>
        </svg>
      );

    case 'uni-sorbonne':
      // Sorbonne University elegant seal mark
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Sorbonne University Logo"
        >
          <rect width="100" height="100" rx="16" fill="#172640" />
          <circle cx="50" cy="50" r="38" stroke="#D7EE83" strokeWidth="2" strokeDasharray="3 3" />
          <text
            x="50"
            y="48"
            fontFamily="'Georgia', serif"
            fontWeight="800"
            fontSize="22"
            letterSpacing="0.08em"
            fill="#FFFFFF"
            textAnchor="middle"
          >
            SORBONNE
          </text>
          <text
            x="50"
            y="65"
            fontFamily="'DM Sans', sans-serif"
            fontWeight="700"
            fontSize="10"
            letterSpacing="0.16em"
            fill="#D7EE83"
            textAnchor="middle"
          >
            UNIVERSITÉ
          </text>
        </svg>
      );

    case 'uni-rwth':
      // RWTH Aachen University classic mark
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="RWTH Aachen Logo"
        >
          <rect width="100" height="100" rx="16" fill="#00549F" />
          <text
            x="50"
            y="46"
            fontFamily="'DM Sans', Arial, sans-serif"
            fontWeight="900"
            fontSize="24"
            letterSpacing="-0.02em"
            fill="#FFFFFF"
            textAnchor="middle"
          >
            RWTH
          </text>
          <text
            x="50"
            y="66"
            fontFamily="'DM Sans', Arial, sans-serif"
            fontWeight="700"
            fontSize="13"
            letterSpacing="0.04em"
            fill="#D7EE83"
            textAnchor="middle"
          >
            AACHEN
          </text>
        </svg>
      );

    case 'uni-bucharest':
      // University of Bucharest emblem
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="University of Bucharest Logo"
        >
          <rect width="100" height="100" rx="16" fill="#8B1D2C" />
          <polygon points="50,16 80,32 80,68 50,84 20,68 20,32" stroke="#FFFFFF" strokeWidth="2.5" fill="none" />
          <text
            x="50"
            y="58"
            fontFamily="'Georgia', serif"
            fontWeight="900"
            fontSize="28"
            fill="#FFFFFF"
            textAnchor="middle"
          >
            UB
          </text>
        </svg>
      );

    case 'uni-sciencespo':
      // Sciences Po signature mark
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Sciences Po Logo"
        >
          <rect width="100" height="100" rx="16" fill="#C9142A" />
          <text
            x="50"
            y="48"
            fontFamily="'DM Sans', sans-serif"
            fontWeight="800"
            fontSize="15"
            letterSpacing="-0.02em"
            fill="#FFFFFF"
            textAnchor="middle"
          >
            SciencesPo
          </text>
          <circle cx="50" cy="65" r="4" fill="#FFFFFF" />
        </svg>
      );

    default:
      // Generic prestigious university crest
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label={`${name} Logo`}
        >
          <rect width="100" height="100" rx="16" fill="#245B42" />
          <circle cx="50" cy="50" r="32" stroke="#D7EE83" strokeWidth="3" />
          <text
            x="50"
            y="58"
            fontFamily="'DM Sans', sans-serif"
            fontWeight="800"
            fontSize="20"
            fill="#FFFFFF"
            textAnchor="middle"
          >
            {name.substring(0, 3).toUpperCase()}
          </text>
        </svg>
      );
  }
};
