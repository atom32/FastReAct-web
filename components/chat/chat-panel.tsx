'use client'

import React from "react"

import { useCallback, useEffect, useRef, useState } from 'react'
import { useApp } from '@/contexts/app-context'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageBubble } from './message-bubble'
import { Send, Trash2, Loader2, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

const MAX_CHARS = 4000

export function ChatPanel() {
  const { messages, connected, isThinking, sendMessage, clearChat } = useApp()
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isThinking])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [input])

  const handleSend = useCallback(() => {
    if (!input.trim() || !connected || isThinking) return
    sendMessage(input)
    setInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [input, connected, isThinking, sendMessage])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
      // Ctrl/Cmd+K to clear chat
      if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        clearChat()
      }
    },
    [handleSend, clearChat]
  )

  const canSend = connected && input.trim().length > 0 && !isThinking

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Messages area */}
      <ScrollArea className="flex-1 p-4">
        <div className="flex flex-col gap-4">
          {messages.length === 0 ? (
            <div className="flex h-[calc(100vh-16rem)] flex-col items-center justify-center text-center">
              <div className="mb-4 rounded-full bg-muted p-4">
                <MessageSquare className="size-8 text-muted-foreground" />
              </div>
              <h3 className="mb-2 text-lg font-medium text-foreground">
                Start a conversation
              </h3>
              <p className="max-w-sm text-sm text-muted-foreground">
                Send a message to begin chatting with the AI agent. Watch the
                event panel to see the agent&apos;s reasoning process in real-time.
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))
          )}

          {/* Thinking indicator */}
          {isThinking && (
            <div className="flex animate-in fade-in-0 slide-in-from-bottom-2 duration-300 items-center gap-2 text-muted-foreground">
              <div className="flex size-8 items-center justify-center rounded-full bg-muted">
                <Loader2 className="size-4 animate-spin" />
              </div>
              <span className="text-sm">Thinking...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input area */}
      <div className="border-t bg-background p-4">
        <div className="flex items-end gap-2">
          {/* Clear button */}
          <Button
            variant="outline"
            size="icon"
            onClick={clearChat}
            disabled={messages.length === 0}
            className="shrink-0 bg-transparent"
            title="Clear chat (Ctrl+K)"
          >
            <Trash2 className="size-4" />
            <span className="sr-only">Clear chat</span>
          </Button>

          {/* Text input */}
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, MAX_CHARS))}
              onKeyDown={handleKeyDown}
              placeholder={
                connected ? 'Type a message...' : 'Waiting for connection...'
              }
              disabled={!connected}
              rows={1}
              className={cn(
                'w-full resize-none rounded-lg border bg-background px-4 py-3 pr-12 text-sm',
                'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'max-h-[200px] min-h-[48px]'
              )}
            />
            {/* Character counter */}
            <div className="absolute bottom-1 right-14 text-xs text-muted-foreground">
              {input.length}/{MAX_CHARS}
            </div>
          </div>

          {/* Send button */}
          <Button
            onClick={handleSend}
            disabled={!canSend}
            className={cn(
              'shrink-0 bg-indigo-600 hover:bg-indigo-700',
              canSend && 'animate-pulse'
            )}
            title="Send message (Enter)"
          >
            {isThinking ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            <span className="sr-only">Send message</span>
          </Button>
        </div>

        {/* Keyboard shortcuts hint */}
        <p className="mt-2 text-center text-xs text-muted-foreground">
          <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
            Enter
          </kbd>{' '}
          to send,{' '}
          <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
            Shift+Enter
          </kbd>{' '}
          for new line
        </p>
      </div>
    </div>
  )
}
