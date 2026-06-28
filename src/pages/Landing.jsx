import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950/20">

      {/* ── Header ── */}
      <header className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #0f172a, #0d9488)' }}
          >
            <span className="text-white font-bold text-sm">HG</span>
          </div>
          <span className="font-bold text-slate-900 dark:text-white text-xl tracking-tight">
            Hunting<span className="text-teal-600 dark:text-teal-400"> Goals</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-sm font-medium transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center px-5 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md shadow-teal-600/20 transition-all duration-200"
          >
            Get Started Free
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">

        {/* ── Hero ── */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-sm font-medium px-4 py-1.5 rounded-full border border-teal-200 dark:border-teal-800 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
            </span>
            Live — Real Facebook &amp; Instagram Ads
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 dark:text-white leading-[1.1] tracking-tight">
            Find Winning Products{' '}
            <span className="text-teal-600 dark:text-teal-400">Before</span>{' '}
            Your Competitors
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Hunting Goals analyzes real Facebook &amp; Instagram ads to show you exactly what's trending in
            Pakistan — with profit estimates, ad copy, and supplier links.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-lg shadow-teal-600/25 hover:shadow-teal-600/40 transition-all duration-200"
            >
              Get Started Free
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center px-8 py-3.5 text-base font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200"
            >
              How It Works
            </a>
          </div>

          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            🎉 All services are{' '}
            <span className="font-semibold text-teal-600 dark:text-teal-400">completely FREE</span>
            {' '}— no credit card, no limits
          </p>
        </div>

        {/* ── Stats Bar ── */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {[
            { value: '261+', label: 'Live Ads Tracked' },
            { value: '6',    label: 'Categories' },
            { value: '10',   label: 'Cities Covered' },
            { value: '100%', label: 'Free to Use' },
          ].map(({ value, label }) => (
            <div
              key={label}
              className="text-center p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700"
            >
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
            </div>
          ))}
        </div>

        {/* ── How It Works ── */}
        <div id="how-it-works" className="mt-20 scroll-mt-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              How to Find Your Next Winning Product
            </h2>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Three simple steps to start finding winning products today
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: '1',
                icon: '📝',
                title: 'Sign Up Free',
                description: 'Create your account in 30 seconds. No credit card, no commitment — just instant access.',
              },
              {
                step: '2',
                icon: '🔍',
                title: 'Discover Winning Products',
                description: 'Browse real-time winning products from Facebook & Instagram ads. Filter by city, season, or category.',
              },
              {
                step: '3',
                icon: '🚀',
                title: 'Source & Sell',
                description: 'Get AI-powered profit estimates, ready-to-use ad copy, and supplier links — all in one place.',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {item.step}
                  </span>
                  <span className="text-2xl">{item.icon}</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Free Services Banner ── */}
        <div className="mt-12 bg-gradient-to-r from-teal-50/80 to-blue-50/80 dark:from-teal-900/20 dark:to-blue-900/20 border border-teal-200 dark:border-teal-800 rounded-2xl p-6 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <span className="text-3xl">🎉</span>
            <div>
              <p className="text-slate-800 dark:text-slate-200 font-medium">
                All services are currently{' '}
                <span className="text-teal-600 dark:text-teal-400 font-bold">100% FREE</span>
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No limits, no hidden charges. Start finding winning products today.
              </p>
            </div>
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="mt-16 text-center bg-slate-900 dark:bg-slate-800 rounded-3xl p-8 md:p-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Ready to Find Your Next Winning Product?
          </h2>
          <p className="mt-3 text-slate-300 max-w-xl mx-auto">
            Join hundreds of Pakistani sellers using Hunting Goals to stay ahead of the competition.
          </p>
          <Link
            to="/login"
            className="inline-block mt-6 px-8 py-3.5 text-base font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-xl shadow-lg transition-all duration-200"
          >
            Get Started — It's Free
          </Link>
        </div>

      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 text-center">
        <p className="text-slate-400 dark:text-slate-500 text-sm">
          © 2025 Hunting Goals · Pakistan E-Commerce Intelligence Platform
        </p>
      </footer>

    </div>
  )
}
