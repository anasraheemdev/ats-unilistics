import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DeadlineCard } from '@/components/domain/DeadlineCard';

describe('DeadlineCard Component', () => {
  it('prioritises current stage, next action, due date, responsible person, and last update', () => {
    render(
      <DeadlineCard
        currentStage="Document Legalization & Attestation"
        nextRequiredAction="Submit original HEC-attested degrees to MOFA for Apostille barcode stamping"
        nextActionDueDate="2026-11-12"
        responsiblePerson="Student (Muhammad Bilal)"
        lastUpdateDate="2026-10-21"
      />
    );

    // 1. Next required action is prominent
    expect(
      screen.getByText('Submit original HEC-attested degrees to MOFA for Apostille barcode stamping')
    ).toBeInTheDocument();

    // 2. Due date is displayed
    expect(screen.getByText('2026-11-12')).toBeInTheDocument();

    // 3. Responsible person is identified
    expect(screen.getByText('Student (Muhammad Bilal)')).toBeInTheDocument();

    // 4. Last update is documented
    expect(screen.getByText('2026-10-21')).toBeInTheDocument();

    // 5. Verifies absence of fabricated percentages or odds
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
    expect(screen.queryByText(/acceptance odds/i)).not.toBeInTheDocument();
  });
});
