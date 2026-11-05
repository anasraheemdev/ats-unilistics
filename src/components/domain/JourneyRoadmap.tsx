import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  FolderCheck,
  Users,
  Award,
  ArrowRight,
  Sparkles,
  Check,
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
  deliverables: string[];
  icon: React.ElementType;
  route: string;
  buttonText: string;
  side: 'left' | 'right';
  pinCoords: { x: number; y: number };
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
      'View GPA thresholds and recognized secondary qualification baselines',
    ],
    icon: Compass,
    route: ROUTES.UNIVERSITIES,
    buttonText: 'Explore Catalogues',
    side: 'left',
    pinCoords: { x: 520, y: 150 },
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
      'Access verified procedural guides for visa appointment queues',
    ],
    icon: FolderCheck,
    route: ROUTES.SIGN_UP,
    buttonText: 'Create Free Account',
    side: 'right',
    pinCoords: { x: 660, y: 420 },
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
      'Transparent agreement with no hidden kickbacks or portal vaults',
    ],
    icon: Users,
    route: '/request-guidance',
    buttonText: 'Request Guidance',
    side: 'left',
    pinCoords: { x: 520, y: 690 },
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
      'Arrival preparation, health insurance verification & enrollment proof',
    ],
    icon: Award,
    route: '/support',
    buttonText: 'Learn About Casework',
    side: 'right',
    pinCoords: { x: 660, y: 960 },
  },
];

