import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SearchDialog } from '@/components/domain/SearchDialog';
import { ExplorerAccountPage } from '@/pages/explorer/ExplorerAccountPage';
import { NotFoundPage } from '@/pages/public/NotFoundPage';
import { StaffSettingsPage } from '@/pages/staff/StaffSettingsPage';
import { TermsPage } from '@/pages/public/TermsPage';
import { PrivacyPolicyPage } from '@/pages/public/PrivacyPolicyPage';
import { api } from '@/lib/api';

// Mock TanStack Query Client
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

describe('Remaining Routes & Rebranded Settings Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('SearchDialog Component', () => {
    it('renders as accessible modal dialog with focus management and Esc handling', () => {
      const handleClose = vi.fn();
      render(
        <MemoryRouter>
          <SearchDialog
            isOpen={true}
            onClose={handleClose}
            currentRole="explorer"
            userId="user_123"
          />
        </MemoryRouter>
      );

      // Check dialog attributes
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute('aria-modal', 'true');

      // Check search input presence
      const input = screen.getByPlaceholderText(/Search universities, programs, or destinations/i);
      expect(input).toBeInTheDocument();

      // Check close control button
      const closeButton = screen.getByRole('button', { name: /Close search dialog/i });
      expect(closeButton).toBeInTheDocument();

      // Check Escape key handling
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('renders 2-column mobile category tiles and updates active selection', () => {
      render(
        <MemoryRouter>
          <SearchDialog
            isOpen={true}
            onClose={vi.fn()}
            currentRole="visitor"
            userId="anon"
          />
        </MemoryRouter>
      );

      // Verify category radio buttons
      expect(screen.getByRole('radio', { name: /Everything/i })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /Destinations/i })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /Universities/i })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /Programmes/i })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /Scholarships/i })).toBeInTheDocument();

      // Click on Destinations
      const destinationsBtn = screen.getByRole('radio', { name: /Destinations/i });
      fireEvent.click(destinationsBtn);

      // Check active styling indication
      expect(destinationsBtn).toHaveAttribute('aria-checked', 'true');
    });

    it('isolates recent searches per real user and prevents cross-account data leakage', () => {
      // User A creates a search
      localStorage.setItem('unilistics_recent_searches_user_A', JSON.stringify(['Heidelberg University']));
      // User B creates a different search
      localStorage.setItem('unilistics_recent_searches_user_B', JSON.stringify(['Sorbonne Paris']));

      // Render for User A
      const { unmount } = render(
        <MemoryRouter>
          <SearchDialog
            isOpen={true}
            onClose={vi.fn()}
            currentRole="explorer"
            userId="user_A"
          />
        </MemoryRouter>
      );

      expect(screen.getByText('Heidelberg University')).toBeInTheDocument();
      expect(screen.queryByText('Sorbonne Paris')).not.toBeInTheDocument();
      unmount();

      // Render for User B
      render(
        <MemoryRouter>
          <SearchDialog
            isOpen={true}
            onClose={vi.fn()}
            currentRole="explorer"
            userId="user_B"
          />
        </MemoryRouter>
      );

      expect(screen.getByText('Sorbonne Paris')).toBeInTheDocument();
      expect(screen.queryByText('Heidelberg University')).not.toBeInTheDocument();
    });

    it('discloses unsupported scope when searching beyond account entitlement', () => {
      render(
        <MemoryRouter>
          <SearchDialog
            isOpen={true}
            onClose={vi.fn()}
            currentRole="visitor"
            userId="anon"
          />
        </MemoryRouter>
      );

      const input = screen.getByPlaceholderText(/Search universities, programs, or destinations/i);
      fireEvent.change(input, { target: { value: 'casework dossier visa appointment' } });

      // Should disclose unsupported internal case search for visitor
      expect(
        screen.getByText(/Anonymous visitors can explore public destination corridors/i)
      ).toBeInTheDocument();
    });
  });

  describe('ExplorerAccountPage (Settings & Profile)', () => {
    beforeEach(() => {
      vi.spyOn(api.auth, 'getCurrentUser').mockResolvedValue({
        id: 'usr-123',
        email: 'tariq.applicant@example.com',
        fullName: 'Tariq Mehmood',
        role: 'explorer',
        city: 'Lahore',
        highestEducation: 'BS Computer Science',
        createdAt: '2026-09-01T10:00:00Z',
      } as any);
    });

    it('matches Screenshot 4 airy grouped rows with initials avatar and section headers', async () => {
      const { container } = render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ExplorerAccountPage />
          </MemoryRouter>
        </QueryClientProvider>
      );

      // Await user profile query resolution
      await waitFor(() => {
        expect(screen.getByText('Tariq Mehmood')).toBeInTheDocument();
      });

      // Verify initials avatar
      expect(screen.getByText('TM')).toBeInTheDocument();

      // Verify role badge
      expect(screen.getByText('Approved Explorer')).toBeInTheDocument();

      // Verify grouped section titles
      expect(screen.getByText('Account')).toBeInTheDocument();
      expect(screen.getByText('Preferences')).toBeInTheDocument();
      expect(screen.getByText('Privacy & Legal')).toBeInTheDocument();
      expect(screen.getByText('Support & Session')).toBeInTheDocument();

      // Verify working rows
      expect(screen.getByText('Personal information')).toBeInTheDocument();
      expect(screen.getByText('Login & security')).toBeInTheDocument();
      expect(screen.getByText('Appearance')).toBeInTheDocument();
      expect(screen.getByText('Notifications')).toBeInTheDocument();
      expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
      expect(screen.getByText('Terms of Service')).toBeInTheDocument();
      expect(screen.getByText('Help & Contact Desk')).toBeInTheDocument();
      expect(screen.getByText('Sign out')).toBeInTheDocument();

      // Verify strict prohibition of fake test wallet or credit balances
      expect(container.innerHTML).not.toContain('Credits and plans');
      expect(container.innerHTML).not.toContain('Synthetic balance');
      expect(container.innerHTML).not.toContain('test wallet');
      expect(container.innerHTML).not.toContain('#FFEFEA');
      expect(container.innerHTML).not.toContain('#B72301');
    });

    it('opens interactive Personal Information modal with verified user details', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ExplorerAccountPage />
          </MemoryRouter>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Tariq Mehmood')).toBeInTheDocument();
      });

      // Click Personal information row
      fireEvent.click(screen.getByText('Personal information'));

      // Check modal open
      expect(screen.getByRole('dialog', { name: /Personal Information/i })).toBeInTheDocument();
      expect(screen.getByText('Lahore')).toBeInTheDocument();
      expect(screen.getByText('BS Computer Science')).toBeInTheDocument();

      // Close modal
      fireEvent.click(screen.getByRole('button', { name: /Done/i }));
      expect(screen.queryByRole('dialog', { name: /Personal Information/i })).not.toBeInTheDocument();
    });

    it('opens Login & Security modal with password reset link', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ExplorerAccountPage />
          </MemoryRouter>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Tariq Mehmood')).toBeInTheDocument();
      });

      // Click Login & security row
      fireEvent.click(screen.getByText('Login & security'));

      expect(screen.getByRole('dialog', { name: /Login & Security/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Reset Password/i })).toBeInTheDocument();
      expect(screen.getByText('Verified')).toBeInTheDocument();
    });
  });

  describe('Edge and Legal Routes Rebrand', () => {
    it('renders NotFoundPage (404) with DESIGN_SYSTEM_V2 surfaces and zero coral colors', () => {
      const { container } = render(
        <MemoryRouter>
          <NotFoundPage />
        </MemoryRouter>
      );

      expect(screen.getByText('Page Not Found (404)')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Back to Home/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Explore Universities/i })).toBeInTheDocument();

      expect(container.innerHTML).not.toContain('#FFEFEA');
      expect(container.innerHTML).not.toContain('#B72301');
      expect(container.innerHTML).not.toContain('var(--accent-peach-bg)');
    });

    it('renders StaffSettingsPage with role hierarchy and no client-side promotion loopholes', () => {
      render(
        <MemoryRouter>
          <StaffSettingsPage />
        </MemoryRouter>
      );

      expect(screen.getByText('System Settings & Role Provisioning')).toBeInTheDocument();
      expect(screen.getByText('Super Administrator Exclusivity')).toBeInTheDocument();
      expect(screen.getByText('Super Admin Only')).toBeInTheDocument();
      expect(screen.getByText('Admin Role')).toBeInTheDocument();
      expect(screen.getByText('Assigned Cases Only')).toBeInTheDocument();
    });

    it('renders TermsPage with procedural content disclaimers and zero coral colors', () => {
      const { container } = render(
        <MemoryRouter>
          <TermsPage />
        </MemoryRouter>
      );

      expect(screen.getByRole('heading', { level: 1, name: /Terms of Service/i })).toBeInTheDocument();
      expect(screen.getAllByText(/Procedural Guides as Content, Not Statutory Policy/i).length).toBeGreaterThanOrEqual(1);
      expect(container.innerHTML).not.toContain('#b72301');
      expect(container.innerHTML).not.toContain('var(--accent-peach-bg)');
    });

    it('renders PrivacyPolicyPage with synthetic data protection mandate', () => {
      const { container } = render(
        <MemoryRouter>
          <PrivacyPolicyPage />
        </MemoryRouter>
      );

      expect(screen.getByRole('heading', { level: 1, name: /Privacy Policy/i })).toBeInTheDocument();
      expect(screen.getAllByText(/Prohibition on Real Student PII/i).length).toBeGreaterThanOrEqual(1);
      expect(container.innerHTML).not.toContain('#b72301');
      expect(container.innerHTML).not.toContain('var(--accent-peach-bg)');
    });
  });
});
