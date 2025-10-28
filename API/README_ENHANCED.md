# SiipCoffee Enhanced API Documentation

## Overview

The SiipCoffee Enhanced API is a comprehensive backend system for coffee shop management with multi-role support (customers and cafe owners), advanced features including inventory management, loyalty programs, and real-time analytics.

## 🚀 Features

### Core Features
- **Multi-role Authentication**: Customer and Cafe Owner roles with JWT-based authentication
- **Cafe Management**: Complete cafe profile management with business hours, location, and settings
- **Menu Management**: Dynamic menu with categories, pricing, availability, and customization options
- **Order Management**: Full order lifecycle with status tracking and payment processing
- **Real-time Chat**: AI-powered chat interface with Google Gemini integration
- **Payment Processing**: Multiple payment methods including cryptocurrency support

### Enhanced Features
- **Inventory Management**: Stock tracking, movements, low-stock alerts, and supplier management
- **Customer Loyalty Programs**: Points system, tiers, rewards, and member management
- **Advanced Analytics**: Sales reports, popular items, revenue tracking, and performance metrics
- **User Profiles**: Comprehensive profile management with avatars and preferences
- **Cafe Reviews**: Customer rating and review system
- **Notifications**: Real-time order updates and promotional notifications

## 🏗️ Architecture

### Technology Stack
- **Backend**: Go with Fiber framework
- **Database**: SQLite with GORM ORM (easily configurable for PostgreSQL/MySQL)
- **Authentication**: JWT tokens with bcrypt password hashing
- **AI Integration**: Google Gemini API for conversational ordering
- **Real-time**: WebSocket support for live updates
- **Validation**: Request validation and error handling

### Database Schema
```
Users (Customers & Owners)
├── Cafes (Owner profiles)
│   ├── Menus (Cafe menu items)
│   ├── Orders (Customer orders)
│   ├── Inventory (Stock management)
│   ├── Loyalty Programs
│   └── Reviews
├── Orders (Customer order history)
├── Loyalty Memberships
└── Chat Sessions
```

## 📋 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh JWT token

### User Profile Management
- `GET /api/v1/user/profile` - Get user profile
- `PUT /api/v1/user/profile` - Update user profile
- `PUT /api/v1/user/password` - Change password
- `POST /api/v1/user/avatar` - Upload avatar
- `GET /api/v1/user/orders` - Get user orders
- `GET /api/v1/user/loyalty` - Get loyalty information
- `GET /api/v1/user/favorites` - Get favorite cafes

### Cafe Management (Public)
- `GET /api/v1/cafes` - Get all cafes (with pagination and search)
- `GET /api/v1/cafes/:id` - Get cafe details
- `GET /api/v1/cafes/:id/reviews` - Get cafe reviews
- `POST /api/v1/cafes/:id/reviews` - Add cafe review (customers only)

### Cafe Management (Owner)
- `POST /api/v1/owner/cafe` - Create cafe profile
- `GET /api/v1/owner/cafe` - Get my cafe
- `PUT /api/v1/owner/cafe` - Update cafe profile
- `PUT /api/v1/owner/cafe/toggle-status` - Toggle open/closed status
- `GET /api/v1/owner/cafe/analytics` - Get cafe analytics

### Menu Management
- `GET /api/v1/menu/cafe/:cafeId` - Get cafe menu
- `GET /api/v1/menu/:id` - Get menu item details
- `POST /api/v1/menu` - Create menu item (owners only)
- `PUT /api/v1/menu/:id` - Update menu item (owners only)
- `DELETE /api/v1/menu/:id` - Delete menu item (owners only)

### Order Management
- `GET /api/v1/orders` - Get user orders
- `GET /api/v1/orders/:id` - Get order details
- `POST /api/v1/orders` - Create new order
- `PUT /api/v1/orders/:id/status` - Update order status (owners only)

### Inventory Management (Owners Only)
- `GET /api/v1/inventory` - Get inventory items
- `POST /api/v1/inventory` - Create inventory item
- `PUT /api/v1/inventory/:id` - Update inventory item
- `DELETE /api/v1/inventory/:id` - Delete inventory item
- `POST /api/v1/inventory/:id/movements` - Add stock movement
- `GET /api/v1/inventory/:id/movements` - Get stock movements
- `GET /api/v1/inventory/reports/low-stock` - Get low stock items
- `GET /api/v1/inventory/reports/expiring` - Get expiring items

