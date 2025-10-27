"use client"
import { ShoppingCart, Plus, Minus, X } from "lucide-react"

interface CartItem {
  id: string
  name: string
  price: number
  qty: number
  emoji: string
}

interface OrderSummaryProps {
  items: CartItem[]
  onUpdateQty: (id: string, qty: number) => void
  onRemove: (id: string) => void
  onCheckout: () => void
}

export function OrderSummary({ items, onUpdateQty, onRemove, onCheckout }: OrderSummaryProps) {
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0)

  if (items.length === 0) {
    return null
  }

  return (
    <div className="fixed bottom-20 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-pink-100 z-30">
      <div className="max-w-md mx-auto px-4 py-4 space-y-3">
        {/* Items */}
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between bg-pink-50 rounded-lg p-2">
              <div className="flex items-center gap-2 flex-1">
                <span className="text-lg">{item.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{item.name}</p>
                  <p className="text-xs text-gray-600">${item.price.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onUpdateQty(item.id, Math.max(0, item.qty - 1))}
                  className="p-1 hover:bg-pink-200 rounded transition-colors"
                >
                  <Minus className="w-4 h-4 text-pink-600" />
                </button>
                <span className="w-6 text-center text-sm font-bold">{item.qty}</span>
                <button
                  onClick={() => onUpdateQty(item.id, item.qty + 1)}
                  className="p-1 hover:bg-pink-200 rounded transition-colors"
                >
                  <Plus className="w-4 h-4 text-pink-600" />
                </button>
                <button onClick={() => onRemove(item.id)} className="p-1 hover:bg-red-100 rounded transition-colors">
                  <X className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Total & Checkout */}
        <div className="border-t border-pink-100 pt-3 space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-bold text-gray-800">Total</span>
            <span className="text-xl font-bold text-pink-500">${total.toFixed(2)}</span>
          </div>
          <button
            onClick={onCheckout}
            className="w-full py-3 bg-gradient-to-r from-pink-400 to-pink-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Order Now</span>
          </button>
        </div>
      </div>
    </div>
  )
}
