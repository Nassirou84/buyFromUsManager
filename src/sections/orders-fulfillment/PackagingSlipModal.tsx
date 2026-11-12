'use client';

import useLocales from '@/locales/use-locales';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import { Icon } from '@/components/lucide-icon';
import { Order } from './types';

interface PackagingSlipModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

/** Label stock the slip can be printed on. */
export type LabelFormat = '4x6' | '5x7';

// Preview sizes are the physical size at 96dpi (4in = 384px), so the on-screen
// sheet has the same proportions as the paper. The codes grow with the label: a
// bigger sheet can carry a bigger QR and a taller barcode, which scan more easily.
const LABEL_FORMATS: Record<LabelFormat, {
  labelKey: string;
  page: string;
  width: number;
  height: number;
  qr: number;
  barcodeHeight: number;
}> = {
  '4x6': { labelKey: 'packaging_slip_format_4x6', page: '4in 6in', width: 384, height: 576, qr: 104, barcodeHeight: 50 },
  '5x7': { labelKey: 'packaging_slip_format_5x7', page: '5in 7in', width: 480, height: 672, qr: 136, barcodeHeight: 66 },
};

const DEFAULT_LABEL_FORMAT: LabelFormat = '4x6';
const FORMAT_STORAGE_KEY = 'flot.packagingSlipFormat';

const isLabelFormat = (value: unknown): value is LabelFormat =>
  value === '4x6' || value === '5x7';