### Loyalty Program
- `GET /api/v1/loyalty/cafe/:cafeId` - Get loyalty program
- `POST /api/v1/loyalty/cafe/:cafeId/join` - Join loyalty program (customers)
- `GET /api/v1/loyalty/cafe/:cafeId/rewards` - Get available rewards
- `POST /api/v1/loyalty/rewards/:rewardId/redeem` - Redeem reward (customers)
- `GET /api/v1/loyalty/rewards` - Get member rewards (customers)
- `POST /api/v1/loyalty/program` - Create loyalty program (owners)
- `POST /api/v1/loyalty/rewards` - Create reward (owners)

### Chat & Communication
- `GET /api/v1/chat/history` - Get chat history
- `POST /api/v1/chat/message` - Send chat message
- `GET /api/v1/chat/ws` - WebSocket connection for real-time chat

### Payment Processing
- `POST /api/v1/payment/process` - Process payment
- `GET /api/v1/payment/status/:orderId` - Get payment status

## 🔧 Installation & Setup

### Prerequisites
- Go 1.21 or higher
- SQLite (or other configured database)

### Installation Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd SiipCoffe/API
```

2. **Install dependencies**
```bash
go mod download
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Environment Variables**
```env
# Server Configuration
PORT=8080
ENVIRONMENT=development

# Database
DB_PATH=./data/siipcoffe.db

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# Cafe Information
CAFE_NAME=SiipCoffee
CAFE_EMAIL=info@siipcoffe.com
CAFE_PHONE=+62 21-1234-5678
CAFE_ADDRESS=Jl. Cafe No. 123, Jakarta

# Cryptocurrency (optional)
BITCOIN_ENABLED=false
ETHEREUM_ENABLED=false
```

5. **Run the server**
```bash
go run cmd/server/main.go
```

6. **Build for production**
```bash
go build -o siipcoffe-api cmd/server/main.go
./siipcoffe-api
```

## 🎯 Role-Based Access Control

### Customer Role
- Browse cafes and menus
- Place orders and track status
- Join loyalty programs
- Write reviews
- Manage profile and preferences

### Owner Role
- Manage cafe profile and settings
- Create and manage menu items
- Process orders and update status
- Manage inventory and stock
- Create loyalty programs and rewards
- View analytics and reports

## 📊 Database Schema

### Core Tables

#### Users
- `id` - Primary key
- `name`, `email`, `password` - User credentials
- `role` - "customer" or "owner"
- `phone`, `address` - Contact information
- `created_at`, `updated_at` - Timestamps

#### Cafes
- `id` - Primary key
- `owner_id` - Foreign key to users
- `name`, `description` - Cafe information
- `address`, `city`, `province` - Location details
- `coordinate_lat`, `coordinate_lng` - GPS coordinates
- `business_hours` - JSON object of operating hours
- `tax_percentage`, `service_charge_percentage` - Pricing settings
- `features` - JSON array of amenities
- `rating_average`, `rating_count` - Review aggregates

#### Menus
- `id` - Primary key
- `cafe_id` - Foreign key to cafes
- `name`, `description`, `category` - Item details
- `price` - Item price
- `is_available`, `is_popular`, `is_recommended` - Status flags
- `ingredients`, `allergens` - Ingredient information
- `calories`, `prep_time` - Nutritional and timing info

#### Orders
- `id` - Primary key
- `cafe_id`, `user_id` - Foreign keys
- `order_number` - Unique order identifier
- `status` - Order status (pending, confirmed, preparing, ready, completed, cancelled)
- `total_amount`, `subtotal_amount`, `tax_amount` - Pricing breakdown
- `order_type` - "dine_in", "take_away", "delivery"
- `customer_name`, `customer_phone` - Customer details
- `estimated_time`, `actual_time` - Timing information

#### Inventory
- `id` - Primary key
- `cafe_id` - Foreign key
- `name`, `description` - Item details
- `category` - "raw_material", "packaging", "cleaning", "merchandise"
- `current_stock`, `min_stock_level`, `max_stock_level` - Stock levels
- `unit_cost`, `supplier` - Cost and supplier information
- `location` - Storage location

