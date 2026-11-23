'use client';

import useLocales from '@/locales/use-locales';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Icon } from '@/components/lucide-icon';
import { addTrackingNumbers, TrackingNumberEntry } from '@/api/order/add-tracking-numbers';
import { Order } from './types';

interface TrackingNumbersModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  /** Called after new tracking numbers are persisted, with the full up-to-date list
   * (existing + newly added), so the caller can reflect it immediately. */
  onSaved: (trackingNumbers: TrackingNumberEntry[]) => void;
}

const CARD = 'rounded-xl border border-[#e5eeff] dark:border-slate-800 bg-white dark:bg-[#131b2e] p-4';
const FIELD = 'w-full h-10 px-3 bg-[#eff4ff] dark:bg-slate-800 rounded-lg text-[13px] text-[#0b1c30] dark:text-white placeholder:text-[#737686] focus:outline-none border border-transparent focus:border-[#004ac6]/40 transition-colors';
const LABEL = 'text-[11.5px] font-bold text-[#565e74] dark:text-slate-400';

const emptyRow = (): TrackingNumberEntry => ({ trackingNumber: '', carrierName: '' });

/** Pre-transit step: an order may ship in one or many packages, each with its own
 * tracking number and carrier. The operator records them here before moving the order
 * to "in transit" (the backend blocks that transition until at least one exists).
 * New entries are appended through POST /api/admin/orders/{uid}/tracking-numbers. */
