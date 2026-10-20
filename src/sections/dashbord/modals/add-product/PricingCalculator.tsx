import React from 'react';
import useLocales from '@/locales/use-locales';
import { Input } from '@/components/ui/input';

interface PricingCalculatorProps {
  cost: number;
  retailPrice: number;
  onCostChange: (value: number) => void;
  onRetailPriceChange: (value: number) => void;
}

export const PricingCalculator: React.FC<PricingCalculatorProps> = ({
  cost,
  retailPrice,
  onCostChange,
  onRetailPriceChange
}) => {
  const { t } = useLocales();

  // Percentage added on top of the source cost
  const markup = cost > 0 ? ((retailPrice - cost) / cost) * 100 : 0;

  return (
    <div className="p-3.5 bg-[#eff4ff]/60 dark:bg-slate-800/60 rounded-xl border border-[#dce9ff] dark:border-slate-700 flex flex-col gap-2.5">
      <span className="text-[11px] font-bold uppercase tracking-wider text-[#004ac6] dark:text-blue-400">
        {t('pricing_margins')}
      </span>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label={t('source_cost_usd')}
          type="number"
          step="0.5"
          min="1"
          value={cost}
          onChange={(e) => onCostChange(Number(e.target.value))}
        />
        <Input
          label={t('target_retail_price_usd')}
          type="number"
          step="1"
          min="1"
          value={retailPrice}
          onChange={(e) => onRetailPriceChange(Number(e.target.value))}
        />
      </div>

      <div className="flex items-center justify-between text-[12px] bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-[#e5eeff] dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-[#565e74] dark:text-slate-400">{t('markup_colon')}</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">+{markup.toFixed(1)}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#565e74] dark:text-slate-400">{t('estimated_markup_colon')}</span>
          <span className="font-bold text-[#004ac6] dark:text-blue-400 font-mono">${(retailPrice - cost).toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
};
