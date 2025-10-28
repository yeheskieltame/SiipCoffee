package handlers

import (
	"fmt"
	"strconv"
	"time"

	"siipcoffe-api/internal/models"
	"siipcoffe-api/pkg/utils"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type UserHandler struct {
	db *gorm.DB
}

func NewUserHandler(db *gorm.DB) *UserHandler {
	return &UserHandler{db: db}
}

// GetProfile gets current user's profile
func (h *UserHandler) GetProfile(c *fiber.Ctx) error {
	user := c.Locals("user").(*models.User)

	// Preload additional data based on role
	if user.Role == "owner" {
		var cafe models.Cafe
		h.db.Where("owner_id = ?", user.ID).First(&cafe)

		// Add cafe info if exists
		if cafe.ID != "" {
			// Create a map response that includes user data and cafe data
			response := make(map[string]interface{})
			userResp := user.ToResponse()

			// Convert UserResponse to map
			response["id"] = userResp.ID
			response["name"] = userResp.Name
			response["email"] = userResp.Email
			response["role"] = userResp.Role
			response["phone"] = userResp.Phone
			response["address"] = userResp.Address
			response["cafe"] = cafe.ToResponse()

			return c.JSON(fiber.Map{
				"success": true,
				"data":    response,
			})
		}
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    user.ToResponse(),
	})
}

// UpdateProfile updates current user's profile
func (h *UserHandler) UpdateProfile(c *fiber.Ctx) error {
	user := c.Locals("user").(*models.User)

	var req struct {
		Name    string `json:"name"`
		Email   string `json:"email"`
		Phone   string `json:"phone"`
		Address string `json:"address"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid request body",
		})
	}

	// Check if email is being changed and if it's already taken
	if req.Email != "" && req.Email != user.Email {
		var existingUser models.User
		err := h.db.Where("email = ? AND id != ?", req.Email, user.ID).First(&existingUser).Error
		if err == nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success": false,
				"error":   "Email already exists",
			})
		}
	}

	updates := make(map[string]interface{})
	if req.Name != "" {
		updates["name"] = req.Name
	}
	if req.Email != "" {
		updates["email"] = req.Email
	}
	if req.Phone != "" {
		updates["phone"] = req.Phone
	}
	if req.Address != "" {
		updates["address"] = req.Address
	}

	if err := h.db.Model(user).Updates(updates).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to update profile",
		})
	}

	// Refresh user data
	h.db.First(user, user.ID)

	return c.JSON(fiber.Map{
		"success": true,
		"data":    user.ToResponse(),
	})
}

// ChangePassword changes user's password
func (h *UserHandler) ChangePassword(c *fiber.Ctx) error {
	user := c.Locals("user").(*models.User)

	var req struct {
		CurrentPassword string `json:"current_password" validate:"required"`
		NewPassword     string `json:"new_password" validate:"required,min=6"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid request body",
		})
	}

	// Verify current password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.CurrentPassword)); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Current password is incorrect",
		})
	}

	// Hash new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to hash password",
		})
	}

	// Update password
	if err := h.db.Model(user).Update("password", string(hashedPassword)).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to update password",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Password updated successfully",
	})
}

// UploadAvatar uploads user avatar
func (h *UserHandler) UploadAvatar(c *fiber.Ctx) error {
	user := c.Locals("user").(*models.User)

	file, err := c.FormFile("avatar")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "No file uploaded",
		})
	}

	// Validate file size (max 5MB)
	if file.Size > 5*1024*1024 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "File size too large (max 5MB)",
		})
	}

	// Validate file type
	if !utils.IsImageFile(file.Filename) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid file type (only images allowed)",
		})
	}

	// Generate unique filename
	filename := fmt.Sprintf("avatars/%s_%s", user.ID, uuid.New().String()+utils.GetFileExtension(file.Filename))

	// Upload file (implement your cloud storage logic here)
	// For now, we'll just return a mock URL
	avatarURL := fmt.Sprintf("https://cdn.example.com/%s", filename)

	// Update user avatar URL in database
	if err := h.db.Model(user).Update("avatar_url", avatarURL).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to update avatar",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"avatar_url": avatarURL,
		},
	})
}

// GetUserOrders gets user's order history
func (h *UserHandler) GetUserOrders(c *fiber.Ctx) error {
	user := c.Locals("user").(*models.User)
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))
	status := c.Query("status", "")

	offset := (page - 1) * limit

	query := h.db.Model(&models.Order{}).Where("user_id = ?", user.ID)

	if status != "" {
		query = query.Where("status = ?", status)
	}

	var total int64
	query.Count(&total)

	var orders []models.Order
	err := query.Preload("Cafe").
		Preload("OrderItems").
		Preload("OrderItems.Menu").
		Offset(offset).
		Limit(limit).
		Order("created_at DESC").
		Find(&orders).Error

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to get orders",
		})
	}

	var orderResponses []models.OrderResponse
	for _, order := range orders {
		orderResponses = append(orderResponses, order.ToResponse())
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"orders": orderResponses,
			"pagination": fiber.Map{
				"page":  page,
				"limit": limit,
				"total": total,
				"pages": (total + int64(limit) - 1) / int64(limit),
			},
		},
	})
}

