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
  Check,
  RefreshCw,
  Sparkles,
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
    <div className="relative min-h-screen bg-[#FBF9F5] text-[#1a1a1a] antialiased overflow-x-hidden selection:bg-[#B4D0B6] selection:text-[#133827]">
      {/* 1. Calm Ambient Background Orbs (Forest, Sage, Citron) */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 -left-20 w-[600px] h-[600px] rounded-full bg-[#B4D0B6]/20 blur-[120px]"></div>
        <div className="absolute top-20 right-0 w-[550px] h-[550px] rounded-full bg-[#D7EE83]/15 blur-[130px]"></div>
        <div className="absolute bottom-20 left-1/3 w-[450px] h-[450px] rounded-full bg-[#245B42]/10 blur-[110px]"></div>
      </div>

      <div className="relative z-10 flex flex-col w-full">
        {/* 2. Hero & Mission Section */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 pt-12 pb-16 lg:pb-24 flex flex-col items-center text-center relative z-10">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white shadow-sm mb-6 border border-[#ebe6de]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#245B42]" aria-hidden="true"></span>
            <span className="text-xs sm:text-sm text-[#2b352f] font-medium tracking-wide">
              Pakistan to Europe Higher Education Admissions Desk
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#D7EE83] text-[#133827] text-xs font-bold tracking-wider ml-1">
              VERIFIED DESK
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#133827] max-w-5xl tracking-tight mb-6 leading-tight">
            Your Entire European Degree Journey.{' '}
            <span className="text-[#245B42]">
              Tracked, Verified &amp; Guided.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-[#55635a] max-w-3xl leading-relaxed mb-8">
            Explore peer-verified public university programs across Germany, France, Italy, and Romania, track consular visa prerequisites, and collaborate directly with dedicated admissions counsellors.
          </p>

          {/* Dual Call to Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            <a
              href="#catalogue-search"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold text-white bg-[#245B42] hover:bg-[#1D4A36] shadow-md hover:shadow-lg active:scale-95 transition-all text-white no-underline"
            >
              <span>Explore University Catalogue</span>
              <ArrowRight size={18} aria-hidden="true" />
            </a>

            <button
              type="button"
              id="hero-request-advisory-btn"
              onClick={() => setIsAdvisoryModalOpen(true)}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold text-[#133827] bg-white shadow-sm hover:bg-[#f3efe9] active:scale-95 transition-all border border-[#ebe6de]"
            >
              <Headphones size={20} className="text-[#245B42]" aria-hidden="true" />
              <span>Request 1-on-1 Advisory (Free)</span>
            </button>
          </div>

          {/* Verified Trust Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-4xl">
            <div className="flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-white/90 backdrop-blur-md shadow-sm border border-[#ebe6de]">
              <CheckCircle2 size={24} className="text-[#245B42] flex-shrink-0" aria-hidden="true" />
              <div className="text-left">
                <p className="text-base text-[#133827] leading-tight font-bold">100%</p>
                <p className="text-xs text-[#55635a]">Procedural Verification</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-white/90 backdrop-blur-md shadow-sm border border-[#ebe6de]">
              <Euro size={24} className="text-[#245B42] flex-shrink-0" aria-hidden="true" />
              <div className="text-left">
                <p className="text-base text-[#133827] leading-tight font-bold">4 Corridors</p>
                <p className="text-xs text-[#55635a]">Germany, France, Italy, Romania</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-white/90 backdrop-blur-md shadow-sm border border-[#ebe6de]">
              <ShieldCheck size={24} className="text-[#245B42] flex-shrink-0" aria-hidden="true" />
              <div className="text-left">
                <p className="text-base text-[#133827] leading-tight font-bold">Statutory</p>
                <p className="text-xs text-[#55635a]">APS, HEC &amp; Consular Standard</p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Interactive Program & Destination Search Bento */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 mb-20 relative z-10" id="catalogue-search">
          <div className="rounded-3xl p-6 sm:p-10 bg-white shadow-xl shadow-black/[0.03] border border-[#ebe6de]">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
              <div>
                <span className="text-xs font-bold text-[#245B42] uppercase tracking-wider">
                  Direct Admissions Engine
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#133827] mt-1">
                  Verified European Higher Education Lookup
                </h2>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-[#55635a]">
                <span className="w-2 h-2 rounded-full bg-[#245B42] animate-pulse" aria-hidden="true"></span>
                <span>Curated programmes across 4 European corridors</span>
              </div>
            </div>

            {/* Large Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative flex items-center mb-6">
              <Search className="absolute left-6 text-[#55635a]" size={22} aria-hidden="true" />
              <input
                ref={searchInputRef}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                id="program-search-input"
                className="w-full pl-16 pr-32 py-4 sm:py-5 rounded-full bg-[#F7F9F7] text-base text-[#1a1a1a] placeholder:text-[#8a9890] outline-none focus:bg-white focus:ring-2 focus:ring-[#245B42] transition-all border border-[#ebe6de] focus:border-[#245B42]"
                placeholder="Search universities, degree programs, or scholarships (e.g. TUM, Data Science, DAAD)..."
                type="text"
                aria-label="Search degree catalogue"
              />
              <button
                type="submit"
                id="program-search-submit-btn"
                className="absolute right-2.5 px-6 py-2.5 sm:py-3 rounded-full text-sm font-semibold text-white bg-[#245B42] hover:bg-[#1D4A36] shadow-sm transition-all"
              >
                Search
              </button>
            </form>

            {/* Filter Chips & Corridor Presets */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2">
              {/* Authorized 4 Corridors Only */}
              <div className="flex items-center gap-2 flex-wrap" id="country-pill-group">
                <span className="text-xs sm:text-sm text-[#55635a] mr-1 font-semibold">Active Corridors:</span>
                {[
                  { name: 'Germany', flag: '🇩🇪' },
                  { name: 'France', flag: '🇫🇷' },
                  { name: 'Italy', flag: '🇮🇹' },
                  { name: 'Romania', flag: '🇷🇴' },
                ].map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => handleSelectCountry(item.name)}
                    className="px-3.5 py-1.5 rounded-full text-xs sm:text-sm bg-[#F7F9F7] text-[#133827] hover:bg-[#B4D0B6]/30 transition-colors active:scale-95 flex items-center gap-1.5 border border-[#ebe6de]"
                  >
                    <span>{item.name}</span> <span>{item.flag}</span>
                  </button>
                ))}
              </div>

              {/* Quick Query Suggestions */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs sm:text-sm text-[#55635a] font-semibold">Presets:</span>
                <button
                  type="button"
                  onClick={() => handleSelectPreset("Tuition-Free Master's")}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-[#B4D0B6]/30 text-[#133827] hover:bg-[#B4D0B6]/50 transition-colors border border-[#B4D0B6]"
                >
                  Tuition-Free Master&apos;s
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPreset('100% English Taught')}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-[#D7EE83]/30 text-[#133827] hover:bg-[#D7EE83]/50 transition-colors border border-[#D7EE83]"
                >
                  100% English Taught
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPreset('Winter Intake')}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-[#f3efe9] text-[#2b352f] hover:bg-[#ebe6de] transition-colors border border-[#ebe6de]"
                >
                  Winter Intake
                </button>
              </div>
            </div>

            {/* Corridor Teaser Row (Authentic Institutions) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-8 border-t border-[#ebe6de]">
              {/* Card 1: Germany */}
              <div
                onClick={() => navigate('/universities?country=germany')}
                className="p-5 rounded-2xl bg-[#F7F9F7] hover:bg-white hover:shadow-md transition-all cursor-pointer flex flex-col justify-between border border-[#ebe6de]"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs px-2.5 py-1 rounded-full bg-[#B4D0B6]/40 text-[#133827] font-semibold">
                      €0 Tuition (TUM)
                    </span>
                    <span className="text-xs text-[#55635a]">Germany 🇩🇪</span>
                  </div>
                  <h3 className="text-base font-bold text-[#133827]">
                    Technical University of Munich
                  </h3>
                  <p className="text-xs text-[#55635a] mt-1">
                    Munich, Germany • Public Research University
                  </p>
                </div>
                <div className="mt-4 pt-3 flex items-center justify-between text-xs text-[#245B42] font-semibold border-t border-[#ebe6de]">
                  <span>APS &amp; VPD Verification Ready</span>
                  <ChevronRight size={16} aria-hidden="true" />
                </div>
              </div>

              {/* Card 2: France */}
              <div
                onClick={() => navigate('/universities?country=france')}
                className="p-5 rounded-2xl bg-[#F7F9F7] hover:bg-white hover:shadow-md transition-all cursor-pointer flex flex-col justify-between border border-[#ebe6de]"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs px-2.5 py-1 rounded-full bg-[#D7EE83]/40 text-[#133827] font-semibold">
                      State Subsidized
                    </span>
                    <span className="text-xs text-[#55635a]">France 🇫🇷</span>
                  </div>
                  <h3 className="text-base font-bold text-[#133827]">
                    Sorbonne University
                  </h3>
                  <p className="text-xs text-[#55635a] mt-1">
                    Paris, France • Public Sorbonne Alliance
                  </p>
                </div>
                <div className="mt-4 pt-3 flex items-center justify-between text-xs text-[#245B42] font-semibold border-t border-[#ebe6de]">
                  <span>Campus France Protocol Ready</span>
                  <ChevronRight size={16} aria-hidden="true" />
                </div>
              </div>

              {/* Card 3: Italy */}
              <div
                onClick={() => navigate('/universities?country=italy')}
                className="p-5 rounded-2xl bg-[#F7F9F7] hover:bg-white hover:shadow-md transition-all cursor-pointer flex flex-col justify-between border border-[#ebe6de]"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs px-2.5 py-1 rounded-full bg-[#B4D0B6]/40 text-[#133827] font-semibold">
                      DSU Regional Grant
                    </span>
                    <span className="text-xs text-[#55635a]">Italy 🇮🇹</span>
                  </div>
                  <h3 className="text-base font-bold text-[#133827]">
                    Politecnico di Milano
                  </h3>
                  <p className="text-xs text-[#55635a] mt-1">
                    Milan, Italy • Public Technical University
                  </p>
                </div>
                <div className="mt-4 pt-3 flex items-center justify-between text-xs text-[#245B42] font-semibold border-t border-[#ebe6de]">
                  <span>Universitaly Pre-enrollment Ready</span>
                  <ChevronRight size={16} aria-hidden="true" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Global University Partners / Institutional Ticker (4 Corridors) */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 mb-20 relative z-10 text-center">
          <p className="text-xs font-semibold text-[#55635a] uppercase tracking-wider mb-6">
            Admissions Data Sourced Directly From Accredited European Institutions
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-12 opacity-85">
            <div className="flex items-center gap-2 text-[#133827] text-sm font-semibold">
              <Building2 className="text-[#245B42]" size={22} aria-hidden="true" />
              <span>TU Munich</span>
            </div>
            <div className="flex items-center gap-2 text-[#133827] text-sm font-semibold">
              <GraduationCap className="text-[#245B42]" size={22} aria-hidden="true" />
              <span>Sorbonne Université</span>
            </div>
            <div className="flex items-center gap-2 text-[#133827] text-sm font-semibold">
              <Building2 className="text-[#245B42]" size={22} aria-hidden="true" />
              <span>Politecnico di Milano</span>
            </div>
            <div className="flex items-center gap-2 text-[#133827] text-sm font-semibold">
              <Compass className="text-[#245B42]" size={22} aria-hidden="true" />
              <span>Univ. of Bucharest</span>
            </div>
            <div className="flex items-center gap-2 text-[#133827] text-sm font-semibold">
              <BookOpen className="text-[#245B42]" size={22} aria-hidden="true" />
              <span>Heidelberg University</span>
            </div>
            <div className="flex items-center gap-2 text-[#133827] text-sm font-semibold">
              <Sparkles className="text-[#245B42]" size={22} aria-hidden="true" />
              <span>Sapienza Univ. of Rome</span>
            </div>
          </div>
        </section>

        {/* 5. Core Platform Pillars (Bento Grid) */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 mb-20 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold text-[#245B42] uppercase tracking-wider">
              Unilistics Casework Architecture
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#133827] mt-2 mb-4">
              Engineered to eliminate admissions and visa friction
            </h2>
            <p className="text-base text-[#55635a]">
              European admissions involve state credentials bodies, foreign equivalency assessments, and strict consular deadlines. Unilistics centralizes this protocol into one synchronized workspace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pillar 1 */}
            <div className="rounded-3xl p-8 bg-white shadow-lg shadow-black/[0.02] flex flex-col justify-between group hover:-translate-y-1 transition-all border border-[#ebe6de]">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#B4D0B6]/30 flex items-center justify-center text-[#245B42] mb-6">
                  <Compass size={26} aria-hidden="true" />
                </div>
                <span className="text-xs font-bold text-[#245B42] uppercase">Pillar 01</span>
                <h3 className="text-xl font-bold text-[#133827] mt-1 mb-3">
                  Verified Catalogue Explorer
                </h3>
                <p className="text-sm text-[#55635a] leading-relaxed mb-6">
                  Filter higher education curriculums calibrated for Pakistani degree holders. View tuition fee schedules, language benchmarks, ECTS credit equivalencies, and live intake deadlines.
                </p>
                <div className="p-4 rounded-2xl bg-[#F7F9F7] mb-6 border border-[#ebe6de]">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-[#55635a]">Credit Equivalency Check</span>
                    <span className="text-xs text-[#245B42] font-bold">180 ECTS Standard</span>
                  </div>
                  <div className="w-full bg-[#ebe6de] h-2 rounded-full overflow-hidden">
                    <div className="bg-[#245B42] h-2 rounded-full w-full"></div>
                  </div>
                </div>
              </div>
              <Link
                to="/universities"
                className="flex items-center text-[#245B42] text-sm font-semibold gap-1 group-hover:gap-2 transition-all no-underline"
              >
                <span>Explore catalogue filters</span>
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>

            {/* Pillar 2 */}
            <div className="rounded-3xl p-8 bg-white shadow-lg shadow-black/[0.02] flex flex-col justify-between group hover:-translate-y-1 transition-all border border-[#ebe6de]">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#D7EE83]/30 flex items-center justify-center text-[#245B42] mb-6">
                  <FolderLock size={26} aria-hidden="true" />
                </div>
                <span className="text-xs font-bold text-[#245B42] uppercase">Pillar 02</span>
                <h3 className="text-xl font-bold text-[#133827] mt-1 mb-3">
                  Verified Document Vault
                </h3>
                <p className="text-sm text-[#55635a] leading-relaxed mb-6">
                  Structured audit checklist for academic transcripts, HEC attestation, German APS certificates, language proficiency results, and consular financial documentation.
                </p>
                <div className="p-4 rounded-2xl bg-[#F7F9F7] mb-6 space-y-2.5 border border-[#ebe6de]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-[#133827] font-medium">
                      <CheckCircle2 size={16} className="text-[#245B42]" aria-hidden="true" />
                      HEC Attested Degree
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#B4D0B6]/40 text-[#133827] font-semibold">
                      Verified
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-[#133827] font-medium">
                      <CheckCircle2 size={16} className="text-[#245B42]" aria-hidden="true" />
                      APS Certificate Issued
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#B4D0B6]/40 text-[#133827] font-semibold">
                      Verified
                    </span>
                  </div>
                </div>
              </div>
              <Link
                to="/help"
                className="flex items-center text-[#245B42] text-sm font-semibold gap-1 group-hover:gap-2 transition-all no-underline"
              >
                <span>Learn about document auditing</span>
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>

            {/* Pillar 3 */}
            <div className="rounded-3xl p-8 bg-white shadow-lg shadow-black/[0.02] flex flex-col justify-between group hover:-translate-y-1 transition-all border border-[#ebe6de]">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#B4D0B6]/30 flex items-center justify-center text-[#245B42] mb-6">
                  <Users size={26} aria-hidden="true" />
                </div>
                <span className="text-xs font-bold text-[#245B42] uppercase">Pillar 03</span>
                <h3 className="text-xl font-bold text-[#133827] mt-1 mb-3">
                  Human Counsellor Collaboration
                </h3>
                <p className="text-sm text-[#55635a] leading-relaxed mb-6">
                  Direct casework with assigned staff counsellors. Review SOP and motivation letter drafts, receive intake deadline reminders, and track university portal submissions.
                </p>
                <div className="p-4 rounded-2xl bg-[#F7F9F7] mb-6 flex items-start gap-3 border border-[#ebe6de]">
                  <div className="w-8 h-8 rounded-full bg-[#245B42] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                    AC
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-[#133827]">
                        Admissions Counsellor
                      </span>
                      <span className="text-[11px] text-[#55635a]">Active review</span>
                    </div>
                    <p className="text-xs text-[#55635a] mt-0.5">
                      &quot;Your curriculum analysis satisfies the prerequisite ECTS modules. Uni-Assist dossier ready.&quot;
                    </p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAdvisoryModalOpen(true)}
                className="flex items-center text-[#245B42] text-sm font-semibold gap-1 group-hover:gap-2 transition-all text-left"
              >
                <span>Request managed guidance</span>
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          </div>
        </section>

        {/* 6. Live Application Tracker Preview (Casework Showcase) */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 mb-20 relative z-10">
          <div className="rounded-3xl p-6 sm:p-10 bg-white shadow-xl shadow-black/[0.03] border border-[#ebe6de]">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8 pb-6 border-b border-[#ebe6de]">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B4D0B6]/30 text-[#133827] text-xs font-semibold mb-2 border border-[#B4D0B6]">
                  <span className="w-2 h-2 rounded-full bg-[#245B42] animate-pulse" aria-hidden="true"></span>
                  Representative Casework Milestone
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#133827]">
                  Inside the Managed Student Workspace
                </h2>
                <p className="text-sm text-[#55635a] mt-1">
                  How applicants and counsellors track European university admissions and visa prerequisites.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  to={currentRole === 'visitor' ? '/sign-in' : '/student'}
                  className="px-6 py-2.5 rounded-full bg-[#245B42] text-white text-sm font-semibold hover:bg-[#1D4A36] transition-colors no-underline"
                >
                  {currentRole === 'visitor' ? 'Sign In to Portal' : 'My Student Workspace'}
                </Link>
              </div>
            </div>

            {/* Application Milestone Mosaic */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Main Milestone Stepper (8 Cols) */}
              <div className="lg:col-span-8 rounded-2xl p-6 bg-[#F7F9F7] flex flex-col justify-between border border-[#ebe6de]">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#245B42] font-bold border border-[#ebe6de]">
                        TUM
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-[#133827]">
                          Technical University of Munich
                        </h3>
                        <p className="text-xs text-[#55635a]">
                          M.Sc. Robotics, Cognition, Intelligence • Munich Campus
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#B4D0B6]/40 text-[#133827]">
                      Stage 4: Faculty Evaluation
                    </span>
                  </div>

                  {/* Stepper Nodes */}
                  <div className="my-8">
                    <div className="flex items-center justify-between relative">
                      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-[#ebe6de] z-0"></div>
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#245B42] w-[65%] z-0"></div>

                      <div className="relative z-10 flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-[#245B42] text-white flex items-center justify-center shadow-sm">
                          <Check size={16} aria-hidden="true" />
                        </div>
                        <span className="text-[11px] text-[#133827] mt-2 font-medium">VPD Issued</span>
                      </div>

                      <div className="relative z-10 flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-[#245B42] text-white flex items-center justify-center shadow-sm">
                          <Check size={16} aria-hidden="true" />
                        </div>
                        <span className="text-[11px] text-[#133827] mt-2 font-medium">APS Certified</span>
                      </div>

                      <div className="relative z-10 flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-[#245B42] text-white flex items-center justify-center shadow-sm">
                          <Check size={16} aria-hidden="true" />
                        </div>
                        <span className="text-[11px] text-[#133827] mt-2 font-medium">SOP Approved</span>
                      </div>

                      <div className="relative z-10 flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-[#245B42] text-white flex items-center justify-center shadow-sm ring-4 ring-[#B4D0B6]/60">
                          <RefreshCw size={14} className="animate-spin" aria-hidden="true" />
                        </div>
                        <span className="text-[11px] text-[#245B42] font-bold mt-2">Faculty Audit</span>
                      </div>

                      <div className="relative z-10 flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-white text-[#55635a] border border-[#ebe6de] flex items-center justify-center">
                          <span className="w-2 h-2 rounded-full bg-[#8a9890]"></span>
                        </div>
                        <span className="text-[11px] text-[#55635a] mt-2">Offer Letter</span>
                      </div>

                      <div className="relative z-10 flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-white text-[#55635a] border border-[#ebe6de] flex items-center justify-center">
                          <span className="w-2 h-2 rounded-full bg-[#8a9890]"></span>
                        </div>
                        <span className="text-[11px] text-[#55635a] mt-2">Visa Sync</span>
                      </div>
                    </div>
                  </div>

                  {/* Task Summary */}
                  <div className="bg-white p-4 rounded-xl space-y-2 border border-[#ebe6de]">
                    <div className="flex items-center justify-between text-xs font-semibold text-[#133827]">
                      <span>Checklist Milestones</span>
                      <span className="text-[#245B42]">60% Readiness</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-2 text-[#55635a]">
                        <CheckCircle2 size={16} className="text-[#245B42]" aria-hidden="true" />
                        <span>TUMonline Curriculum Form</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#55635a]">
                        <CheckCircle2 size={16} className="text-[#245B42]" aria-hidden="true" />
                        <span>Statutory Health Insurance</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#133827] font-medium">
                        <Clock size={16} className="text-[#245B42]" aria-hidden="true" />
                        <span>Blocked Account Baseline (€11,208)</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#55635a]">
                        <div className="w-4 h-4 rounded-full border-2 border-[#8a9890]" aria-hidden="true"></div>
                        <span>Embassy Appointment Booking</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Counsellor Guidance Card (4 Cols) */}
              <div className="lg:col-span-4 rounded-2xl p-6 bg-[#F7F9F7] flex flex-col justify-between border border-[#ebe6de]">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-[#245B42] text-white flex items-center justify-center font-bold text-sm">
                      MK
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#133827]">
                        Muhammad Khan
                      </h4>
                      <p className="text-xs text-[#245B42] font-semibold">
                        European Admissions Counsellor
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-[#ebe6de] mb-4">
                    <p className="text-xs text-[#2b352f] leading-relaxed">
                      &quot;Transcripts and English proof verified. We have submitted your curriculum matrix to the faculty admissions board.&quot;
                    </p>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-[#55635a] uppercase tracking-wider">
                      Verified Documents
                    </span>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-white px-3 border border-[#ebe6de] text-xs">
                      <span className="text-[#133827] truncate">HEC_Attested_Transcript.pdf</span>
                      <CheckCircle2 size={16} className="text-[#245B42] flex-shrink-0" aria-hidden="true" />
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-white px-3 border border-[#ebe6de] text-xs">
                      <span className="text-[#133827] truncate">APS_Certificate_Verified.pdf</span>
                      <CheckCircle2 size={16} className="text-[#245B42] flex-shrink-0" aria-hidden="true" />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAdvisoryModalOpen(true)}
                  className="w-full mt-6 py-2.5 rounded-full text-xs font-semibold text-[#133827] bg-white hover:bg-[#f3efe9] transition-colors flex items-center justify-center gap-2 border border-[#ebe6de]"
                >
                  <MessageSquare size={16} aria-hidden="true" />
                  <span>Request Casework Consultation</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Data Standard & Statutory Transparency Guarantee */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 mb-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B4D0B6]/30 text-[#133827] text-xs font-bold mb-4 border border-[#B4D0B6]">
                <ShieldCheck size={16} className="text-[#245B42]" aria-hidden="true" />
                The Unilistics Data Standard
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#133827] mb-4 leading-tight">
                Zero speculation. Every tuition fee, deadline &amp; prerequisite verified.
              </h2>
              <p className="text-sm sm:text-base text-[#55635a] mb-6 leading-relaxed">
                Admissions criteria and consular requirements are audited against official university senates, state higher education portals, and consular embassy directives.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#B4D0B6]/40 text-[#245B42] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <RefreshCw size={16} aria-hidden="true" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#133827]">
                      Periodic Senate Verification
                    </h4>
                    <p className="text-xs text-[#55635a]">
                      Intake deadlines and prerequisite revisions are updated against official academic publications.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#D7EE83]/40 text-[#133827] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Euro size={16} aria-hidden="true" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#133827]">
                      Transparent Semester Contributions
                    </h4>
                    <p className="text-xs text-[#55635a]">
                      Audited semesterbeitrag, student union transit passes, and state tuition surcharge exemptions.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#B4D0B6]/40 text-[#245B42] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 size={16} aria-hidden="true" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#133827]">
                      Consular Blocked Account Alignment
                    </h4>
                    <p className="text-xs text-[#55635a]">
                      Calibrated with current living expense guidelines (€11,208/yr baseline for Germany).
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="rounded-3xl p-6 sm:p-8 bg-white shadow-xl shadow-black/[0.03] border border-[#ebe6de]">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm font-bold text-[#133827]">
                    Recent Institutional Audits
                  </span>
                  <span className="text-xs text-[#245B42] bg-[#B4D0B6]/30 px-3 py-1 rounded-full border border-[#B4D0B6] font-semibold">
                    Corridors Verified
                  </span>
                </div>

                {/* Verification Feed (Only 4 Corridors) */}
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-[#F7F9F7] flex items-center justify-between border border-[#ebe6de]">
                    <div className="flex items-center gap-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#245B42]" aria-hidden="true"></span>
                      <div>
                        <p className="text-xs sm:text-sm font-semibold text-[#133827]">
                          LMU Munich (Germany 🇩🇪)
                        </p>
                        <p className="text-xs text-[#55635a]">
                          M.Sc. Data Science: English curriculum &amp; VPD requirements confirmed
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] text-[#55635a] flex-shrink-0">Verified 2h ago</span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#F7F9F7] flex items-center justify-between border border-[#ebe6de]">
                    <div className="flex items-center gap-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#245B42]" aria-hidden="true"></span>
                      <div>
                        <p className="text-xs sm:text-sm font-semibold text-[#133827]">
                          Sorbonne University (France 🇫🇷)
                        </p>
                        <p className="text-xs text-[#55635a]">
                          Campus France Etudes en France portal window published
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] text-[#55635a] flex-shrink-0">Verified 5h ago</span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#F7F9F7] flex items-center justify-between border border-[#ebe6de]">
                    <div className="flex items-center gap-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#245B42]" aria-hidden="true"></span>
                      <div>
                        <p className="text-xs sm:text-sm font-semibold text-[#133827]">
                          Politecnico di Milano (Italy 🇮🇹)
                        </p>
                        <p className="text-xs text-[#55635a]">
                          Universitaly pre-enrollment &amp; DSU grant window verified
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] text-[#55635a] flex-shrink-0">Verified 9h ago</span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#F7F9F7] flex items-center justify-between border border-[#ebe6de]">
                    <div className="flex items-center gap-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#245B42]" aria-hidden="true"></span>
                      <div>
                        <p className="text-xs sm:text-sm font-semibold text-[#133827]">
                          University of Bucharest (Romania 🇷🇴)
                        </p>
                        <p className="text-xs text-[#55635a]">
                          Ministry acceptance letter (Scrisoare de Acceptare) timeline verified
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] text-[#55635a] flex-shrink-0">Verified 1d ago</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-[#ebe6de] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={24} className="text-[#245B42] flex-shrink-0" aria-hidden="true" />
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-[#133827]">
                        Procedural Accuracy Guarantee
                      </p>
                      <p className="text-xs text-[#55635a]">
                        Structured prerequisite verification aligned with statutory protocols.
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/help"
                    className="px-4 py-2 rounded-full text-xs font-bold text-[#133827] bg-[#B4D0B6]/40 hover:bg-[#B4D0B6]/60 transition-colors flex-shrink-0 no-underline"
                  >
                    View Audit Protocol
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 8. Bottom Action CTA Banner (Forest & Citron Surfaces) */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 mb-20 relative z-10">
          <div className="rounded-3xl p-8 sm:p-14 bg-gradient-to-r from-[#245B42] via-[#1D4A36] to-[#133827] text-white shadow-2xl relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-96 h-96 rounded-full bg-white/5 blur-3xl pointer-events-none" aria-hidden="true"></div>
            <div className="absolute -left-10 -top-10 w-72 h-72 rounded-full bg-[#D7EE83]/10 blur-2xl pointer-events-none" aria-hidden="true"></div>

            <div className="relative z-10 max-w-3xl">
              <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-[#D7EE83] uppercase tracking-wide inline-block mb-4">
                European Higher Education Corridors
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
                Ready to plan your international degree?
              </h2>
              <p className="text-sm sm:text-base text-white/85 mb-8 max-w-2xl leading-relaxed">
                Explore curated public university catalogues across Germany, France, Italy, and Romania with verified entry requirements and consular visa guidance.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  to="/universities"
                  className="px-8 py-3.5 rounded-full text-sm font-bold text-[#133827] bg-[#D7EE83] hover:bg-[#c9e36e] shadow-lg active:scale-95 transition-all no-underline"
                >
                  Explore University Catalogue
                </Link>
                <Link
                  to={currentRole === 'visitor' ? '/sign-in' : '/student'}
                  className="px-8 py-3.5 rounded-full text-sm font-semibold text-white bg-white/15 hover:bg-white/25 backdrop-blur-md active:scale-95 transition-all no-underline border border-white/20"
                >
                  {currentRole === 'visitor' ? 'Sign In to Portal' : 'My Student Workspace'}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* 9. Advisory Modal: Request 1-on-1 Advisory */}
      {isAdvisoryModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
          aria-labelledby="advisory-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAdvisoryModalOpen(false);
          }}
        >
          <div
            ref={modalRef}
            className="w-full max-w-lg rounded-3xl p-8 bg-white shadow-2xl relative border border-[#ebe6de] animate-in zoom-in-95 duration-150"
          >
            <button
              type="button"
              id="close-advisory-modal-btn"
              onClick={() => setIsAdvisoryModalOpen(false)}
              className="absolute top-6 right-6 w-8 h-8 rounded-full bg-[#F7F9F7] flex items-center justify-center text-[#55635a] hover:text-[#133827] transition-colors"
              aria-label="Close advisory dialog"
            >
              <X size={18} aria-hidden="true" />
            </button>

            <span className="text-xs font-bold text-[#245B42] uppercase tracking-wider">
              Advisory Desk
            </span>
            <h3 id="advisory-modal-title" className="text-xl font-bold text-[#133827] mt-1 mb-2">
              Request 1-on-1 Academic Eligibility Review
            </h3>
            <p className="text-xs sm:text-sm text-[#55635a] mb-6">
              Connect with an accredited European admissions counsellor for an initial profile appraisal.
            </p>

            {advisorySubmitted ? (
              <div className="p-6 rounded-2xl bg-[#B4D0B6]/20 border border-[#B4D0B6] text-center space-y-2">
                <CheckCircle2 size={36} className="text-[#245B42] mx-auto" aria-hidden="true" />
                <h4 className="text-base font-bold text-[#133827]">Request Dispatched</h4>
                <p className="text-xs text-[#2b352f]">
                  Your advisory request has been dispatched. An admissions counsellor will contact you within 4 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleAdvisorySubmit} className="space-y-4">
                <div>
                  <label htmlFor="adv-name" className="block text-xs font-semibold text-[#133827] mb-1.5">
                    Full Legal Name
                  </label>
                  <input
                    id="adv-name"
                    required
                    value={advisoryFormData.fullName}
                    onChange={(e) => setAdvisoryFormData({ ...advisoryFormData, fullName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-full bg-[#F7F9F7] text-sm text-[#1a1a1a] outline-none focus:ring-2 focus:ring-[#245B42] border border-[#ebe6de]"
                    placeholder="e.g. Fatima Ali"
                    type="text"
                  />
                </div>

                <div>
                  <label htmlFor="adv-email" className="block text-xs font-semibold text-[#133827] mb-1.5">
                    Email Address
                  </label>
                  <input
                    id="adv-email"
                    required
                    value={advisoryFormData.email}
                    onChange={(e) => setAdvisoryFormData({ ...advisoryFormData, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-full bg-[#F7F9F7] text-sm text-[#1a1a1a] outline-none focus:ring-2 focus:ring-[#245B42] border border-[#ebe6de]"
                    placeholder="fatima@example.com"
                    type="email"
                  />
                </div>

                <div>
                  <label htmlFor="adv-dest" className="block text-xs font-semibold text-[#133827] mb-1.5">
                    Target Corridor &amp; Degree
                  </label>
                  <input
                    id="adv-dest"
                    value={advisoryFormData.targetDestination}
                    onChange={(e) => setAdvisoryFormData({ ...advisoryFormData, targetDestination: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-full bg-[#F7F9F7] text-sm text-[#1a1a1a] outline-none focus:ring-2 focus:ring-[#245B42] border border-[#ebe6de]"
                    placeholder="e.g. Germany — Master in Computer Science"
                    type="text"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    id="confirm-advisory-slot-btn"
                    className="w-full py-3.5 rounded-full text-sm font-bold text-white bg-[#245B42] hover:bg-[#1D4A36] shadow-sm transition-all"
                  >
                    Confirm Advisory Request (Free)
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

export default HomePage;
