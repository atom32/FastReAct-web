'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { AgentEvent, ClientMessage } from '@/lib/types'

interface UseWebSocketOptions {
  url: string
  onEvent?: (event: AgentEvent) => void
  onConnect?: () => void
  onDisconnect?: () => void
  autoReconnect?: boolean
}

interface UseWebSocketReturn {
  connected: boolean
  connecting: boolean
  send: (message: string) => void
  disconnect: () => void
  reconnect: () => void
}

const RECONNECT_DELAYS = [1000, 2000, 5000, 10000]

export function useWebSocket({
  url,
  onEvent,
  onConnect,
  onDisconnect,
  autoReconnect = true,
}: UseWebSocketOptions): UseWebSocketReturn {
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectAttemptRef = useRef(0)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const mountedRef = useRef(true)

  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
  }, [])

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return
    if (wsRef.current?.readyState === WebSocket.CONNECTING) return

    setConnecting(true)
    clearReconnectTimeout()

    try {
      const ws = new WebSocket(url)

      ws.onopen = () => {
        if (!mountedRef.current) return
        setConnected(true)
        setConnecting(false)
        reconnectAttemptRef.current = 0
        onConnect?.()
      }

      ws.onclose = () => {
        if (!mountedRef.current) return
        setConnected(false)
        setConnecting(false)
        onDisconnect?.()

        // Auto-reconnect with exponential backoff
        if (autoReconnect && mountedRef.current) {
          const delay = RECONNECT_DELAYS[
            Math.min(reconnectAttemptRef.current, RECONNECT_DELAYS.length - 1)
          ]
          reconnectAttemptRef.current++
          reconnectTimeoutRef.current = setTimeout(connect, delay)
        }
      }

      ws.onerror = () => {
        if (!mountedRef.current) return
        setConnecting(false)
      }

      ws.onmessage = (event) => {
        if (!mountedRef.current) return
        try {
          const data = JSON.parse(event.data)
          console.log('[WebSocket] Received:', data)

          const agentEvent: AgentEvent = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: data.type,
            content: data.content || '',
            metadata: {
              ...data.metadata,
              timestamp: data.metadata?.timestamp || new Date().toISOString(),
            },
          }
          console.log('[WebSocket] Processed event:', agentEvent)
          onEvent?.(agentEvent)
        } catch (e) {
          console.error('[v0] Failed to parse WebSocket message:', e)
          console.error('[v0] Raw data:', event.data)
        }
      }

      wsRef.current = ws
    } catch (e) {
      setConnecting(false)
      console.error('[v0] Failed to create WebSocket:', e)
    }
  }, [url, onEvent, onConnect, onDisconnect, autoReconnect, clearReconnectTimeout])

  const disconnect = useCallback(() => {
    clearReconnectTimeout()
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
  }, [clearReconnectTimeout])

  const reconnect = useCallback(() => {
    reconnectAttemptRef.current = 0
    disconnect()
    connect()
  }, [connect, disconnect])

  const send = useCallback((content: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const message: ClientMessage = {
        type: 'message',
        content,
        timestamp: new Date().toISOString(),
      }
      wsRef.current.send(JSON.stringify(message))
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    connect()

    return () => {
      mountedRef.current = false
      clearReconnectTimeout()
      disconnect()
    }
  }, [connect, disconnect, clearReconnectTimeout])

  return { connected, connecting, send, disconnect, reconnect }
}
