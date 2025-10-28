package models

import (
	"time"

	"gorm.io/gorm"
)

type Cafe struct {
	ID                   string         `json:"id" gorm:"primaryKey;type:char(36)"`
	OwnerID              string         `json:"owner_id" gorm:"not null;index"`
	Name                 string         `json:"name" gorm:"not null"`
	Description          string         `json:"description"`
	LogoURL              string         `json:"logo_url"`
	CoverImageURL        string         `json:"cover_image_url"`
	Address              string         `json:"address"`
	City                 string         `json:"city"`
	Province             string         `json:"province"`
	PostalCode           string         `json:"postal_code"`
	Phone                string         `json:"phone"`
	Email                string         `json:"email"`
	Website              string         `json:"website"`
	CoordinateLat        float64        `json:"coordinate_lat"`
	CoordinateLng        float64        `json:"coordinate_lng"`
	BusinessHours        string         `json:"business_hours"` // JSON string
	IsOpen               bool           `json:"is_open" gorm:"default:true"`
	IsVerified           bool           `json:"is_verified" gorm:"default:false"`
	RatingAverage        float64        `json:"rating_average" gorm:"default:0"`
	RatingCount          int            `json:"rating_count" gorm:"default:0"`
	TaxPercentage        float64        `json:"tax_percentage" gorm:"default:10"`
	ServiceChargePercentage float64     `json:"service_charge_percentage" gorm:"default:0"`
	DeliveryFee          float64        `json:"delivery_fee" gorm:"default:0"`
	MinOrderAmount       float64        `json:"min_order_amount" gorm:"default:0"`
	MaxDeliveryDistance  float64        `json:"max_delivery_distance" gorm:"default:5"` // in km
	Features             string         `json:"features"` // JSON string: ["wifi", "outdoor_seating", "delivery", "take_away"]
	SocialMedia          string         `json:"social_media"` // JSON string
	Settings             string         `json:"settings"` // JSON string for custom settings
	Status               string         `json:"status" gorm:"default:'active'"` // active, inactive, suspended
	CreatedAt            time.Time      `json:"created_at"`
	UpdatedAt            time.Time      `json:"updated_at"`
	DeletedAt            gorm.DeletedAt `json:"-" gorm:"index"`

	// Relations
	Owner User `json:"owner,omitempty" gorm:"foreignKey:OwnerID"`
	MenuItems []Menu `json:"menu_items,omitempty" gorm:"foreignKey:CafeID"`
	Orders []Order `json:"orders,omitempty" gorm:"foreignKey:CafeID"`
	Reviews []CafeReview `json:"reviews,omitempty" gorm:"foreignKey:CafeID"`
	Inventory []Inventory `json:"inventory,omitempty" gorm:"foreignKey:CafeID"`
	Staff []CafeStaff `json:"staff,omitempty" gorm:"foreignKey:CafeID"`
}

