'use client';

import React, { useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import { Icon } from '@/components/lucide-icon';

interface ScanCodeProps {
  /** Value encoded in both codes (the scanners read it back as-is). */
  value: string;
  /** QR side length in px. */
  qrSize: number;
  /** Barcode bar height in px. */
  barcodeHeight: number;
  /** Shown instead of the codes when they can't be generated. */
  errorLabel: string;
}

/** A value as a QR code and a CODE128 barcode side by side, with the human-readable
 * value under the barcode. The QR is a data URL and the barcode an inline SVG, so
 * both are already painted (and print sharply) when the print dialog opens. */
export const ScanCode: React.FC<ScanCodeProps> = ({ value, qrSize, barcodeHeight, errorLabel }) => {
  const barcodeRef = useRef<SVGSVGElement | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [value]);

  useEffect(() => {
    if (!value || !barcodeRef.current) return;
    try {
      JsBarcode(barcodeRef.current, value, {
        format: 'CODE128',
        displayValue: false,
        margin: 0,
        height: barcodeHeight,
        width: 2,
        background: '#ffffff',
        lineColor: '#000000',
      });
    } catch {
      setHasError(true);
    }
  }, [value, barcodeHeight]);

  useEffect(() => {
    if (!value) {
      setQrDataUrl('');
      return;
    }
    let cancelled = false;
    QRCode.toDataURL(value, { errorCorrectionLevel: 'M', margin: 1, width: 512, color: { dark: '#000000', light: '#ffffff' } })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setHasError(true);
      });
    return (): void => {
      cancelled = true;
    };
  }, [value]);

  if (hasError) return <p className="text-[11px] text-slate-500">{errorLabel}</p>;

  return (
    <div className="flex items-center gap-2.5">
      {qrDataUrl ? (
        <img
          src={qrDataUrl}
          alt={value}
          style={{ width: qrSize, height: qrSize }}
          width={qrSize}
          height={qrSize}
          className="block shrink-0"
        />
      ) : (
        <div style={{ width: qrSize, height: qrSize }} className="shrink-0 flex items-center justify-center text-slate-300">
          <Icon name="qr_code_scanner" className="text-[28px]" />
        </div>
      )}
      <div className="flex flex-col items-center gap-0.5 min-w-0 flex-1">
        <svg ref={barcodeRef} style={{ height: barcodeHeight }} className="block max-w-full" />
        <span className="text-[11px] font-mono font-semibold tracking-wider text-[#0b1c30] break-all">{value}</span>
      </div>
    </div>
  );
};
