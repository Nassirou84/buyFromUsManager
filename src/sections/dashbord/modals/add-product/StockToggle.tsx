import React from 'react';
import useLocales from '@/locales/use-locales';

interface StockToggleProps {
  inStock: boolean;
  onChange: (value: boolean) => void;
  title?: string;
  description?: string;
}

export const StockToggle: React.FC<StockToggleProps> = ({ inStock, onChange, title, description }) => {
  const { t } = useLocales();

  return (
    <div className="flex items-center justify-between p-2.5 bg-[#eff4ff]/60 dark:bg-slate-800/60 rounded-xl border border-[#dce9ff] dark:border-slate-700">
      <div className="flex flex-col">
        <span className="text-[12px] font-bold text-[#0b1c30] dark:text-white">
          {title ?? t('storefront_stock_status')}
        </span>
        <span className="text-[11px] text-[#565e74] dark:text-slate-400">{description ?? t('enable_purchasing_desc')}</span>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={inStock}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#004ac6]"></div>
      </label>
    </div>
  );
};
