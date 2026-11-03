import useLocales from '@/locales/use-locales';
import React, { useEffect, useState } from 'react';
import { Icon } from '@/components/lucide-icon';
import useGetCourriers from '@/api/courrier/get-courriers';
import { Order } from './types';

export interface TransitDetails {
  /** Courrier id, sent to the backend as `carrier`. */
  carrierId: string;
  /** Carrier name and pickup details, used only for the optimistic UI update. */
  shippedBy: string;
  pickupAddress: string;
  pickupContact: string;
  shippingCost: string;
  shippingNote: string;
  shippingReceipt: File | null;
}

interface TransitConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onConfirm: (details: TransitDetails) => void;
  isPending?: boolean;
}

const CARD = 'rounded-xl border border-[#e5eeff] dark:border-slate-800 bg-white dark:bg-[#131b2e] p-4';
const FIELD = 'w-full h-10 px-3 bg-[#eff4ff] dark:bg-slate-800 rounded-lg text-[13px] text-[#0b1c30] dark:text-white placeholder:text-[#737686] focus:outline-none border border-transparent focus:border-[#004ac6]/40 transition-colors';
const LABEL = 'text-[11.5px] font-bold text-[#565e74] dark:text-slate-400';

/** Shipping-details form shown when moving an order from "processed" to "in transit".
 * The carrier is picked from the registered Courrier partners; its name and pickup
 * details fill the shipped-by / pickup fields the backend expects. */
