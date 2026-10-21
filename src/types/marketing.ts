export type PromoType = 'percentage' | 'fixed';

export interface PromoCode {
  id: number;
  code: string;
  campaignLabel: string;
  type: PromoType;
  discountValue: number; // e.g. 15 for 15%, 25 for a fixed 25
  discountDisplay: string; // e.g. "15% Off"
  ruleDescription: string; // e.g. "Cart min: $85.00"
  minSpend?: number;
  currentClaims: number;
  maxClaims: number | null; // null for unlimited
  startsAt: string | null; // ISO date from the API
  expiresAt: string | null; // null when the code never expires
  validityStart: string; // formatted for display
  validityEnd?: string | null;
  validityNote: string; // e.g. "No Expiration Date", "Ends in 8 days"
  isActive: boolean;
  isExpiringSoon: boolean;
  terms: string; // audience rule kept so edits and duplicates don't change it
  target: string | null;
}

export interface Banner {
  id: number;
  title: string;
  name: string;
  content: string | null;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type BannerPayload = Pick<Banner, 'title' | 'name' | 'content' | 'imageUrl'> &
  Partial<Pick<Banner, 'isActive'>>;
