import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight } from 'lucide-react';

const sections = [
  {
    id: 'scope',
    num: '1',
    title: 'Scope & Core Privacy Commitment',
    content: (
      <p>
        Unilistics operates as a staff-managed higher education application and visa tracking platform specifically
        designed for Pakistani students applying to universities in Germany, France, Italy, and Romania. We are strictly
        committed to safeguarding applicant privacy, protecting sensitive academic records, and maintaining transparent
        boundaries between public discovery and private managed case rooms.
      </p>
    ),
  },
  {
    id: 'synthetic-data',
    num: '2',
    title: 'Data Collected by Entitlement Tier',
    content: (
      <>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.875rem',
            marginTop: '0.5rem',
          }}
        >
          {[
            {
              tier: 'Anonymous Visitors',
              desc: 'No personal information is collected. Anonymous visitors may browse a fixed public preview set of up to 50 verified universities without creating an account.',
            },
            {
              tier: 'Explorer Accounts',
              desc: 'We collect your full name, email address, password hash, and preferred destination corridor. This grants access to the published university search, programme filters, and saved opportunities.',
            },
            {
              tier: 'Approved Managed Students',
              desc: "Upon administrative approval of your guidance request, your assigned counsellor collects attested degree documents, language proficiency scores, and visa filing receipts strictly for application processing.",
            },
            {
              tier: 'Counsellors & Staff',
              desc: 'Staff accounts hold role-based entitlements tied to explicitly assigned cases only. Counsellors cannot access unassigned student records.',
            },
          ].map((item) => (
            <div
              key={item.tier}
              style={{
                padding: '1rem',
                backgroundColor: 'var(--surface-recessed)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: 'var(--text-charcoal)',
                  marginBottom: '0.375rem',
                }}
              >
                {item.tier}
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.55 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </>
    ),
  },
  {
    id: 'no-pii',
    num: '3',
    title: 'Prohibition on Real Student PII in Non-Production Environments',
    content: (
      <>
        <p>
          All development, staging, and testing environments operate exclusively with synthetic fixtures. The following
          categories of data are strictly prohibited from non-production systems:
        </p>
        <ul>
          <li>
            <strong>CNIC Numbers:</strong> Genuine Pakistani Computerized National Identity Card numbers are forbidden in
            test datasets, fixtures, and automated test suites.
          </li>
          <li>
            <strong>Passport Credentials:</strong> Authentic passport numbers or scanned bio-data pages must never appear
            in staging fixtures or automated test environments.
          </li>
          <li>
            <strong>Bank Statements & Financial Records:</strong> Blocked account certificates, bank maintenance letters,
            and solvency documents are strictly synthetic in all non-production contexts.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'no-credential-escrow',
    num: '4',
    title: 'No External Portal Credential Escrow',
    content: (
      <p>
        Unilistics maintains a strict <strong>zero-credential-escrow architecture</strong>. The platform does not store,
        escrow, or manage external university login credentials, Uni-Assist portal passwords, Campus France access codes,
        or embassy consular portal passwords. All external submissions are coordinated transparently with the student, who
        retains full control of their own external credentials.
      </p>
    ),
  },
  {
    id: 'rls',
    num: '5',
    title: 'Access Isolation & Row-Level Security',
    content: (
      <p>
        All user data, document uploads, and case communications are enforced at the database layer via Postgres
        Row-Level Security (RLS). Each counsellor has access strictly to student cases explicitly assigned to them in
        the database. No client-side check is used as the sole authorization gate — every read, mutation, and file
        access is enforced server-side.
      </p>
    ),
  },
  {
    id: 'human-operations',
    num: '6',
    title: 'Human-in-the-Loop Operations',
    content: (
      <p>
        Unilistics does not use automated web scraping, robotic portal submissions, or AI-generated application
        content. All application submissions to university portals and embassies are manually operated and tracked by
        assigned human counsellors. No automated admissions decisions or visa approvals are made by the platform.
      </p>
    ),
  },
  {
    id: 'contact',
    num: '7',
    title: 'Privacy Questions & Contact',
    content: (
      <p>
        For questions regarding data collected or stored by Unilistics, or to request deletion of your account and
        associated data, please use the{' '}
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

export const PrivacyPolicyPage: React.FC = () => {
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
            <ShieldCheck size={14} aria-hidden="true" />
            <span>Applicant Data Protection & Security</span>
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
            Privacy Policy
          </h1>

          <p style={{ fontSize: '1rem', color: 'rgba(255, 255, 255, 0.85)', margin: '0 0 2rem', maxWidth: '680px', lineHeight: 1.6 }}>
            Transparent data handling, strict isolation between public search and private student casework, and zero external credential escrow for Pakistani applicants.
          </p>

          {/* Quick Security Badges */}
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
              { title: 'Zero PII in Staging', desc: 'Synthetic test fixtures only' },
              { title: 'Postgres RLS', desc: 'Enforced row-level isolation' },
              { title: 'No Credential Escrow', desc: 'Student retains external passwords' },
              { title: 'Human Operations', desc: 'No web scrapers or auto bots' },
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
        className="legal-layout"
      >
        {/* TOC sidebar */}
        <nav
          aria-label="Table of contents"
          style={{
            position: 'sticky',
            top: '6rem',
          }}
          className="legal-toc"
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
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
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
            {sections.map((section, index) => (
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
            ))}
          </div>

          {/* Back link */}
          <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link
              to="/"
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
              Back to Home
            </Link>
            <span style={{ color: 'var(--border-refined)' }}>·</span>
            <Link
              to="/terms"
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
              Terms of Service
              <ArrowRight size={13} aria-hidden="true" />
            </Link>
            <Link
              to="/contact"
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
              Contact
              <ArrowRight size={13} aria-hidden="true" />
            </Link>
          </div>
        </article>
      </div>

      <style>{`
        .legal-layout {
          grid-template-columns: 220px 1fr;
        }
        .legal-toc {
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
        @media (max-width: 767px) {
          .legal-layout {
            grid-template-columns: 1fr !important;
          }
          .legal-toc {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PrivacyPolicyPage;
