import useLocales from '@/locales/use-locales';
import React, { useEffect, useState } from 'react';
import { Icon } from '@/components/lucide-icon';
import { Order } from './types';

export interface ProcessingDetails {
  sellerName: string;
  reference: string;
  total: string;
  note: string;
  receipt: File | null;
}

interface ProcessingConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onConfirm: (details: ProcessingDetails) => void;
  isPending?: boolean;
}

const storefrontUrl = (slug?: string) =>
  slug ? `${process.env.NEXT_PUBLIC_STORE_FRONT_URL ?? ''}/products/${slug}` : null;

const STEP = 'w-6 h-6 rounded-full bg-[#004ac6] text-white text-[12px] font-bold flex items-center justify-center shrink-0';
const CARD = 'rounded-xl border border-[#e5eeff] dark:border-slate-800 bg-white dark:bg-[#131b2e] p-4';
const FIELD = 'w-full h-10 px-3 bg-[#eff4ff] dark:bg-slate-800 rounded-lg text-[13px] text-[#0b1c30] dark:text-white placeholder:text-[#737686] focus:outline-none border border-transparent focus:border-[#004ac6]/40 transition-colors';

/** Step-by-step supplier-order guide + confirmation form shown when moving an order to "processing". */
export const ProcessingConfirmModal: React.FC<ProcessingConfirmModalProps> = ({ isOpen, onClose, order, onConfirm, isPending }) => {
  const { t } = useLocales();
  const [sellerName, setSellerName] = useState('');
  const [reference, setReference] = useState('');
  const [total, setTotal] = useState('');
  const [note, setNote] = useState('');
  const [receipt, setReceipt] = useState<File | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSellerName('');
      setReference('');
      setTotal('');
      setNote('');
      setReceipt(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const canConfirm =
    sellerName.trim().length > 0 &&
    reference.trim().length > 0 &&
    total.trim().length > 0 &&
    receipt !== null &&
    !isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canConfirm) return;
    onConfirm({ sellerName: sellerName.trim(), reference: reference.trim(), total: total.trim(), note: note.trim(), receipt });
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="w-full max-w-5xl bg-[#f8f9ff] dark:bg-[#0b1326] rounded-2xl shadow-2xl border border-[#e5eeff] dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 bg-white dark:bg-[#131b2e] border-b border-[#e5eeff] dark:border-slate-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-3 h-6 bg-[#bc4800] rounded-full"></div>
            <div className="flex flex-col min-w-0">
              <h2 className="text-[15px] text-[#0b1c30] dark:text-white font-bold truncate">{t('orders_processing_title')}</h2>
              <span className="text-[12px] text-[#565e74] dark:text-slate-400">{t('order_number', { number: order.orderNumber })}</span>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors shrink-0">
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex flex-col gap-5">
          {/* Step 1 — place the supplier order */}
          <div className={CARD}>
            <div className="flex items-center gap-2.5 mb-3">
              <span className={STEP}>1</span>
              <div className="flex flex-col">
                <span className="text-[13.5px] font-bold text-[#0b1c30] dark:text-white">{t('orders_processing_step1_title')}</span>
                <span className="text-[12px] text-[#565e74] dark:text-slate-400">{t('orders_processing_step1_desc')}</span>
              </div>
            </div>

            <div className="flex flex-col divide-y divide-[#f0f4ff] dark:divide-slate-800">
              {order.items.map((item) => {
                const store = storefrontUrl(item.slug);
                return (
                  <div key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <img
                      src={item.variantImage || item.image}
                      alt={item.imageAlt}
                      className="w-14 h-14 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 border border-[#e5eeff] dark:border-slate-700 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      {store ? (
                        <a href={store} target="_blank" rel="noopener noreferrer" className="text-[13.5px] font-semibold text-[#004ac6] dark:text-blue-400 hover:underline line-clamp-1">
                          {item.title}
                        </a>
                      ) : (
                        <span className="text-[13.5px] font-semibold text-[#0b1c30] dark:text-white line-clamp-1">{item.title}</span>
                      )}
                      <div className="flex items-center gap-2 mt-1.5">
                        {item.subtitle && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#dae2fd] text-[#004ac6] text-[12px] font-bold">
                            {item.subtitle}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#ffdbcd] text-[#943700] text-[12px] font-bold">
                          {t('qty_label', { count: item.quantity })}
                        </span>
                      </div>
                    </div>
                    {item.scrapingUrl ? (
                      <a
                        href={item.scrapingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 h-9 bg-[#004ac6] hover:bg-[#003ea8] text-white text-[12px] font-semibold rounded-lg transition-colors shrink-0"
                      >
                        <Icon name="open_in_new" className="text-[16px]" />
                        <span>{t('orders_product_to_order')}</span>
                      </a>
                    ) : (
                      <span className="text-[11px] text-[#737686] shrink-0">{t('orders_no_supplier_link')}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2 — save the receipt */}
          <div className={CARD}>
            <div className="flex items-center gap-2.5">
              <span className={STEP}>2</span>
              <div className="flex flex-col">
                <span className="text-[13.5px] font-bold text-[#0b1c30] dark:text-white">{t('orders_processing_step2_title')}</span>
                <span className="text-[12px] text-[#565e74] dark:text-slate-400">{t('orders_processing_step2_desc')}</span>
              </div>
            </div>
          </div>

          {/* Step 3 — record the details */}
          <div className={CARD}>
            <div className="flex items-center gap-2.5 mb-3">
              <span className={STEP}>3</span>
              <div className="flex flex-col">
                <span className="text-[13.5px] font-bold text-[#0b1c30] dark:text-white">{t('orders_processing_step3_title')}</span>
                <span className="text-[12px] text-[#565e74] dark:text-slate-400">{t('orders_processing_step3_desc')}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[11.5px] font-bold text-[#565e74] dark:text-slate-400">{t('orders_processing_seller_label')}</label>
                <input className={FIELD} value={sellerName} onChange={(e) => setSellerName(e.target.value)} placeholder={t('orders_processing_seller_ph')} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11.5px] font-bold text-[#565e74] dark:text-slate-400">{t('orders_processing_ref_label')}</label>
                <input className={FIELD} value={reference} onChange={(e) => setReference(e.target.value)} placeholder={t('orders_processing_ref_ph')} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11.5px] font-bold text-[#565e74] dark:text-slate-400">{t('orders_processing_total_label')}</label>
                <input className={FIELD} value={total} onChange={(e) => setTotal(e.target.value)} placeholder={t('orders_processing_total_ph')} inputMode="decimal" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11.5px] font-bold text-[#565e74] dark:text-slate-400">{t('orders_processing_receipt_label')}</label>
                {receipt ? (
                  <div className="flex items-center gap-2 h-10 px-3 bg-[#eff4ff] dark:bg-slate-800 rounded-lg">
                    <Icon name="description" className="text-[18px] text-[#004ac6] dark:text-blue-400 shrink-0" />
                    <span className="text-[13px] text-[#0b1c30] dark:text-white truncate flex-1" title={receipt.name}>{receipt.name}</span>
                    <button
                      type="button"
                      onClick={() => setReceipt(null)}
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
                      onChange={(e) => setReceipt(e.target.files?.[0] ?? null)}
                    />
                  </label>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11.5px] font-bold text-[#565e74] dark:text-slate-400">{t('orders_processing_note_label')}</label>
                <textarea
                  className="w-full px-3 py-2 bg-[#eff4ff] dark:bg-slate-800 rounded-lg text-[13px] text-[#0b1c30] dark:text-white placeholder:text-[#737686] focus:outline-none border border-transparent focus:border-[#004ac6]/40 resize-y min-h-[64px]"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
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
            <Icon name={isPending ? 'progress_activity' : 'check_circle'} className={`text-[17px] ${isPending ? 'animate-spin' : ''}`} />
            <span>{t('orders_processing_confirm')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
