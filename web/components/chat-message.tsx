"use client"

interface ChatMessageProps {
  message: string
  isUser: boolean
  timestamp?: string
}

export function ChatMessage({ message, isUser, timestamp }: ChatMessageProps) {
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4 animate-slide-up`}>
      <div
        className={`max-w-xs px-4 py-3 rounded-3xl ${
          isUser
            ? "bg-gradient-to-r from-pink-400 to-pink-500 text-white rounded-br-none"
            : "bg-white text-gray-800 border-2 border-pink-100 rounded-bl-none"
        }`}
      >
        <p className="text-sm">{message}</p>
        {timestamp && <p className={`text-xs mt-1 ${isUser ? "text-pink-100" : "text-gray-500"}`}>{timestamp}</p>}
      </div>
    </div>
  )
}