export const JourneyRoadmap: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);

  return (
    <section
      id="journey-roadmap-section"
      style={{
        paddingTop: '3.25rem',
        paddingBottom: '3.5rem',
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
          top: '15%',
          left: '2%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(215, 238, 131, 0.22) 0%, transparent 70%)',
          filter: 'blur(70px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
        aria-hidden="true"
      />
      <div
        style={{
          position: 'absolute',
          bottom: '10%',
          right: '3%',
          width: '550px',
          height: '550px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(36, 91, 66, 0.10) 0%, transparent 70%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
        aria-hidden="true"
      />

      <div style={{ maxWidth: '1180px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 1.75rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 0.95rem',
              borderRadius: 'var(--radius-pill, 9999px)',
              backgroundColor: 'rgba(36, 91, 66, 0.08)',
              border: '1px solid rgba(36, 91, 66, 0.16)',
              marginBottom: '1.25rem',
            }}
          >
            <Sparkles size={15} style={{ color: 'var(--action-primary, #245B42)' }} />
            <span
              style={{
                fontSize: '0.75rem',
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
              fontSize: 'clamp(2rem, 3.8vw, 2.85rem)',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              color: 'var(--color-foreground, #19261F)',
              margin: '0 0 1rem 0',
              lineHeight: 1.15,
            }}
          >
            How Your Journey Progresses.{' '}
            <span style={{ color: 'var(--action-primary, #245B42)' }}>
              The Admissions Roadmap.
            </span>
          </h2>

          <p
            style={{
              fontSize: '1.0625rem',
              color: 'var(--color-foreground-muted, #58695E)',
              margin: '0 0 2rem 0',
              lineHeight: 1.6,
            }}
          >
            From independent program discovery to official consular appointment readiness, follow a verified milestone roadmap designed for Pakistani university applicants.
          </p>

          {/* Interactive Stage Indicator Pills */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.625rem',
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
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    borderRadius: 'var(--radius-pill, 9999px)',
                    fontSize: '0.8125rem',
                    fontWeight: isSelected ? 700 : 600,
                    backgroundColor: isSelected ? 'var(--action-primary, #245B42)' : 'var(--surface-card, #FFFFFF)',
                    color: isSelected ? 'var(--color-on-primary, #FFFFFF)' : 'var(--color-foreground, #19261F)',
                    border: isSelected ? '1.5px solid var(--action-primary, #245B42)' : '1px solid var(--border-subtle, #D8E2D4)',
                    cursor: 'pointer',
                    transition: 'all 200ms ease',
                    boxShadow: isSelected ? '0 4px 14px rgba(36, 91, 66, 0.25)' : '0 2px 6px rgba(0,0,0,0.03)',
                  }}
                >
                  <span
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: isSelected ? 'var(--brand-citron, #D7EE83)' : 'var(--surface-card-subtle, #EDF2E9)',
                      color: '#19261F',
                      fontSize: '0.6875rem',
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
        </div>

        {/* Desktop Roadmap Container: Alternating Flanking Cards + Central Winding Highway (Width >= 900px) */}
        <div
          className="hide-on-mobile"
          style={{
            position: 'relative',
            width: '100%',
            height: '1320px',
            margin: '0 auto',
          }}
        >
          {/* Continuous Meandering Serpentine Winding Road (SVG Canvas: 0 0 1180 1260) */}
          <svg
            viewBox="0 0 1180 1260"
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
                <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#245B42" floodOpacity="0.25" />
              </filter>
            </defs>

            {/* 1. Road Bed Foundation (Outer Gray-Sage Casing) */}
            <path
              d="
                M 520,40
                L 520,150
                C 520,285 660,285 660,420
                C 660,555 520,555 520,690
                C 520,825 660,825 660,960
                C 660,1070 590,1070 590,1180
              "
              fill="none"
              stroke="var(--border-subtle, #DDE6DA)"
              strokeWidth="24"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* 2. Asphalt Road Surface (Clean Inner Track) */}
            <path
              d="
                M 520,40
                L 520,150
                C 520,285 660,285 660,420
                C 660,555 520,555 520,690
                C 520,825 660,825 660,960
                C 660,1070 590,1070 590,1180
              "
              fill="none"
              stroke="var(--surface-card, #FFFFFF)"
              strokeWidth="16"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* 3. Winding Dashed Centerline (NON-STRAIGHT CURVED HIGHWAY) */}
            <path
              d="
                M 520,40
                L 520,150
                C 520,285 660,285 660,420
                C 660,555 520,555 520,690
                C 520,825 660,825 660,960
                C 660,1070 590,1070 590,1180
              "
              fill="none"
              stroke="var(--action-primary, #245B42)"
              strokeWidth="3.5"
              strokeDasharray="10 8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* 4. Traveling Energy Pulse along the Winding Curve */}
            <path
              d="
                M 520,40
                L 520,150
                C 520,285 660,285 660,420
                C 660,555 520,555 520,690
                C 520,825 660,825 660,960
                C 660,1070 590,1070 590,1180
              "
              fill="none"
              stroke="url(#winding-highway-grad)"
              strokeWidth="6"
              strokeDasharray="45 320"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <animate
                attributeName="stroke-dashoffset"
                values="365;0"
                dur="3.6s"
                repeatCount="indefinite"
              />
            </path>

            {/* 5. Horizontal Direct Connectors into Smaller Flanking Cards (360px width) */}
            {/* Connector 1: from Card 1 Right Edge (360, 150) to Node (520, 150) */}
            <line x1="360" y1="150" x2="520" y2="150" stroke="var(--action-primary, #245B42)" strokeWidth="2" strokeDasharray="4 4" />
            {/* Connector 2: from Node (660, 420) to Card 2 Left Edge (820, 420) */}
            <line x1="660" y1="420" x2="820" y2="420" stroke="var(--action-primary, #245B42)" strokeWidth="2" strokeDasharray="4 4" />
            {/* Connector 3: from Card 3 Right Edge (360, 690) to Node (520, 690) */}
            <line x1="360" y1="690" x2="520" y2="690" stroke="var(--action-primary, #245B42)" strokeWidth="2" strokeDasharray="4 4" />
            {/* Connector 4: from Node (660, 960) to Card 4 Left Edge (820, 960) */}
            <line x1="660" y1="960" x2="820" y2="960" stroke="var(--action-primary, #245B42)" strokeWidth="2" strokeDasharray="4 4" />

            {/* 6. Milestone Waypoint Station Pins along the Meandering Curve */}
            {STATIONS.map((st, i) => {
              const isSelected = activeStep === i;
              const { x, y } = st.pinCoords;
              return (
                <g key={`pin-${st.number}`} transform={`translate(${x}, ${y})`}>
                  {/* Outer Pulsing Aura */}
                  <circle
                    r={isSelected ? 30 : 20}
                    fill="#D7EE83"
                    opacity={isSelected ? 0.75 : 0.3}
                  >
                    <animate
                      attributeName="r"
                      values={isSelected ? "22;34;22" : "18;24;18"}
                      dur={isSelected ? "2s" : "3s"}
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values={isSelected ? "0.75;0.2;0.75" : "0.3;0.1;0.3"}
                      dur={isSelected ? "2s" : "3s"}
                      repeatCount="indefinite"
                    />
                  </circle>

                  {/* Pin Base Circle */}
                  <circle
                    r={isSelected ? 16 : 13}
                    fill={isSelected ? 'var(--action-primary, #245B42)' : 'var(--surface-card, #FFFFFF)'}
                    stroke="var(--action-primary, #245B42)"
                    strokeWidth="3.5"
                    filter="url(#waypoint-shadow)"
                  />

                  {/* Stage Number Inside Node */}
                  <text
                    x="0"
                    y="4.5"
                    textAnchor="middle"
                    fill={isSelected ? '#FFFFFF' : 'var(--action-primary, #245B42)'}
                    fontSize="11"
                    fontWeight="800"
                    fontFamily="monospace"
                  >
                    {st.number}
                  </text>
                </g>
              );
            })}

            {/* 7. Destination Arrival Waypoint Badge (At Bottom of Winding Highway) */}
            <g transform="translate(590, 1180)">
              <circle r="20" fill="#245B42" stroke="#D7EE83" strokeWidth="3.5" filter="url(#waypoint-shadow)" />
              <circle r="7" fill="#D7EE83" />
            </g>
          </svg>

          {/* Destination Celebration Badge */}
          <div
            style={{
              position: 'absolute',
              top: '1165px',
              left: '590px',
              transform: 'translateX(-50%)',
              zIndex: 10,
              backgroundColor: '#19261F',
              color: '#FFFFFF',
              padding: '0.45rem 1.25rem',
              borderRadius: 'var(--radius-pill, 9999px)',
              fontSize: '0.8125rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
              border: '1.5px solid #D7EE83',
            }}
          >
            <GraduationCap size={16} style={{ color: '#D7EE83' }} />
            <span>Embassy Visa Issuance & European Campus Arrival</span>
          </div>

          {/* Flanking Milestone Cards (Alternating Left & Right alongside the Winding Highway) */}
          <div style={{ position: 'relative', zIndex: 10, height: '100%' }}>
            {STATIONS.map((st, i) => {
              const IconComp = st.icon;
              const isSelected = activeStep === i;
              const isLeft = st.side === 'left';
              // Top positions vertically aligned with the SVG waypoints
              const topPositions = [30, 300, 570, 840];
              const topPos = topPositions[i];

              return (
                <div
                  key={st.number}
                  onClick={() => setActiveStep(i)}
                  onMouseEnter={() => setActiveStep(i)}
                  style={{
                    position: 'absolute',
                    top: `${topPos}px`,
                    left: isLeft ? '0px' : 'auto',
                    right: isLeft ? 'auto' : '0px',
                    width: '360px',
                    backgroundColor: 'var(--surface-card, #FFFFFF)',
                    borderRadius: '18px',
                    padding: '1.25rem 1.35rem',
                    border: isSelected
                      ? '2px solid var(--action-primary, #245B42)'
                      : '1.5px solid var(--border-subtle, #E1E8DE)',
                    boxShadow: isSelected
                      ? '0 16px 36px -8px rgba(0, 0, 0, 0.22)'
                      : '0 4px 16px rgba(0, 0, 0, 0.05)',
                    transition: 'all 240ms cubic-bezier(0.16, 1, 0.3, 1)',
                    transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                    cursor: 'pointer',
                  }}
                >
                  {/* Top Bar: Stage Pill + Badge + Icon */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '0.625rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          backgroundColor: isSelected ? 'var(--action-primary, #245B42)' : 'var(--surface-card-subtle, #EDF2E9)',
                          color: isSelected ? 'var(--color-on-primary, #FFFFFF)' : 'var(--action-primary, #245B42)',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '6px',
                          fontFamily: 'monospace',
                          transition: 'all 200ms ease',
                        }}
                      >
                        STAGE {st.number}
                      </span>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.5rem',
                          borderRadius: 'var(--radius-pill, 9999px)',
                          backgroundColor: isSelected ? 'var(--brand-citron, #D7EE83)' : 'var(--surface-card-subtle, #EDF2E9)',
                          color: isSelected ? '#19261F' : 'var(--color-foreground-muted, #58695E)',
                          transition: 'all 200ms ease',
                        }}
                      >
                        {st.badge}
                      </span>
                    </div>

                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: isSelected ? 'var(--action-primary, #245B42)' : 'var(--surface-card-subtle, #EDF2E9)',
                        color: isSelected ? 'var(--color-on-primary, #FFFFFF)' : 'var(--action-primary, #245B42)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 200ms ease',
                      }}
                    >
                      <IconComp size={16} />
                    </div>
                  </div>

                  {/* Title & Subtitle */}
                  <h3
                    style={{
                      fontSize: '1.0625rem',
                      fontWeight: 800,
                      color: 'var(--color-foreground, #19261F)',
                      margin: '0 0 0.2rem 0',
                      lineHeight: 1.25,
                    }}
                  >
                    {st.title}
                  </h3>
                  <p
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--action-primary, #245B42)',
                      margin: '0 0 0.5rem 0',
                    }}
                  >
                    {st.subtitle}
                  </p>
                  <p
                    style={{
                      fontSize: '0.8125rem',
                      color: 'var(--color-foreground-muted, #58695E)',
                      lineHeight: 1.45,
                      margin: '0 0 0.875rem 0',
                    }}
                  >
                    {st.desc}
                  </p>

                  {/* Deliverables Checklist */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.35rem',
                      marginBottom: '1rem',
                      backgroundColor: 'var(--surface-card-subtle, #FAFCF9)',
                      padding: '0.625rem 0.85rem',
                      borderRadius: '10px',
                      border: '1px solid var(--border-subtle, #E8EFE5)',
                    }}
                  >
                    {st.deliverables.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.45rem',
                          fontSize: '0.75rem',
                          color: 'var(--color-foreground, #19261F)',
                        }}
                      >
                        <Check
                          size={13}
                          style={{
                            color: 'var(--action-primary, #245B42)',
                            flexShrink: 0,
                            marginTop: '2px',
                            strokeWidth: 3,
                          }}
                        />
                        <span style={{ lineHeight: 1.35 }}>{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action Link Button */}
                  <Link
                    to={st.route}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.5rem 1rem',
                      borderRadius: 'var(--radius-pill, 9999px)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor: isSelected ? 'var(--action-primary, #245B42)' : 'var(--surface-card-subtle, #EDF2E9)',
                      color: isSelected ? 'var(--color-on-primary, #FFFFFF)' : 'var(--color-foreground, #19261F)',
                      border: '1px solid var(--border-subtle, #E1E8DE)',
                      textDecoration: 'none',
                      transition: 'all 150ms ease',
                      boxShadow: isSelected ? '0 4px 12px rgba(36, 91, 66, 0.25)' : 'none',
                    }}
                  >
                    <span>{st.buttonText}</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile Winding Roadmap (< 900px Viewport) */}
        <div className="hide-on-desktop" style={{ position: 'relative', width: '100%', paddingLeft: '2.5rem' }}>
          {/* Sinuous Curved SVG Roadmap Track on Left Edge (NON-STRAIGHT CURVED LINE) */}
          <svg
            viewBox="0 0 60 920"
            style={{
              position: 'absolute',
              top: 0,
              left: '0.5rem',
              width: '44px',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 1,
            }}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {/* Winding Sinuous Path on Mobile */}
            <path
              d="
                M 22,30
                C 38,110 6,190 22,250
                C 38,330 6,410 22,480
                C 38,560 6,640 22,710
                C 38,780 18,850 22,890
              "
              fill="none"
              stroke="#DDE6DA"
              strokeWidth="12"
              strokeLinecap="round"
            />
            <path
              d="
                M 22,30
                C 38,110 6,190 22,250
                C 38,330 6,410 22,480
                C 38,560 6,640 22,710
                C 38,780 18,850 22,890
              "
              fill="none"
              stroke="#245B42"
              strokeWidth="3"
              strokeDasharray="6 6"
              strokeLinecap="round"
            />
          </svg>

          {/* Stacked Milestone Cards on Mobile */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {STATIONS.map((st) => {
              const IconComp = st.icon;
              return (
                <div
                  key={`mobile-${st.number}`}
                  style={{
                    backgroundColor: 'var(--surface-card, #FFFFFF)',
                    borderRadius: '18px',
                    padding: '1.25rem',
                    border: '1.5px solid var(--border-subtle, #E1E8DE)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
                    position: 'relative',
                  }}
                >
                  {/* Waypoint Indicator Pin on Mobile Winding Line */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '-2.4rem',
                      top: '1.5rem',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--action-primary, #245B42)',
                      border: '3px solid var(--surface-card, #FFFFFF)',
                      boxShadow: '0 0 0 3px var(--brand-citron, #D7EE83)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-on-primary, #FFFFFF)',
                      fontSize: '0.625rem',
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
                      marginBottom: '0.625rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          backgroundColor: 'var(--surface-card-subtle, #EDF2E9)',
                          color: 'var(--action-primary, #245B42)',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '6px',
                          fontFamily: 'monospace',
                        }}
                      >
                        STAGE {st.number}
                      </span>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.5rem',
                          borderRadius: 'var(--radius-pill, 9999px)',
                          backgroundColor: 'var(--brand-citron, #D7EE83)',
                          color: '#19261F',
                        }}
                      >
                        {st.badge}
                      </span>
                    </div>
                    <IconComp size={18} style={{ color: 'var(--action-primary, #245B42)' }} />
                  </div>

                  <h3 style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--color-foreground, #19261F)', margin: '0 0 0.2rem' }}>
                    {st.title}
                  </h3>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--action-primary, #245B42)', margin: '0 0 0.5rem' }}>
                    {st.subtitle}
                  </p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted, #58695E)', lineHeight: 1.45, margin: '0 0 0.875rem' }}>
                    {st.desc}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.35rem',
                      marginBottom: '1rem',
                      backgroundColor: 'var(--surface-card-subtle, #FAFCF9)',
                      padding: '0.625rem 0.75rem',
                      borderRadius: '10px',
                      border: '1px solid var(--border-subtle, #E8EFE5)',
                    }}
                  >
                    {st.deliverables.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.45rem',
                          fontSize: '0.75rem',
                          color: 'var(--color-foreground, #19261F)',
                        }}
                      >
                        <Check size={13} style={{ color: 'var(--action-primary, #245B42)', flexShrink: 0, marginTop: '2px', strokeWidth: 3 }} />
                        <span style={{ lineHeight: 1.35 }}>{item}</span>
                      </div>
                    ))}
                  </div>

                  <Link
                    to={st.route}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.5rem 1rem',
                      borderRadius: 'var(--radius-pill, 9999px)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor: 'var(--action-primary, #245B42)',
                      color: 'var(--color-on-primary, #FFFFFF)',
                      textDecoration: 'none',
                    }}
                  >
                    <span>{st.buttonText}</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pathway Walkthrough Comprehensive CTA */}
        <div style={{ textAlign: 'center', marginTop: '4rem' }}>
          <Link
            to="/how-it-works"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.9375rem',
              fontWeight: 700,
              color: 'var(--action-primary, #245B42)',
              textDecoration: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: 'var(--radius-pill, 9999px)',
              backgroundColor: 'var(--surface-card, #EDF2E9)',
              border: '1px solid var(--border-subtle, #D8E2D4)',
              transition: 'background-color 150ms ease, transform 150ms ease',
            }}
          >
            <ShieldCheck size={18} />
            <span>Read the comprehensive walkthrough of our admission & visa procedures</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
};

