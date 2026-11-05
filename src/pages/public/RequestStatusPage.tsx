import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { AccessRequest, AccessRequestStatus } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { Textarea } from '@/components/ui/Textarea';
import { Input } from '@/components/ui/Input';
import {
  Search,
  Clock,
  ShieldCheck,
  RefreshCw,
  Send,
  LogIn,
  FileCheck,
  ArrowRight,
} from 'lucide-react';

export const RequestStatusPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tokenParam = searchParams.get('token') || '';
  const idParam = searchParams.get('id') || '';

  // Auth user state
  const { data: user } = useQuery({
    queryKey: ['auth-user-status-page'],
    queryFn: () => api.auth.getCurrentUser(),
  });

  const isAuthenticated = user && user.role !== 'visitor';

  // Manual lookup state (for visitors or users querying a specific reference)
  const [lookupId, setLookupId] = useState(idParam);
  const [lookupEmail, setLookupEmail] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [lookupResult, setLookupResult] = useState<AccessRequest | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Authenticated active request
  const {
    data: authRequest,
    refetch,
  } = useQuery<AccessRequest | null>({
    queryKey: ['my-active-guidance-request', user?.email],
    queryFn: async () => {
      if (!isAuthenticated) return null;
      if (idParam) {
        const found = await api.requests.getRequestStatus(idParam);
        if (found && (found.email.toLowerCase() === user.email.toLowerCase() || found.id === user.id)) {
          return found;
        }
      }
      return api.requests.getMyActiveGuidanceRequest();
    },
    enabled: Boolean(isAuthenticated),
  });

  // Effective display request (either looked up manually or from authenticated profile)
  const displayRequest = lookupResult || authRequest;

  const [studentReply, setStudentReply] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Auto-verify if token is present and matches
  useEffect(() => {
    if (tokenParam && displayRequest && displayRequest.status === 'email_verification_pending') {
      api.requests
        .verifyEmail(displayRequest.id, tokenParam)
        .then(() => {
          setActionSuccess('Your email address has been verified. Your request is now under staff review.');
          if (isAuthenticated) refetch();
        })
        .catch(() => {
          // Token error or already verified
        });
    }
  }, [tokenParam, displayRequest, refetch, isAuthenticated]);

  const handleManualLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError(null);
    setHasSearched(true);

    const cleanId = lookupId.trim();
    const cleanEmail = lookupEmail.trim().toLowerCase();

    if (!cleanId && !cleanEmail) {
      setLookupError('Please enter your Reference ID, registered email address, or both.');
      return;
    }

    setIsSearching(true);
    try {
      const targetQuery = cleanId || cleanEmail;
      const found = await api.requests.getRequestStatus(targetQuery);

      if (!found) {
        setLookupResult(null);
        setLookupError(
          'No admissions guidance request was found matching these credentials. Please check your submission confirmation email or sign in.'
        );
        return;
      }

      // If user provided both ID and Email, ensure email matches to prevent enumeration
      if (cleanId && cleanEmail && found.email.toLowerCase() !== cleanEmail) {
        setLookupResult(null);
        setLookupError(
          'The provided email address does not match the record for this Reference ID. Please verify your details.'
        );
        return;
      }

      setLookupResult(found);
      setLookupError(null);
    } catch (err: any) {
      setLookupResult(null);
      setLookupError(err?.message || 'Failed to query request status. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleRespondToInformation = async () => {
    if (!displayRequest || !studentReply.trim()) return;
    setIsSubmittingReply(true);
    setActionError(null);
    try {
      await api.requests.respondToInformation(displayRequest.id, studentReply.trim());
      setActionSuccess('Your clarification has been submitted. Your request has returned to pending staff review.');
      setStudentReply('');
      if (isAuthenticated) refetch();
      else {
        const updated = await api.requests.getRequestStatus(displayRequest.id);
        if (updated) setLookupResult(updated);
      }
    } catch (err: any) {
      setActionError(err?.message || 'Failed to submit response.');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleWithdraw = async () => {
    if (!displayRequest) return;
    if (!window.confirm('Are you sure you want to withdraw this admissions guidance request?')) return;
    try {
      await api.requests.withdrawRequest(displayRequest.id);
      setActionSuccess('Your guidance request has been withdrawn.');
      if (isAuthenticated) refetch();
      else {
        const updated = await api.requests.getRequestStatus(displayRequest.id);
        if (updated) setLookupResult(updated);
      }
    } catch (err: any) {
      setActionError(err?.message || 'Failed to withdraw request.');
    }
  };

  const getStatusPresentation = (status: AccessRequestStatus) => {
    switch (status) {
      case 'email_verification_pending':
        return {
          label: 'Email Verification Pending',
          variant: 'warning' as const,
          description:
            'A verification link was dispatched to your email address. Please click the link to confirm your submission so our staff can begin review.',
          step: 1,
        };
      case 'submitted':
      case 'pending_review':
        return {
          label: 'Under Staff Evaluation',
          variant: 'info' as const,
          description:
            'Your academic background and corridor preferences are currently being evaluated by educational staff. Standard turnaround is 1–2 business days.',
          step: 2,
        };
      case 'needs_information':
        return {
          label: 'Clarification Requested',
          variant: 'warning' as const,
          description:
            'Our admissions staff needs additional information regarding your transcript or degree pathway to determine counsellor assignment.',
          step: 2,
        };
      case 'approved':
        return {
          label: 'Approved · Managed Workspace Active',
          variant: 'success' as const,
          description:
            'Your admissions guidance request has been approved. A dedicated counsellor has been assigned and your managed student case room is ready.',
          step: 3,
        };
      case 'rejected':
        return {
          label: 'Guidance Not Approved',
          variant: 'destructive' as const,
          description:
            'Based on current institutional entry requirements, we are unable to open a managed casework dossier at this time. You retain full Explorer catalogue access.',
          step: 3,
        };
      case 'withdrawn':
        return {
          label: 'Request Withdrawn',
          variant: 'default' as const,
          description: 'This guidance request was withdrawn by the applicant.',
          step: 3,
        };
      default:
        return {
          label: status,
          variant: 'default' as const,
          description: 'Status update pending.',
          step: 1,
        };
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--surface-canvas, #F6F8F5)',
        color: 'var(--text-charcoal, #19261F)',
        fontFamily: 'var(--font-family-base)',
        minHeight: '100vh',
      }}
    >
      {/* 1. Header Section */}
      <section
        style={{
          backgroundColor: '#19261F',
          color: '#FFFFFF',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: 'clamp(3.5rem, 6vw, 5rem) clamp(1.25rem, 5vw, 3rem) clamp(2.5rem, 4vw, 3.5rem)',
        }}
      >
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--brand-citron, #D7EE83)',
              backgroundColor: 'rgba(215, 238, 131, 0.12)',
              padding: '0.35rem 0.875rem',
              borderRadius: 'var(--radius-pill, 9999px)',
              marginBottom: '1.25rem',
              border: '1px solid rgba(215, 238, 131, 0.25)',
            }}
          >
            <Clock size={13} aria-hidden="true" />
            Admissions Intake Tracker
          </div>

          <h1
            style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: '#FFFFFF',
              margin: '0 0 1rem',
              lineHeight: 1.15,
            }}
          >
            Check Request Status
          </h1>

          <p
            style={{
              fontSize: 'clamp(1rem, 1.5vw, 1.125rem)',
              color: 'rgba(255, 255, 255, 0.82)',
              lineHeight: 1.6,
              margin: 0,
              maxWidth: '640px',
            }}
          >
            Track the evaluation progress of your European admissions guidance request, view staff feedback, or respond
            to clarification inquiries.
          </p>
        </div>
      </section>

      {/* 2. Main Body Container */}
      <div
        style={{
          maxWidth: '960px',
          margin: '0 auto',
          padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1.25rem, 5vw, 3rem)',
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem',
        }}
      >
        {/* Global Feedback Alerts */}
        {actionSuccess && (
          <Alert variant="success" title="Status Updated">
            {actionSuccess}
          </Alert>
        )}
        {actionError && (
          <Alert variant="destructive" title="Action Failed">
            {actionError}
          </Alert>
        )}

        {/* 3. Lookup Form Section */}
        <div
          style={{
            backgroundColor: 'var(--surface-card, #FFFFFF)',
            border: '1px solid var(--border-subtle, #E1E8DE)',
            borderRadius: 'var(--radius-card, 24px)',
            padding: 'clamp(1.75rem, 4vw, 2.25rem)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem' }}>
            <Search size={22} style={{ color: 'var(--action-primary, #245B42)' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-charcoal, #19261F)', margin: 0 }}>
              Look Up Your Guidance Request
            </h2>
          </div>

          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted, #58695E)', margin: '0 0 1.5rem', lineHeight: 1.55 }}>
            Enter your Request Reference ID and/or the email address used during submission. If you already have an account,{' '}
            <Link to="/sign-in?returnUrl=/request-status" id="request-status-signin-btn" style={{ color: 'var(--action-primary, #245B42)', fontWeight: 700 }}>
              sign in here
            </Link>{' '}
            for instant automatic tracking.
          </p>

          <form onSubmit={handleManualLookup} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
              <div>
                <Input
                  id="lookup-id"
                  label="Reference ID (e.g. 9d5af04c... or REQ-xxxx)"
                  placeholder="Paste your Reference ID"
                  value={lookupId}
                  onChange={(e) => setLookupId(e.target.value)}
                />
              </div>

              <div>
                <Input
                  id="lookup-email"
                  label="Registered Email Address"
                  type="email"
                  placeholder="student@example.com"
                  value={lookupEmail}
                  onChange={(e) => setLookupEmail(e.target.value)}
                />
              </div>
            </div>

            {lookupError && (
              <Alert variant="destructive" title="Lookup Unsuccessful">
                {lookupError}
              </Alert>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted, #58695E)' }}>
                <ShieldCheck size={16} style={{ color: 'var(--action-primary, #245B42)' }} />
                <span>Dual-identifier verification safeguards applicant record privacy</span>
              </div>

              <button
                type="submit"
                id="lookup-submit-btn"
                disabled={isSearching}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 2rem',
                  borderRadius: 'var(--radius-pill, 9999px)',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  backgroundColor: 'var(--action-primary, #245B42)',
                  border: 'none',
                  cursor: isSearching ? 'wait' : 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'opacity 0.15s ease',
                  opacity: isSearching ? 0.7 : 1,
                }}
              >
                {isSearching ? <RefreshCw size={16} className="animate-spin" /> : <Search size={16} />}
                <span>{isSearching ? 'Verifying...' : 'Find Request Status'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* 4. Display Request Card (if found or authenticated) */}
        {displayRequest ? (
          <div
            style={{
              backgroundColor: 'var(--surface-card, #FFFFFF)',
              border: '1px solid var(--border-subtle, #E1E8DE)',
              borderRadius: 'var(--radius-card, 24px)',
              padding: 'clamp(2rem, 5vw, 2.75rem)',
              boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
            }}
          >
            {/* Header info */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '1rem',
                borderBottom: '1px solid var(--border-subtle, #E1E8DE)',
                paddingBottom: '1.5rem',
                marginBottom: '1.75rem',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: 'var(--text-subtle, #58695E)',
                    fontFamily: 'var(--font-family-mono)',
                    letterSpacing: '0.05em',
                  }}
                >
                  REFERENCE ID: {displayRequest.id}
                </span>
                <h3
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    color: 'var(--text-charcoal, #19261F)',
                    margin: '0.25rem 0 0.25rem',
                  }}
                >
                  {displayRequest.fullName}
                </h3>
                <span style={{ fontSize: '0.84rem', color: 'var(--text-muted, #58695E)' }}>
                  {displayRequest.email} · Submitted on{' '}
                  {new Date(displayRequest.createdAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <div>
                <Badge variant={getStatusPresentation(displayRequest.status).variant} size="md">
                  {getStatusPresentation(displayRequest.status).label}
                </Badge>
              </div>
            </div>

            {/* Status Narrative Callout */}
            <div
              style={{
                backgroundColor: 'var(--surface-recessed, #EDF2E9)',
                borderRadius: 'var(--radius-sm, 12px)',
                padding: '1.25rem',
                marginBottom: '2rem',
                border: '1px solid var(--border-subtle, #E1E8DE)',
              }}
            >
              <h4
                style={{
                  fontSize: '0.975rem',
                  fontWeight: 700,
                  color: 'var(--text-charcoal, #19261F)',
                  margin: '0 0 0.35rem',
                }}
              >
                Current Stage Overview
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-body, #2C3E33)', margin: 0, lineHeight: 1.6 }}>
                {getStatusPresentation(displayRequest.status).description}
              </p>
            </div>

            {/* Request Parameters Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.25rem',
                marginBottom: '2rem',
              }}
            >
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: 'var(--surface-canvas, #F6F8F5)',
                  borderRadius: 'var(--radius-sm, 12px)',
                  border: '1px solid var(--border-subtle, #E1E8DE)',
                }}
              >
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-subtle, #58695E)' }}>
                  Target Destination(s)
                </span>
                <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--action-primary, #245B42)', margin: '0.25rem 0 0', textTransform: 'capitalize' }}>
                  {displayRequest.countryInterests?.join(', ') || displayRequest.targetCountry || 'Germany'}
                </p>
              </div>

              <div
                style={{
                  padding: '1rem',
                  backgroundColor: 'var(--surface-canvas, #F6F8F5)',
                  borderRadius: 'var(--radius-sm, 12px)',
                  border: '1px solid var(--border-subtle, #E1E8DE)',
                }}
              >
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-subtle, #58695E)' }}>
                  Service Tier
                </span>
                <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-charcoal, #19261F)', margin: '0.25rem 0 0' }}>
                  Managed Guidance Case
                </p>
              </div>

              <div
                style={{
                  padding: '1rem',
                  backgroundColor: 'var(--surface-canvas, #F6F8F5)',
                  borderRadius: 'var(--radius-sm, 12px)',
                  border: '1px solid var(--border-subtle, #E1E8DE)',
                }}
              >
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-subtle, #58695E)' }}>
                  Assigned Desk
                </span>
                <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-charcoal, #19261F)', margin: '0.25rem 0 0' }}>
                  European Admissions Office
                </p>
              </div>
            </div>

            {/* Action 1: Information requested by staff */}
            {displayRequest.status === 'needs_information' && (
              <div
                style={{
                  border: '2px solid rgba(245, 158, 11, 0.4)',
                  borderRadius: 'var(--radius-sm, 12px)',
                  padding: '1.5rem',
                  backgroundColor: 'rgba(245, 158, 11, 0.05)',
                  marginBottom: '2rem',
                }}
              >
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#B45309', margin: '0 0 0.5rem' }}>
                  Action Required: Provide Requested Clarification
                </h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-charcoal, #19261F)', marginBottom: '1rem', lineHeight: 1.55 }}>
                  Please reply to the counsellor's inquiry below to resume review of your profile:
                </p>
                <Textarea
                  id="student-clarification-reply"
                  label="Your Clarification / Supplementary Details"
                  value={studentReply}
                  onChange={(e) => setStudentReply(e.target.value)}
                  placeholder="Provide clarification details regarding your degrees, grading scale, or timeline..."
                  rows={4}
                />
                <button
                  type="button"
                  onClick={handleRespondToInformation}
                  disabled={isSubmittingReply || !studentReply.trim()}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.625rem 1.5rem',
                    borderRadius: 'var(--radius-pill, 9999px)',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    backgroundColor: 'var(--action-primary, #245B42)',
                    border: 'none',
                    cursor: isSubmittingReply ? 'wait' : 'pointer',
                    marginTop: '0.75rem',
                  }}
                >
                  <Send size={15} />
                  <span>{isSubmittingReply ? 'Submitting...' : 'Send Clarification to Staff'}</span>
                </button>
              </div>
            )}

            {/* Action 2: Approved -> Proceed to Workspace */}
            {displayRequest.status === 'approved' && (
              <div style={{ marginTop: '1.5rem' }}>
                <Link
                  to="/student"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.875rem 2rem',
                    borderRadius: 'var(--radius-pill, 9999px)',
                    fontSize: '0.9375rem',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    backgroundColor: 'var(--action-primary, #245B42)',
                    textDecoration: 'none',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <span>Enter Managed Student Case Room</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            )}

            {/* Withdraw button for active pending requests */}
            {(displayRequest.status === 'pending_review' || displayRequest.status === 'needs_information') && (
              <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle, #E1E8DE)' }}>
                <button
                  type="button"
                  onClick={handleWithdraw}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted, #58695E)',
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Withdraw this guidance request
                </button>
              </div>
            )}
          </div>
        ) : hasSearched && !isSearching ? (
          /* Empty / Not Found Guidance Card */
          <div
            style={{
              backgroundColor: 'var(--surface-card, #FFFFFF)',
              border: '1px solid var(--border-subtle, #E1E8DE)',
              borderRadius: 'var(--radius-card, 24px)',
              padding: '3rem 2rem',
              textAlign: 'center',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'var(--surface-recessed, #EDF2E9)',
                color: 'var(--text-muted, #58695E)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
              }}
            >
              <FileCheck size={24} aria-hidden="true" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-charcoal, #19261F)', margin: '0 0 0.5rem' }}>
              No Active Guidance Record Found
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted, #58695E)', margin: '0 auto 1.5rem', maxWidth: '440px', lineHeight: 1.5 }}>
              We could not find an admissions request matching your search query. If you have not submitted a guidance request yet, you can do so below.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Link
                to="/request-guidance"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 2rem',
                  borderRadius: 'var(--radius-pill, 9999px)',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  backgroundColor: 'var(--action-primary, #245B42)',
                  textDecoration: 'none',
                }}
              >
                <span>Request Managed Guidance</span>
                <ArrowRight size={15} />
              </Link>
              <Link
                to="/support-desk"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 2rem',
                  borderRadius: 'var(--radius-pill, 9999px)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--text-charcoal, #19261F)',
                  backgroundColor: 'var(--surface-canvas, #F6F8F5)',
                  border: '1px solid var(--border-subtle, #E1E8DE)',
                  textDecoration: 'none',
                }}
              >
                <span>Contact Support Desk</span>
              </Link>
            </div>
          </div>
        ) : !isAuthenticated && (
          /* Pre-search informative guidance card */
          <div
            style={{
              backgroundColor: 'var(--surface-card, #FFFFFF)',
              border: '1px solid var(--border-subtle, #E1E8DE)',
              borderRadius: 'var(--radius-card, 24px)',
              padding: '2.5rem 2rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-charcoal, #19261F)', margin: '0 0 1rem' }}>
              Where do I find my Request Reference ID?
            </h3>
            <ul style={{ margin: '0 0 1.5rem', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted, #58695E)', lineHeight: 1.6 }}>
              <li>
                <strong>Confirmation Email:</strong> Immediately upon submitting a guidance request, an automated email containing your unique Reference ID was sent to your registered address.
              </li>
              <li>
                <strong>Format:</strong> Reference IDs look like <code style={{ fontFamily: 'var(--font-family-mono)', backgroundColor: 'var(--surface-recessed, #EDF2E9)', padding: '2px 6px', borderRadius: '4px' }}>9d5af04c-...</code>.
              </li>
              <li>
                <strong>Lost Reference:</strong> If you cannot locate your Reference ID, you can query by your registered email address above or sign in to view your connected record.
              </li>
            </ul>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Link
                to="/sign-in?returnUrl=/request-status"
                id="request-status-signin-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.625rem 1.75rem',
                  borderRadius: 'var(--radius-pill, 9999px)',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  backgroundColor: 'var(--action-primary, #245B42)',
                  textDecoration: 'none',
                }}
              >
                <LogIn size={15} />
                <span>Sign in for Automatic Tracking</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestStatusPage;
