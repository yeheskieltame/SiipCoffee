"use client"

import { useState } from "react"
import { BottomNav } from "@/components/bottom-nav"
import { CafeCard } from "@/components/cafe-card"
import { AnimatedBackground } from "@/components/animated-background"
import { Search } from "lucide-react"

const MOCK_CAFES = [
  {
    id: "1",
    name: "Brew Haven",
    image: "☕",
    rating: 4.8,
    distance: "0.5 km",
    description: "Premium coffee with cozy atmosphere and free WiFi",
  },
  {
    id: "2",
    name: "Cozy Corner",
    image: "🏠",
    rating: 4.6,
    distance: "1.2 km",
    description: "Warm place to relax and work",
  },
  {
    id: "3",
    name: "Espresso Express",
    image: "⚡",
    rating: 4.9,
    distance: "0.8 km",
    description: "Fast coffee service with best quality",
  },
  {
    id: "4",
    name: "Latte Dreams",
    image: "✨",
    rating: 4.7,
    distance: "1.5 km",
    description: "Special latte drinks with beautiful decoration",
  },
]

export default function CafesPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredCafes = MOCK_CAFES.filter((cafe) => cafe.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <main className="min-h-screen pb-24">
      <AnimatedBackground />

      <div className="max-w-md mx-auto px-4 pt-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-800">Find Cafes</h1>
          <p className="text-gray-600">Choose your favorite cafe and start ordering</p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search cafes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-pink-200 focus:border-pink-500 focus:outline-none transition-colors bg-white/50 backdrop-blur-sm"
          />
        </div>

        {/* Cafes Grid */}
        <div className="grid grid-cols-1 gap-4">
          {filteredCafes.map((cafe) => (
            <CafeCard key={cafe.id} {...cafe} />
          ))}
        </div>
      </div>

      <BottomNav userType="customer" />
    </main>
  )
}
