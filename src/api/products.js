const MOCK_PRODUCTS = [
  {
    id: 1,
    name: 'Portable Electric Heater',
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=300&h=300&fit=crop',
    winScore: 92,
    priceMin: 2500,
    priceMax: 4500,
    trend: 'up',
    trendPct: 34,
    platforms: ['Daraz', 'OLX'],
    category: 'Electronics',
    city: 'Lahore',
    adsRunning: 47,
    competitors: 12,
  },
  {
    id: 2,
    name: 'Women Khaddar Suit',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300&h=300&fit=crop',
    winScore: 88,
    priceMin: 1200,
    priceMax: 3500,
    trend: 'up',
    trendPct: 28,
    platforms: ['Daraz', 'TikTok'],
    category: 'Fashion',
    city: 'Lahore',
    adsRunning: 83,
    competitors: 34,
  },
  {
    id: 3,
    name: 'Smart Watch Series 9 Clone',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop',
    winScore: 85,
    priceMin: 1800,
    priceMax: 3200,
    trend: 'up',
    trendPct: 22,
    platforms: ['Daraz', 'OLX', 'TikTok'],
    category: 'Electronics',
    city: 'Karachi',
    adsRunning: 61,
    competitors: 28,
  },
  {
    id: 4,
    name: 'Skin Whitening Serum',
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=300&h=300&fit=crop',
    winScore: 82,
    priceMin: 800,
    priceMax: 1500,
    trend: 'up',
    trendPct: 45,
    platforms: ['TikTok', 'Daraz'],
    category: 'Beauty',
    city: 'Karachi',
    adsRunning: 120,
    competitors: 56,
  },
  {
    id: 5,
    name: 'Wireless Earbuds TWS',
    image: 'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=300&h=300&fit=crop',
    winScore: 79,
    priceMin: 900,
    priceMax: 2200,
    trend: 'up',
    trendPct: 18,
    platforms: ['Daraz', 'OLX'],
    category: 'Electronics',
    city: 'Islamabad',
    adsRunning: 38,
    competitors: 22,
  },
  {
    id: 6,
    name: 'Air Fryer 5L',
    image: 'https://images.unsplash.com/photo-1615361200141-f45040f367be?w=300&h=300&fit=crop',
    winScore: 76,
    priceMin: 5500,
    priceMax: 9000,
    trend: 'up',
    trendPct: 15,
    platforms: ['Daraz'],
    category: 'Home',
    city: 'Lahore',
    adsRunning: 29,
    competitors: 15,
  },
  {
    id: 7,
    name: 'Kids Winter Jacket',
    image: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=300&h=300&fit=crop',
    winScore: 73,
    priceMin: 1500,
    priceMax: 2800,
    trend: 'up',
    trendPct: 12,
    platforms: ['Daraz', 'TikTok'],
    category: 'Fashion',
    city: 'Faisalabad',
    adsRunning: 22,
    competitors: 18,
  },
  {
    id: 8,
    name: 'LED Ring Light 18"',
    image: 'https://images.unsplash.com/photo-1493476523860-a6de6ce1b0c3?w=300&h=300&fit=crop',
    winScore: 68,
    priceMin: 2200,
    priceMax: 4000,
    trend: 'down',
    trendPct: -8,
    platforms: ['Daraz', 'OLX'],
    category: 'Electronics',
    city: 'Karachi',
    adsRunning: 15,
    competitors: 9,
  },
  {
    id: 9,
    name: 'Gym Protein Shaker',
    image: 'https://images.unsplash.com/photo-1574629693481-5f3e06a96c1a?w=300&h=300&fit=crop',
    winScore: 62,
    priceMin: 450,
    priceMax: 850,
    trend: 'up',
    trendPct: 6,
    platforms: ['Daraz', 'TikTok'],
    category: 'Sports',
    city: 'Islamabad',
    adsRunning: 11,
    competitors: 7,
  },
  {
    id: 10,
    name: 'Wooden Study Chair',
    image: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=300&h=300&fit=crop',
    winScore: 58,
    priceMin: 4500,
    priceMax: 8500,
    trend: 'down',
    trendPct: -5,
    platforms: ['OLX'],
    category: 'Home',
    city: 'Rawalpindi',
    adsRunning: 8,
    competitors: 5,
  },
  {
    id: 11,
    name: 'Mehandi Cone Pack 12',
    image: 'https://images.unsplash.com/photo-1571847140471-1d7766e825ea?w=300&h=300&fit=crop',
    winScore: 55,
    priceMin: 200,
    priceMax: 450,
    trend: 'up',
    trendPct: 40,
    platforms: ['Daraz', 'TikTok'],
    category: 'Beauty',
    city: 'Multan',
    adsRunning: 44,
    competitors: 30,
  },
  {
    id: 12,
    name: 'Bluetooth Speaker Mini',
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=300&fit=crop',
    winScore: 48,
    priceMin: 700,
    priceMax: 1400,
    trend: 'down',
    trendPct: -12,
    platforms: ['Daraz', 'OLX', 'TikTok'],
    category: 'Electronics',
    city: 'Peshawar',
    adsRunning: 6,
    competitors: 4,
  },
]

export function fetchProducts(city, category, minScore = 0) {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filtered = [...MOCK_PRODUCTS]
      if (city && city !== 'All') {
        filtered = filtered.filter((p) => p.city === city)
        if (filtered.length === 0) filtered = MOCK_PRODUCTS.slice(0, 6)
      }
      if (category && category !== 'All') {
        filtered = filtered.filter((p) => p.category === category)
        if (filtered.length === 0) filtered = MOCK_PRODUCTS.filter((p) => p.category === category)
      }
      if (minScore > 0) {
        filtered = filtered.filter((p) => p.winScore >= minScore)
      }
      resolve(filtered)
    }, 400)
  })
}

export function fetchTopProducts(limit = 10) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const sorted = [...MOCK_PRODUCTS].sort((a, b) => b.winScore - a.winScore).slice(0, limit)
      resolve(sorted)
    }, 300)
  })
}

export function fetchProductById(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const product = MOCK_PRODUCTS.find((p) => p.id === Number(id))
      if (product) resolve(product)
      else reject(new Error('Product not found'))
    }, 200)
  })
}

export function fetchCityProducts(city) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const cityProducts = MOCK_PRODUCTS.filter((p) => p.city === city)
      if (cityProducts.length === 0) {
        resolve(MOCK_PRODUCTS.slice(0, 5))
      } else {
        resolve(cityProducts.slice(0, 5))
      }
    }, 300)
  })
}

export { MOCK_PRODUCTS }
