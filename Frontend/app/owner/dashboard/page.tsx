"use client"

import { BottomNav } from "@/components/bottom-nav"
import { AnimatedBackground } from "@/components/animated-background"
import { TrendingUp, Users, ShoppingBag, DollarSign } from "lucide-react"

export default function OwnerDashboardPage() {
  const stats = [
    { label: "Today's Sales", value: "$125.50", icon: DollarSign, color: "from-pink-400 to-pink-500" },
    { label: "Today's Orders", value: "24", icon: ShoppingBag, color: "from-blue-400 to-blue-500" },
    { label: "New Customers", value: "8", icon: Users, color: "from-purple-400 to-purple-500" },
    { label: "Rating", value: "4.8", icon: TrendingUp, color: "from-yellow-400 to-yellow-500" },
  ]

  return (
    <main className="min-h-screen pb-24">
      <AnimatedBackground />

      <div className="max-w-md mx-auto px-4 pt-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600">Your cafe performance summary</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <div
                key={idx}
                className={`bg-gradient-to-br ${stat.color} rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 animate-slide-up`}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-2">
                  <Icon className="w-5 h-5 opacity-80" />
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs opacity-90">{stat.label}</p>
              </div>
            )
          })}
        </div>

        {/* Recent Orders */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-800">Recent Orders</h2>
          {[
            { name: "John", items: "2x Cappuccino", time: "10:30", status: "Ready" },
            { name: "Sarah", items: "1x Latte", time: "10:45", status: "Preparing" },
            { name: "Mike", items: "3x Espresso", time: "11:00", status: "Pending" },
          ].map((order, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-3 shadow-md hover:shadow-lg transition-all animate-slide-up"
              style={{ animationDelay: `${(idx + 4) * 0.1}s` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-800">{order.name}</p>
                  <p className="text-sm text-gray-600">{order.items}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">{order.time}</p>
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded-full">
                    {order.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav userType="owner" />
    </main>
  )
}
