package models

import (
	"time"

	"gorm.io/gorm"
)

type Menu struct {
	ID          string         `json:"id" gorm:"primaryKey;type:char(36)"`
	CafeID      string         `json:"cafe_id" gorm:"not null;index"`
	Name        string         `json:"name" gorm:"not null"`
	Description string         `json:"description"`
	Category    string         `json:"category" gorm:"not null"`
	Price       float64        `json:"price" gorm:"not null"`
	ImageURL    string         `json:"image_url"`
	IsAvailable bool           `json:"is_available" gorm:"default:true"`
	Ingredients string         `json:"ingredients"`
	PrepTime    int            `json:"prep_time"` // in minutes
	IsPopular   bool           `json:"is_popular" gorm:"default:false"`
	IsRecommended bool         `json:"is_recommended" gorm:"default:false"`
	Calories    int            `json:"calories"`
	Allergens   string         `json:"allergens"` // JSON array of allergens
	Customizable bool          `json:"customizable" gorm:"default:false"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`

	// Relations
	Cafe        Cafe        `json:"cafe,omitempty" gorm:"foreignKey:CafeID"`
	OrderItems  []OrderItem `json:"order_items,omitempty" gorm:"foreignKey:MenuID"`
	InventoryItems []Inventory `json:"inventory_items,omitempty" gorm:"many2many:menu_inventory;"`
}

type MenuResponse struct {
	ID            string  `json:"id"`
	CafeID        string  `json:"cafe_id"`
	Name          string  `json:"name"`
	Description   string  `json:"description"`
	Category      string  `json:"category"`
	Price         float64 `json:"price"`
	ImageURL      string  `json:"image_url"`
	IsAvailable   bool    `json:"is_available"`
	Ingredients   string  `json:"ingredients"`
	PrepTime      int     `json:"prep_time"`
	IsPopular     bool    `json:"is_popular"`
	IsRecommended bool    `json:"is_recommended"`
	Calories      int     `json:"calories"`
	Allergens     string  `json:"allergens"`
	Customizable  bool    `json:"customizable"`
}

func (m *Menu) ToResponse() MenuResponse {
	return MenuResponse{
		ID:            m.ID,
		CafeID:        m.CafeID,
		Name:          m.Name,
		Description:   m.Description,
		Category:      m.Category,
		Price:         m.Price,
		ImageURL:      m.ImageURL,
		IsAvailable:   m.IsAvailable,
		Ingredients:   m.Ingredients,
		PrepTime:      m.PrepTime,
		IsPopular:     m.IsPopular,
		IsRecommended: m.IsRecommended,
		Calories:      m.Calories,
		Allergens:     m.Allergens,
		Customizable:  m.Customizable,
	}
}

type Category struct {
	Name        string    `json:"name"`
	DisplayName string    `json:"display_name"`
	Description string    `json:"description"`
}

func GetDefaultCategories() []Category {
	return []Category{
		{Name: "coffee", DisplayName: "Kopi", Description: "Berbagai jenis kopi pilihan"},
		{Name: "tea", DisplayName: "Teh", Description: "Teh tradisional dan modern"},
		{Name: "food", DisplayName: "Makanan", Description: "Makanan pendamping"},
		{Name: "dessert", DisplayName: "Dessert", Description: "Aneka dessert manis"},
		{Name: "juice", DisplayName: "Jus", Description: "Jus segar buah-buahan"},
	}
}