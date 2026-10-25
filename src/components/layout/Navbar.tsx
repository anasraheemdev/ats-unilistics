import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { BrandWordmark } from '@/components/ui/BrandWordmark';
import { UserRole } from '@/types';
import { api } from '@/lib/api';
import { NotificationDrawer } from '@/components/domain/NotificationDrawer';
import {
  House,
  Compass,
  FileText,
  GraduationCap,
  MessageSquare,
  Bookmark,
  Sparkles,
  CircleHelp,
  Users,
  Inbox,
  Database,
  Settings,
  LogOut,
  User,
  Menu,
  X,
} from 'lucide-react';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (newRole: UserRole) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRole, onRoleChange }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    api.auth.getCurrentUser().then((u) => {
      if (u) {
        setUserName(u.fullName || u.email || 'Applicant');
      }
    });
  }, [currentRole]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    await api.auth.signOut();
    onRoleChange('visitor');
    navigate('/');
  };

  // Role-specific navigation pills
  const renderNavLinks = (isMobile = false) => {
    const linkBaseStyle = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.4rem',
      padding: isMobile ? '0.75rem 1rem' : '0.45rem 0.875rem',
      fontSize: isMobile ? '0.9375rem' : '0.8125rem',
      fontWeight: 600,
      textDecoration: 'none',
      borderRadius: 'var(--radius-pill)',
      transition: 'all var(--transition-fast)',
      whiteSpace: 'nowrap' as const,
      minHeight: isMobile ? '44px' : '36px',
    };

    if (currentRole === 'visitor') {
      return (
        <>
          <NavLink
            to="/"
            end
            style={({ isActive }) => ({
              ...linkBaseStyle,
              color: isActive ? 'var(--color-primary-foreground, #ffffff)' : 'var(--color-foreground)',
              backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
            })}
          >
            <Compass size={16} strokeWidth={2} aria-hidden="true" />
            <span>Directory Preview</span>
          </NavLink>
          <NavLink
            to="/help"
            style={({ isActive }) => ({
              ...linkBaseStyle,
              color: isActive ? 'var(--color-primary-foreground, #ffffff)' : 'var(--color-foreground)',
              backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
            })}
          >
            <CircleHelp size={16} strokeWidth={2} aria-hidden="true" />
            <span>Help Centre</span>
          </NavLink>
          <NavLink
            to="/request-access"
            style={({ isActive }) => ({
              ...linkBaseStyle,
              color: isActive ? 'var(--color-primary-foreground, #ffffff)' : 'var(--color-primary)',
              backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-primary-light)',
              border: '1px solid var(--color-border)',
            })}
          >
            <Sparkles size={16} strokeWidth={2} aria-hidden="true" />
            <span>Request Access</span>
          </NavLink>
        </>
      );
    }

    if (currentRole === 'explorer') {
      return (
        <>
          <NavLink
            to="/explorer"
            end
            style={({ isActive }) => ({
              ...linkBaseStyle,
              color: isActive ? 'var(--color-primary-foreground, #ffffff)' : 'var(--color-foreground)',
              backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
            })}
          >
            <Compass size={16} strokeWidth={2} aria-hidden="true" />
            <span>Full Catalogue</span>
          </NavLink>
          <NavLink
            to="/explorer/saved"
            style={({ isActive }) => ({
              ...linkBaseStyle,
              color: isActive ? 'var(--color-primary-foreground, #ffffff)' : 'var(--color-foreground)',
              backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
            })}
          >
            <Bookmark size={16} strokeWidth={2} aria-hidden="true" />
            <span>Saved Programs</span>
          </NavLink>
          <NavLink
            to="/explorer/request-support"
            style={({ isActive }) => ({
              ...linkBaseStyle,
              color: isActive ? 'var(--color-primary-foreground, #ffffff)' : 'var(--color-primary)',
              backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-primary-light)',
              border: '1px solid var(--color-border)',
            })}
          >
            <Sparkles size={16} strokeWidth={2} aria-hidden="true" />
            <span>Upgrade to Managed</span>
          </NavLink>
          <NavLink
            to="/help"
            style={({ isActive }) => ({
              ...linkBaseStyle,
              color: isActive ? 'var(--color-primary-foreground, #ffffff)' : 'var(--color-foreground)',
              backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
            })}
          >
            <CircleHelp size={16} strokeWidth={2} aria-hidden="true" />
            <span>Help</span>
          </NavLink>
        </>
      );
    }

    if (currentRole === 'managed_student') {
      return (
        <>
          <NavLink
            to="/student"
            end
            style={({ isActive }) => ({
              ...linkBaseStyle,
              color: isActive ? 'var(--color-primary-foreground, #ffffff)' : 'var(--color-foreground)',
              backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
            })}
          >
            <House size={16} strokeWidth={2} aria-hidden="true" />
            <span>Overview</span>
          </NavLink>
          <NavLink
            to="/student/applications"
            style={({ isActive }) => ({
              ...linkBaseStyle,
              color: isActive ? 'var(--color-primary-foreground, #ffffff)' : 'var(--color-foreground)',
              backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
            })}
          >
            <GraduationCap size={16} strokeWidth={2} aria-hidden="true" />
            <span>Applications</span>
          </NavLink>
          <NavLink
            to="/student/documents"
            style={({ isActive }) => ({
              ...linkBaseStyle,
              color: isActive ? 'var(--color-primary-foreground, #ffffff)' : 'var(--color-foreground)',
              backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
            })}
          >
            <FileText size={16} strokeWidth={2} aria-hidden="true" />
            <span>Documents</span>
          </NavLink>
          <NavLink
            to="/student/messages"
            style={({ isActive }) => ({
              ...linkBaseStyle,
              color: isActive ? 'var(--color-primary-foreground, #ffffff)' : 'var(--color-foreground)',
              backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
            })}
          >
            <MessageSquare size={16} strokeWidth={2} aria-hidden="true" />
            <span>Messages</span>
          </NavLink>
          <NavLink
            to="/student/explore"
            style={({ isActive }) => ({
              ...linkBaseStyle,
              color: isActive ? 'var(--color-primary-foreground, #ffffff)' : 'var(--color-foreground)',
              backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
            })}
          >
            <Compass size={16} strokeWidth={2} aria-hidden="true" />
            <span>Explore</span>
          </NavLink>
        </>
      );
    }

    // Staff (Counsellor / Admin)
    return (
      <>
        <NavLink
          to="/staff"
          end
          style={({ isActive }) => ({
            ...linkBaseStyle,
            color: isActive ? 'var(--color-primary-foreground, #ffffff)' : 'var(--color-foreground)',
            backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
          })}
        >
          <House size={16} strokeWidth={2} aria-hidden="true" />
          <span>Hub</span>
        </NavLink>
        <NavLink
          to="/staff/cases"
          style={({ isActive }) => ({
            ...linkBaseStyle,
            color: isActive ? 'var(--color-primary-foreground, #ffffff)' : 'var(--color-foreground)',
            backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
          })}
        >
          <Users size={16} strokeWidth={2} aria-hidden="true" />
          <span>Cases</span>
        </NavLink>
        <NavLink
          to="/staff/review-queue"
          style={({ isActive }) => ({
            ...linkBaseStyle,
            color: isActive ? 'var(--color-primary-foreground, #ffffff)' : 'var(--color-foreground)',
            backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
          })}
        >
          <Inbox size={16} strokeWidth={2} aria-hidden="true" />
          <span>Review Queue</span>
        </NavLink>
        <NavLink
          to="/staff/catalogue"
          style={({ isActive }) => ({
            ...linkBaseStyle,
            color: isActive ? 'var(--color-primary-foreground, #ffffff)' : 'var(--color-foreground)',
            backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
          })}
        >
          <Database size={16} strokeWidth={2} aria-hidden="true" />
          <span>Catalogue</span>
        </NavLink>
        <NavLink
          to="/staff/settings"
          style={({ isActive }) => ({
            ...linkBaseStyle,
            color: isActive ? 'var(--color-primary-foreground, #ffffff)' : 'var(--color-foreground)',
            backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
          })}
        >
          <Settings size={16} strokeWidth={2} aria-hidden="true" />
          <span>Settings</span>
        </NavLink>
      </>
    );
  };

  // Mobile Bottom Navigation Bar Links (at most 5 destinations)
  const renderMobileBottomNav = () => {
    if (currentRole === 'visitor') {
      return (
        <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
          <NavLink to="/" end className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
            <Compass size={20} strokeWidth={2} aria-hidden="true" />
            <span>Discover</span>
          </NavLink>
          <NavLink to="/request-access" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
            <Sparkles size={20} strokeWidth={2} aria-hidden="true" />
            <span>Apply</span>
          </NavLink>
          <NavLink to="/help" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
            <CircleHelp size={20} strokeWidth={2} aria-hidden="true" />
            <span>Help</span>
          </NavLink>
          <NavLink to="/sign-in" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
            <User size={20} strokeWidth={2} aria-hidden="true" />
            <span>Sign In</span>
          </NavLink>
        </nav>
      );
    }

    if (currentRole === 'explorer') {
      return (
        <nav className="mobile-bottom-nav" aria-label="Mobile Explorer Navigation">
          <NavLink to="/explorer" end className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
            <Compass size={20} strokeWidth={2} aria-hidden="true" />
            <span>Catalogue</span>
          </NavLink>
          <NavLink to="/explorer/saved" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
            <Bookmark size={20} strokeWidth={2} aria-hidden="true" />
            <span>Saved</span>
          </NavLink>
          <NavLink to="/explorer/request-support" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
            <Sparkles size={20} strokeWidth={2} aria-hidden="true" />
            <span>Upgrade</span>
          </NavLink>
          <NavLink to="/help" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
            <CircleHelp size={20} strokeWidth={2} aria-hidden="true" />
            <span>Help</span>
          </NavLink>
          <NavLink to="/explorer/account" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
            <User size={20} strokeWidth={2} aria-hidden="true" />
            <span>Account</span>
          </NavLink>
        </nav>
      );
    }

    if (currentRole === 'managed_student') {
      return (
        <nav className="mobile-bottom-nav" aria-label="Mobile Student Navigation">
          <NavLink to="/student" end className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
            <House size={20} strokeWidth={2} aria-hidden="true" />
            <span>Overview</span>
          </NavLink>
          <NavLink to="/student/applications" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
            <GraduationCap size={20} strokeWidth={2} aria-hidden="true" />
            <span>Applications</span>
          </NavLink>
          <NavLink to="/student/documents" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
            <FileText size={20} strokeWidth={2} aria-hidden="true" />
            <span>Vault</span>
          </NavLink>
          <NavLink to="/student/messages" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
            <MessageSquare size={20} strokeWidth={2} aria-hidden="true" />
            <span>Adviser</span>
          </NavLink>
          <NavLink to="/student/explore" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
            <Compass size={20} strokeWidth={2} aria-hidden="true" />
            <span>Explore</span>
          </NavLink>
        </nav>
      );
    }

    // Staff
    return (
      <nav className="mobile-bottom-nav" aria-label="Mobile Staff Navigation">
        <NavLink to="/staff" end className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
          <House size={20} strokeWidth={2} aria-hidden="true" />
          <span>Hub</span>
        </NavLink>
        <NavLink to="/staff/cases" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
          <Users size={20} strokeWidth={2} aria-hidden="true" />
          <span>Cases</span>
        </NavLink>
        <NavLink to="/staff/review-queue" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
          <Inbox size={20} strokeWidth={2} aria-hidden="true" />
          <span>Queues</span>
        </NavLink>
        <NavLink to="/staff/catalogue" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
          <Database size={20} strokeWidth={2} aria-hidden="true" />
          <span>Catalogue</span>
        </NavLink>
        <NavLink to="/staff/settings" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
          <Settings size={20} strokeWidth={2} aria-hidden="true" />
          <span>Settings</span>
        </NavLink>
      </nav>
    );
  };

  return (
    <>
      {/* Floating Header */}
      <div style={{ padding: '0.75rem 1rem 0', width: '100%', display: 'flex', justifyContent: 'center' }}>
        <header className="floating-navbar" role="banner">
          {/* Logo Brand */}
          <div style={{ flexShrink: 0 }}>
            <BrandWordmark size="sm" showTagline={false} />
          </div>

          {/* Desktop Navigation Pills */}
          <nav
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: 'var(--surface-recessed)',
              padding: '0.25rem 0.375rem',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--border-subtle)',
            }}
            className="md:flex"
            aria-label="Main Navigation"
          >
            {renderNavLinks()}
          </nav>

          {/* Right Action Icons & User Account */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            {/* In-App Notifications Drawer */}
            {currentRole !== 'visitor' && <NotificationDrawer />}

            {/* Desktop User Avatar & Name */}
            {currentRole !== 'visitor' ? (
              <div
                style={{
                  display: 'none',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.25rem 0.625rem 0.25rem 0.25rem',
                  backgroundColor: 'var(--color-surface-hover)',
                  borderRadius: 'var(--radius-pill)',
                  border: '1px solid var(--color-border)',
                  minHeight: '44px',
                }}
                className="md:flex"
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--color-primary)',
                    color: 'var(--color-on-primary, #ffffff)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                  title={userName}
                  aria-hidden="true"
                >
                  {userName ? userName.charAt(0).toUpperCase() : 'U'}
                </div>
                <span
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: 'var(--color-foreground)',
                    maxWidth: '120px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {userName.split(' ')[0]}
                </span>
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
                    padding: '0.25rem',
                    marginLeft: '0.25rem',
                    borderRadius: 'var(--radius-full)',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    minWidth: '32px',
                    minHeight: '32px',
                  }}
                >
                  <LogOut size={16} strokeWidth={2} />
                </button>
              </div>
            ) : (
              <NavLink
                to="/sign-in"
                className="btn-pill btn-pill-primary"
                style={{
                  fontSize: '0.8125rem',
                  padding: '0.5rem 1.25rem',
                  minHeight: '44px',
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                Sign In
              </NavLink>
            )}

            {/* Mobile Hamburger Drawer Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-drawer"
              aria-label={mobileMenuOpen ? 'Close navigation drawer' : 'Open navigation drawer'}
              className="md:hidden"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '44px',
                height: '44px',
                minWidth: '44px',
                minHeight: '44px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-surface-hover)',
                color: 'var(--color-foreground)',
                border: '1px solid var(--color-border)',
                cursor: 'pointer',
              }}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </header>
      </div>

      {/* Mobile Off-Canvas / Dropdown Menu */}
      {mobileMenuOpen && (
        <div
          id="mobile-drawer"
          style={{
            margin: '0.5rem 1rem',
            padding: '1.25rem',
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-panel)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-floating)',
            zIndex: 95,
          }}
        >
          {currentRole !== 'visitor' && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '0.75rem',
                marginBottom: '0.75rem',
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--color-primary)',
                    color: 'var(--color-on-primary, #ffffff)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                  }}
                >
                  {userName ? userName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-foreground)' }}>
                    {userName}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--color-foreground-muted)', textTransform: 'capitalize' }}>
                    {currentRole.replace('_', ' ')}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="btn-pill btn-pill-outline"
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', minHeight: '36px' }}
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          )}

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }} aria-label="Mobile Menu Links">
            {renderNavLinks(true)}
          </nav>
        </div>
      )}

      {/* Fixed Bottom Navigation for Mobile Devices */}
      {renderMobileBottomNav()}
    </>
  );
};