#### Loyalty Programs
- `id` - Primary key
- `cafe_id` - Foreign key
- `name`, `description` - Program details
- `points_per_currency`, `currency_per_point` - Points conversion rates
- `points_expiry_months` - Points expiration policy
- `tier_rules` - JSON object of tier configurations

## 🔐 Security Features

### Authentication
- JWT-based authentication with configurable expiration
- Secure password hashing with bcrypt
- Role-based access control with middleware
- Token refresh mechanism

### Data Protection
- Input validation and sanitization
- SQL injection prevention with GORM
- CORS configuration for cross-origin requests
- Rate limiting (can be implemented with middleware)

### Best Practices
- Environment variable configuration
- Error handling without information leakage
- Secure file upload validation
- Database connection pooling

## 🚀 Performance Optimizations

### Database Optimizations
- Indexed foreign keys for faster joins
- Pagination support for large datasets
- Eager loading with GORM preloads
- Database connection pooling

### Caching Strategy (To be implemented)
- Redis integration for session storage
- Menu item caching for frequently accessed data
- Analytics result caching
- Image CDN integration

### API Performance
- Efficient JSON responses with selective field loading
- Compression middleware for response payloads
- WebSocket for real-time updates
- Background job processing for heavy operations

## 📱 Frontend Integration

### Authentication Flow
1. User registers/logs in via `/api/v1/auth/*`
2. Receive JWT token
3. Include token in Authorization header: `Bearer <token>`
4. Access protected endpoints

### Real-time Updates
- Connect to WebSocket endpoint: `/api/v1/chat/ws`
- Receive order status updates
- Live inventory notifications
- Chat message streaming

### Error Handling
```javascript
// Standard error response format
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error description (optional)"
}

// Success response format
{
  "success": true,
  "data": { /* response data */ }
}
```

## 🔍 Monitoring & Analytics

### Built-in Analytics
- Sales revenue and order count
- Popular menu items analysis
- Customer behavior tracking
- Inventory turnover reports
- Loyalty program engagement

### Recommended Monitoring
- API response times and error rates
- Database query performance
- WebSocket connection health
- File upload processing times

## 🚢 Deployment Guide

### Docker Deployment
```dockerfile
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY . .
RUN go mod download && go build -o siipcoffe-api cmd/server/main.go

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/siipcoffe-api .
COPY --from=builder /app/.env .
EXPOSE 8080
CMD ["./siipcoffe-api"]
```

### Environment Configuration
- Production: Use PostgreSQL or MySQL
- Staging: SQLite with regular backups
- Development: SQLite with debug logging

### Scaling Considerations
- Load balancer for multiple API instances
- Database read replicas for analytics queries
- Redis cluster for session storage
- CDN for static assets and images

## 🤝 Contributing

### Code Style
- Follow Go standard formatting
- Use meaningful variable names
- Add comments for complex logic
- Include error handling

### Testing
- Unit tests for business logic
- Integration tests for API endpoints
- Database migrations testing
- Load testing for performance

### Git Workflow
1. Create feature branch from develop
2. Implement changes with tests
3. Submit pull request with description
4. Code review and merge

## 📞 Support

### Common Issues
- **Database connection**: Check DB_PATH environment variable
- **JWT errors**: Verify JWT_SECRET is configured
- **CORS issues**: Update allowed origins in middleware
- **File uploads**: Check file size limits and permissions

### Debug Mode
Set `ENVIRONMENT=development` for:
- Detailed error messages
- Database query logging
- Request/response logging

### Contact
- API Documentation: This file
- Issues: Create GitHub issue
- Support: Contact development team

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🎉 Summary

The SiipCoffee Enhanced API provides a complete backend solution for coffee shop management with:

- **Robust Architecture**: Scalable Go backend with Fiber framework
- **Multi-role Support**: Separate experiences for customers and cafe owners
- **Advanced Features**: Inventory, loyalty, analytics, and real-time chat
- **Security**: JWT authentication, role-based access control, input validation
- **Performance**: Optimized database queries and efficient API responses
- **Extensibility**: Modular design for easy feature additions

The API is production-ready and can handle the complete operational needs of modern coffee shops while providing excellent customer experiences.