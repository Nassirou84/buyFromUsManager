import useLocales from '@/locales/use-locales';
import React from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@/components/lucide-icon';
import useGetOrderInvoice from '@/api/user/get-order-invoice';
import { Order } from './types';

interface TaxInvoiceModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

/** Official storefront receipt for an order. Fetches the same `/orders/{uid}/receipt`
 * payload the storefront uses (as admin) and renders it with the same layout as the
 * store-customers InvoicePdfModal, so admins see exactly what the customer receives. */
export const TaxInvoiceModal: React.FC<TaxInvoiceModalProps> = ({ order, isOpen, onClose }) => {
  const { t } = useLocales();

  const { data: invoice, isLoading, isError } = useGetOrderInvoice(order?.uid, isOpen && !!order);

  if (!isOpen || !order || typeof document === 'undefined') return null;

  const inv = invoice?.order;
  const currency = inv?.currency ?? 'FCFA';
  const fmt = (value?: number | null) => `${Number(value ?? 0).toLocaleString()} ${currency}`;

  const createdAtRaw = typeof inv?.createdAt === 'string' ? inv?.createdAt : inv?.createdAt?.date;
  const createdAt = createdAtRaw ? new Date(createdAtRaw.replace(' ', 'T')) : null;
  const dateTime = createdAt && !isNaN(createdAt.getTime())
    ? createdAt.toLocaleString([], { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : order.dateStr;

  return createPortal(
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="receipt-print-root fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="w-full max-w-3xl bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top bar (hidden in print) */}
        <div className="print:hidden flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-200">
          <span className="text-[13px] font-semibold text-slate-700">{t('invoice_official_receipt')}</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => window.print()}
              className="h-8 px-3 rounded-md text-xs font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] transition-colors inline-flex items-center gap-1.5 shadow-sm"
            >
              <Icon name="print" className="text-[16px]" />
              <span>{t('invoice_print')}</span>
            </button>
            <button type="button" onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-800 transition-colors">
              <Icon name="close" className="text-[20px]" />
            </button>
          </div>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto bg-slate-100/60">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-20 text-slate-500 text-sm">
              <Icon name="progress_activity" className="text-[22px] animate-spin" />
              <span>{t('invoice_loading')}</span>
            </div>
          ) : isError || !inv ? (
            <div className="flex flex-col items-center justify-center gap-2 py-20 text-slate-500 text-sm">
              <Icon name="error_outline" className="text-[26px]" />
              <span>{t('invoice_error')}</span>
            </div>
          ) : (
            <div className="receipt-page bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden divide-y divide-slate-200">
              {/* Header with barcode */}
              <div className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#2563eb] bg-[#eff4ff] px-1.5 py-0.5 rounded border border-[#dce9ff]">
                        {(inv.paymentStatus ?? inv.payment?.status) === 'completed'
                          ? t('invoice_paid_confirmed')
                          : t('invoice_awaiting_payment')}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">Invoice #{inv.reference}</span>
                    </div>
                    <h1 className="text-lg sm:text-xl font-bold text-[#0b1c30] tracking-tight">{t('invoice_official_receipt')}</h1>
                    <p className="text-xs text-slate-500">
                      {t('invoice_dispatched_to', { email: inv.customer.email || order.customerEmail })}
                    </p>
                  </div>

                  {invoice?.barcode && (
                    <div className="p-2 sm:p-2.5 bg-[#f8f9ff] border border-slate-200 rounded self-start sm:self-auto shrink-0 text-center">
                      <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold block mb-0.5">
                        {t('invoice_scan_hint')}
                      </span>
                      <img src={invoice.barcode} alt={inv.reference} className="mx-auto h-10" width={120} height={40} />
                      <span className="text-[10px] font-mono text-slate-500 block mt-1">{inv.reference}</span>
                    </div>
                  )}
                </div>

                {/* Metadata strip */}
                <div className="mt-3 pt-3 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">{t('invoice_order_reference')}</span>
                    <span className="font-mono font-bold text-[#0b1c30] text-xs">{inv.reference}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">{t('invoice_date_time')}</span>
                    <span className="font-medium text-[#0b1c30]">{dateTime}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">{t('invoice_payment')}</span>
                    <span className="font-medium text-[#0b1c30]">
                      {inv.payment?.method ?? '—'} {inv.payment?.last4 ? `•••• ${inv.payment.last4}` : ''}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">{t('invoice_shipping_tier')}</span>
                    <span className="font-medium text-[#0b1c30]">{inv.shipping_tier}</span>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="p-4 sm:p-5">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#0b1c30]">
                    {t('invoice_items_ordered')} ({inv.items.length})
                  </h2>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {t('invoice_tracking_number')}: {inv.reference}
                  </span>
                </div>

                <div className="border border-slate-200 rounded overflow-hidden text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#f8f9ff] text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                        <th className="py-1.5 px-3">{t('invoice_item_description')}</th>
                        <th className="py-1.5 px-2 hidden sm:table-cell">{t('invoice_sku')}</th>
                        <th className="py-1.5 px-2 text-center">{t('invoice_qty')}</th>
                        <th className="py-1.5 px-2 text-right">{t('invoice_price')}</th>
                        <th className="py-1.5 px-3 text-right">{t('invoice_total')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {inv.items.map((item, idx) => (
                        <tr key={`${item.sku}-${idx}`} className="hover:bg-[#f8f9ff]/50 transition-colors">
                          <td className="py-1.5 px-3 w-1/2">
                            <p className="line-clamp-1 text-[#0b1c30]">{item.productName}</p>
                            {item.variant && <p className="text-slate-500 truncate">{item.variant}</p>}
                          </td>
                          <td className="py-1.5 px-2 font-mono text-[10px] text-slate-500 hidden sm:table-cell">{item.sku}</td>
                          <td className="py-1.5 px-2 text-center text-[#0b1c30] font-medium">{item.qty}</td>
                          <td className="py-1.5 px-2 text-right text-slate-600">{fmt(item.unit_price)}</td>
                          <td className="py-1.5 px-3 text-right font-medium text-[#0b1c30] whitespace-nowrap">
                            {fmt(item.unit_price * item.qty)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Info & financial summary */}
              <div className="p-4 sm:p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">{t('invoice_delivering_to')}</h3>
                      <div className="text-slate-700 leading-snug">
                        <p className="font-semibold text-[#0b1c30]">{inv.customer.fullName || order.customerName}</p>
                        <p>{inv.customer.address}</p>
                        <p>{t('invoice_phone')}: {inv.customer.phone || order.shippingAddress.phone}</p>
                        <p className="text-[11px] text-slate-500">{t('invoice_shipping_tier')}: {inv.shipping_tier}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200">
                      <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">{t('invoice_payment_verification')}</h3>
                      <div className="text-[11px] text-slate-600 space-y-0.5">
                        <p>
                          {t('invoice_payment_method')}:{' '}
                          <strong className="text-[#0b1c30] font-medium">
                            {inv.payment?.method ?? '—'} {inv.payment?.last4 ? `•••• ${inv.payment.last4}` : ''}
                          </strong>
                        </p>
                        {inv.payment?.transactionId && <p className="font-mono">Ref: {inv.payment.transactionId}</p>}
                        {inv.payment?.status && <p className="text-emerald-700 font-medium">{t('invoice_status')}: {inv.payment.status}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#f8f9ff] p-3 rounded border border-slate-200 flex flex-col justify-between space-y-1.5">
                    <div className="space-y-1.5 text-xs text-slate-700">
                      <div className="flex justify-between">
                        <span>{t('invoice_subtotal')} ({inv.items.length} {t('invoice_items')})</span>
                        <span className="font-medium text-[#0b1c30]">{fmt(inv.subtotal)}</span>
                      </div>
                      {inv.discount > 0 && (
                        <div className="flex justify-between text-emerald-700">
                          <span>{t('invoice_discount')}</span>
                          <span className="font-medium">-{fmt(inv.discount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>{t('invoice_shipping_handling')}</span>
                        <span className="font-semibold text-emerald-600">{fmt(inv.shipping)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('invoice_sales_tax')} ({inv.taxRate}%)</span>
                        <span className="font-medium text-[#0b1c30]">{fmt(inv.tax)}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                      <div>
                        <span className="font-bold text-xs sm:text-sm text-[#0b1c30] block">{t('invoice_total')}</span>
                        <span className="text-[10px] text-slate-500">{t('invoice_all_incl')}</span>
                      </div>
                      <span className="font-bold text-sm sm:text-base text-[#0b1c30]">{fmt(inv.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer note */}
              <div className="py-2.5 px-4 sm:px-5 bg-[#f8f9ff] flex items-center gap-1.5 text-[11px] text-slate-600">
                <Icon name="verified_user" className="text-[16px] text-[#2563eb] shrink-0" />
                <span>{t('invoice_returns_note')}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
