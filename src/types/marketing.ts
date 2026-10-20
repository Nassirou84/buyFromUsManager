export type PromoType = 'percentage' | 'fixed' | 'shipping' | 'gift';

export interface PromoCode {
  id: string;
  code: string;
  campaignLabel: string;
  type: PromoType;
  discountValue: number; // e.g. 15 for 15%, 25 for $25
  discountDisplay: string; // e.g. "15% Off First Order"
  ruleDescription: string; // e.g. "Cart min: $85.00"
  minSpend?: number;
  currentClaims: number;
  maxClaims: number | null; // null for unlimited
  validityStart: string;
  validityEnd?: string | null;
  validityNote: string; // e.g. "No Expiration Date", "Ends in 8 days"
  isActive: boolean;
  categoryLimit?: string;
  tags?: string[];
  revenueGenerated?: number;
  conversionRate?: number;
}

export type BannerDeviceTarget = 'desktop_mobile' | 'desktop' | 'mobile';

export interface BannerItem {
  id: string;
  priority: number;
  title: string;
  targetUrl: string;
  deviceTarget: BannerDeviceTarget;
  imageUrl: string;
  altText: string;
  scheduleLabel: string;
  isLive: boolean;
}
