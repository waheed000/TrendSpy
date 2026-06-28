import { Link } from 'react-router-dom'
import { FiArrowRight } from 'react-icons/fi'
import { useState, useEffect } from 'react'

const DEFAULT_COUNTERS = [
  { label: 'Live Ads Tracked', value: 261, suffix: '+' },
  { label: 'Categories Covered', value: 6, suffix: '' },
  { label: 'Pakistani Cities', value: 10, suffix: '' },
]

function AnimatedCounter({ target, suffix }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const duration = 1800
    const steps = 60
    const increment = target / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [target])
  return <span>{count.toLocaleString()}{suffix}</span>
}

const HOW_IT_WORKS = [
  {
    emoji: '📊',
    title: '1. Real Ads Analysis',
    desc: 'We scrape Facebook Ad Library to find products with the most active advertisers right now.',
  },
  {
    emoji: '🏆',
    title: '2. Win Score',
    desc: 'Each product gets a score based on advertiser count, volume, longevity, and estimated spend.',
  },
  {
    emoji: '🚀',
    title: '3. Source & Sell',
    desc: 'Get profit estimates, ad copy, and sourcing links — all ready to go in one dashboard.',
  },
]

const FEATURES = [
  {
    emoji: '🎯',
    title: 'Facebook Ad Intelligence',
    desc: 'See exactly which products competitors are advertising in Pakistan right now.',
  },
  {
    emoji: '💰',
    title: 'Profit Calculator',
    desc: 'Estimate your margin before you invest a single rupee in inventory.',
  },
  {
    emoji: '📢',
    title: 'Ready-to-Use Ad Copy',
    desc: 'Get English and Urdu ad copy that is already proven to convert Pakistani buyers.',
  },
  {
    emoji: '🔗',
    title: 'Direct Sourcing Links',
    desc: 'One-click search on Alibaba, Daraz, and AliExpress to find your supplier fast.',
  },
]

