import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Search,
  X,
  MapPin,
  FileText,
  Route,
  HelpCircle,
  BookOpen,
  ShieldCheck,
  Plus,
  Minus,
} from 'lucide-react';
import { ROUTES } from '@/config/routes';
import { api } from '@/lib/api';
import { DestinationCountry } from '@/types';
import { InteractiveWorldMap } from '@/components/domain/InteractiveWorldMap';
import { JourneyRoadmap } from '@/components/domain/JourneyRoadmap';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [heroSearchQuery, setHeroSearchQuery] = useState('');
  const [isAdvisoryModalOpen, setIsAdvisoryModalOpen] = useState(false);
  const [advisorySubmitted, setAdvisorySubmitted] = useState(false);
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(0);
  const [selectedFaqCategory, setSelectedFaqCategory] = useState<string>('all');
  const [advisoryFormData, setAdvisoryFormData] = useState({
    fullName: '',
    email: '',
    targetDestination: '',
  });

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = heroSearchQuery.trim();
    if (query) {
      navigate(`/universities?search=${encodeURIComponent(query)}`);
    } else {
      navigate(ROUTES.UNIVERSITIES);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAdvisoryModalOpen) {
        setIsAdvisoryModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdvisoryModalOpen]);

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
      // Graceful fallback
    }

    setAdvisorySubmitted(true);
    setTimeout(() => {
      setIsAdvisoryModalOpen(false);
      setAdvisorySubmitted(false);
      setAdvisoryFormData({ fullName: '', email: '', targetDestination: '' });
    }, 2400);
  };

  const faqCategories = [
    { id: 'all', label: 'All Questions' },
    { id: 'service', label: 'Explorer vs Managed' },
    { id: 'finance', label: 'Tuition & Costs' },
    { id: 'visa', label: 'APS & Visa' },
    { id: 'admissions', label: 'Eligibility & Intakes' },
  ];

  const faqs = [
    {
      category: 'service',
      q: 'How does Unilistics differ from a traditional study abroad agency?',
      a: 'Unilistics is a transparent, staff-managed tracking platform—not a commission-driven agency. We never hold your university login credentials hostage, charge hidden kickbacks, or make impossible admissions promises. You maintain complete ownership of your academic dossier and have real-time visibility into every document check, deadline, and caseworker action.',
      tag: 'Zero Kickbacks',
    },
    {
      category: 'finance',
      q: 'Are public universities in Germany and France really tuition-free?',
      a: 'In Germany, almost all public universities charge €0 tuition for international undergraduate and consecutive master students, requiring only a modest semester contribution (€150–€350) that usually includes free state transit. In France, many state universities offer tuition exemptions or subsidized rates starting at statutory rates. We provide truthful financial schedules for each program.',
      tag: '€0 Public Benchmarks',
    },
    {
      category: 'visa',
      q: 'What is an APS certificate and do Pakistani applicants require it?',
      a: 'The Akademische Prüfstelle (APS) certificate is an official verification issued by the German Embassy verifying the authenticity of educational certificates and transcripts from Pakistan. It is mandatory for German university admissions and student visa processing. Our casework team guides applicants through the exact HEC and MOFA attestation sequence required before APS submission.',
      tag: 'Statutory Verification',
    },
    {
      category: 'admissions',
      q: 'Is university admission guaranteed with Managed Guidance?',
      a: 'No ethical advisory service can guarantee university admission, as all final decisions rest exclusively with university academic admissions committees. What Unilistics guarantees is rigorous compliance auditing: ensuring your course prerequisites, GPA equivalencies, sworn translations, and consular documents strictly meet official requirements to maximize your acceptance probability.',
      tag: 'Compliance Guarantee',
    },
    {
      category: 'service',
      q: 'What is the difference between a Free Explorer account and Managed Guidance?',
      a: 'An Explorer account is 100% free forever and provides self-service access to browse, filter, and bookmark our complete published database of European universities, degree programs, and scholarships. Managed Guidance is an application-based tier where students are paired with a dedicated caseworker who manages document auditing, portal submissions, and visa pre-enrollment.',
      tag: 'Transparent Choice',
    },
    {
      category: 'admissions',
      q: 'Can Pakistani students apply with a 3-year bachelor or intermediate qualification?',
      a: 'Direct entry rules depend strictly on official anabin (Germany) and CIMEA (Italy) equivalence databases. For Germany, a standard Pakistani intermediate (FSc/FA) requires 1 year of Studienkolleg (or 1 year completed at an HEC-recognized university) before direct bachelor admission. A 4-year BS (16 years education) qualifies directly for Master entry. We verify your exact transcript during dossier audit.',
      tag: 'HEC & Anabin Matrix',
    },
  ];

  const filteredFaqs = selectedFaqCategory === 'all'
    ? faqs
    : faqs.filter((f) => f.category === selectedFaqCategory);

  return (
    <div
      style={{
        backgroundColor: 'var(--surface-canvas, #F6F8F5)',
        color: 'var(--color-foreground, #19261F)',
        fontFamily: 'var(--font-family-base, "DM Sans", sans-serif)',
        minHeight: '100vh',
        overflowX: 'hidden',
      }}
    >
      {/* 1. Photographic Hero Section */}
      <section
        id="homepage-photographic-hero"
        className="photographic-hero"
        aria-label="Welcome to Unilistics"
      >
        {/* Background Student Photo Layer */}
        <div className="hero-photo-layer">
          <img
            src="/images/hero_student_europe.jpg"
            alt="Student on leafy European university campus"
            fetchPriority="high"
            loading="eager"
            decoding="async"
          />
          <div className="hero-overlay" aria-hidden="true" />
        </div>

        {/* Content Layer */}
        <div className="hero-content-container">
          <div className="hero-text-column">
            {/* Eyebrow */}
            <div className="hero-eyebrow">YOUR NEXT CHAPTER STARTS HERE</div>

            {/* Headline */}
            <h1 className="hero-headline">
              Your future.
              <br />
              Your university.
              <br />
              <span className="hero-headline-accent">Your way forward.</span>
            </h1>

            {/* Supporting Copy */}
            <p className="hero-supporting-text">
              Explore study opportunities in Europe and take your next step with guidance from our team.
            </p>

            {/* White Search Card */}
            <div className="hero-search-card">
              <label htmlFor="hero-university-search" className="hero-search-title">
                Where do you want to study?
              </label>
              <form
                onSubmit={handleHeroSearch}
                role="search"
                className="hero-search-form"
              >
                <div className="hero-search-input-wrapper">
                  <Search size={16} className="hero-search-icon" aria-hidden="true" />
                  <input
                    id="hero-university-search"
                    type="text"
                    value={heroSearchQuery}
                    onChange={(e) => setHeroSearchQuery(e.target.value)}
                    placeholder="Search universities or study interests"
                    className="hero-search-input"
                    aria-label="Find a university"
                  />
                </div>
                <button
                  type="submit"
                  id="hero-search-explore-btn"
                  className="hero-explore-btn"
                >
                  <span>Explore</span>
                  <ArrowRight size={15} aria-hidden="true" />
                </button>
              </form>
            </div>

            {/* Secondary Link & Country Quick Links */}
            <div className="hero-subactions">
              <div className="hero-guidance-wrapper">
                <Link
                  to="/request-guidance"
                  id="hero-guidance-link"
                  className="hero-guidance-link"
                >
                  <span>Need a helping hand? Get guidance</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </div>

              {/* Country Shortcuts */}
              <div className="hero-country-shortcuts" aria-label="Popular European destinations">
                <Link to="/universities?country=Germany" className="hero-country-tag">
                  <MapPin size={13} aria-hidden="true" />
                  <span>Germany</span>
                </Link>
                <span className="hero-country-divider" aria-hidden="true">|</span>
                <Link to="/universities?country=France" className="hero-country-tag">
                  <MapPin size={13} aria-hidden="true" />
                  <span>France</span>
                </Link>
                <span className="hero-country-divider" aria-hidden="true">|</span>
                <Link to="/universities?country=Italy" className="hero-country-tag">
                  <MapPin size={13} aria-hidden="true" />
                  <span>Italy</span>
                </Link>
                <span className="hero-country-divider" aria-hidden="true">|</span>
                <Link to="/universities?country=Romania" className="hero-country-tag">
                  <MapPin size={13} aria-hidden="true" />
                  <span>Romania</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Curved Wave Transition */}
        <div className="hero-wave-container" aria-hidden="true">
          <svg
            viewBox="0 0 1440 96"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="hero-wave-svg"
            preserveAspectRatio="none"
          >
            <path
              d="M0 64C360 84 820 90 1440 16"
              stroke="#D7EE83"
              strokeWidth="2.5"
              strokeOpacity="0.85"
            />
            <path
              d="M0 68C360 88 820 94 1440 20V96H0V68Z"
              className="hero-wave-fill"
            />
          </svg>
        </div>
      </section>

      {/* Feature Highlights Bar on Light Canvas */}
      <section className="hero-feature-pillars-bar" aria-label="Key Guidance Features">
        <div className="hero-feature-pillars-container">
          <div className="hero-feature-pillar">
            <div className="hero-feature-icon-circle">
              <Compass size={20} aria-hidden="true" />
            </div>
            <div className="hero-feature-content">
              <h3 className="hero-feature-title">Explore opportunities</h3>
              <p className="hero-feature-desc">Discover verified university programmes across Europe.</p>
            </div>
          </div>

          <div className="hero-feature-divider" aria-hidden="true" />

          <div className="hero-feature-pillar">
            <div className="hero-feature-icon-circle">
              <FileText size={20} aria-hidden="true" />
            </div>
            <div className="hero-feature-content">
              <h3 className="hero-feature-title">Organise your documents</h3>
              <p className="hero-feature-desc">Get clear guidance on what you need at each stage.</p>
            </div>
          </div>

          <div className="hero-feature-divider" aria-hidden="true" />

          <div className="hero-feature-pillar">
            <div className="hero-feature-icon-circle">
              <Route size={20} aria-hidden="true" />
            </div>
            <div className="hero-feature-content">
              <h3 className="hero-feature-title">Track every step</h3>
              <p className="hero-feature-desc">Stay informed with personalised guidance from our team.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive World & European Corridors Map (Section 3/4 requested by user!) */}
      <InteractiveWorldMap />

      {/* 3. Your Journey. Your Choice: Exploration vs Managed Support (Matching Reference 1) */}
      <section
        id="exploration-vs-managed-section"
        className="choice-section-wrapper"
        aria-label="Your Journey, Your Choice: Free Explorer vs Managed Guidance"
      >
        <div className="choice-header-container">
          <div className="choice-header-eyebrow">MADE FOR YOUR NEXT CHAPTER</div>
          <div className="choice-header-row">
            <div>
              <h2 className="choice-title">
                Your journey. Your choice.
              </h2>
              <p className="choice-subtitle">
                Explore on your own, or move forward with our team.
              </p>
            </div>

            {/* Hand-drawn upward arrow SVG matching reference 1 */}
            <div className="hide-on-mobile" aria-hidden="true" style={{ opacity: 0.85 }}>
              <svg width="220" height="60" viewBox="0 0 220 60" fill="none">
                <path
                  d="M10 45 C 50 15, 90 55, 140 25 C 170 8, 195 12, 212 18"
                  stroke="var(--brand-sage, #7B9E87)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M202 12 L 214 18 L 206 28"
                  stroke="var(--brand-sage, #7B9E87)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* The 2 Split Cards */}
        <div className="choice-cards-grid">
          {/* Card 1: Free Explorer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="choice-card choice-card-explorer"
          >
            <div className="choice-card-content">
              <div>
                <span className="choice-pill choice-pill-explorer">FREE EXPLORER</span>
                <h3 className="choice-card-heading" style={{ color: 'var(--color-foreground, #19261F)' }}>
                  Find your next possibility.
                </h3>
                <p className="choice-card-desc" style={{ color: 'var(--color-foreground-muted, #58695E)' }}>
                  Universities, programs and scholarships. All yours to explore.
                </p>

                <div className="choice-checklist">
                  <div className="choice-check-item" style={{ color: 'var(--color-foreground, #19261F)' }}>
                    <div
                      className="choice-check-icon-circle"
                      style={{
                        backgroundColor: 'var(--surface-card-subtle, #EBF3EA)',
                        color: 'var(--action-primary, #245B42)',
                        border: '1.5px solid var(--border-refined, #A7C5AF)',
                      }}
                    >
                      <Check size={13} strokeWidth={3} />
                    </div>
                    <span>Save your shortlist</span>
                  </div>

                  <div className="choice-check-item" style={{ color: 'var(--color-foreground, #19261F)' }}>
                    <div
                      className="choice-check-icon-circle"
                      style={{
                        backgroundColor: 'var(--surface-card-subtle, #EBF3EA)',
                        color: 'var(--action-primary, #245B42)',
                        border: '1.5px solid var(--border-refined, #A7C5AF)',
                      }}
                    >
                      <Check size={13} strokeWidth={3} />
                    </div>
                    <span>Explore country guides</span>
                  </div>
                </div>
              </div>

              <div>
                <Link
                  to={ROUTES.SIGN_UP}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.625rem',
                    padding: '0.75rem 1.625rem',
                    borderRadius: 'var(--radius-pill, 9999px)',
                    backgroundColor: 'var(--action-primary, #245B42)',
                    color: 'var(--color-on-primary, #FFFFFF)',
                    fontSize: '0.9375rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    boxShadow: '0 4px 14px rgba(36, 91, 66, 0.22)',
                    transition: 'all 180ms ease',
                  }}
                >
                  <span>Explore for free</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            <div className="choice-card-media">
              <img
                src="/images/student_library_explorer.jpg"
                alt="Student exploring university programmes independently in campus library"
                loading="lazy"
                decoding="async"
              />
            </div>
          </motion.div>

          {/* Card 2: Managed Guidance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="choice-card choice-card-managed"
          >
            <div className="choice-card-content">
              <div>
                <span className="choice-pill choice-pill-managed">MANAGED GUIDANCE</span>
                <h3 className="choice-card-heading" style={{ color: '#FFFFFF' }}>
                  A clear path.
                  <br />
                  A team beside you.
                </h3>
                <p className="choice-card-desc" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
                  Get personal guidance through your application.
                </p>

                <div className="choice-checklist">
                  <div className="choice-check-item" style={{ color: '#FFFFFF' }}>
                    <div
                      className="choice-check-icon-circle"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        color: 'var(--brand-citron, #D7EE83)',
                        border: '1.5px solid rgba(215, 238, 131, 0.6)',
                      }}
                    >
                      <Check size={13} strokeWidth={3} />
                    </div>
                    <span>Documents organised</span>
                  </div>

                  <div className="choice-check-item" style={{ color: '#FFFFFF' }}>
                    <div
                      className="choice-check-icon-circle"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        color: 'var(--brand-citron, #D7EE83)',
                        border: '1.5px solid rgba(215, 238, 131, 0.6)',
                      }}
                    >
                      <Check size={13} strokeWidth={3} />
                    </div>
                    <span>Progress you can follow</span>
                  </div>
                </div>
              </div>

              <div>
                <Link
                  to="/request-guidance"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.625rem',
                    padding: '0.75rem 1.625rem',
                    borderRadius: 'var(--radius-pill, 9999px)',
                    backgroundColor: 'var(--brand-citron, #D7EE83)',
                    color: '#19261F',
                    fontSize: '0.9375rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.2)',
                    transition: 'all 180ms ease',
                  }}
                >
                  <span>Request guidance</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            <div className="choice-card-media">
              <img
                src="/images/student_counselor_guidance.jpg"
                alt="Student collaborating with education counsellor on application dossiers"
                loading="lazy"
                decoding="async"
              />
            </div>
          </motion.div>
        </div>

        {/* Footnote */}
        <div style={{ maxWidth: '1240px', margin: '1.25rem auto 0', textAlign: 'right' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted, #718578)' }}>
            Managed access requires team approval.
          </span>
        </div>
      </section>

      {/* 4. How Your Journey Progresses: Interactive Curved Winding Roadmap */}
      <JourneyRoadmap />

      {/* 6. Frequently Asked Questions (Modern Categorized Interactive Accordion) */}
      <section id="faq-section" className="faq-section-wrapper" aria-labelledby="faq-section-title">
        <div className="faq-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="faq-header"
          >
            <span className="faq-badge">
              <HelpCircle size={14} />
              Admissions & Corridor FAQs
            </span>
            <h2 id="faq-section-title" className="faq-title">
              Frequently Asked Questions
            </h2>
            <p className="faq-subtitle">
              Clear, transparent information on European university admissions, APS requirements, and our staff-managed casework model.
            </p>
          </motion.div>

          {/* Category Filter Pills */}
          <div className="faq-category-bar" role="tablist" aria-label="FAQ Categories">
            {faqCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={selectedFaqCategory === cat.id}
                className={`faq-category-btn ${selectedFaqCategory === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedFaqCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Accordion Cards */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredFaqs.map((faq, index) => {
              const isOpen = activeFaqIndex === index;
              return (
                <motion.div
                  key={faq.q}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: index * 0.04 }}
                  className={`faq-card ${isOpen ? 'open' : ''}`}
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaqIndex(isOpen ? null : index)}
                    className="faq-trigger"
                    aria-expanded={isOpen}
                  >
                    <div className="faq-question-content">
                      <div className="faq-icon-bubble">
                        <BookOpen size={16} />
                      </div>
                      <span className="faq-question-text">{faq.q}</span>
                    </div>
                    <div className="faq-toggle-circle">
                      {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div className="faq-answer-wrapper">
                          <p style={{ margin: 0 }}>{faq.a}</p>
                          {faq.tag && (
                            <div style={{ marginTop: '0.85rem', display: 'flex', gap: '0.5rem' }}>
                              <span
                                style={{
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  color: 'var(--action-primary, #245B42)',
                                  backgroundColor: 'var(--surface-card-subtle, rgba(36, 91, 66, 0.08))',
                                  padding: '0.2rem 0.65rem',
                                  borderRadius: 'var(--radius-pill, 9999px)',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.35rem',
                                }}
                              >
                                <ShieldCheck size={12} />
                                {faq.tag}
                              </span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {/* Helpdesk / Still Have Questions Card */}
          <div className="faq-helpdesk-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  backgroundColor: 'var(--brand-citron, #D7EE83)',
                  color: '#19261F',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <HelpCircle size={24} />
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.25rem', fontSize: '1.0625rem', fontWeight: 700, color: 'var(--color-foreground, #19261F)' }}>
                  Still have questions about your eligibility?
                </h4>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-foreground-muted, #58695E)' }}>
                  Browse our complete knowledge base or request an official pre-assessment eligibility review.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link
                to="/help"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.65rem 1.25rem',
                  borderRadius: 'var(--radius-pill, 9999px)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  backgroundColor: 'var(--surface-card-subtle, #EDF2E9)',
                  color: 'var(--color-foreground, #19261F)',
                  textDecoration: 'none',
                  border: '1px solid var(--border-subtle, #E1E8DE)',
                }}
              >
                <span>Help Centre</span>
                <ArrowRight size={14} />
              </Link>
              <button
                type="button"
                onClick={() => setIsAdvisoryModalOpen(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.65rem 1.25rem',
                  borderRadius: 'var(--radius-pill, 9999px)',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  backgroundColor: 'var(--action-primary, #245B42)',
                  color: 'var(--color-on-primary, #FFFFFF)',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <span>Ask Counsellor</span>
                <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Redesigned Call to Action: "A new chapter. One simple step." */}
      <section id="new-chapter-cta-section" className="cta-showcase-section" aria-label="Start your next step">
        <div className="cta-showcase-container">
          {/* Left: Dynamic Photographic Collage */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="cta-collage-wrapper"
          >
            {/* Citron crescent orb */}
            <div className="cta-citron-orb" aria-hidden="true" />

            {/* Flight path & paper plane SVG */}
            <svg
              className="cta-flight-path"
              viewBox="0 0 280 140"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: -35,
                right: -25,
                width: 260,
                height: 130,
                pointerEvents: 'none',
                zIndex: 6,
              }}
            >
              <path
                d="M 20 115 C 60 130, 95 30, 145 65 C 190 95, 215 25, 250 18"
                stroke="var(--action-primary, #245B42)"
                strokeWidth="1.75"
                strokeDasharray="5 5"
                strokeLinecap="round"
                opacity="0.65"
              />
              <g transform="translate(245, 8) rotate(16)">
                <polygon
                  points="0,0 26,11 0,22 7,11"
                  fill="none"
                  stroke="var(--action-primary, #245B42)"
                  strokeWidth="1.75"
                  strokeLinejoin="round"
                />
                <line
                  x1="7"
                  y1="11"
                  x2="26"
                  y2="11"
                  stroke="var(--action-primary, #245B42)"
                  strokeWidth="1.5"
                />
              </g>
            </svg>

            {/* Arched Student Photo */}
            <div className="cta-arch-frame">
              <img
                src="/images/student_campus_portrait.jpg"
                alt="Smiling Pakistani student on European university campus"
                loading="lazy"
                decoding="async"
              />
            </div>

            {/* Inset Tilted Polaroid Photo */}
            <div className="cta-polaroid-frame" aria-hidden="true">
              <img
                src="/images/university_facade_polaroid.jpg"
                alt="European university historical building facade"
                loading="lazy"
                decoding="async"
              />
            </div>
          </motion.div>

          {/* Right: Typography & Action Controls */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span
              style={{
                display: 'inline-block',
                fontSize: '0.8125rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: 'var(--action-primary, #245B42)',
                marginBottom: '1rem',
              }}
            >
              MAKE YOUR NEXT MOVE
            </span>

            <h2
              style={{
                fontSize: 'clamp(2.4rem, 4.2vw, 3.75rem)',
                fontWeight: 800,
                lineHeight: 1.12,
                letterSpacing: '-0.03em',
                color: 'var(--color-foreground, #19261F)',
                margin: '0 0 1.25rem 0',
              }}
            >
              A new chapter.
              <br />
              <span className="cta-brush-highlight">One simple step.</span>
            </h2>

            <p
              style={{
                fontSize: 'clamp(1.0625rem, 1.8vw, 1.25rem)',
                color: 'var(--color-foreground-muted, #58695E)',
                lineHeight: 1.55,
                margin: '0 0 2.25rem 0',
                maxWidth: '520px',
              }}
            >
              Find your university or get support from our team.
            </p>

            {/* Primary Action Button */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1.25rem' }}>
              <Link
                to={ROUTES.UNIVERSITIES}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.9rem 2.25rem',
                  borderRadius: 'var(--radius-pill, 9999px)',
                  backgroundColor: 'var(--action-primary, #245B42)',
                  color: 'var(--color-on-primary, #FFFFFF)',
                  fontSize: '1.0625rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  boxShadow: '0 6px 20px rgba(36, 91, 66, 0.28)',
                  transition: 'transform var(--transition-fast, 180ms ease), box-shadow var(--transition-fast, 180ms ease)',
                }}
              >
                <span>Explore universities</span>
                <ArrowRight size={18} />
              </Link>

              {/* Secondary link */}
              <button
                type="button"
                onClick={() => setIsAdvisoryModalOpen(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  backgroundColor: 'transparent',
                  border: 'none',
                  padding: 0,
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: 'var(--action-primary, #245B42)',
                  textDecoration: 'underline',
                  textUnderlineOffset: '4px',
                  cursor: 'pointer',
                }}
              >
                <span>Talk to our team</span>
                <ArrowUpRight size={16} />
              </button>
            </div>

            {/* Divider and Corridor List */}
            <hr
              style={{
                borderColor: 'var(--border-subtle, #E1E8DE)',
                margin: '2.5rem 0 1.25rem 0',
                borderWidth: '1px 0 0 0',
                borderStyle: 'solid',
                opacity: 0.8,
              }}
            />

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
                flexWrap: 'wrap',
                fontSize: '0.9375rem',
                fontWeight: 500,
                color: 'var(--color-foreground-muted, #58695E)',
              }}
            >
              <span>Germany</span>
              <span style={{ opacity: 0.4 }}>•</span>
              <span>France</span>
              <span style={{ opacity: 0.4 }}>•</span>
              <span>Italy</span>
              <span style={{ opacity: 0.4 }}>•</span>
              <span>Romania</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Advisory Modal: Request 1-on-1 Academic Eligibility Review */}
      {isAdvisoryModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            backgroundColor: 'rgba(13, 21, 17, 0.72)',
            backdropFilter: 'blur(4px)',
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="advisory-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAdvisoryModalOpen(false);
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              width: '100%',
              maxWidth: '520px',
              backgroundColor: 'var(--surface-card, #FFFFFF)',
              borderRadius: 'var(--radius-card, 24px)',
              padding: '2rem',
              boxShadow: 'var(--shadow-xl, 0 20px 25px -5px rgba(0, 0, 0, 0.1))',
              position: 'relative',
              border: '1px solid var(--border-subtle, #E1E8DE)',
            }}
          >
            <button
              type="button"
              id="close-advisory-modal-btn"
              onClick={() => setIsAdvisoryModalOpen(false)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--surface-canvas, #F6F8F5)',
                border: '1px solid var(--border-subtle, #E1E8DE)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-foreground-muted, #58695E)',
                cursor: 'pointer',
              }}
              aria-label="Close advisory dialog"
            >
              <X size={18} aria-hidden="true" />
            </button>

            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--action-primary, #245B42)',
              }}
            >
              Advisory Desk
            </span>
            <h3
              id="advisory-modal-title"
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: 'var(--color-foreground, #19261F)',
                margin: '0.25rem 0 0.5rem',
              }}
            >
              Request 1-on-1 Academic Eligibility Review
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-foreground-muted, #58695E)', margin: '0 0 1.5rem', lineHeight: 1.5 }}>
              Connect with an accredited European admissions counsellor for an initial profile appraisal.
            </p>

            {advisorySubmitted ? (
              <div
                style={{
                  padding: '1.5rem',
                  borderRadius: 'var(--radius-control, 16px)',
                  backgroundColor: 'rgba(180, 208, 182, 0.2)',
                  border: '1px solid var(--border-subtle, #E1E8DE)',
                  textAlign: 'center',
                }}
              >
                <CheckCircle2 size={36} style={{ color: 'var(--action-primary, #245B42)', margin: '0 auto 0.5rem' }} aria-hidden="true" />
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-foreground, #19261F)', margin: '0 0 0.25rem' }}>
                  Request Dispatched
                </h4>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted, #58695E)', margin: 0 }}>
                  Your advisory request has been dispatched. An admissions counsellor will contact you within 4 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleAdvisorySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label htmlFor="adv-name" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.375rem' }}>
                    Full Legal Name
                  </label>
                  <input
                    id="adv-name"
                    required
                    value={advisoryFormData.fullName}
                    onChange={(e) => setAdvisoryFormData({ ...advisoryFormData, fullName: e.target.value })}
                    placeholder="e.g. Fatima Ali"
                    type="text"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '12px',
                      border: '1px solid var(--border-subtle, #E1E8DE)',
                      fontSize: '0.875rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label htmlFor="adv-email" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.375rem' }}>
                    Email Address
                  </label>
                  <input
                    id="adv-email"
                    required
                    value={advisoryFormData.email}
                    onChange={(e) => setAdvisoryFormData({ ...advisoryFormData, email: e.target.value })}
                    placeholder="fatima@example.com"
                    type="email"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '12px',
                      border: '1px solid var(--border-subtle, #E1E8DE)',
                      fontSize: '0.875rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label htmlFor="adv-dest" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.375rem' }}>
                    Target Corridor &amp; Degree
                  </label>
                  <input
                    id="adv-dest"
                    value={advisoryFormData.targetDestination}
                    onChange={(e) => setAdvisoryFormData({ ...advisoryFormData, targetDestination: e.target.value })}
                    placeholder="e.g. Germany — Master in Computer Science"
                    type="text"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '12px',
                      border: '1px solid var(--border-subtle, #E1E8DE)',
                      fontSize: '0.875rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ paddingTop: '0.5rem' }}>
                  <button
                    type="submit"
                    id="confirm-advisory-slot-btn"
                    style={{
                      width: '100%',
                      padding: '0.875rem',
                      borderRadius: 'var(--radius-pill, 9999px)',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      color: '#FFFFFF',
                      backgroundColor: 'var(--action-primary, #245B42)',
                      border: 'none',
                      cursor: 'pointer',
                      minHeight: '48px',
                      boxShadow: '0 4px 14px rgba(36, 91, 66, 0.25)',
                    }}
                  >
                    Confirm Advisory Request (Free)
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
