"use client"

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-blue-400 rounded-full animate-rotate-slow" />
        <div className="absolute inset-1 bg-white rounded-full" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-gradient-to-r from-pink-400 to-blue-400 rounded-full animate-scale-pulse" />
        </div>
      </div>
    </div>
  )
}
