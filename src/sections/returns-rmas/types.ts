import { ProductReturnStatus, RefundType } from '@/api/returns/get-product-returns';

// Return lifecycle status mirrors the backend enum (ProductReturnStatusEnum).
export type RmaStatus = ProductReturnStatus;
export type { RefundType };

export type ItemCondition = 'Pristine / Grade A' | 'Grade B (Light Wear)' | 'Damaged / Unsellable';

// Per-item inspection checks performed at intake.
export interface PackagingCheck {
  // Original packaging kept / intact.
  packagingKept: boolean;
  // The stated return reason was verified against the item.
  returnCauseChecked: boolean;
  // The received item matches the ordered product/variant.
  itemMatch: boolean;
}

export interface RmaAuditNote {
  author: string;
  role: string;
  date: string;
  message: string;
}

// The order a return belongs to, assembled from the embedded returnOrder.
export interface RmaOrder {
  uid: string;
  fullName: string;
  phone: string;
  addressLines: string[];
  orderPrice: number;
  discount: number;
  taxes: number;
  shippingFee: number;
  isPriority: boolean;
  promoCode: string;
  createdAtStr: string;
  deliveredAtStr: string;
}

// A single returned line, assembled from the embedded orderItem on a product return.
export interface RmaLine {
  title: string;
  productImage: string;
  variantImage: string;
  variantLabel: string;
  quantity: number;
  unitPrice: number;
  reason: string;
  // Inspection grade and packaging/accessory checks for this specific item
  // (client-side; no backend field yet).
  condition: ItemCondition;
  packagingCheck: PackagingCheck;
}

export interface RmaItem {
  id: string;
  orderRef: string;
  customerName: string;
  customerEmail: string;
  customerCity: string;
  customerSegment: string;
  lifetimeSpend: string;
  returnRate: string;
  totalReturns: string;
  itemTitle: string;
  itemPrice: number;
  itemSku: string;
  itemSize: string;
  itemMaterial: string;
  itemImage: string;
  carrier: string;
  slaRemaining: string;
  status: RmaStatus;
  bay: string;
  condition: ItemCondition;
  packagingCheck: PackagingCheck;
  dispositionRouting: string;
  customerNote: string;
  originalPaid: number;
  logisticsFee: number;
  restockingFee: number;
  reimbursementTotal: number;
  payoutDestination: string;
  isStoreCreditBonusApplied: boolean;
  auditNotes: RmaAuditNote[];
  // Fields sourced from GET /product_returns (product_return:read).
  refundType: RefundType;
  createdAtStr: string;
  itemCount: number;
  lines: RmaLine[];
  order: RmaOrder | null;
}
