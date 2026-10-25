import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { BrandWordmark } from '@/components/ui/BrandWordmark';
import { SkipLink } from '@/components/ui/SkipLink';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { UserRole } from '@/types';
import { api } from '@/lib/api';
import {
  GraduationCap,
  FileText,
  Heart,
  Bookmark,
  CircleHelp,
  Menu,
  X,
  LogOut,
  Mail,
  Clock,
  Sparkles,
} from 'lucide-react';
import { AccessRequest } from '@/types';
import { PublicFooter } from './PublicFooter';

interface DiscoveryLayoutProps {
  currentRole: UserRole;
  onRoleChange: (newRole: UserRole) => void;
}

export const DiscoveryLayout: React.FC<DiscoveryLayoutProps> = ({ currentRole, onRoleChange }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const navigate = useNavigate();
  const location = useLocation();

  const [activeGuidanceReq, setActiveGuidanceReq] = useState<AccessRequest | null>(null);

  useEffect(() => {
    api.auth.getCurrentUser().then((u) => {
      if (u) {
        setUserName(u.fullName || '');
        setUserEmail(u.email || '');
      }
    });

    if (currentRole === 'explorer') {
      api.requests.getMyActiveGuidanceRequest().then((req) => {
        setActiveGuidanceReq(req);
      });
    } else {
      setActiveGuidanceReq(null);
    }
  }, [currentRole, location.pathname]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    await api.auth.signOut();
    onRoleChange('visitor');
    navigate('/universities');
  };

  const displayName = userName || userEmail?.split('@')[0] || (currentRole === 'explorer' ? 'Explorer' : 'Visitor');
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: 'var(--surface-canvas)',
        color: 'var(--color-foreground)',
        fontFamily: 'var(--font-family-base)',
      }}
    >
      <SkipLink targetId="discovery-main-content" />

      {/* Top Application Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          backgroundColor: 'var(--surface-card)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)',
        }}
        role="banner"
      >
        <div
          style={{
            maxWidth: '1440px',
            margin: '0 auto',
            padding: '0 1.25rem',
            height: '68px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          {/* Logo Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="xl:hidden"
              aria-label="Open discovery navigation"
              style={{
                padding: '0.5rem',
                borderRadius: 'var(--radius-control)',
                color: 'var(--color-foreground)',
                backgroundColor: 'var(--surface-recessed)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '44px',
                minWidth: '44px',
                cursor: 'pointer',
              }}
            >
              <Menu size={20} strokeWidth={2} />
            </button>
            <BrandWordmark size="sm" showTagline={false} />
          </div>

          {/* Desktop Navigation Links */}
          <nav
            style={{ display: 'none', alignItems: 'center', gap: '0.375rem' }}
            className="hidden xl:flex"
            aria-label="Discovery Header Navigation"
          >
            <NavLink
              to="/universities"
              style={({ isActive }) => ({
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.5rem 0.875rem',
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 500,
                textDecoration: 'none',
                borderRadius: 'var(--radius-control)',
                color: isActive ? 'var(--action-primary)' : 'var(--color-foreground)',
                backgroundColor: isActive ? 'var(--surface-selected)' : 'transparent',
                border: '1px solid',
                borderColor: isActive ? 'var(--border-subtle)' : 'transparent',
                minHeight: '44px',
                transition: 'all var(--transition-fast)',
              })}
            >
              <GraduationCap size={16} strokeWidth={2} aria-hidden="true" />
              <span>Universities</span>
            </NavLink>

            <NavLink
              to="/programs"
              style={({ isActive }) => ({
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.5rem 0.875rem',
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 500,
                textDecoration: 'none',
                borderRadius: 'var(--radius-control)',
                color: isActive ? 'var(--action-primary)' : 'var(--color-foreground)',
                backgroundColor: isActive ? 'var(--surface-selected)' : 'transparent',
                border: '1px solid',
                borderColor: isActive ? 'var(--border-subtle)' : 'transparent',
                minHeight: '44px',
                transition: 'all var(--transition-fast)',
              })}
            >
              <FileText size={16} strokeWidth={2} aria-hidden="true" />
              <span>Programs</span>
            </NavLink>

            <NavLink
              to="/scholarships"
              style={({ isActive }) => ({
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.5rem 0.875rem',
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 500,
                textDecoration: 'none',
                borderRadius: 'var(--radius-control)',
                color: isActive ? 'var(--action-primary)' : 'var(--color-foreground)',
                backgroundColor: isActive ? 'var(--surface-selected)' : 'transparent',
                border: '1px solid',
                borderColor: isActive ? 'var(--border-subtle)' : 'transparent',
                minHeight: '44px',
                transition: 'all var(--transition-fast)',
              })}
            >
              <Heart size={16} strokeWidth={2} aria-hidden="true" />
              <span>Scholarships</span>
            </NavLink>

            {currentRole === 'explorer' && (
              <NavLink
                to="/saved"
                style={({ isActive }) => ({
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.5rem 0.875rem',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 500,
                  textDecoration: 'none',
                  borderRadius: 'var(--radius-control)',
                  color: isActive ? 'var(--action-primary)' : 'var(--color-foreground)',
                  backgroundColor: isActive ? 'var(--surface-selected)' : 'transparent',
                  border: '1px solid',
                  borderColor: isActive ? 'var(--border-subtle)' : 'transparent',
                  minHeight: '44px',
                  transition: 'all var(--transition-fast)',
                })}
              >
                <Bookmark size={16} strokeWidth={2} aria-hidden="true" />
                <span>Saved</span>
              </NavLink>
            )}

            <NavLink
              to="/help"
              style={({ isActive }) => ({
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.5rem 0.875rem',
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 500,
                textDecoration: 'none',
                borderRadius: 'var(--radius-control)',
                color: isActive ? 'var(--action-primary)' : 'var(--color-foreground)',
                backgroundColor: isActive ? 'var(--surface-selected)' : 'transparent',
                border: '1px solid',
                borderColor: isActive ? 'var(--border-subtle)' : 'transparent',
                minHeight: '44px',
                transition: 'all var(--transition-fast)',
              })}
            >
              <CircleHelp size={16} strokeWidth={2} aria-hidden="true" />
              <span>Help Centre</span>
            </NavLink>

            <NavLink
              to="/contact"
              style={({ isActive }) => ({
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.5rem 0.875rem',
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 500,
                textDecoration: 'none',
                borderRadius: 'var(--radius-control)',
                color: isActive ? 'var(--action-primary)' : 'var(--color-foreground)',
                backgroundColor: isActive ? 'var(--surface-selected)' : 'transparent',
                border: '1px solid',
                borderColor: isActive ? 'var(--border-subtle)' : 'transparent',
                minHeight: '44px',
                transition: 'all var(--transition-fast)',
              })}
            >
              <Mail size={16} strokeWidth={2} aria-hidden="true" />
              <span>Contact</span>
            </NavLink>

            {currentRole === 'explorer' && (
              <NavLink
                to="/request-support"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.5rem 0.875rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  borderRadius: 'var(--radius-control)',
                  color: 'var(--action-primary)',
                  backgroundColor: 'var(--surface-selected)',
                  border: '1px solid var(--border-subtle)',
                  minHeight: '44px',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <Sparkles size={16} strokeWidth={2} aria-hidden="true" />
                <span>Managed Guidance</span>
              </NavLink>
            )}
          </nav>

          {/* Right: Auth / Explorer Identity Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
            {currentRole === 'visitor' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Link
                  to="/sign-in"
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--color-foreground)',
                    textDecoration: 'none',
                    borderRadius: 'var(--radius-control)',
                    minHeight: '44px',
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}
                >
                  Sign In
                </Link>
                <Link
                  to="/sign-up"
                  style={{
                    padding: '0.5rem 1.125rem',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: 'var(--color-on-primary)',
                    backgroundColor: 'var(--action-primary)',
                    borderRadius: 'var(--radius-control)',
                    textDecoration: 'none',
                    boxShadow: 'var(--shadow-sm)',
                    minHeight: '44px',
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}
                >
                  Create Account
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.25rem 0.75rem 0.25rem 0.35rem',
                    backgroundColor: 'var(--surface-recessed)',
                    borderRadius: 'var(--radius-pill)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: 'var(--radius-pill)',
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
                      fontSize: '0.8125rem',
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
                </div>

                <button
                  type="button"
                  onClick={handleSignOut}
                  title="Sign out of account"
                  aria-label="Sign out"
                  className="hidden sm:flex"
                  style={{
                    color: 'var(--color-foreground-muted)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-pill)',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    minHeight: '44px',
                    minWidth: '44px',
                  }}
                >
                  <LogOut size={18} strokeWidth={2} />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Guidance Request Pending Review Banner (if applicable) */}
      {activeGuidanceReq &&
        (activeGuidanceReq.status === 'pending_review' || activeGuidanceReq.status === 'submitted') && (
        <aside
          role="region"
          aria-label="Guidance request status notice"
          style={{
            backgroundColor: 'var(--surface-selected)',
            borderBottom: '1px solid var(--border-subtle)',
            padding: '0.75rem 1.25rem',
            textAlign: 'center',
            fontSize: '0.875rem',
            color: 'var(--action-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
          }}
        >
          <Clock size={16} strokeWidth={2} aria-hidden="true" />
          <span>
            <strong>Guidance Request Under Review:</strong> Your request for counsellor managed casework is currently being vetted by admissions staff. Full catalogue search remains unlocked.
          </span>
          <Link
            to="/request-status"
            style={{
              marginLeft: '0.5rem',
              color: 'var(--action-primary)',
              fontWeight: 700,
              textDecoration: 'underline',
            }}
          >
            View Status →
          </Link>
        </aside>
      )}

      {/* Main Page Slot */}
      <main id="discovery-main-content" style={{ flex: 1 }}>
        <ErrorBoundary fallbackTitle="Error loading directory content">
          <Outlet />
        </ErrorBoundary>
      </main>

      {/* Footer Branding & Legal Disclosures */}
      <PublicFooter />

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            backgroundColor: 'rgba(13, 21, 17, 0.72)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        >
          <div
            style={{
              position: 'relative',
              width: '280px',
              maxWidth: '85vw',
              height: '100%',
              backgroundColor: 'var(--surface-card)',
              boxShadow: 'var(--shadow-floating)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              overflowY: 'auto',
              borderRight: '1px solid var(--border-subtle)',
            }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Discovery mobile navigation"
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: '1.25rem',
                  borderBottom: '1px solid var(--border-subtle)',
                }}
              >
                <BrandWordmark size="sm" showTagline={false} />
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    padding: '0.375rem',
                    borderRadius: 'var(--radius-pill)',
                    color: 'var(--color-foreground-muted)',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    minHeight: '44px',
                    minWidth: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  aria-label="Close navigation"
                >
                  <X size={20} strokeWidth={2} />
                </button>
              </div>

              <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', paddingTop: '1.5rem' }}>
                <NavLink
                  to="/universities"
                  style={({ isActive }) => ({
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-control)',
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    color: isActive ? 'var(--color-on-primary)' : 'var(--color-foreground)',
                    backgroundColor: isActive ? 'var(--action-primary)' : 'transparent',
                    minHeight: '44px',
                  })}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <GraduationCap size={18} strokeWidth={2} aria-hidden="true" />
                  <span>Universities</span>
                </NavLink>

                <NavLink
                  to="/programs"
                  style={({ isActive }) => ({
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-control)',
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    color: isActive ? 'var(--color-on-primary)' : 'var(--color-foreground)',
                    backgroundColor: isActive ? 'var(--action-primary)' : 'transparent',
                    minHeight: '44px',
                  })}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FileText size={18} strokeWidth={2} aria-hidden="true" />
                  <span>Programs</span>
                </NavLink>

                <NavLink
                  to="/scholarships"
                  style={({ isActive }) => ({
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-control)',
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    color: isActive ? 'var(--color-on-primary)' : 'var(--color-foreground)',
                    backgroundColor: isActive ? 'var(--action-primary)' : 'transparent',
                    minHeight: '44px',
                  })}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Heart size={18} strokeWidth={2} aria-hidden="true" />
                  <span>Scholarships</span>
                </NavLink>

                {currentRole === 'explorer' && (
                  <NavLink
                    to="/saved"
                    style={({ isActive }) => ({
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-control)',
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      color: isActive ? 'var(--color-on-primary)' : 'var(--color-foreground)',
                      backgroundColor: isActive ? 'var(--action-primary)' : 'transparent',
                      minHeight: '44px',
                    })}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Bookmark size={18} strokeWidth={2} aria-hidden="true" />
                    <span>Saved Items</span>
                  </NavLink>
                )}

                <NavLink
                  to="/help"
                  style={({ isActive }) => ({
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-control)',
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    color: isActive ? 'var(--color-on-primary)' : 'var(--color-foreground)',
                    backgroundColor: isActive ? 'var(--action-primary)' : 'transparent',
                    minHeight: '44px',
                  })}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <CircleHelp size={18} strokeWidth={2} aria-hidden="true" />
                  <span>Help Centre</span>
                </NavLink>

                <NavLink
                  to="/contact"
                  style={({ isActive }) => ({
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-control)',
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    color: isActive ? 'var(--color-on-primary)' : 'var(--color-foreground)',
                    backgroundColor: isActive ? 'var(--action-primary)' : 'transparent',
                    minHeight: '44px',
                  })}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Mail size={18} strokeWidth={2} aria-hidden="true" />
                  <span>Contact</span>
                </NavLink>
              </nav>
            </div>

            <div style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
              {currentRole === 'visitor' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <Link
                    to="/sign-in"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-control)',
                      textAlign: 'center',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'var(--color-foreground)',
                      backgroundColor: 'var(--surface-card)',
                      border: '1px solid var(--border-subtle)',
                      textDecoration: 'none',
                      minHeight: '44px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/sign-up"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-control)',
                      textAlign: 'center',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      color: 'var(--color-on-primary)',
                      backgroundColor: 'var(--action-primary)',
                      boxShadow: 'var(--shadow-sm)',
                      textDecoration: 'none',
                      minHeight: '44px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Create Free Account
                  </Link>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleSignOut}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-control)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--color-foreground-muted)',
                    backgroundColor: 'var(--surface-recessed)',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    minHeight: '44px',
                  }}
                >
                  <LogOut size={16} strokeWidth={2} />
                  <span>Sign Out</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscoveryLayout;
