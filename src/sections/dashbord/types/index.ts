export type Marketplace = 'amazon' | 'ebay' | 'bestbuy' | 'walmart' | 'other';

export type SyncStatus = 'synced' | 'price_shifted' | 'depleted' | 'paused' | 'draft';

export type ProductCondition = 'new' | 'used' | 'refurbished';

export interface ProductVariant {
  id: string;
  title: string;
  price: number;
  image: string;
  // Uploaded file posted to the api; `image` is only its local preview URL.
  imageFile?: File;
}

export interface ProductDetail {
  name: string;
  value: string;
}

export interface DropshipProduct {
  id: string;
  sku: string;
  title: string;
  brand?: string;
  condition?: ProductCondition;
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
  images?: string[];
  details?: ProductDetail[];
  features?: string[];
  variants?: ProductVariant[];
  imageAlt: string;
  lastSyncTime: string;
  isDelisted?: boolean;
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
