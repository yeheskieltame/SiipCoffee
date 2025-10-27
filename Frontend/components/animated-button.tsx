"use client"

import type React from "react"

interface AnimatedButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: "primary" | "secondary" | "danger"
  size?: "sm" | "md" | "lg"
  disabled?: boolean
  className?: string
}

export function AnimatedButton({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
}: AnimatedButtonProps) {
  const baseStyles =
    "font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50"

  const variantStyles = {
    primary: "bg-gradient-to-r from-pink-400 to-pink-500 text-white",
    secondary: "bg-gradient-to-r from-blue-400 to-blue-500 text-white",
    danger: "bg-gradient-to-r from-red-400 to-red-500 text-white",
  }

  const sizeStyles = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-3 text-base",
    lg: "px-6 py-4 text-lg",
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </button>
  )
}
