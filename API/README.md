# SiipCoffee API - Backend with Golang & Gemini AI

Backend API untuk sistem pemesanan kafe dengan AI assistant berbasis Gemini 2.5 Flash dan pembayaran cryptocurrency.

## 🚀 Cara Menjalankan Backend API

### Prerequisites
- Go 1.21+ terinstall di sistem
- Gemini API Key (dapatkan dari Google AI Studio)
- Text editor (VS Code, Sublime Text, dll)

### 📋 Langkah 1: Setup Environment

#### 1.1 Install Dependencies
```bash
cd /Users/kiel/SiipCoffe/API
go mod download
```

#### 1.2 Setup Environment Variables
Buat file `.env` dari template:
```bash
cp .env.example .env
```

Edit file `.env` dengan konfigurasi Anda:
```env
# Server Configuration
PORT=8080
ENVIRONMENT=development

# Database
DB_TYPE=sqlite
DB_PATH=./data/siipcoffe.db

# Gemini AI Configuration (DAPATKAN!)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_for_testing
JWT_EXPIRESIN=24h

# Crypto Payment Configuration (Optional untuk development)
ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/your_infura_key
CONTRACT_ADDRESS=your_contract_address_here
PRIVATE_KEY=your_private_key_here

# Cafe Configuration
CAFE_NAME=SiipCoffee
CAFE_ADDRESS=Jl. Cafe No. 123, Jakarta
CAFE_PHONE=+62 812-3456-7890
```

