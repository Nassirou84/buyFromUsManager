import useLocales from '@/locales/use-locales';
import React from 'react';
import { toast } from 'sonner';
import { Icon } from '@/components/lucide-icon';
import { Customer, CustomerOrder } from './types';

interface InvoicePdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer;
  order: CustomerOrder | null;
}

export const InvoicePdfModal: React.FC<InvoicePdfModalProps> = ({ isOpen, onClose, customer, order }) => {
  const { t } = useLocales();

  if (!isOpen || !order) return null;

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="w-full max-w-2xl bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Icon name="receipt_long" className="text-[22px] text-[#004ac6]" />
            <span className="font-bold text-base text-slate-900">
              {t('customers_invoice_title', { order: order.orderNumber })}
            </span>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-800 transition-colors">
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        <div className="p-8 overflow-y-auto flex flex-col gap-6 text-sm">
          <div className="flex items-start justify-between border-b border-slate-200 pb-6">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-[#004ac6] text-white font-bold flex items-center justify-center text-sm">F</div>
                <span className="font-bold text-lg text-slate-900">Flot Boutique CI</span>
              </div>
              <span className="text-xs text-slate-500 mt-1">Société Flot Retail S.A.R.L.</span>
              <span className="text-xs text-slate-500">Boulevard de la République, Plateau, Abidjan</span>
              <span className="text-xs text-slate-500">N° RCCM: CI-ABJ-2023-B-14289 • CC: 2309142</span>
            </div>

            <div className="flex flex-col text-right">
              <span className="font-bold text-xl text-[#004ac6]">{t('customers_invoice_proforma')}</span>
              <span className="font-mono text-xs text-slate-700 font-bold mt-1">{order.orderNumber}</span>
              <span className="text-xs text-slate-500">{t('customers_inv_date', { date: order.date })}</span>
              <span className="text-xs text-slate-500">{t('customers_inv_status', { status: order.deliveryStatus })}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                {t('customers_inv_billed_to')}
              </span>
              <p className="font-bold text-slate-900">{customer.name}</p>
              <p className="text-xs text-slate-600">{customer.email}</p>
              <p className="text-xs text-slate-600">{customer.phone}</p>
              <p className="text-xs text-slate-600 font-mono mt-1">{t('customers_inv_client_no', { id: customer.id })}</p>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                {t('customers_inv_ship_to')}
              </span>
              <p className="text-xs text-slate-700 font-medium">{customer.deliveryAddress.residence}</p>
              <p className="text-xs text-slate-600">{customer.deliveryAddress.district}</p>
              <p className="text-xs text-slate-600">{customer.deliveryAddress.city}</p>
              <p className="text-xs text-[#004ac6] font-medium mt-1">
                {t('customers_inv_payment', { method: order.paymentMethod })}
              </p>
            </div>
          </div>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-300 font-bold text-slate-700 bg-slate-100">
                <th className="py-2.5 px-3">{t('customers_inv_desc')}</th>
                <th className="py-2.5 px-3 text-center">{t('customers_inv_qty')}</th>
                <th className="py-2.5 px-3 text-right">{t('customers_inv_unit')}</th>
                <th className="py-2.5 px-3 text-right">{t('customers_inv_total')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {order.items.map((it, idx) => (
                <tr key={idx}>
                  <td className="py-3 px-3">
                    <p className="font-bold text-slate-900">{it.name}</p>
                    <p className="text-[11px] text-slate-500">
                      {it.variant} {it.warranty ? `• ${it.warranty}` : ''} {it.batteryHealth ? `• ${it.batteryHealth}` : ''}
                    </p>
                  </td>
                  <td className="py-3 px-3 text-center">{it.quantity}</td>
                  <td className="py-3 px-3 text-right">{it.price.toLocaleString()} FCFA</td>
                  <td className="py-3 px-3 text-right font-bold">{(it.price * it.quantity).toLocaleString()} FCFA</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex flex-col items-end gap-1.5 pt-2 border-t border-slate-200 text-xs">
            <div className="flex justify-between w-64">
              <span className="text-slate-500">{t('customers_inv_subtotal')}</span>
              <span className="font-semibold text-slate-800">{Math.round(order.totalAmount / 1.18).toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between w-64">
              <span className="text-slate-500">{t('customers_inv_vat')}</span>
              <span className="font-semibold text-slate-800">
                {Math.round(order.totalAmount - order.totalAmount / 1.18).toLocaleString()} FCFA
              </span>
            </div>
            <div className="flex justify-between w-64">
              <span className="text-slate-500">{t('customers_inv_shipping')}</span>
              <span className="font-semibold text-emerald-600">{t('customers_inv_free')}</span>
            </div>
            <div className="flex justify-between w-64 pt-2 border-t border-slate-300 text-base font-bold text-slate-900">
              <span>{t('customers_inv_net')}</span>
              <span className="text-[#004ac6]">{order.totalAmount.toLocaleString()} FCFA</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
          <button
            type="button"
            onClick={() => {
              toast.success(t('customers_toast_invoice_sent', { order: order.orderNumber, email: customer.email }));
              onClose();
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs rounded-lg transition-colors"
          >
            <Icon name="mail" className="text-[16px]" />
            <span>{t('customers_inv_email')}</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#2563eb] hover:bg-[#004ac6] text-white font-semibold text-xs rounded-lg shadow-sm transition-colors"
          >
            <Icon name="print" className="text-[16px]" />
            <span>{t('customers_inv_print')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
