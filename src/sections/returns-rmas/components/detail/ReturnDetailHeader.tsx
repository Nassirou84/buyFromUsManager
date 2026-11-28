import React from 'react';
import { toast } from 'sonner';
import useLocales from '@/locales/use-locales';
import { Icon } from '@/components/lucide-icon';
import { type RmaItem } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

const ICON_BUTTON =
  'disabled:opacity-50 disabled:cursor-not-allowed p-1.5 text-[#565e74] dark:text-slate-400 hover:text-[#0b1c30] dark:hover:text-white hover:bg-[#eff4ff] dark:hover:bg-slate-800 rounded transition-colors';

interface ReturnDetailHeaderProps {
  rma: RmaItem;
  onBack: () => void;
  /** Open the return slips for every item. */
  onPrintSlips: () => void;
}

// Page header with back navigation, return id, status and quick actions.
export const ReturnDetailHeader: React.FC<ReturnDetailHeaderProps> = ({ rma, onBack, onPrintSlips }) => {
  const { t } = useLocales();

  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-[#131b2e] hover:bg-[#eff4ff] dark:hover:bg-slate-800 text-[#0b1c30] dark:text-white text-[13px] rounded-lg shadow-2xs transition-all border border-[#e5eeff] dark:border-slate-700 font-medium shrink-0"
          type="button"
        >
          <Icon name="arrow_back" className="text-[18px]" />
          <span>{t('back_to_returns')}</span>
        </button>
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-xl text-[#0b1c30] dark:text-white font-bold truncate">#{rma.id}</span>
          <StatusBadge status={rma.status} />
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onPrintSlips}
          disabled={rma.lines.length === 0}
          className={ICON_BUTTON}
          title={t('return_slip_print_all')}
          aria-label={t('return_slip_print_all')}
          type="button"
        >
          <Icon name="print" className="text-[20px]" />
        </button>
        <button
          onClick={() => toast.info(t('rma_toast_comms'))}
          className={ICON_BUTTON}
          title={t('rma_comms_title')}
          type="button"
        >
          <Icon name="chat" className="text-[20px]" />
        </button>
      </div>
    </div>
  );
};
