package database

import (
	"fmt"
	"os"
	"path/filepath"

	"siipcoffe-api/internal/config"
	"siipcoffe-api/internal/models"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func Initialize(cfg *config.Config) (*gorm.DB, error) {
	// Create data directory if it doesn't exist
	if err := os.MkdirAll(filepath.Dir(cfg.DBPath), 0755); err != nil {
		return nil, fmt.Errorf("failed to create database directory: %w", err)
	}

	// Configure GORM
	gormConfig := &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	}

	// Open database connection
	db, err := gorm.Open(sqlite.Open(cfg.DBPath), gormConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// Auto-migrate the schema
	if err := db.AutoMigrate(
		&models.User{},
		&models.Cafe{},
		&models.CafeReview{},
		&models.CafeStaff{},
		&models.Menu{},
		&models.Order{},
		&models.OrderItem{},
		&models.Payment{},
		&models.Chat{},
		&models.Inventory{},
		&models.StockMovement{},
		&models.LoyaltyProgram{},
		&models.LoyaltyMember{},
		&models.LoyaltyReward{},
		&models.MemberReward{},
		&models.LoyaltyTransaction{},
	); err != nil {
		return nil, fmt.Errorf("failed to migrate database: %w", err)
	}

	// Seed initial data
	if err := seedData(db); err != nil {
		return nil, fmt.Errorf("failed to seed database: %w", err)
	}

	return db, nil
}

func seedData(db *gorm.DB) error {
	// Check if data already exists
	var cafeCount int64
	db.Model(&models.Cafe{}).Count(&cafeCount)
	if cafeCount > 0 {
		return nil // Data already exists
	}

	// Create default admin user
	adminUser := models.User{
		ID:       "admin-1",
		Name:     "Cafe Admin",
		Email:    "admin@siipcoffe.com",
		Password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password: password
		Role:     "owner",
		Phone:    "+62 812-3456-7890",
		Address:  "Jl. Cafe No. 123, Jakarta",
	}

	if err := db.Create(&adminUser).Error; err != nil {
		return fmt.Errorf("failed to create admin user: %w", err)
	}

	// Create sample cafe
	sampleCafe := models.Cafe{
		ID:                     "cafe-1",
		OwnerID:                adminUser.ID,
		Name:                   "SiipCoffee Central",
		Description:            "Coffee shop modern dengan wifi nyaman dan suasana yang cozy",
		Address:                "Jl. Sudirman No. 45, Jakarta Pusat",
		City:                   "Jakarta",
		Province:               "DKI Jakarta",
		PostalCode:             "10210",
		Phone:                  "+62 21-1234-5678",
		Email:                  "info@siipcoffe.com",
		Website:                "https://siipcoffe.com",
		CoordinateLat:          -6.2088,
		CoordinateLng:          106.8456,
		BusinessHours:          `{"monday":{"open":"07:00","close":"22:00"},"tuesday":{"open":"07:00","close":"22:00"},"wednesday":{"open":"07:00","close":"22:00"},"thursday":{"open":"07:00","close":"22:00"},"friday":{"open":"07:00","close":"23:00"},"saturday":{"open":"08:00","close":"23:00"},"sunday":{"open":"08:00","close":"22:00"}}`,
		IsOpen:                 true,
		IsVerified:             true,
		RatingAverage:          4.5,
		RatingCount:            150,
		TaxPercentage:          10,
		ServiceChargePercentage: 5,
		DeliveryFee:            10000,
		MinOrderAmount:         25000,
		MaxDeliveryDistance:    5,
		Features:               `["wifi","outdoor_seating","delivery","take_away","ac","parking"]`,
		SocialMedia:            `{"instagram":"@siipcoffe","facebook":"SiipCoffee","twitter":"SiipCoffeeID"}`,
		Status:                 "active",
	}

	if err := db.Create(&sampleCafe).Error; err != nil {
		return fmt.Errorf("failed to create sample cafe: %w", err)
	}

	// Seed menu items
	menuItems := []models.Menu{
		{
			ID:            "menu-1",
			CafeID:        sampleCafe.ID,
			Name:          "Espresso",
			Description:   "Kopi espresso klasik yang kuat dan kaya rasa",
			Category:      "coffee",
			Price:         15000,
			ImageURL:      "/images/espresso.jpg",
			IsAvailable:   true,
			IsPopular:     true,
			Ingredients:   "Biji kopi premium",
			PrepTime:      5,
			Calories:      5,
			Allergens:     `[]`,
			Customizable:  false,
		},
		{
			ID:            "menu-2",
			CafeID:        sampleCafe.ID,
			Name:          "Cappuccino",
			Description:   "Espresso dengan susu foam yang lembut",
			Category:      "coffee",
			Price:         25000,
			ImageURL:      "/images/cappuccino.jpg",
			IsAvailable:   true,
			IsPopular:     true,
			IsRecommended: true,
			Ingredients:   "Espresso, susu, foam",
			PrepTime:      7,
			Calories:      120,
			Allergens:     `["dairy"]`,
			Customizable:  true,
		},
		{
			ID:            "menu-3",
			CafeID:        sampleCafe.ID,
			Name:          "Caramel Macchiato",
			Description:   "Espresso dengan susu dan saus karamel",
			Category:      "coffee",
			Price:         35000,
			ImageURL:      "/images/caramel-macchiato.jpg",
			IsAvailable:   true,
			IsRecommended: true,
			Ingredients:   "Espresso, susu, saus karamel",
			PrepTime:      10,
			Calories:      190,
			Allergens:     `["dairy"]`,
			Customizable:  true,
		},
		{
			ID:            "menu-4",
			CafeID:        sampleCafe.ID,
			Name:          "Green Tea Latte",
			Description:   "Teh hijau Jepang dengan susu",
			Category:      "tea",
			Price:         30000,
			ImageURL:      "/images/green-tea-latte.jpg",
			IsAvailable:   true,
			Ingredients:   "Teh hijau matcha, susu",
			PrepTime:      8,
			Calories:      150,
			Allergens:     `["dairy"]`,
			Customizable:  true,
		},
		{
			ID:            "menu-5",
			CafeID:        sampleCafe.ID,
			Name:          "Croissant",
			Description:   "Pastry butter yang renyah dari Prancis",
			Category:      "food",
			Price:         20000,
			ImageURL:      "/images/croissant.jpg",
			IsAvailable:   true,
			Ingredients:   "Tepung, butter, ragi",
			PrepTime:      3,
			Calories:      231,
			Allergens:     `["gluten","dairy"]`,
			Customizable:  false,
		},
		{
			ID:            "menu-6",
			CafeID:        sampleCafe.ID,
			Name:          "Chocolate Cake",
			Description:   "Kue coklat yang lembut dan moist",
			Category:      "dessert",
			Price:         45000,
			ImageURL:      "/images/chocolate-cake.jpg",
			IsAvailable:   true,
			IsPopular:     true,
			Ingredients:   "Coklat, tepung, telur, butter",
			PrepTime:      5,
			Calories:      350,
			Allergens:     `["gluten","dairy","eggs"]`,
			Customizable:  false,
		},
		{
			ID:            "menu-7",
			CafeID:        sampleCafe.ID,
			Name:          "Orange Juice",
			Description:   "Jus jeruk segar tanpa gula",
			Category:      "juice",
			Price:         25000,
			ImageURL:      "/images/orange-juice.jpg",
			IsAvailable:   true,
			Ingredients:   "Jeruk segar",
			PrepTime:      5,
			Calories:      110,
			Allergens:     `[]`,
			Customizable:  false,
		},
	}

	for _, item := range menuItems {
		if err := db.Create(&item).Error; err != nil {
			return fmt.Errorf("failed to create menu item %s: %w", item.Name, err)
		}
	}

	// Create sample inventory items
	inventoryItems := []models.Inventory{
		{
			ID:            "inv-1",
			CafeID:        sampleCafe.ID,
			Name:          "Coffee Beans Arabica",
			Description:   "Premium arabica coffee beans from Ethiopia",
			Category:      "raw_material",
			Unit:          "kg",
			CurrentStock:  15.5,
			MinStockLevel: 5,
			MaxStockLevel: 50,
			UnitCost:      150000,
			Supplier:      "Coffee Supplier Inc",
			SupplierContact: "+62 811-2222-3333",
			Location:      "warehouse",
			IsActive:      true,
		},
		{
			ID:            "inv-2",
			CafeID:        sampleCafe.ID,
			Name:          "Fresh Milk",
			Description:   "Full cream fresh milk",
			Category:      "raw_material",
			Unit:          "liter",
			CurrentStock:  8,
			MinStockLevel: 3,
			MaxStockLevel: 20,
			UnitCost:      18000,
			Supplier:      "Dairy Farm Co",
			SupplierContact: "+62 811-4444-5555",
			Location:      "kitchen",
			IsActive:      true,
		},
		{
			ID:            "inv-3",
			CafeID:        sampleCafe.ID,
			Name:          "Paper Cups Large",
			Description:   "Disposable paper cups 16oz",
			Category:      "packaging",
			Unit:          "pcs",
			CurrentStock:  200,
			MinStockLevel: 50,
			MaxStockLevel: 1000,
			UnitCost:      800,
			Supplier:      "Packaging Supplier",
			SupplierContact: "+62 811-6666-7777",
			Location:      "storage",
			IsActive:      true,
		},
	}

	for _, item := range inventoryItems {
		if err := db.Create(&item).Error; err != nil {
			return fmt.Errorf("failed to create inventory item %s: %w", item.Name, err)
		}
	}

	// Create sample loyalty program
	loyaltyProgram := models.LoyaltyProgram{
		ID:                "loyalty-1",
		CafeID:            sampleCafe.ID,
		Name:              "SiipCoffee Rewards",
		Description:       "Earn points with every purchase and redeem for free drinks and food",
		PointsPerCurrency: 10,
		CurrencyPerPoint:  0.01,
		MinOrderForPoints: 10000,
		PointsExpiryMonths: 12,
		TierRules:         `{"bronze":{"name":"Bronze","min_points":0,"benefits":["1 point per Rp1000"]},"silver":{"name":"Silver","min_points":500,"benefits":["1.2 points per Rp1000"," birthday discount"]},"gold":{"name":"Gold","min_points":1000,"benefits":["1.5 points per Rp1000","free birthday drink","priority service"]}}`,
		IsActive:          true,
	}

	if err := db.Create(&loyaltyProgram).Error; err != nil {
		return fmt.Errorf("failed to create loyalty program: %w", err)
	}

	// Create sample loyalty rewards
	loyaltyRewards := []models.LoyaltyReward{
		{
			ID:            "reward-1",
			ProgramID:     loyaltyProgram.ID,
			CafeID:        sampleCafe.ID,
			Name:          "Free Espresso",
			Description:   "Get a free cup of our signature espresso",
			Type:          "free_item",
			PointsCost:    150,
			FreeItemID:    "menu-1",
			MinOrderValue: 0,
			MaxUses:       -1,
			CurrentUses:   0,
			IsActive:      true,
		},
		{
			ID:            "reward-2",
			ProgramID:     loyaltyProgram.ID,
			CafeID:        sampleCafe.ID,
			Name:          "10% Discount",
			Description:   "Get 10% off your entire order",
			Type:          "discount",
			PointsCost:    200,
			DiscountValue: 10,
			DiscountType:  "percentage",
			MinOrderValue: 25000,
			MaxUses:       -1,
			CurrentUses:   0,
			IsActive:      true,
		},
		{
			ID:            "reward-3",
			ProgramID:     loyaltyProgram.ID,
			CafeID:        sampleCafe.ID,
			Name:          "Free Croissant",
			Description:   "Get a free croissant with any coffee purchase",
			Type:          "free_item",
			PointsCost:    200,
			FreeItemID:    "menu-5",
			MinOrderValue: 20000,
			MaxUses:       -1,
			CurrentUses:   0,
			IsActive:      true,
		},
	}

	for _, reward := range loyaltyRewards {
		if err := db.Create(&reward).Error; err != nil {
			return fmt.Errorf("failed to create loyalty reward %s: %w", reward.Name, err)
		}
	}

	return nil
}