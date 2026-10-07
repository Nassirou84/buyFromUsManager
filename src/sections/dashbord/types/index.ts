export type Marketplace = 'amazon' | 'ebay' | 'aliexpress' | 'direct';

export type SyncStatus = 'synced' | 'price_shifted' | 'depleted' | 'paused' | 'draft';

export interface DropshipProduct {
  id: string;
  sku: string;
  title: string;
  scrapedSubtitle: string;
  sourceMarketplace: Marketplace;
  sourceLabel: string;
  sourceId: string;
  sourceUrl: string;
  supplierInfo: string;
  category: string;
  subCategory: string;
  sourceCost: number;
  retailPrice: number;
  markupPercent: number;
  marginPercent: number;
  syncStatus: SyncStatus;
  statusLabel?: string;
  inStock: boolean;
  image: string;
  imageAlt: string;
  lastSyncTime: string;
  isDelisted?: boolean;
}

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

export interface ScraperChannelStats {
  id: string;
  name: string;
  badge: string;
  rateLimitUsed: number;
  rateLimitStatus: string;
  activeSkus: number;
  successRate: number;
}

export interface MarkupRule {
  id: string;
  category: string;
  formula: string;
  estimatedMargin: number;
  isActive: boolean;
}

export interface SubcategoryItem {
  id: string;
  name: string;
  productCount: number;
  markupRule?: string;
  estimatedMargin?: number;
  scraperKeywords?: string[];
}

export interface CategoryItem {
  id: string;
  name: string;
  icon: string;
  description?: string;
  subcategories: SubcategoryItem[];
  productCount: number;
}
