"use client"

import { BottomNav } from "@/components/bottom-nav"
import { AnimatedBackground } from "@/components/animated-background"
import { LogOut, Edit2, Heart, MapPin } from "lucide-react"
import Link from "next/link"

export default function CustomerProfilePage() {
  return (
    <main className="min-h-screen pb-24">
      <AnimatedBackground />

      <div className="max-w-md mx-auto px-4 pt-6 space-y-6">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-pink-400 to-pink-500 rounded-3xl p-6 text-white text-center space-y-3">
          <div className="text-6xl">👤</div>
          <div>
            <h1 className="text-2xl font-bold">Customer Name</h1>
            <p className="text-pink-100">customer@email.com</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4 text-center shadow-md">
            <p className="text-2xl font-bold text-pink-500">12</p>
            <p className="text-xs text-gray-600">Orders</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-md">
            <p className="text-2xl font-bold text-pink-500">8</p>
            <p className="text-xs text-gray-600">Favorites</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-md">
            <p className="text-2xl font-bold text-pink-500">4.8</p>
            <p className="text-xs text-gray-600">Rating</p>
          </div>
        </div>

        {/* Menu */}
        <div className="space-y-2">
          <button className="w-full bg-white rounded-2xl p-4 flex items-center gap-3 shadow-md hover:shadow-lg transition-all">
            <Edit2 className="w-5 h-5 text-pink-500" />
            <span className="font-medium text-gray-800">Edit Profile</span>
          </button>
          <button className="w-full bg-white rounded-2xl p-4 flex items-center gap-3 shadow-md hover:shadow-lg transition-all">
            <Heart className="w-5 h-5 text-pink-500" />
            <span className="font-medium text-gray-800">Favorite Orders</span>
          </button>
          <button className="w-full bg-white rounded-2xl p-4 flex items-center gap-3 shadow-md hover:shadow-lg transition-all">
            <MapPin className="w-5 h-5 text-pink-500" />
            <span className="font-medium text-gray-800">Delivery Address</span>
          </button>
        </div>

        {/* Logout */}
        <Link href="/">
          <button className="w-full bg-gradient-to-r from-red-400 to-red-500 text-white font-bold rounded-2xl p-4 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </Link>
      </div>

      <BottomNav userType="customer" />
    </main>
  )
}
