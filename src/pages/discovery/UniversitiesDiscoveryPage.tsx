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
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  X,
  MapPin,
  Lock,
  CheckCircle2,
  Compass,
} from 'lucide-react';

function getInitials(name: string): string {
  if (!name) return 'UN';
  const parts = name.replace(/University|of|the|and|de|di|für|und|Universitatea|din/gi, '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return name.slice(0, 2).toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function getCountryDisplay(codeOrName: string): { name: string; flag: string } {
  const c = (codeOrName || '').toLowerCase();
  if (c === 'germany' || c === 'de') return { name: 'Germany', flag: '🇩🇪' };
  if (c === 'france' || c === 'fr') return { name: 'France', flag: '🇫🇷' };
  if (c === 'italy' || c === 'it') return { name: 'Italy', flag: '🇮🇹' };
  if (c === 'romania' || c === 'ro') return { name: 'Romania', flag: '🇷🇴' };
  return { name: codeOrName, flag: '🇪🇺' };
}

function getTuitionDisclosure(institutionType?: string): string {
  if (institutionType?.toLowerCase() === 'public') {
    return 'Free tuition / Semester fee only (~€250–€350/sem)';
  }
  if (institutionType?.toLowerCase() === 'private') {
    return 'Accredited non-EU private tuition';
  }
  return 'Tuition not published';
}

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
  const genuineGoals = !isVisitor && currentUser && (currentUser as any).countryInterests?.length > 0
    ? {
        destinations: (currentUser as any).countryInterests.map((c: string) => c.charAt(0).toUpperCase() + c.slice(1)).join(', '),
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
    <div className="flex flex-col gap-6">
      {/* Destination Country Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#55635a] flex items-center gap-1.5">
            <span>Destination Country</span>
            {isVisitor && <Lock size={12} aria-hidden="true" className="text-[#245B42]" />}
          </span>

          {!isVisitor && (countryParam !== 'all' || institutionTypeParam !== 'all' || searchParam) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs text-[#245B42] hover:underline font-semibold"
            >
              Reset All
            </button>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
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
                  className="text-left px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-[#2b352f] hover:bg-[#F7F9F7] flex items-center justify-between transition-colors"
                >
                  <span>{c.label}</span>
                  <Lock size={12} className="text-[#8a9890]" aria-hidden="true" />
                </button>
              );
            }

            const isSelected = countryParam === c.code;
            return (
              <button
                key={c.code}
                type="button"
                onClick={() => updateParam('country', c.code)}
                className={`text-left px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
                  isSelected
                    ? 'bg-[#B4D0B6]/40 text-[#133827] font-semibold'
                    : 'text-[#2b352f] hover:bg-[#F7F9F7]'
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Institution Type Section */}
      <div className="border-t border-[#ebe6de] pt-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#55635a] flex items-center gap-1.5">
            <span>Institution Type</span>
            {isVisitor && <Lock size={12} aria-hidden="true" className="text-[#245B42]" />}
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
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
                  className="text-left px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-[#2b352f] hover:bg-[#F7F9F7] flex items-center justify-between transition-colors"
                >
                  <span>{t.label}</span>
                  <Lock size={12} className="text-[#8a9890]" aria-hidden="true" />
                </button>
              );
            }

            const isSelected = institutionTypeParam === t.code;
            return (
              <button
                key={t.code}
                type="button"
                onClick={() => updateParam('type', t.code)}
                className={`text-left px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
                  isSelected
                    ? 'bg-[#B4D0B6]/40 text-[#133827] font-semibold'
                    : 'text-[#2b352f] hover:bg-[#F7F9F7]'
                }`}
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
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-16">
      {/* 1. Contextual Profile Goal Strip (Rendered ONLY if genuine user profile goals exist) */}
      {genuineGoals && (
        <div className="mb-6 p-4 rounded-2xl bg-[#B4D0B6]/25 border border-[#B4D0B6] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Compass size={20} className="text-[#245B42] flex-shrink-0" aria-hidden="true" />
            <div>
              <p className="text-xs font-bold text-[#133827]">Active Profile Goal Focus</p>
              <p className="text-xs text-[#2b352f]">
                Target Corridors: {genuineGoals.destinations} • Casework verification active
              </p>
            </div>
          </div>
          <Link
            to="/request-support"
            className="text-xs font-bold text-[#245B42] hover:underline flex-shrink-0"
          >
            Manage Case &rarr;
          </Link>
        </div>
      )}

      {/* 2. Header & Title */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#133827]">
            European Universities
          </h1>
          <p className="text-sm text-[#55635a] mt-1">
            Explore verified public institutions across Germany, France, Italy, and Romania with direct admissions corridors.
          </p>
        </div>

        {/* Filter Toggle Action Button with Applied Filter Count Badge */}
        <button
          type="button"
          id="mobile-filter-drawer-btn"
          onClick={isVisitor ? handleLockedFilterAction : () => setMobileFilterOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-[#ebe6de] shadow-sm text-xs sm:text-sm font-semibold text-[#133827] hover:bg-[#F7F9F7] active:scale-95 transition-all self-start sm:self-auto"
        >
          <SlidersHorizontal size={16} className="text-[#245B42]" aria-hidden="true" />
          <span>Filters</span>
          {appliedFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-[#245B42] text-white text-[11px] font-bold flex items-center justify-center">
              {appliedFilterCount}
            </span>
          )}
          {isVisitor && <Lock size={12} className="text-[#245B42]" aria-hidden="true" />}
        </button>
      </div>

      {/* 3. Search and Results Layout */}
      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6 items-start">
        {/* Desktop Sticky Filter Sidebar */}
        <aside
          className="hidden md:block bg-white rounded-3xl p-6 border border-[#ebe6de] shadow-sm sticky top-24"
          aria-label="Catalogue filters"
        >
          {filterSidebar}
        </aside>

        {/* Main Content Area */}
        <div className="flex flex-col gap-5 min-w-0">
          {/* Large Clear Search Bar */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#ebe6de] shadow-sm">
            <form onSubmit={handleSearchSubmit} className="flex gap-2 relative">
              <div className="relative flex-1">
                <Search
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8a9890]"
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
                  className="w-full pl-12 pr-10 py-3 rounded-full text-sm text-[#1a1a1a] placeholder:text-[#8a9890] bg-[#F7F9F7] border border-[#ebe6de] outline-none focus:bg-white focus:ring-2 focus:ring-[#245B42] transition-all"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput('');
                      updateParam('search', '');
                    }}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8a9890] hover:text-[#133827]"
                    aria-label="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <button
                type="submit"
                id="catalogue-search-submit-btn"
                className="px-6 py-3 rounded-full text-sm font-semibold text-white bg-[#245B42] hover:bg-[#1D4A36] shadow-sm transition-all"
              >
                Search
              </button>
            </form>

            {/* Readable Result & Sort Row */}
            <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-[#55635a] pt-4 mt-4 border-t border-[#ebe6de]">
              <div>
                {isLoading ? (
                  <span>Searching published universities...</span>
                ) : (
                  <span>
                    Showing <strong className="text-[#133827]">{data?.total_count || 0}</strong>{' '}
                    {data?.total_count === 1 ? 'university' : 'universities'}
                    {isVisitor && ' (Public preview cap: at most 50 institutions)'}
                  </span>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <label htmlFor="sort-by" className="font-medium text-[#2b352f]">
                  Sort by:
                </label>
                {isVisitor ? (
                  <button
                    type="button"
                    id="sort-by-locked-btn"
                    onClick={handleLockedFilterAction}
                    aria-haspopup="dialog"
                    aria-label="Sort options locked. Sign in or sign up required."
                    className="px-3 py-1.5 text-xs border border-[#ebe6de] rounded-lg bg-white text-[#133827] flex items-center gap-1.5"
                  >
                    <span>Name (A–Z)</span>
                    <Lock size={12} className="text-[#245B42]" />
                  </button>
                ) : (
                  <select
                    id="sort-by"
                    value={sortByParam}
                    onChange={(e) => updateParam('sort', e.target.value)}
                    className="px-3 py-1.5 text-xs border border-[#ebe6de] rounded-lg bg-white text-[#133827] outline-none focus:ring-1 focus:ring-[#245B42]"
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.items.map((uni) => {
                  const countryInfo = getCountryDisplay(uni.country_name || uni.country_code);
                  const initials = getInitials(uni.name);
                  const isPublic = (uni.institution_type || '').toLowerCase() === 'public';
                  const tuitionText = getTuitionDisclosure(uni.institution_type);

                  return (
                    <div
                      key={uni.id}
                      className="rounded-[24px] bg-white border border-[#ebe6de] p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all group"
                    >
                      <div>
                        {/* Badges Row */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#F7F9F7] text-[#133827] border border-[#ebe6de]">
                            {countryInfo.flag} {countryInfo.name}
                          </span>
                          <span
                            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                              isPublic
                                ? 'bg-[#B4D0B6]/40 text-[#133827]'
                                : 'bg-[#EDE7F6] text-[#5E35B1]'
                            }`}
                          >
                            {uni.institution_type ? uni.institution_type.toUpperCase() : 'INSTITUTION'}
                          </span>
                        </div>

                        {/* Title and Identity Row */}
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-11 h-11 rounded-2xl bg-[#F7F9F7] border border-[#ebe6de] flex items-center justify-center font-extrabold text-sm text-[#245B42] flex-shrink-0 group-hover:bg-[#B4D0B6]/30 transition-colors">
                            {initials}
                          </div>
                          <div>
                            <h2 className="text-base font-bold text-[#133827] leading-snug line-clamp-2">
                              {uni.name}
                            </h2>
                            {uni.native_name && (
                              <p className="text-xs text-[#55635a] italic mt-0.5 line-clamp-1">
                                {uni.native_name}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Location */}
                        <div className="flex items-center gap-1.5 text-xs text-[#55635a] mb-4">
                          <MapPin size={14} className="text-[#245B42] flex-shrink-0" aria-hidden="true" />
                          <span>{uni.city}, {countryInfo.name}</span>
                        </div>

                        {/* Two-Tone Programme-Summary Panel with Quiet Dividers */}
                        <div className="rounded-2xl bg-[#F7F9F7] p-3.5 mb-4 border border-[#ebe6de] space-y-2 text-xs">
                          <div className="flex items-center justify-between text-[#133827]">
                            <span className="text-[#55635a]">Curriculums:</span>
                            <span className="font-semibold">
                              {uni.total_programs_count ? `${uni.total_programs_count} programs indexed` : 'Published programs'}
                            </span>
                          </div>
                          <div className="border-t border-[#ebe6de] pt-2 flex items-center justify-between text-[#133827]">
                            <span className="text-[#55635a]">Tuition Scope:</span>
                            <span className="font-semibold text-right line-clamp-1" title={tuitionText}>
                              {tuitionText}
                            </span>
                          </div>
                          <div className="border-t border-[#ebe6de] pt-2 flex items-center gap-1.5 text-[11px] text-[#55635a]">
                            <CheckCircle2 size={13} className="text-[#245B42] flex-shrink-0" aria-hidden="true" />
                            <span>Verified against Ministry gazette</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer: View University Action */}
                      <div className="pt-3 border-t border-[#ebe6de] flex items-center justify-between">
                        <span className="text-xs text-[#55635a]">Corridor Profile</span>
                        <Link
                          to={`/universities/${uni.id}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#245B42] hover:underline"
                        >
                          <span>View university</span>
                          <ArrowRight size={14} aria-hidden="true" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Requirement: Signed-out Blurred Locked Silhouettes + Clear Action Panel */}
              {isVisitor && (
                <div className="mt-10 flex flex-col gap-6">
                  {/* Generic blurred silhouettes (aria-hidden, generic placeholder bars) */}
                  <div
                    aria-hidden="true"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 blur-[3px] opacity-50 select-none pointer-events-none"
                  >
                    {[1, 2, 3].map((idx) => (
                      <div
                        key={`locked-generic-card-${idx}`}
                        className="rounded-[24px] bg-white border border-[#ebe6de] p-5 h-56 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex justify-between mb-3">
                            <div className="w-16 h-4 bg-[#e2e8f0] rounded-full" />
                            <div className="w-12 h-4 bg-[#e2e8f0] rounded-full" />
                          </div>
                          <div className="w-4/5 h-5 bg-[#cbd5e1] rounded mb-2" />
                          <div className="w-2/5 h-3 bg-[#e2e8f0] rounded" />
                        </div>
                        <div className="p-3 bg-[#F7F9F7] rounded-xl border border-[#ebe6de]">
                          <div className="w-full h-3 bg-[#e2e8f0] rounded mb-1.5" />
                          <div className="w-3/4 h-3 bg-[#e2e8f0] rounded" />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Clean Locked Action Panel */}
                  <div className="rounded-3xl bg-white border border-[#ebe6de] shadow-lg p-8 sm:p-10 text-center max-w-xl mx-auto w-full">
                    <div className="w-12 h-12 rounded-full bg-[#B4D0B6]/30 text-[#245B42] flex items-center justify-center mx-auto mb-4">
                      <Lock size={22} aria-hidden="true" />
                    </div>

                    <h2
                      id="locked-panel-title"
                      className="text-xl font-extrabold text-[#133827] mb-2"
                    >
                      Unlock the Full European Catalogue
                    </h2>

                    <p className="text-sm text-[#55635a] mb-6 leading-relaxed">
                      Sign in or create a free Explorer account to access all verified university records across Germany, France, Italy, and Romania and activate destination filters.
                    </p>

                    <div className="flex items-center justify-center gap-3 flex-wrap">
                      <Link
                        to="/sign-in?returnUrl=/universities"
                        id="locked-panel-signin-btn"
                        className="px-6 py-2.5 rounded-full text-sm font-semibold text-[#133827] bg-white border border-[#ebe6de] hover:bg-[#F7F9F7] shadow-sm transition-all"
                      >
                        Sign in
                      </Link>
                      <Link
                        to="/sign-up?returnUrl=/universities"
                        id="locked-panel-signup-btn"
                        className="px-6 py-2.5 rounded-full text-sm font-bold text-white bg-[#245B42] hover:bg-[#1D4A36] shadow-sm transition-all"
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
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                type="button"
                disabled={pageParam <= 1}
                onClick={() => handlePageChange(pageParam - 1)}
                className={`px-4 py-2 rounded-xl border border-[#ebe6de] bg-white text-xs font-semibold flex items-center gap-1.5 ${
                  pageParam <= 1
                    ? 'text-[#8a9890] cursor-not-allowed'
                    : 'text-[#133827] hover:bg-[#F7F9F7]'
                }`}
              >
                <ChevronLeft size={16} />
                <span>Previous</span>
              </button>

              <span className="text-xs text-[#2b352f]">
                Page <strong className="text-[#133827]">{data.page}</strong> of{' '}
                <strong className="text-[#133827]">{data.total_pages}</strong>
              </span>

              <button
                type="button"
                disabled={pageParam >= data.total_pages}
                onClick={() => handlePageChange(pageParam + 1)}
                className={`px-4 py-2 rounded-xl border border-[#ebe6de] bg-white text-xs font-semibold flex items-center gap-1.5 ${
                  pageParam >= data.total_pages
                    ? 'text-[#8a9890] cursor-not-allowed'
                    : 'text-[#133827] hover:bg-[#F7F9F7]'
                }`}
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
        <div className="fixed inset-0 z-50 flex items-end">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileFilterOpen(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Catalogue filter options"
            className="relative w-full max-h-[85vh] bg-white rounded-t-3xl shadow-2xl flex flex-col p-6 z-50 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#133827]">
                Filter Universities
              </h2>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                aria-label="Close filters"
                className="p-1.5 text-[#55635a] hover:text-[#133827]"
              >
                <X size={20} />
              </button>
            </div>

            {filterSidebar}

            <div className="mt-6 pt-4 border-t border-[#ebe6de] flex gap-3">
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex-1 py-2.5 rounded-full border border-[#ebe6de] text-xs font-semibold text-[#133827]"
              >
                Reset All
              </button>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-2.5 rounded-full bg-[#245B42] text-white text-xs font-bold"
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
