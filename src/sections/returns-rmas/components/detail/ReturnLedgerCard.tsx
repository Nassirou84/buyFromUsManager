import React, { useState } from 'react';
import useLocales from '@/locales/use-locales';
import { Icon } from '@/components/lucide-icon';
import { formatWithCurrency } from '@/utils/lodash';
import { type RmaItem } from '../../types';
import { getRefundTypeLabelKey } from '../../shared';
import { SectionCard } from '../common/SectionCard';
import { ReturnInspectorNote } from './ReturnInspectorNote';
import { ReturnCompleteDialog } from './ReturnCompleteDialog';

interface ReturnLedgerCardProps {
  rma: RmaItem;
  isSavingNote?: boolean;
  onSaveNote: (note: string, onSaved: () => void) => void;
  isCompleting?: boolean;
  /** Completes the return; it calls `closeDialog` when the confirmation should close. */
  onComplete: (closeDialog: () => void) => void;
}

// Financial reconciliation: refund breakdown, payout destination, the inspector note
// and, at the bottom, the action that completes the return and closes the case.
export const ReturnLedgerCard: React.FC<ReturnLedgerCardProps> = ({
  rma,
  isSavingNote = false,
  onSaveNote,
  isCompleting = false,
  onComplete,
}) => {
  const { t } = useLocales();
  // The confirmation dialog shown before the case is closed.
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const isClosed = rma.status === 'completed';
  // The backend workflow only allows complete_return from "collected", and only
  // approved lines are refunded, so every item must be decided first.
  const isCollected = rma.status === 'collected';
  const hasUndecided = rma.lines.some((l) => l.decision === null);
  const canComplete =
    isCollected && rma.lines.length > 0 && !hasUndecided && !isCompleting;

  return (
    <SectionCard
      icon="receipt_long"
      title={t('rma_ledger_title')}
      aside={
        <span className="text-[11px] text-[#0b1c30] dark:text-white font-medium">
          {t('rma_currency')}: {process.env.NEXT_PUBLIC_APP_CURRENCY}
        </span>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="flex flex-col gap-1 text-[13px]">
          <div className="flex items-center justify-between py-1 text-[#565e74] dark:text-slate-400">
            <span>{t('rma_orig_paid')}</span>
            <span className="font-semibold text-[#0b1c30] dark:text-white">{formatWithCurrency(rma.originalPaid)}</span>
          </div>
          <div className="flex items-center justify-between py-1 text-[#565e74] dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <span>{t('rma_logistics_fee')}</span>
              <span className="px-1.5 py-0.5 bg-[#dae2fd] text-[#004ac6] text-[10px] rounded font-semibold">
                {t('rma_vip_waived')}
              </span>
            </div>
            <span className="text-[#0b1c30] dark:text-white">{formatWithCurrency(rma.logisticsFee)}</span>
          </div>
          <div className="flex items-center justify-between py-1 text-[#565e74] dark:text-slate-400">
            <span>{t('rma_restock_fee')}</span>
            <span className="text-[#0b1c30] dark:text-white">{formatWithCurrency(rma.restockingFee)}</span>
          </div>
          <div className="flex items-center justify-between py-2.5 mt-1 border-t border-[#e5eeff] dark:border-slate-700 text-[15px] font-bold text-[#0b1c30] dark:text-white">
            <span>{t('rma_total_due')}</span>
            <span className="text-[#004ac6] dark:text-blue-400">{formatWithCurrency(rma.reimbursementTotal)}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-[13px]">
            <span className="font-semibold text-[#0b1c30] dark:text-white">{t('rma_payout_dest')}:</span>
            <span className="text-[#565e74] dark:text-slate-300">{t(getRefundTypeLabelKey(rma.refundType))}</span>
          </div>

          <ReturnInspectorNote note={rma.inspectorNote} isSaving={isSavingNote} onSave={onSaveNote} />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2.5 pt-4 border-t border-[#f0f4ff] dark:border-slate-800">
        {isClosed ? (
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[13px] font-semibold">
            <Icon name="task_alt" className="text-[18px]" />
            {t('rma_case_closed')}
          </span>
        ) : (
          <>
            {hasUndecided && isCollected && (
              <span className="flex items-center gap-1.5 text-[12px] font-medium text-[#bc4800] dark:text-amber-300 sm:mr-auto">
                <Icon name="info" className="text-[16px]" />
                {t('rma_complete_requires_decisions')}
              </span>
            )}
            <button
              type="button"
              onClick={() => setIsConfirmOpen(true)}
              disabled={!canComplete}
              className="w-full sm:w-auto px-5 py-2 bg-[#2563eb] hover:bg-[#004ac6] text-white text-[13px] rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon name={isCompleting ? 'progress_activity' : 'task_alt'} className={`text-[18px] ${isCompleting ? 'animate-spin' : ''}`} />
              <span>{t('rma_complete_close_btn')}</span>
            </button>
          </>
        )}
      </div>

      <ReturnCompleteDialog
        rma={rma}
        isOpen={isConfirmOpen}
        isCompleting={isCompleting}
        onOpenChange={setIsConfirmOpen}
        onConfirm={() => onComplete(() => setIsConfirmOpen(false))}
      />
    </SectionCard>
  );
};
