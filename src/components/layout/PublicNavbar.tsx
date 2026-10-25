import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { UserRole } from '@/types';
import { ROUTES } from '@/config/routes';
import {
  Menu,
  X,
  Compass,
  Mail,
  Home,
  LogIn,
  UserPlus,
} from 'lucide-react';

interface PublicNavbarProps {
  currentRole?: UserRole;
  onRoleChange?: (newRole: UserRole) => void;
}

const LOCAL_LOGO = '/images/unilistics/unilistics-logo.png';
const FALLBACK_LOGO =
  'https://lh3.googleusercontent.com/aida/AEtjO1XZO1prPEcg9JZ7p5bs_YGqOXor3IiGvli7iEnlFMk-lBAQZE8Ljo_0_u5Ljx3BRtoVrjKmvtp6xEgQcN8Zs9ajrhGd4Kyi55QMS8slvDM2xS6950IfaeqfQFPLFT78_3FHSgzNk19R4CBSJ8CDR-du8zCcxRH0FdLAtirwHO-UME2_Ve9jzZuKbswwg1xGp1guNigeRxRC41avkLu0Ys1WNzvhrv3CiBqBBt9x25H4cOQ_B6-qu-3oMyI';

export const PublicNavbar: React.FC<PublicNavbarProps> = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  const location = useLocation();
  const drawerRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Keyboard accessibility: Escape key and focus management
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
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
        className="fixed top-0 left-0 right-0 z-50 bg-[#FBF9F5]/90 backdrop-blur-xl border-b border-[#E8E8EA] shadow-[0_2px_12px_rgba(26,28,30,0.04)]"
        role="banner"
      >
        <div className="h-20 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* 1. Brand Logo & Home */}
          <Link
            to={ROUTES.HOME}
            id="public-nav-brand-logo"
            className="flex items-center gap-2.5 no-underline flex-shrink-0 group focus-visible:outline-2 focus-visible:outline-primary rounded-lg p-1"
            aria-label="Unilistics Home"
          >
            {!logoFailed ? (
              <img
                alt="Unilistics Logo"
                className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
                src={LOCAL_LOGO}
                onError={() => {
                  const img = new Image();
                  img.src = FALLBACK_LOGO;
                  img.onload = () => {
                    const el = document.getElementById('public-unilistics-nav-logo') as HTMLImageElement;
                    if (el) el.src = FALLBACK_LOGO;
                  };
                  img.onerror = () => setLogoFailed(true);
                }}
                id="public-unilistics-nav-logo"
              />
            ) : (
              <div
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FF5E36] to-[#B42901] flex items-center justify-center text-white font-black text-sm shadow-sm"
                aria-hidden="true"
              >
                U
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight font-bold leading-none">
                Unilistics
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant/70 leading-tight mt-0.5 hidden sm:block">
                Europe Higher Ed
              </span>
            </div>
          </Link>

          {/* 2. Desktop Primary Navigation Pills */}
          <nav
            className="hidden md:flex items-center gap-1.5 p-1 bg-surface-container-low/80 rounded-full border border-surface-container shadow-[0_1px_3px_rgba(26,28,30,0.02)]"
            aria-label="Public Navigation"
          >
            {/* Home */}
            <NavLink
              to={ROUTES.HOME}
              end
              id="public-nav-home-link"
              className={({ isActive }) =>
                `px-4 py-2 rounded-full transition-all text-sm font-semibold no-underline focus-visible:ring-2 focus-visible:ring-primary ${
                  isActive
                    ? 'bg-primary text-white shadow-[0_4px_16px_-2px_rgba(255,94,54,0.3)]'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-lowest'
                }`
              }
            >
              Home
            </NavLink>

            {/* Explore Universities */}
            <NavLink
              to={ROUTES.UNIVERSITIES}
              id="public-nav-universities-link"
              className={({ isActive }) =>
                `px-4 py-2 rounded-full transition-all text-sm font-semibold no-underline focus-visible:ring-2 focus-visible:ring-primary ${
                  isActive
                    ? 'bg-primary text-white shadow-[0_4px_16px_-2px_rgba(255,94,54,0.3)]'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-lowest'
                }`
              }
            >
              Explore Universities
            </NavLink>

            {/* Contact */}
            <NavLink
              to={ROUTES.CONTACT}
              id="public-nav-contact-link"
              className={({ isActive }) =>
                `px-4 py-2 rounded-full transition-all text-sm font-semibold no-underline focus-visible:ring-2 focus-visible:ring-primary ${
                  isActive
                    ? 'bg-primary text-white shadow-[0_4px_16px_-2px_rgba(255,94,54,0.3)]'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-lowest'
                }`
              }
            >
              Contact
            </NavLink>
          </nav>

          {/* 3. Desktop Authentication Actions */}
          <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
            {/* Sign in */}
            <Link
              to={ROUTES.SIGN_IN}
              id="public-nav-signin-btn"
              className="px-4 py-2 text-sm font-bold text-on-surface hover:text-primary transition-colors no-underline rounded-full hover:bg-surface-container-low focus-visible:ring-2 focus-visible:ring-primary"
            >
              Sign in
            </Link>

            {/* Sign up (Visually Prominent) */}
            <Link
              to={ROUTES.SIGN_UP}
              id="public-nav-signup-btn"
              className="px-5 py-2.5 rounded-full text-sm font-bold text-white bg-gradient-to-r from-[#FF5E36] to-[#B42901] hover:opacity-95 shadow-[0_3px_10px_rgba(255,87,51,0.25)] hover:shadow-[0_6px_16px_rgba(255,87,51,0.35)] active:scale-95 transition-all no-underline focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Sign up
            </Link>
          </div>

          {/* 4. Mobile Menu Trigger Button */}
          <button
            ref={menuButtonRef}
            type="button"
            id="public-nav-mobile-menu-btn"
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 rounded-full text-on-surface hover:bg-surface-container-low transition-colors focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Open navigation menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="public-mobile-drawer"
          >
            <Menu size={24} aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* 5. Accessible Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden bg-black/40 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        >
          <div
            ref={drawerRef}
            id="public-mobile-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            className="w-[300px] max-w-[85vw] h-full bg-[#FBF9F5] shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              {/* Drawer Top Header */}
              <div className="flex items-center justify-between pb-5 border-b border-surface-container">
                <Link
                  to={ROUTES.HOME}
                  className="flex items-center gap-2 no-underline"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <img alt="Unilistics Logo" className="h-7 w-auto object-contain" src={LOCAL_LOGO} />
                  <span className="font-headline-sm text-base text-on-surface font-bold">Unilistics</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-full text-on-surface-variant hover:bg-surface-container focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label="Close navigation menu"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Mobile Primary Navigation Links */}
              <nav className="flex flex-col gap-1.5 py-6" aria-label="Mobile Navigation">
                <NavLink
                  to={ROUTES.HOME}
                  end
                  id="mobile-nav-home-link"
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-xl text-sm font-bold no-underline flex items-center gap-3 transition-colors ${
                      isActive ? 'bg-primary text-white shadow-sm' : 'text-on-surface hover:bg-surface-container'
                    }`
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Home size={18} aria-hidden="true" />
                  <span>Home</span>
                </NavLink>

                <NavLink
                  to={ROUTES.UNIVERSITIES}
                  id="mobile-nav-universities-link"
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-xl text-sm font-bold no-underline flex items-center gap-3 transition-colors ${
                      isActive ? 'bg-primary text-white shadow-sm' : 'text-on-surface hover:bg-surface-container'
                    }`
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Compass size={18} aria-hidden="true" />
                  <span>Explore Universities</span>
                </NavLink>

                <NavLink
                  to={ROUTES.CONTACT}
                  id="mobile-nav-contact-link"
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-xl text-sm font-bold no-underline flex items-center gap-3 transition-colors ${
                      isActive ? 'bg-primary text-white shadow-sm' : 'text-on-surface hover:bg-surface-container'
                    }`
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Mail size={18} aria-hidden="true" />
                  <span>Contact</span>
                </NavLink>
              </nav>
            </div>

            {/* Mobile Authentication Actions */}
            <div className="pt-6 border-t border-surface-container flex flex-col gap-2.5">
              <Link
                to={ROUTES.SIGN_IN}
                id="mobile-nav-signin-btn"
                className="w-full py-2.5 rounded-xl text-center text-sm font-bold text-on-surface bg-white border border-surface-container hover:bg-surface-container transition-colors no-underline flex items-center justify-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <LogIn size={16} />
                <span>Sign in</span>
              </Link>

              <Link
                to={ROUTES.SIGN_UP}
                id="mobile-nav-signup-btn"
                className="w-full py-2.5 rounded-xl text-center text-sm font-bold text-white bg-gradient-to-r from-[#FF5E36] to-[#B42901] shadow-sm hover:opacity-95 transition-opacity no-underline flex items-center justify-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <UserPlus size={16} />
                <span>Sign up</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
