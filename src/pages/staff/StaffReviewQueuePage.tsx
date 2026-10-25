import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { Alert } from '@/components/ui/Alert';
import { api } from '@/lib/api';
import { AccessRequest, AccessRequestStatus, CaseDocument, OutboxEmailItem, AuthorizedDownloadTicket } from '@/types';
import { fetchOutboxEmails } from '@/lib/emailSink';
import {
  CheckCircle2,
  FileText,
  Mail,
  RefreshCw,
  Users,
  Clock,
  Download,
} from 'lucide-react';

export const StaffReviewQueuePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'access_requests' | 'document_attestations'>('access_requests');

  // Access Requests state
  const [statusFilter, setStatusFilter] = useState<AccessRequestStatus | 'all'>('all');
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [outboxEmails, setOutboxEmails] = useState<OutboxEmailItem[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [actionErrorMsg, setActionErrorMsg] = useState<string | null>(null);

  // Modal action state
  const [selectedReq, setSelectedReq] = useState<AccessRequest | null>(null);
  const [modalMode, setModalMode] = useState<'approve' | 'request_info' | 'reject' | null>(null);
  const [targetEntitlement, setTargetEntitlement] = useState<'explorer_catalogue' | 'managed_application_case'>('explorer_catalogue');
  const [studentExplanation, setStudentExplanation] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  // Document verification queue state
  const [docs, setDocs] = useState<CaseDocument[]>([]);
  const [selectedStaffDoc, setSelectedStaffDoc] = useState<CaseDocument | null>(null);
  const [staffDownloadTicket, setStaffDownloadTicket] = useState<AuthorizedDownloadTicket | null>(null);
  const [needsReplacementDocId, setNeedsReplacementDocId] = useState<string | null>(null);
  const [replacementInstructionsText, setReplacementInstructionsText] = useState('');
  const [rejectingDocId, setRejectingDocId] = useState<string | null>(null);
  const [docRevisionNotes, setDocRevisionNotes] = useState('');
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);
  const [docDeletionReason, setDocDeletionReason] = useState('');

  const loadRequests = async () => {
    setIsLoadingRequests(true);
    try {
      const data = await api.requests.adminGetQueue(statusFilter);
      const emails = await fetchOutboxEmails();
      setRequests(data);
      setOutboxEmails(emails);
    } catch {
      // Fallback
    } finally {
      setIsLoadingRequests(false);
    }
  };

  const loadDocs = async () => {
    try {
      const data = await api.documents.getDocuments();
      setDocs(data);
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    loadRequests();
    loadDocs();
  }, [statusFilter]);

  const handleOpenApproveModal = (req: AccessRequest) => {
    setSelectedReq(req);
    setTargetEntitlement(req.requestType);
    setInternalNotes('');
    setModalMode('approve');
  };

  const handleOpenRequestInfoModal = (req: AccessRequest) => {
    setSelectedReq(req);
    setStudentExplanation('');
    setInternalNotes('');
    setModalMode('request_info');
  };

  const handleOpenRejectModal = (req: AccessRequest) => {
    setSelectedReq(req);
    setStudentExplanation('');
    setInternalNotes('');
    setModalMode('reject');
  };

  const handleExecuteReviewAction = async () => {
    if (!selectedReq || !modalMode) return;
    setIsSubmittingAction(true);
    setActionSuccessMsg(null);
    setActionErrorMsg(null);

    try {
      if (modalMode === 'approve') {
        const res = await api.requests.adminApproveRequest(selectedReq.id, targetEntitlement, internalNotes);
        setActionSuccessMsg(`Approved request for ${selectedReq.fullName}. Activation email enqueued (Token: ${res.activationToken}).`);
      } else if (modalMode === 'request_info') {
        if (!studentExplanation.trim()) {
          setActionErrorMsg('A student-visible explanation is required');
          setIsSubmittingAction(false);
          return;
        }
        await api.requests.adminRequestInformation(selectedReq.id, studentExplanation, internalNotes);
        setActionSuccessMsg(`Information request dispatched to ${selectedReq.email}.`);
      } else if (modalMode === 'reject') {
        if (!studentExplanation.trim()) {
          setActionErrorMsg('A student-visible rejection explanation is required');
          setIsSubmittingAction(false);
          return;
        }
        await api.requests.adminRejectRequest(selectedReq.id, studentExplanation, internalNotes);
        setActionSuccessMsg(`Rejection recorded for ${selectedReq.fullName}. Notification sent.`);
      }
      setModalMode(null);
      setSelectedReq(null);
      await loadRequests();
    } catch (err: any) {
      setActionErrorMsg(err?.message || 'Failed to execute review action.');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleResendActivation = async (reqId: string) => {
    setActionSuccessMsg(null);
    setActionErrorMsg(null);
    try {
      await api.requests.adminResendActivation(reqId);
      setActionSuccessMsg('Fresh activation link enqueued and dispatched.');
      await loadRequests();
    } catch (err: any) {
      setActionErrorMsg(err?.message || 'Failed to resend activation link.');
    }
  };



  const getStatusBadge = (status: AccessRequestStatus) => {
    switch (status) {
      case 'submitted':
      case 'email_verification_pending':
        return <Badge variant="warning">Verification Pending</Badge>;
      case 'pending_review':
        return <Badge variant="primary">Pending Review</Badge>;
      case 'needs_information':
        return <Badge variant="warning">Needs Info</Badge>;
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'withdrawn':
        return <Badge variant="default">Withdrawn</Badge>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>
          Staff Operational Review Queue
        </h1>
        <p style={{ color: 'var(--color-foreground-muted)', fontSize: '0.875rem' }}>
          Evaluate applicant entry requests, dispatch activation credentials, and verify student attestation tickets.
        </p>
      </div>

      {actionSuccessMsg && (
        <Alert variant="success">
          {actionSuccessMsg}
        </Alert>
      )}

      {actionErrorMsg && (
        <Alert variant="destructive">
          {actionErrorMsg}
        </Alert>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
        <button
          type="button"
          onClick={() => setActiveTab('access_requests')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            backgroundColor: activeTab === 'access_requests' ? 'var(--color-primary)' : 'transparent',
            color: activeTab === 'access_requests' ? '#ffffff' : 'var(--color-foreground)',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Users size={16} />
          <span>Access Requests Queue ({requests.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('document_attestations')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            backgroundColor: activeTab === 'document_attestations' ? 'var(--color-primary)' : 'transparent',
            color: activeTab === 'document_attestations' ? '#ffffff' : 'var(--color-foreground)',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <FileText size={16} />
          <span>Document Attestations ({docs.filter((d) => d.verificationStatus === 'pending').length})</span>
        </button>
      </div>

      {/* Tab 1: Access Requests Queue */}
      {activeTab === 'access_requests' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Status Filter Pills */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted)', fontWeight: 600 }}>
              Filter:
            </span>
            {(['all', 'pending_review', 'needs_information', 'approved', 'rejected'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: '0.375rem 0.75rem',
                  borderRadius: 'var(--radius-full, 9999px)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  border: statusFilter === st ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                  backgroundColor: statusFilter === st ? 'var(--color-primary)' : 'var(--color-surface)',
                  color: statusFilter === st ? '#ffffff' : 'var(--color-foreground)',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {st.replace(/_/g, ' ')}
              </button>
            ))}

            <Button variant="ghost" size="sm" onClick={loadRequests} style={{ marginLeft: 'auto' }}>
              <RefreshCw size={14} aria-hidden="true" />
              <span>Refresh</span>
            </Button>
          </div>

          {isLoadingRequests ? (
            <Card style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-foreground-muted)' }}>
              Loading access requests...
            </Card>
          ) : requests.length === 0 ? (
            <Card style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-foreground-muted)' }}>
              No access requests matching current filter.
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {requests.map((req) => {
                const latestEmail = outboxEmails.find((e) => e.requestId === req.id || e.recipientEmail === req.email);

                return (
                  <Card key={req.id} padding="md" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>{req.fullName}</h3>
                          {getStatusBadge(req.status)}
                          {req.isUpgrade && (
                            <Badge variant="primary" size="sm">
                              Upgrade to Managed Support
                            </Badge>
                          )}
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted)' }}>
                          Email: <strong>{req.email}</strong> {req.phone && `• Phone: ${req.phone}`} • ID: {req.id}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {req.status === 'pending_review' && (
                          <>
                            <Button variant="primary" size="sm" onClick={() => handleOpenApproveModal(req)}>
                              Approve
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleOpenRequestInfoModal(req)}>
                              Request Info
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleOpenRejectModal(req)} style={{ color: 'var(--color-danger)' }}>
                              Reject
                            </Button>
                          </>
                        )}

                        {req.status === 'needs_information' && (
                          <>
                            <Button variant="primary" size="sm" onClick={() => handleOpenApproveModal(req)}>
                              Approve
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleOpenRejectModal(req)} style={{ color: 'var(--color-danger)' }}>
                              Reject
                            </Button>
                          </>
                        )}

                        {req.status === 'approved' && (
                          <Button variant="outline" size="sm" onClick={() => handleResendActivation(req.id)}>
                            <Mail size={14} aria-hidden="true" />
                            <span>Resend Activation Email</span>
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Request Details */}
                    <div
                      style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: 'var(--color-surface-subtle)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.8125rem',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: '0.75rem',
                      }}
                    >
                      <div>
                        <span style={{ color: 'var(--color-foreground-muted)', display: 'block' }}>Target Countries:</span>
                        <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                          {req.countryInterests?.join(', ') || req.targetCountry || 'Germany'}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: 'var(--color-foreground-muted)', display: 'block' }}>Requested Service:</span>
                        <span style={{ fontWeight: 600 }}>
                          {req.requestType === 'managed_application_case' ? 'Managed Application Case' : 'Catalogue Explorer'}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: 'var(--color-foreground-muted)', display: 'block' }}>Outbox Email Delivery:</span>
                        <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                          {latestEmail ? (
                            <>
                              <Badge
                                variant={
                                  latestEmail.deliveryStatus === 'sent'
                                    ? 'success'
                                    : latestEmail.deliveryStatus === 'failed'
                                    ? 'destructive'
                                    : 'warning'
                                }
                                size="sm"
                              >
                                {latestEmail.deliveryStatus.toUpperCase()}
                              </Badge>
                              <span style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted)' }}>
                                ({latestEmail.emailType})
                              </span>
                            </>
                          ) : (
                            <span style={{ color: 'var(--color-foreground-muted)' }}>No emails dispatched</span>
                          )}
                        </span>
                      </div>
                    </div>

                    {req.studentMessage && (
                      <div style={{ fontSize: '0.8125rem', padding: '0.5rem 0.75rem', backgroundColor: 'rgba(15, 23, 42, 0.04)', borderRadius: 'var(--radius-sm)' }}>
                        <strong>Student Note:</strong> {req.studentMessage}
                      </div>
                    )}

                    {req.staffExplanation && (
                      <div style={{ fontSize: '0.8125rem', padding: '0.5rem 0.75rem', backgroundColor: 'rgba(217, 119, 6, 0.08)', borderRadius: 'var(--radius-sm)', color: '#b45309' }}>
                        <strong>Staff Explanation (Visible to Student):</strong> {req.staffExplanation}
                      </div>
                    )}

                    {req.internalNotes && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted)', fontStyle: 'italic' }}>
                        🔒 Internal Staff Note: {req.internalNotes}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Document Attestation Queue */}
      {activeTab === 'document_attestations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Alert variant="info" title="Human-in-the-Loop Document Verification Contract">
            “Approved” designates acceptance by Unilistics counsellors for university portal application assembly.
            It does not constitute statutory government attestation or guarantee university acceptance.
            Documents marked "Needs Replacement" require clear, actionable instructions sent to the student.
          </Alert>

          {docs.length === 0 ? (
            <Card padding="lg" style={{ textAlign: 'center', color: 'var(--color-foreground-muted)' }}>
              No documents currently in queue.
            </Card>
          ) : (
            docs.map((doc) => (
              <Card
                key={doc.id}
                padding="md"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', maxWidth: '650px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'rgba(15, 23, 42, 0.06)',
                      color: 'var(--color-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <FileText size={22} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>{doc.title}</h3>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--color-surface-hover)',
                          border: '1px solid var(--color-border)',
                        }}
                      >
                        v{doc.currentVersionNumber || 1}
                      </span>
                      <StatusBadge status={doc.quarantineStatus || doc.verificationStatus} size="sm" />
                    </div>

                    <p style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted)', margin: '0 0 0.25rem 0' }}>
                      File: {doc.safeDisplayName || doc.fileName} • Category: {doc.documentType.replace(/_/g, ' ')} • Uploaded: {doc.uploadedAt.split('T')[0]}
                    </p>

                    {doc.replacementInstructions && (
                      <div
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.375rem 0.5rem',
                          backgroundColor: 'rgba(217, 119, 6, 0.08)',
                          borderRadius: 'var(--radius-sm)',
                          color: '#92400e',
                          marginTop: '0.25rem',
                        }}
                      >
                        <strong>Instructions Sent:</strong> {doc.replacementInstructions}
                      </div>
                    )}

                    {doc.verificationNotes && !doc.replacementInstructions && (
                      <p style={{ fontSize: '0.8125rem', color: 'var(--color-foreground)', margin: '0.25rem 0 0 0' }}>
                        Note: {doc.verificationNotes}
                      </p>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {/* View / Download Ticket Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      setSelectedStaffDoc(doc);
                      setStaffDownloadTicket(null);
                      try {
                        const ticket = await api.documents.getAuthorizedDownloadTicket(doc.id, doc.currentVersionNumber);
                        setStaffDownloadTicket(ticket);
                      } catch (err: any) {
                        setActionErrorMsg(err.message || 'Could not fetch download ticket');
                      }
                    }}
                  >
                    Inspect File
                  </Button>

                  {/* Review Actions for ready_for_review / pending */}
                  {(doc.quarantineStatus === 'ready_for_review' || doc.verificationStatus === 'pending') && (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<CheckCircle2 size={15} />}
                        onClick={async () => {
                          try {
                            const res = await api.documents.reviewDocument(doc.id, 'approved');
                            setActionSuccessMsg(`Document approved: ${res.disclaimer}`);
                            await loadDocs();
                          } catch (err: any) {
                            setActionErrorMsg(err.message || 'Approval failed');
                          }
                        }}
                      >
                        Accept
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setNeedsReplacementDocId(doc.id);
                          setReplacementInstructionsText('');
                        }}
                      >
                        Needs Replacement
                      </Button>

                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setRejectingDocId(doc.id);
                          setDocRevisionNotes('');
                        }}
                      >
                        Reject
                      </Button>
                    </>
                  )}

                  {/* Retention Erasure Option */}
                  <Button
                    variant="outline"
                    size="sm"
                    style={{ color: 'var(--color-danger)' }}
                    onClick={() => {
                      setDeletingDocId(doc.id);
                      setDocDeletionReason('');
                    }}
                  >
                    Purge
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Review Action Modal (Approve, Request Info, Reject) */}
      <Modal
        isOpen={Boolean(modalMode)}
        onClose={() => setModalMode(null)}
        title={
          modalMode === 'approve'
            ? `Approve Access: ${selectedReq?.fullName}`
            : modalMode === 'request_info'
            ? `Request Clarification: ${selectedReq?.fullName}`
            : `Reject Access Request: ${selectedReq?.fullName}`
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {modalMode === 'approve' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Granted Entitlement Level:
              </label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="entitlement"
                    value="explorer_catalogue"
                    checked={targetEntitlement === 'explorer_catalogue'}
                    onChange={() => setTargetEntitlement('explorer_catalogue')}
                  />
                  <span>Explorer Catalogue</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="entitlement"
                    value="managed_application_case"
                    checked={targetEntitlement === 'managed_application_case'}
                    onChange={() => setTargetEntitlement('managed_application_case')}
                  />
                  <span>Managed Support (Case Room)</span>
                </label>
              </div>
            </div>
          )}

          {(modalMode === 'request_info' || modalMode === 'reject') && (
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                Student-Visible Explanation <span style={{ color: 'var(--color-danger)' }}>*</span>
              </label>
              <textarea
                rows={3}
                value={studentExplanation}
                onChange={(e) => setStudentExplanation(e.target.value)}
                placeholder={
                  modalMode === 'request_info'
                    ? 'e.g. Please confirm whether you have received your official HEC attestation ticket.'
                    : 'e.g. Our managed intake is at capacity for this cycle.'
                }
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.875rem',
                  fontFamily: 'inherit',
                }}
              />
            </div>
          )}

          {/* Internal Staff Notes (Never exposed to student) */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>
              Internal Staff Notes (Optional - Private to Staff)
            </label>
            <textarea
              rows={2}
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="Private counsellor note for the case record..."
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                fontSize: '0.875rem',
                fontFamily: 'inherit',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Button variant="outline" onClick={() => setModalMode(null)} disabled={isSubmittingAction}>
              Cancel
            </Button>
            <Button
              variant={modalMode === 'reject' ? 'destructive' : 'primary'}
              onClick={handleExecuteReviewAction}
              disabled={isSubmittingAction}
            >
              {isSubmittingAction ? 'Processing...' : modalMode === 'approve' ? 'Confirm Approval' : modalMode === 'request_info' ? 'Send Request' : 'Confirm Rejection'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Needs Replacement Modal */}
      <Modal
        isOpen={Boolean(needsReplacementDocId)}
        onClose={() => setNeedsReplacementDocId(null)}
        title="Request Replacement Document"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-foreground-muted)' }}>
            Provide clear, detailed instructions to the student explaining why this document cannot be used and how to re-scan or obtain a replacement.
          </p>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>
              Replacement Instructions (Student-Visible) <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <textarea
              rows={3}
              value={replacementInstructionsText}
              onChange={(e) => setReplacementInstructionsText(e.target.value)}
              placeholder="e.g. The MRZ barcode at the bottom of the passport is cut off. Please re-scan the entire bio page showing all 4 corners in 300 DPI color."
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <Button variant="outline" onClick={() => setNeedsReplacementDocId(null)}>Cancel</Button>
            <Button
              variant="primary"
              disabled={replacementInstructionsText.trim().length < 5}
              onClick={async () => {
                if (!needsReplacementDocId) return;
                try {
                  await api.documents.reviewDocument(
                    needsReplacementDocId,
                    'needs_replacement',
                    undefined,
                    replacementInstructionsText.trim()
                  );
                  setActionSuccessMsg('Document marked as requiring replacement. Instructions sent to student.');
                  setNeedsReplacementDocId(null);
                  await loadDocs();
                } catch (err: any) {
                  setActionErrorMsg(err.message || 'Failed to update document status');
                }
              }}
            >
              Submit Replacement Request
            </Button>
          </div>
        </div>
      </Modal>

      {/* Document Reject Modal */}
      <Modal isOpen={Boolean(rejectingDocId)} onClose={() => setRejectingDocId(null)} title="Reject Document">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-foreground-muted)' }}>
            Specify why this document is definitively rejected and cannot be included in any university application dossier.
          </p>
          <textarea
            rows={3}
            value={docRevisionNotes}
            onChange={(e) => setDocRevisionNotes(e.target.value)}
            placeholder="e.g. Document was issued by an unaccredited institution and cannot be verified via HEC or IBCC."
            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <Button variant="outline" onClick={() => setRejectingDocId(null)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={docRevisionNotes.trim().length < 5}
              onClick={async () => {
                if (!rejectingDocId) return;
                try {
                  await api.documents.reviewDocument(rejectingDocId, 'rejected', docRevisionNotes.trim());
                  setActionSuccessMsg('Document marked as rejected.');
                  setRejectingDocId(null);
                  await loadDocs();
                } catch (err: any) {
                  setActionErrorMsg(err.message || 'Failed to reject document');
                }
              }}
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>

      {/* Physical Retention Erasure Modal */}
      <Modal
        isOpen={Boolean(deletingDocId)}
        onClose={() => setDeletingDocId(null)}
        title="Physical Document Erasure (Compliance / Retention)"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Alert variant="warning" title="Irreversible Storage & Metadata Purge">
            This permanently removes all version byte objects from the Supabase <code>student-vault</code> bucket
            and deletes corresponding metadata records. This operation cannot be undone.
          </Alert>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>
              Formal Erasure Justification <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <textarea
              rows={3}
              value={docDeletionReason}
              onChange={(e) => setDocDeletionReason(e.target.value)}
              placeholder="e.g. Case closed and student exercised statutory Right to Erasure under compliance policy."
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <Button variant="outline" onClick={() => setDeletingDocId(null)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={docDeletionReason.trim().length < 5}
              onClick={async () => {
                if (!deletingDocId) return;
                try {
                  const res = await api.documents.deleteDocument(deletingDocId, docDeletionReason.trim());
                  setActionSuccessMsg(res.message);
                  setDeletingDocId(null);
                  await loadDocs();
                } catch (err: any) {
                  setActionErrorMsg(err.message || 'Failed to erase document');
                }
              }}
            >
              Permanently Erase
            </Button>
          </div>
        </div>
      </Modal>

      {/* Staff File Inspection & Ephemeral Download Modal */}
      <Modal
        isOpen={Boolean(selectedStaffDoc)}
        onClose={() => {
          setSelectedStaffDoc(null);
          setStaffDownloadTicket(null);
        }}
        title={`Inspect Vault File: ${selectedStaffDoc?.title}`}
      >
        {selectedStaffDoc && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem' }}>
            <div>
              <strong>File Name:</strong> {selectedStaffDoc.safeDisplayName || selectedStaffDoc.fileName}
            </div>
            <div>
              <strong>Current Version:</strong> v{selectedStaffDoc.currentVersionNumber || 1}
            </div>
            <div>
              <strong>Quarantine Status:</strong> <StatusBadge status={selectedStaffDoc.quarantineStatus || selectedStaffDoc.verificationStatus} size="sm" />
            </div>

            {staffDownloadTicket ? (
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--color-surface-hover)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem', color: 'var(--color-primary)' }}>
                  <Clock size={16} />
                  <span style={{ fontWeight: 700 }}>Authorized Staff Ephemeral Access</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted)', margin: '0 0 0.5rem 0' }}>
                  {staffDownloadTicket.securityNotice} (Valid for {staffDownloadTicket.expiresInSeconds}s).
                </p>
                <a
                  href={staffDownloadTicket.downloadUrl || '#'}
                  download={staffDownloadTicket.safeDisplayName}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none' }}
                >
                  <Button variant="primary" size="sm" leftIcon={<Download size={14} />}>
                    Download Attachment
                  </Button>
                </a>
              </div>
            ) : (
              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--color-foreground-muted)' }}>
                Generating authorized ephemeral download ticket...
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
