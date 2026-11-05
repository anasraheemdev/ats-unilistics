import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Compass,
  LifeBuoy,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building2,
  BookOpen,
  Search,
  MessageSquare,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { ROUTES } from '@/config/routes';

export const SupportHubPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const stats = [
    { label: 'European Corridors', value: '4 Countries', sub: 'Germany, France, Italy, Romania' },
    { label: 'Published Institutions', value: '500+ Listed', sub: 'Peer-reviewed public universities' },
    { label: 'Operational Model', value: 'Human Staff', sub: 'No autonomous bots or scrapers' },
    { label: 'Fee Transparency', value: 'Direct SWIFT', sub: 'Zero payment markup or paywalls' },
  ];

  const primaryPaths = [
    {
      title: 'Self-Service Knowledge',
      subtitle: 'Free & Instant',
      desc: 'Browse verified procedural guides, country-specific requirements, tuition schedules, and visa checklists.',
      icon: Search,
      to: ROUTES.HELP,
      action: 'Browse Help Centre',
      badge: 'Immediate Access',
      badgeColor: 'var(--action-primary)',
      isPrimary: false,
    },
    {
      title: 'Dedicated Human Guidance',
      subtitle: 'Staff-Assisted Casework',
      desc: 'Apply for 1-on-1 counsellor support, document vault audit, pre-submission review, and consular filing advice.',
      icon: MessageSquare,
      to: ROUTES.REQUEST_GUIDANCE,
      action: 'Request Managed Guidance',
      badge: 'Counsellor Review',
      badgeColor: 'var(--brand-citron)',
      isPrimary: true,
    },
  ];

  const services = [
    {
      title: 'How Guidance Works',
      desc: 'Understand the multi-stage pathway from initial discovery to staff-operated casework and consular visa filings.',
      icon: Compass,
      to: '/how-it-works',
      action: 'Read how it works',
      badge: 'Overview',
      tag: 'Process',
    },
    {
      title: 'Request Managed Guidance',
      desc: 'Submit your academic background for staff evaluation to unlock an assigned counsellor, dedicated case room, and document audit.',
      icon: Users,
      to: '/request-guidance',
      action: 'Submit request',
      badge: 'Admissions Desk',
      tag: 'Casework',
    },
    {
      title: 'Help Centre & Guides',
      desc: 'Access verified procedural articles on APS, Uni-assist VPD, blocked accounts, and consular appointment systems.',
      icon: BookOpen,
      to: ROUTES.HELP,
      action: 'Browse articles',
      badge: 'Self-Service',
      tag: 'Knowledge',
    },
    {
      title: 'General Support Desk',
      desc: 'Create authenticated tickets for technical issues, verification queries, or account access clarifications.',
      icon: LifeBuoy,
      to: '/support-desk',
      action: 'Open support desk',
      badge: 'Tickets',
      tag: 'Assistance',
    },
    {
      title: 'Check Request Status',
      desc: 'View real-time status and feedback on your submitted guidance request with your authenticated account.',
      icon: Clock,
      to: '/request-status',
      action: 'View status',
      badge: 'Timeline',
      tag: 'Tracking',
    },
    {
      title: 'Contact Admissions Operations',
      desc: 'Reach our Islamabad & Karachi operational desks for administrative coordination or direct inquiries.',
      icon: Building2,
      to: ROUTES.CONTACT,
      action: 'Contact desk',
      badge: 'Direct Desk',
      tag: 'Contact',
    },
  ];

  const faqs = [
    {
      q: 'How long does a managed guidance request take to be evaluated?',
      a: 'Admissions counsellors review submitted guidance requests within 1 to 2 business days. During this evaluation period, you retain full access to the Explorer catalogue and can research universities freely.',
    },
    {
      q: 'What is the core difference between Explorer Access and Managed Guidance?',
      a: 'Explorer Access gives you full search capability across 500+ European universities, degree programmes, and scholarships. Managed Guidance is an independent tier providing an assigned counsellor, private document vault, pre-submission audit, and personalized consular visa preparation.',
    },
    {
      q: 'Does Unilistics collect university application or visa fees?',
      a: 'No. Unilistics does not escrow or collect tuition or official application fees. All institutional fees (Uni-assist, Campus France, Universitaly) and visa processing charges are paid directly to the statutory authorities via wire/SWIFT bank receipts.',
    },
    {
      q: 'Can I request guidance for multiple countries simultaneously?',
      a: 'Yes. You can select any combination of our active corridors (Germany, France, Italy, and Romania) during your intake request. Your assigned advisor will assess your degree equivalency and qualifications for each corridor.',
    },
    {
      q: 'What documents should I prepare before requesting guidance?',
      a: 'Having your Matric/O-Level, FSc/A-Level, and Bachelor’s transcript (if applying for Master’s) on hand helps us conduct an accurate preliminary equivalency review against European university standards.',
    },
  ];

  return (
    <div
      style={{
        backgroundColor: 'var(--surface-canvas, #F6F8F5)',
        color: 'var(--text-charcoal, #19261F)',
        fontFamily: 'var(--font-family-base)',
        minHeight: '100vh',
      }}
    >
      {/* 1. Hero Section */}
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#173627',
          color: '#FFFFFF',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <img
          src="/images/support_hub_counselor.jpg"
          alt="Admissions counsellor guiding Pakistani student"
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 35%',
            opacity: 0.38,
            filter: 'contrast(1.05)',
          }}
          loading="eager"
          decoding="async"
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(135deg, rgba(23, 54, 39, 0.94) 0%, rgba(25, 38, 31, 0.88) 60%, rgba(36, 91, 66, 0.75) 100%)',
          }}
        />

        <div
          style={{
            position: 'relative',
            zIndex: 2,
            maxWidth: '1200px',
            margin: '0 auto',
            padding: 'clamp(4rem, 8vw, 6.5rem) clamp(1.25rem, 5vw, 3rem) clamp(3rem, 6vw, 4.5rem)',
          }}
        >
          <div style={{ maxWidth: '720px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--brand-citron, #D7EE83)',
                backgroundColor: 'rgba(215, 238, 131, 0.12)',
                padding: '0.35rem 0.875rem',
                borderRadius: 'var(--radius-pill, 9999px)',
                marginBottom: '1.25rem',
                border: '1px solid rgba(215, 238, 131, 0.28)',
              }}
            >
              <Sparkles size={13} aria-hidden="true" />
              Admissions Support Ecosystem
            </div>

            <h1
              style={{
                fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
                fontWeight: 800,
                letterSpacing: '-0.035em',
                color: '#FFFFFF',
                margin: '0 0 1.25rem',
                lineHeight: 1.1,
              }}
            >
              Support & Guidance Hub
            </h1>

            <p
              style={{
                fontSize: 'clamp(1.0625rem, 1.8vw, 1.25rem)',
                color: 'rgba(255, 255, 255, 0.85)',
                lineHeight: 1.6,
                margin: '0 0 2.5rem',
                maxWidth: '620px',
              }}
            >
              Whether you need self-service procedural guides or dedicated human counsel for your European admissions
              and visa dossier, explore your pathways below.
            </p>

            {/* Dual Hero Action Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              <Link
                to={ROUTES.REQUEST_GUIDANCE}
                id="hero-request-guidance-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.875rem 1.75rem',
                  borderRadius: 'var(--radius-control, 16px)',
                  fontWeight: 700,
                  fontSize: '0.9375rem',
                  color: 'var(--text-charcoal, #19261F)',
                  backgroundColor: 'var(--brand-citron, #D7EE83)',
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                  transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(215, 238, 131, 0.35)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.2)';
                }}
              >
                <Users size={18} aria-hidden="true" />
                Request Managed Guidance
                <ArrowRight size={16} aria-hidden="true" />
              </Link>

              <Link
                to={ROUTES.HELP}
                id="hero-browse-help-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.875rem 1.75rem',
                  borderRadius: 'var(--radius-control, 16px)',
                  fontWeight: 700,
                  fontSize: '0.9375rem',
                  color: '#FFFFFF',
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.28)',
                  textDecoration: 'none',
                  backdropFilter: 'blur(8px)',
                  transition: 'background-color 0.18s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
                }}
              >
                <BookOpen size={18} aria-hidden="true" />
                Browse Help Centre
              </Link>
            </div>
          </div>
        </div>

        {/* 2. Stats Ribbon */}
        <div
          style={{
            backgroundColor: 'rgba(15, 30, 22, 0.75)',
            backdropFilter: 'blur(10px)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '1.25rem clamp(1.25rem, 5vw, 3rem)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {stats.map((s) => (
              <div key={s.label} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <span
                  style={{
                    fontSize: '1.125rem',
                    fontWeight: 800,
                    color: 'var(--brand-citron, #D7EE83)',
                    fontFamily: 'var(--font-family-base)',
                  }}
                >
                  {s.value}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                  {s.label} · {s.sub}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Primary Pathways: Self-Service vs Managed */}
      <section style={{ padding: 'clamp(3rem, 6vw, 5rem) clamp(1.25rem, 5vw, 3rem) 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--action-primary, #245B42)',
                backgroundColor: 'rgba(36, 91, 66, 0.08)',
                padding: '0.3rem 0.875rem',
                borderRadius: 'var(--radius-pill, 9999px)',
                display: 'inline-block',
                marginBottom: '0.75rem',
              }}
            >
              Choose Your Support Model
            </span>
            <h2
              style={{
                fontSize: 'clamp(1.75rem, 3vw, 2.35rem)',
                fontWeight: 800,
                letterSpacing: '-0.025em',
                color: 'var(--text-charcoal, #19261F)',
                margin: '0 0 0.75rem',
              }}
            >
              Two Transparent Ways to Navigate Europe
            </h2>
            <p style={{ color: 'var(--text-muted, #58695E)', fontSize: '1rem', margin: 0, lineHeight: 1.55 }}>
              Choose independent self-service exploration with verified open guides, or upgrade to dedicated human
              advisory oversight.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.75rem',
              marginBottom: '3rem',
            }}
          >
            {primaryPaths.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.title}
                  style={{
                    backgroundColor: 'var(--surface-card, #FFFFFF)',
                    border: p.isPrimary
                      ? '2px solid var(--action-primary, #245B42)'
                      : '1px solid var(--border-subtle, #E1E8DE)',
                    borderRadius: 'var(--radius-card, 24px)',
                    padding: '2.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: p.isPrimary ? '0 8px 30px rgba(36, 91, 66, 0.08)' : 'var(--shadow-sm)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {p.isPrimary && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        backgroundColor: 'var(--action-primary, #245B42)',
                        color: 'var(--brand-citron, #D7EE83)',
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        padding: '0.35rem 1.25rem',
                        borderBottomLeftRadius: '12px',
                      }}
                    >
                      Human-Managed Casework
                    </div>
                  )}

                  <div>
                    <div
                      style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: 'var(--radius-sm, 12px)',
                        backgroundColor: p.isPrimary
                          ? 'rgba(36, 91, 66, 0.1)'
                          : 'var(--surface-recessed, #EDF2E9)',
                        color: 'var(--action-primary, #245B42)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1.25rem',
                      }}
                    >
                      <Icon size={26} aria-hidden="true" />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.35rem' }}>
                      <h3
                        style={{
                          fontSize: '1.35rem',
                          fontWeight: 800,
                          color: 'var(--text-charcoal, #19261F)',
                          margin: 0,
                        }}
                      >
                        {p.title}
                      </h3>
                    </div>

                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--action-primary, #245B42)',
                        display: 'block',
                        marginBottom: '1rem',
                      }}
                    >
                      {p.subtitle}
                    </span>

                    <p
                      style={{
                        fontSize: '0.9375rem',
                        color: 'var(--text-muted, #58695E)',
                        lineHeight: 1.6,
                        margin: '0 0 1.75rem',
                      }}
                    >
                      {p.desc}
                    </p>
                  </div>

                  <Link
                    to={p.to}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '0.875rem 1.5rem',
                      borderRadius: 'var(--radius-control, 16px)',
                      fontWeight: 700,
                      fontSize: '0.9375rem',
                      textDecoration: 'none',
                      transition: 'background-color 0.18s ease, transform 0.18s ease',
                      ...(p.isPrimary
                        ? {
                            backgroundColor: 'var(--action-primary, #245B42)',
                            color: '#FFFFFF',
                          }
                        : {
                            backgroundColor: 'var(--surface-recessed, #EDF2E9)',
                            color: 'var(--text-charcoal, #19261F)',
                            border: '1px solid var(--border-subtle, #E1E8DE)',
                          }),
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <span>{p.action}</span>
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Categorized Services Grid */}
      <section style={{ padding: '2rem clamp(1.25rem, 5vw, 3rem) clamp(3rem, 6vw, 5rem)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--action-primary, #245B42)',
                backgroundColor: 'rgba(36, 91, 66, 0.08)',
                padding: '0.3rem 0.875rem',
                borderRadius: 'var(--radius-pill, 9999px)',
                display: 'inline-block',
                marginBottom: '0.75rem',
              }}
            >
              Navigation Directory
            </span>
            <h2
              style={{
                fontSize: 'clamp(1.5rem, 2.5vw, 2rem)',
                fontWeight: 800,
                color: 'var(--text-charcoal, #19261F)',
                letterSpacing: '-0.025em',
                margin: '0 0 0.5rem',
              }}
            >
              All Support & Operations Desks
            </h2>
            <p style={{ color: 'var(--text-muted, #58695E)', fontSize: '0.9375rem', margin: 0 }}>
              Select a portal section to resolve inquiries, check dossiers, or explore destination requirements.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <Link
                  key={service.title}
                  to={service.to}
                  style={{
                    backgroundColor: 'var(--surface-card, #FFFFFF)',
                    border: '1px solid var(--border-subtle, #E1E8DE)',
                    borderRadius: 'var(--radius-card, 24px)',
                    padding: '1.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'box-shadow 0.2s ease, border-color 0.2s ease, transform 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = 'var(--shadow-hover, 0 10px 25px rgba(0,0,0,0.06))';
                    e.currentTarget.style.borderColor = 'var(--border-refined, #B4D0B6)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = 'var(--border-subtle, #E1E8DE)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '1rem',
                      }}
                    >
                      <div
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: 'var(--radius-sm, 12px)',
                          backgroundColor: 'var(--surface-recessed, #EDF2E9)',
                          color: 'var(--action-primary, #245B42)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={22} aria-hidden="true" />
                      </div>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          padding: '0.25rem 0.625rem',
                          borderRadius: 'var(--radius-pill, 9999px)',
                          backgroundColor: 'var(--surface-recessed, #EDF2E9)',
                          color: 'var(--text-secondary, #435449)',
                        }}
                      >
                        {service.badge}
                      </span>
                    </div>

                    <h3
                      style={{
                        fontSize: '1.125rem',
                        fontWeight: 700,
                        color: 'var(--text-charcoal, #19261F)',
                        margin: '0 0 0.5rem',
                      }}
                    >
                      {service.title}
                    </h3>
                    <p
                      style={{
                        fontSize: '0.84rem',
                        color: 'var(--text-muted, #58695E)',
                        lineHeight: 1.55,
                        margin: 0,
                      }}
                    >
                      {service.desc}
                    </p>
                  </div>

                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      color: 'var(--action-primary, #245B42)',
                      marginTop: '1.5rem',
                    }}
                  >
                    <span>{service.action}</span>
                    <ArrowRight size={14} aria-hidden="true" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Interactive FAQ Accordion */}
      <section style={{ padding: '2rem clamp(1.25rem, 5vw, 3rem) clamp(3rem, 6vw, 5rem)' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--action-primary, #245B42)',
                backgroundColor: 'rgba(36, 91, 66, 0.08)',
                padding: '0.3rem 0.875rem',
                borderRadius: 'var(--radius-pill, 9999px)',
                display: 'inline-block',
                marginBottom: '0.75rem',
              }}
            >
              Common Questions
            </span>
            <h2
              style={{
                fontSize: 'clamp(1.5rem, 2.5vw, 2rem)',
                fontWeight: 800,
                letterSpacing: '-0.025em',
                color: 'var(--text-charcoal, #19261F)',
                margin: '0 0 0.5rem',
              }}
            >
              Frequently Asked Guidance Questions
            </h2>
            <p style={{ color: 'var(--text-muted, #58695E)', fontSize: '0.9375rem', margin: 0 }}>
              Key procedural details regarding application reviews, fees, and counsellor assignments.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={faq.q}
                  style={{
                    backgroundColor: 'var(--surface-card, #FFFFFF)',
                    border: '1px solid var(--border-subtle, #E1E8DE)',
                    borderRadius: 'var(--radius-card, 24px)',
                    overflow: 'hidden',
                    transition: 'border-color 0.15s ease',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1.25rem 1.5rem',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      color: 'var(--text-charcoal, #19261F)',
                      fontSize: '1rem',
                      fontWeight: 700,
                      gap: '1rem',
                    }}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={18}
                      aria-hidden="true"
                      style={{
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                        flexShrink: 0,
                        color: 'var(--action-primary, #245B42)',
                      }}
                    />
                  </button>
                  {isOpen && (
                    <div
                      style={{
                        padding: '0 1.5rem 1.25rem',
                        color: 'var(--text-muted, #58695E)',
                        fontSize: '0.875rem',
                        lineHeight: 1.6,
                        borderTop: '1px solid var(--border-subtle, #E1E8DE)',
                        paddingTop: '1rem',
                      }}
                    >
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. Honest Trust & Regulatory Disclaimer */}
      <section style={{ padding: '0 clamp(1.25rem, 5vw, 3rem) clamp(3rem, 6vw, 5rem)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div
            style={{
              backgroundColor: 'var(--surface-card, #FFFFFF)',
              border: '1px solid var(--border-subtle, #E1E8DE)',
              borderRadius: 'var(--radius-card, 24px)',
              padding: '1.75rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1.25rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-sm, 12px)',
                backgroundColor: 'var(--color-success-bg, #E8F5E9)',
                color: 'var(--action-primary, #245B42)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <ShieldCheck size={22} aria-hidden="true" />
            </div>
            <div>
              <strong
                style={{
                  fontSize: '0.975rem',
                  color: 'var(--text-charcoal, #19261F)',
                  display: 'block',
                  marginBottom: '0.375rem',
                }}
              >
                Statutory Admissions Authority & Human Verification Notice
              </strong>
              <p
                style={{
                  fontSize: '0.84rem',
                  color: 'var(--text-muted, #58695E)',
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                Unilistics provides professional admissions structuring and document verification to help Pakistani
                students avoid costly filing rejections. Final admission decisions are exclusively statutory decisions of
                university academic faculties, and visa approvals are strictly sovereign prerogatives of the respective
                embassies in Islamabad and Karachi. All statutory portal fees are paid directly to verified foreign
                accounts via official bank wire/SWIFT transfers.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SupportHubPage;

