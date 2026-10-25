import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/ui/Alert';
import {
  Inbox,
  UserCheck,
  Clock,
  FileCheck2,
  AlertTriangle,
  MailWarning,
  UserPlus,
  Building2,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { AccessRequest, StudentCase, UserRole } from '@/types';

export const AdminOverviewPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteFullName, setInviteFullName] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('explorer');
  const [inviteFeedback, setInviteFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // 1. Live operational metrics
  const {
    data: metrics,
    isLoading: metricsLoading,
    error: metricsError,
    refetch: refetchMetrics,
  } = useQuery({
    queryKey: ['admin-overview-metrics'],
    queryFn: () => api.operational.getMetrics(),
    refetchInterval: 15000,
  });

  // 2. Real access requests awaiting review
  const {
    data: requests = [],
    isLoading: requestsLoading,
    refetch: refetchRequests,
  } = useQuery({
    queryKey: ['admin-pending-requests'],
    queryFn: async () => {
      const all = await api.requests.getStoredRequests();
      return all.filter((r) => ['submitted', 'pending_review', 'needs_information'].includes(r.status));
    },
  });

  // 3. Real unassigned student cases
  const {
    data: unassignedCases = [],
    isLoading: casesLoading,
  } = useQuery({
    queryKey: ['admin-unassigned-cases'],
    queryFn: async () => {
      const all = await api.staff.getCases();
      return all.filter((c) => !c.assignedCounsellorId);
    },
  });

  // Mutation: Invite User / Provision Account
  const inviteUserMutation = useMutation({
    mutationFn: async () => {
      if (!inviteEmail.trim() || !inviteEmail.includes('@')) {
        throw new Error('A valid email address is required.');
      }
      return api.admin.inviteUser({
        email: inviteEmail.trim().toLowerCase(),
        fullName: inviteFullName.trim() || 'Account',
        role: inviteRole,
      });
    },
    onSuccess: (res) => {
      setInviteFeedback({
        type: 'success',
        message: res.message || `Invitation dispatched to ${inviteEmail}. Activation link generated.`,
      });
      setInviteEmail('');
      setInviteFullName('');
      queryClient.invalidateQueries({ queryKey: ['admin-overview-metrics'] });
    },
    onError: (err: any) => {
      setInviteFeedback({
        type: 'error',
        message: err?.message || 'Failed to dispatch account invitation.',
      });
    },
  });

  // Mutation: Quick Approve Access Request
  const approveRequestMutation = useMutation({
    mutationFn: async (requestId: string) => {
      return api.requests.adminApproveRequest(requestId);
    },
    onSuccess: () => {
      refetchRequests();
      refetchMetrics();
      queryClient.invalidateQueries({ queryKey: ['staff-assigned-cases'] });
    },
  });

  if (metricsLoading || requestsLoading || casesLoading) {
    return <LoadingState message="Loading administrative operations dashboard..." />;
  }

  if (metricsError || !metrics) {
    return <ErrorState title="Dashboard Unavailable" message="Could not load operational metrics from database." onRetry={() => refetchMetrics()} />;
  }

  const metricCards = [
    {
      id: 'requests',
      title: 'Access Requests',
      count: metrics.requestsAwaitingReview,
      subtitle: 'Awaiting verification',
      icon: Inbox,
      href: '/admin/requests',
      color: 'var(--action-primary)',
      bgColor: 'var(--accent-peach-bg)',
      borderColor: 'var(--accent-peach-border)',
    },
    {
      id: 'unassigned',
      title: 'Unassigned Cases',
      count: metrics.unassignedCases,
      subtitle: 'Need counsellor lead',
      icon: UserCheck,
      href: '/admin/students?filter=unassigned',
      color: '#B78103',
      bgColor: '#FFF9E6',
      borderColor: '#FFE082',
    },
    {
      id: 'overdue',
      title: 'Overdue Tasks',
      count: metrics.overdueTasks,
      subtitle: 'Past deadline date',
      icon: Clock,
      href: '/admin/tasks?filter=overdue',
      color: 'var(--color-danger)',
      bgColor: 'var(--color-danger-bg)',
      borderColor: 'var(--color-danger-border)',
    },
    {
      id: 'reviews',
      title: 'Document Reviews',
      count: metrics.documentsAwaitingReview,
      subtitle: 'Dossier files queued',
      icon: FileCheck2,
      href: '/admin/review-queue',
      color: '#0284C7',
      bgColor: '#E0F2FE',
      borderColor: '#BAE6FD',
    },
    {
      id: 'stale',
      title: 'Stale Cases',
      count: metrics.casesWithoutRecentUpdates,
      subtitle: '>7 days without note',
      icon: AlertTriangle,
      href: '/admin/students?filter=stale',
      color: '#D97706',
      bgColor: '#FEF3C7',
      borderColor: '#FDE68A',
    },
    {
      id: 'failed-notifs',
      title: 'Failed Outbox',
      count: metrics.failedNotifications,
      subtitle: 'Undelivered notifications',
      icon: MailWarning,
      href: '/admin/notifications?filter=failed',
      color: metrics.failedNotifications > 0 ? 'var(--color-danger)' : 'var(--text-muted)',
      bgColor: metrics.failedNotifications > 0 ? 'var(--color-danger-bg)' : 'var(--surface-recessed)',
      borderColor: 'var(--border-subtle)',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* 1. Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-charcoal)', margin: 0, letterSpacing: '-0.02em' }}>
            Operations & Admissions Overview
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
            Real-time queues, verification requests, case allocations, and catalogue governance.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-pill btn-pill-secondary"
            onClick={() => setIsInviteModalOpen(true)}
            style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem' }}
          >
            <UserPlus size={15} />
            <span>Invite User</span>
          </button>
          <Link
            to="/admin/catalogue"
            className="btn-pill btn-pill-primary"
            style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem', textDecoration: 'none' }}
          >
            <Building2 size={15} />
            <span>Manage Catalogue</span>
          </Link>
        </div>
      </div>

      {/* 2. Metric Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
        }}
      >
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.id}
              to={card.href}
              className="bento-card"
              style={{
                padding: '1.25rem',
                backgroundColor: '#ffffff',
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                border: '1px solid var(--border-subtle)',
                transition: 'all var(--transition-fast)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  {card.title}
                </span>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: card.bgColor,
                    color: card.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={16} />
                </div>
              </div>

              <div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-charcoal)', lineHeight: 1 }}>
                  {card.count}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  {card.subtitle}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 3. Operational Queues (2 Columns) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Column A: Access Requests Queue */}
        <div className="bento-card" style={{ padding: '1.5rem', backgroundColor: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-charcoal)', margin: 0 }}>
                Pending Access Requests ({requests.length})
              </h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Identity and education credentials awaiting review
              </span>
            </div>
            <Link to="/admin/requests" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--action-primary)', textDecoration: 'none' }}>
              View All
            </Link>
          </div>

          {requests.length === 0 ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', backgroundColor: 'var(--surface-recessed)', borderRadius: 'var(--radius-card-sm)' }}>
              <CheckCircle2 size={32} style={{ color: 'var(--color-success)', margin: '0 auto 0.5rem' }} />
              <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-charcoal)' }}>
                No pending access requests
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                All incoming student access requests have been processed.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {requests.slice(0, 5).map((req: AccessRequest) => (
                <div
                  key={req.id}
                  style={{
                    padding: '0.875rem 1rem',
                    borderRadius: 'var(--radius-card-sm)',
                    backgroundColor: 'var(--surface-recessed)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-charcoal)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {req.fullName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {req.email} • {req.targetCountry?.toUpperCase()} ({req.targetDegree})
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                    <button
                      type="button"
                      className="btn-pill btn-pill-primary"
                      onClick={() => approveRequestMutation.mutate(req.id)}
                      disabled={approveRequestMutation.isPending}
                      style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                    >
                      Approve
                    </button>
                    <Link
                      to={`/admin/requests`}
                      className="btn-pill btn-pill-secondary"
                      style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', textDecoration: 'none' }}
                    >
                      Review
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Column B: Unassigned Student Cases */}
        <div className="bento-card" style={{ padding: '1.5rem', backgroundColor: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-charcoal)', margin: 0 }}>
                Unallocated Student Cases ({unassignedCases.length})
              </h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Active managed cases awaiting counsellor assignment
              </span>
            </div>
            <Link to="/admin/students" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--action-primary)', textDecoration: 'none' }}>
              View Cases
            </Link>
          </div>

          {unassignedCases.length === 0 ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', backgroundColor: 'var(--surface-recessed)', borderRadius: 'var(--radius-card-sm)' }}>
              <Users size={32} style={{ color: 'var(--action-primary)', margin: '0 auto 0.5rem' }} />
              <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-charcoal)' }}>
                No unassigned cases
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                All enrolled students are allocated to dedicated staff counsellors.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {unassignedCases.slice(0, 5).map((c: StudentCase) => (
                <div
                  key={c.id}
                  style={{
                    padding: '0.875rem 1rem',
                    borderRadius: 'var(--radius-card-sm)',
                    backgroundColor: 'var(--surface-recessed)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-charcoal)' }}>
                      {c.studentName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Target: {c.targetCountry?.toUpperCase()} • {c.targetDegree} ({c.targetIntakeSeason})
                    </div>
                  </div>

                  <Link
                    to={`/admin/students`}
                    className="btn-pill btn-pill-secondary"
                    style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', textDecoration: 'none' }}
                  >
                    Assign Staff
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. Invite User Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => {
          setIsInviteModalOpen(false);
          setInviteFeedback(null);
        }}
        title="Provision / Invite User Account"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {inviteFeedback && (
            <Alert variant={inviteFeedback.type === 'success' ? 'success' : 'destructive'}>
              {inviteFeedback.message}
            </Alert>
          )}

          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
            Dispatches a verified Supabase Auth activation link via email. Plaintext passwords are never transmitted or stored.
          </p>

          <div>
            <Input
              label="Full Legal Name"
              value={inviteFullName}
              onChange={(e) => setInviteFullName(e.target.value)}
              placeholder="e.g. Ayesha Khan"
            />
          </div>

          <div>
            <Input
              label="Email Address *"
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="applicant@example.com"
              required
            />
          </div>

          <div>
            <Select
              label="Target Role & Entitlement *"
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as UserRole)}
              options={[
                { value: 'explorer', label: 'Explorer (Catalogue Only)' },
                { value: 'managed_student', label: 'Managed Student (Case Room + Applications)' },
                { value: 'counsellor', label: 'Counsellor (Staff Workdesk)' },
                { value: 'admin', label: 'Administrator (Operations & Catalogue)' },
              ]}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                setIsInviteModalOpen(false);
                setInviteFeedback(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => inviteUserMutation.mutate()}
              isLoading={inviteUserMutation.isPending}
            >
              Send Activation Link
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
