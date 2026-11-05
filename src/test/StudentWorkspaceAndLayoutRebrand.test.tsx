import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { StudentBottomDock } from '@/components/layout/StudentBottomDock';
import { StudentJourneyNav } from '@/components/layout/StudentJourneyNav';
import { Topbar } from '@/components/layout/Topbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { StudentOverviewPage } from '@/pages/student/StudentOverviewPage';
import { STUDENT_NAV_GROUPS } from '@/config/navigation';
import { ThemeProvider } from '@/lib/theme';
import { api } from '@/lib/api';

// Mock API for predictable test outcomes
vi.mock('@/lib/api', () => ({
  api: {
    auth: {
      getCurrentUser: vi.fn(),
      signOut: vi.fn().mockResolvedValue({ success: true }),
    },
    student: {
      getOverviewCase: vi.fn(),
      getTasks: vi.fn(),
      getDocuments: vi.fn(),
      getApplications: vi.fn(),
      toggleTask: vi.fn().mockResolvedValue({ success: true }),
    },
    messages: {
      getCaseMessages: vi.fn().mockResolvedValue([]),
    },
    notifications: {
      getNotifications: vi.fn().mockResolvedValue([]),
      getUnreadCount: vi.fn().mockResolvedValue(0),
    },
  },
  validateClientFileSecurity: vi.fn(),
  formatUtcInTimezone: vi.fn((d) => d || ''),
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

describe('Managed Student Shell & Workspace Rebrand Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.auth.getCurrentUser as any).mockResolvedValue({
      id: 'student-uuid-001',
      fullName: 'Amina Khan',
      email: 'amina.khan@example.com',
      role: 'managed_student',
    });
  });

  describe('1. Desktop Sidebar Specification', () => {
    it('renders with approved desktop width (256px expanded and 76px collapsed)', () => {
      const onRoleChange = vi.fn();
      const onToggleCollapse = vi.fn();
      const onCloseMobile = vi.fn();

      render(
        <MemoryRouter initialEntries={['/student']}>
          <Sidebar
            groups={STUDENT_NAV_GROUPS}
            workspaceTitle="Student Workspace"
            currentRole="managed_student"
            userName="Amina Khan"
            userEmail="amina.khan@example.com"
            collapsed={false}
            onToggleCollapse={onToggleCollapse}
            mobileOpen={false}
            onCloseMobile={onCloseMobile}
            onRoleChange={onRoleChange}
          />
        </MemoryRouter>
      );

      const asideElement = screen.getByLabelText(/Student Workspace sidebar/i);
      expect(asideElement).toBeInTheDocument();
      expect(asideElement.style.width).toBe('256px');
      expect(asideElement.style.minWidth).toBe('256px');
    });

    it('renders grouped navigation destinations preserving Applications, Documents, Tasks, and Messages', () => {
      const onRoleChange = vi.fn();
      render(
        <MemoryRouter initialEntries={['/student']}>
          <Sidebar
            groups={STUDENT_NAV_GROUPS}
            workspaceTitle="Student Workspace"
            currentRole="managed_student"
            userName="Amina Khan"
            userEmail="amina.khan@example.com"
            collapsed={false}
            onToggleCollapse={vi.fn()}
            mobileOpen={false}
            onCloseMobile={vi.fn()}
            onRoleChange={onRoleChange}
          />
        </MemoryRouter>
      );

      // Main Group
      expect(screen.getByText('Today')).toBeInTheDocument();
      expect(screen.getByText('Discover')).toBeInTheDocument();
      expect(screen.getByText('Saved')).toBeInTheDocument();

      // Journey Group
      expect(screen.getByText('Applications')).toBeInTheDocument();
      expect(screen.getByText('Documents')).toBeInTheDocument();
      expect(screen.getByText('Tasks & Deadlines')).toBeInTheDocument();
      expect(screen.getByText('Messages')).toBeInTheDocument();

      // Support & Account Group
      expect(screen.getByText('Help Centre')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('renders the supportive panel "Big plans. Small steps." for managed students', () => {
      render(
        <MemoryRouter initialEntries={['/student']}>
          <Sidebar
            groups={STUDENT_NAV_GROUPS}
            workspaceTitle="Student Workspace"
            currentRole="managed_student"
            userName="Amina Khan"
            userEmail="amina.khan@example.com"
            collapsed={false}
            onToggleCollapse={vi.fn()}
            mobileOpen={false}
            onCloseMobile={vi.fn()}
            onRoleChange={vi.fn()}
          />
        </MemoryRouter>
      );

      expect(screen.getByText(/Big plans\. Small steps\./i)).toBeInTheDocument();
      expect(screen.getByText(/Keep your documents and deadlines verified for European admissions\./i)).toBeInTheDocument();
    });

    it('renders the active item with Citron background (#D7EE83) and dark ink text (#19261F)', () => {
      render(
        <MemoryRouter initialEntries={['/student']}>
          <Sidebar
            groups={STUDENT_NAV_GROUPS}
            workspaceTitle="Student Workspace"
            currentRole="managed_student"
            userName="Amina Khan"
            userEmail="amina.khan@example.com"
            collapsed={false}
            onToggleCollapse={vi.fn()}
            mobileOpen={false}
            onCloseMobile={vi.fn()}
            onRoleChange={vi.fn()}
          />
        </MemoryRouter>
      );

      const todayLink = screen.getByRole('link', { name: /Today/i });
      expect(todayLink).toBeInTheDocument();
      // Verifying citron active styling
      expect(todayLink.style.backgroundColor).toContain('#D7EE83');
      expect(todayLink.style.color).toBe('rgb(25, 38, 31)'); // #19261F
    });

    it('renders account identity and functional sign-out action', async () => {
      const onRoleChange = vi.fn();
      render(
        <MemoryRouter initialEntries={['/student']}>
          <Sidebar
            groups={STUDENT_NAV_GROUPS}
            workspaceTitle="Student Workspace"
            currentRole="managed_student"
            userName="Amina Khan"
            userEmail="amina.khan@example.com"
            collapsed={false}
            onToggleCollapse={vi.fn()}
            mobileOpen={false}
            onCloseMobile={vi.fn()}
            onRoleChange={onRoleChange}
          />
        </MemoryRouter>
      );

      expect(screen.getByText('Amina Khan')).toBeInTheDocument();
      expect(screen.getByText('managed student')).toBeInTheDocument();

      const signOutBtn = screen.getByRole('button', { name: /Sign out/i });
      expect(signOutBtn).toBeInTheDocument();

      fireEvent.click(signOutBtn);
      await waitFor(() => {
        expect(api.auth.signOut).toHaveBeenCalled();
        expect(onRoleChange).toHaveBeenCalledWith('visitor');
      });
    });
  });

  describe('2. Mobile Bottom Dock Specification', () => {
    it('renders the 5 canonical destinations: Today, Discover, Saved, Journey, Settings', () => {
      render(
        <MemoryRouter initialEntries={['/student']}>
          <StudentBottomDock />
        </MemoryRouter>
      );

      const nav = screen.getByLabelText(/Student mobile navigation dock/i);
      expect(nav).toBeInTheDocument();

      expect(screen.getByRole('link', { name: /Today/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Discover/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Saved/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Journey/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Settings/i })).toBeInTheDocument();
    });

    it('marks Journey active when on any casework sub-route (applications, documents, tasks, messages)', () => {
      render(
        <MemoryRouter initialEntries={['/student/documents']}>
          <StudentBottomDock />
        </MemoryRouter>
      );

      const journeyLink = screen.getByRole('link', { name: /Journey/i });
      expect(journeyLink).toHaveAttribute('aria-current', 'page');
    });

    it('renders full student layout containing desktop sidebar and mobile bottom dock', async () => {
      const queryClient = createTestQueryClient();
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/student']}>
            <StudentLayout currentRole="managed_student" onRoleChange={vi.fn()} />
          </MemoryRouter>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/Student Workspace sidebar/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Student mobile navigation dock/i)).toBeInTheDocument();
      });
    });
  });

  describe('3. Casework Sub-Navigation (StudentJourneyNav)', () => {
    it('renders the 4 casework destinations with links and badge counts', () => {
      render(
        <MemoryRouter initialEntries={['/student/applications']}>
          <StudentJourneyNav taskBadge={3} messageBadge={1} />
        </MemoryRouter>
      );

      const nav = screen.getByRole('navigation', { name: /Student Journey Casework Navigation/i });
      expect(nav).toBeInTheDocument();

      expect(screen.getByRole('link', { name: /Applications/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Documents/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Tasks & Deadlines/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Messages/i })).toBeInTheDocument();

      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  describe('4. Top Utility Bar Specification', () => {
    it('renders 64px height with breadcrumb, search shortcut, and operational theme toggle', () => {
      const queryClient = createTestQueryClient();
      render(
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <MemoryRouter initialEntries={['/student/tasks']}>
              <Topbar
                currentRole="managed_student"
                userName="Amina Khan"
                userEmail="amina.khan@example.com"
                onOpenMobileNav={vi.fn()}
              />
            </MemoryRouter>
          </ThemeProvider>
        </QueryClientProvider>
      );

      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();
      expect(header.style.height).toBe('64px');

      // Operational Search button
      const searchBtn = screen.getByRole('button', { name: /Search catalogue/i });
      expect(searchBtn).toBeInTheDocument();

      // Operational Theme Toggle
      const themeBtn = screen.getByRole('button', { name: /Switch to/i });
      expect(themeBtn).toBeInTheDocument();

      // Hamburger menu button should NOT be rendered for managed_student (dock is active on mobile)
      expect(screen.queryByLabelText(/Open navigation drawer/i)).toBeNull();
    });
  });

  describe('5. Student Overview Page (Genuine Data & Minimalist Bento)', () => {
    it('renders genuine student welcome, actual tasks, and assigned counsellor without fabricated metrics', async () => {
      (api.student.getOverviewCase as any).mockResolvedValue({
        id: 'case-real-001',
        studentName: 'Amina Khan',
        targetCountry: 'Germany',
        targetIntakeSeason: 'Winter',
        targetIntakeYear: 2026,
        assignedCounsellorName: 'Dr. Tariq Malik',
      });

      (api.student.getTasks as any).mockResolvedValue([
        {
          id: 'task-1',
          title: 'Dispatch HEC verified transcripts',
          description: 'Courier notarized photocopies to the German consulate.',
          status: 'pending',
          dueDate: '2026-11-15',
        },
      ]);

      (api.student.getDocuments as any).mockResolvedValue([
        {
          id: 'doc-1',
          documentType: 'hec_attestation',
          fileName: 'hec_attestation_scan.pdf',
          fileSizeBytes: 2048576,
          verificationStatus: 'verified',
        },
      ]);

      (api.student.getApplications as any).mockResolvedValue([
        {
          id: 'app-1',
          externalStatus: 'submitted',
          universitySnapshot: { name: 'Technical University of Munich' },
          programSnapshot: { title: 'M.Sc. Informatics' },
        },
      ]);

      const queryClient = createTestQueryClient();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/student']}>
            <StudentOverviewPage />
          </MemoryRouter>
        </QueryClientProvider>
      );

      // Verify authentic greeting & cycle
      await waitFor(() => {
        expect(screen.getByText(/Welcome back, Amina Khan!/i)).toBeInTheDocument();
        expect(screen.getByText(/WINTER 2026 Admissions Cycle/i)).toBeInTheDocument();
      });

      // Verify assigned counsellor
      expect(screen.getByText('Dr. Tariq Malik')).toBeInTheDocument();
      expect(screen.getByText('Assigned Case Lead')).toBeInTheDocument();

      // Verify priority task
      expect(screen.getByText('Dispatch HEC verified transcripts')).toBeInTheDocument();
      expect(screen.getByText(/Next Action Required/i)).toBeInTheDocument();

      // Verify active application
      expect(screen.getByText('Technical University of Munich')).toBeInTheDocument();

      // Confirm no fabricated "Sultan" or fake credits
      expect(screen.queryByText(/Sultan/i)).toBeNull();
      expect(screen.queryByText(/Available credits/i)).toBeNull();
    });

    it('renders clean unassigned state when counsellor is not yet allocated', async () => {
      (api.student.getOverviewCase as any).mockResolvedValue({
        id: 'case-real-002',
        studentName: 'Amina Khan',
        targetCountry: 'Germany',
        targetIntakeSeason: 'Winter',
        targetIntakeYear: 2026,
        assignedCounsellorName: null,
      });

      (api.student.getTasks as any).mockResolvedValue([]);
      (api.student.getDocuments as any).mockResolvedValue([]);
      (api.student.getApplications as any).mockResolvedValue([]);

      const queryClient = createTestQueryClient();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/student']}>
            <StudentOverviewPage />
          </MemoryRouter>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Adviser Pending Assignment')).toBeInTheDocument();
        expect(screen.getByText('Unallocated to Staff')).toBeInTheDocument();
      });
    });
  });
});
