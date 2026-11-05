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
  ShieldCheck,
  GraduationCap,
} from 'lucide-react';
import { ROUTES } from '@/config/routes';

interface RoadmapStation {
  number: string;
  badge: string;
  title: string;
  subtitle: string;
  desc: string;
  image: string;
  icon: React.ElementType;
  route: string;
  buttonText: string;
  side: 'left' | 'right';
  pinCoords: { x: number; y: number };
  cardTop: number;
}

const STATIONS: RoadmapStation[] = [
  {
    number: '01',
    badge: 'Immediate Free Access',
    title: 'Explore Higher Education Catalogues',
    subtitle: 'Transparent, Unrestricted Research',
    desc: 'Compare 180+ accredited European universities with verified €0 statutory tuition benchmarks and intake deadlines.',
    image: '/images/roadmap_step1_explore.jpg',
    icon: Compass,
    route: ROUTES.UNIVERSITIES,
    buttonText: 'Explore Catalogues',
    side: 'left',
    pinCoords: { x: 520, y: 130 },
    cardTop: 20,
  },
  {
    number: '02',
    badge: 'Self-Service Discovery',
    title: 'Create an Explorer Account',
    subtitle: 'Track Deadlines & Attestation Sequence',
    desc: 'Track personal HEC, MOFA & IBCC attestation steps, bookmark study tracks, and unlock custom search filters.',
    image: '/images/roadmap_step2_account.jpg',
    icon: FolderCheck,
    route: ROUTES.SIGN_UP,
    buttonText: 'Create Free Account',
    side: 'right',
    pinCoords: { x: 660, y: 370 },
    cardTop: 260,
  },
  {
    number: '03',
    badge: 'Staff Review Required',
    title: 'Request Managed Casework Guidance',
    subtitle: 'Eligibility Audit & Counsellor Allocation',
    desc: 'Get 1-on-1 academic eligibility evaluation from a dedicated counsellor with SWIFT fee & blocked account tracking.',
    image: '/images/roadmap_step3_guidance.jpg',
    icon: Users,
    route: '/request-guidance',
    buttonText: 'Request Guidance',
    side: 'left',
    pinCoords: { x: 520, y: 610 },
    cardTop: 500,
  },
  {
    number: '04',
    badge: 'Dedicated Workspace',
    title: 'Structured Application Room & Visas',
    subtitle: 'End-to-End Dossier Audit to Visa Filing',
    desc: 'Submit verified pre-consular dossiers (APS, EEF, Universitaly) and complete official consular appointment filing.',
    image: '/images/roadmap_step4_visa.jpg',
    icon: Award,
    route: '/support',
    buttonText: 'Learn About Casework',
    side: 'right',
    pinCoords: { x: 660, y: 850 },
    cardTop: 740,
  },
];

