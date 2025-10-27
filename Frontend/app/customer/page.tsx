"use client"

import { useState } from "react"
import { BottomNav } from "@/components/bottom-nav"
import { AnimatedBackground } from "@/components/animated-background"
import { Wallet, TrendingUp, Coffee, Award } from "lucide-react"
import Link from "next/link"

export default function CustomerDashboard() {
  const [walletBalance] = useState(125.5)
  const [totalSpent] = useState(487.25)
  const [ordersCount] = useState(24)
  const [loyaltyPoints] = useState(1250)

  return (
    <main className="min-h-screen pb-24">
      <AnimatedBackground />

      <div className="max-w-md mx-auto px-4 pt-6 space-y-6">
        {/* Greeting Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-800">Welcome Back! ☕</h1>
          <p className="text-gray-600">Ready to order your favorite coffee?</p>
        </div>

        {/* Wallet Card */}
        <div className="bg-gradient-to-br from-pink-400 via-pink-300 to-blue-300 rounded-3xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-pink-100 text-sm">Wallet Balance</p>
              <h2 className="text-4xl font-bold">${walletBalance.toFixed(2)}</h2>
            </div>
            <Wallet className="w-12 h-12 opacity-80" />
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-pink-100">Card Number</span>
            <span className="font-mono">•••• •••• •••• 4829</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-all">
            <div className="flex items-center gap-3 mb-2">
              <Coffee className="w-5 h-5 text-pink-500" />
              <p className="text-xs text-gray-600">Total Orders</p>
            </div>
            <p className="text-2xl font-bold text-gray-800">{ordersCount}</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-all">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <p className="text-xs text-gray-600">Total Spent</p>
            </div>
            <p className="text-2xl font-bold text-gray-800">${totalSpent.toFixed(2)}</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-all">
            <div className="flex items-center gap-3 mb-2">
              <Award className="w-5 h-5 text-yellow-500" />
              <p className="text-xs text-gray-600">Loyalty Points</p>
            </div>
            <p className="text-2xl font-bold text-gray-800">{loyaltyPoints}</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-all">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xl">⭐</span>
              <p className="text-xs text-gray-600">Rating</p>
            </div>
            <p className="text-2xl font-bold text-gray-800">4.9</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-3">
          <h3 className="font-bold text-gray-800">Recent Orders</h3>
          <div className="space-y-2">
            {[
              { cafe: "Brew Haven", amount: 12.5, time: "2 hours ago" },
              { cafe: "Espresso Express", amount: 8.75, time: "Yesterday" },
              { cafe: "Cozy Corner", amount: 15.25, time: "2 days ago" },
            ].map((order, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-md hover:shadow-lg transition-all"
              >
                <div>
                  <p className="font-medium text-gray-800">{order.cafe}</p>
                  <p className="text-xs text-gray-500">{order.time}</p>
                </div>
                <p className="font-bold text-pink-500">${order.amount.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <Link href="/customer/cafes">
          <button className="w-full bg-gradient-to-r from-pink-400 to-blue-300 text-white font-bold rounded-2xl p-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
            Order Now ☕
          </button>
        </Link>
      </div>

      <BottomNav userType="customer" />
    </main>
  )
}
