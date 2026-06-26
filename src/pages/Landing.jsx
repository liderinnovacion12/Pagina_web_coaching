import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import CoachMap from '../components/map/CoachMap'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import useTranslation from '../hooks/useTranslation'

// ── SVG Trajectory Hero ──────────────────────────────────────────────────────
function TrajectoryLines() {
  const svgRef = useRef(null)
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    if (prefersReduced) return
    const paths = svgRef.current?.querySelectorAll('.trajectory-path')
    if (!paths) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          paths.forEach((p, i) => {
            setTimeout(() => p.classList.add('animate'), i * 250)
          })
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    if (svgRef.current) observer.observe(svgRef.current)
    return () => observer.disconnect()
  }, [prefersReduced])

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 800 480"
      className="absolute inset-0 w-full h-full pointer-events-none"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {/* Path 1 — long upward arc */}
      <path
        className="trajectory-path"
        d="M-50 480 C100 400 200 200 450 80 S700 20 850 -20"
        fill="none"
        stroke="#C9A84C"
        strokeWidth="1.2"
        strokeOpacity="0.35"
        style={{ '--path-length': '900px', transitionDelay: '0ms' }}
      />
      {/* Path 2 — secondary arc */}
      <path
        className="trajectory-path"
        d="M-80 520 C80 420 280 260 520 140 S750 60 900 30"
        fill="none"
        stroke="#A8C4D4"
        strokeWidth="0.8"
        strokeOpacity="0.25"
        style={{ '--path-length': '950px', transitionDelay: '300ms' }}
      />
      {/* Path 3 — short steep climb */}
      <path
        className="trajectory-path"
        d="M100 480 Q300 320 500 120 T800 0"
        fill="none"
        stroke="#C9A84C"
        strokeWidth="0.6"
        strokeOpacity="0.18"
        style={{ '--path-length': '800px', transitionDelay: '500ms' }}
      />
      {/* Path 4 — low horizontal glide */}
      <path
        className="trajectory-path"
        d="M-100 380 C150 360 350 300 600 240 S780 200 900 180"
        fill="none"
        stroke="#A8C4D4"
        strokeWidth="0.5"
        strokeOpacity="0.15"
        style={{ '--path-length': '1000px', transitionDelay: '700ms' }}
      />
      {/* Dot highlights on path 1 */}
      <circle cx="450" cy="80" r="3" fill="#C9A84C" fillOpacity="0.6" />
      <circle cx="280" cy="190" r="2" fill="#C9A84C" fillOpacity="0.4" />
      <circle cx="620" cy="40" r="2" fill="#A8C4D4" fillOpacity="0.5" />
    </svg>
  )
}

// ── Value Prop Card ───────────────────────────────────────────────────────────
function ValueCard({ icon, title, desc, delay }) {
  const prefersReduced = useReducedMotion()
  return (
    <motion.div
      initial={prefersReduced ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: prefersReduced ? 0 : delay }}
    >
      <Card hover className="h-full">
        <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center mb-4 text-gold">
          {icon}
        </div>
        <h3 className="text-lg font-syne text-text-main mb-2">{title}</h3>
        <p className="text-sm text-muted leading-relaxed">{desc}</p>
      </Card>
    </motion.div>
  )
}

