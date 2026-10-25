import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NotificationDrawer } from '@/components/domain/NotificationDrawer';
import { UserRole } from '@/types';
import { Menu, ChevronRight } from 'lucide-react';

interface TopbarProps {
  currentRole: UserRole;
  userName?: string;
  userEmail?: string;
  onOpenMobileNav: () => void;
  breadcrumbs?: { label: string; path?: string }[];
  actions?: React.ReactNode;
}

export const Topbar: React.FC<TopbarProps> = ({
  currentRole,
  userName,
  userEmail,
  onOpenMobileNav,
  breadcrumbs,
  actions,
}) => {
  const location = useLocation();

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

  return (
    <header
      style={{
        height: '60px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.25rem',
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}
      role="banner"
    >
      {/* Left: Mobile Menu Button + Breadcrumbs / Page Context */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
        <button
          type="button"
          onClick={onOpenMobileNav}
          className="md:hidden"
          aria-label="Open navigation drawer"
          style={{
            padding: '0.5rem',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-charcoal)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--surface-recessed)',
            border: '1px solid var(--border-subtle)',
            cursor: 'pointer',
          }}
        >
          <Menu size={18} />
        </button>

        {/* Breadcrumb Trail */}
        <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', overflow: 'hidden' }}>
          {derivedCrumbs.map((crumb, idx) => {
            const isLast = idx === derivedCrumbs.length - 1;
            return (
              <React.Fragment key={crumb.label + idx}>
                {idx > 0 && <ChevronRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} aria-hidden="true" />}
                {crumb.path && !isLast ? (
                  <Link
                    to={crumb.path}
                    style={{
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                      color: 'var(--text-muted)',
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
                      color: 'var(--text-charcoal)',
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

      {/* Right: Actions, Notifications, User Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
        {actions}

        {currentRole !== 'visitor' && <NotificationDrawer />}

        {/* Compact User Identity Pill */}
        {currentRole !== 'visitor' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.2rem 0.6rem 0.2rem 0.25rem',
              backgroundColor: 'var(--surface-recessed)',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--action-primary)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.6875rem',
                fontWeight: 700,
              }}
              aria-hidden="true"
            >
              {initial}
            </div>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--text-charcoal)',
                maxWidth: '120px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {displayName}
            </span>
          </div>
        )}
      </div>
    </header>
  );
};
