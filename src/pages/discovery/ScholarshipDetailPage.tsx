import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import {
  Calendar,
  ExternalLink,
  ChevronLeft,
  CheckCircle2,
  Building2,
} from 'lucide-react';

export const ScholarshipDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: sch, isLoading, error, refetch } = useQuery({
    queryKey: ['scholarship-detail', id],
    queryFn: () => (id ? api.scholarships.getById(id) : Promise.resolve(null)),
    enabled: Boolean(id),
  });

  if (isLoading) {
    return <LoadingState message="Loading scholarship profile..." minHeight="350px" />;
  }

  if (error || !sch) {
    return (
      <div style={{ maxWidth: '960px', margin: '2rem auto', padding: '0 1rem' }}>
        <ErrorState
          title="Scholarship not found"
          message="The requested scholarship scheme does not exist or has not been published in the active catalogue."
          onRetry={() => refetch()}
        />
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Link to="/scholarships" style={{ color: 'var(--action-primary)', fontWeight: 600, textDecoration: 'none' }}>
            ← Back to Scholarships Catalogue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1.5rem 1rem 3rem' }}>
      {/* Breadcrumb Navigation */}
      <div style={{ marginBottom: '1.25rem' }}>
        <Link
          to="/scholarships"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: 'var(--action-primary)',
            textDecoration: 'none',
          }}
        >
          <ChevronLeft size={16} />
          <span>Back to Scholarships</span>
        </Link>
      </div>

      {/* Main Header Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-card)',
          padding: '2rem 1.5rem',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-card)',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                padding: '0.25rem 0.6rem',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'var(--surface-recessed)',
                color: 'var(--text-charcoal)',
              }}
            >
              {sch.country.charAt(0).toUpperCase() + sch.country.slice(1)}
            </span>

            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '0.25rem 0.6rem',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: '#E8F5E9',
                color: '#2E7D32',
              }}
            >
              {sch.coverageType || 'VERIFIED GRANT'}
            </span>
          </div>

          {sch.officialUrl && (
            <a
              href={sch.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--action-primary)',
                textDecoration: 'none',
              }}
            >
              <span>Official Scheme Website</span>
              <ExternalLink size={14} aria-hidden="true" />
            </a>
          )}
        </div>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-charcoal)', lineHeight: 1.25 }}>
          {sch.title}
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
          <Building2 size={16} aria-hidden="true" />
          <span>{sch.provider}</span>
        </div>
      </div>

      {/* Scholarship Attributes Bento */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-card)', padding: '1.25rem', border: '1px solid var(--border-subtle)' }}>
          <h3 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
            Funding Model &amp; Coverage
          </h3>
          <p style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-charcoal)' }}>
            {sch.coverageType}
          </p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Coverage guidelines are calibrated for Pakistani students applying to European partner institutions.
          </p>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-card)', padding: '1.25rem', border: '1px solid var(--border-subtle)' }}>
          <h3 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
            Annual Application Window
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-charcoal)', fontWeight: 600, fontSize: '1rem' }}>
            <Calendar size={16} />
            <span>{sch.applicationWindowText || 'Not published'}</span>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Applications are typically reviewed once per academic year preceding the autumn intake.
          </p>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-card)', padding: '1.25rem', border: '1px solid var(--border-subtle)' }}>
          <h3 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
            Pakistani Applicant Eligibility
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#2E7D32', fontWeight: 600, fontSize: '0.875rem' }}>
            <CheckCircle2 size={16} />
            <span>Eligible for Pakistani Passport Holders</span>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Requires attested degree certificates and proof of university offer/admission.
          </p>
        </div>
      </div>
    </div>
  );
};
