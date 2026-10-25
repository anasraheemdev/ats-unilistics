import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '@/lib/api';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  ArrowRight,
  X,
  Calendar,
} from 'lucide-react';

export const ProgramsDiscoveryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const countryParam = searchParams.get('country') || 'all';
  const degreeLevelParam = searchParams.get('level') || 'all';
  const languageParam = searchParams.get('lang') || 'all';
  const tuitionTypeParam = searchParams.get('tuition') || 'all';
  const searchParam = searchParams.get('search') || '';
  const sortByParam = searchParams.get('sort') || 'title_asc';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(searchParam);

  const updateParam = (key: string, value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value === 'all' || !value) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      next.set('page', '1');
      return next;
    });
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('page', String(newPage));
      return next;
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam('search', searchInput.trim());
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams());
    setMobileFilterOpen(false);
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['discovery-programs', countryParam, degreeLevelParam, languageParam, tuitionTypeParam, searchParam, sortByParam, pageParam],
    queryFn: () =>
      api.programs.browse({
        country: countryParam,
        degreeLevel: degreeLevelParam,
        language: languageParam,
        tuitionType: tuitionTypeParam,
        search: searchParam,
        sortBy: sortByParam,
        page: pageParam,
        pageSize: 12,
      }),
  });

  const bookmarkMutation = useMutation({
    mutationFn: (progId: string) => api.bookmarks.toggle(progId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discovery-programs'] });
      queryClient.invalidateQueries({ queryKey: ['saved-programs'] });
    },
  });

  const countries = [
    { code: 'all', label: 'All Destinations' },
    { code: 'germany', label: 'Germany 🇩🇪' },
    { code: 'france', label: 'France 🇫🇷' },
    { code: 'italy', label: 'Italy 🇮🇹' },
    { code: 'romania', label: 'Romania 🇷🇴' },
  ];

  const degreeLevels = [
    { code: 'all', label: 'All Degree Levels' },
    { code: 'bachelors', label: "Bachelor's Degree" },
    { code: 'masters', label: "Master's Degree" },
  ];

  const languages = [
    { code: 'all', label: 'All Teaching Languages' },
    { code: 'english', label: 'English-Taught' },
    { code: 'german', label: 'German' },
    { code: 'french', label: 'French' },
    { code: 'italian', label: 'Italian' },
    { code: 'romanian', label: 'Romanian' },
  ];

  const tuitionTypes = [
    { code: 'all', label: 'All Tuition Rates' },
    { code: 'free', label: 'Tuition-Free (€0/yr)' },
    { code: 'low_cost', label: 'Subsidized (< €1,000)' },
    { code: 'standard', label: 'Standard Non-EU Fee' },
  ];

  const filterSidebar = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
            Destination
          </span>
          {(countryParam !== 'all' || degreeLevelParam !== 'all' || languageParam !== 'all' || tuitionTypeParam !== 'all' || searchParam) && (
            <button
              type="button"
              onClick={handleResetFilters}
              style={{ fontSize: '0.75rem', color: 'var(--action-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
            >
              Reset All
            </button>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {countries.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => updateParam('country', c.code)}
              style={{
                textAlign: 'left',
                padding: '0.4rem 0.6rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8125rem',
                fontWeight: countryParam === c.code ? 600 : 500,
                color: countryParam === c.code ? 'var(--action-primary)' : 'var(--text-charcoal)',
                backgroundColor: countryParam === c.code ? 'var(--accent-peach-bg)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
        <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '0.625rem' }}>
          Degree Level
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {degreeLevels.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => updateParam('level', l.code)}
              style={{
                textAlign: 'left',
                padding: '0.4rem 0.6rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8125rem',
                fontWeight: degreeLevelParam === l.code ? 600 : 500,
                color: degreeLevelParam === l.code ? 'var(--action-primary)' : 'var(--text-charcoal)',
                backgroundColor: degreeLevelParam === l.code ? 'var(--accent-peach-bg)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
        <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '0.625rem' }}>
          Teaching Language
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {languages.map((lg) => (
            <button
              key={lg.code}
              type="button"
              onClick={() => updateParam('lang', lg.code)}
              style={{
                textAlign: 'left',
                padding: '0.4rem 0.6rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8125rem',
                fontWeight: languageParam === lg.code ? 600 : 500,
                color: languageParam === lg.code ? 'var(--action-primary)' : 'var(--text-charcoal)',
                backgroundColor: languageParam === lg.code ? 'var(--accent-peach-bg)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {lg.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
        <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '0.625rem' }}>
          Tuition Rate
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {tuitionTypes.map((tt) => (
            <button
              key={tt.code}
              type="button"
              onClick={() => updateParam('tuition', tt.code)}
              style={{
                textAlign: 'left',
                padding: '0.4rem 0.6rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8125rem',
                fontWeight: tuitionTypeParam === tt.code ? 600 : 500,
                color: tuitionTypeParam === tt.code ? 'var(--action-primary)' : 'var(--text-charcoal)',
                backgroundColor: tuitionTypeParam === tt.code ? 'var(--accent-peach-bg)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {tt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '1.5rem 1rem 3rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '1.5rem' }} className="md:grid-cols-[240px_1fr]">
        {/* Desktop Filter Sidebar */}
        <aside
          style={{
            display: 'none',
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-card)',
            padding: '1.25rem',
            border: '1px solid var(--border-subtle)',
            height: 'fit-content',
            position: 'sticky',
            top: '80px',
          }}
          className="md:block"
          aria-label="Catalogue filters"
        >
          {filterSidebar}
        </aside>

        {/* Main Content Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', minWidth: 0 }}>
          {/* Header & Title */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-charcoal)' }}>
                  Degree Programs
                </h1>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Browse verified Bachelor’s and Master’s curriculums with language requirements, admission portals, and tuition benchmarks.
                </p>
              </div>

              {/* Mobile Filter Toggle */}
              <button
                type="button"
                onClick={() => setMobileFilterOpen(true)}
                className="md:hidden"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.5rem 0.875rem',
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--text-charcoal)',
                }}
              >
                <Filter size={16} />
                <span>Filters</span>
                {(countryParam !== 'all' || degreeLevelParam !== 'all' || languageParam !== 'all' || tuitionTypeParam !== 'all') && (
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--action-primary)' }} />
                )}
              </button>
            </div>
          </div>

          {/* Search Bar & Controls Bar */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-card)',
              padding: '1rem',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search
                  size={18}
                  style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search program by title, discipline, or university..."
                  style={{
                    width: '100%',
                    padding: '0.625rem 1rem 0.625rem 2.5rem',
                    fontSize: '0.875rem',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    outline: 'none',
                    backgroundColor: 'var(--surface-canvas)',
                  }}
                />
              </div>
              <button
                type="submit"
                className="btn-pill btn-pill-primary"
                style={{ padding: '0.625rem 1.25rem', fontSize: '0.875rem' }}
              >
                Search
              </button>
            </form>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
                fontSize: '0.8125rem',
                color: 'var(--text-muted)',
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '0.75rem',
              }}
            >
              <div>
                {isLoading ? (
                  <span>Searching published degree programs...</span>
                ) : (
                  <span>
                    Showing <strong>{data?.total_count || 0}</strong> {data?.total_count === 1 ? 'program' : 'programs'}
                    {data?.is_preview_restricted && ' (Visitor preview cap active)'}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label htmlFor="sort-by-prog" style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                  Sort by:
                </label>
                <select
                  id="sort-by-prog"
                  value={sortByParam}
                  onChange={(e) => updateParam('sort', e.target.value)}
                  style={{
                    padding: '0.3rem 0.5rem',
                    fontSize: '0.8125rem',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: '#ffffff',
                    color: 'var(--text-charcoal)',
                  }}
                >
                  <option value="title_asc">Title (A–Z)</option>
                  <option value="title_desc">Title (Z–A)</option>
                  <option value="tuition_asc">Tuition (Low to High)</option>
                  <option value="tuition_desc">Tuition (High to Low)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Grid / List */}
          {isLoading ? (
            <LoadingState message="Loading verified degree programs..." minHeight="300px" />
          ) : error ? (
            <ErrorState
              title="Unable to load degree programs"
              message="A query error occurred while fetching curriculum records. Please retry."
              onRetry={() => refetch()}
            />
          ) : !data || data.items.length === 0 ? (
            <EmptyState
              title="No degree programs found"
              description="The catalogue currently does not have degree program records matching your active filters. If you are an administrator, use Catalogue Imports in the operations workspace to ingest program records."
              actionLabel={searchParam || countryParam !== 'all' || degreeLevelParam !== 'all' ? 'Reset Filters' : undefined}
              onAction={searchParam || countryParam !== 'all' || degreeLevelParam !== 'all' ? handleResetFilters : undefined}
            />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {data.items.map((prog) => (
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
                        {prog.country_name || prog.country_code.toUpperCase()}
                      </span>

                      {/* Bookmark Button */}
                      <button
                        type="button"
                        onClick={() => bookmarkMutation.mutate(prog.id)}
                        title={prog.is_bookmarked ? 'Remove bookmark' : 'Save program'}
                        aria-label={prog.is_bookmarked ? 'Remove bookmark' : 'Save program'}
                        style={{
                          padding: '0.35rem',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: prog.is_bookmarked ? 'var(--accent-peach-bg)' : 'transparent',
                          color: prog.is_bookmarked ? 'var(--action-primary)' : 'var(--text-muted)',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        <Bookmark size={18} fill={prog.is_bookmarked ? 'currentColor' : 'none'} />
                      </button>
                    </div>

                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                      {prog.university_name}
                    </p>

                    <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-charcoal)', lineHeight: 1.3, marginBottom: '0.75rem' }}>
                      {prog.program_name}
                    </h2>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 600,
                          padding: '0.2rem 0.5rem',
                          borderRadius: 'var(--radius-pill)',
                          backgroundColor: '#E3F2FD',
                          color: '#1565C0',
                        }}
                      >
                        {prog.degree_level === 'bachelor' ? "Bachelor's" : "Master's"}
                      </span>

                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 600,
                          padding: '0.2rem 0.5rem',
                          borderRadius: 'var(--radius-pill)',
                          backgroundColor: '#EDE7F6',
                          color: '#5E35B1',
                        }}
                      >
                        {prog.teaching_language ? prog.teaching_language.toUpperCase() : 'ENGLISH'}
                      </span>

                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.5rem',
                          borderRadius: 'var(--radius-pill)',
                          backgroundColor: prog.annual_tuition_eur === 0 ? '#E8F5E9' : '#FFF3E0',
                          color: prog.annual_tuition_eur === 0 ? '#2E7D32' : '#E65100',
                        }}
                      >
                        {prog.annual_tuition_eur === 0 ? '€0 Tuition' : `€${prog.annual_tuition_eur}/yr`}
                      </span>
                    </div>

                    {prog.next_intake_deadline && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <Calendar size={13} aria-hidden="true" />
                        <span>Deadline: {prog.next_intake_deadline}</span>
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Portal: {prog.application_portal.split('/')[0]}
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
                      <span>Details</span>
                      <ArrowRight size={14} aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {data && data.total_pages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                disabled={pageParam <= 1}
                onClick={() => handlePageChange(pageParam - 1)}
                style={{
                  padding: '0.45rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: '#ffffff',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: pageParam <= 1 ? 'var(--text-muted)' : 'var(--text-charcoal)',
                  cursor: pageParam <= 1 ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                <ChevronLeft size={16} />
                <span>Previous</span>
              </button>

              <span style={{ fontSize: '0.8125rem', color: 'var(--text-charcoal)' }}>
                Page <strong>{data.page}</strong> of <strong>{data.total_pages}</strong>
              </span>

              <button
                type="button"
                disabled={pageParam >= data.total_pages}
                onClick={() => handlePageChange(pageParam + 1)}
                style={{
                  padding: '0.45rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: '#ffffff',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: pageParam >= data.total_pages ? 'var(--text-muted)' : 'var(--text-charcoal)',
                  cursor: pageParam >= data.total_pages ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Sheet */}
      {mobileFilterOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 110, display: 'flex', alignItems: 'flex-end' }}>
          <div
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(26,28,30,0.4)', backdropFilter: 'blur(2px)' }}
            onClick={() => setMobileFilterOpen(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Filter programs"
            style={{
              position: 'relative',
              width: '100%',
              maxHeight: '80vh',
              backgroundColor: '#ffffff',
              borderTopLeftRadius: 'var(--radius-card)',
              borderTopRightRadius: 'var(--radius-card)',
              boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              padding: '1.5rem',
              zIndex: 111,
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-charcoal)' }}>
                Filter Programs
              </h2>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                aria-label="Close filters"
                style={{ padding: '0.25rem', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {filterSidebar}

            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={handleResetFilters}
                style={{
                  flex: 1,
                  padding: '0.625rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'transparent',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                }}
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="btn-pill btn-pill-primary"
                style={{ flex: 1, padding: '0.625rem', fontSize: '0.875rem' }}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
