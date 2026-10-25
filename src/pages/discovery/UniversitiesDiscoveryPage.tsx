import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '@/lib/api';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { FilterLockedDialog } from '@/components/domain/FilterLockedDialog';
import { UserRole } from '@/types';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  X,
  MapPin,
  Lock,
} from 'lucide-react';

export const UniversitiesDiscoveryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('visitor');

  useEffect(() => {
    api.auth.getCurrentUser().then((u) => {
      if (u?.role) {
        setCurrentUserRole(u.role);
      }
    });
  }, []);

  const isVisitor = currentUserRole === 'visitor';

  // Locked Filter Modal State
  const [isLockedDialogOpen, setIsLockedDialogOpen] = useState(false);
  const [initiatingEl, setInitiatingEl] = useState<HTMLElement | null>(null);

  const handleLockedFilterAction = (e: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => {
    e.preventDefault();
    setInitiatingEl(e.currentTarget);
    setIsLockedDialogOpen(true);
  };

  const countryParam = searchParams.get('country') || 'all';
  const institutionTypeParam = searchParams.get('type') || 'all';
  const searchParam = searchParams.get('search') || '';
  const sortByParam = searchParams.get('sort') || 'name_asc';
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

  // Block filter URL bypasses for visitors:
  // If visitor, ignore country and institutionType params so URL manipulation cannot exceed the preview set.
  const effectiveCountry = isVisitor ? undefined : countryParam;
  const effectiveType = isVisitor ? undefined : institutionTypeParam;
  const effectiveSort = isVisitor ? 'name_asc' : sortByParam;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['discovery-universities', currentUserRole, effectiveCountry, effectiveType, searchParam, effectiveSort, pageParam],
    queryFn: () =>
      api.universities.browse({
        country: effectiveCountry,
        institutionType: effectiveType,
        search: searchParam,
        sortBy: effectiveSort,
        page: pageParam,
        pageSize: 12,
      }),
  });

  const countries = [
    { code: 'all', label: 'All Destinations' },
    { code: 'germany', label: 'Germany 🇩🇪' },
    { code: 'france', label: 'France 🇫🇷' },
    { code: 'italy', label: 'Italy 🇮🇹' },
    { code: 'romania', label: 'Romania 🇷🇴' },
  ];

  const institutionTypes = [
    { code: 'all', label: 'All Types' },
    { code: 'public', label: 'Public Institutions' },
    { code: 'private', label: 'Private Institutions' },
  ];

  const filterSidebar = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Destination Country Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--text-muted, #636b78)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <span>Destination Country</span>
            {isVisitor && <Lock size={12} aria-hidden="true" style={{ color: 'var(--action-primary, #b72301)' }} />}
          </span>

          {!isVisitor && (countryParam !== 'all' || institutionTypeParam !== 'all' || searchParam) && (
            <button
              type="button"
              onClick={handleResetFilters}
              style={{
                fontSize: '0.75rem',
                color: 'var(--action-primary, #b72301)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Reset All
            </button>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {countries.map((c) => {
            if (isVisitor) {
              return (
                <button
                  key={c.code}
                  type="button"
                  id={`filter-country-${c.code}`}
                  onClick={handleLockedFilterAction}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') handleLockedFilterAction(e);
                  }}
                  aria-haspopup="dialog"
                  aria-label={`${c.label} (Locked: Sign in or sign up to filter)`}
                  style={{
                    textAlign: 'left',
                    padding: '0.45rem 0.65rem',
                    borderRadius: 'var(--radius-sm, 6px)',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    color: 'var(--text-charcoal, #1a1a1a)',
                    backgroundColor: 'transparent',
                    border: '1px solid transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>{c.label}</span>
                  <Lock size={12} style={{ color: 'var(--text-muted, #636b78)' }} aria-hidden="true" />
                </button>
              );
            }

            return (
              <button
                key={c.code}
                type="button"
                onClick={() => updateParam('country', c.code)}
                style={{
                  textAlign: 'left',
                  padding: '0.45rem 0.65rem',
                  borderRadius: 'var(--radius-sm, 6px)',
                  fontSize: '0.8125rem',
                  fontWeight: countryParam === c.code ? 600 : 500,
                  color: countryParam === c.code ? 'var(--action-primary, #b72301)' : 'var(--text-charcoal, #1a1a1a)',
                  backgroundColor: countryParam === c.code ? 'var(--accent-peach-bg, #fff5f2)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Institution Type Section */}
      <div style={{ borderTop: '1px solid var(--border-subtle, #ebe6de)', paddingTop: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--text-muted, #636b78)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <span>Institution Type</span>
            {isVisitor && <Lock size={12} aria-hidden="true" style={{ color: 'var(--action-primary, #b72301)' }} />}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {institutionTypes.map((t) => {
            if (isVisitor) {
              return (
                <button
                  key={t.code}
                  type="button"
                  id={`filter-type-${t.code}`}
                  onClick={handleLockedFilterAction}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') handleLockedFilterAction(e);
                  }}
                  aria-haspopup="dialog"
                  aria-label={`${t.label} (Locked: Sign in or sign up to filter)`}
                  style={{
                    textAlign: 'left',
                    padding: '0.45rem 0.65rem',
                    borderRadius: 'var(--radius-sm, 6px)',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    color: 'var(--text-charcoal, #1a1a1a)',
                    backgroundColor: 'transparent',
                    border: '1px solid transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>{t.label}</span>
                  <Lock size={12} style={{ color: 'var(--text-muted, #636b78)' }} aria-hidden="true" />
                </button>
              );
            }

            return (
              <button
                key={t.code}
                type="button"
                onClick={() => updateParam('type', t.code)}
                style={{
                  textAlign: 'left',
                  padding: '0.45rem 0.65rem',
                  borderRadius: 'var(--radius-sm, 6px)',
                  fontSize: '0.8125rem',
                  fontWeight: institutionTypeParam === t.code ? 600 : 500,
                  color: institutionTypeParam === t.code ? 'var(--action-primary, #b72301)' : 'var(--text-charcoal, #1a1a1a)',
                  backgroundColor: institutionTypeParam === t.code ? 'var(--accent-peach-bg, #fff5f2)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {t.label}
              </button>
            );
          })}
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
            borderRadius: 'var(--radius-card, 16px)',
            padding: '1.25rem',
            border: '1px solid var(--border-subtle, #ebe6de)',
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
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-charcoal, #1a1a1a)', margin: 0 }}>
                  European Universities
                </h1>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted, #636b78)', marginTop: '0.25rem', margin: 0 }}>
                  Explore verified institutions across Germany, France, Italy, and Romania with direct admissions corridors.
                </p>
              </div>

              {/* Mobile Filter Toggle */}
              <button
                type="button"
                id="mobile-filter-drawer-btn"
                onClick={() => setMobileFilterOpen(true)}
                className="md:hidden"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.5rem 0.875rem',
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border-subtle, #ebe6de)',
                  borderRadius: 'var(--radius-sm, 6px)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--text-charcoal, #1a1a1a)',
                  cursor: 'pointer',
                }}
              >
                <Filter size={16} />
                <span>Filters</span>
                {isVisitor ? (
                  <Lock size={12} style={{ color: 'var(--action-primary, #b72301)' }} />
                ) : (
                  (countryParam !== 'all' || institutionTypeParam !== 'all') && (
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--action-primary, #b72301)' }} />
                  )
                )}
              </button>
            </div>
          </div>

          {/* Search Bar & Controls Bar */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-card, 16px)',
              padding: '1rem',
              border: '1px solid var(--border-subtle, #ebe6de)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search
                  size={18}
                  style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted, #636b78)' }}
                  aria-hidden="true"
                />
                <input
                  type="text"
                  id="catalogue-search-input"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={
                    isVisitor
                      ? 'Search preview institutions by name or city (e.g. Munich, Rome, Paris)...'
                      : 'Search by university name or city (e.g. Munich, Paris, Rome, Bucharest)...'
                  }
                  style={{
                    width: '100%',
                    padding: '0.625rem 1rem 0.625rem 2.5rem',
                    fontSize: '0.875rem',
                    border: '1px solid var(--border-subtle, #ebe6de)',
                    borderRadius: 'var(--radius-sm, 6px)',
                    outline: 'none',
                    backgroundColor: 'var(--surface-canvas, #fdfbf7)',
                  }}
                />
              </div>
              <button
                type="submit"
                id="catalogue-search-submit-btn"
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
                color: 'var(--text-muted, #636b78)',
                borderTop: '1px solid var(--border-subtle, #ebe6de)',
                paddingTop: '0.75rem',
              }}
            >
              <div>
                {isLoading ? (
                  <span>Searching published universities...</span>
                ) : (
                  <span>
                    Showing <strong>{data?.total_count || 0}</strong> {data?.total_count === 1 ? 'university' : 'universities'}
                    {isVisitor && ' (Public preview cap: at most 50 institutions)'}
                  </span>
                )}
              </div>

              {/* Sort Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative' }}>
                <label htmlFor="sort-by" style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                  Sort by:
                </label>
                {isVisitor ? (
                  <button
                    type="button"
                    id="sort-by-locked-btn"
                    onClick={handleLockedFilterAction}
                    aria-haspopup="dialog"
                    aria-label="Sort options locked. Sign in or sign up required."
                    style={{
                      padding: '0.3rem 0.6rem',
                      fontSize: '0.8125rem',
                      border: '1px solid var(--border-subtle, #ebe6de)',
                      borderRadius: 'var(--radius-sm, 6px)',
                      backgroundColor: '#ffffff',
                      color: 'var(--text-charcoal, #1a1a1a)',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <span>Name (A–Z)</span>
                    <Lock size={12} style={{ color: 'var(--action-primary, #b72301)' }} />
                  </button>
                ) : (
                  <select
                    id="sort-by"
                    value={sortByParam}
                    onChange={(e) => updateParam('sort', e.target.value)}
                    style={{
                      padding: '0.3rem 0.5rem',
                      fontSize: '0.8125rem',
                      border: '1px solid var(--border-subtle, #ebe6de)',
                      borderRadius: 'var(--radius-sm, 6px)',
                      backgroundColor: '#ffffff',
                      color: 'var(--text-charcoal, #1a1a1a)',
                    }}
                  >
                    <option value="name_asc">Name (A–Z)</option>
                    <option value="name_desc">Name (Z–A)</option>
                    <option value="city_asc">City (A–Z)</option>
                  </select>
                )}
              </div>
            </div>
          </div>

          {/* Results Grid / List */}
          {isLoading ? (
            <LoadingState message="Loading verified institutions..." minHeight="300px" />
          ) : error ? (
            <ErrorState
              title="Unable to load universities"
              message="A query error occurred while fetching university catalogue records. Please retry."
              onRetry={() => refetch()}
            />
          ) : !data || data.items.length === 0 ? (
            <EmptyState
              title="No published universities found"
              description="The higher education catalogue currently does not have university records matching your query. If you are an administrator, use Catalogue Imports in the operations workspace to ingest verified institution records."
              actionLabel={searchParam || countryParam !== 'all' ? 'Reset Filters' : undefined}
              onAction={searchParam || countryParam !== 'all' ? handleResetFilters : undefined}
            />
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {data.items.map((uni) => (
                  <div
                    key={uni.id}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: 'var(--radius-card, 16px)',
                      border: '1px solid var(--border-subtle, #ebe6de)',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: 'var(--shadow-card, 0 2px 8px rgba(0,0,0,0.03))',
                      transition: 'border-color var(--transition-fast), transform var(--transition-fast)',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            padding: '0.2rem 0.5rem',
                            borderRadius: 'var(--radius-pill, 9999px)',
                            backgroundColor: 'var(--surface-recessed, #f3efe9)',
                            color: 'var(--text-charcoal, #1a1a1a)',
                          }}
                        >
                          {uni.country_name || uni.country_code.toUpperCase()}
                        </span>

                        <span
                          style={{
                            fontSize: '0.6875rem',
                            fontWeight: 600,
                            padding: '0.2rem 0.5rem',
                            borderRadius: 'var(--radius-pill, 9999px)',
                            backgroundColor: uni.institution_type === 'public' ? '#E8F5E9' : '#EDE7F6',
                            color: uni.institution_type === 'public' ? '#2E7D32' : '#5E35B1',
                          }}
                        >
                          {uni.institution_type ? uni.institution_type.toUpperCase() : 'UNKNOWN'}
                        </span>
                      </div>

                      <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-charcoal, #1a1a1a)', lineHeight: 1.3, margin: '0 0 0.25rem 0' }}>
                        {uni.name}
                      </h2>

                      {uni.native_name && (
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted, #636b78)', fontStyle: 'italic', margin: '0 0 0.5rem 0' }}>
                          {uni.native_name}
                        </p>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-muted, #636b78)' }}>
                        <MapPin size={14} aria-hidden="true" />
                        <span>{uni.city}</span>
                      </div>
                    </div>

                    <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle, #ebe6de)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #636b78)' }}>
                        {uni.total_programs_count ? `${uni.total_programs_count} programs published` : 'View programs'}
                      </span>
                      <Link
                        to={`/universities/${uni.id}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          color: 'var(--action-primary, #b72301)',
                          textDecoration: 'none',
                        }}
                      >
                        <span>Explore</span>
                        <ArrowRight size={14} aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Requirement 3: Signed-out Blurred Locked Silhouettes + Clear Action Panel */}
              {isVisitor && (
                <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {/* Small group of generic blurred silhouettes (aria-hidden, generic placeholder bars) */}
                  <div
                    aria-hidden="true"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                      gap: '1rem',
                      filter: 'blur(3px)',
                      opacity: 0.55,
                      userSelect: 'none',
                      pointerEvents: 'none',
                    }}
                  >
                    {[1, 2, 3].map((idx) => (
                      <div
                        key={`locked-generic-card-${idx}`}
                        style={{
                          backgroundColor: '#ffffff',
                          borderRadius: 'var(--radius-card, 16px)',
                          border: '1px solid var(--border-subtle, #ebe6de)',
                          padding: '1.25rem',
                          height: '180px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <div style={{ width: '64px', height: '14px', backgroundColor: '#e2e8f0', borderRadius: '4px' }} />
                            <div style={{ width: '48px', height: '14px', backgroundColor: '#e2e8f0', borderRadius: '4px' }} />
                          </div>
                          <div style={{ width: '80%', height: '18px', backgroundColor: '#cbd5e1', borderRadius: '4px', marginBottom: '0.5rem' }} />
                          <div style={{ width: '45%', height: '14px', backgroundColor: '#e2e8f0', borderRadius: '4px' }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                          <div style={{ width: '70px', height: '12px', backgroundColor: '#e2e8f0', borderRadius: '4px' }} />
                          <div style={{ width: '50px', height: '12px', backgroundColor: '#e2e8f0', borderRadius: '4px' }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Clear Panel */}
                  <div
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: 'var(--radius-card, 16px)',
                      border: '1px solid var(--border-subtle, #ebe6de)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                      padding: '2.5rem 1.5rem',
                      textAlign: 'center',
                      maxWidth: '560px',
                      margin: '0 auto',
                      width: '100%',
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
                        margin: '0 auto 1rem',
                      }}
                      aria-hidden="true"
                    >
                      <Lock size={24} />
                    </div>

                    <h2
                      id="locked-panel-title"
                      style={{
                        fontSize: '1.25rem',
                        fontWeight: 800,
                        color: 'var(--text-charcoal, #1a1a1a)',
                        margin: '0 0 0.5rem 0',
                      }}
                    >
                      Explore more universities
                    </h2>

                    <p
                      style={{
                        fontSize: '0.9375rem',
                        color: 'var(--text-muted, #636b78)',
                        margin: '0 0 1.5rem 0',
                        lineHeight: 1.5,
                      }}
                    >
                      Sign in or create an account to view the full catalogue and use filters.
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <Link
                        to="/sign-in?returnUrl=/universities"
                        id="locked-panel-signin-btn"
                        className="btn-pill btn-pill-outline"
                        style={{ padding: '0.625rem 1.5rem', fontSize: '0.875rem', fontWeight: 700 }}
                      >
                        Sign in
                      </Link>
                      <Link
                        to="/sign-up?returnUrl=/universities"
                        id="locked-panel-signup-btn"
                        className="btn-pill btn-pill-primary"
                        style={{ padding: '0.625rem 1.5rem', fontSize: '0.875rem', fontWeight: 700 }}
                      >
                        Sign up
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Pagination Controls (for authenticated explorers or multiple preview pages) */}
          {data && data.total_pages > 1 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                marginTop: '1.5rem',
              }}
            >
              <button
                type="button"
                disabled={pageParam <= 1}
                onClick={() => handlePageChange(pageParam - 1)}
                style={{
                  padding: '0.45rem 0.75rem',
                  borderRadius: 'var(--radius-sm, 6px)',
                  border: '1px solid var(--border-subtle, #ebe6de)',
                  backgroundColor: '#ffffff',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: pageParam <= 1 ? 'var(--text-muted, #636b78)' : 'var(--text-charcoal, #1a1a1a)',
                  cursor: pageParam <= 1 ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                <ChevronLeft size={16} />
                <span>Previous</span>
              </button>

              <span style={{ fontSize: '0.8125rem', color: 'var(--text-charcoal, #1a1a1a)' }}>
                Page <strong>{data.page}</strong> of <strong>{data.total_pages}</strong>
              </span>

              <button
                type="button"
                disabled={pageParam >= data.total_pages}
                onClick={() => handlePageChange(pageParam + 1)}
                style={{
                  padding: '0.45rem 0.75rem',
                  borderRadius: 'var(--radius-sm, 6px)',
                  border: '1px solid var(--border-subtle, #ebe6de)',
                  backgroundColor: '#ffffff',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: pageParam >= data.total_pages ? 'var(--text-muted, #636b78)' : 'var(--text-charcoal, #1a1a1a)',
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
            aria-label="Catalogue filter options"
            style={{
              position: 'relative',
              width: '100%',
              maxHeight: '80vh',
              backgroundColor: '#ffffff',
              borderTopLeftRadius: 'var(--radius-card, 16px)',
              borderTopRightRadius: 'var(--radius-card, 16px)',
              boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              padding: '1.5rem',
              zIndex: 111,
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-charcoal, #1a1a1a)', margin: 0 }}>
                Filter Universities
              </h2>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                aria-label="Close filters"
                style={{ padding: '0.25rem', color: 'var(--text-muted, #636b78)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {filterSidebar}

            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle, #ebe6de)', display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={handleResetFilters}
                style={{
                  flex: 1,
                  padding: '0.625rem',
                  borderRadius: 'var(--radius-sm, 6px)',
                  border: '1px solid var(--border-subtle, #ebe6de)',
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
                {isVisitor ? 'Close' : 'Apply Filters'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Accessible Filter Locked Dialog */}
      <FilterLockedDialog
        isOpen={isLockedDialogOpen}
        onClose={() => setIsLockedDialogOpen(false)}
        initiatingElement={initiatingEl}
        returnUrl="/universities"
      />
    </div>
  );
};
