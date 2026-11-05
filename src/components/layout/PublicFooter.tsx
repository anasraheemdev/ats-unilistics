import React from 'react';
import { Link } from 'react-router-dom';
import { BrandWordmark } from '@/components/ui/BrandWordmark';
import { ShieldCheck } from 'lucide-react';

export const PublicFooter: React.FC = () => {
  return (
    <footer
      style={{
        backgroundColor: 'var(--surface-card)',
        borderTop: '1px solid var(--border-subtle)',
        marginTop: 'auto',
        fontSize: '0.8125rem',
        color: 'var(--color-foreground-muted)',
        fontFamily: 'var(--font-family-base)',
      }}
      role="contentinfo"
      aria-label="Site footer"
    >
      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '3rem 1.25rem 2rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2.5rem',
        }}
      >
        {/* Brand & Positioning Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', gridColumn: 'span 1' }}>
          <BrandWordmark size="md" showTagline={false} />
          <p style={{ lineHeight: 1.5, margin: 0, color: 'var(--color-foreground)' }}>
            Staff-managed higher education application and visa tracking platform for Pakistani students.
          </p>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.75rem',
              color: 'var(--action-primary)',
              backgroundColor: 'var(--surface-selected)',
              padding: '0.25rem 0.625rem',
              borderRadius: 'var(--radius-pill)',
              width: 'fit-content',
              fontWeight: 600,
            }}
          >
            <ShieldCheck size={14} strokeWidth={2} aria-hidden="true" />
            <span>WCAG 2.2 AA Accessible • Verified Dev Safe</span>
          </div>
        </div>

        {/* Higher Education Directory */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h3
            style={{
              fontSize: '0.8125rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--color-foreground)',
              margin: 0,
            }}
          >
            Catalogue Directory
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>
              <Link to="/universities" style={{ color: 'inherit', textDecoration: 'none' }}>
                European Universities
              </Link>
            </li>
            <li>
              <Link to="/programs" style={{ color: 'inherit', textDecoration: 'none' }}>
                Degree Programs
              </Link>
            </li>
            <li>
              <Link to="/scholarships" style={{ color: 'inherit', textDecoration: 'none' }}>
                Verified Scholarships
              </Link>
            </li>
            <li>
              <Link to="/saved" style={{ color: 'inherit', textDecoration: 'none' }}>
                Saved Opportunities
              </Link>
            </li>
          </ul>
        </div>

        {/* Platform Guidance & Support */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h3
            style={{
              fontSize: '0.8125rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--color-foreground)',
              margin: 0,
            }}
          >
            Support & Guidance
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>
              <Link to="/support" style={{ color: 'inherit', textDecoration: 'none' }}>
                Support & Guidance Hub
              </Link>
            </li>
            <li>
              <Link to="/how-it-works" style={{ color: 'inherit', textDecoration: 'none' }}>
                How It Works
              </Link>
            </li>
            <li>
              <Link to="/request-guidance" style={{ color: 'inherit', textDecoration: 'none' }}>
                Request Managed Guidance
              </Link>
            </li>
            <li>
              <Link to="/help" style={{ color: 'inherit', textDecoration: 'none' }}>
                Help Centre & Guides
              </Link>
            </li>
            <li>
              <Link to="/support-desk" style={{ color: 'inherit', textDecoration: 'none' }}>
                Support Desk
              </Link>
            </li>
            <li>
              <Link to="/request-status" style={{ color: 'inherit', textDecoration: 'none' }}>
                Check Request Status
              </Link>
            </li>
          </ul>
        </div>

        {/* Legal & Corridors */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h3
            style={{
              fontSize: '0.8125rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--color-foreground)',
              margin: 0,
            }}
          >
            Corridors & Legal
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>
              <Link to="/corridors-and-legal" style={{ color: 'inherit', textDecoration: 'none' }}>
                Corridors & Legal Overview
              </Link>
            </li>
            <li>
              <Link to="/privacy" style={{ color: 'inherit', textDecoration: 'none' }}>
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms" style={{ color: 'inherit', textDecoration: 'none' }}>
                Terms of Service
              </Link>
            </li>
            <li>
              <Link to="/contact" style={{ color: 'inherit', textDecoration: 'none' }}>
                Contact Operations
              </Link>
            </li>
            <li>
              <Link to="/sign-in" style={{ color: 'inherit', textDecoration: 'none' }}>
                Sign In
              </Link>
            </li>
            <li>
              <Link to="/sign-up" style={{ color: 'inherit', textDecoration: 'none' }}>
                Create Free Account
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Grounded Disclaimer & Copyright */}
      <div
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '1.25rem',
          backgroundColor: 'var(--surface-canvas)',
        }}
      >
        <div
          style={{
            maxWidth: '1440px',
            margin: '0 auto',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            fontSize: '0.75rem',
          }}
        >
          <div>
            © {new Date().getFullYear()} unilistics. All rights reserved. Active corridors: Germany, France, Italy, Romania. (Hungary deferred future scope).
          </div>
          <div style={{ color: 'var(--color-foreground-muted)' }}>
            Application guides are draft procedural reference material, subject to official consular and embassy statutory review.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
