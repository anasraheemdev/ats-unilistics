import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/ui/Alert';
import { ROUTES } from '@/config/routes';
import {
  Send,
  CheckCircle2,
  ArrowRight,
  Globe,
  FileText,
  HelpCircle,
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [targetCountry, setTargetCountry] = useState('germany');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    success: boolean;
    inquiryId?: string;
    message?: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSubmissionResult(null);

    const newErrors: Record<string, string> = {};
    if (fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters.';
    }
    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      newErrors.email = 'Please provide a valid email address.';
    }
    if (subject.trim().length < 3) {
      newErrors.subject = 'Subject must be at least 3 characters.';
    }
    if (message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.support.submitPublicContact({
        fullName: fullName.trim(),
        email: email.trim(),
        targetCountry,
        subject: subject.trim(),
        message: message.trim(),
      });
      setSubmissionResult({
        success: true,
        inquiryId: res.inquiryId,
        message: res.message,
      });
      setFullName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      setSubmissionResult({
        success: false,
        message: err?.message || 'Failed to submit contact inquiry. Please check your inputs.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickLinks = [
    {
      icon: HelpCircle,
      label: 'Browse Help Centre',
      desc: 'Find answers to common questions',
      to: ROUTES.HELP,
    },
    {
      icon: FileText,
      label: 'Request Managed Guidance',
      desc: 'Apply for a dedicated counsellor',
      to: ROUTES.REQUEST_GUIDANCE,
    },
    {
      icon: Globe,
      label: 'Check Request Status',
      desc: 'View your guidance request status',
      to: ROUTES.REQUEST_STATUS,
    },
  ];

  return (
    <div
      style={{
        backgroundColor: 'var(--surface-canvas)',
        color: 'var(--text-charcoal)',
        fontFamily: 'var(--font-family-base)',
        minHeight: '100vh',
      }}
    >
      {/* Main layout */}
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: 'clamp(3rem, 6vw, 5rem) clamp(1.25rem, 5vw, 3rem)',
          display: 'grid',
          gridTemplateColumns: '1fr 1.3fr',
          gap: 'clamp(2.5rem, 5vw, 5rem)',
          alignItems: 'start',
        }}
        className="contact-layout"
      >
        {/* LEFT: Info + image */}
        <div>
          {/* Image */}
          <div
            style={{
              borderRadius: 'var(--radius-card)',
              overflow: 'hidden',
              marginBottom: '2rem',
              aspectRatio: '4/3',
            }}
          >
            <img
              src="/images/contact_office_warm.jpg"
              alt="A warm, welcoming office space"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />
          </div>

          {/* Heading */}
          <div style={{ marginBottom: '2rem' }}>
            <span
              style={{
                display: 'inline-block',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--action-primary)',
                backgroundColor: 'rgba(36, 91, 66, 0.08)',
                padding: '0.3rem 0.875rem',
                borderRadius: 'var(--radius-pill)',
                marginBottom: '0.875rem',
              }}
            >
              Admissions Desk
            </span>
            <h1
              style={{
                fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                color: 'var(--text-charcoal)',
                margin: '0 0 0.875rem',
                lineHeight: 1.15,
              }}
            >
              Contact the Admissions Desk
            </h1>
            <p
              style={{
                fontSize: '0.9375rem',
                color: 'var(--text-muted)',
                lineHeight: 1.65,
                margin: 0,
              }}
            >
              Get in touch for inquiries regarding European university admissions, visa pre-enrollment procedures, and
              managed student support.
            </p>
          </div>

          {/* Desk information */}
          <div
            style={{
              backgroundColor: 'var(--surface-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-card)',
              padding: '1.5rem',
              marginBottom: '1.5rem',
            }}
          >
            <h2
              style={{
                fontSize: '0.9rem',
                fontWeight: 700,
                color: 'var(--text-charcoal)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                margin: '0 0 1rem',
              }}
            >
              Supported Corridors
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {[
                'Germany · APS / Uni-assist',
                'France · Campus France EEF',
                'Italy · Universitaly / CIMEA',
                'Romania · Direct Acceptance',
              ].map((corridor) => (
                <span
                  key={corridor}
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '0.3rem 0.625rem',
                    borderRadius: 'var(--radius-pill)',
                    backgroundColor: 'var(--surface-recessed)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-body)',
                  }}
                >
                  {corridor}
                </span>
              ))}
            </div>
            <p
              style={{
                fontSize: '0.8125rem',
                color: 'var(--text-muted)',
                margin: '1rem 0 0',
                lineHeight: 1.55,
              }}
            >
              All inquiries are reviewed by human counsellors. We do not use automated submission bots or scraping
              engines.
            </p>
          </div>

          {/* Quick links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            <p
              style={{
                fontSize: '0.8125rem',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                margin: '0 0 0.375rem',
              }}
            >
              Quick links
            </p>
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.label}
                  to={link.to}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--surface-card)',
                    border: '1px solid var(--border-subtle)',
                    textDecoration: 'none',
                    transition: 'border-color 0.15s ease, background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-refined)';
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--surface-hover)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-subtle)';
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--surface-card)';
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: 'var(--radius-xs)',
                      backgroundColor: 'var(--surface-recessed)',
                      color: 'var(--action-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={18} aria-hidden="true" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-charcoal)' }}>
                      {link.label}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{link.desc}</div>
                  </div>
                  <ArrowRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} aria-hidden="true" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Form */}
        <div>
          {/* Success state */}
          {submissionResult?.success ? (
            <div
              style={{
                backgroundColor: 'var(--surface-card)',
                border: '2px solid var(--action-primary)',
                borderRadius: 'var(--radius-card)',
                padding: '3rem 2.5rem',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-success-bg)',
                  color: 'var(--color-success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                }}
              >
                <CheckCircle2 size={32} aria-hidden="true" />
              </div>
              <h2
                style={{
                  fontSize: '1.375rem',
                  fontWeight: 800,
                  color: 'var(--text-charcoal)',
                  letterSpacing: '-0.02em',
                  margin: '0 0 0.75rem',
                }}
              >
                Inquiry Received
              </h2>
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', margin: '0 0 1.25rem', lineHeight: 1.6 }}>
                {submissionResult.message || 'Your inquiry has been submitted. The admissions desk will review it and respond.'}
              </p>
              {submissionResult.inquiryId && (
                <p style={{ fontSize: '0.8125rem', margin: '0 0 1.5rem' }}>
                  Reference:{' '}
                  <code
                    style={{
                      fontWeight: 700,
                      backgroundColor: 'var(--surface-recessed)',
                      padding: '0.15rem 0.5rem',
                      borderRadius: 'var(--radius-xs)',
                    }}
                  >
                    {submissionResult.inquiryId}
                  </code>
                </p>
              )}
              <button
                onClick={() => setSubmissionResult(null)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: 'var(--action-primary)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Send another inquiry
                <ArrowRight size={14} aria-hidden="true" />
              </button>
            </div>
          ) : (
            <div
              style={{
                backgroundColor: 'var(--surface-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-card)',
                padding: '2rem',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <h2
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: 'var(--text-charcoal)',
                  letterSpacing: '-0.02em',
                  margin: '0 0 0.375rem',
                }}
              >
                Send an Inquiry
              </h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0 0 1.5rem', lineHeight: 1.5 }}>
                For authenticated support tickets, use the{' '}
                <Link to="/support-desk" style={{ color: 'var(--action-primary)', fontWeight: 600 }}>
                  Support Desk
                </Link>{' '}
                instead.
              </p>

              {submissionResult && !submissionResult.success && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <Alert variant="destructive" title="Submission failed">
                    {submissionResult.message}
                  </Alert>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
                <Input
                  id="contact-name"
                  label="Full name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (errors.fullName) setErrors((p) => ({ ...p, fullName: '' }));
                  }}
                  error={errors.fullName}
                  placeholder="e.g. Ahmad Khan"
                />

                <Input
                  id="contact-email"
                  label="Email address"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((p) => ({ ...p, email: '' }));
                  }}
                  error={errors.email}
                  placeholder="you@example.com"
                />

                <Select
                  id="contact-country"
                  label="Target study country"
                  value={targetCountry}
                  onChange={(e) => setTargetCountry(e.target.value)}
                  options={[
                    { value: 'germany', label: 'Germany' },
                    { value: 'france', label: 'France' },
                    { value: 'italy', label: 'Italy' },
                    { value: 'romania', label: 'Romania' },
                    { value: 'general', label: 'General / Not sure yet' },
                  ]}
                />

                <Input
                  id="contact-subject"
                  label="Subject"
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value);
                    if (errors.subject) setErrors((p) => ({ ...p, subject: '' }));
                  }}
                  error={errors.subject}
                  placeholder="e.g. APS certificate enquiry"
                />

                <Textarea
                  id="contact-message"
                  label="Message"
                  required
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (errors.message) setErrors((p) => ({ ...p, message: '' }));
                  }}
                  error={errors.message}
                  placeholder="Describe your inquiry in detail..."
                  rows={5}
                />

                <Button
                  id="contact-submit-btn"
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isSubmitting}
                  leftIcon={<Send size={17} aria-hidden="true" />}
                  style={{ width: '100%', fontWeight: 700 }}
                >
                  Send Inquiry
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .contact-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ContactPage;
