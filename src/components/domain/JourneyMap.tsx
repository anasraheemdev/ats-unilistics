import React, { useState, useId } from 'react';
import { CaseWorkflowStep, WorkflowStep } from '@/types';

export interface JourneyMapProps {
  steps: CaseWorkflowStep[];
  templateSteps?: WorkflowStep[];
  selectedStepId?: string | null;
  onSelectStep: (step: CaseWorkflowStep) => void;
  isAllLocked?: boolean;
}

interface NodePosition {
  x: number;
  y: number;
  region: 'prepare' | 'choose' | 'move';
}

export function getStepChapterLabel(step: CaseWorkflowStep | WorkflowStep): string {
  const title = (step.title || '').toLowerCase();
  const stage = (step.stage || '').toLowerCase();
  const key = ((step as any).stepKey || '').toLowerCase();

  if (title.includes('goal') || key.includes('goal') || title.includes('onboarding')) return 'Study goals';
  if (title.includes('profile') || key.includes('profile') || title.includes('eligibility')) return 'Your profile';
  if (title.includes('attest') || title.includes('document') || title.includes('translat') || stage === 'attestation') return 'Documents';
  if (title.includes('discover') || title.includes('explore') || key.includes('discover')) return 'Discover options';
  if (title.includes('shortlist') || title.includes('select') || key.includes('shortlist')) return 'Your shortlist';
  if (title.includes('submission') || title.includes('application') || title.includes('uni-assist') || stage === 'submission') return 'Applications';
  if (title.includes('offer') || title.includes('decision') || title.includes('admission offer') || stage === 'decision') return 'Offers';
  if (title.includes('visa') || title.includes('blocked account') || title.includes('sperrkonto') || title.includes('insurance') || stage === 'visa_prep') return 'Visa';
  if (title.includes('departure') || title.includes('flight') || title.includes('travel')) return 'Departure';
  if (title.includes('arrival') || title.includes('enroll') || stage === 'relocation') return 'Arrival';

  if (stage === 'onboarding') return 'Study goals';
  if (stage === 'dossier_assembly') return 'Documents';
  if (stage === 'submission') return 'Applications';
  if (stage === 'decision') return 'Offers';
  if (stage === 'visa_prep') return 'Visa';
  if (stage === 'relocation') return 'Arrival';

  return step.title;
}

