import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { io } from 'socket.io-client'
import toast from 'react-hot-toast'
import useStore from '../store/useStore.js'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || `${window.location.protocol}//${window.location.hostname}:3002`

export function useAdsRealtime() {
  const user        = useStore((s) => s.user)
  const queryClient = useQueryClient()
  const socketRef   = useRef(null)

  useEffect(() => {
    if (!user?.token) return

    const socket = io(SOCKET_URL, {
      auth: { token: user.token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 3000,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('[useAdsRealtime] connected')
    })

    socket.on('newAdsDetected', ({ count, categories = [] } = {}) => {
      queryClient.invalidateQueries({ queryKey: ['ads'] })
      toast(`${count} new ad${count !== 1 ? 's' : ''} detected${categories.length ? ` in ${categories.slice(0, 2).join(', ')}` : ''}`, {
        icon: '📘',
        style: {
          background: '#1e1e3f',
          color: '#fff',
          border: '1px solid rgba(99,102,241,0.3)',
          borderRadius: '12px',
          fontSize: '14px',
        },
        duration: 5000,
      })
    })

    socket.on('connect_error', (err) => {
      console.warn('[useAdsRealtime] connection error:', err.message)
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [user?.token, queryClient])

  return socketRef
}
