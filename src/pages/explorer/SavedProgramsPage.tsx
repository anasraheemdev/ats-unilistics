import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { Bookmark, ExternalLink, Calendar, CheckCircle2, Trash2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export const SavedProgramsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: savedPrograms,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['saved-programs'],
    queryFn: () => api.bookmarks.getBookmarkedPrograms(),
  });

  const removeBookmarkMutation = useMutation({
    mutationFn: (progId: string) => api.bookmarks.toggle(progId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-programs'] });
      queryClient.invalidateQueries({ queryKey: ['explorer-programs'] });
    },
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Saved Programs</h1>
        <p style={{ color: 'var(--color-foreground-muted)', fontSize: '0.875rem' }}>
          Your bookmarked university tracks across Germany, France, Italy, and Romania.
        </p>
      </div>

      {isLoading && <LoadingState message="Loading your saved programs..." />}
      {error && <ErrorState message="Could not load bookmarked programs." onRetry={() => refetch()} />}

      {!isLoading && !error && savedPrograms && (
        <>
          {savedPrograms.length === 0 ? (
            <EmptyState
              title="No saved programs yet"
              description="Bookmark universities and degree tracks while browsing the published catalogue to track their application deadlines."
              actionLabel="Explore Catalogue"
              onAction={() => navigate('/explorer')}
              icon={<Bookmark size={28} />}
            />
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '1.25rem',
              }}
            >
              {savedPrograms.map((prog) => (
                <Card
                  key={prog.id}
                  padding="md"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.5rem',
                      }}
                    >
                      <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
                        <Badge variant="primary" size="sm">
                          {prog.country_code.toUpperCase()}
                        </Badge>
                        <Badge variant="default" size="sm">
                          {prog.degree_level.toUpperCase()}
                        </Badge>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeBookmarkMutation.mutate(prog.id)}
                        aria-label={`Remove ${prog.program_name} from saved`}
                        style={{
                          color: 'var(--color-destructive)',
                          padding: '0.25rem',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        <Trash2 size={18} aria-hidden="true" />
                      </button>
                    </div>

                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                      {prog.program_name}
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-primary)', fontWeight: 600, marginBottom: '0.75rem' }}>
                      {prog.university_name}
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', fontSize: '0.8125rem', marginBottom: '0.75rem' }}>
                      <div>
                        <span style={{ color: 'var(--color-foreground-muted)' }}>Language: </span>
                        <strong>{prog.teaching_language ? prog.teaching_language.toUpperCase() : 'Not specified'}</strong>
                      </div>

                      <div>
                        <span style={{ color: 'var(--color-foreground-muted)' }}>Tuition: </span>
                        <strong style={{ color: 'var(--color-primary)' }}>
                          {prog.annual_tuition_eur === 0 ? 'Zero Tuition' : `€${prog.annual_tuition_eur}/year`}
                        </strong>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--color-foreground-muted)' }}>
                        <Calendar size={13} aria-hidden="true" />
                        <span>
                          Next Intake: <strong>{prog.next_intake_deadline || 'Not published'}</strong>
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--color-foreground-muted)' }}>
                        <CheckCircle2 size={13} aria-hidden="true" />
                        <span>
                          Verified: {prog.verified_date || 'Pending staff review'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      paddingTop: '0.75rem',
                      borderTop: '1px solid var(--color-border-subtle)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.75rem',
                    }}
                  >
                    {prog.source_url ? (
                      <a
                        href={prog.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          color: 'var(--color-primary)',
                          textDecoration: 'none',
                          fontWeight: 600,
                        }}
                      >
                        <span>Official Source</span>
                        <ExternalLink size={12} aria-hidden="true" />
                      </a>
                    ) : (
                      <span style={{ color: 'var(--color-foreground-muted)' }}>Source: Not published</span>
                    )}

                    <Link
                      to="/explorer/request-support"
                      style={{
                        color: 'var(--color-secondary)',
                        textDecoration: 'none',
                        fontWeight: 600,
                      }}
                    >
                      Dossier Support &rarr;
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
