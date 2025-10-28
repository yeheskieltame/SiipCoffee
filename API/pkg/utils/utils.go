package utils

import (
	"fmt"
	"path/filepath"
	"strings"
	"time"

	"github.com/google/uuid"
)

// IsImageFile checks if a file is an image based on its extension
func IsImageFile(filename string) bool {
	ext := strings.ToLower(filepath.Ext(filename))
	imageExtensions := map[string]bool{
		".jpg":  true,
		".jpeg": true,
		".png":  true,
		".gif":  true,
		".webp": true,
		".svg":  true,
	}
	return imageExtensions[ext]
}

// GetFileExtension returns the file extension with the dot
func GetFileExtension(filename string) string {
	return filepath.Ext(filename)
}

// GenerateOrderNumber generates a unique order number
func GenerateOrderNumber() string {
	now := time.Now()
	dateStr := now.Format("20060102")
	randomStr := uuid.New().String()[:8]
	return fmt.Sprintf("ORD-%s-%s", dateStr, randomStr)
}

// CalculatePoints calculates loyalty points based on amount and rate
func CalculatePoints(amount float64, pointsPerCurrency float64) int {
	return int(amount * pointsPerCurrency)
}

// FormatCurrency formats amount as currency (Indonesian Rupiah)
func FormatCurrency(amount float64) string {
	return fmt.Sprintf("Rp%.2f", amount)
}

// IsValidEmail checks if email format is valid
func IsValidEmail(email string) bool {
	return strings.Contains(email, "@") && strings.Contains(email, ".")
}

// GenerateReferenceID generates a unique reference ID
func GenerateReferenceID() string {
	return uuid.New().String()
}

// CalculateDistance calculates distance between two coordinates (simplified)
func CalculateDistance(lat1, lng1, lat2, lng2 float64) float64 {
	// This is a simplified calculation
	// For production, use the Haversine formula
	latDiff := lat2 - lat1
	lngDiff := lng2 - lng1
	return (latDiff*latDiff + lngDiff*lngDiff) * 111 * 111 // Approximate km
}

// TimeAgo formats time as "X time ago"
func TimeAgo(t time.Time) string {
	now := time.Now()
	diff := now.Sub(t)

	if diff < time.Minute {
		return "just now"
	}
	if diff < time.Hour {
		return fmt.Sprintf("%d minutes ago", int(diff.Minutes()))
	}
	if diff < 24*time.Hour {
		return fmt.Sprintf("%d hours ago", int(diff.Hours()))
	}
	if diff < 30*24*time.Hour {
		return fmt.Sprintf("%d days ago", int(diff.Hours()/24))
	}
	return t.Format("2006-01-02")
}

// SanitizeString removes potentially harmful characters
func SanitizeString(s string) string {
	// Basic sanitization - implement more robust version in production
	s = strings.TrimSpace(s)
	s = strings.ReplaceAll(s, "<", "&lt;")
	s = strings.ReplaceAll(s, ">", "&gt;")
	return s
}

// IsValidPhoneNumber validates Indonesian phone number format
func IsValidPhoneNumber(phone string) bool {
	// Remove spaces and dashes
	phone = strings.ReplaceAll(phone, " ", "")
	phone = strings.ReplaceAll(phone, "-", "")

	// Check if starts with Indonesian country code or 0
	if strings.HasPrefix(phone, "+62") {
		phone = phone[3:]
	} else if strings.HasPrefix(phone, "0") {
		phone = phone[1:]
	}

	// Check if remaining is 9-13 digits
	if len(phone) >= 9 && len(phone) <= 13 {
		for _, char := range phone {
			if char < '0' || char > '9' {
				return false
			}
		}
		return true
	}

	return false
}

// Paginate returns pagination metadata
func Paginate(page, limit int, total int64) map[string]interface{} {
	totalPages := (total + int64(limit) - 1) / int64(limit)

	return map[string]interface{}{
		"page":       page,
		"limit":      limit,
		"total":      total,
		"pages":      totalPages,
		"has_next":   page < int(totalPages),
		"has_prev":   page > 1,
	}
}

// ValidateRequired checks if required fields are present
func ValidateRequired(data map[string]interface{}, requiredFields []string) []string {
	var missing []string

	for _, field := range requiredFields {
		if value, exists := data[field]; !exists || value == nil || value == "" {
			missing = append(missing, field)
		}
	}

	return missing
}

// GenerateSlug creates a URL-friendly slug from a string
func GenerateSlug(s string) string {
	// Convert to lowercase and replace spaces with hyphens
	slug := strings.ToLower(s)
	slug = strings.ReplaceAll(slug, " ", "-")

	// Remove special characters except hyphens
	result := ""
	for _, char := range slug {
		if (char >= 'a' && char <= 'z') || (char >= '0' && char <= '9') || char == '-' {
			result += string(char)
		}
	}

	// Remove consecutive hyphens
	for strings.Contains(result, "--") {
		result = strings.ReplaceAll(result, "--", "-")
	}

	// Remove leading/trailing hyphens
	result = strings.Trim(result, "-")

	return result
}