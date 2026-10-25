import React from 'react';
import { Link } from 'react-router-dom';
import { BrandWordmark } from '@/components/ui/BrandWordmark';
import { ShieldCheck } from 'lucide-react';

export const PublicFooter: React.FC = () => {
  return (
    <footer
      style={{
        backgroundColor: '#ffffff',
        borderTop: '1px solid var(--border-subtle, #ebe6de)',
        marginTop: 'auto',
        fontSize: '0.8125rem',
        color: 'var(--text-muted, #636b78)',
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
          <p style={{ lineHeight: 1.5, margin: 0, color: 'var(--text-charcoal, #1a1a1a)' }}>
            Staff-managed higher education application and visa tracking platform for Pakistani students.
          </p>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.75rem',
              color: '#2e7d32',
              backgroundColor: '#e8f5e9',
              padding: '0.25rem 0.5rem',
              borderRadius: 'var(--radius-pill, 9999px)',
              width: 'fit-content',
            }}
          >
            <ShieldCheck size={14} aria-hidden="true" />
            <span>WCAG 2.1 AA Accessible • Synthetic Dev Safe</span>
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
              color: 'var(--text-charcoal, #1a1a1a)',
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
              color: 'var(--text-charcoal, #1a1a1a)',
              margin: 0,
            }}
          >
            Support & Guidance
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>
              <a href="/#how-it-works" style={{ color: 'inherit', textDecoration: 'none' }}>
                How It Works
              </a>
            </li>
            <li>
              <Link to="/request-support" style={{ color: 'inherit', textDecoration: 'none' }}>
                Request Managed Guidance
              </Link>
            </li>
            <li>
              <Link to="/help" style={{ color: 'inherit', textDecoration: 'none' }}>
                Help Centre & Guides
              </Link>
            </li>
            <li>
              <Link to="/support" style={{ color: 'inherit', textDecoration: 'none' }}>
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
              color: 'var(--text-charcoal, #1a1a1a)',
              margin: 0,
            }}
          >
            Corridors & Legal
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
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
          borderTop: '1px solid var(--border-subtle, #ebe6de)',
          padding: '1.25rem',
          backgroundColor: 'var(--surface-canvas, #fdfbf7)',
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
            © {new Date().getFullYear()} Unilistics. All rights reserved. Active corridors: Germany, France, Italy, Romania. (Hungary deferred future scope).
          </div>
          <div style={{ color: 'var(--text-muted, #636b78)' }}>
            Application guides are draft procedural reference material, subject to official consular and embassy statutory review.
          </div>
        </div>
      </div>
    </footer>
  );
};
