import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { DestinationCountry, AccessRequest } from '@/types';
import {
  CheckCircle2,
  Clock,
  ArrowRight,
  LogIn,
  Users,
  FileText,
  Globe,
  ShieldCheck,
} from 'lucide-react';

const benefits = [
  {
    icon: Users,
    title: 'Dedicated Counsellor',
    desc: 'An assigned educational caseworker manages your application from intake through arrival.',
  },
  {
    icon: FileText,
    title: 'Document Audit',
    desc: 'Your counsellor reviews all documents before submission to prevent costly errors.',
  },
  {
    icon: Globe,
    title: 'Country Expertise',
    desc: 'Specialised guidance for Germany, France, Italy, and Romania — covering APS, Campus France, CIMEA, and more.',
  },
  {
    icon: ShieldCheck,
    title: 'Human-in-the-Loop',
    desc: 'All submissions are staff-operated. No automated bots, no scrapers, no university credential escrow.',
  },
];

export const RequestGuidancePage: React.FC = () => {
  const { data: user } = useQuery({
    queryKey: ['auth-user-guidance-page'],
    queryFn: () => api.auth.getCurrentUser(),
  });

  const isAuthenticated = user && user.role !== 'visitor';

  const { data: existingRequest } = useQuery<AccessRequest | null>({
    queryKey: ['user-active-guidance-request', user?.email],
    queryFn: () => (isAuthenticated ? api.requests.getMyActiveGuidanceRequest() : Promise.resolve(null)),
    enabled: Boolean(isAuthenticated),
  });

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCountries, setSelectedCountries] = useState<DestinationCountry[]>(['germany']);
  const [academicLevel, setAcademicLevel] = useState('master');
  const [studentMessage, setStudentMessage] = useState('');
  const [consentPrivacy, setConsentPrivacy] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    message: string;
    requestId?: string;
  } | null>(null);

  useEffect(() => {
    if (user && user.role !== 'visitor') {
      if (user.fullName && user.fullName !== 'Visitor' && !user.fullName.toLowerCase().includes('account')) {
        setFullName(user.fullName);
      }
      if (user.email && !user.email.endsWith('.local')) {
        setEmail(user.email);
      }
    }
  }, [user]);

  const toggleCountry = (country: DestinationCountry) => {
    setSelectedCountries((prev) =>
      prev.includes(country)
        ? prev.length > 1
          ? prev.filter((c) => c !== country)
          : prev
        : [...prev, country]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSubmitResult(null);

    const newErrors: Record<string, string> = {};
    if (!fullName.trim() || fullName.trim().length < 2) {
      newErrors.fullName = 'Full legal name must be at least 2 characters.';
    }
    if (!email.trim() || !email.includes('@')) {
      newErrors.email = 'Please provide a valid email address.';
    }
    if (selectedCountries.length === 0) {
      newErrors.countries = 'Please select at least one target study destination.';
    }
    if (!consentPrivacy) {
      newErrors.consent = 'You must confirm consent for admissions casework handling.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.requests.submitAccessRequest({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        countryInterests: selectedCountries,
        requestedService: 'managed_application_case',
        consentPrivacy: true,
        isUpgrade: false,
        studentMessage: `Level: ${academicLevel}. Notes: ${studentMessage.trim() || 'No additional notes provided.'}`,
      });

      setSubmitResult({
        success: true,
        message: res.message,
        requestId: res.requestId,
      });
    } catch (err: any) {
      setSubmitResult({
        success: false,
        message: err?.message || 'Failed to submit guidance request. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const countries = [
    { id: 'germany' as DestinationCountry, name: 'Germany', note: 'Free / Subsidized Tuition' },
    { id: 'france' as DestinationCountry, name: 'France', note: 'Campus France Process' },
    { id: 'italy' as DestinationCountry, name: 'Italy', note: 'Universitaly & DSU' },
    { id: 'romania' as DestinationCountry, name: 'Romania', note: 'Direct Acceptance' },
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
      {/* Page Header */}
      <div
        style={{
          backgroundColor: 'var(--brand-forest)',
          padding: 'clamp(3rem, 6vw, 5rem) clamp(1.25rem, 5vw, 3rem)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <img
          src="/images/guidance_intro_visual.jpg"
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 20%',
            opacity: 0.2,
          }}
          loading="eager"
          decoding="async"
        />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto' }}>
          <span
            style={{
              display: 'inline-block',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--brand-citron)',
              backgroundColor: 'rgba(215, 238, 131, 0.15)',
              padding: '0.3rem 0.875rem',
              borderRadius: 'var(--radius-pill)',
              marginBottom: '1.25rem',
              border: '1px solid rgba(215, 238, 131, 0.25)',
            }}
          >
            Admissions Casework Intake
          </span>
          <h1
            style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: '#FFFFFF',
              margin: '0 0 0.875rem',
              lineHeight: 1.1,
              maxWidth: '680px',
            }}
          >
            Request Managed Guidance
          </h1>
          <p
            style={{
              fontSize: 'clamp(1rem, 1.5vw, 1.125rem)',
              color: 'rgba(255,255,255,0.8)',
              lineHeight: 1.6,
              margin: 0,
              maxWidth: '600px',
            }}
          >
            Connect with a dedicated admissions counsellor for structured European university applications, document
            evaluation, and consular visa tracking.
          </p>
        </div>
      </div>

      {/* Main content */}
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: 'clamp(3rem, 6vw, 5rem) clamp(1.25rem, 5vw, 3rem)',
          display: 'grid',
          gridTemplateColumns: '1fr 1.4fr',
          gap: 'clamp(2rem, 4vw, 4rem)',
          alignItems: 'start',
        }}
        className="guidance-layout"
      >
        {/* LEFT: Info */}
        <div>
          <h2
            style={{
              fontSize: '1.375rem',
              fontWeight: 800,
              color: 'var(--text-charcoal)',
              letterSpacing: '-0.02em',
              margin: '0 0 0.625rem',
            }}
          >
            What's included in managed guidance
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 0 2rem' }}>
            Each approved guidance case includes a dedicated counsellor and access to the managed student workspace.
            Approval requires educational staff review.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.title}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.875rem',
                    padding: '1rem',
                    backgroundColor: 'var(--surface-card)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: 'var(--radius-xs)',
                      backgroundColor: 'var(--surface-recessed)',
                      color: 'var(--action-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={20} aria-hidden="true" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-charcoal)', marginBottom: '0.25rem' }}>
                      {benefit.title}
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                      {benefit.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div
            style={{
              marginTop: '1.5rem',
              padding: '1rem',
              backgroundColor: 'rgba(215, 238, 131, 0.12)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(215, 238, 131, 0.35)',
            }}
          >
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-body)', margin: 0, lineHeight: 1.6 }}>
              <strong>Explorer access is retained</strong> during review. You can continue browsing the full university
              catalogue while your request is evaluated by educational staff.
            </p>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <Link
              to="/how-it-works"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: 700,
                color: 'var(--action-primary)',
                textDecoration: 'none',
              }}
            >
              How the process works
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* RIGHT: Form / state panel */}
        <div>
          {/* State: Already managed student */}
          {user?.role === 'managed_student' && (
            <div
              style={{
                backgroundColor: 'var(--surface-card)',
                border: '2px solid var(--action-primary)',
                borderRadius: 'var(--radius-card)',
                padding: '2.5rem',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-success-bg)',
                  color: 'var(--color-success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                }}
              >
                <CheckCircle2 size={28} aria-hidden="true" />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-charcoal)', margin: '0 0 0.625rem' }}>
                Your Managed Workspace is Active
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0 0 1.5rem', lineHeight: 1.55 }}>
                You've already been approved for managed casework. Your application room, document vault, and assigned
                counsellor are accessible now.
              </p>
              <Link
                to="/student"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 2rem',
                  borderRadius: 'var(--radius-control)',
                  fontSize: '0.9375rem',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  backgroundColor: 'var(--action-primary)',
                  textDecoration: 'none',
                }}
              >
                Open Workspace
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          )}

          {/* State: Pending review */}
          {existingRequest && existingRequest.status !== 'approved' && existingRequest.status !== 'withdrawn' && (
            <div
              style={{
                backgroundColor: 'var(--surface-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-card)',
                padding: '2.5rem',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-warning-bg)',
                  color: 'var(--color-warning)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                }}
              >
                <Clock size={28} aria-hidden="true" />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-charcoal)', margin: '0 0 0.625rem' }}>
                Request Under Review
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0 0 0.375rem', lineHeight: 1.55 }}>
                Status:{' '}
                <strong style={{ color: 'var(--text-charcoal)', textTransform: 'capitalize' }}>
                  {existingRequest.status.replace('_', ' ')}
                </strong>
              </p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0 0 1.5rem' }}>
                Submitted: {new Date(existingRequest.createdAt).toLocaleDateString()}
              </p>
              <Link
                to="/request-status"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.625rem 1.5rem',
                  borderRadius: 'var(--radius-control)',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: 'var(--text-charcoal)',
                  backgroundColor: 'var(--surface-recessed)',
                  textDecoration: 'none',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                View Full Status
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
          )}

          {/* State: Unauthenticated */}
          {!isAuthenticated && (
            <div
              style={{
                backgroundColor: 'var(--surface-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-card)',
                padding: '2.5rem',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--surface-recessed)',
                  color: 'var(--action-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                }}
              >
                <LogIn size={28} aria-hidden="true" />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-charcoal)', margin: '0 0 0.625rem' }}>
                Sign In to Submit a Request
              </h2>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-muted)',
                  margin: '0 auto 1.5rem',
                  maxWidth: '400px',
                  lineHeight: 1.55,
                }}
              >
                To ensure every application is securely tied to an authentic applicant profile, please sign in or create
                a free Explorer account before submitting.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Link
                  to="/sign-up?returnUrl=/request-guidance"
                  id="guidance-signup-btn"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.5rem',
                    borderRadius: 'var(--radius-control)',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    backgroundColor: 'var(--action-primary)',
                    textDecoration: 'none',
                  }}
                >
                  Create Free Account
                </Link>
                <Link
                  to="/sign-in?returnUrl=/request-guidance"
                  id="guidance-signin-btn"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.5rem',
                    borderRadius: 'var(--radius-control)',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: 'var(--text-charcoal)',
                    backgroundColor: 'var(--surface-card)',
                    textDecoration: 'none',
                    border: '1px solid var(--border-refined)',
                  }}
                >
                  Sign In
                </Link>
              </div>
            </div>
          )}

          {/* State: Success */}
          {submitResult?.success && (
            <div
              style={{
                backgroundColor: 'var(--surface-card)',
                border: '2px solid var(--action-primary)',
                borderRadius: 'var(--radius-card)',
                padding: '2.5rem',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-success-bg)',
                  color: 'var(--color-success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                }}
              >
                <CheckCircle2 size={28} aria-hidden="true" />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-charcoal)', margin: '0 0 0.625rem' }}>
                Request Submitted Successfully
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0 0 0.75rem', lineHeight: 1.55 }}>
                {submitResult.message}
              </p>
              {submitResult.requestId && (
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
                    {submitResult.requestId}
                  </code>
                </p>
              )}
              <Link
                to="/request-status"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 2rem',
                  borderRadius: 'var(--radius-control)',
                  fontSize: '0.9375rem',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  backgroundColor: 'var(--action-primary)',
                  textDecoration: 'none',
                }}
              >
                Track Status
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          )}

          {/* State: Active form */}
          {isAuthenticated &&
            user?.role !== 'managed_student' &&
            (!existingRequest || existingRequest.status === 'withdrawn') &&
            !submitResult?.success && (
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
                    fontSize: '1.125rem',
                    fontWeight: 800,
                    color: 'var(--text-charcoal)',
                    margin: '0 0 0.375rem',
                  }}
                >
                  Applicant Intake Profile
                </h2>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0 0 1.5rem', lineHeight: 1.5 }}>
                  Securely transmitted to the admissions casework queue.
                </p>

                <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <Input
                    id="guidance-full-name"
                    label="Full legal name"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }));
                    }}
                    error={errors.fullName}
                    placeholder="e.g. Ayesha Siddiqui"
                    helperText="Must match your official passport and degree transcripts"
                  />

                  <Input
                    id="guidance-email"
                    label="Official email address"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                    }}
                    error={errors.email}
                    placeholder="you@example.com"
                    helperText="Status notifications will be sent here"
                  />

                  <Input
                    id="guidance-phone"
                    label="Contact number / WhatsApp (optional)"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    helperText="Used for urgent admissions deadline alerts only"
                  />

                  {/* Country selector */}
                  <div>
                    <label
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: 'var(--text-charcoal)',
                        display: 'block',
                        marginBottom: '0.625rem',
                      }}
                    >
                      Target European study corridors *
                    </label>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '0.625rem',
                      }}
                    >
                      {countries.map((c) => {
                        const isSelected = selectedCountries.includes(c.id);
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => toggleCountry(c.id)}
                            aria-pressed={isSelected}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              flexDirection: 'column',
                              padding: '0.75rem',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: isSelected ? 'var(--color-primary-light)' : 'var(--surface-card)',
                              border: isSelected
                                ? '2px solid var(--action-primary)'
                                : '1.5px solid var(--border-subtle)',
                              cursor: 'pointer',
                              textAlign: 'left',
                              transition: 'border-color 0.15s ease, background-color 0.15s ease',
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                width: '100%',
                                marginBottom: '0.15rem',
                              }}
                            >
                              <span
                                style={{
                                  fontSize: '0.875rem',
                                  fontWeight: 700,
                                  color: 'var(--text-charcoal)',
                                }}
                              >
                                {c.name}
                              </span>
                              {isSelected && (
                                <CheckCircle2
                                  size={15}
                                  style={{ color: 'var(--action-primary)', flexShrink: 0 }}
                                  aria-hidden="true"
                                />
                              )}
                            </div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.note}</span>
                          </button>
                        );
                      })}
                    </div>
                    {errors.countries && (
                      <p
                        role="alert"
                        style={{ fontSize: '0.8125rem', color: 'var(--color-destructive)', marginTop: '0.375rem' }}
                      >
                        {errors.countries}
                      </p>
                    )}
                  </div>

                  <Select
                    id="guidance-academic-level"
                    label="Target degree level"
                    value={academicLevel}
                    onChange={(e) => setAcademicLevel(e.target.value)}
                    options={[
                      { value: 'master', label: "Master's Degree (Postgraduate)" },
                      { value: 'bachelor', label: "Bachelor's Degree (Undergraduate)" },
                      { value: 'phd', label: 'Doctorate / PhD Research Track' },
                    ]}
                  />

                  <Textarea
                    id="guidance-notes"
                    label="Academic background & target specialization"
                    value={studentMessage}
                    onChange={(e) => setStudentMessage(e.target.value)}
                    placeholder="e.g. Completed BS Computer Science (CGPA 3.4). Looking for English-taught Data Science or AI MSc programmes for Winter intake..."
                    rows={4}
                    helperText="Mention your undergraduate field, GPA, IELTS score (if taken), and desired intake semester"
                  />

                  {/* Consent */}
                  <div
                    style={{
                      backgroundColor: 'var(--surface-recessed)',
                      padding: '1rem',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <label
                      htmlFor="guidance-consent-cb"
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.625rem',
                        fontSize: '0.8125rem',
                        color: 'var(--text-body)',
                        cursor: 'pointer',
                        lineHeight: 1.5,
                      }}
                    >
                      <input
                        id="guidance-consent-cb"
                        type="checkbox"
                        checked={consentPrivacy}
                        onChange={(e) => {
                          setConsentPrivacy(e.target.checked);
                          if (errors.consent) setErrors((prev) => ({ ...prev, consent: '' }));
                        }}
                        style={{
                          marginTop: '0.15rem',
                          accentColor: 'var(--action-primary)',
                          cursor: 'pointer',
                          width: '16px',
                          height: '16px',
                          flexShrink: 0,
                        }}
                      />
                      <span>
                        I confirm all submitted details are factual. I understand that Unilistics provides
                        administrative casework and that admission and visa decisions are made exclusively by European
                        universities and consular embassies.
                      </span>
                    </label>
                    {errors.consent && (
                      <p
                        role="alert"
                        style={{
                          fontSize: '0.8125rem',
                          color: 'var(--color-destructive)',
                          marginTop: '0.5rem',
                          marginLeft: '1.625rem',
                        }}
                      >
                        {errors.consent}
                      </p>
                    )}
                  </div>

                  {submitResult && !submitResult.success && (
                    <Alert variant="destructive" title="Submission failed">
                      {submitResult.message}
                    </Alert>
                  )}

                  <Button
                    id="guidance-submit-btn"
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={isSubmitting}
                    rightIcon={<ArrowRight size={16} aria-hidden="true" />}
                    style={{ width: '100%', fontWeight: 700 }}
                  >
                    Submit Guidance Request
                  </Button>
                </form>
              </div>
            )}
        </div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .guidance-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default RequestGuidancePage;
