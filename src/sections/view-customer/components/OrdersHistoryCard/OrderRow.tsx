'use client';

import React from 'react';
import useLocales from '@/locales/use-locales';
import { Icon } from '@/components/lucide-icon';
import { CustomerOrder } from '@/sections/store-customers/types';
import { TD, PaymentIcon, storefrontProductUrl } from '@/sections/store-customers/shared';
import { formatWithCurrency } from '@/utils/lodash';

interface OrderRowProps {
  order: CustomerOrder;
  /** Opens the order details (row click and the "Details" button). */
  onSelect: (order: CustomerOrder) => void;
  /** Opens the invoice PDF for the order. */
  onViewInvoice: (order: CustomerOrder) => void;
}

/** A single order line in the customer's order history table. */
export const OrderRow: React.FC<OrderRowProps> = ({ order, onSelect, onViewInvoice }) => {
  const { t } = useLocales();

  return (
    <tr
      onClick={() => onSelect(order)}
      className="cursor-pointer hover:bg-[#eff4ff]/60 dark:hover:bg-slate-800/40 transition-colors"
    >
      <td className={TD}>
        <div className="flex flex-col">
          <span className="font-mono font-bold text-[#004ac6] dark:text-blue-400">{order.orderNumber}</span>
          <span className="text-[#565e74] dark:text-slate-400 text-[11px]">{order.store}</span>
        </div>
      </td>
      <td className={`${TD} whitespace-nowrap`}>
        <div className="flex flex-col">
          <span className="font-medium">{order.date}</span>
          <span className="text-[#565e74] dark:text-slate-400 text-[11px]">{order.time}</span>
        </div>
      </td>
      <td className={TD}>
        <div className="flex flex-col gap-1">
          {order.items.map((item, idx) => {
            const href = storefrontProductUrl(item.slug);
            return href ? (
              <a
                key={idx}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="font-medium line-clamp-1 max-w-xs text-[#004ac6] dark:text-blue-400 hover:underline"
              >
                {item.name}
              </a>
            ) : (
              <span key={idx} className="font-medium line-clamp-1 max-w-xs">{item.name}</span>
            );
          })}
        </div>
      </td>
      <td className={`${TD} whitespace-nowrap`}>
        <div className="flex flex-col">
          <span className="font-bold">{formatWithCurrency(order.totalAmount)}</span>
          {order.taxIncludedPercent > 0 && (
            <span className="text-[#737686] text-[11px]">{t('customers_vat_included', { percent: order.taxIncludedPercent })}</span>
          )}
        </div>
      </td>
      <td className={`${TD} whitespace-nowrap`}>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#e5eeff] dark:bg-slate-700 text-[11px] font-semibold">
          <Icon name="check_circle" className="text-[14px] text-[#004ac6] dark:text-blue-400" />
          {t(`customers_order_status_${order.deliveryStatus}`, { defaultValue: order.deliveryStatus })}
        </span>
      </td>
      <td className={`${TD} whitespace-nowrap`}>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium">
          <PaymentIcon method={order.paymentMethod} />
          {order.paymentMethod}
        </span>
      </td>
      <td className={`${TD} text-right whitespace-nowrap`}>
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewInvoice(order);
            }}
            className="p-1.5 text-[#565e74] dark:text-slate-400 hover:text-[#004ac6] dark:hover:text-blue-400 hover:bg-[#eff4ff] dark:hover:bg-slate-800 rounded-lg transition-colors"
            title={t('customers_download_invoice')}
            type="button"
          >
            <Icon name="picture_as_pdf" className="text-[20px]" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(order);
            }}
            className="px-2.5 py-1 bg-[#eff4ff] dark:bg-slate-800 hover:bg-[#dae2fd] dark:hover:bg-slate-700 text-[11px] rounded-lg transition-colors font-medium"
            type="button"
          >
            {t('customers_details')}
          </button>
        </div>
      </td>
    </tr>
  );
};
