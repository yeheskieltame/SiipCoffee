package gemini

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"strings"

	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

type Client struct {
	client   *genai.Client
	model    *genai.GenerativeModel
	cafeInfo CafeInfo
}

type CafeInfo struct {
	Name    string
	Address string
	Phone   string
}

type OrderIntent struct {
	Action    string                   `json:"action"`
	Items     []OrderItem              `json:"items,omitempty"`
	OrderType string                   `json:"order_type,omitempty"`
	Notes     string                   `json:"notes,omitempty"`
	Details   map[string]interface{}   `json:"details,omitempty"`
}

type OrderItem struct {
	MenuID   string  `json:"menu_id"`
	Name     string  `json:"name"`
	Quantity int     `json:"quantity"`
	Price    float64 `json:"price"`
	Notes    string  `json:"notes,omitempty"`
}

type ChatResponse struct {
	Message       string      `json:"message"`
	Intent        string      `json:"intent"`
	OrderIntent   *OrderIntent `json:"order_intent,omitempty"`
	ShouldConfirm bool        `json:"should_confirm"`
	Context       string      `json:"context,omitempty"`
}

func NewClient(apiKey string) (*Client, error) {
	ctx := context.Background()
	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		return nil, fmt.Errorf("failed to create Gemini client: %w", err)
	}

	model := client.GenerativeModel("gemini-2.5-flash")
	model.SetTemperature(0.6) // Optimal untuk chat yang konsisten
	model.SetTopK(32)
	model.SetTopP(0.9)
	model.SetMaxOutputTokens(1024) // Flash model lebih efisien

	return &Client{
		client: client,
		model:  model,
		cafeInfo: CafeInfo{
			Name:    "SiipCoffee",
			Address: "Jl. Cafe No. 123, Jakarta",
			Phone:   "+62 812-3456-7890",
		},
	}, nil
}

func (c *Client) Close() {
	if c.client != nil {
		c.client.Close()
	}
}

func (c *Client) ProcessMessage(ctx context.Context, message string, conversationHistory []map[string]interface{}, availableMenus []map[string]interface{}) (*ChatResponse, error) {
	// Build the system prompt
	systemPrompt := c.buildSystemPrompt(availableMenus)

	// Build conversation context
	conversationContext := c.buildConversationContext(conversationHistory)

	// Generate the full prompt - natural conversation without JSON forcing
	fullPrompt := fmt.Sprintf(`%s

=== Riwayat Percakapan ===
%s

=== Pesan User ===
%s

=== Instruksi Respon ===
1. Berikan respons yang natural dan percakapan dalam bahasa Indonesia
2. Respons harus singkat, jelas, dan ramah
3. Jika user memesan, tambahkan item ke cart dengan format:
   - Nama menu
   - Jumlah
   - Harga
   - Tanyakan konfirmasi

4. Format JSON internal (untuk sistem):
   {
     "message": "pesan yang akan ditampilkan ke user",
     "intent": "jenis intent",
     "order_intent": {...} jika ada pesanan,
     "should_confirm": boolean
   }

Respons yang user lihat harus natural, bukan JSON.`, systemPrompt, conversationContext, message)

	// Generate response
	resp, err := c.model.GenerateContent(ctx, genai.Text(fullPrompt))
	if err != nil {
		return nil, fmt.Errorf("failed to generate content: %w", err)
	}

	if len(resp.Candidates) == 0 || len(resp.Candidates[0].Content.Parts) == 0 {
		return nil, fmt.Errorf("no response generated")
	}

	responseText := fmt.Sprintf("%v", resp.Candidates[0].Content.Parts[0])

	// Try to parse as JSON first (for backward compatibility)
	var chatResponse ChatResponse
	if err := json.Unmarshal([]byte(responseText), &chatResponse); err == nil {
		// Successfully parsed as JSON
		return &chatResponse, nil
	}

	// If not JSON, treat as natural text response
	log.Printf("Natural response from Gemini: %s", responseText)

	// Create response from natural text
	chatResponse = ChatResponse{
		Message: responseText,
		Intent: c.detectIntent(message, responseText),
		ShouldConfirm: c.shouldConfirm(message, responseText),
	}

	// Try to detect order intent from natural text
	if orderIntent := c.detectOrderIntent(message, responseText, availableMenus); orderIntent != nil {
		chatResponse.OrderIntent = orderIntent
	}

	return &chatResponse, nil
}

func (c *Client) buildSystemPrompt(menus []map[string]interface{}) string {
	menuText := "MENU:\n"
	for i, menu := range menus {
		if i < 10 { // Batasi untuk Flash model efficiency
			menuText += fmt.Sprintf("- %s (Rp %.0f): %s\n",
				menu["name"], menu["price"], menu["description"])
		}
	}

	return fmt.Sprintf(`AI Assistant untuk %s - %s

%s

ATURAN:
- Respons singkat, jelas, ramah
- Fokus pada pemesanan dan rekomendasi
- Konfirmasi sebelum buat order
- Bahasa Indonesia alami

JENIS PESANAN:
- dine_in (makan di tempat)
- take_away (bawa pulang)
- delivery (pengantaran)

PEMBAYARAN:
- crypto (Bitcoin/Ethereum)
- cash (tunai)
- transfer (bank)

RESPONS JSON SAJA, tidak perlu penjelasan.`, c.cafeInfo.Name, c.cafeInfo.Phone, menuText)
}

