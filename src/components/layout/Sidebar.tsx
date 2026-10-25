import React, { useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { NavGroupConfig } from '@/config/navigation';
import { BrandWordmark } from '@/components/ui/BrandWordmark';
import { UserRole } from '@/types';
import { api } from '@/lib/api';
import {
  House,
  GraduationCap,
  Clock,
  MessageSquare,
  Compass,
  Heart,
  Bookmark,
  Map,
  CircleHelp,
  Settings,
  Users,
  BookOpen,
  Sparkles,
  Database,
  Inbox,
  ShieldAlert,
  ShieldCheck,
  FileText,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  SlidersHorizontal,
  Bell,
  ArrowRight,
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

// Semantic Lucide outline icon mapping matching DESIGN_SYSTEM_V2
const ICON_MAP: Record<string, React.ComponentType<any>> = {
  House,
  LayoutDashboard: House, // Map Today/Home/Overview to House
  GraduationCap,
  FileCheck2: FileText,   // Semantic file-text mapping
  Clock,
  MessageSquare,
  Compass,
  Award: Heart,           // Semantic heart mapping for scholarships
  Heart,
  Bookmark,
  Map,
  HelpCircle: CircleHelp, // Semantic circle-help
  CircleHelp,
  Settings,
  Users,
  BookOpen,
  Sparkles,
  Database,
  Inbox,
  ShieldAlert,
  ShieldCheck,
  FileText,
  Building2: GraduationCap,
  SlidersHorizontal,
  Bell,
  ArrowRight,
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
          backgroundColor: 'var(--surface-panel)',
          color: 'var(--color-foreground)',
          borderRight: '1px solid var(--border-subtle)',
          fontFamily: 'var(--font-family-base)',
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
                borderRadius: 'var(--radius-control)',
                backgroundColor: 'var(--action-primary)',
                color: 'var(--color-on-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '1rem',
              }}
              title="unilistics"
            >
              u
            </div>
          ) : (
            <div>
              <BrandWordmark size="sm" showTagline={false} />
              <div
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 600,
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
                padding: '0.5rem',
                borderRadius: 'var(--radius-pill)',
                color: 'var(--color-foreground-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '44px',
                minWidth: '44px',
              }}
            >
              <X size={20} strokeWidth={2} />
            </button>
          ) : (
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              style={{
                padding: '0.5rem',
                borderRadius: 'var(--radius-pill)',
                color: 'var(--color-foreground-muted)',
                backgroundColor: 'var(--surface-card)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--border-subtle)',
                cursor: 'pointer',
                minHeight: '36px',
                minWidth: '36px',
              }}
            >
              {collapsed ? <ChevronRight size={16} strokeWidth={2} /> : <ChevronLeft size={16} strokeWidth={2} />}
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
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--color-foreground-muted)',
                    padding: '0 0.75rem 0.5rem',
                  }}
                >
                  {group.label}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {group.items.map((item) => {
                  const Icon = ICON_MAP[item.iconName] || House;
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
                        padding: isCollapsed ? '0.625rem 0' : '0.625rem 0.875rem',
                        minHeight: 'var(--touch-target-min, 44px)',
                        borderRadius: 'var(--radius-control, 16px)',
                        fontSize: '0.875rem',
                        fontWeight: isActive ? 700 : 500,
                        textDecoration: 'none',
                        color: isActive ? '#19261F' : 'var(--color-foreground)',
                        backgroundColor: isActive ? 'var(--brand-citron, #D7EE83)' : 'transparent',
                        border: '1px solid',
                        borderColor: isActive ? 'rgba(0, 0, 0, 0.08)' : 'transparent',
                        boxShadow: isActive ? '0 1px 3px rgba(0, 0, 0, 0.06)' : 'none',
                        transition: 'all var(--transition-fast)',
                      })}
                    >
                      {({ isActive }) => (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                            <Icon size={20} strokeWidth={isActive ? 2.25 : 1.75} aria-hidden={true} />
                            {!isCollapsed && <span>{item.label}</span>}
                          </div>

                          {!isCollapsed && badgeCount !== undefined && badgeCount > 0 && (
                            <span
                              style={{
                                fontSize: '0.6875rem',
                                fontWeight: 700,
                                padding: '0.125rem 0.5rem',
                                borderRadius: 'var(--radius-pill)',
                                backgroundColor: isActive ? '#19261F' : 'var(--action-primary)',
                                color: isActive ? '#D7EE83' : 'var(--color-on-primary)',
                              }}
                            >
                              {badgeCount}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Optional Supportive Panel (Desktop Reference: "Big plans. Small steps.") */}
        {!isCollapsed && currentRole === 'managed_student' && (
          <div
            style={{
              padding: '0 0.75rem 0.875rem',
            }}
          >
            <div
              style={{
                padding: '0.875rem 1rem',
                borderRadius: 'var(--radius-control, 16px)',
                backgroundColor: 'var(--surface-recessed, #EDF2E9)',
                border: '1px solid var(--border-subtle, #E1E8DE)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--action-primary, #245B42)' }}>
                <GraduationCap size={16} strokeWidth={2.25} aria-hidden={true} />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
                  Big plans. Small steps.
                </span>
              </div>
              <p style={{ fontSize: '0.6875rem', color: 'var(--color-foreground-muted, #58695E)', margin: 0, lineHeight: 1.4 }}>
                Keep your documents and deadlines verified for European admissions.
              </p>
            </div>
          </div>
        )}

        {/* Bottom User Account & Sign Out */}
        <div
          style={{
            padding: isCollapsed ? '0.75rem 0.375rem' : '0.875rem 1rem',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--surface-panel)',
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
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-control)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-foreground-muted)',
                cursor: 'pointer',
              }}
            >
              <LogOut size={18} strokeWidth={2} />
            </button>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', overflow: 'hidden' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-control, 16px)',
                    backgroundColor: 'var(--action-primary)',
                    color: 'var(--color-on-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
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
                      color: 'var(--color-foreground)',
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
                      color: 'var(--color-foreground-muted)',
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
                  color: 'var(--color-foreground-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-pill)',
                  transition: 'color var(--transition-fast)',
                  cursor: 'pointer',
                  minHeight: '44px',
                  minWidth: '44px',
                  flexShrink: 0,
                }}
              >
                <LogOut size={18} strokeWidth={2} />
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside
        className="hidden md:block"
        style={{
          width: collapsed ? '68px' : '216px',
          minWidth: collapsed ? '68px' : '216px',
          height: '100vh',
          position: 'sticky',
          top: 0,
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
              backgroundColor: 'rgba(13, 21, 17, 0.72)',
              backdropFilter: 'blur(4px)',
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
              backgroundColor: 'var(--surface-panel)',
              boxShadow: 'var(--shadow-floating)',
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

export default Sidebar;
