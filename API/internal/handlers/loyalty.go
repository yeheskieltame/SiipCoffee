package handlers

import (
	"strconv"
	"time"

	"siipcoffe-api/internal/models"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type LoyaltyHandler struct {
	db *gorm.DB
}

func NewLoyaltyHandler(db *gorm.DB) *LoyaltyHandler {
	return &LoyaltyHandler{db: db}
}

// CreateLoyaltyProgram creates a new loyalty program (owner only)
func (h *LoyaltyHandler) CreateLoyaltyProgram(c *fiber.Ctx) error {
	user := c.Locals("user").(*models.User)
	if user.Role != "owner" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"error":   "Only owners can create loyalty programs",
		})
	}

	// Get user's cafe
	var cafe models.Cafe
	err := h.db.Where("owner_id = ?", user.ID).First(&cafe).Error
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Cafe not found",
		})
	}

	// Check if program already exists
	var existingProgram models.LoyaltyProgram
	err = h.db.Where("cafe_id = ?", cafe.ID).First(&existingProgram).Error
	if err == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Loyalty program already exists for this cafe",
		})
	}

	var req struct {
		Name                string  `json:"name" validate:"required"`
		Description         string  `json:"description"`
		PointsPerCurrency   float64 `json:"points_per_currency" validate:"min=0.1"`
		CurrencyPerPoint    float64 `json:"currency_per_point" validate:"min=0.01"`
		MinOrderForPoints   float64 `json:"min_order_for_points" validate:"min=0"`
		PointsExpiryMonths  int     `json:"points_expiry_months" validate:"min=1,max=60"`
		TierRules           string  `json:"tier_rules"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid request body",
		})
	}

	program := models.LoyaltyProgram{
		ID:                uuid.New().String(),
		CafeID:            cafe.ID,
		Name:              req.Name,
		Description:       req.Description,
		PointsPerCurrency: req.PointsPerCurrency,
		CurrencyPerPoint:  req.CurrencyPerPoint,
		MinOrderForPoints: req.MinOrderForPoints,
		PointsExpiryMonths: req.PointsExpiryMonths,
		TierRules:         req.TierRules,
		IsActive:          true,
	}

	if err := h.db.Create(&program).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to create loyalty program",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"data":    program,
	})
}

// GetLoyaltyProgram gets loyalty program for a cafe
func (h *LoyaltyHandler) GetLoyaltyProgram(c *fiber.Ctx) error {
	cafeID := c.Params("id")

	var program models.LoyaltyProgram
	err := h.db.Preload("Cafe").Where("cafe_id = ? AND is_active = ?", cafeID, true).First(&program).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"success": false,
				"error":   "Loyalty program not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to get loyalty program",
		})
	}

	// Get current user's membership if they're a customer
	user := c.Locals("user").(*models.User)
	var membership *models.LoyaltyMember
	if user.Role == "customer" {
		var member models.LoyaltyMember
		err := h.db.Where("program_id = ? AND user_id = ?", program.ID, user.ID).First(&member).Error
		if err == nil {
			membership = &member
		}
	}

	response := map[string]interface{}{
		"program":    program,
		"membership": membership,
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    response,
	})
}

// JoinLoyaltyProgram allows a customer to join a loyalty program
func (h *LoyaltyHandler) JoinLoyaltyProgram(c *fiber.Ctx) error {
	user := c.Locals("user").(*models.User)
	if user.Role != "customer" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"error":   "Only customers can join loyalty programs",
		})
	}

	cafeID := c.Params("id")

	// Check if program exists
	var program models.LoyaltyProgram
	err := h.db.Where("cafe_id = ? AND is_active = ?", cafeID, true).First(&program).Error
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Loyalty program not found",
		})
	}

	// Check if already a member
	var existingMember models.LoyaltyMember
	err = h.db.Where("program_id = ? AND user_id = ?", program.ID, user.ID).First(&existingMember).Error
	if err == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Already a member of this loyalty program",
		})
	}

	member := models.LoyaltyMember{
		ID:            uuid.New().String(),
		ProgramID:     program.ID,
		UserID:        user.ID,
		CafeID:        cafeID,
		CurrentPoints: 0,
		TotalEarned:   0,
		TotalRedeemed: 0,
		MemberTier:    "bronze",
		JoinedAt:      time.Now(),
	}

	if err := h.db.Create(&member).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to join loyalty program",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"data":    member.ToResponse(),
	})
}

// CreateLoyaltyReward creates a new reward (owner only)
func (h *LoyaltyHandler) CreateLoyaltyReward(c *fiber.Ctx) error {
	user := c.Locals("user").(*models.User)
	if user.Role != "owner" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"error":   "Only owners can create rewards",
		})
	}

	// Get user's cafe
	var cafe models.Cafe
	err := h.db.Where("owner_id = ?", user.ID).First(&cafe).Error
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Cafe not found",
		})
	}

	// Get loyalty program
	var program models.LoyaltyProgram
	err = h.db.Where("cafe_id = ? AND is_active = ?", cafe.ID, true).First(&program).Error
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Loyalty program not found",
		})
	}

	var req struct {
		Name          string  `json:"name" validate:"required"`
		Description   string  `json:"description"`
		Type          string  `json:"type" validate:"required"` // discount, free_item, voucher, upgrade
		PointsCost    int     `json:"points_cost" validate:"min=1"`
		DiscountValue float64 `json:"discount_value"`
		DiscountType  string  `json:"discount_type"` // percentage, fixed
		FreeItemID    string  `json:"free_item_id"`
		MinOrderValue float64 `json:"min_order_value"`
		MaxUses       int     `json:"maxUses"`
		ValidFrom     string  `json:"valid_from"`
		ValidUntil    string  `json:"valid_until"`
		Conditions    string  `json:"conditions"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid request body",
		})
	}

	reward := models.LoyaltyReward{
		ID:            uuid.New().String(),
		ProgramID:     program.ID,
		CafeID:        cafe.ID,
		Name:          req.Name,
		Description:   req.Description,
		Type:          req.Type,
		PointsCost:    req.PointsCost,
		DiscountValue: req.DiscountValue,
		DiscountType:  req.DiscountType,
		FreeItemID:    req.FreeItemID,
		MinOrderValue: req.MinOrderValue,
		MaxUses:       req.MaxUses,
		CurrentUses:   0,
		IsActive:      true,
		Conditions:    req.Conditions,
	}

	// Parse dates if provided
	if req.ValidFrom != "" {
		validFrom, err := time.Parse("2006-01-02", req.ValidFrom)
		if err == nil {
			reward.ValidFrom = &validFrom
		}
	}

	if req.ValidUntil != "" {
		validUntil, err := time.Parse("2006-01-02", req.ValidUntil)
		if err == nil {
			reward.ValidUntil = &validUntil
		}
	}

	if err := h.db.Create(&reward).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to create reward",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"data":    reward.ToResponse(),
	})
}

