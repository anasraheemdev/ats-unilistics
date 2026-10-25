import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { SkipLink } from '@/components/ui/SkipLink';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { UserRole } from '@/types';

interface StaffLayoutProps {
  currentRole: UserRole;
  onRoleChange: (newRole: UserRole) => void;
}

export const StaffLayout: React.FC<StaffLayoutProps> = ({ currentRole, onRoleChange }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--surface-canvas)' }}>
      <SkipLink targetId="main-content" />
      <Navbar currentRole={currentRole} onRoleChange={onRoleChange} />

      <main
        id="main-content"
        tabIndex={-1}
        className="page-bottom-padding-for-mobile-nav"
        style={{
          flex: 1,
          paddingTop: '1.5rem',
          paddingBottom: '3.5rem',
          outline: 'none',
        }}
      >
        <div className="container">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
};
