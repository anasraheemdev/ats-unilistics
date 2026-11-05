import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, Bookmark, BookOpen, Clock } from 'lucide-react';

export interface ProgramCardData {
  id: string;
  program_name: string;
  degree_level?: string;
  teaching_language?: string;
  discipline?: string;
  annual_tuition_eur?: number | null;
  tuition_type?: string | null;
  duration_semesters?: number | null;
  intake_season?: string | null;
  academic_year?: string | null;
  application_deadline?: string | null;
  university_id?: string;
  university_name: string;
  country_name?: string;
  country_code?: string;
  city?: string;
  is_bookmarked?: boolean;
}

interface ProgramCardProps {
  program: ProgramCardData;
  detailUrl: string;
  onBookmarkToggle?: (id: string) => void;
  isBookmarking?: boolean;
}

function getInitials(name: string): string {
  if (!name) return 'PG';
  const clean = name.replace(/Bachelor|Master|of|Science|Arts|in|and|the|for|und|für|di|de|Program/gi, '').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return name.slice(0, 2).toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function getCountryDisplay(codeOrName?: string): { name: string; flag: string; code: string } {
  const c = (codeOrName || '').toLowerCase();
  if (c === 'germany' || c === 'de') return { name: 'Germany', flag: '🇩🇪', code: 'DE' };
  if (c === 'france' || c === 'fr') return { name: 'France', flag: '🇫🇷', code: 'FR' };
  if (c === 'italy' || c === 'it') return { name: 'Italy', flag: '🇮🇹', code: 'IT' };
  if (c === 'romania' || c === 'ro') return { name: 'Romania', flag: '🇷🇴', code: 'RO' };
  return { name: codeOrName || 'Europe', flag: '🇪🇺', code: 'EU' };
}

function getTuitionText(tuitionEur?: number | null, tuitionType?: string | null): string {
  if (tuitionEur === 0 || tuitionType === 'free') {
    return '€0 / yr (Tuition-free)';
  }
  if (tuitionEur != null && tuitionEur > 0) {
    return `€${tuitionEur.toLocaleString()} / yr`;
  }
  if (tuitionType === 'subsidized' || tuitionType === 'low_cost') {
    return 'Subsidized (< €1,000/yr)';
  }
  return 'Tuition not published';
}

export const ProgramCard: React.FC<ProgramCardProps> = ({
  program,
  detailUrl,
  onBookmarkToggle,
  isBookmarking = false,
}) => {
  const countryInfo = getCountryDisplay(program.country_name || program.country_code);
  const tuitionNote = getTuitionText(program.annual_tuition_eur, program.tuition_type);
  const initials = getInitials(program.program_name);
  const isBachelor = (program.degree_level || '').toLowerCase().includes('bachelor');
  const levelLabel = isBachelor ? "Bachelor's" : "Master's";
  const languageLabel = program.teaching_language ? program.teaching_language.toUpperCase() : 'ENGLISH';

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
      className="catalogue-card-item"
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
            <span>{countryInfo.code} {countryInfo.name}</span>
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                padding: '0.2rem 0.5rem',
                borderRadius: 'var(--radius-pill, 9999px)',
                backgroundColor: 'rgba(36, 91, 66, 0.08)',
                color: 'var(--action-primary, #245B42)',
              }}
            >
              {levelLabel}
            </span>

            {onBookmarkToggle && (
              <button
                type="button"
                onClick={() => onBookmarkToggle(program.id)}
                disabled={isBookmarking}
                title={program.is_bookmarked ? 'Remove bookmark' : 'Save program'}
                aria-label={program.is_bookmarked ? 'Remove bookmark' : 'Save program'}
                style={{
                  padding: '0.35rem',
                  borderRadius: '50%',
                  background: 'none',
                  border: '1px solid transparent',
                  color: program.is_bookmarked ? 'var(--action-primary, #245B42)' : 'var(--color-foreground-muted, #58695E)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Bookmark size={15} fill={program.is_bookmarked ? 'currentColor' : 'none'} />
              </button>
            )}
          </div>
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
              {program.program_name}
            </h3>
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
              {program.university_name}
            </p>
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
            {program.city ? `${program.city}, ` : ''}{countryInfo.name}
          </span>
        </div>

        {/* Recessed Information Panel */}
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
              <span>Language & Level:</span>
            </span>
            <span style={{ fontWeight: 600, color: 'var(--color-foreground, #19261F)' }}>
              {languageLabel} • {levelLabel}
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

          {(program.duration_semesters || program.intake_season) && (
            <div
              style={{
                borderTop: '1px solid var(--border-subtle, #E1E8DE)',
                paddingTop: '0.4rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span style={{ color: 'var(--color-foreground-muted, #58695E)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <Clock size={12} aria-hidden="true" />
                <span>Schedule:</span>
              </span>
              <span style={{ fontWeight: 600, color: 'var(--color-foreground, #19261F)' }}>
                {program.duration_semesters ? `${program.duration_semesters} Semesters` : ''}
                {program.duration_semesters && program.intake_season ? ' • ' : ''}
                {program.intake_season ? `${program.intake_season} Intake` : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div
        style={{
          borderTop: '1px solid var(--border-subtle, #E1E8DE)',
          paddingTop: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
        }}
      >
        <span style={{ fontSize: '0.6875rem', color: 'var(--color-foreground-muted, #58695E)', fontWeight: 500 }}>
          Degree Curriculum
        </span>
        <Link
          to={detailUrl}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.8125rem',
            fontWeight: 700,
            color: 'var(--action-primary, #245B42)',
            textDecoration: 'none',
          }}
          className="hover:underline focus:outline-none"
        >
          <span>View program</span>
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
};
