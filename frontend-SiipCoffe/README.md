# SiipCoffe Frontend

A modern, AI-powered coffee ordering miniapp built with Next.js 15, TypeScript, and Tailwind CSS.

## Features

- 🤖 **AI Chat Interface**: Natural language ordering powered by backend NLP
- 📱 **Mini-App Support**: Farcaster miniapp with Coinbase integration
- 🛒 **Shopping Cart**: Full cart management with quantity controls
- 📋 **Dynamic Menu**: Real-time menu data from backend API
- 💳 **Crypto Payments**: Coinbase wallet integration
- 🎨 **Modern UI**: Glassmorphism effects and smooth animations
- 📊 **Connection Status**: Real-time backend connection monitoring

## Prerequisites

- Node.js 18+
- Backend server running on `http://localhost:8000`

## Getting Started

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Environment Setup**:
   ```bash
   cp .env.local.example .env.local
   ```

   Configure your backend URL in `.env.local`:
   ```
   NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
   ```

3. **Start the backend server** first (in a separate terminal):
   ```bash
   cd ../Backend
   python api_server.py
   ```

4. **Start the development server**:
   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
frontend-SiipCoffe/
├── app/                    # Next.js 15 app router
│   ├── api/               # API routes (backend proxy)
│   │   └── chat/          # Chat endpoint proxy
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Main application page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── ChatInterface.tsx  # AI chat component
│   └── HeroSection.tsx   # Landing hero section
├── types/                # TypeScript type definitions
│   └── coffee.ts         # Coffee types
└── lib/                  # Utility functions
    └── utils.ts          # Shared utilities
```

## API Integration

The frontend communicates with the backend through Next.js API routes:

- `POST /api/chat` → `BACKEND_URL/api/chat` (AI-powered ordering)

## Key Components

### Main Application (`app/page.tsx`)
- Mini-app navigation with bottom tabs (Home & AI Barista)
- Real-time backend connection status
- Chat-focused ordering experience
- Page routing (Home, Chat)

### Chat Interface (`components/ChatInterface.tsx`)
- AI-powered conversation interface for ordering
- Suggested items display from backend
- Natural language ordering (no manual cart)
- Typing indicators and error handling

### Hero Section (`components/HeroSection.tsx`)
- Landing page with onboarding
- Focus on AI-powered ordering
- Direct navigation to chat interface

## Environment Variables

- `NEXT_PUBLIC_BACKEND_URL`: Backend server URL (default: `http://localhost:8000`)
- `NODE_ENV`: Environment (development/production)

## Build & Deploy

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

## Troubleshooting

1. **Backend Connection Issues**:
   - Ensure backend server is running on port 8000
   - Check CORS settings in backend
   - Verify `NEXT_PUBLIC_BACKEND_URL` is correct

2. **Menu Not Loading**:
   - Check backend health endpoint: `http://localhost:8000/api/health`
   - Check browser console for API errors
   - Verify menu data JSON structure

3. **Chat Not Working**:
   - Ensure NLP backend is responding
   - Check `/api/chat` endpoint logs
   - Verify message format matches backend expectations

## Learn More

To learn more about OnchainKit, see our [documentation](https://docs.base.org/onchainkit).

To learn more about Next.js, see the [Next.js documentation](https://nextjs.org/docs).
