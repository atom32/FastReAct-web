'use client'

import { cn } from '@/lib/utils'
import type { Message } from '@/lib/types'
import { Check, Clock, AlertCircle, User, Bot } from 'lucide-react'

interface MessageBubbleProps {
  message: Message
}

function formatTime(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div
      className={cn(
        'flex w-full animate-in fade-in-0 slide-in-from-bottom-2 duration-300',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'flex max-w-[85%] gap-2 md:max-w-[75%]',
          isUser ? 'flex-row-reverse' : 'flex-row'
        )}
      >
        {/* Avatar */}
        <div
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-full',
            isUser
              ? 'bg-indigo-600 text-white'
              : 'bg-muted text-muted-foreground'
          )}
        >
          {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
        </div>

        {/* Message content */}
        <div className="flex flex-col gap-1">
          <div
            className={cn(
              'rounded-2xl px-4 py-2.5',
              isUser
                ? 'bg-indigo-600 text-white'
                : 'bg-muted text-foreground'
            )}
          >
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
              {message.content}
            </p>
          </div>

          {/* Timestamp and status */}
          <div
            className={cn(
              'flex items-center gap-1.5 px-1 text-xs text-muted-foreground',
              isUser ? 'justify-end' : 'justify-start'
            )}
          >
            <span>{formatTime(message.timestamp)}</span>
            {isUser && (
              <span className="flex items-center">
                {message.status === 'sending' && (
                  <Clock className="size-3 animate-pulse" />
                )}
                {message.status === 'sent' && (
                  <Check className="size-3 text-emerald-500" />
                )}
                {message.status === 'error' && (
                  <AlertCircle className="size-3 text-red-500" />
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
