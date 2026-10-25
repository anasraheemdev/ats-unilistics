import React, { useState, useEffect } from 'react';
import { useLocation, Link, Outlet } from 'react-router-dom';
import { UserRole, AccessRequest } from '@/types';
import { api } from '@/lib/api';
import { LoadingState } from '@/components/common/LoadingState';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ROUTES, validateInternalReturnUrl } from '@/config/routes';
import {
  LogIn,
  UserPlus,
  Home,
  Compass,
  Clock,
  Sparkles,
  ShieldAlert,
  FileCheck2,
} from 'lucide-react';

interface ProtectedRouteProps {
  currentRole: UserRole;
  allowedRoles: UserRole[];
  onRoleChange: (newRole: UserRole) => void;
  isSessionLoading?: boolean;
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  currentRole,
  allowedRoles,
  onRoleChange,
  isSessionLoading = false,
  children,
}) => {
  const location = useLocation();
  const [activeGuidanceReq, setActiveGuidanceReq] = useState<AccessRequest | null>(null);
  const [isCheckingGuidance, setIsCheckingGuidance] = useState(false);

  // When a signed-in explorer requests a student route, check for an active guidance request
  useEffect(() => {
    if (currentRole === 'explorer' && allowedRoles.includes('managed_student')) {
      setIsCheckingGuidance(true);
      api.requests
        .getMyActiveGuidanceRequest()
        .then((req) => {
          setActiveGuidanceReq(req);
        })
        .finally(() => {
          setIsCheckingGuidance(false);
        });
    } else {
      setActiveGuidanceReq(null);
    }
  }, [currentRole, allowedRoles]);

  // 1. Neutral loading state while checking session and permissions
  if (isSessionLoading || isCheckingGuidance) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#FBF9F5' }}>
        <PublicNavbar currentRole={currentRole} onRoleChange={onRoleChange} />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <LoadingState message="Verifying account permissions & authorization..." minHeight="40vh" />
        </main>
        <PublicFooter />
      </div>
    );
  }

  // 2. Allowed role matches: render protected route hierarchy
  if (allowedRoles.includes(currentRole)) {
    return children ? <>{children}</> : <Outlet />;
  }

  // Safe validated return path (internal only)
  const safeReturnUrl = validateInternalReturnUrl(location.pathname + location.search, ROUTES.HOME);

  // 3. Case A: Signed-out person (visitor) accessing protected route
  if (currentRole === 'visitor') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#FBF9F5' }}>
        <PublicNavbar currentRole={currentRole} onRoleChange={onRoleChange} />

        <main
          id="main-content"
          tabIndex={-1}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '5rem 1rem 3rem',
          }}
        >
          <div style={{ maxWidth: '520px', width: '100%', margin: '0 auto' }}>
            <Card padding="lg">
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: 'var(--radius-pill)',
                    backgroundColor: 'var(--accent-peach-bg)',
                    color: 'var(--action-primary)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem',
                  }}
                  aria-hidden="true"
                >
                  <LogIn size={26} />
                </div>

                <h1
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    color: 'var(--text-charcoal)',
                    marginBottom: '0.5rem',
                    letterSpacing: '-0.02em',
                  }}
                >
                  Sign in to continue
                </h1>

                <p
                  style={{
                    fontSize: '0.9375rem',
                    color: 'var(--text-muted)',
                    lineHeight: 1.5,
                  }}
                >
                  Please sign in or create an account to access your account. Student dashboards are available after your application-support request is approved.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Link
                  to={`${ROUTES.SIGN_IN}?returnUrl=${encodeURIComponent(safeReturnUrl)}`}
                  id="gate-signin-btn"
                  style={{ textDecoration: 'none' }}
                >
                  <Button variant="primary" size="lg" leftIcon={<LogIn size={16} />} style={{ width: '100%' }}>
                    Sign in to Account
                  </Button>
                </Link>

                <Link
                  to={`${ROUTES.SIGN_UP}?returnUrl=${encodeURIComponent(safeReturnUrl)}`}
                  id="gate-signup-btn"
                  style={{ textDecoration: 'none' }}
                >
                  <Button variant="outline" size="lg" leftIcon={<UserPlus size={16} />} style={{ width: '100%' }}>
                    Create Free Explorer Account
                  </Button>
                </Link>

                <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                  <Link
                    to={ROUTES.HOME}
                    style={{
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: 'var(--text-muted)',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <Home size={14} />
                    <span>Back to Home</span>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </main>

        <PublicFooter />
      </div>
    );
  }

  // 4. Case B: Signed-in explorer requesting student route
  if (currentRole === 'explorer' && allowedRoles.includes('managed_student')) {
    const isPending =
      activeGuidanceReq &&
      (activeGuidanceReq.status === 'pending_review' ||
        activeGuidanceReq.status === 'submitted' ||
        activeGuidanceReq.status === 'needs_information');

    const formattedDate = activeGuidanceReq?.createdAt
      ? new Date(activeGuidanceReq.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : '';

    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#FBF9F5' }}>
        <PublicNavbar currentRole={currentRole} onRoleChange={onRoleChange} />

        <main
          id="main-content"
          tabIndex={-1}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '5rem 1rem 3rem',
          }}
        >
          <div style={{ maxWidth: '560px', width: '100%', margin: '0 auto' }}>
            <Card padding="lg">
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: 'var(--radius-pill)',
                    backgroundColor: isPending ? 'var(--color-warning-bg, #fef3c7)' : 'var(--accent-peach-bg)',
                    color: isPending ? 'var(--color-warning, #b45309)' : 'var(--action-primary)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem',
                  }}
                  aria-hidden="true"
                >
                  {isPending ? <Clock size={28} /> : <Sparkles size={28} />}
                </div>

                <h1
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    color: 'var(--text-charcoal)',
                    marginBottom: '0.5rem',
                    letterSpacing: '-0.02em',
                  }}
                >
                  Application guidance is required
                </h1>

                <p
                  style={{
                    fontSize: '0.9375rem',
                    color: 'var(--text-muted)',
                    lineHeight: 1.5,
                  }}
                >
                  You are signed in with an explorer account. Request application guidance to access a managed student dashboard.
                </p>

                {isPending && (
                  <div
                    style={{
                      marginTop: '1rem',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-warning-bg, #fef3c7)',
                      border: '1px solid var(--color-warning-border, #fde68a)',
                      color: 'var(--color-warning, #b45309)',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <Clock size={16} style={{ flexShrink: 0 }} />
                    <div>
                      <span>Your guidance request is currently awaiting review</span>
                      {formattedDate && <span> (Submitted {formattedDate})</span>}.
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {isPending ? (
                  <Link to={ROUTES.REQUEST_STATUS} style={{ textDecoration: 'none' }}>
                    <Button variant="primary" size="lg" leftIcon={<Clock size={16} />} style={{ width: '100%' }}>
                      View Request Status
                    </Button>
                  </Link>
                ) : (
                  <Link to={ROUTES.REQUEST_ACCESS} style={{ textDecoration: 'none' }}>
                    <Button variant="primary" size="lg" leftIcon={<Sparkles size={16} />} style={{ width: '100%' }}>
                      Request Application Guidance
                    </Button>
                  </Link>
                )}

                <Link to={ROUTES.UNIVERSITIES} style={{ textDecoration: 'none' }}>
                  <Button variant="outline" size="lg" leftIcon={<Compass size={16} />} style={{ width: '100%' }}>
                    Continue Exploring
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </main>

        <PublicFooter />
      </div>
    );
  }

  // 5. Case C: Student or explorer attempting to access staff/admin routes
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#FBF9F5' }}>
      <PublicNavbar currentRole={currentRole} onRoleChange={onRoleChange} />

      <main
        id="main-content"
        tabIndex={-1}
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '5rem 1rem 3rem',
        }}
      >
        <div style={{ maxWidth: '520px', width: '100%', margin: '0 auto' }}>
          <Card padding="lg">
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: 'var(--color-destructive-bg, #ffe4e6)',
                  color: 'var(--color-destructive, #be123c)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
                aria-hidden="true"
              >
                <ShieldAlert size={28} />
              </div>

              <h1
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  color: 'var(--text-charcoal)',
                  marginBottom: '0.5rem',
                  letterSpacing: '-0.02em',
                }}
              >
                Access denied
              </h1>

              <p
                style={{
                  fontSize: '0.9375rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.5,
                }}
              >
                You do not have authorization to access operational staff or administrator desks. This boundary is strictly restricted to verified educational counsellors and platform administrators.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {currentRole === 'managed_student' ? (
                <Link to={ROUTES.STUDENT.ROOT} style={{ textDecoration: 'none' }}>
                  <Button variant="primary" size="lg" leftIcon={<FileCheck2 size={16} />} style={{ width: '100%' }}>
                    Return to My Student Workspace
                  </Button>
                </Link>
              ) : (
                <Link to={ROUTES.UNIVERSITIES} style={{ textDecoration: 'none' }}>
                  <Button variant="primary" size="lg" leftIcon={<Compass size={16} />} style={{ width: '100%' }}>
                    Return to Catalogue Explorer
                  </Button>
                </Link>
              )}

              <Link to={ROUTES.HOME} style={{ textDecoration: 'none' }}>
                <Button variant="outline" size="lg" leftIcon={<Home size={16} />} style={{ width: '100%' }}>
                  Back to Home
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};
