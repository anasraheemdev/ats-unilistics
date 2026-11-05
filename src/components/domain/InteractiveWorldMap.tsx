import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Compass,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  GraduationCap,
} from 'lucide-react';
import worldMapData from '@/data/worldMapData.json';

export interface CorridorSpotlight {
  id: string;
  code: string;
  name: string;
  flag: string;
  tagline: string;
  intakeNote: string;
  tuitionNote: string;
  visaProtocol: string;
  topFields: string[];
  universitiesIndexed: number;
  catalogRoute: string;
  pctCoords: { x: number; y: number };
  svgCoords: { x: number; y: number };
}

const CORRIDORS: CorridorSpotlight[] = [
  {
    id: 'germany',
    code: 'DE',
    name: 'Germany',
    flag: '🇩🇪',
    tagline: 'Zero Tuition Focus & Technical Preeminence',
    intakeNote: 'Winter (Oct) & Summer (Apr) Intakes',
    tuitionNote: '€0 Statutory Tuition at Most Public Universities',
    visaProtocol: 'APS India/Pakistan Verification + Uni-assist VPD',
    topFields: ['Mechanical Engineering', 'Data Science & AI', 'Renewable Energy', 'Automotive'],
    universitiesIndexed: 68,
    catalogRoute: '/universities?country=germany',
    pctCoords: { x: 51.9, y: 20.5 },
    svgCoords: { x: 1037.5, y: 175.5 },
  },
  {
    id: 'france',
    code: 'FR',
    name: 'France',
    flag: '🇫🇷',
    tagline: 'Grandes Écoles & Subsidized Higher Education',
    intakeNote: 'Fall (Sep/Oct) Main Admissions Window',
    tuitionNote: 'Exemptions & Statutory Ministry Subsidies Available',
    visaProtocol: 'Campus France Études en France (EEF) Pre-Consular Track',
    topFields: ['Aerospace Engineering', 'Management & Finance', 'Luxury Business', 'Applied Physics'],
    universitiesIndexed: 45,
    catalogRoute: '/universities?country=france',
    pctCoords: { x: 50.0, y: 24.0 },
    svgCoords: { x: 999.5, y: 205.5 },
  },
  {
    id: 'italy',
    code: 'IT',
    name: 'Italy',
    flag: '🇮🇹',
    tagline: 'Art, Politecnici & Regional DSU Scholarships',
    intakeNote: 'Autumn Intake with Early Pre-Enrollment',
    tuitionNote: 'Income-Based Reductions & Regional Grants (DSU)',
    visaProtocol: 'Universitaly Pre-Enrollment + DoV/CIMEA Verification',
    topFields: ['Architecture & Design', 'Automotive Engineering', 'Economics', 'Biotechnology'],
    universitiesIndexed: 40,
    catalogRoute: '/universities?country=italy',
    pctCoords: { x: 52.6, y: 27.2 },
    svgCoords: { x: 1052.0, y: 233.5 },
  },
  {
    id: 'romania',
    code: 'RO',
    name: 'Romania',
    flag: '🇷🇴',
    tagline: 'Direct Ministry Acceptance & English Programs',
    intakeNote: 'Rolling Pre-Registration to Autumn Intake',
    tuitionNote: 'Transparent Fixed Fees (€2,000–€5,000/year)',
    visaProtocol: 'Direct Ministry Acceptance Letter (Scrisoare de Acceptare)',
    topFields: ['General Medicine & Dentistry', 'Software Engineering', 'Cybersecurity', 'Veterinary'],
    universitiesIndexed: 28,
    catalogRoute: '/universities?country=romania',
    pctCoords: { x: 55.6, y: 24.2 },
    svgCoords: { x: 1112.5, y: 207.5 },
  },
];

// Origin coordinates for Pakistan hub (Islamabad) from real Robinson projection
const PAKISTAN_HUB = {
  pctCoords: { x: 68.0, y: 35.8 },
  svgCoords: { x: 1360.0, y: 306.5 },
};

// Global reference nodes matching screenshot 2 layout (real Robinson coords)
const GLOBAL_REFERENCE_NODES = [
  { code: 'CA', name: 'Canada', tag: 'High Employability', coords: { x: 28.1, y: 13.7 } },
  { code: 'US', name: 'USA', tag: 'Ivy League Access', coords: { x: 18.6, y: 25.6 } },
  { code: 'JP', name: 'Japan', tag: 'Tech & Innovation', coords: { x: 85.5, y: 29.9 } },
  { code: 'AU', name: 'Australia', tag: 'Research Hubs', coords: { x: 85.8, y: 78.9 } },
];

