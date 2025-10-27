"use client"

import type React from "react"

import { useState } from "react"
import { BottomNav } from "@/components/bottom-nav"
import { MenuItemCard } from "@/components/menu-item-card"
import { AnimatedBackground } from "@/components/animated-background"
import { Plus, X } from "lucide-react"

interface MenuItem {
  id: string
  name: string
  price: number
  description: string
  emoji: string
}

const INITIAL_MENU: MenuItem[] = [
  {
    id: "1",
    name: "Espresso",
    price: 2.5,
    description: "Strong black coffee",
    emoji: "☕",
  },
  {
    id: "2",
    name: "Cappuccino",
    price: 3.5,
    description: "Coffee with milk and foam",
    emoji: "🥛",
  },
  {
    id: "3",
    name: "Latte",
    price: 4.0,
    description: "Coffee with lots of milk",
    emoji: "🍶",
  },
]

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    emoji: "☕",
  })

  const handleAddItem = () => {
    setEditingId(null)
    setFormData({ name: "", price: "", description: "", emoji: "☕" })
    setShowModal(true)
  }

  const handleEditItem = (id: string) => {
    const item = menuItems.find((m) => m.id === id)
    if (item) {
      setEditingId(id)
      setFormData({
        name: item.name,
        price: item.price.toString(),
        description: item.description,
        emoji: item.emoji,
      })
      setShowModal(true)
    }
  }

  const handleDeleteItem = (id: string) => {
    setMenuItems(menuItems.filter((m) => m.id !== id))
  }

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.price) return

    if (editingId) {
      setMenuItems(
        menuItems.map((m) =>
          m.id === editingId
            ? {
                ...m,
                name: formData.name,
                price: Number.parseFloat(formData.price),
                description: formData.description,
                emoji: formData.emoji,
              }
            : m,
        ),
      )
    } else {
      setMenuItems([
        ...menuItems,
        {
          id: Date.now().toString(),
          name: formData.name,
          price: Number.parseFloat(formData.price),
          description: formData.description,
          emoji: formData.emoji,
        },
      ])
    }
    setShowModal(false)
  }

  return (
    <main className="min-h-screen pb-24">
      <AnimatedBackground />

      <div className="max-w-md mx-auto px-4 pt-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Cafe Menu</h1>
            <p className="text-gray-600">Total: {menuItems.length} items</p>
          </div>
          <button
            onClick={handleAddItem}
            className="p-3 bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 animate-pulse-glow"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>

        {/* Menu Items */}
        <div className="space-y-3">
          {menuItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No menu items yet</p>
              <p className="text-gray-400 text-sm">Add your first menu item</p>
            </div>
          ) : (
            menuItems.map((item, idx) => (
              <div key={item.id} className="animate-slide-up" style={{ animationDelay: `${idx * 0.05}s` }}>
                <MenuItemCard {...item} onEdit={handleEditItem} onDelete={handleDeleteItem} />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50 animate-fade-in">
          <div className="w-full bg-white rounded-t-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">{editingId ? "Edit Menu Item" : "Add Menu Item"}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Emoji</label>
                <div className="flex gap-2 flex-wrap">
                  {["☕", "🥛", "🍶", "🧋", "🍵", "🧃", "🥤", "🍹", "🍫", "🍦", "🍮", "🍯"].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setFormData({ ...formData, emoji })}
                      className={`text-3xl p-2 rounded-lg transition-all ${
                        formData.emoji === emoji ? "bg-blue-200 scale-110 animate-bounce-in" : "hover:bg-gray-100"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Menu Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Example: Cappuccino"
                  className="w-full px-4 py-3 rounded-2xl border-2 border-blue-200 focus:border-blue-500 focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="Example: 3.50"
                  className="w-full px-4 py-3 rounded-2xl border-2 border-blue-200 focus:border-blue-500 focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Example: Coffee with milk and foam"
                  className="w-full px-4 py-3 rounded-2xl border-2 border-blue-200 focus:border-blue-500 focus:outline-none transition-colors resize-none"
                  rows={3}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-400 to-blue-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                {editingId ? "Save Changes" : "Add Menu Item"}
              </button>
            </form>
          </div>
        </div>
      )}

      <BottomNav userType="owner" />
    </main>
  )
}
