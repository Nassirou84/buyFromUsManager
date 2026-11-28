import { type RefundType, type RmaStatus } from './types';

export const CARD =
  'bg-white dark:bg-[#131b2e] rounded-xl border border-[#e5eeff] dark:border-slate-800 shadow-2xs';
export const SECTION_LABEL =
  'text-[11px] font-semibold text-[#565e74] dark:text-slate-400 uppercase tracking-wider';

// Status label i18n keys (ProductReturnStatusEnum).
export const STATUS_LABEL_KEYS: Record<RmaStatus, string> = {
  initiated: 'rma_status_initiated',
  collected: 'rma_status_collected',
  inspected: 'rma_status_inspected',
  approved: 'rma_status_approved',
  completed: 'rma_status_completed',
  rejected: 'rma_status_rejected',
};

export const getStatusBadgeClass = (status: RmaStatus): string => {
  switch (status) {
    case 'inspected':
      return 'bg-[#ffdbcd] text-[#943700]';
    case 'completed':
      return 'bg-[#d6f5e6] text-[#0a6b40]';
    case 'approved':
      return 'bg-[#eff4ff] dark:bg-slate-800 text-[#0b1c30] dark:text-white';
    case 'rejected':
      return 'bg-[#ffdad6] text-[#93000a]';
    default:
      return 'bg-[#dae2fd] text-[#004ac6]';
  }
};

// Refund type label i18n keys (original payment refund vs. store credit).
export const getRefundTypeLabelKey = (refundType: RefundType): string =>
  refundType === 'credit' ? 'rma_refund_type_credit' : 'rma_refund_type_refund';

// Return-reason codes stored by the backend (ProductReturnReasonEnum) → i18n keys.
const REASON_LABEL_KEYS: Record<string, string> = {
  'rr.reason_changed': 'rma_reason_changed',
  'rr.reason_wrong': 'rma_reason_wrong',
  'rr.reason_defective': 'rma_reason_defective',
  'rr.reason_not_described': 'rma_reason_not_described',
  'rr.reason_late': 'rma_reason_late',
  'rr.reason_other': 'rma_reason_other',
};

// i18n key for a stored reason code, or null when the code is unknown.
export const getReasonLabelKey = (code: string): string | null => REASON_LABEL_KEYS[code] ?? null;
