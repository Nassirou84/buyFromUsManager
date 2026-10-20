import useLocales from '@/locales/use-locales';
import React, { useState } from 'react';
import { Icon } from '@/components/lucide-icon';

interface ApplyMarginModalProps {
  isOpen: boolean;
  selectedCount: number;
  isLoading?: boolean;
  onClose: () => void;
  onApply: (marginPercent: number) => void;
}

export const ApplyMarginModal: React.FC<ApplyMarginModalProps> = ({
  isOpen,
  selectedCount,
  isLoading = false,
  onClose,
  onApply,
}) => {
  const { t } = useLocales();

  const [margin, setMargin] = useState('40');

  if (!isOpen) return null;

  const value = Number(margin);
  const isValid = margin !== '' && Number.isFinite(value) && value >= 0;

  const handleClose = () => {
    if (!isLoading) onClose();
  };

  const handleApply = () => {
    if (!isValid || isLoading) return;
    onApply(value);
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-white dark:bg-[#131b2e] rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#eff4ff] text-[#004ac6] flex items-center justify-center">
              <Icon name="trending_up" className="text-[18px]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0b1c30] dark:text-white">
                {t('apply_margin')}
              </h3>
              <p className="text-[11px] text-[#565e74] dark:text-slate-400">
                {t('products_selected', { count: selectedCount })}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600"
          >
            <Icon name="close" className="text-[18px]" />
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {t('margin_percent_label')}
          </label>
          <div className="relative">
            <input
              type="number"
              min={0}
              step="any"
              autoFocus
              value={margin}
              onChange={(e) => setMargin(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleApply(); }}
              className="h-10 w-full pl-3 pr-8 bg-[#eff4ff] dark:bg-slate-800 text-[#0b1c30] dark:text-white font-bold text-base rounded-lg border border-transparent focus:border-[#004ac6] focus:outline-none"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">%</span>
          </div>
          <p className="text-[11px] text-slate-500">{t('apply_margin_hint')}</p>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg disabled:opacity-60"
          >
            {t('cancel')}
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={!isValid || isLoading}
            className="px-4 py-2 bg-[#004ac6] hover:bg-[#003ea8] text-white text-xs font-semibold rounded-lg shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? t('applying') : t('apply_margin')}
          </button>
        </div>
      </div>
    </div>
  );
};
