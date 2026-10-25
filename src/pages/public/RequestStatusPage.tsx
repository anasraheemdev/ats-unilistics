import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { AccessRequest, AccessRequestStatus } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { LoadingState } from '@/components/common/LoadingState';
import {
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

export const RequestStatusPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const idParam = searchParams.get('id') || '';
  const tokenParam = searchParams.get('token') || '';

  const [searchQuery, setSearchQuery] = useState(idParam);
  const [request, setRequest] = useState<AccessRequest | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Needs information response state
  const [studentReply, setStudentReply] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Auto-lookup on mount if idParam is present
  useEffect(() => {
    if (idParam) {
      loadStatus(idParam, tokenParam);
    }
  }, [idParam, tokenParam]);

  const loadStatus = async (query: string, token?: string) => {
    if (!query.trim()) return;
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const data = await api.requests.getRequestStatus(query);
      if (!data) {
        setErrorMsg('No access request found with the provided identifier or email.');
        setRequest(null);
        return;
      }

      // If token provided and pending email verification, auto-verify
      if (token && data.status === 'email_verification_pending') {
        try {
          await api.requests.verifyEmail(data.id, token);
          data.status = 'pending_review';
          setSuccessMsg('Your email address has been successfully verified! Your request is now pending staff review.');
        } catch {
          // Token error
        }
      }

      setRequest(data);
    } catch {
      setErrorMsg('Failed to query request status. Please verify your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadStatus(searchQuery);
  };

  const handleRespondToInformation = async () => {
    if (!request || !studentReply.trim()) return;
    setIsSubmittingReply(true);
    setErrorMsg(null);
    try {
      await api.requests.respondToInformation(request.id, studentReply);
      setRequest((prev) => (prev ? { ...prev, status: 'pending_review', studentMessage: studentReply } : null));
      setSuccessMsg('Your clarification has been submitted. Your request has returned to pending review.');
      setStudentReply('');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to submit response.');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleWithdraw = async () => {
    if (!request) return;
    if (!window.confirm('Are you sure you want to withdraw this access request?')) return;
    setIsLoading(true);
    try {
      await api.requests.withdrawRequest(request.id);
      setRequest((prev) => (prev ? { ...prev, status: 'withdrawn' } : null));
      setSuccessMsg('Your request has been withdrawn.');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to withdraw request.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: AccessRequestStatus) => {
    switch (status) {
      case 'submitted':
      case 'email_verification_pending':
        return <Badge variant="warning">Verification Pending</Badge>;
      case 'pending_review':
        return <Badge variant="primary">Under Staff Review</Badge>;
      case 'needs_information':
        return <Badge variant="warning">Action Required: More Info Needed</Badge>;
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Not Accepted</Badge>;
      case 'withdrawn':
        return <Badge variant="default">Withdrawn</Badge>;
    }
  };

  return (
    <div className="container" style={{ maxWidth: '780px', padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Track Access Request Status
        </h1>
        <p style={{ color: 'var(--color-foreground-muted)', fontSize: '0.9375rem' }}>
          Enter your Application Reference ID or registered email to check the current review stage.
        </p>
      </div>

      {/* Search Bar */}
      <Card style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: '240px' }}>
            <Input
              label="Application Reference or Email"
              placeholder="e.g. req-001 or student@example.com"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit" variant="primary" disabled={isLoading} style={{ marginBottom: '1rem', minHeight: '44px' }}>
            <Search size={16} aria-hidden="true" />
            <span>{isLoading ? 'Searching...' : 'Check Status'}</span>
          </Button>
        </form>
      </Card>

      {successMsg && (
        <Alert variant="success">
          {successMsg}
        </Alert>
      )}

      {errorMsg && (
        <Alert variant="destructive">
          {errorMsg}
        </Alert>
      )}

      {isLoading && <LoadingState message="Retrieving request status..." />}

      {request && !isLoading && (
        <Card style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <span style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted)' }}>
                Application Reference:
              </span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0.25rem 0' }}>
                {request.id}
              </h2>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-foreground-muted)' }}>
                Applicant: <strong>{request.fullName}</strong> ({request.email})
              </div>
            </div>

            <div>{getStatusBadge(request.status)}</div>
          </div>

          <div
            style={{
              padding: '1rem',
              backgroundColor: 'var(--color-surface-subtle)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted)', display: 'block' }}>
                Requested Service:
              </span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                {request.requestType === 'managed_application_case'
                  ? 'Managed Application Support'
                  : 'Catalogue Explorer Access'}
                {request.isUpgrade && ' (Upgrade)'}
              </span>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted)', display: 'block' }}>
                Target Country:
              </span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'capitalize' }}>
                {request.targetCountry || 'Germany'}
              </span>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted)', display: 'block' }}>
                Submitted At:
              </span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                {new Date(request.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Conditional State Details */}
          {request.status === 'email_verification_pending' && (
            <div
              style={{
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(217, 119, 6, 0.08)',
                border: '1px solid rgba(217, 119, 6, 0.3)',
                marginBottom: '1.5rem',
              }}
            >
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#b45309', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={18} />
                <span>Email Verification Pending</span>
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-foreground)', lineHeight: 1.5 }}>
                We sent a verification link to <strong>{request.email}</strong>. Once confirmed, your request will automatically transition to our administrative review queue.
              </p>
              <Button
                variant="outline"
                size="sm"
                style={{ marginTop: '0.75rem' }}
                onClick={() => loadStatus(request.id, 'simulated-token')}
              >
                Simulate Email Verification Click
              </Button>
            </div>
          )}

          {request.status === 'needs_information' && (
            <div
              style={{
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(239, 68, 68, 0.06)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                marginBottom: '1.5rem',
              }}
            >
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-danger)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={18} />
                <span>Information Requested by Staff</span>
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-foreground)', marginBottom: '1rem', lineHeight: 1.5 }}>
                <strong>Staff Note:</strong> {request.staffExplanation}
              </p>

              <div>
                <label
                  htmlFor="studentReply"
                  style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}
                >
                  Your Response / Clarification:
                </label>
                <textarea
                  id="studentReply"
                  rows={3}
                  value={studentReply}
                  onChange={(e) => setStudentReply(e.target.value)}
                  placeholder="Provide the requested information here..."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.875rem',
                    fontFamily: 'inherit',
                    marginBottom: '0.75rem',
                  }}
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleRespondToInformation}
                  disabled={isSubmittingReply || !studentReply.trim()}
                >
                  {isSubmittingReply ? 'Submitting...' : 'Submit Response to Staff'}
                </Button>
              </div>
            </div>
          )}

          {request.status === 'approved' && (
            <div
              style={{
                padding: '1.5rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-success-bg, #ecfdf5)',
                border: '1px solid var(--color-success, #059669)',
                marginBottom: '1.5rem',
                textAlign: 'center',
              }}
            >
              <CheckCircle2 size={32} style={{ color: 'var(--color-success, #059669)', margin: '0 auto 0.5rem' }} />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-success, #059669)', marginBottom: '0.5rem' }}>
                Your Access Has Been Approved!
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-foreground)', marginBottom: '1rem' }}>
                An activation link was dispatched to your email. You can activate your account and set your password to log in.
              </p>
              <Link
                to={`/auth/set-password?token=${request.activationToken || 'act-sample'}&email=${encodeURIComponent(request.email)}`}
                style={{ textDecoration: 'none' }}
              >
                <Button variant="primary">
                  <span>Activate & Set Password</span>
                  <ArrowRight size={16} aria-hidden="true" />
                </Button>
              </Link>
            </div>
          )}

          {request.status === 'rejected' && (
            <div
              style={{
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-surface-subtle)',
                border: '1px solid var(--color-border)',
                marginBottom: '1.5rem',
              }}
            >
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <XCircle size={18} style={{ color: 'var(--color-danger)' }} />
                <span>Application Decision</span>
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-foreground-muted)', lineHeight: 1.5 }}>
                {request.staffExplanation || 'Our staff was unable to approve this request at this time due to intake quotas.'}
              </p>
            </div>
          )}

          {/* Action Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
            <Link to="/request-access" style={{ fontSize: '0.875rem', color: 'var(--color-primary)', textDecoration: 'none' }}>
              Submit a new request →
            </Link>

            {['submitted', 'email_verification_pending', 'pending_review', 'needs_information'].includes(request.status) && (
              <Button variant="ghost" size="sm" onClick={handleWithdraw} style={{ color: 'var(--color-danger)' }}>
                Withdraw Application
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
