import useLocales from '@/locales/use-locales';
import React, { useState } from 'react';
import { Icon } from '@/components/lucide-icon';
import { MarkupRule } from '../../types';

interface ConfigureMarkupModalProps {
  isOpen: boolean;
  onClose: () => void;
  rules: MarkupRule[];
  onSaveRules: (updated: MarkupRule[]) => void;
}

export const ConfigureMarkupModal: React.FC<ConfigureMarkupModalProps> = ({
  isOpen,
  onClose,
  rules,
  onSaveRules,
}) => {
  const { t } = useLocales();
  const [currentRules, setCurrentRules] = useState<MarkupRule[]>(rules);

  if (!isOpen) return null;

  const handleUpdateMargin = (id: string, newMargin: number) => {
    setCurrentRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, estimatedMargin: newMargin } : r))
    );
  };

  const handleSave = () => {
    onSaveRules(currentRules);
    onClose();
  };

  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#131b2e] rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#eff4ff] text-[#004ac6] flex items-center justify-center">
              <Icon name="tune" className="text-[20px]"/>
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#0b1c30] dark:text-white">
                {t('configure_pricing_markup_logic')}
              </h3>
              <p className="text-[12px] text-[#565e74] dark:text-slate-400">
                {t('automated_margins_desc')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600"
          >
            <Icon name="close" className="text-[20px]"/>
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {currentRules.map((rule) => (
            <div
              key={rule.id}
              className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[13px] text-[#0b1c30] dark:text-white">
                  {rule.category}
                </span>
                <span className="text-[11.5px] font-mono text-[#004ac6] dark:text-blue-400 font-semibold">
                  {rule.formula}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <span className="text-[12px] text-[#565e74] dark:text-slate-400">
                  {t('target_gross_margin')}
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="30"
                    max="85"
                    value={rule.estimatedMargin}
                    onChange={(e) => handleUpdateMargin(rule.id, Number(e.target.value))}
                    className="w-32 accent-[#004ac6] cursor-pointer"
                  />
                  <span className="font-bold font-mono text-[13px] text-[#0b1c30] dark:text-white w-12 text-right">
                    {rule.estimatedMargin}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#eff4ff] dark:bg-slate-800 p-3 rounded-lg text-[12px] text-[#434655] dark:text-slate-300">
          <span className="font-semibold text-[#004ac6]">{t('rounding_rule')}</span> {t('rounding_rule_desc')}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-[13px] font-semibold rounded-lg"
          >
            {t('cancel')}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-[#004ac6] hover:bg-[#003ea8] text-white text-[13px] font-semibold rounded-lg shadow-sm"
          >
            {t('save_markup_rules')}
          </button>
        </div>
      </div>
    </div>
  );
};
