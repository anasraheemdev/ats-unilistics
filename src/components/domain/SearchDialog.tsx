import React, { useState, useEffect, useRef, useId } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '@/types';
import {
  Search,
  X,
  Compass,
  Building2,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Clock,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';

export interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole?: UserRole;
  userId?: string;
}

export type SearchCategory = 'everything' | 'destinations' | 'universities' | 'programmes' | 'scholarships';

interface CategoryTile {
  id: SearchCategory;
  label: string;
  icon: React.ComponentType<{ size?: number | string; className?: string; style?: React.CSSProperties }>;
  supported: boolean;
}

export const SearchDialog: React.FC<SearchDialogProps> = ({
  isOpen,
  onClose,
  currentRole = 'visitor',
  userId = 'anonymous',
}) => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const searchInputId = useId();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SearchCategory>('everything');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [unsupportedNotice, setUnsupportedNotice] = useState<string | null>(null);

  // Storage key isolated per real user
  const recentStorageKey = `unilistics_recent_searches_${userId || 'anonymous'}`;

  // Load real user recent searches on mount / open
  useEffect(() => {
    if (isOpen) {
      try {
        const stored = localStorage.getItem(recentStorageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setRecentSearches(parsed.slice(0, 5));
          }
        }
      } catch {
        setRecentSearches([]);
      }
      setUnsupportedNotice(null);
    }
  }, [isOpen, recentStorageKey]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Focus trap & Escape key dismissal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab' && dialogRef.current) {
        const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Save new search query to user's real history
  const recordRecentSearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    try {
      const updated = [trimmed, ...recentSearches.filter((q) => q.toLowerCase() !== trimmed.toLowerCase())].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem(recentStorageKey, JSON.stringify(updated));
    } catch {
      // Ignore quota errors
    }
  };

  const handleExecuteSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      recordRecentSearch(trimmed);
    }

    onClose();

    // Route according to active category and role
    const isStudent = currentRole === 'managed_student';
    const baseExplore = isStudent ? '/student/explore' : '/universities';

    if (selectedCategory === 'destinations') {
      // Disclose federated destination scope
      navigate(`${baseExplore}?search=${encodeURIComponent(trimmed)}`);
    } else if (selectedCategory === 'universities') {
      navigate(`${baseExplore}?search=${encodeURIComponent(trimmed)}`);
    } else if (selectedCategory === 'programmes') {
      navigate(`/programs?search=${encodeURIComponent(trimmed)}`);
    } else if (selectedCategory === 'scholarships') {
      const scholPath = isStudent ? '/student/scholarships' : '/scholarships';
      navigate(`${scholPath}?search=${encodeURIComponent(trimmed)}`);
    } else {
      // Everything default
      navigate(`${baseExplore}?search=${encodeURIComponent(trimmed)}`);
    }
  };

  const handleSelectRecent = (query: string) => {
    setSearchQuery(query);
    recordRecentSearch(query);
    onClose();
    const isStudent = currentRole === 'managed_student';
    navigate(`${isStudent ? '/student/explore' : '/universities'}?search=${encodeURIComponent(query)}`);
  };

  const handleClearHistory = () => {
    try {
      localStorage.removeItem(recentStorageKey);
      setRecentSearches([]);
    } catch {
      // Ignore
    }
  };

  const categories: CategoryTile[] = [
    { id: 'everything', label: 'Everything', icon: Compass, supported: true },
    { id: 'destinations', label: 'Destinations', icon: Compass, supported: true },
    { id: 'universities', label: 'Universities', icon: Building2, supported: true },
    { id: 'programmes', label: 'Programmes', icon: GraduationCap, supported: true },
    { id: 'scholarships', label: 'Scholarships', icon: Sparkles, supported: true },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(13, 21, 17, 0.72)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '1.5rem 1rem',
        overflowY: 'auto',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Global Search"
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: 'var(--surface-card, #FFFFFF)',
          color: 'var(--color-foreground, #19261F)',
          borderRadius: 'var(--radius-card, 24px)',
          border: '1px solid var(--border-subtle, #E1E8DE)',
          boxShadow: '0 20px 40px -8px rgba(13, 21, 17, 0.28)',
          overflow: 'hidden',
          fontFamily: 'var(--font-family-base, "DM Sans", sans-serif)',
          marginTop: '10vh',
          animation: 'fade-in 150ms ease-out',
        }}
      >
        {/* 1. Pill Search Header matching Screenshot 3 */}
        <form
          onSubmit={handleExecuteSearch}
          style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--border-subtle, #E1E8DE)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            backgroundColor: 'var(--surface-card, #FFFFFF)',
          }}
        >
          <Search size={20} style={{ color: 'var(--text-muted, #58695E)', flexShrink: 0 }} aria-hidden="true" />
          <input
            ref={inputRef}
            id={searchInputId}
            type="search"
            value={searchQuery}
            onChange={(e) => {
              const val = e.target.value;
              setSearchQuery(val);
              if (currentRole === 'visitor' && /casework|dossier|visa appointment/i.test(val)) {
                setUnsupportedNotice(
                  'Anonymous visitors can explore public destination corridors and universities. Student casework and dossiers require an approved account.'
                );
              } else {
                setUnsupportedNotice(null);
              }
            }}
            placeholder="Search universities, programs, or destinations..."
            aria-label="Search universities, programs, or destinations"
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              fontSize: '1rem',
              color: 'var(--color-foreground, #19261F)',
              outline: 'none',
              fontWeight: 500,
            }}
          />

          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                inputRef.current?.focus();
              }}
              aria-label="Clear search input"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted, #58695E)',
                padding: '0.25rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
              }}
            >
              <X size={16} />
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            aria-label="Close search dialog"
            style={{
              background: 'var(--surface-recessed, #EDF2E9)',
              border: '1px solid var(--border-subtle, #E1E8DE)',
              color: 'var(--color-foreground, #19261F)',
              padding: '0.375rem 0.625rem',
              borderRadius: 'var(--radius-pill, 9999px)',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <span>Esc</span>
            <X size={14} />
          </button>
        </form>

        {/* 2. Disclose Unsupported Scope if triggered */}
        {unsupportedNotice && (
          <div
            style={{
              padding: '0.75rem 1.25rem',
              backgroundColor: 'rgba(217, 119, 6, 0.08)',
              borderBottom: '1px solid rgba(217, 119, 6, 0.2)',
              color: '#B45309',
              fontSize: '0.8125rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <ShieldAlert size={16} style={{ flexShrink: 0 }} />
            <span>{unsupportedNotice}</span>
          </div>
        )}

        <div style={{ padding: '1.25rem', maxHeight: '65vh', overflowY: 'auto' }}>
          {/* 3. Category Filter Tiles ("I'm looking for...") matching Screenshot 3 */}
          <div style={{ marginBottom: '1.5rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--text-muted, #58695E)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                display: 'block',
                marginBottom: '0.75rem',
              }}
            >
              I'm looking for...
            </span>

            {/* 2-column tiles on mobile where they fit */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '0.5rem',
              }}
              role="radiogroup"
              aria-label="Search Category"
            >
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setUnsupportedNotice(null);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.625rem 0.875rem',
                      borderRadius: 'var(--radius-control, 16px)',
                      border: isSelected
                        ? '1px solid var(--brand-forest, #245B42)'
                        : '1px solid var(--border-subtle, #E1E8DE)',
                      backgroundColor: isSelected
                        ? 'var(--brand-forest, #245B42)'
                        : 'var(--surface-recessed, #EDF2E9)',
                      color: isSelected ? '#FFFFFF' : 'var(--color-foreground, #19261F)',
                      fontSize: '0.8125rem',
                      fontWeight: isSelected ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 150ms ease-out',
                      textAlign: 'left',
                    }}
                  >
                    <Icon size={16} style={{ color: isSelected ? 'var(--brand-citron, #D7EE83)' : 'inherit' }} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Recent Searches (real user history only, zero cross-account leakage) */}
          {recentSearches.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--text-muted, #58695E)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  Recent Searches
                </span>
                <button
                  type="button"
                  onClick={handleClearHistory}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '0.6875rem',
                    color: 'var(--text-muted, #58695E)',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Clear history
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                {recentSearches.map((term, idx) => (
                  <button
                    key={`${term}-${idx}`}
                    type="button"
                    onClick={() => handleSelectRecent(term)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-control, 16px)',
                      backgroundColor: 'transparent',
                      border: '1px solid transparent',
                      color: 'var(--color-foreground, #19261F)',
                      fontSize: '0.8125rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 120ms ease-out',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--surface-recessed, #EDF2E9)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={14} style={{ color: 'var(--text-muted, #58695E)' }} />
                      <span>{term}</span>
                    </div>
                    <ArrowRight size={13} style={{ color: 'var(--text-muted, #58695E)' }} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 5. Restrained Search Illustration & Explanatory Copy matching Screenshot 3 */}
          <div
            style={{
              padding: '1.25rem',
              backgroundColor: 'var(--surface-recessed, #EDF2E9)',
              borderRadius: 'var(--radius-control, 16px)',
              border: '1px solid var(--border-subtle, #E1E8DE)',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            {/* Restrained vector illustration in Sage, Citron, and Forest */}
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'var(--brand-sage, #B4D0B6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
              aria-hidden="true"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="14" height="18" rx="2" fill="#245B42" opacity="0.8" />
                <path d="M7 7H13M7 11H13M7 15H11" stroke="#D7EE83" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="16" cy="16" r="4" fill="#D7EE83" stroke="#245B42" strokeWidth="1.5" />
                <path d="M19 19L22 22" stroke="#245B42" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>

            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0, color: 'var(--color-foreground, #19261F)' }}>
                Find your next study option
              </h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted, #58695E)', margin: '0.25rem 0 0 0', lineHeight: 1.4 }}>
                Search accredited English-taught degrees and verified admissions pathways across Germany, France, Italy, and Romania.
              </p>
            </div>
          </div>

          {/* 6. Plain Quick-Action Rows matching Screenshot 3 */}
          <div>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--text-muted, #58695E)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                display: 'block',
                marginBottom: '0.5rem',
              }}
            >
              Quick Actions
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate(currentRole === 'managed_student' ? '/student/explore' : '/universities');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.625rem 0.875rem',
                  borderRadius: 'var(--radius-control, 16px)',
                  backgroundColor: 'rgba(36, 91, 66, 0.08)',
                  border: '1px solid rgba(36, 91, 66, 0.15)',
                  color: 'var(--brand-forest, #245B42)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Building2 size={16} />
                  <span>Browse universities & colleges</span>
                </div>
                <ArrowRight size={14} />
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/programs');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.625rem 0.875rem',
                  borderRadius: 'var(--radius-control, 16px)',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border-subtle, #E1E8DE)',
                  color: 'var(--color-foreground, #19261F)',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <GraduationCap size={16} />
                  <span>Explore master's degree programs</span>
                </div>
                <ArrowRight size={14} />
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate(currentRole === 'managed_student' ? '/student/scholarships' : '/scholarships');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.625rem 0.875rem',
                  borderRadius: 'var(--radius-control, 16px)',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border-subtle, #E1E8DE)',
                  color: 'var(--color-foreground, #19261F)',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={16} />
                  <span>View scholarships & regional funding</span>
                </div>
                <ArrowRight size={14} />
              </button>

              {currentRole === 'explorer' && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate('/request-support');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.625rem 0.875rem',
                    borderRadius: 'var(--radius-control, 16px)',
                    backgroundColor: 'transparent',
                    border: '1px solid var(--border-subtle, #E1E8DE)',
                    color: 'var(--color-foreground, #19261F)',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Compass size={16} />
                    <span>Request managed admissions guidance</span>
                  </div>
                  <ExternalLink size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer info strip */}
        <div
          style={{
            padding: '0.75rem 1.25rem',
            backgroundColor: 'var(--surface-recessed, #EDF2E9)',
            borderTop: '1px solid var(--border-subtle, #E1E8DE)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: 'var(--text-muted, #58695E)',
          }}
        >
          <span>Corridors: Germany, France, Italy, Romania</span>
          <span>Press Enter to search</span>
        </div>
      </div>
    </div>
  );
};
