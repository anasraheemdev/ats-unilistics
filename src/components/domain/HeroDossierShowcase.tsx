import React from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  CheckCircle2,
  GraduationCap,
  Award,
} from 'lucide-react';

export const HeroDossierShowcase: React.FC = () => {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '860px',
        margin: '2.5rem auto 0',
      }}
    >
      {/* Background Ambient Radial Glow Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.35, 0.55, 0.35],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          position: 'absolute',
          top: '-15%',
          left: '15%',
          width: '380px',
          height: '380px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(215, 238, 131, 0.45) 0%, rgba(36, 91, 66, 0.15) 60%, transparent 80%)',
          filter: 'blur(50px)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      />

      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.25, 0.45, 0.25],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1.5,
        }}
        style={{
          position: 'absolute',
          bottom: '-10%',
          right: '10%',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(36, 91, 66, 0.35) 0%, rgba(180, 208, 182, 0.2) 60%, transparent 80%)',
          filter: 'blur(45px)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      />

      {/* Main Glassmorphic Dossier Window */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'relative',
          zIndex: 10,
          backgroundColor: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(16px)',
          borderRadius: '24px',
          border: '1px solid rgba(225, 232, 222, 0.95)',
          boxShadow: '0 24px 60px -12px rgba(25, 38, 31, 0.12), 0 0 0 1px rgba(36, 91, 66, 0.05)',
          padding: '1.75rem',
          textAlign: 'left',
          overflow: 'hidden',
        }}
      >
        {/* Window Chrome / Titlebar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-subtle, #E1E8DE)',
            paddingBottom: '1rem',
            marginBottom: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#FF5F56', display: 'inline-block' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#FFBD2E', display: 'inline-block' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#27C93F', display: 'inline-block' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-foreground-muted, #58695E)', marginLeft: '0.5rem' }}>
              Unilistics Casework Studio • Managed Admissions Engine
            </span>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.2rem 0.6rem',
              borderRadius: 'var(--radius-pill, 9999px)',
              backgroundColor: 'var(--surface-recessed, #EDF2E9)',
              fontSize: '0.6875rem',
              fontWeight: 700,
              color: 'var(--action-primary, #245B42)',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#245B42', animation: 'pulse 2s infinite' }} />
            <span>ACTIVE ADMISSIONS STREAM</span>
          </div>
        </div>

        {/* Dossier Header Info */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.25rem',
            marginBottom: '1.5rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--surface-recessed, #EDF2E9)',
                  border: '1px solid var(--border-subtle, #E1E8DE)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--action-primary, #245B42)',
                  fontWeight: 800,
                  fontSize: '1.125rem',
                }}
              >
                SB
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--color-foreground, #19261F)' }}>
                  Syed Bilal • M.Sc. Data Science &amp; AI
                </h4>
                <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--color-foreground-muted, #58695E)' }}>
                  Lahore, PK ➔ Munich &amp; Aachen, DE • Winter Intake
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '0.25rem 0.65rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(36, 91, 66, 0.08)',
                color: 'var(--action-primary, #245B42)',
              }}
            >
              <CheckCircle2 size={13} />
              <span>HEC &amp; MOFA Attested</span>
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '0.25rem 0.65rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(215, 238, 131, 0.35)',
                color: '#19261F',
              }}
            >
              <Award size={13} />
              <span>APS Certified (1.4 German Note)</span>
            </span>
          </div>
        </div>

        {/* Milestone Steps Progress Strip */}
        <div
          style={{
            backgroundColor: 'var(--surface-recessed, #EDF2E9)',
            borderRadius: '16px',
            padding: '1.25rem',
            border: '1px solid var(--border-subtle, #E1E8DE)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.75rem',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            <span style={{ color: 'var(--color-foreground, #19261F)' }}>Official Admissions Pipeline</span>
            <span style={{ color: 'var(--action-primary, #245B42)' }}>Stage 3 of 4: Uni-assist VPD Dispatch</span>
          </div>

          {/* Interactive Progress Bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0.5rem',
            }}
          >
            {[
              { label: 'HEC Attestation', status: 'Completed', color: 'var(--action-primary, #245B42)' },
              { label: 'APS Verification', status: 'Approved', color: 'var(--action-primary, #245B42)' },
              { label: 'VPD Processing', status: 'Under Review', color: '#19261F', active: true },
              { label: 'Visa Interview', status: 'Upcoming', color: 'var(--color-foreground-muted, #58695E)' },
            ].map((step, idx) => (
              <div
                key={step.label}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                }}
              >
                <div
                  style={{
                    height: '6px',
                    borderRadius: '9999px',
                    backgroundColor: idx < 2 ? 'var(--action-primary, #245B42)' : idx === 2 ? 'var(--brand-citron, #D7EE83)' : '#D0D8CD',
                  }}
                />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-foreground, #19261F)' }}>
                    {step.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Floating Micro-Card 1: APS Certificate Verified (Top Right) */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          top: '-24px',
          right: '-16px',
          zIndex: 20,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            padding: '0.625rem 1rem',
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(12px)',
            borderRadius: '16px',
            border: '1px solid var(--border-subtle, #E1E8DE)',
            boxShadow: '0 12px 30px rgba(36, 91, 66, 0.15)',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'rgba(36, 91, 66, 0.12)',
              color: 'var(--action-primary, #245B42)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShieldCheck size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-foreground, #19261F)' }}>
              APS Certificate Verified
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--action-primary, #245B42)', fontWeight: 600 }}>
              Statutory Embassy Benchmark Met
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating Micro-Card 2: Assigned Counsellor Note (Bottom Left) */}
      <motion.div
        animate={{ y: [0, -7, 0] }}
        transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut', delay: 0.8 }}
        style={{
          position: 'absolute',
          bottom: '-20px',
          left: '-16px',
          zIndex: 20,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1.125rem',
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(12px)',
            borderRadius: '16px',
            border: '1px solid var(--border-subtle, #E1E8DE)',
            boxShadow: '0 14px 34px rgba(25, 38, 31, 0.12)',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'var(--brand-citron, #D7EE83)',
              color: '#19261F',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.875rem',
              flexShrink: 0,
            }}
          >
            AC
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-foreground, #19261F)' }}>
                Assigned Casework Counsellor
              </span>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#245B42' }} />
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--color-foreground-muted, #58695E)' }}>
              "Dossier ready for uni-assist Winter submission"
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating Micro-Card 3: Blocked Account / Tuition Exemption (Bottom Right) */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 5.5, ease: 'easeInOut', delay: 1.6 }}
        style={{
          position: 'absolute',
          bottom: '-28px',
          right: '28px',
          zIndex: 20,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 0.875rem',
            backgroundColor: 'rgba(25, 38, 31, 0.94)',
            backdropFilter: 'blur(12px)',
            borderRadius: '14px',
            color: '#FFFFFF',
            boxShadow: '0 12px 28px rgba(0, 0, 0, 0.18)',
            border: '1px solid rgba(215, 238, 131, 0.25)',
          }}
        >
          <GraduationCap size={16} style={{ color: 'var(--brand-citron, #D7EE83)' }} />
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#D7EE83' }}>
              €0 Statutory Tuition
            </div>
            <div style={{ fontSize: '0.625rem', color: '#B4D0B6' }}>
              Public German Universities
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