// GetLoyaltyRewards gets available rewards for a loyalty program
func (h *LoyaltyHandler) GetLoyaltyRewards(c *fiber.Ctx) error {
	cafeID := c.Params("id")
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "20"))

	offset := (page - 1) * limit

	// Get program
	var program models.LoyaltyProgram
	err := h.db.Where("cafe_id = ? AND is_active = ?", cafeID, true).First(&program).Error
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Loyalty program not found",
		})
	}

	query := h.db.Model(&models.LoyaltyReward{}).
		Where("program_id = ? AND is_active = ?", program.ID, true)

	var total int64
	query.Count(&total)

	var rewards []models.LoyaltyReward
	err = query.Preload("FreeItem").
		Offset(offset).
		Limit(limit).
		Order("points_cost ASC").
		Find(&rewards).Error

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to get rewards",
		})
	}

	var responses []models.LoyaltyRewardResponse
	for _, reward := range rewards {
		responses = append(responses, reward.ToResponse())
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"rewards": responses,
			"pagination": fiber.Map{
				"page":  page,
				"limit": limit,
				"total": total,
				"pages": (total + int64(limit) - 1) / int64(limit),
			},
		},
	})
}

// RedeemReward allows a member to redeem a reward
func (h *LoyaltyHandler) RedeemReward(c *fiber.Ctx) error {
	user := c.Locals("user").(*models.User)
	if user.Role != "customer" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"error":   "Only customers can redeem rewards",
		})
	}

	rewardID := c.Params("rewardId")

	// Get reward
	var reward models.LoyaltyReward
	err := h.db.Preload("Program").Where("id = ? AND is_active = ?", rewardID, true).First(&reward).Error
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Reward not found",
		})
	}

	// Check if reward is available
	now := time.Now()
	if reward.ValidFrom != nil && now.Before(*reward.ValidFrom) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Reward is not yet available",
		})
	}

	if reward.ValidUntil != nil && now.After(*reward.ValidUntil) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Reward has expired",
		})
	}

	if reward.MaxUses > 0 && reward.CurrentUses >= reward.MaxUses {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Reward has reached maximum uses",
		})
	}

	// Get member
	var member models.LoyaltyMember
	err = h.db.Where("program_id = ? AND user_id = ?", reward.ProgramID, user.ID).First(&member).Error
	if err != nil {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"error":   "Not a member of this loyalty program",
		})
	}

	// Check if member has enough points
	if member.CurrentPoints < reward.PointsCost {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Insufficient points",
		})
	}

	// Start transaction
	tx := h.db.Begin()

	// Deduct points
	newPoints := member.CurrentPoints - reward.PointsCost
	err = tx.Model(&member).Update("current_points", newPoints).Error
	if err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to deduct points",
		})
	}

	// Create member reward
	memberReward := models.MemberReward{
		ID:         uuid.New().String(),
		MemberID:   member.ID,
		RewardID:   reward.ID,
		ProgramID:  reward.ProgramID,
		CafeID:     reward.CafeID,
		Status:     "available",
	}

	if reward.ValidUntil != nil {
		memberReward.ExpiresAt = reward.ValidUntil
	} else {
		// Default expiry: 30 days from now
		expiresAt := now.AddDate(0, 0, 30)
		memberReward.ExpiresAt = &expiresAt
	}

	if err := tx.Create(&memberReward).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to create member reward",
		})
	}

	// Create transaction record
	transaction := models.LoyaltyTransaction{
		ID:           uuid.New().String(),
		ProgramID:    reward.ProgramID,
		MemberID:     member.ID,
		CafeID:       reward.CafeID,
		Type:         "redeemed",
		Points:       reward.PointsCost,
		BalanceAfter: newPoints,
		Description:  "Redeemed reward: " + reward.Name,
		ReferenceID:  memberReward.ID,
	}

	if err := tx.Create(&transaction).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to create transaction record",
		})
	}

	// Update reward usage count
	tx.Model(&reward).Update("current_reads", reward.CurrentUses+1)

	tx.Commit()

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"member_reward": memberReward,
			"new_balance":   newPoints,
		},
	})
}

