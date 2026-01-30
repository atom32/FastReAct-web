'use client'

import { ThemeProvider } from '@/components/theme-provider'
import { AppProvider } from '@/contexts/app-context'
import { Header } from '@/components/chat/header'
import { ChatPanel } from '@/components/chat/chat-panel'
import { EventPanel } from '@/components/chat/event-panel'
import { MobileEventSheet } from '@/components/chat/mobile-event-sheet'

export default function HomePage() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AppProvider>
        <div className="flex h-screen flex-col bg-background">
          <Header />
          <main className="flex flex-1 flex-col overflow-hidden lg:flex-row">
            {/* Chat Panel - 60% on desktop */}
            <div className="flex-1 lg:w-3/5 lg:flex-none">
              <ChatPanel />
            </div>
            {/* Event Panel - 40% on desktop, hidden on mobile */}
            <div className="hidden border-l lg:block lg:w-2/5">
              <EventPanel />
            </div>
          </main>
          {/* Mobile event sheet trigger */}
          <MobileEventSheet />
        </div>
      </AppProvider>
    </ThemeProvider>
  )
}
