import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { NotificationDrawer } from '@/components/domain/NotificationDrawer';
import { SearchDialog } from '@/components/domain/SearchDialog';
import { UserRole } from '@/types';
import { useTheme } from '@/lib/theme';
import { Menu, ChevronRight, Search, Sun, Moon, LogOut } from 'lucide-react';
import { api } from '@/lib/api';

interface TopbarProps {
  currentRole: UserRole;
  userName?: string;
  userEmail?: string;
  onOpenMobileNav: () => void;
  breadcrumbs?: { label: string; path?: string }[];
  actions?: React.ReactNode;
  onRoleChange?: (role: UserRole) => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  currentRole,
  userName,
  userEmail,
  onOpenMobileNav,
  breadcrumbs,
  actions,
  onRoleChange,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { resolvedTheme, toggleTheme } = useTheme();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Search shortcut: Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-generate fallback breadcrumb if none supplied
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const derivedCrumbs = breadcrumbs || [
    { label: 'Portal', path: '/' },
    ...pathSegments.map((segment, idx) => ({
      label: segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' '),
      path: '/' + pathSegments.slice(0, idx + 1).join('/'),
    })),
  ];

  const displayName = userName || userEmail?.split('@')[0] || 'Account';
  const initial = displayName.charAt(0).toUpperCase();

  const handleSearchClick = () => {
    setIsSearchOpen(true);
  };

  const handleSignOut = async () => {
    await api.auth.signOut();
    if (onRoleChange) {
      onRoleChange('visitor');
    }
    navigate('/universities');
  };

  return (
    <header
      style={{
        height: '64px',
        minHeight: '64px',
        backgroundColor: 'var(--surface-card)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.25rem',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        fontFamily: 'var(--font-family-base, "DM Sans", sans-serif)',
        color: 'var(--color-foreground)',
      }}
      role="banner"
    >
      {/* Left: Mobile Menu Button (Staff only) + Breadcrumbs / Page Context */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
        {/* For staff/operational workspaces, show mobile drawer button; for managed students, mobile bottom dock is active */}
        {currentRole !== 'managed_student' && (
          <button
            type="button"
            onClick={onOpenMobileNav}
            className="md:hidden"
            aria-label="Open navigation drawer"
            style={{
              padding: '0.5rem',
              borderRadius: 'var(--radius-control, 16px)',
              color: 'var(--color-foreground)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--surface-recessed)',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer',
              minHeight: '44px',
              minWidth: '44px',
            }}
          >
            <Menu size={20} strokeWidth={2} />
          </button>
        )}

        {/* Breadcrumb Trail */}
        <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', overflow: 'hidden' }}>
          {derivedCrumbs.map((crumb, idx) => {
            const isLast = idx === derivedCrumbs.length - 1;
            return (
              <React.Fragment key={crumb.label + idx}>
                {idx > 0 && (
                  <ChevronRight
                    size={14}
                    strokeWidth={2}
                    style={{ color: 'var(--color-foreground-muted)', flexShrink: 0 }}
                    aria-hidden="true"
                  />
                )}
                {crumb.path && !isLast ? (
                  <Link
                    to={crumb.path}
                    style={{
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                      color: 'var(--color-foreground-muted)',
                      textDecoration: 'none',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span
                    style={{
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: 'var(--color-foreground)',
                      whiteSpace: 'nowrap',
                    }}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Right: Operational Search, Appearance Toggle, Notifications, User Identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexShrink: 0 }}>
        {actions}

        {/* Operational Search Pill */}
        <button
          type="button"
          onClick={handleSearchClick}
          aria-label="Search catalogue and documents (Ctrl+K)"
          title="Search catalogue and documents (Ctrl+K)"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.375rem 0.75rem',
            borderRadius: 'var(--radius-pill, 9999px)',
            backgroundColor: 'var(--surface-recessed)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--color-foreground-muted)',
            fontSize: '0.75rem',
            cursor: 'pointer',
            minHeight: '38px',
            transition: 'border-color var(--transition-fast)',
          }}
        >
          <Search size={15} strokeWidth={2} aria-hidden={true} />
          <span className="hidden sm:inline">Search</span>
          <kbd
            className="hidden sm:inline-block"
            style={{
              fontSize: '0.625rem',
              fontWeight: 700,
              padding: '0.1rem 0.35rem',
              borderRadius: '4px',
              backgroundColor: 'var(--surface-card)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--color-foreground-muted)',
            }}
          >
            ⌘K
          </kbd>
        </button>

        {/* Operational Theme / Appearance Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-pill, 9999px)',
            backgroundColor: 'var(--surface-recessed)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--color-foreground)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background-color var(--transition-fast)',
          }}
        >
          {resolvedTheme === 'dark' ? (
            <Sun size={17} strokeWidth={2} aria-hidden={true} />
          ) : (
            <Moon size={17} strokeWidth={2} aria-hidden={true} />
          )}
        </button>

        {/* Real Live Notification Drawer */}
        {currentRole !== 'visitor' && <NotificationDrawer />}

        {/* Compact User Identity Pill */}
        {currentRole !== 'visitor' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.2rem 0.625rem 0.2rem 0.3rem',
              backgroundColor: 'var(--surface-recessed)',
              borderRadius: 'var(--radius-pill, 9999px)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: 'var(--radius-pill, 9999px)',
                backgroundColor: 'var(--action-primary)',
                color: 'var(--color-on-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
              aria-hidden="true"
            >
              {initial}
            </div>
            <span
              className="hidden sm:inline"
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--color-foreground)',
                maxWidth: '120px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {displayName}
            </span>

            {/* Quick Sign Out Action */}
            <button
              type="button"
              onClick={handleSignOut}
              title="Sign out of account"
              aria-label="Sign out"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-foreground-muted)',
                cursor: 'pointer',
                padding: '0.2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
              }}
            >
              <LogOut size={14} strokeWidth={2} aria-hidden={true} />
            </button>
          </div>
        )}
      </div>

      <SearchDialog
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        currentRole={currentRole}
        userId={userName || userEmail || 'anonymous'}
      />
    </header>
  );
};

export default Topbar;
