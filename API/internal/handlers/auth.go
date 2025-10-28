package handlers

import (
	"errors"
	"time"

	"siipcoffe-api/internal/config"
	"siipcoffe-api/internal/models"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type AuthHandler struct {
	db  *gorm.DB
	cfg *config.Config
}

func NewAuthHandler(db *gorm.DB, cfg *config.Config) *AuthHandler {
	return &AuthHandler{db: db, cfg: cfg}
}

type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

type RegisterRequest struct {
	Name     string `json:"name" validate:"required"`
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=6"`
	Phone    string `json:"phone"`
	Address  string `json:"address"`
	Role     string `json:"role"` // optional, defaults to "customer"
}

type AuthResponse struct {
	Token     string         `json:"token"`
	User      models.UserResponse `json:"user"`
	ExpiresAt int64          `json:"expires_at"`
}

func (h *AuthHandler) Register(c *fiber.Ctx) error {
	var req RegisterRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
			"message": err.Error(),
		})
	}

	// Validate required fields
	if req.Name == "" || req.Email == "" || req.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Name, email, and password are required",
		})
	}

	// Check if user already exists
	var existingUser models.User
	err := h.db.Where("email = ?", req.Email).First(&existingUser).Error
	if err == nil {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{
			"error": "User with this email already exists",
		})
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Database error",
			"message": err.Error(),
		})
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to hash password",
			"message": err.Error(),
		})
	}

	// Set default role if not provided
	role := req.Role
	if role == "" {
		role = "customer"
	}

	// Create user
	user := models.User{
		ID:       uuid.New().String(),
		Name:     req.Name,
		Email:    req.Email,
		Password: string(hashedPassword),
		Role:     role,
		Phone:    req.Phone,
		Address:  req.Address,
	}

	if err := h.db.Create(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create user",
			"message": err.Error(),
		})
	}

	// Generate JWT token
	token, expiresAt, err := h.generateJWT(user.ID, user.Role)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to generate token",
			"message": err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "User registered successfully",
		"data": AuthResponse{
			Token:     token,
			User:      user.ToResponse(),
			ExpiresAt: expiresAt,
		},
	})
}

func (h *AuthHandler) Login(c *fiber.Ctx) error {
	var req LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
			"message": err.Error(),
		})
	}

	// Find user
	var user models.User
	err := h.db.Where("email = ?", req.Email).First(&user).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Invalid credentials",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Database error",
			"message": err.Error(),
		})
	}

	// Check password
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password))
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Invalid credentials",
		})
	}

	// Generate JWT token
	token, expiresAt, err := h.generateJWT(user.ID, user.Role)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to generate token",
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Login successful",
		"data": AuthResponse{
			Token:     token,
			User:      user.ToResponse(),
			ExpiresAt: expiresAt,
		},
	})
}

func (h *AuthHandler) RefreshToken(c *fiber.Ctx) error {
	user := c.Locals("user").(*models.User)

	// Generate new JWT token
	token, expiresAt, err := h.generateJWT(user.ID, user.Role)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to generate token",
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Token refreshed successfully",
		"data": AuthResponse{
			Token:     token,
			User:      user.ToResponse(),
			ExpiresAt: expiresAt,
		},
	})
}

func (h *AuthHandler) generateJWT(userID, role string) (string, int64, error) {
	// Parse expiration duration
	duration, err := time.ParseDuration(h.cfg.JWTExpiresIn)
	if err != nil {
		duration = 24 * time.Hour // fallback to 24 hours
	}

	expiresAt := time.Now().Add(duration).Unix()

	// Create JWT claims
	claims := jwt.MapClaims{
		"user_id": userID,
		"role":    role,
		"exp":     expiresAt,
		"iat":     time.Now().Unix(),
	}

	// Create token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(h.cfg.JWTSecret))
	if err != nil {
		return "", 0, err
	}

	return tokenString, expiresAt, nil
}