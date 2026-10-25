import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  ArrowRight,
  Shield,
  Calendar,
  X,
} from 'lucide-react';

export const ScholarshipsDiscoveryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const countryParam = searchParams.get('country') || 'all';
  const coverageParam = searchParams.get('coverage') || 'all';
  const searchParam = searchParams.get('search') || '';
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
            Destination
          </span>
          {(countryParam !== 'all' || coverageParam !== 'all' || searchParam) && (
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
          Funding Coverage
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {coverageTypes.map((t) => (
            <button
              key={t.code}
              type="button"
              onClick={() => updateParam('coverage', t.code)}
              style={{
                textAlign: 'left',
                padding: '0.4rem 0.6rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8125rem',
                fontWeight: coverageParam === t.code ? 600 : 500,
                color: coverageParam === t.code ? 'var(--action-primary)' : 'var(--text-charcoal)',
                backgroundColor: coverageParam === t.code ? 'var(--accent-peach-bg)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {t.label}
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
          aria-label="Scholarship filters"
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
                  Scholarships &amp; Grants
                </h1>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Verified government, regional, and institutional funding schemes for Pakistani students in Europe.
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
                {(countryParam !== 'all' || coverageParam !== 'all') && (
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--action-primary)' }} />
                )}
              </button>
            </div>
          </div>

          {/* Gated Access State for Visitors */}
          {data?.is_gated ? (
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 'var(--radius-card)',
                padding: '2.5rem 1.5rem',
                border: '1px solid var(--border-subtle)',
                textAlign: 'center',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--accent-peach-bg)',
                  color: 'var(--action-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                }}
              >
                <Shield size={24} aria-hidden="true" />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-charcoal, #1a1a1a)', marginBottom: '0.5rem' }}>
                Verified Scholarship Access Gated
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted, #636b78)', maxWidth: '520px', margin: '0 auto 1.5rem', lineHeight: 1.5 }}>
                Regional European scholarships and application window criteria are available to verified Explorer accounts. Sign up for free or sign in to browse authenticated funding opportunities.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Link
                  to="/sign-up?returnUrl=/scholarships"
                  id="scholarships-gated-signup-btn"
                  className="btn-pill btn-pill-primary"
                  style={{ padding: '0.625rem 1.25rem', fontSize: '0.875rem', fontWeight: 700 }}
                >
                  Create Free Account
                </Link>
                <Link
                  to="/sign-in?returnUrl=/scholarships"
                  id="scholarships-gated-signin-btn"
                  className="btn-pill btn-pill-outline"
                  style={{
                    padding: '0.625rem 1.25rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                  }}
                >
                  Sign In to Account
                </Link>
              </div>
            </div>
          ) : (
            <>
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
                      placeholder="Search scholarships by scheme title or provider..."
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
                      <span>Searching verified scholarships...</span>
                    ) : (
                      <span>
                        Showing <strong>{data?.total_count || 0}</strong> {data?.total_count === 1 ? 'scholarship' : 'scholarships'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Results Grid / List */}
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
                  description="No scholarship records match your active query. If you are an administrator, use Catalogue Imports to ingest verified scholarship records."
                  actionLabel={searchParam || countryParam !== 'all' ? 'Reset Filters' : undefined}
                  onAction={searchParam || countryParam !== 'all' ? handleResetFilters : undefined}
                />
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                  {data.items.map((sch) => (
                    <div
                      key={sch.id}
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
                            {sch.country_name || sch.country_code.toUpperCase()}
                          </span>

                          <span
                            style={{
                              fontSize: '0.6875rem',
                              fontWeight: 700,
                              padding: '0.2rem 0.5rem',
                              borderRadius: 'var(--radius-pill)',
                              backgroundColor: '#E8F5E9',
                              color: '#2E7D32',
                            }}
                          >
                            {sch.coverage_type || 'VERIFIED GRANT'}
                          </span>
                        </div>

                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                          {sch.provider || 'Regional Authority'}
                        </p>

                        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-charcoal)', lineHeight: 1.3, marginBottom: '0.75rem' }}>
                          {sch.name}
                        </h2>

                        {sch.annual_deadline_date && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                            <Calendar size={13} aria-hidden="true" />
                            <span>Deadline: {sch.annual_deadline_date}</span>
                          </div>
                        )}
                      </div>

                      <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {sch.stipend_amount_eur ? `Stipend: €${sch.stipend_amount_eur}/yr` : 'Full / Partial Coverage'}
                        </span>
                        <Link
                          to={`/scholarships/${sch.id}`}
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
                          <span>Criteria</span>
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
            </>
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
            aria-label="Filter scholarships"
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
                Filter Scholarships
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
