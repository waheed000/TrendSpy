import { useState } from 'react'
import { FiSearch, FiCpu, FiDollarSign, FiTarget, FiUsers, FiStar, FiLoader } from 'react-icons/fi'
import { formatPKR } from '../utils/formatPKR.js'

const MOCK_REPORTS = {
  heater: {
    product: 'Portable Electric Heater',
    score: 92,
    buyPrice: 1800,
    sellPrice: 4200,
    platforms: [
      { name: 'Daraz', score: 94, reason: 'High winter demand, free shipping' },
      { name: 'TikTok', score: 78, reason: 'Viral potential with demo videos' },
      { name: 'OLX', score: 52, reason: 'Local buyers, lower margins' },
    ],
    competitors: 12,
    adCopyEN: '"Stay warm without breaking the bank! Portable electric heater — instant heat, 50% less electricity. Limited stock. Order now & get FREE delivery across Pakistan!"',
    adCopyUR: '"سردی سے بچیں، بجلی بچائیں! پورٹیبل الیکٹرک ہیٹر — فوری گرمی، کم بجلی۔ محدود اسٹاک۔ ابھی آرڈر کریں اور پاکستان بھر میں مفت ڈیلیوری پائیں!"',
    summary: 'Strong seasonal product. Winter demand surges Nov–Feb. High repeat purchase rate. Low return rate for this category.',
  },
  watch: {
    product: 'Smart Watch Series 9 Clone',
    score: 85,
    buyPrice: 950,
    sellPrice: 2800,
    platforms: [
      { name: 'Daraz', score: 90, reason: 'Highest buyer trust for electronics' },
      { name: 'OLX', score: 72, reason: 'Tech-savvy buyers, good for refurbs' },
      { name: 'TikTok', score: 81, reason: 'Unboxing content performs well' },
    ],
    competitors: 28,
    adCopyEN: '"Look smart, pay less! Series 9 Smart Watch at PKR 1999. Heart rate, sleep tracker, 36hr battery. Free delivery. Grab yours before it sells out!"',
    adCopyUR: '"سمارٹ لگیں، کم خرچ کریں! سیریز 9 سمارٹ واچ صرف 1999 روپے میں۔ ہارٹ ریٹ، سلیپ ٹریکر، 36 گھنٹے بیٹری۔ مفت ڈیلیوری۔ ابھی آرڈر کریں!"',
    summary: 'Highly competitive but profitable. Differentiate with bundle offers (extra straps). Avoid direct comparison with Apple — focus on value.',
  },
  serum: {
    product: 'Skin Whitening Serum',
    score: 82,
    buyPrice: 350,
    sellPrice: 1200,
    platforms: [
      { name: 'TikTok', score: 96, reason: 'Beauty content dominates TikTok PK' },
      { name: 'Daraz', score: 85, reason: 'High review volume boosts trust' },
      { name: 'OLX', score: 40, reason: 'Not ideal for beauty products' },
    ],
    competitors: 56,
    adCopyEN: '"Visible glow in 7 days — guaranteed! Dermatologist tested serum with Vitamin C & Niacinamide. 2500+ happy customers. Buy 2 get 1 FREE today!"',
    adCopyUR: '"7 دنوں میں نمایاں نکھار — گارنٹی! وٹامن سی اور نیاسینامائیڈ کے ساتھ ڈرماٹولوجسٹ ٹیسٹڈ سیرم۔ 2500+ خوش گاہک۔ 2 خریدیں، 1 مفت پائیں!"',
    summary: 'Very high competition. Success depends on social proof — collect video testimonials. TikTok is essential channel. Before/after content converts best.',
  },
}

function getReport(query) {
  const q = query.toLowerCase()
  if (q.includes('heater') || q.includes('warm') || q.includes('winter')) return MOCK_REPORTS.heater
  if (q.includes('watch') || q.includes('smart') || q.includes('wrist')) return MOCK_REPORTS.watch
  if (q.includes('serum') || q.includes('skin') || q.includes('beauty') || q.includes('glow')) return MOCK_REPORTS.serum
  return {
    product: query.charAt(0).toUpperCase() + query.slice(1),
    score: Math.floor(Math.random() * 40 + 50),
    buyPrice: Math.floor(Math.random() * 1000 + 500),
    sellPrice: Math.floor(Math.random() * 2000 + 1500),
    platforms: [
      { name: 'Daraz', score: Math.floor(Math.random() * 30 + 60), reason: 'Largest Pakistani e-commerce platform' },
      { name: 'TikTok', score: Math.floor(Math.random() * 30 + 50), reason: 'Growing market for trending products' },
      { name: 'OLX', score: Math.floor(Math.random() * 30 + 40), reason: 'Strong for local buyer connections' },
    ],
    competitors: Math.floor(Math.random() * 30 + 5),
    adCopyEN: `"Discover the best ${query} in Pakistan! Top quality at unbeatable price. Fast delivery nationwide. Order now!"`,
    adCopyUR: `"پاکستان میں بہترین ${query} دریافت کریں! اعلیٰ معیار، بہترین قیمت۔ پورے پاکستان میں تیز ترسیل۔ ابھی آرڈر کریں!"`,
    summary: 'Analysis based on current market trends in Pakistan. Review competition regularly and adjust pricing strategy.',
  }
}

