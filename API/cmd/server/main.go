package main

import (
	"log"

	"siipcoffe-api/internal/config"
	"siipcoffe-api/internal/database"
	"siipcoffe-api/internal/handlers"
	"siipcoffe-api/internal/middleware"
	"siipcoffe-api/pkg/gemini"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/websocket/v2"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	// Initialize configuration
	cfg := config.Load()

	// Initialize database
	db, err := database.Initialize(cfg)
	if err != nil {
		log.Fatal("Failed to initialize database:", err)
	}

	// Initialize Gemini AI
	geminiClient, err := gemini.NewClient(cfg.GeminiAPIKey)
	if err != nil {
		log.Fatal("Failed to initialize Gemini:", err)
	}

	// Initialize Fiber app
	app := fiber.New(fiber.Config{
		ErrorHandler: handlers.ErrorHandler,
	})

	// Middleware
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowMethods: "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
	}))

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(db, cfg)
	menuHandler := handlers.NewMenuHandler(db)
	orderHandler := handlers.NewOrderHandler(db, geminiClient, cfg)
	paymentHandler := handlers.NewPaymentHandler(db, cfg)
	chatHandler := handlers.NewChatHandler(db, geminiClient, cfg)
	cafeHandler := handlers.NewCafeHandler(db)
	userHandler := handlers.NewUserHandler(db)
	inventoryHandler := handlers.NewInventoryHandler(db)
	loyaltyHandler := handlers.NewLoyaltyHandler(db)

	// Health check
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "ok",
			"message": "SiipCoffee API is running",
		})
	})

	// API Routes
	api := app.Group("/api/v1")

	// Authentication routes
	auth := api.Group("/auth")
	auth.Post("/register", authHandler.Register)
	auth.Post("/login", authHandler.Login)
	auth.Post("/refresh", authHandler.RefreshToken)

	// Cafe routes (public)
	cafes := api.Group("/cafes")
	cafes.Get("/", cafeHandler.GetAllCafes)
	cafes.Get("/:id", cafeHandler.GetCafeByID)
	cafes.Get("/:id/reviews", cafeHandler.GetCafeReviews)
	cafes.Post("/:id/reviews", middleware.Authenticate(cfg.JWTSecret), middleware.RequireRole("customer"), cafeHandler.AddCafeReview)

	// Protected routes
	protected := api.Group("/", middleware.Authenticate(cfg.JWTSecret))

	// User Profile routes
	user := protected.Group("/user")
	user.Get("/profile", userHandler.GetProfile)
	user.Put("/profile", userHandler.UpdateProfile)
	user.Put("/password", userHandler.ChangePassword)
	user.Post("/avatar", userHandler.UploadAvatar)
	user.Get("/orders", userHandler.GetUserOrders)
	user.Get("/loyalty", userHandler.GetUserLoyaltyInfo)
	user.Get("/favorites", userHandler.GetUserFavorites)
	user.Post("/favorites/:cafeId", userHandler.AddToFavorites)
	user.Delete("/favorites/:cafeId", userHandler.RemoveFromFavorites)
	user.Get("/notifications", userHandler.GetUserNotifications)
	user.Put("/notifications/:id/read", userHandler.MarkNotificationAsRead)
	user.Delete("/account", userHandler.DeleteAccount)

	// Owner cafe management
	owner := protected.Group("/owner", middleware.RequireRole("owner"))
	owner.Post("/cafe", cafeHandler.CreateCafe)
	owner.Get("/cafe", cafeHandler.GetMyCafe)
	owner.Put("/cafe", cafeHandler.UpdateCafe)
	owner.Put("/cafe/toggle-status", cafeHandler.ToggleCafeStatus)
	owner.Get("/cafe/analytics", cafeHandler.GetCafeAnalytics)

	// Menu routes (updated with cafe context)
	menu := protected.Group("/menu")
	menu.Get("/cafe/:cafeId", menuHandler.GetAllMenus)
	menu.Get("/:id", menuHandler.GetMenuByID)
	menu.Post("/", middleware.RequireRole("owner"), menuHandler.CreateMenu)
	menu.Put("/:id", middleware.RequireRole("owner"), menuHandler.UpdateMenu)
	menu.Delete("/:id", middleware.RequireRole("owner"), menuHandler.DeleteMenu)

	// Order routes
	orders := protected.Group("/orders")
	orders.Get("/", orderHandler.GetUserOrders)
	orders.Get("/:id", orderHandler.GetOrderByID)
	orders.Post("/", orderHandler.CreateOrder)
	orders.Put("/:id/status", middleware.RequireRole("owner"), orderHandler.UpdateOrderStatus)

	// Inventory routes (owner only)
	inventory := protected.Group("/inventory", middleware.RequireRole("owner"))
	inventory.Get("/", inventoryHandler.GetInventoryItems)
	inventory.Post("/", inventoryHandler.CreateInventoryItem)
	inventory.Put("/:id", inventoryHandler.UpdateInventoryItem)
	inventory.Delete("/:id", inventoryHandler.DeleteInventoryItem)
	inventory.Post("/:id/movements", inventoryHandler.AddStockMovement)
	inventory.Get("/:id/movements", inventoryHandler.GetStockMovements)
	inventory.Get("/reports/low-stock", inventoryHandler.GetLowStockItems)
	inventory.Get("/reports/expiring", inventoryHandler.GetExpiringItems)

	// Loyalty Program routes
	loyalty := protected.Group("/loyalty")
	loyalty.Get("/cafe/:cafeId", loyaltyHandler.GetLoyaltyProgram)
	loyalty.Post("/cafe/:cafeId/join", middleware.RequireRole("customer"), loyaltyHandler.JoinLoyaltyProgram)
	loyalty.Get("/cafe/:cafeId/rewards", loyaltyHandler.GetLoyaltyRewards)
	loyalty.Post("/rewards/:rewardId/redeem", middleware.RequireRole("customer"), loyaltyHandler.RedeemReward)
	loyalty.Get("/rewards", middleware.RequireRole("customer"), loyaltyHandler.GetMemberRewards)
	loyalty.Get("/cafe/:cafeId/transactions", middleware.RequireRole("customer"), loyaltyHandler.GetLoyaltyTransactions)

	// Owner loyalty management
	ownerLoyalty := protected.Group("/loyalty", middleware.RequireRole("owner"))
	ownerLoyalty.Post("/program", loyaltyHandler.CreateLoyaltyProgram)
	ownerLoyalty.Post("/rewards", loyaltyHandler.CreateLoyaltyReward)

	// Chat routes
	chat := protected.Group("/chat")
	chat.Get("/history", chatHandler.GetChatHistory)
	chat.Post("/message", chatHandler.ProcessMessage)
	chat.Get("/ws", websocket.New(chatHandler.WebSocketHandler))

	// Payment routes
	payment := protected.Group("/payment")
	payment.Post("/process", paymentHandler.ProcessPayment)
	payment.Get("/status/:orderId", paymentHandler.GetPaymentStatus)

	// Admin routes (owner only)
	admin := protected.Group("/admin", middleware.RequireRole("owner"))
	admin.Get("/analytics", handlers.GetAnalytics)
	admin.Get("/orders", handlers.GetAllOrders)

	// Start server
	port := cfg.Port
	if port == "" {
		port = "8080"
	}

	log.Printf("🚀 SiipCoffee API server starting on port %s", port)
	log.Fatal(app.Listen(":" + port))
}