import useLocales from '@/locales/use-locales';
import React from 'react';
import { Icon } from '@/components/lucide-icon';
import { DropshipProduct } from '../../types';

interface ProductGridProps {
  products: DropshipProduct[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onQuickEditPrice: (product: DropshipProduct) => void;
  onRescrapeProduct: (product: DropshipProduct) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  selectedIds,
  onToggleSelect,
  onQuickEditPrice,
  onRescrapeProduct,
}) => {
  const { t } = useLocales();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product) => {
        const isSelected = selectedIds.includes(product.id);

        return (
          <div
            key={product.id}
            className={`bg-white dark:bg-[#131b2e] rounded-xl border transition-all overflow-hidden flex flex-col justify-between ${
              isSelected
                ? 'border-[#004ac6] ring-2 ring-[#004ac6]/20 shadow-md'
                : 'border-[#e5eeff] dark:border-slate-800 shadow-2xs hover:shadow-sm'
            }`}
          >
            <div className="relative">
              <img
                src={product.image}
                alt={product.imageAlt}
                className="w-full h-48 object-cover bg-slate-100 dark:bg-slate-800"
              />
              <div className="absolute top-3 left-3">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggleSelect(product.id)}
                  className="w-4 h-4 rounded text-[#004ac6] bg-white/90 backdrop-blur-xs focus:ring-[#004ac6] cursor-pointer shadow-xs"
                />
              </div>

              <div className="absolute top-3 right-3 flex items-center gap-1.5">
                <span className="px-2 py-0.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs text-[#004ac6] dark:text-blue-300 text-[10.5px] font-bold rounded uppercase tracking-wider shadow-2xs">
                  {product.sourceLabel}
                </span>
              </div>

              {product.statusLabel && (
                <div className="absolute bottom-2 left-2 right-2">
                  <span className="w-full text-center block px-2 py-1 bg-red-600/90 text-white backdrop-blur-xs text-[11px] font-bold rounded">
                    {product.statusLabel}
                  </span>
                </div>
              )}
            </div>

            <div className="p-4 flex flex-col flex-1 justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-mono text-[#737686] dark:text-slate-400">
                    {product.sku}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[11px] font-semibold text-[#004ac6] dark:text-blue-400">
                    {product.category} &gt; {product.subCategory}
                  </span>
                </div>

                <h3 className="font-bold text-[15px] text-[#0b1c30] dark:text-white line-clamp-1">
                  {product.title}
                </h3>
                <p className="text-[12px] text-[#565e74] dark:text-slate-400 line-clamp-2 mt-1">
                  {product.scrapedSubtitle}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#f0f4ff] dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[12px] text-[#737686]">
                      ${product.sourceCost.toFixed(2)}
                    </span>
                    <span className="text-[12px] text-[#737686]">→</span>
                    <span className="text-[16px] font-extrabold text-[#0b1c30] dark:text-white">
                      ${product.retailPrice.toFixed(2)}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#004ac6] dark:text-blue-400 font-semibold block">
                    {t('markup_margin', { markup: product.markupPercent.toFixed(0), margin: product.marginPercent.toFixed(0) })}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onQuickEditPrice(product)}
                    className="p-1.5 rounded-lg border border-[#c3c6d7] dark:border-slate-700 hover:bg-[#eff4ff] text-[#004ac6] text-[13px]"
                    title={t('edit_price')}
                  >
                    <Icon name="edit" className="text-[17px]"/>
                  </button>
                  <button
                    type="button"
                    onClick={() => onRescrapeProduct(product)}
                    className="p-1.5 rounded-lg border border-[#c3c6d7] dark:border-slate-700 hover:bg-[#eff4ff] text-[#565e74] text-[13px]"
                    title={t('re_scrape')}
                  >
                    <Icon name="refresh" className="text-[17px]"/>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
