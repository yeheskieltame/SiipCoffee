# SiipCoffee Frontend

Next-generation intelligent ordering application built with Next.js 15, featuring AI-powered chat integration with futuristic tech aesthetics and seamless dark/light mode support.

## 🚀 Features

### Landing Page
- **Vortex Background Animation**: Mesmerizing particle effects using simplex noise with tech colors
- **Typewriter Effect**: Animated text showcasing future-ready ordering
- **3D Marquee Gallery**: Dynamic experience showcase with smooth animations
- **Interactive Navigation**: Dropdown menus with smooth transitions
- **Glass Morphism**: Modern glass effects with backdrop blur
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### Chat Application
- **AI-Powered Chat**: Direct integration with backend NLP system
- **Smart Input**: Vanishing input animations with intelligent placeholder cycling
- **Loading States**: Multi-step loader with futuristic animations
- **Real-time Messaging**: Instant chat responses with formatting
- **Quick Actions**: Tech-themed buttons for common requests
- **Theme Toggle**: Seamless dark/light mode switching

### UI Components
- **HoverBorderGradient**: Beautiful gradient hover effects with tech colors
- **Motion Animations**: Smooth transitions using Framer Motion
- **Tech Theme**: Modern purple/blue gradient color palette
- **Dark/Light Mode**: Full support with system preference detection
- **Glass Effects**: Modern glass morphism design elements

## 🛠 Tech Stack

- **Framework**: Next.js 15.3.4
- **Styling**: Tailwind CSS v4
- **Animations**: Motion (Framer Motion)
- **TypeScript**: Full type safety
- **Icons**: Lucide React & Tabler Icons
- **Package Manager**: pnpm

## 📦 Dependencies

### UI Libraries
- `motion/react` - Animation library
- `simplex-noise` - Noise generation for Vortex
- `class-variance-authority` - Component variants
- `tailwind-merge` - Tailwind utility merging
- `clsx` - Conditional class names
- `next-themes` - Theme management

### Onchain Integration (Future)
- `@coinbase/onchainkit` - Base blockchain integration
- `viem` - Ethereum library
- `wagmi` - React hooks for Ethereum
- `@farcaster/miniapp-sdk` - Social integration

## 🎨 Design System

### Color Palette
- **Primary**: Tech-themed purple/blue gradients
- **Background**: Clean, modern design with glass morphism
- **Accent**: Futuristic tech tones
- **Typography**: Inter font family
- **Dark Mode**: Full support with automatic system detection

### Theme Features
- **Light Mode**: Clean white backgrounds with tech gradients
- **Dark Mode**: Dark backgrounds with vibrant tech accents
- **Theme Toggle**: Smooth transitions between modes
- **System Preference**: Respects OS theme settings

### Components Structure
```
components/
├── ui/
│   ├── vortex.tsx              # Particle background
│   ├── typewriter-effect.tsx   # Animated text
│   ├── placeholders-and-vanish-input.tsx  # Chat input
│   ├── navbar-menu.tsx         # Navigation
│   ├── multi-step-loader.tsx   # Loading states
│   ├── hover-border-gradient.tsx  # Button effects
│   └── 3d-marquee.tsx          # Image gallery
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm package manager
- Backend API server running on localhost:8000

### Installation

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Environment Setup**
   ```bash
   # .env.local is already configured
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NODE_ENV=development
   ```

3. **Start Backend Server**
   ```bash
   # In the Backend directory
   python api_server.py
   ```

4. **Start Development Server**
   ```bash
   pnpm dev
   ```

5. **Open Application**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Application Structure

### Routes
- **/** - Landing page with hero section and features
- **/chat** - Interactive chat interface for ordering
- **/admin** - (Future) Admin panel for coffee management

### API Integration

The application integrates with the SiipCoffee backend API:

#### Chat API
```typescript
// Send message to AI assistant
const response = await apiService.chat({
  message: "I'd like an espresso",
  user_id: "unique_user_id"
});
```

#### Menu API
```typescript
// Get full menu
const menu = await apiService.getMenu();

// Get menu by category
const coffeeMenu = await apiService.getMenuByCategory("coffee");
```

#### Order Status
```typescript
// Check current order status
const orderStatus = await apiService.getOrderStatus("user_id");
```

## 🎯 Usage

### Ordering Coffee
1. Navigate to `/chat`
2. Type your order in natural language
3. AI assistant will guide you through the process
4. Complete payment and receive receipt

### Features
- **Natural Language Processing**: Order using conversational language
- **Menu Recommendations**: Get AI-powered suggestions
- **Order Tracking**: Monitor your order status in real-time
- **Customization**: Personalize your coffee preferences

## 🔧 Development

### Building for Production
```bash
pnpm build
pnpm start
```

### Linting
```bash
pnpm lint
```

## 🎨 Customization

### Theme Configuration
Edit `app/globals.css` to customize:
- Color palette
- Typography
- Spacing
- Animations

### Component Styling
All components use Tailwind CSS with custom tech theme:
- `--tech-50` to `--tech-900` color scale with purple/blue gradients
- Glass morphism utilities
- Animation classes
- Dark/light mode variables

## 📸 Features Overview

### Landing Page
- Hero section with Vortex animation and typewriter effect
- Interactive navigation with dropdown menus featuring tech options
- Feature showcase with animated cards highlighting AI capabilities
- 3D Marquee gallery for experience showcase
- Call-to-action sections with tech-themed gradients
- Theme toggle for seamless dark/light switching

### Chat Interface
- Real-time messaging with AI-powered ordering assistant
- Smart input with animated placeholders and tech styling
- Multi-step loading animations with futuristic design
- Quick action buttons for common requests with tech styling
- Receipt formatting for completed orders with tech theme
- Glass morphism effects for modern aesthetics

## 🚀 Future Enhancements

### Phase 1: Core Features ✅
- [x] Landing page with modern UI
- [x] Chat interface with API integration
- [x] Responsive design
- [x] Beautiful animations and interactions

### Phase 2: Advanced Features
- [ ] User authentication
- [ ] Order history
- [ ] Payment integration
- [ ] Push notifications

### Phase 3: Onchain Integration
- [ ] Smart contracts
- [ ] Crypto payments
- [ ] Loyalty tokens
- [ ] NFT rewards

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Backend NLP system for AI-powered ordering
- Tailwind CSS for utility-first styling
- Framer Motion for beautiful animations
- Unsplash for coffee photography