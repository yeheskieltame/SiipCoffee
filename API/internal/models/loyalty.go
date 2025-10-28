package models

import (
	"time"

	"gorm.io/gorm"
)

type LoyaltyProgram struct {
	ID                   string         `json:"id" gorm:"primaryKey;type:char(36)"`
	CafeID               string         `json:"cafe_id" gorm:"not null;index"`
	Name                 string         `json:"name" gorm:"not null"`
	Description          string         `json:"description"`
	PointsPerCurrency    float64        `json:"points_per_currency" gorm:"default:1"` // Points per 1 currency unit
	CurrencyPerPoint     float64        `json:"currency_per_point" gorm:"default:0.01"` // Currency value per point
	MinOrderForPoints    float64        `json:"min_order_for_points" gorm:"default:0"`
	PointsExpiryMonths   int            `json:"points_expiry_months" gorm:"default:12"`
	IsActive             bool           `json:"is_active" gorm:"default:true"`
	TierRules            string         `json:"tier_rules"` // JSON string for tier configurations
	CreatedAt            time.Time      `json:"created_at"`
	UpdatedAt            time.Time      `json:"updated_at"`
	DeletedAt            gorm.DeletedAt `json:"-" gorm:"index"`

	// Relations
	Cafe          Cafe           `json:"cafe,omitempty" gorm:"foreignKey:CafeID"`
	Members       []LoyaltyMember `json:"members,omitempty" gorm:"foreignKey:ProgramID"`
	Rewards       []LoyaltyReward `json:"rewards,omitempty" gorm:"foreignKey:ProgramID"`
	Transactions  []LoyaltyTransaction `json:"transactions,omitempty" gorm:"foreignKey:ProgramID"`
}

type LoyaltyMember struct {
	ID            string         `json:"id" gorm:"primaryKey;type:char(36)"`
	ProgramID     string         `json:"program_id" gorm:"not null;index"`
	UserID        string         `json:"user_id" gorm:"not null;index"`
	CafeID        string         `json:"cafe_id" gorm:"not null;index"`
	CurrentPoints int            `json:"current_points" gorm:"default:0"`
	TotalEarned   int            `json:"total_earned" gorm:"default:0"`
	TotalRedeemed int            `json:"total_redeemed" gorm:"default:0"`
	MemberTier    string         `json:"member_tier" gorm:"default:'bronze'"`
	JoinedAt      time.Time      `json:"joined_at"`
	LastActivityAt *time.Time    `json:"last_activity_at"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `json:"-" gorm:"index"`

	// Relations
	Program      LoyaltyProgram      `json:"program,omitempty" gorm:"foreignKey:ProgramID"`
	User         User                `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Cafe         Cafe                `json:"cafe,omitempty" gorm:"foreignKey:CafeID"`
	Transactions []LoyaltyTransaction `json:"transactions,omitempty" gorm:"foreignKey:MemberID"`
	Rewards      []MemberReward      `json:"rewards,omitempty" gorm:"foreignKey:MemberID"`
}

type LoyaltyReward struct {
	ID            string         `json:"id" gorm:"primaryKey;type:char(36)"`
	ProgramID     string         `json:"program_id" gorm:"not null;index"`
	CafeID        string         `json:"cafe_id" gorm:"not null;index"`
	Name          string         `json:"name" gorm:"not null"`
	Description   string         `json:"description"`
	Type          string         `json:"type" gorm:"not null"` // discount, free_item, voucher, upgrade
	PointsCost    int            `json:"points_cost" gorm:"not null"`
	DiscountValue float64        `json:"discount_value"` // For discount type
	DiscountType  string         `json:"discount_type"`  // percentage, fixed
	FreeItemID    string         `json:"free_item_id"`   // Menu ID for free item
	MinOrderValue float64        `json:"min_order_value"`
	MaxUses       int            `json:"max_uses"` // -1 for unlimited
	CurrentUses   int            `json:"current_uses" gorm:"default:0"`
	IsActive      bool           `json:"is_active" gorm:"default:true"`
	ValidFrom     *time.Time     `json:"valid_from"`
	ValidUntil    *time.Time     `json:"valid_until"`
	Conditions    string         `json:"conditions"` // JSON string for additional conditions
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `json:"-" gorm:"index"`

	// Relations
	Program LoyaltyProgram `json:"program,omitempty" gorm:"foreignKey:ProgramID"`
	Cafe    Cafe           `json:"cafe,omitempty" gorm:"foreignKey:CafeID"`
	FreeItem *Menu         `json:"free_item,omitempty" gorm:"foreignKey:FreeItemID"`
	MemberRewards []MemberReward `json:"member_rewards,omitempty" gorm:"foreignKey:RewardID"`
}

type MemberReward struct {
	ID          string         `json:"id" gorm:"primaryKey;type:char(36)"`
	MemberID    string         `json:"member_id" gorm:"not null;index"`
	RewardID    string         `json:"reward_id" gorm:"not null;index"`
	ProgramID   string         `json:"program_id" gorm:"not null;index"`
	CafeID      string         `json:"cafe_id" gorm:"not null;index"`
	OrderID     string         `json:"order_id"`
	Status      string         `json:"status" gorm:"default:'available'"` // available, used, expired
	UsedAt      *time.Time     `json:"used_at"`
	ExpiresAt   *time.Time     `json:"expires_at"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`

	// Relations
	Member  LoyaltyMember  `json:"member,omitempty" gorm:"foreignKey:MemberID"`
	Reward  LoyaltyReward  `json:"reward,omitempty" gorm:"foreignKey:RewardID"`
	Program LoyaltyProgram `json:"program,omitempty" gorm:"foreignKey:ProgramID"`
	Cafe    Cafe           `json:"cafe,omitempty" gorm:"foreignKey:CafeID"`
	Order   *Order         `json:"order,omitempty" gorm:"foreignKey:OrderID"`
}

