import useLocales from '@/locales/use-locales';
import React from 'react';
import { Icon } from '@/components/lucide-icon';
import { DropshipProduct } from '../../types';

interface ProductTableProps {
  products: DropshipProduct[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onQuickEditPrice: (product: DropshipProduct) => void;
  onRescrapeProduct: (product: DropshipProduct) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalCount: number;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onQuickEditPrice,
  onRescrapeProduct,
  currentPage,
  totalPages,
  onPageChange,
  totalCount,
}) => {
  const { t } = useLocales();
  const isAllSelected = products.length > 0 && products.every((p) => selectedIds.includes(p.id));

  const getSourceBadge = (product: DropshipProduct) => {
    switch (product.sourceMarketplace) {
      case 'amazon':
        if (product.sourceLabel === 'AMAZON PRIME') {
          return (
            <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[10.5px] font-bold rounded uppercase tracking-wider">
              {product.sourceLabel}
            </span>
          );
        }
        return (
          <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[10.5px] font-bold rounded uppercase tracking-wider">
            {product.sourceLabel}
          </span>
        );
      case 'ebay':
        return (
          <span className="px-2 py-0.5 bg-blue-100/70 dark:bg-blue-950 text-[#004ac6] dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[10.5px] font-bold rounded uppercase tracking-wider">
            {product.sourceLabel}
          </span>
        );
      case 'aliexpress':
        return (
          <span className="px-2 py-0.5 bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-[10.5px] font-bold rounded uppercase tracking-wider">
            {product.sourceLabel}
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10.5px] font-bold rounded uppercase tracking-wider">
            {t('direct_caps')}
          </span>
        );
    }
  };

  const getSyncDot = (product: DropshipProduct) => {
    if (!product.inStock || product.syncStatus === 'depleted') {
      return (
        <span className="w-2 h-2 rounded-full bg-[#ba1a1a] inline-block" title={t('supplier_depleted_auto_paused')}></span>
      );
    }
    if (product.syncStatus === 'price_shifted') {
      return (
        <span className="w-2 h-2 rounded-full bg-[#bc4800] inline-block animate-pulse" title={t('supplier_price_shift')}></span>
      );
    }
    return (
      <span className="w-2 h-2 rounded-full bg-[#004ac6] inline-block" title={t('active_price_synced')}></span>
    );
  };

  return (
    <div className="bg-white dark:bg-[#131b2e] rounded-xl border border-[#e5eeff] dark:border-slate-800 shadow-2xs overflow-hidden flex flex-col">
      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#eff4ff]/70 dark:bg-slate-800/60 border-b border-[#e5eeff] dark:border-slate-700 text-[11px] font-bold uppercase tracking-wider text-[#565e74] dark:text-slate-400">
              <th className="py-3.5 px-4 w-12 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={onSelectAll}
                  className="w-4 h-4 rounded text-[#004ac6] focus:ring-[#004ac6] cursor-pointer"
                />
              </th>
              <th className="py-3.5 px-4 min-w-[280px]">
                {t('product_scraped_title')}
              </th>
              <th className="py-3.5 px-4 min-w-[220px]">
                {t('source_supplier_asin')}
              </th>
              <th className="py-3.5 px-4 min-w-[180px]">
                {t('category_hierarchy')}
              </th>
              <th className="py-3.5 px-4 min-w-[220px]">
                {t('source_cost_retail_price')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0f4ff] dark:divide-slate-800 text-[13px]">
            {products.map((product) => {
              const isSelected = selectedIds.includes(product.id);

              return (
                <tr
                  key={product.id}
                  className={`group transition-colors ${
                    isSelected
                      ? 'bg-blue-50/60 dark:bg-blue-950/40'
                      : 'hover:bg-[#f8f9ff] dark:hover:bg-slate-800/40'
                  }`}
                >
                  {/* Selection Checkbox */}
                  <td className="py-4 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(product.id)}
                      className="w-4 h-4 rounded text-[#004ac6] focus:ring-[#004ac6] cursor-pointer"
                    />
                  </td>

                  {/* Product Title & Image & SKU */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        <img
                          src={product.image}
                          alt={product.imageAlt}
                          className="w-13 h-13 sm:w-14 sm:h-14 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 border border-[#e5eeff] dark:border-slate-700 shadow-2xs"
                        />
                        <div className="absolute -top-1 -left-1">
                          {getSyncDot(product)}
                        </div>
                      </div>

                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#0b1c30] dark:text-white text-[14px] truncate">
                            {product.title}
                          </span>
                          {product.isDelisted && (
                            <span className="px-1.5 py-0.2 bg-red-100 text-red-800 text-[10px] font-bold rounded">
                              {t('delisted')}
                            </span>
                          )}
                        </div>
                        <p className="text-[12px] text-[#565e74] dark:text-slate-400 truncate max-w-sm">
                          {product.scrapedSubtitle}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] font-mono text-[#737686] dark:text-slate-400">
                            {t('sku_label', { sku: product.sku })}
                          </span>
                          <span className="text-[10.5px] text-slate-400">{t('synced_time', { time: product.lastSyncTime })}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Source Supplier & ASIN */}
                  <td className="py-4 px-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        {getSourceBadge(product)}
                        <a
                          href={product.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-[12px] font-semibold text-[#004ac6] dark:text-blue-400 hover:underline flex items-center gap-0.5"
                        >
                          <span>{product.sourceId}</span>
                          <Icon name="open_in_new" className="text-[13px]"/>
                        </a>
                      </div>

                      <span
                        className={`text-[12px] ${
                          !product.inStock
                            ? 'text-[#ba1a1a] dark:text-rose-400 font-semibold'
                            : 'text-[#565e74] dark:text-slate-400'
                        }`}
                      >
                        {product.supplierInfo}
                      </span>
                    </div>
                  </td>

                  {/* {t('category_hierarchy')} */}
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#eff4ff] dark:bg-slate-800/90 text-[#004ac6] dark:text-blue-300 text-[12px] font-semibold rounded-md border border-[#dce9ff] dark:border-slate-700">
                      <span>{product.category}</span>
                      <span className="text-[#737686] text-[10px]">&gt;</span>
                      <span className="font-bold">{product.subCategory}</span>
                    </span>
                  </td>

                  {/* Source Cost -> Retail Price & Margins */}
                  <td className="py-4 px-4">
                    <div className="flex flex-col">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-[13px] text-[#565e74] dark:text-slate-400">
                          ${product.sourceCost.toFixed(2)}
                        </span>
                        <span className="text-[12px] text-[#737686]">→</span>
                        <span className="text-[15px] font-bold text-[#0b1c30] dark:text-white">
                          ${product.retailPrice.toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={() => onQuickEditPrice(product)}
                          title={t('quick_edit_price_markup')}
                          className="opacity-0 group-hover:opacity-100 text-[#004ac6] dark:text-blue-400 hover:bg-blue-50 p-0.5 rounded transition-all ml-1"
                        >
                          <Icon name="edit" className="text-[15px]"/>
                        </button>
                      </div>

                      {product.statusLabel ? (
                        <div className="mt-1">
                          <span className="px-2 py-0.5 bg-[#ffdad6] dark:bg-rose-950/70 text-[#93000a] dark:text-rose-300 font-semibold text-[11px] rounded inline-block">
                            {product.statusLabel}
                          </span>
                        </div>
                      ) : (
                        <div className="text-[11.5px] font-medium text-[#004ac6] dark:text-blue-400 mt-0.5">
                          <span>{t('markup_label', { value: product.markupPercent.toFixed(1) })}</span>{' '}
                          <span className="text-[#565e74] dark:text-slate-400">
                            {t('margin_label', { value: product.marginPercent.toFixed(1) })}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Table Footer: Legend & Pagination */}
      <div className="p-4 bg-[#eff4ff]/40 dark:bg-slate-800/40 border-t border-[#e5eeff] dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-[12px]">
        {/* Sync Legend */}
        <div className="flex flex-wrap items-center gap-4 text-[#565e74] dark:text-slate-400">
          <span className="font-bold text-[11px] uppercase tracking-wider text-[#0b1c30] dark:text-slate-200">
            {t('sync_legend')}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#004ac6]"></span>
            <span>{t('active_price_synced')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#bc4800]"></span>
            <span>{t('supplier_price_shift')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a]"></span>
            <span>{t('supplier_depleted_auto_paused')}</span>
          </div>
        </div>

        {/* Rows per page & Page navigation */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[#565e74] dark:text-slate-400">{t('rows_per_page')}</span>
            <span className="px-2 py-1 bg-white dark:bg-slate-700 border border-[#c3c6d7] dark:border-slate-600 rounded font-semibold text-[#0b1c30] dark:text-white">
              10
            </span>
          </div>

          <div className="text-[#565e74] dark:text-slate-400 whitespace-nowrap">
            {t('showing')} <span className="font-semibold text-[#0b1c30] dark:text-white">1 - {products.length}</span> {t('of')}{' '}
            <span className="font-semibold text-[#0b1c30] dark:text-white">{totalCount.toLocaleString()}</span> {t('scraped_products')}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="p-1 rounded border border-[#c3c6d7] dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 hover:bg-[#eff4ff]"
            >
              <Icon name="chevron_left" className="text-[16px]"/>
            </button>
            <button
              type="button"
              className="w-7 h-7 rounded bg-[#004ac6] text-white font-bold text-[12px] flex items-center justify-center shadow-xs"
            >
              1
            </button>
            <button
              type="button"
              className="w-7 h-7 rounded bg-white dark:bg-slate-800 border border-[#c3c6d7] dark:border-slate-700 hover:bg-[#eff4ff] text-[#0b1c30] dark:text-white text-[12px] flex items-center justify-center"
            >
              2
            </button>
            <button
              type="button"
              className="w-7 h-7 rounded bg-white dark:bg-slate-800 border border-[#c3c6d7] dark:border-slate-700 hover:bg-[#eff4ff] text-[#0b1c30] dark:text-white text-[12px] flex items-center justify-center"
            >
              3
            </button>
            <span className="text-[#737686]">...</span>
            <button
              type="button"
              className="w-7 h-7 rounded bg-white dark:bg-slate-800 border border-[#c3c6d7] dark:border-slate-700 hover:bg-[#eff4ff] text-[#0b1c30] dark:text-white text-[12px] flex items-center justify-center"
            >
              149
            </button>
            <button
              type="button"
              onClick={() => onPageChange(currentPage + 1)}
              className="p-1 rounded border border-[#c3c6d7] dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-[#eff4ff]"
            >
              <Icon name="chevron_right" className="text-[16px]"/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
