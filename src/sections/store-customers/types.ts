export type CustomerSegment = 'VIP Gold' | 'Régulier' | 'Nouveau client' | 'Comptes en attente';

export interface CustomerOrderItem {
  name: string;
  variant: string;
  quantity: number;
  price: number;
  /** Empty when the backend does not expose a photo for the item. */
  image: string;
  /** Storefront product slug, used to link the item to its storefront page. Absent on mock data. */
  slug?: string;
  warranty?: string;
  batteryHealth?: string;
}

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  /** ISO timestamp, used to group recent orders. Absent on mock data. */
  createdAt?: string;
  date: string;
  time: string;
  store: string;
  items: CustomerOrderItem[];
  totalAmount: number;
  taxIncludedPercent: number;
  deliveryStatus: string;
  paymentMethod: string;
  /** Extra detail surfaced in the order details modal. */
  updatedAt?: string;
  estimatedDeliveryAt?: string;
  /** Settlement detail, only available from the single-order endpoint. */
  payment?: {
    transactionId?: string;
    amount?: number;
    status?: string;
    method?: string;
    paidAt?: string;
    taxedAmount?: number;
  };
  shippingAddress?: {
    fullName?: string;
    phone?: string;
    street?: string;
    city?: string;
    state?: string;
    country?: string;
  };
}

export interface CustomerAddress {
  label?: string;
  fullName?: string;
  street?: string;
  suite?: string;
  city?: string;
  state?: string;
  country?: string;
  phone?: string;
  what3words?: string;
  isDefault?: boolean;
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
  /** Orders placed in the last 7 days. Absent on mock data. */
  lastSevenDaysOrdersCount?: number;
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
  addresses: CustomerAddress[];
  orders: CustomerOrder[];
}
