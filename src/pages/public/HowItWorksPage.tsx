import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Search,
  ClipboardList,
  FolderOpen,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { ROUTES } from '@/config/routes';

const stepIcons = [Search, ClipboardList, FolderOpen, MapPin];

const steps = [
  {
    num: '01',
    title: 'Explore & Create Free Account',
    status: 'Instant Self-Service',
    timeline: 'Day 0 · Immediate',
    requiresApproval: false,
    desc: 'Browse peer-verified universities across Germany, France, Italy, and Romania. Create a free Explorer account to unlock the full database, save target study tracks, bookmark programmes, and access comprehensive procedural guides — with zero upfront commitments.',
    points: [
      'Unrestricted preview catalogue of 50 accredited institutions for guests; full database for explorers',
      'Truthful tuition disclosures — state subsidized vs. non-EU statutory schedules',
      'Personal bookmarking and shortlisting with zero sales harassment or hidden paywalls',
    ],
    studentDoes: 'Browse the catalogue, create an Explorer account, and save target institutions.',
    teamDoes: 'Curates and verifies official admission requirements and deadlines.',
    action: { label: 'Explore Universities', to: ROUTES.UNIVERSITIES },
    image: '/images/student_library_explorer.jpg',
    imageAlt: 'Student exploring universities on laptop in a library',
  },
  {
    num: '02',
    title: 'Request Guidance & Team Review',
    status: 'Requires Staff Review',
    timeline: '1 to 2 Business Days',
    requiresApproval: true,
    desc: 'When ready for structured admissions counsel, submit an official guidance request. Educational staff evaluate your academic background, transcripts, and corridor preferences to assess feasibility and assign an advisor.',
    points: [
      'Select target country corridors: Germany, France, Italy, Romania',
      'Explorer catalogue access remains completely unrestricted while your request is evaluated',
      'Transparent status tracking with direct responses to staff clarification inquiries',
    ],
    studentDoes: 'Submit a guidance request form with your academic details and target corridors.',
    teamDoes: 'Staff review your profile, assess degree equivalency, and assign a dedicated counsellor.',
    action: { label: 'Request Managed Guidance', to: ROUTES.REQUEST_GUIDANCE },
    image: '/images/guidance_intro_visual.jpg',
    imageAlt: 'Student reviewing documents and filling out a request form',
  },
  {
    num: '03',
    title: 'Prepare Documents & Manage Applications',
    status: 'Approved Student Workspace',
    timeline: '2 to 6 Weeks · Dossier Assembly',
    requiresApproval: true,
    desc: 'Upon approval, your dedicated Student Workspace activates. Collaborate with your assigned counsellor in a secure case room, upload certified translations into your private Document Vault, and prepare error-free application dossiers.',
    points: [
      'Private Document Vault for HEC/MOFA attestations, APS certificates, CIMEA, and motivation letters',
      'Pre-submission document audit by your counsellor before portal upload',
      'Staff-operated submissions with official university fee wire receipts — no automated bots',
    ],
    studentDoes: 'Upload documents, complete tasks assigned by your counsellor, and assemble your dossier.',
    teamDoes: 'Counsellor audits attestations, checks ECTS module matches, and coordinates portal submissions.',
    action: { label: 'View Student Workspace', to: ROUTES.STUDENT.ROOT },
    image: '/images/student_counselor_guidance.jpg',
    imageAlt: 'Student and counselor reviewing application documents together',
  },
  {
    num: '04',
    title: 'Track Decisions & Steps Through Arrival',
    status: 'Offers, Visa & Relocation',
    timeline: '4 to 12 Weeks · Consular Clearance',
    requiresApproval: true,
    desc: 'Monitor official admission letters, assemble national study visa files — blocked accounts, consular queues, health insurance — and follow structured pre-departure and arrival checklists.',
    points: [
      'Admission offer verification and statutory enrollment confirmation',
      'Consular visa documentation: German blocked account, French EEF, Italian DOV',
      'Milestone Journey Map from departure preparation through campus arrival',
    ],
    studentDoes: 'Monitor your Journey Map, gather visa documents, and attend consular appointments.',
    teamDoes: 'Staff coordinates admission letter processing, visa file preparation, and milestone tracking.',
    action: { label: 'View Journey Map', to: '/student/journey' },
    image: '/images/hero_student_europe.jpg',
    imageAlt: 'Student with luggage at a European university campus',
  },
];

