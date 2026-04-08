import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { dashboardWsURL } from '@/utils/network'
import { tokenName } from '@/utils/constants'

const RECONNECT_DELAY_MS = 3000
const MAX_RECONNECTS = 10

export const useDashboardWebSocket = () => {
  const queryClient = useQueryClient()
  const wsRef = useRef<WebSocket | null>(null)
  const reconnects = useRef(0)
  const unmounted = useRef(false)

  useEffect(() => {
    unmounted.current = false

    const connect = () => {
      if (unmounted.current) return
      const token = localStorage.getItem(tokenName)
      if (!token) return

      const ws = new WebSocket(`${dashboardWsURL}ws/dashboard/`)
      wsRef.current = ws

      ws.onopen = () => {
        reconnects.current = 0
        ws.send(JSON.stringify({ token }))
      }

      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data) as { event: string }
          if (msg.event === 'invoice_created') {
            queryClient.invalidateQueries({ queryKey: ['purchaseSummary'] })
            queryClient.invalidateQueries({ queryKey: ['topSellingProducts'] })
            queryClient.invalidateQueries({ queryKey: ['summaryByHour'] })
            queryClient.invalidateQueries({ queryKey: ['summaryByKeyframe'] })
            queryClient.invalidateQueries({ queryKey: ['summaryGeneral'] })
            queryClient.invalidateQueries({ queryKey: ['summaryByUser'] })
          }
        } catch {
          // ignore malformed messages
        }
      }

      ws.onclose = () => {
        if (unmounted.current) return
        if (reconnects.current < MAX_RECONNECTS) {
          reconnects.current++
          setTimeout(connect, RECONNECT_DELAY_MS)
        }
      }

      ws.onerror = () => ws.close()
    }

    connect()

    return () => {
      unmounted.current = true
      wsRef.current?.close()
    }
  }, [queryClient])
}
