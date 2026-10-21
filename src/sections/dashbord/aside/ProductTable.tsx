import useLocales from '@/locales/use-locales';
import React from 'react';
import { Icon } from '@/components/lucide-icon';
import { Product } from '@/types/product';
import Moment from 'moment';
import { Skeleton } from '@/components/ui/skeleton';
import { getCoverPhotoUrl } from '@/utils/cover-photo';

interface ProductTableProps {
  products: Product[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onQuickEditPrice: (product: Product) => void;
  onRescrapeProduct: (product: Product) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalCount: number;
  itemsPerPage: number;
  isLoading?: boolean;
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
  itemsPerPage,
  isLoading = false,
}) => {
  const { t } = useLocales();
  const isAllSelected = products.length > 0 && products.every((p) => selectedIds.includes(p.uid ?? String(p.id)));

  const rangeStart = totalCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const rangeEnd = Math.min(rangeStart + products.length - 1, totalCount);

  // Page numbers with ellipsis: first, last, and a window around the current page
  const pageItems: (number | 'ellipsis-start' | 'ellipsis-end')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pageItems.push(i);
  } else {
    const start = Math.max(2, Math.min(currentPage - 1, totalPages - 4));
    const end = Math.min(totalPages - 1, Math.max(currentPage + 1, 5));
    pageItems.push(1);
    if (start > 2) pageItems.push('ellipsis-start');
    for (let i = start; i <= end; i++) pageItems.push(i);
    if (end < totalPages - 1) pageItems.push('ellipsis-end');
    pageItems.push(totalPages);
  }

  const getSourceBadge = (product: Product) => {
    const base = 'px-2 py-0.5 border text-[10.5px] font-bold rounded uppercase tracking-wider';
    const seller = product.seller?.toLowerCase();
    const styles: Record<string, string> = {
      amazon: 'bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-800',
      walmart: 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      bestbuy: 'bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-800',
      ebay: 'bg-blue-100/70 dark:bg-blue-950 text-[#004ac6] dark:text-blue-300 border-blue-200 dark:border-blue-800',
      aliexpress: 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    };

    if (!seller) {
      return (
        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10.5px] font-bold rounded uppercase tracking-wider">
          {t('direct_caps')}
        </span>
      );
    }

    return (
      <span className={`${base} ${styles[seller] ?? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}>
        {product.seller}
      </span>
    );
  };

  const getSyncDot = (product: Product) => {
    if (!product.isAvailable) {
      return (
        <span className="w-2 h-2 rounded-full bg-[#ba1a1a] inline-block" title={t('supplier_depleted_auto_paused')}></span>
      );
    }
    if (product.updatedAt && Moment().diff(Moment(product.updatedAt), 'days', true) < 7) {
      return (
        <span className="w-2 h-2 rounded-full bg-green-600 inline-block" title={t('supplier_price_shift')}></span>
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
            {isLoading && Array.from({ length: itemsPerPage }).map((_, i) => (
              <tr key={`skeleton-${i}`}>
                <td className="py-4 px-4 text-center">
                  <Skeleton className="w-4 h-4 mx-auto" />
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-14 h-14 rounded-lg flex-shrink-0" />
                    <div className="flex flex-col gap-2 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-6 w-36" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-5 w-28" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </td>
              </tr>
            ))}
            {!isLoading && products.map((product) => {
              const isSelected = selectedIds.includes(product.uid ?? String(product.id));

              return (
                <tr
                  key={product.id}
                  className={`group transition-colors ${isSelected
                    ? 'bg-blue-50/60 dark:bg-blue-950/40'
                    : 'hover:bg-[#f8f9ff] dark:hover:bg-slate-800/40'
                    }`}
                >
                  {/* Selection Checkbox */}
                  <td className="py-4 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(product.uid ?? String(product.id))}
                      className="w-4 h-4 rounded text-[#004ac6] focus:ring-[#004ac6] cursor-pointer"
                    />
                  </td>

                  {/* Product Title & Image & SKU */}
                  <td className="py-4 px-4 max-w-[320px]">
                    <div className="flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        <img
                          src={getCoverPhotoUrl(product)}
                          alt={product?.title}
                          className="w-13 h-13 sm:w-14 sm:h-14 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 border border-[#e5eeff] dark:border-slate-700 shadow-2xs"
                        />
                        <div className="absolute -top-1 -left-1">
                          {getSyncDot(product)}
                        </div>
                      </div>

                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#0b1c30] dark:text-white text-[14px] line-clamp-2">
                            {product.title}
                          </span>
                          {!product.isAvailable && (
                            <span className="px-1.5 py-0.2 bg-red-100 text-red-800 text-[10px] font-bold rounded">
                              {t('delisted')}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] font-mono text-[#737686] dark:text-slate-400">
                            {t('sku_label', { sku: product.uid })}
                          </span>
                          <span className="text-[10.5px] text-slate-400">{t('lastUpdated', { time: Moment(product.updatedAt).fromNow() })}</span>
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
                          href={process.env.NEXT_PUBLIC_STORE_FRONT_URL + '/products/' + product.slug}
                          target="_blank"
                          rel="noreferrer"
                          title={t('view_product_in_store_front')}
                          className="font-mono text-[12px] font-semibold text-[#004ac6] dark:text-blue-400 hover:underline flex items-center gap-0.5"
                        >
                          <span>{product.uid}</span>
                          <Icon name="open_in_new" className="text-[13px]" />
                        </a>
                      </div>

                      <span
                        className={`text-[12px] text-[#565e74] dark:text-slate-400`
                        }
                      >
                        {product.brand}
                      </span>
                    </div>
                  </td>

                  {/* {t('category_hierarchy')} */}
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#eff4ff] dark:bg-slate-800/90 text-[#004ac6] dark:text-blue-300 text-[12px] font-semibold rounded-md border border-[#dce9ff] dark:border-slate-700">
                      <span>{product?.category?.title ?? ''}</span>
                      <span className="text-[#737686] text-[10px]">&gt;</span>
                      <span className="font-bold">{product?.subcategory?.title ?? ''}</span>
                    </span>
                    <div className="mt-1">
                      <span className={`px-2 py-0.5 font-semibold text-[11px] rounded inline-block ${product.isAvailable ? 'bg-[#d7f7dd] dark:bg-green-950/70 text-[#0a6b1f] dark:text-green-300' : 'bg-[#ffdad6] dark:bg-rose-950/70 text-[#93000a] dark:text-rose-300'}`}>
                        {product.isAvailable ? t('available_for_sale') : t('not_available_for_sale')}
                      </span>
                    </div>
                  </td>

                  {/* Source Cost -> Retail Price & Margins */}
                  <td className="py-4 px-4">
                    <div className="flex flex-col">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-[13px] text-[#565e74] dark:text-slate-400">
                          ${(product.usdPrice ?? 0).toFixed(2)}
                        </span>
                        <span className="text-[12px] text-[#737686]">→</span>
                        <span className="text-[15px] font-bold text-[#0b1c30] dark:text-white">
                          ${(product.fullPrice ?? 0).toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={() => onQuickEditPrice(product)}
                          title={t('quick_edit_price_markup')}
                          className="opacity-0 group-hover:opacity-100 text-[#004ac6] dark:text-blue-400 hover:bg-blue-50 p-0.5 rounded transition-all ml-1"
                        >
                          <Icon name="edit" className="text-[15px]" />
                        </button>
                      </div>
                      <div className="text-[11.5px] font-medium text-[#004ac6] dark:text-blue-400 mt-0.5">
                        <span className="text-[11.5px] font-medium text-[#004ac6] dark:text-blue-400 mt-0.5">
                          {t('margin_label', {
                            value: product.usdPrice
                              ? (((product.fullPrice ?? 0) - product.usdPrice) / product.usdPrice * 100).toFixed(0)
                              : 0,
                          })}
                        </span>
                      </div>
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
            <span className="w-2.5 h-2.5 rounded-full bg-green-600"></span>
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
              {itemsPerPage}
            </span>
          </div>

          <div className="text-[#565e74] dark:text-slate-400 whitespace-nowrap">
            {t('showing')} <span className="font-semibold text-[#0b1c30] dark:text-white">{rangeStart} - {rangeEnd}</span> {t('of')}{' '}
            <span className="font-semibold text-[#0b1c30] dark:text-white">{totalCount.toLocaleString()}</span> {t('scraped_products')}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="p-1 rounded border border-[#c3c6d7] dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 hover:bg-[#eff4ff]"
            >
              <Icon name="chevron_left" className="text-[16px]" />
            </button>
            {pageItems.map((item) =>
              typeof item === 'number' ? (
                <button
                  key={item}
                  type="button"
                  onClick={() => onPageChange(item)}
                  className={
                    item === currentPage
                      ? 'w-7 h-7 rounded bg-[#004ac6] text-white font-bold text-[12px] flex items-center justify-center shadow-xs'
                      : 'w-7 h-7 rounded bg-white dark:bg-slate-800 border border-[#c3c6d7] dark:border-slate-700 hover:bg-[#eff4ff] text-[#0b1c30] dark:text-white text-[12px] flex items-center justify-center'
                  }
                >
                  {item}
                </button>
              ) : (
                <span key={item} className="text-[#737686]">...</span>
              )
            )}
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="p-1 rounded border border-[#c3c6d7] dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 hover:bg-[#eff4ff]"
            >
              <Icon name="chevron_right" className="text-[16px]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
