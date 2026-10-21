import useLocales from '@/locales/use-locales';
import React from 'react';
import { Icon } from '@/components/lucide-icon';

interface PriceUpdatedModalProps {
  isOpen: boolean;
  onClose: () => void;
  productTitle?: string;
  newPrice?: number;
}

export const PriceUpdatedModal: React.FC<PriceUpdatedModalProps> = ({
  isOpen,
  onClose,
  productTitle,
  newPrice,
}) => {
  const { t } = useLocales();

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-white dark:bg-[#131b2e] rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center gap-3 animate-in fade-in zoom-in-95 duration-150">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
          <Icon name="check_circle" className="text-[28px]" />
        </div>
        <h3 className="text-lg font-bold text-[#0b1c30] dark:text-white">
          {t('price_updated_title')}
        </h3>
        <p className="text-[12.5px] text-[#565e74] dark:text-slate-400 leading-relaxed">
          {t('price_updated_desc', { title: productTitle, price: newPrice?.toFixed(2) })}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="w-full mt-2 px-4 py-2 bg-[#004ac6] hover:bg-[#003ea8] text-white text-xs font-semibold rounded-lg shadow-sm"
        >
          {t('close')}
        </button>
      </div>
    </div>
  );
};
