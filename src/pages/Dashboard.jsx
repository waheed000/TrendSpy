import { useState, useEffect } from 'react'
import { FiPackage, FiBell, FiTrendingUp } from 'react-icons/fi'
import SeasonalBanner from '../components/SeasonalBanner.jsx'
import LocalTrends from './DashboardTabs/LocalTrends.jsx'
import GlobalTrends from './DashboardTabs/GlobalTrends.jsx'
import Opportunities from './DashboardTabs/Opportunities.jsx'
import { useTopProducts } from '../hooks/useProducts.js'

const TABS = [
  { id: 'local',         label: 'Local Trends',  flag: '🇵🇰' },
  { id: 'global',        label: 'Global Trends', flag: '🌍' },
  { id: 'opportunities', label: 'Opportunities', flag: '⚡' },
]

const QUICK_STATS = [
  { icon: FiPackage,    label: 'Products Tracked', value: '12,430', change: '+248 today',         color: 'text-primary-400', bg: 'bg-primary-500/10 border-primary-500/20' },
  { icon: FiBell,       label: 'Hot Alerts Today', value: '47',     change: '+12 in last hour',   color: 'text-accent-400',  bg: 'bg-accent-500/10 border-accent-500/20' },
  { icon: FiTrendingUp, label: 'Top Category',     value: 'Fashion',change: 'Winter wear trending',color: 'text-green-400',  bg: 'bg-green-500/10 border-green-500/20' },
]

const STORAGE_KEY = 'trendspy_dashboard_tab'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState(
    () => localStorage.getItem(STORAGE_KEY) || 'local'
  )

  // Keep local product count stat in sync
  const { data: products } = useTopProducts(10)

  const handleTabChange = (id) => {
    setActiveTab(id)
    localStorage.setItem(STORAGE_KEY, id)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div>
        <h1 className="section-title">Dashboard</h1>
        <p className="section-subtitle">Pakistan e-commerce intelligence — local, global, and opportunity signals</p>
      </div>

      <SeasonalBanner />

      {/* Quick stats */}
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
