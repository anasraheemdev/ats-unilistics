import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { LoadingState } from '@/components/common/LoadingState';
import { useTheme } from '@/lib/theme';
import {
  User,
  ShieldCheck,
  Mail,
  MapPin,
  GraduationCap,
  Sparkles,
  ChevronRight,
  Moon,
  Sun,
  Lock,
  Bell,
  HelpCircle,
  FileText,
  LogOut,
  CheckCircle2,
  X,
  KeyRound,
} from 'lucide-react';

export const ExplorerAccountPage: React.FC = () => {
  const navigate = useNavigate();
  const { resolvedTheme, toggleTheme } = useTheme();

  const { data: user, isLoading } = useQuery({
    queryKey: ['current-user-profile'],
    queryFn: () => api.auth.getCurrentUser(),
  });

  const [activeModal, setActiveModal] = useState<'personal' | 'security' | 'notifications' | null>(null);
  const [securitySuccess, setSecuritySuccess] = useState<string | null>(null);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [caseworkAlerts, setCaseworkAlerts] = useState(true);

  if (isLoading || !user) {
    return <LoadingState message="Loading your account profile and settings..." />;
  }

  const initials = user.fullName
    ? user.fullName
        .split(' ')
        .map((p) => p.charAt(0))
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U';

  const roleLabel =
    user.role === 'managed_student'
      ? 'Managed Student'
      : user.role === 'counsellor' || user.role === 'admin' || user.role === 'super_admin'
      ? 'Staff Member'
      : 'Approved Explorer';

  const handleSignOut = async () => {
    await api.auth.signOut();
    navigate('/sign-in');
  };

  return (
    <div
      style={{
        maxWidth: '760px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        fontFamily: 'var(--font-family-base, "DM Sans", sans-serif)',
        color: 'var(--color-foreground)',
        paddingBottom: '3rem',
      }}
    >
      {/* Page Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.2rem 0.65rem',
              borderRadius: 'var(--radius-pill, 9999px)',
              backgroundColor: 'rgba(36, 91, 66, 0.08)',
              color: 'var(--color-primary, #245B42)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Settings & Profile
          </span>
        </div>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--color-foreground)', margin: 0, letterSpacing: '-0.02em' }}>
          Account & Preferences
        </h1>
        <p style={{ color: 'var(--color-foreground-muted)', fontSize: '0.9375rem', marginTop: '0.35rem', marginBottom: 0 }}>
          Manage your verified credentials, security settings, interface theme, and advisory support options.
        </p>
      </div>

      {/* Top Airy Profile Card matching Screenshot 4 */}
      <div
        className="bento-card"
        style={{
          padding: '1.75rem',
          backgroundColor: 'var(--surface-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.25rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--action-primary, #245B42)',
              color: 'var(--color-on-primary, #FFFFFF)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.5rem',
              boxShadow: 'var(--shadow-sm)',
              flexShrink: 0,
            }}
            aria-hidden="true"
          >
            {initials}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--color-foreground)' }}>
                {user.fullName || 'Student Applicant'}
              </h2>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.625rem',
                  borderRadius: 'var(--radius-pill, 9999px)',
                  backgroundColor: 'rgba(36, 91, 66, 0.08)',
                  color: 'var(--color-primary, #245B42)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <ShieldCheck size={13} strokeWidth={2.5} /> {roleLabel}
              </span>
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-foreground-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>{user.email}</span>
              {user.city && <span>• {user.city}</span>}
            </div>
          </div>
        </div>

        {user.role === 'explorer' && (
          <Link to="/explorer/request-support" style={{ textDecoration: 'none' }}>
            <button
              type="button"
              className="btn-pill-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1.125rem',
                fontSize: '0.8125rem',
                fontWeight: 700,
                cursor: 'pointer',
                borderRadius: 'var(--radius-pill, 9999px)',
                backgroundColor: 'var(--action-primary)',
                color: 'var(--color-on-primary)',
                border: 'none',
              }}
            >
              <Sparkles size={14} /> Upgrade to Managed Casework
            </button>
          </Link>
        )}
      </div>

      {/* Group 1: Account Settings */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        <h3
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--color-foreground-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            margin: '0 0 0 0.5rem',
          }}
        >
          Account
        </h3>
        <div
          style={{
            backgroundColor: 'var(--surface-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '20px',
            overflow: 'hidden',
          }}
        >
          {/* Personal Information Row */}
          <button
            type="button"
            onClick={() => setActiveModal('personal')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.125rem 1.25rem',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: '1px solid var(--border-subtle)',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background-color var(--transition-fast)',
            }}
            className="hover:bg-[var(--surface-recessed)]"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(36, 91, 66, 0.08)',
                  color: 'var(--color-primary, #245B42)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <User size={18} strokeWidth={2} />
              </div>
              <div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-foreground)' }}>
                  Personal information
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted)', marginTop: '0.125rem' }}>
                  Full name, academic records, contact email and residence
                </div>
              </div>
            </div>
            <ChevronRight size={18} strokeWidth={2} style={{ color: 'var(--color-foreground-muted)' }} />
          </button>

          {/* Login & Security Row */}
          <button
            type="button"
            onClick={() => setActiveModal('security')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.125rem 1.25rem',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background-color var(--transition-fast)',
            }}
            className="hover:bg-[var(--surface-recessed)]"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(36, 91, 66, 0.08)',
                  color: 'var(--color-primary, #245B42)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Lock size={18} strokeWidth={2} />
              </div>
              <div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-foreground)' }}>
                  Login & security
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted)', marginTop: '0.125rem' }}>
                  Password protection, session security and authentication credentials
                </div>
              </div>
            </div>
            <ChevronRight size={18} strokeWidth={2} style={{ color: 'var(--color-foreground-muted)' }} />
          </button>
        </div>
      </div>

      {/* Group 2: Preferences */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        <h3
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--color-foreground-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            margin: '0 0 0 0.5rem',
          }}
        >
          Preferences
        </h3>
        <div
          style={{
            backgroundColor: 'var(--surface-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '20px',
            overflow: 'hidden',
          }}
        >
          {/* Appearance Switcher Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.125rem 1.25rem',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(36, 91, 66, 0.08)',
                  color: 'var(--color-primary, #245B42)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {resolvedTheme === 'dark' ? <Moon size={18} strokeWidth={2} /> : <Sun size={18} strokeWidth={2} />}
              </div>
              <div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-foreground)' }}>
                  Appearance
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted)', marginTop: '0.125rem' }}>
                  System theme ({resolvedTheme === 'dark' ? 'Dark mode' : 'Light mode'} active)
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.4rem 0.875rem',
                borderRadius: 'var(--radius-pill, 9999px)',
                backgroundColor: 'var(--surface-recessed)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--color-foreground)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {resolvedTheme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
              <span>{resolvedTheme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}</span>
            </button>
          </div>

          {/* Notifications Row */}
          <button
            type="button"
            onClick={() => setActiveModal('notifications')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.125rem 1.25rem',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background-color var(--transition-fast)',
            }}
            className="hover:bg-[var(--surface-recessed)]"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(36, 91, 66, 0.08)',
                  color: 'var(--color-primary, #245B42)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Bell size={18} strokeWidth={2} />
              </div>
              <div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-foreground)' }}>
                  Notifications
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted)', marginTop: '0.125rem' }}>
                  Casework deadlines, document review alerts and announcements
                </div>
              </div>
            </div>
            <ChevronRight size={18} strokeWidth={2} style={{ color: 'var(--color-foreground-muted)' }} />
          </button>
        </div>
      </div>

      {/* Group 3: Privacy & Legal */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        <h3
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--color-foreground-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            margin: '0 0 0 0.5rem',
          }}
        >
          Privacy & Legal
        </h3>
        <div
          style={{
            backgroundColor: 'var(--surface-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '20px',
            overflow: 'hidden',
          }}
        >
          {/* Privacy Policy */}
          <Link
            to="/privacy-policy"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.125rem 1.25rem',
              borderBottom: '1px solid var(--border-subtle)',
              textDecoration: 'none',
              transition: 'background-color var(--transition-fast)',
            }}
            className="hover:bg-[var(--surface-recessed)]"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(36, 91, 66, 0.08)',
                  color: 'var(--color-primary, #245B42)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FileText size={18} strokeWidth={2} />
              </div>
              <div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-foreground)' }}>
                  Privacy Policy
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted)', marginTop: '0.125rem' }}>
                  How Unilistics protects your identity, documents and educational records
                </div>
              </div>
            </div>
            <ChevronRight size={18} strokeWidth={2} style={{ color: 'var(--color-foreground-muted)' }} />
          </Link>

          {/* Terms of Service */}
          <Link
            to="/terms"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.125rem 1.25rem',
              textDecoration: 'none',
              transition: 'background-color var(--transition-fast)',
            }}
            className="hover:bg-[var(--surface-recessed)]"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(36, 91, 66, 0.08)',
                  color: 'var(--color-primary, #245B42)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShieldCheck size={18} strokeWidth={2} />
              </div>
              <div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-foreground)' }}>
                  Terms of Service
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted)', marginTop: '0.125rem' }}>
                  Admissions advisory terms, applicant responsibilities and disclosures
                </div>
              </div>
            </div>
            <ChevronRight size={18} strokeWidth={2} style={{ color: 'var(--color-foreground-muted)' }} />
          </Link>
        </div>
      </div>

      {/* Group 4: Support & Session */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        <h3
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--color-foreground-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            margin: '0 0 0 0.5rem',
          }}
        >
          Support & Session
        </h3>
        <div
          style={{
            backgroundColor: 'var(--surface-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '20px',
            overflow: 'hidden',
          }}
        >
          {/* Help & Contact */}
          <Link
            to="/contact"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.125rem 1.25rem',
              borderBottom: '1px solid var(--border-subtle)',
              textDecoration: 'none',
              transition: 'background-color var(--transition-fast)',
            }}
            className="hover:bg-[var(--surface-recessed)]"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(36, 91, 66, 0.08)',
                  color: 'var(--color-primary, #245B42)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <HelpCircle size={18} strokeWidth={2} />
              </div>
              <div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-foreground)' }}>
                  Help & Contact Desk
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted)', marginTop: '0.125rem' }}>
                  Reach our admissions counsellors and operational team
                </div>
              </div>
            </div>
            <ChevronRight size={18} strokeWidth={2} style={{ color: 'var(--color-foreground-muted)' }} />
          </Link>

          {/* Sign Out */}
          <button
            type="button"
            onClick={handleSignOut}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.125rem 1.25rem',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background-color var(--transition-fast)',
            }}
            className="hover:bg-[var(--surface-recessed)]"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(220, 38, 38, 0.08)',
                  color: 'var(--color-danger, #dc2626)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <LogOut size={18} strokeWidth={2} />
              </div>
              <div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-danger, #dc2626)' }}>
                  Sign out
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted)', marginTop: '0.125rem' }}>
                  Securely terminate your session on this device
                </div>
              </div>
            </div>
            <ChevronRight size={18} strokeWidth={2} style={{ color: 'var(--color-foreground-muted)' }} />
          </button>
        </div>
      </div>

      {/* Accessible Modal: Personal Information */}
      {activeModal === 'personal' && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="personal-info-modal-title"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveModal(null);
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--surface-card)',
              borderRadius: '24px',
              maxWidth: '520px',
              width: '100%',
              padding: '2rem',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(36, 91, 66, 0.08)',
                    color: 'var(--color-primary, #245B42)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <User size={20} />
                </div>
                <div>
                  <h3 id="personal-info-modal-title" style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700 }}>
                    Personal Information
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-foreground-muted)' }}>
                    Verified student profile details
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                aria-label="Close modal"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-foreground-muted)',
                  cursor: 'pointer',
                  padding: '0.25rem',
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                backgroundColor: 'var(--surface-recessed)',
                padding: '1.25rem',
                borderRadius: '16px',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.875rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <User size={16} style={{ color: 'var(--color-primary)' }} />
                <span>Full Name: <strong>{user.fullName || 'Not specified'}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Mail size={16} style={{ color: 'var(--color-primary)' }} />
                <span>Email Address: <strong>{user.email}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <MapPin size={16} style={{ color: 'var(--color-primary)' }} />
                <span>City of Residence: <strong>{user.city || 'Pakistan'}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <GraduationCap size={16} style={{ color: 'var(--color-primary)' }} />
                <span>Education Background: <strong>{user.highestEducation || 'Higher Education Applicant'}</strong></span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="btn-pill-primary"
                style={{
                  padding: '0.5rem 1.25rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: 'var(--action-primary)',
                  color: 'var(--color-on-primary)',
                  border: 'none',
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Accessible Modal: Login & Security */}
      {activeModal === 'security' && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="security-modal-title"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveModal(null);
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--surface-card)',
              borderRadius: '24px',
              maxWidth: '520px',
              width: '100%',
              padding: '2rem',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(36, 91, 66, 0.08)',
                    color: 'var(--color-primary, #245B42)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <KeyRound size={20} />
                </div>
                <div>
                  <h3 id="security-modal-title" style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700 }}>
                    Login & Security
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-foreground-muted)' }}>
                    Account credentials and session protection
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null);
                  setSecuritySuccess(null);
                }}
                aria-label="Close modal"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-foreground-muted)',
                  cursor: 'pointer',
                  padding: '0.25rem',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {securitySuccess && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(36, 91, 66, 0.1)',
                  color: 'var(--color-primary)',
                  fontSize: '0.875rem',
                }}
              >
                <CheckCircle2 size={16} />
                <span>{securitySuccess}</span>
              </div>
            )}

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                backgroundColor: 'var(--surface-recessed)',
                padding: '1.25rem',
                borderRadius: '16px',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.875rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>Password Credentials</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted)' }}>
                    Managed securely via Supabase Auth
                  </div>
                </div>
                <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
                  <button
                    type="button"
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: 'var(--radius-pill)',
                      backgroundColor: 'var(--surface-card)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--color-primary)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Reset Password
                  </button>
                </Link>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>Email Verification</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted)' }}>
                    Verified on file ({user.email})
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.5rem',
                    borderRadius: 'var(--radius-pill)',
                    backgroundColor: 'rgba(36, 91, 66, 0.08)',
                    color: 'var(--color-primary)',
                  }}
                >
                  Verified
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null);
                  setSecuritySuccess(null);
                }}
                className="btn-pill-primary"
                style={{
                  padding: '0.5rem 1.25rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: 'var(--action-primary)',
                  color: 'var(--color-on-primary)',
                  border: 'none',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Accessible Modal: Notification Preferences */}
      {activeModal === 'notifications' && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="notifications-modal-title"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveModal(null);
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--surface-card)',
              borderRadius: '24px',
              maxWidth: '520px',
              width: '100%',
              padding: '2rem',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(36, 91, 66, 0.08)',
                    color: 'var(--color-primary, #245B42)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Bell size={20} />
                </div>
                <div>
                  <h3 id="notifications-modal-title" style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700 }}>
                    Notification Channels
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-foreground-muted)' }}>
                    Configure how you receive admissions alerts
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                aria-label="Close modal"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-foreground-muted)',
                  cursor: 'pointer',
                  padding: '0.25rem',
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
                backgroundColor: 'var(--surface-recessed)',
                padding: '1.25rem',
                borderRadius: '16px',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.875rem',
              }}
            >
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>Email Announcements</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted)' }}>
                    Deadlines, scholarship openings, and intake notices
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
                />
              </label>

              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>Casework Action Items</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted)' }}>
                    Immediate notifications when counsellor requests document re-upload
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={caseworkAlerts}
                  onChange={(e) => setCaseworkAlerts(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
                />
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="btn-pill-primary"
                style={{
                  padding: '0.5rem 1.25rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: 'var(--action-primary)',
                  color: 'var(--color-on-primary)',
                  border: 'none',
                }}
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExplorerAccountPage;
