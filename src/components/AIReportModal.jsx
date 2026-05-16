import { useState } from 'react'
import { FiX, FiTrendingUp, FiDollarSign, FiTarget, FiUsers, FiStar } from 'react-icons/fi'
import { SiDaraz } from 'react-icons/si'
import { formatPKR } from '../utils/formatPKR.js'

export default function AIReportModal({ product, onClose }) {
  const [buyPrice, setBuyPrice] = useState(Math.round(product.priceMin * 0.45))
  const [sellPrice, setSellPrice] = useState(product.priceMax)

  const margin = sellPrice > 0 ? Math.round(((sellPrice - buyPrice) / sellPrice) * 100) : 0
  const profit = sellPrice - buyPrice

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-card p-6 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse" />
              <span className="text-primary-400 text-xs font-medium uppercase tracking-wider">AI Analysis Report</span>
            </div>
            <h2 className="text-xl font-bold text-white">{product.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <FiDollarSign className="text-green-400" size={16} />
              <span className="text-sm font-medium text-gray-300">Profit Calculator</span>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Buy Price (PKR)</label>
                <input
                  type="number"
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(Number(e.target.value))}
                  className="input-field text-sm py-2"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Sell Price (PKR)</label>
                <input
                  type="number"
                  value={sellPrice}
                  onChange={(e) => setSellPrice(Number(e.target.value))}
                  className="input-field text-sm py-2"
                />
              </div>
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Profit/unit</span>
                  <span className="text-green-400 font-bold">{formatPKR(profit)}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-400">Margin</span>
                  <span className={`font-bold text-sm ${margin >= 30 ? 'text-green-400' : margin >= 15 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {margin}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <FiTarget className="text-primary-400" size={16} />
              <span className="text-sm font-medium text-gray-300">Best Platform</span>
            </div>
            <div className="space-y-2">
              {[
                { name: 'Daraz', score: 92, color: 'text-orange-400', rec: 'Best for reach' },
                { name: 'TikTok', score: 78, color: 'text-pink-400', rec: 'Viral potential' },
                { name: 'OLX', score: 55, color: 'text-blue-400', rec: 'Local buyers' },
              ].map((p) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className={`text-xs font-semibold w-14 ${p.color}`}>{p.name}</span>
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full transition-all duration-700"
                      style={{ width: `${p.score}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-20 text-right">{p.rec}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 p-2.5 bg-primary-600/20 border border-primary-500/30 rounded-lg">
              <p className="text-xs text-primary-300 font-medium">Daraz recommended for highest ROI</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <FiStar className="text-yellow-400" size={16} />
            <span className="text-sm font-medium text-gray-300">Ad Copy Suggestions</span>
          </div>
          <div className="space-y-3">
            <div className="bg-white/5 rounded-xl p-3">
              <span className="text-xs text-primary-400 font-medium uppercase tracking-wider mb-1 block">English</span>
              <p className="text-sm text-white leading-relaxed">
                "🔥 {product.name} — Trending across Pakistan! Limited stock at unbeatable price. Order now & get FREE delivery. Don't miss out!"
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-3">
              <span className="text-xs text-accent-400 font-medium uppercase tracking-wider mb-1 block">Urdu</span>
              <p className="text-sm text-white leading-relaxed" dir="rtl">
                "🔥 {product.name} — پاکستان بھر میں مشہور! محدود اسٹاک، بہترین قیمت پر۔ ابھی آرڈر کریں اور مفت ڈیلیوری پائیں!"
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <FiUsers className="text-red-400 flex-shrink-0" size={18} />
          <div>
            <p className="text-sm font-medium text-white">
              {product.competitors} active competitors
            </p>
            <p className="text-xs text-gray-400">
              {product.competitors > 20
                ? 'High competition — differentiate with price or faster delivery'
                : 'Moderate competition — good entry opportunity'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
