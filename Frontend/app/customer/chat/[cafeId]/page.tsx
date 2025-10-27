"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { ChatMessage } from "@/components/chat-message"
import { AnimatedBackground } from "@/components/animated-background"
import { OrderSummary } from "@/components/order-summary"
import { OrderReceipt } from "@/components/order-receipt"
import { Send, ArrowLeft, Download } from "lucide-react"
import Link from "next/link"

const CAFE_NAMES: Record<string, string> = {
  "1": "Brew Haven",
  "2": "Cozy Corner",
  "3": "Espresso Express",
  "4": "Latte Dreams",
}

const MOCK_MENU = {
  "1": [
    { name: "Espresso", price: 2.5, emoji: "☕" },
    { name: "Americano", price: 3.0, emoji: "☕" },
    { name: "Cappuccino", price: 3.5, emoji: "🥛" },
    { name: "Latte", price: 4.0, emoji: "🍶" },
  ],
  "2": [
    { name: "Flat White", price: 3.8, emoji: "☕" },
    { name: "Cortado", price: 3.2, emoji: "☕" },
    { name: "Mocha", price: 4.2, emoji: "🍫" },
  ],
  "3": [
    { name: "Ristretto", price: 2.0, emoji: "☕" },
    { name: "Long Black", price: 2.8, emoji: "☕" },
    { name: "Iced Coffee", price: 3.5, emoji: "🧊" },
  ],
  "4": [
    { name: "Vanilla Latte", price: 4.5, emoji: "🍦" },
    { name: "Caramel Latte", price: 4.8, emoji: "🍮" },
    { name: "Honey Latte", price: 5.0, emoji: "🍯" },
  ],
}

interface CartItem {
  id: string
  name: string
  price: number
  qty: number
  emoji: string
}

export default function ChatPage({ params }: { params: { cafeId: string } }) {
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean; timestamp: string }>>([
    {
      text: `Hello! Welcome to ${CAFE_NAMES[params.cafeId]}. How can I help you today?`,
      isUser: false,
      timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [showReceipt, setShowReceipt] = useState(false)
  const [orderData, setOrderData] = useState<{ id: string; items: CartItem[]; total: number } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    const userMessage = {
      text: inputValue,
      isUser: true,
      timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    }
    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const menu = MOCK_MENU[params.cafeId as keyof typeof MOCK_MENU] || []
      const menuList = menu.map((m) => `${m.emoji} ${m.name} ($${m.price.toFixed(2)})`).join("\n")

      const responses = [
        `Our menu is available:\n${menuList}\n\nWhat would you like to order?`,
        "Got it, I've noted your order. Anything else?",
        "Your order has been added to the cart. Would you like to continue?",
        "Thank you! Your order is ready to be processed. Please checkout to proceed.",
      ]
      const randomResponse = responses[Math.floor(Math.random() * responses.length)]

      // Check if user is ordering
      const userInput = inputValue.toLowerCase()
      if (userInput.includes("order") || userInput.includes("want")) {
        const menuItem = menu.find((m) => userInput.includes(m.name.toLowerCase()))
        if (menuItem) {
          setCartItems((prev) => {
            const existing = prev.find((item) => item.name === menuItem.name)
            if (existing) {
              return prev.map((item) => (item.name === menuItem.name ? { ...item, qty: item.qty + 1 } : item))
            }
            return [
              ...prev,
              {
                id: menuItem.name,
                name: menuItem.name,
                price: menuItem.price,
                qty: 1,
                emoji: menuItem.emoji,
              },
            ]
          })
        }
      }

      const aiMessage = {
        text: randomResponse,
        isUser: false,
        timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      }
      setMessages((prev) => [...prev, aiMessage])
      setIsLoading(false)
    }, 800)
  }

  const handleCheckout = () => {
    const total = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0)
    setOrderData({
      id: `ORD-${Date.now()}`,
      items: cartItems,
      total,
    })
    setShowReceipt(true)
    setCartItems([])
  }

  const handleUpdateQty = (id: string, qty: number) => {
    if (qty === 0) {
      setCartItems(cartItems.filter((item) => item.id !== id))
    } else {
      setCartItems(cartItems.map((item) => (item.id === id ? { ...item, qty } : item)))
    }
  }

  const handleRemove = (id: string) => {
    setCartItems(cartItems.filter((item) => item.id !== id))
  }

  return (
    <main className="min-h-screen pb-24 flex flex-col">
      <AnimatedBackground />

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-pink-100 sticky top-0 z-30">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/customer/cafes">
            <button className="p-2 hover:bg-pink-100 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
          </Link>
          <div className="flex-1">
            <h1 className="font-bold text-gray-800">{CAFE_NAMES[params.cafeId]}</h1>
            <p className="text-xs text-gray-500">Online</p>
          </div>
          <button className="p-2 hover:bg-pink-100 rounded-full transition-colors">
            <Download className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 max-w-md mx-auto w-full px-4 py-6 overflow-y-auto">
        {messages.map((msg, idx) => (
          <ChatMessage key={idx} message={msg.text} isUser={msg.isUser} timestamp={msg.timestamp} />
        ))}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-white border-2 border-pink-100 rounded-3xl rounded-bl-none px-4 py-3">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="fixed bottom-20 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-pink-100">
        <form onSubmit={handleSendMessage} className="max-w-md mx-auto px-4 py-4 flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type message..."
            className="flex-1 px-4 py-3 rounded-2xl border-2 border-pink-200 focus:border-pink-500 focus:outline-none transition-colors bg-white/50"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="p-3 bg-gradient-to-r from-pink-400 to-pink-500 text-white rounded-2xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* Order Summary */}
      <OrderSummary
        items={cartItems}
        onUpdateQty={handleUpdateQty}
        onRemove={handleRemove}
        onCheckout={handleCheckout}
      />

      {/* Receipt Modal */}
      {showReceipt && orderData && (
        <OrderReceipt
          orderId={orderData.id}
          cafeName={CAFE_NAMES[params.cafeId]}
          items={orderData.items}
          total={orderData.total}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </main>
  )
}
