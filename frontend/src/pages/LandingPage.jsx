/**
 * EduBridge — Landing Page
 *
 * Public-facing marketing page shown to government officials, NGOs, investors.
 * Sections: Nav → Hero → Features → HowItWorks → Subjects → NEPSection → ForTeachers → Footer
 *
 * Design language: Notion / Linear energy — clean, confident, funded-startup feel.
 * Color accent: #02D8E9 (--color-primary)
 * Font: Inter (already loaded in index.css)
 */

import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView, useScroll, useMotionValueEvent } from 'framer-motion';

// ---------------------------------------------------------------------------
// Scroll-triggered fade-up animation wrapper
// ---------------------------------------------------------------------------
function FadeUp({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Animated counter (counts from 0 to target over ~1.8 s)
// ---------------------------------------------------------------------------
function AnimatedCounter({ target, suffix = '', prefix = '' }) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const duration = 1800;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.floor(eased * target));
      if (t < 1) requestAnimationFrame(tick);
      else setValue(target);
    };
    requestAnimationFrame(tick);
  }, [inView, target]);

  return (
    <span ref={ref}>
      {prefix}{value.toLocaleString('en-IN')}{suffix}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Stats data — fetched from /api/public/stats, fallback to hardcoded
// ---------------------------------------------------------------------------
const FALLBACK_STATS = {
  questionsAnswered: 12480,
  languages: 7,
  subjects: 7,
};

function usePublicStats() {
  const [stats, setStats] = useState(FALLBACK_STATS);
  useEffect(() => {
    fetch('/api/public/stats')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data && data.questionsAnswered) setStats(data);
      })
      .catch(() => {}); // silent fallback
  }, []);
  return stats;
}

