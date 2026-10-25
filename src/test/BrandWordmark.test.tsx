import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { BrandWordmark } from '@/components/ui/BrandWordmark';

describe('BrandWordmark Component', () => {
  it('renders clearly provisional text wordmark with preview tag', () => {
    render(
      <BrowserRouter>
        <BrandWordmark />
      </BrowserRouter>
    );

    // Expect the typography wordmark
    expect(screen.getByText('UNILISTICS')).toBeInTheDocument();

    // Expect the provisional preview tag
    expect(screen.getByText('PREVIEW')).toBeInTheDocument();

    // Expect the Pakistan higher education subtitle
    expect(screen.getByText(/University & Visa Tracking • Pakistan/i)).toBeInTheDocument();
  });
});
