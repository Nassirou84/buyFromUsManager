'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import useLocales from '@/locales/use-locales';
import { Icon } from '@/components/lucide-icon';
import { ScanCode } from '@/components/scan-code/ScanCode';
import { type RmaItem } from '../../types';
import { getReasonLabelKey } from '../../shared';

/** Label stock the slip can be printed on (same stock as the order packaging slip). */
type LabelFormat = '4x6' | '5x7';

// Preview sizes are the physical size at 96dpi, so the on-screen sheet has the same
// proportions as the paper. Each label carries two code rows, so the codes are a
// little smaller than on the packaging slip.
const LABEL_FORMATS: Record<
  LabelFormat,
  { labelKey: string; page: string; width: number; height: number; qr: number; barcodeHeight: number }
> = {
  '4x6': { labelKey: 'packaging_slip_format_4x6', page: '4in 6in', width: 384, height: 576, qr: 88, barcodeHeight: 44 },
  '5x7': { labelKey: 'packaging_slip_format_5x7', page: '5in 7in', width: 480, height: 672, qr: 112, barcodeHeight: 56 },
};

const DEFAULT_LABEL_FORMAT: LabelFormat = '4x6';
const FORMAT_STORAGE_KEY = 'flot.returnSlipFormat';

const isLabelFormat = (value: unknown): value is LabelFormat => value === '4x6' || value === '5x7';

const CODE_LABEL = 'block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1';

interface ReturnSlipModalProps {
  rma: RmaItem;
  /** Indexes into `rma.lines` to print, one label each. */
  lineIndexes: number[];
  isOpen: boolean;
  onClose: () => void;
}

/** Return slips: one label per returned item, each carrying the return number and
 * the product SKU as both a QR code and a CODE128 barcode, so the parcel and the
 * item can be scanned at intake with the camera or a handheld scanner. */
export const ReturnSlipModal: React.FC<ReturnSlipModalProps> = ({ rma, lineIndexes, isOpen, onClose }) => {
  const { t } = useLocales();
  const [format, setFormat] = useState<LabelFormat>(DEFAULT_LABEL_FORMAT);
  const layout = LABEL_FORMATS[format];

  // Restore the last label stock used in this browser (read after mount so the
  // server and client render the same thing; storage may be unavailable).
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(FORMAT_STORAGE_KEY);
      if (isLabelFormat(stored)) setFormat(stored);
    } catch {
      // no stored preference available — keep the default
    }
  }, []);

  const changeFormat = (next: LabelFormat): void => {
    setFormat(next);
    try {
      window.localStorage.setItem(FORMAT_STORAGE_KEY, next);
    } catch {
      // the choice still applies to this print, it just isn't remembered
    }
  };

  // @page can't be scoped with a selector, so the label size is injected only while
  // the modal is open.
  useEffect(() => {
    if (!isOpen) return;
    const style = document.createElement('style');
    style.media = 'print';
    style.textContent = `@page { size: ${layout.page}; margin: 0; }`;
    document.head.appendChild(style);
    return (): void => style.remove();
  }, [isOpen, layout.page]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return (): void => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  const slips = lineIndexes
    .map((index) => ({ index, line: rma.lines[index] }))
    .filter((slip): slip is { index: number; line: RmaItem['lines'][number] } => slip.line !== undefined);
  const total = rma.lines.length;

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="receipt-print-root fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="w-full max-w-xl bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top bar (hidden in print) */}
        <div className="print:hidden flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-[13px] font-semibold text-slate-700 shrink-0">
              {t('return_slip_title', { count: slips.length })}
            </span>
            <div
              role="group"
              aria-label={t('packaging_slip_format_label')}
              className="inline-flex rounded-md border border-slate-300 overflow-hidden shrink-0"
            >
              {(Object.keys(LABEL_FORMATS) as LabelFormat[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => changeFormat(key)}
                  aria-pressed={format === key}
                  className={`px-2 py-1 text-[11px] font-semibold transition-colors cursor-pointer ${
                    format === key ? 'bg-[#2563eb] text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {t(LABEL_FORMATS[key].labelKey)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => window.print()}
              disabled={slips.length === 0}
              className="h-8 px-3 rounded-md text-xs font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] transition-colors inline-flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon name="print" className="text-[16px]" />
              <span>{t('invoice_print')}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label={t('close')}
              className="p-1 rounded text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <Icon name="close" className="text-[20px]" />
            </button>
          </div>
        </div>

        <div className="p-3 sm:p-4 overflow-y-auto bg-slate-100/60 flex flex-col gap-4">
          {slips.length === 0 && (
            <p className="text-[13px] text-slate-500 text-center py-8">{t('rma_no_items')}</p>
          )}

          {slips.map(({ index, line }) => {
            const reasonKey = line.reason ? getReasonLabelKey(line.reason) : null;
            return (
              <div
                key={index}
                style={{ width: layout.width, maxWidth: '100%', minHeight: layout.height }}
                className="receipt-page return-slip-page mx-auto bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden flex flex-col divide-y divide-slate-200"
              >
                {/* Store & slip title */}
                <div className="p-3 flex items-start justify-between gap-2">
                  <div className="leading-tight">
                    <span className="block text-[17px] font-bold text-[#0b1c30] leading-tight">
                      {t('packaging_slip_store_name')}
                    </span>
                    <span className="block text-[9px] text-slate-500">{rma.createdAtStr}</span>
                  </div>
                  <div className="text-right leading-tight">
                    <span className="block text-[8px] font-bold uppercase tracking-[0.16em] text-slate-500">
                      {t('return_slip')}
                    </span>
                    <span className="block text-[12px] font-bold text-[#0b1c30] break-all">#{rma.id}</span>
                    <span className="block text-[9px] text-slate-500">
                      {t('return_slip_item_of', { index: index + 1, total })}
                    </span>
                  </div>
                </div>

                {/* Returned item */}
                <div className="p-3">
                  <p className="text-[14px] font-bold text-[#0b1c30] leading-tight">
                    {line.title || t('rma_item_untitled')}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-700">
                    {line.variantLabel && <span>{line.variantLabel}</span>}
                    <span className="font-semibold">{t('rma_qty_short', { count: line.quantity })}</span>
                    {line.reason && (
                      <span>
                        {t('rma_reason_label')}: {reasonKey ? t(reasonKey) : line.reason}
                      </span>
                    )}
                  </div>
                </div>

                {/* Return number */}
                <div className="p-3">
                  <span className={CODE_LABEL}>{t('return_slip_return_number')}</span>
                  <ScanCode
                    value={rma.id}
                    qrSize={layout.qr}
                    barcodeHeight={layout.barcodeHeight}
                    errorLabel={t('return_slip_code_error', { value: rma.id })}
                  />
                </div>

                {/* Product SKU */}
                <div className="p-3">
                  <span className={CODE_LABEL}>{t('return_slip_sku')}</span>
                  {line.sku ? (
                    <ScanCode
                      value={line.sku}
                      qrSize={layout.qr}
                      barcodeHeight={layout.barcodeHeight}
                      errorLabel={t('return_slip_code_error', { value: line.sku })}
                    />
                  ) : (
                    <p className="text-[11px] text-slate-500">{t('return_slip_no_sku')}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>,
    document.body,
  );
};
