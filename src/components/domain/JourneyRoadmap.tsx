import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Compass,
  FolderCheck,
  Users,
  Award,
  ArrowRight,
  Sparkles,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { ROUTES } from '@/config/routes';

interface RoadmapStation {
  number: string;
  badge: string;
  title: string;
  subtitle: string;
  desc: string;
  deliverables: string[];
  icon: React.ElementType;
  route: string;
  buttonText: string;
}

const STATIONS: RoadmapStation[] = [
  {
    number: '01',
    badge: 'Immediate Free Access',
    title: 'Explore Higher Education Catalogues',
    subtitle: 'Transparent, Unrestricted Research',
    desc: 'Browse peer-verified English and native-taught degree programmes across four European destinations with factual statutory criteria.',
    deliverables: [
      'Search 180+ accredited universities in Germany, France, Italy, Romania',
      'Compare statutory non-EU tuition (€0 public fees in Germany vs. subsidized France)',
      'Inspect official intake cycles (Winter/Oct vs. Summer/Apr deadlines)',
    ],
    icon: Compass,
    route: ROUTES.UNIVERSITIES,
    buttonText: 'Explore Catalogues',
  },
  {
    number: '02',
    badge: 'Self-Service Discovery',
    title: 'Create an Explorer Account',
    subtitle: 'Track Deadlines & Attestation Sequence',
    desc: 'Save target universities, bookmark study tracks, and unlock full search filters without managed casework commitments.',
    deliverables: [
      'Shortlist programmes and evaluate prerequisite compatibility',
      'Personalized tracking of HEC, MOFA, and IBCC attestation steps',
      'Save custom filter presets for English-medium degree tracks',
    ],
    icon: FolderCheck,
    route: ROUTES.SIGN_UP,
    buttonText: 'Create Free Account',
  },
  {
    number: '03',
    badge: 'Staff Review Required',
    title: 'Request Managed Casework Guidance',
    subtitle: 'Eligibility Audit & Counsellor Allocation',
    desc: 'When ready for structured application support, submit an official guidance request for admissions staff review.',
    deliverables: [
      'Independent academic eligibility & GPA conversion review',
      'Allocation of a dedicated educational casework counsellor',
      'SWIFT wire tracking for application fees and blocked account setup',
    ],
    icon: Users,
    route: '/request-guidance',
    buttonText: 'Request Guidance',
  },
  {
    number: '04',
    badge: 'Dedicated Workspace',
    title: 'Structured Application Room & Visas',
    subtitle: 'End-to-End Dossier Audit to Visa Filing',
    desc: 'Once approved, collaborate with an assigned counsellor across verified document checklists, deadlines, and consular filings.',
    deliverables: [
      'APS certificate verification & Uni-assist VPD dossier dispatch',
      'Universitaly pre-enrollment or Campus France EEF pre-consular filing',
      'Consular dossier audit & official appointment readiness checklists',
    ],
    icon: Award,
    route: '/support',
    buttonText: 'Learn About Casework',
  },
];

