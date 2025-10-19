"use client";
import { useEffect, useState } from "react";
import { Wallet } from "@coinbase/onchainkit/wallet";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import HeroSection from "@/components/HeroSection";
import ModernMenuDisplay from "@/components/ModernMenuDisplay";
import ChatInterface from "@/components/ChatInterface";
import CartModal from "@/components/CartModal";
import { MenuItem, CartItem } from "@/types/coffee";
import { Button } from "@/components/ui/button";
import { Coffee, MessageCircle, Home as HomeIcon, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

type PageType = "home" | "menu" | "chat";

export default function Home() {
  const { setMiniAppReady, isMiniAppReady } = useMiniKit();
  const [currentPage, setCurrentPage] = useState<PageType>("home");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    if (!isMiniAppReady) {
      setMiniAppReady();
    }
  }, [setMiniAppReady, isMiniAppReady]);

  const addToCart = (item: MenuItem, quantity: number = 1) => {
    setCartItems(prev => {
      const existingItem = prev.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity }];
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity === 0) {
      setCartItems(prev => prev.filter(item => item.id !== id));
    } else {
      setCartItems(prev =>
        prev.map(item =>
          item.id === id ? { ...item, quantity } : item
        )
      );
    }
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "home":
        return <HeroSection />;
      case "menu":
        return <ModernMenuDisplay onAddToCart={addToCart} cartItems={cartItems} />;
      case "chat":
        return <ChatInterface onAddToCart={addToCart} />;
      default:
        return <HeroSection />;
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50">
      {/* Top Navigation */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-amber-100">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-600 to-amber-800 rounded-lg flex items-center justify-center">
              <Coffee className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-amber-900">SiipCoffe</h1>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCartOpen(true)}
              className="relative hover:bg-amber-50"
            >
              <ShoppingCart className="w-5 h-5" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {getTotalItems()}
                </span>
              )}
            </Button>
            <Wallet />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="pt-14">
        {renderCurrentPage()}
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-sm border-t border-amber-100">
        <div className="grid grid-cols-3 gap-1">
          <Button
            variant={currentPage === "home" ? "default" : "ghost"}
            onClick={() => setCurrentPage("home")}
            className={cn(
              "flex flex-col items-center gap-1 py-3 rounded-none border-none",
              currentPage === "home"
                ? "bg-gradient-to-r from-amber-600 to-amber-800 text-white"
                : "hover:bg-amber-50 text-amber-700"
            )}
          >
            <HomeIcon className="w-5 h-5" />
            <span className="text-xs font-medium">Home</span>
          </Button>

          <Button
            variant={currentPage === "menu" ? "default" : "ghost"}
            onClick={() => setCurrentPage("menu")}
            className={cn(
              "flex flex-col items-center gap-1 py-3 rounded-none border-none",
              currentPage === "menu"
                ? "bg-gradient-to-r from-amber-600 to-amber-800 text-white"
                : "hover:bg-amber-50 text-amber-700"
            )}
          >
            <Coffee className="w-5 h-5" />
            <span className="text-xs font-medium">Menu</span>
          </Button>

          <Button
            variant={currentPage === "chat" ? "default" : "ghost"}
            onClick={() => setCurrentPage("chat")}
            className={cn(
              "flex flex-col items-center gap-1 py-3 rounded-none border-none",
              currentPage === "chat"
                ? "bg-gradient-to-r from-amber-600 to-amber-800 text-white"
                : "hover:bg-amber-50 text-amber-700"
            )}
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-xs font-medium">Chat</span>
          </Button>
        </div>

        {/* Cart Summary */}
        {cartItems.length > 0 && (
          <div className="px-4 py-2 bg-amber-50 border-t border-amber-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-amber-700">
                {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'}
              </span>
              <span className="font-bold text-amber-900">
                {formatPrice(getTotalPrice())}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Cart Modal */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={updateQuantity}
        totalPrice={getTotalPrice()}
        onCheckout={() => {
          // TODO: Implement checkout
          console.log("Checkout clicked");
        }}
      />
    </div>
  );
}