import React, { useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { NavGroupConfig } from '@/config/navigation';
import { BrandWordmark } from '@/components/ui/BrandWordmark';
import { UserRole } from '@/types';
import { api } from '@/lib/api';
import {
  LayoutDashboard,
  GraduationCap,
  FileCheck2,
  Clock,
  MessageSquare,
  Compass,
  Award,
  Bookmark,
  HelpCircle,
  Settings,
  Users,
  BookOpen,
  Sparkles,
  Database,
  Inbox,
  ShieldAlert,
  FileText,
  Building2,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

interface SidebarProps {
  groups: NavGroupConfig[];
  workspaceTitle: string;
  currentRole: UserRole;
  userName?: string;
  userEmail?: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  badges?: Record<string, number>;
  onRoleChange: (role: UserRole) => void;
}

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  LayoutDashboard,
  GraduationCap,
  FileCheck2,
  Clock,
  MessageSquare,
  Compass,
  Award,
  Bookmark,
  HelpCircle,
  Settings,
  Users,
  BookOpen,
  Sparkles,
  Database,
  Inbox,
  ShieldAlert,
  FileText,
  Building2,
};

export const Sidebar: React.FC<SidebarProps> = ({
  groups,
  workspaceTitle,
  currentRole,
  userName,
  userEmail,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  badges = {},
  onRoleChange,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close mobile drawer on route change
  useEffect(() => {
    onCloseMobile();
  }, [location.pathname, onCloseMobile]);

  // Handle Escape key and focus trap for mobile drawer
  useEffect(() => {
    if (!mobileOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseMobile();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen, onCloseMobile]);

  const handleSignOut = async () => {
    await api.auth.signOut();
    onRoleChange('visitor');
    navigate('/universities');
  };

  const displayName = userName || userEmail?.split('@')[0] || 'Account';
  const initial = displayName.charAt(0).toUpperCase();

  const sidebarContent = (isMobile = false) => {
    const isCollapsed = !isMobile && collapsed;

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          backgroundColor: '#ffffff',
          color: 'var(--text-body)',
        }}
      >
        {/* Top Header / Branding */}
        <div
          style={{
            padding: isCollapsed ? '1rem 0.5rem' : '1.25rem 1.25rem 1rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
            gap: '0.5rem',
            minHeight: '64px',
          }}
        >
          {isCollapsed ? (
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'var(--action-primary)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1rem',
              }}
              title="Unilistics"
            >
              U
            </div>
          ) : (
            <div>
              <BrandWordmark size="sm" showTagline={false} />
              <div
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--action-primary)',
                  marginTop: '0.25rem',
                }}
              >
                {workspaceTitle}
              </div>
            </div>
          )}

          {isMobile ? (
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Close navigation menu"
              style={{
                padding: '0.375rem',
                borderRadius: 'var(--radius-pill)',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={20} />
            </button>
          ) : (
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              style={{
                padding: '0.375rem',
                borderRadius: 'var(--radius-full)',
                color: 'var(--text-muted)',
                backgroundColor: 'var(--surface-recessed)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--border-subtle)',
                cursor: 'pointer',
              }}
            >
              {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          )}
        </div>

        {/* Grouped Navigation Links */}
        <nav
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: isCollapsed ? '1rem 0.375rem' : '1.25rem 0.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
          aria-label={`${workspaceTitle} navigation`}
        >
          {groups.map((group) => (
            <div key={group.id}>
              {!isCollapsed && (
                <div
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--text-muted)',
                    padding: '0 0.625rem 0.5rem',
                  }}
                >
                  {group.label}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                {group.items.map((item) => {
                  const Icon = ICON_MAP[item.iconName] || LayoutDashboard;
                  const badgeCount = item.badgeKey ? badges[item.badgeKey] : undefined;

                  return (
                    <NavLink
                      key={item.id}
                      to={item.path}
                      end={item.end}
                      title={isCollapsed ? item.label : undefined}
                      style={({ isActive }) => ({
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: isCollapsed ? 'center' : 'space-between',
                        gap: '0.625rem',
                        padding: isCollapsed ? '0.625rem 0' : '0.55rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.875rem',
                        fontWeight: isActive ? 600 : 500,
                        textDecoration: 'none',
                        color: isActive ? 'var(--action-primary)' : 'var(--text-charcoal)',
                        backgroundColor: isActive ? 'var(--accent-peach-bg)' : 'transparent',
                        borderLeft: isActive && !isCollapsed ? '3px solid var(--action-primary)' : '3px solid transparent',
                        transition: 'all var(--transition-fast)',
                      })}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <Icon size={18} aria-hidden={true} />
                        {!isCollapsed && <span>{item.label}</span>}
                      </div>

                      {!isCollapsed && badgeCount !== undefined && badgeCount > 0 && (
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            padding: '0.125rem 0.45rem',
                            borderRadius: 'var(--radius-pill)',
                            backgroundColor: 'var(--action-primary)',
                            color: '#ffffff',
                          }}
                        >
                          {badgeCount}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom User Account & Sign Out */}
        <div
          style={{
            padding: isCollapsed ? '0.75rem 0.375rem' : '0.875rem 1rem',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--surface-recessed)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
            gap: '0.5rem',
          }}
        >
          {isCollapsed ? (
            <button
              type="button"
              onClick={handleSignOut}
              title={`Sign out (${displayName})`}
              aria-label={`Sign out of account (${displayName})`}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              <LogOut size={16} />
            </button>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', overflow: 'hidden' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--action-primary)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                  aria-hidden="true"
                >
                  {initial}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <span
                    style={{
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: 'var(--text-charcoal)',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {displayName}
                  </span>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      color: 'var(--text-muted)',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {currentRole.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                title="Sign out of account"
                aria-label="Sign out"
                style={{
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.375rem',
                  borderRadius: 'var(--radius-full)',
                  transition: 'color var(--transition-fast)',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <LogOut size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop Sticky Sidebar (248-264px, or ~72px collapsed) */}
      <aside
        className="hidden md:block"
        style={{
          width: collapsed ? '72px' : '256px',
          minWidth: collapsed ? '72px' : '256px',
          height: '100vh',
          position: 'sticky',
          top: 0,
          borderRight: '1px solid var(--border-subtle)',
          backgroundColor: '#ffffff',
          zIndex: 40,
          transition: 'width 200ms ease, min-width 200ms ease',
        }}
        aria-label={`${workspaceTitle} sidebar`}
      >
        {sidebarContent(false)}
      </aside>

      {/* Mobile Drawer Backdrop & Modal Drawer */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
          }}
          className="md:hidden"
        >
          {/* Backdrop */}
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(26, 28, 30, 0.4)',
              backdropFilter: 'blur(2px)',
            }}
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Drawer content */}
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label={`${workspaceTitle} navigation`}
            style={{
              position: 'relative',
              width: '280px',
              maxWidth: '85vw',
              height: '100%',
              backgroundColor: '#ffffff',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
              zIndex: 101,
            }}
          >
            {sidebarContent(true)}
          </div>
        </div>
      )}
    </>
  );
};
