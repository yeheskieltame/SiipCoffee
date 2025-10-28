package handlers

import (
	"fmt"
	"time"

	"siipcoffe-api/internal/config"
	"siipcoffe-api/internal/models"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PaymentHandler struct {
	db  *gorm.DB
	cfg *config.Config
}

func NewPaymentHandler(db *gorm.DB, cfg *config.Config) *PaymentHandler {
	return &PaymentHandler{
		db:  db,
		cfg: cfg,
	}
}

type ProcessPaymentRequest struct {
	OrderID string  `json:"order_id" validate:"required"`
	Method  string  `json:"method" validate:"required,oneof=crypto cash transfer"`
	Amount  float64 `json:"amount" validate:"required,gt=0"`
}

type CryptoPaymentRequest struct {
	OrderID       string  `json:"order_id" validate:"required"`
	CryptoType    string  `json:"crypto_type" validate:"required,oneof=btc eth"`
	WalletAddress string  `json:"wallet_address" validate:"required"`
}

func (h *PaymentHandler) ProcessPayment(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)

	var req ProcessPaymentRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
			"message": err.Error(),
		})
	}

	// Get order
	var order models.Order
	err := h.db.Where("id = ? AND user_id = ?", req.OrderID, userID).First(&order).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Order not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch order",
			"message": err.Error(),
		})
	}

	// Validate amount
	if req.Amount != order.TotalAmount {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Payment amount doesn't match order total",
			"order_total": order.TotalAmount,
			"payment_amount": req.Amount,
		})
	}

	// Create payment record
	payment := models.Payment{
		ID:            uuid.New().String(),
		OrderID:       req.OrderID,
		Amount:        req.Amount,
		Method:        req.Method,
		Status:        string(models.PaymentStatusPending),
		TransactionID: h.generateTransactionID(),
	}

	if err := h.db.Create(&payment).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create payment",
			"message": err.Error(),
		})
	}

	// Update order with payment info
	h.db.Model(&order).Updates(map[string]interface{}{
		"payment_method": req.Method,
		"payment_id":     payment.ID,
	})

	// Process payment based on method
	var response interface{}
	switch req.Method {
	case "crypto":
		response = h.processCryptoPayment(payment, order)
	case "cash":
		response = h.processCashPayment(payment, order)
	case "transfer":
		response = h.processBankTransfer(payment, order)
	default:
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid payment method",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Payment processed successfully",
		"data": response,
	})
}

func (h *PaymentHandler) processCryptoPayment(payment models.Payment, order models.Order) interface{} {
	// Generate unique wallet address for this payment
	walletAddress := h.generateCryptoAddress()

	// Update payment with crypto info
	h.db.Model(&payment).Updates(map[string]interface{}{
		"crypto_address": walletAddress,
	})

	// Calculate crypto amount (simplified - in production, use real exchange rates)
	cryptoAmount := payment.Amount / 100000000 // Convert to BTC (example)

	return fiber.Map{
		"payment_id":     payment.ID,
		"transaction_id": payment.TransactionID,
		"method":         "crypto",
		"wallet_address": walletAddress,
		"crypto_amount":  cryptoAmount,
		"fiat_amount":    payment.Amount,
		"currency":       "IDR",
		"qr_code":        fmt.Sprintf("bitcoin:%s?amount=%.8f", walletAddress, cryptoAmount),
		"status":         "awaiting_payment",
		"expires_at":     "2024-01-01T23:59:59Z", // 24 hours from now
	}
}

func (h *PaymentHandler) processCashPayment(payment models.Payment, order models.Order) interface{} {
	// For cash payment, mark as pending confirmation
	h.db.Model(&payment).Updates(map[string]interface{}{
		"status": string(models.PaymentStatusPending),
	})

	return fiber.Map{
		"payment_id":     payment.ID,
		"transaction_id": payment.TransactionID,
		"method":         "cash",
		"amount":         payment.Amount,
		"currency":       "IDR",
		"status":         "pending_confirmation",
		"instructions":   "Silakan bayar di kasir saat menerima pesanan",
	}
}

func (h *PaymentHandler) processBankTransfer(payment models.Payment, order models.Order) interface{} {
	// Generate virtual account
	virtualAccount := h.generateVirtualAccount()

	h.db.Model(&payment).Updates(map[string]interface{}{
		"status": string(models.PaymentStatusPending),
	})

	return fiber.Map{
		"payment_id":      payment.ID,
		"transaction_id":  payment.TransactionID,
		"method":          "bank_transfer",
		"virtual_account": virtualAccount,
		"amount":          payment.Amount,
		"currency":        "IDR",
		"status":          "pending_transfer",
		"bank_name":       "Bank SiipCoffee",
		"account_name":    "SiipCoffee Cafe",
		"expires_at":      "2024-01-01T23:59:59Z", // 24 hours from now
	}
}

func (h *PaymentHandler) GetPaymentStatus(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	orderID := c.Params("orderId")

	// Get order with payment
	var order models.Order
	err := h.db.Preload("Payment").Where("id = ? AND user_id = ?", orderID, userID).First(&order).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Order not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch order",
			"message": err.Error(),
		})
	}

	if order.PaymentID == "" {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "No payment found for this order",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"order_id":        order.ID,
			"payment_id":      order.Payment.ID,
			"payment_status":  order.PaymentStatus,
			"payment_method":  order.PaymentMethod,
			"amount":          order.Payment.Amount,
			"transaction_id":  order.Payment.TransactionID,
			"confirmed_at":    order.Payment.ConfirmedAt,
		},
	})
}

func (h *PaymentHandler) ConfirmPayment(c *fiber.Ctx) error {
	// This endpoint would be called by payment gateway webhook or admin
	paymentID := c.Params("paymentId")

	var payment models.Payment
	err := h.db.First(&payment, "id = ?", paymentID).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Payment not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch payment",
			"message": err.Error(),
		})
	}

	// Update payment status
	now := time.Now()
	h.db.Model(&payment).Updates(map[string]interface{}{
		"status":       string(models.PaymentStatusPaid),
		"confirmed_at": &now,
	})

	// Update order payment status
	h.db.Model(&models.Order{}).Where("id = ?", payment.OrderID).Updates(map[string]interface{}{
		"payment_status": string(models.PaymentStatusPaid),
	})

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Payment confirmed successfully",
	})
}

func (h *PaymentHandler) generateTransactionID() string {
	timestamp := time.Now().Format("20060102150405")
	random := uuid.New().String()[:8]
	return fmt.Sprintf("TXN-%s-%s", timestamp, random)
}

func (h *PaymentHandler) generateCryptoAddress() string {
	// In production, generate actual cryptocurrency address
	// For demo purposes, return a mock address
	return fmt.Sprintf("bc1q%s", uuid.New().String()[:32])
}

func (h *PaymentHandler) generateVirtualAccount() string {
	// Generate virtual account number
	return fmt.Sprintf("8808%08d", uuid.New().ID())
}