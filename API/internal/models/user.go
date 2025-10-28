package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID        string         `json:"id" gorm:"primaryKey;type:char(36)"`
	Name      string         `json:"name" gorm:"not null"`
	Email     string         `json:"email" gorm:"uniqueIndex;not null"`
	Password  string         `json:"-" gorm:"not null"`
	Role      string         `json:"role" gorm:"default:'customer'"`
	Phone     string         `json:"phone"`
	Address   string         `json:"address"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`

	// Relations
	Orders []Order `json:"orders,omitempty" gorm:"foreignKey:UserID"`
	Chats  []Chat  `json:"chats,omitempty" gorm:"foreignKey:UserID"`
}

type UserResponse struct {
	ID      string `json:"id"`
	Name    string `json:"name"`
	Email   string `json:"email"`
	Role    string `json:"role"`
	Phone   string `json:"phone"`
	Address string `json:"address"`
}

func (u *User) ToResponse() UserResponse {
	return UserResponse{
		ID:      u.ID,
		Name:    u.Name,
		Email:   u.Email,
		Role:    u.Role,
		Phone:   u.Phone,
		Address: u.Address,
	}
}