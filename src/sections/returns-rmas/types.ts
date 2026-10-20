export type RmaStatus = 'Requested' | 'In Transit' | 'Inspection Pending' | 'Refunded' | 'Rejected';
export type ItemCondition = 'Pristine / Grade A' | 'Grade B (Light Wear)' | 'Damaged / Unsellable';

export interface RmaAuditNote {
  author: string;
  role: string;
  date: string;
  message: string;
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
  packagingCheck: {
    garmentBag: boolean;
    spareButtons: boolean;
    securityRibbon: boolean;
  };
  dispositionRouting: string;
  customerNote: string;
  originalPaid: number;
  logisticsFee: number;
  restockingFee: number;
  reimbursementTotal: number;
  payoutDestination: string;
  isStoreCreditBonusApplied: boolean;
  auditNotes: RmaAuditNote[];
}
