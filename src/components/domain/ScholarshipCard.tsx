import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, Bookmark, Award, Calendar } from 'lucide-react';

export interface ScholarshipCardData {
  id: string;
  name?: string;
  scheme_name?: string;
  provider?: string;
  provider_name?: string;
  target_country?: string;
  country_name?: string;
  country_code?: string;
  coverage_type?: string;
  funding_model?: string;
  stipend_amount_eur?: number | null;
  degree_level?: string;
  application_deadline?: string | null;
  annual_deadline_date?: string | null;
  intake_window?: string | null;
  eligibility_notes?: string | null;
  is_bookmarked?: boolean;
}

interface ScholarshipCardProps {
  scholarship: ScholarshipCardData;
  detailUrl: string;
  onBookmarkToggle?: (id: string) => void;
  isBookmarking?: boolean;
}

function getInitials(name: string): string {
  if (!name) return 'SC';
  const clean = name.replace(/Scholarship|Fellowship|Grant|Programme|Program|Foundation|for|and|in|the|de|di|der|des/gi, '').trim();
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
  return { name: codeOrName || 'European Union', flag: '🇪🇺', code: 'EU' };
}

function formatCoverageModel(coverageType?: string, fundingModel?: string): string {
  if (coverageType === 'full' || fundingModel?.toLowerCase().includes('full')) {
    return 'Full Tuition & Living Stipend';
  }
  if (coverageType === 'tuition_only' || fundingModel?.toLowerCase().includes('waiver')) {
    return 'Tuition Fee Waiver';
  }
  if (coverageType === 'partial' || fundingModel?.toLowerCase().includes('partial')) {
    return 'Partial Living Subsidy';
  }
  if (coverageType === 'merit' || fundingModel?.toLowerCase().includes('merit')) {
    return 'Merit Research Grant';
  }
  return fundingModel || 'Statutory Funding';
}

function formatAwardValue(stipendEur?: number | null, coverageType?: string): string {
  if (stipendEur && stipendEur > 0) {
    return `€${stipendEur.toLocaleString()} / yr`;
  }
  if (coverageType === 'full') {
    return 'Tuition waiver + Monthly living stipend';
  }
  if (coverageType === 'tuition_only') {
    return '100% Statutory tuition waiver';
  }
  return 'Statutory Ministry rates';
}

export const ScholarshipCard: React.FC<ScholarshipCardProps> = ({
  scholarship,
  detailUrl,
  onBookmarkToggle,
  isBookmarking = false,
}) => {
  const countryInfo = getCountryDisplay(scholarship.target_country || scholarship.country_name || scholarship.country_code);
  const schemeTitle = scholarship.scheme_name || scholarship.name || 'Scholarship Scheme';
  const providerTitle = scholarship.provider_name || scholarship.provider;
  const deadlineText = scholarship.application_deadline || scholarship.annual_deadline_date || scholarship.intake_window;
  const initials = getInitials(schemeTitle);
  const coverageLabel = formatCoverageModel(scholarship.coverage_type, scholarship.funding_model);
  const awardValue = formatAwardValue(scholarship.stipend_amount_eur, scholarship.coverage_type);
  const isFull = scholarship.coverage_type === 'full' || scholarship.funding_model?.toLowerCase().includes('full');

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
                backgroundColor: isFull ? 'rgba(36, 91, 66, 0.08)' : 'rgba(94, 53, 177, 0.08)',
                color: isFull ? 'var(--action-primary, #245B42)' : '#5E35B1',
              }}
            >
              {isFull ? 'Full Stipend' : 'Grant / Waiver'}
            </span>

            {onBookmarkToggle && (
              <button
                type="button"
                onClick={() => onBookmarkToggle(scholarship.id)}
                disabled={isBookmarking}
                title={scholarship.is_bookmarked ? 'Remove bookmark' : 'Save scholarship'}
                aria-label={scholarship.is_bookmarked ? 'Remove bookmark' : 'Save scholarship'}
                style={{
                  padding: '0.35rem',
                  borderRadius: '50%',
                  background: 'none',
                  border: '1px solid transparent',
                  color: scholarship.is_bookmarked ? 'var(--action-primary, #245B42)' : 'var(--color-foreground-muted, #58695E)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Bookmark size={15} fill={scholarship.is_bookmarked ? 'currentColor' : 'none'} />
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
              {schemeTitle}
            </h3>
            {providerTitle && (
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
                {providerTitle}
              </p>
            )}
          </div>
        </div>

        {/* Region / Target Corridor Row */}
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
            {countryInfo.name} Higher Education Corridor
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
              <Award size={13} aria-hidden="true" />
              <span>Funding Scope:</span>
            </span>
            <span
              style={{
                fontWeight: 600,
                color: 'var(--color-foreground, #19261F)',
                textAlign: 'right',
              }}
              className="line-clamp-1"
            >
              {coverageLabel}
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
            <span style={{ color: 'var(--color-foreground-muted, #58695E)', flexShrink: 0 }}>Award Value:</span>
            <span
              style={{
                fontWeight: 600,
                color: 'var(--color-foreground, #19261F)',
                textAlign: 'right',
                lineHeight: 1.3,
              }}
              className="line-clamp-1"
            >
              {awardValue}
            </span>
          </div>

          {deadlineText && (
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
                <Calendar size={12} aria-hidden="true" />
                <span>Application Window:</span>
              </span>
              <span style={{ fontWeight: 600, color: 'var(--color-foreground, #19261F)' }}>
                {deadlineText}
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
          Statutory Scheme
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
          <span>View criteria</span>
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
};
