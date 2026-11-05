import React from 'react';
import { motion } from 'framer-motion';
import { Building2 } from 'lucide-react';
import { PARTNER_LOGOS } from '@/data/partnersData';

export const PartnersSection: React.FC = () => {
  return (
    <section
      id="our-partners-section"
      className="partners-section-wrapper"
      aria-labelledby="partners-section-heading"
      style={{
        padding: '4.5rem 1.5rem',
        backgroundColor: 'var(--surface-canvas, #F6F8F5)',
        borderTop: '1px solid var(--border-subtle, #E1E8DE)',
        borderBottom: '1px solid var(--border-subtle, #E1E8DE)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 2.75rem' }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.35rem 0.95rem',
                borderRadius: 'var(--radius-pill, 9999px)',
                backgroundColor: 'rgba(36, 91, 66, 0.08)',
                color: 'var(--action-primary, #245B42)',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '1rem',
              }}
            >
              <Building2 size={13} aria-hidden="true" />
              <span>Institutional Network &amp; Credential Pathways</span>
            </div>

            <h2
              id="partners-section-heading"
              style={{
                fontSize: 'clamp(2rem, 3.2vw, 2.75rem)',
                fontWeight: 800,
                lineHeight: 1.2,
                color: 'var(--color-foreground, #19261F)',
                margin: '0 0 1rem',
                letterSpacing: '-0.02em',
              }}
            >
              Collaborating with Leading{' '}
              <span style={{ color: 'var(--action-primary, #245B42)' }}>
                European Academic Bodies
              </span>
            </h2>

            <p
              style={{
                fontSize: 'clamp(0.95rem, 1.4vw, 1.0625rem)',
                color: 'var(--color-foreground-muted, #58695E)',
                lineHeight: 1.6,
                margin: '0 auto',
              }}
            >
              Our staff-operated casework aligns directly with official statutory evaluation protocols,
              consular portals, and national scholarship agencies across Germany, France, Italy, and Romania.
            </p>
          </motion.div>
        </div>

        {/* Continuous Horizontal Logo Marquee */}
        <div
          className="partners-marquee-container"
          aria-label="Partner and evaluation authority logos"
          style={{
            position: 'relative',
            width: '100%',
            overflow: 'hidden',
            padding: '1rem 0',
            maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
          }}
        >
          <div
            className="partners-marquee-track"
            style={{
              display: 'flex',
              gap: '1.75rem',
              width: 'max-content',
              alignItems: 'center',
            }}
          >
            {/* Duplicated list for seamless infinite loop */}
            {[...PARTNER_LOGOS, ...PARTNER_LOGOS].map((partner, idx) => (
              <div
                key={`${partner.id}-${idx}`}
                className="partner-logo-card"
                title={partner.altText}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '180px',
                  height: '76px',
                  padding: '0.75rem 1.25rem',
                  borderRadius: 'var(--radius-control, 16px)',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border-subtle, #E1E8DE)',
                  boxShadow: '0 2px 8px rgba(25, 38, 31, 0.04)',
                  transition: 'all 220ms ease',
                  flexShrink: 0,
                }}
              >
                <img
                  src={partner.logoUrl}
                  alt={partner.altText}
                  loading="lazy"
                  className="partner-logo-img"
                  style={{
                    maxHeight: '44px',
                    maxWidth: '140px',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain',
                    filter: 'grayscale(100%) opacity(0.8)',
                    transition: 'filter 220ms ease, opacity 220ms ease, transform 220ms ease',
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
