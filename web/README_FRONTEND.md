# SiipCoffee Frontend - Next.js Application

Frontend aplikasi mobile-first untuk sistem ordering kafe dengan AI assistant dan pembayaran cryptocurrency.

## 🚀 Features

- **🤖 AI Chat Assistant**: Integrasi dengan Gemini 2.5 Flash untuk ordering cerdas
- **📱 Mobile-First Design**: UI yang dioptimalkan untuk mobile devices
- **💰 Crypto Payments**: Support pembayaran Bitcoin dan Ethereum
- **🔄 Real-time Updates**: WebSocket untuk update order real-time
- **🎨 Beautiful UI**: Modern design dengan Tailwind CSS dan Radix UI
- **🔐 Secure Authentication**: JWT-based authentication system

## 🛠 Tech Stack

- **Framework**: Next.js 15 dengan App Router
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand
- **HTTP Client**: Axios + SWR
- **Real-time**: WebSocket
- **Forms**: React Hook Form + Zod validation
- **Notifications**: Sonner (toast notifications)

## 📦 Dependencies

### Core Dependencies
```json
{
  "next": "15.2.4",
  "react": "^19",
  "react-dom": "^19",
  "typescript": "^5"
}
```

### UI & Styling
```json
{
  "tailwindcss": "^4.1.9",
  "@radix-ui/*": "latest",
  "lucide-react": "^0.454.0",
  "class-variance-authority": "^0.7.1"
}
```

### API & Data
```json
{
  "axios": "^1.7.7",
  "swr": "^2.2.5",
  "react-query": "^3.39.3",
  "socket.io-client": "^4.8.0"
}
```

### State & Forms
```json
{
  "zustand": "^5.0.1",
  "react-hook-form": "^7.60.0",
  "zod": "3.25.76",
  "@hookform/resolvers": "^3.10.0"
}
```

## 🏗 Project Structure

```
web/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes
│   │   ├── login/
│   │   └── signup/
│   ├── customer/                 # Customer routes
│   │   ├── cafes/               # Cafe selection
│   │   ├── chat/[cafeId]/       # AI Chat interface
│   │   ├── orders/              # Order history
│   │   └── profile/             # User profile
│   ├── owner/                   # Owner routes
│   │   ├── dashboard/           # Analytics dashboard
│   │   ├── menu/                # Menu management
│   │   └── orders/              # Order management
│   └── layout.tsx               # Root layout
├── components/                   # Reusable components
│   ├── ui/                      # shadcn/ui components
│   ├── animated-background.tsx
│   ├── chat-message.tsx
│   ├── order-summary.tsx
│   ├── order-receipt.tsx
│   └── ...
├── lib/                         # Utilities & configurations
│   ├── api.ts                   # API client
│   ├── auth.ts                  # Authentication utilities
│   ├── store.ts                 # Zustand stores
│   ├── types.ts                 # TypeScript types
│   └── utils.ts                 # Helper functions
├── hooks/                       # Custom React hooks
├── public/                      # Static assets
└── styles/                      # Global styles
```

## 🔧 Setup

### 1. Install Dependencies
```bash
pnpm install
# atau
npm install
```

### 2. Environment Configuration
Copy `.env.local.example` ke `.env.local`:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080

# App Configuration
NEXT_PUBLIC_APP_NAME=SiipCoffee
NEXT_PUBLIC_APP_VERSION=1.0.0

# Feature Flags
NEXT_PUBLIC_ENABLE_AI_CHAT=true
NEXT_PUBLIC_ENABLE_CRYPTO_PAYMENT=true
NEXT_PUBLIC_ENABLE_REAL_TIME_ORDERS=true
```

### 3. Run Development Server
```bash
pnpm dev
# atau
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

## 📱 Pages & Routes

### Authentication
- `/login/customer` - Customer login
- `/login/owner` - Owner login
- `/signup/customer` - Customer registration
- `/signup/owner` - Owner registration

### Customer Routes
- `/customer/cafes` - Cafe selection page
- `/customer/chat/[cafeId]` - AI chat interface
- `/customer/orders` - Order history
- `/customer/profile` - User profile

### Owner Routes
- `/owner/dashboard` - Analytics dashboard
- `/owner/menu` - Menu management
- `/owner/orders` - Order management
- `/owner/settings` - Settings

## 🤖 AI Integration

