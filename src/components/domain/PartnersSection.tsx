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
        padding: '2.75rem 1.25rem',
        backgroundColor: 'var(--surface-canvas, #F6F8F5)',
        borderTop: '1px solid var(--border-subtle, #E1E8DE)',
        borderBottom: '1px solid var(--border-subtle, #E1E8DE)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 1.5rem' }}>
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
                fontSize: 'clamp(1.45rem, 2.2vw, 1.95rem)',
                fontWeight: 800,
                lineHeight: 1.2,
                color: 'var(--color-foreground, #19261F)',
                margin: '0 0 0.45rem',
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
                fontSize: '0.875rem',
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

        {/* Continuous Horizontal Logo Marquee (Borderless, Enlarged & Floating) */}
        <div
          className="partners-marquee-container"
          aria-label="Partner and evaluation authority logos"
          style={{
            position: 'relative',
            width: '100%',
            overflow: 'hidden',
            padding: '0.75rem 0',
            maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
          }}
        >
          <div
            className="partners-marquee-track"
            style={{
              display: 'flex',
              gap: '2.75rem',
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
                  minWidth: '150px',
                  height: '76px',
                  background: 'transparent',
                  border: 'none',
                  boxShadow: 'none',
                  padding: '0.25rem 0.5rem',
                  flexShrink: 0,
                  cursor: 'pointer',
                }}
              >
                <img
                  src={partner.logoUrl}
                  alt={partner.altText}
                  loading="lazy"
                  className="partner-logo-img"
                  style={{
                    maxHeight: '58px',
                    maxWidth: '190px',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain',
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
