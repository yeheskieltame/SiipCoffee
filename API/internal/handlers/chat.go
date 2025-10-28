package handlers

import (
	"context"
	"encoding/json"

	"siipcoffe-api/internal/config"
	"siipcoffe-api/internal/models"
	"siipcoffe-api/pkg/gemini"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ChatHandler struct {
	db           *gorm.DB
	geminiClient *gemini.Client
	cfg          *config.Config
}

func NewChatHandler(db *gorm.DB, geminiClient *gemini.Client, cfg *config.Config) *ChatHandler {
	return &ChatHandler{
		db:           db,
		geminiClient: geminiClient,
		cfg:          cfg,
	}
}

type ChatMessageRequest struct {
	Message   string `json:"message" validate:"required"`
	SessionID string `json:"session_id"`
}

type ChatMessageResponse struct {
	ID        string `json:"id"`
	Message   string `json:"message"`
	IsAI      bool   `json:"is_ai"`
	Intent    string `json:"intent"`
	CreatedAt string `json:"created_at"`
}

func (h *ChatHandler) ProcessMessage(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)

	var req ChatMessageRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
			"message": err.Error(),
		})
	}

	// Validate message
	if req.Message == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Message is required",
		})
	}

	// Generate session ID if not provided
	sessionID := req.SessionID
	if sessionID == "" {
		sessionID = uuid.New().String()
	}

	// Save user message
	userChat := models.Chat{
		ID:        uuid.New().String(),
		UserID:    userID,
		SessionID: sessionID,
		Message:   req.Message,
		IsAI:      false,
		Intent:    "user_message",
	}

	if err := h.db.Create(&userChat).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to save user message",
			"message": err.Error(),
		})
	}

	// Get conversation history
	history, err := h.getConversationHistory(userID, sessionID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to get conversation history",
			"message": err.Error(),
		})
	}

	// Get available menus
	menus, err := h.getAvailableMenus()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to get menus",
			"message": err.Error(),
		})
	}

	// Process message with Gemini
	response, err := h.geminiClient.ProcessMessage(context.Background(), req.Message, history, menus)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to process message",
			"message": err.Error(),
		})
	}

	// Save AI response
	aiChat := models.Chat{
		ID:        uuid.New().String(),
		UserID:    userID,
		SessionID: sessionID,
		Message:   response.Message,
		IsAI:      true,
		Intent:    response.Intent,
		Processed: true,
	}

	// Store context if order intent detected
	if response.OrderIntent != nil {
		contextJSON, _ := json.Marshal(response.OrderIntent)
		aiChat.Context = string(contextJSON)
	}

	if err := h.db.Create(&aiChat).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to save AI response",
			"message": err.Error(),
		})
	}

	// Process order intent if detected
	if response.OrderIntent != nil && response.OrderIntent.Action == "create_order" {
		order, err := h.processOrderIntent(userID, response.OrderIntent)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to process order",
				"message": err.Error(),
			})
		}

		return c.JSON(fiber.Map{
			"success": true,
			"data": fiber.Map{
				"message": response.Message,
				"intent": response.Intent,
				"order_intent": response.OrderIntent,
				"order": order,
				"session_id": sessionID,
			},
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"message": response.Message,
			"intent": response.Intent,
			"order_intent": response.OrderIntent,
			"should_confirm": response.ShouldConfirm,
			"session_id": sessionID,
		},
	})
}

func (h *ChatHandler) GetChatHistory(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	sessionID := c.Query("session_id")

	query := h.db.Where("user_id = ?", userID).Order("created_at ASC")

	if sessionID != "" {
		query = query.Where("session_id = ?", sessionID)
	}

	var chats []models.Chat
	err := query.Find(&chats).Error
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch chat history",
			"message": err.Error(),
		})
	}

	// Convert to response format
	var response []models.ChatResponse
	for _, chat := range chats {
		response = append(response, chat.ToResponse())
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data": response,
		"count": len(response),
	})
}

