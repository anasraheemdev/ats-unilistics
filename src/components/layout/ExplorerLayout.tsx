import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { PublicNavbar } from './PublicNavbar';
import { PublicFooter } from './PublicFooter';
import { StudentLayout } from './StudentLayout';
import { CounsellorLayout } from './CounsellorLayout';
import { AdminLayout } from './AdminLayout';
import { SkipLink } from '@/components/ui/SkipLink';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { UserRole } from '@/types';

interface ExplorerLayoutProps {
  currentRole: UserRole;
  onRoleChange: (newRole: UserRole) => void;
}

/**
 * Unified Layout for university discovery, degree programs, scholarships, and catalogue search.
 * Role-aware shell resolution:
 * - Approved Managed Students: always retain their authorized StudentLayout workspace shell consistently,
 *   including direct visits to /universities, /programs, /scholarships, /saved, and /help.
 * - Staff (Counsellor, Admin, Super Admin): always retain their authorized workspace shell.
 * - Guests (Visitors) and Verified Explorers: retain top navigation with the consolidated pill-style PublicNavbar and PublicFooter.
 */
export const ExplorerLayout: React.FC<ExplorerLayoutProps> = ({ currentRole, onRoleChange }) => {
  useEffect(() => {
    if (
      currentRole !== 'managed_student' &&
      currentRole !== 'counsellor' &&
      currentRole !== 'admin' &&
      currentRole !== 'super_admin'
    ) {
      document.body.style.overflow = '';
    }
  }, [currentRole]);

  // 1. Approved Managed Student: retain authorized workspace sidebar shell consistently
  if (currentRole === 'managed_student') {
    return <StudentLayout currentRole={currentRole} onRoleChange={onRoleChange} />;
  }

  // 2. Staff Roles: retain authorized workspace shell
  if (currentRole === 'counsellor') {
    return <CounsellorLayout currentRole={currentRole} onRoleChange={onRoleChange} />;
  }
  if (currentRole === 'admin' || currentRole === 'super_admin') {
    return <AdminLayout currentRole={currentRole} onRoleChange={onRoleChange} />;
  }

  // 3. Guests (visitors) and Verified Explorers: top navigation shell
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: 'var(--surface-canvas, #F6F8F5)',
        color: 'var(--color-foreground, #19261F)',
        fontFamily: 'var(--font-family-base, "DM Sans", sans-serif)',
      }}
    >
      <SkipLink targetId="main-content" />
      <PublicNavbar currentRole={currentRole} onRoleChange={onRoleChange} />

      <main
        id="main-content"
        tabIndex={-1}
        style={{
          flex: 1,
          outline: 'none',
          paddingTop: '5rem', // 72px navbar offset + breathing room
        }}
      >
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>

      <PublicFooter />
    </div>
  );
};

export default ExplorerLayout;
