package handlers

import (
	"strconv"
	"time"

	"siipcoffe-api/internal/models"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CafeHandler struct {
	db *gorm.DB
}

func NewCafeHandler(db *gorm.DB) *CafeHandler {
	return &CafeHandler{db: db}
}

// CreateCafe creates a new cafe (owner only)
func (h *CafeHandler) CreateCafe(c *fiber.Ctx) error {
	user := c.Locals("user").(*models.User)
	if user.Role != "owner" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"error":   "Only owners can create cafes",
		})
	}

	var req struct {
		Name                 string  `json:"name" validate:"required"`
		Description          string  `json:"description"`
		Address              string  `json:"address" validate:"required"`
		City                 string  `json:"city" validate:"required"`
		Province             string  `json:"province"`
		PostalCode           string  `json:"postal_code"`
		Phone                string  `json:"phone"`
		Email                string  `json:"email" validate:"email"`
		Website              string  `json:"website"`
		CoordinateLat        float64 `json:"coordinate_lat"`
		CoordinateLng        float64 `json:"coordinate_lng"`
		BusinessHours        string  `json:"business_hours"`
		TaxPercentage        float64 `json:"tax_percentage"`
		ServiceChargePercentage float64 `json:"service_charge_percentage"`
		DeliveryFee          float64 `json:"delivery_fee"`
		MinOrderAmount       float64 `json:"min_order_amount"`
		MaxDeliveryDistance  float64 `json:"max_delivery_distance"`
		Features             string  `json:"features"`
		SocialMedia          string  `json:"social_media"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid request body",
		})
	}

	// Check if user already has a cafe
	var existingCafe models.Cafe
	err := h.db.Where("owner_id = ?", user.ID).First(&existingCafe).Error
	if err == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "You already have a cafe",
		})
	}

	cafe := models.Cafe{
		ID:                     uuid.New().String(),
		OwnerID:                user.ID,
		Name:                   req.Name,
		Description:            req.Description,
		Address:                req.Address,
		City:                   req.City,
		Province:               req.Province,
		PostalCode:             req.PostalCode,
		Phone:                  req.Phone,
		Email:                  req.Email,
		Website:                req.Website,
		CoordinateLat:          req.CoordinateLat,
		CoordinateLng:          req.CoordinateLng,
		BusinessHours:          req.BusinessHours,
		TaxPercentage:          req.TaxPercentage,
		ServiceChargePercentage: req.ServiceChargePercentage,
		DeliveryFee:            req.DeliveryFee,
		MinOrderAmount:         req.MinOrderAmount,
		MaxDeliveryDistance:    req.MaxDeliveryDistance,
		Features:               req.Features,
		SocialMedia:            req.SocialMedia,
		IsOpen:                 true,
		Status:                 "active",
	}

	if err := h.db.Create(&cafe).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to create cafe",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"data":    cafe.ToResponse(),
	})
}

// GetMyCafe gets the current user's cafe (owner only)
func (h *CafeHandler) GetMyCafe(c *fiber.Ctx) error {
	user := c.Locals("user").(*models.User)
	if user.Role != "owner" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"error":   "Only owners can access cafe information",
		})
	}

	var cafe models.Cafe
	err := h.db.Preload("Owner").Where("owner_id = ?", user.ID).First(&cafe).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"success": false,
				"error":   "Cafe not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to get cafe",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    cafe.ToResponse(),
	})
}

// UpdateCafe updates cafe information (owner only)
func (h *CafeHandler) UpdateCafe(c *fiber.Ctx) error {
	user := c.Locals("user").(*models.User)
	if user.Role != "owner" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"error":   "Only owners can update cafe information",
		})
	}

	var req struct {
		Name                 string  `json:"name"`
		Description          string  `json:"description"`
		LogoURL              string  `json:"logo_url"`
		CoverImageURL        string  `json:"cover_image_url"`
		Address              string  `json:"address"`
		City                 string  `json:"city"`
		Province             string  `json:"province"`
		PostalCode           string  `json:"postal_code"`
		Phone                string  `json:"phone"`
		Email                string  `json:"email"`
		Website              string  `json:"website"`
		CoordinateLat        float64 `json:"coordinate_lat"`
		CoordinateLng        float64 `json:"coordinate_lng"`
		BusinessHours        string  `json:"business_hours"`
		IsOpen               *bool   `json:"is_open"`
		TaxPercentage        float64 `json:"tax_percentage"`
		ServiceChargePercentage float64 `json:"service_charge_percentage"`
		DeliveryFee          float64 `json:"delivery_fee"`
		MinOrderAmount       float64 `json:"min_order_amount"`
		MaxDeliveryDistance  float64 `json:"max_delivery_distance"`
		Features             string  `json:"features"`
		SocialMedia          string  `json:"social_media"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid request body",
		})
	}

	var cafe models.Cafe
	err := h.db.Where("owner_id = ?", user.ID).First(&cafe).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"success": false,
				"error":   "Cafe not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to get cafe",
		})
	}

	// Update fields
	updates := make(map[string]interface{})
	if req.Name != "" {
		updates["name"] = req.Name
	}
	if req.Description != "" {
		updates["description"] = req.Description
	}
	if req.LogoURL != "" {
		updates["logo_url"] = req.LogoURL
	}
	if req.CoverImageURL != "" {
		updates["cover_image_url"] = req.CoverImageURL
	}
	if req.Address != "" {
		updates["address"] = req.Address
	}
	if req.City != "" {
		updates["city"] = req.City
	}
	if req.Province != "" {
		updates["province"] = req.Province
	}
	if req.PostalCode != "" {
		updates["postal_code"] = req.PostalCode
	}
	if req.Phone != "" {
		updates["phone"] = req.Phone
	}
	if req.Email != "" {
		updates["email"] = req.Email
	}
	if req.Website != "" {
		updates["website"] = req.Website
	}
	if req.CoordinateLat != 0 {
		updates["coordinate_lat"] = req.CoordinateLat
	}
	if req.CoordinateLng != 0 {
		updates["coordinate_lng"] = req.CoordinateLng
	}
	if req.BusinessHours != "" {
		updates["business_hours"] = req.BusinessHours
	}
	if req.IsOpen != nil {
		updates["is_open"] = *req.IsOpen
	}
	if req.TaxPercentage > 0 {
		updates["tax_percentage"] = req.TaxPercentage
	}
	if req.ServiceChargePercentage > 0 {
		updates["service_charge_percentage"] = req.ServiceChargePercentage
	}
	if req.DeliveryFee > 0 {
		updates["delivery_fee"] = req.DeliveryFee
	}
	if req.MinOrderAmount > 0 {
		updates["min_order_amount"] = req.MinOrderAmount
	}
	if req.MaxDeliveryDistance > 0 {
		updates["max_delivery_distance"] = req.MaxDeliveryDistance
	}
	if req.Features != "" {
		updates["features"] = req.Features
	}
	if req.SocialMedia != "" {
		updates["social_media"] = req.SocialMedia
	}

	if err := h.db.Model(&cafe).Updates(updates).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to update cafe",
		})
	}

	// Refresh data
	h.db.Preload("Owner").First(&cafe, cafe.ID)

	return c.JSON(fiber.Map{
		"success": true,
		"data":    cafe.ToResponse(),
	})
}

