import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

// Mock menu data for fallback (this should come from your backend)
const mockMenuData: Record<string, any[]> = {
  iced_coffee: [
    { id: "C001", name: "Iced Coffee Milk Mako", price: 18000, description: "Espresso. Condensed. Milk. Palm Sugar." },
    { id: "C002", name: "Iced Coffee Karla", price: 20000, description: "Espresso. Condensed. Milk. Caramel Syrup." },
    { id: "C003", name: "Iced Coffee Rum Cookies", price: 22000, description: "Espresso. Condensed. Milk. Rum Syrup. Cookies. Ice Cream" },
    { id: "C004", name: "Iced Coffee Mocha", price: 20000, description: "Espresso. Condensed. Milk. Chocolate." },
    { id: "C005", name: "Iced Coffee Coco", price: 20000, description: "Espresso. Coconut Water." },
    { id: "C006", name: "Sweet Pandan Iced Coffee", price: 20000, description: "Espresso. Condensed. Milk. Pandan Syrup." },
    { id: "C007", name: "Coconut Milk Coffee", price: 20000, description: "Coconut Milk Coffee." },
    { id: "C008", name: "Matcha Presso", price: 25000, description: "The savory taste of matcha latte mixed with the deliciousness of double espresso." },
  ],
  espresso_based: [
    { id: "E001", name: "Espresso", price: 12000, description: "Espresso." },
    { id: "E002", name: "Iced Americano", price: 12000, description: "Iced Americano." },
    { id: "E003", name: "Coffee Latte", price: 18000, description: "Hot / ice, sweet / plain." },
    { id: "E004", name: "Cappuccino", price: 18000, description: "Coffee + Milk." },
  ],
  non_coffee: [
    { id: "N001", name: "Chocolate", price: 20000, description: "Hot / ice chocolate." },
    { id: "N002", name: "Matcha Latte", price: 20000, description: "From premium matcha powder." },
    { id: "N003", name: "Choco Rum", price: 22000, description: "Chocolate + Vanilla Ice Cream + Cookies." },
  ],
  pastry: [
    { id: "P001", name: "Almond Croissant", price: 20500, description: "Croissant with Almonds. We heat this item first." },
    { id: "P002", name: "Original Croissant", price: 14000, description: "Original Croissant. We heat this item first." },
    { id: "P003", name: "Pain Au Chocolat", price: 16000, description: "Pain Au Chocolat. We heat this item first." },
    { id: "P004", name: "CROFFLE", price: 26000, description: "SALTED CARAMEL / DOUBLE CHOCOLATE." },
  ],
  refreshment: [
    { id: "R001", name: "Americano Fantasy", price: 18000, description: "Sparkling Coffee Based." },
    { id: "R002", name: "Red Berry", price: 18000, description: "Sparkling Coffee Based." },
    { id: "R003", name: "Oranje", price: 18000, description: "Sparkling Coffee Based." },
    { id: "R004", name: "Aromatic Tea", price: 18000, description: "Sparkling Tea Based. Berry." },
    { id: "R005", name: "Teagsm", price: 18000, description: "Sparkling Tea Based. Apple + Lemon" },
  ],
};

// Call the actual backend NLP service
async function callNLPBackend(message: string) {
  try {
    // Try to connect to the Python backend first
    const response = await fetch(`${BACKEND_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.log('Backend not available, using fallback logic');
  }

  // Fallback to simple keyword-based response system if backend is not available
  try {
    const lowerMessage = message.toLowerCase();

    // Intent recognition
    if (lowerMessage.includes('menu') || lowerMessage.includes('show me') || lowerMessage.includes('what do you have')) {
      return {
        intent: 'view_menu',
        response: "Here's our menu! I've organized it by categories for you. You can tap on any item to add it to your cart.",
        suggestedItems: [
          ...mockMenuData.iced_coffee.slice(0, 2),
          ...mockMenuData.espresso_based.slice(0, 1),
          ...mockMenuData.pastry.slice(0, 1),
        ],
      };
    }

    if (lowerMessage.includes('iced coffee') || lowerMessage.includes('cold coffee')) {
      return {
        intent: 'category_recommendation',
        response: "Great choice! Here are our popular iced coffee options. Which one catches your eye?",
        suggestedItems: mockMenuData.iced_coffee.slice(0, 3),
      };
    }

    if (lowerMessage.includes('espresso') || lowerMessage.includes('hot coffee')) {
      return {
        intent: 'category_recommendation',
        response: "Excellent! Here are our espresso-based drinks. Perfect for coffee lovers!",
        suggestedItems: mockMenuData.espresso_based,
      };
    }

    if (lowerMessage.includes('pastry') || lowerMessage.includes('food') || lowerMessage.includes('snack')) {
      return {
        intent: 'category_recommendation',
        response: "Here are our delicious pastries that go perfectly with coffee!",
        suggestedItems: mockMenuData.pastry,
      };
    }

    if (lowerMessage.includes('popular') || lowerMessage.includes('recommendation') || lowerMessage.includes('best')) {
      return {
        intent: 'recommendation',
        response: "Our most popular items right now are these crowd favorites! ⭐",
        suggestedItems: [
          mockMenuData.iced_coffee[1], // Iced Coffee Karla
          mockMenuData.espresso_based[2], // Coffee Latte
          mockMenuData.pastry[3], // CROFFLE
          mockMenuData.non_coffee[0], // Chocolate
        ],
      };
    }

    if (lowerMessage.includes('chocolate')) {
      return {
        intent: 'item_recommendation',
        response: "I love chocolate too! Here are our chocolate options for you:",
        suggestedItems: [
          mockMenuData.iced_coffee[3], // Iced Coffee Mocha
          mockMenuData.non_coffee[0], // Chocolate
          mockMenuData.non_coffee[2], // Choco Rum
        ],
      };
    }

    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('how much')) {
      return {
        intent: 'price_inquiry',
        response: "Our prices range from IDR 12,000 for a basic espresso to IDR 26,000 for our specialty items. Here are some popular options with their prices:",
        suggestedItems: [
          mockMenuData.espresso_based[0], // Espresso
          mockMenuData.iced_coffee[0], // Iced Coffee Milk Mako
          mockMenuData.pastry[0], // Almond Croissant
        ],
      };
    }

    // Default response
    return {
      intent: 'general',
      response: `I'd be happy to help you with that! You can ask me about:\n\n• "Show me the menu"\n• "I want iced coffee"\n• "What's popular?"\n• "Tell me about pastries"\n• "How much is an espresso?"\n\nOr just tell me what you're in the mood for and I'll make some recommendations! ☕`,
      suggestedItems: [],
    };

  } catch (error) {
    console.error('NLP Backend Error:', error);
    return {
      intent: 'error',
      response: "I'm having trouble processing your request right now. Please try again or browse our menu directly.",
      suggestedItems: [],
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Call the NLP backend
    const nlpResponse = await callNLPBackend(message);

    // TODO: In the future, you might want to:
    // 1. Add user context tracking
    // 2. Implement order state management
    // 3. Connect to your Python backend directly
    // 4. Add multi-language support

    return NextResponse.json(nlpResponse);

  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      {
        error: "Failed to process message",
        response: "I'm experiencing some technical difficulties. Please try again in a moment.",
        suggestedItems: [],
      },
      { status: 500 }
    );
  }
}