export const JourneyRoadmap: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);

  return (
    <section
      id="journey-roadmap-section"
      className="journey-roadmap-section-wrapper"
      style={{
        paddingTop: '2.5rem',
        paddingBottom: '3rem',
        paddingLeft: '1.25rem',
        paddingRight: '1.25rem',
        backgroundColor: 'var(--surface-canvas, #FAFCF9)',
        borderTop: '1px solid var(--border-subtle, #E1E8DE)',
        borderBottom: '1px solid var(--border-subtle, #E1E8DE)',
        position: 'relative',
        overflow: 'hidden',
      }}
      aria-label="How Your Journey Progresses Roadmap"
    >
      {/* Background Soft Glow Accents */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '5%',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(215, 238, 131, 0.18) 0%, transparent 70%)',
          filter: 'blur(70px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
        aria-hidden="true"
      />
      <div
        style={{
          position: 'absolute',
          bottom: '15%',
          right: '5%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(36, 91, 66, 0.08) 0%, transparent 70%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
        aria-hidden="true"
      />

      <div style={{ maxWidth: '1180px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
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

            {/* Quick Interactive Stage Indicator Pills */}
            <div
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

        {/* Desktop Roadmap Container: Curved Non-Straight Winding Highway + Visual Cards (Width >= 900px) */}
        <div
          className="hide-on-mobile"
          style={{
            position: 'relative',
            width: '100%',
            height: '1060px',
            margin: '0 auto',
          }}
        >
          {/* Continuous Meandering Serpentine Winding Road (SVG Canvas: 0 0 1180 1060) */}
          <svg
            viewBox="0 0 1180 1060"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 2,
            }}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              {/* Traveling Gradient Pulse */}
              <linearGradient id="winding-highway-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#245B42" />
                <stop offset="35%" stopColor="#D7EE83" />
                <stop offset="70%" stopColor="#245B42" />
                <stop offset="100%" stopColor="#D7EE83" />
              </linearGradient>

              {/* Waypoint Soft Shadow */}
              <filter id="waypoint-shadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#245B42" floodOpacity="0.25" />
              </filter>
            </defs>

            {/* 1. Road Bed Foundation (Outer Gray-Sage Casing) */}
            <path
              d="
                M 520,20
                L 520,130
                C 520,250 660,250 660,370
                C 660,490 520,490 520,610
                C 520,730 660,730 660,850
                C 660,940 590,940 590,990
              "
              fill="none"
              stroke="var(--border-subtle, #DDE6DA)"
              strokeWidth="20"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* 2. Clean Surface Inner Track */}
            <path
              d="
                M 520,20
                L 520,130
                C 520,250 660,250 660,370
                C 660,490 520,490 520,610
                C 520,730 660,730 660,850
                C 660,940 590,940 590,990
              "
              fill="none"
              stroke="var(--surface-card, #FFFFFF)"
              strokeWidth="14"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* 3. Winding Dashed Centerline (NON-STRAIGHT CURVED HIGHWAY) */}
            <path
              d="
                M 520,20
                L 520,130
                C 520,250 660,250 660,370
                C 660,490 520,490 520,610
                C 520,730 660,730 660,850
                C 660,940 590,940 590,990
              "
              fill="none"
              stroke="var(--action-primary, #245B42)"
              strokeWidth="3"
              strokeDasharray="9 7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* 4. Traveling Energy Pulse along the Winding Curve */}
            <path
              d="
                M 520,20
                L 520,130
                C 520,250 660,250 660,370
                C 660,490 520,490 520,610
                C 520,730 660,730 660,850
                C 660,940 590,940 590,990
              "
              fill="none"
              stroke="url(#winding-highway-grad)"
              strokeWidth="5"
              strokeDasharray="40 280"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <animate
                attributeName="stroke-dashoffset"
                values="320;0"
                dur="3.4s"
                repeatCount="indefinite"
              />
            </path>

            {/* 5. Horizontal Connectors into Flanking Cards */}
            {/* Connector 1: from Card 1 Right Edge (360, 130) to Node (520, 130) */}
            <line x1="360" y1="130" x2="520" y2="130" stroke="var(--action-primary, #245B42)" strokeWidth="2" strokeDasharray="4 4" />
            {/* Connector 2: from Node (660, 370) to Card 2 Left Edge (820, 370) */}
            <line x1="660" y1="370" x2="820" y2="370" stroke="var(--action-primary, #245B42)" strokeWidth="2" strokeDasharray="4 4" />
            {/* Connector 3: from Card 3 Right Edge (360, 610) to Node (520, 610) */}
            <line x1="360" y1="610" x2="520" y2="610" stroke="var(--action-primary, #245B42)" strokeWidth="2" strokeDasharray="4 4" />
            {/* Connector 4: from Node (660, 850) to Card 4 Left Edge (820, 850) */}
            <line x1="660" y1="850" x2="820" y2="850" stroke="var(--action-primary, #245B42)" strokeWidth="2" strokeDasharray="4 4" />

            {/* 6. Milestone Waypoint Station Pins along the Meandering Curve */}
            {STATIONS.map((st, i) => {
              const isSelected = activeStep === i;
              const { x, y } = st.pinCoords;
              return (
                <g key={`pin-${st.number}`} transform={`translate(${x}, ${y})`}>
                  {/* Outer Pulsing Aura */}
                  <circle
                    r={isSelected ? 26 : 18}
                    fill="#D7EE83"
                    opacity={isSelected ? 0.75 : 0.25}
                  >
                    <animate
                      attributeName="r"
                      values={isSelected ? "20;30;20" : "16;22;16"}
                      dur={isSelected ? "2s" : "3s"}
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values={isSelected ? "0.75;0.2;0.75" : "0.25;0.08;0.25"}
                      dur={isSelected ? "2s" : "3s"}
                      repeatCount="indefinite"
                    />
                  </circle>

                  {/* Pin Base Circle */}
                  <circle
                    r={isSelected ? 15 : 12}
                    fill={isSelected ? 'var(--action-primary, #245B42)' : 'var(--surface-card, #FFFFFF)'}
                    stroke="var(--action-primary, #245B42)"
                    strokeWidth="3"
                    filter="url(#waypoint-shadow)"
                  />

                  {/* Stage Number Inside Node */}
                  <text
                    x="0"
                    y="4"
                    textAnchor="middle"
                    fill={isSelected ? '#FFFFFF' : 'var(--action-primary, #245B42)'}
                    fontSize="10"
                    fontWeight="800"
                    fontFamily="monospace"
                  >
                    {st.number}
                  </text>
                </g>
              );
            })}

            {/* 7. Destination Arrival Waypoint Badge (At Bottom of Winding Highway) */}
            <g transform="translate(590, 990)">
              <circle r="18" fill="#245B42" stroke="#D7EE83" strokeWidth="3" filter="url(#waypoint-shadow)" />
              <circle r="6" fill="#D7EE83" />
            </g>
          </svg>

          {/* Destination Celebration Badge */}
          <div
            style={{
              position: 'absolute',
              top: '975px',
              left: '590px',
              transform: 'translateX(-50%)',
              zIndex: 10,
              backgroundColor: '#19261F',
              color: '#FFFFFF',
              padding: '0.4rem 1.15rem',
              borderRadius: 'var(--radius-pill, 9999px)',
              fontSize: '0.78rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
              border: '1.5px solid #D7EE83',
            }}
          >
            <GraduationCap size={15} style={{ color: '#D7EE83' }} />
            <span>Embassy Visa Issuance &amp; European Campus Arrival</span>
          </div>

          {/* Alternating Flanking Cards with Graphics (NO Messy Bullet Lists!) */}
          <div style={{ position: 'relative', zIndex: 10, height: '100%' }}>
            {STATIONS.map((st, i) => {
              const IconComp = st.icon;
              const isSelected = activeStep === i;
              const isLeft = st.side === 'left';

              return (
                <div
                  key={st.number}
                  onClick={() => setActiveStep(i)}
                  onMouseEnter={() => setActiveStep(i)}
                  style={{
                    position: 'absolute',
                    top: `${st.cardTop}px`,
                    left: isLeft ? '0px' : 'auto',
                    right: isLeft ? 'auto' : '0px',
                    width: '360px',
                    backgroundColor: 'var(--surface-card, #FFFFFF)',
                    borderRadius: '16px',
                    padding: '1rem',
                    border: isSelected
                      ? '2px solid var(--action-primary, #245B42)'
                      : '1px solid var(--border-subtle, #E1E8DE)',
                    boxShadow: isSelected
                      ? '0 12px 32px rgba(36, 91, 66, 0.18)'
                      : '0 4px 16px rgba(0, 0, 0, 0.05)',
                    transition: 'all 200ms ease',
                    cursor: 'pointer',
                  }}
                >
                  {/* Card Header */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.4rem',
                      marginBottom: '0.4rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          backgroundColor: isSelected ? 'var(--action-primary, #245B42)' : 'var(--surface-recessed, #EDF2E9)',
                          color: isSelected ? '#FFFFFF' : 'var(--action-primary, #245B42)',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '6px',
                          fontFamily: 'monospace',
                          transition: 'all 200ms ease',
                        }}
                      >
                        STAGE {st.number}
                      </span>
                      <span
                        style={{
                          fontSize: '0.62rem',
                          fontWeight: 700,
                          padding: '0.12rem 0.45rem',
                          borderRadius: 'var(--radius-pill, 9999px)',
                          backgroundColor: 'var(--brand-citron, #D7EE83)',
                          color: '#19261F',
                        }}
                      >
                        {st.badge}
                      </span>
                    </div>

                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        backgroundColor: isSelected ? 'rgba(36, 91, 66, 0.08)' : 'transparent',
                        color: 'var(--action-primary, #245B42)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconComp size={15} />
                    </div>
                  </div>

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

                  {/* Custom Generated 3D Graphic Illustration (Replacing Messy Bullet Lists) */}
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: '145px',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      marginBottom: '0.55rem',
                      backgroundColor: 'var(--surface-recessed, #F3F6F2)',
                      border: '1px solid var(--border-subtle, #E1E8DE)',
                    }}
                  >
                    <img
                      src={st.image}
                      alt={`${st.title} stage graphic`}
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        transition: 'transform 300ms ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.04)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    />
                  </div>

                  {/* Clean, Non-Messy Summary Sentence */}
                  <p
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--color-foreground-muted, #58695E)',
                      lineHeight: 1.45,
                      margin: '0 0 0.65rem 0',
                    }}
                  >
                    {st.desc}
                  </p>

                  {/* Card Bottom CTA */}
                  <Link
                    to={st.route}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                      padding: '0.45rem 0.95rem',
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

        {/* Mobile Roadmap: Vertical Curved Winding Highway + Visual Graphic Cards */}
        <div
          className="hide-on-desktop"
          style={{
            position: 'relative',
            paddingLeft: '2.5rem',
            marginTop: '1.25rem',
          }}
        >
          {/* Continuous Left Curved Trail on Mobile */}
          <svg
            style={{
              position: 'absolute',
              left: '0.75rem',
              top: '1rem',
              bottom: '1rem',
              width: '28px',
              height: 'calc(100% - 2rem)',
              pointerEvents: 'none',
            }}
            preserveAspectRatio="none"
            viewBox="0 0 28 800"
            aria-hidden="true"
          >
            <path
              d="
                M 14,20
                C 24,90 4,160 14,220
                C 24,290 4,360 14,420
                C 24,490 4,560 14,620
                C 24,690 10,750 14,780
              "
              fill="none"
              stroke="#245B42"
              strokeWidth="2.5"
              strokeDasharray="6 5"
              strokeLinecap="round"
            />
          </svg>

          {/* Stacked Visual Cards on Mobile */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {STATIONS.map((st) => {
              const IconComp = st.icon;
              return (
                <div
                  key={`mobile-${st.number}`}
                  style={{
                    backgroundColor: 'var(--surface-card, #FFFFFF)',
                    borderRadius: '16px',
                    padding: '1rem',
                    border: '1.5px solid var(--border-subtle, #E1E8DE)',
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
                    position: 'relative',
                  }}
                >
                  {/* Waypoint Indicator Pin on Mobile Curved Trail */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '-2.15rem',
                      top: '1.25rem',
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--action-primary, #245B42)',
                      border: '2.5px solid var(--surface-card, #FFFFFF)',
                      boxShadow: '0 0 0 2.5px var(--brand-citron, #D7EE83)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      fontSize: '0.6rem',
                      fontWeight: 800,
                      fontFamily: 'monospace',
                    }}
                  >
                    {st.number}
                  </div>

                  {/* Header Row */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '0.45rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          backgroundColor: 'var(--surface-card-subtle, #EDF2E9)',
                          color: 'var(--action-primary, #245B42)',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '6px',
                          fontFamily: 'monospace',
                        }}
                      >
                        STAGE {st.number}
                      </span>
                      <span
                        style={{
                          fontSize: '0.62rem',
                          fontWeight: 700,
                          padding: '0.12rem 0.45rem',
                          borderRadius: 'var(--radius-pill, 9999px)',
                          backgroundColor: 'var(--brand-citron, #D7EE83)',
                          color: '#19261F',
                        }}
                      >
                        {st.badge}
                      </span>
                    </div>
                    <IconComp size={16} style={{ color: 'var(--action-primary, #245B42)' }} />
                  </div>

                  <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-foreground, #19261F)', margin: '0 0 0.15rem' }}>
                    {st.title}
                  </h3>
                  <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--action-primary, #245B42)', margin: '0 0 0.45rem' }}>
                    {st.subtitle}
                  </p>

                  {/* Graphic on Mobile */}
                  <div
                    style={{
                      width: '100%',
                      height: '135px',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      marginBottom: '0.55rem',
                      backgroundColor: 'var(--surface-recessed, #F3F6F2)',
                      border: '1px solid var(--border-subtle, #E1E8DE)',
                    }}
                  >
                    <img
                      src={st.image}
                      alt={`${st.title} stage graphic`}
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </div>

                  <p style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted, #58695E)', lineHeight: 1.45, margin: '0 0 0.65rem' }}>
                    {st.desc}
                  </p>

                  <Link
                    to={st.route}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.45rem 0.95rem',
                      borderRadius: 'var(--radius-pill, 9999px)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor: 'var(--action-primary, #245B42)',
                      color: 'var(--color-on-primary, #FFFFFF)',
                      textDecoration: 'none',
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
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
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
