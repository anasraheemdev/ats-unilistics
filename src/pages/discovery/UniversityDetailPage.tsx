import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { UserRole } from '@/types';
import {
  MapPin,
  ExternalLink,
  ChevronLeft,
  CheckCircle2,
  ArrowRight,
  Lock,
} from 'lucide-react';

export const UniversityDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('visitor');

  useEffect(() => {
    api.auth.getCurrentUser().then((u) => {
      if (u?.role) {
        setCurrentUserRole(u.role);
      }
    });
  }, []);

  const isVisitor = currentUserRole === 'visitor';

  const { data: uni, isLoading, error, refetch } = useQuery({
    queryKey: ['university-detail', id, currentUserRole],
    queryFn: () => (id ? api.universities.getById(id) : Promise.resolve(null)),
    enabled: Boolean(id),
  });

  if (isLoading) {
    return <LoadingState message="Loading university profile..." minHeight="350px" />;
  }

  // Safe access gate for visitors attempting to view restricted non-preview institutions
  if (isVisitor && (!uni || !uni.isPreview)) {
    return (
      <div style={{ maxWidth: '580px', margin: '4rem auto', padding: '0 1rem' }}>
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-card, 16px)',
            border: '1px solid var(--border-subtle, #ebe6de)',
            padding: '2.5rem 1.75rem',
            textAlign: 'center',
            boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-peach-bg, #fff5f2)',
              color: 'var(--action-primary, #b72301)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}
            aria-hidden="true"
          >
            <Lock size={24} />
          </div>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-charcoal, #1a1a1a)', margin: '0 0 0.5rem 0' }}>
            Restricted Institution Record
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted, #636b78)', margin: '0 0 1.5rem 0', lineHeight: 1.5 }}>
            This university profile and its faculty listings require a verified Explorer account. Sign in or create a free account to view the full catalogue.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link
              to={`/sign-in?returnUrl=/universities/${id}`}
              className="btn-pill btn-pill-outline"
              style={{ padding: '0.625rem 1.25rem', fontSize: '0.875rem', fontWeight: 700 }}
            >
              Sign In
            </Link>
            <Link
              to={`/sign-up?returnUrl=/universities/${id}`}
              className="btn-pill btn-pill-primary"
              style={{ padding: '0.625rem 1.25rem', fontSize: '0.875rem', fontWeight: 700 }}
            >
              Create Free Account
            </Link>
          </div>

          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle, #ebe6de)' }}>
            <Link to="/universities" style={{ fontSize: '0.8125rem', color: 'var(--action-primary, #b72301)', textDecoration: 'none', fontWeight: 600 }}>
              ← Return to Preview Universities
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error || !uni) {
    return (
      <div style={{ maxWidth: '960px', margin: '2rem auto', padding: '0 1rem' }}>
        <ErrorState
          title="University not found"
          message="The requested university record does not exist or has not been published in the active catalogue."
          onRetry={() => refetch()}
        />
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Link to="/universities" style={{ color: 'var(--action-primary, #b72301)', fontWeight: 600, textDecoration: 'none' }}>
            ← Back to Universities Catalogue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1.5rem 1rem 3rem' }}>
      {/* Back to Catalogue Breadcrumb */}
      <div style={{ marginBottom: '1.25rem' }}>
        <Link
          to="/universities"
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
          <span>Back to Universities</span>
        </Link>
      </div>

      {/* Main University Header Card */}
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
              {uni.country.charAt(0).toUpperCase() + uni.country.slice(1)}
            </span>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '0.25rem 0.6rem',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: uni.institutionalType === 'public' ? '#E8F5E9' : '#EDE7F6',
                color: uni.institutionalType === 'public' ? '#2E7D32' : '#5E35B1',
              }}
            >
              {uni.institutionalType ? uni.institutionalType.toUpperCase() : 'UNKNOWN'}
            </span>
          </div>

          {uni.websiteUrl && (
            <a
              href={uni.websiteUrl}
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
              <span>Official Institutional Portal</span>
              <ExternalLink size={14} aria-hidden="true" />
            </a>
          )}
        </div>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-charcoal)', lineHeight: 1.25 }}>
          {uni.name}
        </h1>

        {uni.originalName && (
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '0.35rem' }}>
            {uni.originalName}
          </p>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          <MapPin size={16} aria-hidden="true" />
          <span>{uni.city}, {uni.country.charAt(0).toUpperCase() + uni.country.slice(1)}</span>
        </div>
      </div>

      {/* University Attributes & Details Bento */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-card)', padding: '1.25rem', border: '1px solid var(--border-subtle)' }}>
          <h3 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
            Admission Model
          </h3>
          <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-charcoal)' }}>
            {uni.institutionalType === 'public' ? 'State Public Higher Education' : 'Accredited Private Higher Education'}
          </p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {uni.tuitionBracket || 'Standard statutory semester contributions apply'}
          </p>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-card)', padding: '1.25rem', border: '1px solid var(--border-subtle)' }}>
          <h3 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
            Indicative Ranking
          </h3>
          <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-charcoal)' }}>
            {uni.ranking ? `Top #${uni.ranking} National / Regional` : 'Not published'}
          </p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Rankings are informational guides and do not impact visa qualification.
          </p>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-card)', padding: '1.25rem', border: '1px solid var(--border-subtle)' }}>
          <h3 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
            Verification Status
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#2E7D32', fontWeight: 600, fontSize: '0.875rem' }}>
            <CheckCircle2 size={16} />
            <span>Ministry Verified Institution</span>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Recognised by the relevant Ministry of Higher Education &amp; HEC Pakistan.
          </p>
        </div>
      </div>

      {/* Available Programs at this University */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-card)', padding: '1.5rem', border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-charcoal)' }}>
              Published Degree Programs
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Degree programs offered by {uni.name} in this catalogue.
            </p>
          </div>
          <Link
            to={`/programs?search=${encodeURIComponent(uni.name)}`}
            style={{
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'var(--action-primary)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <span>View in Programs Filter</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          To view program-level ECTS modules, application intake deadlines, and portal prerequisites, browse all curriculums indexed under this institution.
        </p>
      </div>
    </div>
  );
};
