import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { SkipLink } from '@/components/ui/SkipLink';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { ADMIN_NAV_GROUPS } from '@/config/navigation';
import { UserRole } from '@/types';
import { api } from '@/lib/api';

interface AdminLayoutProps {
  currentRole: UserRole;
  onRoleChange: (newRole: UserRole) => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ currentRole, onRoleChange }) => {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('unilistics_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    api.auth.getCurrentUser().then((u) => {
      if (u) {
        setUserName(u.fullName || '');
        setUserEmail(u.email || '');
      }
    });
  }, [currentRole]);

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('unilistics_sidebar_collapsed', String(next));
      } catch {
        // Ignore storage issues
      }
      return next;
    });
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--surface-canvas)' }}>
      <SkipLink targetId="main-content" />

      {/* Persistent Desktop Sidebar */}
      <Sidebar
        groups={ADMIN_NAV_GROUPS}
        workspaceTitle={currentRole === 'super_admin' ? 'Super Admin Console' : 'Admin Operations'}
        currentRole={currentRole}
        userName={userName}
        userEmail={userEmail}
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        onRoleChange={onRoleChange}
      />

      {/* Main Workspace Column */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar
          currentRole={currentRole}
          userName={userName}
          userEmail={userEmail}
          onOpenMobileNav={() => setMobileOpen(true)}
        />

        <main
          id="main-content"
          tabIndex={-1}
          style={{
            flex: 1,
            padding: '1.5rem',
            outline: 'none',
          }}
        >
          <div style={{ maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
};
