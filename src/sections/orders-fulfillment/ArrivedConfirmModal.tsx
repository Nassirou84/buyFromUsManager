import useLocales from '@/locales/use-locales';
import React, { useEffect, useState } from 'react';
import { Icon } from '@/components/lucide-icon';
import { Order } from './types';

export interface ArrivedDetails {
  /** Last four characters of the supplier order reference (backend `lastFour`). */
  lastFour: string;
  collectionNote: string;
}

interface ArrivedConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onConfirm: (details: ArrivedDetails) => void;
  isPending?: boolean;
}

const CARD = 'rounded-xl border border-[#e5eeff] dark:border-slate-800 bg-white dark:bg-[#131b2e] p-4';
const FIELD = 'w-full h-10 px-3 bg-[#eff4ff] dark:bg-slate-800 rounded-lg text-[13px] text-[#0b1c30] dark:text-white placeholder:text-[#737686] focus:outline-none border border-transparent focus:border-[#004ac6]/40 transition-colors';
const LABEL = 'text-[11.5px] font-bold text-[#565e74] dark:text-slate-400';
const STEP = 'w-6 h-6 rounded-full bg-[#943700] text-white text-[12px] font-bold flex items-center justify-center shrink-0';

/** Collection-confirmation form shown when moving an order from "in transit" to
 * "arrived in facility". The operator must first collect the parcel and verify the
 * items are complete, then confirm by entering the last four characters of the
 * supplier order reference (the backend checks it against the recorded reference). */
export const ArrivedConfirmModal: React.FC<ArrivedConfirmModalProps> = ({ isOpen, onClose, order, onConfirm, isPending }) => {
  const { t } = useLocales();
  const [lastFour, setLastFour] = useState('');
  const [collectionNote, setCollectionNote] = useState('');

  useEffect(() => {
    if (isOpen) {
      setLastFour('');
      setCollectionNote('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Show the recorded supplier reference with its last four characters withheld, so
  // the operator fills them in from the collected parcel to confirm the match.
  const reference = order.processing?.sellerOrderReference;
  const referencePrefix = reference && reference.length > 4 ? reference.slice(0, -4) : reference ? '' : undefined;

  // The backend matches `lastFour` against the final four characters of the
  // recorded reference, so require exactly four before enabling confirm.
  const canConfirm = lastFour.trim().length === 4 && !isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canConfirm) return;
    onConfirm({ lastFour: lastFour.trim(), collectionNote: collectionNote.trim() });
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
            <div className="w-3 h-6 bg-[#943700] rounded-full"></div>
            <div className="flex flex-col min-w-0">
              <h2 className="text-[15px] text-[#0b1c30] dark:text-white font-bold truncate">{t('orders_arrived_title')}</h2>
              <span className="text-[12px] text-[#565e74] dark:text-slate-400">{t('order_number', { number: order.orderNumber })}</span>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors shrink-0">
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex flex-col gap-5">
          {/* Step 1 — collect the parcel */}
          <div className={CARD}>
            <div className="flex items-center gap-2.5">
              <span className={STEP}>1</span>
              <div className="flex flex-col">
                <span className="text-[13.5px] font-bold text-[#0b1c30] dark:text-white">{t('orders_arrived_step1_title')}</span>
                <span className="text-[12px] text-[#565e74] dark:text-slate-400">{t('orders_arrived_step1_desc')}</span>
              </div>
            </div>
          </div>

          {/* Step 2 — verify the items are complete */}
          <div className={CARD}>
            <div className="flex items-center gap-2.5 mb-3">
              <span className={STEP}>2</span>
              <div className="flex flex-col">
                <span className="text-[13.5px] font-bold text-[#0b1c30] dark:text-white">{t('orders_arrived_step2_title')}</span>
                <span className="text-[12px] text-[#565e74] dark:text-slate-400">{t('orders_arrived_step2_desc')}</span>
              </div>
            </div>

            <div className="flex flex-col divide-y divide-[#f0f4ff] dark:divide-slate-800">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                  <img
                    src={item.variantImage || item.image}
                    alt={item.imageAlt}
                    className="w-11 h-11 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 border border-[#e5eeff] dark:border-slate-700 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[13px] font-semibold text-[#0b1c30] dark:text-white line-clamp-1">{item.title}</span>
                    {item.subtitle && (
                      <span className="text-[11.5px] text-[#565e74] dark:text-slate-400 line-clamp-1">{item.subtitle}</span>
                    )}
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#ffdbcd] text-[#943700] text-[12px] font-bold shrink-0">
                    {t('qty_label', { count: item.quantity })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Step 3 — confirm with the reference */}
          <div className={CARD}>
            <div className="flex items-center gap-2.5 mb-3">
              <span className={STEP}>3</span>
              <div className="flex flex-col">
                <span className="text-[13.5px] font-bold text-[#0b1c30] dark:text-white">{t('orders_arrived_step3_title')}</span>
                <span className="text-[12px] text-[#565e74] dark:text-slate-400">{t('orders_arrived_step3_desc')}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {referencePrefix !== undefined && (
                <div className="flex flex-col gap-1">
                  <span className={LABEL}>{t('orders_arrived_reference_label')}</span>
                  <div className="flex items-center gap-1 h-10 px-3 bg-[#eff4ff] dark:bg-slate-800 rounded-lg font-mono text-[13px] text-[#0b1c30] dark:text-white">
                    <span className="truncate">{referencePrefix}</span>
                    <span className="tracking-[0.3em] text-[#943700] dark:text-amber-300">XXXX</span>
                  </div>
                  <span className="text-[11px] text-[#737686]">{t('orders_arrived_reference_hint')}</span>
                </div>
              )}
              <div className="flex flex-col gap-1">
                <label className={LABEL}>{t('orders_arrived_lastfour_label')}</label>
                <input
                  className={`${FIELD} font-mono tracking-[0.3em] uppercase`}
                  value={lastFour}
                  onChange={(e) => setLastFour(e.target.value.replace(/\s/g, '').slice(0, 4))}
                  placeholder={t('orders_arrived_lastfour_ph')}
                  maxLength={4}
                  autoComplete="off"
                />
                <span className="text-[11px] text-[#737686]">{t('orders_arrived_lastfour_hint')}</span>
              </div>
              <div className="flex flex-col gap-1">
                <label className={LABEL}>{t('orders_stage_note')}</label>
                <textarea
                  className="w-full px-3 py-2 bg-[#eff4ff] dark:bg-slate-800 rounded-lg text-[13px] text-[#0b1c30] dark:text-white placeholder:text-[#737686] focus:outline-none border border-transparent focus:border-[#004ac6]/40 resize-y min-h-[64px]"
                  value={collectionNote}
                  onChange={(e) => setCollectionNote(e.target.value)}
                  placeholder={t('orders_arrived_note_ph')}
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
            <Icon name={isPending ? 'progress_activity' : 'warehouse'} className={`text-[17px] ${isPending ? 'animate-spin' : ''}`} />
            <span>{t('orders_arrived_confirm')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
