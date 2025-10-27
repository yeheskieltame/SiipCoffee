"use client"

import { BottomNav } from "@/components/bottom-nav"
import { AnimatedBackground } from "@/components/animated-background"
import { Bell, Lock, HelpCircle, LogOut } from "lucide-react"
import Link from "next/link"

export default function OwnerSettingsPage() {
  return (
    <main className="min-h-screen pb-24">
      <AnimatedBackground />

      <div className="max-w-md mx-auto px-4 pt-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
          <p className="text-gray-600">Manage your cafe settings</p>
        </div>

        {/* Settings Menu */}
        <div className="space-y-2">
          <button className="w-full bg-white rounded-2xl p-4 flex items-center gap-3 shadow-md hover:shadow-lg transition-all">
            <Bell className="w-5 h-5 text-blue-500" />
            <span className="font-medium text-gray-800">Notifications</span>
          </button>
          <button className="w-full bg-white rounded-2xl p-4 flex items-center gap-3 shadow-md hover:shadow-lg transition-all">
            <Lock className="w-5 h-5 text-blue-500" />
            <span className="font-medium text-gray-800">Security</span>
          </button>
          <button className="w-full bg-white rounded-2xl p-4 flex items-center gap-3 shadow-md hover:shadow-lg transition-all">
            <HelpCircle className="w-5 h-5 text-blue-500" />
            <span className="font-medium text-gray-800">Help</span>
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

      <BottomNav userType="owner" />
    </main>
  )
}