func (c *Client) buildConversationContext(history []map[string]interface{}) string {
	if len(history) == 0 {
		return "Mulai percakapan baru."
	}

	// Ambil 5 pesan terakhir untuk efisiensi
	start := 0
	if len(history) > 5 {
		start = len(history) - 5
	}

	context := ""
	for _, msg := range history[start:] {
		role := "User"
		if isAI, ok := msg["is_ai"].(bool); ok && isAI {
			role = "AI"
		}
		context += fmt.Sprintf("%s: %s\n", role, msg["message"])
	}
	return context
}

func (c *Client) detectIntent(userMessage, aiResponse string) string {
	userMessage = strings.ToLower(userMessage)
	aiResponse = strings.ToLower(aiResponse)

	// Check for greetings
	if strings.Contains(userMessage, "halo") || strings.Contains(userMessage, "hai") ||
	   strings.Contains(userMessage, "selamat") || strings.Contains(userMessage, "pagi") ||
	   strings.Contains(userMessage, "siang") || strings.Contains(userMessage, "sore") ||
	   strings.Contains(userMessage, "malam") {
		return "greeting"
	}

	// Check for ordering
	if strings.Contains(userMessage, "pesan") || strings.Contains(userMessage, "mau") ||
	   strings.Contains(userMessage, "saya mau") || strings.Contains(userMessage, "saya ingin") ||
	   strings.Contains(userMessage, "tolong") || strings.Contains(userMessage, "buatkan") {
		return "order"
	}

	// Check for menu inquiry
	if strings.Contains(userMessage, "apa") || strings.Contains(userMessage, "ada apa") ||
	   strings.Contains(userMessage, "menu") || strings.Contains(userMessage, "kopi") ||
	   strings.Contains(userMessage, "harga") || strings.Contains(userMessage, "berapa") {
		return "inquiry"
	}

	// Check for complaint
	if strings.Contains(userMessage, "keluhan") || strings.Contains(userMessage, "komplain") ||
	   strings.Contains(userMessage, "tidak") || strings.Contains(userMessage, "jelek") ||
	   strings.Contains(userMessage, "salah") {
		return "complaint"
	}

	// Check for goodbye
	if strings.Contains(userMessage, "terima kasih") || strings.Contains(userMessage, "sampai jumpa") ||
	   strings.Contains(userMessage, "dulu") || strings.Contains(userMessage, "selamat tinggal") {
		return "goodbye"
	}

	return "inquiry"
}

func (c *Client) shouldConfirm(userMessage, aiResponse string) bool {
	userMessage = strings.ToLower(userMessage)
	aiResponse = strings.ToLower(aiResponse)

	// Check if AI is asking for confirmation
	if strings.Contains(aiResponse, "benar") || strings.Contains(aiResponse, "apakah") ||
	   strings.Contains(aiResponse, "konfirmasi") || strings.Contains(aiResponse, "yakin") ||
	   strings.Contains(aiResponse, "sesuai") {
		return true
	}

	// Check if user is ordering
	if strings.Contains(userMessage, "pesan") || strings.Contains(userMessage, "mau") {
		return true
	}

	return false
}

func (c *Client) detectOrderIntent(userMessage, aiResponse string, availableMenus []map[string]interface{}) *OrderIntent {
	userMessage = strings.ToLower(userMessage)
	aiResponse = strings.ToLower(aiResponse)

	// Simple order detection based on keywords
	orderIntent := &OrderIntent{
		Action: "create_order",
		Items:  []OrderItem{},
	}

	// Look for menu items mentioned
	for _, menu := range availableMenus {
		menuName := strings.ToLower(fmt.Sprintf("%v", menu["name"]))
		menuID := fmt.Sprintf("%v", menu["id"])
		menuPrice := menu["price"].(float64)

		if strings.Contains(userMessage, menuName) {
			// Try to extract quantity
			quantity := 1
			if strings.Contains(userMessage, "2") || strings.Contains(userMessage, "dua") {
				quantity = 2
			} else if strings.Contains(userMessage, "3") || strings.Contains(userMessage, "tiga") {
				quantity = 3
			}

			orderIntent.Items = append(orderIntent.Items, OrderItem{
				MenuID:  menuID,
				Name:   fmt.Sprintf("%v", menu["name"]),
				Quantity: quantity,
				Price:   menuPrice,
			})
		}
	}

	// Only return order intent if we found items
	if len(orderIntent.Items) > 0 {
		// Detect order type
		if strings.Contains(userMessage, "bawa pulang") || strings.Contains(userMessage, "take away") {
			orderIntent.OrderType = "take_away"
		} else if strings.Contains(userMessage, "antar") || strings.Contains(userMessage, "delivery") {
			orderIntent.OrderType = "delivery"
		} else {
			orderIntent.OrderType = "dine_in"
		}

		return orderIntent
	}

	return nil
}

func (c *Client) GenerateReceipt(ctx context.Context, order map[string]interface{}) (string, error) {
	prompt := fmt.Sprintf(`Buatkan struk pembelian yang rapi dan profesional dalam format teks untuk pesanan berikut:

%s

Format struk:
- Header dengan nama kafe dan info kontak
- Detail pesanan (nama, qty, harga, subtotal)
- Total pembayaran
- Status pembayaran
- Terima kasih

Pastikan format mudah dibaca dan terlihat profesional.`, c.formatOrderDetails(order))

	resp, err := c.model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		return "", fmt.Errorf("failed to generate receipt: %w", err)
	}

	if len(resp.Candidates) == 0 || len(resp.Candidates[0].Content.Parts) == 0 {
		return "", fmt.Errorf("no receipt generated")
	}

	return fmt.Sprintf("%v", resp.Candidates[0].Content.Parts[0]), nil
}

func (c *Client) formatOrderDetails(order map[string]interface{}) string {
	// This would format the order details into a readable string
	// Implementation depends on the order structure
	return fmt.Sprintf("Order: %+v", order)
}