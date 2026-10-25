import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { ROUTES } from '@/config/routes';
import {
  Send,
  Building2,
  Clock,
  ShieldCheck,
  HelpCircle,
  Sparkles,
  ArrowRight,
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
      newErrors.fullName = 'Full legal name must be at least 2 characters.';
    }
    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      newErrors.email = 'Please provide a valid email address.';
    }
    if (subject.trim().length < 3) {
      newErrors.subject = 'Subject must be at least 3 characters.';
    }
    if (message.trim().length < 10) {
      newErrors.message = 'Inquiry message must be at least 10 characters.';
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

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 1rem 4rem' }}>
      {/* Page Header */}
      <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.25rem 0.75rem',
            borderRadius: 'var(--radius-pill)',
            backgroundColor: 'var(--accent-peach-bg)',
            color: 'var(--action-primary)',
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '0.75rem',
          }}
        >
          <Building2 size={14} aria-hidden="true" />
          <span>Official Desk Communications</span>
        </div>
        <h1
          style={{
            fontSize: '2.25rem',
            fontWeight: 800,
            color: 'var(--text-charcoal)',
            letterSpacing: '-0.025em',
            lineHeight: 1.2,
            marginBottom: '0.75rem',
          }}
        >
          Contact the Admissions Desk
        </h1>
        <p
          style={{
            fontSize: '1rem',
            color: 'var(--text-muted)',
            lineHeight: 1.5,
          }}
        >
          Get in touch with the Unilistics casework team for inquiries regarding European university admissions,
          visa pre-enrollment procedures, and managed student support.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2.5rem',
          alignItems: 'start',
        }}
      >
        {/* Left: Verified Desk Information */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card padding="lg">
            <h2
              style={{
                fontSize: '1.125rem',
                fontWeight: 700,
                color: 'var(--text-charcoal)',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Building2 size={18} className="text-primary" />
              <span>Desk Operations &amp; Corridors</span>
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem' }}>
              <div>
                <strong style={{ color: 'var(--text-charcoal)' }}>Primary Office:</strong>
                <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)' }}>
                  Unilistics Admissions Operations Desk • Islamabad, Pakistan
                </p>
              </div>

              <div>
                <strong style={{ color: 'var(--text-charcoal)' }}>Supported Higher Education Corridors:</strong>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.35rem' }}>
                  {['Germany (DAAD/Uni-assist)', 'France (Campus France EEF)', 'Italy (Universitaly/CIMEA)', 'Romania (Ministerul Educației)'].map(
                    (corridor) => (
                      <span
                        key={corridor}
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.2rem 0.5rem',
                          borderRadius: 'var(--radius-pill)',
                          backgroundColor: 'var(--surface-recessed)',
                          border: '1px solid var(--border-subtle)',
                          color: 'var(--text-body)',
                          fontWeight: 600,
                        }}
                      >
                        {corridor}
                      </span>
                    )
                  )}
                </div>
              </div>

              <div>
                <strong style={{ color: 'var(--text-charcoal)' }}>Desk Operational Hours:</strong>
                <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Clock size={15} className="text-primary" />
                  <span>Monday – Friday, 09:00 – 18:00 PKT (UTC+5)</span>
                </p>
              </div>

              <div>
                <strong style={{ color: 'var(--text-charcoal)' }}>Target Response Standard:</strong>
                <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)' }}>
                  Submissions are reviewed within 24–48 business hours by assigned educational staff.
                </p>
              </div>
            </div>
          </Card>

          {/* Procedural Assistance Card */}
          <div
            style={{
              padding: '1.25rem',
              backgroundColor: 'var(--accent-mint-bg)',
              border: '1px solid var(--accent-mint-border)',
              borderRadius: 'var(--radius-card)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <ShieldCheck size={18} style={{ color: 'var(--accent-mint-text)' }} />
              <strong style={{ color: 'var(--accent-mint-text)', fontSize: '0.9375rem' }}>
                Self-Service Procedural Guides
              </strong>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--accent-mint-text)', lineHeight: 1.5, margin: '0 0 1rem' }}>
              Detailed country checklists, blocked account calculators, HEC/MOFA attestation steps, and APS certification rules are freely searchable in the official Help Centre without filing a ticket.
            </p>
            <Link
              to={ROUTES.HELP}
              className="btn-pill"
              style={{
                backgroundColor: '#ffffff',
                color: 'var(--accent-mint-text)',
                border: '1px solid var(--accent-mint-border)',
                fontSize: '0.8125rem',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              <HelpCircle size={15} />
              <span>Browse Help Centre Guides</span>
            </Link>
          </div>
        </div>

        {/* Right: Public Inquiry Submission Form */}
        <div>
          <Card padding="lg">
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--text-charcoal)',
                marginBottom: '0.5rem',
              }}
            >
              Submit an Official Inquiry
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.4 }}>
              Fill in your details below. Inquiries are securely routed to the Unilistics casework queue.
            </p>

            {submissionResult && (
              <div style={{ marginBottom: '1.5rem' }}>
                <Alert
                  variant={submissionResult.success ? 'success' : 'destructive'}
                  title={submissionResult.success ? 'Inquiry Dispatched Successfully' : 'Submission Error'}
                >
                  <p style={{ margin: 0, fontSize: '0.8125rem' }}>{submissionResult.message}</p>
                  {submissionResult.inquiryId && (
                    <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', fontWeight: 700 }}>
                      Reference ID: <code>{submissionResult.inquiryId}</code>
                    </p>
                  )}
                </Alert>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <Input
                id="contact-full-name"
                label="Full Legal Name"
                type="text"
                required
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }));
                }}
                error={errors.fullName}
                placeholder="e.g. Muhammad Bilal Khan"
              />

              <Input
                id="contact-email"
                label="Email Address"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                }}
                error={errors.email}
                placeholder="e.g. student@example.com"
                helperText="We will respond to this email address within desk operating hours"
              />

              <Select
                id="contact-target-country"
                label="Target Country of Study"
                value={targetCountry}
                onChange={(e) => setTargetCountry(e.target.value)}
                options={[
                  { value: 'germany', label: 'Germany (Uni-assist, VPD & APS Guidelines)' },
                  { value: 'france', label: 'France (Campus France EEF Procedures)' },
                  { value: 'italy', label: 'Italy (Universitaly & CIMEA Comparability)' },
                  { value: 'romania', label: 'Romania (Ministry Scrisoare de Acceptare)' },
                  { value: 'general', label: 'General / Platform Casework Inquiry' },
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
                  if (errors.subject) setErrors((prev) => ({ ...prev, subject: '' }));
                }}
                error={errors.subject}
                placeholder="e.g. Inquiry regarding Winter 2025 VPD submission timeline"
              />

              <Textarea
                id="contact-message"
                label="Inquiry Message"
                required
                rows={5}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (errors.message) setErrors((prev) => ({ ...prev, message: '' }));
                }}
                error={errors.message}
                placeholder="Please describe your qualification background, target university programs, and specific consular or admission questions..."
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isSubmitting}
                leftIcon={<Send size={16} />}
                style={{ width: '100%', fontWeight: 700, marginTop: '0.5rem' }}
              >
                Send Inquiry to Desk
              </Button>
            </form>
          </Card>
        </div>
      </div>

      {/* Alternative Action Corridors */}
      <div
        style={{
          marginTop: '3.5rem',
          padding: '2rem',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-card)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
        }}
      >
        <div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-charcoal)', margin: '0 0 0.25rem' }}>
            Looking for 1-on-1 Managed Application Casework?
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
            Submit an Application Support request to be evaluated for dedicated counsellor assignment.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to={ROUTES.REQUEST_ACCESS} className="btn-pill btn-pill-primary" style={{ textDecoration: 'none' }}>
            <Sparkles size={16} />
            <span>Request Managed Support</span>
          </Link>
          <Link to={ROUTES.UNIVERSITIES} className="btn-pill btn-pill-secondary" style={{ textDecoration: 'none' }}>
            <span>Explore Universities</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};
