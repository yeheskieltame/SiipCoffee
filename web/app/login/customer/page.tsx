"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { AnimatedBackground } from "@/components/animated-background"
import { ArrowLeft } from "lucide-react"
import { authApi } from "@/lib/api"
import { useAuthStore } from "@/lib/store"
import { loginSchema } from "@/lib/auth"

export default function CustomerLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { setAuth, setLoading } = useAuthStore()

  const validateForm = () => {
    try {
      loginSchema.parse({ email, password })
      setErrors({})
      return true
    } catch (err: any) {
      const newErrors: Record<string, string> = {}
      err.errors?.forEach((error: any) => {
        newErrors[error.path[0]] = error.message
      })
      setErrors(newErrors)
      return false
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setLoading(true)

    try {
      const response = await authApi.login({ email, password })

      // Store auth data
      setAuth(response.user, response.token)

      toast.success("Login successful! Welcome back!")
      router.push("/customer/cafes")
    } catch (error: any) {
      console.error("Login error:", error)
      const errorMessage = error.response?.data?.error || error.message || "Login failed"
      toast.error(errorMessage)

      if (error.response?.status === 401) {
        setErrors({ password: "Invalid email or password" })
      }
    } finally {
      setIsLoading(false)
      setLoading(false)
    }
  }

  const handleQuickLogin = (role: string) => {
    // Demo login for testing
    const demoCredentials = {
      customer: { email: "customer@demo.com", password: "password123" },
      owner: { email: "admin@siipcoffe.com", password: "password" }
    }

    const creds = demoCredentials[role as keyof typeof demoCredentials]
    if (creds) {
      setEmail(creds.email)
      setPassword(creds.password)
      // Auto-submit after setting credentials
      setTimeout(() => {
        handleLogin(new Event("submit") as any)
      }, 500)
    }
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
            <h1 className="text-2xl font-bold text-gray-800">Sign In</h1>
            <p className="text-sm text-gray-600">As Customer</p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className={`w-full px-4 py-3 rounded-2xl border-2 transition-colors bg-white/50 backdrop-blur-sm ${
                errors.email
                  ? "border-red-500 focus:border-red-600"
                  : "border-pink-200 focus:border-pink-500"
              } focus:outline-none`}
              required
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={`w-full px-4 py-3 rounded-2xl border-2 transition-colors bg-white/50 backdrop-blur-sm ${
                errors.password
                  ? "border-red-500 focus:border-red-600"
                  : "border-pink-200 focus:border-pink-500"
              } focus:outline-none`}
              required
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-pink-400 to-pink-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:transform-none"
          >
            {isLoading ? "Processing..." : "Sign In"}
          </button>
        </form>

        {/* Quick Login for Demo */}
        <div className="border-t pt-4">
          <p className="text-xs text-gray-500 text-center mb-2">Quick Demo Login</p>
          <div className="flex gap-2">
            <button
              onClick={() => handleQuickLogin("customer")}
              className="flex-1 py-2 bg-gray-100 text-gray-700 text-sm rounded-xl hover:bg-gray-200 transition-colors"
            >
              Demo Customer
            </button>
          </div>
        </div>

        {/* Sign up link */}
        <div className="text-center">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link href="/signup/customer" className="text-pink-500 font-bold hover:underline">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}