// GetUserLoyaltyInfo gets user's loyalty program information
func (h *UserHandler) GetUserLoyaltyInfo(c *fiber.Ctx) error {
	user := c.Locals("user").(*models.User)
	if user.Role != "customer" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"error":   "Loyalty program is only available for customers",
		})
	}

	var loyaltyMembers []models.LoyaltyMember
	err := h.db.Preload("Program").
		Preload("Program.Cafe").
		Where("user_id = ?", user.ID).
		Find(&loyaltyMembers).Error

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to get loyalty information",
		})
	}

	var memberResponses []models.LoyaltyMemberResponse
	for _, member := range loyaltyMembers {
		response := member.ToResponse()

		// Calculate next tier information
		// This is a simplified example - you would implement proper tier logic
		nextTier := ""
		pointsToNext := 0
		switch member.MemberTier {
		case "bronze":
			nextTier = "silver"
			pointsToNext = 500 - member.CurrentPoints
		case "silver":
			nextTier = "gold"
			pointsToNext = 1000 - member.CurrentPoints
		case "gold":
			nextTier = "platinum"
			pointsToNext = 2000 - member.CurrentPoints
		}

		// Update response with calculated values
		response.NextTier = nextTier
		response.PointsToNextTier = pointsToNext
		if pointsToNext < 0 {
			response.PointsToNextTier = 0
		}

		memberResponses = append(memberResponses, response)
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    memberResponses,
	})
}

// GetUserFavorites gets user's favorite cafes
func (h *UserHandler) GetUserFavorites(c *fiber.Ctx) error {
	user := c.Locals("user").(*models.User)
	if user.Role != "customer" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"error":   "Favorites are only available for customers",
		})
	}

	// This assumes you have a favorites table - for now return empty
	return c.JSON(fiber.Map{
		"success": true,
		"data":    []interface{}{},
	})
}

// AddToFavorites adds a cafe to user's favorites
func (h *UserHandler) AddToFavorites(c *fiber.Ctx) error {
	user := c.Locals("user").(*models.User)
	if user.Role != "customer" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"error":   "Favorites are only available for customers",
		})
	}

	cafeID := c.Params("id")

	// Check if cafe exists
	var cafe models.Cafe
	err := h.db.Where("id = ? AND status = ?", cafeID, "active").First(&cafe).Error
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Cafe not found",
		})
	}

	// Check if already in favorites
	// This assumes you have a favorites table
	// For now, just return success

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Cafe added to favorites",
	})
}

// RemoveFromFavorites removes a cafe from user's favorites
func (h *UserHandler) RemoveFromFavorites(c *fiber.Ctx) error {
	user := c.Locals("user").(*models.User)
	if user.Role != "customer" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"error":   "Favorites are only available for customers",
		})
	}

	// Remove from favorites
	// This assumes you have a favorites table
	// The cafe ID parameter is not used yet, keeping it for future implementation
	_ = c.Params("id")

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Cafe removed from favorites",
	})
}

// GetUserNotifications gets user's notifications
func (h *UserHandler) GetUserNotifications(c *fiber.Ctx) error {
	user := c.Locals("user").(*models.User)
	if user.Role != "customer" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"error":   "Notifications are only available for customers",
		})
	}

	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "20"))
	unreadOnly := c.Query("unread_only", "false")

	// This assumes you have a notifications table
	// For now, return mock data

	var notifications []map[string]interface{}

	// Add some mock notifications for demonstration
	if page == 1 {
		notifications = append(notifications, map[string]interface{}{
			"id":         uuid.New().String(),
			"title":      "Order Status Updated",
			"message":    "Your order #ORD-001 is now being prepared",
			"type":       "order_update",
			"is_read":    false,
			"created_at": time.Now().Add(-30 * time.Minute),
		})

		notifications = append(notifications, map[string]interface{}{
			"id":         uuid.New().String(),
			"title":      "New Cafe Nearby",
			"message":    "Check out our new cafe opening in your area!",
			"type":       "promotion",
			"is_read":    true,
			"created_at": time.Now().Add(-2 * time.Hour),
		})
	}

	if unreadOnly == "true" {
		var unreadNotifications []map[string]interface{}
		for _, notif := range notifications {
			if !notif["is_read"].(bool) {
				unreadNotifications = append(unreadNotifications, notif)
			}
		}
		notifications = unreadNotifications
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"notifications": notifications,
			"pagination": fiber.Map{
				"page":  page,
				"limit": limit,
				"total": int64(len(notifications)),
				"pages": 1,
			},
		},
	})
}

// MarkNotificationAsRead marks a notification as read
func (h *UserHandler) MarkNotificationAsRead(c *fiber.Ctx) error {
	user := c.Locals("user").(*models.User)
	if user.Role != "customer" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"error":   "Notifications are only available for customers",
		})
	}

	// This assumes you have a notifications table
	// Update notification as read for this user
	// The notification ID parameter is not used yet, keeping it for future implementation
	_ = c.Params("id")

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Notification marked as read",
	})
}

// DeleteAccount deletes user's account
func (h *UserHandler) DeleteAccount(c *fiber.Ctx) error {
	user := c.Locals("user").(*models.User)

	var req struct {
		Password string `json:"password" validate:"required"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid request body",
		})
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Password is incorrect",
		})
	}

	// Soft delete user
	if err := h.db.Delete(user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to delete account",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Account deleted successfully",
	})
}