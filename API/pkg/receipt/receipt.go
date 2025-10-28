package receipt

import (
	"bytes"
	"fmt"
	"text/template"
	"time"

	"siipcoffe-api/internal/models"
)

type Generator struct {
	cafeInfo CafeInfo
}

type CafeInfo struct {
	Name    string
	Address string
	Phone   string
	Email   string
}

type ReceiptData struct {
	CafeInfo      CafeInfo
	Order         models.OrderResponse
	OrderDate     string
	PaymentInfo   PaymentInfo
	ThankYou      string
}

type PaymentInfo struct {
	Method      string
	Status      string
	TransactionID string
}

func NewGenerator(cafeInfo CafeInfo) *Generator {
	return &Generator{
		cafeInfo: cafeInfo,
	}
}

func (g *Generator) GenerateReceipt(order models.OrderResponse) (string, error) {
	receiptData := ReceiptData{
		CafeInfo: g.cafeInfo,
		Order:    order,
		OrderDate: time.Now().Format("02 January 2006, 15:04 WIB"),
		PaymentInfo: PaymentInfo{
			Method:        order.PaymentMethod,
			Status:        order.PaymentStatus,
			TransactionID: "", // Will be filled from payment data
		},
		ThankYou: "Terima kasih atas kunjungan Anda!",
	}

	// Use text template for receipt generation
	tmpl := template.Must(template.New("receipt").Parse(receiptTemplate))

	var buf bytes.Buffer
	err := tmpl.Execute(&buf, receiptData)
	if err != nil {
		return "", fmt.Errorf("failed to execute receipt template: %w", err)
	}

	return buf.String(), nil
}

func (g *Generator) GenerateJSONReceipt(order models.OrderResponse) (map[string]interface{}, error) {
	return map[string]interface{}{
		"cafe_info": g.cafeInfo,
		"order": map[string]interface{}{
			"id":               order.ID,
			"order_number":     order.OrderNumber,
			"status":           order.Status,
			"customer_name":    order.CustomerName,
			"customer_phone":   order.CustomerPhone,
			"order_type":       order.OrderType,
			"table_number":     order.TableNumber,
			"delivery_address": order.DeliveryAddress,
			"notes":            order.Notes,
			"items":            order.OrderItems,
			"total_amount":     order.TotalAmount,
			"payment_method":   order.PaymentMethod,
			"payment_status":   order.PaymentStatus,
			"created_at":       order.CreatedAt,
			"completed_at":     order.CompletedAt,
		},
		"receipt_date": time.Now().Format("02 January 2006, 15:04 WIB"),
		"payment_info": map[string]interface{}{
			"method":         order.PaymentMethod,
			"status":         order.PaymentStatus,
			"transaction_id": "", // Will be filled from payment data
		},
		"thank_you": "Terima kasih atas kunjungan Anda!",
	}, nil
}

const receiptTemplate = `
╔══════════════════════════════════════════════════════════════╗
║                        {{.CafeInfo.Name}}                       ║
║                     {{.CafeInfo.Address}}                      ║
║                   Tel: {{.CafeInfo.Phone}}                    ║
╠══════════════════════════════════════════════════════════════╣
║                          STRUK PEMBAYARAN                     ║
╠══════════════════════════════════════════════════════════════╣
║ No. Order   : {{.Order.OrderNumber}}                          ║
║ Tanggal      : {{.OrderDate}}                                ║
║ Kasir        : AI Assistant                                  ║
╠══════════════════════════════════════════════════════════════╣
║                         DETAIL PESANAN                       ║
╠══════════════════════════════════════════════════════════════╣
{{range .Order.OrderItems}}║ {{printf "%-3s %-30s %3d x %8.0f" .Menu.Name .Menu.Name .Quantity .UnitPrice}} ║
║ {{printf "%46s %8.0f" " " .TotalPrice}}                    ║
{{end}}╠══════════════════════════════════════════════════════════════╣
║ {{printf "TOTAL: %55s" (printf "Rp %,.0f" .Order.TotalAmount)}}║
╠══════════════════════════════════════════════════════════════╣
║                    INFORMASI PEMBAYARAN                      ║
╠══════════════════════════════════════════════════════════════╣
║ Metode      : {{.PaymentInfo.Method}}                         ║
║ Status      : {{.PaymentInfo.Status}}                         ║
{{if .PaymentInfo.TransactionID}}║ Transaksi   : {{.PaymentInfo.TransactionID}}               ║{{end}}╠══════════════════════════════════════════════════════════════╣
║                     INFORMASI PELANGGAN                       ║
╠══════════════════════════════════════════════════════════════╣
║ Nama        : {{.Order.CustomerName}}                         ║
{{if .Order.CustomerPhone}}║ Telepon     : {{.Order.CustomerPhone}}                        ║{{end}}{{if eq .Order.OrderType "dine_in"}}║ Meja        : {{.Order.TableNumber}}                             ║{{else if eq .Order.OrderType "delivery"}}║ Alamat      : {{.Order.DeliveryAddress}}                     ║{{else if eq .Order.OrderType "take_away"}}║ Jenis       : Bawa Pulang                                   ║{{end}}╠══════════════════════════════════════════════════════════════╣
║                          CATATAN                             ║
╠══════════════════════════════════════════════════════════════╣
║ {{printf "%-60s" .Order.Notes}}                              ║
╠══════════════════════════════════════════════════════════════╣
║                      {{.ThankYou}}                           ║
║             Silakan datang kembali ke {{.CafeInfo.Name}}             ║
╚══════════════════════════════════════════════════════════════╝
`

// GenerateMiniReceipt generates a simplified receipt for mobile display
func (g *Generator) GenerateMiniReceipt(order models.OrderResponse) (string, error) {
	receiptData := struct {
		Order     models.OrderResponse
		OrderDate string
		CafeInfo  CafeInfo
	}{
		Order:     order,
		OrderDate: time.Now().Format("02/01 15:04"),
		CafeInfo:  g.cafeInfo,
	}

	tmpl := template.Must(template.New("mini_receipt").Parse(miniReceiptTemplate))

	var buf bytes.Buffer
	err := tmpl.Execute(&buf, receiptData)
	if err != nil {
		return "", fmt.Errorf("failed to execute mini receipt template: %w", err)
	}

	return buf.String(), nil
}

const miniReceiptTemplate = `
**{{.CafeInfo.Name}}** - {{.OrderDate}}
No: {{.Order.OrderNumber}}

{{range .Order.OrderItems}}- {{.Menu.Name}} ({{.Quantity}}x) = Rp {{.TotalPrice | printf "%.0f"}}
{{end}}---
**Total: Rp {{.Order.TotalAmount | printf "%.0f"}}**

Metode: {{.Order.PaymentMethod}}
Status: {{.Order.PaymentStatus}}

Terima kasih! ☕
`

func (g *Generator) GenerateQRReceipt(order models.OrderResponse) (string, error) {
	// Generate QR code data (simplified version)
	qrData := fmt.Sprintf("siipcoffe:receipt?id=%s&number=%s&amount=%.2f",
		order.ID, order.OrderNumber, order.TotalAmount)

	return qrData, nil
}