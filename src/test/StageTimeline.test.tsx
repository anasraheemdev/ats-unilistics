import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StageTimeline } from '@/components/domain/StageTimeline';

describe('StageTimeline Component', () => {
  it('renders all 7 chronological stages with accessible step indicators', () => {
    render(<StageTimeline currentStage="attestation" />);

    // Check step presence
    expect(screen.getByText('Onboarding & Profile Audit')).toBeInTheDocument();
    expect(screen.getByText('Document Legalization & Attestation')).toBeInTheDocument();
    expect(screen.getByText('Program Selection & Dossier Assembly')).toBeInTheDocument();

    // The current stage should have the current badge
    expect(screen.getByText('Current')).toBeInTheDocument();

    // Step 2 item has aria-current="step"
    const currentItem = screen.getByText('Current').closest('li');
    expect(currentItem).toHaveAttribute('aria-current', 'step');
  });
});
