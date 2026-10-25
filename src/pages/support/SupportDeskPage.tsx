import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, formatUtcInTimezone } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/ui/Alert';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import {
  SupportRequest,
  SupportMessage,
  SupportRequestCategory,
  SupportRequestPriority,
  SupportRequestStatus,
  UserRole,
} from '@/types';
import {
  LifeBuoy,
  PlusCircle,
  MessageSquare,
  Send,
  ShieldCheck,
  Tag,
  ArrowLeft,
} from 'lucide-react';

interface SupportDeskPageProps {
  currentRole?: UserRole;
}

export const SupportDeskPage: React.FC<SupportDeskPageProps> = () => {
  const queryClient = useQueryClient();
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newCategory, setNewCategory] = useState<SupportRequestCategory>('general');
  const [newPriority, setNewPriority] = useState<SupportRequestPriority>('normal');
  const [newInitialMsg, setNewInitialMsg] = useState('');
  const [replyText, setReplyText] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 1. Current user
  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => api.auth.getCurrentUser(),
  });

  const isStaff = currentUser?.role === 'counsellor' || currentUser?.role === 'admin' || currentUser?.role === 'super_admin';
  const isExplorer = currentUser?.role === 'explorer';

  // 2. Tickets list
  const {
    data: tickets,
    isLoading: ticketsLoading,
    error: ticketsError,
    refetch: refetchTickets,
  } = useQuery({
    queryKey: ['support-tickets'],
    queryFn: () => api.support.getTickets(),
  });

  // 3. Active ticket messages
  const {
    data: activeMessages,
    isLoading: messagesLoading,
  } = useQuery({
    queryKey: ['support-ticket-messages', selectedTicketId],
    queryFn: () => (selectedTicketId ? api.support.getTicketMessages(selectedTicketId) : Promise.resolve([])),
    enabled: Boolean(selectedTicketId),
    refetchInterval: 10000,
  });

  // Create ticket mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      return api.support.createTicket({
        subject: newSubject,
        category: newCategory,
        priority: newPriority,
        initialMessage: newInitialMsg,
      });
    },
    onSuccess: (newTicket) => {
      setFeedbackMsg({ type: 'success', text: `Support ticket #${newTicket.id} created successfully.` });
      setIsCreatingTicket(false);
      setNewSubject('');
      setNewInitialMsg('');
      setSelectedTicketId(newTicket.id);
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
    },
    onError: (err: any) => {
      setFeedbackMsg({ type: 'error', text: err?.message || 'Failed to create support ticket.' });
    },
  });

  // Send reply mutation
  const replyMutation = useMutation({
    mutationFn: async () => {
      if (!selectedTicketId || !replyText.trim()) return;
      return api.support.sendTicketMessage(selectedTicketId, replyText);
    },
    onSuccess: () => {
      setReplyText('');
      queryClient.invalidateQueries({ queryKey: ['support-ticket-messages', selectedTicketId] });
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
    },
    onError: (err: any) => {
      setFeedbackMsg({ type: 'error', text: err?.message || 'Failed to send reply.' });
    },
  });

  // Update status mutation (staff only)
  const statusMutation = useMutation({
    mutationFn: async (status: SupportRequestStatus) => {
      if (!selectedTicketId) return;
      return api.support.updateTicketStatus(selectedTicketId, status);
    },
    onSuccess: () => {
      setFeedbackMsg({ type: 'success', text: 'Ticket status updated.' });
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
    },
    onError: (err: any) => {
      setFeedbackMsg({ type: 'error', text: err?.message || 'Failed to update ticket status.' });
    },
  });

  const activeTicket = (tickets || []).find((t: SupportRequest) => t.id === selectedTicketId);

  const getStatusBadge = (status: SupportRequestStatus) => {
    switch (status) {
      case 'open':
        return <Badge variant="primary" size="sm">Open</Badge>;
      case 'in_progress':
        return <Badge variant="warning" size="sm">In Progress</Badge>;
      case 'waiting_on_user':
        return <Badge variant="info" size="sm">Waiting on User</Badge>;
      case 'resolved':
        return <Badge variant="success" size="sm">Resolved</Badge>;
      case 'closed':
        return <Badge variant="default" size="sm">Closed</Badge>;
      default:
        return <Badge size="sm">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: SupportRequestPriority) => {
    switch (priority) {
      case 'urgent':
        return <span style={{ color: 'var(--color-danger, #ef4444)', fontWeight: 700, fontSize: '0.75rem' }}>URGENT</span>;
      case 'high':
        return <span style={{ color: '#f59e0b', fontWeight: 600, fontSize: '0.75rem' }}>HIGH</span>;
      default:
        return <span style={{ color: 'var(--color-foreground-muted)', fontSize: '0.75rem' }}>NORMAL</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem' }}>
            <LifeBuoy size={24} style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>General Support & Inquiries Desk</h1>
          </div>
          <p style={{ color: 'var(--color-foreground-muted)', fontSize: '0.875rem', margin: 0 }}>
            {isExplorer
              ? 'Authorized inquiry portal for prospective applicants and catalogue explorers. Independent from managed student case rooms.'
              : 'Direct communication desk for operational inquiries, technical assistance, and procedural queries.'}
          </p>
        </div>

        {!isCreatingTicket && !selectedTicketId && (
          <Button
            variant="primary"
            onClick={() => setIsCreatingTicket(true)}
            leftIcon={<PlusCircle size={16} />}
          >
            Create Support Ticket
          </Button>
        )}
      </div>

      {/* Explorer Security Isolation Notice */}
      {isExplorer && (
        <Alert variant="info" title="Explorer Entitlement & Case Room Boundary">
          As an Approved Explorer, you have full access to submit support tickets, request university eligibility feedback, or ask procedural questions.
          Explorer accounts do not have access to managed student case rooms or direct dossier submission threads until approved for 1-on-1 Managed Support.
        </Alert>
      )}

      {feedbackMsg && (
        <Alert
          variant={feedbackMsg.type === 'success' ? 'success' : 'destructive'}
        >
          {feedbackMsg.text}
        </Alert>
      )}

      {/* View 1: Create Ticket Modal/Form */}
      {isCreatingTicket && (
        <Card padding="lg">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Open a New Support Ticket</h2>
            <Button variant="ghost" size="sm" onClick={() => setIsCreatingTicket(false)}>
              Cancel
            </Button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              createMutation.mutate();
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            <Input
              label="Subject / Topic"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="e.g. Question regarding Universitaly visa quota or HEC attestation queue..."
              required
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Select
                label="Category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as SupportRequestCategory)}
                options={[
                  { value: 'general', label: 'General Inquiry' },
                  { value: 'catalogue', label: 'Catalogue & University Details' },
                  { value: 'visa_guidance', label: 'Visa & Consular Guidance' },
                  { value: 'onboarding', label: 'Onboarding & Profile Assistance' },
                  { value: 'technical', label: 'Technical / Portal Issue' },
                  { value: 'billing_inquiry', label: 'Tuition & Fee Verification' },
                ]}
              />

              <Select
                label="Priority"
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as SupportRequestPriority)}
                options={[
                  { value: 'normal', label: 'Normal Priority' },
                  { value: 'high', label: 'High Priority (Intake deadline <14 days)' },
                  { value: 'urgent', label: 'Urgent (Appointment slot imminent)' },
                  { value: 'low', label: 'Low / General Information' },
                ]}
              />
            </div>

            <Textarea
              label="Inquiry Details"
              value={newInitialMsg}
              onChange={(e) => setNewInitialMsg(e.target.value)}
              placeholder="Provide specific details about your query. Do not include sensitive passport numbers or financial passwords."
              rows={4}
              required
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <Button type="button" variant="outline" onClick={() => setIsCreatingTicket(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={createMutation.isPending || !newSubject.trim() || !newInitialMsg.trim()}
              >
                {createMutation.isPending ? 'Submitting...' : 'Submit Support Ticket'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* View 2: Ticket Detail & Message Thread */}
      {selectedTicketId && activeTicket && (
        <Card padding="lg" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
            <div>
              <button
                type="button"
                onClick={() => setSelectedTicketId(null)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-primary)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                  marginBottom: '0.5rem',
                }}
              >
                <ArrowLeft size={14} /> Back to all tickets
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                {getStatusBadge(activeTicket.status)}
                <span style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted)' }}>
                  Category: <strong>{activeTicket.category.replace(/_/g, ' ').toUpperCase()}</strong>
                </span>
                <span>•</span>
                {getPriorityBadge(activeTicket.priority)}
              </div>

              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.25rem 0' }}>
                {activeTicket.subject}
              </h2>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted)' }}>
                Opened by <strong>{activeTicket.userName || activeTicket.userEmail}</strong> • {formatUtcInTimezone(activeTicket.createdAt)}
              </div>
            </div>

            {/* Staff Status Controls */}
            {isStaff && (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted)' }}>Update Status:</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => statusMutation.mutate('in_progress')}
                  disabled={activeTicket.status === 'in_progress'}
                >
                  In Progress
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => statusMutation.mutate('resolved')}
                  disabled={activeTicket.status === 'resolved'}
                >
                  Mark Resolved
                </Button>
              </div>
            )}
          </div>

          {/* Messages Feed */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '260px', maxHeight: '440px', overflowY: 'auto', padding: '0.5rem' }}>
            {messagesLoading ? (
              <LoadingState message="Loading ticket conversation thread..." />
            ) : !activeMessages || activeMessages.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--color-foreground-muted)', fontSize: '0.875rem' }}>
                No messages recorded.
              </div>
            ) : (
              activeMessages.map((msg: SupportMessage) => {
                const isStaffSender = msg.isStaffReply;

                return (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignSelf: isStaffSender ? 'flex-start' : 'flex-end',
                      maxWidth: '85%',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        fontSize: '0.75rem',
                        color: 'var(--color-foreground-muted)',
                        marginBottom: '0.25rem',
                        justifyContent: isStaffSender ? 'flex-start' : 'flex-end',
                      }}
                    >
                      {isStaffSender && <ShieldCheck size={13} style={{ color: 'var(--color-primary)' }} />}
                      <strong>{msg.senderName || (isStaffSender ? 'Support Advisory Specialist' : 'Applicant')}</strong>
                      <span>• {formatUtcInTimezone(msg.createdAt)}</span>
                    </div>

                    <div
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: isStaffSender ? 'var(--color-surface-hover)' : 'var(--color-primary)',
                        color: isStaffSender ? 'var(--color-foreground)' : 'var(--color-on-primary)',
                        border: isStaffSender ? '1px solid var(--color-border)' : 'none',
                        fontSize: '0.875rem',
                        lineHeight: 1.45,
                      }}
                    >
                      {msg.messageBody}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Reply Form */}
          {activeTicket.status !== 'closed' ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                replyMutation.mutate();
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}
            >
              <Textarea
                label={isStaff ? 'Official Staff Response' : 'Add Reply / Clarification'}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your response..."
                rows={2}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={replyMutation.isPending || !replyText.trim()}
                  rightIcon={<Send size={15} />}
                >
                  {replyMutation.isPending ? 'Sending...' : 'Send Reply'}
                </Button>
              </div>
            </form>
          ) : (
            <Alert variant="warning" title="Ticket Closed">
              This support ticket has been closed. You may open a new ticket if you have further inquiries.
            </Alert>
          )}
        </Card>
      )}

      {/* View 3: Tickets Index Table */}
      {!isCreatingTicket && !selectedTicketId && (
        <Card padding="lg">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0 }}>
              {isStaff ? 'All Platform Support Inquiries' : 'Your Support Requests'}
            </h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted)' }}>
              Total: <strong>{tickets?.length || 0} tickets</strong>
            </span>
          </div>

          {ticketsLoading ? (
            <LoadingState message="Loading support inquiries..." />
          ) : ticketsError ? (
            <ErrorState message="Could not load support inquiries." onRetry={() => refetchTickets()} />
          ) : !tickets || tickets.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '2.5rem',
                backgroundColor: 'var(--color-surface-hover)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <LifeBuoy size={32} style={{ color: 'var(--color-primary)', margin: '0 auto 0.5rem', opacity: 0.7 }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>No Support Tickets Found</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted)', marginBottom: '1rem' }}>
                Have questions regarding program requirements, embassy appointments, or attestation steps?
              </p>
              <Button variant="primary" size="sm" onClick={() => setIsCreatingTicket(true)}>
                Submit Your First Inquiry
              </Button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {tickets.map((t: SupportRequest) => (
                <div
                  key={t.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    padding: '1rem',
                    backgroundColor: 'var(--color-surface-hover)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    cursor: 'pointer',
                  }}
                  onClick={() => setSelectedTicketId(t.id)}
                >
                  <div style={{ flex: '1 1 300px', minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      {getStatusBadge(t.status)}
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted)' }}>
                        <Tag size={11} style={{ display: 'inline', marginRight: '3px' }} />
                        {t.category.replace(/_/g, ' ').toUpperCase()}
                      </span>
                      <span>•</span>
                      {getPriorityBadge(t.priority)}
                    </div>

                    <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>
                      {t.subject}
                    </h3>

                    <div style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted)' }}>
                      Opened {formatUtcInTimezone(t.createdAt)} by <strong>{t.userName || t.userEmail}</strong>
                    </div>
                  </div>

                  <Button variant="outline" size="sm" rightIcon={<MessageSquare size={14} />}>
                    View Thread
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
