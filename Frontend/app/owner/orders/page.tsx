"use client"

import { BottomNav } from "@/components/bottom-nav"
import { AnimatedBackground } from "@/components/animated-background"
import { CheckCircle, Clock, AlertCircle } from "lucide-react"
import { useState } from "react"
import { PaymentNotification } from "@/components/payment-notification"

interface Order {
  id: string
  customerName: string
  items: Array<{ name: string; qty: number }>
  total: number
  status: "pending" | "preparing" | "ready"
  time: string
}

const MOCK_ORDERS: Order[] = [
  {
    id: "1",
    customerName: "John",
    items: [
      { name: "Cappuccino", qty: 2 },
      { name: "Latte", qty: 1 },
    ],
    total: 11.0,
    status: "preparing",
    time: "10:30",
  },
  {
    id: "2",
    customerName: "Sarah",
    items: [{ name: "Espresso", qty: 1 }],
    total: 2.5,
    status: "ready",
    time: "10:15",
  },
  {
    id: "3",
    customerName: "Mike",
    items: [{ name: "Iced Coffee", qty: 3 }],
    total: 10.5,
    status: "pending",
    time: "10:45",
  },
]

export default function OrdersPage() {
  const [showPaymentNotification, setShowPaymentNotification] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case "preparing":
        return <Clock className="w-5 h-5 text-blue-500" />
      case "ready":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      default:
        return null
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending"
      case "preparing":
        return "Preparing"
      case "ready":
        return "Ready"
      default:
        return ""
    }
  }

  const handlePaymentClick = (order: Order) => {
    setSelectedOrder(order)
    setShowPaymentNotification(true)
  }

  return (
    <main className="min-h-screen pb-24">
      <AnimatedBackground />

      <div className="max-w-md mx-auto px-4 pt-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Incoming Orders</h1>
          <p className="text-gray-600">Manage customer orders</p>
        </div>

        {/* Orders List */}
        <div className="space-y-3">
          {MOCK_ORDERS.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-all cursor-pointer hover:scale-105"
              onClick={() => handlePaymentClick(order)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-800">{order.customerName}</h3>
                  <p className="text-sm text-gray-600">
                    {order.items.map((item) => `${item.qty}x ${item.name}`).join(", ")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(order.status)}
                  <span className="text-xs font-medium text-gray-600">{getStatusLabel(order.status)}</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <p className="font-bold text-pink-500">${order.total.toFixed(2)}</p>
                <p className="text-xs text-gray-500">{order.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showPaymentNotification && selectedOrder && (
        <PaymentNotification
          amount={selectedOrder.total}
          currency="USD"
          items={selectedOrder.items}
          onClose={() => setShowPaymentNotification(false)}
        />
      )}

      <BottomNav userType="owner" />
    </main>
  )
}
