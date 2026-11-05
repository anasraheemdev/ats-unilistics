import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Quote,
  X,
  ChevronRight,
} from 'lucide-react';
import { ALUMNI_STORIES, AlumniProfile } from '@/data/alumniData';
import { ROUTES } from '@/config/routes';

export const AlumniSection: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [expandedStory, setExpandedStory] = useState<AlumniProfile | null>(null);

  const countryFilters = [
    { id: 'all', label: 'All Corridors' },
    { id: 'de', label: '🇩🇪 Germany' },
    { id: 'fr', label: '🇫🇷 France' },
    { id: 'it', label: '🇮🇹 Italy' },
    { id: 'ro', label: '🇷🇴 Romania' },
  ];

  const filteredStories = selectedCountry === 'all'
    ? ALUMNI_STORIES
    : ALUMNI_STORIES.filter((s) => s.countryCode === selectedCountry);

  return (
    <section
      id="alumni-success-section"
      className="alumni-section-wrapper"
      aria-labelledby="alumni-section-heading"
      style={{
        padding: '5.5rem 1.5rem',
        backgroundColor: 'var(--surface-canvas, #F6F8F5)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '820px', margin: '0 auto 3rem' }}>
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
              <GraduationCap size={14} aria-hidden="true" />
              <span>Where Our Students Are Now</span>
            </div>

            <h2
              id="alumni-section-heading"
              style={{
                fontSize: 'clamp(2rem, 3.2vw, 2.75rem)',
                fontWeight: 800,
                lineHeight: 1.2,
                color: 'var(--color-foreground, #19261F)',
                margin: '0 0 1rem',
                letterSpacing: '-0.02em',
              }}
            >
              Success Stories{' '}
              <span style={{ color: 'var(--action-primary, #245B42)' }}>
                Beyond Borders
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
              Real Pakistani graduates navigating prerequisite evaluations, embassy appointment queues,
              and tuition exemptions to establish academic careers across Europe.
            </p>
          </motion.div>
        </div>

        {/* Corridor Filter Tabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            flexWrap: 'wrap',
            marginBottom: '2.5rem',
          }}
          role="tablist"
          aria-label="Filter alumni by destination corridor"
        >
          {countryFilters.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selectedCountry === tab.id}
              onClick={() => setSelectedCountry(tab.id)}
              style={{
                padding: '0.5rem 1.15rem',
                borderRadius: 'var(--radius-pill, 9999px)',
                fontSize: '0.8125rem',
                fontWeight: 700,
                border: '1px solid',
                borderColor: selectedCountry === tab.id ? 'var(--action-primary, #245B42)' : 'var(--border-subtle, #E1E8DE)',
                backgroundColor: selectedCountry === tab.id ? 'var(--action-primary, #245B42)' : 'var(--surface-card, #FFFFFF)',
                color: selectedCountry === tab.id ? '#FFFFFF' : 'var(--color-foreground-muted, #58695E)',
                cursor: 'pointer',
                transition: 'all 160ms ease',
                boxShadow: selectedCountry === tab.id ? '0 4px 12px rgba(36, 91, 66, 0.18)' : '0 2px 6px rgba(0,0,0,0.02)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Alumni Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '1.75rem',
            marginBottom: '3rem',
          }}
        >
          {filteredStories.map((alumnus, index) => (
            <motion.div
              key={alumnus.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              style={{
                backgroundColor: 'var(--surface-card, #FFFFFF)',
                border: '1px solid var(--border-subtle, #E1E8DE)',
                borderRadius: 'var(--radius-card, 24px)',
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 4px 16px rgba(25, 38, 31, 0.04)',
                position: 'relative',
                transition: 'transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease',
              }}
              className="alumni-card-hoverable"
            >
              <div>
                {/* Top Row: Photo & Student Bio */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: '2px solid var(--action-primary, #245B42)',
                      flexShrink: 0,
                      backgroundColor: 'var(--surface-canvas, #F6F8F5)',
                    }}
                  >
                    <img
                      src={alumnus.photoUrl}
                      alt={alumnus.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      loading="lazy"
                    />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <h3
                        style={{
                          fontSize: '1.0625rem',
                          fontWeight: 800,
                          color: 'var(--color-foreground, #19261F)',
                          margin: 0,
                          lineHeight: 1.2,
                        }}
                      >
                        {alumnus.name}
                      </h3>
                      <span style={{ fontSize: '1rem' }} aria-hidden="true">{alumnus.countryFlag}</span>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted, #718578)', marginTop: '0.15rem' }}>
                      From {alumnus.homeCity}, Pakistan • {alumnus.destinationCountry}
                    </div>
                  </div>
                </div>

                {/* University & Degree */}
                <div
                  style={{
                    backgroundColor: 'var(--surface-canvas, #F6F8F5)',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-control, 16px)',
                    marginBottom: '1rem',
                    border: '1px solid var(--border-subtle, #E1E8DE)',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      color: 'var(--action-primary, #245B42)',
                      lineHeight: 1.3,
                      marginBottom: '0.2rem',
                    }}
                  >
                    {alumnus.university}
                  </div>
                  <div
                    style={{
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                      color: 'var(--color-foreground, #19261F)',
                    }}
                  >
                    {alumnus.degreeTitle}
                  </div>
                </div>

                {/* Verified Milestone Pill */}
                <div style={{ marginBottom: '1rem' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: 'var(--action-primary, #245B42)',
                      backgroundColor: 'rgba(36, 91, 66, 0.08)',
                      border: '1px solid rgba(36, 91, 66, 0.2)',
                      padding: '0.25rem 0.65rem',
                      borderRadius: 'var(--radius-pill, 9999px)',
                    }}
                  >
                    <ShieldCheck size={12} />
                    <span>{alumnus.verifiedBadge}</span>
                  </span>
                </div>

                {/* Quote */}
                <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
                  <Quote
                    size={20}
                    style={{
                      color: 'var(--action-primary, #245B42)',
                      opacity: 0.25,
                      position: 'absolute',
                      top: -6,
                      left: -2,
                    }}
                    aria-hidden="true"
                  />
                  <p
                    style={{
                      fontSize: '0.875rem',
                      fontStyle: 'italic',
                      lineHeight: 1.5,
                      color: 'var(--color-foreground, #19261F)',
                      paddingLeft: '1.25rem',
                      margin: 0,
                    }}
                  >
                    "{alumnus.quote}"
                  </p>
                </div>

                {/* Key Metrics Chips */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '0.5rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid var(--border-subtle, #E1E8DE)',
                    marginBottom: '1rem',
                  }}
                >
                  {alumnus.keyStats.map((stat, sIdx) => (
                    <div key={sIdx} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--color-foreground-muted, #718578)', textTransform: 'uppercase' }}>
                        {stat.label}
                      </div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-foreground, #19261F)', marginTop: '0.1rem' }}>
                        {stat.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Read Full Journey Link */}
              <button
                type="button"
                onClick={() => setExpandedStory(alumnus)}
                style={{
                  width: '100%',
                  padding: '0.65rem 1rem',
                  borderRadius: 'var(--radius-pill, 9999px)',
                  backgroundColor: 'var(--surface-canvas, #F6F8F5)',
                  border: '1px solid var(--border-subtle, #E1E8DE)',
                  color: 'var(--action-primary, #245B42)',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  transition: 'all 160ms ease',
                }}
              >
                <span>Read Full Journey</span>
                <ChevronRight size={14} aria-hidden="true" />
              </button>
            </motion.div>
          ))}
        </div>

        {/* Closing Action Banner */}
        <div
          style={{
            backgroundColor: 'var(--action-primary, #245B42)',
            borderRadius: 'var(--radius-card, 24px)',
            padding: '2.5rem',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem',
            boxShadow: '0 8px 24px rgba(36, 91, 66, 0.25)',
          }}
        >
          <div style={{ maxWidth: '640px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: 'var(--brand-citron, #D7EE83)',
                letterSpacing: '0.08em',
                marginBottom: '0.5rem',
              }}
            >
              <Sparkles size={13} />
              <span>Your Turn to Study in Europe</span>
            </span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem', color: '#FFFFFF', lineHeight: 1.25 }}>
              Ready to write your own European success story?
            </h3>
            <p style={{ fontSize: '0.9375rem', color: 'rgba(255, 255, 255, 0.85)', margin: 0, lineHeight: 1.5 }}>
              Begin with an eligibility pre-assessment or explore our comprehensive course catalogues with transparent statutory tuition fees.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
            <Link
              to="/request-guidance"
              id="alumni-start-journey-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.85rem 1.85rem',
                borderRadius: 'var(--radius-pill, 9999px)',
                backgroundColor: 'var(--brand-citron, #D7EE83)',
                color: '#19261F',
                fontSize: '0.9375rem',
                fontWeight: 800,
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.2)',
                transition: 'all 180ms ease',
              }}
            >
              <span>Start Your Own Journey</span>
              <ArrowRight size={16} />
            </Link>

            <Link
              to={ROUTES.UNIVERSITIES}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.85rem 1.5rem',
                borderRadius: 'var(--radius-pill, 9999px)',
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                color: '#FFFFFF',
                fontSize: '0.9375rem',
                fontWeight: 700,
                textDecoration: 'none',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                transition: 'all 180ms ease',
              }}
            >
              <span>Explore Universities</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        {/* Synthetic Demonstration Notice */}
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted, #718578)' }}>
            Representative alumni journeys and synthetic demonstration case records based on real statutory admissions workflows.
          </span>
        </div>
      </div>

      {/* Expanded Story Dialog */}
      <AnimatePresence>
        {expandedStory && (
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
            aria-labelledby="alumni-story-modal-title"
            onClick={(e) => {
              if (e.target === e.currentTarget) setExpandedStory(null);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              style={{
                width: '100%',
                maxWidth: '600px',
                backgroundColor: 'var(--surface-card, #FFFFFF)',
                borderRadius: 'var(--radius-card, 24px)',
                padding: '2.25rem',
                boxShadow: 'var(--shadow-xl, 0 20px 25px -5px rgba(0, 0, 0, 0.1))',
                position: 'relative',
                border: '1px solid var(--border-subtle, #E1E8DE)',
                maxHeight: '90vh',
                overflowY: 'auto',
              }}
            >
              <button
                type="button"
                onClick={() => setExpandedStory(null)}
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
                aria-label="Close story dialog"
              >
                <X size={18} aria-hidden="true" />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                <img
                  src={expandedStory.photoUrl}
                  alt={expandedStory.name}
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid var(--action-primary, #245B42)',
                  }}
                />
                <div>
                  <h3
                    id="alumni-story-modal-title"
                    style={{
                      fontSize: '1.375rem',
                      fontWeight: 800,
                      color: 'var(--color-foreground, #19261F)',
                      margin: 0,
                    }}
                  >
                    {expandedStory.name}
                  </h3>
                  <div style={{ fontSize: '0.875rem', color: 'var(--color-foreground-muted, #58695E)' }}>
                    From {expandedStory.homeCity}, Pakistan • {expandedStory.university}
                  </div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--action-primary, #245B42)' }}>
                    {expandedStory.degreeTitle} ({expandedStory.intakeTerm})
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(36, 91, 66, 0.08)',
                  color: 'var(--action-primary, #245B42)',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  marginBottom: '1.25rem',
                }}
              >
                <ShieldCheck size={14} />
                <span>{expandedStory.verifiedBadge}</span>
              </div>

              <div style={{ marginBottom: '1.5rem', lineHeight: 1.6, color: 'var(--color-foreground, #19261F)', fontSize: '0.9375rem' }}>
                <p style={{ margin: '0 0 1rem' }}>{expandedStory.fullStory}</p>
                <div
                  style={{
                    backgroundColor: 'var(--surface-canvas, #F6F8F5)',
                    padding: '1rem',
                    borderRadius: 'var(--radius-control, 16px)',
                    border: '1px solid var(--border-subtle, #E1E8DE)',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--action-primary, #245B42)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    Financial &amp; Scholarship Terms
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--color-foreground, #19261F)' }}>
                    <strong>Tuition:</strong> {expandedStory.tuitionModel}
                  </div>
                  {expandedStory.scholarshipOrGrant && (
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-foreground, #19261F)', marginTop: '0.25rem' }}>
                      <strong>Grant / Funding:</strong> {expandedStory.scholarshipOrGrant}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Link
                  to="/request-guidance"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.5rem',
                    borderRadius: 'var(--radius-pill, 9999px)',
                    backgroundColor: 'var(--action-primary, #245B42)',
                    color: '#FFFFFF',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    boxShadow: '0 4px 14px rgba(36, 91, 66, 0.22)',
                  }}
                >
                  <span>Start Similar Application</span>
                  <ArrowRight size={14} />
                </Link>

                <button
                  type="button"
                  onClick={() => setExpandedStory(null)}
                  style={{
                    padding: '0.75rem 1.25rem',
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
