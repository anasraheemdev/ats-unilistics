import { UserRole } from '@/types';

export interface NavItemConfig {
  id: string;
  label: string;
  path: string;
  iconName: string;
  badgeKey?: 'tasks' | 'messages' | 'reviews' | 'requests' | 'applications';
  end?: boolean;
  superAdminOnly?: boolean;
}

export interface NavGroupConfig {
  id: string;
  label: string;
  items: NavItemConfig[];
}

export interface RoleNavigationConfig {
  role: UserRole;
  workspaceTitle: string;
  defaultPath: string;
  groups: NavGroupConfig[];
}

export interface NavDropdownItem {
  id: string;
  label: string;
  ariaLabel?: string;
  path: string;
  description: string;
  iconName: string;
  requiresAuth?: boolean;
}

export interface PublicNavSection {
  id: string;
  label: string;
  type: 'link' | 'dropdown';
  path?: string;
  iconName?: string;
  activeMatchPrefixes?: string[];
  items?: NavDropdownItem[];
}

export const PUBLIC_NAV_CONFIG: PublicNavSection[] = [
  {
    id: 'nav-home',
    label: 'Home',
    type: 'link',
    path: '/',
    iconName: 'House',
  },
  {
    id: 'nav-explore',
    label: 'Explore',
    type: 'dropdown',
    iconName: 'Compass',
    activeMatchPrefixes: ['/universities', '/programs', '/scholarships', '/saved', '/explorer'],
    items: [
      {
        id: 'exp-unis',
        label: 'Universities',
        ariaLabel: 'Explore Universities',
        path: '/universities',
        description: 'Accredited European institutions across Germany, France, Italy, Romania',
        iconName: 'GraduationCap',
      },
      {
        id: 'exp-progs',
        label: 'Programs',
        path: '/programs',
        description: 'English-taught Bachelors & Masters curricula',
        iconName: 'FileText',
      },
      {
        id: 'exp-schol',
        label: 'Scholarships',
        path: '/scholarships',
        description: 'DAAD, Erasmus Mundus, and national merit funding',
        iconName: 'Heart',
      },
      {
        id: 'exp-saved',
        label: 'Saved',
        ariaLabel: 'Saved',
        path: '/saved',
        description: 'Your bookmarked institutions and programs',
        iconName: 'Bookmark',
        requiresAuth: true,
      },
    ],
  },
  {
    id: 'nav-help',
    label: 'Help & Guidance',
    type: 'dropdown',
    iconName: 'CircleHelp',
    activeMatchPrefixes: ['/how-it-works', '/country-corridors', '/corridors-and-legal', '/help', '/support', '/support-desk', '/request-status', '/request-guidance'],
    items: [
      {
        id: 'help-how',
        label: 'How It Works',
        path: '/how-it-works',
        description: '4-stage student journey overview',
        iconName: 'Compass',
      },
      {
        id: 'help-corridors',
        label: 'Country Corridors',
        path: '/country-corridors',
        description: 'Statutory rules for Germany, France, Italy & Romania',
        iconName: 'ShieldCheck',
      },
      {
        id: 'help-centre',
        label: 'Help Centre',
        path: '/help',
        description: 'Searchable procedural articles & FAQs',
        iconName: 'CircleHelp',
      },
      {
        id: 'help-desk',
        label: 'Support Desk',
        path: '/support-desk',
        description: 'Guided admissions tickets & assistance',
        iconName: 'MessageSquare',
      },
      {
        id: 'help-status',
        label: 'Request Status',
        path: '/request-status',
        description: 'Track your guidance review progress',
        iconName: 'Clock',
      },
    ],
  },
  {
    id: 'nav-contact',
    label: 'Contact',
    type: 'link',
    path: '/contact',
    iconName: 'Mail',
  },
];

// 1. Visitor / Explorer Discovery Navigation
export const DISCOVERY_NAV_GROUPS: NavGroupConfig[] = [
  {
    id: 'catalogue',
    label: 'Explore Catalogue',
    items: [
      { id: 'disc-unis', label: 'Universities', path: '/universities', iconName: 'Building2', end: true },
      { id: 'disc-progs', label: 'Degree Programs', path: '/programs', iconName: 'GraduationCap' },
      { id: 'disc-schol', label: 'Scholarships & Grants', path: '/scholarships', iconName: 'Award' },
    ],
  },
  {
    id: 'services',
    label: 'Student Services',
    items: [
      { id: 'disc-saved', label: 'Saved Programs', path: '/saved', iconName: 'Bookmark' },
      { id: 'disc-support', label: 'Request Managed Support', path: '/request-support', iconName: 'Sparkles' },
      { id: 'disc-help', label: 'Help Centre', path: '/help', iconName: 'CircleHelp' },
    ],
  },
];

// 2. Managed Student Navigation
export const STUDENT_NAV_GROUPS: NavGroupConfig[] = [
  {
    id: 'main',
    label: 'Main',
    items: [
      { id: 'stu-today', label: 'Today', path: '/student', iconName: 'House', end: true },
      { id: 'stu-discover', label: 'Discover', path: '/student/explore', iconName: 'Compass' },
      { id: 'stu-saved', label: 'Saved', path: '/student/saved', iconName: 'Bookmark' },
    ],
  },
  {
    id: 'journey',
    label: 'Journey',
    items: [
      { id: 'stu-journey', label: 'Journey Map', path: '/student/journey', iconName: 'Map' },
      { id: 'stu-apps', label: 'Applications', path: '/student/applications', iconName: 'GraduationCap' },
      { id: 'stu-docs', label: 'Documents', path: '/student/documents', iconName: 'FileCheck2' },
      { id: 'stu-tasks', label: 'Tasks & Deadlines', path: '/student/tasks', iconName: 'Clock', badgeKey: 'tasks' },
      { id: 'stu-messages', label: 'Messages', path: '/student/messages', iconName: 'MessageSquare', badgeKey: 'messages' },
      { id: 'stu-scholarships', label: 'Scholarships', path: '/student/scholarships', iconName: 'Award' },
    ],
  },
  {
    id: 'account',
    label: 'Support & Account',
    items: [
      { id: 'stu-help', label: 'Help Centre', path: '/student/help', iconName: 'CircleHelp' },
      { id: 'stu-account', label: 'Settings', path: '/student/account', iconName: 'Settings' },
    ],
  },
];

