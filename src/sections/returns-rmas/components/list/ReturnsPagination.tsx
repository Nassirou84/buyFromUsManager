import React from 'react';
import useLocales from '@/locales/use-locales';
import { Icon } from '@/components/lucide-icon';

type PageItem = number | 'ellipsis-start' | 'ellipsis-end';

// Page numbers with ellipsis: first, last, and a window around the current page.
const buildPageItems = (page: number, totalPages: number): PageItem[] => {
  const items: PageItem[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) items.push(i);
    return items;
  }
  const start = Math.max(2, Math.min(page - 1, totalPages - 4));
  const end = Math.min(totalPages - 1, Math.max(page + 1, 5));
  items.push(1);
  if (start > 2) items.push('ellipsis-start');
  for (let i = start; i <= end; i++) items.push(i);
  if (end < totalPages - 1) items.push('ellipsis-end');
  items.push(totalPages);
  return items;
};

const ARROW_BUTTON =
  'p-1 rounded border border-[#c3c6d7] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0b1c30] dark:text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#eff4ff] dark:hover:bg-slate-700 transition-colors cursor-pointer';

interface ReturnsPaginationProps {
  page: number;
  pageSize: number;
  totalItems: number;
  /** Number of rows on the loaded page. */
  shownCount: number;
  onPageChange: (page: number) => void;
}

// The loaded page is one slice of the server-side result set.
export const ReturnsPagination: React.FC<ReturnsPaginationProps> = ({
  page,
  pageSize,
  totalItems,
  shownCount,
  onPageChange,
}) => {
  const { t } = useLocales();

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const rangeStart = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(rangeStart + shownCount - 1, totalItems);

  return (
    <div className="mt-1 bg-white dark:bg-[#131b2e] px-4 py-3 rounded-xl border border-[#e5eeff] dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px]">
      <span className="text-[#565e74] dark:text-slate-400 whitespace-nowrap">
        {t('returns_showing_footer', { from: rangeStart, to: rangeEnd, total: totalItems })}
      </span>

      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label={t('returns_prev_page')}
          title={t('returns_prev_page')}
          className={ARROW_BUTTON}
        >
          <Icon name="chevron_left" className="text-[16px]" />
        </button>
        {buildPageItems(page, totalPages).map((item) =>
          typeof item === 'number' ? (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              aria-current={item === page ? 'page' : undefined}
              className={
                item === page
                  ? 'w-7 h-7 rounded bg-[#004ac6] text-white font-bold text-[12px] flex items-center justify-center shadow-xs cursor-pointer'
                  : 'w-7 h-7 rounded bg-white dark:bg-slate-800 border border-[#c3c6d7] dark:border-slate-700 hover:bg-[#eff4ff] dark:hover:bg-slate-700 text-[#0b1c30] dark:text-white text-[12px] flex items-center justify-center transition-colors cursor-pointer'
              }
            >
              {item}
            </button>
          ) : (
            <span key={item} className="text-[#737686] px-0.5">...</span>
          )
        )}
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label={t('returns_next_page')}
          title={t('returns_next_page')}
          className={ARROW_BUTTON}
        >
          <Icon name="chevron_right" className="text-[16px]" />
        </button>
      </div>
    </div>
  );
};
