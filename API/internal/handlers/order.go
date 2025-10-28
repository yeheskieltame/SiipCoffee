package handlers

import (
	"fmt"
	"time"

	"siipcoffe-api/internal/config"
	"siipcoffe-api/internal/models"
	"siipcoffe-api/pkg/gemini"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type OrderHandler struct {
	db           *gorm.DB
	geminiClient *gemini.Client
	cfg          *config.Config
}

func NewOrderHandler(db *gorm.DB, geminiClient *gemini.Client, cfg *config.Config) *OrderHandler {
	return &OrderHandler{
		db:           db,
		geminiClient: geminiClient,
		cfg:          cfg,
	}
}

type CreateOrderRequest struct {
	Items          []OrderItemRequest `json:"items" validate:"required"`
	OrderType      string             `json:"order_type" validate:"required,oneof=dine_in take_away delivery"`
	CustomerName   string             `json:"customer_name" validate:"required"`
	CustomerPhone  string             `json:"customer_phone"`
	TableNumber    string             `json:"table_number"`
	DeliveryAddress string            `json:"delivery_address"`
	Notes          string             `json:"notes"`
	PaymentMethod  string             `json:"payment_method" validate:"required,oneof=crypto cash transfer"`
}

type OrderItemRequest struct {
	MenuID  string  `json:"menu_id" validate:"required"`
	Quantity int    `json:"quantity" validate:"required,min=1"`
	Notes   string  `json:"notes"`
}

func (h *OrderHandler) CreateOrder(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)

	var req CreateOrderRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
			"message": err.Error(),
		})
	}

	// Validate required fields
	if len(req.Items) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "At least one item is required",
		})
	}

	// Start transaction
	tx := h.db.Begin()

	// Create order
	order := models.Order{
		ID:             uuid.New().String(),
		UserID:         userID,
		OrderNumber:    h.generateOrderNumber(),
		Status:         string(models.OrderStatusPending),
		PaymentMethod:  req.PaymentMethod,
		PaymentStatus:  string(models.PaymentStatusPending),
		CustomerName:   req.CustomerName,
		CustomerPhone:  req.CustomerPhone,
		OrderType:      req.OrderType,
		TableNumber:    req.TableNumber,
		DeliveryAddress: req.DeliveryAddress,
		Notes:          req.Notes,
	}

	var totalAmount float64
	var orderItems []models.OrderItem

	// Process each item
	for _, itemReq := range req.Items {
		// Get menu item
		var menu models.Menu
		err := tx.First(&menu, "id = ? AND is_available = ?", itemReq.MenuID, true).Error
		if err != nil {
			tx.Rollback()
			if err == gorm.ErrRecordNotFound {
				return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
					"error": fmt.Sprintf("Menu item %s not found or unavailable", itemReq.MenuID),
				})
			}
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to fetch menu item",
				"message": err.Error(),
			})
		}

		// Create order item
		itemTotal := float64(itemReq.Quantity) * menu.Price
		orderItem := models.OrderItem{
			ID:         uuid.New().String(),
			OrderID:    order.ID,
			MenuID:     menu.ID,
			Quantity:   itemReq.Quantity,
			UnitPrice:  menu.Price,
			TotalPrice: itemTotal,
			Notes:      itemReq.Notes,
		}

		orderItems = append(orderItems, orderItem)
		totalAmount += itemTotal
	}

	order.TotalAmount = totalAmount

	// Save order
	if err := tx.Create(&order).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create order",
			"message": err.Error(),
		})
	}

	// Save order items
	for _, item := range orderItems {
		if err := tx.Create(&item).Error; err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to create order item",
				"message": err.Error(),
			})
		}
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to commit transaction",
			"message": err.Error(),
		})
	}

	// Load order with relations for response
	if err := h.db.Preload("OrderItems.Menu").Preload("User").First(&order, "id = ?", order.ID).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to load order details",
			"message": err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Order created successfully",
		"data": order.ToResponse(),
	})
}

func (h *OrderHandler) GetUserOrders(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)

	// Parse query parameters
	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 10)
	status := c.Query("status")

	var orders []models.Order
	var total int64

	query := h.db.Where("user_id = ?", userID).Preload("OrderItems.Menu").Preload("User")

	// Filter by status if provided
	if status != "" {
		query = query.Where("status = ?", status)
	}

	// Count total records
	query.Model(&models.Order{}).Count(&total)

	// Get orders with pagination
	offset := (page - 1) * limit
	err := query.Offset(offset).Limit(limit).Order("created_at DESC").Find(&orders).Error
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch orders",
			"message": err.Error(),
		})
	}

	// Convert to response format
	var response []models.OrderResponse
	for _, order := range orders {
		response = append(response, order.ToResponse())
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data": response,
		"pagination": fiber.Map{
			"page":  page,
			"limit": limit,
			"total": total,
		},
	})
}

func (h *OrderHandler) GetOrderByID(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	userRole := c.Locals("user_role").(string)
	orderID := c.Params("id")

	var order models.Order
	query := h.db.Preload("OrderItems.Menu").Preload("User").Preload("Payment")

	// Owners can see any order, customers can only see their own orders
	if userRole != "owner" {
		query = query.Where("id = ? AND user_id = ?", orderID, userID)
	} else {
		query = query.Where("id = ?", orderID)
	}

	err := query.First(&order).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Order not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch order",
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data": order.ToResponse(),
	})
}

func (h *OrderHandler) UpdateOrderStatus(c *fiber.Ctx) error {
	orderID := c.Params("id")

	var req struct {
		Status string `json:"status" validate:"required,oneof=pending confirmed preparing ready completed cancelled"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
			"message": err.Error(),
		})
	}

	// Get order
	var order models.Order
	err := h.db.First(&order, "id = ?", orderID).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Order not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch order",
			"message": err.Error(),
		})
	}

	// Update status
	updates := map[string]interface{}{
		"status": req.Status,
	}

	// Set completed_at if order is completed
	if req.Status == string(models.OrderStatusCompleted) {
		now := time.Now()
		updates["completed_at"] = &now
	}

	err = h.db.Model(&order).Updates(updates).Error
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update order status",
			"message": err.Error(),
		})
	}

	// Refresh order data
	h.db.Preload("OrderItems.Menu").Preload("User").First(&order, "id = ?", orderID)

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Order status updated successfully",
		"data": order.ToResponse(),
	})
}

func (h *OrderHandler) generateOrderNumber() string {
	timestamp := time.Now().Format("20060102")
	random := uuid.New().String()[:8]
	return fmt.Sprintf("ORD-%s-%s", timestamp, random)
}