import { useEffect, useState, useCallback } from 'react'
import { FiX, FiTrendingUp, FiTrendingDown, FiMinus, FiExternalLink } from 'react-icons/fi'
import useStore from '../store/useStore.js'

// ── Signal config ─────────────────────────────────────────────────────────────

const SIGNAL_META = {
  daraz:    { label: 'Daraz Sales',    bar: 'bg-orange-500', ring: 'border-orange-500/40',  text: 'text-orange-400'  },
  olx:      { label: 'OLX Demand',    bar: 'bg-teal-500',   ring: 'border-teal-500/40',    text: 'text-teal-400'    },
  tiktok:   { label: 'TikTok Reach',  bar: 'bg-pink-500',   ring: 'border-pink-500/40',    text: 'text-pink-400'    },
  google:   { label: 'Google Trends', bar: 'bg-blue-500',   ring: 'border-blue-500/40',    text: 'text-blue-400'    },
  seasonal: { label: 'Seasonal Fit',  bar: 'bg-green-500',  ring: 'border-green-500/40',   text: 'text-green-400'   },
}

const EXTRA_META = {
  facebookAds: { label: 'Facebook Ads',  dot: 'bg-indigo-400' },
  alibaba:     { label: 'Alibaba Surge', dot: 'bg-yellow-400' },
}

const ICON_MAP = {
  daraz:    '🛍️',
  olx:      '🏷️',
  tiktok:   '🎵',
  google:   '📈',
  seasonal: '📅',
}

// ── Gauge SVG (arc from 225° to 315° = 270° sweep) ───────────────────────────

