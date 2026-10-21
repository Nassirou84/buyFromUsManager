import useLocales from '@/locales/use-locales';
import React from 'react';
import { Icon } from '@/components/lucide-icon';
import { Product } from '@/types/product';
import Moment from 'moment';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { getCoverPhotoUrl } from '@/utils/cover-photo';

interface ProductGridProps {
  products: Product[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onQuickEditPrice: (product: Product) => void;
  onRescrapeProduct: (product: Product) => void;
  isLoading?: boolean;
  skeletonCount?: number;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  selectedIds,
  onToggleSelect,
  onQuickEditPrice,
  onRescrapeProduct,
  isLoading = false,
  skeletonCount = 9,
}) => {
  const { t } = useLocales();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {isLoading && Array.from({ length: skeletonCount }).map((_, i) => (
        <div
          key={`skeleton-${i}`}
          className="bg-white dark:bg-[#131b2e] rounded-xl border border-[#e5eeff] dark:border-slate-800 shadow-2xs overflow-hidden flex flex-col"
        >
          <Skeleton className="w-full h-48 rounded-none" />
          <div className="p-4 flex flex-col gap-3">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
            <div className="mt-2 pt-3 border-t border-[#f0f4ff] dark:border-slate-800 flex items-center justify-between">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        </div>
      ))}
      {!isLoading && products.map((product) => {
        const isSelected = selectedIds.includes(product.uid ?? String(product.id));

        return (
          <div
            key={product.id}
            className={`bg-white dark:bg-[#131b2e] rounded-xl border transition-all overflow-hidden flex flex-col justify-between ${isSelected
              ? 'border-[#004ac6] ring-2 ring-[#004ac6]/20 shadow-md'
              : 'border-[#e5eeff] dark:border-slate-800 shadow-2xs hover:shadow-sm'
              }`}
          >
            <div className="relative">
              <img
                src={getCoverPhotoUrl(product)}
                alt={product?.title}
                className="w-full h-48 object-cover bg-slate-100 dark:bg-slate-800"
              />
              <div className="absolute top-3 left-3">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggleSelect(product.uid ?? String(product.id))}
                  className="w-4 h-4 rounded text-[#004ac6] bg-white/90 backdrop-blur-xs focus:ring-[#004ac6] cursor-pointer shadow-xs"
                />
              </div>

              <div className="absolute top-3 right-3 flex items-center gap-1.5">
                <span className="px-2 py-0.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs text-[#004ac6] dark:text-blue-300 text-[10.5px] font-bold rounded uppercase tracking-wider shadow-2xs">
                  {product.seller}
                </span>
              </div>

              {!product.isAvailable && (
                <div className="absolute bottom-2 left-2 right-2">
                  <span className="w-full text-center block px-2 py-1 bg-red-600/90 text-white backdrop-blur-xs text-[11px] font-bold rounded">
                    {t('not_available_for_sale')}
                  </span>
                </div>
              )}
            </div>

            <div className="p-4 flex flex-col flex-1 justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-semibold text-[#004ac6] dark:text-blue-400">
                    {product?.category?.title} &gt; {product?.subcategory?.title}
                  </span>
                </div>

                <h3 className="font-bold text-[15px] text-[#0b1c30] dark:text-white line-clamp-2">
                  {product.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] font-mono text-[#737686] dark:text-slate-400">
                    {t('sku_label', { sku: product.uid })}
                  </span>
                  <span className="text-[10.5px] text-slate-400">{t('lastUpdated', { time: Moment(product.updatedAt).fromNow() })}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#f0f4ff] dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[12px] text-[#737686]">
                      ${product?.usdPrice?.toFixed(2)}
                    </span>
                    <span className="text-[12px] text-[#737686]">→</span>
                    <span className="text-[16px] font-extrabold text-[#0b1c30] dark:text-white">
                      ${product?.fullPrice?.toFixed(2)}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#004ac6] dark:text-blue-400 font-semibold block">
                    {t('markup_margin', {
                      markup: product.usdPrice
                        ? (((product.fullPrice ?? 0) - product.usdPrice) / product.usdPrice * 100).toFixed(0)
                        : 0,
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Link
                    href={process.env.NEXT_PUBLIC_STORE_FRONT_URL + `/products/${product.slug}`}
                    className="p-1.5 rounded-lg border border-[#c3c6d7] dark:border-slate-700 hover:bg-[#eff4ff] text-[#004ac6] text-[13px]"
                    title={t('view_product_in_store_front')}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon name="open_in_new" className="text-[17px]" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => onQuickEditPrice(product)}
                    className="p-1.5 rounded-lg border border-[#c3c6d7] dark:border-slate-700 hover:bg-[#eff4ff] text-[#004ac6] text-[13px]"
                    title={t('edit_price')}
                  >
                    <Icon name="edit" className="text-[17px]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRescrapeProduct(product)}
                    className="p-1.5 rounded-lg border border-[#c3c6d7] dark:border-slate-700 hover:bg-[#eff4ff] text-[#565e74] text-[13px]"
                    title={t('re_scrape')}
                  >
                    <Icon name="refresh" className="text-[17px]" />
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