type CafeReview struct {
	ID         string         `json:"id" gorm:"primaryKey;type:char(36)"`
	CafeID     string         `json:"cafe_id" gorm:"not null;index"`
	UserID     string         `json:"user_id" gorm:"not null;index"`
	Rating     int            `json:"rating" gorm:"not null;check:rating >= 1 AND rating <= 5"`
	Comment    string         `json:"comment"`
	Images     string         `json:"images"` // JSON array of image URLs
	IsVerified bool           `json:"is_verified" gorm:"default:false"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `json:"-" gorm:"index"`

	// Relations
	Cafe Cafe `json:"cafe,omitempty" gorm:"foreignKey:CafeID"`
	User User `json:"user,omitempty" gorm:"foreignKey:UserID"`
}

type CafeStaff struct {
	ID        string         `json:"id" gorm:"primaryKey;type:char(36)"`
	CafeID    string         `json:"cafe_id" gorm:"not null;index"`
	UserID    string         `json:"user_id" gorm:"not null;index"`
	Role      string         `json:"role" gorm:"not null"` // manager, barista, cashier, waiter
	IsActive  bool           `json:"is_active" gorm:"default:true"`
	JoinedAt  time.Time      `json:"joined_at"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`

	// Relations
	Cafe Cafe `json:"cafe,omitempty" gorm:"foreignKey:CafeID"`
	User User `json:"user,omitempty" gorm:"foreignKey:UserID"`
}

type CafeResponse struct {
	ID                   string    `json:"id"`
	OwnerID              string    `json:"owner_id"`
	Name                 string    `json:"name"`
	Description          string    `json:"description"`
	LogoURL              string    `json:"logo_url"`
	CoverImageURL        string    `json:"cover_image_url"`
	Address              string    `json:"address"`
	City                 string    `json:"city"`
	Province             string    `json:"province"`
	PostalCode           string    `json:"postal_code"`
	Phone                string    `json:"phone"`
	Email                string    `json:"email"`
	Website              string    `json:"website"`
	CoordinateLat        float64   `json:"coordinate_lat"`
	CoordinateLng        float64   `json:"coordinate_lng"`
	BusinessHours        string    `json:"business_hours"`
	IsOpen               bool      `json:"is_open"`
	IsVerified           bool      `json:"is_verified"`
	RatingAverage        float64   `json:"rating_average"`
	RatingCount          int       `json:"rating_count"`
	TaxPercentage        float64   `json:"tax_percentage"`
	ServiceChargePercentage float64 `json:"service_charge_percentage"`
	DeliveryFee          float64   `json:"delivery_fee"`
	MinOrderAmount       float64   `json:"min_order_amount"`
	MaxDeliveryDistance  float64   `json:"max_delivery_distance"`
	Features             string    `json:"features"`
	SocialMedia          string    `json:"social_media"`
	Status               string    `json:"status"`
	CreatedAt            time.Time `json:"created_at"`
}

type CafeReviewResponse struct {
	ID         string    `json:"id"`
	CafeID     string    `json:"cafe_id"`
	UserID     string    `json:"user_id"`
	Rating     int       `json:"rating"`
	Comment    string    `json:"comment"`
	Images     string    `json:"images"`
	IsVerified bool      `json:"is_verified"`
	CreatedAt  time.Time `json:"created_at"`
	User       UserResponse `json:"user,omitempty"`
}

func (c *Cafe) ToResponse() CafeResponse {
	return CafeResponse{
		ID:                      c.ID,
		OwnerID:                 c.OwnerID,
		Name:                    c.Name,
		Description:             c.Description,
		LogoURL:                 c.LogoURL,
		CoverImageURL:           c.CoverImageURL,
		Address:                 c.Address,
		City:                    c.City,
		Province:                c.Province,
		PostalCode:              c.PostalCode,
		Phone:                   c.Phone,
		Email:                   c.Email,
		Website:                 c.Website,
		CoordinateLat:           c.CoordinateLat,
		CoordinateLng:           c.CoordinateLng,
		BusinessHours:           c.BusinessHours,
		IsOpen:                  c.IsOpen,
		IsVerified:              c.IsVerified,
		RatingAverage:           c.RatingAverage,
		RatingCount:             c.RatingCount,
		TaxPercentage:           c.TaxPercentage,
		ServiceChargePercentage: c.ServiceChargePercentage,
		DeliveryFee:             c.DeliveryFee,
		MinOrderAmount:          c.MinOrderAmount,
		MaxDeliveryDistance:     c.MaxDeliveryDistance,
		Features:                c.Features,
		SocialMedia:             c.SocialMedia,
		Status:                  c.Status,
		CreatedAt:               c.CreatedAt,
	}
}

func (cr *CafeReview) ToResponse() CafeReviewResponse {
	return CafeReviewResponse{
		ID:         cr.ID,
		CafeID:     cr.CafeID,
		UserID:     cr.UserID,
		Rating:     cr.Rating,
		Comment:    cr.Comment,
		Images:     cr.Images,
		IsVerified: cr.IsVerified,
		CreatedAt:  cr.CreatedAt,
		User:       cr.User.ToResponse(),
	}
}