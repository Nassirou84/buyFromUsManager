import useLocales from '@/locales/use-locales';
import React from 'react';
import { Icon } from '@/components/lucide-icon';

interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onForceRescrape: () => void;
  onApplyMargin: () => void;
  onDelist: () => void;
  onRelist: () => void;
  onEditProduct: () => void;
}

export const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedCount,
  onClearSelection,
  onForceRescrape,
  onApplyMargin,
  onDelist,
  onRelist,
  onEditProduct,
}) => {
  const { t } = useLocales();

  if (selectedCount === 0) return null;

  return (
    <div className="w-full bg-[#1b2537] text-white p-3 sm:px-4 sm:py-2.5 rounded-xl shadow-lg border border-slate-700/60 flex flex-col lg:flex-row lg:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClearSelection}
            title={t('deselect_all')}
            aria-label={t('deselect_all')}
            className="w-5 h-5 rounded bg-[#2563eb] hover:bg-[#1d4ed8] text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <Icon name="check" className="text-[16px]"/>
          </button>
          <span className="text-[13px] font-bold tracking-tight">
            {t('products_selected', { count: selectedCount })}
          </span>
        </div>

        <span className="text-slate-500 hidden sm:inline">|</span>

        <span className="text-[12.5px] text-slate-300 hidden md:inline">
          {t('bulk_actions_desc')}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {selectedCount === 1 && (
          <button
            type="button"
            onClick={onEditProduct}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[12px] font-semibold rounded-lg border border-[#2563eb] transition-colors"
          >
            <Icon name="edit" className="text-[15px]"/>
            <span>{t('edit_product')}</span>
          </button>
        )}

        <button
          type="button"
          onClick={onForceRescrape}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[12px] font-semibold rounded-lg border border-slate-700 transition-colors"
        >
          <Icon name="refresh" className="text-[15px]"/>
          <span>{t('force_rescrape_now')}</span>
        </button>

        <button
          type="button"
          onClick={onApplyMargin}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[12px] font-semibold rounded-lg border border-slate-700 transition-colors"
        >
          <Icon name="trending_up" className="text-[15px]"/>
          <span>{t('apply_margin')}</span>
        </button>

        <button
          type="button"
          onClick={onRelist}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-200 text-[12px] font-semibold rounded-lg border border-emerald-800/80 transition-colors"
        >
          <Icon name="visibility" className="text-[15px]"/>
          <span>{t('relist_into_storefront')}</span>
        </button>

        <button
          type="button"
          onClick={onDelist}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/70 hover:bg-red-900/80 text-red-200 text-[12px] font-semibold rounded-lg border border-red-800/80 transition-colors"
        >
          <Icon name="visibility_off" className="text-[15px]"/>
          <span>{t('delist_from_storefront')}</span>
        </button>

        <button
          type="button"
          onClick={onClearSelection}
          title={t('deselect_all')}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
        >
          <Icon name="close" className="text-[18px]"/>
        </button>
      </div>
    </div>
  );
};
