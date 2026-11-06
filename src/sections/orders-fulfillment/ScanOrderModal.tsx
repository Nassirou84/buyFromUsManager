'use client';

import useLocales from '@/locales/use-locales';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/lucide-icon';

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

interface ScanOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called once with the order uid decoded from the scanned code. */
  onScan: (uid: string) => void;
}

// Pull the order uid out of a scanned payload: accept either a bare uid or a full
// order-detail URL (…/orders-fulfillment/<uid>), so printed codes can be either.
const extractUid = (raw: string): string => {
  const text = raw.trim();
  const match = text.match(/orders-fulfillment\/([^/?#]+)/);
  if (match) return decodeURIComponent(match[1]);
  try {
    const seg = new URL(text).pathname.split('/').filter(Boolean).pop();
    if (seg) return decodeURIComponent(seg);
  } catch {
    // not a URL — treat the whole payload as the uid
  }
  return text;
};

const CARD = 'rounded-xl border border-[#e5eeff] dark:border-slate-800 bg-white dark:bg-[#131b2e] p-4';

/** Order scanner supporting two inputs at once: a handheld/HID "keyboard-wedge"
 * scanner (captured globally while open) and the device camera (decoded with the
 * native BarcodeDetector). The first read wins; its uid is handed to the caller,
 * which navigates straight to that order's detail page. */
export const ScanOrderModal: React.FC<ScanOrderModalProps> = ({ isOpen, onClose, onScan }) => {
  const { t } = useLocales();
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  // Guards a capture session so one scan is handled once (the camera loop can fire
  // several times, and a scanner may send both a burst-end and an Enter terminator).
  const handledRef = useRef(false);
  // Keep the latest onScan without re-arming the global listeners when it changes.
  const onScanRef = useRef(onScan);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  const stopScan = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  }, []);

  // Apply a decoded value from any source (hardware scanner or camera): stop the
  // camera and hand the resolved uid to the caller, which navigates to the order.
  const applyScan = useCallback((value: string) => {
    const uid = extractUid(value);
    if (!uid || handledRef.current) return;
    handledRef.current = true;
    stopScan();
    onScanRef.current(uid);
  }, [stopScan]);

  useEffect(() => {
    if (isOpen) {
      handledRef.current = false;
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

  // Drive the camera + QR detection while scanning. On a successful decode the value
  // is applied, which stops the camera and navigates to the scanned order.
  useEffect(() => {
    if (!isScanning) return;
    let cancelled = false;
    let intervalId: number | undefined;

    const start = async () => {
      const BarcodeDetector = window.BarcodeDetector;
      if (!BarcodeDetector) {
        setScanError(t('orders_scan_unsupported'));
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
          setScanError(t('orders_scan_camera_error'));
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

  // Launch the QR scanner. Detection runs in the effect above.
  const handleScanRequested = () => {
    setScanError('');
    if (typeof window === 'undefined' || !('BarcodeDetector' in window)) {
      setScanError(t('orders_scan_unsupported'));
      return;
    }
    setIsScanning(true);
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="w-full max-w-md bg-[#f8f9ff] dark:bg-[#0b1326] rounded-2xl shadow-2xl border border-[#e5eeff] dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 bg-white dark:bg-[#131b2e] border-b border-[#e5eeff] dark:border-slate-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-3 h-6 bg-[#004ac6] rounded-full"></div>
            <div className="flex flex-col min-w-0">
              <h2 className="text-[15px] text-[#0b1c30] dark:text-white font-bold truncate">{t('orders_scan_title')}</h2>
              <span className="text-[12px] text-[#565e74] dark:text-slate-400">{t('orders_scan_subtitle')}</span>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors shrink-0">
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className={CARD}>
            <div className="flex flex-col gap-3">
              {isScanning ? (
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
                      <span className="truncate">{t('orders_scan_scanning')}</span>
                    </span>
                    <button
                      type="button"
                      onClick={stopScan}
                      className="px-3 h-9 bg-[#eff4ff] dark:bg-slate-800 text-[#0b1c30] dark:text-white hover:bg-[#dae2fd] dark:hover:bg-slate-700 text-[12.5px] rounded-lg transition-colors font-medium shrink-0"
                    >
                      {t('cancel')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {/* The hardware scanner is captured globally while the modal is open,
                      so the operator just scans — no button to press. */}
                  <div className="flex items-center gap-3 px-4 py-4 bg-[#eff4ff] dark:bg-slate-800 rounded-lg border border-dashed border-[#c3c6d7] dark:border-slate-600">
                    <span className="p-2.5 rounded-full bg-[#dae2fd] text-[#004ac6] dark:bg-blue-950 dark:text-blue-300 shrink-0">
                      <Icon name="qr_code_scanner" className="text-[22px] animate-pulse" />
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[13px] font-semibold text-[#0b1c30] dark:text-white">{t('orders_scan_waiting')}</span>
                      <span className="text-[11.5px] text-[#565e74] dark:text-slate-400">{t('orders_scan_hardware_hint')}</span>
                    </div>
                  </div>
                  {/* Camera fallback when no handheld scanner is connected. */}
                  <button
                    type="button"
                    onClick={handleScanRequested}
                    className="flex items-center justify-center gap-1.5 h-10 bg-white dark:bg-[#131b2e] rounded-lg border border-[#e5eeff] dark:border-slate-700 text-[12.5px] font-medium text-[#565e74] dark:text-slate-400 hover:text-[#004ac6] dark:hover:text-blue-300 transition-colors cursor-pointer"
                  >
                    <Icon name="qr_code_scanner" className="text-[16px]" />
                    {t('orders_scan_use_camera')}
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
        </div>
      </div>
    </div>
  );
};
