import { NextRequest, NextResponse } from "next/server";

// TODO: Replace this with actual backend API call
// For now, using mock data that matches the backend structure
const mockMenuData = {
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

export async function GET(request: NextRequest) {
  try {
    // TODO: In the future, this should fetch from your Python backend
    // For now, returning mock data

    // Example of how you might fetch from backend:
    // const backendResponse = await fetch(`${process.env.BACKEND_URL}/api/menu`);
    // const data = await backendResponse.json();
    // return NextResponse.json(data);

    return NextResponse.json(mockMenuData);
  } catch (error) {
    console.error("Error fetching menu:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu data" },
      { status: 500 }
    );
  }
}