#### 1.3 Dapatkan Gemini API Key
1. Kunjungi [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Login dengan Google account
3. Klik "Create API Key"
4. Copy API key dan masukkan ke `.env`

### 📋 Langkah 2: Jalankan API Server

#### 2.1 Build dan Jalankan (Cara 1 - Rekomendasi)
```bash
# Jalankan langsung tanpa build
go run cmd/server/main.go
```

Output yang diharapkan:
```
🚀 SiipCoffee API server starting on port 8080
2024/01/01 10:30:00 Successfully connected to database
2024/01/01 10:30:00 Gemini client initialized
2024/01/01 10:30:00 Demo data seeded
```

#### 2.2 Build Dulu lalu Jalankan (Cara 2)
```bash
# Build executable
go build -o siipcoffe-api cmd/server/main.go

# Jalankan executable
./siipcoffe-api
```

#### 2.3 Development dengan Hot Reload (Cara 3)
Install air untuk hot reload:
```bash
go install github.com/cosmtrek/air@latest
air
```

### 📋 Langkah 3: Verifikasi API Berjalan

#### 3.1 Cek Health Endpoint
Buka browser atau gunakan curl:
```bash
curl http://localhost:8080/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "SiipCoffee API is running"
}
```

#### 3.2 Test API Endpoint
```bash
# Test menu endpoint
curl http://localhost:8080/api/v1/menu

# Test register
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 📋 Langkah 4: Test dengan Frontend

#### 4.1 Jalankan Frontend
```bash
cd /Users/kiel/SiipCoffe/web
pnpm dev
```

#### 4.2 Login ke Aplikasi
1. Buka `http://localhost:3000`
2. Klik "As Customer" → "Sign up here"
3. Buat akun baru atau gunakan demo login:
   - Email: `customer@demo.com`
   - Password: `password123`

#### 4.3 Test AI Chat
1. Login dan pilih "Start AI Ordering"
2. Coba chat: "Halo, saya mau pesan kopi"
3. AI akan merespons secara natural

### 📋 File Structure Penting

```
API/
├── cmd/server/main.go          # Entry point aplikasi
├── internal/
│   ├── config/config.go      # Konfigurasi environment
│   ├── database/database.go    # Database connection & migration
│   ├── handlers/              # API handlers
│   ├── models/                # Data models
│   └── middleware/            # Authentication middleware
├── pkg/
│   ├── gemini/gemini.go       # Gemini AI integration
│   └── receipt/receipt.go     # Receipt generation
├── .env                       # Environment variables
├── .env.example               # Template environment
├── go.mod                     # Go modules
├── siipcoffe-api             # Executable (setelah build)
└── README.md                  # File ini
```

### 📋 API Endpoints

#### Authentication
```bash
POST /api/v1/auth/register    # Register user baru
POST /api/v1/auth/login       # Login user
POST /api/v1/auth/refresh     # Refresh token
```

#### Menu
```bash
GET  /api/v1/menu             # Dapatkan semua menu
GET  /api/v1/menu/:id          # Dapatkan menu by ID
POST /api/v1/menu             # Buat menu (owner only)
PUT  /api/v1/menu/:id          # Update menu (owner only)
DELETE /api/v1/menu/:id       # Delete menu (owner only)
```

#### Orders
```bash
GET  /api/v1/orders           # Dapatkan orders user
POST /api/v1/orders           # Buat order baru
GET  /api/v1/orders/:id       # Dapatkan order by ID
PUT  /api/v1/orders/:id/status # Update status (owner only)
```

#### Chat AI
```bash
GET  /api/v1/chat/history     # Chat history
POST /api/v1/chat/message    # Kirim pesan ke AI
WS   /api/v1/chat/ws          # Real-time chat
```

#### Payment
```bash
POST /api/v1/payment/process  # Proses pembayaran
GET  /api/v1/payment/status/:orderId # Check status
```

### 📋 Troubleshooting

#### Masalah Umum & Solusi:

##### 1. Port Sudah Digunakan
```bash
Error: listen tcp :8080: bind: address already in use

# Solusi: Gunakan port lain atau kill process
lsof -ti :8080
kill -9 <PID>
# atau
PORT=8081 go run cmd/server/main.go
```

##### 2. Gemini API Key Invalid
```bash
Error: Failed to initialize Gemini: invalid API key

# Solusi: Pastikan API key benar di .env
# Cek di Google AI Studio
```

##### 3. Database Error
```bash
Error: Failed to initialize database

# Solusi: Buat direktori data
mkdir -p data
chmod 755 data
```

##### 4. Dependencies Error
```bash
Error: package ... not found

# Solusi: Download dependencies
go mod download
go mod tidy
```

### 📋 Mode Development vs Production

#### Development Mode
```bash
# Auto-reload on code changes
go run cmd/server/main.go

# Dengan logging detail
LOG_LEVEL=debug go run cmd/server/main.go
```

#### Production Mode
```bash
# Build untuk production
CGO_ENABLED=0 go build -o siipcoffe-api cmd/server/main.go

# Jalankan di background
nohup ./siipcoffe-api > api.log 2>&1 &

# Atau dengan systemd/Linux service
sudo systemctl start siipcoffe-api
```

### 📋 Environment Variables Lengkap

```env
# === SERVER ===
PORT=8080                    # Port untuk server
ENVIRONMENT=development       # development|production

# === DATABASE ===
DB_TYPE=sqlite               # Database type
DB_PATH=./data/siipcoffe.db   # Database file path

# === GEMINI AI ===
GEMINI_API_KEY=...           # DAPATKAN!
GEMINI_MODEL=gemini-2.5-flash # Gemini model

# === JWT ===
JWT_SECRET=...               # Secret key (buat yang unik)
JWT_EXPIRES_IN=24h          # Token expiration

# === CRYPTO PAYMENT ===
ETHEREUM_RPC_URL=...        # Infura atau node URL
CONTRACT_ADDRESS=...         # Smart contract address
PRIVATE_KEY=...              # Wallet private key

# === CAFE INFO ===
CAFE_NAME=SiipCoffee
CAFE_ADDRESS=Jl. Cafe No. 123, Jakarta
CAFE_PHONE=+62 812-3456-7890
```

### 📋 Commands Berguna

#### Go Commands
```bash
go mod download              # Download dependencies
go mod tidy                  # Clean modules
go build                      # Build executable
go run cmd/server/main.go     # Run development
go test ./...                 # Run tests
go vet ./...                  # Code analysis
```

#### API Testing dengan curl
```bash
# Health check
curl http://localhost:8080/health

# Get all menus
curl http://localhost:8080/api/v1/menu

# Register user
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"123456"}'

# Login user
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'

# Test AI chat
curl -X POST http://localhost:8080/api/v1/chat/message \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"message":"halo","session_id":"test"}'
```

### 📋 Monitoring & Logging

#### Log Levels
```bash
# Default logging
go run cmd/server/main.go

# Debug logging
LOG_LEVEL=debug go run cmd/server/main.go

# Disable logging
LOG_LEVEL=error go run cmd/server/main.go
```

#### Health Check
```bash
# Simple health check
curl http://localhost:8080/health

# Detailed health check
curl -H "Accept: application/json" http://localhost:8080/health
```

### 📋 Deployment Options

#### 1. Local Development
```bash
go run cmd/server/main.go
```

#### 2. Docker (Recommended)
```dockerfile
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY . .
RUN go mod download
RUN go build -o siipcoffe-api cmd/server/main.go

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/siipcoffe-api .
CMD ["./siipcoffe-api"]
```

#### 3. Cloud Services
- **Heroku**: `heroku create`
- **Vercel**: Upload Go binary
- **DigitalOcean**: Droplet dengan Go
- **AWS EC2**: Ubuntu instance

### 📋 Tips & Best Practices

#### Development Tips
- Gunakan `.env.local` untuk local development
- Jalankan `go mod tidy` setelah mengubah dependencies
- Gunakan `go fmt ./...` untuk format code
- Jalankan `go vet ./...` untuk static analysis

#### Performance Tips
- Build dengan CGO_ENABLED=0 untuk production
- Gunakan connection pooling untuk database
- Implement rate limiting di production
- Monitor API response times

#### Security Tips
- Jangan commit `.env` ke git
- Gunakan environment variables yang kuat
- Implement rate limiting
- Validasi input dengan strict types
- Gunakan HTTPS di production

### 📋 Next Steps

1. ✅ Jalankan backend API
2. ✅ Test semua endpoints dengan curl
3. ✅ Jalankan frontend Next.js
4. ✅ Test integrasi frontend-backend
5. ✅ Deploy ke production (optional)

### 📞 Need Help?

Jika ada masalah, cek:
1. Log output di terminal
2. Environment variables di `.env`
3. Database permissions
4. Network connectivity
5. API key validity

Happy coding! 🚀☕