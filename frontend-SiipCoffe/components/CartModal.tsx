"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CartItem } from "@/types/coffee";
import { ShoppingCart, Plus, Minus, X } from "lucide-react";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  totalPrice: number;
  onCheckout: () => void;
}

export default function CartModal({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  totalPrice,
  onCheckout,
}: CartModalProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto rounded-2xl">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-xl font-bold text-amber-900 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-amber-700" />
            Your Cart
            {getTotalItems() > 0 && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-700 ml-2">
                {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'}
              </Badge>
            )}
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-amber-50"
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <div className="flex flex-col max-h-[60vh]">
          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Your cart is empty</h3>
              <p className="text-gray-600 text-sm">Add some delicious items to get started!</p>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 text-sm">{item.name}</h4>
                        <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                        <p className="text-amber-700 font-bold text-sm mt-2">{formatPrice(item.price)}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="h-8 w-8 p-0 border-amber-200 hover:bg-amber-100"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="font-medium text-amber-900 min-w-[24px] text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="h-8 w-8 p-0 border-amber-200 hover:bg-amber-100"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-amber-900">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="bg-amber-200" />

              {/* Order Summary */}
              <div className="space-y-3 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Subtotal ({getTotalItems()} items)</span>
                  <span className="font-medium text-gray-800">{formatPrice(totalPrice)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tax (10%)</span>
                  <span className="font-medium text-gray-800">{formatPrice(totalPrice * 0.1)}</span>
                </div>

                <Separator className="bg-amber-200" />

                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-amber-900">Total</span>
                  <span className="text-xl font-bold text-amber-900">
                    {formatPrice(totalPrice * 1.1)}
                  </span>
                </div>

                <Button
                  onClick={onCheckout}
                  className="w-full bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-700 hover:to-amber-900 text-white font-semibold py-3 rounded-xl mt-4"
                  size="lg"
                >
                  Proceed to Checkout
                </Button>

                <Button
                  variant="outline"
                  onClick={onClose}
                  className="w-full border-amber-200 hover:bg-amber-50 text-amber-700"
                >
                  Continue Shopping
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}