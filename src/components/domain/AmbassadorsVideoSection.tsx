import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  X,
  Clock,
  ArrowRight,
  MessageSquare,
  Video,
} from 'lucide-react';
import { AMBASSADOR_VIDEOS, AmbassadorVideo } from '@/data/ambassadorsData';

export const AmbassadorsVideoSection: React.FC = () => {
  const [selectedVideo, setSelectedVideo] = useState<AmbassadorVideo | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(15);

  const featuredVideo = AMBASSADOR_VIDEOS[0];
  const supportingVideos = AMBASSADOR_VIDEOS.slice(1);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedVideo) {
        setSelectedVideo(null);
        setIsPlaying(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedVideo]);

  const handleOpenVideo = (video: AmbassadorVideo) => {
    setSelectedVideo(video);
    setIsPlaying(true);
    setPlaybackProgress(25);
  };

  return (
    <section
      id="ambassadors-video-section"
      className="ambassadors-section-wrapper"
      aria-labelledby="ambassadors-section-heading"
      style={{
        padding: '3.25rem 1.25rem',
        backgroundColor: '#0E1A13', // Dark forest background matching Stitch Journey Dark theme
        color: '#FFFFFF',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient background glows */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '-10%',
          right: '5%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(215, 238, 131, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: '-10%',
          left: '5%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(36, 91, 66, 0.25) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: '1240px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 1.5rem' }}>
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
                backgroundColor: 'rgba(215, 238, 131, 0.15)',
                color: 'var(--brand-citron, #D7EE83)',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '1rem',
              }}
            >
              <Video size={13} aria-hidden="true" />
              <span>Authentic On-Campus Voices</span>
            </div>

            <h2
              id="ambassadors-section-heading"
              style={{
                fontSize: 'clamp(1.5rem, 2.4vw, 2.1rem)',
                fontWeight: 800,
                lineHeight: 1.2,
                color: '#FFFFFF',
                margin: '0 0 1rem',
                letterSpacing: '-0.02em',
              }}
            >
              Hear It Directly From Our{' '}
              <span style={{ color: 'var(--brand-citron, #D7EE83)' }}>
                Student Ambassadors
              </span>
            </h2>

            <p
              style={{
                fontSize: '0.875rem',
                color: 'rgba(255, 255, 255, 0.8)',
                lineHeight: 1.6,
                margin: '0 auto',
              }}
            >
              Watch unfiltered video perspectives from Pakistani student leaders on campus in Munich,
              Paris, Milan, and Bucharest on document prep, university culture, and student life.
            </p>
          </motion.div>
        </div>

        {/* Video Showcase Layout: 1 Large Featured + 3 Supporting Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
            alignItems: 'stretch',
            marginBottom: '3.5rem',
          }}
        >
          {/* Left / Top: Featured Video Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{
              backgroundColor: '#14221A',
              border: '1px solid rgba(215, 238, 131, 0.25)',
              borderRadius: 'var(--radius-card, 24px)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              position: 'relative',
            }}
            className="ambassador-featured-card"
          >
            {/* Video Thumbnail Viewport */}
            <div
              style={{
                position: 'relative',
                height: '320px',
                overflow: 'hidden',
                backgroundColor: '#0B150F',
                cursor: 'pointer',
              }}
              onClick={() => handleOpenVideo(featuredVideo)}
              role="button"
              tabIndex={0}
              aria-label={`Play video: ${featuredVideo.videoTitle}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleOpenVideo(featuredVideo);
                }
              }}
            >
              <img
                src={featuredVideo.thumbnailUrl}
                alt={featuredVideo.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: 0.82,
                  transition: 'transform 300ms ease, opacity 300ms ease',
                }}
                className="video-thumb-zoom"
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(14, 26, 19, 0.95) 0%, rgba(14, 26, 19, 0.2) 60%, transparent 100%)',
                }}
              />

              {/* Pulsing Central Play Button */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  backgroundColor: 'var(--brand-citron, #D7EE83)',
                  color: '#0E1A13',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 30px rgba(215, 238, 131, 0.45)',
                  transition: 'transform 200ms ease, box-shadow 200ms ease',
                }}
                className="play-pulse-btn"
              >
                <Play size={30} fill="#0E1A13" style={{ marginLeft: '4px' }} />
              </div>

              {/* Floating Meta Pills */}
              <div
                style={{
                  position: 'absolute',
                  top: '1rem',
                  left: '1rem',
                  display: 'flex',
                  gap: '0.5rem',
                }}
              >
                <span
                  style={{
                    backgroundColor: 'rgba(14, 26, 19, 0.85)',
                    backdropFilter: 'blur(8px)',
                    color: 'var(--brand-citron, #D7EE83)',
                    padding: '0.3rem 0.75rem',
                    borderRadius: 'var(--radius-pill, 9999px)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    border: '1px solid rgba(215, 238, 131, 0.3)',
                  }}
                >
                  FEATURED TESTIMONIAL
                </span>
              </div>

              <div
                style={{
                  position: 'absolute',
                  bottom: '1rem',
                  right: '1rem',
                  backgroundColor: 'rgba(14, 26, 19, 0.85)',
                  backdropFilter: 'blur(8px)',
                  color: '#FFFFFF',
                  padding: '0.25rem 0.65rem',
                  borderRadius: 'var(--radius-pill, 9999px)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <Clock size={12} />
                <span>{featuredVideo.duration} min</span>
              </div>
            </div>

            {/* Content Details */}
            <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>{featuredVideo.countryFlag}</span>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--brand-sage, #B4D0B6)', fontWeight: 600 }}>
                    {featuredVideo.roleTitle} • By {featuredVideo.name}
                  </span>
                </div>

                <h3
                  style={{
                    fontSize: '1.375rem',
                    fontWeight: 800,
                    lineHeight: 1.3,
                    color: '#FFFFFF',
                    margin: '0 0 0.85rem',
                  }}
                >
                  {featuredVideo.videoTitle}
                </h3>

                <p
                  style={{
                    fontSize: '0.9375rem',
                    color: 'rgba(255, 255, 255, 0.82)',
                    lineHeight: 1.55,
                    fontStyle: 'italic',
                    margin: '0 0 1.5rem',
                  }}
                >
                  "{featuredVideo.featuredQuote}"
                </p>
              </div>

              {/* Bottom Trigger Button */}
              <button
                type="button"
                onClick={() => handleOpenVideo(featuredVideo)}
                id="watch-featured-video-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  borderRadius: 'var(--radius-pill, 9999px)',
                  backgroundColor: 'var(--brand-citron, #D7EE83)',
                  color: '#0E1A13',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  width: 'fit-content',
                  transition: 'all 160ms ease',
                }}
              >
                <Play size={16} fill="#0E1A13" />
                <span>Watch Video &amp; Read Advice</span>
              </button>
            </div>
          </motion.div>

          {/* Right / Bottom: 3 Supporting Video Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {supportingVideos.map((video, idx) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                onClick={() => handleOpenVideo(video)}
                role="button"
                tabIndex={0}
                aria-label={`Play video: ${video.videoTitle}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleOpenVideo(video);
                  }
                }}
                style={{
                  backgroundColor: '#14221A',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 'var(--radius-card-sm, 16px)',
                  padding: '1.25rem',
                  display: 'flex',
                  gap: '1.25rem',
                  cursor: 'pointer',
                  transition: 'all 200ms ease',
                  alignItems: 'center',
                }}
                className="supporting-video-card"
              >
                {/* Compact Thumbnail with Mini Play Button */}
                <div
                  style={{
                    position: 'relative',
                    width: '130px',
                    height: '95px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    backgroundColor: '#0B150F',
                  }}
                >
                  <img
                    src={video.thumbnailUrl}
                    alt={video.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
                    loading="lazy"
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        backgroundColor: 'var(--brand-citron, #D7EE83)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#0E1A13',
                      }}
                    >
                      <Play size={16} fill="#0E1A13" style={{ marginLeft: '2px' }} />
                    </div>
                  </div>
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '4px',
                      right: '4px',
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      color: '#FFF',
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      padding: '1px 5px',
                      borderRadius: '4px',
                    }}
                  >
                    {video.duration}
                  </div>
                </div>

                {/* Video Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '1rem' }}>{video.countryFlag}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--brand-citron, #D7EE83)', fontWeight: 700 }}>
                      {video.topicTag}
                    </span>
                  </div>

                  <h4
                    style={{
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: '#FFFFFF',
                      lineHeight: 1.3,
                      margin: '0 0 0.35rem',
                    }}
                  >
                    {video.videoTitle}
                  </h4>

                  <div style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.65)' }}>
                    By {video.name} • {video.university}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom Banner: Become a Student Ambassador */}
        <div
          style={{
            backgroundColor: '#1B2B22',
            border: '1px solid rgba(215, 238, 131, 0.2)',
            borderRadius: 'var(--radius-card, 24px)',
            padding: '2rem 2.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', margin: '0 0 0.35rem' }}>
              Are you currently studying in Germany, France, Italy, or Romania?
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.75)', margin: 0 }}>
              Join our Student Ambassador network to mentor incoming Pakistani students and represent your university.
            </p>
          </div>

          <Link
            to="/contact?subject=Student+Ambassador+Network"
            id="become-ambassador-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              borderRadius: 'var(--radius-pill, 9999px)',
              backgroundColor: 'transparent',
              border: '1.5px solid var(--brand-citron, #D7EE83)',
              color: 'var(--brand-citron, #D7EE83)',
              fontSize: '0.875rem',
              fontWeight: 700,
              textDecoration: 'none',
              transition: 'all 160ms ease',
            }}
          >
            <span>Become a Unilistics Ambassador</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* Demonstration Disclaimer */}
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)' }}>
            Demonstration ambassador video perspectives and verified advice based on actual statutory consular files.
          </span>
        </div>
      </div>

      {/* Accessible Cinema Video Modal Lightbox */}
      <AnimatePresence>
        {selectedVideo && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 120,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
              backgroundColor: 'rgba(5, 12, 8, 0.88)',
              backdropFilter: 'blur(8px)',
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="video-modal-title"
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedVideo(null);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              style={{
                width: '100%',
                maxWidth: '720px',
                backgroundColor: '#14221A',
                borderRadius: 'var(--radius-card, 24px)',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
                border: '1px solid rgba(215, 238, 131, 0.3)',
                position: 'relative',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Top Bar with Dismiss */}
              <div
                style={{
                  padding: '1rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>{selectedVideo.countryFlag}</span>
                  <div>
                    <h4
                      id="video-modal-title"
                      style={{
                        margin: 0,
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        color: '#FFFFFF',
                      }}
                    >
                      {selectedVideo.videoTitle}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--brand-citron, #D7EE83)' }}>
                      {selectedVideo.name} • {selectedVideo.university}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  id="close-video-modal-btn"
                  onClick={() => setSelectedVideo(null)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                  aria-label="Close video player"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Simulated High-Fidelity Video Screen */}
              <div
                style={{
                  position: 'relative',
                  height: '340px',
                  backgroundColor: '#07100A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={selectedVideo.thumbnailUrl}
                  alt={selectedVideo.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }}
                />

                {/* Center Play / Pause Overlay */}
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  style={{
                    position: 'absolute',
                    width: 68,
                    height: 68,
                    borderRadius: '50%',
                    backgroundColor: 'var(--brand-citron, #D7EE83)',
                    color: '#0E1A13',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 0 25px rgba(215, 238, 131, 0.5)',
                  }}
                  aria-label={isPlaying ? 'Pause video' : 'Play video'}
                >
                  {isPlaying ? <Pause size={28} fill="#0E1A13" /> : <Play size={28} fill="#0E1A13" style={{ marginLeft: '4px' }} />}
                </button>

                {/* Subtitle / Live Transcript Overlay Bar */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '48px',
                    left: '1.5rem',
                    right: '1.5rem',
                    textAlign: 'center',
                  }}
                >
                  <span
                    style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      color: '#FFFFFF',
                      fontSize: '0.85rem',
                      padding: '0.35rem 0.85rem',
                      borderRadius: '6px',
                      display: 'inline-block',
                      maxWidth: '90%',
                    }}
                  >
                    "{selectedVideo.featuredQuote}"
                  </span>
                </div>

                {/* Video Controls Bar */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '44px',
                    backgroundColor: 'rgba(10, 20, 14, 0.95)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 1rem',
                    gap: '0.85rem',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setIsPlaying(!isPlaying)}
                    style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer' }}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                  </button>

                  {/* Scrubber Progress Bar */}
                  <div
                    style={{
                      flex: 1,
                      height: '4px',
                      backgroundColor: 'rgba(255, 255, 255, 0.25)',
                      borderRadius: '2px',
                      position: 'relative',
                      cursor: 'pointer',
                    }}
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickPos = (e.clientX - rect.left) / rect.width;
                      setPlaybackProgress(Math.round(clickPos * 100));
                    }}
                  >
                    <div
                      style={{
                        width: `${playbackProgress}%`,
                        height: '100%',
                        backgroundColor: 'var(--brand-citron, #D7EE83)',
                        borderRadius: '2px',
                      }}
                    />
                  </div>

                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace' }}>
                    0:45 / {selectedVideo.duration}
                  </span>

                  <button
                    type="button"
                    onClick={() => setIsMuted(!isMuted)}
                    style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer' }}
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                </div>
              </div>

              {/* Transcript & Key Advice Tab Container */}
              <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-citron, #D7EE83)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                    <MessageSquare size={13} />
                    <span>Ambassador Summary &amp; Transcript Excerpt</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.55, color: 'rgba(255, 255, 255, 0.85)' }}>
                    {selectedVideo.transcriptExcerpt}
                  </p>
                </div>

                <div
                  style={{
                    backgroundColor: '#1E3024',
                    padding: '1rem',
                    borderRadius: 'var(--radius-control, 16px)',
                    border: '1px solid rgba(215, 238, 131, 0.2)',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-citron, #D7EE83)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    Key Takeaways for Pakistani Applicants
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8125rem', color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1.5 }}>
                    {selectedVideo.keyAdvice.map((advice, aIdx) => (
                      <li key={aIdx} style={{ marginBottom: '0.25rem' }}>{advice}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
