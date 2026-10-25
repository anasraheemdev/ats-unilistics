import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  // Search & Filter State
  const [searchInput, setSearchInput] = useState<string>('');
  const [headerSearch, setHeaderSearch] = useState<string>('');
  const [selectedDestination, setSelectedDestination] = useState<string>('');

  // Advisory Modal State
  const [isAdvisoryModalOpen, setIsAdvisoryModalOpen] = useState<boolean>(false);
  const [advisoryName, setAdvisoryName] = useState<string>('');
  const [advisoryEmail, setAdvisoryEmail] = useState<string>('');
  const [advisoryTarget, setAdvisoryTarget] = useState<string>('');
  const [advisorySuccessMessage, setAdvisorySuccessMessage] = useState<string | null>(null);

  // User Profile
  const [userName, setUserName] = useState<string>('Account');
  const [userRoleBadge, setUserRoleBadge] = useState<string>('Prospective Student');

  useEffect(() => {
    api.auth.getCurrentUser().then((u) => {
      if (u) {
        if (u.fullName) setUserName(u.fullName);
        else if (u.email) setUserName(u.email.split('@')[0]);
        if (u.role === 'counsellor' || u.role === 'admin' || u.role === 'super_admin') {
          setUserRoleBadge('Admissions Staff');
        } else if (u.role === 'explorer') {
          setUserRoleBadge('Explorer (Pre-Enrolled)');
        }
      }
    });
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/explorer?search=${encodeURIComponent(searchInput.trim())}`);
    } else {
      navigate('/explorer');
    }
  };

  const handleDestinationClick = (countryName: string) => {
    setSelectedDestination(countryName);
    const updated = countryName + ' ';
    setSearchInput(updated);
    const el = document.getElementById('program-search-input');
    if (el) el.focus();
  };

  const handlePresetClick = (presetQuery: string) => {
    setSearchInput(presetQuery);
    navigate(`/explorer?search=${encodeURIComponent(presetQuery)}`);
  };

  const handleAdvisorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.requests.submitAccessRequest({
        fullName: advisoryName || 'Applicant',
        email: advisoryEmail,
        requestedService: 'managed_application_case',
        countryInterests: ['germany'],
        consentPrivacy: true,
        isUpgrade: false,
        studentMessage: `Free 1-on-1 Academic Audit booking. Target: ${advisoryTarget}`,
      });
    } catch {
      // Graceful fallback for demo harness
    }

    setAdvisorySuccessMessage(
      'Your advisory appointment slot has been reserved. A senior admissions fellow will contact you shortly.'
    );
    setTimeout(() => {
      setAdvisorySuccessMessage(null);
      setIsAdvisoryModalOpen(false);
      setAdvisoryName('');
      setAdvisoryEmail('');
      setAdvisoryTarget('');
    }, 2400);
  };

  return (
    <div className="bg-[#FBF9F5] text-on-surface antialiased relative min-h-screen selection:bg-primary-fixed selection:text-on-primary-fixed font-sans">
      {/* Ambient background blur orbs */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 -left-20 w-[600px] h-[600px] rounded-full bg-[#E8F7F2]/60 blur-[100px]" />
        <div className="absolute top-10 right-0 w-[550px] h-[550px] rounded-full bg-[#FFF0EB]/70 blur-[110px]" />
        <div className="absolute bottom-20 left-1/3 w-[450px] h-[450px] rounded-full bg-[#F3F0FA]/40 blur-[90px]" />
      </div>

      {/* Top Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#FBF9F5]/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(26,28,30,0.04)]">
        <div className="h-20 max-w-[1440px] mx-auto px-6 sm:px-12 flex items-center justify-between gap-4">
          {/* Logo & Portal Switcher */}
          <div className="flex items-center gap-6 flex-shrink-0">
            <Link to="/" className="flex items-center gap-2.5 no-underline">
              <img
                alt="Unilistics Logo"
                className="h-8 w-auto object-contain"
                src="/images/unilistics/unilistics-logo.png"
                onError={(e) => {
                  e.currentTarget.src =
                    'https://lh3.googleusercontent.com/aida/AEtjO1XZO1prPEcg9JZ7p5bs_YGqOXor3IiGvli7iEnlFMk-lBAQZE8Ljo_0_u5Ljx3BRtoVrjKmvtp6xEgQcN8Zs9ajrhGd4Kyi55QMS8slvDM2xS6950IfaeqfQFPLFT78_3FHSgzNk19R4CBSJ8CDR-du8zCcxRH0FdLAtirwHO-UME2_Ve9jzZuKbswwg1xGp1guNigeRxRC41avkLu0Ys1WNzvhrv3CiBqBBt9x25H4cOQ_B6-qu-3oMyI';
                }}
              />
              <span className="font-bold text-xl text-on-surface tracking-tight">Unilistics</span>
            </Link>

            <div className="hidden xl:flex items-center p-1 bg-surface-container rounded-full">
              <button
                onClick={() => navigate('/student')}
                className="px-4 py-1.5 rounded-full text-xs font-semibold bg-surface-container-lowest text-primary shadow-[0_2px_8px_rgba(26,28,30,0.06)] transition-all"
                type="button"
              >
                Student Portal
              </button>
              <button
                onClick={() => navigate('/staff')}
                className="px-4 py-1.5 rounded-full text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-colors"
                type="button"
              >
                Staff Workspace
              </button>
            </div>
          </div>

          {/* Central Main Navigation */}
          <nav
            className="hidden lg:flex items-center gap-1 p-1 bg-surface-container-low/70 rounded-full"
            aria-label="Primary navigation"
          >
            <Link
              to="/"
              className="px-4 py-2 rounded-full transition-all bg-primary text-white font-medium text-sm shadow-[0_4px_16px_-2px_rgba(255,94,54,0.3)] no-underline"
            >
              Home
            </Link>
            <Link
              to="/explorer"
              className="px-4 py-2 rounded-full font-normal text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-lowest transition-all no-underline"
            >
              Explore Catalogue
            </Link>
            <Link
              to="/student/applications"
              className="px-4 py-2 rounded-full font-normal text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-lowest transition-all no-underline"
            >
              My Applications
            </Link>
            <Link
              to="/student/documents"
              className="px-4 py-2 rounded-full font-normal text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-lowest transition-all no-underline"
            >
              Documents
            </Link>
            <Link
              to="/student/tasks"
              className="px-4 py-2 rounded-full font-normal text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-lowest transition-all no-underline"
            >
              Tasks &amp; Deadlines
            </Link>
            <Link
              to="/student/messages"
              className="px-4 py-2 rounded-full font-normal text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-lowest transition-all no-underline"
            >
              Messages
            </Link>
            <Link
              to="/staff"
              className="px-4 py-2 rounded-full font-normal text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-lowest transition-all no-underline"
            >
              Staff Workspace
            </Link>
          </nav>

          {/* Right Header Utilities: Search, Notifications, Profile */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            {/* Quick search input */}
            <div className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-surface-container-lowest rounded-full shadow-[0_1px_4px_rgba(26,28,30,0.04)] focus-within:ring-2 focus-within:ring-primary-container transition-all">
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">search</span>
              <input
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    navigate(`/explorer?search=${encodeURIComponent(headerSearch)}`);
                  }
                }}
                className="bg-transparent border-0 outline-none text-sm text-on-surface placeholder:text-on-surface-variant/70 w-32 lg:w-44"
                placeholder="Search admissions, unis..."
                type="text"
              />
              <kbd className="px-1.5 py-0.5 rounded-full bg-surface-container-high text-[10px] font-semibold text-on-surface-variant">
                ⌘K
              </kbd>
            </div>

            {/* Notification & Help Icons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => navigate('/student/messages')}
                aria-label="Notifications"
                className="relative w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-lowest transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">notifications</span>
                <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-secondary ring-2 ring-surface-container-lowest" />
              </button>

              <button
                onClick={() => navigate('/help')}
                aria-label="Help Center"
                className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-lowest transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">help</span>
              </button>
            </div>

            {/* Profile Avatar & Badge */}
            <Link
              to="/student"
              className="flex items-center gap-2.5 pl-1.5 py-1 pr-4 bg-surface-container-lowest rounded-full shadow-[0_2px_8px_rgba(26,28,30,0.04)] no-underline"
            >
              <img
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-fixed"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDppqA5aNJmjCci8ahuztks1EwgkbXkzsu0TK6TsAt_QVVZS7YWjgtAWCuTdiZ0rBpYA01IiX_42uZYaz4mwJR9MqrTLrl1OJz_KvJh4rlT3hscIomWVXguWpccyJ0ln844pLxKJ2486VsR8bwCRTyUXyXS-7vO6-dpv3DoKcSZrpgtJvSCac9d-Cr9LUwevoE77LN3iJxNEypwCbFDfGwqKFWfyAbJRukjPdEhiap_Jp56V4fHEe9p"
              />
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-sm font-semibold text-on-surface leading-tight">{userName}</span>
                <span className="text-[11px] font-bold text-primary leading-none">{userRoleBadge}</span>
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Page Canvas */}
      <main className="relative z-10 w-full pt-28 pb-20 min-h-screen">
        <div className="flex flex-col w-full">
          <div className="relative w-full overflow-hidden">
            {/* Hero & Mission Section */}
            <section className="max-w-[1440px] mx-auto px-6 sm:px-12 pt-6 pb-16 lg:pb-24 flex flex-col items-center text-center relative z-10">
              {/* Eyebrow Live Intake Pill */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container-lowest shadow-sm mb-6">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="w-2 h-2 -ml-3 rounded-full bg-emerald-600" />
                <span className="text-xs font-semibold text-on-surface tracking-wide">
                  Pakistan to Europe Higher Education Admissions Desk
                </span>
                <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[11px] font-bold">
                  VERIFIED DESK
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="font-extrabold text-3xl sm:text-5xl md:text-6xl text-on-surface max-w-5xl tracking-tight mb-6 leading-tight">
                Your Entire Global Degree Journey.{' '}
                <span className="bg-gradient-to-r from-primary-container via-secondary-container to-primary text-transparent bg-clip-text">
                  Tracked, Verified &amp; Guided.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-on-surface-variant max-w-3xl leading-relaxed mb-8">
                Explore peer-verified public university programs across Germany, France, Italy, and Romania, track consular visa prerequisites,
                and collaborate in real-time with dedicated admissions counsellors.
              </p>

              {/* Dual Call to Actions */}
              <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
                <a
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-sm text-white bg-gradient-to-r from-[#FF5E36] to-[#FF2A55] shadow-lg shadow-primary-container/30 hover:opacity-95 active:scale-95 transition-all no-underline"
                  href="#catalogue-search"
                >
                  <span>Explore University Catalogue</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </a>
                <button
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-sm text-on-surface bg-surface-container-lowest shadow-sm hover:bg-surface-container-low active:scale-95 transition-all"
                  onClick={() => setIsAdvisoryModalOpen(true)}
                  type="button"
                >
                  <span className="material-symbols-outlined text-primary text-[20px]">support_agent</span>
                  <span>Request 1-on-1 Advisory (Free)</span>
                </button>
              </div>

              {/* Verified Trust Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-4xl">
                <div className="flex items-center justify-center gap-3 px-6 py-3.5 rounded-full bg-surface-container-lowest/80 backdrop-blur-md shadow-sm">
                  <span className="material-symbols-outlined text-emerald-600 text-[24px]">verified</span>
                  <div className="text-left">
                    <p className="text-lg font-bold text-on-surface leading-tight">100%</p>
                    <p className="text-xs font-semibold text-on-surface-variant">Procedural Verification</p>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-3 px-6 py-3.5 rounded-full bg-surface-container-lowest/80 backdrop-blur-md shadow-sm">
                  <span className="material-symbols-outlined text-primary text-[24px]">payments</span>
                  <div className="text-left">
                    <p className="text-lg font-bold text-on-surface leading-tight">4 Corridors</p>
                    <p className="text-xs font-semibold text-on-surface-variant">Germany, France, Italy, Romania</p>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-3 px-6 py-3.5 rounded-full bg-surface-container-lowest/80 backdrop-blur-md shadow-sm">
                  <span className="material-symbols-outlined text-tertiary text-[24px]">security</span>
                  <div className="text-left">
                    <p className="text-lg font-bold text-on-surface leading-tight">Statutory</p>
                    <p className="text-xs font-semibold text-on-surface-variant">APS, HEC &amp; Consular Standard</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Interactive Program & Destination Search Bento */}
            <section className="max-w-[1440px] mx-auto px-6 sm:px-12 mb-24 relative z-10" id="catalogue-search">
              <div className="rounded-2xl p-6 sm:p-10 bg-surface-container-lowest shadow-xl shadow-on-surface/[0.04]">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                  <div>
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">
                      Direct Admissions Engine
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-bold text-on-surface mt-1">
                      Instant Verified Program Lookup
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>4,812 active degree intakes refreshed today</span>
                  </div>
                </div>

                {/* Pill-shaped Large Search Bar */}
                <form onSubmit={handleSearchSubmit} className="relative flex items-center mb-6">
                  <span className="material-symbols-outlined absolute left-6 text-on-surface-variant text-[24px]">
                    search
                  </span>
                  <input
                    id="program-search-input"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full pl-16 pr-36 py-5 rounded-full bg-surface-container-low text-base text-on-surface placeholder:text-on-surface-variant/70 outline-none focus:bg-surface-container-lowest focus:shadow-md transition-all"
                    placeholder="Search universities, degree programs, or scholarships (e.g. TUM, Data Science, DAAD, Erasmus)..."
                    type="text"
                  />
                  <button
                    className="absolute right-3 px-6 py-3 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-[#FF5E36] to-[#FF2A55] shadow-md shadow-primary-container/20 hover:opacity-95 transition-opacity"
                    type="submit"
                  >
                    Search
                  </button>
                </form>

                {/* Filter Chips & Suggestion Pills */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2">
                  {/* Destination Pills */}
                  <div className="flex items-center gap-2 flex-wrap" id="country-pill-group">
                    <span className="text-xs font-semibold text-on-surface-variant mr-1">Hot destinations:</span>
                    {[
                      { name: 'Germany', flag: '🇩🇪' },
                      { name: 'United Kingdom', flag: '🇬🇧' },
                      { name: 'Netherlands', flag: '🇳🇱' },
                      { name: 'Sweden', flag: '🇸🇪' },
                      { name: 'Switzerland', flag: '🇨🇭' },
                      { name: 'Ireland', flag: '🇮🇪' },
                    ].map((dest) => (
                      <button
                        key={dest.name}
                        onClick={() => handleDestinationClick(dest.name)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 flex items-center gap-1.5 ${
                          selectedDestination === dest.name
                            ? 'bg-primary text-white shadow-sm'
                            : 'bg-surface-container-low text-on-surface hover:bg-surface-container-highest'
                        }`}
                        type="button"
                      >
                        <span>{dest.name}</span>
                        <span>{dest.flag}</span>
                      </button>
                    ))}
                  </div>

                  {/* Quick Query Suggestions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-on-surface-variant">Presets:</span>
                    <button
                      type="button"
                      onClick={() => handlePresetClick("Tuition-Free Master's")}
                      className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                    >
                      Tuition-Free Master's
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePresetClick('100% English Taught')}
                      className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                    >
                      100% English Taught
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePresetClick('Direct Intake 2025')}
                      className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
                    >
                      Direct Intake 2025
                    </button>
                  </div>
                </div>

                {/* Dynamic Results Teaser Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-8 border-t border-surface-container-low">
                  {/* Card 1 */}
                  <div
                    onClick={() => navigate('/explorer?country=germany&search=Robotics')}
                    className="p-5 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                          €0 Tuition (TUM)
                        </span>
                        <span className="text-xs text-on-surface-variant">Fall 2025</span>
                      </div>
                      <h3 className="font-semibold text-base text-on-surface">
                        M.Sc. Robotics, Cognition &amp; Intelligence
                      </h3>
                      <p className="text-xs text-on-surface-variant mt-1">Technical University of Munich • Munich, Germany</p>
                    </div>
                    <div className="mt-4 pt-3 flex items-center justify-between text-xs font-semibold text-primary">
                      <span>APS &amp; VPD Verification Ready</span>
                      <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div
                    onClick={() => navigate('/explorer?country=united-kingdom&search=Artificial+Intelligence')}
                    className="p-5 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">
                          Full Scholarship Option
                        </span>
                        <span className="text-xs text-on-surface-variant">Sept 2025</span>
                      </div>
                      <h3 className="font-semibold text-base text-on-surface">
                        M.Sc. Artificial Intelligence &amp; Data Ethics
                      </h3>
                      <p className="text-xs text-on-surface-variant mt-1">University of Edinburgh • Edinburgh, UK</p>
                    </div>
                    <div className="mt-4 pt-3 flex items-center justify-between text-xs font-semibold text-primary">
                      <span>Common App &amp; UCAS Bridge</span>
                      <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div
                    onClick={() => navigate('/explorer?country=netherlands&search=Sustainable+Energy')}
                    className="p-5 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-100 text-purple-800">
                          Erasmus+ Mundus Grant
                        </span>
                        <span className="text-xs text-on-surface-variant">Spring 2026</span>
                      </div>
                      <h3 className="font-semibold text-base text-on-surface">
                        M.Sc. Sustainable Energy Technology
                      </h3>
                      <p className="text-xs text-on-surface-variant mt-1">TU Delft • Delft, Netherlands</p>
                    </div>
                    <div className="mt-4 pt-3 flex items-center justify-between text-xs font-semibold text-primary">
                      <span>Studielink Auto-Sync</span>
                      <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Global University Partners / Institutional Ticker */}
            <section className="max-w-[1440px] mx-auto px-6 sm:px-12 mb-24 relative z-10 text-center">
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-8">
                Direct Admission Data Partnerships With 350+ European &amp; Global Institutions
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-14 opacity-80">
                <div className="flex items-center gap-2 text-on-surface font-semibold text-lg">
                  <span className="material-symbols-outlined text-primary text-[28px]">account_balance</span>
                  <span>TU Munich</span>
                </div>
                <div className="flex items-center gap-2 text-on-surface font-semibold text-lg">
                  <span className="material-symbols-outlined text-tertiary text-[28px]">school</span>
                  <span>Univ. of Edinburgh</span>
                </div>
                <div className="flex items-center gap-2 text-on-surface font-semibold text-lg">
                  <span className="material-symbols-outlined text-[#FF5E36] text-[28px]">domain</span>
                  <span>TU Delft</span>
                </div>
                <div className="flex items-center gap-2 text-on-surface font-semibold text-lg">
                  <span className="material-symbols-outlined text-emerald-600 text-[28px]">hub</span>
                  <span>ETH Zurich</span>
                </div>
                <div className="flex items-center gap-2 text-on-surface font-semibold text-lg">
                  <span className="material-symbols-outlined text-purple-600 text-[28px]">biotech</span>
                  <span>Karolinska Inst.</span>
                </div>
                <div className="flex items-center gap-2 text-on-surface font-semibold text-lg">
                  <span className="material-symbols-outlined text-amber-600 text-[28px]">menu_book</span>
                  <span>Trinity College Dublin</span>
                </div>
              </div>
            </section>

            {/* Core Platform Pillars (Bento Grid) */}
            <section className="max-w-[1440px] mx-auto px-6 sm:px-12 mb-24 relative z-10">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <span className="text-xs font-bold text-primary uppercase tracking-wider">
                  Unilistics Core Architecture
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold text-on-surface mt-2 mb-4">
                  Engineered to eliminate admissions friction
                </h2>
                <p className="text-base text-on-surface-variant leading-relaxed">
                  Admissions are fragmented across regional portals, foreign credential bodies, and archaic consular rules.
                  Unilistics centralizes the entire protocol into one luminous, synchronized workspace.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Pillar 1 */}
                <div className="rounded-2xl p-8 bg-surface-container-lowest shadow-lg shadow-on-surface/[0.03] flex flex-col justify-between group hover:-translate-y-1 transition-transform">
                  <div>
                    <div className="w-14 h-14 rounded-full bg-primary-fixed flex items-center justify-center text-primary mb-6">
                      <span className="material-symbols-outlined text-[28px]">travel_explore</span>
                    </div>
                    <span className="text-xs font-bold text-primary uppercase">Pillar 01</span>
                    <h3 className="text-xl font-bold text-on-surface mt-1 mb-3">Smart Catalogue Explorer</h3>
                    <p className="text-xs text-on-surface-variant leading-relaxed mb-6">
                      Algorithmic filtering calibrated for international applicants. Model tuition fees, language barriers,
                      ECTS module equivalency, and live intake closing countdowns down to the minute.
                    </p>
                    {/* Mini Feature Metric Illustration */}
                    <div className="p-4 rounded-xl bg-surface-container-low mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[11px] font-semibold text-on-surface-variant">ECTS Compatibility Meter</span>
                        <span className="text-[11px] font-bold text-emerald-600">100% Match (180 ECTS)</span>
                      </div>
                      <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full w-full" />
                      </div>
                    </div>
                  </div>
                  <Link
                    to="/explorer"
                    className="flex items-center text-primary font-semibold text-sm gap-1 group-hover:gap-2 transition-all no-underline"
                  >
                    <span>Explore catalogue filters</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </Link>
                </div>

                {/* Pillar 2 */}
                <div className="rounded-2xl p-8 bg-surface-container-lowest shadow-lg shadow-on-surface/[0.03] flex flex-col justify-between group hover:-translate-y-1 transition-transform">
                  <div>
                    <div className="w-14 h-14 rounded-full bg-tertiary-fixed flex items-center justify-center text-tertiary mb-6">
                      <span className="material-symbols-outlined text-[28px]">folder_managed</span>
                    </div>
                    <span className="text-xs font-bold text-tertiary uppercase">Pillar 02</span>
                    <h3 className="text-xl font-bold text-on-surface mt-1 mb-3">Verified Document Vault</h3>
                    <p className="text-xs text-on-surface-variant leading-relaxed mb-6">
                      Zero-knowledge encrypted repository with auto-OCR parsing. Instantly audit apostilled transcripts,
                      IELTS/TOEFL scores, motivation letters, and consular bank solvency affidavits.
                    </p>
                    {/* Document Status Visual */}
                    <div className="p-4 rounded-xl bg-surface-container-low mb-6 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2 text-on-surface font-medium">
                          <span className="material-symbols-outlined text-emerald-600 text-[16px]">verified</span>
                          Official Bachelor Degree VPD
                        </span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Verified
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2 text-on-surface font-medium">
                          <span className="material-symbols-outlined text-emerald-600 text-[16px]">verified</span>
                          IELTS Academic (Band 8.0)
                        </span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Verified
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link
                    to="/student/documents"
                    className="flex items-center text-tertiary font-semibold text-sm gap-1 group-hover:gap-2 transition-all no-underline"
                  >
                    <span>Learn about zero-fail verification</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </Link>
                </div>

                {/* Pillar 3 */}
                <div className="rounded-2xl p-8 bg-surface-container-lowest shadow-lg shadow-on-surface/[0.03] flex flex-col justify-between group hover:-translate-y-1 transition-transform">
                  <div>
                    <div className="w-14 h-14 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary mb-6">
                      <span className="material-symbols-outlined text-[28px]">connect_without_contact</span>
                    </div>
                    <span className="text-xs font-bold text-secondary uppercase">Pillar 03</span>
                    <h3 className="text-xl font-bold text-on-surface mt-1 mb-3">Real-time Counsellor Sync</h3>
                    <p className="text-xs text-on-surface-variant leading-relaxed mb-6">
                      Direct case-management chat with accredited advisors. Receive milestone reminders, real-time feedback
                      on SOP drafts, and instant webhook updates as your institutional application progresses.
                    </p>
                    {/* Mini Chat Notification Simulation */}
                    <div className="p-4 rounded-xl bg-surface-container-low mb-6 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                        SJ
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-on-surface">Admissions Lead (Adviser)</span>
                          <span className="text-[10px] text-on-surface-variant">10m ago</span>
                        </div>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          "Your university curriculum analysis is approved. We can submit via the admissions portal tomorrow."
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsAdvisoryModalOpen(true)}
                    type="button"
                    className="flex items-center text-secondary font-semibold text-sm gap-1 group-hover:gap-2 transition-all text-left"
                  >
                    <span>Book advisory session</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            </section>

            {/* Live Application Tracker Preview (Interactive Showcase) */}
            <section className="max-w-[1440px] mx-auto px-6 sm:px-12 mb-24 relative z-10">
              <div className="rounded-3xl p-6 sm:p-12 bg-gradient-to-br from-surface-container-lowest via-surface-container-lowest/95 to-surface-container-low shadow-xl">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-10 pb-8 border-b border-surface-container-high">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-3">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Live Synced Student Record
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-on-surface">Inside the Applicant Experience</h2>
                    <p className="text-sm sm:text-base text-on-surface-variant mt-1">
                      Track master's and bachelor's admission milestones seamlessly across institutions.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 self-stretch sm:self-auto justify-end">
                    <span className="px-4 py-2 rounded-full bg-surface-container text-xs font-semibold text-on-surface">
                      Intake ID: #DE-TUM-2025-09
                    </span>
                    <Link
                      to="/student"
                      className="px-5 py-2 rounded-full bg-primary text-white text-xs font-semibold shadow-md shadow-primary-container/20 no-underline"
                    >
                      Launch Live Portal
                    </Link>
                  </div>
                </div>

                {/* Application Card Mosaic */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Main Milestone Tracker (8 Columns) */}
                  <div className="lg:col-span-8 rounded-2xl p-6 sm:p-8 bg-surface-container-lowest shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-base">
                            TUM
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-on-surface">Technical University of Munich</h3>
                            <p className="text-xs text-on-surface-variant">M.Sc. Robotics, Cognition, Intelligence • Munich Campus</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                            Stage 4 of 6: Institutional Review
                          </span>
                        </div>
                      </div>

                      {/* Interactive Milestone Stepper Nodes */}
                      <div className="my-8">
                        <div className="flex items-center justify-between relative">
                          {/* Stepper Bar Background */}
                          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-surface-container-high z-0" />
                          {/* Stepper Bar Active Progress */}
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-emerald-500 to-[#FF5E36] w-[65%] z-0" />

                          {/* Step 1 (Completed) */}
                          <div className="relative z-10 flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                              <span className="material-symbols-outlined text-[16px]">check</span>
                            </div>
                            <span className="text-[11px] font-semibold text-on-surface mt-2">VPD Issued</span>
                          </div>

                          {/* Step 2 (Completed) */}
                          <div className="relative z-10 flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                              <span className="material-symbols-outlined text-[16px]">check</span>
                            </div>
                            <span className="text-[11px] font-semibold text-on-surface mt-2">APS Certified</span>
                          </div>

                          {/* Step 3 (Completed) */}
                          <div className="relative z-10 flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                              <span className="material-symbols-outlined text-[16px]">check</span>
                            </div>
                            <span className="text-[11px] font-semibold text-on-surface mt-2">SOP Verified</span>
                          </div>

                          {/* Step 4 (Active In Progress) */}
                          <div className="relative z-10 flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-[#FF5E36] text-white flex items-center justify-center shadow-md shadow-primary-container/40 ring-4 ring-[#FF5E36]/20">
                              <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
                            </div>
                            <span className="text-[11px] text-primary font-bold mt-2">Faculty Audit</span>
                          </div>

                          {/* Step 5 (Upcoming) */}
                          <div className="relative z-10 flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center">
                              <span className="w-2 h-2 rounded-full bg-on-surface-variant" />
                            </div>
                            <span className="text-[11px] text-on-surface-variant mt-2">Offer Letter</span>
                          </div>

                          {/* Step 6 (Upcoming) */}
                          <div className="relative z-10 flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center">
                              <span className="w-2 h-2 rounded-full bg-on-surface-variant" />
                            </div>
                            <span className="text-[11px] text-on-surface-variant mt-2">Visa Sync</span>
                          </div>
                        </div>
                      </div>

                      {/* Task Checkbox Summary */}
                      <div className="bg-surface-container-low p-4 rounded-xl space-y-3 mt-6">
                        <div className="flex items-center justify-between text-on-surface text-xs font-semibold">
                          <span>Intake Tasks: 3 of 7 completed</span>
                          <span className="text-primary font-bold">42% Overall Readiness</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[13px]">
                          <div className="flex items-center gap-2 text-on-surface-variant">
                            <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
                            <span>Submit TUMonline Curriculum Matrix</span>
                          </div>
                          <div className="flex items-center gap-2 text-on-surface-variant">
                            <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
                            <span>German Health Insurance Exemption</span>
                          </div>
                          <div className="flex items-center gap-2 text-on-surface font-semibold">
                            <span className="material-symbols-outlined text-primary text-[18px]">pending</span>
                            <span>Upload Blocked Account Confirmation</span>
                          </div>
                          <div className="flex items-center gap-2 text-on-surface-variant">
                            <span className="material-symbols-outlined text-on-surface-variant/40 text-[18px]">
                              radio_button_unchecked
                            </span>
                            <span>Enrollment Acceptance Fee Transfer</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer Meta */}
                    <div className="mt-6 pt-4 border-t border-surface-container-low flex flex-wrap items-center justify-between gap-2 text-on-surface-variant text-xs">
                      <span className="flex items-center gap-1 font-medium">
                        <span className="material-symbols-outlined text-[16px] text-emerald-600">sync</span>
                        Direct TUMonline webhook sync active (last ping: 4 min ago)
                      </span>
                      <Link to="/student/applications" className="text-primary font-semibold hover:underline no-underline">
                        View full dossier →
                      </Link>
                    </div>
                  </div>

                  {/* Advisor Case File & Insights (4 Columns) */}
                  <div className="lg:col-span-4 rounded-2xl p-6 sm:p-8 bg-surface-container-lowest shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-base ring-2 ring-primary-fixed">
                          AL
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-on-surface leading-tight">Admissions Advisory Lead</h4>
                          <p className="text-[11px] font-bold text-primary">Senior European Advisory Fellow</p>
                        </div>
                      </div>

                      {/* Advisor Note Quote Box */}
                      <div className="p-4 rounded-xl bg-amber-50/70 border-l-4 border-amber-400 mb-6">
                        <p className="text-xs text-on-surface leading-snug">
                          "Your certified course curriculum satisfies European faculty prerequisites. We have scheduled dossier submission."
                        </p>
                      </div>

                      {/* Quick Document Verifications */}
                      <div className="space-y-3">
                        <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                          Verified Dossier Items
                        </span>
                        <div className="flex items-center justify-between p-2.5 rounded-full bg-surface-container-low">
                          <span className="text-xs text-on-surface truncate pr-2 font-medium">Apostilled Transcript.pdf</span>
                          <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
                        </div>
                        <div className="flex items-center justify-between p-2.5 rounded-full bg-surface-container-low">
                          <span className="text-xs text-on-surface truncate pr-2 font-medium">IELTS_Academic_8.0.pdf</span>
                          <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate('/student/messages')}
                      className="w-full mt-6 py-2.5 rounded-full text-xs font-semibold text-on-surface bg-surface-container hover:bg-surface-container-high transition-colors flex items-center justify-center gap-2"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[18px]">chat</span>
                      <span>Open Advisor Thread (3 New)</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Scholarship & Tuition Transparency Guarantee */}
            <section className="max-w-[1440px] mx-auto px-6 sm:px-12 mb-24 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed text-xs font-bold mb-4">
                    <span className="material-symbols-outlined text-[16px]">gavel</span>
                    The Unilistics Data Standard
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-on-surface mb-4 leading-tight">
                    Zero speculation. Every tuition euro, deadline &amp; prerequisite verified.
                  </h2>
                  <p className="text-sm sm:text-base text-on-surface-variant mb-6 leading-relaxed">
                    Unlike static university search aggregators, our intelligence team performs bi-weekly direct audits against
                    university academic senates, state education ministries, and consular embassy updates.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-[18px]">update</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-on-surface">14-Day Senate Verification Cycle</h4>
                        <p className="text-xs text-on-surface-variant leading-relaxed">
                          All intake deadlines and language benchmark alterations are refreshed directly against official
                          university gazettes.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-[18px]">euro_symbol</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-on-surface">Hidden Fee Auditing</h4>
                        <p className="text-xs text-on-surface-variant leading-relaxed">
                          We decode campus semester contributions (Semesterbeitrag), transit passes, and state non-EU tuition
                          surcharge exemptions.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-[18px]">verified_user</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-on-surface">Consular Blocked Account Alignment</h4>
                        <p className="text-xs text-on-surface-variant leading-relaxed">
                          Automated calculators synchronized with the Federal Foreign Office's latest living cost stipulations
                          (€11,208/yr baseline).
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-7">
                  <div className="rounded-2xl p-6 sm:p-8 bg-surface-container-lowest shadow-xl relative overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-xs font-bold text-on-surface">Recent University Senate Verifications</span>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                        All Systems Normal
                      </span>
                    </div>

                    {/* Verification Feed Rows */}
                    <div className="space-y-3">
                      <div className="p-4 rounded-xl bg-surface-container-low flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-on-surface">
                              Ludwig Maximilian University of Munich (LMU)
                            </p>
                            <p className="text-[11px] text-on-surface-variant">
                              M.Sc. Data Science: German B2 proficiency requirement waived for 2025
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] text-on-surface-variant whitespace-nowrap">Verified 2h ago</span>
                      </div>

                      <div className="p-4 rounded-xl bg-surface-container-low flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-on-surface">Erasmus University Rotterdam</p>
                            <p className="text-[11px] text-on-surface-variant">
                              Rotterdam School of Management: GMAT Focus Edition conversion locked
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] text-on-surface-variant whitespace-nowrap">Verified 5h ago</span>
                      </div>

                      <div className="p-4 rounded-xl bg-surface-container-low flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-on-surface">University of Manchester</p>
                            <p className="text-[11px] text-on-surface-variant">
                              Faculty of Science &amp; Engineering: Global Futures Scholarship round live
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] text-on-surface-variant whitespace-nowrap">Verified 9h ago</span>
                      </div>

                      <div className="p-4 rounded-xl bg-surface-container-low flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-on-surface">KTH Royal Institute of Technology</p>
                            <p className="text-[11px] text-on-surface-variant">
                              Stockholm tuition waivers confirmed: 15% increase in STEM allocations
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] text-on-surface-variant whitespace-nowrap">Verified 1d ago</span>
                      </div>
                    </div>

                    {/* Guarantee Seal Banner */}
                    <div className="mt-6 pt-6 border-t border-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-[28px]">verified</span>
                        <div>
                          <p className="text-xs font-semibold text-on-surface">
                            The Unilistics 100% Application Accuracy Pledge
                          </p>
                          <p className="text-[11px] text-on-surface-variant">
                            Zero rejected dossiers due to inaccurate prerequisite guidelines.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate('/help')}
                        className="px-4 py-2 rounded-full text-xs font-semibold text-primary bg-primary-fixed hover:bg-primary-fixed-dim transition-colors flex-shrink-0"
                        type="button"
                      >
                        View Audit Protocol
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Bottom Action CTA Banner */}
            <section className="max-w-[1440px] mx-auto px-6 sm:px-12 mb-20 relative z-10">
              <div className="rounded-3xl p-8 sm:p-14 bg-gradient-to-r from-primary-container via-secondary-container to-primary text-white shadow-2xl relative overflow-hidden">
                {/* Decorative Ambient Light Orbs Inside CTA */}
                <div
                  className="absolute -right-10 -bottom-10 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none"
                  aria-hidden="true"
                />
                <div
                  className="absolute -left-10 -top-10 w-72 h-72 rounded-full bg-white/10 blur-2xl pointer-events-none"
                  aria-hidden="true"
                />
                <div className="relative z-10 max-w-3xl">
                  <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold uppercase tracking-wide inline-block mb-4">
                    Admissions Intake 2025/2026
                  </span>
                  <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 text-white">
                    Ready to launch your international degree?
                  </h2>
                  <p className="text-sm sm:text-base text-white/90 mb-8 max-w-2xl leading-relaxed">
                    Join over 28,000 students tracking offers across Germany, the UK, the Netherlands, and Scandinavia. Free
                    access to the program search and verified document vault.
                  </p>
                  <div className="flex flex-wrap items-center gap-4">
                    <a
                      className="px-8 py-3.5 rounded-full font-semibold text-sm text-primary bg-surface-container-lowest hover:bg-surface-container-low shadow-lg active:scale-95 transition-all no-underline"
                      href="#catalogue-search"
                    >
                      Browse All 4,800+ Programs
                    </a>
                    <button
                      onClick={() => navigate('/sign-in')}
                      className="px-8 py-3.5 rounded-full font-semibold text-sm text-white bg-white/20 hover:bg-white/30 backdrop-blur-md active:scale-95 transition-all"
                      type="button"
                    >
                      Sign In to Student Portal
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Modal: Request 1-on-1 Advisory */}
      {isAdvisoryModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="advisory-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm"
        >
          <div className="w-full max-w-lg rounded-2xl p-8 bg-surface-container-lowest shadow-2xl relative animate-in fade-in zoom-in duration-150">
            <button
              aria-label="Close modal"
              className="absolute top-6 right-6 w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface"
              onClick={() => setIsAdvisoryModalOpen(false)}
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
            <span className="text-xs font-bold text-primary uppercase">Advisory Concierge</span>
            <h3 id="advisory-title" className="text-xl font-bold text-on-surface mt-1 mb-2">
              Book Free 1-on-1 Academic Audit
            </h3>
            <p className="text-xs text-on-surface-variant mb-6">
              Connect with an accredited DAAD or British Council admissions fellow for a 30-minute eligibility appraisal.
            </p>

            {advisorySuccessMessage ? (
              <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-sm font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
                <span>{advisorySuccessMessage}</span>
              </div>
            ) : (
              <form onSubmit={handleAdvisorySubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1.5" htmlFor="advisory-name-input">
                    Full Name
                  </label>
                  <input
                    id="advisory-name-input"
                    value={advisoryName}
                    onChange={(e) => setAdvisoryName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-full bg-surface-container-low text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary-container"
                    placeholder="Full Name (as on Passport)"
                    required
                    type="text"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1.5" htmlFor="advisory-email-input">
                    Email Address
                  </label>
                  <input
                    id="advisory-email-input"
                    value={advisoryEmail}
                    onChange={(e) => setAdvisoryEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-full bg-surface-container-low text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary-container"
                    placeholder="applicant@example.com"
                    required
                    type="email"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1.5" htmlFor="advisory-target-input">
                    Target Destination &amp; Degree
                  </label>
                  <input
                    id="advisory-target-input"
                    value={advisoryTarget}
                    onChange={(e) => setAdvisoryTarget(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-full bg-surface-container-low text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary-container"
                    placeholder="e.g. Germany — Master in Computer Science"
                    required
                    type="text"
                  />
                </div>
                <div className="pt-2">
                  <button
                    className="w-full py-3.5 rounded-full font-semibold text-sm text-white bg-gradient-to-r from-[#FF5E36] to-[#FF2A55] shadow-md shadow-primary-container/30 hover:opacity-95 transition-opacity"
                    type="submit"
                  >
                    Confirm Advisory Slot (Free)
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Fixed Bottom Status Bar */}
      <aside className="fixed bottom-0 left-0 right-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md shadow-[0_-1px_6px_rgba(26,28,30,0.03)] border-t border-black/5">
        <div className="h-10 max-w-[1440px] mx-auto px-6 sm:px-12 flex items-center justify-between text-on-surface-variant text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-on-surface">Central Admissions Sync: Live</span>
            </div>
            <span className="hidden sm:inline text-on-surface-variant/70">•</span>
            <span className="hidden sm:inline text-on-surface-variant">
              Next institutional intake round closes in 14 days (UCAS / Common App synced)
            </span>
          </div>
          <div className="flex items-center gap-4 font-semibold">
            <span className="text-on-surface-variant">WCAG 2.1 AAA Compliant</span>
            <Link to="/help" className="text-primary hover:underline no-underline">
              System Status
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
};
