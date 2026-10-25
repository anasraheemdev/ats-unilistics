import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  RequestAccessFormSchema,
  RequestAccessFormData,
} from '@/types/validation';
import { DestinationCountry } from '@/types';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { SaveResumeDraftBanner } from '@/components/common/SaveResumeDraftBanner';
import {
  Search,
  Briefcase,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Shield,
  FileCheck2,
} from 'lucide-react';

const DRAFT_KEY = 'request_access_form_v2';

const defaultValues: RequestAccessFormData = {
  fullName: '',
  email: '',
  phone: '',
  countryInterests: ['germany'],
  requestedService: 'explorer_catalogue',
  consentPrivacy: true,
  isUpgrade: false,
  studentMessage: '',
};

export const RequestAccessPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const serviceParam = searchParams.get('service');

  const [formData, setFormData] = useState<RequestAccessFormData>(() => {
    const initialService =
      serviceParam === 'managed' ? 'managed_application_case' : 'explorer_catalogue';
    return { ...defaultValues, requestedService: initialService };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasDraft, setHasDraft] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    message: string;
    requestId?: string;
    status?: string;
    verificationToken?: string;
  } | null>(null);

  // Sync service from query param if changed
  useEffect(() => {
    if (serviceParam === 'managed') {
      setFormData((prev) => ({ ...prev, requestedService: 'managed_application_case' }));
    } else if (serviceParam === 'explorer') {
      setFormData((prev) => ({ ...prev, requestedService: 'explorer_catalogue' }));
    }
  }, [serviceParam]);

  // Load saved draft on mount
  useEffect(() => {
    const savedDraft = api.drafts.get<Partial<RequestAccessFormData>>(DRAFT_KEY);
    if (savedDraft) {
      setHasDraft(true);
      setFormData((prev) => ({ ...prev, ...savedDraft }));
    }
  }, []);

  // Debounced auto-save of draft
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.fullName || formData.email) {
        api.drafts.save(DRAFT_KEY, formData);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [formData]);

  const handleServiceSelect = (service: 'explorer_catalogue' | 'managed_application_case') => {
    setFormData((prev) => ({ ...prev, requestedService: service }));
    setSearchParams({ service: service === 'managed_application_case' ? 'managed' : 'explorer' });
    if (errors.requestedService) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.requestedService;
        return next;
      });
    }
  };

  const handleCountryToggle = (country: DestinationCountry) => {
    setFormData((prev) => {
      const current = prev.countryInterests || [];
      const exists = current.includes(country);
      let updated: DestinationCountry[];
      if (exists) {
        updated = current.filter((c) => c !== country);
        if (updated.length === 0) updated = [country]; // Require at least one
      } else {
        updated = [...current, country];
      }
      return { ...prev, countryInterests: updated };
    });
  };

  const handleClearDraft = () => {
    api.drafts.clear(DRAFT_KEY);
    setHasDraft(false);
    setFormData(defaultValues);
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = RequestAccessFormSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const fieldName = err.path[0] as string;
        if (fieldName && !fieldErrors[fieldName]) {
          fieldErrors[fieldName] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.requests.submitAccessRequest(result.data);
      setSubmitResult(response);
      api.drafts.clear(DRAFT_KEY);
      setHasDraft(false);
    } catch (err: any) {
      setSubmitResult({
        success: false,
        message: err?.message || 'Failed to submit access request. Please verify your connection.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const countries: { code: DestinationCountry; label: string }[] = [
    { code: 'germany', label: 'Germany' },
    { code: 'france', label: 'France' },
    { code: 'italy', label: 'Italy' },
    { code: 'romania', label: 'Romania' },
  ];

  return (
    <div className="container" style={{ maxWidth: '780px', padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <Badge variant="primary" style={{ marginBottom: '0.75rem' }}>
          <Shield size={14} aria-hidden="true" />
          <span>Verified Student Admissions</span>
        </Badge>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
          Request Platform Access
        </h1>
        <p style={{ color: 'var(--color-foreground-muted)', fontSize: '1rem', maxWidth: '620px', margin: '0 auto' }}>
          Select your intended pathway to begin. Both pathways require administrator approval to protect counsellor advising capacity.
        </p>
      </div>

      {hasDraft && !submitResult?.success && (
        <SaveResumeDraftBanner
          hasDraft={hasDraft}
          onClearDraft={handleClearDraft}
          lastSavedText="Form draft restored from previous session"
        />
      )}

      {submitResult?.success ? (
        <Card style={{ padding: '2.5rem', textAlign: 'center' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-success-bg, #ecfdf5)',
              color: 'var(--color-success, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}
          >
            <CheckCircle2 size={36} aria-hidden="true" />
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            Request Submitted Successfully
          </h2>

          <p style={{ color: 'var(--color-foreground-muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            {submitResult.message}
          </p>

          <div
            style={{
              padding: '1.25rem',
              backgroundColor: 'var(--color-surface-subtle)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted)' }}>
              Your Application Reference ID:
            </span>
            <code style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-primary)' }}>
              {submitResult.requestId}
            </code>
            <Badge variant="warning" size="sm">
              Status: {submitResult.status?.replace(/_/g, ' ').toUpperCase()}
            </Badge>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to={`/request-status?id=${submitResult.requestId}`} style={{ textDecoration: 'none' }}>
              <Button variant="primary">
                <span>Check Request Status</span>
                <ArrowRight size={16} aria-hidden="true" />
              </Button>
            </Link>
            <Link to="/help" style={{ textDecoration: 'none' }}>
              <Button variant="outline">Browse Help Centre</Button>
            </Link>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <Button variant="ghost">Return to Home</Button>
            </Link>
          </div>

          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-border)', fontSize: '0.8125rem', color: 'var(--color-foreground-muted)' }}>
            Need immediate assistance or have questions about qualification equivalencies?{' '}
            <Link to="/support" style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
              Contact Unilistics Admissions Support Desk →
            </Link>
          </div>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {submitResult && !submitResult.success && (
            <Alert variant="destructive" title="Submission Error">
              {submitResult.message}
            </Alert>
          )}

          {/* 1. Two Clear Entry Paths */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.9375rem',
                fontWeight: 700,
                marginBottom: '0.75rem',
              }}
            >
              Choose Your Entry Pathway <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1rem',
              }}
              role="radiogroup"
              aria-label="Access Pathway"
            >
              {/* Path 1: Explore All Universities */}
              <div
                onClick={() => handleServiceSelect('explorer_catalogue')}
                role="radio"
                aria-checked={formData.requestedService === 'explorer_catalogue'}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') handleServiceSelect('explorer_catalogue');
                }}
                style={{
                  border:
                    formData.requestedService === 'explorer_catalogue'
                      ? '2px solid var(--color-primary)'
                      : '1px solid var(--color-border)',
                  backgroundColor:
                    formData.requestedService === 'explorer_catalogue'
                      ? 'var(--color-surface-selected, rgba(15, 23, 42, 0.04))'
                      : 'var(--color-surface)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  outline: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'rgba(15, 23, 42, 0.08)',
                        color: 'var(--color-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Search size={22} aria-hidden="true" />
                    </div>
                    <Badge variant={formData.requestedService === 'explorer_catalogue' ? 'primary' : 'default'} size="sm">
                      Catalogue Access
                    </Badge>
                  </div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    Explore all universities & scholarships
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-foreground-muted)', lineHeight: 1.5 }}>
                    Self-directed access to search the complete published catalogue of programs, tuition fees, and scholarship deadlines across Germany, France, Italy, and Romania.
                  </p>
                </div>
                <div style={{ marginTop: '1rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                  {formData.requestedService === 'explorer_catalogue' ? '✓ Selected Pathway' : 'Click to select'}
                </div>
              </div>

              {/* Path 2: Get Help With My Applications */}
              <div
                onClick={() => handleServiceSelect('managed_application_case')}
                role="radio"
                aria-checked={formData.requestedService === 'managed_application_case'}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') handleServiceSelect('managed_application_case');
                }}
                style={{
                  border:
                    formData.requestedService === 'managed_application_case'
                      ? '2px solid var(--color-primary)'
                      : '1px solid var(--color-border)',
                  backgroundColor:
                    formData.requestedService === 'managed_application_case'
                      ? 'var(--color-surface-selected, rgba(15, 23, 42, 0.04))'
                      : 'var(--color-surface)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  outline: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'rgba(217, 119, 6, 0.12)',
                        color: 'var(--color-accent, #d97706)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Briefcase size={22} aria-hidden="true" />
                    </div>
                    <Badge variant={formData.requestedService === 'managed_application_case' ? 'primary' : 'default'} size="sm">
                      Full Case Room
                    </Badge>
                  </div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    Get help with my applications
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-foreground-muted)', lineHeight: 1.5 }}>
                    Staff-managed application support including assigned counsellor guidance, domestic attestation milestones (BISE, HEC, MOFA), and embassy visa dossiers.
                  </p>
                </div>
                <div style={{ marginTop: '1rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                  {formData.requestedService === 'managed_application_case' ? '✓ Selected Pathway' : 'Click to select'}
                </div>
              </div>
            </div>
          </div>

          {/* 2. Applicant Details */}
          <Card style={{ padding: '1.75rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              Applicant Information
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <Input
                label="Full Legal Name"
                placeholder="e.g. Muhammad Ali"
                value={formData.fullName}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, fullName: e.target.value }));
                  if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }));
                }}
                error={errors.fullName}
                required
                helperText="Must match your educational certificates and national identity document"
              />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <Input
                  type="email"
                  label="Email Address"
                  placeholder="e.g. ali@example.com"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, email: e.target.value }));
                    if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                  }}
                  error={errors.email}
                  required
                  helperText="Your activation setup link will be dispatched here"
                />

                <Input
                  type="tel"
                  label="Phone Number (Optional)"
                  placeholder="+92 300 1234567"
                  value={formData.phone || ''}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, phone: e.target.value }));
                    if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                  }}
                  error={errors.phone}
                  helperText="Optional; for urgent embassy appointment schedule updates"
                />
              </div>

              {/* Country Interests */}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Target Destination Countries <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {countries.map((c) => {
                    const isSelected = (formData.countryInterests || []).includes(c.code);
                    return (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => handleCountryToggle(c.code)}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: 'var(--radius-md)',
                          border: isSelected
                            ? '2px solid var(--color-primary)'
                            : '1px solid var(--color-border)',
                          backgroundColor: isSelected
                            ? 'var(--color-primary)'
                            : 'var(--color-surface)',
                          color: isSelected ? '#ffffff' : 'var(--color-foreground)',
                          fontWeight: isSelected ? 600 : 500,
                          fontSize: '0.875rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.375rem',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {isSelected && <FileCheck2 size={16} aria-hidden="true" />}
                        <span>{c.label}</span>
                      </button>
                    );
                  })}
                </div>
                {errors.countryInterests && (
                  <p style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '0.375rem' }}>
                    {errors.countryInterests}
                  </p>
                )}
              </div>

              {/* Optional Note / Message */}
              <div>
                <label
                  htmlFor="studentMessage"
                  style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}
                >
                  Application Notes or Target Degree (Optional)
                </label>
                <textarea
                  id="studentMessage"
                  rows={3}
                  value={formData.studentMessage || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, studentMessage: e.target.value }))}
                  placeholder="e.g. Intending to apply for Winter 2027 M.Sc. Data Science; currently completing bachelor's final semester."
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
            </div>
          </Card>

          {/* 3. Data Privacy & Minimization Trust Guarantee */}
          <div
            style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-surface-subtle)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              gap: '1rem',
              alignItems: 'flex-start',
            }}
          >
            <ShieldCheck size={28} style={{ color: 'var(--color-success)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                Data Minimization Mandate
              </h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-foreground-muted)', lineHeight: 1.5, margin: 0 }}>
                We do not collect passport copies, CNIC scans, or personal bank statements at registration. Educational documents are only uploaded into your private encrypted case vault after counsellor assignment.
              </p>
            </div>
          </div>

          {/* 4. Required Consent Checkbox */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <input
              type="checkbox"
              id="consentPrivacy"
              checked={formData.consentPrivacy}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, consentPrivacy: e.target.checked }));
                if (errors.consentPrivacy) setErrors((prev) => ({ ...prev, consentPrivacy: '' }));
              }}
              style={{ width: '18px', height: '18px', marginTop: '2px', cursor: 'pointer' }}
              required
            />
            <label
              htmlFor="consentPrivacy"
              style={{ fontSize: '0.875rem', color: 'var(--color-foreground)', cursor: 'pointer', lineHeight: 1.5 }}
            >
              I consent to Unilistics recording my application preferences and processing my contact details for verified educational admissions tracking. <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
          </div>
          {errors.consentPrivacy && (
            <p style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '-1.5rem' }}>
              {errors.consentPrivacy}
            </p>
          )}

          {/* 5. Submit Button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <Link to="/request-status" style={{ fontSize: '0.875rem', color: 'var(--color-primary)', textDecoration: 'none' }}>
              Already submitted a request? Check Status →
            </Link>

            <Button type="submit" variant="primary" size="lg" disabled={isSubmitting}>
              {isSubmitting ? 'Transmitting Request...' : 'Submit Access Request'}
            </Button>
          </div>

          <div
            style={{
              padding: '0.875rem 1rem',
              backgroundColor: 'var(--color-primary-light)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.5rem',
              fontSize: '0.8125rem',
            }}
          >
            <span style={{ color: 'var(--color-foreground-muted)' }}>
              Unsure which entry pathway matches your academic background?
            </span>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to="/help" style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                Help Centre Guide
              </Link>
              <span aria-hidden="true">•</span>
              <Link to="/support" style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                Contact Support Desk
              </Link>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