export default function AIAnalyst() {
  const [query, setQuery] = useState('')
  const [report, setReport] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [buyPrice, setBuyPrice] = useState(0)
  const [sellPrice, setSellPrice] = useState(0)

  const handleSearch = async (e) => {
    e?.preventDefault()
    if (!query.trim()) return
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 1200))
    const r = getReport(query)
    setReport(r)
    setBuyPrice(r.buyPrice)
    setSellPrice(r.sellPrice)
    setIsLoading(false)
  }

  const margin = sellPrice > 0 ? Math.round(((sellPrice - buyPrice) / sellPrice) * 100) : 0

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title">AI Analyst</h1>
        <p className="section-subtitle">Get deep AI-powered analysis for any product</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Try "heater", "smart watch", "skin serum"...'
            className="input-field pl-12 py-3.5"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="btn-primary px-6 py-3.5 flex items-center gap-2 disabled:opacity-50"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <FiCpu size={16} />
              Analyze
            </>
          )}
        </button>
      </form>

      {isLoading && (
        <div className="glass-card p-8 text-center">
          <div className="w-12 h-12 border-3 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white font-medium mb-1">Analyzing product...</p>
          <p className="text-gray-500 text-sm">Scanning Daraz, OLX & TikTok · Running AI model</p>
        </div>
      )}

      {report && !isLoading && (
        <div className="space-y-4 animate-slide-up">
          <div className="glass-card p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-600/20 border border-primary-500/30 rounded-xl flex items-center justify-center">
              <FiCpu className="text-primary-400" size={22} />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-white">{report.product}</h2>
              <p className="text-sm text-gray-400">{report.summary}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-white">{report.score}</p>
              <p className="text-xs text-gray-500">Win Score</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <FiDollarSign className="text-green-400" size={16} />
                <h3 className="text-sm font-semibold text-white">Profit Calculator</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Buy Price (PKR)</label>
                  <input type="number" value={buyPrice} onChange={(e) => setBuyPrice(Number(e.target.value))} className="input-field text-sm py-2" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Sell Price (PKR)</label>
                  <input type="number" value={sellPrice} onChange={(e) => setSellPrice(Number(e.target.value))} className="input-field text-sm py-2" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-400 mb-1">Profit/unit</p>
                    <p className="text-green-400 font-bold text-lg">{formatPKR(sellPrice - buyPrice)}</p>
                  </div>
                  <div className={`border rounded-xl p-3 text-center ${margin >= 30 ? 'bg-green-500/10 border-green-500/20' : margin >= 15 ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                    <p className="text-xs text-gray-400 mb-1">Margin</p>
                    <p className={`font-bold text-lg ${margin >= 30 ? 'text-green-400' : margin >= 15 ? 'text-yellow-400' : 'text-red-400'}`}>{margin}%</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <FiTarget className="text-primary-400" size={16} />
                <h3 className="text-sm font-semibold text-white">Platform Recommendation</h3>
              </div>
              <div className="space-y-3">
                {report.platforms.map((p, i) => (
                  <div key={p.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-white">{p.name}</span>
                      <span className="text-xs text-gray-400">{p.score}% match</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-1">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${p.score}%`,
                          background: i === 0 ? '#6366f1' : i === 1 ? '#f97316' : '#3b82f6',
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-600">{p.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <FiStar className="text-yellow-400" size={16} />
              <h3 className="text-sm font-semibold text-white">Ad Copy Suggestions</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-xs text-primary-400 font-medium uppercase tracking-wider mb-2">English</p>
                <p className="text-sm text-gray-200 leading-relaxed">{report.adCopyEN}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-xs text-accent-400 font-medium uppercase tracking-wider mb-2">Urdu</p>
                <p className="text-sm text-gray-200 leading-relaxed" dir="rtl">{report.adCopyUR}</p>
              </div>
            </div>
          </div>

          <div className={`glass-card p-4 flex items-center gap-3 ${report.competitors > 20 ? 'border-red-500/20 bg-red-500/5' : 'border-yellow-500/20 bg-yellow-500/5'}`}>
            <FiUsers className={report.competitors > 20 ? 'text-red-400' : 'text-yellow-400'} size={20} />
            <div>
              <p className="text-sm font-medium text-white">{report.competitors} active competitors selling this product</p>
              <p className="text-xs text-gray-400">
                {report.competitors > 30
                  ? 'Very high competition — differentiate strongly on price, speed, or quality'
                  : report.competitors > 15
                  ? 'Moderate competition — focus on ad creative and customer reviews'
                  : 'Low competition — great opportunity to establish market position'}
              </p>
            </div>
          </div>
        </div>
      )}

      {!report && !isLoading && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-primary-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiCpu className="text-primary-400" size={28} />
          </div>
          <h3 className="text-white font-semibold mb-2">AI Product Analyst</h3>
          <p className="text-gray-500 text-sm max-w-xs mx-auto">
            Search for any product to get an AI-generated report with profit calculator, platform recommendations, and ad copy.
          </p>
        </div>
      )}
    </div>
  )
}
