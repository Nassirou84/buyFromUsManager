import React from 'react';
import useLocales from '@/locales/use-locales';
import { Icon } from '@/components/lucide-icon';
import { type RmaItem } from '../../types';
import { getRefundTypeLabelKey } from '../../shared';
import { StatusBadge } from '../common/StatusBadge';
import { ProductThumb } from '../common/ProductThumb';

interface ReturnCardProps {
  item: RmaItem;
  onOpen: (uid: string) => void;
}

// One return in the queue: id, refund type, status, customer, order and first item.
export const ReturnCard: React.FC<ReturnCardProps> = ({ item, onOpen }) => {
  const { t } = useLocales();
  const firstLine = item.lines[0];
  const itemsCount = t('rma_items_count', { count: item.itemCount });

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(item.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen(item.id);
        }
      }}
      className="bg-white dark:bg-[#131b2e] p-4 rounded-xl transition-all cursor-pointer flex flex-col gap-2.5 border shadow-2xs border-[#e5eeff] dark:border-slate-800 hover:border-[#c3c6d7] dark:hover:border-slate-600 hover:shadow-md focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[15px] text-[#0b1c30] dark:text-white font-bold truncate">#{item.id}</span>
          <span className="px-1.5 py-0.5 bg-[#eef2ff] dark:bg-slate-700 text-[#004ac6] dark:text-blue-300 text-[11px] rounded font-semibold shrink-0">
            {t(getRefundTypeLabelKey(item.refundType))}
          </span>
        </div>
        <StatusBadge status={item.status} pulse />
      </div>

      <div className="flex items-center justify-between gap-2 text-[12px]">
        <span className="flex items-center gap-1.5 min-w-0 text-[#0b1c30] dark:text-white">
          <Icon name="person" className="text-[14px] text-[#565e74] dark:text-slate-400 shrink-0" />
          <span className="truncate font-medium" title={item.customerEmail}>{item.customerName}</span>
        </span>
        <span className="text-[#565e74] dark:text-slate-400 text-[11px] shrink-0">{item.createdAtStr}</span>
      </div>

      {item.orderRef && (
        <div className="flex items-center gap-1.5 text-[11px] text-[#565e74] dark:text-slate-400">
          <Icon name="receipt_long" className="text-[14px] shrink-0" />
          <span className="truncate">{t('rma_order_number')}: {item.orderRef}</span>
        </div>
      )}

      <div className="p-2.5 bg-[#eff4ff] dark:bg-slate-800 rounded-lg flex items-center gap-2.5">
        <ProductThumb
          src={firstLine?.productImage || firstLine?.variantImage}
          alt={firstLine?.title ?? ''}
          className="w-10 h-10 rounded-md"
        />
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-[12px] text-[#0b1c30] dark:text-white font-semibold truncate">
            {firstLine?.title || itemsCount}
          </span>
          <span className="text-[11px] text-[#565e74] dark:text-slate-400 truncate">
            {item.lines.length > 1 ? itemsCount : firstLine?.variantLabel || itemsCount}
          </span>
        </div>
        <Icon name="chevron_right" className="text-[18px] text-[#c3c6d7] dark:text-slate-500 shrink-0" />
      </div>
    </div>
  );
};
