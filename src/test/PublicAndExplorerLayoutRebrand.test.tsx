import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { DiscoveryLayout } from '@/components/layout/DiscoveryLayout';
import { HomePage } from '@/pages/public/HomePage';
import { UniversitiesDiscoveryPage } from '@/pages/discovery/UniversitiesDiscoveryPage';
import { api } from '@/lib/api';

describe('Public and Explorer Layouts & Rebrand Test Suite', () => {
  let queryClient: QueryClient;

  beforeEach(async () => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    localStorage.clear();
    await api.auth.switchRole('visitor');
  });

  describe('1. Public Header & Navigation', () => {
    it('renders new logo/wordmark, Home, Explore Universities, Contact, Sign in and Sign up', () => {
      render(
        <MemoryRouter>
          <PublicNavbar currentRole="visitor" onRoleChange={() => {}} />
        </MemoryRouter>
      );

      // Verify BrandWordmark
      expect(screen.getByRole('link', { name: /Unilistics Home/i })).toBeDefined();

      // Canonical 5 links
      expect(screen.getByRole('link', { name: /^Home$/i })).toBeDefined();
      expect(screen.getByRole('link', { name: /^Explore Universities$/i })).toBeDefined();
      expect(screen.getByRole('link', { name: /^Contact$/i })).toBeDefined();
      expect(screen.getByRole('link', { name: /^Sign in$/i })).toBeDefined();
      expect(screen.getByRole('link', { name: /^Sign up$/i })).toBeDefined();

      // Prohibited items for public visitors
      expect(screen.queryByPlaceholderText(/Search/i)).toBeNull();
      expect(screen.queryByRole('button', { name: /notifications/i })).toBeNull();
      expect(screen.queryByText(/sidebar/i)).toBeNull();
    });

    it('provides accessible mobile menu with ESC key support', () => {
      render(
        <MemoryRouter>
          <PublicNavbar currentRole="visitor" onRoleChange={() => {}} />
        </MemoryRouter>
      );

      const menuBtn = screen.getByRole('button', { name: /Open navigation menu/i });
      fireEvent.click(menuBtn);

      const drawer = screen.getByRole('dialog', { name: /Site navigation/i });
      expect(drawer).toBeDefined();

      // Press Escape to close
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByRole('dialog', { name: /Site navigation/i })).toBeNull();
    });
  });

  describe('2. Explorer Header & Footer Coherence', () => {
    it('replaces auth actions with account menu and Request Guidance/Saved for explorer', async () => {
      await api.auth.switchRole('explorer');

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/universities']}>
            <DiscoveryLayout currentRole="explorer" onRoleChange={() => {}} />
          </MemoryRouter>
        </QueryClientProvider>
      );

      // Account menu elements
      expect(screen.getByTitle(/Sign out of account/i)).toBeDefined();
      expect(screen.getByRole('link', { name: /Saved/i })).toBeDefined();
      expect(screen.getByRole('link', { name: /Managed Guidance/i })).toBeDefined();

      // Sign in / Sign up should not appear on explorer header
      expect(screen.queryByRole('link', { name: /^Create Account$/i })).toBeNull();
    });

    it('renders coherent footer branding, corridors, and legal disclosures in explorer layout', async () => {
      await api.auth.switchRole('explorer');

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/universities']}>
            <DiscoveryLayout currentRole="explorer" onRoleChange={() => {}} />
          </MemoryRouter>
        </QueryClientProvider>
      );

      // Footer branding & active corridors
      expect(screen.getByText(/Active corridors: Germany, France, Italy, Romania/i)).toBeDefined();
      expect(screen.getByRole('link', { name: /Privacy Policy/i })).toBeDefined();
      expect(screen.getByRole('link', { name: /Terms of Service/i })).toBeDefined();
      expect(screen.getByText(/Application guides are draft procedural reference material/i)).toBeDefined();
    });
  });

  describe('3. Rebranded Homepage', () => {
    it('does not contain legacy coral gradients or bloated hero metrics', () => {
      const { container } = render(
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      );

      // Verify no obsolete coral hex values
      expect(container.innerHTML).not.toContain('#FF5E36');
      expect(container.innerHTML).not.toContain('#FF2A55');
      expect(container.innerHTML).not.toContain('#FFF0EB');

      // Verify absence of bloated fabricated counters
      expect(container.innerHTML).not.toContain('4,812 active degree intakes refreshed today');

      // Verify presence of verified corridors
      expect(screen.getByText(/Pakistan to Europe Higher Education Admissions Desk/i)).toBeDefined();
      expect(screen.getByText(/4 Corridors/i)).toBeDefined();
      expect(screen.getByText(/Curated programmes across 4 European corridors/i)).toBeDefined();
    });

    it('allows searching and opens advisory modal accessible with Escape key', async () => {
      render(
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      );

      const advisoryBtn = screen.getByRole('button', { name: /Request 1-on-1 Advisory/i });
      fireEvent.click(advisoryBtn);

      const modalTitle = await screen.findByText(/Request 1-on-1 Academic Eligibility Review/i);
      expect(modalTitle).toBeDefined();

      // Press Escape
      fireEvent.keyDown(window, { key: 'Escape' });
      await waitFor(() => {
        expect(screen.queryByText(/Request 1-on-1 Academic Eligibility Review/i)).toBeNull();
      });
    });
  });

  describe('4. Discovery & University Cards', () => {
    it('renders large search, separate filter button with count, and deliberate results grid', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/universities']}>
            <UniversitiesDiscoveryPage />
          </MemoryRouter>
        </QueryClientProvider>
      );

      // Large search bar
      const searchInput = screen.getByPlaceholderText(/Search preview universities by name or city/i);
      expect(searchInput).toBeDefined();

      // Separate filter action button
      const filterBtn = screen.getByRole('button', { name: /Filters/i });
      expect(filterBtn).toBeDefined();

      // Result count text
      await waitFor(() => {
        expect(screen.getByText(/Showing/i)).toBeDefined();
      });
    });

    it('enforces visitor locked dialog when visitor attempts to filter', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/universities']}>
            <UniversitiesDiscoveryPage />
          </MemoryRouter>
        </QueryClientProvider>
      );

      const filterBtn = screen.getByRole('button', { name: /Filters/i });
      fireEvent.click(filterBtn);

      // Verify locked filter dialog opens
      await waitFor(() => {
        expect(screen.getByRole('dialog', { name: /Catalogue Filters Locked/i })).toBeDefined();
      });
    });
  });
});
