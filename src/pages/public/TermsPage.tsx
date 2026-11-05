import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, AlertTriangle, ArrowRight } from 'lucide-react';

const sections = [
  {
    id: 'entitlement-tiers',
    num: '1',
    title: 'Entitlement Tiers & Independent Access Approval',
    content: (
      <>
        <p>Unilistics maintains an explicit two-tier service architecture:</p>
        <ul>
          <li>
            <strong>Self-Service Explorer Access:</strong> Explorer account creation is self-service and subject to
            standard email verification. It grants full search access to published European university listings, degree
            programs, and scholarships. <em>No administrative approval is required.</em>
          </li>
          <li>
            <strong>Staff-Managed Application Guidance:</strong> Access to a dedicated counsellor, application milestone
            tracking, document verification, and consular guidance is an independent service tier.{' '}
            <em>Managed support requires an explicit request and administrative review before activation.</em>
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'procedural-guides',
    num: '2',
    title: 'Procedural Guides as Content, Not Statutory Policy',
    icon: AlertTriangle,
    iconColor: 'var(--color-warning)',
    content: (
      <p>
        Application guides, tuition benchmarks, consular queue notes, and attestation steps provided on the platform
        are draft procedural reference materials. They do not constitute official statutory legal or immigration advice.
        Consular appointment mechanics, visa fees, and intake deadlines are subject to unannounced revision by foreign
        embassies and university faculties.
      </p>
    ),
  },
  {
    id: 'human-in-the-loop',
    num: '3',
    title: 'Human-in-the-Loop Operations — No Autonomous Bots',
    content: (
      <p>
        All university admissions submissions and consular visa filings are manually coordinated and operated by human
        counsellors and the student. Unilistics does not deploy web scraping bots, automated visa portal reservation
        bots, or artificial intelligence decision engines for admissions.
      </p>
    ),
  },
  {
    id: 'applicant-responsibilities',
    num: '4',
    title: 'Applicant Responsibilities',
    content: (
      <p>
        Applicants agree to provide accurate, genuine academic credentials and truthful statements. Falsification of
        transcripts, fraudulent English language test results, or fraudulent bank documents will result in immediate
        termination of the case room and reporting to the relevant academic institutions.
      </p>
    ),
  },
  {
    id: 'no-guarantee',
    num: '5',
    title: 'No Guarantee of Admission or Visa Issuance',
    content: (
      <p>
        Unilistics and its counsellors provide expert guidance and dossier preparation. However, final admissions
        decisions remain solely with university academic senates, and final student visa decisions remain solely with
        the sovereign embassies and consular officers of Germany, France, Italy, and Romania.
      </p>
    ),
  },
  {
    id: 'country-scope',
    num: '6',
    title: 'Country Scope',
    content: (
      <p>
        The current service scope covers four European higher education corridors: <strong>Germany</strong>,{' '}
        <strong>France</strong>, <strong>Italy</strong>, and <strong>Romania</strong>. Other destinations are not
        currently supported and are explicitly excluded from managed casework.
      </p>
    ),
  },
  {
    id: 'disputes',
    num: '7',
    title: 'Disputes & Governing Law',
    content: (
      <p>
        Any disputes arising from the use of Unilistics are subject to the laws applicable in the jurisdiction of
        Pakistan. For service inquiries or complaints, please use the{' '}
        <Link to="/contact" style={{ color: 'var(--action-primary)' }}>
          Contact page
        </Link>{' '}
        or the authenticated{' '}
        <Link to="/support-desk" style={{ color: 'var(--action-primary)' }}>
          Support Desk
        </Link>
        .
      </p>
    ),
  },
];

export const TermsPage: React.FC = () => {
  return (
    <div
      style={{
        backgroundColor: 'var(--surface-canvas)',
        color: 'var(--text-charcoal)',
        fontFamily: 'var(--font-family-base)',
        minHeight: '100vh',
      }}
    >
      {/* Hero Header */}
      <div
        style={{
          backgroundColor: 'var(--brand-forest, #245B42)',
          color: '#FFFFFF',
          padding: 'clamp(3.5rem, 6vw, 5rem) clamp(1.25rem, 5vw, 3rem) 3rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(215, 238, 131, 0.12) 0%, transparent 60%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-charcoal, #19261F)',
              backgroundColor: 'var(--brand-citron, #D7EE83)',
              padding: '0.35rem 0.875rem',
              borderRadius: 'var(--radius-pill, 9999px)',
              marginBottom: '1.25rem',
            }}
          >
            <FileText size={14} aria-hidden="true" />
            <span>Operational & Statutory Terms</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.25rem, 5vw, 3.25rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: '#FFFFFF',
              margin: '0 0 1rem',
              lineHeight: 1.15,
            }}
          >
            Terms of Service
          </h1>

          <p style={{ fontSize: '1rem', color: 'rgba(255, 255, 255, 0.85)', margin: '0 0 2rem', maxWidth: '680px', lineHeight: 1.6 }}>
            Governs self-service Explorer catalogue browsing, independent Managed Guidance casework requests, procedural draft disclaimers, and human-operated counselling.
          </p>

          {/* Quick Terms Highlights */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '0.875rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.15)',
            }}
          >
            {[
              { title: 'Independent Tiers', desc: 'Explorer search vs. Managed casework' },
              { title: 'Procedural Material', desc: 'Editorial guides, not statutory law' },
              { title: 'Direct SWIFT Receipts', desc: 'Tuition paid directly to universities' },
              { title: 'Human Casework', desc: 'No scraping or auto application bots' },
            ].map((badge) => (
              <div
                key={badge.title}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(4px)',
                  padding: '0.875rem 1rem',
                  borderRadius: 'var(--radius-sm, 12px)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                }}
              >
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--brand-citron, #D7EE83)' }}>
                  {badge.title}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.7)', marginTop: '0.2rem' }}>
                  {badge.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content + TOC */}
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: 'clamp(2rem, 4vw, 4rem) clamp(1.25rem, 5vw, 3rem)',
          display: 'grid',
          gridTemplateColumns: '220px 1fr',
          gap: '3rem',
          alignItems: 'start',
        }}
        className="terms-layout"
      >
        {/* TOC */}
        <nav
          aria-label="Table of contents"
          style={{ position: 'sticky', top: '6rem' }}
          className="terms-toc"
        >
          <p
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-subtle)',
              margin: '0 0 0.75rem',
            }}
          >
            Contents
          </p>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.125rem',
            }}
          >
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.375rem 0.625rem',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '0.8125rem',
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    transition: 'background-color 0.15s ease, color 0.15s ease',
                    lineHeight: 1.4,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--surface-hover)';
                    (e.currentTarget as HTMLElement).style.color = 'var(--text-charcoal)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                    (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      color: 'var(--text-subtle)',
                      fontFamily: 'var(--font-family-mono)',
                      minWidth: '1.25rem',
                    }}
                  >
                    {s.num}
                  </span>
                  <span>{s.title}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Article */}
        <article>
          <div
            style={{
              backgroundColor: 'var(--surface-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-card)',
              overflow: 'hidden',
            }}
          >
            {sections.map((section, index) => {
              const WarningIcon = section.icon;
              return (
                <section
                  key={section.id}
                  id={section.id}
                  style={{
                    padding: '1.75rem 2rem',
                    borderBottom: index < sections.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                    scrollMarginTop: '7rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                    {WarningIcon ? (
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <WarningIcon size={20} style={{ color: section.iconColor }} aria-hidden="true" />
                      </div>
                    ) : (
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '28px',
                          height: '28px',
                          borderRadius: 'var(--radius-xs)',
                          backgroundColor: 'var(--surface-recessed)',
                          color: 'var(--action-primary)',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          fontFamily: 'var(--font-family-mono)',
                          flexShrink: 0,
                        }}
                        aria-hidden="true"
                      >
                        {section.num}
                      </span>
                    )}
                    <h2
                      style={{
                        fontSize: '1.0625rem',
                        fontWeight: 700,
                        color: 'var(--text-charcoal)',
                        margin: 0,
                        lineHeight: 1.3,
                      }}
                    >
                      {section.title}
                    </h2>
                  </div>
                  <div
                    style={{
                      fontSize: '0.9rem',
                      color: 'var(--text-body)',
                      lineHeight: 1.7,
                      paddingLeft: '2.5rem',
                    }}
                  >
                    {section.content}
                  </div>
                </section>
              );
            })}
          </div>

          {/* Back link */}
          <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link
              to="/"
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--action-primary)',
                textDecoration: 'none',
              }}
            >
              Back to Home
            </Link>
            <span style={{ color: 'var(--border-refined)' }}>·</span>
            <Link
              to="/privacy"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--action-primary)',
                textDecoration: 'none',
              }}
            >
              Privacy Policy
              <ArrowRight size={13} aria-hidden="true" />
            </Link>
          </div>
        </article>
      </div>

      <style>{`
        .terms-layout {
          grid-template-columns: 220px 1fr;
        }
        .terms-toc {
          display: block;
        }
        article p {
          margin: 0 0 0.875rem;
        }
        article p:last-child {
          margin-bottom: 0;
        }
        article ul {
          padding-left: 1.25rem;
          margin: 0.5rem 0 0.875rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        article li {
          font-size: 0.875rem;
          line-height: 1.6;
          color: var(--text-body);
        }
        article strong {
          color: var(--text-charcoal);
          font-weight: 700;
        }
        article em {
          color: var(--text-muted);
        }
        @media (max-width: 767px) {
          .terms-layout {
            grid-template-columns: 1fr !important;
          }
          .terms-toc {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default TermsPage;
