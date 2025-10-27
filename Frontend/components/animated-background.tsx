"use client"

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-white to-blue-50" />

      {/* Animated blobs */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" />
      <div
        className="absolute top-40 right-20 w-40 h-40 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="absolute -bottom-20 left-1/2 w-48 h-48 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"
        style={{ animationDelay: "4s" }}
      />

      {/* Decorative circles */}
      <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-pink-300 rounded-full opacity-40" />
      <div className="absolute top-1/3 left-1/3 w-1 h-1 bg-blue-300 rounded-full opacity-30" />
      <div className="absolute bottom-1/3 right-1/3 w-3 h-3 bg-pink-200 rounded-full opacity-20" />
    </div>
  )
}
