"use client"

import { Trash2, Edit2 } from "lucide-react"

interface MenuItemCardProps {
  id: string
  name: string
  price: number
  description: string
  emoji: string
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export function MenuItemCard({ id, name, price, description, emoji, onEdit, onDelete }: MenuItemCardProps) {
  return (
    <div className="bg-white rounded-3xl p-4 shadow-md hover:shadow-lg transition-all duration-300 animate-slide-up">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-3xl">{emoji}</span>
            <div>
              <h3 className="font-bold text-gray-800">{name}</h3>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
          </div>
          <p className="text-lg font-bold text-pink-500">${price.toFixed(2)}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onEdit(id)} className="p-2 hover:bg-blue-100 rounded-full transition-colors">
            <Edit2 className="w-5 h-5 text-blue-500" />
          </button>
          <button onClick={() => onDelete(id)} className="p-2 hover:bg-red-100 rounded-full transition-colors">
            <Trash2 className="w-5 h-5 text-red-500" />
          </button>
        </div>
      </div>
    </div>
  )
}
