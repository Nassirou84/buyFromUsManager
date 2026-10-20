import useLocales from '@/locales/use-locales';
import React from 'react';
import { Users } from 'lucide-react';

export const StoreCustomersView: React.FC = () => {
  const { t } = useLocales();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="text-[11px] font-bold text-[#004ac6] dark:text-blue-400 uppercase tracking-wider mb-1">
          {t('store_customers_eyebrow')}
        </div>
        <h1 className="text-2xl font-bold text-[#0b1c30] dark:text-white">
          {t('store_customers_title')}
        </h1>
        <p className="text-[13px] text-[#565e74] dark:text-slate-400 mt-1">
          {t('store_customers_subtitle')}
        </p>
      </div>

      <div className="bg-white dark:bg-[#131b2e] p-10 rounded-xl border border-dashed border-[#e5eeff] dark:border-slate-800 shadow-2xs flex flex-col items-center justify-center text-center gap-2">
        <Users size={32} className="text-[#737686]" />
        <span className="font-bold text-sm text-[#0b1c30] dark:text-white">{t('store_customers_placeholder_title')}</span>
        <p className="text-xs text-slate-500">{t('store_customers_placeholder_desc')}</p>
      </div>
    </div>
  );
};
