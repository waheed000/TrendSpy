import { FiPackage, FiBell, FiTrendingUp, FiRefreshCw } from 'react-icons/fi'
import ProductCard from '../components/ProductCard.jsx'
import SeasonalBanner from '../components/SeasonalBanner.jsx'
import FilterBar from '../components/FilterBar.jsx'
import { useTopProducts } from '../hooks/useProducts.js'
import { CITIES, CATEGORIES } from '../utils/cityList.js'
import useStore from '../store/useStore.js'

const QUICK_STATS = [
  { icon: FiPackage, label: 'Products Tracked', value: '12,430', change: '+248 today', color: 'text-primary-400', bg: 'bg-primary-500/10 border-primary-500/20' },
  { icon: FiBell, label: 'Hot Alerts Today', value: '47', change: '+12 in last hour', color: 'text-accent-400', bg: 'bg-accent-500/10 border-accent-500/20' },
  { icon: FiTrendingUp, label: 'Top Category', value: 'Fashion', change: 'Winter wear trending', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
]

export default function Dashboard() {
  const { data: products, isLoading, refetch } = useTopProducts(10)
  const selectedCity = useStore((s) => s.selectedCity)
  const selectedCategory = useStore((s) => s.selectedCategory)
  const setSelectedCity = useStore((s) => s.setSelectedCity)
  const setSelectedCategory = useStore((s) => s.setSelectedCategory)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="section-title">Dashboard</h1>
          <p className="section-subtitle">Top winning products in Pakistan today</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white border border-white/10 hover:border-white/20 px-3 py-2 rounded-xl transition-all duration-200"
        >
          <FiRefreshCw size={14} />
          Refresh
        </button>
      </div>

      <SeasonalBanner />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {QUICK_STATS.map((s) => (
          <div key={s.label} className={`stat-card border ${s.bg}`}>
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                <s.icon className={s.color} size={16} />
              </div>
              <span className="text-sm text-gray-400">{s.label}</span>
            </div>
            <p className="text-2xl font-bold text-white mb-0.5">{s.value}</p>
            <p className="text-xs text-gray-500">{s.change}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="select-field text-sm py-2 w-auto min-w-32"
        >
          <option value="All">All Cities</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="select-field text-sm py-2 w-auto min-w-36"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <div className="flex items-center gap-2 ml-auto">
          <div className="live-dot" />
          <span className="text-xs text-green-400 font-medium">Live updates active</span>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass-card p-4 h-72 animate-pulse">
              <div className="w-full h-36 bg-white/5 rounded-xl mb-3" />
              <div className="h-4 bg-white/5 rounded w-3/4 mb-2" />
              <div className="h-3 bg-white/5 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products?.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  )
}
