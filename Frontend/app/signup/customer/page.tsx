"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { AnimatedBackground } from "@/components/animated-background"
import { ArrowLeft } from "lucide-react"

export default function CustomerSignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!")
      return
    }
    setIsLoading(true)
    setTimeout(() => {
      window.location.href = "/customer/cafes"
    }, 1000)
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 pb-20">
      <AnimatedBackground />

      <div className="w-full max-w-sm space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/">
            <button className="p-2 hover:bg-pink-100 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Sign Up</h1>
            <p className="text-sm text-gray-600">As Customer</p>
          </div>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Your Name"
              className="w-full px-4 py-3 rounded-2xl border-2 border-pink-200 focus:border-pink-500 focus:outline-none transition-colors bg-white/50 backdrop-blur-sm"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="you@email.com"
              className="w-full px-4 py-3 rounded-2xl border-2 border-pink-200 focus:border-pink-500 focus:outline-none transition-colors bg-white/50 backdrop-blur-sm"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-2xl border-2 border-pink-200 focus:border-pink-500 focus:outline-none transition-colors bg-white/50 backdrop-blur-sm"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-2xl border-2 border-pink-200 focus:border-pink-500 focus:outline-none transition-colors bg-white/50 backdrop-blur-sm"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-pink-400 to-pink-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50"
          >
            {isLoading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        {/* Login link */}
        <div className="text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link href="/login/customer" className="text-pink-500 font-bold hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
