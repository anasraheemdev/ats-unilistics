import React from 'react';
import { NavLink } from 'react-router-dom';
import { Map, GraduationCap, FileText, Clock, MessageSquare } from 'lucide-react';

interface JourneyNavProps {
  taskBadge?: number;
  messageBadge?: number;
}

export const StudentJourneyNav: React.FC<JourneyNavProps> = ({ taskBadge, messageBadge }) => {
  const tabs = [
    { label: 'Journey Map', path: '/student/journey', icon: Map },
    { label: 'Applications', path: '/student/applications', icon: GraduationCap },
    { label: 'Documents', path: '/student/documents', icon: FileText },
    { label: 'Tasks & Deadlines', path: '/student/tasks', icon: Clock, badge: taskBadge },
    { label: 'Messages', path: '/student/messages', icon: MessageSquare, badge: messageBadge },
  ];

  return (
    <div
      role="navigation"
      aria-label="Student Journey Casework Navigation"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.375rem',
        backgroundColor: 'var(--surface-recessed, #EDF2E9)',
        borderRadius: 'var(--radius-control, 16px)',
        border: '1px solid var(--border-subtle, #E1E8DE)',
        marginBottom: '1.5rem',
        overflowX: 'auto',
        scrollbarWidth: 'none',
      }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <NavLink
            key={tab.path}
            to={tab.path}
            style={({ isActive }) => ({
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-pill, 9999px)',
              fontSize: '0.8125rem',
              fontWeight: isActive ? 600 : 500,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              minHeight: '40px',
              backgroundColor: isActive ? 'var(--action-primary, #245B42)' : 'transparent',
              color: isActive ? '#FFFFFF' : 'var(--text-ink, #19261F)',
              transition: 'all 150ms ease-out',
            })}
          >
            <Icon size={16} strokeWidth={2} aria-hidden={true} />
            <span>{tab.label}</span>
            {tab.badge !== undefined && tab.badge > 0 && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '18px',
                  height: '18px',
                  padding: '0 0.35rem',
                  borderRadius: '9999px',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  backgroundColor: 'var(--brand-citron, #D7EE83)',
                  color: '#19261F',
                }}
              >
                {tab.badge}
              </span>
            )}
          </NavLink>
        );
      })}
    </div>
  );
};

export default StudentJourneyNav;
