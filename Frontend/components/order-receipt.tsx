"use client"

import { Download, Share2, X } from "lucide-react"

interface OrderReceiptProps {
  orderId: string
  cafeName: string
  items: Array<{ name: string; qty: number; price: number }>
  total: number
  onClose: () => void
}

export function OrderReceipt({ orderId, cafeName, items, total, onClose }: OrderReceiptProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Order Receipt</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Receipt Content */}
        <div className="bg-gradient-to-br from-pink-50 to-blue-50 rounded-2xl p-4 space-y-3 border-2 border-pink-100">
          <div className="text-center space-y-1">
            <p className="text-sm text-gray-600">Order from</p>
            <h3 className="text-lg font-bold text-gray-800">{cafeName}</h3>
            <p className="text-xs text-gray-500">ID: {orderId}</p>
          </div>

          <div className="border-t-2 border-dashed border-pink-200 pt-3 space-y-2">
            {items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-gray-700">
                  {item.qty}x {item.name}
                </span>
                <span className="font-medium text-gray-800">${(item.price * item.qty).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t-2 border-dashed border-pink-200 pt-3 flex justify-between">
            <span className="font-bold text-gray-800">Total</span>
            <span className="font-bold text-pink-500 text-lg">${total.toFixed(2)}</span>
          </div>

          <div className="text-center text-xs text-gray-600 pt-2">
            <p>Thank you for your order!</p>
            <p>Your order will be ready in 15 minutes</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button className="flex-1 py-3 bg-gradient-to-r from-pink-400 to-pink-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:shadow-lg transition-all">
            <Download className="w-5 h-5" />
            <span>Download</span>
          </button>
          <button className="flex-1 py-3 bg-gradient-to-r from-blue-400 to-blue-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:shadow-lg transition-all">
            <Share2 className="w-5 h-5" />
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  )
}
