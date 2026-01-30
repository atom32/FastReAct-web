'use client'

import { useMemo, useRef, useEffect } from 'react'
import { useApp } from '@/contexts/app-context'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { EventCard } from './event-card'
import { Activity, Brain, Wrench, Clock, Trash2 } from 'lucide-react'

export function EventPanel() {
  const { events, isThinking, clearEvents } = useApp()
  const eventsEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to latest event
  useEffect(() => {
    eventsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [events])

  // Calculate stats
  const stats = useMemo(() => {
    const thoughts = events.filter((e) => e.type === 'thought').length
    const actions = events.filter((e) => e.type === 'action').length
    const totalTime = events.reduce(
      (acc, e) => acc + (e.metadata.duration || 0),
      0
    )
    const maxIteration = Math.max(
      ...events.map((e) => e.metadata.iteration || 0),
      0
    )
    return { thoughts, actions, totalTime, iterations: maxIteration }
  }, [events])

  return (
    <div className="flex h-full flex-col bg-muted/30">
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-background px-4 py-3">
        <div className="flex items-center gap-2">
          <Activity className="size-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="font-semibold text-foreground">Event Timeline</h2>
          {isThinking && (
            <span className="flex size-2 animate-pulse rounded-full bg-yellow-500" />
          )}
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={clearEvents}
          disabled={events.length === 0}
          title="Clear events"
        >
          <Trash2 className="size-4" />
          <span className="sr-only">Clear events</span>
        </Button>
      </div>

      {/* Events list */}
      <ScrollArea className="flex-1 p-4">
        <div className="flex flex-col gap-3">
          {events.length === 0 ? (
            <div className="flex h-[calc(100vh-20rem)] flex-col items-center justify-center text-center">
              <div className="mb-4 rounded-full bg-muted p-4">
                <Activity className="size-8 text-muted-foreground" />
              </div>
              <h3 className="mb-2 text-lg font-medium text-foreground">
                Waiting for events
              </h3>
              <p className="max-w-sm text-sm text-muted-foreground">
                Send a message to see the AI agent&apos;s reasoning process and tool
                calls in real-time.
              </p>
            </div>
          ) : (
            events.map((event) => <EventCard key={event.id} event={event} />)
          )}
          <div ref={eventsEndRef} />
        </div>
      </ScrollArea>

      {/* Summary section */}
      {events.length > 0 && (
        <div className="border-t bg-background p-4">
          <h3 className="mb-3 text-sm font-medium text-foreground">Summary</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 p-2">
              <Brain className="size-4 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {stats.thoughts}
                </p>
                <p className="text-xs text-muted-foreground">Thoughts</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-purple-50 dark:bg-purple-950/30 p-2">
              <Wrench className="size-4 text-purple-600 dark:text-purple-400" />
              <div>
                <p className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                  {stats.actions}
                </p>
                <p className="text-xs text-muted-foreground">Tool Calls</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-2">
              <Clock className="size-4 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                  {stats.totalTime.toFixed(2)}s
                </p>
                <p className="text-xs text-muted-foreground">Total Time</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 p-2">
              <Activity className="size-4 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="text-lg font-semibold text-amber-600 dark:text-amber-400">
                  {stats.iterations}
                </p>
                <p className="text-xs text-muted-foreground">Iterations</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
