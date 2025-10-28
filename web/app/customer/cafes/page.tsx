"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BottomNav } from "@/components/bottom-nav"
import { CafeCard } from "@/components/cafe-card"
import { AnimatedBackground } from "@/components/animated-background"
import { Search, Coffee, MessageCircle, Star, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { useAuthStore } from "@/lib/store"
import { cafeApi } from "@/lib/api"

interface Cafe {
  id: string
  name: string
  description: string
  logo_url?: string
  cover_image_url?: string
  address: string
  city: string
  phone?: string
  email?: string
  rating_average: number
  rating_count: number
  is_open: boolean
  business_hours?: string
  features?: string
  delivery_fee?: number
  min_order_amount?: number
  owner?: {
    name: string
    email: string
  }
}

export default function CafesPage() {
  const router = useRouter()
  const { user, isAuthenticated, checkAuth } = useAuthStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [cafes, setCafes] = useState<Cafe[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check authentication
    if (!checkAuth()) {
      toast.error("Please login to continue")
      router.push("/login/customer")
      return
    }

    // Fetch cafes from API
    fetchCafes()
  }, [checkAuth, router])

  const fetchCafes = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await cafeApi.getAll({ limit: 10 })
      setCafes(response.cafes || [])
    } catch (error: any) {
      console.error("Failed to fetch cafes:", error)
      setError(error.message || "Failed to load cafes")
      toast.error("Failed to load cafes")
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartOrdering = (cafeId: string) => {
    router.push(`/customer/chat/${cafeId}`)
  }

  const handleQuickFeatures = (feature: string, cafeId?: string) => {
    switch (feature) {
      case "chat":
        if (cafeId) router.push(`/customer/chat/${cafeId}`)
        break
      case "menu":
        if (cafeId) router.push(`/customer/chat/${cafeId}`)
        break
      case "orders":
        router.push("/customer/orders")
        break
      default:
        if (cafeId) router.push(`/customer/chat/${cafeId}`)
    }
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Coffee className="w-16 h-16 mx-auto mb-4 text-pink-500 animate-pulse" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </main>
    )
  }

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 mx-auto mb-4 text-pink-500 animate-spin" />
          <p className="text-gray-600">Loading cafes...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <Coffee className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchCafes}
            className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
          >
            Try Again
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen pb-24">
      <AnimatedBackground />

      <div className="max-w-md mx-auto px-4 pt-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Welcome, {user?.name}! ☕</h1>
              <p className="text-gray-600">Start your coffee journey with AI assistant</p>
            </div>
            <div className="bg-pink-100 px-3 py-1 rounded-full">
              <span className="text-sm font-medium text-pink-700">Online</span>
            </div>
          </div>
        </div>

  
        {/* Cafes List */}
        {cafes.length > 0 ? (
          <div className="space-y-4">
            {cafes.map((cafe) => (
              <div key={cafe.id} className="bg-white/90 backdrop-blur-md border-2 border-pink-200 rounded-3xl p-6 shadow-lg">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                      {cafe.logo_url ? (
                        <img src={cafe.logo_url} alt={cafe.name} className="w-full h-full object-cover rounded-2xl" />
                      ) : (
                        "☕"
                      )}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-800">{cafe.name}</h2>
                      <p className="text-sm text-gray-600">{cafe.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{cafe.address}, {cafe.city}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          cafe.is_open
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {cafe.is_open ? '🟢 Open Now' : '🔴 Closed'}
                        </span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span className="text-xs text-gray-600">
                            {cafe.rating_average.toFixed(1)} ({cafe.rating_count})
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Features */}
                {cafe.features && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-700">✨ Features:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {cafe.features.split(',').slice(0, 4).map((feature, index) => (
                        <div key={index} className="bg-pink-50 rounded-lg p-2 text-center">
                          <span className="text-xs text-pink-700 font-medium">🤖 {feature.trim()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-6 space-y-3">
                  <button
                    onClick={() => handleStartOrdering(cafe.id)}
                    disabled={!cafe.is_open}
                    className="w-full py-3 bg-gradient-to-r from-pink-400 to-pink-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:transform-none"
                  >
                    <MessageCircle className="w-5 h-5" />
                    {cafe.is_open ? 'Start AI Ordering' : 'Currently Closed'}
                  </button>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleQuickFeatures("chat", cafe.id)}
                      className="py-2 bg-white border border-pink-200 rounded-xl text-xs font-medium text-pink-600 hover:bg-pink-50 transition-colors"
                    >
                      💬 Chat
                    </button>
                    <button
                      onClick={() => handleQuickFeatures("menu", cafe.id)}
                      className="py-2 bg-white border border-pink-200 rounded-xl text-xs font-medium text-pink-600 hover:bg-pink-50 transition-colors"
                    >
                      📋 Menu
                    </button>
                    <button
                      onClick={() => handleQuickFeatures("orders")}
                      className="py-2 bg-white border border-pink-200 rounded-xl text-xs font-medium text-pink-600 hover:bg-pink-50 transition-colors"
                    >
                      📦 Orders
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm border border-pink-100 rounded-2xl p-8 text-center">
            <Coffee className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Cafes Available</h3>
            <p className="text-gray-600">There are currently no cafes available. Please check back later!</p>
          </div>
        )}

        {/* How It Works */}
        <div className="bg-white/80 backdrop-blur-sm border border-pink-100 rounded-2xl p-4">
          <h3 className="font-bold text-gray-800 mb-3">🚀 How It Works</h3>
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-pink-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
              <div>
                <p className="text-sm font-medium text-gray-800">Chat with AI Assistant</p>
                <p className="text-xs text-gray-600">Tell our AI what you'd like to order</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-pink-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
              <div>
                <p className="text-sm font-medium text-gray-800">AI Processes Your Order</p>
                <p className="text-xs text-gray-600">Get recommendations and instant confirmation</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-pink-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
              <div>
                <p className="text-sm font-medium text-gray-800">Pay with Crypto</p>
                <p className="text-xs text-gray-600">Fast, secure cryptocurrency payments</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-pink-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">4</div>
              <div>
                <p className="text-sm font-medium text-gray-800">Enjoy Your Coffee! ☕</p>
                <p className="text-xs text-gray-600">Track your order in real-time</p>
              </div>
            </div>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl p-4 text-center">
          <Coffee className="w-8 h-8 mx-auto mb-2 text-pink-600" />
          <p className="text-sm font-medium text-gray-800">
            Ready for your perfect coffee experience?
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Our AI assistant is waiting to serve you! 🤖✨
          </p>
        </div>
      </div>

      <BottomNav userType="customer" />
    </main>
  )
}