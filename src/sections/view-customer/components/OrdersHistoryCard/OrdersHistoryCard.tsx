'use client';

import React from 'react';
import useLocales from '@/locales/use-locales';
import { Icon } from '@/components/lucide-icon';
import { CustomerOrder } from '@/sections/store-customers/types';
import { CARD, TH } from '@/sections/store-customers/shared';
import { RECENT_ORDER_DAYS, isRecentOrder } from '@/sections/store-customers/mapper';
import { OrderRow } from './OrderRow';

interface OrdersHistoryCardProps {
  customerName: string;
  orders: CustomerOrder[];
  /** Total number of orders, shown in the header badge. */
  totalOrders: number;
  /** Orders placed in the last {RECENT_ORDER_DAYS} days, shown in the group heading. */
  recentCount: number;
  onSelectOrder: (order: CustomerOrder) => void;
  onViewInvoice: (order: CustomerOrder) => void;
  onResendNotification: (order: CustomerOrder) => void;
  onPrintStatement: () => void;
  /** Footer state. */
  isLoadingOrders: boolean;
  isOrdersError: boolean;
  /** Whether to render the "view full history" button. */
  showLoadMore: boolean;
  /** Disables the load-more button while a page is being fetched. */
  loadMoreDisabled?: boolean;
  /** Count shown in the load-more label. */
  loadMoreCount: number;
  onLoadMore: () => void;
}

/** Customer order history: header (search + print), grouped orders table and footer. */
export const OrdersHistoryCard: React.FC<OrdersHistoryCardProps> = ({
  customerName,
  orders,
  totalOrders,
  recentCount,
  onSelectOrder,
  onViewInvoice,
  onPrintStatement,
  isLoadingOrders,
  isOrdersError,
  showLoadMore,
  loadMoreDisabled,
  loadMoreCount,
  onLoadMore,
}) => {
  const { t } = useLocales();

  return (
    <div className={`${CARD} overflow-hidden`}>
      <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-[#f0f4ff] dark:border-slate-800">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h3 className="text-[15px] text-[#0b1c30] dark:text-white font-bold">
            {t('customers_orders_of', { name: customerName.split(' ')[0] })}
          </h3>
          <span className="px-2.5 py-0.5 bg-[#dae2fd] text-[#004ac6] text-[11px] rounded-full font-bold">
            {t('customers_orders_count', { count: totalOrders })}
          </span>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Orders search — not bound yet */}
          <div className="relative">
            <Icon name="search" className="text-[18px] absolute left-3 top-1/2 -translate-y-1/2 text-[#737686]" />
            <input
              type="text"
              placeholder={t('customers_orders_search_placeholder')}
              className="h-9 w-full sm:w-64 pl-10 pr-3 bg-[#eff4ff] dark:bg-slate-800 rounded-lg text-[13px] text-[#0b1c30] dark:text-white placeholder:text-[#737686] focus:outline-none border border-transparent focus:border-[#2563eb]/40 transition-colors"
            />
          </div>
          <button
            onClick={onPrintStatement}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#eff4ff] dark:bg-slate-800 hover:bg-[#dae2fd] dark:hover:bg-slate-700 text-[#0b1c30] dark:text-white text-[11px] rounded-lg transition-colors font-semibold"
            type="button"
          >
            <Icon name="print" className="text-[16px]" />
            <span>{t('customers_print_statement')}</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#eff4ff]/60 dark:bg-slate-800/60 text-[#565e74] dark:text-slate-400 text-[11px] uppercase tracking-wider">
              <th className={TH}>{t('customers_col_order_no')}</th>
              <th className={TH}>{t('customers_col_date')}</th>
              <th className={TH}>{t('customers_col_items')}</th>
              <th className={TH}>{t('customers_col_total')}</th>
              <th className={TH}>{t('customers_col_delivery')}</th>
              <th className={TH}>{t('customers_col_payment_short')}</th>
              <th className={`${TH} text-right`}>{t('customers_col_quick_actions')}</th>
            </tr>
          </thead>
          <tbody className="text-[#0b1c30] dark:text-slate-100 text-[13px] divide-y divide-[#f0f4ff] dark:divide-slate-800">
            {orders.map((order, idx) => (
              <React.Fragment key={order.id}>
                {(idx === 0 || isRecentOrder(order) !== isRecentOrder(orders[idx - 1])) && (
                  <tr className="bg-[#eff4ff]/40 dark:bg-slate-800/40">
                    <td colSpan={7} className="py-2 px-5 text-[11px] font-semibold uppercase tracking-wider text-[#004ac6] dark:text-blue-400">
                      {isRecentOrder(order)
                        ? t('customers_orders_last_days', { count: recentCount, days: RECENT_ORDER_DAYS })
                        : t('customers_orders_earlier')}
                    </td>
                  </tr>
                )}
                <OrderRow
                  order={order}
                  onSelect={onSelectOrder}
                  onViewInvoice={onViewInvoice}
                />
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-[#eff4ff]/60 dark:bg-slate-800/60 flex items-center justify-between gap-2 text-[#565e74] dark:text-slate-400 text-[11px] border-t border-[#f0f4ff] dark:border-slate-800">
        <span>
          {isLoadingOrders
            ? t('customers_loading_orders')
            : isOrdersError
              ? t('customers_orders_load_error')
              : t('customers_last_orders', { count: orders.length })}
        </span>
        {showLoadMore && (
          <button
            className="text-[#004ac6] dark:text-blue-400 hover:underline font-semibold flex items-center gap-1 disabled:opacity-50"
            disabled={loadMoreDisabled}
            onClick={onLoadMore}
            type="button"
          >
            <span>{t('customers_view_full', { count: loadMoreCount })}</span>
            <Icon name="arrow_forward" className="text-[16px]" />
          </button>
        )}
      </div>
    </div>
  );
};
