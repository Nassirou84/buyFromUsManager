import { RmaStatus } from './types';

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

export const getStatusBadgeClass = (status: RmaStatus) => {
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
