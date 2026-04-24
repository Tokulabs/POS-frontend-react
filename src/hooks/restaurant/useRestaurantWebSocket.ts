import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { restaurantWsURL } from '@/utils/network'
import { tokenName } from '@/utils/constants'

type WsEvent =
  | 'order_created'
  | 'order_updated'
  | 'order_item_status'
  | 'order_billed'

const RECONNECT_DELAY_MS = 3000
const MAX_RECONNECTS     = 10

export const useRestaurantWebSocket = () => {
  const queryClient  = useQueryClient()
  const wsRef        = useRef<WebSocket | null>(null)
  const reconnects   = useRef(0)
  const unmounted    = useRef(false)

  useEffect(() => {
    unmounted.current = false

    const connect = () => {
      if (unmounted.current) return
      const token = localStorage.getItem(tokenName)
      if (!token) return

      // Token is sent as the first message after connect — never in the URL
      const url = `${restaurantWsURL}ws/restaurant/`
      const ws  = new WebSocket(url)
      wsRef.current = ws

      ws.onopen = () => {
        reconnects.current = 0
        ws.send(JSON.stringify({ token }))
      }

      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data) as { event: WsEvent; [key: string]: any }
          console.debug('[WS restaurant] event:', msg.event, msg)
          handleEvent(msg.event)
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

      ws.onerror = (err) => {
        console.debug('[WS restaurant] error', err)
        ws.close()
      }
    }

    const handleEvent = (event: WsEvent) => {
      if (['order_created', 'order_updated', 'order_item_status', 'order_billed'].includes(event)) {
        queryClient.invalidateQueries({ queryKey: ['restaurant-orders'] })
        queryClient.invalidateQueries({ queryKey: ['restaurant-order'] })
        queryClient.invalidateQueries({ queryKey: ['restaurant-tables'] })
      }
    }

    connect()

    return () => {
      unmounted.current = true
      wsRef.current?.close()
    }
  }, [queryClient])
}
