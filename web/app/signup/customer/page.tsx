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
import { registerSchema } from "@/lib/auth"

export default function CustomerSignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { setAuth, setLoading } = useAuthStore()

  const validateForm = () => {
    try {
      registerSchema.parse({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        address: formData.address,
      })
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    // Check password confirmation
    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" })
      return
    }

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setLoading(true)

    try {
      const response = await authApi.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        address: formData.address,
        role: "customer",
      })

      // Store auth data
      setAuth(response.user, response.token)

      toast.success("Account created successfully! Welcome to SiipCoffee!")
      router.push("/customer/cafes")
    } catch (error: any) {
      console.error("Signup error:", error)
      const errorMessage = error.response?.data?.error || error.message || "Signup failed"
      toast.error(errorMessage)

      if (error.response?.status === 409) {
        setErrors({ email: "An account with this email already exists" })
      }
    } finally {
      setIsLoading(false)
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
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
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Your Name"
              className={`w-full px-4 py-3 rounded-2xl border-2 transition-colors bg-white/50 backdrop-blur-sm ${
                errors.name
                  ? "border-red-500 focus:border-red-600"
                  : "border-pink-200 focus:border-pink-500"
              } focus:outline-none`}
              required
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
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
            <label className="block text-sm font-medium text-gray-700">Phone (Optional)</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="+62 812-3456-7890"
              className={`w-full px-4 py-3 rounded-2xl border-2 transition-colors bg-white/50 backdrop-blur-sm ${
                errors.phone
                  ? "border-red-500 focus:border-red-600"
                  : "border-pink-200 focus:border-pink-500"
              } focus:outline-none`}
            />
            {errors.phone && (
              <p className="text-red-500 text-sm">{errors.phone}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Address (Optional)</label>
            <textarea
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder="Your address"
              rows={2}
              className={`w-full px-4 py-3 rounded-2xl border-2 transition-colors bg-white/50 backdrop-blur-sm ${
                errors.address
                  ? "border-red-500 focus:border-red-600"
                  : "border-pink-200 focus:border-pink-500"
              } focus:outline-none resize-none`}
            />
            {errors.address && (
              <p className="text-red-500 text-sm">{errors.address}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
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

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
              placeholder="••••••••"
              className={`w-full px-4 py-3 rounded-2xl border-2 transition-colors bg-white/50 backdrop-blur-sm ${
                errors.confirmPassword
                  ? "border-red-500 focus:border-red-600"
                  : "border-pink-200 focus:border-pink-500"
              } focus:outline-none`}
              required
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-pink-400 to-pink-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:transform-none"
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