// ---------------------------------------------------------------------------
// Nav
// ---------------------------------------------------------------------------
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: scrolled ? 'rgba(255,255,255,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--color-border)' : '1px solid transparent',
        transition: 'background 0.3s, border-color 0.3s, backdrop-filter 0.3s',
      }}
    >
      <div
        style={{
          maxWidth: 1120,
          margin: '0 auto',
          padding: '0 24px',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <span style={{ fontSize: 26 }}>🌉</span>
          <span style={{ fontWeight: 800, fontSize: 20, color: 'var(--color-text)', letterSpacing: '-0.4px' }}>
            Edu<span style={{ color: 'var(--color-primary)' }}>Bridge</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex" style={{ alignItems: 'center', gap: 12 }}>
          <Link
            to="/teacher"
            style={{
              fontWeight: 600,
              fontSize: 14,
              color: 'var(--color-text)',
              textDecoration: 'none',
              padding: '8px 16px',
              borderRadius: 8,
              border: '1.5px solid var(--color-border)',
              transition: 'border-color 0.2s',
            }}
          >
            For Teachers
          </Link>
          <Link
            to="/app"
            style={{
              fontWeight: 700,
              fontSize: 14,
              color: 'var(--color-primary-text)',
              background: 'var(--color-primary)',
              textDecoration: 'none',
              padding: '9px 20px',
              borderRadius: 8,
              letterSpacing: '-0.2px',
            }}
          >
            Start Learning Free
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="flex md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, color: 'var(--color-text)' }}
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
          ) : (
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div
          style={{
            background: 'rgba(255,255,255,0.97)',
            backdropFilter: 'blur(12px)',
            borderTop: '1px solid var(--color-border)',
            padding: '16px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <Link to="/teacher" onClick={() => setMenuOpen(false)} style={{ fontWeight: 600, fontSize: 15, color: 'var(--color-text)', textDecoration: 'none' }}>For Teachers</Link>
          <Link
            to="/app"
            onClick={() => setMenuOpen(false)}
            style={{
              fontWeight: 700, fontSize: 15, color: 'var(--color-primary-text)',
              background: 'var(--color-primary)', textDecoration: 'none',
              padding: '12px 20px', borderRadius: 10, textAlign: 'center',
            }}
          >
            Start Learning Free
          </Link>
        </div>
      )}
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------
function Hero({ stats }) {
  return (
    <section
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 80,
        paddingBottom: 40,
        padding: '80px 24px 40px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle radial gradient background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(2,216,233,0.10) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative' }}>
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(2,216,233,0.12)',
              color: '#008A99',
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              padding: '6px 14px',
              borderRadius: 100,
              border: '1px solid rgba(2,216,233,0.3)',
              marginBottom: 28,
            }}
          >
            <span>🇮🇳</span> Built for Bharat · Aligned with NEP 2020
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontSize: 'clamp(36px, 6vw, 72px)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-1.5px',
            color: 'var(--color-text)',
            marginBottom: 24,
          }}
        >
          Every Indian Child{' '}
          <span style={{ color: 'var(--color-primary)' }}>Deserves</span>
          {' '}a Great Teacher
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          style={{
            fontSize: 'clamp(16px, 2.2vw, 21px)',
            color: 'var(--color-muted)',
            lineHeight: 1.55,
            marginBottom: 40,
            maxWidth: 640,
            margin: '0 auto 40px',
          }}
        >
          Free AI tutor in <strong style={{ color: 'var(--color-text)' }}>7 Indian languages</strong> — Hindi, Telugu, Tamil, Kannada, Bengali, Marathi, English.
          Patient. Personal. Available 24/7.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.48 }}
          style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 56 }}
        >
          <Link
            to="/app"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--color-primary)',
              color: 'var(--color-primary-text)',
              fontWeight: 700,
              fontSize: 16,
              padding: '14px 28px',
              borderRadius: 12,
              textDecoration: 'none',
              boxShadow: '0 4px 24px rgba(2,216,233,0.35)',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(2,216,233,0.45)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 24px rgba(2,216,233,0.35)'; }}
          >
            Start Learning Free
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
          <Link
            to="/teacher"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'transparent',
              color: 'var(--color-text)',
              fontWeight: 600,
              fontSize: 16,
              padding: '14px 28px',
              borderRadius: 12,
              textDecoration: 'none',
              border: '1.5px solid var(--color-border)',
              transition: 'border-color 0.2s, background 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.background = 'rgba(2,216,233,0.06)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.background = 'transparent'; }}
          >
            I'm a Teacher
          </Link>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.62 }}
          style={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '2px',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 16,
            padding: '20px 8px',
            maxWidth: 680,
            margin: '0 auto',
          }}
        >
          {[
            { value: stats.questionsAnswered, suffix: '+', label: 'Questions Answered' },
            { value: stats.languages, suffix: '', label: 'Indian Languages' },
            { value: stats.subjects, suffix: '', label: 'Subjects' },
            { value: null, label: 'Free Forever', freeLabel: true },
          ].map((stat, i) => (
            <div key={i} style={{ flex: '1 1 140px', textAlign: 'center', padding: '8px 16px', position: 'relative' }}>
              {i > 0 && (
                <div className="hidden sm:block" style={{
                  position: 'absolute', left: 0, top: '20%', height: '60%',
                  width: 1, background: 'var(--color-border)',
                }} />
              )}
              <div style={{ fontWeight: 800, fontSize: 24, color: 'var(--color-text)', letterSpacing: '-0.5px' }}>
                {stat.freeLabel ? (
                  <span style={{ color: 'var(--color-primary)' }}>∞</span>
                ) : (
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                )}
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-muted)', fontWeight: 500, marginTop: 2 }}>{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Features — 3-column grid
// ---------------------------------------------------------------------------
const FEATURES = [
  {
    icon: '🗣️',
    title: '7 Indian Languages',
    desc: 'Students learn in their mother tongue — Hindi, Telugu, Tamil, Kannada, Bengali, Marathi, or English. No child left behind because of language.',
  },
  {
    icon: '🔒',
    title: 'Safe for Children',
    desc: 'Built-in AI safety guardrails, content screening, and age-appropriate responses. Parents and teachers can trust every answer.',
  },
  {
    icon: '📡',
    title: 'Low-Bandwidth Friendly',
    desc: 'Optimized for India\'s network realities. Works on 2G connections and affordable smartphones. No child excluded by connectivity.',
  },
];

function Features() {
  return (
    <section style={{ padding: '96px 24px', background: 'var(--color-surface)' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <FadeUp>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-primary)', marginBottom: 12 }}>
              Why EduBridge
            </p>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-0.8px', color: 'var(--color-text)', lineHeight: 1.15 }}>
              Designed from the ground up<br />for Indian classrooms
            </h2>
          </div>
        </FadeUp>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {FEATURES.map((f, i) => (
            <FadeUp key={f.title} delay={i * 0.1}>
              <div
                style={{
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 16,
                  padding: '32px 28px',
                  height: '100%',
                  transition: 'box-shadow 0.2s, transform 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(2,216,233,0.12)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}
              >
                <div style={{ fontSize: 36, marginBottom: 20 }}>{f.icon}</div>
                <h3 style={{ fontWeight: 700, fontSize: 18, color: 'var(--color-text)', marginBottom: 10, letterSpacing: '-0.3px' }}>{f.title}</h3>
                <p style={{ fontSize: 15, color: 'var(--color-muted)', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// How It Works — 3 steps
// ---------------------------------------------------------------------------
const STEPS = [
  { num: '01', icon: '📚', title: 'Choose your subject', desc: 'Pick from Math, Science, English, Civic Sense, My Rights, Respect & Safety, or Communication.' },
  { num: '02', icon: '💬', title: 'Ask in your language', desc: 'Type your question in any of 7 Indian languages — exactly how you think.' },
  { num: '03', icon: '✨', title: 'Learn with your tutor', desc: 'Get a clear, patient explanation tailored to your age. Ask follow-ups, quiz yourself, or explore further.' },
];

function HowItWorks() {
  return (
    <section style={{ padding: '96px 24px', background: 'var(--color-bg)' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <FadeUp>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-primary)', marginBottom: 12 }}>
              How It Works
            </p>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-0.8px', color: 'var(--color-text)', lineHeight: 1.15 }}>
              Three steps to understanding anything
            </h2>
          </div>
        </FadeUp>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 32, position: 'relative' }}>
          {STEPS.map((step, i) => (
            <FadeUp key={step.num} delay={i * 0.12}>
              <div style={{ position: 'relative' }}>
                {/* Connector line between steps */}
                {i < STEPS.length - 1 && (
                  <div
                    className="hidden lg:block"
                    style={{
                      position: 'absolute',
                      top: 28,
                      left: 'calc(100% - 16px)',
                      width: 'calc(100% - 48px)',
                      height: 2,
                      background: 'linear-gradient(90deg, var(--color-primary) 0%, rgba(2,216,233,0.2) 100%)',
                      zIndex: 0,
                    }}
                  />
                )}
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    background: 'rgba(2,216,233,0.1)',
                    border: '1.5px solid rgba(2,216,233,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 26,
                    marginBottom: 20,
                  }}>
                    {step.icon}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-primary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Step {step.num}</div>
                  <h3 style={{ fontWeight: 700, fontSize: 18, color: 'var(--color-text)', marginBottom: 10, letterSpacing: '-0.3px' }}>{step.title}</h3>
                  <p style={{ fontSize: 15, color: 'var(--color-muted)', lineHeight: 1.6 }}>{step.desc}</p>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Subjects pill grid
// ---------------------------------------------------------------------------
const SUBJECTS = [
  { emoji: '📐', name: 'Math' },
  { emoji: '🔬', name: 'Science' },
  { emoji: '📖', name: 'English' },
  { emoji: '🏘️', name: 'Civic Sense' },
  { emoji: '⚖️', name: 'My Rights' },
  { emoji: '🛡️', name: 'Respect & Safety' },
  { emoji: '💬', name: 'Communication' },
];

function Subjects() {
  const navigate = useNavigate();

  return (
    <section style={{ padding: '80px 24px', background: 'var(--color-surface)' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
        <FadeUp>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-primary)', marginBottom: 12 }}>
            Curriculum
          </p>
          <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 800, letterSpacing: '-0.8px', color: 'var(--color-text)', marginBottom: 12, lineHeight: 1.15 }}>
            Beyond textbooks
          </h2>
          <p style={{ fontSize: 16, color: 'var(--color-muted)', marginBottom: 40 }}>
            Academic subjects and life skills — because education is more than marks.
          </p>
        </FadeUp>

        <FadeUp delay={0.1}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
            {SUBJECTS.map((s, i) => (
              <motion.button
                key={s.name}
                onClick={() => navigate('/app')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'var(--color-bg)',
                  border: '1.5px solid var(--color-border)',
                  borderRadius: 100,
                  padding: '10px 20px',
                  fontSize: 15,
                  fontWeight: 600,
                  color: 'var(--color-text)',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s, background 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.background = 'rgba(2,216,233,0.06)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.background = 'var(--color-bg)'; }}
              >
                <span>{s.emoji}</span>
                {s.name}
              </motion.button>
            ))}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// NEP Section — government alignment
// ---------------------------------------------------------------------------
const NEP_POINTS = [
  {
    icon: '📝',
    title: 'Foundational Literacy & Numeracy',
    desc: 'Direct support for FLN goals — every child reads and calculates by Grade 3.',
  },
  {
    icon: '🗣️',
    title: 'Mother Tongue Instruction',
    desc: 'NEP 2020 mandates teaching in home language through Grade 5. EduBridge does exactly that.',
  },
  {
    icon: '🤝',
    title: 'Inclusive & Equitable Quality Education',
    desc: 'Zero cost, zero discrimination. A child in rural Andhra Pradesh gets the same quality as any metro city.',
  },
];

function NEPSection() {
  return (
    <section
      style={{
        padding: '96px 24px',
        background: 'linear-gradient(135deg, #003B40 0%, #005560 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle tricolor accent */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: 4,
        background: 'linear-gradient(90deg, #FF9933 33%, #FFFFFF 33%, #FFFFFF 66%, #138808 66%)',
      }} />

      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <FadeUp>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 36, marginBottom: 16 }}>🏛️</div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-0.8px', color: '#FFFFFF', lineHeight: 1.15, marginBottom: 14 }}>
              Built for NEP 2020 & Digital India
            </h2>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.65)', maxWidth: 560, margin: '0 auto' }}>
              EduBridge is purpose-built to advance India's national education priorities.
            </p>
          </div>
        </FadeUp>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {NEP_POINTS.map((pt, i) => (
            <FadeUp key={pt.title} delay={i * 0.1}>
              <div
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 16,
                  padding: '28px 24px',
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 16 }}>{pt.icon}</div>
                <h3 style={{ fontWeight: 700, fontSize: 17, color: '#FFFFFF', marginBottom: 10 }}>{pt.title}</h3>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.65 }}>{pt.desc}</p>
              </div>
            </FadeUp>
          ))}
        </div>

        <FadeUp delay={0.3}>
          <div style={{ textAlign: 'center', marginTop: 52 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 16,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 12,
              padding: '16px 28px',
            }}>
              <span style={{ fontSize: 22 }}>🇮🇳</span>
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15, fontWeight: 500 }}>
                Aligned with Ministry of Education's vision for 21st-century learning
              </span>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// For Teachers
// ---------------------------------------------------------------------------
function ForTeachers() {
  const navigate = useNavigate();

  return (
    <section style={{ padding: '96px 24px', background: 'var(--color-bg)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <FadeUp>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-primary)', marginBottom: 12 }}>
            For Educators
          </p>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, letterSpacing: '-1px', color: 'var(--color-text)', lineHeight: 1.1, marginBottom: 16 }}>
            Monitor your entire class<br />from one dashboard
          </h2>
          <p style={{ fontSize: 17, color: 'var(--color-muted)', lineHeight: 1.6, maxWidth: 560, margin: '0 auto 40px' }}>
            See which students need help, track progress across subjects, and download reports — all without extra paperwork.
          </p>
        </FadeUp>

        {/* Feature chips */}
        <FadeUp delay={0.1}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginBottom: 48 }}>
            {[
              '📊 Real-time progress tracking',
              '⚠️ Struggling student alerts',
              '📥 Downloadable reports',
              '🏫 Multi-class support',
              '🔒 Student data privacy',
            ].map((chip) => (
              <span
                key={chip}
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 100,
                  padding: '8px 16px',
                  fontSize: 14,
                  fontWeight: 500,
                  color: 'var(--color-text)',
                }}
              >
                {chip}
              </span>
            ))}
          </div>
        </FadeUp>

        <FadeUp delay={0.2}>
          <motion.button
            onClick={() => navigate('/teacher')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--color-text)',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: 16,
              padding: '14px 28px',
              borderRadius: 12,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Set up your classroom
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </motion.button>
        </FadeUp>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Testimonial / Social proof strip
// ---------------------------------------------------------------------------
function SocialProof() {
  const quotes = [
    { text: '"My daughter asked me why she never had a teacher this patient."', from: 'Parent, Vijayawada' },
    { text: '"For the first time, students in my class who spoke only Telugu could understand algebra."', from: 'Government school teacher, Warangal' },
    { text: '"EduBridge is what Digital India should look like in classrooms."', from: 'Education researcher, Delhi' },
  ];

  return (
    <section style={{ padding: '64px 24px', background: 'var(--color-surface)' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {quotes.map((q, i) => (
            <FadeUp key={i} delay={i * 0.1}>
              <div
                style={{
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 16,
                  padding: '28px 24px',
                }}
              >
                <div style={{ fontSize: 32, color: 'var(--color-primary)', marginBottom: 12, lineHeight: 1 }}>"</div>
                <p style={{ fontSize: 15, color: 'var(--color-text)', lineHeight: 1.65, marginBottom: 16, fontStyle: 'italic' }}>
                  {q.text.replace(/^"|"$/g, '')}
                </p>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-muted)' }}>— {q.from}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------
function Footer() {
  return (
    <footer style={{ padding: '48px 24px', background: 'var(--color-bg)', borderTop: '1px solid var(--color-border)' }}>
      <div
        style={{
          maxWidth: 1120,
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 20,
        }}
      >
        {/* Logo + tagline */}
        <div>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 6 }}>
            <span style={{ fontSize: 22 }}>🌉</span>
            <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--color-text)', letterSpacing: '-0.3px' }}>
              Edu<span style={{ color: 'var(--color-primary)' }}>Bridge</span>
            </span>
          </Link>
          <p style={{ fontSize: 13, color: 'var(--color-muted)', fontWeight: 500 }}>
            Built for Bharat 🇮🇳 · Free forever for students
          </p>
        </div>

        {/* Links */}
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          <Link to="/app" style={{ fontSize: 14, color: 'var(--color-muted)', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--color-text)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--color-muted)'}
          >
            Start Learning
          </Link>
          <Link to="/teacher" style={{ fontSize: 14, color: 'var(--color-muted)', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--color-text)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--color-muted)'}
          >
            For Teachers
          </Link>
          <a
            href="https://github.com/chandrababu2048/edubridge"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--color-muted)', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--color-text)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--color-muted)'}
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
            GitHub
          </a>
        </div>

        {/* Bottom note */}
        <div style={{ width: '100%', textAlign: 'center', borderTop: '1px solid var(--color-border)', paddingTop: 24, marginTop: 8 }}>
          <p style={{ fontSize: 12, color: 'var(--color-muted)' }}>
            Powered by Claude AI · Built by Chandrababu Anakapalli ·{' '}
            <a href="mailto:chandrababu2048@gmail.com" style={{ color: 'var(--color-muted)', textDecoration: 'none' }}>chandrababu2048@gmail.com</a>
          </p>
        </div>
      </div>
    </footer>
  );
}

// ---------------------------------------------------------------------------
// LandingPage — assemble all sections
// ---------------------------------------------------------------------------
export default function LandingPage() {
  const stats = usePublicStats();

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
      <Nav />
      <Hero stats={stats} />
      <Features />
      <HowItWorks />
      <Subjects />
      <NEPSection />
      <SocialProof />
      <ForTeachers />
      <Footer />
    </div>
  );
}
