export type CustomerSegment = 'VIP Gold' | 'Régulier' | 'Nouveau client' | 'Comptes en attente';

export interface CustomerOrderItem {
  name: string;
  variant: string;
  quantity: number;
  price: number;
  image: string;
  warranty?: string;
  batteryHealth?: string;
}

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  date: string;
  time: string;
  store: string;
  items: CustomerOrderItem[];
  totalAmount: number;
  taxIncludedPercent: number;
  deliveryStatus: string;
  paymentMethod: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarInitials: string;
  segment: CustomerSegment;
  isVerified: boolean;
  location: {
    city: string;
    district: string;
    address: string;
  };
  ordersCount: number;
  lastActivity: string;
  ltv: number;
  lastOrderAmount: number;
  preferredPayment: string;
  memberSince: string;
  deliveryAddress: {
    residence: string;
    district: string;
    city: string;
    preferredTimeSlot: string;
    assignedCarrier: string;
  };
  crmNotes: string;
  loyaltyPoints: number;
  orders: CustomerOrder[];
}
