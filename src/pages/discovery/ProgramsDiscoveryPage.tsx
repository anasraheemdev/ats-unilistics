import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '@/lib/api';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  ArrowRight,
  X,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

function getCountryFlag(country: string): string {
  const c = country.toLowerCase();
  if (c === 'germany' || c === 'de') return '🇩🇪';
  if (c === 'france' || c === 'fr') return '🇫🇷';
  if (c === 'italy' || c === 'it') return '🇮🇹';
  if (c === 'romania' || c === 'ro') return '🇷🇴';
  return '🇪🇺';
}

function getTuitionText(tuitionEur?: number | null, tuitionType?: string): string {
  if (tuitionEur === 0 || tuitionType === 'free') {
    return '€0 (State Funded)';
  }
  if (tuitionEur != null && tuitionEur > 0) {
    return `€${tuitionEur.toLocaleString()}/yr`;
  }
  if (tuitionType === 'subsidized') {
    return 'State Subsidized (< €1,000)';
  }
  return 'Tuition not published';
}

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

  const appliedFilterCount =
    (countryParam !== 'all' ? 1 : 0) +
    (degreeLevelParam !== 'all' ? 1 : 0) +
    (languageParam !== 'all' ? 1 : 0) +
    (tuitionTypeParam !== 'all' ? 1 : 0);

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
    <div className="flex flex-col gap-6">
      {/* Destination Country */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#55635a]">
            Destination Country
          </span>
          {appliedFilterCount > 0 && (
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

      {/* Degree Level */}
      <div className="border-t border-[#ebe6de] pt-5">
        <span className="block text-xs font-bold uppercase tracking-wider text-[#55635a] mb-3">
          Degree Level
        </span>
        <div className="flex flex-col gap-1.5">
          {degreeLevels.map((l) => {
            const isSelected = degreeLevelParam === l.code;
            return (
              <button
                key={l.code}
                type="button"
                onClick={() => updateParam('level', l.code)}
                className={`text-left px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
                  isSelected
                    ? 'bg-[#B4D0B6]/40 text-[#133827] font-semibold'
                    : 'text-[#2b352f] hover:bg-[#F7F9F7]'
                }`}
              >
                {l.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Teaching Language */}
      <div className="border-t border-[#ebe6de] pt-5">
        <span className="block text-xs font-bold uppercase tracking-wider text-[#55635a] mb-3">
          Teaching Language
        </span>
        <div className="flex flex-col gap-1.5">
          {languages.map((lg) => {
            const isSelected = languageParam === lg.code;
            return (
              <button
                key={lg.code}
                type="button"
                onClick={() => updateParam('lang', lg.code)}
                className={`text-left px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
                  isSelected
                    ? 'bg-[#B4D0B6]/40 text-[#133827] font-semibold'
                    : 'text-[#2b352f] hover:bg-[#F7F9F7]'
                }`}
              >
                {lg.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tuition Rate */}
      <div className="border-t border-[#ebe6de] pt-5">
        <span className="block text-xs font-bold uppercase tracking-wider text-[#55635a] mb-3">
          Tuition Rate
        </span>
        <div className="flex flex-col gap-1.5">
          {tuitionTypes.map((tt) => {
            const isSelected = tuitionTypeParam === tt.code;
            return (
              <button
                key={tt.code}
                type="button"
                onClick={() => updateParam('tuition', tt.code)}
                className={`text-left px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
                  isSelected
                    ? 'bg-[#B4D0B6]/40 text-[#133827] font-semibold'
                    : 'text-[#2b352f] hover:bg-[#F7F9F7]'
                }`}
              >
                {tt.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-16">
      {/* Header & Title */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#133827]">
            Degree Programs
          </h1>
          <p className="text-sm text-[#55635a] mt-1">
            Browse verified Bachelor’s and Master’s curriculums with language requirements, admission portals, and tuition benchmarks.
          </p>
        </div>

        {/* Mobile Filter Toggle */}
        <button
          type="button"
          onClick={() => setMobileFilterOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-[#ebe6de] shadow-sm text-xs sm:text-sm font-semibold text-[#133827] hover:bg-[#F7F9F7] active:scale-95 transition-all self-start sm:self-auto"
        >
          <SlidersHorizontal size={16} className="text-[#245B42]" aria-hidden="true" />
          <span>Filters</span>
          {appliedFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-[#245B42] text-white text-[11px] font-bold flex items-center justify-center">
              {appliedFilterCount}
            </span>
          )}
        </button>
      </div>

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
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search program by title, discipline, or university..."
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
                className="px-6 py-3 rounded-full text-sm font-semibold text-white bg-[#245B42] hover:bg-[#1D4A36] shadow-sm transition-all"
              >
                Search
              </button>
            </form>

            {/* Result Count and Sort Row */}
            <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-[#55635a] pt-4 mt-4 border-t border-[#ebe6de]">
              <div>
                {isLoading ? (
                  <span>Searching published degree programs...</span>
                ) : (
                  <span>
                    Showing <strong className="text-[#133827]">{data?.total_count || 0}</strong>{' '}
                    {data?.total_count === 1 ? 'program' : 'programs'}
                    {data?.is_preview_restricted && ' (Visitor preview cap active)'}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="sort-by-prog" className="font-medium text-[#2b352f]">
                  Sort by:
                </label>
                <select
                  id="sort-by-prog"
                  value={sortByParam}
                  onChange={(e) => updateParam('sort', e.target.value)}
                  className="px-3 py-1.5 text-xs border border-[#ebe6de] rounded-lg bg-white text-[#133827] outline-none focus:ring-1 focus:ring-[#245B42]"
                >
                  <option value="title_asc">Title (A–Z)</option>
                  <option value="title_desc">Title (Z–A)</option>
                  <option value="tuition_asc">Tuition (Low to High)</option>
                  <option value="tuition_desc">Tuition (High to Low)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Grid */}
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
              description="The catalogue currently does not have degree program records matching your active filters. Please adjust your criteria."
              actionLabel={searchParam || countryParam !== 'all' || degreeLevelParam !== 'all' ? 'Reset Filters' : undefined}
              onAction={searchParam || countryParam !== 'all' || degreeLevelParam !== 'all' ? handleResetFilters : undefined}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.items.map((prog) => {
                const flag = getCountryFlag(prog.country_name || prog.country_code);
                const tuitionStr = getTuitionText(prog.annual_tuition_eur, prog.tuition_type);
                const isFree = prog.annual_tuition_eur === 0 || prog.tuition_type === 'free';

                return (
                  <div
                    key={prog.id}
                    className="rounded-[24px] bg-white border border-[#ebe6de] p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all group"
                  >
                    <div>
                      {/* Top Badges & Bookmark */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#F7F9F7] text-[#133827] border border-[#ebe6de]">
                          {flag} {(prog.country_name || prog.country_code).toUpperCase()}
                        </span>

                        <button
                          type="button"
                          onClick={() => bookmarkMutation.mutate(prog.id)}
                          title={prog.is_bookmarked ? 'Remove bookmark' : 'Save program'}
                          aria-label={prog.is_bookmarked ? 'Remove bookmark' : 'Save program'}
                          className={`p-2 rounded-full border transition-colors ${
                            prog.is_bookmarked
                              ? 'bg-[#B4D0B6]/40 text-[#245B42] border-[#B4D0B6]'
                              : 'bg-transparent text-[#8a9890] hover:text-[#133827] border-transparent hover:border-[#ebe6de]'
                          }`}
                        >
                          <Bookmark size={16} fill={prog.is_bookmarked ? 'currentColor' : 'none'} />
                        </button>
                      </div>

                      {/* University Name */}
                      <p className="text-xs font-semibold text-[#55635a] mb-1 line-clamp-1">
                        {prog.university_name}
                      </p>

                      {/* Program Title */}
                      <h2 className="text-base font-bold text-[#133827] leading-snug mb-3 line-clamp-2">
                        {prog.program_name}
                      </h2>

                      {/* Attribute Pills */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#B4D0B6]/30 text-[#133827]">
                          {prog.degree_level === 'bachelor' ? "Bachelor's" : "Master's"}
                        </span>
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#D7EE83]/30 text-[#133827]">
                          {prog.teaching_language ? prog.teaching_language.toUpperCase() : 'ENGLISH'}
                        </span>
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                            isFree
                              ? 'bg-[#E8F5E9] text-[#245B42]'
                              : 'bg-[#F7F9F7] text-[#133827] border border-[#ebe6de]'
                          }`}
                        >
                          {tuitionStr}
                        </span>
                      </div>

                      {/* Two-Tone Programme Summary Panel with Quiet Dividers */}
                      <div className="rounded-2xl bg-[#F7F9F7] p-3.5 mb-4 border border-[#ebe6de] space-y-2 text-xs">
                        {prog.next_intake_deadline && (
                          <div className="flex items-center gap-1.5 text-[#55635a]">
                            <Calendar size={13} className="text-[#245B42] flex-shrink-0" aria-hidden="true" />
                            <span>Deadline: <strong>{prog.next_intake_deadline}</strong></span>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-[#55635a] pt-1.5 border-t border-[#ebe6de]">
                          <span>Portal Protocol:</span>
                          <span className="font-semibold text-[#133827]">
                            {prog.application_portal.split('/')[0]}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-[#55635a] pt-1.5 border-t border-[#ebe6de]">
                          <CheckCircle2 size={13} className="text-[#245B42] flex-shrink-0" aria-hidden="true" />
                          <span>Prerequisites verified against university regulations</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer: Details Action */}
                    <div className="pt-3 border-t border-[#ebe6de] flex items-center justify-between">
                      <span className="text-xs text-[#55635a]">Curriculum Record</span>
                      <Link
                        to={`/programs/${prog.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#245B42] hover:underline"
                      >
                        <span>View program</span>
                        <ArrowRight size={14} aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
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
            aria-label="Filter degree programs"
            className="relative w-full max-h-[85vh] bg-white rounded-t-3xl shadow-2xl flex flex-col p-6 z-50 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#133827]">
                Filter Programs
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
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgramsDiscoveryPage;
