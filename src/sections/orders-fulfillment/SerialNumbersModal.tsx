'use client';

import useLocales from '@/locales/use-locales';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Icon } from '@/components/lucide-icon';
import { addSerialNumber } from '@/api/order/add-serial-number';
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

// Serial labels are usually 1D barcodes on the box/unit, with QR as a fallback.
const SERIAL_FORMATS = [
  'code_128',
  'code_39',
  'ean_13',
  'ean_8',
  'upc_a',
  'upc_e',
  'itf',
  'codabar',
  'qr_code',
];

/** One serial slot, one per order item (the backend stores a single
 * OrderItem.productSerialNumber per line). */
interface SerialSlot {
  itemId: string;
  title: string;
  sku: string;
  image: string;
  imageAlt: string;
  quantity: number;
}

interface SerialNumbersModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  /** Called after the serials are persisted, with itemId -> serial for every item
   * that now has one, so the caller can reflect it immediately. */
  onSaved: (serialsByItemId: Record<string, string>) => void;
}

const CARD = 'rounded-xl border border-[#e5eeff] dark:border-slate-800 bg-white dark:bg-[#131b2e] p-4';

const buildSlots = (order: Order): SerialSlot[] =>
  order.items.map((item) => ({
    itemId: item.id,
    title: item.title,
    sku: item.sku,
    image: item.variantImage || item.image,
    imageAlt: item.imageAlt,
    quantity: Math.max(1, item.quantity || 1),
  }));

/** Pre-dispatch step for "out for delivery": the operator takes each product out of
 * its box and enters or scans its serial number. Each item has its own field; the
 * active (focused) field receives the next scan — from a handheld keyboard-wedge
 * scanner (types straight into the focused field) or the device camera (decoded with
 * the native BarcodeDetector and written into the active field). Serials are persisted
 * per item through POST /api/order_items/add_serial_number. */
