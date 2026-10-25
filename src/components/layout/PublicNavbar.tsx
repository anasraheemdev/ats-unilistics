import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { UserRole } from '@/types';
import { ROUTES } from '@/config/routes';
import { BrandWordmark } from '@/components/ui/BrandWordmark';
import { SearchDialog } from '@/components/domain/SearchDialog';
import {
  Menu,
  X,
  Compass,
  Mail,
  House,
  LogIn,
  UserPlus,
  Search,
} from 'lucide-react';

interface PublicNavbarProps {
  currentRole?: UserRole;
  onRoleChange?: (newRole: UserRole) => void;
}

export const PublicNavbar: React.FC<PublicNavbarProps> = ({ currentRole = 'visitor' }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const location = useLocation();
  const drawerRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Keyboard accessibility: Escape key and Ctrl+K search shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      } else if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Trap body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          backgroundColor: 'var(--surface-canvas)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)',
          fontFamily: 'var(--font-family-base)',
        }}
        role="banner"
      >
        <div
          style={{
            height: '72px',
            maxWidth: '1440px',
            marginLeft: 'auto',
            marginRight: 'auto',
            paddingLeft: 'var(--space-4)',
            paddingRight: 'var(--space-4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          {/* 1. Brand Logo & Home */}
          <div id="public-nav-brand-logo">
            <BrandWordmark size="md" showTagline={false} />
          </div>

          {/* 2. Desktop Primary Navigation Pills */}
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.25rem 0.375rem',
              backgroundColor: 'var(--surface-panel)',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--border-subtle)',
            }}
            className="hidden md:flex"
            aria-label="Public Navigation"
          >
            {/* Home */}
            <NavLink
              to={ROUTES.HOME}
              end
              id="public-nav-home-link"
              style={({ isActive }) => ({
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 500,
                textDecoration: 'none',
                color: isActive ? 'var(--color-on-primary)' : 'var(--color-foreground)',
                backgroundColor: isActive ? 'var(--action-primary)' : 'transparent',
                transition: 'all var(--transition-fast)',
              })}
            >
              <House size={16} strokeWidth={2} aria-hidden="true" />
              <span>Home</span>
            </NavLink>

            {/* Explore Universities */}
            <NavLink
              to={ROUTES.UNIVERSITIES}
              id="public-nav-universities-link"
              style={({ isActive }) => ({
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 500,
                textDecoration: 'none',
                color: isActive ? 'var(--color-on-primary)' : 'var(--color-foreground)',
                backgroundColor: isActive ? 'var(--action-primary)' : 'transparent',
                transition: 'all var(--transition-fast)',
              })}
            >
              <Compass size={16} strokeWidth={2} aria-hidden="true" />
              <span>Explore Universities</span>
            </NavLink>

            {/* Contact */}
            <NavLink
              to={ROUTES.CONTACT}
              id="public-nav-contact-link"
              style={({ isActive }) => ({
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 500,
                textDecoration: 'none',
                color: isActive ? 'var(--color-on-primary)' : 'var(--color-foreground)',
                backgroundColor: isActive ? 'var(--action-primary)' : 'transparent',
                transition: 'all var(--transition-fast)',
              })}
            >
              <Mail size={16} strokeWidth={2} aria-hidden="true" />
              <span>Contact</span>
            </NavLink>
          </nav>

          {/* 3. Desktop Search & Authentication Actions */}
          <div className="hidden sm:flex" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
            {/* Quick Search Button */}
            <button
              type="button"
              id="public-nav-search-btn"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search universities, programmes, destinations (Ctrl+K)"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.45rem 0.875rem',
                fontSize: '0.8125rem',
                fontWeight: 500,
                color: 'var(--color-foreground-muted)',
                backgroundColor: 'var(--surface-panel)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-pill)',
                cursor: 'pointer',
                minHeight: '40px',
                transition: 'border-color var(--transition-fast)',
              }}
            >
              <Search size={15} strokeWidth={2} aria-hidden="true" />
              <span>Search</span>
              <kbd
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

            {/* Sign in */}
            <Link
              to={ROUTES.SIGN_IN}
              id="public-nav-signin-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--color-foreground)',
                textDecoration: 'none',
                borderRadius: 'var(--radius-control)',
                minHeight: '44px',
                transition: 'background-color var(--transition-fast), color var(--transition-fast)',
              }}
            >
              <LogIn size={16} strokeWidth={2} aria-hidden="true" />
              <span>Sign in</span>
            </Link>

            {/* Sign up */}
            <Link
              to={ROUTES.SIGN_UP}
              id="public-nav-signup-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.625rem 1.25rem',
                borderRadius: 'var(--radius-control)',
                fontSize: '0.875rem',
                fontWeight: 700,
                color: 'var(--color-on-primary)',
                backgroundColor: 'var(--action-primary)',
                boxShadow: 'var(--shadow-sm)',
                textDecoration: 'none',
                minHeight: '44px',
                transition: 'all var(--transition-fast)',
              }}
            >
              <UserPlus size={16} strokeWidth={2} aria-hidden="true" />
              <span>Sign up</span>
            </Link>
          </div>

          {/* 4. Mobile Menu Trigger Button */}
          <button
            ref={menuButtonRef}
            type="button"
            id="public-nav-mobile-menu-btn"
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden"
            aria-label="Open navigation menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="public-mobile-drawer"
            style={{
              padding: '0.5rem',
              borderRadius: 'var(--radius-control)',
              color: 'var(--color-foreground)',
              backgroundColor: 'var(--surface-panel)',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer',
              minHeight: '44px',
              minWidth: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Menu size={20} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* 5. Accessible Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100 }}>
          {/* Backdrop */}
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(13, 21, 17, 0.72)',
              backdropFilter: 'blur(4px)',
            }}
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          <div
            ref={drawerRef}
            id="public-mobile-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            style={{
              width: '300px',
              maxWidth: '85vw',
              height: '100%',
              backgroundColor: 'var(--surface-canvas)',
              boxShadow: 'var(--shadow-floating)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              overflowY: 'auto',
              borderRight: '1px solid var(--border-subtle)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              {/* Drawer Top Header */}
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
                  aria-label="Close navigation menu"
                >
                  <X size={20} strokeWidth={2} />
                </button>
              </div>

              {/* Mobile Primary Navigation Links */}
              <nav
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.375rem',
                  paddingTop: '1.5rem',
                  paddingBottom: '1.5rem',
                }}
                aria-label="Mobile Navigation"
              >
                <NavLink
                  to={ROUTES.HOME}
                  end
                  id="mobile-nav-home-link"
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
                  <House size={18} strokeWidth={2} aria-hidden="true" />
                  <span>Home</span>
                </NavLink>

                <NavLink
                  to={ROUTES.UNIVERSITIES}
                  id="mobile-nav-universities-link"
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
                  <Compass size={18} strokeWidth={2} aria-hidden="true" />
                  <span>Explore Universities</span>
                </NavLink>

                <NavLink
                  to={ROUTES.CONTACT}
                  id="mobile-nav-contact-link"
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

            {/* Mobile Authentication Actions */}
            <div
              style={{
                paddingTop: '1.5rem',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <Link
                to={ROUTES.SIGN_IN}
                id="mobile-nav-signin-btn"
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
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  minHeight: '44px',
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                <LogIn size={16} strokeWidth={2} />
                <span>Sign in</span>
              </Link>

              <Link
                to={ROUTES.SIGN_UP}
                id="mobile-nav-signup-btn"
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
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  minHeight: '44px',
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                <UserPlus size={16} strokeWidth={2} />
                <span>Sign up</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Search Dialog Modal */}
      <SearchDialog
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        currentRole={currentRole}
        userId="visitor"
      />
    </>
  );
};

export default PublicNavbar;
