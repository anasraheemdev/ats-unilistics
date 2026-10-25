import React from 'react';
import { Outlet } from 'react-router-dom';
import { PublicNavbar } from './PublicNavbar';
import { PublicFooter } from './PublicFooter';
import { SkipLink } from '@/components/ui/SkipLink';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { UserRole } from '@/types';

interface PublicLayoutProps {
  currentRole: UserRole;
  onRoleChange: (newRole: UserRole) => void;
}

/**
 * Public Layout for genuine unauthenticated / marketing / legal pages.
 * Strictly enforces: Public floating navbar + Outlet + Public footer.
 * NO sidebar menu on public pages!
 */
export const PublicLayout: React.FC<PublicLayoutProps> = ({ currentRole, onRoleChange }) => {
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
          paddingTop: '5rem', // Offsets 80px (h-20) fixed top navbar cleanly
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