export const TrackingNumbersModal: React.FC<TrackingNumbersModalProps> = ({ isOpen, onClose, order, onSaved }) => {
  const { t } = useLocales();
  const saved = order.processing?.trackingNumbers ?? [];
  const [rows, setRows] = useState<TrackingNumberEntry[]>([emptyRow()]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRows([emptyRow()]);
      setIsSaving(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const updateRow = (idx: number, patch: Partial<TrackingNumberEntry>) =>
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));

  const addRow = () => setRows((prev) => [...prev, emptyRow()]);

  const removeRow = (idx: number) =>
    setRows((prev) => (prev.length === 1 ? [emptyRow()] : prev.filter((_, i) => i !== idx)));

  // Rows where the operator has started typing — fully empty rows are ignored on save.
  const touchedRows = rows.filter((r) => r.trackingNumber.trim() !== '' || r.carrierName.trim() !== '');
  // A row is only valid once BOTH the number and the carrier name are present.
  const validRows = touchedRows
    .filter((r) => r.trackingNumber.trim() !== '' && r.carrierName.trim() !== '')
    .map((r) => ({ trackingNumber: r.trackingNumber.trim(), carrierName: r.carrierName.trim() }));
  const hasPartialRow = touchedRows.length !== validRows.length;
  const canSave = validRows.length > 0 && !hasPartialRow && !isSaving;

  const handleSave = async () => {
    if (!canSave) return;
    setIsSaving(true);
    try {
      await addTrackingNumbers(order.uid, validRows);
      onSaved([...saved, ...validRows]);
      toast.success(t('orders_tracking_saved'));
      onClose();
    } catch {
      toast.error(t('orders_tracking_save_error'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="w-full max-w-lg bg-[#f8f9ff] dark:bg-[#0b1326] rounded-2xl shadow-2xl border border-[#e5eeff] dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 bg-white dark:bg-[#131b2e] border-b border-[#e5eeff] dark:border-slate-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-3 h-6 bg-[#6d28d9] rounded-full"></div>
            <div className="flex flex-col min-w-0">
              <h2 className="text-[15px] text-[#0b1c30] dark:text-white font-bold truncate">{t('orders_tracking_title')}</h2>
              <span className="text-[12px] text-[#565e74] dark:text-slate-400">{t('order_number', { number: order.orderNumber })}</span>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors shrink-0">
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex flex-col gap-4">
          {/* Instructions */}
          <div className="flex items-start gap-3 px-4 py-3 bg-[#eff4ff] dark:bg-slate-800/60 rounded-lg border border-[#dae2fd] dark:border-slate-700">
            <span className="p-1.5 rounded-full bg-[#dae2fd] text-[#004ac6] dark:bg-blue-950 dark:text-blue-300 shrink-0">
              <Icon name="info" className="text-[16px]" />
            </span>
            <p className="text-[12.5px] leading-relaxed text-[#1b2b45] dark:text-slate-300">{t('orders_tracking_instructions')}</p>
          </div>

          {/* Already-saved tracking numbers */}
          {saved.length > 0 && (
            <div className={CARD}>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#565e74] dark:text-slate-400">
                {t('orders_tracking_saved_list', { count: saved.length })}
              </span>
              <div className="flex flex-col gap-2 mt-2.5">
                {saved.map((tn, i) => (
                  <div key={`${tn.trackingNumber}-${i}`} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[#eff4ff] dark:bg-slate-800/60">
                    <Icon name="local_shipping" className="text-[16px] text-[#6d28d9] dark:text-violet-300 shrink-0" />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[12.5px] font-mono font-semibold text-[#0b1c30] dark:text-white truncate">{tn.trackingNumber}</span>
                      <span className="text-[11px] text-[#565e74] dark:text-slate-400 truncate">{tn.carrierName}</span>
                    </div>
                    <Icon name="check_circle" className="text-[16px] text-[#1f9254] dark:text-green-400 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New tracking-number rows */}
          <div className="flex flex-col gap-2.5">
            {rows.map((row, idx) => (
              <div key={idx} className="flex items-end gap-2 p-2.5 rounded-xl border border-[#e5eeff] dark:border-slate-800 bg-white dark:bg-[#131b2e]">
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <label className={LABEL}>{t('orders_tracking_number_label')}</label>
                  <input
                    type="text"
                    value={row.trackingNumber}
                    onChange={(e) => updateRow(idx, { trackingNumber: e.target.value })}
                    placeholder={t('orders_tracking_number_ph')}
                    className={`${FIELD} font-mono placeholder:font-sans`}
                  />
                </div>
                <div className="flex flex-col gap-1 w-[38%] min-w-0">
                  <label className={LABEL}>{t('orders_tracking_carrier_label')}</label>
                  <input
                    type="text"
                    value={row.carrierName}
                    onChange={(e) => updateRow(idx, { carrierName: e.target.value })}
                    placeholder={t('orders_tracking_carrier_ph')}
                    className={FIELD}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeRow(idx)}
                  className="h-10 w-10 shrink-0 flex items-center justify-center rounded-lg text-slate-400 hover:text-[#ba1a1a] hover:bg-[#ffdad6]/40 transition-colors"
                  title={t('remove')}
                >
                  <Icon name="delete" className="text-[18px]" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addRow}
              className="inline-flex items-center justify-center gap-1.5 h-10 rounded-lg border border-dashed border-[#c3c6d7] dark:border-slate-600 text-[12.5px] font-semibold text-[#004ac6] dark:text-blue-300 hover:border-[#004ac6]/60 hover:bg-[#eff4ff] dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
            >
              <Icon name="add" className="text-[18px]" />
              {t('orders_tracking_add_row')}
            </button>
          </div>

          {hasPartialRow && (
            <p className="flex items-center gap-1.5 text-[11.5px] text-[#bc4800] dark:text-amber-300">
              <Icon name="error" className="text-[15px] shrink-0" />
              <span>{t('orders_tracking_partial_hint')}</span>
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 bg-white dark:bg-[#131b2e] border-t border-[#e5eeff] dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-3.5 h-10 bg-[#eff4ff] dark:bg-slate-800 text-[#0b1c30] dark:text-white hover:bg-[#dae2fd] dark:hover:bg-slate-700 text-[13px] rounded-lg transition-colors font-medium disabled:opacity-60"
          >
            {t('cancel')}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="inline-flex items-center gap-1.5 px-4 h-10 bg-[#004ac6] hover:bg-[#003ea8] text-white text-[13px] font-bold rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Icon name={isSaving ? 'progress_activity' : 'save'} className={`text-[17px] ${isSaving ? 'animate-spin' : ''}`} />
            <span>{isSaving ? t('orders_tracking_saving') : t('orders_tracking_save')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
