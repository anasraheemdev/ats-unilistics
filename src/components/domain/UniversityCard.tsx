import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, ShieldCheck, BookOpen } from 'lucide-react';

export interface UniversityCardData {
  id: string;
  name: string;
  native_name?: string;
  country_name?: string;
  country_code?: string;
  city: string;
  institution_type?: string;
  total_programs_count?: number;
  last_verified_at?: string;
}

interface UniversityCardProps {
  university: UniversityCardData;
}

function getInitials(name: string): string {
  if (!name) return 'UN';
  const clean = name.replace(/University|of|the|and|de|di|für|und|Universitatea|din/gi, '').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return name.slice(0, 2).toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function getCountryDisplay(codeOrName?: string): { name: string; flag: string } {
  const c = (codeOrName || '').toLowerCase();
  if (c === 'germany' || c === 'de') return { name: 'Germany', flag: '🇩🇪' };
  if (c === 'france' || c === 'fr') return { name: 'France', flag: '🇫🇷' };
  if (c === 'italy' || c === 'it') return { name: 'Italy', flag: '🇮🇹' };
  if (c === 'romania' || c === 'ro') return { name: 'Romania', flag: '🇷🇴' };
  return { name: codeOrName || 'Europe', flag: '🇪🇺' };
}

function getTruthfulTuitionText(countryNameOrCode?: string, institutionType?: string): string {
  const country = (countryNameOrCode || '').toLowerCase();
  const isPublic = (institutionType || '').toLowerCase() === 'public';

  if (!isPublic) {
    return 'Non-EU private fee schedule applies';
  }

  if (country === 'germany' || country === 'de') {
    return 'State subsidized (semester fee or non-EU rate)';
  }
  if (country === 'france' || country === 'fr') {
    return 'Statutory public rates (campus-dependent)';
  }
  if (country === 'italy' || country === 'it') {
    return 'Public scale based on ISEE / non-EU bracket';
  }
  if (country === 'romania' || country === 'ro') {
    return 'Ministry non-EU foreign student fee schedule';
  }
  return 'Tuition details available in program view';
}

export const UniversityCard: React.FC<UniversityCardProps> = ({ university }) => {
  const countryInfo = getCountryDisplay(university.country_name || university.country_code);
  const isPublic = (university.institution_type || '').toLowerCase() === 'public';
  const tuitionNote = getTruthfulTuitionText(university.country_name || university.country_code, university.institution_type);
  const initials = getInitials(university.name);

  return (
    <article
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: 'var(--surface-card, #FFFFFF)',
        border: '1px solid var(--border-subtle, #E1E8DE)',
        borderRadius: 'var(--radius-card, 20px)',
        padding: '1.25rem',
        boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.05))',
        transition: 'transform var(--transition-fast, 150ms ease), box-shadow var(--transition-fast, 150ms ease)',
        minHeight: '340px',
      }}
      className="university-card-item"
    >
      <div>
        {/* Top Badges Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
            marginBottom: '0.875rem',
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '0.2rem 0.625rem',
              borderRadius: 'var(--radius-pill, 9999px)',
              backgroundColor: 'var(--surface-recessed, #EDF2E9)',
              color: 'var(--color-foreground, #19261F)',
              border: '1px solid var(--border-subtle, #E1E8DE)',
            }}
          >
            <span aria-hidden="true">{countryInfo.flag}</span>
            <span>{countryInfo.name}</span>
          </span>

          <span
            style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              padding: '0.2rem 0.5rem',
              borderRadius: 'var(--radius-pill, 9999px)',
              backgroundColor: isPublic ? 'rgba(36, 91, 66, 0.08)' : 'rgba(94, 53, 177, 0.08)',
              color: isPublic ? 'var(--action-primary, #245B42)' : '#5E35B1',
            }}
          >
            {university.institution_type || 'Public Research'}
          </span>
        </div>

        {/* Identity Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem', marginBottom: '0.75rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-control, 14px)',
              backgroundColor: 'var(--surface-recessed, #EDF2E9)',
              border: '1px solid var(--border-subtle, #E1E8DE)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.875rem',
              fontWeight: 800,
              color: 'var(--action-primary, #245B42)',
              flexShrink: 0,
            }}
            aria-hidden="true"
          >
            {initials}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h3
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: 'var(--color-foreground, #19261F)',
                lineHeight: 1.35,
                margin: 0,
                wordBreak: 'break-word',
              }}
              className="line-clamp-2"
            >
              {university.name}
            </h3>
            {university.native_name && (
              <p
                style={{
                  fontSize: '0.75rem',
                  fontStyle: 'italic',
                  color: 'var(--color-foreground-muted, #58695E)',
                  margin: '0.2rem 0 0',
                  lineHeight: 1.3,
                }}
                className="line-clamp-1"
              >
                {university.native_name}
              </p>
            )}
          </div>
        </div>

        {/* Location Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.8125rem',
            color: 'var(--color-foreground-muted, #58695E)',
            marginBottom: '1rem',
          }}
        >
          <MapPin size={15} style={{ color: 'var(--action-primary, #245B42)', flexShrink: 0 }} aria-hidden="true" />
          <span>
            {university.city}, {countryInfo.name}
          </span>
        </div>

        {/* Information Panel */}
        <div
          style={{
            backgroundColor: 'var(--surface-recessed, #EDF2E9)',
            border: '1px solid var(--border-subtle, #E1E8DE)',
            borderRadius: 'var(--radius-control, 14px)',
            padding: '0.75rem 0.875rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            fontSize: '0.75rem',
            marginBottom: '1rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: 'var(--color-foreground-muted, #58695E)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <BookOpen size={13} aria-hidden="true" />
              <span>Programmes:</span>
            </span>
            <span style={{ fontWeight: 600, color: 'var(--color-foreground, #19261F)' }}>
              {university.total_programs_count ? `${university.total_programs_count} programs indexed` : 'Published programs'}
            </span>
          </div>

          <div
            style={{
              borderTop: '1px solid var(--border-subtle, #E1E8DE)',
              paddingTop: '0.4rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '0.5rem',
            }}
          >
            <span style={{ color: 'var(--color-foreground-muted, #58695E)', flexShrink: 0 }}>Tuition Note:</span>
            <span
              style={{
                fontWeight: 600,
                color: 'var(--color-foreground, #19261F)',
                textAlign: 'right',
                lineHeight: 1.3,
              }}
              title={tuitionNote}
              className="line-clamp-1"
            >
              {tuitionNote}
            </span>
          </div>

          {university.last_verified_at && (
            <div
              style={{
                borderTop: '1px solid var(--border-subtle, #E1E8DE)',
                paddingTop: '0.4rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                color: 'var(--action-primary, #245B42)',
                fontSize: '0.6875rem',
                fontWeight: 600,
              }}
            >
              <ShieldCheck size={13} aria-hidden="true" />
              <span>Procedurally verified record</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Action Footer */}
      <div
        style={{
          borderTop: '1px solid var(--border-subtle, #E1E8DE)',
          paddingTop: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted, #58695E)' }}>
          Corridor Profile
        </span>
        <Link
          to={`/universities/${university.id}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.8125rem',
            fontWeight: 700,
            color: 'var(--action-primary, #245B42)',
            textDecoration: 'none',
          }}
          aria-label={`View ${university.name} profile`}
        >
          <span>View profile</span>
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
};

export default UniversityCard;
