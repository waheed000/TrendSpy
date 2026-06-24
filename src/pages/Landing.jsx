import { Link } from 'react-router-dom'
import { FiArrowRight } from 'react-icons/fi'
import { useState, useEffect } from 'react'

const COUNTERS = [
  { label: 'Live Ads Tracked', value: 230, suffix: '+' },
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

export default function Landing() {
  return (
    <div className="min-h-screen gradient-bg">
      {/* ── Header ── */}
      <header className="flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1e3a5f, #0d9488)' }}>
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
          <Link
            to="/login"
            className="btn-teal text-sm py-2 px-5"
          >
            Get Started Free
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card mb-8 text-sm landing-pill">
          <div className="live-dot" />
          <span>Tracking 230+ live Facebook ads across Pakistan right now</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6 text-balance landing-hero-title">
          Find Winning Products
          <br />
          <span className="gradient-text-teal">Before Your Competitors</span>
        </h1>

        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed landing-hero-sub">
          Hunting Goals analyzes Facebook ads in real-time across Pakistan to identify products
          with proven demand. See what's trending, who's selling, and how much they're
          spending — all in one dashboard.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap mb-16">
          <Link
            to="/login"
            className="btn-teal text-base px-8 py-3.5 flex items-center gap-2 shadow-lg"
            style={{ boxShadow: '0 8px 24px rgba(13,148,136,0.30)' }}
          >
            Get Started Free
            <FiArrowRight size={18} />
          </Link>
          <Link
            to="/login"
            className="btn-secondary text-base px-8 py-3.5"
          >
            Watch Demo
          </Link>
        </div>

        {/* Counters */}
        <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
          {COUNTERS.map((c) => (
            <div key={c.label} className="text-center">
              <div className="text-3xl font-black text-white mb-1 landing-counter-val">
                <AnimatedCounter target={c.value} suffix={c.suffix} />
              </div>
              <div className="text-xs text-gray-500 landing-counter-lbl">{c.label}</div>
            </div>
          ))}
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
            <div key={i} className="glass-card-hover p-6 text-center">
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
            <div key={i} className="landing-feature-card glass-card-hover p-6">
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
        <div className="landing-testimonial-card glass-card text-center">
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
        <div className="glass-card p-8 md:p-12 text-center">
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
  )
}