// ── Methodology Step ──────────────────────────────────────────────────────────
function MethodStep({ num, title, desc, delay }) {
  const prefersReduced = useReducedMotion()
  return (
    <motion.div
      initial={prefersReduced ? false : { opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: prefersReduced ? 0 : delay }}
      className="flex gap-4"
    >
      <div className="shrink-0 w-10 h-10 rounded-full bg-surface border border-gold/30 flex items-center justify-center">
        <span className="font-jetbrains text-sm text-gold">{String(num).padStart(2, '0')}</span>
      </div>
      <div className="pt-1.5">
        <h4 className="font-inter font-medium text-text-main mb-1">{title}</h4>
        <p className="text-sm text-muted leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  )
}

// ── Testimonial ───────────────────────────────────────────────────────────────
function TestimonialCard({ quote, name, role, delay }) {
  const prefersReduced = useReducedMotion()
  return (
    <motion.div
      initial={prefersReduced ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: prefersReduced ? 0 : delay }}
    >
      <Card hover className="h-full">
        <div className="text-gold text-3xl font-syne leading-none mb-4">"</div>
        <p className="text-sm text-muted leading-relaxed mb-6 italic">{quote}</p>
        <div className="flex items-center gap-3 mt-auto">
          <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center">
            <span className="text-xs font-jetbrains text-gold">{name[0]}</span>
          </div>
          <div>
            <p className="text-sm font-medium text-text-main">{name}</p>
            <p className="text-xs text-muted">{role}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

// ── Icons ─────────────────────────────────────────────────────────────────────
const IconStar = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)
const IconZap = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
)
const IconBarChart = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="16"/><line x1="2" y1="20" x2="22" y2="20"/>
  </svg>
)

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Landing() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const prefersReduced = useReducedMotion()

  return (
    <div className="min-h-screen bg-void">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <TrajectoryLines />

        {/* Radial gradient glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(201,168,76,0.07) 0%, transparent 70%)',
          }}
        />

        <div className="relative z-10 text-center max-w-4xl mx-auto px-4 py-24">
          <motion.div
            initial={prefersReduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-gold/10 border border-gold/20 rounded-full text-xs font-jetbrains text-gold mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
              Coaching Executive Platform
            </span>
          </motion.div>

          <motion.h1
            initial={prefersReduced ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-syne text-5xl sm:text-6xl lg:text-7xl text-text-main leading-tight mb-6"
          >
            {t('landing.hero_title').split(' ').map((word, i, arr) => (
              <span key={i}>
                <span className={i === arr.length - 1 ? 'gradient-text' : ''}>{word}</span>
                {i < arr.length - 1 ? ' ' : ''}
              </span>
            ))}
          </motion.h1>

          <motion.p
            initial={prefersReduced ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg text-muted max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            {t('landing.hero_subtitle')}
          </motion.p>

          <motion.div
            initial={prefersReduced ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button size="lg" variant="gold" onClick={() => navigate('/login')}>
              {t('landing.hero_cta')}
            </Button>
            <Button size="lg" variant="outline">
              {t('landing.hero_cta_secondary')}
            </Button>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={prefersReduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap justify-center gap-8 mt-16"
          >
            {[['2,000+', 'Líderes'], ['40+', 'Países'], ['95%', 'Satisfacción']].map(([num, label]) => (
              <div key={label} className="text-center">
                <p className="font-jetbrains text-2xl text-gold">{num}</p>
                <p className="text-xs text-muted mt-1">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── VALUE PROPS ── */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-syne text-3xl sm:text-4xl text-text-main mb-4">{t('landing.value_title')}</h2>
            <div className="w-16 h-0.5 bg-gold mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ValueCard icon={<IconStar />} title={t('landing.value_1_title')} desc={t('landing.value_1_desc')} delay={0} />
            <ValueCard icon={<IconZap />}  title={t('landing.value_2_title')} desc={t('landing.value_2_desc')} delay={0.08} />
            <ValueCard icon={<IconBarChart />} title={t('landing.value_3_title')} desc={t('landing.value_3_desc')} delay={0.16} />
          </div>
        </div>
      </section>

      {/* ── METHODOLOGY ── */}
      <section className="py-24 px-4 bg-surface/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-syne text-3xl sm:text-4xl text-text-main mb-4">{t('landing.method_title')}</h2>
            <div className="w-16 h-0.5 bg-gold mx-auto" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <MethodStep num={1} title={t('landing.method_1_title')} desc={t('landing.method_1_desc')} delay={0} />
            <MethodStep num={2} title={t('landing.method_2_title')} desc={t('landing.method_2_desc')} delay={0.1} />
            <MethodStep num={3} title={t('landing.method_3_title')} desc={t('landing.method_3_desc')} delay={0.2} />
            <MethodStep num={4} title={t('landing.method_4_title')} desc={t('landing.method_4_desc')} delay={0.3} />
          </div>
        </div>
      </section>

      {/* ── MAP ── */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-syne text-3xl sm:text-4xl text-text-main mb-4">{t('landing.map_title')}</h2>
            <p className="text-muted">{t('landing.map_subtitle')}</p>
          </div>
          <CoachMap height="420px" zoom={2} />
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 px-4 bg-surface/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-syne text-3xl sm:text-4xl text-text-main mb-4">{t('landing.testimonials_title')}</h2>
            <div className="w-16 h-0.5 bg-gold mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <TestimonialCard
              quote={t('landing.testimonial_1_quote')}
              name={t('landing.testimonial_1_name')}
              role={t('landing.testimonial_1_role')}
              delay={0}
            />
            <TestimonialCard
              quote={t('landing.testimonial_2_quote')}
              name={t('landing.testimonial_2_name')}
              role={t('landing.testimonial_2_role')}
              delay={0.08}
            />
            <TestimonialCard
              quote={t('landing.testimonial_3_quote')}
              name={t('landing.testimonial_3_name')}
              role={t('landing.testimonial_3_role')}
              delay={0.16}
            />
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={prefersReduced ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-surface border border-gold/20 rounded-2xl p-12"
            style={{ background: 'linear-gradient(135deg, #0F1117 0%, rgba(201,168,76,0.05) 100%)' }}
          >
            <h2 className="font-syne text-3xl sm:text-4xl text-text-main mb-4">{t('landing.cta_title')}</h2>
            <p className="text-muted mb-8">{t('landing.cta_subtitle')}</p>
            <Button size="lg" variant="gold" onClick={() => navigate('/login')}>
              {t('landing.cta_button')}
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
