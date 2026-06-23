import { Link } from 'react-router-dom'
import { FiTrendingUp, FiSearch, FiMap, FiArrowRight, FiStar, FiShield, FiZap } from 'react-icons/fi'
import { useState, useEffect } from 'react'

const COUNTERS = [
  { label: 'Products Tracked', value: 12430, suffix: '+' },
  { label: 'Cities Covered', value: 10, suffix: '' },
  { label: 'Active Sellers', value: 3840, suffix: '+' },
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
    icon: FiSearch,
    title: 'Discover Winning Products',
    desc: 'Our AI scans Daraz, OLX, and TikTok Shop 24/7 to surface products with high demand and low competition.',
    color: 'text-primary-400',
    bg: 'bg-primary-500/10 border-primary-500/20',
  },
  {
    icon: FiMap,
    title: 'Explore City Demand',
    desc: 'See exactly which products are hot in Lahore, Karachi, Islamabad and 7 more cities — all on one map.',
    color: 'text-accent-400',
    bg: 'bg-accent-500/10 border-accent-500/20',
  },
  {
    icon: FiTrendingUp,
    title: 'Act Before Competitors',
    desc: 'Get real-time alerts when a product\'s Win Score surges. Be first to stock, first to sell.',
    color: 'text-green-400',
    bg: 'bg-green-500/10 border-green-500/20',
  },
]

const FEATURES = [
  { icon: FiZap, label: 'Real-Time Alerts', desc: 'Telegram & email notifications' },
  { icon: FiStar, label: 'AI Win Score', desc: 'Proprietary scoring algorithm' },
  { icon: FiShield, label: 'Ad Spy', desc: 'See what competitors are running' },
]

export default function Landing() {
  return (
    <div className="min-h-screen gradient-bg">
      <header className="flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">HG</span>
          </div>
          <span className="font-bold text-white text-xl tracking-tight">
            Hunting<span className="gradient-text"> Goals</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-gray-400 hover:text-white text-sm transition-colors">Sign In</Link>
          <Link to="/login" className="btn-primary text-sm py-2 px-5">Get Started Free</Link>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card mb-8 text-sm text-primary-300">
          <div className="live-dot" />
          <span>Tracking 12,430+ products across Pakistan right now</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6 text-balance">
          Find Winning Products
          <br />
          <span className="gradient-text">Before Your Competitors</span>
        </h1>

        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Pakistan's #1 product hunting tool for e-commerce sellers on Daraz, OLX & TikTok. 
          Discover trending products by city with AI-powered Win Scores.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap mb-16">
          <Link
            to="/login"
            className="btn-primary text-base px-8 py-3.5 flex items-center gap-2 shadow-lg shadow-primary-500/25"
          >
            Sign up free
            <FiArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn-secondary text-base px-8 py-3.5">
            Watch demo
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
          {COUNTERS.map((c) => (
            <div key={c.label} className="text-center">
              <div className="text-3xl font-black text-white mb-1">
                <AnimatedCounter target={c.value} suffix={c.suffix} />
              </div>
              <div className="text-xs text-gray-500">{c.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">How Hunting Goals Works</h2>
          <p className="text-gray-400">Three simple steps to find your next winning product</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {HOW_IT_WORKS.map((item, i) => (
            <div key={i} className="glass-card-hover p-6 text-center">
              <div className={`w-14 h-14 rounded-2xl border ${item.bg} flex items-center justify-center mx-auto mb-4`}>
                <item.icon className={item.color} size={24} />
              </div>
              <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 text-xs font-bold text-gray-400">
                {i + 1}
              </div>
              <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="glass-card p-8 md:p-12">
          <div className="grid md:grid-cols-3 gap-8 mb-10">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary-500/20 border border-primary-500/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <f.icon className="text-primary-400" size={18} />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm mb-0.5">{f.label}</h4>
                  <p className="text-gray-500 text-xs">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
              Ready to find your next{' '}
              <span className="gradient-text">winning product?</span>
            </h2>
            <Link
              to="/login"
              className="btn-accent inline-flex items-center gap-2 px-8 py-3.5 text-base"
            >
              Start for Free
              <FiArrowRight size={18} />
            </Link>
            <p className="text-gray-500 text-sm mt-3">No credit card required · Free forever plan</p>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-8 text-center">
        <p className="text-gray-600 text-sm">
          © 2025 Hunting Goals · Pakistan E-Commerce Intelligence Platform
        </p>
      </footer>
    </div>
  )
}
