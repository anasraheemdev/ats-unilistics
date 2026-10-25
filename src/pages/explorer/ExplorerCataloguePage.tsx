import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import {
  Bookmark,
  GraduationCap,
  Award,
  CheckCircle2,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

export const ExplorerCataloguePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const activeTab = (searchParams.get('tab') as 'programs' | 'scholarships') || 'programs';
  const setActiveTab = (tab: 'programs' | 'scholarships') => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', tab);
      return next;
    });
  };

  const [country, setCountry] = useState('all');
  const [degreeLevel, setDegreeLevel] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('title_asc');
  const [progPage, setProgPage] = useState(1);
  const [schPage, setSchPage] = useState(1);

  // 1. Academic Programs Server-Side Paginated Query
  const {
    data: programsResult,
    isLoading: progsLoading,
    error: progsError,
    refetch: refetchPrograms,
  } = useQuery({
    queryKey: ['explorer-programs', country, degreeLevel, search, sortBy, progPage],
    queryFn: () =>
      api.programs.browse({
        country,
        degreeLevel,
        search,
        sortBy,
        page: progPage,
        pageSize: 10,
      }),
  });

  // 2. Verified Regional Scholarships Server-Side Paginated Query (Gated)
  const {
    data: scholarshipsResult,
    isLoading: schLoading,
    error: schError,
    refetch: refetchScholarships,
  } = useQuery({
    queryKey: ['explorer-scholarships', country, search, schPage],
    queryFn: () =>
      api.scholarships.browse({
        country,
        search,
        page: schPage,
        pageSize: 10,
      }),
  });

  // Bookmark mutation with TanStack Query optimistic update
  const bookmarkMutation = useMutation({
    mutationFn: (progId: string) => api.bookmarks.toggle(progId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['explorer-programs'] });
      queryClient.invalidateQueries({ queryKey: ['saved-programs'] });
    },
  });

  const handleToggleBookmark = (progId: string) => {
    bookmarkMutation.mutate(progId);
  };

  const handleResetFilters = () => {
    setCountry('all');
    setDegreeLevel('all');
    setSearch('');
    setSortBy('title_asc');
    setProgPage(1);
    setSchPage(1);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Editorial Header matching screen(2).png */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: '9999px',
              backgroundColor: '#FFEFEA',
              color: '#B72301',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            2026/2027 Admissions Directory
          </span>
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted)' }}>
            • Verified European Higher Education
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--color-foreground)', margin: 0 }}>
              Explore European Academics & Verified Scholarships
            </h1>
            <p style={{ color: 'var(--color-foreground-muted)', fontSize: '1rem', marginTop: '0.375rem', maxWidth: '720px' }}>
              Search accredited universities across Germany, France, Italy, and Romania with verified entry prerequisites and deadlines.
            </p>
          </div>

          <Link to="/explorer/request-support" style={{ textDecoration: 'none' }}>
            <button
              type="button"
              className="btn-pill-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '10px 22px',
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              <Sparkles size={16} /> Request 1-on-1 Support
            </button>
          </Link>
        </div>

        {/* Big Search Input with pill styling matching screen(2).png */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#FFFFFF',
            borderRadius: '9999px',
            padding: '6px 8px 6px 18px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            border: '1px solid #EBE6DE',
            gap: '0.75rem',
          }}
        >
          <Search size={20} style={{ color: 'var(--color-foreground-muted)', flexShrink: 0 }} />
          <input
            type="text"
            value={search}
            maxLength={100}
            onChange={(e) => {
              setSearch(e.target.value.slice(0, 100));
              setProgPage(1);
              setSchPage(1);
            }}
            placeholder="Search universities, master programs, scholarships (e.g. Data Engineering, Mechanical, Informatics)..."
            style={{
              flex: 1,
              border: 'none',
              backgroundColor: 'transparent',
              fontSize: '0.9375rem',
              outline: 'none',
              color: 'var(--color-foreground)',
            }}
          />

          <button
            type="button"
            className="btn-pill-primary"
            style={{
              padding: '8px 22px',
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            Search Explorer
          </button>
        </div>

        {/* Destination Quick Filter Pills matching screen(2).png */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-foreground-muted)', marginRight: '0.25rem' }}>
            Destinations:
          </span>
          {[
            { id: 'all', label: 'All Countries' },
            { id: 'germany', label: '🇩🇪 Germany' },
            { id: 'france', label: '🇫🇷 France' },
            { id: 'italy', label: '🇮🇹 Italy' },
            { id: 'romania', label: '🇷🇴 Romania' },
          ].map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setCountry(c.id);
                setProgPage(1);
                setSchPage(1);
              }}
              style={{
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: 'none',
                backgroundColor: country === c.id ? '#1A1A1A' : '#FFFFFF',
                color: country === c.id ? '#FFFFFF' : 'var(--color-foreground-muted)',
                boxShadow: country === c.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'inset 0 0 0 1px #EBE6DE',
                transition: 'all 0.15s ease',
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs: Academic Programs vs Regional Scholarships */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #EBE6DE', paddingBottom: '0.5rem' }}>
        <button
          type="button"
          onClick={() => setActiveTab('programs')}
          style={{
            padding: '8px 18px',
            fontWeight: 700,
            fontSize: '0.9375rem',
            borderRadius: '9999px',
            backgroundColor: activeTab === 'programs' ? '#FFEFEA' : 'transparent',
            color: activeTab === 'programs' ? '#B72301' : 'var(--color-foreground-muted)',
            border: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
          }}
        >
          <GraduationCap size={18} />
          Academic Programs ({programsResult?.total_count ?? '...'})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('scholarships')}
          style={{
            padding: '8px 18px',
            fontWeight: 700,
            fontSize: '0.9375rem',
            borderRadius: '9999px',
            backgroundColor: activeTab === 'scholarships' ? '#FFEFEA' : 'transparent',
            color: activeTab === 'scholarships' ? '#B72301' : 'var(--color-foreground-muted)',
            border: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
          }}
        >
          <Award size={18} />
          Regional Scholarships ({scholarshipsResult?.total_count ?? '...'})
        </button>
      </div>

      {/* 2-Column Responsive Layout (Filter Sidebar + Grid of Programs) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(240px, 280px) minmax(0, 1fr)',
          gap: '2rem',
          alignItems: 'start',
        }}
        className="catalogue-grid-responsive"
      >
        {/* Left Filter Sidebar matching screen(2).png */}
        <div
          className="bento-card"
          style={{
            padding: '1.5rem',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            position: 'sticky',
            top: '5.5rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={16} /> Filter By
            </h3>
            <button
              type="button"
              onClick={handleResetFilters}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#B72301',
                cursor: 'pointer',
              }}
            >
              Reset All
            </button>
          </div>

          {/* Degree Level Filter */}
          <div>
            <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>
              Degree Level
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {[
                { id: 'all', label: 'All Levels' },
                { id: 'master', label: "Master's (Postgraduate)" },
                { id: 'bachelor', label: "Bachelor's (Undergraduate)" },
                { id: 'preparatory', label: 'Preparatory / Language' },
              ].map((lvl) => (
                <label
                  key={lvl.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                    color: degreeLevel === lvl.id ? 'var(--color-foreground)' : 'var(--color-foreground-muted)',
                    fontWeight: degreeLevel === lvl.id ? 700 : 400,
                  }}
                >
                  <input
                    type="radio"
                    name="degree_level"
                    value={lvl.id}
                    checked={degreeLevel === lvl.id}
                    onChange={() => {
                      setDegreeLevel(lvl.id);
                      setProgPage(1);
                    }}
                  />
                  <span>{lvl.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Sort By Filter */}
          <div>
            <label htmlFor="sort-by-select" style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.375rem' }}>
              Sort Order
            </label>
            <select
              id="sort-by-select"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setProgPage(1);
              }}
              style={{
                width: '100%',
                padding: '6px 10px',
                borderRadius: '8px',
                border: '1px solid #EBE6DE',
                fontSize: '0.8125rem',
                backgroundColor: '#F9F6F0',
              }}
            >
              <option value="title_asc">Title: A to Z</option>
              <option value="title_desc">Title: Z to A</option>
              <option value="tuition_asc">Tuition: Lowest First</option>
              <option value="tuition_desc">Tuition: Highest First</option>
            </select>
          </div>

          {/* Diagnostic Box matching screen(2).png */}
          <div
            style={{
              padding: '1rem',
              backgroundColor: '#FDFBF7',
              border: '1px solid #EBE6DE',
              borderRadius: '16px',
              fontSize: '0.8125rem',
            }}
          >
            <strong style={{ display: 'block', color: 'var(--color-foreground)', marginBottom: '0.25rem' }}>
              Eligibility Question?
            </strong>
            <p style={{ color: 'var(--color-foreground-muted)', fontSize: '0.75rem', margin: '0 0 0.75rem 0' }}>
              Match your Pakistani academic credentials against German, Italian, French, or Romanian grade conversion standards.
            </p>
            <Link to="/explorer/request-support" style={{ textDecoration: 'none' }}>
              <button
                type="button"
                className="btn-pill"
                style={{
                  width: '100%',
                  padding: '6px 12px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #EBE6DE',
                  cursor: 'pointer',
                }}
              >
                Inquire With Counsellor
              </button>
            </Link>
          </div>
        </div>

        {/* Right Content: Program Cards / Scholarships */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Programs Tab Content */}
          {activeTab === 'programs' && (
            <>
              {progsLoading && <LoadingState message="Loading approved degree programs..." />}
              {progsError && <ErrorState message="Could not fetch programs." onRetry={() => refetchPrograms()} />}

              {!progsLoading && !progsError && programsResult && (
                <>
                  {programsResult.items.length === 0 ? (
                    <EmptyState
                      imageSrc="/images/unilistics/empty_applications.webp"
                      title="No matching programs found"
                      description="No degree programs matched your filter criteria. Try resetting your search keywords or broadening your destination filter."
                      actionLabel="Reset All Filters"
                      onAction={handleResetFilters}
                    />
                  ) : (
                    <>
                      {/* Grid of Program Cards matching screen(2).png */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                          gap: '1.25rem',
                        }}
                      >
                        {programsResult.items.map((prog) => {
                          const isSaved = prog.is_bookmarked ?? false;
                          const isZeroTuition = prog.annual_tuition_eur === 0;

                          return (
                            <div
                              key={prog.id}
                              className="bento-card"
                              style={{
                                padding: '1.5rem',
                                backgroundColor: '#FFFFFF',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                gap: '1rem',
                              }}
                            >
                              <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span
                                      style={{
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        padding: '2px 8px',
                                        borderRadius: '9999px',
                                        backgroundColor: '#F9F6F0',
                                        color: 'var(--color-foreground)',
                                        border: '1px solid #EBE6DE',
                                      }}
                                    >
                                      {prog.country_code.toUpperCase()}
                                    </span>
                                    <span style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted)' }}>
                                      {prog.university_name}
                                    </span>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => handleToggleBookmark(prog.id)}
                                    aria-label={isSaved ? `Remove ${prog.program_name} from saved` : `Save ${prog.program_name}`}
                                    style={{
                                      color: isSaved ? '#B72301' : 'var(--color-foreground-muted)',
                                      padding: '4px',
                                      background: 'none',
                                      border: 'none',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    <Bookmark size={20} fill={isSaved ? 'currentColor' : 'none'} />
                                  </button>
                                </div>

                                <h3 style={{ fontSize: '1.1875rem', fontWeight: 800, color: 'var(--color-foreground)', margin: '0 0 0.5rem 0' }}>
                                  {prog.program_name}
                                </h3>

                                {/* Badges row matching screen(2).png */}
                                <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                  <span
                                    style={{
                                      fontSize: '0.6875rem',
                                      fontWeight: 700,
                                      padding: '2px 8px',
                                      borderRadius: '9999px',
                                      backgroundColor: '#EFF6FF',
                                      color: '#1D4ED8',
                                    }}
                                  >
                                    {prog.degree_level.toUpperCase()}
                                  </span>

                                  <span
                                    style={{
                                      fontSize: '0.6875rem',
                                      fontWeight: 700,
                                      padding: '2px 8px',
                                      borderRadius: '9999px',
                                      backgroundColor: '#ECFDF5',
                                      color: '#047857',
                                    }}
                                  >
                                    {prog.teaching_language?.toUpperCase() || 'ENGLISH'}
                                  </span>

                                  <span
                                    style={{
                                      fontSize: '0.6875rem',
                                      fontWeight: 700,
                                      padding: '2px 8px',
                                      borderRadius: '9999px',
                                      backgroundColor: isZeroTuition ? '#FEF3C7' : '#F9F6F0',
                                      color: isZeroTuition ? '#B45309' : 'var(--color-foreground)',
                                    }}
                                  >
                                    {isZeroTuition ? '€0 Tuition / Public Subsidy' : `€${prog.annual_tuition_eur?.toLocaleString()}/yr`}
                                  </span>
                                </div>

                                {/* Meta rows */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', fontSize: '0.8125rem' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-foreground-muted)' }}>
                                    <span>Application Deadline:</span>
                                    <strong style={{ color: '#B72301' }}>{prog.next_intake_deadline || 'Not published'}</strong>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-foreground-muted)' }}>
                                    <span>Application Method:</span>
                                    <span style={{ color: 'var(--color-foreground)' }}>{prog.application_portal || 'Direct / Uni-Assist'}</span>
                                  </div>
                                </div>
                              </div>

                              <div style={{ paddingTop: '0.75rem', borderTop: '1px solid #EBE6DE', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.75rem', color: '#065F46', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <CheckCircle2 size={13} /> Verified Entry
                                </span>

                                <Link to={`/explorer/programs/${prog.id}`} style={{ textDecoration: 'none' }}>
                                  <button
                                    type="button"
                                    className="btn-pill"
                                    style={{
                                      padding: '6px 14px',
                                      fontSize: '0.8125rem',
                                      fontWeight: 700,
                                      backgroundColor: '#F9F6F0',
                                      color: 'var(--color-foreground)',
                                      cursor: 'pointer',
                                      border: '1px solid #EBE6DE',
                                    }}
                                  >
                                    View Details →
                                  </button>
                                </Link>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Pagination Controls */}
                      {programsResult.total_pages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={progPage <= 1}
                            onClick={() => setProgPage((p) => Math.max(1, p - 1))}
                            leftIcon={<ChevronLeft size={15} />}
                          >
                            Previous
                          </Button>
                          <span style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted)' }}>
                            Page <strong>{progPage}</strong> of <strong>{programsResult.total_pages}</strong>
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={progPage >= programsResult.total_pages}
                            onClick={() => setProgPage((p) => p + 1)}
                            rightIcon={<ChevronRight size={15} />}
                          >
                            Next
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </>
          )}

          {/* Scholarships Tab Content */}
          {activeTab === 'scholarships' && (
            <>
              {schLoading && <LoadingState message="Loading verified scholarships..." />}
              {schError && <ErrorState message="Could not fetch scholarships." onRetry={() => refetchScholarships()} />}

              {!schLoading && !schError && scholarshipsResult && (
                <>
                  {scholarshipsResult.items.length === 0 ? (
                    <EmptyState
                      imageSrc="/images/unilistics/empty_applications.webp"
                      title="No scholarships found"
                      description="No scholarships matched your search criteria. Check back as new regional opportunities are published by our research team."
                      actionLabel="Reset All Filters"
                      onAction={handleResetFilters}
                    />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {scholarshipsResult.items.map((sch) => (
                        <div
                          key={sch.id}
                          className="bento-card"
                          style={{
                            padding: '1.5rem',
                            backgroundColor: '#FFFFFF',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.75rem',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <div>
                              <span
                                style={{
                                  fontSize: '0.6875rem',
                                  fontWeight: 700,
                                  padding: '2px 8px',
                                  borderRadius: '9999px',
                                  backgroundColor: '#FFEFEA',
                                  color: '#B72301',
                                }}
                              >
                                {sch.country_code.toUpperCase()}
                              </span>
                              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, margin: '4px 0 0 0', color: 'var(--color-foreground)' }}>
                                {sch.name}
                              </h3>
                              <p style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted)', margin: '2px 0 0 0' }}>
                                Provider: {sch.provider} • Level: {sch.degree_level.toUpperCase()}
                              </p>
                            </div>

                            <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#047857' }}>
                              {sch.coverage_type === 'full' ? 'Full Tuition + Monthly Stipend' : sch.coverage_type.replace(/_/g, ' ').toUpperCase()}
                            </span>
                          </div>

                          <div style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted)' }}>
                            {sch.stipend_amount_eur ? `Stipend: €${sch.stipend_amount_eur}/month • ` : ''}
                            Deadline: {sch.annual_deadline_date || 'Annual intake'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* Bottom Callout Banner matching screen(2).png */}
          <div
            className="bento-card"
            style={{
              padding: '2rem',
              backgroundColor: '#B72301',
              color: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              borderRadius: '24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}
              >
                Managed Student Track
              </span>
            </div>

            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
              Unlock Dedicated Application Support & Attestation Guidance
            </h3>
            <p style={{ fontSize: '0.9375rem', color: 'rgba(255,255,255,0.9)', margin: 0, maxWidth: '640px' }}>
              Upgrade to Managed Support to work directly with an assigned admissions counsellor, track university portal submissions, and manage your visa dossier.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              <Link to="/explorer/request-support" style={{ textDecoration: 'none' }}>
                <button
                  type="button"
                  style={{
                    backgroundColor: '#FFFFFF',
                    color: '#B72301',
                    border: 'none',
                    borderRadius: '9999px',
                    padding: '10px 24px',
                    fontSize: '0.875rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Request Application Support →
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
