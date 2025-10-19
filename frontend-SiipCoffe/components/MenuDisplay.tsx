"use client";
import { useState, useEffect } from "react";
import styles from "./MenuDisplay.module.css";
import { MenuItem, CartItem } from "@/types/coffee";

const CATEGORIES = [
  { id: "iced_coffee", name: "Iced Coffee", icon: "🧊" },
  { id: "espresso_based", name: "Espresso Based", icon: "☕" },
  { id: "non_coffee", name: "Non Coffee", icon: "🥤" },
  { id: "refreshment", name: "Refreshments", icon: "🍹" },
  { id: "pastry", name: "Pastries", icon: "🥐" },
  { id: "others", name: "Others", icon: "☕" },
];

interface MenuDisplayProps {
  onAddToCart: (item: MenuItem, quantity: number) => void;
  cartItems: CartItem[];
}

export default function MenuDisplay({ onAddToCart, cartItems }: MenuDisplayProps) {
  const [menuData, setMenuData] = useState<Record<string, MenuItem[]>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>("iced_coffee");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMenuData();
  }, []);

  const fetchMenuData = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call to backend
      // For now, using the mock data from backend
      const response = await fetch("/api/menu");
      if (!response.ok) {
        throw new Error("Failed to fetch menu");
      }
      const data = await response.json();
      setMenuData(data);
    } catch (err) {
      console.error("Error fetching menu:", err);
      // Fallback: use mock data
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
          { id: "E001", name: "Espresso", price: 12000, description: "Espresso." },
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

  const currentItems = menuData[selectedCategory] || [];

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading menu...</p>
      </div>
    );
  }

  return (
    <div className={styles.menuContainer}>
      {/* Category Tabs */}
      <div className={styles.categoryTabs}>
        <div className={styles.tabsContainer}>
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              className={`${styles.categoryTab} ${
                selectedCategory === category.id ? styles.active : ""
              }`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <span className={styles.categoryIcon}>{category.icon}</span>
              <span className={styles.categoryName}>{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className={styles.menuGrid}>
        {currentItems.map((item) => {
          const quantityInCart = getQuantityInCart(item.id);
          return (
            <div key={item.id} className={styles.menuItem}>
              <div className={styles.itemContent}>
                <div className={styles.itemHeader}>
                  <h3 className={styles.itemName}>{item.name}</h3>
                  <div className={styles.itemPrice}>{formatPrice(item.price)}</div>
                </div>
                <p className={styles.itemDescription}>{item.description}</p>
              </div>

              <div className={styles.itemActions}>
                {quantityInCart > 0 ? (
                  <div className={styles.quantityControls}>
                    <button
                      className={styles.quantityButton}
                      onClick={() => onAddToCart(item, -1)}
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className={styles.quantity}>{quantityInCart}</span>
                    <button
                      className={styles.quantityButton}
                      onClick={() => onAddToCart(item, 1)}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <button
                    className={styles.addButton}
                    onClick={() => onAddToCart(item, 1)}
                  >
                    Add to Cart
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {currentItems.length === 0 && (
        <div className={styles.emptyState}>
          <p>No items available in this category.</p>
        </div>
      )}
    </div>
  );
}