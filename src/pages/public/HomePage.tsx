import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { UserRole, DestinationCountry } from '@/types';
import {
  Search,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Euro,
  Sparkles,
  RefreshCw,
  Check,
  Building2,
  GraduationCap,
  MessageSquare,
  Compass,
  Clock,
  ChevronRight,
  X,
  BookOpen,
  FolderLock,
  Headphones,
  Users,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>('visitor');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isAdvisoryModalOpen, setIsAdvisoryModalOpen] = useState<boolean>(false);
  const [advisorySubmitted, setAdvisorySubmitted] = useState<boolean>(false);
  const [advisoryFormData, setAdvisoryFormData] = useState({
    fullName: '',
    email: '',
    targetDestination: '',
  });

  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.auth.getCurrentUser().then((u) => {
      if (u?.role) {
        setCurrentRole(u.role);
      }
    });
  }, []);

  // Handle Escape key to close advisory modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAdvisoryModalOpen) {
        setIsAdvisoryModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdvisoryModalOpen]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchTerm.trim();
    if (query) {
      navigate(`/universities?search=${encodeURIComponent(query)}`);
    } else {
      navigate('/universities');
    }
  };

  const handleSelectCountry = (country: string) => {
    setSearchTerm(`${country} `);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleSelectPreset = (preset: string) => {
    setSearchTerm(preset);
    navigate(`/universities?search=${encodeURIComponent(preset)}`);
  };

  const handleAdvisorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!advisoryFormData.fullName || !advisoryFormData.email) return;

    try {
      const raw = advisoryFormData.targetDestination.toLowerCase();
      const validCountry: DestinationCountry =
        (['germany', 'france', 'italy', 'romania'] as const).find((c) => raw.includes(c)) || 'germany';

      await api.requests.submitAccessRequest({
        fullName: advisoryFormData.fullName,
        email: advisoryFormData.email,
        countryInterests: [validCountry],
        requestedService: 'managed_application_case',
        consentPrivacy: true,
        isUpgrade: false,
        studentMessage: `Advisory inquiry for: ${advisoryFormData.targetDestination || 'Europe'}`,
      });
    } catch {
      // Fallback grace for preview/demo
    }

    setAdvisorySubmitted(true);
    setTimeout(() => {
      setIsAdvisoryModalOpen(false);
      setAdvisorySubmitted(false);
      setAdvisoryFormData({ fullName: '', email: '', targetDestination: '' });
    }, 2400);
  };

  return (
    <div className="relative min-h-screen bg-[#FBF9F5] text-on-surface antialiased overflow-x-hidden selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* 1. Ambient Background Light Orbs */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 -left-20 w-[600px] h-[600px] rounded-full bg-[#E8F7F2]/60 blur-[100px]"></div>
        <div className="absolute top-10 right-0 w-[550px] h-[550px] rounded-full bg-[#FFF0EB]/70 blur-[110px]"></div>
        <div className="absolute bottom-20 left-1/3 w-[450px] h-[450px] rounded-full bg-[#F3F0FA]/40 blur-[90px]"></div>
      </div>

      <div className="relative z-10 flex flex-col w-full">
        {/* 2. Hero & Mission Section */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 pt-8 pb-16 lg:pb-24 flex flex-col items-center text-center relative z-10">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white shadow-sm mb-6 border border-surface-container">
            <span className="w-2 h-2 rounded-full bg-emerald-600" aria-hidden="true"></span>
            <span className="font-label-md text-label-md text-on-surface tracking-wide">
              Pakistan to Europe Higher Education Admissions Desk
            </span>
            <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-bold ml-1">
              VERIFIED DESK
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface max-w-5xl tracking-tight mb-6">
            Your Entire Global Degree Journey.{' '}
            <span className="bg-gradient-to-r from-primary-container via-secondary-container to-primary text-transparent bg-clip-text">
              Tracked, Verified &amp; Guided.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-3xl leading-relaxed mb-8">
            Explore peer-verified public university programs across Germany, France, Italy, and Romania, track consular visa prerequisites, and collaborate in real-time with dedicated admissions counsellors.
          </p>

          {/* Dual Call to Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            <a
              href="#catalogue-search"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-body-sm-medium text-body-sm-medium text-on-primary bg-gradient-to-r from-[#FF5E36] to-[#FF2A55] shadow-lg shadow-primary-container/30 hover:opacity-95 active:scale-95 transition-all text-white no-underline"
            >
              <span>Explore University Catalogue</span>
              <ArrowRight size={18} aria-hidden="true" />
            </a>

            <button
              type="button"
              id="hero-request-advisory-btn"
              onClick={() => setIsAdvisoryModalOpen(true)}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-body-sm-medium text-body-sm-medium text-on-surface bg-white shadow-sm hover:bg-surface-container-low active:scale-95 transition-all border border-surface-container"
            >
              <Headphones size={20} className="text-primary" aria-hidden="true" />
              <span>Request 1-on-1 Advisory (Free)</span>
            </button>
          </div>

          {/* Verified Trust Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-4xl">
            <div className="flex items-center justify-center gap-3 px-6 py-3.5 rounded-full bg-white/80 backdrop-blur-md shadow-sm border border-surface-container">
              <CheckCircle2 size={24} className="text-emerald-600 flex-shrink-0" aria-hidden="true" />
              <div className="text-left">
                <p className="font-headline-sm text-headline-sm text-on-surface leading-tight font-bold">100%</p>
                <p className="font-label-sm text-label-sm text-on-surface-variant">Procedural Verification</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 px-6 py-3.5 rounded-full bg-white/80 backdrop-blur-md shadow-sm border border-surface-container">
              <Euro size={24} className="text-primary flex-shrink-0" aria-hidden="true" />
              <div className="text-left">
                <p className="font-headline-sm text-headline-sm text-on-surface leading-tight font-bold">4 Corridors</p>
                <p className="font-label-sm text-label-sm text-on-surface-variant">Germany, France, Italy, Romania</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 px-6 py-3.5 rounded-full bg-white/80 backdrop-blur-md shadow-sm border border-surface-container">
              <ShieldCheck size={24} className="text-tertiary flex-shrink-0" aria-hidden="true" />
              <div className="text-left">
                <p className="font-headline-sm text-headline-sm text-on-surface leading-tight font-bold">Statutory</p>
                <p className="font-label-sm text-label-sm text-on-surface-variant">APS, HEC &amp; Consular Standard</p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Interactive Program & Destination Search Bento */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 mb-24 relative z-10" id="catalogue-search">
          <div className="rounded-2xl p-6 sm:p-10 bg-white shadow-xl shadow-on-surface/[0.04] border border-surface-container">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
              <div>
                <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider font-bold">
                  Direct Admissions Engine
                </span>
                <h2 className="font-headline-xl text-headline-xl text-on-surface mt-1 font-bold">
                  Instant Verified Program Lookup
                </h2>
              </div>
              <div className="flex items-center gap-2 font-label-md text-label-md text-on-surface-variant">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true"></span>
                <span>4,812 active degree intakes refreshed today</span>
              </div>
            </div>

            {/* Pill-shaped Large Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative flex items-center mb-6">
              <Search className="absolute left-6 text-on-surface-variant text-[24px]" size={24} aria-hidden="true" />
              <input
                ref={searchInputRef}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                id="program-search-input"
                className="w-full pl-16 pr-32 py-5 rounded-full bg-surface-container-low font-body-lg text-body-lg text-on-surface placeholder:text-on-surface-variant/70 outline-none focus:bg-white focus:shadow-md focus:ring-2 focus:ring-primary-container transition-all border border-transparent focus:border-primary-fixed"
                placeholder="Search universities, degree programs, or scholarships (e.g. TUM, Data Science, DAAD, Erasmus)..."
                type="text"
                aria-label="Search degree catalogue"
              />
              <button
                type="submit"
                id="program-search-submit-btn"
                className="absolute right-3 px-6 py-3 rounded-full font-body-sm-medium text-body-sm-medium text-white bg-gradient-to-r from-[#FF5E36] to-[#FF2A55] shadow-md shadow-primary-container/20 hover:opacity-95 transition-opacity"
              >
                Search
              </button>
            </form>

            {/* Filter Chips & Suggestion Pills */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2">
              {/* Country Filter Pills */}
              <div className="flex items-center gap-2 flex-wrap" id="country-pill-group">
                <span className="font-label-md text-label-md text-on-surface-variant mr-1 font-medium">Hot destinations:</span>
                {[
                  { name: 'Germany', flag: '🇩🇪' },
                  { name: 'France', flag: '🇫🇷' },
                  { name: 'Italy', flag: '🇮🇹' },
                  { name: 'Romania', flag: '🇷🇴' },
                  { name: 'United Kingdom', flag: '🇬🇧' },
                  { name: 'Netherlands', flag: '🇳🇱' },
                  { name: 'Sweden', flag: '🇸🇪' },
                  { name: 'Switzerland', flag: '🇨🇭' },
                  { name: 'Ireland', flag: '🇮🇪' },
                ].map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => handleSelectCountry(item.name)}
                    className="px-3.5 py-1.5 rounded-full font-label-md text-label-md bg-surface-container-low text-on-surface hover:bg-surface-container-highest transition-colors active:scale-95 flex items-center gap-1.5 border border-surface-container"
                  >
                    <span>{item.name}</span> <span>{item.flag}</span>
                  </button>
                ))}
              </div>

              {/* Quick Query Suggestions */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-label-md text-label-md text-on-surface-variant font-medium">Presets:</span>
                <button
                  type="button"
                  onClick={() => handleSelectPreset("Tuition-Free Master's")}
                  className="px-3 py-1 rounded-full font-label-sm text-label-sm bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-200"
                >
                  Tuition-Free Master&apos;s
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPreset('100% English Taught')}
                  className="px-3 py-1 rounded-full font-label-sm text-label-sm bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-200"
                >
                  100% English Taught
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPreset('Direct Intake 2025')}
                  className="px-3 py-1 rounded-full font-label-sm text-label-sm bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors border border-amber-200"
                >
                  Direct Intake 2025
                </button>
              </div>
            </div>

            {/* Dynamic Results Teaser Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-8 border-t border-surface-container-low">
              {/* Card 1 */}
              <div
                onClick={() => navigate('/universities?country=germany')}
                className="p-5 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-all cursor-pointer flex flex-col justify-between border border-surface-container"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-label-sm text-label-sm px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                      €0 Tuition (TUM)
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">Fall 2025</span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    M.Sc. Robotics, Cognition &amp; Intelligence
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                    Technical University of Munich • Munich, Germany
                  </p>
                </div>
                <div className="mt-4 pt-3 flex items-center justify-between font-label-md text-label-md text-primary font-semibold">
                  <span>APS &amp; VPD Verification Ready</span>
                  <ChevronRight size={18} aria-hidden="true" />
                </div>
              </div>

              {/* Card 2 */}
              <div
                onClick={() => navigate('/universities')}
                className="p-5 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-all cursor-pointer flex flex-col justify-between border border-surface-container"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-label-sm text-label-sm px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-semibold">
                      Full Scholarship Option
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">Sept 2025</span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    M.Sc. Artificial Intelligence &amp; Data Ethics
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                    University of Edinburgh • Edinburgh, UK
                  </p>
                </div>
                <div className="mt-4 pt-3 flex items-center justify-between font-label-md text-label-md text-primary font-semibold">
                  <span>Common App &amp; UCAS Bridge</span>
                  <ChevronRight size={18} aria-hidden="true" />
                </div>
              </div>

              {/* Card 3 */}
              <div
                onClick={() => navigate('/universities')}
                className="p-5 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-all cursor-pointer flex flex-col justify-between border border-surface-container"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-label-sm text-label-sm px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 font-semibold">
                      Erasmus+ Mundus Grant
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">Spring 2026</span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    M.Sc. Sustainable Energy Technology
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                    TU Delft • Delft, Netherlands
                  </p>
                </div>
                <div className="mt-4 pt-3 flex items-center justify-between font-label-md text-label-md text-primary font-semibold">
                  <span>Studielink Auto-Sync</span>
                  <ChevronRight size={18} aria-hidden="true" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Global University Partners / Institutional Ticker */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 mb-24 relative z-10 text-center">
          <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-8 font-semibold">
            Direct Admission Data Partnerships With 350+ European &amp; Global Institutions
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-14 opacity-80">
            <div className="flex items-center gap-2 text-on-surface font-headline-sm text-headline-sm font-semibold">
              <Building2 className="text-primary" size={28} aria-hidden="true" />
              <span>TU Munich</span>
            </div>
            <div className="flex items-center gap-2 text-on-surface font-headline-sm text-headline-sm font-semibold">
              <GraduationCap className="text-tertiary" size={28} aria-hidden="true" />
              <span>Univ. of Edinburgh</span>
            </div>
            <div className="flex items-center gap-2 text-on-surface font-headline-sm text-headline-sm font-semibold">
              <Building2 className="text-[#FF5E36]" size={28} aria-hidden="true" />
              <span>TU Delft</span>
            </div>
            <div className="flex items-center gap-2 text-on-surface font-headline-sm text-headline-sm font-semibold">
              <Compass className="text-emerald-600" size={28} aria-hidden="true" />
              <span>ETH Zurich</span>
            </div>
            <div className="flex items-center gap-2 text-on-surface font-headline-sm text-headline-sm font-semibold">
              <Sparkles className="text-purple-600" size={28} aria-hidden="true" />
              <span>Karolinska Inst.</span>
            </div>
            <div className="flex items-center gap-2 text-on-surface font-headline-sm text-headline-sm font-semibold">
              <BookOpen className="text-amber-600" size={28} aria-hidden="true" />
              <span>Trinity College Dublin</span>
            </div>
          </div>
        </section>

        {/* 5. Core Platform Pillars (Bento Grid) */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 mb-24 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider font-bold">
              Unilistics Core Architecture
            </span>
            <h2 className="font-headline-xl text-headline-xl text-on-surface mt-2 mb-4 font-bold">
              Engineered to eliminate admissions friction
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Admissions are fragmented across regional portals, foreign credential bodies, and archaic consular rules. Unilistics centralizes the entire protocol into one luminous, synchronized workspace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pillar 1 */}
            <div className="rounded-2xl p-8 bg-white shadow-lg shadow-on-surface/[0.03] flex flex-col justify-between group hover:-translate-y-1 transition-transform border border-surface-container">
              <div>
                <div className="w-14 h-14 rounded-full bg-primary-fixed flex items-center justify-center text-primary mb-6">
                  <Compass size={28} aria-hidden="true" />
                </div>
                <span className="font-label-sm text-label-sm text-primary uppercase font-bold">Pillar 01</span>
                <h3 className="font-headline-md text-headline-md text-on-surface mt-1 mb-3 font-bold">
                  Smart Catalogue Explorer
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed mb-6">
                  Algorithmic filtering calibrated for international applicants. Model tuition fees, language barriers, ECTS module equivalency, and live intake closing countdowns down to the minute.
                </p>
                {/* Mini Feature Metric Illustration */}
                <div className="p-4 rounded-xl bg-surface-container-low mb-6 border border-surface-container">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">ECTS Compatibility Meter</span>
                    <span className="font-label-sm text-label-sm text-emerald-600 font-bold">100% Match (180 ECTS)</span>
                  </div>
                  <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full w-full"></div>
                  </div>
                </div>
              </div>
              <Link
                to="/universities"
                className="flex items-center text-primary font-body-sm-medium text-body-sm-medium gap-1 group-hover:gap-2 transition-all no-underline font-semibold"
              >
                <span>Explore catalogue filters</span>
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>

            {/* Pillar 2 */}
            <div className="rounded-2xl p-8 bg-white shadow-lg shadow-on-surface/[0.03] flex flex-col justify-between group hover:-translate-y-1 transition-transform border border-surface-container">
              <div>
                <div className="w-14 h-14 rounded-full bg-tertiary-fixed flex items-center justify-center text-tertiary mb-6">
                  <FolderLock size={28} aria-hidden="true" />
                </div>
                <span className="font-label-sm text-label-sm text-tertiary uppercase font-bold">Pillar 02</span>
                <h3 className="font-headline-md text-headline-md text-on-surface mt-1 mb-3 font-bold">
                  Verified Document Vault
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed mb-6">
                  Zero-knowledge encrypted repository with auto-OCR parsing. Instantly audit apostilled transcripts, IELTS/TOEFL scores, motivation letters, and consular bank solvency affidavits.
                </p>
                {/* Document Status Visual */}
                <div className="p-4 rounded-xl bg-surface-container-low mb-6 space-y-2.5 border border-surface-container">
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="flex items-center gap-2 text-on-surface font-body-sm-medium">
                      <CheckCircle2 size={16} className="text-emerald-600" aria-hidden="true" />
                      Official Bachelor Degree VPD
                    </span>
                    <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                      Verified
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="flex items-center gap-2 text-on-surface font-body-sm-medium">
                      <CheckCircle2 size={16} className="text-emerald-600" aria-hidden="true" />
                      IELTS Academic (Band 8.0)
                    </span>
                    <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                      Verified
                    </span>
                  </div>
                </div>
              </div>
              <Link
                to="/help"
                className="flex items-center text-tertiary font-body-sm-medium text-body-sm-medium gap-1 group-hover:gap-2 transition-all no-underline font-semibold"
              >
                <span>Learn about zero-fail verification</span>
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>

            {/* Pillar 3 */}
            <div className="rounded-2xl p-8 bg-white shadow-lg shadow-on-surface/[0.03] flex flex-col justify-between group hover:-translate-y-1 transition-transform border border-surface-container">
              <div>
                <div className="w-14 h-14 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary mb-6">
                  <Users size={28} aria-hidden="true" />
                </div>
                <span className="font-label-sm text-label-sm text-secondary uppercase font-bold">Pillar 03</span>
                <h3 className="font-headline-md text-headline-md text-on-surface mt-1 mb-3 font-bold">
                  Real-time Counsellor Sync
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed mb-6">
                  Direct case-management chat with accredited advisors. Receive milestone reminders, real-time feedback on SOP drafts, and instant webhook updates as your institutional application progresses.
                </p>
                {/* Mini Chat Notification Simulation */}
                <div className="p-4 rounded-xl bg-surface-container-low mb-6 flex items-start gap-3 border border-surface-container">
                  <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center font-label-md text-label-md flex-shrink-0 font-bold">
                    SJ
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="font-body-sm-medium text-body-sm-medium text-on-surface font-semibold">
                        Sarah Jenkins (Advisor)
                      </span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">10m ago</span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                      &quot;Your TUM curriculum analysis is approved. We can submit via Uni-Assist tomorrow.&quot;
                    </p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAdvisoryModalOpen(true)}
                className="flex items-center text-secondary font-body-sm-medium text-body-sm-medium gap-1 group-hover:gap-2 transition-all font-semibold"
              >
                <span>Book advisory session</span>
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            </div>
          </div>
        </section>

        {/* 6. Live Application Tracker Preview (Interactive Showcase) */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 mb-24 relative z-10">
          <div className="rounded-2xl p-6 sm:p-12 bg-gradient-to-br from-white via-white/95 to-surface-container-low shadow-xl border border-surface-container">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-10 pb-8 border-b border-surface-container-high">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-label-sm text-label-sm mb-3 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true"></span>
                  Live Synced Student Record
                </div>
                <h2 className="font-headline-xl text-headline-xl text-on-surface font-bold">
                  Inside the Applicant Experience
                </h2>
                <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">
                  Watch how applicant Elena Rostova tracks her master&apos;s admission progress seamlessly across institutions.
                </p>
              </div>
              <div className="flex items-center gap-3 self-stretch sm:self-auto justify-end">
                <span className="px-4 py-2 rounded-full bg-surface-container font-label-md text-label-md text-on-surface font-mono">
                  Intake ID: #DE-TUM-2025-09
                </span>
                <Link
                  to={currentRole === 'visitor' ? '/sign-in' : '/student'}
                  className="px-5 py-2 rounded-full bg-primary text-white font-body-sm-medium text-body-sm-medium shadow-md shadow-primary-container/20 hover:opacity-95 transition-opacity no-underline"
                >
                  Launch Live Portal
                </Link>
              </div>
            </div>

            {/* Application Card Mosaic */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Main Milestone Tracker (8 Columns) */}
              <div className="lg:col-span-8 rounded-2xl p-6 sm:p-8 bg-white shadow-sm flex flex-col justify-between border border-surface-container">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-headline-sm font-bold">
                        TUM
                      </div>
                      <div>
                        <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                          Technical University of Munich
                        </h3>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          M.Sc. Robotics, Cognition, Intelligence • Munich Campus
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full font-label-sm text-label-sm bg-blue-100 text-blue-800 font-semibold">
                        Stage 4 of 6: Institutional Review
                      </span>
                    </div>
                  </div>

                  {/* Interactive Milestone Stepper Nodes */}
                  <div className="my-8">
                    <div className="flex items-center justify-between relative">
                      {/* Stepper Bar Background */}
                      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-surface-container-high z-0"></div>
                      {/* Stepper Bar Active Progress */}
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-emerald-500 to-[#FF5E36] w-[65%] z-0"></div>

                      {/* Step 1 (Completed) */}
                      <div className="relative z-10 flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                          <Check size={16} aria-hidden="true" />
                        </div>
                        <span className="font-label-sm text-label-sm text-on-surface mt-2 font-medium">VPD Issued</span>
                      </div>

                      {/* Step 2 (Completed) */}
                      <div className="relative z-10 flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                          <Check size={16} aria-hidden="true" />
                        </div>
                        <span className="font-label-sm text-label-sm text-on-surface mt-2 font-medium">APS Certified</span>
                      </div>

                      {/* Step 3 (Completed) */}
                      <div className="relative z-10 flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                          <Check size={16} aria-hidden="true" />
                        </div>
                        <span className="font-label-sm text-label-sm text-on-surface mt-2 font-medium">SOP Verified</span>
                      </div>

                      {/* Step 4 (Active In Progress) */}
                      <div className="relative z-10 flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-[#FF5E36] text-white flex items-center justify-center shadow-md shadow-primary-container/40 ring-4 ring-[#FF5E36]/20">
                          <RefreshCw size={16} className="animate-spin" aria-hidden="true" />
                        </div>
                        <span className="font-label-sm text-label-sm text-primary font-bold mt-2">Faculty Audit</span>
                      </div>

                      {/* Step 5 (Upcoming) */}
                      <div className="relative z-10 flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center">
                          <span className="w-2 h-2 rounded-full bg-on-surface-variant"></span>
                        </div>
                        <span className="font-label-sm text-label-sm text-on-surface-variant mt-2">Offer Letter</span>
                      </div>

                      {/* Step 6 (Upcoming) */}
                      <div className="relative z-10 flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center">
                          <span className="w-2 h-2 rounded-full bg-on-surface-variant"></span>
                        </div>
                        <span className="font-label-sm text-label-sm text-on-surface-variant mt-2">Visa Sync</span>
                      </div>
                    </div>
                  </div>

                  {/* Task Checkbox Summary */}
                  <div className="bg-surface-container-low p-4 rounded-xl space-y-3 mt-6 border border-surface-container">
                    <div className="flex items-center justify-between text-on-surface font-body-sm-medium text-body-sm-medium">
                      <span>Intake Tasks: 3 of 7 completed</span>
                      <span className="text-primary font-bold">42% Overall Readiness</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[13px]">
                      <div className="flex items-center gap-2 text-on-surface-variant">
                        <CheckCircle2 size={18} className="text-emerald-600" aria-hidden="true" />
                        <span>Submit TUMonline Curriculum Matrix</span>
                      </div>
                      <div className="flex items-center gap-2 text-on-surface-variant">
                        <CheckCircle2 size={18} className="text-emerald-600" aria-hidden="true" />
                        <span>German Health Insurance Exemption</span>
                      </div>
                      <div className="flex items-center gap-2 text-on-surface font-body-sm-medium">
                        <Clock size={18} className="text-primary" aria-hidden="true" />
                        <span>Upload Blocked Account Confirmation</span>
                      </div>
                      <div className="flex items-center gap-2 text-on-surface-variant">
                        <div className="w-[18px] h-[18px] rounded-full border-2 border-on-surface-variant/40" aria-hidden="true"></div>
                        <span>Enrollment Acceptance Fee Transfer</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Meta */}
                <div className="mt-6 pt-4 border-t border-surface-container-low flex flex-wrap items-center justify-between gap-2 text-on-surface-variant font-label-md text-label-md">
                  <span className="flex items-center gap-1.5">
                    <RefreshCw size={14} className="text-emerald-600 animate-spin" aria-hidden="true" />
                    Direct TUMonline webhook sync active (last ping: 4 min ago)
                  </span>
                  <Link to="/student" className="text-primary hover:underline font-semibold no-underline">
                    View full dossier &rarr;
                  </Link>
                </div>
              </div>

              {/* Advisor Case File & Insights (4 Columns) */}
              <div className="lg:col-span-4 rounded-2xl p-6 sm:p-8 bg-white shadow-sm flex flex-col justify-between border border-surface-container">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-primary-fixed"
                      alt="Sarah Jenkins"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDIUyBU9_fzriNdHMjzND-ioGLzvBJ5CzN7VocznW8h5D8JC8fBItk_aV_4y_VYa2LZgnY2cw3YGE10maDSKQO87LwaRWO9KvfJWdbBTuZKMekzJwhf_a2p6_yqCw5FGVygOTGXI3XWKbO2RewyE-blToe6JykpqeEDyb-5fyMWNBYOrGOtHdxq_KCmF5tSYAqAsPYLUXyz7hAxlY145tKmuwNO_wDUHj1g54eSvxxWklUtWuwfAgdA"
                    />
                    <div>
                      <h4 className="font-headline-sm text-headline-sm text-on-surface leading-tight font-bold">
                        Sarah Jenkins
                      </h4>
                      <p className="font-label-sm text-label-sm text-primary font-semibold">
                        Senior DAAD Advisory Fellow
                      </p>
                    </div>
                  </div>

                  {/* Advisor Note Quote Box */}
                  <div className="p-4 rounded-xl bg-amber-50/70 border-l-4 border-amber-400 mb-6">
                    <p className="font-body-sm text-body-sm text-on-surface leading-snug">
                      &quot;Elena, we have completely satisfied TUM&apos;s theoretical computer science module minimums. I have placed your blocked account affidavit in priority queue for consular review.&quot;
                    </p>
                  </div>

                  {/* Quick Document Verifications */}
                  <div className="space-y-3">
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                      Verified Dossier Items
                    </span>
                    <div className="flex items-center justify-between p-2.5 rounded-full bg-surface-container-low px-4 border border-surface-container">
                      <span className="font-body-sm text-body-sm text-on-surface truncate pr-2">Apostilled Transcript.pdf</span>
                      <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" aria-hidden="true" />
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-full bg-surface-container-low px-4 border border-surface-container">
                      <span className="font-body-sm text-body-sm text-on-surface truncate pr-2">IELTS_Academic_8.0.pdf</span>
                      <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" aria-hidden="true" />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAdvisoryModalOpen(true)}
                  className="w-full mt-6 py-2.5 rounded-full font-body-sm-medium text-body-sm-medium text-on-surface bg-surface-container hover:bg-surface-container-high transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <MessageSquare size={18} aria-hidden="true" />
                  <span>Open Advisor Thread (3 New)</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Scholarship & Tuition Transparency Guarantee */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 mb-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm mb-4 font-bold">
                <ShieldCheck size={16} aria-hidden="true" />
                The Unilistics Data Standard
              </div>
              <h2 className="font-headline-xl text-headline-xl text-on-surface mb-4 leading-tight font-bold">
                Zero speculation. Every tuition euro, deadline &amp; prerequisite verified.
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant mb-6">
                Unlike static university search aggregators, our intelligence team performs bi-weekly direct audits against university academic senates, state education ministries, and consular embassy updates.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                    <RefreshCw size={16} aria-hidden="true" />
                  </div>
                  <div>
                    <h4 className="font-body-lg-medium text-body-lg-medium text-on-surface font-semibold">
                      14-Day Senate Verification Cycle
                    </h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      All intake deadlines and language benchmark alterations are refreshed directly against official university gazettes.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                    <Euro size={16} aria-hidden="true" />
                  </div>
                  <div>
                    <h4 className="font-body-lg-medium text-body-lg-medium text-on-surface font-semibold">
                      Hidden Fee Auditing
                    </h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      We decode campus semester contributions (Semesterbeitrag), transit passes, and state non-EU tuition surcharge exemptions.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                    <CheckCircle2 size={16} aria-hidden="true" />
                  </div>
                  <div>
                    <h4 className="font-body-lg-medium text-body-lg-medium text-on-surface font-semibold">
                      Consular Blocked Account Alignment
                    </h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Calculators synchronized with the Federal Foreign Office&apos;s latest living cost stipulations (€11,208/yr baseline).
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="rounded-2xl p-6 sm:p-8 bg-white shadow-xl relative overflow-hidden border border-surface-container">
                <div className="flex items-center justify-between mb-6">
                  <span className="font-label-md text-label-md font-bold text-on-surface">
                    Recent University Senate Verifications
                  </span>
                  <span className="font-label-sm text-label-sm text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 font-semibold">
                    All Systems Normal
                  </span>
                </div>

                {/* Verification Feed Rows */}
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-surface-container-low flex items-center justify-between border border-surface-container">
                    <div className="flex items-center gap-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" aria-hidden="true"></span>
                      <div>
                        <p className="font-body-sm-medium text-body-sm-medium text-on-surface font-semibold">
                          Ludwig Maximilian University of Munich (LMU)
                        </p>
                        <p className="font-label-sm text-label-sm text-on-surface-variant">
                          M.Sc. Data Science: German B2 proficiency requirement waived for 2025
                        </p>
                      </div>
                    </div>
                    <span className="font-label-sm text-label-sm text-on-surface-variant flex-shrink-0">Verified 2h ago</span>
                  </div>

                  <div className="p-4 rounded-xl bg-surface-container-low flex items-center justify-between border border-surface-container">
                    <div className="flex items-center gap-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" aria-hidden="true"></span>
                      <div>
                        <p className="font-body-sm-medium text-body-sm-medium text-on-surface font-semibold">
                          Erasmus University Rotterdam
                        </p>
                        <p className="font-label-sm text-label-sm text-on-surface-variant">
                          Rotterdam School of Management: GMAT Focus Edition conversion locked
                        </p>
                      </div>
                    </div>
                    <span className="font-label-sm text-label-sm text-on-surface-variant flex-shrink-0">Verified 5h ago</span>
                  </div>

                  <div className="p-4 rounded-xl bg-surface-container-low flex items-center justify-between border border-surface-container">
                    <div className="flex items-center gap-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" aria-hidden="true"></span>
                      <div>
                        <p className="font-body-sm-medium text-body-sm-medium text-on-surface font-semibold">
                          University of Manchester
                        </p>
                        <p className="font-label-sm text-label-sm text-on-surface-variant">
                          Faculty of Science &amp; Engineering: Global Futures Scholarship round live
                        </p>
                      </div>
                    </div>
                    <span className="font-label-sm text-label-sm text-on-surface-variant flex-shrink-0">Verified 9h ago</span>
                  </div>

                  <div className="p-4 rounded-xl bg-surface-container-low flex items-center justify-between border border-surface-container">
                    <div className="flex items-center gap-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" aria-hidden="true"></span>
                      <div>
                        <p className="font-body-sm-medium text-body-sm-medium text-on-surface font-semibold">
                          KTH Royal Institute of Technology
                        </p>
                        <p className="font-label-sm text-label-sm text-on-surface-variant">
                          Stockholm tuition waivers confirmed: 15% increase in STEM allocations
                        </p>
                      </div>
                    </div>
                    <span className="font-label-sm text-label-sm text-on-surface-variant flex-shrink-0">Verified 1d ago</span>
                  </div>
                </div>

                {/* Procedural Standard Banner */}
                <div className="mt-6 pt-6 border-t border-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={28} className="text-primary flex-shrink-0" aria-hidden="true" />
                    <div>
                      <p className="font-body-sm-medium text-body-sm-medium text-on-surface font-bold">
                        The Unilistics Procedural Accuracy Standard
                      </p>
                      <p className="font-label-sm text-label-sm text-on-surface-variant">
                        Structured prerequisite verification aligned with statutory embassy and admissions protocols.
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/help"
                    className="px-4 py-2 rounded-full font-label-md text-label-md text-primary bg-primary-fixed hover:bg-primary-fixed-dim transition-colors flex-shrink-0 font-bold no-underline"
                  >
                    View Audit Protocol
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 8. Bottom Action CTA Banner */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 mb-20 relative z-10">
          <div className="rounded-3xl p-8 sm:p-14 bg-gradient-to-r from-primary-container via-secondary-container to-primary text-white shadow-2xl relative overflow-hidden">
            {/* Decorative Ambient Light Orbs Inside CTA */}
            <div className="absolute -right-10 -bottom-10 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none" aria-hidden="true"></div>
            <div className="absolute -left-10 -top-10 w-72 h-72 rounded-full bg-white/10 blur-2xl pointer-events-none" aria-hidden="true"></div>

            <div className="relative z-10 max-w-3xl">
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md font-label-sm text-label-sm text-white uppercase tracking-wide inline-block mb-4 font-bold">
                European Higher Education Corridors
              </span>
              <h2 className="font-display-lg text-display-lg-mobile md:text-display-lg font-bold text-white tracking-tight mb-4">
                Ready to plan your international degree?
              </h2>
              <p className="font-body-lg text-body-lg text-white/90 mb-8 max-w-2xl leading-relaxed">
                Explore curated public university catalogues across Germany, France, Italy, and Romania with verified entry requirements and consular visa guidance.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  to="/universities"
                  className="px-8 py-3.5 rounded-full font-body-sm-medium text-body-sm-medium text-primary bg-white hover:bg-surface-container-low shadow-lg active:scale-95 transition-all no-underline font-bold"
                >
                  Explore University Catalogue
                </Link>
                <Link
                  to={currentRole === 'visitor' ? '/sign-in' : '/student'}
                  className="px-8 py-3.5 rounded-full font-body-sm-medium text-body-sm-medium text-white bg-white/20 hover:bg-white/30 backdrop-blur-md active:scale-95 transition-all no-underline font-semibold"
                >
                  {currentRole === 'visitor' ? 'Sign In to Portal' : 'My Student Workspace'}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* 10. Advisory Modal: Request 1-on-1 Advisory */}
      {isAdvisoryModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
          aria-labelledby="advisory-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAdvisoryModalOpen(false);
          }}
        >
          <div
            ref={modalRef}
            className="w-full max-w-lg rounded-3xl p-8 bg-white shadow-2xl relative border border-surface-container animate-in zoom-in-95 duration-150"
          >
            <button
              type="button"
              id="close-advisory-modal-btn"
              onClick={() => setIsAdvisoryModalOpen(false)}
              className="absolute top-6 right-6 w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
              aria-label="Close advisory dialog"
            >
              <X size={18} aria-hidden="true" />
            </button>

            <span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider">
              Advisory Concierge
            </span>
            <h3 id="advisory-modal-title" className="font-headline-md text-headline-md text-on-surface mt-1 mb-2 font-bold">
              Book Free 1-on-1 Academic Audit
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-6">
              Connect with an accredited DAAD or European admissions fellow for a 30-minute eligibility appraisal.
            </p>

            {advisorySubmitted ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <CheckCircle2 size={36} className="text-emerald-600 mx-auto" aria-hidden="true" />
                <h4 className="font-headline-sm text-headline-sm text-emerald-900 font-bold">Request Dispatched</h4>
                <p className="font-body-sm text-body-sm text-emerald-800">
                  Your advisory request has been dispatched. An advisor will contact you within 4 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleAdvisorySubmit} className="space-y-4">
                <div>
                  <label htmlFor="adv-name" className="block font-label-md text-label-md text-on-surface mb-1.5 font-semibold">
                    Full Legal Name
                  </label>
                  <input
                    id="adv-name"
                    required
                    value={advisoryFormData.fullName}
                    onChange={(e) => setAdvisoryFormData({ ...advisoryFormData, fullName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-full bg-surface-container-low font-body-sm text-body-sm text-on-surface outline-none focus:ring-2 focus:ring-primary-container border border-surface-container"
                    placeholder="Elena Rostova"
                    type="text"
                  />
                </div>

                <div>
                  <label htmlFor="adv-email" className="block font-label-md text-label-md text-on-surface mb-1.5 font-semibold">
                    Email Address
                  </label>
                  <input
                    id="adv-email"
                    required
                    value={advisoryFormData.email}
                    onChange={(e) => setAdvisoryFormData({ ...advisoryFormData, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-full bg-surface-container-low font-body-sm text-body-sm text-on-surface outline-none focus:ring-2 focus:ring-primary-container border border-surface-container"
                    placeholder="elena@example.com"
                    type="email"
                  />
                </div>

                <div>
                  <label htmlFor="adv-dest" className="block font-label-md text-label-md text-on-surface mb-1.5 font-semibold">
                    Target Destination &amp; Degree
                  </label>
                  <input
                    id="adv-dest"
                    value={advisoryFormData.targetDestination}
                    onChange={(e) => setAdvisoryFormData({ ...advisoryFormData, targetDestination: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-full bg-surface-container-low font-body-sm text-body-sm text-on-surface outline-none focus:ring-2 focus:ring-primary-container border border-surface-container"
                    placeholder="e.g. Germany — Master in Computer Science"
                    type="text"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    id="confirm-advisory-slot-btn"
                    className="w-full py-3.5 rounded-full font-body-sm-medium text-body-sm-medium text-white bg-gradient-to-r from-[#FF5E36] to-[#FF2A55] shadow-md shadow-primary-container/30 hover:opacity-95 transition-opacity font-bold"
                  >
                    Confirm Advisory Slot (Free)
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
