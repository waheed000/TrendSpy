import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FiEye, FiImage, FiVideo, FiLayout, FiSliders } from 'react-icons/fi'
import { fetchAds } from '../api/alerts.js'
import { CITIES, CATEGORIES } from '../utils/cityList.js'

const CREATIVE_ICONS = {
  image: FiImage,
  video: FiVideo,
  carousel: FiLayout,
}

const SPEND_COLORS = {
  Low: 'bg-blue-500/20 text-blue-400',
  Medium: 'bg-yellow-500/20 text-yellow-400',
  High: 'bg-orange-500/20 text-orange-400',
  'Very High': 'bg-red-500/20 text-red-400',
}

export default function AdSpy() {
  const [filters, setFilters] = useState({
    category: 'All',
    city: 'All',
    creative: 'All',
    minDuration: 0,
  })
  const [durationInput, setDurationInput] = useState(0)

  const { data: ads, isLoading } = useQuery({
    queryKey: ['ads', filters],
    queryFn: () => fetchAds(filters),
  })

  const updateFilter = (key, val) => setFilters((f) => ({ ...f, [key]: val }))

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title">Ad Spy</h1>
        <p className="section-subtitle">Facebook ads running 30+ days for Pakistani products</p>
      </div>

      <div className="glass-card p-4 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <FiSliders className="text-primary-400" size={16} />
          <span className="text-sm font-medium text-gray-300">Filters</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={filters.category}
            onChange={(e) => updateFilter('category', e.target.value)}
            className="select-field text-sm py-2 w-auto min-w-36"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={filters.city}
            onChange={(e) => updateFilter('city', e.target.value)}
            className="select-field text-sm py-2 w-auto min-w-32"
          >
            <option value="All">All Cities</option>
            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={filters.creative}
            onChange={(e) => updateFilter('creative', e.target.value)}
            className="select-field text-sm py-2 w-auto min-w-32"
          >
            {['All', 'image', 'video', 'carousel'].map((c) => (
              <option key={c} value={c}>{c === 'All' ? 'All Formats' : c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 whitespace-nowrap">Min days running:</span>
            <input
              type="range"
              min={0}
              max={60}
              value={durationInput}
              onChange={(e) => {
                setDurationInput(Number(e.target.value))
                updateFilter('minDuration', Number(e.target.value))
              }}
              className="w-24 accent-primary-500"
            />
            <span className="text-xs text-white w-6">{durationInput}</span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card p-5 h-48 animate-pulse">
              <div className="h-4 bg-white/5 rounded w-3/4 mb-3" />
              <div className="h-3 bg-white/5 rounded w-full mb-2" />
              <div className="h-3 bg-white/5 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {ads?.map((ad) => {
            const CreativeIcon = CREATIVE_ICONS[ad.creative] || FiEye
            return (
              <div key={ad.id} className="glass-card-hover p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600/20 border border-blue-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-400 text-xs font-bold">f</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">{ad.platform}</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${SPEND_COLORS[ad.spend]}`}>
                          {ad.spend} spend
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">{ad.duration} days</span>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-white mb-1 leading-tight">{ad.headline}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{ad.description}</p>
                </div>

                <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <CreativeIcon size={13} />
                    {ad.creative}
                  </div>
                  <span className="text-gray-700">·</span>
                  <span className="text-xs text-gray-500">{ad.city}</span>
                  <span className="text-gray-700">·</span>
                  <span className="text-xs text-gray-500">{ad.category}</span>
                  <div className="ml-auto flex items-center gap-1">
                    <span className="text-xs text-red-400 font-semibold">{ad.competitors}</span>
                    <span className="text-xs text-gray-600">competitors</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!isLoading && ads?.length === 0 && (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-white font-medium mb-1">No ads found</p>
          <p className="text-gray-500 text-sm">Try adjusting your filters</p>
        </div>
      )}
    </div>
  )
}
