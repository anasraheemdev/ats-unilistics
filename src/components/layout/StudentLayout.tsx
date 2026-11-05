import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { StudentBottomDock } from './StudentBottomDock';
import { SkipLink } from '@/components/ui/SkipLink';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { STUDENT_NAV_GROUPS } from '@/config/navigation';
import { UserRole } from '@/types';
import { api } from '@/lib/api';

interface StudentLayoutProps {
  currentRole: UserRole;
  onRoleChange: (newRole: UserRole) => void;
}

export const StudentLayout: React.FC<StudentLayoutProps> = ({ currentRole, onRoleChange }) => {
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

  // Disable body scrolling only inside managed shell on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      document.body.style.overflow = '';
    };
  }, []);

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

  const sidebarWidth = collapsed ? '76px' : '256px';

  return (
    <div
      className="workspace-shell"
      style={
        {
          '--workspace-sidebar-width': sidebarWidth,
        } as React.CSSProperties
      }
    >
      <SkipLink targetId="main-content" />

      {/* Persistent Desktop Sidebar */}
      <Sidebar
        groups={STUDENT_NAV_GROUPS}
        workspaceTitle="Student Workspace"
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
      <div className="workspace-main-column">
        <Topbar
          currentRole={currentRole}
          userName={userName}
          userEmail={userEmail}
          onOpenMobileNav={() => setMobileOpen(true)}
          onRoleChange={onRoleChange}
        />

        <main
          id="main-content"
          tabIndex={-1}
          style={{ outline: 'none' }}
          className="workspace-main-content"
        >
          <div style={{ maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Dock exclusively for Managed Students */}
      <StudentBottomDock />
    </div>
  );
};

export default StudentLayout;
