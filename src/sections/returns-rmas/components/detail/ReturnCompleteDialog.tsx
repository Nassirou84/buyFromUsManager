import React from 'react';
import useLocales from '@/locales/use-locales';
import { Icon } from '@/components/lucide-icon';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { type RmaItem } from '../../types';
import { getRefundTypeLabelKey } from '../../shared';

interface ReturnCompleteDialogProps {
  rma: RmaItem;
  isOpen: boolean;
  isCompleting?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

const CHECKLIST_KEYS = [
  'rma_complete_dialog_check_items',
  'rma_complete_dialog_check_decisions',
  'rma_complete_dialog_check_refund',
];

// Confirmation before completing a return. Closing the case can't be undone (there is
// no transition out of "completed") and store credit is issued right away, so the
// admin is asked to review everything first. The confirm button is a plain button,
// not AlertDialogAction, so the dialog stays open while the request runs and on error.
export const ReturnCompleteDialog: React.FC<ReturnCompleteDialogProps> = ({
  rma,
  isOpen,
  isCompleting = false,
  onOpenChange,
  onConfirm,
}) => {
  const { t } = useLocales();
  const approvedCount = rma.lines.filter((l) => l.decision === 'approved').length;
  const rejectedCount = rma.lines.filter((l) => l.decision === 'rejected').length;

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !isCompleting && onOpenChange(open)}>
      <AlertDialogContent className="max-w-md bg-white dark:bg-slate-900 border-[#e5eeff] dark:border-slate-800">
        <AlertDialogHeader>
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-9 h-9 rounded-full bg-[#ffdbcd] dark:bg-amber-900/40 text-[#bc4800] dark:text-amber-300 shrink-0">
              <Icon name="priority_high" className="text-[20px]" />
            </span>
            <AlertDialogTitle className="text-[16px] text-[#0b1c30] dark:text-white">
              {t('rma_complete_dialog_title')}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-[13px] text-[#565e74] dark:text-slate-400">
            {t('rma_complete_dialog_message', { id: rma.id })}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col gap-2 p-3 rounded-lg bg-[#eff4ff]/60 dark:bg-slate-800/60 text-[12px]">
          <span className="font-semibold text-[#0b1c30] dark:text-white">{t('rma_complete_dialog_check_title')}</span>
          <ul className="flex flex-col gap-1.5">
            {CHECKLIST_KEYS.map((key) => (
              <li key={key} className="flex items-start gap-1.5 text-[#565e74] dark:text-slate-300">
                <Icon name="check_circle" className="text-[14px] mt-px shrink-0 text-[#2563eb] dark:text-blue-400" />
                <span>{t(key)}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-x-4 gap-y-1 pt-2 mt-0.5 border-t border-[#dbe4ff] dark:border-slate-700 text-[#565e74] dark:text-slate-400">
            <span>
              {t('rma_complete_dialog_approved')}:{' '}
              <span className="font-semibold text-emerald-700 dark:text-emerald-300">{approvedCount}</span>
            </span>
            <span>
              {t('rma_complete_dialog_rejected')}:{' '}
              <span className="font-semibold text-[#ba1a1a] dark:text-red-400">{rejectedCount}</span>
            </span>
            <span>
              {t('rma_payout_dest')}:{' '}
              <span className="font-semibold text-[#0b1c30] dark:text-white">{t(getRefundTypeLabelKey(rma.refundType))}</span>
            </span>
          </div>
        </div>

        <p className="text-[12px] font-medium text-[#ba1a1a] dark:text-red-400">{t('rma_complete_dialog_irreversible')}</p>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isCompleting} className="text-[13px]">
            {t('rma_complete_dialog_cancel')}
          </AlertDialogCancel>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isCompleting}
            className="px-4 py-2 bg-[#2563eb] hover:bg-[#004ac6] text-white text-[13px] rounded-md shadow-sm transition-colors flex items-center justify-center gap-1.5 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon
              name={isCompleting ? 'progress_activity' : 'task_alt'}
              className={`text-[16px] ${isCompleting ? 'animate-spin' : ''}`}
            />
            {t('rma_complete_dialog_confirm')}
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
