import useLocales from '@/locales/use-locales';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Icon } from '@/components/lucide-icon';
import { Order } from './types';

// Minimal typings for the browser BarcodeDetector API (not yet in the TS DOM lib).
interface DetectedBarcode {
  rawValue: string;
}
interface BarcodeDetectorInstance {
  detect(source: CanvasImageSource): Promise<DetectedBarcode[]>;
}
declare global {
  interface Window {
    BarcodeDetector?: {
      new (options?: { formats?: string[] }): BarcodeDetectorInstance;
    };
  }
}

export interface OutForDeliveryDetails {
  /** Value decoded from the receipt QR code, used to confirm the right box is dispatched. */
  scannedCode: string;
}

interface OutForDeliveryConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onConfirm: (details: OutForDeliveryDetails) => void;
  isPending?: boolean;
}

const CARD = 'rounded-xl border border-[#e5eeff] dark:border-slate-800 bg-white dark:bg-[#131b2e] p-4';
const STEP = 'w-6 h-6 rounded-full bg-[#0f766e] text-white text-[12px] font-bold flex items-center justify-center shrink-0';

export const OutForDeliveryConfirmModal: React.FC<OutForDeliveryConfirmModalProps> = ({ isOpen, onClose, order, onConfirm, isPending }) => {
  const { t } = useLocales();
  const [scannedCode, setScannedCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  // Guards a capture session so one scan is handled once (the camera loop can fire
  // several times, and a scanner may send both a burst-end and an Enter terminator).
  const handledRef = useRef(false);

  const stopScan = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  }, []);

  // Apply a decoded value from any source (hardware scanner or camera): fill the
  // field and stop the camera. When it matches this order we go straight to the
  // status update; otherwise we surface the mismatch so the operator can re-scan.
  const applyScan = useCallback((value: string) => {
    const trimmed = value.trim();
    if (!trimmed || handledRef.current) return;
    handledRef.current = true;
    setScannedCode(trimmed);
    setScanError('');
    stopScan();
    if (trimmed === order.uid) {
      onConfirm({ scannedCode: trimmed });
    } else {
      toast.error(t('orders_out_for_delivery_mismatch_desc', { number: order.orderNumber }));
    }
  }, [order.uid, order.orderNumber, stopScan, onConfirm, t]);

  // Clear the current capture so the operator can scan again.
  const resetScan = useCallback(() => {
    handledRef.current = false;
    setScannedCode('');
    setScanError('');
  }, []);

  useEffect(() => {
    if (isOpen) {
      handledRef.current = false;
      setScannedCode('');
      setScanError('');
      setIsScanning(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // Capture input from a hardware barcode scanner. These act as a keyboard wedge:
  // they "type" the decoded value as a fast burst of keystrokes. Most add an Enter
  // (or Tab) terminator, but some add none — so we commit the buffer on that
  // terminator OR shortly after the burst stops, which also distinguishes a scanner
  // burst from slow human typing.
  useEffect(() => {
    if (!isOpen) return;
    let buffer = '';
    let commitTimer: number | undefined;

    const commit = () => {
      if (commitTimer) { window.clearTimeout(commitTimer); commitTimer = undefined; }
      const value = buffer;
      buffer = '';
      // Ignore stray single keystrokes; scanned codes are several characters long.
      if (value.length >= 3) applyScan(value);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === 'Tab') {
        if (buffer) {
          e.preventDefault();
          commit();
        }
        return;
      }
      if (e.key.length === 1) {
        buffer += e.key;
        if (commitTimer) window.clearTimeout(commitTimer);
        commitTimer = window.setTimeout(commit, 120);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      if (commitTimer) window.clearTimeout(commitTimer);
    };
  }, [isOpen, applyScan]);

  // Drive the camera + QR detection while scanning. On a successful decode the
  // value is written to `scannedCode`, which populates the field and the summary.
  useEffect(() => {
    if (!isScanning) return;
    let cancelled = false;
    let intervalId: number | undefined;

    const start = async () => {
      const BarcodeDetector = window.BarcodeDetector;
      if (!BarcodeDetector) {
        setScanError(t('orders_out_for_delivery_scan_unsupported'));
        setIsScanning(false);
        return;
      }
      try {
        const detector = new BarcodeDetector({ formats: ['qr_code'] });
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        intervalId = window.setInterval(async () => {
          const video = videoRef.current;
          if (!video) return;
          try {
            const codes = await detector.detect(video);
            const value = codes[0]?.rawValue;
            if (value) applyScan(value);
          } catch {
            // Ignore transient per-frame detection errors.
          }
        }, 400);
      } catch {
        if (!cancelled) {
          setScanError(t('orders_out_for_delivery_scan_error'));
          setIsScanning(false);
        }
      }
    };

    start();

    return () => {
      cancelled = true;
      if (intervalId) window.clearInterval(intervalId);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [isScanning, applyScan, t]);

  if (!isOpen) return null;

  // Launch the QR scanner. Detection runs in the effect above; a decoded value
  // is written to `scannedCode` on success.
  const handleScanRequested = () => {
    setScanError('');
    if (typeof window === 'undefined' || !('BarcodeDetector' in window)) {
      setScanError(t('orders_out_for_delivery_scan_unsupported'));
      return;
    }
    setIsScanning(true);
  };

  // The scan is only valid when the decoded value matches this order's uid, so the
  // operator can't dispatch the wrong box.
  const trimmedCode = scannedCode.trim();
  const hasScan = trimmedCode.length > 0;
  const isMatch = hasScan && trimmedCode === order.uid;

  // Confirm only once the receipt QR code has been scanned and matches this order.
  const canConfirm = isMatch && !isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canConfirm) return;
    onConfirm({ scannedCode: trimmedCode });
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
            <div className="w-3 h-6 bg-[#0f766e] rounded-full"></div>
            <div className="flex flex-col min-w-0">
              <h2 className="text-[15px] text-[#0b1c30] dark:text-white font-bold truncate">{t('orders_out_for_delivery_title')}</h2>
              <span className="text-[12px] text-[#565e74] dark:text-slate-400">{t('order_number', { number: order.orderNumber })}</span>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors shrink-0">
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex flex-col gap-5">
          {/* Step 1 — pack the order */}
          <div className={CARD}>
            <div className="flex items-center gap-2.5">
              <span className={STEP}>1</span>
              <div className="flex flex-col">
                <span className="text-[13.5px] font-bold text-[#0b1c30] dark:text-white">{t('orders_out_for_delivery_step1_title')}</span>
                <span className="text-[12px] text-[#565e74] dark:text-slate-400">{t('orders_out_for_delivery_step1_desc')}</span>
              </div>
            </div>
          </div>

          {/* Step 2 — print the receipt label */}
          <div className={CARD}>
            <div className="flex items-center gap-2.5">
              <span className={STEP}>2</span>
              <div className="flex flex-col">
                <span className="text-[13.5px] font-bold text-[#0b1c30] dark:text-white">{t('orders_out_for_delivery_step2_title')}</span>
                <span className="text-[12px] text-[#565e74] dark:text-slate-400">{t('orders_out_for_delivery_step2_desc')}</span>
              </div>
            </div>
          </div>

          {/* Step 3 — scan the receipt QR code */}
          <div className={CARD}>
            <div className="flex items-center gap-2.5 mb-3">
              <span className={STEP}>3</span>
              <div className="flex flex-col">
                <span className="text-[13.5px] font-bold text-[#0b1c30] dark:text-white">{t('orders_out_for_delivery_step3_title')}</span>
                <span className="text-[12px] text-[#565e74] dark:text-slate-400">{t('orders_out_for_delivery_step3_desc')}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {hasScan && isMatch ? (
                <div className="flex items-center gap-2 h-12 px-4 bg-[#ccfbf1] dark:bg-teal-950/50 rounded-lg border border-[#5eead4] dark:border-teal-800">
                  <Icon name="check_circle" className="text-[20px] text-[#0f766e] dark:text-teal-300 shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11.5px] font-bold text-[#0f766e] dark:text-teal-300">{t('orders_out_for_delivery_scanned')}</span>
                    <span className="text-[12.5px] font-mono text-[#0b1c30] dark:text-white truncate" title={scannedCode}>{scannedCode}</span>
                  </div>
                  <button
                    type="button"
                    onClick={resetScan}
                    className="ml-auto p-1 rounded text-slate-500 hover:text-[#ba1a1a] transition-colors shrink-0"
                    title={t('remove')}
                  >
                    <Icon name="close" className="text-[18px]" />
                  </button>
                </div>
              ) : hasScan && !isMatch ? (
                <div className="flex items-center gap-2 px-4 py-3 bg-[#ffdad6] dark:bg-red-950/50 rounded-lg border border-[#f4b4ae] dark:border-red-900">
                  <Icon name="error" className="text-[20px] text-[#ba1a1a] dark:text-red-400 shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11.5px] font-bold text-[#ba1a1a] dark:text-red-400">{t('orders_out_for_delivery_mismatch_title')}</span>
                    <span className="text-[12px] text-[#8c1d18] dark:text-red-300">{t('orders_out_for_delivery_mismatch_desc', { number: order.orderNumber })}</span>
                    <span className="text-[12.5px] font-mono text-[#0b1c30] dark:text-white truncate mt-0.5" title={scannedCode}>{scannedCode}</span>
                  </div>
                  <button
                    type="button"
                    onClick={resetScan}
                    className="ml-auto px-3 h-9 bg-white dark:bg-slate-800 text-[#ba1a1a] dark:text-red-400 hover:bg-[#fff0ee] dark:hover:bg-slate-700 text-[12.5px] rounded-lg transition-colors font-medium shrink-0"
                  >
                    {t('orders_out_for_delivery_rescan')}
                  </button>
                </div>
              ) : isScanning ? (
                <div className="flex flex-col gap-3">
                  <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
                    {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                    <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-40 h-40 border-2 border-white/80 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.25)]" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5 text-[12px] text-[#565e74] dark:text-slate-400 min-w-0">
                      <Icon name="qr_code_scanner" className="text-[16px] animate-pulse shrink-0" />
                      <span className="truncate">{t('orders_out_for_delivery_scanning')}</span>
                    </span>
                    <button
                      type="button"
                      onClick={stopScan}
                      className="px-3 h-9 bg-[#eff4ff] dark:bg-slate-800 text-[#0b1c30] dark:text-white hover:bg-[#dae2fd] dark:hover:bg-slate-700 text-[12.5px] rounded-lg transition-colors font-medium shrink-0"
                    >
                      {t('orders_out_for_delivery_scan_cancel')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {/* The hardware scanner is captured globally while the modal is open,
                      so the operator just scans — no button to press. */}
                  <div className="flex items-center gap-3 px-4 py-4 bg-[#eff4ff] dark:bg-slate-800 rounded-lg border border-dashed border-[#c3c6d7] dark:border-slate-600">
                    <span className="p-2.5 rounded-full bg-[#ccfbf1] text-[#0f766e] dark:bg-teal-950 dark:text-teal-300 shrink-0">
                      <Icon name="qr_code_scanner" className="text-[22px] animate-pulse" />
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[13px] font-semibold text-[#0b1c30] dark:text-white">{t('orders_out_for_delivery_waiting_scanner')}</span>
                      <span className="text-[11.5px] text-[#565e74] dark:text-slate-400">{t('orders_out_for_delivery_waiting_scanner_hint')}</span>
                    </div>
                  </div>
                  {/* Camera fallback when no handheld scanner is connected. */}
                  <button
                    type="button"
                    onClick={handleScanRequested}
                    className="flex items-center justify-center gap-1.5 h-10 bg-white dark:bg-[#131b2e] rounded-lg border border-[#e5eeff] dark:border-slate-700 text-[12.5px] font-medium text-[#565e74] dark:text-slate-400 hover:text-[#0f766e] dark:hover:text-teal-300 transition-colors cursor-pointer"
                  >
                    <Icon name="qr_code_scanner" className="text-[16px]" />
                    {t('orders_out_for_delivery_use_camera')}
                  </button>
                </div>
              )}

              {scanError && (
                <p className="flex items-center gap-1.5 text-[11.5px] text-[#ba1a1a] dark:text-red-400">
                  <Icon name="error" className="text-[15px] shrink-0" />
                  <span>{scanError}</span>
                </p>
              )}
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
            <Icon name={isPending ? 'progress_activity' : 'local_shipping'} className={`text-[17px] ${isPending ? 'animate-spin' : ''}`} />
            <span>{t('orders_out_for_delivery_confirm')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
