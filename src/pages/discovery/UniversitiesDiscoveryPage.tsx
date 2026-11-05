import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '@/lib/api';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { FilterLockedDialog } from '@/components/domain/FilterLockedDialog';
import { UniversityCard } from '@/components/domain/UniversityCard';
import { UserRole } from '@/types';
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  X,
  Lock,
  Compass,
} from 'lucide-react';

export const UniversitiesDiscoveryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('visitor');

  const { data: currentUser } = useQuery({
    queryKey: ['discovery-auth-user'],
    queryFn: () => api.auth.getCurrentUser(),
  });

  useEffect(() => {
    if (currentUser?.role) {
      setCurrentUserRole(currentUser.role);
    }
  }, [currentUser]);

  const isVisitor = currentUserRole === 'visitor';

  // Check if genuine profile goals exist (for signed-in users with active case or goals)
  const genuineGoals =
    !isVisitor && currentUser && (currentUser as any).countryInterests?.length > 0
      ? {
          destinations: (currentUser as any).countryInterests
            .map((c: string) => c.charAt(0).toUpperCase() + c.slice(1))
            .join(', '),
        }
      : null;

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

  const appliedFilterCount = (countryParam !== 'all' ? 1 : 0) + (institutionTypeParam !== 'all' ? 1 : 0);

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
              color: 'var(--color-foreground-muted, #58695E)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <span>Destination Country</span>
            {isVisitor && <Lock size={12} aria-hidden="true" style={{ color: 'var(--action-primary, #245B42)' }} />}
          </span>

          {!isVisitor && (countryParam !== 'all' || institutionTypeParam !== 'all' || searchParam) && (
            <button
              type="button"
              onClick={handleResetFilters}
              style={{
                fontSize: '0.75rem',
                color: 'var(--action-primary, #245B42)',
                fontWeight: 600,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
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
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-control, 12px)',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    color: 'var(--color-foreground, #19261F)',
                    backgroundColor: 'transparent',
                    border: '1px solid transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'background-color 150ms ease',
                  }}
                >
                  <span>{c.label}</span>
                  <Lock size={12} style={{ color: 'var(--color-foreground-muted, #58695E)' }} aria-hidden="true" />
                </button>
              );
            }

            const isSelected = countryParam === c.code;
            return (
              <button
                key={c.code}
                type="button"
                onClick={() => updateParam('country', c.code)}
                style={{
                  textAlign: 'left',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-control, 12px)',
                  fontSize: '0.8125rem',
                  fontWeight: isSelected ? 700 : 500,
                  color: isSelected ? 'var(--action-primary, #245B42)' : 'var(--color-foreground, #19261F)',
                  backgroundColor: isSelected ? 'var(--surface-recessed, #EDF2E9)' : 'transparent',
                  border: isSelected ? '1px solid var(--border-subtle, #E1E8DE)' : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'background-color 150ms ease',
                }}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Institution Type Section */}
      <div style={{ borderTop: '1px solid var(--border-subtle, #E1E8DE)', paddingTop: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--color-foreground-muted, #58695E)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <span>Institution Type</span>
            {isVisitor && <Lock size={12} aria-hidden="true" style={{ color: 'var(--action-primary, #245B42)' }} />}
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
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-control, 12px)',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    color: 'var(--color-foreground, #19261F)',
                    backgroundColor: 'transparent',
                    border: '1px solid transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                  }}
                >
                  <span>{t.label}</span>
                  <Lock size={12} style={{ color: 'var(--color-foreground-muted, #58695E)' }} aria-hidden="true" />
                </button>
              );
            }

            const isSelected = institutionTypeParam === t.code;
            return (
              <button
                key={t.code}
                type="button"
                onClick={() => updateParam('type', t.code)}
                style={{
                  textAlign: 'left',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-control, 12px)',
                  fontSize: '0.8125rem',
                  fontWeight: isSelected ? 700 : 500,
                  color: isSelected ? 'var(--action-primary, #245B42)' : 'var(--color-foreground, #19261F)',
                  backgroundColor: isSelected ? 'var(--surface-recessed, #EDF2E9)' : 'transparent',
                  border: isSelected ? '1px solid var(--border-subtle, #E1E8DE)' : '1px solid transparent',
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
    <div
      style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '1.5rem 1rem 4rem',
        fontFamily: 'var(--font-family-base, "DM Sans", sans-serif)',
      }}
    >
      {/* 1. Context Banner for Genuine Explorer Profiles */}
      {genuineGoals && (
        <div
          style={{
            marginBottom: '1.5rem',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-control, 16px)',
            backgroundColor: 'var(--surface-recessed, #EDF2E9)',
            border: '1px solid var(--border-subtle, #E1E8DE)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <Compass size={20} style={{ color: 'var(--action-primary, #245B42)', flexShrink: 0 }} aria-hidden="true" />
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-foreground, #19261F)', margin: 0 }}>
                Active Profile Goal Focus
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted, #58695E)', margin: '2px 0 0' }}>
                Target Corridors: {genuineGoals.destinations} • Casework verification active
              </p>
            </div>
          </div>
          <Link
            to="/request-guidance"
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--action-primary, #245B42)',
              textDecoration: 'none',
              flexShrink: 0,
            }}
          >
            Manage Case &rarr;
          </Link>
        </div>
      )}

      {/* 2. Header & Title */}
      <div
        style={{
          marginBottom: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              color: 'var(--color-foreground, #19261F)',
              margin: 0,
            }}
          >
            European Universities
          </h1>
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--color-foreground-muted, #58695E)',
              margin: '0.25rem 0 0',
              maxWidth: '680px',
            }}
          >
            Explore verified public institutions across Germany, France, Italy, and Romania with direct admissions corridors.
          </p>
        </div>

        {/* Filter Toggle Action Button with Applied Filter Count Badge */}
        <button
          type="button"
          id="mobile-filter-drawer-btn"
          onClick={isVisitor ? handleLockedFilterAction : () => setMobileFilterOpen(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.625rem 1.125rem',
            borderRadius: 'var(--radius-pill, 9999px)',
            backgroundColor: 'var(--surface-card, #FFFFFF)',
            border: '1px solid var(--border-subtle, #E1E8DE)',
            boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.05))',
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: 'var(--color-foreground, #19261F)',
            cursor: 'pointer',
          }}
        >
          <SlidersHorizontal size={16} style={{ color: 'var(--action-primary, #245B42)' }} aria-hidden="true" />
          <span>Filters</span>
          {appliedFilterCount > 0 && (
            <span
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: 'var(--action-primary, #245B42)',
                color: '#FFFFFF',
                fontSize: '0.6875rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {appliedFilterCount}
            </span>
          )}
          {isVisitor && <Lock size={12} style={{ color: 'var(--action-primary, #245B42)' }} aria-hidden="true" />}
        </button>
      </div>

      {/* 3. Search and Results Layout */}
      <div className="catalogue-layout">
        {/* Desktop Sticky Filter Sidebar */}
        <aside
          className="desktop-only"
          style={{
            backgroundColor: 'var(--surface-card, #FFFFFF)',
            borderRadius: 'var(--radius-card, 20px)',
            padding: '1.5rem',
            border: '1px solid var(--border-subtle, #E1E8DE)',
            boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.05))',
            position: 'sticky',
            top: '5.5rem',
          }}
          aria-label="Catalogue filters"
        >
          {filterSidebar}
        </aside>

        {/* Main Content Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', minWidth: 0, flex: 1 }}>
          {/* Large Clear Search Bar */}
          <div
            style={{
              backgroundColor: 'var(--surface-card, #FFFFFF)',
              borderRadius: 'var(--radius-card, 20px)',
              padding: '1rem 1.25rem',
              border: '1px solid var(--border-subtle, #E1E8DE)',
              boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.05))',
            }}
          >
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', position: 'relative' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-foreground-muted, #58695E)',
                  }}
                  aria-hidden="true"
                />
                <input
                  type="text"
                  id="catalogue-search-input"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={
                    isVisitor
                      ? 'Search preview universities by name or city (e.g. Munich, Rome, Paris)...'
                      : 'Search by university name or city (e.g. Munich, Paris, Rome, Bucharest)...'
                  }
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    minHeight: '48px',
                    paddingLeft: '2.75rem',
                    paddingRight: '2.5rem',
                    borderRadius: 'var(--radius-pill, 9999px)',
                    fontSize: '0.875rem',
                    color: 'var(--color-foreground, #19261F)',
                    backgroundColor: 'var(--surface-recessed, #EDF2E9)',
                    border: '1px solid var(--border-subtle, #E1E8DE)',
                    outline: 'none',
                    fontFamily: 'inherit',
                  }}
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput('');
                      updateParam('search', '');
                    }}
                    style={{
                      position: 'absolute',
                      right: '0.875rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-foreground-muted, #58695E)',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                    aria-label="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <button
                type="submit"
                id="catalogue-search-submit-btn"
                style={{
                  padding: '0 1.5rem',
                  minHeight: '48px',
                  borderRadius: 'var(--radius-pill, 9999px)',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  backgroundColor: 'var(--action-primary, #245B42)',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                  flexShrink: 0,
                }}
              >
                Search
              </button>
            </form>

            {/* Readable Result & Sort Row */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                fontSize: '0.75rem',
                color: 'var(--color-foreground-muted, #58695E)',
                paddingTop: '0.875rem',
                marginTop: '0.875rem',
                borderTop: '1px solid var(--border-subtle, #E1E8DE)',
              }}
            >
              <div>
                {isLoading ? (
                  <span>Searching published universities...</span>
                ) : (
                  <span>
                    Showing <strong style={{ color: 'var(--color-foreground, #19261F)' }}>{data?.total_count || 0}</strong>{' '}
                    {data?.total_count === 1 ? 'university' : 'universities'}
                    {isVisitor && ' (Public preview cap: at most 50 institutions)'}
                  </span>
                )}
              </div>

              {/* Sort Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label htmlFor="sort-by" style={{ fontWeight: 600, color: 'var(--color-foreground, #19261F)' }}>
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
                      padding: '0.35rem 0.75rem',
                      fontSize: '0.75rem',
                      border: '1px solid var(--border-subtle, #E1E8DE)',
                      borderRadius: 'var(--radius-control, 8px)',
                      backgroundColor: 'var(--surface-card, #FFFFFF)',
                      color: 'var(--color-foreground, #19261F)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      cursor: 'pointer',
                    }}
                  >
                    <span>Name (A–Z)</span>
                    <Lock size={12} style={{ color: 'var(--action-primary, #245B42)' }} />
                  </button>
                ) : (
                  <select
                    id="sort-by"
                    value={sortByParam}
                    onChange={(e) => updateParam('sort', e.target.value)}
                    style={{
                      padding: '0.35rem 0.75rem',
                      fontSize: '0.75rem',
                      border: '1px solid var(--border-subtle, #E1E8DE)',
                      borderRadius: 'var(--radius-control, 8px)',
                      backgroundColor: 'var(--surface-card, #FFFFFF)',
                      color: 'var(--color-foreground, #19261F)',
                      outline: 'none',
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

          {/* Results Grid */}
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
              description="The higher education catalogue currently does not have university records matching your query. Please adjust your search terms."
              actionLabel={searchParam || countryParam !== 'all' ? 'Reset Filters' : undefined}
              onAction={searchParam || countryParam !== 'all' ? handleResetFilters : undefined}
            />
          ) : (
            <>
              {/* Responsive deliberate results grid */}
              <div className="catalogue-grid">
                {data.items.map((uni) => (
                  <UniversityCard key={uni.id} university={uni} />
                ))}
              </div>

              {/* Requirement: Signed-out Blurred Locked Silhouettes + Clear Action Panel */}
              {isVisitor && (
                <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {/* Generic blurred silhouettes (aria-hidden, generic placeholder bars) */}
                  <div
                    aria-hidden="true"
                    className="catalogue-grid"
                    style={{
                      filter: 'blur(3px)',
                      opacity: 0.45,
                      userSelect: 'none',
                      pointerEvents: 'none',
                    }}
                  >
                    {[1, 2, 3].map((idx) => (
                      <div
                        key={`locked-generic-card-${idx}`}
                        style={{
                          borderRadius: 'var(--radius-card, 20px)',
                          backgroundColor: 'var(--surface-card, #FFFFFF)',
                          border: '1px solid var(--border-subtle, #E1E8DE)',
                          padding: '1.25rem',
                          height: '240px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <div style={{ width: '60px', height: '16px', backgroundColor: '#E2E8F0', borderRadius: '9999px' }} />
                            <div style={{ width: '50px', height: '16px', backgroundColor: '#E2E8F0', borderRadius: '9999px' }} />
                          </div>
                          <div style={{ width: '80%', height: '18px', backgroundColor: '#CBD5E1', borderRadius: '4px', marginBottom: '0.5rem' }} />
                          <div style={{ width: '40%', height: '12px', backgroundColor: '#E2E8F0', borderRadius: '4px' }} />
                        </div>
                        <div style={{ padding: '0.75rem', backgroundColor: 'var(--surface-recessed, #EDF2E9)', borderRadius: '12px' }}>
                          <div style={{ width: '100%', height: '10px', backgroundColor: '#E2E8F0', borderRadius: '4px', marginBottom: '0.35rem' }} />
                          <div style={{ width: '70%', height: '10px', backgroundColor: '#E2E8F0', borderRadius: '4px' }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Clean Locked Action Panel */}
                  <div
                    style={{
                      borderRadius: 'var(--radius-card, 24px)',
                      backgroundColor: 'var(--surface-card, #FFFFFF)',
                      border: '1px solid var(--border-subtle, #E1E8DE)',
                      boxShadow: 'var(--shadow-md, 0 4px 16px rgba(0, 0, 0, 0.06))',
                      padding: '2.5rem 1.5rem',
                      textAlign: 'center',
                      maxWidth: '560px',
                      margin: '0 auto',
                      width: '100%',
                      boxSizing: 'border-box',
                    }}
                  >
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(180, 208, 182, 0.3)',
                        color: 'var(--action-primary, #245B42)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem',
                      }}
                    >
                      <Lock size={22} aria-hidden="true" />
                    </div>

                    <h2
                      id="locked-panel-title"
                      style={{
                        fontSize: '1.25rem',
                        fontWeight: 800,
                        color: 'var(--color-foreground, #19261F)',
                        margin: '0 0 0.5rem',
                      }}
                    >
                      Unlock the Full European Catalogue
                    </h2>

                    <p
                      style={{
                        fontSize: '0.875rem',
                        color: 'var(--color-foreground-muted, #58695E)',
                        margin: '0 0 1.5rem',
                        lineHeight: 1.5,
                      }}
                    >
                      Sign in or create a free Explorer account to access all verified university records across Germany, France, Italy, and Romania and activate destination filters.
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <Link
                        to="/sign-in?returnUrl=/universities"
                        id="locked-panel-signin-btn"
                        style={{
                          padding: '0.625rem 1.5rem',
                          borderRadius: 'var(--radius-pill, 9999px)',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: 'var(--color-foreground, #19261F)',
                          backgroundColor: 'var(--surface-card, #FFFFFF)',
                          border: '1px solid var(--border-subtle, #E1E8DE)',
                          textDecoration: 'none',
                        }}
                      >
                        Sign in
                      </Link>
                      <Link
                        to="/sign-up?returnUrl=/universities"
                        id="locked-panel-signup-btn"
                        style={{
                          padding: '0.625rem 1.5rem',
                          borderRadius: 'var(--radius-pill, 9999px)',
                          fontSize: '0.875rem',
                          fontWeight: 700,
                          color: '#FFFFFF',
                          backgroundColor: 'var(--action-primary, #245B42)',
                          textDecoration: 'none',
                          boxShadow: 'var(--shadow-sm)',
                        }}
                      >
                        Create Free Account
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Pagination Controls */}
          {data && data.total_pages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                disabled={pageParam <= 1}
                onClick={() => handlePageChange(pageParam - 1)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-control, 12px)',
                  border: '1px solid var(--border-subtle, #E1E8DE)',
                  backgroundColor: 'var(--surface-card, #FFFFFF)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  cursor: pageParam <= 1 ? 'not-allowed' : 'pointer',
                  opacity: pageParam <= 1 ? 0.5 : 1,
                  color: 'var(--color-foreground, #19261F)',
                }}
              >
                <ChevronLeft size={16} />
                <span>Previous</span>
              </button>

              <span style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted, #58695E)' }}>
                Page <strong style={{ color: 'var(--color-foreground, #19261F)' }}>{data.page}</strong> of{' '}
                <strong style={{ color: 'var(--color-foreground, #19261F)' }}>{data.total_pages}</strong>
              </span>

              <button
                type="button"
                disabled={pageParam >= data.total_pages}
                onClick={() => handlePageChange(pageParam + 1)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-control, 12px)',
                  border: '1px solid var(--border-subtle, #E1E8DE)',
                  backgroundColor: 'var(--surface-card, #FFFFFF)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  cursor: pageParam >= data.total_pages ? 'not-allowed' : 'pointer',
                  opacity: pageParam >= data.total_pages ? 0.5 : 1,
                  color: 'var(--color-foreground, #19261F)',
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
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'flex-end' }}>
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(13, 21, 17, 0.72)',
              backdropFilter: 'blur(4px)',
            }}
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
              maxHeight: '85vh',
              backgroundColor: 'var(--surface-card, #FFFFFF)',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              boxShadow: 'var(--shadow-floating)',
              display: 'flex',
              flexDirection: 'column',
              padding: '1.5rem',
              zIndex: 101,
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-foreground, #19261F)', margin: 0 }}>
                Filter Universities
              </h2>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                aria-label="Close filters"
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '0.35rem',
                  color: 'var(--color-foreground-muted, #58695E)',
                  cursor: 'pointer',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {filterSidebar}

            <div
              style={{
                marginTop: '1.5rem',
                paddingTop: '1rem',
                borderTop: '1px solid var(--border-subtle, #E1E8DE)',
                display: 'flex',
                gap: '0.75rem',
              }}
            >
              <button
                type="button"
                onClick={handleResetFilters}
                style={{
                  flex: 1,
                  padding: '0.625rem',
                  borderRadius: 'var(--radius-pill, 9999px)',
                  border: '1px solid var(--border-subtle, #E1E8DE)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--color-foreground, #19261F)',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                }}
              >
                Reset All
              </button>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                style={{
                  flex: 1,
                  padding: '0.625rem',
                  borderRadius: 'var(--radius-pill, 9999px)',
                  backgroundColor: 'var(--action-primary, #245B42)',
                  color: '#FFFFFF',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                }}
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

export default UniversitiesDiscoveryPage;
