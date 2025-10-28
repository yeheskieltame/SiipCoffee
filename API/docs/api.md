# API Documentation

## Base URL
```
Development: http://localhost:8080
Production: https://api.siipcoffe.com
```

## Authentication

API menggunakan JWT Bearer Token untuk authentication. Include token di header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Error Response Format

```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error description (optional)"
}
```

## Success Response Format

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

## Endpoints

### Authentication

#### Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+62812345678",
  "address": "Jakarta, Indonesia"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer"
    },
    "expires_at": 1640995200
  }
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer"
    },
    "expires_at": 1640995200
  }
}
```

### Menu Management

#### Get All Menus
```http
GET /api/v1/menu
Authorization: Bearer YOUR_TOKEN
```

**Query Parameters:**
- `category` (optional): Filter by category (coffee, tea, food, dessert, juice)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Cappuccino",
      "description": "Espresso dengan susu foam yang lembut",
      "category": "coffee",
      "price": 25000,
      "image_url": "/images/cappuccino.jpg",
      "is_available": true,
      "ingredients": "Espresso, susu, foam",
      "prep_time": 7
    }
  ],
  "count": 10
}
```

#### Get Menu by ID
```http
GET /api/v1/menu/{menu_id}
Authorization: Bearer YOUR_TOKEN
```

#### Create Menu (Owner Only)
```http
POST /api/v1/menu
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "New Coffee",
  "description": "Description",
  "category": "coffee",
  "price": 30000,
  "image_url": "/images/new-coffee.jpg",
  "is_available": true,
  "ingredients": "Coffee beans, water",
  "prep_time": 5
}
```

#### Update Menu (Owner Only)
```http
PUT /api/v1/menu/{menu_id}
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "price": 35000,
  "is_available": false
}
```

#### Delete Menu (Owner Only)
```http
DELETE /api/v1/menu/{menu_id}
Authorization: Bearer YOUR_TOKEN
```

#### Search Menu
```http
GET /api/v1/menu/search?q=cappuccino
Authorization: Bearer YOUR_TOKEN
```

### Order Management

#### Create Order
```http
POST /api/v1/orders
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "items": [
    {
      "menu_id": "uuid",
      "quantity": 2,
      "notes": "Extra sugar"
    }
  ],
  "order_type": "dine_in",
  "customer_name": "John Doe",
  "customer_phone": "+62812345678",
  "table_number": "A1",
  "notes": "Please make it hot",
  "payment_method": "crypto"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": "uuid",
    "order_number": "ORD-20240101-001",
    "status": "pending",
    "total_amount": 50000,
    "payment_method": "crypto",
    "payment_status": "pending",
    "customer_name": "John Doe",
    "order_type": "dine_in",
    "table_number": "A1",
    "order_items": [
      {
        "id": "uuid",
        "menu_id": "uuid",
        "quantity": 2,
        "unit_price": 25000,
        "total_price": 50000,
        "menu": {
          "name": "Cappuccino",
          "price": 25000
        }
      }
    ],
    "created_at": "2024-01-01T10:30:00Z"
  }
}
```

#### Get User Orders
```http
GET /api/v1/orders?page=1&limit=10&status=pending
Authorization: Bearer YOUR_TOKEN
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status

#### Get Order by ID
```http
GET /api/v1/orders/{order_id}
Authorization: Bearer YOUR_TOKEN
```

#### Update Order Status (Owner Only)
```http
PUT /api/v1/orders/{order_id}/status
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "status": "confirmed"
}
```

**Status Options:**
- `pending`
- `confirmed`
- `preparing`
- `ready`
- `completed`
- `cancelled`

### Chat AI

#### Send Message to AI
```http
POST /api/v1/chat/message
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "message": "Saya mau pesan kopi apa yang enak?",
  "session_id": "optional-session-id"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Saya sarankan Cappuccino. Ini espresso dengan susu foam yang lembut. Harganya Rp 25.000. Berapa banyak yang Anda pesan?",
    "intent": "order",
    "order_intent": {
      "action": "inquiry",
      "details": {
        "suggested_item": "Cappuccino",
        "price": 25000
      }
    },
    "should_confirm": true,
    "session_id": "uuid"
  }
}
```

#### Get Chat History
```http
GET /api/v1/chat/history?session_id=uuid
Authorization: Bearer YOUR_TOKEN
```

#### WebSocket Chat Connection
```javascript
const ws = new WebSocket('ws://localhost:8080/api/v1/chat/ws?session_id=uuid&token=YOUR_TOKEN');

