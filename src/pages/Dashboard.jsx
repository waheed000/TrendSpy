import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  FiPackage, FiBell, FiTrendingUp, FiBarChart2,
  FiMapPin, FiRefreshCw, FiZap,
} from 'react-icons/fi'
import SeasonalBanner from '../components/SeasonalBanner.jsx'
import LocalTrends from './DashboardTabs/LocalTrends.jsx'
import GlobalTrends from './DashboardTabs/GlobalTrends.jsx'
import Opportunities from './DashboardTabs/Opportunities.jsx'
import useStore from '../store/useStore.js'

const TABS = [
  { id: 'local',         label: 'Local Trends',  flag: '🇵🇰' },
  { id: 'global',        label: 'Global Trends', flag: '🌍' },
  { id: 'opportunities', label: 'Opportunities', flag: '⚡' },
]

const STORAGE_KEY = 'trendspy_dashboard_tab'

async function fetchDashboardStats(token) {
  const res  = await fetch('/api/dashboard/stats', {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  const body = await res.json()
  if (!body.success) throw new Error(body.error || 'Failed to load stats')
  return body.data
}

function StatCard({ icon: Icon, label, value, sub, color, bg }) {
  return (
    <div className={`stat-card border ${bg}`}>
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
          <Icon className={color} size={16} />
        </div>
        <span className="text-sm text-gray-400">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white mb-0.5">{value}</p>
      <p className="text-xs text-gray-500">{sub}</p>
    </div>
  )
}

function WinnerRow({ product, rank }) {
  const scoreColor =
    product.winScore >= 75 ? 'text-green-400' :
    product.winScore >= 60 ? 'text-yellow-400' : 'text-gray-400'

  return (
    <div className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
      <span className="text-xs text-gray-600 w-5 text-center flex-shrink-0">#{rank}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white font-medium truncate">{product.name}</p>
        <p className="text-xs text-gray-500">{product.category}</p>
      </div>
      <span className={`text-sm font-bold flex-shrink-0 ${scoreColor}`}>{product.winScore}</span>
    </div>
  )
}

function CategoryBar({ name, count, max }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-400">{name}</span>
        <span className="text-xs text-gray-600">{count} ads</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default function Dashboard() {
  const user       = useStore((s) => s.user)
  const [activeTab, setActiveTab] = useState(
    () => localStorage.getItem(STORAGE_KEY) || 'local'
  )

  const { data: stats, isLoading, isFetching, refetch } = useQuery({
    queryKey:  ['dashboard-stats'],
    queryFn:   () => fetchDashboardStats(user?.token),
    staleTime: 5 * 60 * 1000,
    retry:     1,
  })

  const handleTabChange = (id) => {
    setActiveTab(id)
    localStorage.setItem(STORAGE_KEY, id)
  }

  const topCategory  = stats?.trendingCategories?.[0]?.name || '—'
  const maxCatCount  = stats?.trendingCategories?.[0]?.count || 1

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="section-title">Dashboard</h1>
          <p className="section-subtitle">Pakistan e-commerce intelligence — local, global, and opportunity signals</p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="p-2 bg-white/5 border border-white/10 text-gray-400 hover:text-white rounded-lg transition-all disabled:opacity-50"
          title="Refresh stats"
        >
          <FiRefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
        </button>
      </div>

      <SeasonalBanner />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FiPackage}
          label="Products Tracked"
          value={isLoading ? '—' : (stats?.totalProducts ?? 0).toLocaleString()}
          sub={stats?.totalAds ? `${stats.totalAds} ads in last 7 days` : 'Loading…'}
          color="text-primary-400"
          bg="bg-primary-500/10 border-primary-500/20"
        />
        <StatCard
          icon={FiZap}
          label="Ads Scraped Today"
          value={isLoading ? '—' : (stats?.recentAdsToday ?? 0).toLocaleString()}
          sub="live from Facebook Ad Library"
          color="text-accent-400"
          bg="bg-accent-500/10 border-accent-500/20"
        />
        <StatCard
          icon={FiTrendingUp}
          label="Top Category"
          value={isLoading ? '—' : topCategory}
          sub={stats?.trendingCategories?.[0] ? `${stats.trendingCategories[0].count} ads · ${stats.trendingCategories[0].advertisers} advertisers` : 'Loading…'}
          color="text-green-400"
          bg="bg-green-500/10 border-green-500/20"
        />
        <StatCard
          icon={FiMapPin}
          label="Cities Active"
          value={isLoading ? '—' : (stats?.cityDemand?.length ?? 0).toString()}
          sub={stats?.cityDemand?.[0] ? `Most active: ${stats.cityDemand[0].city}` : 'city-tagged ads'}
          color="text-orange-400"
          bg="bg-orange-500/10 border-orange-500/20"
        />
      </div>

      {/* Winners + Categories + Cities row */}
      {!isLoading && stats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Today's Winners */}
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <FiBarChart2 size={15} className="text-primary-400" />
              <span className="text-sm font-medium text-gray-300">Top Products</span>
              <span className="ml-auto text-[10px] text-gray-600">by Win Score</span>
            </div>
            {stats.topWinners.length > 0 ? (
              stats.topWinners.map((p, i) => (
                <WinnerRow key={p.id} product={p} rank={i + 1} />
              ))
            ) : (
              <p className="text-xs text-gray-600 py-4 text-center">No products yet — scrape ads to detect winners</p>
            )}
          </div>

          {/* Trending Categories */}
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <FiTrendingUp size={15} className="text-green-400" />
              <span className="text-sm font-medium text-gray-300">Trending Categories</span>
              <span className="ml-auto text-[10px] text-gray-600">last 7 days</span>
            </div>
            {stats.trendingCategories.length > 0 ? (
              <div className="space-y-3">
                {stats.trendingCategories.map((c) => (
                  <CategoryBar key={c.name} name={c.name} count={c.count} max={maxCatCount} />
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-600 py-4 text-center">No category data yet</p>
            )}
          </div>

          {/* City Demand */}
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <FiMapPin size={15} className="text-orange-400" />
              <span className="text-sm font-medium text-gray-300">City Demand</span>
              <span className="ml-auto text-[10px] text-gray-600">tagged ads</span>
            </div>
            {stats.cityDemand.length > 0 ? (
              <div className="space-y-2">
                {stats.cityDemand.map((c) => (
                  <div key={c.city} className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{c.city}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-400/60 rounded-full"
                          style={{ width: `${Math.round((c.count / (stats.cityDemand[0]?.count || 1)) * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 w-8 text-right">{c.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-600 py-4 text-center">No city-tagged ads yet</p>
            )}
          </div>
        </div>
      )}

      {/* Tab navigation */}
      <div className="flex items-end gap-1 border-b border-white/10">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium rounded-t-xl transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-primary-600/25 border border-b-0 border-primary-500/40 text-white'
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
            }`}
          >
            <span>{tab.flag}</span>
            {tab.label}
            {activeTab === tab.id && (
              <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-pulse" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="min-h-64">
        {activeTab === 'local'         && <LocalTrends />}
        {activeTab === 'global'        && <GlobalTrends />}
        {activeTab === 'opportunities' && <Opportunities />}
      </div>
    </div>
  )
}
