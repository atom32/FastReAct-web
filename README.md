# FastReAct Web

A modern web interface for FastReAct, built with Next.js and React.

## Overview

FastReAct Web is a real-time chat and event display interface. It provides a clean, responsive UI for monitoring events and managing conversations with WebSocket support.

## Tech Stack

- **Framework**: Next.js 16
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **Components**: Radix UI (via shadcn/ui)
- **Theme**: next-themes (dark/light mode support)
- **Language**: TypeScript

## Features

- Real-time chat interface
- Event display panel with cards
- Responsive design (mobile & desktop)
- Dark/light theme support
- WebSocket integration for live updates
- Mobile-optimized event sheet

## Project Structure

```
├── app/              # Next.js app directory
├── components/       # React components
│   ├── chat/        # Chat and event components
│   └── ui/          # UI component library
├── contexts/        # React contexts
├── hooks/           # Custom React hooks
├── lib/             # Utility functions and types
├── public/          # Static assets
└── styles/          # Global styles
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm, pnpm, or yarn

### Installation

```bash
# Install dependencies
npm install
# or
pnpm install
# or
yarn install
```

### Development

```bash
# Run development server
npm run dev
# or
pnpm dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
# Build for production
npm run build

# Start production server
npm run start
```

## Components

### Chat Components
- `ChatPanel` - Main chat interface
- `MessageBubble` - Individual message display
- `EventPanel` - Event list display
- `EventCard` - Single event card
- `MobileEventSheet` - Mobile-optimized event view
- `Header` - Application header

### UI Components
Full suite of reusable UI components including buttons, cards, dialogs, forms, and more (powered by Radix UI).

## Hooks

- `useWebSocket` - WebSocket connection management
- `useToast` - Toast notification system
- `useMobile` - Mobile detection utilities

## License

MIT
