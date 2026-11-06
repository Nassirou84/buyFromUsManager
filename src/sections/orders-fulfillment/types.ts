export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

/** The backend lifecycle statuses (Order::STATUS_*), used as the order list filter tabs. */
export type RawOrderStatus =
  | 'placed'
  | 'processed'
  | 'in_transit'
  | 'arrived_in_facility'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

/** Admin order KPI summary (GET /admin/orders-summary). All values are counts. */
export interface OrderSummary {
  /** Orders placed yesterday. */
  yesterdayOrders: number;
  /** Orders placed the day before yesterday, for the day-over-day trend. */
  dayBeforeYesterdayOrders: number;
  /** Priority orders still awaiting fulfillment. */
  priorityOrdersAwaiting: number;
  /** Orders currently in transit. */
  ordersInTransit: number;
  /** Orders awaiting delivery. */
  ordersAwaitingDelivery: number;
  /** Lifetime order count (all statuses). */
  lifetimeOrders: number;
  /** Lifetime delivered order count. */
  lifetimeDeliveredOrders: number;
  /** Orders delivered yesterday. */
  yesterdayDeliveredOrders: number;
  /** Newly placed orders awaiting processing, shown as the sidebar badge. */
  newPlacedOrders: number;
}

export interface OrderItem {
  id: string;
  title: string;
  subtitle: string;
  sku: string;
  price: number;
  quantity: number;
  image: string;
  imageAlt: string;
  /** Thumbnail for the ordered variant, shown as a miniature when present. */
  variantImage?: string;
  /** Storefront product slug, for the "view on storefront" link. */
  slug?: string;
  /** Supplier page URL, for the "product to order" link. */
  scrapingUrl?: string;
}

/** Supplier-side fulfillment record, mapped from the backend OrderProcessed. Dates
 * are pre-formatted for display; a stage's fields are only set once it has happened. */
export interface OrderProcessing {
  /** Processed stage (always present when a processing record exists). */
  seller?: string;
  sellerOrderReference?: string;
  totalUsdAmount?: number;
  receipt?: string;
  processingNote?: string;
  processedAt?: string;
  /** In-transit stage (shipped from the USA hub). */
  shippedFromUsaAt?: string;
  shippedBy?: string;
  shippingCost?: number;
  shippingReceipt?: string;
  shippingNote?: string;
  /** Assigned carrier partner, surfaced from the backend OrderProcessed.courrier. */
  courrier?: {
    name?: string;
    contact?: string;
    pickupLocation?: string;
    pickupContact?: string;
    usaAddress?: string;
  };
  /** Arrived-at-facility stage (collected at the destination hub). */
  collectedAt?: string;
  pickupAddress?: string;
  pickupContact?: string;
  collectionNote?: string;
}

export interface Order {
  id: string;
  /** Backend order uid (e.g. "O-a1b2c3"), used for the detail route. */
  uid: string;
  /** Raw backend lifecycle status (Order::STATUS_*), before the 5-column collapse. */
  rawStatus: string;
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
  /** Flagged as a priority order; highlighted in the fulfillment list. */
  isPriority: boolean;
  /** Supplier-side processing record, when the order has been processed. */
  processing?: OrderProcessing;
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
