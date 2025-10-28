package handlers

import (
	"log"

	"github.com/gofiber/fiber/v2"
)

// ErrorHandler handles application errors
func ErrorHandler(c *fiber.Ctx, err error) error {
	// Check if error is a Fiber error
	if e, ok := err.(*fiber.Error); ok {
		return c.Status(e.Code).JSON(fiber.Map{
			"success": false,
			"error":   e.Message,
		})
	}

	// Log the error
	log.Printf("Error: %v", err)

	// Return generic error response
	return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
		"success": false,
		"error":   "Internal server error",
		"message": "Something went wrong. Please try again later.",
	})
}

// GetAnalytics handles analytics endpoint
func GetAnalytics(c *fiber.Ctx) error {
	// This would normally fetch analytics data from database
	// For now, return mock data
	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"total_orders": 150,
			"total_revenue": 7500000,
			"popular_items": []fiber.Map{
				{"name": "Cappuccino", "orders": 45},
				{"name": "Espresso", "orders": 38},
				{"name": "Croissant", "orders": 32},
			},
			"daily_stats": []fiber.Map{
				{"date": "2024-01-01", "orders": 25, "revenue": 1250000},
				{"date": "2024-01-02", "orders": 32, "revenue": 1600000},
				{"date": "2024-01-03", "orders": 28, "revenue": 1400000},
			},
		},
	})
}

// GetAllOrders handles fetching all orders for admin
func GetAllOrders(c *fiber.Ctx) error {
	// This would normally fetch all orders from database
	// For now, return mock data
	return c.JSON(fiber.Map{
		"success": true,
		"data": []fiber.Map{
			{
				"id":          "1",
				"order_number": "ORD-20240101-001",
				"customer":    "John Doe",
				"status":      "completed",
				"total":       75000,
				"created_at":  "2024-01-01T10:30:00Z",
			},
			{
				"id":          "2",
				"order_number": "ORD-20240101-002",
				"customer":    "Jane Smith",
				"status":      "preparing",
				"total":       45000,
				"created_at":  "2024-01-01T11:15:00Z",
			},
		},
	})
}