### Gemini 2.5 Flash Integration
```typescript
// Chat dengan AI
const response = await chatApi.sendMessage({
  message: "Saya mau pesan kopi apa yang enak?",
  session_id: sessionId
});

// Response format
{
  message: "Saya sarankan Cappuccino. Ini espresso dengan susu foam yang lembut...",
  intent: "order",
  order_intent: {
    action: "create_order",
    items: [{ menu_id: "1", name: "Cappuccino", quantity: 1, price: 25000 }],
    order_type: "dine_in"
  },
  should_confirm: true
}
```

### Features
- **Natural Language Processing**: Memahami pesanan dalam bahasa alami
- **Smart Recommendations**: Rekomendasi menu berdasarkan preferensi
- **Order Intent Detection**: Otomatis mendeteksi intent pesanan
- **Context Awareness**: Memory percakapan untuk user experience yang lebih baik

## 💳 Payment Integration

### Cryptocurrency Support
```typescript
// Process crypto payment
const payment = await paymentApi.processPayment({
  order_id: "order-123",
  method: "crypto",
  amount: 50000
});

// Response
{
  payment_id: "payment-123",
  wallet_address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
  qr_code: "bitcoin:bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh?amount=0.0005",
  crypto_amount: 0.0005,
  fiat_amount: 50000,
  status: "awaiting_payment"
}
```

## 🔄 State Management

### Zustand Stores
```typescript
// Authentication Store
const { user, isAuthenticated, login, logout } = useAuthStore();

// Cart Store
const { items, addItem, removeItem, getTotalPrice } = useCartStore();

// Chat Store
const { messages, addMessage, isLoading } = useChatStore();

// Menu Store
const { menus, categories, selectedCategory } = useMenuStore();
```

## 🎨 UI Components

### shadcn/ui Components
- Buttons, Cards, Forms, Inputs
- Dialogs, Sheets, Drawers
- Navigation, Tabs, Accordions
- Tables, Charts, Progress indicators

### Custom Components
- `AnimatedBackground` - Animated gradient background
- `ChatMessage` - Chat bubble component
- `OrderSummary` - Collapsible order summary
- `OrderReceipt` - Digital receipt display
- `LoadingSpinner` - Custom loading animations

## 📱 Responsive Design

### Mobile-First Approach
- Breakpoints: `sm (640px)`, `md (768px)`, `lg (1024px)`
- Touch-friendly interactions
- Optimized for mobile keyboards
- Bottom navigation for easy thumb access

### Design System
- Primary: Pink gradient (`from-pink-400 to-pink-500`)
- Secondary: Purple accents
- Neutral: Gray scale for text
- Success: Green
- Error: Red

## 🔒 Security Features

### Authentication
- JWT tokens with expiration
- Automatic token refresh
- Secure token storage (localStorage)
- Role-based access control

### API Security
- Request/response interceptors
- Automatic error handling
- Rate limiting prevention
- CORS configuration

## 🧪 Testing

### Component Testing
```bash
pnpm test
# atau
npm test
```

### E2E Testing (coming soon)
```bash
pnpm test:e2e
```

## 🚀 Deployment

### Build for Production
```bash
pnpm build
pnpm start
```

### Environment Variables
Production:
```env
NEXT_PUBLIC_API_URL=https://api.siipcoffe.com
NODE_ENV=production
```

## 🔄 Real-time Features

### WebSocket Integration
```typescript
// Connect to chat WebSocket
const ws = chatApi.connectWebSocket(sessionId, token);

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Handle real-time messages
};
```

### Real-time Order Updates
- Order status changes
- Payment confirmations
- AI responses
- Chat messages

## 📊 Analytics & Monitoring

### User Behavior Tracking
- Page views
- Chat interactions
- Order conversions
- Payment methods

### Performance Monitoring
- API response times
- WebSocket connection status
- Error rates
- User engagement metrics

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 API Integration

### Backend API Endpoints
- Authentication: `/api/v1/auth/*`
- Menu: `/api/v1/menu/*`
- Orders: `/api/v1/orders/*`
- Chat: `/api/v1/chat/*`
- Payments: `/api/v1/payment/*`

### Error Handling
```typescript
try {
  const data = await api.get('/menu');
  // Handle success
} catch (error) {
  // Automatic error handling by axios interceptor
  toast.error('Failed to load menu');
}
```

## 🎯 Next Steps

### Planned Features
- [ ] Push notifications for order updates
- [ ] Voice input for AI chat
- [ ] Loyalty program integration
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Offline mode support

### Performance Optimizations
- [ ] Image optimization
- [ ] Code splitting
- [ ] Caching strategies
- [ ] Bundle size optimization

## 📞 Support

For support and questions:
- Email: support@siipcoffe.com
- Documentation: [API Docs](../docs/api.md)
- Issues: GitHub Issues

---

Made with ❤️ and ☕ by SiipCoffee Team