export const TransitConfirmModal: React.FC<TransitConfirmModalProps> = ({ isOpen, onClose, order, onConfirm, isPending }) => {
  const { t } = useLocales();
  const { data: courriers = [], isLoading } = useGetCourriers();
  const [courrierId, setCourrierId] = useState('');
  const [shippingCost, setShippingCost] = useState('');
  const [shippingNote, setShippingNote] = useState('');
  const [shippingReceipt, setShippingReceipt] = useState<File | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCourrierId('');
      setShippingCost('');
      setShippingNote('');
      setShippingReceipt(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const selectedCourrier = courriers.find((c) => String(c.id) === courrierId) ?? null;
  // The backend requires both a carrier and a shipping cost.
  const canConfirm = !!selectedCourrier && shippingCost.trim().length > 0 && !isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canConfirm || !selectedCourrier) return;
    onConfirm({
      carrierId: String(selectedCourrier.id),
      shippedBy: selectedCourrier.name,
      pickupAddress: selectedCourrier.pickupLocation,
      pickupContact: selectedCourrier.pickupContact,
      shippingCost: shippingCost.trim(),
      shippingNote: shippingNote.trim(),
      shippingReceipt,
    });
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="w-full max-w-2xl bg-[#f8f9ff] dark:bg-[#0b1326] rounded-2xl shadow-2xl border border-[#e5eeff] dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 bg-white dark:bg-[#131b2e] border-b border-[#e5eeff] dark:border-slate-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-3 h-6 bg-[#6d28d9] rounded-full"></div>
            <div className="flex flex-col min-w-0">
              <h2 className="text-[15px] text-[#0b1c30] dark:text-white font-bold truncate">{t('orders_transit_title')}</h2>
              <span className="text-[12px] text-[#565e74] dark:text-slate-400">{t('order_number', { number: order.orderNumber })}</span>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors shrink-0">
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex flex-col gap-5">
          <div className={CARD}>
            <div className="flex items-center gap-2.5 mb-3">
              <span className="p-2 rounded-lg bg-[#ede9fe] text-[#6d28d9] dark:bg-violet-950 dark:text-violet-300">
                <Icon name="flight_takeoff" className="text-[18px]" />
              </span>
              <div className="flex flex-col">
                <span className="text-[13.5px] font-bold text-[#0b1c30] dark:text-white">{t('orders_stage_transit')}</span>
                <span className="text-[12px] text-[#565e74] dark:text-slate-400">{t('orders_transit_desc')}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className={LABEL}>{t('orders_transit_carrier')}</label>
                <select
                  className={`${FIELD} cursor-pointer disabled:cursor-not-allowed disabled:opacity-60`}
                  value={courrierId}
                  onChange={(e) => setCourrierId(e.target.value)}
                  disabled={isLoading || courriers.length === 0}
                >
                  <option value="" disabled>
                    {isLoading
                      ? t('carrier_loading')
                      : courriers.length === 0
                        ? t('orders_transit_no_carriers')
                        : t('orders_transit_select_carrier')}
                  </option>
                  {courriers.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {selectedCourrier && (
                  <div className="mt-1 flex flex-col gap-0.5 text-[11.5px] text-[#565e74] dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Icon name="pin_drop" className="text-[13px] shrink-0" />
                      {selectedCourrier.pickupLocation}
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon name="call" className="text-[13px] shrink-0" />
                      {selectedCourrier.pickupContact}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label className={LABEL}>{t('orders_stage_shipping_cost')}</label>
                <input className={FIELD} value={shippingCost} onChange={(e) => setShippingCost(e.target.value)} placeholder={t('orders_transit_cost_ph')} inputMode="decimal" />
              </div>
              <div className="flex flex-col gap-1">
                <label className={LABEL}>{t('orders_stage_shipping_receipt')}</label>
                {shippingReceipt ? (
                  <div className="flex items-center gap-2 h-10 px-3 bg-[#eff4ff] dark:bg-slate-800 rounded-lg">
                    <Icon name="description" className="text-[18px] text-[#004ac6] dark:text-blue-400 shrink-0" />
                    <span className="text-[13px] text-[#0b1c30] dark:text-white truncate flex-1" title={shippingReceipt.name}>{shippingReceipt.name}</span>
                    <button
                      type="button"
                      onClick={() => setShippingReceipt(null)}
                      className="p-0.5 rounded text-slate-400 hover:text-[#ba1a1a] transition-colors shrink-0"
                      title={t('remove')}
                    >
                      <Icon name="close" className="text-[18px]" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center gap-2 h-10 px-3 bg-[#eff4ff] dark:bg-slate-800 rounded-lg border border-dashed border-[#c3c6d7] dark:border-slate-600 text-[13px] text-[#565e74] dark:text-slate-400 cursor-pointer hover:border-[#004ac6]/50 transition-colors">
                    <Icon name="upload_file" className="text-[18px] text-[#004ac6] dark:text-blue-400" />
                    <span>{t('orders_processing_receipt_ph')}</span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={(e) => setShippingReceipt(e.target.files?.[0] ?? null)}
                    />
                  </label>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label className={LABEL}>{t('orders_stage_note')}</label>
                <textarea
                  className="w-full px-3 py-2 bg-[#eff4ff] dark:bg-slate-800 rounded-lg text-[13px] text-[#0b1c30] dark:text-white placeholder:text-[#737686] focus:outline-none border border-transparent focus:border-[#004ac6]/40 resize-y min-h-[64px]"
                  value={shippingNote}
                  onChange={(e) => setShippingNote(e.target.value)}
                  placeholder={t('orders_processing_note_ph')}
                />
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 bg-white dark:bg-[#131b2e] border-t border-[#e5eeff] dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-3.5 h-10 bg-[#eff4ff] dark:bg-slate-800 text-[#0b1c30] dark:text-white hover:bg-[#dae2fd] dark:hover:bg-slate-700 text-[13px] rounded-lg transition-colors font-medium disabled:opacity-60"
          >
            {t('cancel')}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canConfirm}
            className="inline-flex items-center gap-1.5 px-4 h-10 bg-[#004ac6] hover:bg-[#003ea8] text-white text-[13px] font-bold rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Icon name={isPending ? 'progress_activity' : 'flight_takeoff'} className={`text-[17px] ${isPending ? 'animate-spin' : ''}`} />
            <span>{t('orders_transit_confirm')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
