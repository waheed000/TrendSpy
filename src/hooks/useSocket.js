import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import useStore from '../store/useStore.js'

const MOCK_ALERTS = [
  { product: 'Electric Heater', city: 'Lahore', score: 92 },
  { product: 'Khaddar Suit', city: 'Karachi', score: 88 },
  { product: 'Smart Watch', city: 'Islamabad', score: 85 },
  { product: 'Skin Serum', city: 'Faisalabad', score: 79 },
  { product: 'Air Fryer', city: 'Rawalpindi', score: 76 },
]

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false)
  const [lastAlert, setLastAlert] = useState(null)
  const setAlertCount = useStore((s) => s.setAlertCount)
  const alertCount = useStore((s) => s.alertCount)

  useEffect(() => {
    setIsConnected(true)

    const interval = setInterval(() => {
      const alert = MOCK_ALERTS[Math.floor(Math.random() * MOCK_ALERTS.length)]
      setLastAlert(alert)
      setAlertCount(alertCount + 1)
      toast(`🔥 ${alert.product} · Score ${alert.score} · ${alert.city}`, {
        icon: '📦',
        style: {
          background: '#1e1e3f',
          color: '#fff',
          border: '1px solid rgba(99,102,241,0.3)',
          borderRadius: '12px',
          fontSize: '14px',
        },
        duration: 4000,
      })
    }, 30000)

    return () => {
      clearInterval(interval)
      setIsConnected(false)
    }
  }, [alertCount, setAlertCount])

  return { isConnected, lastAlert }
}
