"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ChatMessage } from "@/components/chat-message"
import { AnimatedBackground } from "@/components/animated-background"
import { OrderSummary } from "@/components/order-summary"
import { OrderReceipt } from "@/components/order-receipt"
import { Send, ArrowLeft, Download, Coffee } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

import { chatApi } from "@/lib/api"
import { orderApi } from "@/lib/api"
import { useAuthStore } from "@/lib/store"
import { useChatStore } from "@/lib/store"
import { useCartStore } from "@/lib/store"
import { ChatMessage as ChatMessageType, OrderIntent, MenuItem } from "@/lib/types"

// Default cafe name
const CAFE_NAME = "SiipCoffee"

interface CartItem {
  id: string
  name: string
  price: number
  qty: number
  notes?: string
  image_url?: string
}

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const cafeId = params.cafeId as string

  const { user, isAuthenticated } = useAuthStore()
  const {
    messages,
    sessionId,
    isLoading,
    isConnected,
    setMessages,
    addMessage,
    setSessionId,
    setLoading,
    setConnected,
    clearMessages,
  } = useChatStore()

  const {
    items: cartItems,
    orderType,
    customerName,
    customerPhone,
    tableNumber,
    deliveryAddress,
    notes,
    paymentMethod,
    addItem,
    updateQuantity,
    clearCart,
    setCustomerInfo,
    getTotalPrice,
  } = useCartStore()

  const [inputValue, setInputValue] = useState("")
  const [showReceipt, setShowReceipt] = useState(false)
  const [orderData, setOrderData] = useState<any>(null)
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please login to continue")
      router.push("/login/customer")
      return
    }
  }, [isAuthenticated, router])

  // Initialize chat session
  useEffect(() => {
    if (!isAuthenticated || !user) return

    const newSessionId = `session-${user.id}-${Date.now()}`
    setSessionId(newSessionId)

    // Load chat history
    const loadChatHistory = async () => {
      try {
        const history = await chatApi.getHistory(newSessionId)
        if (history.length > 0) {
          setMessages(history)
        } else {
          // Add welcome message
          const welcomeMessage: ChatMessageType = {
            id: `welcome-${Date.now()}`,
            user_id: user.id,
            session_id: newSessionId,
            message: `Hello! Welcome to ${CAFE_NAME}! ☕ I'm your AI assistant. How can I help you today? You can ask me about our menu, place orders, or get recommendations.`,
            is_ai: true,
            intent: "greeting",
            created_at: new Date().toISOString(),
          }
          addMessage(welcomeMessage)
        }
      } catch (error) {
        console.error("Failed to load chat history:", error)
        // Add welcome message anyway
        const welcomeMessage: ChatMessageType = {
          id: `welcome-${Date.now()}`,
          user_id: user.id,
          session_id: newSessionId,
          message: `Hello! Welcome to ${CAFE_NAME}! ☕ How can I help you today?`,
          is_ai: true,
          intent: "greeting",
          created_at: new Date().toISOString(),
        }
        addMessage(welcomeMessage)
      }
    }

    loadChatHistory()

    return () => {
      if (wsConnection) {
        wsConnection.close()
      }
    }
  }, [isAuthenticated, user])

  // WebSocket connection
  useEffect(() => {
    if (!sessionId || !user) return

    const connectWebSocket = () => {
      try {
        const token = localStorage.getItem('access_token')
        if (!token) return

        const ws = chatApi.connectWebSocket(sessionId, token)
        setWsConnection(ws)

        ws.onopen = () => {
          setConnected(true)
          console.log("WebSocket connected")
        }

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            if (data.success && data.data) {
              const aiMessage: ChatMessageType = {
                id: `ws-${Date.now()}`,
                user_id: user.id,
                session_id: sessionId,
                message: data.data.message,
                is_ai: true,
                intent: data.data.intent,
                created_at: new Date().toISOString(),
              }
              addMessage(aiMessage)

              // Handle order intent
              if (data.data.order_intent) {
                handleOrderIntent(data.data.order_intent)
              }
            }
          } catch (error) {
            console.error("WebSocket message error:", error)
          }
        }

        ws.onclose = () => {
          setConnected(false)
          console.log("WebSocket disconnected")
          // Reconnect after 3 seconds
          setTimeout(connectWebSocket, 3000)
        }

        ws.onerror = (error) => {
          console.error("WebSocket error:", error)
          setConnected(false)
        }
      } catch (error) {
        console.error("Failed to connect WebSocket:", error)
      }
    }

    connectWebSocket()
  }, [sessionId, user])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleOrderIntent = (orderIntent: OrderIntent) => {
    if (orderIntent.action === "create_order" && orderIntent.items) {
      orderIntent.items.forEach(item => {
        const cartItem: CartItem = {
          id: item.menu_id,
          name: item.name,
          price: item.price,
          qty: item.quantity,
          notes: item.notes,
        }
        addItem(cartItem)
      })

      // Set order type if specified
      if (orderIntent.order_type) {
        setCustomerInfo({ orderType: orderIntent.order_type as any })
      }

      toast.success(`Added ${orderIntent.items.length} item(s) to cart`)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || !sessionId || !user) return

    const userMessage: ChatMessageType = {
      id: `user-${Date.now()}`,
      user_id: user.id,
      session_id: sessionId,
      message: inputValue.trim(),
      is_ai: false,
      intent: "user_message",
      created_at: new Date().toISOString(),
    }

    addMessage(userMessage)
    setInputValue("")
    setLoading(true)

    try {
      const response = await chatApi.sendMessage({
        message: inputValue.trim(),
        session_id: sessionId,
      })

      // Add AI response
      const aiMessage: ChatMessageType = {
        id: `ai-${Date.now()}`,
        user_id: user.id,
        session_id: sessionId,
        message: response.message,
        is_ai: true,
        intent: response.intent,
        created_at: new Date().toISOString(),
      }
      addMessage(aiMessage)

      // Handle order intent if present
      if (response.order_intent) {
        handleOrderIntent(response.order_intent)
      }
    } catch (error: any) {
      console.error("Chat error:", error)
      const errorMessage = error.response?.data?.error || error.message || "Failed to send message"
      toast.error(errorMessage)

      // Add error message
      const errorMessageObj: ChatMessageType = {
        id: `error-${Date.now()}`,
        user_id: user.id,
        session_id: sessionId,
        message: "Sorry, I'm having trouble processing your message. Please try again.",
        is_ai: true,
        intent: "error",
        created_at: new Date().toISOString(),
      }
      addMessage(errorMessageObj)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty")
      return
    }

    if (!customerName.trim()) {
      toast.error("Please enter your name")
      return
    }

    try {
      setLoading(true)

      const orderData = {
        items: cartItems.map(item => ({
          menu_id: item.id,
          quantity: item.qty,
          notes: item.notes,
        })),
        order_type: orderType,
        customer_name: customerName,
        customer_phone: customerPhone,
        table_number: orderType === "dine_in" ? tableNumber : undefined,
        delivery_address: orderType === "delivery" ? deliveryAddress : undefined,
        notes: notes,
        payment_method: paymentMethod,
      }

      const order = await orderApi.createOrder(orderData)
      setOrderData(order)
      setShowReceipt(true)
      clearCart()

      toast.success("Order created successfully!")

      // Add order confirmation message
      const confirmationMessage: ChatMessageType = {
        id: `order-${Date.now()}`,
        user_id: user!.id,
        session_id: sessionId!,
        message: `🎉 Great! Your order ${order.order_number} has been created. Total: Rp ${order.total_amount.toLocaleString()}. You can proceed with payment when ready.`,
        is_ai: true,
        intent: "order_confirmation",
        created_at: new Date().toISOString(),
      }
      addMessage(confirmationMessage)

    } catch (error: any) {
      console.error("Checkout error:", error)
      const errorMessage = error.response?.data?.error || error.message || "Failed to create order"
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateQty = (id: string, qty: number) => {
    updateQuantity(id, qty)
  }

  const handleRemove = (id: string) => {
    updateQuantity(id, 0)
  }

  const handleDownloadChat = () => {
    const chatText = messages
      .map(msg => `[${new Date(msg.created_at).toLocaleTimeString()}] ${msg.is_ai ? 'AI' : 'You'}: ${msg.message}`)
      .join('\n\n')

    const blob = new Blob([chatText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chat-${CAFE_NAME}-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Coffee className="w-16 h-16 mx-auto mb-4 text-pink-500 animate-pulse" />
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </main>
    )
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
            <h1 className="font-bold text-gray-800">{CAFE_NAME}</h1>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              {isConnected ? 'Online' : 'Reconnecting...'}
            </p>
          </div>
          <button
            onClick={handleDownloadChat}
            className="p-2 hover:bg-pink-100 rounded-full transition-colors"
            title="Download chat"
          >
            <Download className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 max-w-md mx-auto w-full px-4 py-6 overflow-y-auto">
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg.message}
            isUser={!msg.is_ai}
            timestamp={new Date(msg.created_at).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit"
            })}
          />
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
            placeholder="Ask about menu, place order, or get help..."
            className="flex-1 px-4 py-3 rounded-2xl border-2 border-pink-200 focus:border-pink-500 focus:outline-none transition-colors bg-white/50"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="p-3 bg-gradient-to-r from-pink-400 to-pink-500 text-white rounded-2xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:transform-none"
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
          orderId={orderData.order_number}
          cafeName={CAFE_NAME}
          items={orderData.order_items.map((item: any) => ({
            id: item.menu.id,
            name: item.menu.name,
            price: item.unit_price,
            qty: item.quantity,
            emoji: "☕"
          }))}
          total={orderData.total_amount}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </main>
  )
}