// GetMemberRewards gets rewards for current user
func (h *LoyaltyHandler) GetMemberRewards(c *fiber.Ctx) error {
	user := c.Locals("user").(*models.User)
	if user.Role != "customer" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"error":   "Only customers can access rewards",
		})
	}

	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "20"))
	status := c.Query("status", "") // available, used, expired

	offset := (page - 1) * limit

	query := h.db.Model(&models.MemberReward{}).
		Joins("JOIN loyalty_members ON loyalty_members.id = member_rewards.member_id").
		Where("loyalty_members.user_id = ?", user.ID)

	if status != "" {
		query = query.Where("member_rewards.status = ?", status)
	}

	var total int64
	query.Count(&total)

	var memberRewards []models.MemberReward
	err := query.Preload("Reward").
		Preload("Reward.FreeItem").
		Preload("Program").
		Preload("Cafe").
		Offset(offset).
		Limit(limit).
		Order("member_rewards.created_at DESC").
		Find(&memberRewards).Error

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to get member rewards",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"rewards": memberRewards,
			"pagination": fiber.Map{
				"page":  page,
				"limit": limit,
				"total": total,
				"pages": (total + int64(limit) - 1) / int64(limit),
			},
		},
	})
}

// GetLoyaltyTransactions gets transaction history for a member
func (h *LoyaltyHandler) GetLoyaltyTransactions(c *fiber.Ctx) error {
	user := c.Locals("user").(*models.User)
	if user.Role != "customer" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"error":   "Only customers can access transaction history",
		})
	}

	cafeID := c.Params("id")
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "50"))

	offset := (page - 1) * limit

	// Get program
	var program models.LoyaltyProgram
	err := h.db.Where("cafe_id = ? AND is_active = ?", cafeID, true).First(&program).Error
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Loyalty program not found",
		})
	}

	// Get member
	var member models.LoyaltyMember
	err = h.db.Where("program_id = ? AND user_id = ?", program.ID, user.ID).First(&member).Error
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Membership not found",
		})
	}

	query := h.db.Model(&models.LoyaltyTransaction{}).
		Where("member_id = ?", member.ID)

	var total int64
	query.Count(&total)

	var transactions []models.LoyaltyTransaction
	err = query.Preload("Order").
		Offset(offset).
		Limit(limit).
		Order("created_at DESC").
		Find(&transactions).Error

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to get transactions",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"transactions": transactions,
			"pagination": fiber.Map{
				"page":  page,
				"limit": limit,
				"total": total,
				"pages": (total + int64(limit) - 1) / int64(limit),
			},
		},
	})
}

// AddLoyaltyPoints adds points to a member (internal use, after order completion)
func (h *LoyaltyHandler) AddLoyaltyPoints(memberID string, orderAmount float64, orderID string) error {
	var member models.LoyaltyMember
	err := h.db.Preload("Program").Where("id = ?", memberID).First(&member).Error
	if err != nil {
		return err
	}

	// Calculate points
	pointsEarned := int(orderAmount * member.Program.PointsPerCurrency)

	// Check minimum order requirement
	if orderAmount < member.Program.MinOrderForPoints {
		return nil
	}

	// Update member points
	newPoints := member.CurrentPoints + pointsEarned
	newTotalEarned := member.TotalEarned + pointsEarned

	updates := map[string]interface{}{
		"current_points":  newPoints,
		"total_earned":    newTotalEarned,
		"last_activity_at": time.Now(),
	}

	err = h.db.Model(&member).Updates(updates).Error
	if err != nil {
		return err
	}

	// Create transaction record
	transaction := models.LoyaltyTransaction{
		ID:           uuid.New().String(),
		ProgramID:    member.ProgramID,
		MemberID:     member.ID,
		CafeID:       member.CafeID,
		OrderID:      orderID,
		Type:         "earned",
		Points:       pointsEarned,
		BalanceAfter: newPoints,
		Description:  "Points earned from order",
	}

	return h.db.Create(&transaction).Error
}