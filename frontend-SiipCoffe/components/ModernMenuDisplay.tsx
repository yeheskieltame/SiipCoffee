"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, Plus, Minus, ShoppingCart, Coffee, Heart } from "lucide-react";
import { MenuItem, CartItem } from "@/types/coffee";
import { cn } from "@/lib/utils";

interface ModernMenuDisplayProps {
  onAddToCart: (item: MenuItem, quantity: number) => void;
  cartItems: CartItem[];
}

const CATEGORIES = [
  { id: "iced_coffee", name: "Iced Coffee", icon: "🧊", color: "bg-blue-100 text-blue-700" },
  { id: "espresso_based", name: "Espresso", icon: "☕", color: "bg-amber-100 text-amber-700" },
  { id: "non_coffee", name: "Non Coffee", icon: "🥤", color: "bg-pink-100 text-pink-700" },
  { id: "refreshment", name: "Refreshments", icon: "🍹", color: "bg-green-100 text-green-700" },
  { id: "pastry", name: "Pastries", icon: "🥐", color: "bg-orange-100 text-orange-700" },
  { id: "others", name: "Others", icon: "☕", color: "bg-purple-100 text-purple-700" },
];

export default function ModernMenuDisplay({ onAddToCart, cartItems }: ModernMenuDisplayProps) {
  const [menuData, setMenuData] = useState<Record<string, MenuItem[]>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("iced_coffee");
  const [loading, setLoading] = useState(true);
  const [favoriteItems, setFavoriteItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchMenuData();
  }, []);

  const fetchMenuData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/menu");
      if (!response.ok) {
        throw new Error("Failed to fetch menu");
      }
      const data = await response.json();
      setMenuData(data);
    } catch (err) {
      console.error("Error fetching menu:", err);
      // Fallback to mock data
      const mockData = {
        iced_coffee: [
          { id: "C001", name: "Iced Coffee Milk Mako", price: 18000, description: "Espresso. Condensed. Milk. Palm Sugar." },
          { id: "C002", name: "Iced Coffee Karla", price: 20000, description: "Espresso. Condensed. Milk. Caramel Syrup." },
          { id: "C003", name: "Iced Coffee Rum Cookies", price: 22000, description: "Espresso. Condensed. Milk. Rum Syrup. Cookies. Ice Cream" },
          { id: "C004", name: "Iced Coffee Mocha", price: 20000, description: "Espresso. Condensed. Milk. Chocolate." },
          { id: "C005", name: "Iced Coffee Coco", price: 20000, description: "Espresso. Coconut Water." },
          { id: "C006", name: "Sweet Pandan Iced Coffee", price: 20000, description: "Espresso. Condensed. Milk. Pandan Syrup." },
          { id: "C007", name: "Coconut Milk Coffee", price: 20000, description: "Coconut Milk Coffee." },
          { id: "C008", name: "Matcha Presso", price: 25000, description: "The savory taste of matcha latte mixed with the deliciousness of double espresso." },
        ],
        espresso_based: [
          { id: "E001", name: "Espresso", price: 12000, description: "Pure espresso shot." },
          { id: "E002", name: "Iced Americano", price: 12000, description: "Iced Americano." },
          { id: "E003", name: "Coffee Latte", price: 18000, description: "Hot / ice, sweet / plain." },
          { id: "E004", name: "Cappuccino", price: 18000, description: "Coffee + Milk." },
        ],
        non_coffee: [
          { id: "N001", name: "Chocolate", price: 20000, description: "Hot / ice chocolate." },
          { id: "N002", name: "Matcha Latte", price: 20000, description: "From premium matcha powder." },
          { id: "N003", name: "Choco Rum", price: 22000, description: "Chocolate + Vanilla Ice Cream + Cookies." },
        ],
        refreshment: [
          { id: "R001", name: "Americano Fantasy", price: 18000, description: "Sparkling Coffee Based." },
          { id: "R002", name: "Red Berry", price: 18000, description: "Sparkling Coffee Based." },
          { id: "R003", name: "Oranje", price: 18000, description: "Sparkling Coffee Based." },
          { id: "R004", name: "Aromatic Tea", price: 18000, description: "Sparkling Tea Based. Berry." },
          { id: "R005", name: "Teagsm", price: 18000, description: "Sparkling Tea Based. Apple + Lemon" },
        ],
        pastry: [
          { id: "P001", name: "Almond Croissant", price: 20500, description: "Croissant with Almonds. We heat this item first." },
          { id: "P002", name: "Original Croissant", price: 14000, description: "Original Croissant. We heat this item first." },
          { id: "P003", name: "Pain Au Chocolat", price: 16000, description: "Pain Au Chocolat. We heat this item first." },
          { id: "P004", name: "CROFFLE", price: 26000, description: "SALTED CARAMEL / DOUBLE CHOCOLATE." },
        ],
        others: [
          { id: "O001", name: "Manual Brew", price: 18000, description: "Choose beans (Gayo)." },
          { id: "O002", name: "Vietnamese Coffee", price: 15000, description: "Vietnamese Coffee." },
        ],
      };
      setMenuData(mockData);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getQuantityInCart = (itemId: string) => {
    const item = cartItems.find(cartItem => cartItem.id === itemId);
    return item ? item.quantity : 0;
  };

  const toggleFavorite = (itemId: string) => {
    setFavoriteItems(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(itemId)) {
        newFavorites.delete(itemId);
      } else {
        newFavorites.add(itemId);
      }
      return newFavorites;
    });
  };

  const filteredItems = (category: string) => {
    const items = menuData[category] || [];
    if (!searchQuery) return items;

    return items.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const allItems = Object.values(menuData).flat();
  const searchResults = searchQuery ? allItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-amber-700">Loading delicious menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-amber-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-amber-800 rounded-lg flex items-center justify-center">
                <Coffee className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-amber-900">SiipCoffe Menu</h1>
                <p className="text-sm text-amber-600">Premium coffee & pastries</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search menu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 border-amber-200 focus:border-amber-400 focus:ring-amber-200"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {searchQuery ? (
          // Search Results
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-amber-900">
              Search Results ({searchResults.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((item) => {
                const quantityInCart = getQuantityInCart(item.id);
                const isFavorite = favoriteItems.has(item.id);

                return (
                  <Card key={item.id} className="group hover:shadow-lg transition-all duration-200 border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-semibold text-gray-800 group-hover:text-amber-700 transition-colors">
                            {item.name}
                          </CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleFavorite(item.id)}
                            className="p-1 h-8 w-8 hover:bg-amber-50"
                          >
                            <Heart className={cn(
                              "w-4 h-4 transition-colors",
                              isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"
                            )} />
                          </Button>
                          <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                            {formatPrice(item.price)}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {item.description}
                      </p>

                      <div className="flex items-center justify-between">
                        {quantityInCart > 0 ? (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onAddToCart(item, -1)}
                              className="h-8 w-8 p-0 border-amber-200 hover:bg-amber-50"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="font-medium text-amber-700 min-w-[20px] text-center">
                              {quantityInCart}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onAddToCart(item, 1)}
                              className="h-8 w-8 p-0 border-amber-200 hover:bg-amber-50"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            onClick={() => onAddToCart(item, 1)}
                            className="bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-700 hover:to-amber-900 text-white"
                            size="sm"
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Add to Cart
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ) : (
          // Category Tabs
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-6">
            <TabsList className="grid grid-cols-3 md:grid-cols-6 gap-2 bg-white/80 backdrop-blur-sm p-1 rounded-xl border border-amber-100">
              {CATEGORIES.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className={cn(
                    "flex flex-col items-center gap-1 py-3 px-2 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-amber-800 data-[state=active]:text-white",
                    "hover:bg-amber-50 text-xs font-medium"
                  )}
                >
                  <span className="text-lg">{category.icon}</span>
                  <span>{category.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {CATEGORIES.map((category) => (
              <TabsContent key={category.id} value={category.id} className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category.icon}</span>
                    <div>
                      <h2 className="text-2xl font-bold text-amber-900">{category.name}</h2>
                      <p className="text-sm text-amber-600">
                        {filteredItems(category.id).length} items available
                      </p>
                    </div>
                  </div>
                  <Badge className={cn("text-sm", category.color)}>
                    Popular
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredItems(category.id).map((item) => {
                    const quantityInCart = getQuantityInCart(item.id);
                    const isFavorite = favoriteItems.has(item.id);

                    return (
                      <Card key={item.id} className="group hover:shadow-lg transition-all duration-200 border-0 bg-white/80 backdrop-blur-sm">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <CardTitle className="text-lg font-semibold text-gray-800 group-hover:text-amber-700 transition-colors">
                                {item.name}
                              </CardTitle>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleFavorite(item.id)}
                                className="p-1 h-8 w-8 hover:bg-amber-50"
                              >
                                <Heart className={cn(
                                  "w-4 h-4 transition-colors",
                                  isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"
                                )} />
                              </Button>
                              <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                                {formatPrice(item.price)}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {item.description}
                          </p>

                          <div className="flex items-center justify-between">
                            {quantityInCart > 0 ? (
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onAddToCart(item, -1)}
                                  className="h-8 w-8 p-0 border-amber-200 hover:bg-amber-50"
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                                <span className="font-medium text-amber-700 min-w-[20px] text-center">
                                  {quantityInCart}
                                </span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onAddToCart(item, 1)}
                                  className="h-8 w-8 p-0 border-amber-200 hover:bg-amber-50"
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                onClick={() => onAddToCart(item, 1)}
                                className="bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-700 hover:to-amber-900 text-white"
                                size="sm"
                              >
                                <ShoppingCart className="w-4 h-4 mr-2" />
                                Add to Cart
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {filteredItems(category.id).length === 0 && (
                  <div className="text-center py-12">
                    <Coffee className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No items found in this category.</p>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </div>
  );
}