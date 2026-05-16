import { Link } from 'react-router-dom'
import { FiLogOut, FiUser } from 'react-icons/fi'
import AlertBell from './AlertBell.jsx'
import useStore from '../store/useStore.js'

export default function Navbar() {
  const user = useStore((s) => s.user)
  const logout = useStore((s) => s.logout)

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-white/10 bg-gray-950/80 backdrop-blur-md sticky top-0 z-40">
      <Link to="/dashboard" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">TS</span>
        </div>
        <span className="font-bold text-white text-lg tracking-tight">
          Trend<span className="gradient-text">Spy</span>
        </span>
      </Link>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 glass-card">
          <div className="live-dot" />
          <span className="text-xs text-gray-300">Live updates active</span>
        </div>

        <AlertBell />

        <div className="flex items-center gap-2 pl-3 border-l border-white/10">
          <div className="w-8 h-8 bg-primary-600/30 border border-primary-500/30 rounded-full flex items-center justify-center">
            <FiUser size={14} className="text-primary-400" />
          </div>
          <span className="text-sm text-gray-300 hidden sm:block">{user?.email?.split('@')[0] || 'User'}</span>
          <button
            onClick={logout}
            className="ml-1 p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
            title="Logout"
          >
            <FiLogOut size={15} />
          </button>
        </div>
      </div>
    </header>
  )
}
