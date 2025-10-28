package handlers

import (
	"strconv"
	"time"

	"siipcoffe-api/internal/models"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type InventoryHandler struct {
	db *gorm.DB
}

func NewInventoryHandler(db *gorm.DB) *InventoryHandler {
	return &InventoryHandler{db: db}
}

// GetInventoryItems gets all inventory items for a cafe (owner only)
func (h *InventoryHandler) GetInventoryItems(c *fiber.Ctx) error {
	user := c.Locals("user").(*models.User)
	if user.Role != "owner" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"error":   "Only owners can access inventory",
		})
	}

	// Get user's cafe
	var cafe models.Cafe
	err := h.db.Where("owner_id = ?", user.ID).First(&cafe).Error
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Cafe not found",
		})
	}

	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "50"))
	category := c.Query("category", "")
	location := c.Query("location", "")
	status := c.Query("status", "") // low, optimal, overstock

	offset := (page - 1) * limit

	query := h.db.Model(&models.Inventory{}).Where("cafe_id = ?", cafe.ID)

	if category != "" {
		query = query.Where("category = ?", category)
	}
	if location != "" {
		query = query.Where("location = ?", location)
	}
	if status != "" {
		switch status {
		case "low":
			query = query.Where("current_stock <= min_stock_level")
		case "optimal":
			query = query.Where("current_stock > min_stock_level AND (max_stock_level = 0 OR current_stock < max_stock_level)")
		case "overstock":
			query = query.Where("max_stock_level > 0 AND current_stock >= max_stock_level")
		}
	}

	var total int64
	query.Count(&total)

	var inventoryItems []models.Inventory
	err = query.Offset(offset).
		Limit(limit).
		Order("name ASC").
		Find(&inventoryItems).Error

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to get inventory items",
		})
	}

	var responses []models.InventoryResponse
	for _, item := range inventoryItems {
		responses = append(responses, item.ToResponse())
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"inventory": responses,
			"pagination": fiber.Map{
				"page":  page,
				"limit": limit,
				"total": total,
				"pages": (total + int64(limit) - 1) / int64(limit),
			},
		},
	})
}

// CreateInventoryItem creates a new inventory item (owner only)
func (h *InventoryHandler) CreateInventoryItem(c *fiber.Ctx) error {
	user := c.Locals("user").(*models.User)
	if user.Role != "owner" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"error":   "Only owners can create inventory items",
		})
	}

	// Get user's cafe
	var cafe models.Cafe
	err := h.db.Where("owner_id = ?", user.ID).First(&cafe).Error
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Cafe not found",
		})
	}

	var req struct {
		Name           string  `json:"name" validate:"required"`
		Description    string  `json:"description"`
		Category       string  `json:"category" validate:"required"`
		Unit           string  `json:"unit" validate:"required"`
		CurrentStock   float64 `json:"current_stock" validate:"min=0"`
		MinStockLevel  float64 `json:"min_stock_level" validate:"min=0"`
		MaxStockLevel  float64 `json:"max_stock_level" validate:"min=0"`
		UnitCost       float64 `json:"unit_cost" validate:"min=0"`
		Supplier       string  `json:"supplier"`
		SupplierContact string `json:"supplier_contact"`
		ExpiryDate     string  `json:"expiry_date"`
		Location       string  `json:"location"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid request body",
		})
	}

	inventory := models.Inventory{
		ID:             uuid.New().String(),
		CafeID:         cafe.ID,
		Name:           req.Name,
		Description:    req.Description,
		Category:       req.Category,
		Unit:           req.Unit,
		CurrentStock:   req.CurrentStock,
		MinStockLevel:  req.MinStockLevel,
		MaxStockLevel:  req.MaxStockLevel,
		UnitCost:       req.UnitCost,
		Supplier:       req.Supplier,
		SupplierContact: req.SupplierContact,
		Location:       req.Location,
		IsActive:       true,
	}

	// Parse expiry date if provided
	if req.ExpiryDate != "" {
		expiryDate, err := time.Parse("2006-01-02", req.ExpiryDate)
		if err == nil {
			inventory.ExpiryDate = &expiryDate
		}
	}

	if err := h.db.Create(&inventory).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to create inventory item",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"data":    inventory.ToResponse(),
	})
}

// UpdateInventoryItem updates an inventory item (owner only)
func (h *InventoryHandler) UpdateInventoryItem(c *fiber.Ctx) error {
	user := c.Locals("user").(*models.User)
	if user.Role != "owner" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"error":   "Only owners can update inventory items",
		})
	}

	// Get user's cafe
	var cafe models.Cafe
	err := h.db.Where("owner_id = ?", user.ID).First(&cafe).Error
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Cafe not found",
		})
	}

	itemID := c.Params("id")

	var req struct {
		Name           string  `json:"name"`
		Description    string  `json:"description"`
		Category       string  `json:"category"`
		Unit           string  `json:"unit"`
		MinStockLevel  float64 `json:"min_stock_level"`
		MaxStockLevel  float64 `json:"max_stock_level"`
		UnitCost       float64 `json:"unit_cost"`
		Supplier       string  `json:"supplier"`
		SupplierContact string `json:"supplier_contact"`
		Location       string  `json:"location"`
		IsActive       *bool   `json:"is_active"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid request body",
		})
	}

	var inventory models.Inventory
	err = h.db.Where("id = ? AND cafe_id = ?", itemID, cafe.ID).First(&inventory).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"success": false,
				"error":   "Inventory item not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to get inventory item",
		})
	}

	updates := make(map[string]interface{})
	if req.Name != "" {
		updates["name"] = req.Name
	}
	if req.Description != "" {
		updates["description"] = req.Description
	}
	if req.Category != "" {
		updates["category"] = req.Category
	}
	if req.Unit != "" {
		updates["unit"] = req.Unit
	}
	if req.MinStockLevel >= 0 {
		updates["min_stock_level"] = req.MinStockLevel
	}
	if req.MaxStockLevel >= 0 {
		updates["max_stock_level"] = req.MaxStockLevel
	}
	if req.UnitCost >= 0 {
		updates["unit_cost"] = req.UnitCost
	}
	if req.Supplier != "" {
		updates["supplier"] = req.Supplier
	}
	if req.SupplierContact != "" {
		updates["supplier_contact"] = req.SupplierContact
	}
	if req.Location != "" {
		updates["location"] = req.Location
	}
	if req.IsActive != nil {
		updates["is_active"] = *req.IsActive
	}

	if err := h.db.Model(&inventory).Updates(updates).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to update inventory item",
		})
	}

	h.db.First(&inventory, inventory.ID)

	return c.JSON(fiber.Map{
		"success": true,
		"data":    inventory.ToResponse(),
	})
}

