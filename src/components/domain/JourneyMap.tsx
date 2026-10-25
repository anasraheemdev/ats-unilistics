import React, { useState, useId } from 'react';
import { CaseWorkflowStep, WorkflowStep } from '@/types';

interface JourneyMapProps {
  steps: CaseWorkflowStep[];
  templateSteps?: WorkflowStep[];
  selectedStepId?: string | null;
  onSelectStep: (step: CaseWorkflowStep) => void;
}

interface NodePosition {
  x: number;
  y: number;
  region: 'prepare' | 'choose' | 'move';
}

export const JourneyMap: React.FC<JourneyMapProps> = ({
  steps,
  templateSteps: _templateSteps = [],
  selectedStepId,
  onSelectStep,
}) => {
  const [focusedStepId, setFocusedStepId] = useState<string | null>(null);
  const filterId = useId();

  // Find the first in-progress or needs-action step to treat as "You are here"
  const currentStep =
    steps.find((s) => s.status === 'in_progress') ||
    steps.find((s) => s.status === 'needs_action') ||
    steps.find((s) => s.status !== 'completed' && s.status !== 'not_applicable') ||
    steps[0];

  const currentStepId = currentStep?.id;

  // Map each step to a coordinate in the 960x480 coordinate space
  // Region 1: Prepare (x: 50 to 300)
  // Region 2: Choose (x: 340 to 600)
  // Region 3: Move (x: 640 to 910)
  const getNodeCoordinates = (index: number, total: number, step: CaseWorkflowStep): NodePosition => {
    const stage = step.stage;
    let region: 'prepare' | 'choose' | 'move' = 'prepare';

    if (stage === 'submission' || stage === 'decision') {
      region = 'choose';
    } else if (stage === 'visa_prep' || stage === 'relocation') {
      region = 'move';
    }

    // Default positioning curves across the regions
    if (steps.length <= 4) {
      // Small step set
      const x = 120 + index * 240;
      const y = index % 2 === 0 ? 190 : 280;
      return { x, y, region };
    }

    // Typical 6-8 country steps (e.g. Germany, Italy, France, Romania)
    // Prepare region steps:
    if (region === 'prepare') {
      if (index === 0) return { x: 130, y: 150, region };
      return { x: 220, y: 270, region };
    }

    // Choose region steps:
    if (region === 'choose') {
      if (stage === 'submission') return { x: 420, y: 220, region };
      return { x: 520, y: 310, region };
    }

    // Move region steps (parallel branching support):
    if (step.isParallel) {
      // E.g. Blocked account vs Health insurance
      const isSecondParallel = step.sortOrder > 40;
      return { x: 670, y: isSecondParallel ? 340 : 180, region };
    }

    // Final consular or arrival steps
    if (step.sortOrder >= 60 || index === total - 1) {
      return { x: 820, y: 320, region };
    }

    return { x: 740, y: 240, region };
  };

  const nodePositions = steps.map((step, idx) => ({
    step,
    pos: getNodeCoordinates(idx, steps.length, step),
  }));

  // Build dotted bezier paths connecting nodes in sequential order
  const buildConnectingPaths = () => {
    if (nodePositions.length < 2) return [];

    const paths: { d: string; isCompleted: boolean; key: string }[] = [];

    for (let i = 0; i < nodePositions.length - 1; i++) {
      const current = nodePositions[i];
      const next = nodePositions[i + 1];

      // If next step is parallel, curve to it
      const dx = next.pos.x - current.pos.x;
      const cx1 = current.pos.x + dx * 0.45;
      const cy1 = current.pos.y;
      const cx2 = current.pos.x + dx * 0.55;
      const cy2 = next.pos.y;

      const d = `M ${current.pos.x} ${current.pos.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${next.pos.x} ${next.pos.y}`;
      const isCompleted = current.step.status === 'completed' && next.step.status === 'completed';

      paths.push({
        d,
        isCompleted,
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
        backgroundColor: 'var(--dark-card, #16241B)',
        borderRadius: '24px',
        border: '1px solid var(--dark-border, #203327)',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
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
            {/* Subtle glow filter for active "You are here" node */}
            <filter id={`glow-${filterId}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 1. Macro-Region Background Bands with Curvy Organic Dividers */}
          {/* Region 1: Prepare (Deep Olive Forest) */}
          <path
            d="M 0 0 L 320 0 Q 345 240 310 480 L 0 480 Z"
            fill="#14241B"
          />

          {/* Region 2: Choose (Deep Petrol Slate) */}
          <path
            d="M 320 0 L 630 0 Q 655 240 625 480 L 310 480 Q 345 240 320 0 Z"
            fill="#13242A"
          />

          {/* Region 3: Move (Deep Warm Bronze Charcoal) */}
          <path
            d="M 630 0 L 960 0 L 960 480 L 625 480 Q 655 240 630 0 Z"
            fill="#23211A"
          />

          {/* 2. Low-Contrast Decorative Topography / Contour Lines (SVG vectors) */}
          <g stroke="rgba(215, 238, 131, 0.08)" fill="none" strokeWidth="1" opacity="0.8">
            <path d="M -20 120 C 140 90, 220 180, 360 140 C 500 100, 680 180, 980 130" />
            <path d="M -20 220 C 180 190, 290 310, 480 240 C 670 170, 780 290, 980 220" />
            <path d="M -20 340 C 160 310, 310 410, 520 350 C 730 290, 840 380, 980 340" />
            <path d="M 60 480 C 220 380, 380 430, 580 390 C 780 350, 890 420, 980 440" />
            {/* Concentric rings on Prepare hill */}
            <circle cx="180" cy="200" r="110" strokeDasharray="3 5" />
            <circle cx="180" cy="200" r="70" strokeDasharray="2 4" />
            {/* Concentric rings on Move hill */}
            <circle cx="780" cy="260" r="130" strokeDasharray="3 5" />
            <circle cx="780" cy="260" r="80" strokeDasharray="2 4" />
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

          {/* 4. Connected Dotted Paths */}
          <g>
            {paths.map((p) => (
              <path
                key={p.key}
                d={p.d}
                fill="none"
                stroke={p.isCompleted ? '#D7EE83' : 'rgba(141, 163, 148, 0.45)'}
                strokeWidth={p.isCompleted ? '2.5' : '2'}
                strokeDasharray="4 6"
              />
            ))}
          </g>

          {/* 5. Interactive Button Nodes */}
          {nodePositions.map(({ step, pos }) => {
            const isSelected = selectedStepId === step.id;
            const isCurrentLocation = step.id === currentStepId;
            const isFocused = focusedStepId === step.id;
            const status = step.status;

            // Determine node appearance
            const isCompleted = status === 'completed';
            const isNeedsAction = status === 'needs_action';
            const isBlocked = status === 'blocked' || status === 'reopened';
            const isNotApplicable = status === 'not_applicable';

            return (
              <g
                key={step.id}
                role="button"
                tabIndex={0}
                aria-label={`Step ${step.title}, status: ${status}${isCurrentLocation ? ', current active location' : ''}`}
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
                    r={28}
                    fill="none"
                    stroke="#D7EE83"
                    strokeWidth="3"
                    strokeDasharray="3 3"
                  />
                )}

                {/* Selected Halo */}
                {isSelected && !isFocused && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={26}
                    fill="none"
                    stroke="rgba(215, 238, 131, 0.4)"
                    strokeWidth="2"
                  />
                )}

                {/* Node Graphics based on Status */}
                {isCompleted ? (
                  // Completed: Citron circle with dark checkmark
                  <g>
                    <circle cx={pos.x} cy={pos.y} r={16} fill="#D7EE83" />
                    <path
                      d={`M ${pos.x - 5} ${pos.y} L ${pos.x - 1} ${pos.y + 4} L ${pos.x + 6} ${pos.y - 4}`}
                      fill="none"
                      stroke="#19261F"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                ) : isCurrentLocation ? (
                  // Active / You are here: Concentric ring with pulsing core
                  <g filter={`url(#glow-${filterId})`}>
                    <circle cx={pos.x} cy={pos.y} r={22} fill="none" stroke="#D7EE83" strokeWidth="2.5" />
                    <circle cx={pos.x} cy={pos.y} r={13} fill="#16241B" stroke="#D7EE83" strokeWidth="2" />
                    <circle cx={pos.x} cy={pos.y} r={6} fill="#D7EE83" />

                    {/* Floating "You are here" Pill Badge Above Node */}
                    <g transform={`translate(${pos.x - 44}, ${pos.y - 46})`}>
                      <rect
                        width="88"
                        height="24"
                        rx="12"
                        fill="#D7EE83"
                        filter="drop-shadow(0 2px 6px rgba(0,0,0,0.4))"
                      />
                      <polygon
                        points="44,28 38,24 50,24"
                        fill="#D7EE83"
                      />
                      <text
                        x="44"
                        y="16"
                        fill="#19261F"
                        fontSize="10"
                        fontWeight="700"
                        textAnchor="middle"
                        style={{ fontFamily: 'var(--font-family-base, "DM Sans", sans-serif)' }}
                      >
                        You are here
                      </text>
                    </g>
                  </g>
                ) : isBlocked ? (
                  // Blocked / Reopened: Red/Amber Alert Circle with lock
                  <g>
                    <circle cx={pos.x} cy={pos.y} r={16} fill="rgba(239, 68, 68, 0.25)" stroke="#F87171" strokeWidth="2" />
                    <circle cx={pos.x} cy={pos.y} r={4} fill="#F87171" />
                  </g>
                ) : isNeedsAction ? (
                  // Action Required: Amber circle
                  <g>
                    <circle cx={pos.x} cy={pos.y} r={18} fill="none" stroke="#FBBF24" strokeWidth="2" strokeDasharray="3 3" />
                    <circle cx={pos.x} cy={pos.y} r={12} fill="#FBBF24" />
                    <circle cx={pos.x} cy={pos.y} r={4} fill="#19261F" />
                  </g>
                ) : isNotApplicable ? (
                  // Skipped / N/A: Muted dashed circle
                  <g>
                    <circle cx={pos.x} cy={pos.y} r={14} fill="none" stroke="#58695E" strokeWidth="2" strokeDasharray="3 3" />
                  </g>
                ) : (
                  // Not Started / Locked: Hollow subtle ring
                  <g>
                    <circle cx={pos.x} cy={pos.y} r={15} fill="#16241B" stroke="#58695E" strokeWidth="2" />
                    <circle cx={pos.x} cy={pos.y} r={3} fill="#58695E" />
                  </g>
                )}

                {/* Step Title Label & Subtitle Text */}
                <g style={{ fontFamily: 'var(--font-family-base, "DM Sans", sans-serif)' }}>
                  <text
                    x={pos.x}
                    y={pos.y + 32}
                    fill={isSelected ? '#D7EE83' : '#F2F7F4'}
                    fontSize="12"
                    fontWeight={isSelected || isCurrentLocation ? '700' : '600'}
                    textAnchor="middle"
                  >
                    {step.title.length > 24 ? `${step.title.slice(0, 22)}...` : step.title}
                  </text>
                  <text
                    x={pos.x}
                    y={pos.y + 47}
                    fill={isCompleted ? '#D7EE83' : isBlocked ? '#F87171' : '#8DA394'}
                    fontSize="10"
                    fontWeight="500"
                    textAnchor="middle"
                  >
                    {isCompleted
                      ? 'Completed'
                      : isBlocked
                      ? 'Review required'
                      : isNeedsAction
                      ? 'Action needed'
                      : isCurrentLocation
                      ? 'In progress'
                      : isNotApplicable
                      ? 'Skipped'
                      : 'Not started'}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      {/* 6. Bottom Compact Status Legend */}
      <footer
        style={{
          borderTop: '1px solid var(--dark-border, #203327)',
          padding: '0.875rem 1.5rem',
          backgroundColor: 'rgba(13, 21, 17, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          fontSize: '0.75rem',
          color: 'var(--dark-text-muted, #8DA394)',
          fontFamily: 'var(--font-family-base, "DM Sans", sans-serif)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <span
            style={{
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              backgroundColor: '#D7EE83',
              color: '#19261F',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              fontWeight: 800,
            }}
          >
            ✓
          </span>
          <span>Completed</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <span
            style={{
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              border: '2px solid #D7EE83',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#D7EE83' }} />
          </span>
          <span>In Progress</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <span
            style={{
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.3)',
              border: '1px solid #F87171',
              display: 'inline-block',
            }}
          />
          <span>Blocked / Review required</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <span
            style={{
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              border: '1px dashed #58695E',
              display: 'inline-block',
            }}
          />
          <span>Skipped / N/A</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <span
            style={{
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              border: '1px solid #58695E',
              display: 'inline-block',
            }}
          />
          <span>Not started</span>
        </div>
      </footer>
    </div>
  );
};

export default JourneyMap;
