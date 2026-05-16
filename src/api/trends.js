import { subDays, format } from 'date-fns'

function generateTrendData(days, baseValue, variance) {
  return Array.from({ length: days }, (_, i) => ({
    date: format(subDays(new Date(), days - i - 1), 'MMM d'),
    value: Math.max(0, Math.round(baseValue + Math.sin(i * 0.3) * variance + Math.random() * variance * 0.5)),
  }))
}

const TREND_DATA = {
  1: { name: 'Electric Heater', data30: generateTrendData(30, 1200, 300), data60: generateTrendData(60, 1000, 400), data90: generateTrendData(90, 800, 500) },
  2: { name: 'Khaddar Suit', data30: generateTrendData(30, 2800, 600), data60: generateTrendData(60, 2200, 700), data90: generateTrendData(90, 1800, 800) },
  3: { name: 'Smart Watch', data30: generateTrendData(30, 950, 200), data60: generateTrendData(60, 800, 300), data90: generateTrendData(90, 700, 350) },
  4: { name: 'Skin Serum', data30: generateTrendData(30, 3400, 800), data60: generateTrendData(60, 2800, 900), data90: generateTrendData(90, 2200, 1000) },
  5: { name: 'TWS Earbuds', data30: generateTrendData(30, 1600, 350), data60: generateTrendData(60, 1400, 400), data90: generateTrendData(90, 1200, 450) },
}

export const CATEGORY_TREND_DATA = Array.from({ length: 30 }, (_, i) => ({
  date: format(subDays(new Date(), 29 - i), 'MMM d'),
  Fashion: Math.round(2000 + Math.sin(i * 0.2) * 400 + Math.random() * 200),
  Electronics: Math.round(1500 + Math.cos(i * 0.25) * 300 + Math.random() * 150),
  Beauty: Math.round(1800 + Math.sin(i * 0.35) * 500 + Math.random() * 250),
  Home: Math.round(900 + Math.sin(i * 0.15) * 200 + Math.random() * 100),
  Sports: Math.round(600 + Math.cos(i * 0.3) * 150 + Math.random() * 80),
}))

export function fetchTrends(productId, range = 30) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const trend = TREND_DATA[productId] || TREND_DATA[1]
      const key = `data${range}`
      resolve({
        name: trend.name,
        data: trend[key] || trend.data30,
      })
    }, 400)
  })
}

export function fetchAllTrends(range = 30) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const results = Object.entries(TREND_DATA).map(([id, trend]) => {
        const key = `data${range}`
        return {
          id: Number(id),
          name: trend.name,
          data: trend[key] || trend.data30,
        }
      })
      resolve(results)
    }, 500)
  })
}

export function fetchCategoryTrends() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(CATEGORY_TREND_DATA)
    }, 350)
  })
}

export function fetchRisingFalling() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        rising: [
          { id: 4, name: 'Skin Whitening Serum', change: '+45%', score: 82, category: 'Beauty' },
          { id: 1, name: 'Portable Electric Heater', change: '+34%', score: 92, category: 'Electronics' },
          { id: 2, name: 'Women Khaddar Suit', change: '+28%', score: 88, category: 'Fashion' },
          { id: 11, name: 'Mehandi Cone Pack 12', change: '+40%', score: 55, category: 'Beauty' },
          { id: 3, name: 'Smart Watch Series 9', change: '+22%', score: 85, category: 'Electronics' },
        ],
        falling: [
          { id: 12, name: 'Bluetooth Speaker Mini', change: '-12%', score: 48, category: 'Electronics' },
          { id: 8, name: 'LED Ring Light 18"', change: '-8%', score: 68, category: 'Electronics' },
          { id: 10, name: 'Wooden Study Chair', change: '-5%', score: 58, category: 'Home' },
          { id: 7, name: 'Kids Winter Jacket', change: '-3%', score: 73, category: 'Fashion' },
          { id: 9, name: 'Gym Protein Shaker', change: '-1%', score: 62, category: 'Sports' },
        ],
      })
    }, 300)
  })
}