func (h *ChatHandler) WebSocketHandler(c *websocket.Conn) {
	// WebSocket connection for real-time chat
	defer c.Close()

	userID := c.Locals("user_id").(string)
	sessionID := c.Query("session_id")
	if sessionID == "" {
		sessionID = uuid.New().String()
	}

	for {
		// Read message from client
		var msg ChatMessageRequest
		err := c.ReadJSON(&msg)
		if err != nil {
			break
		}

		// Process message similar to HTTP handler
		userChat := models.Chat{
			ID:        uuid.New().String(),
			UserID:    userID,
			SessionID: sessionID,
			Message:   msg.Message,
			IsAI:      false,
			Intent:    "user_message",
		}

		h.db.Create(&userChat)

		// Get history and menus
		history, _ := h.getConversationHistory(userID, sessionID)
		menus, _ := h.getAvailableMenus()

		// Process with Gemini
		response, err := h.geminiClient.ProcessMessage(context.Background(), msg.Message, history, menus)
		if err != nil {
			// Send error response
			c.WriteJSON(fiber.Map{
				"error": "Failed to process message",
				"message": err.Error(),
			})
			continue
		}

		// Save AI response
		aiChat := models.Chat{
			ID:        uuid.New().String(),
			UserID:    userID,
			SessionID: sessionID,
			Message:   response.Message,
			IsAI:      true,
			Intent:    response.Intent,
			Processed: true,
		}

		if response.OrderIntent != nil {
			contextJSON, _ := json.Marshal(response.OrderIntent)
			aiChat.Context = string(contextJSON)
		}

		h.db.Create(&aiChat)

		// Send response back to client
		c.WriteJSON(fiber.Map{
			"success": true,
			"data": fiber.Map{
				"message": response.Message,
				"intent": response.Intent,
				"order_intent": response.OrderIntent,
				"should_confirm": response.ShouldConfirm,
				"session_id": sessionID,
			},
		})
	}
}

func (h *ChatHandler) getConversationHistory(userID, sessionID string) ([]map[string]interface{}, error) {
	var chats []models.Chat
	err := h.db.Where("user_id = ? AND session_id = ?", userID, sessionID).
		Order("created_at ASC").
		Limit(20). // Limit to last 20 messages for context
		Find(&chats).Error

	if err != nil {
		return nil, err
	}

	var history []map[string]interface{}
	for _, chat := range chats {
		history = append(history, map[string]interface{}{
			"message": chat.Message,
			"is_ai":   chat.IsAI,
			"intent":  chat.Intent,
		})
	}

	return history, nil
}

func (h *ChatHandler) getAvailableMenus() ([]map[string]interface{}, error) {
	var menus []models.Menu
	err := h.db.Where("is_available = ?", true).Find(&menus).Error
	if err != nil {
		return nil, err
	}

	var menuMaps []map[string]interface{}
	for _, menu := range menus {
		menuMaps = append(menuMaps, map[string]interface{}{
			"id":          menu.ID,
			"name":        menu.Name,
			"description": menu.Description,
			"category":    menu.Category,
			"price":       menu.Price,
			"ingredients": menu.Ingredients,
			"prep_time":   menu.PrepTime,
		})
	}

	return menuMaps, nil
}

func (h *ChatHandler) processOrderIntent(userID string, orderIntent *gemini.OrderIntent) (interface{}, error) {
	// This is a simplified version - in production, you'd want more sophisticated order processing
	// based on the AI's understanding

	// For now, return the order intent as-is
	// In a real implementation, you would:
	// 1. Validate the order intent
	// 2. Create actual order in database
	// 3. Handle payment processing
	// 4. Generate receipt

	return fiber.Map{
		"status": "order_intent_received",
		"details": orderIntent,
		"message": "Silakan konfirmasi pesanan Anda untuk melanjutkan ke pembayaran.",
	}, nil
}