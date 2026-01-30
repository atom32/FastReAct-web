'use client'

import { useTheme } from 'next-themes'
import { useApp } from '@/contexts/app-context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Zap,
  Moon,
  Sun,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react'
import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

export function Header() {
  const { connected, connecting, isThinking, sessionId, reconnect, isDemo } = useApp()
  const { theme, setTheme } = useTheme()
  const [copied, setCopied] = useState(false)

  const copySessionId = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(sessionId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      console.error('[v0] Failed to copy session ID:', e)
    }
  }, [sessionId])

  const getConnectionStatus = () => {
    if (connecting) {
      return { color: 'bg-yellow-500', text: 'Connecting...' }
    }
    if (isThinking) {
      return { color: 'bg-yellow-500 animate-pulse', text: 'Thinking...' }
    }
    if (connected) {
      return { color: 'bg-emerald-500', text: 'Connected' }
    }
    return { color: 'bg-red-500', text: 'Disconnected' }
  }

  const status = getConnectionStatus()

  return (
    <header className="sticky top-0 z-50 border-b bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-800 dark:to-purple-800">
      <div className="flex h-14 items-center justify-between px-4 md:px-6">
        {/* Logo and title */}
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-white/20">
            <Zap className="size-5 text-white" />
          </div>
          <h1 className="text-lg font-bold text-white md:text-xl">FastReAct</h1>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Demo mode indicator */}
          {isDemo && (
            <Badge className="bg-amber-500/90 text-white hover:bg-amber-500/90">
              Demo Mode
            </Badge>
          )}
          
          {/* Session ID */}
          <button
            onClick={copySessionId}
            className="hidden items-center gap-1.5 rounded-md bg-white/10 px-2 py-1 text-xs text-white/80 transition-colors hover:bg-white/20 md:flex"
            title="Click to copy session ID"
          >
            <span className="max-w-32 truncate font-mono">{sessionId}</span>
            {copied ? (
              <Check className="size-3 text-emerald-400" />
            ) : (
              <Copy className="size-3" />
            )}
          </button>

          {/* Connection status */}
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="gap-1.5 bg-white/20 text-white hover:bg-white/20"
            >
              <span className={cn('size-2 rounded-full', status.color)} />
              <span className="hidden sm:inline">{status.text}</span>
            </Badge>

            {/* Reconnect button when disconnected */}
            {!connected && !connecting && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={reconnect}
                className="text-white hover:bg-white/20"
                title="Reconnect"
              >
                <RefreshCw className="size-4" />
              </Button>
            )}
          </div>

          {/* Dark mode toggle */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="text-white hover:bg-white/20"
          >
            <Sun className="size-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute size-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
