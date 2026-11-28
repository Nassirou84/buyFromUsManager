import { ProductReturnStatus, RefundType } from '@/api/returns/get-product-returns';

// Return lifecycle status mirrors the backend enum (ProductReturnStatusEnum).
export type RmaStatus = ProductReturnStatus;
export type { RefundType };

// Inspection grade codes, stored as-is in ProductReturnItem.itemCondition.
export type ItemCondition = 'grade_a' | 'grade_b' | 'unsellable';
export const ITEM_CONDITIONS: ItemCondition[] = ['grade_a', 'grade_b', 'unsellable'];

// Per-item decision codes, stored as-is in ProductReturnItem.decision.
export type ReturnItemDecision = 'approved' | 'rejected';

// Per-item inspection checks performed at intake.
export interface PackagingCheck {
  // Original packaging kept / intact.
  packagingKept: boolean;
  // The stated return reason was verified against the item.
  returnCauseChecked: boolean;
  // The received item matches the ordered product/variant.
  itemMatch: boolean;
}

// Control codes stored in ProductReturnItem.itemControls (the checks that passed).
export const PACKAGING_CONTROL_CODES: Record<keyof PackagingCheck, string> = {
  packagingKept: 'packaging_kept',
  returnCauseChecked: 'return_cause_checked',
  itemMatch: 'item_match',
};

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
  /** ProductReturnItem.id, used to address the line on the inspection endpoint. */
  itemId?: number;
  title: string;
  /** Storefront product slug, for the "view on storefront" link. */
  slug?: string;
  productImage: string;
  variantImage: string;
  variantLabel: string;
  quantity: number;
  unitPrice: number;
  reason: string;
  /** Product SKU (Product.uid, same as the orders module); '' when missing. */
  sku: string;
  /** Serial number recorded on the order item at fulfillment ('' when none). */
  orderSerialNumber: string;
  // Inspection grade and packaging/accessory checks for this specific item
  // (ProductReturnItem.itemCondition / itemControls). Null until graded.
  condition: ItemCondition | null;
  packagingCheck: PackagingCheck;
  // Approve / reject decision for this specific item (ProductReturnItem.decision).
  // Null until decided.
  decision: ReturnItemDecision | null;
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
  /** Inspector note (ProductReturn.returnNote); required before approving or rejecting. */
  inspectorNote: string;
  // Fields sourced from GET /product_returns (product_return:read).
  refundType: RefundType;
  createdAtStr: string;
  itemCount: number;
  lines: RmaLine[];
  order: RmaOrder | null;
}
