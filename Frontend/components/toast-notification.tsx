"use client"

import { X } from "lucide-react"
import { useState, useEffect } from "react"

interface ToastNotificationProps {
  message: string
  type?: "success" | "error" | "info"
  duration?: number
  onClose?: () => void
}

export function ToastNotification({ message, type = "info", duration = 3000, onClose }: ToastNotificationProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      onClose?.()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!isVisible) return null

  const bgColor = {
    success: "bg-gradient-to-r from-green-400 to-green-500",
    error: "bg-gradient-to-r from-red-400 to-red-500",
    info: "bg-gradient-to-r from-blue-400 to-blue-500",
  }

  return (
    <div
      className={`fixed bottom-24 left-4 right-4 max-w-md mx-auto ${bgColor[type]} text-white rounded-2xl p-4 shadow-lg animate-slide-up z-50 flex items-center justify-between`}
    >
      <p className="font-medium">{message}</p>
      <button onClick={() => setIsVisible(false)} className="p-1 hover:bg-white/20 rounded-full transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
