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
      { id: 'disc-help', label: 'Help Centre', path: '/help', iconName: 'HelpCircle' },
    ],
  },
];

// 2. Managed Student Navigation
export const STUDENT_NAV_GROUPS: NavGroupConfig[] = [
  {
    id: 'my-journey',
    label: 'My Journey',
    items: [
      { id: 'stu-overview', label: 'Overview', path: '/student', iconName: 'LayoutDashboard', end: true },
      { id: 'stu-apps', label: 'My Applications', path: '/student/applications', iconName: 'GraduationCap' },
      { id: 'stu-docs', label: 'Documents', path: '/student/documents', iconName: 'FileCheck2' },
      { id: 'stu-tasks', label: 'Tasks & Deadlines', path: '/student/tasks', iconName: 'Clock', badgeKey: 'tasks' },
      { id: 'stu-messages', label: 'Messages', path: '/student/messages', iconName: 'MessageSquare', badgeKey: 'messages' },
    ],
  },
  {
    id: 'explore',
    label: 'Explore',
    items: [
      { id: 'stu-explore-unis', label: 'Explore Universities', path: '/student/explore', iconName: 'Compass' },
      { id: 'stu-scholarships', label: 'Scholarships', path: '/student/scholarships', iconName: 'Award' },
      { id: 'stu-saved', label: 'Saved Items', path: '/student/saved', iconName: 'Bookmark' },
    ],
  },
  {
    id: 'account',
    label: 'Account',
    items: [
      { id: 'stu-help', label: 'Help & Support', path: '/student/help', iconName: 'HelpCircle' },
      { id: 'stu-account', label: 'Account Settings', path: '/student/account', iconName: 'Settings' },
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
