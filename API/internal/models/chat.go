package models

import (
	"time"

	"gorm.io/gorm"
)

type Chat struct {
	ID        string         `json:"id" gorm:"primaryKey;type:char(36)"`
	UserID    string         `json:"user_id" gorm:"not null;index"`
	SessionID string         `json:"session_id" gorm:"not null;index"`
	Message   string         `json:"message" gorm:"type:text;not null"`
	IsAI      bool           `json:"is_ai" gorm:"default:false"`
	Context   string         `json:"context" gorm:"type:text"` // JSON string for conversation context
	Intent    string         `json:"intent"`                  // "order", "inquiry", "complaint", etc.
	Processed bool           `json:"processed" gorm:"default:false"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`

	// Relations
	User User `json:"user,omitempty" gorm:"foreignKey:UserID"`
}

type ChatResponse struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id"`
	SessionID string    `json:"session_id"`
	Message   string    `json:"message"`
	IsAI      bool      `json:"is_ai"`
	Intent    string    `json:"intent"`
	CreatedAt time.Time `json:"created_at"`
}

func (c *Chat) ToResponse() ChatResponse {
	return ChatResponse{
		ID:        c.ID,
		UserID:    c.UserID,
		SessionID: c.SessionID,
		Message:   c.Message,
		IsAI:      c.IsAI,
		Intent:    c.Intent,
		CreatedAt: c.CreatedAt,
	}
}

type ConversationContext struct {
	CurrentOrder    *Order              `json:"current_order,omitempty"`
	PreviousOrders  []Order             `json:"previous_orders,omitempty"`
	MenuPreferences []string            `json:"menu_preferences,omitempty"`
	CustomerInfo    map[string]interface{} `json:"customer_info,omitempty"`
	SessionState    string              `json:"session_state"` // "browsing", "ordering", "payment", "support"
	LastIntent      string              `json:"last_intent"`
	Summary         string              `json:"summary"`
}