export const JourneyRoadmap: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);

  return (
    <section
      id="journey-roadmap-section"
      className="journey-roadmap-section-wrapper"
      style={{
        padding: '2.5rem 1.25rem',
        backgroundColor: 'var(--surface-canvas, #FAFCF9)',
        borderTop: '1px solid var(--border-subtle, #E1E8DE)',
        borderBottom: '1px solid var(--border-subtle, #E1E8DE)',
        position: 'relative',
        overflow: 'hidden',
      }}
      aria-label="How Your Journey Progresses Roadmap"
    >
      <div style={{ maxWidth: '1240px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 1.5rem' }}>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.3rem 0.85rem',
                borderRadius: 'var(--radius-pill, 9999px)',
                backgroundColor: 'rgba(36, 91, 66, 0.08)',
                border: '1px solid rgba(36, 91, 66, 0.16)',
                marginBottom: '0.65rem',
              }}
            >
              <Sparkles size={13} style={{ color: 'var(--action-primary, #245B42)' }} />
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: 'var(--action-primary, #245B42)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                Step-by-Step Pathway
              </span>
            </div>

            <h2
              style={{
                fontSize: 'clamp(1.4rem, 2.2vw, 1.85rem)',
                fontWeight: 800,
                letterSpacing: '-0.025em',
                color: 'var(--color-foreground, #19261F)',
                margin: '0 0 0.45rem 0',
                lineHeight: 1.2,
              }}
            >
              How Your Journey Progresses.{' '}
              <span style={{ color: 'var(--action-primary, #245B42)' }}>
                The Admissions Roadmap.
              </span>
            </h2>

            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--color-foreground-muted, #58695E)',
                margin: '0 auto 1.25rem',
                lineHeight: 1.55,
              }}
            >
              From independent program discovery to official consular appointment readiness, follow a verified milestone roadmap designed for Pakistani university applicants.
            </p>

            {/* Stage Quick Filter Pills */}
            <div
              className="roadmap-step-pills-bar"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                flexWrap: 'wrap',
              }}
            >
              {STATIONS.map((st, i) => {
                const isSelected = activeStep === i;
                return (
                  <button
                    key={st.number}
                    type="button"
                    onClick={() => setActiveStep(i)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.35rem 0.85rem',
                      borderRadius: 'var(--radius-pill, 9999px)',
                      fontSize: '0.78rem',
                      fontWeight: isSelected ? 700 : 500,
                      backgroundColor: isSelected ? 'var(--action-primary, #245B42)' : 'var(--surface-card, #FFFFFF)',
                      color: isSelected ? '#FFFFFF' : 'var(--color-foreground, #19261F)',
                      border: isSelected ? '1px solid var(--action-primary, #245B42)' : '1px solid var(--border-subtle, #D8E2D4)',
                      cursor: 'pointer',
                      transition: 'all 160ms ease',
                      boxShadow: isSelected ? '0 2px 8px rgba(36, 91, 66, 0.2)' : '0 1px 3px rgba(0,0,0,0.02)',
                    }}
                  >
                    <span
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        backgroundColor: isSelected ? 'var(--brand-citron, #D7EE83)' : 'var(--surface-recessed, #EDF2E9)',
                        color: '#19261F',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {i + 1}
                    </span>
                    <span>{st.title.split(' ')[0]} {st.title.split(' ')[1]}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Milestone Connected Progress Flow (Compact 4-Column Grid) */}
        <div style={{ position: 'relative' }}>
          {/* Subtle Top Connection Track (Desktop) */}
          <div
            className="roadmap-connector-line hide-on-mobile"
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '20px',
              left: '12.5%',
              right: '12.5%',
              height: '2px',
              backgroundColor: 'var(--border-subtle, #E1E8DE)',
              zIndex: 0,
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: `${(activeStep / (STATIONS.length - 1)) * 100}%`,
                backgroundColor: 'var(--action-primary, #245B42)',
                transition: 'width 300ms ease',
              }}
            />
          </div>

          {/* 4 Connected Milestone Cards */}
          <div
            className="roadmap-cards-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1rem',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {STATIONS.map((st, i) => {
              const IconComp = st.icon;
              const isSelected = activeStep === i;

              return (
                <div
                  key={st.number}
                  onClick={() => setActiveStep(i)}
                  style={{
                    backgroundColor: 'var(--surface-card, #FFFFFF)',
                    borderRadius: '16px',
                    padding: '1.15rem 1rem 1rem',
                    border: isSelected
                      ? '1.5px solid var(--action-primary, #245B42)'
                      : '1px solid var(--border-subtle, #E1E8DE)',
                    boxShadow: isSelected
                      ? '0 8px 24px -4px rgba(36, 91, 66, 0.16)'
                      : '0 2px 6px rgba(0, 0, 0, 0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 200ms ease',
                    position: 'relative',
                  }}
                >
                  <div>
                    {/* Top Step Milestone Node & Badges */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.4rem',
                        marginBottom: '0.65rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <div
                          style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '50%',
                            backgroundColor: isSelected ? 'var(--action-primary, #245B42)' : 'var(--surface-recessed, #EDF2E9)',
                            color: isSelected ? '#FFFFFF' : 'var(--action-primary, #245B42)',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            fontFamily: 'monospace',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: isSelected ? '2px solid var(--brand-citron, #D7EE83)' : '1px solid var(--border-subtle, #D8E2D4)',
                            transition: 'all 200ms ease',
                          }}
                        >
                          {st.number}
                        </div>
                        <span
                          style={{
                            fontSize: '0.62rem',
                            fontWeight: 700,
                            padding: '0.12rem 0.45rem',
                            borderRadius: 'var(--radius-pill, 9999px)',
                            backgroundColor: isSelected ? 'rgba(36, 91, 66, 0.1)' : 'var(--surface-recessed, #F0F4EF)',
                            color: isSelected ? 'var(--action-primary, #245B42)' : 'var(--color-foreground-muted, #58695E)',
                          }}
                        >
                          {st.badge}
                        </span>
                      </div>

                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '8px',
                          backgroundColor: isSelected ? 'rgba(36, 91, 66, 0.08)' : 'transparent',
                          color: 'var(--action-primary, #245B42)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <IconComp size={16} />
                      </div>
                    </div>

                    {/* Step Title & Subtitle */}
                    <h3
                      style={{
                        fontSize: '0.925rem',
                        fontWeight: 800,
                        color: 'var(--color-foreground, #19261F)',
                        margin: '0 0 0.15rem 0',
                        lineHeight: 1.25,
                      }}
                    >
                      {st.title}
                    </h3>

                    <div
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: 'var(--action-primary, #245B42)',
                        marginBottom: '0.45rem',
                      }}
                    >
                      {st.subtitle}
                    </div>

                    <p
                      style={{
                        fontSize: '0.76rem',
                        color: 'var(--color-foreground-muted, #58695E)',
                        lineHeight: 1.45,
                        margin: '0 0 0.65rem 0',
                      }}
                    >
                      {st.desc}
                    </p>

                    {/* Compact Deliverables Box */}
                    <div
                      style={{
                        backgroundColor: 'var(--surface-recessed, #F7FAF6)',
                        padding: '0.5rem 0.65rem',
                        borderRadius: '8px',
                        border: '1px solid var(--border-subtle, #E8EFE5)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.3rem',
                        marginBottom: '0.85rem',
                      }}
                    >
                      {st.deliverables.map((item, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.35rem',
                            fontSize: '0.7rem',
                            color: 'var(--color-foreground, #19261F)',
                            lineHeight: 1.35,
                          }}
                        >
                          <Check
                            size={11}
                            style={{
                              color: 'var(--action-primary, #245B42)',
                              flexShrink: 0,
                              marginTop: '2px',
                              strokeWidth: 2.5,
                            }}
                          />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card Bottom CTA */}
                  <Link
                    to={st.route}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                      padding: '0.45rem 0.85rem',
                      borderRadius: 'var(--radius-pill, 9999px)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor: isSelected ? 'var(--action-primary, #245B42)' : 'var(--surface-recessed, #EFF5F1)',
                      color: isSelected ? '#FFFFFF' : 'var(--action-primary, #245B42)',
                      textDecoration: 'none',
                      transition: 'all 160ms ease',
                      border: isSelected ? 'none' : '1px solid var(--border-subtle, #D8E2D4)',
                    }}
                  >
                    <span>{st.buttonText}</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pathway Walkthrough Compact CTA */}
        <div style={{ textAlign: 'center', marginTop: '1.75rem' }}>
          <Link
            to="/how-it-works"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontSize: '0.8125rem',
              fontWeight: 700,
              color: 'var(--action-primary, #245B42)',
              textDecoration: 'none',
              padding: '0.5rem 1.15rem',
              borderRadius: 'var(--radius-pill, 9999px)',
              backgroundColor: 'var(--surface-card, #FFFFFF)',
              border: '1px solid var(--border-subtle, #D8E2D4)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              transition: 'all 160ms ease',
            }}
          >
            <ShieldCheck size={15} />
            <span>Read comprehensive walkthrough of our admission &amp; visa procedures</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </section>
  );
};
