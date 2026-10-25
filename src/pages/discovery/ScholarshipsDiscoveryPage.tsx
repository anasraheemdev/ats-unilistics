import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  ArrowRight,
  X,
  Lock,
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

export const ScholarshipsDiscoveryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const countryParam = searchParams.get('country') || 'all';
  const coverageParam = searchParams.get('coverage') || 'all';
  const searchParam = searchParams.get('search') || '';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(searchParam);

  const appliedFilterCount = (countryParam !== 'all' ? 1 : 0) + (coverageParam !== 'all' ? 1 : 0);

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
    queryKey: ['discovery-scholarships', countryParam, coverageParam, searchParam, pageParam],
    queryFn: () =>
      api.scholarships.browse({
        country: countryParam,
        coverageType: coverageParam,
        search: searchParam,
        page: pageParam,
        pageSize: 10,
      }),
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
    { code: 'tuition_fee_waiver', label: 'Tuition Fee Waiver' },
    { code: 'monthly_stipend', label: 'Living Cost Stipend' },
    { code: 'full_ride', label: 'Full Scholarship (Tuition + Living)' },
  ];

  const filterSidebar = (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#55635a]">
            Destination
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

      <div className="border-t border-[#ebe6de] pt-5">
        <span className="block text-xs font-bold uppercase tracking-wider text-[#55635a] mb-3">
          Funding Model
        </span>
        <div className="flex flex-col gap-1.5">
          {coverageTypes.map((cv) => {
            const isSelected = coverageParam === cv.code;
            return (
              <button
                key={cv.code}
                type="button"
                onClick={() => updateParam('coverage', cv.code)}
                className={`text-left px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
                  isSelected
                    ? 'bg-[#B4D0B6]/40 text-[#133827] font-semibold'
                    : 'text-[#2b352f] hover:bg-[#F7F9F7]'
                }`}
              >
                {cv.label}
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
            Scholarships &amp; Grants
          </h1>
          <p className="text-sm text-[#55635a] mt-1">
            Explore verified government, regional, and institutional funding schemes across Europe.
          </p>
        </div>

        {/* Filter Toggle Action */}
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
          {data?.is_gated ? (
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#ebe6de] shadow-md text-center max-w-xl mx-auto w-full my-6">
              <div className="w-12 h-12 rounded-full bg-[#B4D0B6]/30 text-[#245B42] flex items-center justify-center mx-auto mb-4">
                <Lock size={22} aria-hidden="true" />
              </div>

              <h2 className="text-xl font-extrabold text-[#133827] mb-2">
                Verified Scholarship Directory
              </h2>
              <p className="text-sm text-[#55635a] mb-6 leading-relaxed">
                European regional scholarships and official application windows require a verified Explorer account. Sign up for free or sign in to browse authenticated funding opportunities.
              </p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <Link
                  to="/sign-in?returnUrl=/scholarships"
                  id="scholarships-gated-signin-btn"
                  className="px-6 py-2.5 rounded-full text-sm font-semibold text-[#133827] bg-white border border-[#ebe6de] hover:bg-[#F7F9F7] shadow-sm transition-all"
                >
                  Sign In to Account
                </Link>
                <Link
                  to="/sign-up?returnUrl=/scholarships"
                  id="scholarships-gated-signup-btn"
                  className="px-6 py-2.5 rounded-full text-sm font-bold text-white bg-[#245B42] hover:bg-[#1D4A36] shadow-sm transition-all"
                >
                  Create Free Account
                </Link>
              </div>
            </div>
          ) : (
            <>
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
                      placeholder="Search scholarships by scheme title or provider..."
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

                <div className="text-xs text-[#55635a] pt-4 mt-4 border-t border-[#ebe6de]">
                  {isLoading ? (
                    <span>Searching verified scholarships...</span>
                  ) : (
                    <span>
                      Showing <strong className="text-[#133827]">{data?.total_count || 0}</strong>{' '}
                      {data?.total_count === 1 ? 'scholarship' : 'scholarships'}
                    </span>
                  )}
                </div>
              </div>

              {/* Results Grid */}
              {isLoading ? (
                <LoadingState message="Loading verified scholarship records..." minHeight="300px" />
              ) : error ? (
                <ErrorState
                  title="Unable to load scholarships"
                  message="A query error occurred while fetching scholarship records. Please retry."
                  onRetry={() => refetch()}
                />
              ) : !data || data.items.length === 0 ? (
                <EmptyState
                  title="No scholarships found"
                  description="No scholarship records match your active query. Please adjust your criteria."
                  actionLabel={searchParam || countryParam !== 'all' ? 'Reset Filters' : undefined}
                  onAction={searchParam || countryParam !== 'all' ? handleResetFilters : undefined}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.items.map((sch) => {
                    const flag = getCountryFlag(sch.country_name || sch.country_code);

                    return (
                      <div
                        key={sch.id}
                        className="rounded-[24px] bg-white border border-[#ebe6de] p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all group"
                      >
                        <div>
                          {/* Badges */}
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#F7F9F7] text-[#133827] border border-[#ebe6de]">
                              {flag} {(sch.country_name || sch.country_code).toUpperCase()}
                            </span>

                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#B4D0B6]/40 text-[#133827]">
                              {sch.coverage_type ? sch.coverage_type.replace(/_/g, ' ').toUpperCase() : 'VERIFIED GRANT'}
                            </span>
                          </div>

                          <p className="text-xs font-semibold text-[#55635a] mb-1 line-clamp-1">
                            {sch.provider || 'European Authority'}
                          </p>

                          <h2 className="text-base font-bold text-[#133827] leading-snug mb-3 line-clamp-2">
                            {sch.name}
                          </h2>

                          {/* Two-Tone Summary Panel with Quiet Dividers */}
                          <div className="rounded-2xl bg-[#F7F9F7] p-3.5 mb-4 border border-[#ebe6de] space-y-2 text-xs">
                            <div className="flex items-center justify-between text-[#133827]">
                              <span className="text-[#55635a]">Funding Scope:</span>
                              <span className="font-semibold">
                                {sch.stipend_amount_eur ? `€${sch.stipend_amount_eur.toLocaleString()}/yr stipend` : 'Tuition waiver / Full grant'}
                              </span>
                            </div>
                            {sch.annual_deadline_date && (
                              <div className="flex items-center justify-between text-[#133827] pt-1.5 border-t border-[#ebe6de]">
                                <span className="text-[#55635a]">Window Deadline:</span>
                                <span className="font-semibold">{sch.annual_deadline_date}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1.5 text-[11px] text-[#55635a] pt-1.5 border-t border-[#ebe6de]">
                              <CheckCircle2 size={13} className="text-[#245B42] flex-shrink-0" aria-hidden="true" />
                              <span>Official European authority verification</span>
                            </div>
                          </div>
                        </div>

                        {/* Card Footer: Criteria Action */}
                        <div className="pt-3 border-t border-[#ebe6de] flex items-center justify-between">
                          <span className="text-xs text-[#55635a]">Funding Scheme</span>
                          <Link
                            to={`/scholarships/${sch.id}`}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#245B42] hover:underline"
                          >
                            <span>View criteria</span>
                            <ArrowRight size={14} aria-hidden="true" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
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
            </>
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
            aria-label="Filter scholarships"
            className="relative w-full max-h-[85vh] bg-white rounded-t-3xl shadow-2xl flex flex-col p-6 z-50 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#133827]">
                Filter Scholarships
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

export default ScholarshipsDiscoveryPage;
