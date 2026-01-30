'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { AgentEvent, EventType } from '@/lib/types'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Brain,
  Wrench,
  Eye,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Clock,
} from 'lucide-react'

interface EventCardProps {
  event: AgentEvent
}

const eventConfig: Record<
  EventType,
  { icon: typeof Brain; color: string; bgColor: string; label: string }
> = {
  thought: {
    icon: Brain,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800',
    label: 'Thinking',
  },
  action: {
    icon: Wrench,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800',
    label: 'Action',
  },
  observation: {
    icon: Eye,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800',
    label: 'Observation',
  },
  answer: {
    icon: CheckCircle2,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800',
    label: 'Answer',
  },
  final: {
    icon: CheckCircle2,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800',
    label: 'Final',
  },
  error: {
    icon: AlertCircle,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800',
    label: 'Error',
  },
}

function formatTime(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function formatDuration(duration?: number) {
  if (!duration) return null
  if (duration < 1) return `${(duration * 1000).toFixed(0)}ms`
  return `${duration.toFixed(2)}s`
}

const TRUNCATE_LENGTH = 200

export function EventCard({ event }: EventCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const config = eventConfig[event.type] || eventConfig.thought
  const Icon = config.icon

  const shouldTruncate = (event.content?.length ?? 0) > TRUNCATE_LENGTH
  const displayContent = shouldTruncate && !isOpen
    ? `${event.content?.slice(0, TRUNCATE_LENGTH) ?? ''}...`
    : event.content ?? ''

  const duration = formatDuration(event.metadata.duration)
  const hasParameters = event.metadata.parameters && Object.keys(event.metadata.parameters).length > 0

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div
        className={cn(
          'rounded-lg border transition-all duration-200 animate-in fade-in-0 slide-in-from-right-2',
          config.bgColor
        )}
      >
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="flex w-full items-start justify-between gap-2 p-3 h-auto text-left hover:bg-transparent"
          >
            <div className="flex items-start gap-2 flex-1 min-w-0">
              {/* Icon */}
              <div className={cn('mt-0.5 shrink-0', config.color)}>
                <Icon className="size-4" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <Badge variant="outline" className={cn('text-xs', config.color)}>
                    {config.label}
                  </Badge>
                  {event.metadata.tool_name && (
                    <Badge variant="secondary" className="text-xs">
                      {event.metadata.tool_name}
                    </Badge>
                  )}
                  {event.metadata.iteration && (
                    <span className="text-xs text-muted-foreground">
                      Iteration {event.metadata.iteration}
                    </span>
                  )}
                </div>

                <p className="text-sm text-foreground/90 break-words whitespace-pre-wrap">
                  {displayContent}
                </p>
              </div>
            </div>

            {/* Right side */}
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="text-xs text-muted-foreground">
                {formatTime(event.metadata.timestamp)}
              </span>
              {duration && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="size-3" />
                  {duration}
                </span>
              )}
              {(shouldTruncate || hasParameters) && (
                <ChevronDown
                  className={cn(
                    'size-4 text-muted-foreground transition-transform duration-200',
                    isOpen && 'rotate-180'
                  )}
                />
              )}
            </div>
          </Button>
        </CollapsibleTrigger>

        {/* Expanded content */}
        <CollapsibleContent>
          <div className="border-t border-inherit px-3 pb-3 pt-2">
            {/* Full content if truncated */}
            {shouldTruncate && (
              <div className="mb-3">
                <p className="text-sm text-foreground/90 break-words whitespace-pre-wrap">
                  {event.content}
                </p>
              </div>
            )}

            {/* Parameters */}
            {hasParameters && (
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-1.5">
                  Parameters
                </h4>
                <pre className="overflow-x-auto rounded bg-background/50 p-2 text-xs">
                  {JSON.stringify(event.metadata.parameters, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}
