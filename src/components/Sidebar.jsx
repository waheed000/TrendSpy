import { NavLink } from 'react-router-dom'
import {
  FiGrid,
  FiSearch,
  FiMap,
  FiTrendingUp,
  FiEye,
  FiCpu,
  FiBell,
  FiSun,
  FiActivity,
} from 'react-icons/fi'

const NAV_ITEMS = [
  { to: '/dashboard', icon: FiGrid, label: 'Dashboard' },
  { to: '/products', icon: FiSearch, label: 'Product Hunt' },
  { to: '/city-explorer', icon: FiMap, label: 'City Explorer' },
  { to: '/trends', icon: FiTrendingUp, label: 'Trends' },
  { to: '/ad-spy', icon: FiEye, label: 'Ad Spy' },
  { to: '/ai-analyst', icon: FiCpu, label: 'AI Analyst' },
  { to: '/alerts', icon: FiBell, label: 'Alerts' },
  { to: '/seasonal', icon: FiSun, label: 'Seasonal' },
  { to: '/scheduler', icon: FiActivity, label: 'Scheduler' },
]

export default function Sidebar() {
  return (
    <aside className="w-56 flex-shrink-0 border-r border-white/10 bg-gray-950/50 h-full overflow-y-auto hidden md:flex flex-col py-4">
      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-primary-600/20 text-primary-400 border border-primary-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 mt-4 pt-4 border-t border-white/10">
        <div className="glass-card p-3">
          <p className="text-xs font-medium text-white mb-1">Pakistan E-Commerce</p>
          <p className="text-xs text-gray-500">Data sources: Daraz, OLX, TikTok Shop</p>
        </div>
      </div>
    </aside>
  )
}
