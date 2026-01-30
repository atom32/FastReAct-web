'use client'

import { useApp } from '@/contexts/app-context'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EventPanel } from './event-panel'
import { Activity } from 'lucide-react'

export function MobileEventSheet() {
  const { events, isThinking } = useApp()

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="fixed bottom-24 right-4 z-40 gap-2 shadow-lg lg:hidden bg-transparent"
        >
          <Activity className="size-4" />
          <span>Events</span>
          {events.length > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1.5">
              {events.length}
            </Badge>
          )}
          {isThinking && (
            <span className="flex size-2 animate-pulse rounded-full bg-yellow-500" />
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full p-0 sm:max-w-lg">
        <SheetHeader className="sr-only">
          <SheetTitle>Event Timeline</SheetTitle>
        </SheetHeader>
        <div className="h-full">
          <EventPanel />
        </div>
      </SheetContent>
    </Sheet>
  )
}
