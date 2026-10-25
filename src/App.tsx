import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { AppRoutes } from '@/routes';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { UserRole } from '@/types';
import { api } from '@/lib/api';
import { ExpiredSessionModal } from '@/components/common/ExpiredSessionModal';
import { ThemeProvider } from '@/lib/theme';

export const App: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>('visitor');
  const [isSessionLoading, setIsSessionLoading] = useState<boolean>(true);

  useEffect(() => {
    api.auth
      .getCurrentUser()
      .then((u) => {
        if (u?.role) {
          setCurrentRole(u.role);
        }
      })
      .finally(() => {
        setIsSessionLoading(false);
      });
  }, []);

  if (isSessionLoading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: 'var(--surface-canvas, #F6F8F5)',
          color: 'var(--text-charcoal, #19261F)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
          <img
            src="/images/brand/original-icon.svg"
            alt="Unilistics"
            width={36}
            height={32}
            style={{ objectFit: 'contain' }}
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <span
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              fontFamily: 'var(--font-family-base)',
              letterSpacing: '-0.02em',
              color: 'var(--text-charcoal, #19261F)',
            }}
          >
            unilistics
          </span>
        </div>
        <div
          style={{
            width: '24px',
            height: '24px',
            border: '2.5px solid var(--border-subtle, #DDE5DC)',
            borderTopColor: 'var(--action-primary, #245B42)',
            borderRadius: '50%',
            animation: 'unilistics-spin 0.8s linear infinite',
          }}
        />
        <style>{`@keyframes unilistics-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <ErrorBoundary fallbackTitle="Unilistics System Exception">
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AppRoutes currentRole={currentRole} onRoleChange={setCurrentRole} />
            <ExpiredSessionModal onReauthenticated={setCurrentRole} />
          </BrowserRouter>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
