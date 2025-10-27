"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { AnimatedBackground } from "@/components/animated-background"

export default function LandingPage() {
  const [greeting, setGreeting] = useState("")
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
    const hour = new Date().getHours()
    if (hour < 12) {
      setGreeting("Good Morning! ☀️")
    } else if (hour < 17) {
      setGreeting("Good Afternoon! 🌤️")
    } else {
      setGreeting("Good Evening! 🌙")
    }
  }, [])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 pb-20">
      <AnimatedBackground />

      <div
        className={`text-center space-y-8 transition-all duration-1000 ${isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
      >
        {/* Logo/Title */}
        <div className="space-y-4">
          <div className="inline-block animate-bounce-in">
            <div className="text-6xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
              ☕
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-800">SiipCoffee</h1>
          <p className="text-lg text-gray-600">Best Coffee, Easy Ordering</p>
        </div>

        {/* Greeting */}
        <div className="space-y-2">
          <p className="text-3xl font-bold text-gray-800 animate-slide-up">{greeting}</p>
          <p className="text-gray-600">What would you like to do today?</p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 pt-8">
          <Link href="/login/customer" className="block w-full max-w-xs mx-auto">
            <button
              className="w-full py-4 px-6 bg-gradient-to-r from-pink-400 to-pink-500 text-white font-bold rounded-3xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 animate-slide-up"
              style={{ animationDelay: "0.1s" }}
            >
              <span className="text-lg">👤 As Customer</span>
            </button>
          </Link>

          <Link href="/login/owner" className="block w-full max-w-xs mx-auto">
            <button
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-400 to-blue-500 text-white font-bold rounded-3xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 animate-slide-up"
              style={{ animationDelay: "0.2s" }}
            >
              <span className="text-lg">🏪 As Cafe Owner</span>
            </button>
          </Link>
        </div>

        {/* Decorative elements */}
        <div className="pt-12 space-y-2">
          <div className="flex justify-center gap-4">
            <div className="w-2 h-2 bg-pink-300 rounded-full animate-pulse" />
            <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse" style={{ animationDelay: "0.3s" }} />
            <div className="w-2 h-2 bg-pink-300 rounded-full animate-pulse" style={{ animationDelay: "0.6s" }} />
          </div>
        </div>
      </div>
    </main>
  )
}
