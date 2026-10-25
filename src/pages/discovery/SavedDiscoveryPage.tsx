import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { CatalogueProgramItem } from '@/types';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { ArrowRight, Trash2 } from 'lucide-react';

export const SavedDiscoveryPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: savedPrograms, isLoading, error, refetch } = useQuery({
    queryKey: ['saved-programs'],
    queryFn: () => api.bookmarks.getBookmarkedPrograms(),
  });

  const removeBookmarkMutation = useMutation({
    mutationFn: (progId: string) => api.bookmarks.toggle(progId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-programs'] });
      queryClient.invalidateQueries({ queryKey: ['discovery-programs'] });
    },
  });

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1.5rem 1rem 3rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-charcoal)' }}>
          Saved Degree Programs
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Your bookmarked programs for comparative review and managed application support requests.
        </p>
      </div>

      {isLoading ? (
        <LoadingState message="Loading saved programs..." minHeight="250px" />
      ) : error ? (
        <ErrorState
          title="Unable to load saved programs"
          message="Could not retrieve your bookmarked programs from server storage."
          onRetry={() => refetch()}
        />
      ) : !savedPrograms || savedPrograms.length === 0 ? (
        <EmptyState
          title="No saved programs yet"
          description="You haven't bookmarked any degree programs. Use the Degree Programs catalogue to bookmark curriculums of interest."
          actionLabel="Explore Programs Catalogue"
          onAction={() => navigate('/programs')}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {savedPrograms.map((prog: CatalogueProgramItem) => (
            <div
              key={prog.id}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 'var(--radius-card)',
                border: '1px solid var(--border-subtle)',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '0.2rem 0.5rem',
                      borderRadius: 'var(--radius-pill)',
                      backgroundColor: 'var(--surface-recessed)',
                      color: 'var(--text-charcoal)',
                    }}
                  >
                    {(prog.country_name || prog.country_code).toUpperCase()}
                  </span>

                  <button
                    type="button"
                    onClick={() => removeBookmarkMutation.mutate(prog.id)}
                    title="Remove bookmark"
                    aria-label="Remove bookmark"
                    style={{
                      padding: '0.35rem',
                      borderRadius: 'var(--radius-full)',
                      color: 'var(--text-muted)',
                      border: 'none',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  {prog.university_name}
                </p>

                <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-charcoal)', lineHeight: 1.3 }}>
                  {prog.program_name}
                </h2>
              </div>

              <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {prog.annual_tuition_eur === 0 ? '€0 Tuition' : `€${prog.annual_tuition_eur}/yr`}
                </span>
                <Link
                  to={`/programs/${prog.id}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: 'var(--action-primary)',
                    textDecoration: 'none',
                  }}
                >
                  <span>View Details</span>
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
