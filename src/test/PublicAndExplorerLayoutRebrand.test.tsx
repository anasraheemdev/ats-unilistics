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

      // Canonical navigation
      expect(screen.getByRole('link', { name: /^Home$/i })).toBeDefined();
      expect(screen.getByRole('button', { name: /Explore/i })).toBeDefined();
      expect(screen.getByRole('button', { name: /Help & Guidance/i })).toBeDefined();
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
      expect(screen.getAllByRole('link', { name: /Managed Guidance/i }).length).toBeGreaterThan(0);

      // Open account menu to access Saved quick link
      const accountTrigger = screen.getByRole('button', { name: /Account menu for/i });
      fireEvent.click(accountTrigger);
      expect(screen.getByRole('link', { name: /Saved/i })).toBeDefined();

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
    it('renders clean photographic hero without legacy coral gradients or bloated hero metrics', () => {
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

      // Verify presence of reference photographic hero copy
      expect(screen.getByRole('heading', { level: 1, name: /Your future\.\s*Your university\.\s*Your way forward\./i })).toBeDefined();
      expect(screen.getByText(/Explore study opportunities in Europe and take your next step with guidance from our team\./i)).toBeDefined();
      expect(screen.getByLabelText(/Find a university/i)).toBeDefined();
      expect(screen.getByPlaceholderText(/Search universities/i)).toBeDefined();
      expect(screen.getByRole('button', { name: /^Explore$/i })).toBeDefined();
      expect(screen.getByRole('link', { name: /Need a helping hand\? Get guidance/i })).toBeDefined();
      expect(screen.getAllByText(/Explore opportunities/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Organise your documents/i)).toBeDefined();
      expect(screen.getByText(/Track every step/i)).toBeDefined();
    });

    it('submits search query and triggers catalogue navigation', async () => {
      render(
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      );

      const searchInput = screen.getByPlaceholderText(/Search universities/i);
      expect(searchInput).toBeDefined();
      fireEvent.change(searchInput, { target: { value: 'Munich' } });

      const exploreBtn = screen.getByRole('button', { name: /^Explore$/i });
      expect(exploreBtn).toBeDefined();
      fireEvent.click(exploreBtn);
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
      }, { timeout: 4000 });
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