// GetAllCafes gets all active cafes (public)
func (h *CafeHandler) GetAllCafes(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))
	search := c.Query("search", "")
	city := c.Query("city", "")
	isOpen := c.Query("is_open", "")

	offset := (page - 1) * limit

	query := h.db.Model(&models.Cafe{}).Where("status = ?", "active")

	if search != "" {
		query = query.Where("name LIKE ? OR description LIKE ?", "%"+search+"%", "%"+search+"%")
	}
	if city != "" {
		query = query.Where("city = ?", city)
	}
	if isOpen != "" {
		query = query.Where("is_open = ?", isOpen == "true")
	}

	var total int64
	query.Count(&total)

	var cafes []models.Cafe
	err := query.Preload("Owner").
		Offset(offset).
		Limit(limit).
		Order("rating_average DESC, created_at DESC").
		Find(&cafes).Error

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to get cafes",
		})
	}

	var cafeResponses []models.CafeResponse
	for _, cafe := range cafes {
		cafeResponses = append(cafeResponses, cafe.ToResponse())
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"cafes": cafeResponses,
			"pagination": fiber.Map{
				"page":  page,
				"limit": limit,
				"total": total,
				"pages": (total + int64(limit) - 1) / int64(limit),
			},
		},
	})
}

// GetCafeByID gets a specific cafe by ID (public)
func (h *CafeHandler) GetCafeByID(c *fiber.Ctx) error {
	cafeID := c.Params("id")

	var cafe models.Cafe
	err := h.db.Preload("Owner").
		Preload("MenuItems", "is_available = ?", true).
		Preload("Reviews").
		Preload("Reviews.User").
		Where("id = ? AND status = ?", cafeID, "active").
		First(&cafe).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"success": false,
				"error":   "Cafe not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to get cafe",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    cafe.ToResponse(),
	})
}

