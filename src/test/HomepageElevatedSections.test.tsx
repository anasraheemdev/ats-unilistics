import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HomePage } from '@/pages/public/HomePage';
import { PartnersSection } from '@/components/domain/PartnersSection';
import { AlumniSection } from '@/components/domain/AlumniSection';
import { AmbassadorsVideoSection } from '@/components/domain/AmbassadorsVideoSection';
import { ExploreOpportunitiesSection } from '@/components/domain/ExploreOpportunitiesSection';
import { ROUTES } from '@/config/routes';

describe('Homepage Elevated Sections Test Suite', () => {
  describe('1. Partners & Institutional Network Section', () => {
    it('renders section heading and infinite marquee of partner logos without text names or disclaimers', () => {
      render(
        <MemoryRouter>
          <PartnersSection />
        </MemoryRouter>
      );

      expect(screen.getByRole('heading', { level: 2, name: /Collaborating with Leading European Academic Bodies/i })).toBeDefined();
      expect(screen.getByText(/Institutional Network & Credential Pathways/i)).toBeDefined();

      // Verify presence of partner logos with proper alt attributes
      const daadLogos = screen.getAllByAltText(/DAAD/i);
      expect(daadLogos.length).toBeGreaterThan(0);
      expect(daadLogos[0]).toHaveAttribute('src', '/images/partners/Daad.png');

      const uniAssistLogos = screen.getAllByAltText(/uni-assist/i);
      expect(uniAssistLogos.length).toBeGreaterThan(0);
      expect(uniAssistLogos[0]).toHaveAttribute('src', '/images/partners/uniAssist.png');

      const campusFranceLogos = screen.getAllByAltText(/Campus France/i);
      expect(campusFranceLogos.length).toBeGreaterThan(0);
      expect(campusFranceLogos[0]).toHaveAttribute('src', '/images/partners/logo-campus-france.png');

      const hecLogos = screen.getAllByAltText(/Higher Education Commission Pakistan/i);
      expect(hecLogos.length).toBeGreaterThan(0);
      expect(hecLogos[0]).toHaveAttribute('src', '/images/partners/higher-education-commission-pakistan-logo.png');

      // Verify removal of category tabs, card grid, procedural links, and disclaimer
      expect(screen.queryByText(/Procedural Notice & Representative Institutions:/i)).toBeNull();
      expect(screen.queryByRole('tab', { name: /^Credential Evaluation$/i })).toBeNull();
      expect(screen.queryByText(/View Procedural Role/i)).toBeNull();
    });

    it('renders duplicated logo track for continuous infinite animation', () => {
      const { container } = render(
        <MemoryRouter>
          <PartnersSection />
        </MemoryRouter>
      );

      const marqueeTrack = container.querySelector('.partners-marquee-track');
      expect(marqueeTrack).toBeDefined();

      const logoCards = container.querySelectorAll('.partner-logo-card');
      // 13 partner logos duplicated = 26 cards
      expect(logoCards.length).toBe(26);
    });
  });

  describe('2. Alumni Success Stories Section', () => {
    it('renders section title, diverse corridor profiles, and key metrics', () => {
      render(
        <MemoryRouter>
          <AlumniSection />
        </MemoryRouter>
      );

      expect(screen.getByRole('heading', { level: 2, name: /Success Stories Beyond Borders/i })).toBeDefined();
      expect(screen.getByText(/Where Our Students Are Now/i)).toBeDefined();

      // Student names
      expect(screen.getByText(/Zainab Malik/i)).toBeDefined();
      expect(screen.getByText(/Hamza Raza/i)).toBeDefined();
      expect(screen.getByText(/Areeba Siddiqui/i)).toBeDefined();
      expect(screen.getByText(/Usama Farooq/i)).toBeDefined();

      // Universities and achievements
      expect(screen.getByText(/Technical University of Munich/i)).toBeDefined();
      expect(screen.getByText(/Sorbonne University, Paris/i)).toBeDefined();
      expect(screen.getByText(/Politecnico di Milano/i)).toBeDefined();
      expect(screen.getByText(/Carol Davila University of Medicine & Pharmacy/i)).toBeDefined();
    });

    it('filters alumni by country corridor', () => {
      render(
        <MemoryRouter>
          <AlumniSection />
        </MemoryRouter>
      );

      const germanyFilter = screen.getByRole('tab', { name: /🇩🇪 Germany/i });
      fireEvent.click(germanyFilter);

      expect(screen.getByText(/Zainab Malik/i)).toBeDefined();
      expect(screen.getByText(/Bilawal Shah/i)).toBeDefined();
      expect(screen.queryByText(/Usama Farooq/i)).toBeNull();
    });

    it('opens full journey dialog on click and contains primary CTA', () => {
      render(
        <MemoryRouter>
          <AlumniSection />
        </MemoryRouter>
      );

      const readJourneyBtns = screen.getAllByRole('button', { name: /Read Full Journey/i });
      fireEvent.click(readJourneyBtns[0]);

      expect(screen.getByRole('dialog')).toBeDefined();
      expect(screen.getByText(/Financial & Scholarship Terms/i)).toBeDefined();
      expect(screen.getByRole('link', { name: /Start Similar Application/i })).toBeDefined();

      // Closing action CTA
      const startJourneyBtn = screen.getByRole('link', { name: /Start Your Own Journey/i });
      expect(startJourneyBtn).toHaveAttribute('href', '/request-guidance');
    });
  });

  describe('3. Student Ambassadors Video Section', () => {
    it('renders featured video, supporting cards, and ambassador details', () => {
      render(
        <MemoryRouter>
          <AmbassadorsVideoSection />
        </MemoryRouter>
      );

      expect(screen.getByRole('heading', { level: 2, name: /Hear It Directly From Our Student Ambassadors/i })).toBeDefined();
      expect(screen.getAllByText(/Muhammad Bilal/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Ayesha Siddiqui/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Daniyal Qureshi/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Dr\. Sara Khan/i).length).toBeGreaterThan(0);
      expect(screen.getByRole('link', { name: /Become a Unilistics Ambassador/i })).toBeDefined();
    });

    it('opens cinema video modal lightbox with playback controls and advice takeaways', () => {
      render(
        <MemoryRouter>
          <AmbassadorsVideoSection />
        </MemoryRouter>
      );

      const watchFeaturedBtn = screen.getByRole('button', { name: /Watch Video & Read Advice/i });
      fireEvent.click(watchFeaturedBtn);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeDefined();
      expect(screen.getByText(/Ambassador Summary & Transcript Excerpt/i)).toBeDefined();
      expect(screen.getByText(/Key Takeaways for Pakistani Applicants/i)).toBeDefined();

      const pauseBtn = screen.getByRole('button', { name: /^Pause$/i });
      expect(pauseBtn).toBeDefined();
      fireEvent.click(pauseBtn);

      const closeBtn = screen.getByLabelText(/Close video player/i);
      fireEvent.click(closeBtn);
    });
  });

  describe('4. Interactive Explore Opportunities Section', () => {
    it('renders master tabs for Universities, Scholarships, and Professors', () => {
      render(
        <MemoryRouter>
          <ExploreOpportunitiesSection />
        </MemoryRouter>
      );

      expect(screen.getByRole('heading', { level: 2, name: /Discover Your Future Across European Higher Education/i })).toBeDefined();
      expect(screen.getByRole('tab', { name: /Explore Universities/i })).toBeDefined();
      expect(screen.getByRole('tab', { name: /Explore Scholarships/i })).toBeDefined();
      expect(screen.getByRole('tab', { name: /Explore Professors & Research/i })).toBeDefined();
    });

    it('defaults to Universities tab with primary CTA navigating to /universities', () => {
      render(
        <MemoryRouter>
          <ExploreOpportunitiesSection />
        </MemoryRouter>
      );

      expect(screen.getByText(/Technical University of Munich/i)).toBeDefined();
      expect(screen.getByText(/Sorbonne University/i)).toBeDefined();

      const ctaBtn = screen.getByRole('link', { name: /^Explore Universities$/i });
      expect(ctaBtn).toHaveAttribute('href', ROUTES.UNIVERSITIES);
    });

    it('switches to Scholarships tab with verified grant details and CTA navigating to /scholarships', () => {
      render(
        <MemoryRouter>
          <ExploreOpportunitiesSection />
        </MemoryRouter>
      );

      const scholarshipsTab = screen.getByRole('tab', { name: /Explore Scholarships/i });
      fireEvent.click(scholarshipsTab);

      expect(screen.getByText(/DAAD Study Scholarships for Postgraduate Studies/i)).toBeDefined();
      expect(screen.getByText(/Eiffel Excellence Scholarship Program/i)).toBeDefined();
      expect(screen.getByText(/€934 \/ month \+ Health Insurance/i)).toBeDefined();

      const ctaBtn = screen.getByRole('link', { name: /^Explore Scholarships$/i });
      expect(ctaBtn).toHaveAttribute('href', ROUTES.SCHOLARSHIPS);
    });

    it('switches to Professors & Research tab with faculty research cards and CTA navigating to /programs', () => {
      render(
        <MemoryRouter>
          <ExploreOpportunitiesSection />
        </MemoryRouter>
      );

      const professorsTab = screen.getByRole('tab', { name: /Explore Professors & Research/i });
      fireEvent.click(professorsTab);

      expect(screen.getByText(/Prof\. Dr\. Klaus Meier/i)).toBeDefined();
      expect(screen.getByText(/Prof\. Elena Rossi/i)).toBeDefined();
      expect(screen.getByText(/Prof\. Jean-Pierre Laurent/i)).toBeDefined();
      expect(screen.getByText(/Artificial Intelligence & Computer Vision/i)).toBeDefined();
      expect(screen.getByText(/Autonomous Perception Systems/i)).toBeDefined();

      // Research field filter tag
      const energyFilter = screen.getByRole('tab', { name: /Clean Energy & Power/i });
      fireEvent.click(energyFilter);
      expect(screen.getByText(/Prof\. Dr\. Ingrid Becker/i)).toBeDefined();

      const ctaBtn = screen.getByRole('link', { name: /^Explore Professors$/i });
      expect(ctaBtn).toHaveAttribute('href', ROUTES.PROGRAMS);
    });
  });

  describe('5. Full HomePage Narrative Integration', () => {
    it('integrates all new sections in the strategic narrative order', () => {
      render(
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      );

      // 1. Hero
      expect(screen.getByRole('heading', { level: 1, name: /Your future\.\s*Your university\.\s*Your way forward\./i })).toBeDefined();

      // 2. Explore Opportunities (immediately after pillars)
      expect(screen.getByRole('heading', { level: 2, name: /Discover Your Future Across European Higher Education/i })).toBeDefined();

      // 3. Interactive World Map
      expect(screen.getByLabelText(/Interactive Real World Destinations and Corridors Map/i)).toBeDefined();

      // 4. Partners Section
      expect(screen.getByRole('heading', { level: 2, name: /Collaborating with Leading European Academic Bodies/i })).toBeDefined();

      // 5. Choice Section
      expect(screen.getByRole('heading', { level: 2, name: /Your journey\. Your choice\./i })).toBeDefined();

      // 6. Journey Roadmap
      expect(screen.getByRole('heading', { level: 2, name: /How Your Journey Progresses/i })).toBeDefined();

      // 7. Alumni Success Stories
      expect(screen.getByRole('heading', { level: 2, name: /Success Stories Beyond Borders/i })).toBeDefined();

      // 8. Ambassadors Video Testimonials
      expect(screen.getByRole('heading', { level: 2, name: /Hear It Directly From Our Student Ambassadors/i })).toBeDefined();

      // 9. FAQs
      expect(screen.getByRole('heading', { level: 2, name: /Frequently Asked Questions/i })).toBeDefined();

      // 10. Final Call to Action
      expect(screen.getByRole('heading', { level: 2, name: /A new chapter\.\s*One simple step\./i })).toBeDefined();
    });
  });
});
