import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { UserRole, AccessRequest } from '@/types';
import { ROUTES } from '@/config/routes';
import { BrandWordmark } from '@/components/ui/BrandWordmark';
import { useTheme } from '@/lib/theme';
import { SearchDialog } from '@/components/domain/SearchDialog';
import { api } from '@/lib/api';
import { queryClient } from '@/lib/queryClient';
import {
  Menu,
  X,
  Compass,
  Mail,
  House,
  LogIn,
  UserPlus,
  Search,
  ChevronDown,
  GraduationCap,
  FileText,
  Heart,
  Bookmark,
  CircleHelp,
  ShieldCheck,
  MessageSquare,
  Clock,
  Sparkles,
  SlidersHorizontal,
  Settings,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react';

interface PublicNavbarProps {
  currentRole?: UserRole;
  onRoleChange?: (newRole: UserRole) => void;
}

export const PublicNavbar: React.FC<PublicNavbarProps> = ({
  currentRole = 'visitor',
  onRoleChange,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [exploreDropdownOpen, setExploreDropdownOpen] = useState(false);
  const [helpDropdownOpen, setHelpDropdownOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);

  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [activeGuidanceReq, setActiveGuidanceReq] = useState<AccessRequest | null>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { resolvedTheme, toggleTheme } = useTheme();


  const exploreRef = useRef<HTMLDivElement>(null);
  const helpRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Fetch current user details & active guidance request when authenticated
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

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setExploreDropdownOpen(false);
    setHelpDropdownOpen(false);
    setAccountDropdownOpen(false);
  }, [location.pathname]);

  // Handle click outside dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (exploreRef.current && !exploreRef.current.contains(target)) {
        setExploreDropdownOpen(false);
      }
      if (helpRef.current && !helpRef.current.contains(target)) {
        setHelpDropdownOpen(false);
      }
      if (accountRef.current && !accountRef.current.contains(target)) {
        setAccountDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard accessibility: Escape key and Ctrl+K search shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      } else if (e.key === 'Escape') {
        if (mobileMenuOpen) {
          setMobileMenuOpen(false);
          menuButtonRef.current?.focus();
        }
        setExploreDropdownOpen(false);
        setHelpDropdownOpen(false);
        setAccountDropdownOpen(false);
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

  const handleSignOut = async () => {
    await api.auth.signOut();
    queryClient.clear();
    if (onRoleChange) {
      onRoleChange('visitor');
    }
    setAccountDropdownOpen(false);
    navigate('/universities');
  };

  const isVisitor = currentRole === 'visitor';
  const displayName = userName || userEmail?.split('@')[0] || (isVisitor ? 'Visitor' : 'Account');
  const initial = displayName.charAt(0).toUpperCase();

  // Active parent highlights
  const isExploreActive =
    location.pathname.startsWith('/universities') ||
    location.pathname.startsWith('/programs') ||
    location.pathname.startsWith('/scholarships') ||
    location.pathname.startsWith('/saved') ||
    location.pathname.startsWith('/explorer');

  const isHelpActive =
    location.pathname.startsWith('/how-it-works') ||
    location.pathname.startsWith('/corridors-and-legal') ||
    location.pathname.startsWith('/help') ||
    location.pathname.startsWith('/support') ||
    location.pathname.startsWith('/support-desk') ||
    location.pathname.startsWith('/request-status') ||
    location.pathname.startsWith('/request-guidance');

  return (
    <>
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          height: '72px',
          backgroundColor: 'var(--surface-canvas, #F6F8F5)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border-subtle, #E1E8DE)',
          boxShadow: 'var(--shadow-sm)',
          fontFamily: 'var(--font-family-base, "DM Sans", sans-serif)',
          boxSizing: 'border-box',
        }}
        role="banner"
      >
        <div
          style={{
            height: '100%',
            maxWidth: '1440px',
            marginLeft: 'auto',
            marginRight: 'auto',
            paddingLeft: 'var(--space-4, 1.5rem)',
            paddingRight: 'var(--space-4, 1.5rem)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          {/* 1. Brand Logo */}
          <div id="public-nav-brand-logo" style={{ display: 'flex', alignItems: 'center' }}>
            <BrandWordmark size="md" showTagline={false} />
          </div>

          {/* 2. Desktop Primary Navigation Pills */}
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.25rem 0.375rem',
              backgroundColor: 'var(--surface-panel, #FFFFFF)',
              borderRadius: 'var(--radius-pill, 9999px)',
              border: '1px solid var(--border-subtle, #E1E8DE)',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
            }}
            className="desktop-only-nav"
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
                borderRadius: 'var(--radius-pill, 9999px)',
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 500,
                textDecoration: 'none',
                color: isActive ? 'var(--color-on-primary, #FFFFFF)' : 'var(--color-foreground, #19261F)',
                backgroundColor: isActive ? 'var(--action-primary, #245B42)' : 'transparent',
                transition: 'all var(--transition-fast, 150ms ease)',
              })}
            >
              <House size={16} strokeWidth={2} aria-hidden="true" />
              <span>Home</span>
            </NavLink>

            {/* Explore Dropdown */}
            <div ref={exploreRef} style={{ position: 'relative' }}>
              <button
                type="button"
                id="public-nav-explore-trigger"
                onClick={() => {
                  setExploreDropdownOpen((prev) => !prev);
                  setHelpDropdownOpen(false);
                  setAccountDropdownOpen(false);
                }}
                aria-expanded={exploreDropdownOpen}
                aria-haspopup="true"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-pill, 9999px)',
                  fontSize: '0.875rem',
                  fontWeight: isExploreActive ? 600 : 500,
                  color: isExploreActive ? 'var(--color-on-primary, #FFFFFF)' : 'var(--color-foreground, #19261F)',
                  backgroundColor: isExploreActive ? 'var(--action-primary, #245B42)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast, 150ms ease)',
                }}
              >
                <Compass size={16} strokeWidth={2} aria-hidden="true" />
                <span>Explore</span>
                <ChevronDown
                  size={14}
                  strokeWidth={2}
                  style={{
                    transform: exploreDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform var(--transition-fast, 150ms ease)',
                  }}
                  aria-hidden="true"
                />
              </button>

              {exploreDropdownOpen && (
                <div
                  id="public-nav-explore-dropdown"
                  role="menu"
                  aria-label="Explore Destinations"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    left: 0,
                    minWidth: '270px',
                    backgroundColor: 'var(--surface-card, #FFFFFF)',
                    border: '1px solid var(--border-subtle, #E1E8DE)',
                    borderRadius: 'var(--radius-control, 16px)',
                    boxShadow: 'var(--shadow-floating, 0 12px 32px rgba(18, 30, 23, 0.12))',
                    padding: '0.5rem',
                    zIndex: 60,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                  }}
                >
                  {/* Universities */}
                  <Link
                    to="/universities"
                    role="menuitem"
                    aria-label="Explore Universities"
                    onClick={() => setExploreDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      padding: '0.625rem 0.75rem',
                      borderRadius: 'var(--radius-control, 12px)',
                      textDecoration: 'none',
                      color: 'var(--color-foreground, #19261F)',
                      transition: 'background-color var(--transition-fast, 150ms ease)',
                    }}
                    className="dropdown-hover-item"
                  >
                    <GraduationCap
                      size={18}
                      strokeWidth={2}
                      style={{ color: 'var(--action-primary, #245B42)', marginTop: '2px', flexShrink: 0 }}
                      aria-hidden="true"
                    />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Universities</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted, #55635A)' }}>
                        Accredited European institutions
                      </span>
                    </div>
                  </Link>

                  {/* Programs */}
                  <Link
                    to="/programs"
                    role="menuitem"
                    onClick={() => setExploreDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      padding: '0.625rem 0.75rem',
                      borderRadius: 'var(--radius-control, 12px)',
                      textDecoration: 'none',
                      color: 'var(--color-foreground, #19261F)',
                      transition: 'background-color var(--transition-fast, 150ms ease)',
                    }}
                    className="dropdown-hover-item"
                  >
                    <FileText
                      size={18}
                      strokeWidth={2}
                      style={{ color: 'var(--action-primary, #245B42)', marginTop: '2px', flexShrink: 0 }}
                      aria-hidden="true"
                    />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Programs</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted, #55635A)' }}>
                        Bachelors, Masters & English-taught
                      </span>
                    </div>
                  </Link>

                  {/* Scholarships */}
                  <Link
                    to="/scholarships"
                    role="menuitem"
                    onClick={() => setExploreDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      padding: '0.625rem 0.75rem',
                      borderRadius: 'var(--radius-control, 12px)',
                      textDecoration: 'none',
                      color: 'var(--color-foreground, #19261F)',
                      transition: 'background-color var(--transition-fast, 150ms ease)',
                    }}
                    className="dropdown-hover-item"
                  >
                    <Heart
                      size={18}
                      strokeWidth={2}
                      style={{ color: 'var(--action-primary, #245B42)', marginTop: '2px', flexShrink: 0 }}
                      aria-hidden="true"
                    />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Scholarships</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted, #55635A)' }}>
                        DAAD, Erasmus & national merit grants
                      </span>
                    </div>
                  </Link>

                  {/* Saved (for authenticated explorer) */}
                  {!isVisitor && (
                    <>
                      <hr style={{ borderColor: 'var(--border-subtle, #E1E8DE)', margin: '0.25rem 0' }} />
                      <Link
                        to="/saved"
                        role="menuitem"
                        aria-label="Saved"
                        onClick={() => setExploreDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.75rem',
                          padding: '0.625rem 0.75rem',
                          borderRadius: 'var(--radius-control, 12px)',
                          textDecoration: 'none',
                          color: 'var(--color-foreground, #19261F)',
                          transition: 'background-color var(--transition-fast, 150ms ease)',
                        }}
                        className="dropdown-hover-item"
                      >
                        <Bookmark
                          size={18}
                          strokeWidth={2}
                          style={{ color: 'var(--action-primary, #245B42)', marginTop: '2px', flexShrink: 0 }}
                          aria-hidden="true"
                        />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Saved Programs</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted, #55635A)' }}>
                            Your bookmarked degrees
                          </span>
                        </div>
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Help & Guidance Dropdown */}
            <div ref={helpRef} style={{ position: 'relative' }}>
              <button
                type="button"
                id="public-nav-help-trigger"
                onClick={() => {
                  setHelpDropdownOpen((prev) => !prev);
                  setExploreDropdownOpen(false);
                  setAccountDropdownOpen(false);
                }}
                aria-expanded={helpDropdownOpen}
                aria-haspopup="true"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-pill, 9999px)',
                  fontSize: '0.875rem',
                  fontWeight: isHelpActive ? 600 : 500,
                  color: isHelpActive ? 'var(--color-on-primary, #FFFFFF)' : 'var(--color-foreground, #19261F)',
                  backgroundColor: isHelpActive ? 'var(--action-primary, #245B42)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast, 150ms ease)',
                }}
              >
                <CircleHelp size={16} strokeWidth={2} aria-hidden="true" />
                <span>Help & Guidance</span>
                <ChevronDown
                  size={14}
                  strokeWidth={2}
                  style={{
                    transform: helpDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform var(--transition-fast, 150ms ease)',
                  }}
                  aria-hidden="true"
                />
              </button>

              {helpDropdownOpen && (
                <div
                  id="public-nav-help-dropdown"
                  role="menu"
                  aria-label="Help & Guidance Menu"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    left: 0,
                    minWidth: '280px',
                    backgroundColor: 'var(--surface-card, #FFFFFF)',
                    border: '1px solid var(--border-subtle, #E1E8DE)',
                    borderRadius: 'var(--radius-control, 16px)',
                    boxShadow: 'var(--shadow-floating, 0 12px 32px rgba(18, 30, 23, 0.12))',
                    padding: '0.5rem',
                    zIndex: 60,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                  }}
                >
                  {/* How It Works */}
                  <Link
                    to="/how-it-works"
                    role="menuitem"
                    onClick={() => setHelpDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      padding: '0.625rem 0.75rem',
                      borderRadius: 'var(--radius-control, 12px)',
                      textDecoration: 'none',
                      color: 'var(--color-foreground, #19261F)',
                      transition: 'background-color var(--transition-fast, 150ms ease)',
                    }}
                    className="dropdown-hover-item"
                  >
                    <Compass
                      size={18}
                      strokeWidth={2}
                      style={{ color: 'var(--action-primary, #245B42)', marginTop: '2px', flexShrink: 0 }}
                      aria-hidden="true"
                    />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>How It Works</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted, #55635A)' }}>
                        4-stage application procedure
                      </span>
                    </div>
                  </Link>

                  {/* Country Corridors */}
                  <Link
                    to="/corridors-and-legal"
                    role="menuitem"
                    onClick={() => setHelpDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      padding: '0.625rem 0.75rem',
                      borderRadius: 'var(--radius-control, 12px)',
                      textDecoration: 'none',
                      color: 'var(--color-foreground, #19261F)',
                      transition: 'background-color var(--transition-fast, 150ms ease)',
                    }}
                    className="dropdown-hover-item"
                  >
                    <ShieldCheck
                      size={18}
                      strokeWidth={2}
                      style={{ color: 'var(--action-primary, #245B42)', marginTop: '2px', flexShrink: 0 }}
                      aria-hidden="true"
                    />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Country Corridors</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted, #55635A)' }}>
                        APS, Campus France & CIMEA rules
                      </span>
                    </div>
                  </Link>

                  {/* Help Centre */}
                  <Link
                    to="/help"
                    role="menuitem"
                    onClick={() => setHelpDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      padding: '0.625rem 0.75rem',
                      borderRadius: 'var(--radius-control, 12px)',
                      textDecoration: 'none',
                      color: 'var(--color-foreground, #19261F)',
                      transition: 'background-color var(--transition-fast, 150ms ease)',
                    }}
                    className="dropdown-hover-item"
                  >
                    <CircleHelp
                      size={18}
                      strokeWidth={2}
                      style={{ color: 'var(--action-primary, #245B42)', marginTop: '2px', flexShrink: 0 }}
                      aria-hidden="true"
                    />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Help Centre</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted, #55635A)' }}>
                        Searchable guides and FAQs
                      </span>
                    </div>
                  </Link>

                  {/* Support Desk */}
                  <Link
                    to="/support-desk"
                    role="menuitem"
                    onClick={() => setHelpDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      padding: '0.625rem 0.75rem',
                      borderRadius: 'var(--radius-control, 12px)',
                      textDecoration: 'none',
                      color: 'var(--color-foreground, #19261F)',
                      transition: 'background-color var(--transition-fast, 150ms ease)',
                    }}
                    className="dropdown-hover-item"
                  >
                    <MessageSquare
                      size={18}
                      strokeWidth={2}
                      style={{ color: 'var(--action-primary, #245B42)', marginTop: '2px', flexShrink: 0 }}
                      aria-hidden="true"
                    />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Support Desk</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted, #55635A)' }}>
                        Inquiries & admissions assistance
                      </span>
                    </div>
                  </Link>

                  {/* Guidance Request Status */}
                  <Link
                    to="/request-status"
                    role="menuitem"
                    onClick={() => setHelpDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      padding: '0.625rem 0.75rem',
                      borderRadius: 'var(--radius-control, 12px)',
                      textDecoration: 'none',
                      color: 'var(--color-foreground, #19261F)',
                      transition: 'background-color var(--transition-fast, 150ms ease)',
                    }}
                    className="dropdown-hover-item"
                  >
                    <Clock
                      size={18}
                      strokeWidth={2}
                      style={{ color: 'var(--action-primary, #245B42)', marginTop: '2px', flexShrink: 0 }}
                      aria-hidden="true"
                    />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Request Status</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted, #55635A)' }}>
                        Track your guidance intake progress
                      </span>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Contact */}
            <NavLink
              to={ROUTES.CONTACT}
              id="public-nav-contact-link"
              style={({ isActive }) => ({
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-pill, 9999px)',
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 500,
                textDecoration: 'none',
                color: isActive ? 'var(--color-on-primary, #FFFFFF)' : 'var(--color-foreground, #19261F)',
                backgroundColor: isActive ? 'var(--action-primary, #245B42)' : 'transparent',
                transition: 'all var(--transition-fast, 150ms ease)',
              })}
            >
              <Mail size={16} strokeWidth={2} aria-hidden="true" />
              <span>Contact</span>
            </NavLink>
          </nav>

          {/* 3. Desktop Search & Auth Actions */}
          <div className="desktop-only-nav" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
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
                color: 'var(--color-foreground-muted, #55635A)',
                backgroundColor: 'var(--surface-panel, #FFFFFF)',
                border: '1px solid var(--border-subtle, #E1E8DE)',
                borderRadius: 'var(--radius-pill, 9999px)',
                cursor: 'pointer',
                minHeight: '40px',
                transition: 'border-color var(--transition-fast, 150ms ease)',
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
                  backgroundColor: 'var(--surface-card, #FFFFFF)',
                  border: '1px solid var(--border-subtle, #E1E8DE)',
                  color: 'var(--color-foreground-muted, #55635A)',
                }}
              >
                ⌘K
              </kbd>
            </button>

            {/* Theme Toggle Button */}
            <button
              type="button"
              id="theme-toggle-btn"
              onClick={toggleTheme}
              aria-label={resolvedTheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              title={resolvedTheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-pill, 9999px)',
                backgroundColor: 'var(--surface-panel, #FFFFFF)',
                border: '1px solid var(--border-subtle, #E1E8DE)',
                color: 'var(--color-foreground, #19261F)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast, 150ms ease)',
                flexShrink: 0,
              }}
            >
              {resolvedTheme === 'dark' ? (
                <Sun size={17} strokeWidth={2} style={{ color: 'var(--brand-citron, #D7EE83)' }} aria-hidden="true" />
              ) : (
                <Moon size={17} strokeWidth={2} style={{ color: 'var(--action-primary, #245B42)' }} aria-hidden="true" />
              )}
            </button>

            {/* Signed-out vs Signed-in actions */}
            {isVisitor ? (
              <>
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
                    color: 'var(--color-foreground, #19261F)',
                    textDecoration: 'none',
                    borderRadius: 'var(--radius-control, 16px)',
                    minHeight: '44px',
                    transition: 'all var(--transition-fast, 150ms ease)',
                  }}
                >
                  <LogIn size={16} strokeWidth={2} aria-hidden="true" />
                  <span>Sign in</span>
                </Link>

                <Link
                  to={ROUTES.SIGN_UP}
                  id="public-nav-signup-btn"
                  aria-label="Sign up"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    padding: '0.625rem 1.25rem',
                    borderRadius: 'var(--radius-control, 16px)',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: 'var(--color-on-primary, #FFFFFF)',
                    backgroundColor: 'var(--action-primary, #245B42)',
                    boxShadow: 'var(--shadow-sm)',
                    textDecoration: 'none',
                    minHeight: '44px',
                    transition: 'all var(--transition-fast, 150ms ease)',
                  }}
                >
                  <UserPlus size={16} strokeWidth={2} aria-hidden="true" />
                  <span>Create Free Account</span>
                </Link>
              </>
            ) : (
              <>
                {/* Role-Appropriate Action */}
                {currentRole === 'explorer' &&
                  (activeGuidanceReq ? (
                    <Link
                      to="/request-status"
                      id="public-nav-status-btn"
                      aria-label="Guidance Pending"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        padding: '0.5rem 1rem',
                        borderRadius: 'var(--radius-pill, 9999px)',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        color: '#19261F',
                        backgroundColor: 'var(--brand-citron, #D7EE83)',
                        textDecoration: 'none',
                        minHeight: '40px',
                        border: '1px solid rgba(0, 0, 0, 0.08)',
                      }}
                    >
                      <Clock size={15} strokeWidth={2} />
                      <span>Guidance Pending</span>
                    </Link>
                  ) : (
                    <Link
                      to="/request-guidance"
                      id="public-nav-request-guidance-btn"
                      aria-label="Request Managed Guidance"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        padding: '0.5rem 1.125rem',
                        borderRadius: 'var(--radius-control, 16px)',
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                        color: 'var(--color-on-primary, #FFFFFF)',
                        backgroundColor: 'var(--action-primary, #245B42)',
                        textDecoration: 'none',
                        minHeight: '40px',
                        boxShadow: 'var(--shadow-sm)',
                      }}
                    >
                      <Sparkles size={15} strokeWidth={2} />
                      <span>Request Managed Guidance</span>
                    </Link>
                  ))}

                {currentRole === 'managed_student' && (
                  <Link
                    to="/student"
                    id="public-nav-workspace-btn"
                    aria-label="Open Workspace"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      padding: '0.5rem 1.125rem',
                      borderRadius: 'var(--radius-control, 16px)',
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      color: 'var(--color-on-primary, #FFFFFF)',
                      backgroundColor: 'var(--action-primary, #245B42)',
                      textDecoration: 'none',
                      minHeight: '40px',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <GraduationCap size={16} strokeWidth={2} />
                    <span>Open Workspace</span>
                  </Link>
                )}

                {currentRole === 'counsellor' && (
                  <Link
                    to="/staff"
                    id="public-nav-counsellor-btn"
                    aria-label="Counsellor Desk"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      padding: '0.5rem 1.125rem',
                      borderRadius: 'var(--radius-control, 16px)',
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      color: 'var(--color-on-primary, #FFFFFF)',
                      backgroundColor: 'var(--action-primary, #245B42)',
                      textDecoration: 'none',
                      minHeight: '40px',
                    }}
                  >
                    <House size={16} strokeWidth={2} />
                    <span>Counsellor Desk</span>
                  </Link>
                )}

                {(currentRole === 'admin' || currentRole === 'super_admin') && (
                  <Link
                    to="/admin"
                    id="public-nav-admin-btn"
                    aria-label="Admin Console"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      padding: '0.5rem 1.125rem',
                      borderRadius: 'var(--radius-control, 16px)',
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      color: 'var(--color-on-primary, #FFFFFF)',
                      backgroundColor: 'var(--action-primary, #245B42)',
                      textDecoration: 'none',
                      minHeight: '40px',
                    }}
                  >
                    <SlidersHorizontal size={16} strokeWidth={2} />
                    <span>Admin Console</span>
                  </Link>
                )}

                {/* Account Menu Pill Dropdown */}
                <div ref={accountRef} style={{ position: 'relative' }}>
                  <button
                    type="button"
                    id="public-nav-account-btn"
                    onClick={() => {
                      setAccountDropdownOpen((prev) => !prev);
                      setExploreDropdownOpen(false);
                      setHelpDropdownOpen(false);
                    }}
                    aria-expanded={accountDropdownOpen}
                    aria-haspopup="true"
                    aria-label={`Account menu for ${displayName}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.35rem 0.75rem 0.35rem 0.35rem',
                      borderRadius: 'var(--radius-pill, 9999px)',
                      backgroundColor: 'var(--surface-card, #FFFFFF)',
                      border: '1px solid var(--border-subtle, #E1E8DE)',
                      cursor: 'pointer',
                      minHeight: '40px',
                      color: 'var(--color-foreground, #19261F)',
                    }}
                  >
                    <div
                      style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: 'var(--radius-pill, 9999px)',
                        backgroundColor: 'var(--action-primary, #245B42)',
                        color: 'var(--color-on-primary, #FFFFFF)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                      }}
                    >
                      {initial}
                    </div>
                    <span
                      style={{
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        maxWidth: '120px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {displayName}
                    </span>
                    <ChevronDown
                      size={14}
                      strokeWidth={2}
                      style={{
                        transform: accountDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform var(--transition-fast, 150ms ease)',
                        color: 'var(--color-foreground-muted, #55635A)',
                      }}
                      aria-hidden="true"
                    />
                  </button>

                  {accountDropdownOpen && (
                    <div
                      role="menu"
                      aria-label="User Account Menu"
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 8px)',
                        right: 0,
                        minWidth: '240px',
                        backgroundColor: 'var(--surface-card, #FFFFFF)',
                        border: '1px solid var(--border-subtle, #E1E8DE)',
                        borderRadius: 'var(--radius-control, 16px)',
                        boxShadow: 'var(--shadow-floating, 0 12px 32px rgba(18, 30, 23, 0.12))',
                        padding: '0.625rem',
                        zIndex: 60,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem',
                      }}
                    >
                      {/* User Info Header */}
                      <div style={{ padding: '0.375rem 0.5rem 0.625rem', borderBottom: '1px solid var(--border-subtle, #E1E8DE)' }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>{displayName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted, #55635A)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {userEmail || `${currentRole}@unilistics.local`}
                        </div>
                        <div
                          style={{
                            display: 'inline-block',
                            marginTop: '0.375rem',
                            fontSize: '0.6875rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            padding: '0.125rem 0.5rem',
                            borderRadius: 'var(--radius-pill, 9999px)',
                            backgroundColor: 'rgba(36, 91, 66, 0.1)',
                            color: 'var(--action-primary, #245B42)',
                          }}
                        >
                          {currentRole.replace('_', ' ')}
                        </div>
                      </div>

                      {/* Quick Links */}
                      {currentRole === 'explorer' && (
                        <>
                          <Link
                            to="/saved"
                            role="menuitem"
                            aria-label="Saved"
                            onClick={() => setAccountDropdownOpen(false)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.625rem',
                              padding: '0.5rem 0.75rem',
                              borderRadius: 'var(--radius-control, 12px)',
                              fontSize: '0.8125rem',
                              color: 'var(--color-foreground, #19261F)',
                              textDecoration: 'none',
                            }}
                            className="dropdown-hover-item"
                          >
                            <Bookmark size={16} />
                            <span>Saved</span>
                          </Link>
                          <Link
                            to="/explorer/account"
                            role="menuitem"
                            onClick={() => setAccountDropdownOpen(false)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.625rem',
                              padding: '0.5rem 0.75rem',
                              borderRadius: 'var(--radius-control, 12px)',
                              fontSize: '0.8125rem',
                              color: 'var(--color-foreground, #19261F)',
                              textDecoration: 'none',
                            }}
                            className="dropdown-hover-item"
                          >
                            <Settings size={16} />
                            <span>Account Settings</span>
                          </Link>
                        </>
                      )}

                      {currentRole === 'managed_student' && (
                        <>
                          <Link
                            to="/student"
                            role="menuitem"
                            onClick={() => setAccountDropdownOpen(false)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.625rem',
                              padding: '0.5rem 0.75rem',
                              borderRadius: 'var(--radius-control, 12px)',
                              fontSize: '0.8125rem',
                              color: 'var(--color-foreground, #19261F)',
                              textDecoration: 'none',
                            }}
                            className="dropdown-hover-item"
                          >
                            <House size={16} />
                            <span>Student Overview</span>
                          </Link>
                          <Link
                            to="/student/applications"
                            role="menuitem"
                            onClick={() => setAccountDropdownOpen(false)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.625rem',
                              padding: '0.5rem 0.75rem',
                              borderRadius: 'var(--radius-control, 12px)',
                              fontSize: '0.8125rem',
                              color: 'var(--color-foreground, #19261F)',
                              textDecoration: 'none',
                            }}
                            className="dropdown-hover-item"
                          >
                            <GraduationCap size={16} />
                            <span>Applications</span>
                          </Link>
                          <Link
                            to="/student/account"
                            role="menuitem"
                            onClick={() => setAccountDropdownOpen(false)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.625rem',
                              padding: '0.5rem 0.75rem',
                              borderRadius: 'var(--radius-control, 12px)',
                              fontSize: '0.8125rem',
                              color: 'var(--color-foreground, #19261F)',
                              textDecoration: 'none',
                            }}
                            className="dropdown-hover-item"
                          >
                            <Settings size={16} />
                            <span>Account Settings</span>
                          </Link>
                        </>
                      )}

                      <hr style={{ borderColor: 'var(--border-subtle, #E1E8DE)', margin: '0.25rem 0' }} />

                      {/* Sign Out Action */}
                      <button
                        type="button"
                        onClick={handleSignOut}
                        title="Sign out of account"
                        aria-label="Sign out"
                        role="menuitem"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.625rem',
                          padding: '0.5rem 0.75rem',
                          borderRadius: 'var(--radius-control, 12px)',
                          fontSize: '0.8125rem',
                          color: '#C53030',
                          border: 'none',
                          cursor: 'pointer',
                          width: '100%',
                          textAlign: 'left',
                          backgroundColor: 'transparent',
                        }}
                        className="dropdown-hover-item"
                      >
                        <LogOut size={16} />
                        <span>Sign out</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Quick Sign Out Action (matches Screenshot 2) */}
                <button
                  type="button"
                  id="public-nav-quick-signout-btn"
                  onClick={handleSignOut}
                  title="Sign out of account"
                  aria-label="Sign out of account"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-pill, 9999px)',
                    border: '1px solid var(--border-subtle, #E1E8DE)',
                    backgroundColor: 'var(--surface-panel, #FFFFFF)',
                    color: 'var(--color-foreground-muted, #55635A)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast, 150ms ease)',
                  }}
                  className="dropdown-hover-item"
                >
                  <LogOut size={16} />
                </button>
              </>
            )}
          </div>

          {/* 4. Mobile Menu Trigger Button */}
          <button
            ref={menuButtonRef}
            type="button"
            id="public-nav-mobile-menu-btn"
            onClick={() => setMobileMenuOpen(true)}
            className="mobile-only-hamburger"
            aria-label="Open navigation menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="public-mobile-drawer"
            style={{
              padding: '0.5rem',
              borderRadius: 'var(--radius-control, 16px)',
              color: 'var(--color-foreground, #19261F)',
              backgroundColor: 'var(--surface-panel, #FFFFFF)',
              border: '1px solid var(--border-subtle, #E1E8DE)',
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
              position: 'fixed',
              top: 0,
              bottom: 0,
              right: 0,
              width: '320px',
              maxWidth: '85vw',
              backgroundColor: 'var(--surface-panel, #FFFFFF)',
              boxShadow: 'var(--shadow-floating, 0 12px 32px rgba(18, 30, 23, 0.12))',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 101,
              fontFamily: 'var(--font-family-base, "DM Sans", sans-serif)',
              overflowY: 'auto',
            }}
          >
            {/* Drawer Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.25rem',
                borderBottom: '1px solid var(--border-subtle, #E1E8DE)',
              }}
            >
              <BrandWordmark size="sm" showTagline={false} />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation menu"
                style={{
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-pill, 9999px)',
                  color: 'var(--color-foreground-muted, #55635A)',
                  cursor: 'pointer',
                  minHeight: '44px',
                  minWidth: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  backgroundColor: 'transparent',
                }}
              >
                <X size={20} strokeWidth={2} />
              </button>
            </div>

            {/* Drawer Content */}
            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>
              {/* Quick Search in Mobile Drawer */}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsSearchOpen(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-control, 16px)',
                  border: '1px solid var(--border-subtle, #E1E8DE)',
                  backgroundColor: 'var(--surface-canvas, #F6F8F5)',
                  color: 'var(--color-foreground-muted, #55635A)',
                  cursor: 'pointer',
                  minHeight: '48px',
                  fontSize: '0.875rem',
                }}
              >
                <Search size={18} />
                <span>Search catalogue & articles...</span>
              </button>

              {/* Main Links */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <NavLink
                  to="/"
                  end
                  onClick={() => setMobileMenuOpen(false)}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-control, 16px)',
                    fontSize: '0.9375rem',
                    fontWeight: isActive ? 700 : 500,
                    textDecoration: 'none',
                    color: isActive ? '#19261F' : 'var(--color-foreground, #19261F)',
                    backgroundColor: isActive ? 'var(--brand-citron, #D7EE83)' : 'transparent',
                    minHeight: '48px',
                  })}
                >
                  <House size={18} />
                  <span>Home</span>
                </NavLink>

                <NavLink
                  to="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-control, 16px)',
                    fontSize: '0.9375rem',
                    fontWeight: isActive ? 700 : 500,
                    textDecoration: 'none',
                    color: isActive ? '#19261F' : 'var(--color-foreground, #19261F)',
                    backgroundColor: isActive ? 'var(--brand-citron, #D7EE83)' : 'transparent',
                    minHeight: '48px',
                  })}
                >
                  <Mail size={18} />
                  <span>Contact</span>
                </NavLink>
              </div>

              {/* Explore Section */}
              <div>
                <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-foreground-muted, #55635A)', marginBottom: '0.5rem', paddingLeft: '0.5rem' }}>
                  Explore
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <NavLink
                    to="/universities"
                    onClick={() => setMobileMenuOpen(false)}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.625rem 1rem',
                      borderRadius: 'var(--radius-control, 12px)',
                      fontSize: '0.875rem',
                      fontWeight: isActive ? 700 : 500,
                      textDecoration: 'none',
                      color: isActive ? '#19261F' : 'var(--color-foreground, #19261F)',
                      backgroundColor: isActive ? 'var(--brand-citron, #D7EE83)' : 'transparent',
                      minHeight: '44px',
                    })}
                  >
                    <GraduationCap size={18} />
                    <span>Universities</span>
                  </NavLink>

                  <NavLink
                    to="/programs"
                    onClick={() => setMobileMenuOpen(false)}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.625rem 1rem',
                      borderRadius: 'var(--radius-control, 12px)',
                      fontSize: '0.875rem',
                      fontWeight: isActive ? 700 : 500,
                      textDecoration: 'none',
                      color: isActive ? '#19261F' : 'var(--color-foreground, #19261F)',
                      backgroundColor: isActive ? 'var(--brand-citron, #D7EE83)' : 'transparent',
                      minHeight: '44px',
                    })}
                  >
                    <FileText size={18} />
                    <span>Programs</span>
                  </NavLink>

                  <NavLink
                    to="/scholarships"
                    onClick={() => setMobileMenuOpen(false)}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.625rem 1rem',
                      borderRadius: 'var(--radius-control, 12px)',
                      fontSize: '0.875rem',
                      fontWeight: isActive ? 700 : 500,
                      textDecoration: 'none',
                      color: isActive ? '#19261F' : 'var(--color-foreground, #19261F)',
                      backgroundColor: isActive ? 'var(--brand-citron, #D7EE83)' : 'transparent',
                      minHeight: '44px',
                    })}
                  >
                    <Heart size={18} />
                    <span>Scholarships</span>
                  </NavLink>

                  {!isVisitor && (
                    <NavLink
                      to="/saved"
                      onClick={() => setMobileMenuOpen(false)}
                      style={({ isActive }) => ({
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.625rem 1rem',
                        borderRadius: 'var(--radius-control, 12px)',
                        fontSize: '0.875rem',
                        fontWeight: isActive ? 700 : 500,
                        textDecoration: 'none',
                        color: isActive ? '#19261F' : 'var(--color-foreground, #19261F)',
                        backgroundColor: isActive ? 'var(--brand-citron, #D7EE83)' : 'transparent',
                        minHeight: '44px',
                      })}
                    >
                      <Bookmark size={18} />
                      <span>Saved</span>
                    </NavLink>
                  )}
                </div>
              </div>

              {/* Help & Guidance Section */}
              <div>
                <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-foreground-muted, #55635A)', marginBottom: '0.5rem', paddingLeft: '0.5rem' }}>
                  Help & Guidance
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <NavLink
                    to="/how-it-works"
                    onClick={() => setMobileMenuOpen(false)}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.625rem 1rem',
                      borderRadius: 'var(--radius-control, 12px)',
                      fontSize: '0.875rem',
                      fontWeight: isActive ? 700 : 500,
                      textDecoration: 'none',
                      color: isActive ? '#19261F' : 'var(--color-foreground, #19261F)',
                      backgroundColor: isActive ? 'var(--brand-citron, #D7EE83)' : 'transparent',
                      minHeight: '44px',
                    })}
                  >
                    <Compass size={18} />
                    <span>How It Works</span>
                  </NavLink>

                  <NavLink
                    to="/corridors-and-legal"
                    onClick={() => setMobileMenuOpen(false)}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.625rem 1rem',
                      borderRadius: 'var(--radius-control, 12px)',
                      fontSize: '0.875rem',
                      fontWeight: isActive ? 700 : 500,
                      textDecoration: 'none',
                      color: isActive ? '#19261F' : 'var(--color-foreground, #19261F)',
                      backgroundColor: isActive ? 'var(--brand-citron, #D7EE83)' : 'transparent',
                      minHeight: '44px',
                    })}
                  >
                    <ShieldCheck size={18} />
                    <span>Country Corridors</span>
                  </NavLink>

                  <NavLink
                    to="/help"
                    onClick={() => setMobileMenuOpen(false)}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.625rem 1rem',
                      borderRadius: 'var(--radius-control, 12px)',
                      fontSize: '0.875rem',
                      fontWeight: isActive ? 700 : 500,
                      textDecoration: 'none',
                      color: isActive ? '#19261F' : 'var(--color-foreground, #19261F)',
                      backgroundColor: isActive ? 'var(--brand-citron, #D7EE83)' : 'transparent',
                      minHeight: '44px',
                    })}
                  >
                    <CircleHelp size={18} />
                    <span>Help Centre</span>
                  </NavLink>

                  <NavLink
                    to="/support-desk"
                    onClick={() => setMobileMenuOpen(false)}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.625rem 1rem',
                      borderRadius: 'var(--radius-control, 12px)',
                      fontSize: '0.875rem',
                      fontWeight: isActive ? 700 : 500,
                      textDecoration: 'none',
                      color: isActive ? '#19261F' : 'var(--color-foreground, #19261F)',
                      backgroundColor: isActive ? 'var(--brand-citron, #D7EE83)' : 'transparent',
                      minHeight: '44px',
                    })}
                  >
                    <MessageSquare size={18} />
                    <span>Support Desk</span>
                  </NavLink>

                  <NavLink
                    to="/request-status"
                    onClick={() => setMobileMenuOpen(false)}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.625rem 1rem',
                      borderRadius: 'var(--radius-control, 12px)',
                      fontSize: '0.875rem',
                      fontWeight: isActive ? 700 : 500,
                      textDecoration: 'none',
                      color: isActive ? '#19261F' : 'var(--color-foreground, #19261F)',
                      backgroundColor: isActive ? 'var(--brand-citron, #D7EE83)' : 'transparent',
                      minHeight: '44px',
                    })}
                  >
                    <Clock size={18} />
                    <span>Request Status</span>
                  </NavLink>
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div style={{ padding: '1.25rem', borderTop: '1px solid var(--border-subtle, #E1E8DE)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {isVisitor ? (
                <>
                  <Link
                    to={ROUTES.SIGN_IN}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-control, 16px)',
                      border: '1px solid var(--border-subtle, #E1E8DE)',
                      color: 'var(--color-foreground, #19261F)',
                      textDecoration: 'none',
                      fontWeight: 600,
                      fontSize: '0.9375rem',
                      minHeight: '48px',
                    }}
                  >
                    <LogIn size={18} />
                    <span>Sign in</span>
                  </Link>
                  <Link
                    to={ROUTES.SIGN_UP}
                    onClick={() => setMobileMenuOpen(false)}
                    aria-label="Sign up"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-control, 16px)',
                      backgroundColor: 'var(--action-primary, #245B42)',
                      color: 'var(--color-on-primary, #FFFFFF)',
                      textDecoration: 'none',
                      fontWeight: 700,
                      fontSize: '0.9375rem',
                      minHeight: '48px',
                    }}
                  >
                    <UserPlus size={18} />
                    <span>Create Free Account</span>
                  </Link>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: 'var(--radius-pill, 9999px)',
                        backgroundColor: 'var(--action-primary, #245B42)',
                        color: 'var(--color-on-primary, #FFFFFF)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.875rem',
                        fontWeight: 700,
                      }}
                    >
                      {initial}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted, #55635A)' }}>{currentRole.replace('_', ' ')}</span>
                    </div>
                  </div>

                  {currentRole === 'explorer' && (
                    <Link
                      to="/request-guidance"
                      onClick={() => setMobileMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-control, 16px)',
                        backgroundColor: 'var(--action-primary, #245B42)',
                        color: 'var(--color-on-primary, #FFFFFF)',
                        textDecoration: 'none',
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        minHeight: '44px',
                      }}
                    >
                      <Sparkles size={16} />
                      <span>Request Managed Guidance</span>
                    </Link>
                  )}

                  {currentRole === 'managed_student' && (
                    <Link
                      to="/student"
                      onClick={() => setMobileMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-control, 16px)',
                        backgroundColor: 'var(--action-primary, #245B42)',
                        color: 'var(--color-on-primary, #FFFFFF)',
                        textDecoration: 'none',
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        minHeight: '44px',
                      }}
                    >
                      <GraduationCap size={16} />
                      <span>Open Workspace</span>
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleSignOut();
                    }}
                    title="Sign out of account"
                    aria-label="Sign out"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '0.625rem',
                      borderRadius: 'var(--radius-control, 16px)',
                      border: '1px solid var(--border-subtle, #E1E8DE)',
                      color: '#C53030',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      minHeight: '44px',
                      backgroundColor: 'transparent',
                    }}
                  >
                    <LogOut size={16} />
                    <span>Sign out</span>
                  </button>
                </>
              )}
              {/* Theme Toggle Switcher */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.625rem 0.875rem',
                  borderRadius: 'var(--radius-control, 14px)',
                  backgroundColor: 'var(--surface-card, #FFFFFF)',
                  border: '1px solid var(--border-subtle, #E1E8DE)',
                  marginTop: '0.5rem',
                }}
              >
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-foreground, #19261F)' }}>
                  Theme ({resolvedTheme === 'dark' ? 'Dark' : 'Light'})
                </span>
                <button
                  type="button"
                  id="mobile-theme-toggle-btn"
                  onClick={toggleTheme}
                  aria-label={resolvedTheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.4rem 0.75rem',
                    borderRadius: 'var(--radius-pill, 9999px)',
                    backgroundColor: 'var(--surface-canvas, #F6F8F5)',
                    border: '1px solid var(--border-subtle, #E1E8DE)',
                    color: 'var(--color-foreground, #19261F)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {resolvedTheme === 'dark' ? (
                    <>
                      <Sun size={14} style={{ color: 'var(--brand-citron, #D7EE83)' }} aria-hidden="true" />
                      <span>Light</span>
                    </>
                  ) : (
                    <>
                      <Moon size={14} style={{ color: 'var(--action-primary, #245B42)' }} aria-hidden="true" />
                      <span>Dark</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Quick Search Dialog Modal */}
      <SearchDialog
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        currentRole={currentRole}
      />
    </>
  );
};

export default PublicNavbar;
