'use client'

import React, { useEffect, useRef } from "react"

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { AgentEvent, Message, AppState } from '@/lib/types'
import { useWebSocket } from '@/hooks/use-websocket'

interface AppContextValue extends AppState {
  sendMessage: (content: string) => void
  clearChat: () => void
  clearEvents: () => void
  reconnect: () => void
  isDemo: boolean
}

const AppContext = createContext<AppContextValue | null>(null)

// Generate a random session ID
function generateSessionId() {
  return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Demo events to simulate AI agent behavior
const DEMO_EVENTS: Omit<AgentEvent, 'id'>[] = [
  {
    type: 'thought',
    content: 'The user is asking a question. Let me analyze what information I need to gather to provide a comprehensive answer.',
    metadata: {
      iteration: 1,
      timestamp: new Date().toISOString(),
      duration: 0.3,
    },
  },
  {
    type: 'action',
    content: 'Searching for relevant information using the web search tool.',
    metadata: {
      iteration: 1,
      tool_name: 'WebSearch',
      timestamp: new Date().toISOString(),
      parameters: {
        query: 'relevant search query',
        max_results: 5,
      },
      duration: 1.2,
    },
  },
  {
    type: 'observation',
    content: 'Found 5 relevant results:\n1. Result about topic A with key insights...\n2. Result about topic B with additional context...\n3. Result about topic C with supporting data...\n4. Result about topic D with expert opinions...\n5. Result about topic E with practical examples...',
    metadata: {
      iteration: 1,
      timestamp: new Date().toISOString(),
      duration: 0.1,
    },
  },
  {
    type: 'thought',
    content: 'I have gathered relevant information. Now I need to process and synthesize this data to form a coherent response.',
    metadata: {
      iteration: 2,
      timestamp: new Date().toISOString(),
      duration: 0.4,
    },
  },
  {
    type: 'action',
    content: 'Using the calculator to perform some calculations.',
    metadata: {
      iteration: 2,
      tool_name: 'Calculator',
      timestamp: new Date().toISOString(),
      parameters: {
        expression: '42 * 2 + 16',
      },
      duration: 0.05,
    },
  },
  {
    type: 'observation',
    content: 'Result: 100',
    metadata: {
      iteration: 2,
      timestamp: new Date().toISOString(),
      duration: 0.01,
    },
  },
  {
    type: 'thought',
    content: 'I now have all the information needed to provide a comprehensive answer to the user.',
    metadata: {
      iteration: 3,
      timestamp: new Date().toISOString(),
      duration: 0.2,
    },
  },
]

interface AppProviderProps {
  children: React.ReactNode
  wsUrl?: string
  demoMode?: boolean
}

export function AppProvider({
  children,
  wsUrl = 'ws://localhost:8080/ws',
  demoMode = false // Set to false to connect to real Gateway
}: AppProviderProps) {
  // Use ref to store session ID and useEffect to initialize it after hydration
  // This prevents hydration mismatch between server and client
  const sessionIdRef = useRef<string>(demoMode ? 'demo-session' : '')
  const [sessionId, setSessionId] = useState(() => demoMode ? 'demo-session' : '')

  useEffect(() => {
    if (!demoMode && !sessionIdRef.current) {
      sessionIdRef.current = generateSessionId()
      setSessionId(sessionIdRef.current)
    }
  }, [demoMode])

  const [messages, setMessages] = useState<Message[]>([])
  const [events, setEvents] = useState<AgentEvent[]>([])
  const [isThinking, setIsThinking] = useState(false)

  const handleEvent = useCallback((event: AgentEvent) => {
    setEvents((prev) => [...prev, event])
    
    // Set thinking state based on event type
    if (event.type === 'thought' || event.type === 'action') {
      setIsThinking(true)
    }
    
    // Handle final answer
    if (event.type === 'answer' || event.type === 'final' || event.type === 'error') {
      setIsThinking(false)
      
      // Add assistant message
      const assistantMessage: Message = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: event.content,
        timestamp: new Date().toISOString(),
        status: event.type === 'error' ? 'error' : 'sent',
      }
      setMessages((prev) => {
        // Update the last user message status if it was sending
        const updated = prev.map((msg) => 
          msg.status === 'sending' ? { ...msg, status: 'sent' as const } : msg
        )
        return [...updated, assistantMessage]
      })
    }
  }, [])

  const handleConnect = useCallback(() => {
    setIsThinking(false)
  }, [])

  const handleDisconnect = useCallback(() => {
    setIsThinking(false)
    // Mark any sending messages as error
    setMessages((prev) =>
      prev.map((msg) =>
        msg.status === 'sending' ? { ...msg, status: 'error' as const } : msg
      )
    )
  }, [])

  // Only use WebSocket in non-demo mode when sessionId is ready
  const wsUrlReady = !demoMode && sessionId !== ''
  const ws = useWebSocket({
    url: demoMode || !wsUrlReady ? 'ws://disabled' : `${wsUrl}/${sessionId}`,
    onEvent: handleEvent,
    onConnect: handleConnect,
    onDisconnect: handleDisconnect,
    autoReconnect: !demoMode && wsUrlReady,
  })

  // Demo mode: simulate response
  const simulateDemoResponse = useCallback(async (userMessage: string) => {
    // Add user message
    const newUserMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
      status: 'sent',
    }
    setMessages((prev) => [...prev, newUserMessage])
    setIsThinking(true)

    // Simulate events one by one with delays
    for (let i = 0; i < DEMO_EVENTS.length; i++) {
      const event = DEMO_EVENTS[i]
      await new Promise((resolve) => setTimeout(resolve, 600 + Math.random() * 300))

      const newEvent: AgentEvent = {
        ...event,
        id: `event-${Date.now()}-${i}`,
        metadata: {
          ...event.metadata,
          timestamp: new Date().toISOString(),
        },
      }
      setEvents((prev) => [...prev, newEvent])
    }

    // Add final answer
    await new Promise((resolve) => setTimeout(resolve, 400))
    setIsThinking(false)
    
    const answerContent = `Based on my research and analysis of "${userMessage}", here are my findings:\n\n1. **Key Insight**: The data suggests important patterns related to your query.\n2. **Analysis**: After examining multiple sources, I found relevant information.\n3. **Recommendation**: Consider these factors when making your decision.\n\nLet me know if you need any clarification!`
    
    const finalEvent: AgentEvent = {
      id: `event-${Date.now()}-final`,
      type: 'answer',
      content: answerContent,
      metadata: {
        iteration: 3,
        timestamp: new Date().toISOString(),
        duration: 0.3,
      },
    }
    setEvents((prev) => [...prev, finalEvent])

    const assistantMessage: Message = {
      id: `msg-${Date.now()}-assistant`,
      role: 'assistant',
      content: answerContent,
      timestamp: new Date().toISOString(),
      status: 'sent',
    }
    setMessages((prev) => [...prev, assistantMessage])
  }, [])

  const sendMessage = useCallback((content: string) => {
    if (!content.trim()) return

    if (demoMode) {
      simulateDemoResponse(content)
    } else {
      if (!ws.connected) return
      
      const message: Message = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content: content.trim(),
        timestamp: new Date().toISOString(),
        status: 'sending',
      }
      setMessages((prev) => [...prev, message])
      setIsThinking(true)
      ws.send(content)
    }
  }, [demoMode, ws, simulateDemoResponse])

  const clearChat = useCallback(() => {
    setMessages([])
  }, [])

  const clearEvents = useCallback(() => {
    setEvents([])
  }, [])

  const reconnect = useCallback(() => {
    if (!demoMode) {
      ws.reconnect()
    }
  }, [demoMode, ws])

  const value = useMemo<AppContextValue>(() => ({
    connected: demoMode ? true : ws.connected,
    connecting: demoMode ? false : ws.connecting,
    messages,
    events,
    sessionId,
    isThinking,
    sendMessage,
    clearChat,
    clearEvents,
    reconnect,
    isDemo: demoMode,
  }), [demoMode, ws.connected, ws.connecting, messages, events, sessionId, isThinking, sendMessage, clearChat, clearEvents, reconnect])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
