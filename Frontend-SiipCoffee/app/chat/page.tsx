"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { MultiStepLoader } from "@/components/ui/multi-step-loader";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { ThemeToggle } from "@/components/theme-toggle";
import { apiService, ChatResponse, MenuItem } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  intent?: string;
  suggestedItems?: MenuItem[];
  menuData?: any;
}

const loadingStates = [
  { text: "Understanding your order..." },
  { text: "Checking menu availability..." },
  { text: "Processing your request..." },
  { text: "Almost ready..." },
];

const techPlaceholders = [
  "What would you like to order today?",
  "Try our AI-powered recommendations...",
  "Ask about our smart ordering system!",
  "Customize your perfect experience...",
  "Need tech-enabled assistance?",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Generate unique user ID for this session
    const newUserId = "web_user_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
    setUserId(newUserId);

    // Send welcome message
    const welcomeMessage: Message = {
      id: "welcome",
      text: "🤖 Welcome to SiipCoffee! I'm your AI-powered ordering assistant. How can I help you today? You can ask about our menu, place an order, or get intelligent recommendations!",
      sender: "bot",
      timestamp: new Date(),
      intent: "greeting"
    };
    setMessages([welcomeMessage]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue("");
    setIsLoading(true);

    try {
      const response: ChatResponse = await apiService.chat({
        message: currentInput,
        user_id: userId
      });

      // Parse JSON response if it's a receipt
      let parsedMenuData = response.menu_data;
      let actualText = response.response || "No response message";

      try {
        // Check if response.response is a JSON string with receipt data
        const parsedResponse = JSON.parse(response.response);
        if (parsedResponse.receipt) {
          parsedMenuData = parsedResponse;
          actualText = parsedResponse.receipt.message || response.response || "Order completed!";
        }
      } catch (parseError) {
        // If parsing fails, use original response
        console.log("Response is not JSON, using as-is");
      }

      // Ensure actualText is a valid string
      if (!actualText || typeof actualText !== 'string') {
        actualText = "Order completed!";
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: actualText,
        sender: "bot",
        timestamp: new Date(),
        intent: response.intent,
        suggestedItems: response.suggested_items || [],
        menuData: parsedMenuData
      };

      // Debug logging
      console.log("Chat Response:", {
        intent: response.intent,
        hasReceipt: !!parsedMenuData?.receipt,
        text: (actualText || "").substring(0, 50) + "..."
      });

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat API Error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble connecting to our coffee service right now. Please try again in a moment.",
        sender: "bot",
        timestamp: new Date(),
        intent: "error"
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const formatMessage = (text: string, intent?: string, menuData?: any) => {
    // Handle undefined text
    if (!text || typeof text !== 'string') {
      return <p className="text-sm text-muted-foreground">Message loading...</p>;
    }

    // Handle professional receipt display
    if (menuData && menuData.receipt && (intent === "order_complete" || intent === "complete_order" || text.includes("Order completed!"))) {
      const receipt = menuData.receipt;
      return (
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-2 border-slate-200 dark:border-slate-600 rounded-xl p-6 shadow-lg relative overflow-hidden">
          {/* SiipCoffee Header */}
          <div className="text-center mb-6 relative">
            <div className="absolute inset-0 bg-tech-gradient opacity-5"></div>
            <div className="relative">
              <div className="text-3xl mb-2">☕</div>
              <h3 className="text-2xl font-bold text-tech-gradient">SiipCoffee</h3>
              <p className="text-sm text-muted-foreground mt-1">AI-Powered Coffee Experience</p>
            </div>
          </div>

          {/* Order Receipt Content */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 mb-4 shadow-sm">
            <div className="border-b-2 border-dashed border-slate-300 dark:border-slate-600 pb-3 mb-3">
              <div className="text-center">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Official Receipt</p>
                <p className="text-xs text-muted-foreground mt-1">Order #{receipt.order_id}</p>
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Order Details:</h4>
              <div className="space-y-1">
                {receipt.items.map((item: string, index: number) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="text-slate-600 dark:text-slate-400">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total and Payment */}
            <div className="border-t border-slate-200 dark:border-slate-600 pt-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Payment Method:</span>
                <span className="text-sm font-medium">{receipt.payment_method}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-base font-bold text-slate-700 dark:text-slate-300">Total:</span>
                <span className="text-xl font-bold text-tech-gradient">
                  Rp {receipt.total_price.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>

          {/* Timestamp */}
          <div className="text-center text-xs text-muted-foreground mb-4">
            <p>{receipt.timestamp}</p>
          </div>

          {/* SiipCoffee Stamp */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-2 border-tech-500 flex items-center justify-center transform rotate-12 opacity-80">
                <div className="text-center">
                  <div className="text-xs font-bold text-tech-600 dark:text-tech-400">PAID</div>
                  <div className="text-xs font-bold text-tech-600 dark:text-tech-400 mt-1">✓</div>
                </div>
              </div>
              <div className="absolute inset-0 w-20 h-20 rounded-full border-2 border-tech-500 transform rotate-12 opacity-40"></div>
            </div>
          </div>

          {/* Thank You Message */}
          <div className="text-center mt-4">
            <p className="text-xs text-muted-foreground italic">Thank you for your order!</p>
          </div>
        </div>
      );
    }

    // Handle markdown-like formatting for order receipts
    if (text.includes("📋") && text.includes("ORDER RECEIPT")) {
      return (
        <div className="bg-tech-50 dark:bg-tech-900/20 border border-tech-200 rounded-lg p-4">
          <pre className="whitespace-pre-wrap text-sm font-mono text-tech-800 dark:text-tech-200">
            {text}
          </pre>
        </div>
      );
    }

    // Handle order summary
    if (text.includes("order summary:") || text.includes("Total: $") || text.includes("Order completed!")) {
      return (
        <div className="bg-tech-50 dark:bg-tech-900/20 border border-tech-200 rounded-lg p-4">
          <div className="text-sm text-tech-800 dark:text-tech-200 whitespace-pre-line">
            {text}
          </div>
        </div>
      );
    }

    // Display menu data if available
    if (menuData && intent === "view_menu") {
      return (
        <div>
          <div className="mb-3 text-sm text-tech-800 dark:text-tech-200 whitespace-pre-line">
            {text}
          </div>
          {Object.entries(menuData).map(([category, items]: [string, any]) => {
            // Ensure items is an array before mapping
            const itemsArray = Array.isArray(items) ? items : [];

            if (itemsArray.length === 0) {
              return null;
            }

            return (
              <div key={category} className="mb-4">
                <h4 className="font-semibold text-tech-700 dark:text-tech-300 mb-2 capitalize">
                  {category}
                </h4>
                <div className="grid gap-2">
                  {itemsArray.map((item: any, index: number) => (
                    <div key={index} className="text-sm bg-muted p-2 rounded border border-border">
                      <span className="font-medium">{item.name || item}</span>
                      <span className="text-muted-foreground ml-2">
                        {item.price ? `$${item.price}` : ''}
                      </span>
                      {item.description && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {item.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    // Regular message formatting
    return text.split('\n').map((line, index) => (
      <p key={index} className="mb-2 last:mb-0">
        {line}
      </p>
    ));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* MultiStepLoader */}
      <MultiStepLoader
        loadingStates={loadingStates}
        loading={isLoading}
        duration={2000}
      />

      {/* Header */}
      <header className="bg-background/80 backdrop-blur-lg border-b border-border px-4 py-4 glass">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl">🤖</span>
              <span className="text-xl font-bold text-tech-gradient">SiipCoffee</span>
            </Link>
            <div className="hidden sm:block text-sm text-muted-foreground">
              AI Ordering Assistant
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <Link href="/">
              <HoverBorderGradient
                containerClassName="rounded-full"
                as="button"
                className="text-sm px-4 py-2"
              >
                Back to Home
              </HoverBorderGradient>
            </Link>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <main className="flex-1 overflow-hidden">
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.sender === "user"
                        ? "bg-tech-gradient text-white"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {formatMessage(message.text, message.intent, message.menuData)}

                    {/* Show suggested items if available */}
                    {message.suggestedItems && message.suggestedItems.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-sm font-medium">You might like:</p>
                        <div className="flex flex-wrap gap-2">
                          {message.suggestedItems.map((item, index) => (
                            <button
                              key={index}
                              onClick={() => setInputValue(typeof item === 'string' ? item : item.name)}
                              className="bg-tech-100 dark:bg-tech-800 text-tech-700 dark:text-tech-300 px-3 py-1 rounded-full text-sm hover:bg-tech-200 dark:hover:bg-tech-700 transition-colors"
                            >
                              {typeof item === 'string' ? item : item.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="text-xs opacity-70 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Loading indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-muted rounded-2xl px-4 py-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-tech-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-tech-600 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-2 h-2 bg-tech-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-border px-4 py-4 bg-background/80 backdrop-blur-lg glass">
            <div className="max-w-4xl mx-auto">
              <PlaceholdersAndVanishInput
                placeholders={techPlaceholders}
                onChange={handleInputChange}
                onSubmit={handleSubmit}
              />
            </div>

            {/* Quick Actions */}
            <div className="max-w-4xl mx-auto mt-4">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setInputValue("show me the menu")}
                  className="px-3 py-1 text-sm bg-tech-100 text-tech-700 dark:bg-tech-800 dark:text-tech-300 rounded-full hover:bg-tech-200 dark:hover:bg-tech-700 transition-colors"
                  disabled={isLoading}
                >
                  📋 Show Menu
                </button>
                <button
                  onClick={() => setInputValue("what do you recommend?")}
                  className="px-3 py-1 text-sm bg-tech-100 text-tech-700 dark:bg-tech-800 dark:text-tech-300 rounded-full hover:bg-tech-200 dark:hover:bg-tech-700 transition-colors"
                  disabled={isLoading}
                >
                  ⭐ AI Recommendations
                </button>
                <button
                  onClick={() => setInputValue("I'd like an espresso")}
                  className="px-3 py-1 text-sm bg-tech-100 text-tech-700 dark:bg-tech-800 dark:text-tech-300 rounded-full hover:bg-tech-200 dark:hover:bg-tech-700 transition-colors"
                  disabled={isLoading}
                >
                  ☕ Quick Order: Espresso
                </button>
                <button
                  onClick={() => setInputValue("I'd like a cappuccino")}
                  className="px-3 py-1 text-sm bg-tech-100 text-tech-700 dark:bg-tech-800 dark:text-tech-300 rounded-full hover:bg-tech-200 dark:hover:bg-tech-700 transition-colors"
                  disabled={isLoading}
                >
                  ☕ Quick Order: Cappuccino
                </button>
                <button
                  onClick={() => setInputValue("done")}
                  className="px-3 py-1 text-sm bg-tech-600 text-white rounded-full hover:bg-tech-700 transition-colors"
                  disabled={isLoading}
                >
                  ✅ Complete Order
                </button>
                <button
                  onClick={() => setInputValue("dine in")}
                  className="px-3 py-1 text-sm bg-tech-500 text-white rounded-full hover:bg-tech-600 transition-colors"
                  disabled={isLoading}
                >
                  🍽️ Dine In
                </button>
                <button
                  onClick={() => setInputValue("take away")}
                  className="px-3 py-1 text-sm bg-tech-500 text-white rounded-full hover:bg-tech-600 transition-colors"
                  disabled={isLoading}
                >
                  🥤 Take Away
                </button>
                <button
                  onClick={() => setInputValue("e-wallet")}
                  className="px-3 py-1 text-sm bg-tech-500 text-white rounded-full hover:bg-tech-600 transition-colors"
                  disabled={isLoading}
                >
                  💳 E-Wallet
                </button>
                <button
                  onClick={() => setInputValue("cash")}
                  className="px-3 py-1 text-sm bg-tech-500 text-white rounded-full hover:bg-tech-600 transition-colors"
                  disabled={isLoading}
                >
                  💵 Cash
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}