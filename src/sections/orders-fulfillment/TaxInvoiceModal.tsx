import useLocales from '@/locales/use-locales';
import React from 'react';
import { Icon } from '@/components/lucide-icon';
import { Order } from './types';

interface TaxInvoiceModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TaxInvoiceModal: React.FC<TaxInvoiceModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  const { t } = useLocales();

  if (!isOpen || !order) return null;

  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full p-8 shadow-2xl border border-slate-200 text-slate-800 animate-in fade-in zoom-in-95 duration-150 flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
        {/* Invoice Header */}
        <div className="flex items-start justify-between border-b border-slate-200 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#004ac6] text-white flex items-center justify-center font-bold text-xl">
              F
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Flot Boutique Atelier Ltd.
              </h2>
              <p className="text-xs text-slate-500">
                450 Sutter St, Suite 1400 • San Francisco, CA 94108 • Tax ID: US-94-281902
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="px-2.5 py-1 bg-blue-50 text-[#004ac6] font-bold text-xs rounded uppercase tracking-wider">
              {t('tax_invoice')}
            </span>
            <div className="font-mono text-sm font-bold text-slate-900 mt-1">
              INV-{order.orderNumber.replace('#', '')}
            </div>
            <div className="text-xs text-slate-500">{order.dateStr}</div>
          </div>
        </div>

        {/* Bill To & Dispatch */}
        <div className="grid grid-cols-2 gap-6 text-xs leading-relaxed">
          <div>
            <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">
              {t('billed_shipped_to')}
            </span>
            <div className="font-bold text-sm text-slate-900">{order.shippingAddress.name}</div>
            <div className="text-slate-600">{order.shippingAddress.street}</div>
            <div className="text-slate-600">
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
            </div>
            <div className="text-slate-600">{order.shippingAddress.country}</div>
            <div className="text-slate-500 font-mono mt-1">{order.customerEmail}</div>
          </div>

          <div className="text-right flex flex-col items-end">
            <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">
              {t('payment_logistics')}
            </span>
            <div className="text-slate-700 font-semibold">{order.paymentMethod}</div>
            <div className="text-slate-600 mt-0.5">{t('carrier_label', { carrier: order.carrier || 'DHL Express Worldwide' })}</div>
            <div className="text-slate-600 font-mono text-[11px]">
              {t('tracking_label', { tracking: order.trackingNumber || t('pending') })}
            </div>
            <div className="text-emerald-700 font-bold mt-1 bg-emerald-50 px-2 py-0.5 rounded">
              {t('paid_in_full')}
            </div>
          </div>
        </div>

        {/* Table of items */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase">
              <tr>
                <th className="py-2.5 px-3">{t('item_description')}</th>
                <th className="py-2.5 px-3">{t('sku')}</th>
                <th className="py-2.5 px-3 text-center">{t('qty')}</th>
                <th className="py-2.5 px-3 text-right">{t('unit_price')}</th>
                <th className="py-2.5 px-3 text-right">{t('amount')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-2.5 px-3">
                    <span className="font-bold text-slate-900">{item.title}</span>
                    <span className="block text-slate-500 text-[11px]">{item.subtitle}</span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">{item.sku}</td>
                  <td className="py-2.5 px-3 text-center font-bold">{item.quantity}</td>
                  <td className="py-2.5 px-3 text-right font-mono">${item.price.toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold">
                    ${(item.price * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 flex flex-col gap-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>{t('subtotal')}</span>
              <span className="font-mono font-semibold">${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>{t('express_priority_shipping')}</span>
              <span className="font-mono text-emerald-700 font-semibold">{t('free_amount')}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>{t('california_sales_tax')}</span>
              <span className="font-mono font-semibold">${order.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-300">
              <span>{t('total_authorized')}</span>
              <span className="font-mono text-[#004ac6] text-base">${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <span className="text-[11px] text-slate-400">
            {t('auto_invoice_footer')}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 bg-[#004ac6] hover:bg-[#003ea8] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Icon name="print" className="text-[16px]"/>
              <span>{t('print_download_pdf')}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
            >
              {t('close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
