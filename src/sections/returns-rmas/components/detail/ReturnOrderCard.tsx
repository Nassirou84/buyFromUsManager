import React from 'react';
import Link from 'next/link';
import useLocales from '@/locales/use-locales';
import { Icon } from '@/components/lucide-icon';
import { formatWithCurrency } from '@/utils/lodash';
import { type RmaOrder } from '../../types';
import { SectionCard } from '../common/SectionCard';

const TotalRow: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="flex items-center justify-between py-0.5 text-[#565e74] dark:text-slate-400">
    <span>{label}</span>
    <span className="text-[#0b1c30] dark:text-white">{formatWithCurrency(value)}</span>
  </div>
);

interface ReturnOrderCardProps {
  order: RmaOrder;
  customerEmail: string;
}

// The order this return belongs to: customer, shipping address, dates and totals.
export const ReturnOrderCard: React.FC<ReturnOrderCardProps> = ({ order, customerEmail }) => {
  const { t } = useLocales();

  return (
    <SectionCard
      icon="receipt_long"
      title={t('rma_order_details')}
      badge={
        order.isPriority && (
          <span className="px-2 py-0.5 rounded-full bg-[#ffdbcd] text-[#943700] text-[10px] font-bold">
            {t('rma_order_priority')}
          </span>
        )
      }
      aside={
        order.uid && (
          <Link
            href={`/dashboard/orders-fulfillment/${order.uid}`}
            className="flex items-center gap-1 text-[12px] font-semibold text-[#004ac6] dark:text-blue-400 hover:underline"
          >
            <span>{t('rma_view_order')}</span>
            <Icon name="chevron_right" className="text-[16px]" />
          </Link>
        )
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Order & customer */}
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] text-[#565e74] dark:text-slate-400">{t('rma_order_number')}</span>
          <span className="text-[13px] text-[#0b1c30] dark:text-white font-semibold break-all">{order.uid || '—'}</span>
          <span className="text-[13px] text-[#0b1c30] dark:text-white font-semibold mt-1.5">
            {order.fullName || customerEmail}
          </span>
          <span className="text-[12px] text-[#565e74] dark:text-slate-400 truncate">{customerEmail}</span>
          {order.phone && <span className="text-[12px] text-[#565e74] dark:text-slate-400">{order.phone}</span>}
        </div>

        {/* Shipping address */}
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] text-[#565e74] dark:text-slate-400">{t('rma_shipping_address')}</span>
          {order.addressLines.length > 0 ? (
            <div className="text-[12px] text-[#0b1c30] dark:text-white leading-snug">
              {order.addressLines.map((line, idx) => (
                <p key={idx}>{line}</p>
              ))}
            </div>
          ) : (
            <span className="text-[12px] text-[#565e74] dark:text-slate-400">—</span>
          )}
        </div>

        {/* Dates */}
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] text-[#565e74] dark:text-slate-400">{t('rma_order_placed')}</span>
          <span className="text-[13px] text-[#0b1c30] dark:text-white font-semibold">{order.createdAtStr || '—'}</span>
          {order.deliveredAtStr && (
            <>
              <span className="text-[11px] text-[#565e74] dark:text-slate-400 mt-1.5">{t('rma_order_delivered')}</span>
              <span className="text-[13px] text-[#0b1c30] dark:text-white font-semibold">{order.deliveredAtStr}</span>
            </>
          )}
        </div>
      </div>

      {/* Order totals */}
      <div className="flex flex-col gap-1 text-[13px] bg-[#eff4ff]/60 dark:bg-slate-800/60 p-4 rounded-lg">
        {order.discount > 0 && (
          <>
            <TotalRow label={t('rma_order_subtotal')} value={order.orderPrice + order.discount} />
            <div className="flex items-center justify-between py-0.5">
              <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                {t('rma_order_discount')}
                {order.promoCode && (
                  <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded text-[10px] font-semibold uppercase tracking-wide">
                    {order.promoCode}
                  </span>
                )}
              </span>
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                {formatWithCurrency(-order.discount)}
              </span>
            </div>
          </>
        )}
        {order.taxes > 0 && <TotalRow label={t('rma_order_taxes')} value={order.taxes} />}
        {order.shippingFee > 0 && <TotalRow label={t('rma_order_shipping')} value={order.shippingFee} />}
        <div className="flex items-center justify-between py-1 text-[14px] font-bold text-[#0b1c30] dark:text-white">
          <span>{t('rma_order_total')}</span>
          <span className="text-[#004ac6] dark:text-blue-400">{formatWithCurrency(order.orderPrice)}</span>
        </div>
      </div>
    </SectionCard>
  );
};
