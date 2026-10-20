export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: string;
  title: string;
  subtitle: string;
  sku: string;
  price: number;
  quantity: number;
  image: string;
  imageAlt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerTier: string;
  itemCount: number;
  shippingMethod: string;
  totalAmount: number;
  subtotal: number;
  tax: number;
  shippingCost: number;
  status: OrderStatus;
  dateStr: string;
  timestamp: string;
  slaRemaining?: string;
  paymentMethod: string;
  trackingNumber?: string;
  carrier?: string;
  warehouseHub: string;
  items: OrderItem[];
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone: string;
    avsVerified: boolean;
  };
  notes: {
    author: string;
    timestamp: string;
    text: string;
  }[];
  steps: {
    title: string;
    time: string;
    status: 'completed' | 'in_progress' | 'pending';
  }[];
}
