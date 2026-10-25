import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { LoadingState } from '@/components/common/LoadingState';
import { ShieldCheck, Mail, MapPin, GraduationCap, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ExplorerAccountPage: React.FC = () => {
  const { data: user, isLoading } = useQuery({
    queryKey: ['current-user-profile'],
    queryFn: () => api.auth.getCurrentUser(),
  });

  if (isLoading || !user) {
    return <LoadingState message="Loading your account profile..." />;
  }

  const initials = user.fullName ? user.fullName.charAt(0).toUpperCase() : 'E';

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '9999px',
              backgroundColor: '#FFEFEA',
              color: '#B72301',
              textTransform: 'uppercase',
            }}
          >
            Account Identity
          </span>
        </div>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--color-foreground)', margin: 0 }}>
          Explorer Account Profile
        </h1>
        <p style={{ color: 'var(--color-foreground-muted)', fontSize: '0.9375rem', marginTop: '0.25rem', marginBottom: 0 }}>
          Your verified catalogue exploration credentials and entitlement tier.
        </p>
      </div>

      <div
        className="bento-card"
        style={{
          padding: '2rem',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#FFEFEA',
              color: '#B72301',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.5rem',
              border: '2px solid #FFFFFF',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              flexShrink: 0,
            }}
          >
            {initials}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.375rem', fontWeight: 800, margin: 0, color: 'var(--color-foreground)' }}>
                {user.fullName}
              </h2>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  backgroundColor: '#E8F8F2',
                  color: '#065F46',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <ShieldCheck size={13} /> Approved Explorer
              </span>
            </div>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted)' }}>
              Member since: {user.createdAt ? user.createdAt.split('T')[0] : 'Active'}
            </span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.875rem',
            padding: '1.25rem',
            borderRadius: '16px',
            backgroundColor: '#F9F6F0',
            border: '1px solid #EBE6DE',
            fontSize: '0.875rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <Mail size={16} style={{ color: '#B72301' }} />
            <span>Email: <strong>{user.email}</strong></span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <MapPin size={16} style={{ color: '#B72301' }} />
            <span>City of Residence: <strong>{user.city || 'Pakistan'}</strong></span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <GraduationCap size={16} style={{ color: '#B72301' }} />
            <span>Academic Background: <strong>{user.highestEducation || 'Higher Education Graduate'}</strong></span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            paddingTop: '1rem',
            borderTop: '1px solid #EBE6DE',
          }}
        >
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted)' }}>
            Service Entitlement: <strong>Full European Catalogue & Scholarships</strong>
          </span>

          <Link to="/explorer/request-support" style={{ textDecoration: 'none' }}>
            <button
              type="button"
              className="btn-pill-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '8px 18px',
                fontSize: '0.8125rem',
                cursor: 'pointer',
              }}
            >
              <Sparkles size={14} /> Upgrade to Managed Support
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};
