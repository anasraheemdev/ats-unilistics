import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { House, Compass, Bookmark, Map, Settings, LucideProps } from 'lucide-react';

interface DockItem {
  id: string;
  label: string;
  path: string;
  icon: React.ComponentType<LucideProps>;
  end?: boolean;
  isJourney?: boolean;
}

const DOCK_ITEMS: DockItem[] = [
  { id: 'dock-today', label: 'Today', path: '/student', end: true },
  { id: 'dock-discover', label: 'Discover', path: '/student/explore' },
  { id: 'dock-saved', label: 'Saved', path: '/student/saved' },
  { id: 'dock-journey', label: 'Journey', path: '/student/journey', isJourney: true },
  { id: 'dock-settings', label: 'Settings', path: '/student/account' },
].map((item) => {
  const iconMap: Record<string, React.ComponentType<LucideProps>> = {
    'dock-today': House,
    'dock-discover': Compass,
    'dock-saved': Bookmark,
    'dock-journey': Map,
    'dock-settings': Settings,
  };
  return { ...item, icon: iconMap[item.id] };
});

export const StudentBottomDock: React.FC = () => {
  const location = useLocation();

  // Helper to determine if the Journey tab should be considered active across casework subroutes
  const isCaseworkActive = (pathname: string) => {
    return (
      pathname.startsWith('/student/journey') ||
      pathname.startsWith('/student/applications') ||
      pathname.startsWith('/student/documents') ||
      pathname.startsWith('/student/tasks') ||
      pathname.startsWith('/student/messages')
    );
  };

  return (
    <nav
      aria-label="Student mobile navigation dock"
      className="mobile-only-dock"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: '#0D1511',
        borderTop: '1px solid #203327',
        boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.24)',
        paddingTop: '0.375rem',
        paddingBottom: 'calc(0.375rem + env(safe-area-inset-bottom, 0px))',
        fontFamily: 'var(--font-family-base, "DM Sans", sans-serif)',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          alignItems: 'center',
          maxWidth: '520px',
          margin: '0 auto',
          padding: '0 0.5rem',
        }}
      >
        {DOCK_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = item.isJourney
            ? isCaseworkActive(location.pathname)
            : item.end
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path);

          return (
            <Link
              key={item.id}
              to={item.path}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.2rem',
                minHeight: '48px',
                padding: '0.25rem 0.25rem',
                textDecoration: 'none',
                color: active ? '#19261F' : '#8DA394',
                transition: 'all 150ms ease-out',
                position: 'relative',
              }}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  backgroundColor: active ? '#D7EE83' : 'transparent',
                  color: active ? '#19261F' : 'currentColor',
                  transition: 'background-color 150ms ease-out, color 150ms ease-out',
                }}
              >
                <Icon size={20} strokeWidth={active ? 2.25 : 1.75} aria-hidden={true} />
              </div>
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: active ? 700 : 500,
                  color: active ? '#D7EE83' : '#8DA394',
                  letterSpacing: '0.01em',
                }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default StudentBottomDock;