type LoyaltyTransaction struct {
	ID           string         `json:"id" gorm:"primaryKey;type:char(36)"`
	ProgramID    string         `json:"program_id" gorm:"not null;index"`
	MemberID     string         `json:"member_id" gorm:"not null;index"`
	CafeID       string         `json:"cafe_id" gorm:"not null;index"`
	OrderID      string         `json:"order_id"`
	Type         string         `json:"type" gorm:"not null"` // earned, redeemed, expired, adjusted
	Points       int            `json:"points" gorm:"not null"`
	BalanceAfter int            `json:"balance_after"`
	Description  string         `json:"description"`
	ReferenceID  string         `json:"reference_id"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `json:"-" gorm:"index"`

	// Relations
	Program LoyaltyProgram `json:"program,omitempty" gorm:"foreignKey:ProgramID"`
	Member  LoyaltyMember  `json:"member,omitempty" gorm:"foreignKey:MemberID"`
	Cafe    Cafe           `json:"cafe,omitempty" gorm:"foreignKey:CafeID"`
	Order   *Order         `json:"order,omitempty" gorm:"foreignKey:OrderID"`
}

// Response types
type LoyaltyMemberResponse struct {
	ID            string     `json:"id"`
	ProgramID     string     `json:"program_id"`
	UserID        string     `json:"user_id"`
	CafeID        string     `json:"cafe_id"`
	CurrentPoints int        `json:"current_points"`
	TotalEarned   int        `json:"total_earned"`
	TotalRedeemed int        `json:"total_redeemed"`
	MemberTier    string     `json:"member_tier"`
	JoinedAt      time.Time  `json:"joined_at"`
	LastActivityAt *time.Time `json:"last_activity_at"`
	ProgramName   string     `json:"program_name,omitempty"`
	CafeName      string     `json:"cafe_name,omitempty"`
	UserName      string     `json:"user_name,omitempty"`
	NextTier      string     `json:"next_tier,omitempty"`
	PointsToNextTier int     `json:"points_to_next_tier,omitempty"`
}

type LoyaltyRewardResponse struct {
	ID            string     `json:"id"`
	ProgramID     string     `json:"program_id"`
	Name          string     `json:"name"`
	Description   string     `json:"description"`
	Type          string     `json:"type"`
	PointsCost    int        `json:"points_cost"`
	DiscountValue float64    `json:"discount_value"`
	DiscountType  string     `json:"discount_type"`
	FreeItemID    string     `json:"free_item_id"`
	MinOrderValue float64    `json:"min_order_value"`
	MaxUses       int        `json:"max_uses"`
	CurrentUses   int        `json:"current_uses"`
	IsActive      bool       `json:"is_active"`
	ValidFrom     *time.Time `json:"valid_from"`
	ValidUntil    *time.Time `json:"valid_until"`
	FreeItem      *MenuResponse `json:"free_item,omitempty"`
	IsAvailable   bool       `json:"is_available"`
}

func (lm *LoyaltyMember) ToResponse() LoyaltyMemberResponse {
	return LoyaltyMemberResponse{
		ID:            lm.ID,
		ProgramID:     lm.ProgramID,
		UserID:        lm.UserID,
		CafeID:        lm.CafeID,
		CurrentPoints: lm.CurrentPoints,
		TotalEarned:   lm.TotalEarned,
		TotalRedeemed: lm.TotalRedeemed,
		MemberTier:    lm.MemberTier,
		JoinedAt:      lm.JoinedAt,
		LastActivityAt: lm.LastActivityAt,
		ProgramName:   lm.Program.Name,
		CafeName:      lm.Cafe.Name,
		UserName:      lm.User.Name,
	}
}

func (lr *LoyaltyReward) ToResponse() LoyaltyRewardResponse {
	isAvailable := lr.IsActive &&
		(lr.MaxUses == -1 || lr.CurrentUses < lr.MaxUses) &&
		(lr.ValidFrom == nil || lr.ValidFrom.Before(time.Now())) &&
		(lr.ValidUntil == nil || lr.ValidUntil.After(time.Now()))

	return LoyaltyRewardResponse{
		ID:            lr.ID,
		ProgramID:     lr.ProgramID,
		Name:          lr.Name,
		Description:   lr.Description,
		Type:          lr.Type,
		PointsCost:    lr.PointsCost,
		DiscountValue: lr.DiscountValue,
		DiscountType:  lr.DiscountType,
		FreeItemID:    lr.FreeItemID,
		MinOrderValue: lr.MinOrderValue,
		MaxUses:       lr.MaxUses,
		CurrentUses:   lr.CurrentUses,
		IsActive:      lr.IsActive,
		ValidFrom:     lr.ValidFrom,
		ValidUntil:    lr.ValidUntil,
		FreeItem:      func() *MenuResponse { if lr.FreeItem != nil { r := lr.FreeItem.ToResponse(); return &r }; return nil }(),
		IsAvailable:   isAvailable,
	}
}