const corridors = [
  {
    country: 'Germany',
    intakes: 'Winter (Oct) & Summer (Apr)',
    statutoryApp: 'Uni-Assist & Direct Institutional Portals',
    keyGate: 'APS Certificate & German Blocked Account (Sperrkonto)',
    tuitionRange: '€0 tuition (public) · €150–€350/sem contribution',
    flag: '🇩🇪',
  },
  {
    country: 'France',
    intakes: 'Fall (Sep/Oct)',
    statutoryApp: 'Campus France Études en France (EeF) Portal',
    keyGate: 'Campus France Academic Interview & VLS-TS Visa',
    tuitionRange: '€170–€243/yr (with waivers) or €2,770–€3,770/yr',
    flag: '🇫🇷',
  },
  {
    country: 'Italy',
    intakes: 'Autumn (Sep/Oct)',
    statutoryApp: 'Universitaly Portal Pre-enrollment',
    keyGate: 'CIMEA Statements of Comparability & DSU Scholarships',
    tuitionRange: '€500–€3,000/yr (often 100% waived via DSU regional grants)',
    flag: '🇮🇹',
  },
  {
    country: 'Romania',
    intakes: 'Autumn (Oct)',
    statutoryApp: 'University Dossier + Ministry of Education Approval',
    keyGate: 'Scrisoare de Acceptare (Ministry Letter) & Advance Tuition SWIFT',
    tuitionRange: '€2,000–€4,500/yr (payable annually in advance)',
    flag: '🇷🇴',
  },
];

