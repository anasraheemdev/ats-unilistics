import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { api } from '@/lib/api';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { FilterLockedDialog } from '@/components/domain/FilterLockedDialog';
import { ScholarshipCard } from '@/components/domain/ScholarshipCard';
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

export const ScholarshipsDiscoveryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const queryClient = useQueryClient();
  const isStudentWorkspace = location.pathname.startsWith('/student');

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

  // Genuine goals banner
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
  const coverageParam = searchParams.get('coverage') || 'all';
  const degreeLevelParam = searchParams.get('level') || 'all';
  const searchParam = searchParams.get('search') || '';
  const sortByParam = searchParams.get('sort') || 'name_asc';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(searchParam);

  const appliedFilterCount =
    (countryParam !== 'all' ? 1 : 0) +
    (coverageParam !== 'all' ? 1 : 0) +
    (degreeLevelParam !== 'all' ? 1 : 0) +
    (searchParam ? 1 : 0);

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

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [
      'discovery-scholarships',
      currentUserRole,
      countryParam,
      coverageParam,
      degreeLevelParam,
      searchParam,
      sortByParam,
      pageParam,
    ],
    queryFn: () =>
      api.scholarships.browse({
        country: countryParam === 'all' ? undefined : countryParam,
        coverageType: coverageParam === 'all' ? undefined : coverageParam,
        degreeLevel: degreeLevelParam === 'all' ? undefined : degreeLevelParam,
        search: searchParam || undefined,
        sortBy: sortByParam,
        page: pageParam,
        pageSize: 12,
      }),
  });

  const bookmarkMutation = useMutation({
    mutationFn: (scholarshipId: string) => api.bookmarks.toggle(scholarshipId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discovery-scholarships'] });
      queryClient.invalidateQueries({ queryKey: ['saved-scholarships'] });
    },
  });

  const countries = [
    { code: 'all', label: 'All Destinations' },
    { code: 'germany', label: 'Germany 🇩🇪' },
    { code: 'france', label: 'France 🇫🇷' },
    { code: 'italy', label: 'Italy 🇮🇹' },
    { code: 'romania', label: 'Romania 🇷🇴' },
  ];

  const coverageTypes = [
    { code: 'all', label: 'All Funding Models' },
    { code: 'full', label: 'Full Tuition & Living Stipend' },
    { code: 'tuition_only', label: 'Tuition Fee Waiver' },
    { code: 'partial', label: 'Partial Living Subsidy' },
    { code: 'merit', label: 'Merit Research Grant' },
  ];

  const degreeLevels = [
    { code: 'all', label: 'All Levels' },
    { code: 'bachelor', label: "Bachelor's Level" },
    { code: 'master', label: "Master's Level" },
    { code: 'phd', label: 'Doctoral / Research' },
  ];

  const renderFilterOption = (
    paramKey: string,
    currentValue: string,
    options: { code: string; label: string }[],
    sectionPrefix: string
  ) => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {options.map((opt) => {
          if (isVisitor) {
            return (
              <button
                key={opt.code}
                type="button"
                id={`filter-${sectionPrefix}-${opt.code}`}
                onClick={handleLockedFilterAction}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') handleLockedFilterAction(e);
                }}
                aria-haspopup="dialog"
                aria-label={`${opt.label} (Locked: Sign in or sign up to filter)`}
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
                <span>{opt.label}</span>
                <Lock size={12} style={{ color: 'var(--color-foreground-muted, #58695E)' }} aria-hidden="true" />
              </button>
            );
          }

          const isSelected = currentValue === opt.code;
          return (
            <button
              key={opt.code}
              type="button"
              onClick={() => updateParam(paramKey, opt.code)}
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
              {opt.label}
            </button>
          );
        })}
      </div>
    );
  };

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

          {!isVisitor && appliedFilterCount > 0 && (
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
        {renderFilterOption('country', countryParam, countries, 'country')}
      </div>

      {/* Funding Scope Section */}
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
            <span>Funding Scope</span>
            {isVisitor && <Lock size={12} aria-hidden="true" style={{ color: 'var(--action-primary, #245B42)' }} />}
          </span>
        </div>
        {renderFilterOption('coverage', coverageParam, coverageTypes, 'coverage')}
      </div>

      {/* Degree Level Section */}
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
            <span>Degree Level</span>
            {isVisitor && <Lock size={12} aria-hidden="true" style={{ color: 'var(--action-primary, #245B42)' }} />}
          </span>
        </div>
        {renderFilterOption('level', degreeLevelParam, degreeLevels, 'level')}
      </div>
    </div>
  );

  const startItem = data && data.total_count > 0 ? (pageParam - 1) * 12 + 1 : 0;
  const endItem = data ? Math.min(pageParam * 12, data.total_count) : 0;

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
                Target Corridors: {genuineGoals.destinations} • Scholarship tracking active
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
            Scholarships & Grants
          </h1>
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--color-foreground-muted, #58695E)',
              margin: '0.25rem 0 0',
              maxWidth: '680px',
            }}
          >
            Verified European government stipends, regional tuition waivers, and research grants for Pakistani students.
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
                color: 'var(--color-on-primary, #FFFFFF)',
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
          {data?.is_gated ? (
            <div
              style={{
                backgroundColor: 'var(--surface-card, #FFFFFF)',
                borderRadius: 'var(--radius-card, 24px)',
                padding: '2.5rem 2rem',
                border: '1px solid var(--border-subtle, #E1E8DE)',
                boxShadow: 'var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.07))',
                textAlign: 'center',
                maxWidth: '600px',
                margin: '2rem auto',
                width: '100%',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--surface-recessed, #EDF2E9)',
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
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: 'var(--color-foreground, #19261F)',
                  margin: '0 0 0.5rem',
                }}
              >
                Scholarship Directory
              </h2>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--color-foreground-muted, #58695E)',
                  lineHeight: 1.6,
                  margin: '0 0 1.5rem',
                }}
              >
                European regional scholarships and official application windows require an Explorer account. Sign up for free or sign in to browse authenticated funding opportunities.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Link
                  to="/sign-in?returnUrl=/scholarships"
                  id="scholarships-gated-signin-btn"
                  style={{
                    padding: '0.625rem 1.5rem',
                    borderRadius: 'var(--radius-pill, 9999px)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--color-foreground, #19261F)',
                    backgroundColor: 'var(--surface-card, #FFFFFF)',
                    border: '1px solid var(--border-subtle, #E1E8DE)',
                    textDecoration: 'none',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  Sign In to Account
                </Link>
                <Link
                  to="/sign-up?returnUrl=/scholarships"
                  id="scholarships-gated-signup-btn"
                  style={{
                    padding: '0.625rem 1.5rem',
                    borderRadius: 'var(--radius-pill, 9999px)',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: 'var(--color-on-primary, #FFFFFF)',
                    backgroundColor: 'var(--action-primary, #245B42)',
                    textDecoration: 'none',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  Create Free Account
                </Link>
              </div>
            </div>
          ) : (
            <>
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
                      placeholder="Search scholarships by scheme title or provider..."
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
                      color: 'var(--color-on-primary, #FFFFFF)',
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
                      <span>Searching verified scholarships...</span>
                    ) : data && data.total_count > 0 ? (
                      <span>
                        Showing <strong style={{ color: 'var(--color-foreground, #19261F)' }}>{startItem}–{endItem}</strong> of{' '}
                        <strong style={{ color: 'var(--color-foreground, #19261F)' }}>{data.total_count}</strong>{' '}
                        {data.total_count === 1 ? 'scholarship' : 'scholarships'}
                      </span>
                    ) : (
                      <span>No scholarships found</span>
                    )}
                  </div>

                  {/* Sort Dropdown */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <label htmlFor="sort-by-sch" style={{ fontWeight: 600, color: 'var(--color-foreground, #19261F)' }}>
                      Sort by:
                    </label>
                    <select
                      id="sort-by-sch"
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
                      <option value="name_asc">Scheme Name (A–Z)</option>
                      <option value="name_desc">Scheme Name (Z–A)</option>
                      <option value="amount_desc">Highest Funding Amount</option>
                      <option value="deadline_asc">Upcoming Deadline</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Active Filter Chips Row */}
              {appliedFilterCount > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-foreground-muted, #58695E)' }}>
                    Active filters:
                  </span>

                  {countryParam !== 'all' && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        padding: '0.25rem 0.75rem',
                        borderRadius: 'var(--radius-pill, 9999px)',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        backgroundColor: 'var(--surface-recessed, #EDF2E9)',
                        color: 'var(--color-foreground, #19261F)',
                        border: '1px solid var(--border-subtle, #E1E8DE)',
                      }}
                    >
                      <span>Country: {countries.find((c) => c.code === countryParam)?.label || countryParam}</span>
                      <button
                        type="button"
                        onClick={() => updateParam('country', 'all')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--color-foreground-muted, #58695E)' }}
                        aria-label="Remove country filter"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  )}

                  {coverageParam !== 'all' && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        padding: '0.25rem 0.75rem',
                        borderRadius: 'var(--radius-pill, 9999px)',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        backgroundColor: 'var(--surface-recessed, #EDF2E9)',
                        color: 'var(--color-foreground, #19261F)',
                        border: '1px solid var(--border-subtle, #E1E8DE)',
                      }}
                    >
                      <span>Funding: {coverageTypes.find((t) => t.code === coverageParam)?.label || coverageParam}</span>
                      <button
                        type="button"
                        onClick={() => updateParam('coverage', 'all')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--color-foreground-muted, #58695E)' }}
                        aria-label="Remove funding filter"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  )}

                  {degreeLevelParam !== 'all' && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        padding: '0.25rem 0.75rem',
                        borderRadius: 'var(--radius-pill, 9999px)',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        backgroundColor: 'var(--surface-recessed, #EDF2E9)',
                        color: 'var(--color-foreground, #19261F)',
                        border: '1px solid var(--border-subtle, #E1E8DE)',
                      }}
                    >
                      <span>Level: {degreeLevels.find((l) => l.code === degreeLevelParam)?.label || degreeLevelParam}</span>
                      <button
                        type="button"
                        onClick={() => updateParam('level', 'all')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--color-foreground-muted, #58695E)' }}
                        aria-label="Remove level filter"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  )}

                  {searchParam && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        padding: '0.25rem 0.75rem',
                        borderRadius: 'var(--radius-pill, 9999px)',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        backgroundColor: 'var(--surface-recessed, #EDF2E9)',
                        color: 'var(--color-foreground, #19261F)',
                        border: '1px solid var(--border-subtle, #E1E8DE)',
                      }}
                    >
                      <span>Search: &ldquo;{searchParam}&rdquo;</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSearchInput('');
                          updateParam('search', '');
                        }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--color-foreground-muted, #58695E)' }}
                        aria-label="Clear search"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={handleResetFilters}
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--action-primary, #245B42)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      marginLeft: '0.25rem',
                      textDecoration: 'underline',
                    }}
                  >
                    Clear all filters
                  </button>
                </div>
              )}

              {/* Results Grid */}
              {isLoading ? (
                <LoadingState message="Loading scholarship schemes..." minHeight="300px" />
              ) : error ? (
                <ErrorState
                  title="Unable to load scholarships"
                  message="A query error occurred while fetching funding opportunities. Please retry."
                  onRetry={() => refetch()}
                />
              ) : !data || data.items.length === 0 ? (
                <EmptyState
                  title="No scholarships found"
                  description="The catalogue currently does not have scholarship records matching your active filters. Please adjust your criteria."
                  actionLabel={appliedFilterCount > 0 ? 'Reset Filters' : undefined}
                  onAction={appliedFilterCount > 0 ? handleResetFilters : undefined}
                />
              ) : (
                <div className="catalogue-grid">
                  {data.items.map((sch) => {
                    const detailUrl = isStudentWorkspace
                      ? `/student/scholarships/${sch.id}`
                      : `/scholarships/${sch.id}`;

                    return (
                      <ScholarshipCard
                        key={sch.id}
                        scholarship={sch}
                        detailUrl={detailUrl}
                        onBookmarkToggle={isVisitor ? undefined : (id) => bookmarkMutation.mutate(id)}
                        isBookmarking={bookmarkMutation.isPending}
                      />
                    );
                  })}
                </div>
              )}

              {/* Pagination Controls */}
              {data && data.total_pages > 1 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    marginTop: '1.5rem',
                    paddingTop: '1.5rem',
                    borderTop: '1px solid var(--border-subtle, #E1E8DE)',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handlePageChange(pageParam - 1)}
                    disabled={pageParam <= 1}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.5rem 0.875rem',
                      borderRadius: 'var(--radius-pill, 9999px)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      border: '1px solid var(--border-subtle, #E1E8DE)',
                      backgroundColor: 'var(--surface-card, #FFFFFF)',
                      color: pageParam <= 1 ? 'var(--color-foreground-muted, #58695E)' : 'var(--color-foreground, #19261F)',
                      cursor: pageParam <= 1 ? 'not-allowed' : 'pointer',
                      opacity: pageParam <= 1 ? 0.6 : 1,
                    }}
                  >
                    <ChevronLeft size={16} />
                    <span>Previous</span>
                  </button>

                  <span style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted, #58695E)', padding: '0 0.5rem' }}>
                    Page <strong style={{ color: 'var(--color-foreground, #19261F)' }}>{pageParam}</strong> of {data.total_pages}
                  </span>

                  <button
                    type="button"
                    onClick={() => handlePageChange(pageParam + 1)}
                    disabled={pageParam >= data.total_pages}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.5rem 0.875rem',
                      borderRadius: 'var(--radius-pill, 9999px)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      border: '1px solid var(--border-subtle, #E1E8DE)',
                      backgroundColor: 'var(--surface-card, #FFFFFF)',
                      color: pageParam >= data.total_pages ? 'var(--color-foreground-muted, #58695E)' : 'var(--color-foreground, #19261F)',
                      cursor: pageParam >= data.total_pages ? 'not-allowed' : 'pointer',
                      opacity: pageParam >= data.total_pages ? 0.6 : 1,
                    }}
                  >
                    <span>Next</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Accessible Mobile Filter Drawer Dialog */}
      {mobileFilterOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
          }}
        >
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
                Filter Scholarships
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
                  color: 'var(--color-on-primary, #FFFFFF)',
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
        returnUrl="/scholarships"
      />
    </div>
  );
};

export default ScholarshipsDiscoveryPage;
