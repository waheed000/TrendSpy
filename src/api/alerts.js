import { subHours, subMinutes, format } from 'date-fns'

const MOCK_ALERTS = [
  {
    id: 1,
    city: 'Lahore',
    category: 'Electronics',
    minScore: 80,
    createdAt: subHours(new Date(), 2),
    notifyVia: 'telegram',
    active: true,
  },
  {
    id: 2,
    city: 'Karachi',
    category: 'Beauty',
    minScore: 70,
    createdAt: subHours(new Date(), 24),
    notifyVia: 'email',
    active: true,
  },
  {
    id: 3,
    city: 'All',
    category: 'Fashion',
    minScore: 85,
    createdAt: subHours(new Date(), 48),
    notifyVia: 'telegram',
    active: false,
  },
]

const MOCK_ALERT_HISTORY = [
  {
    id: 1,
    product: 'Portable Electric Heater',
    city: 'Lahore',
    category: 'Electronics',
    winScore: 92,
    triggeredAt: subMinutes(new Date(), 15),
    platform: 'Daraz',
  },
  {
    id: 2,
    product: 'Skin Whitening Serum',
    city: 'Karachi',
    category: 'Beauty',
    winScore: 82,
    triggeredAt: subHours(new Date(), 2),
    platform: 'TikTok',
  },
  {
    id: 3,
    product: 'Women Khaddar Suit',
    city: 'Lahore',
    category: 'Fashion',
    winScore: 88,
    triggeredAt: subHours(new Date(), 5),
    platform: 'Daraz',
  },
  {
    id: 4,
    product: 'Smart Watch Series 9 Clone',
    city: 'Karachi',
    category: 'Electronics',
    winScore: 85,
    triggeredAt: subHours(new Date(), 8),
    platform: 'OLX',
  },
  {
    id: 5,
    product: 'TWS Wireless Earbuds',
    city: 'Islamabad',
    category: 'Electronics',
    winScore: 79,
    triggeredAt: subHours(new Date(), 12),
    platform: 'Daraz',
  },
]

export function fetchAlerts() {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...MOCK_ALERTS]), 300)
  })
}

export function fetchAlertHistory() {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...MOCK_ALERT_HISTORY]), 300)
  })
}

export function createAlert(alertData) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newAlert = {
        id: Date.now(),
        ...alertData,
        createdAt: new Date(),
        active: true,
      }
      MOCK_ALERTS.push(newAlert)
      resolve(newAlert)
    }, 500)
  })
}

export function deleteAlert(id) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const idx = MOCK_ALERTS.findIndex((a) => a.id === id)
      if (idx !== -1) MOCK_ALERTS.splice(idx, 1)
      resolve({ success: true })
    }, 300)
  })
}

export function fetchAds(filters = {}) {
  const MOCK_ADS = [
    {
      id: 1,
      headline: 'Stay Warm This Winter! Electric Heater 40% OFF',
      description: 'Premium portable heater with safety cutoff. Fast delivery across Pakistan.',
      creative: 'video',
      category: 'Electronics',
      city: 'Lahore',
      duration: 45,
      competitors: 12,
      spend: 'High',
      platform: 'Facebook',
    },
    {
      id: 2,
      headline: 'Glow Skin in 7 Days - Whitening Serum Viral Results',
      description: 'Dermatologist tested. Free shipping on orders above PKR 1500.',
      creative: 'carousel',
      category: 'Beauty',
      city: 'Karachi',
      duration: 62,
      competitors: 34,
      spend: 'Very High',
      platform: 'Facebook',
    },
    {
      id: 3,
      headline: 'New Khaddar Collection 2024 - Limited Stock!',
      description: 'Unstitched & stitched available. COD available nationwide.',
      creative: 'image',
      category: 'Fashion',
      city: 'Lahore',
      duration: 38,
      competitors: 28,
      spend: 'High',
      platform: 'Facebook',
    },
    {
      id: 4,
      headline: 'Apple Watch Clone - Smart Watch at PKR 1999 Only',
      description: 'Heart rate, fitness tracker, waterproof. Limited time deal.',
      creative: 'video',
      category: 'Electronics',
      city: 'Karachi',
      duration: 55,
      competitors: 22,
      spend: 'Medium',
      platform: 'Facebook',
    },
    {
      id: 5,
      headline: 'Air Fryer - Cook Healthy with 0 Oil!',
      description: '5L capacity. 12 preset functions. Pakistan warranty.',
      creative: 'carousel',
      category: 'Home',
      city: 'Islamabad',
      duration: 31,
      competitors: 8,
      spend: 'Medium',
      platform: 'Facebook',
    },
    {
      id: 6,
      headline: 'TWS Earbuds - 36Hr Battery Life - PKR 899',
      description: 'Noise cancelling. Compatible with all phones. COD available.',
      creative: 'image',
      category: 'Electronics',
      city: 'Faisalabad',
      duration: 42,
      competitors: 19,
      spend: 'High',
      platform: 'Facebook',
    },
    {
      id: 7,
      headline: "Bridal Mehndi Pack - Eid Special Offer",
      description: 'Premium cone mehndi. Dark color guaranteed. Nationwide delivery.',
      creative: 'video',
      category: 'Beauty',
      city: 'Multan',
      duration: 35,
      competitors: 15,
      spend: 'Low',
      platform: 'Facebook',
    },
    {
      id: 8,
      headline: 'Kids Winter Jacket - Keep Your Child Warm',
      description: 'Available sizes 2-12 years. Imported quality at local price.',
      creative: 'carousel',
      category: 'Fashion',
      city: 'Rawalpindi',
      duration: 48,
      competitors: 11,
      spend: 'Medium',
      platform: 'Facebook',
    },
  ]

  return new Promise((resolve) => {
    setTimeout(() => {
      let filtered = [...MOCK_ADS]
      if (filters.category && filters.category !== 'All') {
        filtered = filtered.filter((a) => a.category === filters.category)
      }
      if (filters.city && filters.city !== 'All') {
        filtered = filtered.filter((a) => a.city === filters.city)
      }
      if (filters.minDuration) {
        filtered = filtered.filter((a) => a.duration >= filters.minDuration)
      }
      if (filters.creative && filters.creative !== 'All') {
        filtered = filtered.filter((a) => a.creative === filters.creative)
      }
      resolve(filtered)
    }, 400)
  })
}