/* Inline SVG grid pattern — encoded for use as a CSS background */
const GRID_SVG = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230d9488' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden gradient-bg">

      {/* ── Background Decorations — light mode only, CSS-only, no images ── */}
      <div className="landing-bg-layer absolute inset-0 pointer-events-none" aria-hidden="true">
        {/* Large gradient blob — top right */}
        <div
          className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(13,148,136,0.10) 0%, rgba(15,23,42,0.04) 60%, transparent 100%)',
            filter: 'blur(60px)',
          }}
        />
        {/* Medium blob — bottom left */}
        <div
          className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(15,23,42,0.05) 0%, rgba(13,148,136,0.04) 60%, transparent 100%)',
            filter: 'blur(60px)',
          }}
        />
        {/* Small accent circle — near hero */}
        <div
          className="absolute top-1/3 left-1/4 w-14 h-14 rounded-full"
          style={{
            background: 'rgba(13,148,136,0.10)',
            filter: 'blur(20px)',
          }}
        />
        {/* Another small accent — lower right */}
        <div
          className="absolute bottom-1/4 right-1/3 w-10 h-10 rounded-full"
          style={{
            background: 'rgba(15,23,42,0.07)',
            filter: 'blur(16px)',
          }}
        />
        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-40"
          style={{ backgroundImage: GRID_SVG, backgroundRepeat: 'repeat' }}
        />
      </div>

      {/* ── All content sits above the background ── */}
      <div className="relative z-10">

        {/* ── Header ── */}
        <header className="flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #0f172a, #0d9488)' }}
            >
              <span className="text-white font-bold text-sm">HG</span>
            </div>
            <span className="font-bold text-white text-xl tracking-tight landing-hero-title">
              Hunting<span className="gradient-text-teal"> Goals</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-gray-400 hover:text-white text-sm transition-colors landing-nav-link"
            >
              Sign In
            </Link>
            <Link to="/login" className="btn-teal text-sm py-2 px-5">
              Get Started Free
            </Link>
          </div>
        </header>

        {/* ── Hero — two-column layout ── */}
        <section className="max-w-7xl mx-auto px-6 pt-12 pb-16">
          <div className="grid md:grid-cols-2 gap-10 items-center">

            {/* Left: text, buttons, counters */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card mb-8 text-sm landing-pill">
                <div className="live-dot" />
                <span>Tracking 261+ live Facebook ads across Pakistan right now</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-black text-white leading-tight mb-6 text-balance landing-hero-title">
                Find Winning Products
                <br />
                <span className="gradient-text-teal">Before Your Competitors</span>
              </h1>

              <p className="text-xl text-gray-400 mb-3 leading-relaxed landing-hero-sub">
                Hunting Goals analyzes Facebook ads in real-time across Pakistan to identify products
                with proven demand. See what's trending, who's selling, and how much they're
                spending — all in one dashboard.
              </p>
              <p className="text-sm text-teal-400 font-medium mb-10">
                Currently FREE for all users — no limits, no credit card required
              </p>

              <div className="flex items-center gap-4 flex-wrap mb-12">
                <Link
                  to="/login"
                  className="btn-teal text-base px-8 py-3.5 flex items-center gap-2"
                  style={{ boxShadow: '0 8px 24px rgba(13,148,136,0.30)' }}
                >
                  Get Started Free
                  <FiArrowRight size={18} />
                </Link>
                <Link to="/login" className="btn-secondary text-base px-8 py-3.5">
                  Watch Demo
                </Link>
              </div>

              {/* Counters */}
              <div className="grid grid-cols-3 gap-6 max-w-sm">
                {DEFAULT_COUNTERS.map((c) => (
                  <div key={c.label} className="text-center">
                    <div className="text-3xl font-black text-white mb-1 landing-counter-val">
                      <AnimatedCounter target={c.value} suffix={c.suffix} />
                    </div>
                    <div className="text-xs text-gray-500 landing-counter-lbl">{c.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: hero image */}
            <div className="relative hidden md:block">
              <div
                className="absolute inset-0 rounded-3xl"
                style={{
                  background: 'radial-gradient(circle at 60% 40%, rgba(13,148,136,0.15) 0%, transparent 70%)',
                  filter: 'blur(30px)',
                }}
                aria-hidden="true"
              />
              <img
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600"
                alt="E-commerce product hunting dashboard"
                className="relative rounded-3xl w-full object-cover shadow-2xl"
                style={{
                  border: '1px solid rgba(255,255,255,0.08)',
                  maxHeight: '480px',
                }}
                loading="eager"
              />
              {/* Top-right badge */}
              <div
                className="absolute -top-4 -right-4 glass-card px-3 py-2 flex items-center gap-2"
                style={{ backdropFilter: 'blur(12px)' }}
              >
                <div className="live-dot" />
                <span className="text-white text-xs font-medium landing-hero-title">Live Data</span>
              </div>
            </div>

          </div>
        </section>

        {/* ── Welcome Tour Guide ── */}
        <section className="max-w-7xl mx-auto px-6 pb-4">
          <div className="bg-gradient-to-r from-teal-900/30 to-blue-900/30 border border-teal-700/40 rounded-2xl p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="text-4xl flex-shrink-0">🎯</div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-white mb-2">
                  Welcome to Hunting Goals — Your Winning Product Finder
                </h3>
                <p className="text-gray-400 mb-6">
                  Here's how to find your next winning product in 3 simple steps:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      step: 1,
                      title: 'Sign Up',
                      desc: 'Create your free account in 30 seconds. No credit card required.',
                    },
                    {
                      step: 2,
                      title: 'Discover Products',
                      desc: 'Browse winning products from real Facebook & Instagram ads. Filter by city, season, or category.',
                    },
                    {
                      step: 3,
                      title: 'Source & Sell',
                      desc: 'Get AI-powered profit estimates, ad copy, and supplier links — all in one place.',
                    },
                  ].map(({ step, title, desc }) => (
                    <div
                      key={step}
                      className="glass-card rounded-xl p-4 border border-white/10"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold text-teal-300 bg-teal-900/50 flex-shrink-0">
                          {step}
                        </span>
                        <span className="font-semibold text-white">{title}</span>
                      </div>
                      <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Free Services Banner ── */}
        <section className="max-w-7xl mx-auto px-6 py-6">
          <div className="bg-gradient-to-r from-amber-900/25 to-orange-900/25 border border-amber-700/40 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <span className="text-2xl">🎉</span>
              <span className="text-gray-200 font-medium">
                All services are currently{' '}
                <strong className="text-teal-400">FREE</strong> to use!
              </span>
              <span className="text-sm text-gray-400">
                No limits, no hidden charges. Start finding winning products today.
              </span>
            </div>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3 landing-section-head">
              How Hunting Goals Works
            </h2>
            <p className="text-gray-400 landing-section-sub">
              Three simple steps from discovery to profit
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((item, i) => (
              <div key={i} className="card-premium glass-card-hover p-6 text-center">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 landing-step-icon-bg"
                  style={{ background: 'rgba(13,148,136,0.12)' }}
                >
                  <span className="text-2xl">{item.emoji}</span>
                </div>
                <h3 className="text-white font-bold text-lg mb-2 landing-step-title">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed landing-step-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Features Grid ── */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3 landing-section-head">
              Everything You Need to Win
            </h2>
            <p className="text-gray-400 landing-section-sub">
              Built specifically for Pakistani e-commerce sellers
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURES.map((f, i) => (
              <div key={i} className="card-premium landing-feature-card glass-card-hover p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{f.emoji}</span>
                  <h4 className="font-semibold text-white landing-feat-title">{f.title}</h4>
                </div>
                <p className="text-gray-400 text-sm landing-feat-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Testimonial ── */}
        <section className="max-w-7xl mx-auto px-6 py-10">
          <div className="card-premium landing-testimonial-card glass-card text-center">
            <p className="text-gray-400 italic text-base leading-relaxed landing-quote-text">
              "I found my best-selling product using Hunting Goals. The ad data helped me make
              a confident decision without guessing."
            </p>
            <p className="text-white font-semibold mt-4 landing-quote-author">
              — Seller from Lahore
            </p>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="card-premium glass-card p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 landing-cta-title">
              Ready to Find Your Next{' '}
              <span className="gradient-text-teal">Winning Product?</span>
            </h2>
            <p className="text-gray-400 mb-8 landing-cta-sub">
              Join hundreds of Pakistani sellers using Hunting Goals to stay ahead of the competition.
            </p>
            <Link
              to="/login"
              className="btn-teal inline-flex items-center gap-2 px-8 py-3.5 text-base"
              style={{ boxShadow: '0 8px 24px rgba(13,148,136,0.30)' }}
            >
              Get Started Free
              <FiArrowRight size={18} />
            </Link>
            <p className="text-gray-500 text-sm mt-3 landing-cta-sub">
              No credit card required · Free forever plan
            </p>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="border-t border-white/10 py-8 text-center">
          <p className="text-gray-600 text-sm landing-footer-text">
            © 2025 Hunting Goals · Pakistan E-Commerce Intelligence Platform
          </p>
        </footer>

      </div>
    </div>
  )
}