// AddStockMovement adds a stock movement (owner only)
func (h *InventoryHandler) AddStockMovement(c *fiber.Ctx) error {
	user := c.Locals("user").(*models.User)
	if user.Role != "owner" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"error":   "Only owners can add stock movements",
		})
	}

	// Get user's cafe
	var cafe models.Cafe
	err := h.db.Where("owner_id = ?", user.ID).First(&cafe).Error
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Cafe not found",
		})
	}

	itemID := c.Params("id")

	var req struct {
		Type        string  `json:"type" validate:"required"` // in, out, adjustment, waste
		Quantity    float64 `json:"quantity" validate:"required"`
		UnitCost    float64 `json:"unit_cost"`
		Reason      string  `json:"reason" validate:"required"`
		ReferenceID string  `json:"reference_id"`
		Notes       string  `json:"notes"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid request body",
		})
	}

	// Validate movement type
	validTypes := map[string]bool{"in": true, "out": true, "adjustment": true, "waste": true}
	if !validTypes[req.Type] {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid movement type",
		})
	}

	var inventory models.Inventory
	err = h.db.Where("id = ? AND cafe_id = ?", itemID, cafe.ID).First(&inventory).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"success": false,
				"error":   "Inventory item not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to get inventory item",
		})
	}

	// Create stock movement
	totalCost := req.Quantity * req.UnitCost
	movement := models.StockMovement{
		ID:          uuid.New().String(),
		InventoryID: itemID,
		CafeID:      cafe.ID,
		Type:        req.Type,
		Quantity:    req.Quantity,
		UnitCost:    req.UnitCost,
		TotalCost:   totalCost,
		Reason:      req.Reason,
		ReferenceID: req.ReferenceID,
		Notes:       req.Notes,
		PerformedBy: user.ID,
	}

	// Start transaction
	tx := h.db.Begin()

	// Create movement record
	if err := tx.Create(&movement).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to create stock movement",
		})
	}

	// Update inventory stock
	newStock := inventory.CurrentStock
	switch req.Type {
	case "in":
		newStock += req.Quantity
		if req.UnitCost > 0 {
			// Update unit cost if this is a purchase
			updates := map[string]interface{}{
				"current_stock": newStock,
				"unit_cost":     req.UnitCost,
			}
			if err := tx.Model(&inventory).Updates(updates).Error; err != nil {
				tx.Rollback()
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"success": false,
					"error":   "Failed to update inventory",
				})
			}
		} else {
			if err := tx.Model(&inventory).Update("current_stock", newStock).Error; err != nil {
				tx.Rollback()
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"success": false,
					"error":   "Failed to update inventory",
				})
			}
		}
	case "out", "waste", "adjustment":
		newStock -= req.Quantity
		if newStock < 0 {
			tx.Rollback()
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success": false,
				"error":   "Insufficient stock",
			})
		}
		if err := tx.Model(&inventory).Update("current_stock", newStock).Error; err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success": false,
				"error":   "Failed to update inventory",
			})
		}
	}

	// Update last restocked timestamp for incoming stock
	if req.Type == "in" {
		now := time.Now()
		tx.Model(&inventory).Update("last_restocked", &now)
	}

	tx.Commit()

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"data":    movement.ToResponse(),
	})
}

// GetStockMovements gets stock movements for an inventory item (owner only)
func (h *InventoryHandler) GetStockMovements(c *fiber.Ctx) error {
	user := c.Locals("user").(*models.User)
	if user.Role != "owner" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"error":   "Only owners can access stock movements",
		})
	}

	// Get user's cafe
	var cafe models.Cafe
	err := h.db.Where("owner_id = ?", user.ID).First(&cafe).Error
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Cafe not found",
		})
	}

	itemID := c.Params("id")
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "50"))
	movementType := c.Query("type", "")

	offset := (page - 1) * limit

	query := h.db.Model(&models.StockMovement{}).
		Joins("JOIN inventories ON inventories.id = stock_movements.inventory_id").
		Where("stock_movements.inventory_id = ? AND inventories.cafe_id = ?", itemID, cafe.ID)

	if movementType != "" {
		query = query.Where("stock_movements.type = ?", movementType)
	}

	var total int64
	query.Count(&total)

	var movements []models.StockMovement
	err = query.Preload("Inventory").
		Preload("User").
		Offset(offset).
		Limit(limit).
		Order("stock_movements.created_at DESC").
		Find(&movements).Error

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to get stock movements",
		})
	}

	var responses []models.StockMovementResponse
	for _, movement := range movements {
		responses = append(responses, movement.ToResponse())
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"movements": responses,
			"pagination": fiber.Map{
				"page":  page,
				"limit": limit,
				"total": total,
				"pages": (total + int64(limit) - 1) / int64(limit),
			},
		},
	})
}

// GetLowStockItems gets items with low stock (owner only)
func (h *InventoryHandler) GetLowStockItems(c *fiber.Ctx) error {
	user := c.Locals("user").(*models.User)
	if user.Role != "owner" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"error":   "Only owners can access inventory reports",
		})
	}

	// Get user's cafe
	var cafe models.Cafe
	err := h.db.Where("owner_id = ?", user.ID).First(&cafe).Error
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Cafe not found",
		})
	}

	var lowStockItems []models.Inventory
	err = h.db.Where("cafe_id = ? AND current_stock <= min_stock_level AND is_active = ?", cafe.ID, true).
		Order("current_stock ASC").
		Find(&lowStockItems).Error

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to get low stock items",
		})
	}

	var responses []models.InventoryResponse
	for _, item := range lowStockItems {
		responses = append(responses, item.ToResponse())
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    responses,
	})
}

// GetExpiringItems gets items that will expire soon (owner only)
func (h *InventoryHandler) GetExpiringItems(c *fiber.Ctx) error {
	user := c.Locals("user").(*models.User)
	if user.Role != "owner" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"error":   "Only owners can access inventory reports",
		})
	}

	// Get user's cafe
	var cafe models.Cafe
	err := h.db.Where("owner_id = ?", user.ID).First(&cafe).Error
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Cafe not found",
		})
	}

	// Get items expiring in the next 7 days
	sevenDaysFromNow := time.Now().AddDate(0, 0, 7)
	var expiringItems []models.Inventory
	err = h.db.Where("cafe_id = ? AND expiry_date IS NOT NULL AND expiry_date <= ? AND current_stock > 0 AND is_active = ?",
		cafe.ID, sevenDaysFromNow, true).
		Order("expiry_date ASC").
		Find(&expiringItems).Error

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to get expiring items",
		})
	}

	var responses []models.InventoryResponse
	for _, item := range expiringItems {
		responses = append(responses, item.ToResponse())
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    responses,
	})
}

// DeleteInventoryItem deletes an inventory item (owner only)
func (h *InventoryHandler) DeleteInventoryItem(c *fiber.Ctx) error {
	user := c.Locals("user").(*models.User)
	if user.Role != "owner" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"error":   "Only owners can delete inventory items",
		})
	}

	// Get user's cafe
	var cafe models.Cafe
	err := h.db.Where("owner_id = ?", user.ID).First(&cafe).Error
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Cafe not found",
		})
	}

	itemID := c.Params("id")

	var inventory models.Inventory
	err = h.db.Where("id = ? AND cafe_id = ?", itemID, cafe.ID).First(&inventory).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"success": false,
				"error":   "Inventory item not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to get inventory item",
		})
	}

	if err := h.db.Delete(&inventory).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to delete inventory item",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Inventory item deleted successfully",
	})
}