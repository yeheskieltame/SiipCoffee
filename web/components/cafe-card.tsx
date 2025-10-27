"use client"

import Link from "next/link"
import { Star, MapPin } from "lucide-react"

interface CafeCardProps {
  id: string
  name: string
  image: string
  rating: number
  distance: string
  description: string
}

export function CafeCard({ id, name, image, rating, distance, description }: CafeCardProps) {
  return (
    <Link href={`/customer/chat/${id}`}>
      <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer animate-slide-up">
        {/* Image */}
        <div className="relative h-40 bg-gradient-to-br from-pink-200 to-blue-200 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center text-5xl">{image}</div>
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-bold text-gray-800">{rating}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-2">
          <h3 className="text-lg font-bold text-gray-800">{name}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <MapPin className="w-4 h-4" />
            <span>{distance}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
