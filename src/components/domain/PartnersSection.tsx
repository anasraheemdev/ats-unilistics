import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ExternalLink,
  ShieldCheck,
  Building2,
  Info,
  ChevronRight,
  X,
} from 'lucide-react';
import { PARTNERS_DATA, PartnerItem } from '@/data/partnersData';

export const PartnersSection: React.FC = () => {
  const [selectedPartner, setSelectedPartner] = useState<PartnerItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Institutions' },
    { id: 'evaluation', label: 'Credential Evaluation' },
    { id: 'portal', label: 'University Portals' },
    { id: 'mobility', label: 'Grants & Mobility' },
    { id: 'alliance', label: 'University Alliances' },
  ];

  const filteredPartners = activeCategory === 'all'
    ? PARTNERS_DATA
    : PARTNERS_DATA.filter((p) => p.category === activeCategory);

  return (
    <section
      id="our-partners-section"
      className="partners-section-wrapper"
      aria-labelledby="partners-section-heading"
      style={{
        padding: '5rem 1.5rem',
        backgroundColor: 'var(--surface-canvas, #F6F8F5)',
        borderTop: '1px solid var(--border-subtle, #E1E8DE)',
        borderBottom: '1px solid var(--border-subtle, #E1E8DE)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 3rem' }}>
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
          style={{
            position: 'relative',
            width: '100%',
            overflow: 'hidden',
            padding: '1.25rem 0',
            maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
            marginBottom: '3rem',
          }}
        >
          <div
            className="partners-marquee-track"
            style={{
              display: 'flex',
              gap: '1.5rem',
              width: 'max-content',
            }}
          >
            {/* Duplicated list for seamless infinite loop */}
            {[...PARTNERS_DATA, ...PARTNERS_DATA].map((partner, idx) => (
              <button
                key={`${partner.id}-${idx}`}
                type="button"
                onClick={() => setSelectedPartner(partner)}
                className="partner-marquee-pill"
                aria-label={`View details for ${partner.name}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  padding: '0.75rem 1.4rem',
                  borderRadius: 'var(--radius-pill, 9999px)',
                  backgroundColor: 'var(--surface-card, #FFFFFF)',
                  border: '1px solid var(--border-subtle, #E1E8DE)',
                  boxShadow: '0 2px 8px rgba(25, 38, 31, 0.04)',
                  cursor: 'pointer',
                  transition: 'all 200ms ease',
                  flexShrink: 0,
                  color: 'inherit',
                  textDecoration: 'none',
                }}
              >
                {/* Visual Logo Badge */}
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: 'var(--surface-canvas, #F6F8F5)',
                    border: '1px solid var(--border-subtle, #E1E8DE)',
                    fontSize: '0.8125rem',
                    fontWeight: 800,
                    color: 'var(--action-primary, #245B42)',
                    flexShrink: 0,
                  }}
                >
                  {partner.countryFlag}
                </span>

                <div style={{ textAlign: 'left' }}>
                  <div
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      color: 'var(--color-foreground, #19261F)',
                      lineHeight: 1.2,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {partner.acronym}
                  </div>
                  <div
                    style={{
                      fontSize: '0.7rem',
                      color: 'var(--color-foreground-muted, #58695E)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {partner.categoryLabel}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            flexWrap: 'wrap',
            marginBottom: '2rem',
          }}
          role="tablist"
          aria-label="Filter partner institutions by category"
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={activeCategory === cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: 'var(--radius-pill, 9999px)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                border: '1px solid',
                borderColor: activeCategory === cat.id ? 'var(--action-primary, #245B42)' : 'var(--border-subtle, #E1E8DE)',
                backgroundColor: activeCategory === cat.id ? 'var(--action-primary, #245B42)' : 'var(--surface-card, #FFFFFF)',
                color: activeCategory === cat.id ? '#FFFFFF' : 'var(--color-foreground-muted, #58695E)',
                cursor: 'pointer',
                transition: 'all 160ms ease',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Interactive Partner Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {filteredPartners.map((partner, index) => (
            <motion.div
              key={partner.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: index * 0.03 }}
              onClick={() => setSelectedPartner(partner)}
              tabIndex={0}
              role="button"
              aria-label={`Inspect ${partner.name}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedPartner(partner);
                }
              }}
              style={{
                backgroundColor: 'var(--surface-card, #FFFFFF)',
                border: '1px solid var(--border-subtle, #E1E8DE)',
                borderRadius: 'var(--radius-card-sm, 16px)',
                padding: '1.25rem',
                cursor: 'pointer',
                transition: 'all 180ms ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
              }}
              className="partner-card-hoverable"
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>{partner.countryFlag}</span>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        color: 'var(--action-primary, #245B42)',
                        backgroundColor: 'rgba(36, 91, 66, 0.08)',
                        padding: '0.15rem 0.5rem',
                        borderRadius: 'var(--radius-pill, 9999px)',
                      }}
                    >
                      {partner.country}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted, #718578)' }}>
                    {partner.categoryLabel}
                  </span>
                </div>

                <h3
                  style={{
                    fontSize: '1.125rem',
                    fontWeight: 700,
                    color: 'var(--color-foreground, #19261F)',
                    margin: '0 0 0.4rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <span>{partner.acronym}</span>
                </h3>

                <div
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: 'var(--color-foreground-muted, #58695E)',
                    marginBottom: '0.65rem',
                    lineHeight: 1.3,
                  }}
                >
                  {partner.name}
                </div>

                <p
                  style={{
                    fontSize: '0.8125rem',
                    color: 'var(--color-foreground-muted, #58695E)',
                    lineHeight: 1.45,
                    margin: 0,
                  }}
                >
                  {partner.description}
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '1rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--border-subtle, #E1E8DE)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--action-primary, #245B42)',
                }}
              >
                <span>View Procedural Role</span>
                <ChevronRight size={14} aria-hidden="true" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Statutory & Partner Disclaimer Box */}
        <div
          style={{
            marginTop: '2.5rem',
            padding: '1rem 1.5rem',
            borderRadius: 'var(--radius-control, 16px)',
            backgroundColor: 'rgba(36, 91, 66, 0.05)',
            border: '1px solid rgba(36, 91, 66, 0.15)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.85rem',
            fontSize: '0.8125rem',
            color: 'var(--color-foreground-muted, #58695E)',
            lineHeight: 1.5,
          }}
        >
          <Info size={18} style={{ color: 'var(--action-primary, #245B42)', flexShrink: 0, marginTop: '0.15rem' }} aria-hidden="true" />
          <div>
            <strong style={{ color: 'var(--color-foreground, #19261F)' }}>Procedural Notice &amp; Representative Institutions:</strong>{' '}
            Logos and statutory agency references represent the verified European evaluation frameworks, pre-consular tracks,
            and scholarship bodies handled during Unilistics casework. All university and agency trademarks belong to their respective authorities.
          </div>
        </div>
      </div>

      {/* Partner Detail Modal */}
      <AnimatePresence>
        {selectedPartner && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 110,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
              backgroundColor: 'rgba(13, 21, 17, 0.72)',
              backdropFilter: 'blur(4px)',
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="partner-modal-title"
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedPartner(null);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              style={{
                width: '100%',
                maxWidth: '540px',
                backgroundColor: 'var(--surface-card, #FFFFFF)',
                borderRadius: 'var(--radius-card, 24px)',
                padding: '2rem',
                boxShadow: 'var(--shadow-xl, 0 20px 25px -5px rgba(0, 0, 0, 0.1))',
                position: 'relative',
                border: '1px solid var(--border-subtle, #E1E8DE)',
              }}
            >
              <button
                type="button"
                onClick={() => setSelectedPartner(null)}
                style={{
                  position: 'absolute',
                  top: '1.25rem',
                  right: '1.25rem',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--surface-canvas, #F6F8F5)',
                  border: '1px solid var(--border-subtle, #E1E8DE)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-foreground-muted, #58695E)',
                  cursor: 'pointer',
                }}
                aria-label="Close dialog"
              >
                <X size={18} aria-hidden="true" />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '1.75rem' }}>{selectedPartner.countryFlag}</span>
                <div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: 'var(--action-primary, #245B42)',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {selectedPartner.country} • {selectedPartner.categoryLabel}
                  </span>
                  <h3
                    id="partner-modal-title"
                    style={{
                      fontSize: '1.375rem',
                      fontWeight: 800,
                      color: 'var(--color-foreground, #19261F)',
                      margin: '0.15rem 0 0',
                    }}
                  >
                    {selectedPartner.name} ({selectedPartner.acronym})
                  </h3>
                </div>
              </div>

              <div
                style={{
                  padding: '1rem',
                  backgroundColor: 'var(--surface-canvas, #F6F8F5)',
                  borderRadius: 'var(--radius-control, 16px)',
                  marginBottom: '1.25rem',
                  border: '1px solid var(--border-subtle, #E1E8DE)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--action-primary, #245B42)', textTransform: 'uppercase' }}>
                  <ShieldCheck size={14} />
                  <span>Statutory Role in Pakistani Dossiers</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-foreground, #19261F)', lineHeight: 1.5 }}>
                  {selectedPartner.statutoryRole}
                </p>
              </div>

              <p style={{ fontSize: '0.9375rem', color: 'var(--color-foreground-muted, #58695E)', lineHeight: 1.6, margin: '0 0 1.5rem' }}>
                {selectedPartner.description}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <a
                  href={selectedPartner.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.4rem',
                    borderRadius: 'var(--radius-pill, 9999px)',
                    backgroundColor: 'var(--action-primary, #245B42)',
                    color: '#FFFFFF',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    boxShadow: '0 4px 14px rgba(36, 91, 66, 0.22)',
                  }}
                >
                  <span>Visit Official Portal</span>
                  <ExternalLink size={14} aria-hidden="true" />
                </a>

                <button
                  type="button"
                  onClick={() => setSelectedPartner(null)}
                  style={{
                    padding: '0.75rem 1.4rem',
                    borderRadius: 'var(--radius-pill, 9999px)',
                    backgroundColor: 'var(--surface-canvas, #F6F8F5)',
                    border: '1px solid var(--border-subtle, #E1E8DE)',
                    color: 'var(--color-foreground, #19261F)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
