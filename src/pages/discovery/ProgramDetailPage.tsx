import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import {
  Building2,
  ExternalLink,
  ChevronLeft,
  Bookmark,
  Sparkles,
} from 'lucide-react';

export const ProgramDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: prog, isLoading, error, refetch } = useQuery({
    queryKey: ['program-detail', id],
    queryFn: () => (id ? api.programs.getById(id) : Promise.resolve(null)),
    enabled: Boolean(id),
  });

  const bookmarkMutation = useMutation({
    mutationFn: (progId: string) => api.bookmarks.toggle(progId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['saved-programs'] });
    },
  });

  if (isLoading) {
    return <LoadingState message="Loading degree curriculum profile..." minHeight="350px" />;
  }

  if (error || !prog) {
    return (
      <div style={{ maxWidth: '960px', margin: '2rem auto', padding: '0 1rem' }}>
        <ErrorState
          title="Degree Program not found"
          message="The requested degree program does not exist or has not been published in the active catalogue."
          onRetry={() => refetch()}
        />
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Link to="/programs" style={{ color: 'var(--action-primary)', fontWeight: 600, textDecoration: 'none' }}>
            ← Back to Degree Programs
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
          to="/programs"
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
          <span>Back to Degree Programs</span>
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
              {prog.country.charAt(0).toUpperCase() + prog.country.slice(1)}
            </span>

            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '0.25rem 0.6rem',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: '#E3F2FD',
                color: '#1565C0',
              }}
            >
              {prog.degreeLevel === 'bachelor' ? "Bachelor's Degree" : "Master's Degree"}
            </span>

            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '0.25rem 0.6rem',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: '#EDE7F6',
                color: '#5E35B1',
              }}
            >
              {prog.instructionLanguage ? prog.instructionLanguage.toUpperCase() : 'ENGLISH'}
            </span>
          </div>

          {/* Bookmark Button */}
          <button
            type="button"
            onClick={() => prog && bookmarkMutation.mutate(prog.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.75rem',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--surface-canvas)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'var(--text-charcoal)',
              cursor: 'pointer',
            }}
          >
            <Bookmark size={16} />
            <span>Save Program</span>
          </button>
        </div>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-charcoal)', lineHeight: 1.25 }}>
          {prog.title}
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
          <Building2 size={16} aria-hidden="true" />
          <span>{prog.universityName}</span>
        </div>
      </div>

      {/* Program Details Bento */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-card)', padding: '1.25rem', border: '1px solid var(--border-subtle)' }}>
          <h3 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
            Annual Tuition Benchmark
          </h3>
          <p style={{ fontSize: '1.25rem', fontWeight: 700, color: prog.tuitionPerYearEur === 0 ? '#2E7D32' : 'var(--text-charcoal)' }}>
            {prog.tuitionPerYearEur === 0 ? '€0 Tuition (Tuition-Free)' : `€${prog.tuitionPerYearEur} / academic year`}
          </p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            {prog.tuitionPerYearEur === 0
              ? 'Statutory semester administrative contributions (approx €150-€350) still apply for transit/student union.'
              : 'Indicative fee for third-country non-EU applicants.'}
          </p>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-card)', padding: '1.25rem', border: '1px solid var(--border-subtle)' }}>
          <h3 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
            Application Portal &amp; Protocol
          </h3>
          <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-charcoal)' }}>
            {(prog as any).applicationPortal || 'Uni-Assist / Direct University Submission'}
          </p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            {prog.applicationDeadlineText ? `Upcoming Deadline: ${prog.applicationDeadlineText}` : 'Deadlines follow statutory winter/summer intake rounds.'}
          </p>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-card)', padding: '1.25rem', border: '1px solid var(--border-subtle)' }}>
          <h3 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
            Language Benchmark
          </h3>
          <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-charcoal)' }}>
            {prog.instructionLanguage ? `${prog.instructionLanguage.toUpperCase()} Medium of Instruction` : 'English Proficiency'}
          </p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            IELTS Academic 6.5+ / TOEFL iBT 90+ typically expected unless prior English medium certificate is accepted.
          </p>
        </div>
      </div>

      {/* Upgrade / Managed Application Support CTA Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-card)',
          padding: '1.75rem',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--action-primary)' }}>
          <Sparkles size={20} />
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-charcoal)' }}>
            Apply to this Program with Unilistics Managed Support
          </h2>
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          Our accredited counsellors oversee your entire dossier assembly, official HEC and MOFA apostille verification, VPD/pre-evaluation checks, portal submissions, and visa interview preparation.
        </p>
        <div>
          <Link
            to="/request-support"
            className="btn-pill btn-pill-primary"
            style={{ padding: '0.625rem 1.25rem', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <span>Request Managed Application Case</span>
            <ExternalLink size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};
