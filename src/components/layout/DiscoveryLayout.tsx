import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { BrandWordmark } from '@/components/ui/BrandWordmark';
import { SkipLink } from '@/components/ui/SkipLink';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { UserRole } from '@/types';
import { api } from '@/lib/api';
import {
  Building2,
  GraduationCap,
  Award,
  Bookmark,
  HelpCircle,
  Menu,
  X,
  LogOut,
  Mail,
  Clock,
} from 'lucide-react';
import { AccessRequest } from '@/types';

interface DiscoveryLayoutProps {
  currentRole: UserRole;
  onRoleChange: (newRole: UserRole) => void;
}

export const DiscoveryLayout: React.FC<DiscoveryLayoutProps> = ({ currentRole, onRoleChange }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [userStatus, setUserStatus] = useState<string>('');
  const navigate = useNavigate();
  const location = useLocation();

  const [activeGuidanceReq, setActiveGuidanceReq] = useState<AccessRequest | null>(null);

  useEffect(() => {
    api.auth.getCurrentUser().then((u) => {
      if (u) {
        setUserName(u.fullName || '');
        setUserEmail(u.email || '');
        setUserStatus(u.status || 'active');
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

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    await api.auth.signOut();
    onRoleChange('visitor');
    navigate('/universities');
  };

  const displayName = userName || userEmail?.split('@')[0] || 'Account';
  const initial = displayName.charAt(0).toUpperCase();

  const isPendingReview =
    userStatus === 'pending_review' ||
    (activeGuidanceReq &&
      ['submitted', 'pending_review', 'email_verification_pending', 'needs_information'].includes(
        activeGuidanceReq.status
      ));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--surface-canvas)' }}>
      <SkipLink targetId="main-content" />

      {/* Account Review Notice for Pending Users */}
      {isPendingReview && (
        <aside
          role="status"
          style={{
            backgroundColor: '#FFF8E1',
            borderBottom: '1px solid #FFE082',
            padding: '0.625rem 1rem',
            textAlign: 'center',
            fontSize: '0.8125rem',
            color: '#8D6E00',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            flexWrap: 'wrap',
          }}
        >
          <Clock size={16} className="text-[#B78103]" />
          <span>
            <strong>Guidance Request Awaiting Review:</strong> Your request for managed application support is being evaluated by Unilistics admissions counsellors. Full published catalogue browsing remains active.
          </span>
          <Link to="/request-status" style={{ color: '#8D6E00', textDecoration: 'underline', fontWeight: 700 }}>
            Check status
          </Link>
        </aside>
      )}

      {/* Top Header */}
      <header
        style={{
          height: '64px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid var(--border-subtle)',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
        role="banner"
      >
        <div
          style={{
            maxWidth: '1440px',
            margin: '0 auto',
            height: '100%',
            padding: '0 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          {/* Logo & Mobile Drawer Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden"
              aria-label="Open catalogue navigation"
              style={{
                padding: '0.375rem',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-charcoal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Menu size={20} />
            </button>
            <BrandWordmark size="sm" showTagline={false} />
          </div>

          {/* Desktop Navigation Links */}
          <nav
            style={{ display: 'none', alignItems: 'center', gap: '0.5rem' }}
            className="md:flex"
            aria-label="Discovery Header Navigation"
          >
            <NavLink
              to="/universities"
              style={({ isActive }) => ({
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.4rem 0.75rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                textDecoration: 'none',
                borderRadius: 'var(--radius-sm)',
                color: isActive ? 'var(--action-primary)' : 'var(--text-charcoal)',
                backgroundColor: isActive ? 'var(--accent-peach-bg)' : 'transparent',
              })}
            >
              <Building2 size={16} aria-hidden="true" />
              <span>Universities</span>
            </NavLink>

            <NavLink
              to="/programs"
              style={({ isActive }) => ({
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.4rem 0.75rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                textDecoration: 'none',
                borderRadius: 'var(--radius-sm)',
                color: isActive ? 'var(--action-primary)' : 'var(--text-charcoal)',
                backgroundColor: isActive ? 'var(--accent-peach-bg)' : 'transparent',
              })}
            >
              <GraduationCap size={16} aria-hidden="true" />
              <span>Programs</span>
            </NavLink>

            <NavLink
              to="/scholarships"
              style={({ isActive }) => ({
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.4rem 0.75rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                textDecoration: 'none',
                borderRadius: 'var(--radius-sm)',
                color: isActive ? 'var(--action-primary)' : 'var(--text-charcoal)',
                backgroundColor: isActive ? 'var(--accent-peach-bg)' : 'transparent',
              })}
            >
              <Award size={16} aria-hidden="true" />
              <span>Scholarships</span>
            </NavLink>

            {currentRole === 'explorer' && (
              <NavLink
                to="/saved"
                style={({ isActive }) => ({
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.4rem 0.75rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  textDecoration: 'none',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive ? 'var(--action-primary)' : 'var(--text-charcoal)',
                  backgroundColor: isActive ? 'var(--accent-peach-bg)' : 'transparent',
                })}
              >
                <Bookmark size={16} aria-hidden="true" />
                <span>Saved</span>
              </NavLink>
            )}

            <NavLink
              to="/help"
              style={({ isActive }) => ({
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.4rem 0.75rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                textDecoration: 'none',
                borderRadius: 'var(--radius-sm)',
                color: isActive ? 'var(--action-primary)' : 'var(--text-charcoal)',
                backgroundColor: isActive ? 'var(--accent-peach-bg)' : 'transparent',
              })}
            >
              <HelpCircle size={16} aria-hidden="true" />
              <span>Help</span>
            </NavLink>

            <NavLink
              to="/contact"
              style={({ isActive }) => ({
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.4rem 0.75rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                textDecoration: 'none',
                borderRadius: 'var(--radius-sm)',
                color: isActive ? 'var(--action-primary)' : 'var(--text-charcoal)',
                backgroundColor: isActive ? 'var(--accent-peach-bg)' : 'transparent',
              })}
            >
              <Mail size={16} aria-hidden="true" />
              <span>Contact</span>
            </NavLink>
          </nav>

          {/* Right Action / Account */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            {currentRole === 'visitor' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Link
                  to="/request-access"
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    padding: '0.4rem 0.875rem',
                    borderRadius: 'var(--radius-pill)',
                    backgroundColor: 'var(--accent-peach-bg)',
                    color: 'var(--action-primary)',
                    border: '1px solid var(--accent-peach-border)',
                    textDecoration: 'none',
                  }}
                >
                  Request Full Access
                </Link>
                <Link
                  to="/sign-in"
                  className="btn-pill btn-pill-primary"
                  style={{
                    fontSize: '0.8125rem',
                    padding: '0.4rem 0.875rem',
                    minHeight: '34px',
                  }}
                >
                  Sign In
                </Link>
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.2rem 0.5rem 0.2rem 0.25rem',
                  backgroundColor: 'var(--surface-recessed)',
                  borderRadius: 'var(--radius-pill)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--action-primary)',
                    color: '#ffffff',
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
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--text-charcoal)',
                    maxWidth: '110px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {displayName}
                </span>
                <button
                  type="button"
                  onClick={handleSignOut}
                  title="Sign out"
                  aria-label="Sign out"
                  style={{
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.2rem',
                    borderRadius: 'var(--radius-full)',
                    cursor: 'pointer',
                  }}
                >
                  <LogOut size={15} />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main id="main-content" tabIndex={-1} style={{ flex: 1, outline: 'none' }}>
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex' }} className="md:hidden">
          <div
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(26,28,30,0.4)', backdropFilter: 'blur(2px)' }}
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Catalogue navigation"
            style={{
              position: 'relative',
              width: '280px',
              maxWidth: '85vw',
              height: '100%',
              backgroundColor: '#ffffff',
              boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
              zIndex: 101,
              display: 'flex',
              flexDirection: 'column',
              padding: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifySelf: 'space-between', marginBottom: '1.5rem' }}>
              <BrandWordmark size="sm" showTagline={false} />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
                style={{ marginLeft: 'auto', padding: '0.375rem', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              <NavLink
                to="/universities"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.625rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: isActive ? 'var(--action-primary)' : 'var(--text-charcoal)',
                  backgroundColor: isActive ? 'var(--accent-peach-bg)' : 'transparent',
                  textDecoration: 'none',
                })}
              >
                <Building2 size={18} />
                <span>Universities</span>
              </NavLink>

              <NavLink
                to="/programs"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.625rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: isActive ? 'var(--action-primary)' : 'var(--text-charcoal)',
                  backgroundColor: isActive ? 'var(--accent-peach-bg)' : 'transparent',
                  textDecoration: 'none',
                })}
              >
                <GraduationCap size={18} />
                <span>Degree Programs</span>
              </NavLink>

              <NavLink
                to="/scholarships"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.625rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: isActive ? 'var(--action-primary)' : 'var(--text-charcoal)',
                  backgroundColor: isActive ? 'var(--accent-peach-bg)' : 'transparent',
                  textDecoration: 'none',
                })}
              >
                <Award size={18} />
                <span>Scholarships</span>
              </NavLink>

              {currentRole === 'explorer' && (
                <NavLink
                  to="/saved"
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.625rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: isActive ? 'var(--action-primary)' : 'var(--text-charcoal)',
                    backgroundColor: isActive ? 'var(--accent-peach-bg)' : 'transparent',
                    textDecoration: 'none',
                  })}
                >
                  <Bookmark size={18} />
                  <span>Saved Programs</span>
                </NavLink>
              )}

              <NavLink
                to="/help"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.625rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: isActive ? 'var(--action-primary)' : 'var(--text-charcoal)',
                  backgroundColor: isActive ? 'var(--accent-peach-bg)' : 'transparent',
                  textDecoration: 'none',
                })}
              >
                <HelpCircle size={18} />
                <span>Help Centre</span>
              </NavLink>

              <NavLink
                to="/contact"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.625rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: isActive ? 'var(--action-primary)' : 'var(--text-charcoal)',
                  backgroundColor: isActive ? 'var(--accent-peach-bg)' : 'transparent',
                  textDecoration: 'none',
                })}
              >
                <Mail size={18} />
                <span>Contact Desk</span>
              </NavLink>

              {currentRole === 'visitor' && (
                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <Link
                    to="/request-access"
                    style={{
                      textAlign: 'center',
                      padding: '0.5rem',
                      borderRadius: 'var(--radius-pill)',
                      backgroundColor: 'var(--accent-peach-bg)',
                      color: 'var(--action-primary)',
                      border: '1px solid var(--accent-peach-border)',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    Request Full Access
                  </Link>
                  <Link
                    to="/sign-in"
                    className="btn-pill btn-pill-primary"
                    style={{ textAlign: 'center', fontSize: '0.875rem' }}
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}

      {/* Grounded Accessible Footer */}
      <footer
        style={{
          backgroundColor: '#ffffff',
          borderTop: '1px solid var(--border-subtle)',
          padding: '1.5rem 1rem',
          marginTop: 'auto',
          fontSize: '0.8125rem',
          color: 'var(--text-muted)',
        }}
      >
        <div
          style={{
            maxWidth: '1440px',
            margin: '0 auto',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div>
            <strong>Unilistics:</strong> University application and visa tracking for Pakistani students.
            Supported destinations: Germany, France, Italy, Romania.
          </div>
          <div>WCAG 2.1 AA Compliant • Source material is draft procedural guide, subject to embassy review.</div>
        </div>
      </footer>
    </div>
  );
};