export const HowItWorksPage: React.FC = () => {
  return (
    <div
      style={{
        backgroundColor: 'var(--surface-canvas, #F6F8F5)',
        color: 'var(--text-charcoal, #19261F)',
        fontFamily: 'var(--font-family-base)',
        minHeight: '100vh',
      }}
    >
      {/* 1. Page Header */}
      <section
        style={{
          backgroundColor: '#19261F',
          color: '#FFFFFF',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 80% 20%, rgba(36, 91, 66, 0.45) 0%, transparent 60%)',
          }}
        />

        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            padding: 'clamp(4rem, 7vw, 6rem) clamp(1.25rem, 5vw, 3rem) clamp(3rem, 5vw, 4.5rem)',
            position: 'relative',
            zIndex: 1,
          }}
        >
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
              border: '1px solid rgba(215, 238, 131, 0.25)',
            }}
          >
            <Sparkles size={13} aria-hidden="true" />
            Admissions Operating Model
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
              fontWeight: 800,
              letterSpacing: '-0.035em',
              color: '#FFFFFF',
              margin: '0 0 1.25rem',
              lineHeight: 1.1,
              maxWidth: '820px',
            }}
          >
            How Unilistics Works
          </h1>

          <p
            style={{
              fontSize: 'clamp(1.0625rem, 1.8vw, 1.25rem)',
              color: 'rgba(255, 255, 255, 0.82)',
              lineHeight: 1.6,
              margin: '0 0 2rem',
              maxWidth: '680px',
            }}
          >
            A transparent, human-in-the-loop roadmap engineered specifically for Pakistani students applying to higher
            education in Germany, France, Italy, and Romania.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            <Link
              to={ROUTES.REQUEST_GUIDANCE}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.875rem 1.75rem',
                borderRadius: 'var(--radius-control, 16px)',
                fontWeight: 700,
                fontSize: '0.9375rem',
                color: 'var(--text-charcoal, #19261F)',
                backgroundColor: 'var(--brand-citron, #D7EE83)',
                textDecoration: 'none',
              }}
            >
              <span>Request Managed Guidance</span>
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link
              to={ROUTES.UNIVERSITIES}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.875rem 1.75rem',
                borderRadius: 'var(--radius-control, 16px)',
                fontWeight: 700,
                fontSize: '0.9375rem',
                color: '#FFFFFF',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                textDecoration: 'none',
              }}
            >
              <span>Explore University Catalogue</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. The 4 Step Sequence */}
      <section
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: 'clamp(3.5rem, 6vw, 6rem) clamp(1.25rem, 5vw, 3rem)',
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 4rem' }}>
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
            The 4 Canonical Stages
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
            From First Discovery to Campus Arrival
          </h2>
          <p style={{ color: 'var(--text-muted, #58695E)', fontSize: '1rem', margin: 0, lineHeight: 1.55 }}>
            Each stage has well-defined responsibilities, verified timelines, and structured milestone checks.
          </p>
        </div>

        {steps.map((step, index) => {
          const Icon = stepIcons[index];
          const isEven = index % 2 === 1;

          return (
            <div
              key={step.num}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 'clamp(2rem, 5vw, 4.5rem)',
                alignItems: 'center',
                marginBottom: index < steps.length - 1 ? 'clamp(4rem, 8vw, 7rem)' : 0,
              }}
              className={`how-it-works-step ${isEven ? 'step-reversed' : ''}`}
            >
              {/* Text content — alternates sides */}
              <div
                style={{
                  order: isEven ? 2 : 1,
                }}
                className="step-text"
              >
                {/* Step number + status */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '1.25rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '48px',
                      height: '48px',
                      borderRadius: 'var(--radius-sm, 12px)',
                      backgroundColor: 'var(--action-primary, #245B42)',
                      color: '#FFFFFF',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={22} aria-hidden="true" />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--text-subtle, #58695E)',
                        fontFamily: 'var(--font-family-mono)',
                        letterSpacing: '0.05em',
                        marginBottom: '0.15rem',
                      }}
                    >
                      PHASE {step.num} · {step.timeline}
                    </div>
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        padding: '0.2rem 0.625rem',
                        borderRadius: 'var(--radius-pill, 9999px)',
                        backgroundColor: step.requiresApproval
                          ? 'rgba(215, 238, 131, 0.35)'
                          : 'var(--surface-recessed, #EDF2E9)',
                        color: 'var(--text-charcoal, #19261F)',
                        border: `1px solid ${
                          step.requiresApproval ? 'rgba(215, 238, 131, 0.6)' : 'var(--border-subtle, #E1E8DE)'
                        }`,
                      }}
                    >
                      {step.status}
                    </span>
                  </div>
                </div>

                <h3
                  style={{
                    fontSize: 'clamp(1.375rem, 2.5vw, 1.85rem)',
                    fontWeight: 800,
                    color: 'var(--text-charcoal, #19261F)',
                    letterSpacing: '-0.02em',
                    margin: '0 0 0.875rem',
                    lineHeight: 1.2,
                  }}
                >
                  {step.title}
                </h3>

                <p
                  style={{
                    fontSize: '0.9375rem',
                    color: 'var(--text-muted, #58695E)',
                    lineHeight: 1.65,
                    margin: '0 0 1.25rem',
                  }}
                >
                  {step.desc}
                </p>

                {/* What happens points */}
                <div
                  style={{
                    backgroundColor: 'var(--surface-card, #FFFFFF)',
                    border: '1px solid var(--border-subtle, #E1E8DE)',
                    borderRadius: 'var(--radius-sm, 12px)',
                    padding: '1.125rem 1.25rem',
                    marginBottom: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.625rem',
                  }}
                >
                  {step.points.map((point, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <CheckCircle2
                        size={16}
                        style={{ color: 'var(--action-primary, #245B42)', flexShrink: 0, marginTop: '2px' }}
                        aria-hidden="true"
                      />
                      <span style={{ fontSize: '0.84rem', color: 'var(--text-body, #2C3E33)', lineHeight: 1.5 }}>
                        {point}
                      </span>
                    </div>
                  ))}
                </div>

                {/* You do / Team does */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.75rem',
                    marginBottom: '1.5rem',
                  }}
                  className="step-roles-grid"
                >
                  <div
                    style={{
                      padding: '0.875rem',
                      backgroundColor: 'rgba(36, 91, 66, 0.05)',
                      borderRadius: 'var(--radius-sm, 12px)',
                      border: '1px solid rgba(36, 91, 66, 0.15)',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: 'var(--action-primary, #245B42)',
                        marginBottom: '0.35rem',
                      }}
                    >
                      Applicant Does
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-body, #2C3E33)', margin: 0, lineHeight: 1.45 }}>
                      {step.studentDoes}
                    </p>
                  </div>

                  <div
                    style={{
                      padding: '0.875rem',
                      backgroundColor: 'var(--surface-recessed, #EDF2E9)',
                      borderRadius: 'var(--radius-sm, 12px)',
                      border: '1px solid var(--border-subtle, #E1E8DE)',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: 'var(--text-charcoal, #19261F)',
                        marginBottom: '0.35rem',
                      }}
                    >
                      Counsellor Does
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-body, #2C3E33)', margin: 0, lineHeight: 1.45 }}>
                      {step.teamDoes}
                    </p>
                  </div>
                </div>

                <Link
                  to={step.action.to}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    color: 'var(--action-primary, #245B42)',
                    textDecoration: 'none',
                  }}
                >
                  <span>{step.action.label}</span>
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
              </div>

              {/* Image */}
              <div
                style={{
                  order: isEven ? 1 : 2,
                  borderRadius: 'var(--radius-card, 24px)',
                  overflow: 'hidden',
                  aspectRatio: '4/3',
                  position: 'relative',
                  boxShadow: 'var(--shadow-md, 0 12px 30px rgba(0,0,0,0.08))',
                  border: '1px solid var(--border-subtle, #E1E8DE)',
                }}
                className="step-image"
              >
                <img
                  src={step.image}
                  alt={step.imageAlt}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '1rem',
                    left: '1rem',
                    backgroundColor: 'var(--brand-citron, #D7EE83)',
                    color: 'var(--text-charcoal, #19261F)',
                    fontWeight: 900,
                    fontSize: '0.875rem',
                    padding: '0.3rem 0.85rem',
                    borderRadius: 'var(--radius-pill, 9999px)',
                    fontFamily: 'var(--font-family-mono)',
                    letterSpacing: '0.05em',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  }}
                  aria-hidden="true"
                >
                  {step.num}
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* 3. Corridor Requirements Breakdown */}
      <section
        style={{
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid var(--border-subtle, #E1E8DE)',
          borderBottom: '1px solid var(--border-subtle, #E1E8DE)',
          padding: 'clamp(3.5rem, 6vw, 5.5rem) clamp(1.25rem, 5vw, 3rem)',
        }}
      >
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
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
              Corridor Comparison
            </span>
            <h2
              style={{
                fontSize: 'clamp(1.75rem, 3vw, 2.25rem)',
                fontWeight: 800,
                letterSpacing: '-0.025em',
                color: 'var(--text-charcoal, #19261F)',
                margin: '0 0 0.5rem',
              }}
            >
              Procedural Differences Across European Corridors
            </h2>
            <p style={{ color: 'var(--text-muted, #58695E)', fontSize: '0.9375rem', margin: 0 }}>
              Admissions gateways, fee structures, and consular requirements vary significantly by country.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {corridors.map((c) => (
              <div
                key={c.country}
                style={{
                  backgroundColor: 'var(--surface-canvas, #F6F8F5)',
                  border: '1px solid var(--border-subtle, #E1E8DE)',
                  borderRadius: 'var(--radius-card, 24px)',
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <span style={{ fontSize: '1.75rem' }}>{c.flag}</span>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-charcoal, #19261F)', margin: 0 }}>
                    {c.country}
                  </h4>
                </div>

                <div>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-subtle, #58695E)', letterSpacing: '0.05em' }}>
                    Standard Intakes
                  </span>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-charcoal, #19261F)', fontWeight: 600, margin: '0.2rem 0 0' }}>
                    {c.intakes}
                  </p>
                </div>

                <div>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-subtle, #58695E)', letterSpacing: '0.05em' }}>
                    Central Portal
                  </span>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-charcoal, #19261F)', margin: '0.2rem 0 0', lineHeight: 1.4 }}>
                    {c.statutoryApp}
                  </p>
                </div>

                <div>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--action-primary, #245B42)', letterSpacing: '0.05em' }}>
                    Key Pakistani Gate
                  </span>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-charcoal, #19261F)', fontWeight: 600, margin: '0.2rem 0 0', lineHeight: 1.4 }}>
                    {c.keyGate}
                  </p>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle, #E1E8DE)' }}>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-subtle, #58695E)', letterSpacing: '0.05em' }}>
                    Tuition Profile
                  </span>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--action-primary, #245B42)', fontWeight: 700, margin: '0.2rem 0 0' }}>
                    {c.tuitionRange}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Advisory Disclaimer */}
      <section
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: 'clamp(3rem, 5vw, 5rem) clamp(1.25rem, 5vw, 3rem)',
        }}
      >
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
              Statutory Transparency & Human-in-the-Loop Commitment
            </strong>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted, #58695E)', lineHeight: 1.6, margin: 0 }}>
              Unilistics is an independent admissions advisory desk. We provide administrative and casework
              coordination; we do not grant admission or guarantee visa issuance. Admissions decisions belong solely to
              the sovereign European universities, and visa decisions remain strictly the prerogative of national foreign
              ministries and consular authorities in Islamabad and Karachi.
            </p>
          </div>
        </div>
      </section>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 767px) {
          .how-it-works-step {
            grid-template-columns: 1fr !important;
          }
          .step-text, .step-image {
            order: unset !important;
          }
          .step-image {
            order: -1 !important;
          }
          .step-roles-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default HowItWorksPage;
