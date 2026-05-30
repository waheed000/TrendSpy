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

function TikTokIcon({ size = 17 }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.79 1.53V6.75a4.85 4.85 0 01-1.02-.06z" />
    </svg>
  )
}

const NAV_ITEMS = [
  { to: '/dashboard',      icon: FiGrid,       label: 'Dashboard'      },
  { to: '/products',       icon: FiSearch,     label: 'Product Hunt'   },
  { to: '/city-explorer',  icon: FiMap,        label: 'City Explorer'  },
  { to: '/trends',         icon: FiTrendingUp, label: 'Trends'         },
  { to: '/ad-spy',         icon: FiEye,        label: 'Ad Spy'         },
  { to: '/tiktok-trends',  icon: TikTokIcon,   label: 'TikTok Trends'  },
  { to: '/ai-analyst',     icon: FiCpu,        label: 'AI Analyst'     },
  { to: '/alerts',         icon: FiBell,       label: 'Alerts'         },
  { to: '/seasonal',       icon: FiSun,        label: 'Seasonal'       },
  { to: '/scheduler',      icon: FiActivity,   label: 'Scheduler'      },
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
