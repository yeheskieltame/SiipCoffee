"use client"

import { useState } from "react"
import { ShoppingCart, Plus, Minus, X, User, MapPin, Phone, CreditCard } from "lucide-react"

interface CartItem {
  id: string
  name: string
  price: number
  qty: number
  notes?: string
  emoji?: string
  image_url?: string
}

interface OrderSummaryProps {
  items: CartItem[]
  onUpdateQty: (id: string, qty: number) => void
  onRemove: (id: string) => void
  onCheckout: () => void
}

export function OrderSummary({ items, onUpdateQty, onRemove, onCheckout }: OrderSummaryProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    orderType: "dine_in" as "dine_in" | "take_away" | "delivery",
    tableNumber: "",
    deliveryAddress: "",
    paymentMethod: "crypto" as "crypto" | "cash" | "transfer",
    notes: "",
  })

  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0)

  if (items.length === 0) {
    return null
  }

  const handleCheckout = () => {
    // Validate customer info
    if (!customerInfo.name.trim()) {
      alert("Please enter your name")
      return
    }

    if (customerInfo.orderType === "dine_in" && !customerInfo.tableNumber.trim()) {
      alert("Please enter table number for dine-in")
      return
    }

    if (customerInfo.orderType === "delivery" && !customerInfo.deliveryAddress.trim()) {
      alert("Please enter delivery address")
      return
    }

    // Store customer info in localStorage or pass to parent
    localStorage.setItem("customer_order_info", JSON.stringify(customerInfo))
    onCheckout()
  }

  return (
    <div className="fixed bottom-20 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-pink-100 z-30 shadow-lg">
      <div className="max-w-md mx-auto">
        {/* Collapsed State */}
        {!showDetails && (
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-pink-500" />
                <span className="font-bold text-gray-800">
                  {items.reduce((sum, item) => sum + item.qty, 0)} items
                </span>
                <span className="text-lg font-bold text-pink-500">
                  Rp {total.toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setShowDetails(true)}
                className="text-sm text-pink-500 font-medium hover:text-pink-600"
              >
                View Details
              </button>
            </div>
          </div>
        )}

        {/* Expanded State */}
        {showDetails && (
          <div className="max-h-96 overflow-y-auto">
            {/* Header */}
            <div className="px-4 py-3 border-b border-pink-100 flex items-center justify-between">
              <span className="font-bold text-gray-800">Order Details</span>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-4 py-4 space-y-4">
              {/* Items */}
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 bg-pink-50 rounded-lg p-3">
                    <div className="w-10 h-10 bg-pink-200 rounded-lg flex items-center justify-center">
                      <span className="text-lg">{item.emoji || "☕"}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{item.name}</p>
                      <p className="text-xs text-gray-600">Rp {item.price.toLocaleString()}</p>
                      {item.notes && (
                        <p className="text-xs text-pink-600 mt-1">Note: {item.notes}</p>
                      )}
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
                      <button
                        onClick={() => onRemove(item.id)}
                        className="p-1 hover:bg-red-100 rounded transition-colors ml-2"
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Customer Information */}
              <div className="space-y-3 border-t border-pink-100 pt-3">
                <h3 className="font-medium text-gray-800 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Customer Information
                </h3>

                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Your Name *"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:border-pink-500 focus:outline-none text-sm"
                  />

                  <input
                    type="tel"
                    placeholder="Phone Number (Optional)"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:border-pink-500 focus:outline-none text-sm"
                  />

                  {/* Order Type */}
                  <div className="flex gap-2">
                    {[
                      { value: "dine_in", label: "Dine In", icon: "🍽️" },
                      { value: "take_away", label: "Take Away", icon: "🥡" },
                      { value: "delivery", label: "Delivery", icon: "🚚" }
                    ].map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setCustomerInfo(prev => ({ ...prev, orderType: type.value as any }))}
                        className={`flex-1 py-2 px-3 rounded-lg border text-xs font-medium transition-colors ${
                          customerInfo.orderType === type.value
                            ? "border-pink-500 bg-pink-50 text-pink-700"
                            : "border-pink-200 text-gray-600 hover:border-pink-300"
                        }`}
                      >
                        <span className="mr-1">{type.icon}</span>
                        {type.label}
                      </button>
                    ))}
                  </div>

                  {/* Conditional Fields */}
                  {customerInfo.orderType === "dine_in" && (
                    <input
                      type="text"
                      placeholder="Table Number *"
                      value={customerInfo.tableNumber}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, tableNumber: e.target.value }))}
                      className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:border-pink-500 focus:outline-none text-sm"
                    />
                  )}

                  {customerInfo.orderType === "delivery" && (
                    <input
                      type="text"
                      placeholder="Delivery Address *"
                      value={customerInfo.deliveryAddress}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, deliveryAddress: e.target.value }))}
                      className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:border-pink-500 focus:outline-none text-sm"
                    />
                  )}

                  {/* Notes */}
                  <textarea
                    placeholder="Order Notes (Optional)"
                    value={customerInfo.notes}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, notes: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:border-pink-500 focus:outline-none text-sm resize-none"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-3 border-t border-pink-100 pt-3">
                <h3 className="font-medium text-gray-800 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Payment Method
                </h3>

                <div className="flex gap-2">
                  {[
                    { value: "crypto", label: "Crypto", icon: "₿" },
                    { value: "cash", label: "Cash", icon: "💵" },
                    { value: "transfer", label: "Transfer", icon: "🏦" }
                  ].map((method) => (
                    <button
                      key={method.value}
                      onClick={() => setCustomerInfo(prev => ({ ...prev, paymentMethod: method.value as any }))}
                      className={`flex-1 py-2 px-3 rounded-lg border text-xs font-medium transition-colors ${
                        customerInfo.paymentMethod === method.value
                          ? "border-pink-500 bg-pink-50 text-pink-700"
                          : "border-pink-200 text-gray-600 hover:border-pink-300"
                      }`}
                    >
                      <span className="mr-1">{method.icon}</span>
                      {method.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Total & Checkout */}
              <div className="border-t border-pink-100 pt-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-800">Total</span>
                  <span className="text-xl font-bold text-pink-500">
                    Rp {total.toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full py-3 bg-gradient-to-r from-pink-400 to-pink-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Checkout Order</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}