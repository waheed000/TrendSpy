import { useState } from 'react'
import { FiFilter, FiChevronDown, FiInfo } from 'react-icons/fi'
import ProductCard from '../components/ProductCard.jsx'
import FilterBar from '../components/FilterBar.jsx'
import { useProducts } from '../hooks/useProducts.js'

const SORT_OPTIONS = [
  { value: 'winScore', label: 'Win Score' },
  { value: 'trending', label: 'Trending' },
  { value: 'newest', label: 'Newest' },
  { value: 'adsRunning', label: 'Most Ads' },
]

export default function ProductHunt() {
  const { data: products, isLoading } = useProducts()
  const [sort, setSort] = useState('winScore')
  const [page, setPage] = useState(1)
  const PER_PAGE = 8

  const sorted = [...(products || [])].sort((a, b) => {
    if (sort === 'winScore') return b.winScore - a.winScore
    if (sort === 'trending') return b.trendPct - a.trendPct
    if (sort === 'adsRunning') return b.adsRunning - a.adsRunning
    return b.id - a.id
  })

  const paginated = sorted.slice(0, page * PER_PAGE)
  const hasMore = sorted.length > paginated.length

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title">Product Hunt</h1>
        <p className="section-subtitle">Browse and filter all tracked products across Pakistan</p>
      </div>

      <div className="glass-card p-4 flex flex-wrap items-center justify-between gap-4">
        <FilterBar showScoreFilter />
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Sort by:</span>
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1) }}
            className="select-field text-sm py-2 w-auto min-w-36"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Data quality notice */}
      <div className="flex items-start gap-2.5 bg-blue-500/8 border border-blue-500/20 rounded-xl px-4 py-3">
        <FiInfo size={14} className="text-blue-400 mt-0.5 shrink-0" />
        <p className="text-xs text-gray-400 leading-relaxed">
          <span className="text-blue-400 font-semibold">Trend data is verified</span> via Google Trends Pakistan (updated every 6 hours).
          Order counts, active ads, and TikTok views are <span className="text-gray-300">market estimates</span> — live scraping of Daraz, OLX, and FB Ads is pending due to platform bot protection.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing <span className="text-white font-medium">{paginated.length}</span> of{' '}
          <span className="text-white font-medium">{sorted.length}</span> products
        </p>
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
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginated.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          {paginated.length === 0 && (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-white font-medium mb-1">No products found</p>
              <p className="text-gray-500 text-sm">Try adjusting your filters</p>
            </div>
          )}

          {hasMore && (
            <div className="text-center">
              <button
                onClick={() => setPage((p) => p + 1)}
                className="btn-secondary px-8"
              >
                Load More Products
                <FiChevronDown className="ml-2" size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
