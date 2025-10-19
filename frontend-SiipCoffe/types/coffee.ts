export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  category?: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

export interface Order {
  id: string;
  items: CartItem[];
  totalPrice: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  createdAt: Date;
  customerInfo?: {
    name?: string;
    phone?: string;
    address?: string;
  };
}