ws.onopen = function() {
  console.log('Connected to chat');
};

ws.onmessage = function(event) {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};

ws.send(JSON.stringify({
  message: "Hello AI!"
}));
```

### Payment

#### Process Payment
```http
POST /api/v1/payment/process
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "order_id": "uuid",
  "method": "crypto",
  "amount": 50000
}
```

**Crypto Payment Response:**
```json
{
  "success": true,
  "message": "Payment processed successfully",
  "data": {
    "payment_id": "uuid",
    "transaction_id": "TXN-20240101-001",
    "method": "crypto",
    "wallet_address": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    "crypto_amount": 0.0005,
    "fiat_amount": 50000,
    "currency": "IDR",
    "qr_code": "bitcoin:bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh?amount=0.0005",
    "status": "awaiting_payment",
    "expires_at": "2024-01-02T10:30:00Z"
  }
}
```

**Payment Methods:**
- `crypto`: Bitcoin/Ethereum payment
- `cash`: Cash payment at counter
- `transfer`: Bank transfer

#### Get Payment Status
```http
GET /api/v1/payment/status/{order_id}
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "order_id": "uuid",
    "payment_id": "uuid",
    "payment_status": "paid",
    "payment_method": "crypto",
    "amount": 50000,
    "transaction_id": "TXN-20240101-001",
    "confirmed_at": "2024-01-01T10:45:00Z"
  }
}
```

#### Confirm Payment (Webhook)
```http
POST /api/v1/payment/confirm/{payment_id}
Content-Type: application/json

{
  "transaction_hash": "0x...",
  "confirmations": 6
}
```

### Admin (Owner Only)

#### Get Analytics
```http
GET /api/v1/admin/analytics
Authorization: Bearer OWNER_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_orders": 150,
    "total_revenue": 7500000,
    "popular_items": [
      {"name": "Cappuccino", "orders": 45},
      {"name": "Espresso", "orders": 38}
    ],
    "daily_stats": [
      {"date": "2024-01-01", "orders": 25, "revenue": 1250000}
    ]
  }
}
```

#### Get All Orders
```http
GET /api/v1/admin/orders
Authorization: Bearer OWNER_TOKEN
```

## Error Codes

- `400`: Bad Request - Invalid input data
- `401`: Unauthorized - Invalid or missing token
- `403`: Forbidden - Insufficient permissions
- `404`: Not Found - Resource not found
- `409`: Conflict - Resource already exists
- `500`: Internal Server Error - Server error

## Rate Limiting

API implements rate limiting to prevent abuse:
- **Chat endpoint**: 100 requests per minute per user
- **Order creation**: 10 orders per minute per user
- **Other endpoints**: 1000 requests per hour per user

## WebSocket Events

### Client to Server
```json
{
  "type": "message",
  "data": {
    "message": "Your message here"
  }
}
```

### Server to Client
```json
{
  "type": "response",
  "data": {
    "message": "AI response",
    "intent": "order",
    "order_intent": { ... }
  }
}
```

## Testing

Use Postman collection or curl commands to test API endpoints. Make sure to:
1. Register and login to get JWT token
2. Include token in Authorization header
3. Use proper JSON format in request body

## Integration Examples

### JavaScript (Frontend)
```javascript
// Login
const login = async (email, password) => {
  const response = await fetch('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  return data.data.token;
};

// Create order
const createOrder = async (token, orderData) => {
  const response = await fetch('/api/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(orderData)
  });
  return response.json();
};

// Chat with AI
const chatWithAI = async (token, message, sessionId) => {
  const response = await fetch('/api/v1/chat/message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ message, session_id: sessionId })
  });
  return response.json();
};
```

### Python (Backend Integration)
```python
import requests

# API Base URL
BASE_URL = "http://localhost:8080/api/v1"

class SiipCoffeeAPI:
    def __init__(self):
        self.token = None

    def login(self, email, password):
        response = requests.post(f"{BASE_URL}/auth/login", json={
            "email": email,
            "password": password
        })
        data = response.json()
        if data["success"]:
            self.token = data["data"]["token"]
        return data

    def get_menus(self, category=None):
        headers = {"Authorization": f"Bearer {self.token}"}
        params = {"category": category} if category else {}
        response = requests.get(f"{BASE_URL}/menu", headers=headers, params=params)
        return response.json()

    def create_order(self, order_data):
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.post(f"{BASE_URL}/orders",
                               headers=headers, json=order_data)
        return response.json()
```