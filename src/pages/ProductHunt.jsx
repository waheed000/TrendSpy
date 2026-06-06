import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FiFilter, FiChevronDown, FiInfo, FiZap, FiDatabase, FiRefreshCw, FiMapPin } from 'react-icons/fi'
import ProductCard from '../components/ProductCard.jsx'
import AdWinnerCard from '../components/AdWinnerCard.jsx'
import FilterBar from '../components/FilterBar.jsx'
import { useProducts } from '../hooks/useProducts.js'

const SORT_OPTIONS = [
  { value: 'winScore',   label: 'Win Score'  },
  { value: 'trending',   label: 'Trending'   },
  { value: 'newest',     label: 'Newest'     },
  { value: 'adsRunning', label: 'Most Ads'   },
]

const CITIES = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad',
  'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala',
]

// ── Fetch ad-based winners ────────────────────────────────────────────────────

async function fetchAdWinners(city, bust) {
  const params = new URLSearchParams({ limit: '20' })
  if (city) params.set('city', city)
  if (bust) params.set('bust', '1')
  const res  = await fetch(`/api/products/winning?${params}`)
  const body = await res.json()
  if (!body.success) throw new Error(body.error || 'Failed to load ad winners')
  return body.data
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function AdStatsBanner({ stats, cityCoverage, selectedCity, lastUpdated, isFetching, onRefresh }) {
  if (!stats) return null
  const updated = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })
    : null
  const cityAdCount = selectedCity && cityCoverage ? cityCoverage[selectedCity] : null

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 bg-blue-500/8 border border-blue-500/20 rounded-xl">
      <div className="flex items-center gap-1.5">
        <FiZap size={13} className="text-blue-400" />
        <span className="text-xs text-blue-300 font-semibold">Live FB Ads Intelligence</span>
      </div>
      <span className="text-[11px] text-gray-500">{stats.totalAds} ads</span>
      <span className="text-[11px] text-gray-500">{stats.uniqueAdvertisers} advertisers</span>
      <span className="text-[11px] text-gray-500">{stats.categories} categories</span>
      {stats.maxDaysRunning > 0 && (
        <span className="text-[11px] text-gray-500">up to {stats.maxDaysRunning}d running</span>
      )}
      {selectedCity && (
        <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${
          cityAdCount
            ? 'text-green-400 bg-green-500/10'
            : 'text-yellow-400 bg-yellow-500/10'
        }`}>
          {cityAdCount
            ? `${cityAdCount} ads tagged ${selectedCity}`
            : `No city-tagged ads yet for ${selectedCity}`}
        </span>
      )}
      <div className="ml-auto flex items-center gap-2">
        {updated && <span className="text-[11px] text-gray-600">Updated {updated}</span>}
        <button
          onClick={onRefresh}
          disabled={isFetching}
          className="p-1.5 text-gray-500 hover:text-white bg-white/5 rounded-lg transition-all disabled:opacity-40"
          title="Refresh (bypasses 30-min cache)"
        >
          <FiRefreshCw size={11} className={isFetching ? 'animate-spin' : ''} />
        </button>
      </div>
    </div>
  )
}

function NoAdsState({ city }) {
  return (
    <div className="text-center py-16 glass-card">
      <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <FiZap className="text-blue-400/50" size={24} />
      </div>
      {city ? (
        <>
          <p className="text-white font-medium mb-1">No city-tagged ads for {city}</p>
          <p className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed">
            Only ads that explicitly mention <span className="text-gray-300">{city}</span> in their headline
            or advertiser name appear here. Try <span className="text-gray-300">All Cities</span> to see all ad data.
          </p>
        </>
      ) : (
        <>
          <p className="text-white font-medium mb-1">No ad data yet</p>
          <p className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed">
            Go to <span className="text-gray-300">Ad Spy</span> and click{' '}
            <span className="text-primary-400 font-medium">Scrape Now</span> to pull live
            Facebook ads — results appear here automatically.
          </p>
        </>
      )}
    </div>
  )
}

// ── City dropdown ─────────────────────────────────────────────────────────────

function CityDropdown({ value, onChange, cityCoverage }) {
  return (
    <div className="flex items-center gap-2">
      <FiMapPin size={13} className="text-gray-500 flex-shrink-0" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="select-field text-sm py-2 w-auto min-w-40"
      >
        <option value="">All Cities</option>
        {CITIES.map((c) => {
          const count = cityCoverage?.[c]
          return (
            <option key={c} value={c}>
              {c}{count ? ` (${count})` : ''}
            </option>
          )
        })}
      </select>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProductHunt() {
  const [dataSource,   setDataSource]   = useState('ads')
  const [sort,         setSort]         = useState('winScore')
  const [page,         setPage]         = useState(1)
  const [selectedCity, setSelectedCity] = useState('')
  const [bustKey,      setBustKey]      = useState(0)
  const PER_PAGE = 8

  // ── Scraper-based products ─────────────────────────────────────────────────
  const { data: scraperProducts = [], isLoading: scraperLoading } = useProducts()

  // ── Ad-based winners ───────────────────────────────────────────────────────
  const {
    data:       adsData,
    isLoading:  adsLoading,
    isFetching: adsFetching,
    refetch:    refetchAds,
  } = useQuery({
    queryKey:  ['adWinners', selectedCity, bustKey],
    queryFn:   () => fetchAdWinners(selectedCity, bustKey > 0),
    staleTime: 30 * 60 * 1000,
    retry:     1,
    enabled:   dataSource === 'ads',
  })

  const handleRefresh = () => {
    setBustKey((k) => k + 1)
  }

  const handleCityChange = (city) => {
    setSelectedCity(city)
    setPage(1)
  }

  const switchSource = (src) => {
    setDataSource(src)
    setPage(1)
  }

  // ── Sorted scraper products ────────────────────────────────────────────────
  const sorted = [...scraperProducts].sort((a, b) => {
    if (sort === 'winScore')   return b.winScore   - a.winScore
    if (sort === 'trending')   return b.trendPct   - a.trendPct
    if (sort === 'adsRunning') return b.adsRunning  - a.adsRunning
    return b.id - a.id
  })

  const isLoading = dataSource === 'ads' ? adsLoading : scraperLoading
  const adWinners = adsData?.products || []

  const displayList = dataSource === 'ads'
    ? adWinners.slice(0, page * PER_PAGE)
    : sorted.slice(0, page * PER_PAGE)

  const totalCount = dataSource === 'ads' ? adWinners.length : sorted.length
  const hasMore    = totalCount > displayList.length

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title">Product Hunt</h1>
        <p className="section-subtitle">
          {dataSource === 'ads'
            ? 'Winning products detected from live Facebook Ad Library data'
            : 'Browse and filter all tracked products across Pakistan'}
        </p>
      </div>

      {/* Source toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => switchSource('ads')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
            dataSource === 'ads'
              ? 'bg-primary-600/25 border-primary-500/40 text-primary-300'
              : 'bg-white/[0.04] border-white/10 text-gray-400 hover:text-gray-200 hover:bg-white/[0.07]'
          }`}
        >
          <FiZap size={13} />
          Real Ads Today
        </button>
        <button
          onClick={() => switchSource('scraper')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
            dataSource === 'scraper'
              ? 'bg-primary-600/25 border-primary-500/40 text-primary-300'
              : 'bg-white/[0.04] border-white/10 text-gray-400 hover:text-gray-200 hover:bg-white/[0.07]'
          }`}
        >
          <FiDatabase size={13} />
          Scraper Data
        </button>
      </div>

      {/* Controls row */}
      {dataSource === 'scraper' && (
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
      )}

      {/* Ads mode controls — city filter + stats banner */}
      {dataSource === 'ads' && (
        <>
          <div className="glass-card p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Filter by city:</span>
              <CityDropdown
                value={selectedCity}
                onChange={handleCityChange}
                cityCoverage={adsData?.cityCoverage}
              />
            </div>
            {selectedCity && (
              <button
                onClick={() => handleCityChange('')}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                Clear filter
              </button>
            )}
          </div>

          <AdStatsBanner
            stats={adsData?.stats}
            cityCoverage={adsData?.cityCoverage}
            selectedCity={selectedCity}
            lastUpdated={adsData?.lastUpdated}
            isFetching={adsFetching}
            onRefresh={handleRefresh}
          />
        </>
      )}

      {/* Data quality notice (scraper mode) */}
      {dataSource === 'scraper' && (
        <div className="flex items-start gap-2.5 bg-blue-500/8 border border-blue-500/20 rounded-xl px-4 py-3">
          <FiInfo size={14} className="text-blue-400 mt-0.5 shrink-0" />
          <p className="text-xs text-gray-400 leading-relaxed">
            <span className="text-blue-400 font-semibold">Trend data is verified</span> via Google Trends Pakistan
            (updated every 6 hours). Order counts, active ads, and TikTok views are{' '}
            <span className="text-gray-300">market estimates</span> — switch to{' '}
            <button onClick={() => switchSource('ads')} className="text-primary-400 hover:underline font-medium">
              Real Ads Today
            </button>{' '}
            for live Facebook signal data.
          </p>
        </div>
      )}

      {/* Count */}
      {!isLoading && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing{' '}
            <span className="text-white font-medium">{displayList.length}</span> of{' '}
            <span className="text-white font-medium">{totalCount}</span>{' '}
            {dataSource === 'ads' ? (
              selectedCity
                ? <span>categories with ads in <span className="text-white">{selectedCity}</span></span>
                : 'ad-detected categories'
            ) : 'products'}
          </p>
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass-card p-4 h-72 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-white/5 rounded-xl" />
                <div className="flex-1">
                  <div className="h-4 bg-white/5 rounded w-3/4 mb-1.5" />
                  <div className="h-3 bg-white/5 rounded w-1/3" />
                </div>
                <div className="w-9 h-6 bg-white/5 rounded-lg" />
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[0, 1, 2].map((j) => <div key={j} className="h-14 bg-white/5 rounded-lg" />)}
              </div>
              <div className="h-8 bg-white/5 rounded-lg" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {dataSource === 'ads' && adWinners.length === 0 ? (
            <NoAdsState city={selectedCity} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayList.map((p) =>
                dataSource === 'ads'
                  ? <AdWinnerCard key={p.id} product={p} />
                  : <ProductCard  key={p.id} product={p} />
              )}
            </div>
          )}

          {dataSource === 'scraper' && displayList.length === 0 && (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-white font-medium mb-1">No products found</p>
              <p className="text-gray-500 text-sm">Try adjusting your filters</p>
            </div>
          )}

          {hasMore && (
            <div className="text-center">
              <button onClick={() => setPage((p) => p + 1)} className="btn-secondary px-8">
                Load More
                <FiChevronDown className="ml-2" size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