// ToggleCafeStatus toggles cafe open/closed status (owner only)
func (h *CafeHandler) ToggleCafeStatus(c *fiber.Ctx) error {
	user := c.Locals("user").(*models.User)
	if user.Role != "owner" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"error":   "Only owners can toggle cafe status",
		})
	}

	var cafe models.Cafe
	err := h.db.Where("owner_id = ?", user.ID).First(&cafe).Error
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Cafe not found",
		})
	}

	cafe.IsOpen = !cafe.IsOpen
	if err := h.db.Save(&cafe).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to update cafe status",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"is_open": cafe.IsOpen,
		},
	})
}

// GetCafeAnalytics gets analytics data for the cafe (owner only)
func (h *CafeHandler) GetCafeAnalytics(c *fiber.Ctx) error {
	user := c.Locals("user").(*models.User)
	if user.Role != "owner" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"error":   "Only owners can access analytics",
		})
	}

	var cafe models.Cafe
	err := h.db.Where("owner_id = ?", user.ID).First(&cafe).Error
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Cafe not found",
		})
	}

	// Get date range from query parameters
	startDate := c.Query("start_date", "")
	endDate := c.Query("end_date", "")

	var baseQuery = h.db.Model(&models.Order{}).Where("cafe_id = ?", cafe.ID)

	if startDate != "" && endDate != "" {
		baseQuery = baseQuery.Where("created_at BETWEEN ? AND ?", startDate, endDate)
	} else {
		// Default to last 30 days
		thirtyDaysAgo := time.Now().AddDate(0, 0, -30)
		baseQuery = baseQuery.Where("created_at >= ?", thirtyDaysAgo)
	}

	// Total orders and revenue
	var totalOrders int64
	var totalRevenue float64
	baseQuery.Count(&totalOrders)
	baseQuery.Select("COALESCE(SUM(total_amount), 0)").Scan(&totalRevenue)

	// Orders by status
	var ordersByStatus []struct {
		Status string `json:"status"`
		Count  int64  `json:"count"`
	}
	h.db.Model(&models.Order{}).
		Select("status, COUNT(*) as count").
		Where("cafe_id = ?", cafe.ID).
		Group("status").
		Scan(&ordersByStatus)

	// Popular menu items
	var popularItems []struct {
		MenuName  string  `json:"menu_name"`
		Quantity  int64   `json:"quantity"`
		Revenue   float64 `json:"revenue"`
	}
	h.db.Table("order_items").
		Select("menus.name as menu_name, SUM(order_items.quantity) as quantity, SUM(order_items.total_price) as revenue").
		Joins("JOIN menus ON menus.id = order_items.menu_id").
		Joins("JOIN orders ON orders.id = order_items.order_id").
		Where("orders.cafe_id = ?", cafe.ID).
		Group("menus.id, menus.name").
		Order("quantity DESC").
		Limit(10).
		Scan(&popularItems)

	// Daily stats
	var dailyStats []struct {
		Date   string  `json:"date"`
		Orders int64   `json:"orders"`
		Revenue float64 `json:"revenue"`
	}

	dailyQuery := h.db.Model(&models.Order{}).
		Select("DATE(created_at) as date, COUNT(*) as orders, COALESCE(SUM(total_amount), 0) as revenue").
		Where("cafe_id = ?", cafe.ID)

	if startDate != "" && endDate != "" {
		dailyQuery = dailyQuery.Where("created_at BETWEEN ? AND ?", startDate, endDate)
	} else {
		thirtyDaysAgo := time.Now().AddDate(0, 0, -30)
		dailyQuery = dailyQuery.Where("created_at >= ?", thirtyDaysAgo)
	}

	dailyQuery.Group("DATE(created_at)").Order("date DESC").Scan(&dailyStats)

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"total_orders":     totalOrders,
			"total_revenue":    totalRevenue,
			"orders_by_status": ordersByStatus,
			"popular_items":    popularItems,
			"daily_stats":      dailyStats,
		},
	})
}