export const InteractiveWorldMap: React.FC = () => {
  const [selectedCorridorId, setSelectedCorridorId] = useState<string>('germany');
  const [hoveredCorridorId, setHoveredCorridorId] = useState<string | null>(null);
  const [hoveredCountryCode, setHoveredCountryCode] = useState<string | null>(null);

  const selectedCorridor =
    CORRIDORS.find((c) => c.id === selectedCorridorId) || CORRIDORS[0];

  // Helper to determine country fill styling
  const getCountryFill = (code: string) => {
    if (code === 'PK') return 'var(--map-hub-resting, #CDE4D2)'; // Pakistan Hub Highlight
    if (code === 'DE' && selectedCorridorId === 'germany') return 'var(--map-corridor-active, #245B42)';
    if (code === 'FR' && selectedCorridorId === 'france') return 'var(--map-corridor-active, #245B42)';
    if (code === 'IT' && selectedCorridorId === 'italy') return 'var(--map-corridor-active, #245B42)';
    if (code === 'RO' && selectedCorridorId === 'romania') return 'var(--map-corridor-active, #245B42)';

    // Other active corridor countries in resting state
    if (['DE', 'FR', 'IT', 'RO'].includes(code)) return 'var(--map-corridor-resting, #D4DEC9)';

    // Hovered country
    if (hoveredCountryCode === code) return 'var(--surface-hover, #C8C2B5)';

    // Default landmass
    return 'var(--map-landmass, #DFDACF)';
  };

  const getCountryStroke = (code: string) => {
    if (code === 'PK') return 'var(--action-primary, #245B42)';
    if (['DE', 'FR', 'IT', 'RO'].includes(code)) {
      const isSelected =
        (code === 'DE' && selectedCorridorId === 'germany') ||
        (code === 'FR' && selectedCorridorId === 'france') ||
        (code === 'IT' && selectedCorridorId === 'italy') ||
        (code === 'RO' && selectedCorridorId === 'romania');
      return isSelected ? 'var(--brand-citron, #D7EE83)' : 'var(--action-primary, #245B42)';
    }
    return 'var(--map-landmass-stroke, #CBC5B8)';
  };

  return (
    <section
      id="destinations-world-map"
      style={{
        paddingTop: '6rem',
        paddingBottom: '6rem',
        paddingLeft: '1.25rem',
        paddingRight: '1.25rem',
        backgroundColor: 'var(--surface-canvas, #F7F6F2)',
        position: 'relative',
        overflow: 'hidden',
        scrollMarginTop: '96px',
      }}
      aria-label="Interactive Real World Destinations and Corridors Map"
    >
      <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-20px' }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '3rem' }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 0.875rem',
              borderRadius: 'var(--radius-pill, 9999px)',
              backgroundColor: 'var(--surface-card-subtle, rgba(36, 91, 66, 0.08))',
              border: '1px solid var(--border-subtle, rgba(36, 91, 66, 0.15))',
              marginBottom: '1rem',
            }}
          >
            <Compass size={14} style={{ color: 'var(--action-primary, #245B42)' }} />
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--action-primary, #245B42)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Higher Education Destination Corridors
            </span>
          </div>

          <h2
            style={{
              fontSize: 'clamp(1.85rem, 3.5vw, 2.75rem)',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              color: 'var(--color-foreground, #19261F)',
              margin: '0 0 1rem 0',
              lineHeight: 1.2,
            }}
          >
            Connected Higher Education Routes.{' '}
            <span style={{ color: 'var(--action-primary, #245B42)' }}>
              From Pakistan to Europe.
            </span>
          </h2>

          <p
            style={{
              fontSize: '1.0625rem',
              color: 'var(--color-foreground-muted, #58695E)',
              maxWidth: '680px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            Explore verified admission prerequisites, statutory non-EU tuition benchmarks, and official visa
            pre-enrollment pipelines tailored for Pakistani students.
          </p>

          {/* Quick Filter Corridor Tabs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.625rem',
              flexWrap: 'wrap',
              marginTop: '1.75rem',
            }}
          >
            {CORRIDORS.map((corridor) => {
              const isSelected = selectedCorridorId === corridor.id;
              return (
                <button
                  key={corridor.id}
                  type="button"
                  onClick={() => setSelectedCorridorId(corridor.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.55rem 1.125rem',
                    borderRadius: 'var(--radius-pill, 9999px)',
                    fontSize: '0.875rem',
                    fontWeight: isSelected ? 700 : 500,
                    backgroundColor: isSelected ? 'var(--action-primary, #245B42)' : 'var(--surface-card, #FFFFFF)',
                    color: isSelected ? 'var(--color-on-primary, #FFFFFF)' : 'var(--color-foreground, #19261F)',
                    border: isSelected
                      ? '1px solid var(--action-primary, #245B42)'
                      : '1px solid var(--border-subtle, #E1E8DE)',
                    cursor: 'pointer',
                    boxShadow: isSelected
                      ? '0 4px 14px rgba(36, 91, 66, 0.25)'
                      : '0 1px 3px rgba(0, 0, 0, 0.04)',
                    transition: 'all 200ms ease',
                  }}
                >
                  <span aria-hidden="true">{corridor.flag}</span>
                  <span>{corridor.name}</span>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      padding: '0.1rem 0.45rem',
                      borderRadius: 'var(--radius-pill, 9999px)',
                      backgroundColor: isSelected ? 'var(--brand-citron, #D7EE83)' : 'var(--surface-card-subtle, #EDF2E9)',
                      color: isSelected ? '#19261F' : 'var(--color-foreground, #19261F)',
                    }}
                  >
                    {corridor.code}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Map Stage Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.99 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-20px' }}
          transition={{ duration: 0.7 }}
          style={{
            position: 'relative',
            backgroundColor: 'var(--surface-card, #FCFCFA)',
            borderRadius: '28px',
            border: '1px solid var(--border-subtle, #E5E2D8)',
            boxShadow: '0 20px 48px -12px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.04)',
            padding: '1.75rem',
            overflow: 'hidden',
          }}
        >
          {/* Subtle Latitude & Longitude Coordinate Lines */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `
                linear-gradient(to right, var(--map-grid-line, rgba(0, 0, 0, 0.032)) 1px, transparent 1px),
                linear-gradient(to bottom, var(--map-grid-line, rgba(0, 0, 0, 0.032)) 1px, transparent 1px)
              `,
              backgroundSize: '48px 48px',
              pointerEvents: 'none',
              zIndex: 1,
            }}
            aria-hidden="true"
          />

          {/* Real World Map SVG Canvas Wrapper */}
          <div
            style={{
              overflowX: 'auto',
              width: '100%',
              WebkitOverflowScrolling: 'touch',
              borderRadius: '20px',
            }}
          >
            <div
              style={{
                position: 'relative',
                width: '100%',
                minWidth: '780px',
                borderRadius: '20px',
                backgroundColor: 'var(--map-bg, #FAF9F4)',
                overflow: 'hidden',
              }}
            >
              {/* Authentic Real World Map SVG using provided HTML5 Robinson vector dataset */}
              <svg
                viewBox={worldMapData.viewBox}
                style={{
                  width: '100%',
                  height: 'auto',
                  aspectRatio: '2000 / 857',
                  display: 'block',
                }}
                preserveAspectRatio="xMidYMid meet"
                aria-label="Real Vector World Map"
              >
                <defs>
                  {/* Glow Filter */}
                  <filter id="corridor-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>

                  {/* Animated Flight Path Gradient */}
                  <linearGradient id="flight-gradient" x1="100%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#245B42" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#D7EE83" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#245B42" stopOpacity="0.9" />
                  </linearGradient>

                  {/* Soft Node Pulse Radial Gradient */}
                  <radialGradient id="node-pulse-grad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#D7EE83" stopOpacity="0.9" />
                    <stop offset="60%" stopColor="#245B42" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#245B42" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* All 222 Real Country Boundaries Rendered from Provided Library */}
                <g id="real-world-countries">
                  {Object.entries(worldMapData.paths).map(([code, pathD]) => {
                    const countryName = (worldMapData.names as Record<string, string>)[code] || code;
                    const fill = getCountryFill(code);
                    const stroke = getCountryStroke(code);
                    const isCorridor = ['DE', 'FR', 'IT', 'RO'].includes(code);

                    return (
                      <path
                        key={code}
                        id={`country-${code}`}
                        d={pathD}
                        fill={fill}
                        stroke={stroke}
                        strokeWidth={isCorridor || code === 'PK' ? 1.5 : 0.65}
                        strokeLinejoin="round"
                        style={{
                          transition: 'fill 250ms ease, stroke 250ms ease',
                          cursor: isCorridor ? 'pointer' : 'default',
                        }}
                        onMouseEnter={() => {
                          setHoveredCountryCode(code);
                          if (code === 'DE') setHoveredCorridorId('germany');
                          else if (code === 'FR') setHoveredCorridorId('france');
                          else if (code === 'IT') setHoveredCorridorId('italy');
                          else if (code === 'RO') setHoveredCorridorId('romania');
                        }}
                        onMouseLeave={() => {
                          setHoveredCountryCode(null);
                          setHoveredCorridorId(null);
                        }}
                        onClick={() => {
                          if (code === 'DE') setSelectedCorridorId('germany');
                          else if (code === 'FR') setSelectedCorridorId('france');
                          else if (code === 'IT') setSelectedCorridorId('italy');
                          else if (code === 'RO') setSelectedCorridorId('romania');
                        }}
                      >
                        <title>{countryName}</title>
                      </path>
                    );
                  })}
                </g>

                {/* Animated Flight Paths from Pakistan (PK) to European Corridors */}
                {CORRIDORS.map((corridor) => {
                  const isSelected = selectedCorridorId === corridor.id;
                  const isHovered = hoveredCorridorId === corridor.id;
                  const active = isSelected || isHovered;

                  const startX = PAKISTAN_HUB.svgCoords.x;
                  const startY = PAKISTAN_HUB.svgCoords.y;
                  const endX = corridor.svgCoords.x;
                  const endY = corridor.svgCoords.y;

                  // High Arced Flight Trajectory across Eurasia into Europe
                  const midX = (startX + endX) / 2 + 30;
                  const midY = Math.min(startY, endY) - 95;

                  const pathD = `M${startX},${startY} Q${midX},${midY} ${endX},${endY}`;

                  return (
                    <g key={`path-${corridor.id}`}>
                      {/* Base Track Line */}
                      <path
                        d={pathD}
                        fill="none"
                        stroke={active ? 'rgba(36, 91, 66, 0.5)' : 'rgba(36, 91, 66, 0.18)'}
                        strokeWidth={active ? 3 : 1.5}
                        strokeDasharray={active ? '8 6' : '4 4'}
                      />

                      {/* Moving Jet Stream Animation */}
                      {active && (
                        <path
                          d={pathD}
                          fill="none"
                          stroke="url(#flight-gradient)"
                          strokeWidth="4"
                          strokeDasharray="24 240"
                          strokeLinecap="round"
                          filter="url(#corridor-glow)"
                        >
                          <animate
                            attributeName="stroke-dashoffset"
                            values="264;0"
                            dur="2.5s"
                            repeatCount="indefinite"
                          />
                        </path>
                      )}
                    </g>
                  );
                })}

                {/* Departure Hub Beacon: Pakistan (Islamabad) */}
                <g transform={`translate(${PAKISTAN_HUB.svgCoords.x}, ${PAKISTAN_HUB.svgCoords.y})`}>
                  <circle r="24" fill="url(#node-pulse-grad)">
                    <animate attributeName="r" values="12;32;12" dur="3s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;0;0.8" dur="3s" repeatCount="indefinite" />
                  </circle>
                  <circle r="7.5" fill="#245B42" stroke="#FFFFFF" strokeWidth="2.5" />
                  <circle r="3" fill="#D7EE83" />
                </g>

                {/* Destination Waypoint Nodes for Active European Corridors */}
                {CORRIDORS.map((corridor) => {
                  const isSelected = selectedCorridorId === corridor.id;
                  const posX = corridor.svgCoords.x;
                  const posY = corridor.svgCoords.y;

                  return (
                    <g
                      key={`node-${corridor.id}`}
                      transform={`translate(${posX}, ${posY})`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedCorridorId(corridor.id)}
                      onMouseEnter={() => setHoveredCorridorId(corridor.id)}
                      onMouseLeave={() => setHoveredCorridorId(null)}
                    >
                      {isSelected && (
                        <circle r="22" fill="url(#node-pulse-grad)">
                          <animate attributeName="r" values="10;28;10" dur="2.4s" repeatCount="indefinite" />
                        </circle>
                      )}
                      <circle
                        r={isSelected ? 7.5 : 5.5}
                        fill={isSelected ? '#245B42' : '#58695E'}
                        stroke="#FFFFFF"
                        strokeWidth="2.5"
                      />
                      {isSelected && <circle r="2.8" fill="#D7EE83" />}
                    </g>
                  );
                })}
              </svg>

              {/* Floating Glassmorphic Cards Positioned Over Map (Matching User Screenshot 2) */}

              {/* 1. Global Reference Cards (North America, Asia, Australia) - Hidden on small mobile screens */}
              {GLOBAL_REFERENCE_NODES.map((node) => (
                <div
                  key={node.code}
                  className="hide-on-mobile"
                  style={{
                    position: 'absolute',
                    left: `${node.coords.x}%`,
                    top: `${node.coords.y}%`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: 10,
                    pointerEvents: 'none',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.625rem',
                      padding: '0.45rem 0.85rem',
                      backgroundColor: 'var(--surface-elevated, rgba(255, 255, 255, 0.94))',
                      backdropFilter: 'blur(8px)',
                      borderRadius: '14px',
                      border: '1px solid var(--border-subtle, rgba(0, 0, 0, 0.08))',
                      boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.15)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        color: 'var(--color-foreground-muted, #58695E)',
                        padding: '0.15rem 0.4rem',
                        borderRadius: '6px',
                        backgroundColor: 'var(--surface-card-subtle, #EDF2E9)',
                      }}
                    >
                      {node.code}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-foreground, #19261F)' }}>
                        {node.name}
                      </div>
                      <div style={{ fontSize: '0.625rem', color: 'var(--color-foreground-muted, #718578)' }}>{node.tag}</div>
                    </div>
                  </div>
                </div>
              ))}

              {/* 2. Departure Hub Card: Pakistan */}
              <div
                style={{
                  position: 'absolute',
                  left: `${PAKISTAN_HUB.pctCoords.x}%`,
                  top: `${PAKISTAN_HUB.pctCoords.y + 7}%`,
                  transform: 'translate(-50%, 0)',
                  zIndex: 22,
                  pointerEvents: 'none',
                }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 0.85rem',
                    backgroundColor: '#19261F',
                    color: '#FFFFFF',
                    borderRadius: '14px',
                    boxShadow: '0 10px 28px rgba(25, 38, 31, 0.35)',
                    border: '1px solid rgba(215, 238, 131, 0.4)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#D7EE83',
                      boxShadow: '0 0 8px #D7EE83',
                    }}
                  />
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#D7EE83' }}>
                      PK • Pakistan
                    </div>
                    <div style={{ fontSize: '0.625rem', color: '#E1E8DE' }}>Student Departure Desk</div>
                  </div>
                </motion.div>
              </div>

              {/* 3. Core European Corridor Floating Cards (Matching Screenshot 2 Placement) */}
              {/* Germany Card */}
              <div
                style={{
                  position: 'absolute',
                  left: `${CORRIDORS[0].pctCoords.x}%`,
                  top: `${CORRIDORS[0].pctCoords.y - 12}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: selectedCorridorId === 'germany' ? 25 : 15,
                }}
              >
                <button
                  type="button"
                  onClick={() => setSelectedCorridorId('germany')}
                  onMouseEnter={() => setHoveredCorridorId('germany')}
                  onMouseLeave={() => setHoveredCorridorId(null)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.625rem',
                    padding: '0.55rem 0.95rem',
                    backgroundColor: 'var(--surface-card, #FFFFFF)',
                    borderRadius: '16px',
                    border: selectedCorridorId === 'germany'
                      ? '2px solid var(--action-primary, #245B42)'
                      : '1px solid var(--border-subtle, rgba(0, 0, 0, 0.08))',
                    boxShadow: selectedCorridorId === 'germany'
                      ? '0 12px 32px rgba(36, 91, 66, 0.22)'
                      : '0 8px 20px rgba(0, 0, 0, 0.12)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 200ms ease',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.8125rem',
                      fontWeight: 800,
                      color: selectedCorridorId === 'germany' ? 'var(--color-on-primary, #FFFFFF)' : 'var(--color-foreground, #19261F)',
                      backgroundColor: selectedCorridorId === 'germany' ? 'var(--action-primary, #245B42)' : 'var(--surface-card-subtle, #EDF2E9)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '8px',
                    }}
                  >
                    DE
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--color-foreground, #19261F)' }}>
                      Germany
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--color-foreground-muted, #58695E)' }}>Zero Tuition Focus</div>
                  </div>
                </button>
              </div>

              {/* Italy Card (Placed just below Germany, exactly as in screenshot 2) */}
              <div
                style={{
                  position: 'absolute',
                  left: `${CORRIDORS[2].pctCoords.x}%`,
                  top: `${CORRIDORS[2].pctCoords.y + 7}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: selectedCorridorId === 'italy' ? 25 : 15,
                }}
              >
                <button
                  type="button"
                  onClick={() => setSelectedCorridorId('italy')}
                  onMouseEnter={() => setHoveredCorridorId('italy')}
                  onMouseLeave={() => setHoveredCorridorId(null)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.625rem',
                    padding: '0.55rem 0.95rem',
                    backgroundColor: 'var(--surface-card, #FFFFFF)',
                    borderRadius: '16px',
                    border: selectedCorridorId === 'italy'
                      ? '2px solid var(--action-primary, #245B42)'
                      : '1px solid var(--border-subtle, rgba(0, 0, 0, 0.08))',
                    boxShadow: selectedCorridorId === 'italy'
                      ? '0 12px 32px rgba(36, 91, 66, 0.22)'
                      : '0 8px 20px rgba(0, 0, 0, 0.12)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 200ms ease',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.8125rem',
                      fontWeight: 800,
                      color: selectedCorridorId === 'italy' ? 'var(--color-on-primary, #FFFFFF)' : 'var(--color-foreground, #19261F)',
                      backgroundColor: selectedCorridorId === 'italy' ? 'var(--action-primary, #245B42)' : 'var(--surface-card-subtle, #EDF2E9)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '8px',
                    }}
                  >
                    IT
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--color-foreground, #19261F)' }}>
                      Italy
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--color-foreground-muted, #58695E)' }}>Art &amp; Architecture (DSU)</div>
                  </div>
                </button>
              </div>

              {/* France Card (Western Anchor) */}
              <div
                style={{
                  position: 'absolute',
                  left: `${CORRIDORS[1].pctCoords.x - 3}%`,
                  top: `${CORRIDORS[1].pctCoords.y}%`,
                  transform: 'translate(-100%, -50%)',
                  zIndex: selectedCorridorId === 'france' ? 25 : 14,
                }}
              >
                <button
                  type="button"
                  onClick={() => setSelectedCorridorId('france')}
                  onMouseEnter={() => setHoveredCorridorId('france')}
                  onMouseLeave={() => setHoveredCorridorId(null)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.45rem 0.85rem',
                    backgroundColor: 'var(--surface-card, #FFFFFF)',
                    borderRadius: '14px',
                    border: selectedCorridorId === 'france'
                      ? '2px solid var(--action-primary, #245B42)'
                      : '1px solid var(--border-subtle, rgba(0, 0, 0, 0.08))',
                    boxShadow: selectedCorridorId === 'france'
                      ? '0 10px 28px rgba(36, 91, 66, 0.22)'
                      : '0 6px 16px rgba(0, 0, 0, 0.10)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 200ms ease',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      color: selectedCorridorId === 'france' ? 'var(--color-on-primary, #FFFFFF)' : 'var(--color-foreground, #19261F)',
                      backgroundColor: selectedCorridorId === 'france' ? 'var(--action-primary, #245B42)' : 'var(--surface-card-subtle, #EDF2E9)',
                      padding: '0.15rem 0.45rem',
                      borderRadius: '6px',
                    }}
                  >
                    FR
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-foreground, #19261F)' }}>France</div>
                    <div style={{ fontSize: '0.625rem', color: 'var(--color-foreground-muted, #58695E)' }}>Grandes Écoles Track</div>
                  </div>
                </button>
              </div>

              {/* Romania Card (Eastern Anchor) */}
              <div
                style={{
                  position: 'absolute',
                  left: `${CORRIDORS[3].pctCoords.x + 3}%`,
                  top: `${CORRIDORS[3].pctCoords.y}%`,
                  transform: 'translate(0, -50%)',
                  zIndex: selectedCorridorId === 'romania' ? 25 : 14,
                }}
              >
                <button
                  type="button"
                  onClick={() => setSelectedCorridorId('romania')}
                  onMouseEnter={() => setHoveredCorridorId('romania')}
                  onMouseLeave={() => setHoveredCorridorId(null)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.45rem 0.85rem',
                    backgroundColor: 'var(--surface-card, #FFFFFF)',
                    borderRadius: '14px',
                    border: selectedCorridorId === 'romania'
                      ? '2px solid var(--action-primary, #245B42)'
                      : '1px solid var(--border-subtle, rgba(0, 0, 0, 0.08))',
                    boxShadow: selectedCorridorId === 'romania'
                      ? '0 10px 28px rgba(36, 91, 66, 0.22)'
                      : '0 6px 16px rgba(0, 0, 0, 0.10)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 200ms ease',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      color: selectedCorridorId === 'romania' ? 'var(--color-on-primary, #FFFFFF)' : 'var(--color-foreground, #19261F)',
                      backgroundColor: selectedCorridorId === 'romania' ? 'var(--action-primary, #245B42)' : 'var(--surface-card-subtle, #EDF2E9)',
                      padding: '0.15rem 0.45rem',
                      borderRadius: '6px',
                    }}
                  >
                    RO
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-foreground, #19261F)' }}>Romania</div>
                    <div style={{ fontSize: '0.625rem', color: 'var(--color-foreground-muted, #58695E)' }}>Direct Ministry Letter</div>
                  </div>
                </button>
              </div>

              {/* 4. Floating Mini Analytics Widgets (Matching Screenshot 2) */}
              {/* Widget 1: Processing Progress (Left Atlantic) */}
              <div
                className="hide-on-mobile"
                style={{
                  position: 'absolute',
                  left: '12%',
                  top: '64%',
                  zIndex: 12,
                  pointerEvents: 'none',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.5rem 0.85rem',
                    backgroundColor: 'var(--surface-elevated, rgba(255, 255, 255, 0.92))',
                    backdropFilter: 'blur(8px)',
                    borderRadius: '14px',
                    border: '1px solid var(--border-subtle, rgba(0, 0, 0, 0.06))',
                    boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.15)',
                  }}
                >
                  {/* Mini SVG Animated Bar Chart */}
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '18px' }}>
                    <motion.div
                      animate={{ height: ['40%', '80%', '40%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      style={{ width: '4px', backgroundColor: 'var(--action-primary, #245B42)', borderRadius: '2px' }}
                    />
                    <motion.div
                      animate={{ height: ['60%', '100%', '60%'] }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                      style={{ width: '4px', backgroundColor: 'var(--brand-citron, #D7EE83)', borderRadius: '2px' }}
                    />
                    <motion.div
                      animate={{ height: ['30%', '70%', '30%'] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
                      style={{ width: '4px', backgroundColor: 'var(--action-primary, #245B42)', borderRadius: '2px' }}
                    />
                    <motion.div
                      animate={{ height: ['70%', '95%', '70%'] }}
                      transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: 0.9 }}
                      style={{ width: '4px', backgroundColor: 'var(--brand-sage, #B4D0B6)', borderRadius: '2px' }}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--color-foreground, #19261F)' }}>
                      Admission Processing 98%
                    </div>
                    <div style={{ fontSize: '0.625rem', color: 'var(--color-foreground-muted, #718578)' }}>Statutory Dossier Flow</div>
                  </div>
                </div>
              </div>

              {/* Widget 2: Consular Compliance (Right Pacific) */}
              <div
                className="hide-on-mobile"
                style={{
                  position: 'absolute',
                  right: '8%',
                  top: '52%',
                  zIndex: 12,
                  pointerEvents: 'none',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.625rem',
                    padding: '0.5rem 0.85rem',
                    backgroundColor: 'var(--surface-elevated, rgba(255, 255, 255, 0.92))',
                    backdropFilter: 'blur(8px)',
                    borderRadius: '14px',
                    border: '1px solid var(--border-subtle, rgba(0, 0, 0, 0.06))',
                    boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.15)',
                  }}
                >
                  <div
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--surface-card-subtle, #EAF3EC)',
                      color: 'var(--action-primary, #245B42)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <TrendingUp size={14} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--color-foreground, #19261F)' }}>
                      100% Verified Standards
                    </div>
                    <div style={{ fontSize: '0.625rem', color: 'var(--color-foreground-muted, #718578)' }}>APS, HEC &amp; Consular</div>
                  </div>
                </div>
              </div>

              {/* 5. Bottom Floating Metric Badges */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  left: '16px',
                  zIndex: 15,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.625rem',
                    padding: '0.45rem 0.85rem',
                    backgroundColor: 'var(--surface-elevated, rgba(255, 255, 255, 0.95))',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 'var(--radius-pill, 9999px)',
                    border: '1px solid var(--border-subtle, rgba(0, 0, 0, 0.06))',
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.12)',
                  }}
                >
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(36, 91, 66, 0.12)',
                      color: 'var(--action-primary, #245B42)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ShieldCheck size={14} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-foreground, #19261F)' }}>
                      100% Peer-Verified Standards
                    </div>
                    <div style={{ fontSize: '0.625rem', color: 'var(--color-foreground-muted, #58695E)' }}>
                      Statutory Non-EU Embassies Tracked
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  right: '16px',
                  zIndex: 15,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.625rem',
                    padding: '0.45rem 0.85rem',
                    backgroundColor: 'var(--surface-elevated, rgba(255, 255, 255, 0.95))',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 'var(--radius-pill, 9999px)',
                    border: '1px solid var(--border-subtle, rgba(0, 0, 0, 0.06))',
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.12)',
                  }}
                >
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(215, 238, 131, 0.3)',
                      color: 'var(--color-foreground, #19261F)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <GraduationCap size={14} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-foreground, #19261F)' }}>
                      4 Active European Corridors
                    </div>
                    <div style={{ fontSize: '0.625rem', color: 'var(--color-foreground-muted, #58695E)' }}>
                      Direct Casework Pipelines Active
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Corridor Information Drawer (Below Map) */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCorridor.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              style={{
                marginTop: '1.5rem',
                padding: '1.5rem',
                backgroundColor: 'var(--surface-card-subtle, #F3F6F1)',
                borderRadius: '20px',
                border: '1px solid var(--border-subtle, #DCE5D8)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '1.5rem',
                alignItems: 'center',
              }}
            >
              {/* Column 1: Corridor Identity & Statutory Protocol */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.5rem' }}>
                  <span
                    style={{
                      fontSize: '0.8125rem',
                      fontWeight: 800,
                      backgroundColor: 'var(--action-primary, #245B42)',
                      color: 'var(--color-on-primary, #FFFFFF)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '8px',
                    }}
                  >
                    {selectedCorridor.code}
                  </span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-foreground, #19261F)', margin: 0 }}>
                    {selectedCorridor.name} Admissions Corridor
                  </h3>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted, #58695E)', margin: '0 0 0.75rem' }}>
                  {selectedCorridor.tagline}
                </p>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-foreground, #19261F)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <strong style={{ color: 'var(--action-primary, #245B42)' }}>Statutory Visa Protocol:</strong>
                  <span>{selectedCorridor.visaProtocol}</span>
                </div>

                {/* Popular Fields Pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.85rem' }}>
                  {selectedCorridor.topFields.map((field) => (
                    <span
                      key={field}
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        backgroundColor: 'var(--surface-card, #FFFFFF)',
                        color: 'var(--color-foreground, #19261F)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-pill, 9999px)',
                        border: '1px solid var(--border-subtle, #E1E8DE)',
                      }}
                    >
                      {field}
                    </span>
                  ))}
                </div>
              </div>

              {/* Column 2: Financial & Admissions Benchmarks */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-foreground-muted, #718578)', letterSpacing: '0.04em' }}>
                    Tuition Benchmark
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--color-foreground, #19261F)', marginTop: '2px' }}>
                    {selectedCorridor.tuitionNote}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-foreground-muted, #718578)', letterSpacing: '0.04em' }}>
                    Admissions Intake
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-foreground, #19261F)', marginTop: '2px' }}>
                    {selectedCorridor.intakeNote}
                  </div>
                </div>
              </div>

              {/* Column 3: Stats & Catalog CTA */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '1rem',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-foreground-muted, #718578)', letterSpacing: '0.04em' }}>
                    Catalogues Indexed
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--action-primary, #245B42)', lineHeight: 1.1 }}>
                    {selectedCorridor.universitiesIndexed}{' '}
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-foreground-muted, #58695E)' }}>Institutions</span>
                  </div>
                </div>

                <Link
                  to={selectedCorridor.catalogRoute}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.625rem 1.25rem',
                    borderRadius: 'var(--radius-pill, 9999px)',
                    backgroundColor: 'var(--action-primary, #245B42)',
                    color: 'var(--color-on-primary, #FFFFFF)',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    boxShadow: '0 4px 12px rgba(36, 91, 66, 0.25)',
                    transition: 'all 150ms ease',
                  }}
                >
                  <span>View {selectedCorridor.name} Universities</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};
