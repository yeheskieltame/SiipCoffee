"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, MessageCircle, Settings, BarChart3 } from "lucide-react"

interface BottomNavProps {
  userType?: "customer" | "owner"
}

export function BottomNav({ userType = "customer" }: BottomNavProps) {
  const pathname = usePathname()

  const customerLinks = [
    { href: "/customer", label: "Home", icon: Home },
    { href: "/customer/cafes", label: "Chat", icon: MessageCircle },
    { href: "/customer/orders", label: "Orders", icon: BarChart3 },
    { href: "/customer/profile", label: "Profile", icon: Settings },
  ]

  const ownerLinks = [
    { href: "/owner/dashboard", label: "Dashboard", icon: BarChart3 },
    { href: "/owner/menu", label: "Menu", icon: Home },
    { href: "/owner/orders", label: "Orders", icon: MessageCircle },
    { href: "/owner/settings", label: "Settings", icon: Settings },
  ]

  const links = userType === "owner" ? ownerLinks : customerLinks

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-pink-100 z-40">
      <div className="max-w-md mx-auto px-2 py-3 flex justify-around items-center">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href || pathname.startsWith(link.href + "/")
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all duration-300 ${
                isActive
                  ? "bg-gradient-to-r from-pink-400 to-blue-300 text-white scale-110 shadow-lg"
                  : "text-gray-600 hover:text-pink-500 hover:bg-pink-50"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "animate-bounce-in" : ""}`} />
              <span className="text-xs font-medium">{link.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
