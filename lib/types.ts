// WebSocket Event Types
export type EventType = 'thought' | 'action' | 'observation' | 'answer' | 'error' | 'final'

export interface EventMetadata {
  iteration?: number
  tool_name?: string
  duration?: number
  timestamp: string
  parameters?: Record<string, unknown>
}

export interface AgentEvent {
  id: string
  type: EventType
  content: string
  metadata: EventMetadata
}

export interface FinalResponse {
  type: 'final'
  content: string
  stats: {
    iterations: number
    total_time: number
  }
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  status: 'sending' | 'sent' | 'error'
}

export interface AppState {
  connected: boolean
  connecting: boolean
  messages: Message[]
  events: AgentEvent[]
  sessionId: string
  isThinking: boolean
}

// WebSocket message types
export interface ClientMessage {
  type: 'message'
  content: string
  timestamp: string
}
