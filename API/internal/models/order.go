package models

import (
	"time"

	"gorm.io/gorm"
)

type Order struct {
	ID             string         `json:"id" gorm:"primaryKey;type:char(36)"`
	CafeID         string         `json:"cafe_id" gorm:"not null;index"`
	UserID         string         `json:"user_id" gorm:"not null;index"`
	OrderNumber    string         `json:"order_number" gorm:"uniqueIndex;not null"`
	Status         string         `json:"status" gorm:"default:'pending'"`
	TotalAmount    float64        `json:"total_amount" gorm:"not null"`
	SubtotalAmount float64        `json:"subtotal_amount" gorm:"not null"`
	TaxAmount      float64        `json:"tax_amount" gorm:"default:0"`
	ServiceCharge  float64        `json:"service_charge" gorm:"default:0"`
	DeliveryFee    float64        `json:"delivery_fee" gorm:"default:0"`
	PaymentMethod  string         `json:"payment_method"`
	PaymentStatus  string         `json:"payment_status" gorm:"default:'pending'"`
	PaymentID      string         `json:"payment_id"`
	CustomerName   string         `json:"customer_name"`
	CustomerPhone  string         `json:"customer_phone"`
	OrderType      string         `json:"order_type"` // "dine_in", "take_away", "delivery"
	TableNumber    string         `json:"table_number"`
	DeliveryAddress string        `json:"delivery_address"`
	EstimatedTime  int            `json:"estimated_time"` // in minutes
	ActualTime     int            `json:"actual_time"` // in minutes
	Notes          string         `json:"notes"`
	Rating         int            `json:"rating"`
	Review         string         `json:"review"`
	CompletedAt    *time.Time     `json:"completed_at"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `json:"-" gorm:"index"`

	// Relations
	Cafe       Cafe        `json:"cafe,omitempty" gorm:"foreignKey:CafeID"`
	User       User        `json:"user,omitempty" gorm:"foreignKey:UserID"`
	OrderItems []OrderItem `json:"order_items,omitempty" gorm:"foreignKey:OrderID"`
	Payment    Payment     `json:"payment,omitempty" gorm:"foreignKey:PaymentID"`
}

type OrderItem struct {
	ID         string  `json:"id" gorm:"primaryKey;type:char(36)"`
	OrderID    string  `json:"order_id" gorm:"not null;index"`
	MenuID     string  `json:"menu_id" gorm:"not null;index"`
	Quantity   int     `json:"quantity" gorm:"not null"`
	UnitPrice  float64 `json:"unit_price" gorm:"not null"`
	TotalPrice float64 `json:"total_price" gorm:"not null"`
	Notes      string  `json:"notes"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`

	// Relations
	Menu Menu `json:"menu,omitempty" gorm:"foreignKey:MenuID"`
}

type Payment struct {
	ID            string     `json:"id" gorm:"primaryKey;type:char(36)"`
	OrderID       string     `json:"order_id" gorm:"not null;index"`
	Amount        float64    `json:"amount" gorm:"not null"`
	Method        string     `json:"method" gorm:"not null"` // "crypto", "cash", "transfer"
	Status        string     `json:"status" gorm:"default:'pending'"`
	TransactionID string     `json:"transaction_id"`
	CryptoAddress string     `json:"crypto_address"`
	ConfirmedAt   *time.Time `json:"confirmed_at"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
}

type OrderStatus string

const (
	OrderStatusPending    OrderStatus = "pending"
	OrderStatusConfirmed  OrderStatus = "confirmed"
	OrderStatusPreparing  OrderStatus = "preparing"
	OrderStatusReady      OrderStatus = "ready"
	OrderStatusCompleted  OrderStatus = "completed"
	OrderStatusCancelled  OrderStatus = "cancelled"
)

type PaymentStatus string

const (
	PaymentStatusPending   PaymentStatus = "pending"
	PaymentStatusPaid      PaymentStatus = "paid"
	PaymentStatusFailed    PaymentStatus = "failed"
	PaymentStatusRefunded  PaymentStatus = "refunded"
)

type OrderResponse struct {
	ID               string              `json:"id"`
	CafeID           string              `json:"cafe_id"`
	OrderNumber      string              `json:"order_number"`
	Status           string              `json:"status"`
	TotalAmount      float64             `json:"total_amount"`
	SubtotalAmount   float64             `json:"subtotal_amount"`
	TaxAmount        float64             `json:"tax_amount"`
	ServiceCharge    float64             `json:"service_charge"`
	DeliveryFee      float64             `json:"delivery_fee"`
	PaymentMethod    string              `json:"payment_method"`
	PaymentStatus    string              `json:"payment_status"`
	CustomerName     string              `json:"customer_name"`
	CustomerPhone    string              `json:"customer_phone"`
	OrderType        string              `json:"order_type"`
	TableNumber      string              `json:"table_number"`
	DeliveryAddress  string              `json:"delivery_address"`
	EstimatedTime    int                 `json:"estimated_time"`
	ActualTime       int                 `json:"actual_time"`
	Notes            string              `json:"notes"`
	Rating           int                 `json:"rating"`
	Review           string              `json:"review"`
	CreatedAt        time.Time           `json:"created_at"`
	CompletedAt      *time.Time          `json:"completed_at"`
	OrderItems       []OrderItemResponse `json:"order_items"`
	Cafe             CafeResponse        `json:"cafe,omitempty"`
	User             UserResponse        `json:"user,omitempty"`
}

type OrderItemResponse struct {
	ID         string  `json:"id"`
	MenuID     string  `json:"menu_id"`
	Quantity   int     `json:"quantity"`
	UnitPrice  float64 `json:"unit_price"`
	TotalPrice float64 `json:"total_price"`
	Notes      string  `json:"notes"`
	Menu       MenuResponse `json:"menu,omitempty"`
}

func (o *Order) ToResponse() OrderResponse {
	response := OrderResponse{
		ID:              o.ID,
		CafeID:          o.CafeID,
		OrderNumber:     o.OrderNumber,
		Status:          o.Status,
		TotalAmount:     o.TotalAmount,
		SubtotalAmount:  o.SubtotalAmount,
		TaxAmount:       o.TaxAmount,
		ServiceCharge:   o.ServiceCharge,
		DeliveryFee:     o.DeliveryFee,
		PaymentMethod:   o.PaymentMethod,
		PaymentStatus:   o.PaymentStatus,
		CustomerName:    o.CustomerName,
		CustomerPhone:   o.CustomerPhone,
		OrderType:       o.OrderType,
		TableNumber:     o.TableNumber,
		DeliveryAddress: o.DeliveryAddress,
		EstimatedTime:   o.EstimatedTime,
		ActualTime:      o.ActualTime,
		Notes:           o.Notes,
		Rating:          o.Rating,
		Review:          o.Review,
		CreatedAt:       o.CreatedAt,
		CompletedAt:     o.CompletedAt,
		Cafe:            o.Cafe.ToResponse(),
		User:            o.User.ToResponse(),
	}

	for _, item := range o.OrderItems {
		response.OrderItems = append(response.OrderItems, OrderItemResponse{
			ID:         item.ID,
			MenuID:     item.MenuID,
			Quantity:   item.Quantity,
			UnitPrice:  item.UnitPrice,
			TotalPrice: item.TotalPrice,
			Notes:      item.Notes,
			Menu:       item.Menu.ToResponse(),
		})
	}

	return response
}