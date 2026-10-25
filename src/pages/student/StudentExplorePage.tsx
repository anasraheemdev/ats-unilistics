import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { Bookmark, Calendar, CheckCircle2, ExternalLink } from 'lucide-react';

export const StudentExplorePage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('all');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data: result, isLoading, error, refetch } = useQuery({
    queryKey: ['student-explore-programs', country, search, page],
    queryFn: () =>
      api.programs.browse({
        country,
        search,
        page,
        pageSize: 12,
      }),
  });

  const bookmarkMutation = useMutation({
    mutationFn: (progId: string) => api.bookmarks.toggle(progId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-explore-programs'] });
      queryClient.invalidateQueries({ queryKey: ['saved-programs'] });
    },
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Explore University Programs</h1>
        <p style={{ color: 'var(--color-foreground-muted)', fontSize: '0.875rem' }}>
          Explore alternative or supplementary academic tracks across Germany, France, Italy, and Romania.
        </p>
      </div>

      {/* Filter Bar */}
      <Card padding="md">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1rem',
          }}
        >
          <Input
            label="Search Discipline or Keyword"
            value={search}
            maxLength={100}
            onChange={(e) => {
              setSearch(e.target.value.slice(0, 100));
              setPage(1);
            }}
            placeholder="e.g. Computer Science, Mechanical, Informatics..."
          />

          <Select
            label="Filter by Country"
            value={country}
            onChange={(e) => {
              setCountry(e.target.value);
              setPage(1);
            }}
            options={[
              { value: 'all', label: 'All Destination Corridors' },
              { value: 'germany', label: 'Germany' },
              { value: 'france', label: 'France' },
              { value: 'italy', label: 'Italy' },
              { value: 'romania', label: 'Romania' },
            ]}
          />
        </div>
      </Card>

      {isLoading && <LoadingState message="Searching approved program offerings..." />}
      {error && <ErrorState message="Could not fetch programs." onRetry={() => refetch()} />}

      {!isLoading && !error && result && (
        <>
          {result.items.length === 0 ? (
            <Card padding="lg" style={{ textAlign: 'center' }}>
              <p style={{ color: 'var(--color-foreground-muted)' }}>
                No programs matched your filter parameters.
              </p>
            </Card>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {result.items.map((prog) => {
                const isSaved = prog.is_bookmarked ?? false;

                return (
                  <Card key={prog.id} padding="md" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
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
                          onClick={() => bookmarkMutation.mutate(prog.id)}
                          aria-label={isSaved ? `Remove ${prog.program_name} from saved` : `Save ${prog.program_name}`}
                          style={{
                            color: isSaved ? 'var(--color-primary)' : 'var(--color-foreground-muted)',
                            padding: '0.25rem',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          <Bookmark size={20} fill={isSaved ? 'currentColor' : 'none'} />
                        </button>
                      </div>

                      <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                        {prog.program_name}
                      </h3>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--color-primary)', fontWeight: 600, marginBottom: '0.75rem' }}>
                        {prog.university_name}
                      </p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.8125rem', marginBottom: '0.75rem' }}>
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
                          <span>Next Intake: {prog.next_intake_deadline || 'Not published'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--color-foreground-muted)' }}>
                          <CheckCircle2 size={13} aria-hidden="true" />
                          <span>Verified: {prog.verified_date || 'Pending verification'}</span>
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        borderTop: '1px solid var(--color-border-subtle)',
                        paddingTop: '0.75rem',
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
                          <span>Official Portal</span>
                          <ExternalLink size={12} aria-hidden="true" />
                        </a>
                      ) : (
                        <span style={{ color: 'var(--color-foreground-muted)' }}>Portal: Direct</span>
                      )}

                      <span style={{ color: 'var(--color-foreground-muted)' }}>
                        Portal: {prog.application_portal}
                      </span>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {result.total_pages > 1 && (
            <div
              style={{
                marginTop: '1.5rem',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  cursor: page <= 1 ? 'not-allowed' : 'pointer',
                  opacity: page <= 1 ? 0.5 : 1,
                }}
              >
                Previous
              </button>
              <span style={{ fontSize: '0.875rem', color: 'var(--color-foreground-muted)' }}>
                Page {result.page} of {result.total_pages}
              </span>
              <button
                type="button"
                disabled={page >= result.total_pages}
                onClick={() => setPage((p) => Math.min(result.total_pages, p + 1))}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  cursor: page >= result.total_pages ? 'not-allowed' : 'pointer',
                  opacity: page >= result.total_pages ? 0.5 : 1,
                }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
