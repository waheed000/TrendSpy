import { useEffect } from 'react'
import toast from 'react-hot-toast'
import { FiBell } from 'react-icons/fi'
import useStore from '../store/useStore.js'

const MOCK_ALERTS = [
  { product: 'Electric Heater', city: 'Lahore', score: 92 },
  { product: 'Khaddar Suit', city: 'Karachi', score: 88 },
  { product: 'Smart Watch', city: 'Islamabad', score: 85 },
  { product: 'Skin Serum', city: 'Faisalabad', score: 79 },
  { product: 'Air Fryer', city: 'Rawalpindi', score: 76 },
]

export function useSocket() {
  const setAlertCount = useStore((s) => s.setAlertCount)
  const alertCount = useStore((s) => s.alertCount)

  useEffect(() => {
    const interval = setInterval(() => {
      const alert = MOCK_ALERTS[Math.floor(Math.random() * MOCK_ALERTS.length)]
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? 'animate-slide-up' : 'opacity-0'
            } flex items-center gap-3 bg-gray-900 border border-primary-500/30 px-4 py-3 rounded-xl shadow-lg`}
          >
            <div className="w-8 h-8 bg-primary-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-primary-400 text-sm">🔥</span>
            </div>
            <div>
              <p className="text-white text-sm font-medium">{alert.product}</p>
              <p className="text-gray-400 text-xs">
                Score {alert.score} · {alert.city}
              </p>
            </div>
          </div>
        ),
        { duration: 4000 }
      )
      setAlertCount(alertCount + 1)
    }, 30000)

    return () => clearInterval(interval)
  }, [alertCount, setAlertCount])
}
