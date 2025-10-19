// Chat interface now handles all ordering through the backend
// These types are kept for compatibility with backend responses

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  category?: string;
}

export interface Order {
  id: string;
  totalPrice: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  createdAt: Date;
  customerInfo?: {
    name?: string;
    phone?: string;
    address?: string;
  };
}