// 3. Counsellor Navigation
export const COUNSELLOR_NAV_GROUPS: NavGroupConfig[] = [
  {
    id: 'casework',
    label: 'Counsellor Casework',
    items: [
      { id: 'coun-work', label: 'My Work', path: '/staff', iconName: 'LayoutDashboard', end: true },
      { id: 'coun-students', label: 'Assigned Students', path: '/staff/cases', iconName: 'Users' },
      { id: 'coun-apps', label: 'Applications', path: '/staff/applications', iconName: 'GraduationCap' },
      { id: 'coun-reviews', label: 'Document Reviews', path: '/staff/review-queue', iconName: 'FileCheck2', badgeKey: 'reviews' },
      { id: 'coun-tasks', label: 'Tasks & Deadlines', path: '/staff/tasks', iconName: 'Clock', badgeKey: 'tasks' },
      { id: 'coun-messages', label: 'Messages', path: '/staff/messages', iconName: 'MessageSquare', badgeKey: 'messages' },
      { id: 'coun-guides', label: 'Country Guides', path: '/staff/workflows', iconName: 'BookOpen' },
      { id: 'coun-account', label: 'My Account', path: '/staff/settings', iconName: 'Settings' },
    ],
  },
];

// 4. Administrator & Super-Admin Navigation
export const ADMIN_NAV_GROUPS: NavGroupConfig[] = [
  {
    id: 'operations',
    label: 'Operations',
    items: [
      { id: 'adm-overview', label: 'Admin Overview', path: '/admin', iconName: 'LayoutDashboard', end: true },
      { id: 'adm-requests', label: 'Access Requests', path: '/admin/requests', iconName: 'Sparkles', badgeKey: 'requests' },
      { id: 'adm-students', label: 'Students & Cases', path: '/admin/students', iconName: 'Users' },
      { id: 'adm-apps', label: 'Applications', path: '/admin/applications', iconName: 'GraduationCap' },
      { id: 'adm-assignments', label: 'Staff Assignments', path: '/admin/staff-assignments', iconName: 'Users' },
      { id: 'adm-reviews', label: 'Document Reviews', path: '/admin/review-queue', iconName: 'FileCheck2', badgeKey: 'reviews' },
      { id: 'adm-tasks', label: 'Tasks & Deadlines', path: '/admin/tasks', iconName: 'Clock' },
      { id: 'adm-messages', label: 'Messages', path: '/admin/messages', iconName: 'MessageSquare' },
    ],
  },
  {
    id: 'catalogue',
    label: 'Catalogue',
    items: [
      { id: 'adm-unis', label: 'Universities', path: '/admin/catalogue', iconName: 'Building2' },
      { id: 'adm-programs', label: 'Programs & Intakes', path: '/admin/programs', iconName: 'GraduationCap' },
      { id: 'adm-scholarships', label: 'Scholarships', path: '/admin/scholarships', iconName: 'Award' },
      { id: 'adm-imports', label: 'Catalogue Imports', path: '/admin/imports', iconName: 'Database' },
    ],
  },
  {
    id: 'content-control',
    label: 'Content & Control',
    items: [
      { id: 'adm-workflows', label: 'Workflow Templates', path: '/admin/workflows', iconName: 'BookOpen' },
      { id: 'adm-editorial', label: 'Help & Guides Editorial', path: '/admin/editorial', iconName: 'FileText' },
      { id: 'adm-notifications', label: 'Notification Delivery', path: '/admin/notifications', iconName: 'Inbox' },
      { id: 'adm-audit', label: 'Audit Log', path: '/admin/audit', iconName: 'ShieldAlert' },
      { id: 'adm-settings', label: 'Settings & Security', path: '/admin/settings', iconName: 'Settings' },
    ],
  },
];

export function getNavigationConfigForRole(role: UserRole): RoleNavigationConfig {
  switch (role) {
    case 'managed_student':
      return {
        role: 'managed_student',
        workspaceTitle: 'Student Workspace',
        defaultPath: '/student',
        groups: STUDENT_NAV_GROUPS,
      };
    case 'counsellor':
      return {
        role: 'counsellor',
        workspaceTitle: 'Counsellor Desk',
        defaultPath: '/staff',
        groups: COUNSELLOR_NAV_GROUPS,
      };
    case 'admin':
    case 'super_admin':
      return {
        role: role,
        workspaceTitle: role === 'super_admin' ? 'Super Admin Console' : 'Operations Administration',
        defaultPath: '/admin',
        groups: ADMIN_NAV_GROUPS,
      };
    case 'explorer':
      return {
        role: 'explorer',
        workspaceTitle: 'Catalogue Explorer',
        defaultPath: '/universities',
        groups: DISCOVERY_NAV_GROUPS,
      };
    case 'visitor':
    default:
      return {
        role: 'visitor',
        workspaceTitle: 'Higher Education Discovery',
        defaultPath: '/universities',
        groups: DISCOVERY_NAV_GROUPS,
      };
  }
}
