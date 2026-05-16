import { useState, useEffect } from 'react'
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns'
import ProductCard from '../components/ProductCard.jsx'
import { MOCK_PRODUCTS } from '../api/products.js'
import { FiChevronDown, FiChevronUp, FiCalendar, FiClock } from 'react-icons/fi'

const SEASONS = [
  {
    id: 'ramadan',
    name: 'Ramadan',
    emoji: '🌙',
    date: new Date('2026-02-18'),
    color: 'from-primary-600/30 to-purple-900/20 border-primary-500/30',
    icon: '🌙',
    products: [2, 11, 4],
    lastYear: [2, 4, 11],
    description: 'Highest sales season. Demand spikes for food items, modest fashion, home decor.',
  },
  {
    id: 'eid-fitr',
    name: 'Eid ul Fitr',
    emoji: '🎉',
    date: new Date('2026-03-20'),
    color: 'from-green-600/30 to-emerald-900/20 border-green-500/30',
    icon: '🎉',
    products: [2, 7, 11],
    lastYear: [2, 11, 7],
    description: 'Fashion and gifting season. Khaddar, formal wear, cosmetics top sellers.',
  },
  {
    id: 'eid-adha',
    name: 'Eid ul Adha',
    emoji: '🐑',
    date: new Date('2025-06-06'),
    color: 'from-yellow-600/30 to-orange-900/20 border-yellow-500/30',
    icon: '🐑',
    products: [2, 6, 9],
    lastYear: [2, 6, 9],
    description: 'Big spending on meat, appliances, and modest fashion.',
  },
  {
    id: 'wedding',
    name: 'Wedding Season',
    emoji: '💍',
    date: new Date('2025-10-15'),
    color: 'from-pink-600/30 to-rose-900/20 border-pink-500/30',
    icon: '💍',
    products: [11, 2, 4],
    lastYear: [11, 4, 2],
    description: 'Oct–Dec, Feb–Apr. Jewelry, bridal suits, decor drive massive sales.',
  },
  {
    id: 'back-to-school',
    name: 'Back to School',
    emoji: '📚',
    date: new Date('2025-08-25'),
    color: 'from-blue-600/30 to-sky-900/20 border-blue-500/30',
    icon: '📚',
    products: [10, 9, 5],
    lastYear: [10, 9, 5],
    description: 'Aug–Sep. Bags, stationery, footwear, and electronics for students.',
  },
  {
    id: 'winter',
    name: 'Winter Season',
    emoji: '❄️',
    date: new Date('2025-11-01'),
    color: 'from-cyan-600/30 to-blue-900/20 border-cyan-500/30',
    icon: '❄️',
    products: [1, 7, 2],
    lastYear: [1, 7, 2],
    description: 'Nov–Feb. Heaters, blankets, warm clothing dominate all platforms.',
  },
]

function useCountdown(targetDate) {
  const [timeLeft, setTimeLeft] = useState({})

  useEffect(() => {
    const calc = () => {
      const now = new Date()
      const total = Math.max(0, targetDate - now)
      const days = Math.floor(total / (1000 * 60 * 60 * 24))
      const hours = Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((total % (1000 * 60)) / 1000)
      setTimeLeft({ days, hours, minutes, seconds })
    }
    calc()
    const t = setInterval(calc, 1000)
    return () => clearInterval(t)
  }, [targetDate])

  return timeLeft
}

function CountdownUnit({ value, label }) {
  return (
    <div className="text-center">
      <div className="w-14 h-14 glass-card flex items-center justify-center text-2xl font-black text-white">
        {String(value).padStart(2, '0')}
      </div>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  )
}

function SeasonCard({ season }) {
  const [expanded, setExpanded] = useState(false)
  const daysLeft = differenceInDays(season.date, new Date())
  const isSoon = daysLeft <= 30
  const products = MOCK_PRODUCTS.filter((p) => season.products.includes(p.id))
  const lastYearProducts = MOCK_PRODUCTS.filter((p) => season.lastYear.includes(p.id))

  return (
    <div className={`glass-card p-5 bg-gradient-to-br ${season.color}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{season.emoji}</span>
          <div>
            <h3 className="text-base font-bold text-white">{season.name}</h3>
            <p className="text-xs text-gray-400">{season.description}</p>
          </div>
        </div>
        <div className="text-right flex-shrink-0 ml-3">
          <p className="text-2xl font-black text-white">{daysLeft > 0 ? daysLeft : 0}</p>
          <p className="text-xs text-gray-500">days away</p>
        </div>
      </div>

      {isSoon && (
        <div className="flex items-center gap-1.5 text-xs text-accent-400 mb-3">
          <FiClock size={12} />
          <span className="font-medium">Stock up now — {daysLeft} days to go!</span>
        </div>
      )}

      <div className="mb-3">
        <p className="text-xs text-gray-500 mb-2">Products to stock now:</p>
        <div className="grid grid-cols-1 gap-2">
          {products.slice(0, 2).map((p) => (
            <div key={p.id} className="flex items-center justify-between py-1.5 px-3 bg-white/5 rounded-lg">
              <span className="text-xs text-gray-300 truncate">{p.name}</span>
              <span className={`text-xs font-bold ml-2 ${p.winScore >= 75 ? 'text-green-400' : p.winScore >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                {p.winScore}
              </span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-1.5 text-xs text-gray-500 hover:text-white py-1.5 hover:bg-white/5 rounded-lg transition-all duration-200"
      >
        {expanded ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
        {expanded ? 'Hide' : 'Show'} last year's winners
      </button>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <p className="text-xs text-gray-500 mb-2">Last year's top performers:</p>
          {lastYearProducts.map((p) => (
            <div key={p.id} className="flex items-center justify-between py-1 px-2 text-xs">
              <span className="text-gray-400 truncate">{p.name}</span>
              <span className="text-gray-500 ml-2">{p.priceMin.toLocaleString()} – {p.priceMax.toLocaleString()} PKR</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Seasonal() {
  const nextSeason = SEASONS.filter((s) => s.date > new Date()).sort((a, b) => a.date - b.date)[0] || SEASONS[0]
  const countdown = useCountdown(nextSeason.date)

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title">Seasonal Planner</h1>
        <p className="section-subtitle">Pakistan's e-commerce seasonal calendar & product recommendations</p>
      </div>

      <div className={`glass-card p-6 bg-gradient-to-br ${nextSeason.color}`}>
        <div className="flex items-center gap-3 mb-5">
          <span className="text-4xl">{nextSeason.emoji}</span>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Next Major Season</p>
            <h2 className="text-2xl font-bold text-white">{nextSeason.name}</h2>
            <p className="text-sm text-gray-400">{nextSeason.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <CountdownUnit value={countdown.days || 0} label="Days" />
          <span className="text-white text-2xl font-bold mb-4">:</span>
          <CountdownUnit value={countdown.hours || 0} label="Hours" />
          <span className="text-white text-2xl font-bold mb-4">:</span>
          <CountdownUnit value={countdown.minutes || 0} label="Mins" />
          <span className="text-white text-2xl font-bold mb-4">:</span>
          <CountdownUnit value={countdown.seconds || 0} label="Secs" />
        </div>
      </div>

      <div>
        <h3 className="text-base font-semibold text-white mb-4">
          Pre-Season Products to Stock Now
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_PRODUCTS.filter((p) => nextSeason.products.includes(p.id)).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-base font-semibold text-white mb-4">
          Pakistan Seasonal Calendar
        </h3>
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {SEASONS.map((season) => (
            <SeasonCard key={season.id} season={season} />
          ))}
        </div>
      </div>
    </div>
  )
}
