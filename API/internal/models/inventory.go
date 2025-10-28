package models

import (
	"time"

	"gorm.io/gorm"
)

type Inventory struct {
	ID             string         `json:"id" gorm:"primaryKey;type:char(36)"`
	CafeID         string         `json:"cafe_id" gorm:"not null;index"`
	Name           string         `json:"name" gorm:"not null"`
	Description    string         `json:"description"`
	Category       string         `json:"category"` // raw_material, packaging, cleaning, merchandise
	Unit           string         `json:"unit"` // kg, liter, pcs, box, bottle
	CurrentStock   float64        `json:"current_stock" gorm:"default:0"`
	MinStockLevel  float64        `json:"min_stock_level" gorm:"default:0"`
	MaxStockLevel  float64        `json:"max_stock_level"`
	UnitCost       float64        `json:"unit_cost"`
	Supplier       string         `json:"supplier"`
	SupplierContact string        `json:"supplier_contact"`
	LastRestocked  *time.Time     `json:"last_restocked"`
	ExpiryDate     *time.Time     `json:"expiry_date"`
	Location       string         `json:"location"` // warehouse, kitchen, bar, display
	IsActive       bool           `json:"is_active" gorm:"default:true"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `json:"-" gorm:"index"`

	// Relations
	Cafe           Cafe           `json:"cafe,omitempty" gorm:"foreignKey:CafeID"`
	StockMovements []StockMovement `json:"stock_movements,omitempty" gorm:"foreignKey:InventoryID"`
}

type StockMovement struct {
	ID           string         `json:"id" gorm:"primaryKey;type:char(36)"`
	InventoryID  string         `json:"inventory_id" gorm:"not null;index"`
	CafeID       string         `json:"cafe_id" gorm:"not null;index"`
	Type         string         `json:"type" gorm:"not null"` // in, out, adjustment, waste
	Quantity     float64        `json:"quantity" gorm:"not null"`
	UnitCost     float64        `json:"unit_cost"`
	TotalCost    float64        `json:"total_cost"`
	Reason       string         `json:"reason"` // purchase, sale, waste, damage, transfer, adjustment
	ReferenceID  string         `json:"reference_id"` // Order ID, Purchase ID, etc.
	Notes        string         `json:"notes"`
	PerformedBy  string         `json:"performed_by"` // User ID who performed the movement
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `json:"-" gorm:"index"`

	// Relations
	Inventory Inventory `json:"inventory,omitempty" gorm:"foreignKey:InventoryID"`
	Cafe      Cafe      `json:"cafe,omitempty" gorm:"foreignKey:CafeID"`
	User      User      `json:"user,omitempty" gorm:"foreignKey:PerformedBy"`
}

type InventoryResponse struct {
	ID             string     `json:"id"`
	CafeID         string     `json:"cafe_id"`
	Name           string     `json:"name"`
	Description    string     `json:"description"`
	Category       string     `json:"category"`
	Unit           string     `json:"unit"`
	CurrentStock   float64    `json:"current_stock"`
	MinStockLevel  float64    `json:"min_stock_level"`
	MaxStockLevel  float64    `json:"max_stock_level"`
	UnitCost       float64    `json:"unit_cost"`
	Supplier       string     `json:"supplier"`
	SupplierContact string    `json:"supplier_contact"`
	LastRestocked  *time.Time `json:"last_restocked"`
	ExpiryDate     *time.Time `json:"expiry_date"`
	Location       string     `json:"location"`
	IsActive       bool       `json:"is_active"`
	StockStatus    string     `json:"stock_status"` // low, optimal, overstock
	CreatedAt      time.Time  `json:"created_at"`
}

type StockMovementResponse struct {
	ID           string    `json:"id"`
	InventoryID  string    `json:"inventory_id"`
	Type         string    `json:"type"`
	Quantity     float64   `json:"quantity"`
	UnitCost     float64   `json:"unit_cost"`
	TotalCost    float64   `json:"total_cost"`
	Reason       string    `json:"reason"`
	ReferenceID  string    `json:"reference_id"`
	Notes        string    `json:"notes"`
	PerformedBy  string    `json:"performed_by"`
	CreatedAt    time.Time `json:"created_at"`
	InventoryName string   `json:"inventory_name,omitempty"`
	UserName     string    `json:"user_name,omitempty"`
}

func (i *Inventory) ToResponse() InventoryResponse {
	stockStatus := "optimal"
	if i.CurrentStock <= i.MinStockLevel {
		stockStatus = "low"
	} else if i.MaxStockLevel > 0 && i.CurrentStock >= i.MaxStockLevel {
		stockStatus = "overstock"
	}

	return InventoryResponse{
		ID:              i.ID,
		CafeID:          i.CafeID,
		Name:            i.Name,
		Description:     i.Description,
		Category:        i.Category,
		Unit:            i.Unit,
		CurrentStock:    i.CurrentStock,
		MinStockLevel:   i.MinStockLevel,
		MaxStockLevel:   i.MaxStockLevel,
		UnitCost:        i.UnitCost,
		Supplier:        i.Supplier,
		SupplierContact: i.SupplierContact,
		LastRestocked:   i.LastRestocked,
		ExpiryDate:      i.ExpiryDate,
		Location:        i.Location,
		IsActive:        i.IsActive,
		StockStatus:     stockStatus,
		CreatedAt:       i.CreatedAt,
	}
}

func (sm *StockMovement) ToResponse() StockMovementResponse {
	return StockMovementResponse{
		ID:            sm.ID,
		InventoryID:   sm.InventoryID,
		Type:          sm.Type,
		Quantity:      sm.Quantity,
		UnitCost:      sm.UnitCost,
		TotalCost:     sm.TotalCost,
		Reason:        sm.Reason,
		ReferenceID:   sm.ReferenceID,
		Notes:         sm.Notes,
		PerformedBy:   sm.PerformedBy,
		CreatedAt:     sm.CreatedAt,
		InventoryName: sm.Inventory.Name,
		UserName:      sm.User.Name,
	}
}