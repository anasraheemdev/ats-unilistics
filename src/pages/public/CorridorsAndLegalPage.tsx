import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  ShieldCheck,
  Scale,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { ROUTES } from '@/config/routes';

export const CorridorsAndLegalPage: React.FC = () => {
  const corridors = [
    {
      country: 'Germany',
      flag: '🇩🇪',
      legalFramework:
        'APS Certificate (Academic Evaluation Centre Pakistan), Uni-assist VPD processing, Section 16b AufenthG (Residence Act for Study), and Federal blocked account standards.',
      authority:
        'German Embassy Islamabad & Consulate General Karachi; Standing Conference of the Ministers of Education (KMK).',
      disclaimer:
        'Unilistics is an independent admissions desk and is not affiliated with the German Federal Foreign Office or DAAD.',
      path: '/universities?country=germany',
      tuitionRule: '€0 Tuition at Public Universities (Semesterbeitrag €150–€350)',
      gateStep: 'Mandatory APS Certificate prior to visa appointment queueing',
    },
    {
      country: 'France',
      flag: '🇫🇷',
      legalFramework:
        'Campus France Études en France (EEF) pre-consular authorization, French Education Code (Code de l\'éducation), and France-Visas application procedures.',
      authority: 'Campus France Pakistan & Embassy of France in Islamabad.',
      disclaimer:
        'Unilistics operates independently and is not an agency of the French Republic or Institut Français.',
      path: '/universities?country=france',
      tuitionRule: '€170/yr (Licence) / €243/yr (Master) with institutional waivers',
      gateStep: 'Campus France Academic In-Person Interview in Islamabad/Karachi/Lahore',
    },
    {
      country: 'Italy',
      flag: '🇮🇹',
      legalFramework:
        'Universitaly pre-enrollment platform, CIMEA Statement of Verification & Comparability, Dichiarazione di Valore (DOV), and DSU regional grant frameworks.',
      authority:
        'Italian Ministry of Universities and Research (MUR) & Embassy of Italy in Islamabad.',
      disclaimer:
        'Unilistics provides pre-enrollment coordination and holds no statutory partnership with Universitaly or CIMEA.',
      path: '/universities?country=italy',
      tuitionRule: '€500–€3,000/yr (100% full fee waiver + stipend via DSU grant)',
      gateStep: 'Strict single-institution Universitaly pre-enrollment cap',
    },
    {
      country: 'Romania',
      flag: '🇷🇴',
      legalFramework:
        'Ministry of Education (Ministerul Educației) Letter of Acceptance (Scrisoare de Acceptare), certified consular document legalization, and national long-stay study visa (D/CS).',
      authority: 'Romanian Ministry of Education & Embassy of Romania in Islamabad.',
      disclaimer:
        'Unilistics is an independent advisory service and does not issue statutory Romanian acceptance letters.',
      path: '/universities?country=romania',
      tuitionRule: '€2,000–€4,500/yr payable in advance via direct SWIFT wire',
      gateStep: 'Ministry of Education physical acceptance letter issued in Bucharest',
    },
  ];

  const legalPolicies = [
    {
      title: 'Privacy Policy & Synthetic Mandate',
      desc: 'Our strict synthetic development policy, student document vault isolation, zero-PII test fixtures, and retention protocols.',
      to: ROUTES.PRIVACY,
      label: 'Read Privacy Policy',
      icon: ShieldCheck,
    },
    {
      title: 'Terms of Service & Disclaimers',
      desc: 'The binding user agreement governing catalogue discovery, account obligations, non-guarantee of admission, and human-in-the-loop operations.',
      to: ROUTES.TERMS,
      label: 'Read Terms of Service',
      icon: Scale,
    },
    {
      title: 'Help Centre Procedural Articles',
      desc: 'Official, reviewed procedural documentation for HEC attestation, MOFA legalization, blocked account setup, and visa checklist verification.',
      to: ROUTES.HELP,
      label: 'Browse Help Centre',
      icon: FileText,
    },
    {
      title: 'Contact Admissions Operations',
      desc: 'Information regarding our Islamabad & Karachi operations desks, direct inquiry routing, and honest response expectations.',
      to: ROUTES.CONTACT,
      label: 'Contact Operations Desk',
      icon: Building2,
    },
  ];

  return (
    <div
      style={{
        backgroundColor: 'var(--surface-canvas, #F6F8F5)',
        color: 'var(--text-charcoal, #19261F)',
        fontFamily: 'var(--font-family-base, "DM Sans", sans-serif)',
        minHeight: '100vh',
      }}
    >
      {/* 1. Page Header */}
      <section
        style={{
          backgroundColor: '#19261F',
          color: '#FFFFFF',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: 'clamp(3.5rem, 6vw, 5.5rem) clamp(1.25rem, 5vw, 3rem) clamp(2.5rem, 4vw, 3.5rem)',
        }}
      >
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
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
            <Sparkles size={13} aria-hidden="true" />
            Statutory & Operational Standards
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
            Corridors &amp; Legal Framework
          </h1>

          <p
            style={{
              fontSize: 'clamp(1rem, 1.5vw, 1.125rem)',
              color: 'rgba(255, 255, 255, 0.82)',
              lineHeight: 1.6,
              margin: 0,
              maxWidth: '680px',
            }}
          >
            A factual overview of the statutory legal structures, consular prerequisites, and platform policy terms
            governing our supported European higher education corridors.
          </p>
        </div>
      </section>

      {/* 2. Main Content Container */}
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: 'clamp(3rem, 5vw, 5rem) clamp(1.25rem, 5vw, 3rem)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4rem',
        }}
      >
        {/* Section 1: Study Corridors */}
        <div>
          <div style={{ marginBottom: '2rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--action-primary, #245B42)',
                backgroundColor: 'rgba(36, 91, 66, 0.08)',
                padding: '0.3rem 0.875rem',
                borderRadius: 'var(--radius-pill, 9999px)',
                display: 'inline-block',
                marginBottom: '0.75rem',
              }}
            >
              Active Corridors
            </span>
            <h2
              style={{
                fontSize: 'clamp(1.5rem, 2.5vw, 2rem)',
                fontWeight: 800,
                color: 'var(--text-charcoal, #19261F)',
                letterSpacing: '-0.025em',
                margin: '0 0 0.5rem',
              }}
            >
              Supported European Higher Education Corridors
            </h2>
            <p style={{ color: 'var(--text-muted, #58695E)', fontSize: '0.9375rem', margin: 0 }}>
              Each corridor operates under distinct statutory admission and consular visa frameworks.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {corridors.map((c) => (
              <div
                key={c.country}
                style={{
                  backgroundColor: 'var(--surface-card, #FFFFFF)',
                  border: '1px solid var(--border-subtle, #E1E8DE)',
                  borderRadius: 'var(--radius-card, 24px)',
                  padding: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
                    <span style={{ fontSize: '2rem' }} aria-hidden="true">
                      {c.flag}
                    </span>
                    <div>
                      <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-charcoal, #19261F)', margin: 0 }}>
                        {c.country} Corridor
                      </h3>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--action-primary, #245B42)' }}>
                        {c.tuitionRule}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.84rem' }}>
                    <div>
                      <strong style={{ color: 'var(--text-charcoal, #19261F)', display: 'block', marginBottom: '0.2rem' }}>
                        Procedural &amp; Legal Framework:
                      </strong>
                      <p style={{ margin: 0, color: 'var(--text-muted, #58695E)', lineHeight: 1.55 }}>
                        {c.legalFramework}
                      </p>
                    </div>

                    <div>
                      <strong style={{ color: 'var(--text-charcoal, #19261F)', display: 'block', marginBottom: '0.2rem' }}>
                        Competent Statutory Authorities:
                      </strong>
                      <p style={{ margin: 0, color: 'var(--text-muted, #58695E)', lineHeight: 1.55 }}>
                        {c.authority}
                      </p>
                    </div>

                    <div
                      style={{
                        padding: '0.625rem 0.875rem',
                        backgroundColor: 'rgba(36, 91, 66, 0.05)',
                        border: '1px solid rgba(36, 91, 66, 0.15)',
                        borderRadius: 'var(--radius-sm, 12px)',
                        fontSize: '0.78rem',
                        color: 'var(--text-body, #2C3E33)',
                        fontWeight: 600,
                      }}
                    >
                      Gate Requirement: {c.gateStep}
                    </div>

                    <div
                      style={{
                        padding: '0.75rem',
                        backgroundColor: 'var(--surface-recessed, #EDF2E9)',
                        borderRadius: 'var(--radius-sm, 12px)',
                        color: 'var(--text-muted, #58695E)',
                        fontSize: '0.75rem',
                        lineHeight: 1.45,
                      }}
                    >
                      {c.disclaimer}
                    </div>
                  </div>
                </div>

                <div style={{ paddingTop: '1.5rem', marginTop: '1.5rem', borderTop: '1px solid var(--border-subtle, #E1E8DE)' }}>
                  <Link
                    to={c.path}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      color: 'var(--action-primary, #245B42)',
                      textDecoration: 'none',
                    }}
                  >
                    <span>Browse {c.country} catalogue listings</span>
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Explicit Deferred Scope Notice (Hungary) */}
        <div
          style={{
            backgroundColor: 'var(--surface-card, #FFFFFF)',
            border: '1px solid var(--border-subtle, #E1E8DE)',
            borderRadius: 'var(--radius-card, 24px)',
            padding: '2rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1.25rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-sm, 12px)',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              color: '#B45309',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={22} aria-hidden="true" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-charcoal, #19261F)', margin: '0 0 0.5rem' }}>
              Deferred Corridors & Future Scope: Hungary (Disabled)
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted, #58695E)', lineHeight: 1.6, margin: 0 }}>
              Per product governance mandates (AGENTS.md), <strong>Hungary</strong> is strictly deferred future scope.
              Hungarian university programs and Stipendium Hungaricum scholarship tracks are intentionally disabled in
              the database and user interface until authoritative statutory procedures have completed official legal
              review.
            </p>
          </div>
        </div>

        {/* Section 3: Platform Policies & Legal Documents */}
        <div>
          <div style={{ marginBottom: '2rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--action-primary, #245B42)',
                backgroundColor: 'rgba(36, 91, 66, 0.08)',
                padding: '0.3rem 0.875rem',
                borderRadius: 'var(--radius-pill, 9999px)',
                display: 'inline-block',
                marginBottom: '0.75rem',
              }}
            >
              Governance & Policies
            </span>
            <h2
              style={{
                fontSize: 'clamp(1.5rem, 2.5vw, 2rem)',
                fontWeight: 800,
                color: 'var(--text-charcoal, #19261F)',
                letterSpacing: '-0.025em',
                margin: '0 0 0.5rem',
              }}
            >
              Platform Policies & Legal Documents
            </h2>
            <p style={{ color: 'var(--text-muted, #58695E)', fontSize: '0.9375rem', margin: 0 }}>
              Transparent terms, data protection commitments, and operational policies governing all users.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {legalPolicies.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.title}
                  style={{
                    backgroundColor: 'var(--surface-card, #FFFFFF)',
                    border: '1px solid var(--border-subtle, #E1E8DE)',
                    borderRadius: 'var(--radius-card, 24px)',
                    padding: '1.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <div>
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: 'var(--radius-sm, 12px)',
                        backgroundColor: 'var(--surface-recessed, #EDF2E9)',
                        color: 'var(--action-primary, #245B42)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1rem',
                      }}
                    >
                      <Icon size={22} aria-hidden="true" />
                    </div>

                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-charcoal, #19261F)', margin: '0 0 0.5rem' }}>
                      {p.title}
                    </h3>
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-muted, #58695E)', margin: 0, lineHeight: 1.55 }}>
                      {p.desc}
                    </p>
                  </div>

                  <div style={{ paddingTop: '1.5rem', marginTop: '1.25rem', borderTop: '1px solid var(--border-subtle, #E1E8DE)' }}>
                    <Link
                      to={p.to}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        color: 'var(--action-primary, #245B42)',
                        textDecoration: 'none',
                      }}
                    >
                      <span>{p.label}</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorridorsAndLegalPage;
