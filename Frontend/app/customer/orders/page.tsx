"use client"

import { useState } from "react"
import { BottomNav } from "@/components/bottom-nav"
import { AnimatedBackground } from "@/components/animated-background"
import { OrderReceipt } from "@/components/order-receipt"
import { Download, Clock } from "lucide-react"

interface Order {
  id: string
  cafeName: string
  items: Array<{ name: string; qty: number; price: number }>
  total: number
  date: string
  status: "completed" | "cancelled"
}

const MOCK_ORDERS: Order[] = [
  {
    id: "ORD-001",
    cafeName: "Brew Haven",
    items: [
      { name: "Cappuccino", qty: 2, price: 3.5 },
      { name: "Croissant", qty: 1, price: 2.5 },
    ],
    total: 9.5,
    date: "Today, 10:30",
    status: "completed",
  },
  {
    id: "ORD-002",
    cafeName: "Cozy Corner",
    items: [{ name: "Latte", qty: 1, price: 4.0 }],
    total: 4.0,
    date: "Yesterday, 14:15",
    status: "completed",
  },
]

export default function OrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  return (
    <main className="min-h-screen pb-24">
      <AnimatedBackground />

      <div className="max-w-md mx-auto px-4 pt-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Order History</h1>
          <p className="text-gray-600">View your previous orders</p>
        </div>

        {/* Orders List */}
        <div className="space-y-3">
          {MOCK_ORDERS.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">{order.cafeName}</h3>
                  <p className="text-sm text-gray-600">{order.items.map((i) => `${i.qty}x ${i.name}`).join(", ")}</p>
                </div>
                <span className="text-lg font-bold text-pink-500">${order.total.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>{order.date}</span>
                </div>
                <button
                  onClick={() => setSelectedOrder(order)}
                  className="flex items-center gap-1 px-3 py-1 bg-pink-100 text-pink-600 rounded-full text-xs font-medium hover:bg-pink-200 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  <span>Receipt</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedOrder && (
        <OrderReceipt
          orderId={selectedOrder.id}
          cafeName={selectedOrder.cafeName}
          items={selectedOrder.items}
          total={selectedOrder.total}
          onClose={() => setSelectedOrder(null)}
        />
      )}

      <BottomNav userType="customer" />
    </main>
  )
}
