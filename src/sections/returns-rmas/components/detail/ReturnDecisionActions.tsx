import React from 'react';
import useLocales from '@/locales/use-locales';
import { Icon } from '@/components/lucide-icon';
import { type RefundType, type RmaStatus } from '../../types';

interface ReturnDecisionActionsProps {
  status: RmaStatus;
  refundType: RefundType;
  /** Approving or rejecting requires the inspector's note to be saved first. */
  hasInspectorNote: boolean;
  disabled?: boolean;
  onApprove: () => void;
  onReject: () => void;
}

// Approve / reject actions. While the return is still "initiated" the parcel is in
// transit, so an awaiting-collection notice is shown instead.
export const ReturnDecisionActions: React.FC<ReturnDecisionActionsProps> = ({
  status,
  refundType,
  hasInspectorNote,
  disabled = false,
  onApprove,
  onReject,
}) => {
  const { t } = useLocales();
  const isCredit = refundType === 'credit';
  const isLocked = !hasInspectorNote || disabled;

  if (status === 'initiated') {
    return (
      <div className="flex items-center justify-center gap-2 pt-4 border-t border-[#f0f4ff] dark:border-slate-800 text-[#bc4800] dark:text-amber-300">
        <Icon name="local_shipping" className="text-[18px]" />
        <span className="text-[13px] font-semibold">{t('rma_awaiting_collection')}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5 pt-4 border-t border-[#f0f4ff] dark:border-slate-800">
      {!hasInspectorNote && (
        <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#bc4800] dark:text-amber-300">
          <Icon name="edit_note" className="text-[16px]" />
          <span>{t('rma_note_required_hint')}</span>
        </div>
      )}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <button
          onClick={onReject}
          disabled={isLocked}
          className="w-full sm:w-auto px-4 py-2 text-[#ba1a1a] hover:bg-[#ffdad6]/40 text-[13px] rounded-lg transition-colors flex items-center justify-center gap-1.5 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          type="button"
        >
          <Icon name="cancel" className="text-[18px]" />
          <span>{t('rma_reject_btn')}</span>
        </button>
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            onClick={onApprove}
            disabled={isLocked}
            className="w-full sm:w-auto px-5 py-2 bg-[#2563eb] hover:bg-[#004ac6] text-white text-[13px] rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
          >
            <Icon name={isCredit ? 'card_giftcard' : 'check_circle'} className="text-[18px]" />
            <span>{t(isCredit ? 'rma_approve_credit_btn' : 'rma_approve_refund_btn')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