export const JourneyMap: React.FC<JourneyMapProps> = ({
  steps,
  templateSteps: _templateSteps = [],
  selectedStepId,
  onSelectStep,
  isAllLocked = false,
}) => {
  const [focusedStepId, setFocusedStepId] = useState<string | null>(null);
  const filterId = useId();

  // Find the first active in-progress or available step (if not all locked)
  const currentStep = !isAllLocked
    ? steps.find((s) => s.status === 'in_progress') ||
      steps.find((s) => s.status === 'needs_action') ||
      steps.find((s) => s.status === 'available') ||
      steps.find((s) => s.status !== 'completed' && s.status !== 'not_applicable' && s.status !== 'locked') ||
      steps[0]
    : null;

  const currentStepId = currentStep?.id;

  // Dynamic coordinate calculator in 960x480 coordinate space
  // Region 1: Prepare (x: 0 to 320)
  // Region 2: Choose (x: 320 to 625)
  // Region 3: Move (x: 625 to 960)
  const getNodeCoordinates = (index: number, total: number, step: CaseWorkflowStep): NodePosition => {
    // 10-node full template preview layout (matching reference composition)
    if (total === 10) {
      const tenNodeCoords: NodePosition[] = [
        { x: 90, y: 130, region: 'prepare' },    // 1. Study goals
        { x: 175, y: 220, region: 'prepare' },   // 2. Your profile
        { x: 250, y: 310, region: 'prepare' },   // 3. Documents
        { x: 385, y: 190, region: 'choose' },    // 4. Discover options
        { x: 490, y: 280, region: 'choose' },    // 5. Your shortlist
        { x: 625, y: 130, region: 'move' },      // 6. Applications
        { x: 690, y: 215, region: 'move' },      // 7. Offers
        { x: 755, y: 295, region: 'move' },      // 8. Visa
        { x: 825, y: 215, region: 'move' },      // 9. Departure
        { x: 890, y: 320, region: 'move' },      // 10. Arrival
      ];
      return tenNodeCoords[index] || { x: 100 + index * 80, y: 240, region: 'prepare' };
    }

    const stage = step.stage;
    let region: 'prepare' | 'choose' | 'move' = 'prepare';

    if (stage === 'submission' || stage === 'decision') {
      region = 'choose';
    } else if (stage === 'visa_prep' || stage === 'relocation') {
      region = 'move';
    }

    if (total <= 4) {
      const x = 120 + index * 240;
      const y = index % 2 === 0 ? 190 : 280;
      return { x, y, region };
    }

    // Typical 6-8 country steps (e.g. Germany, Italy, France, Romania)
    if (region === 'prepare') {
      if (index === 0) return { x: 130, y: 150, region };
      return { x: 220, y: 270, region };
    }

    if (region === 'choose') {
      if (stage === 'submission') return { x: 420, y: 220, region };
      return { x: 520, y: 310, region };
    }

    // Move region steps (parallel branching support)
    if (step.isParallel) {
      const isSecondParallel = step.sortOrder > 40;
      return { x: 670, y: isSecondParallel ? 340 : 180, region };
    }

    if (step.sortOrder >= 60 || index === total - 1) {
      return { x: 830, y: 320, region };
    }

    return { x: 750, y: 240, region };
  };

  const nodePositions = steps.map((step, idx) => ({
    step,
    pos: getNodeCoordinates(idx, steps.length, step),
  }));

  // Build connecting cubic bezier curves
  const buildConnectingPaths = () => {
    if (nodePositions.length < 2) return [];

    const paths: {
      d: string;
      isCompleted: boolean;
      isActive: boolean;
      isLocked: boolean;
      key: string;
    }[] = [];

    for (let i = 0; i < nodePositions.length - 1; i++) {
      const current = nodePositions[i];
      const next = nodePositions[i + 1];

      const dx = next.pos.x - current.pos.x;
      const cx1 = current.pos.x + dx * 0.45;
      const cy1 = current.pos.y;
      const cx2 = current.pos.x + dx * 0.55;
      const cy2 = next.pos.y;

      const d = `M ${current.pos.x} ${current.pos.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${next.pos.x} ${next.pos.y}`;
      const isCompleted = !isAllLocked && current.step.status === 'completed' && next.step.status === 'completed';
      const isActive = !isAllLocked && current.step.status === 'completed' && (next.step.status === 'in_progress' || next.step.status === 'needs_action');
      const isLocked = isAllLocked || (next.step.status === 'locked' || (next.step as any).isLocked);

      paths.push({
        d,
        isCompleted,
        isActive,
        isLocked,
        key: `path-${current.step.id}-${next.step.id}`,
      });
    }

    return paths;
  };

  const paths = buildConnectingPaths();

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        backgroundColor: 'var(--dark-card, #122017)',
        borderRadius: '24px',
        border: '1px solid var(--dark-border, #1F3325)',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.28)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* SVG Canvas */}
      <div style={{ width: '100%', position: 'relative' }}>
        <svg
          viewBox="0 0 960 480"
          style={{ width: '100%', height: 'auto', display: 'block' }}
          role="img"
          aria-label="Interactive Journey Map depicting Prepare, Choose, and Move stages"
        >
          <defs>
            <filter id={`glow-${filterId}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id={`grad-active-${filterId}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7EA588" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#D7EE83" stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* 1. Macro-Region Organic Background Bands */}
          {/* Region 1: Prepare (Deep Olive Forest) */}
          <path
            d="M 0 0 L 320 0 Q 345 240 310 480 L 0 480 Z"
            fill="#1E3024"
            opacity="0.95"
          />

          {/* Region 2: Choose (Deep Teal Slate / Maritime Green) */}
          <path
            d="M 320 0 L 625 0 Q 655 240 620 480 L 310 480 Q 345 240 320 0 Z"
            fill="#1B3233"
            opacity="0.95"
          />

          {/* Region 3: Move (Deep Earthy Slate) */}
          <path
            d="M 625 0 L 960 0 L 960 480 L 620 480 Q 655 240 625 0 Z"
            fill="#212B26"
            opacity="0.95"
          />

          {/* 2. Low-Contrast Decorative Topography & Subtle Elevation Contours */}
          <g stroke="rgba(215, 238, 131, 0.07)" fill="none" strokeWidth="1" opacity="0.8">
            <path d="M -20 120 C 140 90, 220 180, 360 140 C 500 100, 680 180, 980 130" />
            <path d="M -20 220 C 180 190, 290 310, 480 240 C 670 170, 780 290, 980 220" />
            <path d="M -20 340 C 160 310, 310 410, 520 350 C 730 290, 840 380, 980 340" />
            <circle cx="175" cy="210" r="95" strokeDasharray="3 5" />
            <circle cx="760" cy="250" r="115" strokeDasharray="3 5" />
          </g>

          {/* 3. Region Labels and Subtitles at the Top */}
          <g style={{ fontFamily: 'var(--font-family-base, "DM Sans", sans-serif)' }}>
            {/* Prepare */}
            <text x="32" y="44" fill="#F2F7F4" fontSize="14" fontWeight="700">
              Prepare
            </text>
            <text x="32" y="62" fill="#8DA394" fontSize="11" fontWeight="500">
              Goals, profile and evidence
            </text>

            {/* Choose */}
            <text x="350" y="44" fill="#F2F7F4" fontSize="14" fontWeight="700">
              Choose
            </text>
            <text x="350" y="62" fill="#8DA394" fontSize="11" fontWeight="500">
              Explore and compare options
            </text>

            {/* Move */}
            <text x="655" y="44" fill="#F2F7F4" fontSize="14" fontWeight="700">
              Move
            </text>
            <text x="655" y="62" fill="#8DA394" fontSize="11" fontWeight="500">
              Applications through arrival
            </text>
          </g>

          {/* 4. Connected Dotted Sinuous Paths */}
          <g>
            {paths.map((p) => {
              let strokeColor = 'rgba(141, 163, 148, 0.45)';
              let strokeWidth = '2';
              let strokeDash = '4 6';

              if (p.isCompleted) {
                strokeColor = '#D7EE83';
                strokeWidth = '2.5';
                strokeDash = '4 5';
              } else if (p.isActive) {
                strokeColor = `url(#grad-active-${filterId})`;
                strokeWidth = '2.5';
                strokeDash = '6 6';
              } else if (p.isLocked) {
                strokeColor = 'rgba(42, 64, 50, 0.55)';
                strokeWidth = '1.75';
                strokeDash = '3 5';
              }

              return (
                <path
                  key={p.key}
                  d={p.d}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDash}
                  strokeLinecap="round"
                />
              );
            })}
          </g>

          {/* 5. Interactive SVG Nodes */}
          {nodePositions.map(({ step, pos }, idx) => {
            const isSelected = selectedStepId === step.id;
            const isFocused = focusedStepId === step.id;
            const status = step.status;

            // Status resolutions
            const isLocked = isAllLocked || status === 'locked' || (step as any).isLocked;
            const isCompleted = !isLocked && status === 'completed';
            const isNeedsAction = !isLocked && status === 'needs_action';
            const isInProgress = !isLocked && (status === 'in_progress' || isNeedsAction);
            const isBlocked = !isLocked && (status === 'blocked' || status === 'reopened');
            const isNotApplicable = !isLocked && status === 'not_applicable';
            const isAvailable = !isLocked && !isCompleted && !isInProgress && !isBlocked && !isNotApplicable;

            const isCurrentLocation = !isAllLocked && step.id === currentStepId;
            const chapterLabel = getStepChapterLabel(step);

            // Sub-status text
            let subStatusText = 'Locked';
            let subStatusColor = '#6A7D70';

            if (isCompleted) {
              subStatusText = 'Completed';
              subStatusColor = '#D7EE83';
            } else if (isInProgress) {
              subStatusText = 'In progress';
              subStatusColor = '#D7EE83';
            } else if (isBlocked) {
              subStatusText = 'Review required';
              subStatusColor = '#EF4444';
            } else if (isNotApplicable) {
              subStatusText = 'Skipped';
              subStatusColor = '#6A7D70';
            } else if (isAvailable) {
              subStatusText = 'Not started';
              subStatusColor = '#B4D0B6';
            }

            return (
              <g
                key={step.id || `node-${idx}`}
                role="button"
                tabIndex={0}
                aria-label={`Step ${chapterLabel}, status: ${subStatusText}${isCurrentLocation ? ', current active location' : ''}`}
                onClick={() => onSelectStep(step)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectStep(step);
                  }
                }}
                onFocus={() => setFocusedStepId(step.id)}
                onBlur={() => setFocusedStepId(null)}
                style={{ cursor: 'pointer', outline: 'none' }}
              >
                {/* Accessible Focus Ring */}
                {isFocused && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={26}
                    fill="none"
                    stroke="#D7EE83"
                    strokeWidth="2.5"
                    strokeDasharray="4 3"
                  />
                )}

                {/* Selected Outer Highlight Ring */}
                {isSelected && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={24}
                    fill="none"
                    stroke="rgba(215, 238, 131, 0.45)"
                    strokeWidth="2"
                  />
                )}

                {/* In-Progress / Active Concentric Pulse Aura */}
                {isInProgress && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={23}
                    fill="none"
                    stroke="rgba(215, 238, 131, 0.28)"
                    strokeWidth="4"
                    filter={`url(#glow-${filterId})`}
                  />
                )}

                {/* Node Main Circle Body (Radius 18 = 36px diameter) */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={18}
                  fill={
                    isCompleted
                      ? '#1E3523'
                      : isBlocked
                      ? 'rgba(239, 68, 68, 0.18)'
                      : isLocked
                      ? '#0E1A13'
                      : '#14221A'
                  }
                  stroke={
                    isCompleted
                      ? '#B4D0B6'
                      : isInProgress
                      ? '#D7EE83'
                      : isBlocked
                      ? '#EF4444'
                      : isLocked
                      ? '#2A4032'
                      : isNotApplicable
                      ? '#464839'
                      : '#7EA588'
                  }
                  strokeWidth={isInProgress ? '2.5' : isLocked ? '1.5' : '2'}
                  strokeDasharray={isNotApplicable ? '3 3' : 'none'}
                />

                {/* Interior Glyph */}
                {isCompleted && (
                  <path
                    d={`M ${pos.x - 5} ${pos.y} L ${pos.x - 1} ${pos.y + 4} L ${pos.x + 6} ${pos.y - 4}`}
                    fill="none"
                    stroke="#D7EE83"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {isLocked && (
                  // Lock icon
                  <g transform={`translate(${pos.x - 6}, ${pos.y - 7})`} stroke="#7EA588" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="5" width="10" height="7" rx="1.5" fill="rgba(126, 165, 136, 0.2)" />
                    <path d="M 3.5 5 L 3.5 3 C 3.5 1.6 4.6 0.5 6 0.5 C 7.4 0.5 8.5 1.6 8.5 3 L 8.5 5" />
                  </g>
                )}

                {isInProgress && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={5}
                    fill="#D7EE83"
                  />
                )}

                {isBlocked && (
                  // Warning exclamation
                  <g fill="#EF4444" textAnchor="middle" style={{ fontSize: '13px', fontWeight: 'bold' }}>
                    <text x={pos.x} y={pos.y + 4}>!</text>
                  </g>
                )}

                {isAvailable && (
                  // Small available hollow circle
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={4}
                    fill="none"
                    stroke="#B4D0B6"
                    strokeWidth="1.5"
                  />
                )}

                {isNotApplicable && (
                  // Dash icon
                  <line
                    x1={pos.x - 4}
                    y1={pos.y}
                    x2={pos.x + 4}
                    y2={pos.y}
                    stroke="#6A7D70"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                )}

                {/* Node Text Label & Subtext */}
                <g textAnchor="middle" style={{ fontFamily: 'var(--font-family-base, "DM Sans", sans-serif)' }}>
                  <text
                    x={pos.x}
                    y={pos.y + 32}
                    fill={isLocked ? '#8DA394' : isInProgress ? '#D7EE83' : '#F2F7F4'}
                    fontSize="11"
                    fontWeight={isInProgress ? '700' : '600'}
                  >
                    {chapterLabel}
                  </text>
                  <text
                    x={pos.x}
                    y={pos.y + 45}
                    fill={subStatusColor}
                    fontSize="9.5"
                    fontWeight="500"
                  >
                    {subStatusText}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      {/* 6. Compact Status Legend Bar */}
      <div
        style={{
          borderTop: '1px solid var(--dark-border, #1F3325)',
          padding: '0.875rem 1.5rem',
          backgroundColor: 'rgba(10, 22, 15, 0.6)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          fontFamily: 'var(--font-family-base, "DM Sans", sans-serif)',
          fontSize: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.25rem' }}>
          {/* Completed */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#D7EE83' }}>
            <span
              style={{
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                backgroundColor: '#1E3523',
                border: '1.5px solid #D7EE83',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 700,
              }}
            >
              ✓
            </span>
            <span style={{ fontWeight: 600 }}>Completed</span>
          </div>

          {/* Active / In Progress */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#D7EE83' }}>
            <span
              style={{
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                backgroundColor: '#14221A',
                border: '2px solid #D7EE83',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#D7EE83' }} />
            </span>
            <span style={{ fontWeight: 600 }}>Active / In progress</span>
          </div>

          {/* Available / Not started */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#B4D0B6' }}>
            <span
              style={{
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                backgroundColor: '#14221A',
                border: '1.5px solid #7EA588',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            />
            <span>Not started</span>
          </div>

          {/* Locked */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#8DA394' }}>
            <svg width="13" height="13" viewBox="0 0 12 12" fill="none" stroke="#7EA588" strokeWidth="1.5">
              <rect x="1.5" y="5" width="9" height="6" rx="1.5" fill="rgba(126, 165, 136, 0.2)" />
              <path d="M 3.5 5 L 3.5 3 C 3.5 1.6 4.6 0.5 6 0.5 C 7.4 0.5 8.5 1.6 8.5 3 L 8.5 5" />
            </svg>
            <span>Locked</span>
          </div>

          {/* Blocked / Review required */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#EF4444' }}>
            <span
              style={{
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1.5px solid #EF4444',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 700,
              }}
            >
              !
            </span>
            <span>Blocked / Review required</span>
          </div>

          {/* Skipped / N/A */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#6A7D70' }}>
            <span
              style={{
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                backgroundColor: '#14221A',
                border: '1.5px dashed #464839',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            />
            <span>Skipped / N/A</span>
          </div>
        </div>

        {/* Status notice */}
        <div style={{ color: '#8DA394', fontSize: '0.75rem' }}>
          {isAllLocked ? (
            <span style={{ color: '#D7EE83', fontWeight: 600 }}>
              Preview: Waiting for team activation
            </span>
          ) : (
            <span>Administrator-controlled dependencies active</span>
          )}
        </div>
      </div>
    </div>
  );
};