// Storefront label printed at the top of the slip, derived from the public
// storefront URL (host only, so the slip carries the website rather than a path).
const storefrontHost = (): string => {
  const raw = process.env.NEXT_PUBLIC_STORE_FRONT_URL ?? '';
  if (!raw) return '';
  try {
    return new URL(raw).host;
  } catch {
    return raw.replace(/^https?:\/\//i, '').replace(/\/+$/, '');
  }
};

/** Warehouse packaging slip for one order: storefront label, the delivery name and
 * address (no email, no phone — the slip travels on the outside of the box), the
 * number of items, and the order uid as both a QR code and a CODE128 barcode so it
 * can be read by the camera scanner or a handheld (keyboard-wedge) scanner. Both
 * codes carry the bare uid, which is what ScanOrderModal and the out-for-delivery
 * scan gate compare against. */
export const PackagingSlipModal: React.FC<PackagingSlipModalProps> = ({ order, isOpen, onClose }) => {
  const { t } = useLocales();
  const barcodeRef = useRef<SVGSVGElement | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [codeError, setCodeError] = useState(false);
  const [format, setFormat] = useState<LabelFormat>(DEFAULT_LABEL_FORMAT);

  const uid = order?.uid ?? '';
  const layout = LABEL_FORMATS[format];

  // Restore the last label stock this browser printed on. Read after mount (not in
  // the initial state) so the server and client render the same thing, and guarded
  // because storage can be unavailable or blocked.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(FORMAT_STORAGE_KEY);
      if (isLabelFormat(stored)) setFormat(stored);
    } catch {
      // no stored preference available — keep the default
    }
  }, []);

  const changeFormat = (next: LabelFormat) => {
    setFormat(next);
    try {
      window.localStorage.setItem(FORMAT_STORAGE_KEY, next);
    } catch {
      // the choice still applies to this print, it just isn't remembered
    }
  };

  // Clear a previous failure when another order's slip is opened.
  useEffect(() => {
    setCodeError(false);
  }, [isOpen, uid]);

  // Render the barcode into the inline SVG, so it prints at full resolution.
  useEffect(() => {
    if (!isOpen || !uid || !barcodeRef.current) return;
    try {
      JsBarcode(barcodeRef.current, uid, {
        format: 'CODE128',
        displayValue: false,
        margin: 0,
        height: layout.barcodeHeight,
        width: 2,
        background: '#ffffff',
        lineColor: '#000000',
      });
    } catch {
      setCodeError(true);
    }
  }, [isOpen, uid, layout.barcodeHeight]);

  // The QR carries the same uid. A data URL (rather than a canvas) is used so the
  // image is already painted when the print dialog opens.
  useEffect(() => {
    if (!isOpen || !uid) {
      setQrDataUrl('');
      return;
    }
    let cancelled = false;
    QRCode.toDataURL(uid, { errorCorrectionLevel: 'M', margin: 1, width: 512, color: { dark: '#000000', light: '#ffffff' } })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setCodeError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, uid]);

  // Print on the selected label stock. @page can't be scoped with a selector, so the
  // rule is injected while the slip is open and removed on close — otherwise it
  // would also force the tax-invoice receipt onto label paper.
  useEffect(() => {
    if (!isOpen) return;
    const style = document.createElement('style');
    style.media = 'print';
    style.textContent = `@page { size: ${layout.page}; margin: 0; }`;
    document.head.appendChild(style);
    return () => style.remove();
  }, [isOpen, layout.page]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen || !order || typeof document === 'undefined') return null;

  const { shippingAddress } = order;
  // City / state / zip on one line, skipping whichever the backend didn't send
  // (zip is not part of the order payload, and state is often empty).
  const localityLine = [shippingAddress.city, [shippingAddress.state, shippingAddress.zip].filter(Boolean).join(' ')]
    .filter(Boolean)
    .join(', ');
  const addressLines = [shippingAddress.street, localityLine, shippingAddress.country].filter(Boolean);
  const host = storefrontHost();

  return createPortal(
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="receipt-print-root fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="w-full max-w-xl bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top bar (hidden in print) */}
        <div className="print:hidden flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-[13px] font-semibold text-slate-700 shrink-0">{t('packaging_slip')}</span>
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
                    format === key
                      ? 'bg-[#2563eb] text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-100'
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
              className="h-8 px-3 rounded-md text-xs font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] transition-colors inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Icon name="print" className="text-[16px]" />
              <span>{t('invoice_print')}</span>
            </button>
            <button type="button" onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-800 transition-colors cursor-pointer">
              <Icon name="close" className="text-[20px]" />
            </button>
          </div>
        </div>

        <div className="p-3 sm:p-4 overflow-y-auto bg-slate-100/60">
          <div
            style={{ width: layout.width, maxWidth: '100%', minHeight: layout.height }}
            className="receipt-page packaging-slip-page mx-auto bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden flex flex-col divide-y divide-slate-200"
          >
            {/* Website label & slip title */}
            <div className="p-3 flex items-start justify-between gap-2">
              <div className="leading-tight">
                <span className="block text-[17px] font-bold text-[#0b1c30] leading-tight">
                  {t('packaging_slip_store_name')}
                </span>
                {host && <span className="block text-[9px] font-mono text-slate-500">{host}</span>}
              </div>
              <div className="text-right leading-tight">
                <span className="block text-[8px] font-bold uppercase tracking-[0.16em] text-slate-500">
                  {t('packaging_slip')}
                </span>
                <span className="block text-[12px] font-bold text-[#0b1c30] break-all">{order.orderNumber}</span>
                <span className="block text-[9px] text-slate-500">{order.dateStr}</span>
              </div>
            </div>

            {/* Ship-to block — name and full address only */}
            <div className="p-3">
              <h2 className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                {t('packaging_slip_ship_to')}
              </h2>
              <p className="text-[15px] font-bold text-[#0b1c30] leading-tight">
                {shippingAddress.name || order.customerName}
              </p>
              <div className="mt-0.5 text-[12px] text-slate-700 leading-snug">
                {addressLines.length > 0
                  ? addressLines.map((line, idx) => <p key={idx}>{line}</p>)
                  : <p className="text-slate-400">{t('packaging_slip_no_address')}</p>}
              </div>
            </div>

            {/* Item count */}
            <div className="px-3 py-2 flex items-center justify-between gap-2 bg-[#f8f9ff]">
              <div>
                <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-500">
                  {t('packaging_slip_items_label')}
                </span>
                <span className="block text-[19px] font-bold text-[#0b1c30] leading-tight">
                  {t('items_count', { count: order.itemCount })}
                </span>
              </div>
              <Icon name="inventory" className="text-[26px] text-slate-400 shrink-0" />
            </div>

            {/* Scannable codes — QR and barcode, both encoding the order uid */}
            <div className="p-3">
              {codeError ? (
                <p className="text-[12px] text-slate-500">{t('packaging_slip_code_error', { uid })}</p>
              ) : (
                <div className="flex flex-col items-stretch gap-2">
                  <div className="px-2 py-1.5 bg-white border border-slate-200 rounded text-center">
                    {qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt={uid}
                        style={{ width: layout.qr, height: layout.qr }}
                        className="block mx-auto"
                        width={layout.qr}
                        height={layout.qr}
                      />
                    ) : (
                      <div
                        style={{ width: layout.qr, height: layout.qr }}
                        className="mx-auto flex items-center justify-center text-slate-300"
                      >
                        <Icon name="qr_code_scanner" className="text-[34px]" />
                      </div>
                    )}
                  </div>

                  <div className="px-2 py-1.5 bg-white border border-slate-200 rounded text-center">
                    <svg ref={barcodeRef} style={{ height: layout.barcodeHeight }} className="block mx-auto max-w-full" />
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