function ScoreGauge({ score }) {
  const R = 52
  const C = 2 * Math.PI * R
  const arcLen   = C * 0.75              // 270° of the full circle
  const gapLen   = C - arcLen
  const fillLen  = arcLen * (score / 100)
  const emptyLen = arcLen - fillLen

  const color =
    score >= 75 ? '#22c55e' :
    score >= 60 ? '#f59e0b' :
    score >= 40 ? '#f97316' :
                  '#ef4444'

  return (
    <div className="relative flex items-center justify-center w-36 h-36">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-[135deg]">
        {/* track */}
        <circle cx="60" cy="60" r={R} fill="none" stroke="rgba(255,255,255,0.06)"
          strokeWidth="10" strokeDasharray={`${arcLen} ${gapLen}`} strokeLinecap="round" />
        {/* fill */}
        <circle cx="60" cy="60" r={R} fill="none" stroke={color}
          strokeWidth="10"
          strokeDasharray={`${fillLen} ${emptyLen + gapLen}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.8s ease' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-white leading-none">{score}</span>
        <span className="text-xs text-gray-500 mt-0.5">/ 100</span>
      </div>
    </div>
  )
}

// ── Signal row ────────────────────────────────────────────────────────────────

function SignalRow({ sigKey, item }) {
  const meta = SIGNAL_META[sigKey] || {}
  return (
    <div className="flex items-start gap-3">
      <span className="w-5 text-base flex-shrink-0 mt-0.5">{ICON_MAP[sigKey]}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5 gap-2">
          <span className="text-xs font-medium text-gray-300">{meta.label}</span>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className={`text-xs font-bold ${meta.text}`}>
              {item.pts}<span className="text-gray-600 font-normal">/{item.weight}</span>
            </span>
          </div>
        </div>
        <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className={`h-full ${meta.bar} rounded-full transition-all duration-700`}
            style={{ width: `${item.score}%` }}
          />
        </div>
        <p className="text-[11px] text-gray-600 mt-1 truncate">{item.source}</p>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function WinScoreDetails({ product, onClose }) {
  const token = useStore((s) => s.user?.token)
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const fetchScore = useCallback(async () => {
    if (!product?.slug) { setLoading(false); return }
    setLoading(true)
    setError(null)
    try {
      const headers = {}
      if (token) headers['Authorization'] = `Bearer ${token}`
      const res    = await fetch(`/api/products/${product.slug}/score`, { headers })
      const result = await res.json()
      if (!result.success) throw new Error(result.error || 'Failed to load score')
      setData(result.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [product?.slug, token])

  useEffect(() => { fetchScore() }, [fetchScore])

  // Close on backdrop click
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const scoreLabel =
    !data ? null :
    data.totalScore >= 75 ? { text: 'Winning Product',  cls: 'text-green-400  bg-green-500/10  border-green-500/20'  } :
    data.totalScore >= 60 ? { text: 'Promising',         cls: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' } :
    data.totalScore >= 40 ? { text: 'Monitor Closely',   cls: 'text-orange-400 bg-orange-500/10 border-orange-500/20' } :
                            { text: 'Weak Signals',       cls: 'text-red-400    bg-red-500/10    border-red-500/20'    }

  const TrendIcon =
    data?.trend === 'rising'  ? FiTrendingUp   :
    data?.trend === 'falling' ? FiTrendingDown :
    FiMinus

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={handleBackdrop}
    >
      <div className="relative w-full max-w-lg bg-[#0d0d1a] border border-white/10 rounded-2xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-fade-in">

        {/* Header */}
        <div className="flex items-start justify-between gap-3 p-5 border-b border-white/[0.07]">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-white leading-tight line-clamp-2">
              {product?.name || 'Win Score Breakdown'}
            </h2>
            {data && (
              <p className="text-xs text-gray-500 mt-0.5">{data.category}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 w-7 h-7 flex items-center justify-center text-gray-500 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all"
          >
            <FiX size={14} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500">Calculating score...</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="p-6 text-center">
              <p className="text-sm text-red-400 mb-3">{error}</p>
              <button
                onClick={fetchScore}
                className="text-xs text-primary-400 hover:underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* Content */}
          {!loading && data && (
            <>
              {/* Score gauge */}
              <div className="flex flex-col items-center gap-3 py-6 border-b border-white/[0.07]">
                <ScoreGauge score={data.totalScore} />
                <div className="text-center space-y-2">
                  <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full border ${scoreLabel.cls}`}>
                    {scoreLabel.text}
                  </span>
                  <p className="text-xs text-gray-500 px-6 leading-relaxed">{data.recommendation}</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <TrendIcon size={11} className={
                      data.trend === 'rising'  ? 'text-green-500' :
                      data.trend === 'falling' ? 'text-red-500'   : 'text-gray-500'
                    } />
                    {data.trend}
                  </span>
                  {data.competitorCount > 0 && (
                    <>
                      <span>·</span>
                      <span>{data.competitorCount} competitor ads this week</span>
                    </>
                  )}
                  {data.lastScrapedAt && (
                    <>
                      <span>·</span>
                      <span>Updated {new Date(data.lastScrapedAt).toLocaleDateString('en-PK')}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Signal breakdown */}
              <div className="p-5 space-y-1 border-b border-white/[0.07]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FiTrendingUp className="text-primary-400" size={14} />
                    <span className="text-xs font-semibold text-gray-300 uppercase tracking-wide">Score Signals</span>
                  </div>
                  <span className="text-[11px] text-gray-600">pts / weight</span>
                </div>
                <div className="space-y-4">
                  {Object.entries(data.breakdown).map(([key, item]) => (
                    <SignalRow key={key} sigKey={key} item={item} />
                  ))}
                </div>
              </div>

              {/* Extra context */}
              {data.extras && (
                <div className="p-5">
                  <p className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide mb-3">
                    Additional Context
                  </p>
                  <div className="space-y-2">
                    {Object.entries(data.extras).map(([key, item]) => {
                      const meta = EXTRA_META[key] || {}
                      return (
                        <div key={key} className="flex items-center gap-2.5">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${meta.dot}`} />
                          <span className="text-xs text-gray-500 font-medium w-24 flex-shrink-0">{meta.label}</span>
                          <span className="text-xs text-gray-600 truncate">{item.source}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.07] flex items-center justify-between gap-3">
          <p className="text-[11px] text-gray-700 leading-tight">
            Score calculated from real DB signals in real time.
          </p>
          <button
            onClick={onClose}
            className="flex-shrink-0 px-4 py-1.5 text-xs font-medium text-gray-400 bg-white/5 border border-white/10 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
