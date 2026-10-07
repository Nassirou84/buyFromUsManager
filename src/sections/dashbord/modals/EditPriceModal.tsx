import useLocales from '@/locales/use-locales';
import React, { useState } from 'react';
import { Icon } from '@/components/lucide-icon';
import { DropshipProduct } from '../../types';

interface EditPriceModalProps {
  product: DropshipProduct | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, newRetailPrice: number) => void;
}

export const EditPriceModal: React.FC<EditPriceModalProps> = ({
  product,
  isOpen,
  onClose,
  onSave,
}) => {
  const { t } = useLocales();

  if (!isOpen || !product) return null;

  const [retailPrice, setRetailPrice] = useState(product.retailPrice);

  const markup = ((retailPrice - product.sourceCost) / product.sourceCost) * 100;
  const margin = ((retailPrice - product.sourceCost) / retailPrice) * 100;

  const handleSave = () => {
    onSave(product.id, retailPrice);
    onClose();
  };

  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#131b2e] rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#eff4ff] text-[#004ac6] flex items-center justify-center">
              <Icon name="price_change" className="text-[18px]"/>
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0b1c30] dark:text-white">
                {t('edit_product_price_markup')}
              </h3>
              <p className="text-[11px] text-[#565e74] dark:text-slate-400">
                {product.title}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600"
          >
            <Icon name="close" className="text-[18px]"/>
          </button>
        </div>

        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <img
            src={product.image}
            alt={product.title}
            className="w-12 h-12 rounded object-cover border border-slate-200"
          />
          <div className="text-xs">
            <div className="font-semibold text-slate-900 dark:text-white">{product.title}</div>
            <div className="text-slate-500 font-mono">{t('source_cost', { value: product.sourceCost.toFixed(2) })}</div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {t('retail_price_usd')}
          </label>
          <input
            type="number"
            step="1"
            value={retailPrice}
            onChange={(e) => setRetailPrice(Math.max(1, Number(e.target.value)))}
            className="h-10 px-3 bg-[#eff4ff] dark:bg-slate-800 text-[#0b1c30] dark:text-white font-bold text-base rounded-lg border border-transparent focus:border-[#004ac6] focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs bg-blue-50 dark:bg-blue-950/40 p-3 rounded-lg border border-blue-100 dark:border-blue-900">
          <div>
            <span className="text-slate-500 block">{t('markup_colon')}</span>
            <span className="font-bold text-blue-700 dark:text-blue-300 font-mono">
              +{markup.toFixed(1)}%
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">{t('gross_margin_colon')}</span>
            <span className="font-bold text-blue-700 dark:text-blue-300 font-mono">
              {margin.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg"
          >
            {t('cancel')}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-[#004ac6] hover:bg-[#003ea8] text-white text-xs font-semibold rounded-lg shadow-sm"
          >
            {t('update_retail_price')}
          </button>
        </div>
      </div>
    </div>
  );
};
