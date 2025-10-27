"use client"

import { useEffect, useState } from "react"

interface PaymentNotificationProps {
  amount: number
  currency: "USD" | "ETH"
  items: Array<{ name: string; qty: number }>
  onClose: () => void
}

export function PaymentNotification({ amount, currency, items, onClose }: PaymentNotificationProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    const playNotification = async () => {
      try {
        const itemNames = items.map((item) => `${item.qty}x ${item.name}`).join(", ")
        const currencySymbol = currency === "USD" ? "$" : "Ξ"

        const paymentText = `Payment ${currencySymbol}${amount.toFixed(2)} ${currency} for ${itemNames}.`
        const baseText = `Base untuk semua orang!`

        // Play payment notification in English
        const paymentUtterance = new SpeechSynthesisUtterance(paymentText)
        paymentUtterance.rate = 1
        paymentUtterance.pitch = 1
        paymentUtterance.volume = 1
        paymentUtterance.lang = "en-US"

        setIsPlaying(true)
        window.speechSynthesis.speak(paymentUtterance)

        // Play "Base untuk semua orang" in Indonesian with female voice and excited tone
        paymentUtterance.onend = () => {
          const baseUtterance = new SpeechSynthesisUtterance(baseText)
          baseUtterance.lang = "id-ID" // Indonesian language
          baseUtterance.rate = 1.1 // Slightly faster for excited tone
          baseUtterance.pitch = 1.3 // Higher pitch for female voice
          baseUtterance.volume = 1

          // Get available voices and select female voice if available
          const voices = window.speechSynthesis.getVoices()
          const femaleVoice =
            voices.find((voice) => voice.lang.startsWith("id") && voice.name.toLowerCase().includes("female")) ||
            voices.find((voice) => voice.lang.startsWith("id"))

          if (femaleVoice) {
            baseUtterance.voice = femaleVoice
          }

          window.speechSynthesis.speak(baseUtterance)

          baseUtterance.onend = () => {
            setIsPlaying(false)
            setTimeout(onClose, 500)
          }
        }
      } catch (error) {
        console.error("Error playing notification:", error)
        onClose()
      }
    }

    playNotification()
  }, [amount, currency, items, onClose])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-3xl p-8 max-w-sm mx-4 text-center space-y-4 animate-bounce-in">
        <div className="text-5xl animate-scale-pulse">💰</div>
        <h2 className="text-2xl font-bold text-gray-800">Payment Received!</h2>
        <div className="space-y-2">
          <p className="text-lg font-bold text-pink-500">
            {currency === "USD" ? "$" : "Ξ"}
            {amount.toFixed(2)} {currency}
          </p>
          <p className="text-sm text-gray-600">{items.map((item) => `${item.qty}x ${item.name}`).join(", ")}</p>
          <p className="text-xl font-bold text-blue-500 animate-pulse">Base untuk semua orang! 🚀</p>
        </div>
        {isPlaying && (
          <div className="flex justify-center gap-1">
            <div className="w-1 h-6 bg-pink-400 rounded-full animate-pulse" />
            <div className="w-1 h-6 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
            <div className="w-1 h-6 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }} />
          </div>
        )}
      </div>
    </div>
  )
}
