import React from 'react';
import { Outlet } from 'react-router-dom';
import { PublicNavbar } from './PublicNavbar';
import { PublicFooter } from './PublicFooter';
import { DiscoveryLayout } from './DiscoveryLayout';
import { SkipLink } from '@/components/ui/SkipLink';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { UserRole } from '@/types';

interface ExplorerLayoutProps {
  currentRole: UserRole;
  onRoleChange: (newRole: UserRole) => void;
}

/**
 * Layout for university discovery, degree programs, scholarships, and catalogue search.
 * Strictly enforces:
 * - When visitor (signed-out): Public floating navbar, no sidebar menu.
 * - When verified explorer: Discovery layout with catalogue header, NO student or staff sidebar!
 * - When managed_student/staff: Discovery layout with authenticated session header.
 */
export const ExplorerLayout: React.FC<ExplorerLayoutProps> = ({ currentRole, onRoleChange }) => {
  // 1. Signed-out Visitor: Public Navbar + Public Footer (no sidebar)
  if (currentRole === 'visitor') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
        <SkipLink targetId="main-content" />
        <PublicNavbar currentRole={currentRole} onRoleChange={onRoleChange} />

        <main
          id="main-content"
          tabIndex={-1}
          style={{
            flex: 1,
            outline: 'none',
            paddingTop: '5rem', // Offsets 80px fixed top navbar cleanly
          }}
        >
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>

        <PublicFooter />
      </div>
    );
  }

  // 2. Verified Explorer (or other signed-in roles exploring catalogue): Discovery layout with NO student/staff sidebar!
  return <DiscoveryLayout currentRole={currentRole} onRoleChange={onRoleChange} />;
};
