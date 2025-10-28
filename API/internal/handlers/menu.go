package handlers

import (
	"siipcoffe-api/internal/models"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type MenuHandler struct {
	db *gorm.DB
}

func NewMenuHandler(db *gorm.DB) *MenuHandler {
	return &MenuHandler{db: db}
}

func (h *MenuHandler) GetAllMenus(c *fiber.Ctx) error {
	var menus []models.Menu
	var err error

	// Filter by category if provided
	category := c.Query("category")
	if category != "" {
		err = h.db.Where("category = ? AND is_available = ?", category, true).Find(&menus).Error
	} else {
		err = h.db.Where("is_available = ?", true).Find(&menus).Error
	}

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch menus",
			"message": err.Error(),
		})
	}

	// Convert to response format
	var response []models.MenuResponse
	for _, menu := range menus {
		response = append(response, menu.ToResponse())
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data": response,
		"count": len(response),
	})
}

func (h *MenuHandler) GetMenuByID(c *fiber.Ctx) error {
	id := c.Params("id")

	var menu models.Menu
	err := h.db.Where("id = ? AND is_available = ?", id, true).First(&menu).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Menu not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch menu",
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data": menu.ToResponse(),
	})
}

func (h *MenuHandler) CreateMenu(c *fiber.Ctx) error {
	var req struct {
		Name        string  `json:"name" validate:"required"`
		Description string  `json:"description"`
		Category    string  `json:"category" validate:"required"`
		Price       float64 `json:"price" validate:"required,gt=0"`
		ImageURL    string  `json:"image_url"`
		IsAvailable bool    `json:"is_available"`
		Ingredients string  `json:"ingredients"`
		PrepTime    int     `json:"prep_time" validate:"min=1"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
			"message": err.Error(),
		})
	}

	// Validate required fields
	if req.Name == "" || req.Category == "" || req.Price <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Name, category, and price are required",
		})
	}

	menu := models.Menu{
		ID:          uuid.New().String(),
		Name:        req.Name,
		Description: req.Description,
		Category:    req.Category,
		Price:       req.Price,
		ImageURL:    req.ImageURL,
		IsAvailable: req.IsAvailable,
		Ingredients: req.Ingredients,
		PrepTime:    req.PrepTime,
	}

	if err := h.db.Create(&menu).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create menu",
			"message": err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Menu created successfully",
		"data": menu.ToResponse(),
	})
}

func (h *MenuHandler) UpdateMenu(c *fiber.Ctx) error {
	id := c.Params("id")

	var menu models.Menu
	err := h.db.First(&menu, "id = ?", id).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Menu not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch menu",
			"message": err.Error(),
		})
	}

	var req struct {
		Name        *string  `json:"name"`
		Description *string  `json:"description"`
		Category    *string  `json:"category"`
		Price       *float64 `json:"price"`
		ImageURL    *string  `json:"image_url"`
		IsAvailable *bool    `json:"is_available"`
		Ingredients *string  `json:"ingredients"`
		PrepTime    *int     `json:"prep_time"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
			"message": err.Error(),
		})
	}

	// Update only provided fields
	updates := make(map[string]interface{})
	if req.Name != nil {
		updates["name"] = *req.Name
	}
	if req.Description != nil {
		updates["description"] = *req.Description
	}
	if req.Category != nil {
		updates["category"] = *req.Category
	}
	if req.Price != nil {
		updates["price"] = *req.Price
	}
	if req.ImageURL != nil {
		updates["image_url"] = *req.ImageURL
	}
	if req.IsAvailable != nil {
		updates["is_available"] = *req.IsAvailable
	}
	if req.Ingredients != nil {
		updates["ingredients"] = *req.Ingredients
	}
	if req.PrepTime != nil {
		updates["prep_time"] = *req.PrepTime
	}

	if err := h.db.Model(&menu).Updates(updates).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update menu",
			"message": err.Error(),
		})
	}

	// Refresh menu data
	h.db.First(&menu, "id = ?", id)

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Menu updated successfully",
		"data": menu.ToResponse(),
	})
}

func (h *MenuHandler) DeleteMenu(c *fiber.Ctx) error {
	id := c.Params("id")

	// Soft delete by setting is_available to false
	err := h.db.Model(&models.Menu{}).Where("id = ?", id).Update("is_available", false).Error
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete menu",
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Menu deleted successfully",
	})
}

func (h *MenuHandler) GetCategories(c *fiber.Ctx) error {
	categories := models.GetDefaultCategories()

	return c.JSON(fiber.Map{
		"success": true,
		"data": categories,
	})
}

func (h *MenuHandler) SearchMenus(c *fiber.Ctx) error {
	query := c.Query("q")
	if query == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Search query is required",
		})
	}

	var menus []models.Menu
	err := h.db.Where("is_available = ? AND (name LIKE ? OR description LIKE ? OR category LIKE ?)",
		true, "%"+query+"%", "%"+query+"%", "%"+query+"%").Find(&menus).Error

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to search menus",
			"message": err.Error(),
		})
	}

	var response []models.MenuResponse
	for _, menu := range menus {
		response = append(response, menu.ToResponse())
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data": response,
		"count": len(response),
		"query": query,
	})
}