// AddCafeReview adds a review for a cafe (customer only)
func (h *CafeHandler) AddCafeReview(c *fiber.Ctx) error {
	user := c.Locals("user").(*models.User)
	if user.Role != "customer" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"error":   "Only customers can add reviews",
		})
	}

	cafeID := c.Params("id")

	var req struct {
		Rating  int    `json:"rating" validate:"required,min=1,max=5"`
		Comment string `json:"comment"`
		Images  string `json:"images"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid request body",
		})
	}

	// Check if cafe exists
	var cafe models.Cafe
	err := h.db.Where("id = ? AND status = ?", cafeID, "active").First(&cafe).Error
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Cafe not found",
		})
	}

	// Check if user has already reviewed this cafe
	var existingReview models.CafeReview
	err = h.db.Where("cafe_id = ? AND user_id = ?", cafeID, user.ID).First(&existingReview).Error
	if err == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "You have already reviewed this cafe",
		})
	}

	review := models.CafeReview{
		ID:     uuid.New().String(),
		CafeID: cafeID,
		UserID: user.ID,
		Rating: req.Rating,
		Comment: req.Comment,
		Images: req.Images,
	}

	if err := h.db.Create(&review).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to add review",
		})
	}

	// Update cafe rating
	h.updateCafeRating(cafeID)

	// Preload data for response
	h.db.Preload("User").First(&review, review.ID)

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"data":    review.ToResponse(),
	})
}

// GetCafeReviews gets reviews for a cafe
func (h *CafeHandler) GetCafeReviews(c *fiber.Ctx) error {
	cafeID := c.Params("id")
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))
	rating := c.Query("rating", "")

	offset := (page - 1) * limit

	query := h.db.Model(&models.CafeReview{}).Where("cafe_id = ?", cafeID)

	if rating != "" {
		query = query.Where("rating = ?", rating)
	}

	var total int64
	query.Count(&total)

	var reviews []models.CafeReview
	err := query.Preload("User").
		Offset(offset).
		Limit(limit).
		Order("created_at DESC").
		Find(&reviews).Error

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to get reviews",
		})
	}

	var reviewResponses []models.CafeReviewResponse
	for _, review := range reviews {
		reviewResponses = append(reviewResponses, review.ToResponse())
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"reviews": reviewResponses,
			"pagination": fiber.Map{
				"page":  page,
				"limit": limit,
				"total": total,
				"pages": (total + int64(limit) - 1) / int64(limit),
			},
		},
	})
}

// Helper function to update cafe rating
func (h *CafeHandler) updateCafeRating(cafeID string) {
	var avgRating struct {
		Average float64 `json:"average"`
		Count   int64   `json:"count"`
	}

	h.db.Model(&models.CafeReview{}).
		Select("AVG(rating) as average, COUNT(*) as count").
		Where("cafe_id = ?", cafeID).
		Scan(&avgRating)

	h.db.Model(&models.Cafe{}).
		Where("id = ?", cafeID).
		Updates(map[string]interface{}{
			"rating_average": avgRating.Average,
			"rating_count":   avgRating.Count,
		})
}