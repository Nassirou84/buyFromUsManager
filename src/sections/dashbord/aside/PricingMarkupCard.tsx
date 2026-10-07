import useLocales from '@/locales/use-locales';
import React from 'react';
import { MarkupRule } from '../../types';

interface PricingMarkupCardProps {
  rules: MarkupRule[];
  onConfigureRules: () => void;
}

export const PricingMarkupCard: React.FC<PricingMarkupCardProps> = ({
  rules,
  onConfigureRules,
}) => {
  const { t } = useLocales();
  return (
    <div className="bg-white dark:bg-[#131b2e] rounded-xl border border-[#e5eeff] dark:border-slate-800 p-5 shadow-2xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-1">
          <h2 className="text-[17px] font-bold text-[#0b1c30] dark:text-white tracking-tight">
            {t('pricing_markup_logic')}
          </h2>
          <span className="px-2 py-0.5 bg-[#eff4ff] dark:bg-blue-950 text-[#004ac6] dark:text-blue-300 font-bold text-[10.5px] rounded uppercase tracking-wider">
            {t('active_engine')}
          </span>
        </div>
        <p className="text-[12px] text-[#565e74] dark:text-slate-400 mb-3.5">
          {t('dynamic_tiered_rules')}
        </p>

        {/* Rules Stack */}
        <div className="flex flex-col gap-2.5">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="p-2.5 rounded-lg bg-[#f8f9ff] dark:bg-slate-800/50 border border-[#e5eeff] dark:border-slate-700/60 flex items-center justify-between gap-3"
            >
              <div className="flex flex-col">
                <span className="font-bold text-[12.5px] text-[#0b1c30] dark:text-white">
                  {rule.category}
                </span>
                <span className="text-[11.5px] text-[#565e74] dark:text-slate-400">
                  {rule.formula}
                </span>
              </div>

              <span className="px-2 py-1 bg-[#eff4ff] dark:bg-blue-950/80 text-[#004ac6] dark:text-blue-300 font-bold text-[11.5px] rounded-lg whitespace-nowrap">
                {t('approx_margin', { value: rule.estimatedMargin })}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[#f0f4ff] dark:border-slate-800 flex items-center justify-between text-[12px]">
        <span className="text-[#565e74] dark:text-slate-400">
          {t('auto_price_rounding')} <span className="font-mono font-semibold text-[#0b1c30] dark:text-white">(.00)</span>
        </span>
        <button
          type="button"
          onClick={onConfigureRules}
          className="font-bold text-[#004ac6] dark:text-blue-400 hover:text-[#003ea8] text-[12.5px] cursor-pointer"
        >
          {t('configure_rules')}
        </button>
      </div>
    </div>
  );
};