export const SerialNumbersModal: React.FC<SerialNumbersModalProps> = ({ isOpen, onClose, order, onSaved }) => {
  const { t } = useLocales();
  const [slots, setSlots] = useState<SerialSlot[]>([]);
  const [serials, setSerials] = useState<Record<string, string>>({});
  // The field a camera scan is written into: the last focused input, or the first
  // empty slot when nothing is focused.
  const [activeKey, setActiveKey] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState('');
  // The set of items being saved individually.
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  // What's currently persisted on the backend (itemId -> serial), to tell a saved
  // field from a dirty one and to persist only what changed.
  const [savedMap, setSavedMap] = useState<Record<string, string>>({});
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inputsRef = useRef<Record<string, HTMLInputElement | null>>({});
  // Keep latest values for the async camera loop without re-arming it.
  const activeKeyRef = useRef(activeKey);
  const serialsRef = useRef(serials);
  // Latest order, read when seeding so a save-driven order update doesn't reset entries.
  const orderRef = useRef(order);
  useEffect(() => { activeKeyRef.current = activeKey; }, [activeKey]);
  useEffect(() => { serialsRef.current = serials; }, [serials]);
  useEffect(() => { orderRef.current = order; }, [order]);

  // (Re)build the slots and seed the fields with any saved serials — only when the
  // modal opens, so saving one item (which updates the order) never wipes the others.
  useEffect(() => {
    if (!isOpen) return;
    const ord = orderRef.current;
    const built = buildSlots(ord);
    const seeded: Record<string, string> = {};
    ord.items.forEach((item) => { if (item.serialNumber) seeded[item.id] = item.serialNumber; });
    setSlots(built);
    setSerials(seeded);
    setSavedMap({ ...seeded });
    setSavingIds(new Set());
    // Start on the first slot that still needs a serial.
    setActiveKey(built.find((s) => !seeded[s.itemId])?.itemId ?? built[0]?.itemId ?? '');
    setScanError('');
    setIsScanning(false);
  }, [isOpen]);

  const stopScan = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) stopScan();
  }, [isOpen, stopScan]);

  // Write a decoded value into the target slot, then advance the active field to the
  // next still-empty slot so repeated scans flow down the list.
  const writeSerial = useCallback((value: string) => {
    const clean = value.trim();
    if (!clean) return;
    const current = serialsRef.current;
    let targetKey = activeKeyRef.current;
    if (!targetKey) targetKey = slots.find((s) => !(current[s.itemId] ?? '').trim())?.itemId ?? slots[0]?.itemId ?? '';
    if (!targetKey) return;
    setSerials((prev) => ({ ...prev, [targetKey]: clean }));
    const idx = slots.findIndex((s) => s.itemId === targetKey);
    const nextEmpty = slots.slice(idx + 1).find((s) => !(current[s.itemId] ?? '').trim());
    if (nextEmpty) {
      setActiveKey(nextEmpty.itemId);
      inputsRef.current[nextEmpty.itemId]?.focus();
    }
  }, [slots]);

  // Drive the camera + barcode detection while scanning. A decode writes to the active
  // field and keeps scanning so several items can be read in a row.
  useEffect(() => {
    if (!isScanning) return;
    let cancelled = false;
    let intervalId: number | undefined;
    let lastValue = '';
    let lastAt = 0;

    const start = async () => {
      const BarcodeDetector = window.BarcodeDetector;
      if (!BarcodeDetector) {
        setScanError(t('orders_scan_unsupported'));
        setIsScanning(false);
        return;
      }
      try {
        const detector = new BarcodeDetector({ formats: SERIAL_FORMATS });
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
            // Debounce the same code so one physical label isn't captured repeatedly.
            const now = Date.now();
            if (value && (value !== lastValue || now - lastAt > 1500)) {
              lastValue = value;
              lastAt = now;
              writeSerial(value);
            }
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
  }, [isScanning, writeSerial, t]);

  if (!isOpen) return null;

  const handleScanRequested = () => {
    setScanError('');
    if (typeof window === 'undefined' || !('BarcodeDetector' in window)) {
      setScanError(t('orders_scan_unsupported'));
      return;
    }
    setIsScanning(true);
  };

  const filledCount = slots.reduce((n, s) => n + ((serials[s.itemId] ?? '').trim() ? 1 : 0), 0);
  const allFilled = slots.length > 0 && filledCount === slots.length;
  const activeSlot = slots.find((s) => s.itemId === activeKey);

  // Save one item's serial on its own, so the operator can record them one at a time.
  const handleSaveOne = async (itemId: string) => {
    const serial = (serials[itemId] ?? '').trim();
    if (!serial || savingIds.has(itemId)) return;
    setSavingIds((prev) => new Set(prev).add(itemId));
    try {
      await addSerialNumber(itemId, serial);
      setSavedMap((prev) => ({ ...prev, [itemId]: serial }));
      // Merge just this item into the order so the dispatch gate updates live.
      onSaved({ [itemId]: serial });
      toast.success(t('orders_serial_saved_one'));
    } catch {
      toast.error(t('orders_serial_save_error'));
    } finally {
      setSavingIds((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };


  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      const current = serialsRef.current;
      const nextEmpty = slots.slice(idx + 1).find((s) => !(current[s.itemId] ?? '').trim());
      if (nextEmpty) {
        e.preventDefault();
        setActiveKey(nextEmpty.itemId);
        inputsRef.current[nextEmpty.itemId]?.focus();
      }
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
            <div className="w-3 h-6 bg-[#004ac6] rounded-full"></div>
            <div className="flex flex-col min-w-0">
              <h2 className="text-[15px] text-[#0b1c30] dark:text-white font-bold truncate">{t('orders_serial_title')}</h2>
              <span className="text-[12px] text-[#565e74] dark:text-slate-400">{t('orders_serial_subtitle')}</span>
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
            <p className="text-[12.5px] leading-relaxed text-[#1b2b45] dark:text-slate-300">{t('orders_serial_instructions')}</p>
          </div>

          {/* Camera scanner (fallback when no handheld scanner is connected) */}
          <div className={CARD}>
            {isScanning ? (
              <div className="flex flex-col gap-3">
                <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
                  {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                  <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-48 h-24 border-2 border-white/80 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.25)]" />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1.5 text-[12px] text-[#565e74] dark:text-slate-400 min-w-0">
                    <Icon name="qr_code_scanner" className="text-[16px] animate-pulse shrink-0" />
                    <span className="truncate">
                      {activeSlot ? t('orders_serial_scanning_into', { product: activeSlot.title }) : t('orders_serial_scanning')}
                    </span>
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
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[12px] text-[#565e74] dark:text-slate-400 min-w-0">
                  <Icon name="qr_code_scanner" className="text-[18px] shrink-0" />
                  <span className="truncate">{t('orders_serial_scan_hint')}</span>
                </div>
                <button
                  type="button"
                  onClick={handleScanRequested}
                  className="flex items-center justify-center gap-1.5 h-9 px-3 bg-white dark:bg-[#131b2e] rounded-lg border border-[#e5eeff] dark:border-slate-700 text-[12.5px] font-medium text-[#565e74] dark:text-slate-400 hover:text-[#004ac6] dark:hover:text-blue-300 transition-colors cursor-pointer shrink-0"
                >
                  <Icon name="photo_camera" className="text-[16px]" />
                  {t('orders_serial_scan_camera')}
                </button>
              </div>
            )}
            {scanError && (
              <p className="flex items-center gap-1.5 text-[11.5px] text-[#ba1a1a] dark:text-red-400 mt-3">
                <Icon name="error" className="text-[15px] shrink-0" />
                <span>{scanError}</span>
              </p>
            )}
          </div>

          {/* Per-item serial fields */}
          <div className="flex flex-col gap-2.5">
            {slots.map((slot, idx) => {
              const value = serials[slot.itemId] ?? '';
              const trimmed = value.trim();
              const saved = savedMap[slot.itemId] ?? '';
              const isActive = slot.itemId === activeKey;
              const isSaved = trimmed !== '' && trimmed === saved;
              const isDirty = trimmed !== '' && trimmed !== saved;
              const isSavingItem = savingIds.has(slot.itemId);
              return (
                <div
                  key={slot.itemId}
                  className={`flex items-center gap-3 p-2.5 rounded-xl border transition-colors ${
                    isActive
                      ? 'border-[#004ac6] dark:border-blue-500 bg-[#eff4ff] dark:bg-blue-950/30'
                      : 'border-[#e5eeff] dark:border-slate-800 bg-white dark:bg-[#131b2e]'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={slot.image}
                    alt={slot.imageAlt}
                    className="w-11 h-11 rounded-lg object-cover bg-[#eff4ff] dark:bg-slate-800 shrink-0"
                  />
                  <div className="flex flex-col min-w-0 flex-1 gap-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[12.5px] font-semibold text-[#0b1c30] dark:text-white truncate">{slot.title}</span>
                      {slot.quantity > 1 && (
                        <span className="px-1.5 py-0.5 rounded bg-[#eff4ff] dark:bg-slate-800 text-[10.5px] font-bold text-[#004ac6] dark:text-blue-300 shrink-0">
                          ×{slot.quantity}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <Icon
                        name="qr_code_scanner"
                        className="text-[15px] absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                      />
                      <input
                        ref={(el) => { inputsRef.current[slot.itemId] = el; }}
                        type="text"
                        value={value}
                        onChange={(e) => setSerials((prev) => ({ ...prev, [slot.itemId]: e.target.value }))}
                        onFocus={() => setActiveKey(slot.itemId)}
                        onKeyDown={(e) => handleKeyDown(e, idx)}
                        placeholder={t('orders_serial_placeholder')}
                        className="w-full h-9 pl-8 pr-8 rounded-lg border border-[#e5eeff] dark:border-slate-700 bg-[#f8f9ff] dark:bg-[#0b1326] text-[12.5px] font-mono text-[#0b1c30] dark:text-white placeholder:font-sans placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#004ac6]/40 focus:border-[#004ac6]"
                      />
                      {isSaved && (
                        <Icon
                          name="check_circle"
                          className="text-[16px] absolute right-2.5 top-1/2 -translate-y-1/2 text-[#1f9254] dark:text-green-400 pointer-events-none"
                        />
                      )}
                    </div>
                    {/* Save this item's serial on its own, one at a time. */}
                    <div className="flex items-center justify-between gap-2">
                      {isSaved ? (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-[#1f9254] dark:text-green-400">
                          <Icon name="check_circle" className="text-[13px]" />
                          {t('orders_serial_saved_label')}
                        </span>
                      ) : (
                        <span />
                      )}
                      <button
                        type="button"
                        onClick={() => handleSaveOne(slot.itemId)}
                        disabled={!isDirty || isSavingItem}
                        className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md bg-[#004ac6] hover:bg-[#003ea8] text-white text-[11.5px] font-semibold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Icon name={isSavingItem ? 'progress_activity' : 'save'} className={`text-[13px] ${isSavingItem ? 'animate-spin' : ''}`} />
                        {isSavingItem ? t('orders_serial_saving') : t('orders_serial_save_one_btn')}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 bg-white dark:bg-[#131b2e] border-t border-[#e5eeff] dark:border-slate-800">
          <span className={`flex items-center gap-1.5 text-[12px] font-medium ${allFilled ? 'text-[#1f9254] dark:text-green-400' : 'text-[#565e74] dark:text-slate-400'}`}>
            {allFilled && <Icon name="check_circle" className="text-[15px]" />}
            {t('orders_serial_progress', { done: filledCount, total: slots.length })}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 h-10 bg-[#eff4ff] dark:bg-slate-800 text-[#0b1c30] dark:text-white hover:bg-[#dae2fd] dark:hover:bg-slate-700 text-[12.5px] font-medium rounded-lg transition-colors cursor-pointer"
          >
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  );
};
