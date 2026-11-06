import useLocales from '@/locales/use-locales';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Icon } from '@/components/lucide-icon';
import useAddFulfillmentNote from '@/api/order/add-fulfillment-note';
import useUpdateOrderStatus from '@/api/order/update-order-status';
import useMarkOrderProcessed from '@/api/order/mark-order-processed';
import useMarkOrderInTransit from '@/api/order/mark-order-in-transit';
import useMarkOrderArrived from '@/api/order/mark-order-arrived';
import useMarkOrderOutForDelivery from '@/api/order/mark-order-out-for-delivery';
import { ProcessingConfirmModal, ProcessingDetails } from './ProcessingConfirmModal';
import { TransitConfirmModal, TransitDetails } from './TransitConfirmModal';
import { ArrivedConfirmModal, ArrivedDetails } from './ArrivedConfirmModal';
import { OutForDeliveryConfirmModal, OutForDeliveryDetails } from './OutForDeliveryConfirmModal';
import { Order } from './types';
import { formatWithCurrency } from '@/utils/lodash';

// Full backend lifecycle (OrderStatusEnum), in order. `cancelled` is terminal and
// handled separately. Labels reuse the existing customers_order_status_* keys.
const TRACKING_LIFECYCLE = [
  'placed',
  'processed',
  'in_transit',
  'arrived_in_facility',
  'out_for_delivery',
  'delivered',
] as const;

// USD amounts recorded against the supplier purchase (distinct from the store
// currency used elsewhere), so they're shown with an explicit "$".
const formatUsd = (amount: number): string =>
  `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Mask the last four characters of a supplier order reference (e.g. "PO-20481234" -> "PO-2048xxxx").
const maskReference = (ref?: string): string | undefined => {
  if (!ref) return ref;
  return ref.length <= 4 ? 'XXXX' : `${ref.slice(0, -4)}XXXX`;
};

const StageField: React.FC<{ label: string; value?: string; mono?: boolean }> = ({ label, value, mono }) =>
  value ? (
    <div className="flex items-start justify-between gap-3 text-[12.5px]">
      <span className="text-[#565e74] dark:text-slate-400 shrink-0">{label}</span>
      <span className={`font-semibold text-[#0b1c30] dark:text-white text-right ${mono ? 'font-mono text-[11.5px]' : ''}`}>
        {value}
      </span>
    </div>
  ) : null;

// A stored receipt may be an uploaded URL (render a link) or a plain reference (render as text).
const StageReceipt: React.FC<{ label: string; value?: string; linkText: string }> = ({ label, value, linkText }) => {
  if (!value) return null;
  const isUrl = /^https?:\/\//i.test(value);
  return (
    <div className="flex items-center justify-between gap-3 text-[12.5px]">
      <span className="text-[#565e74] dark:text-slate-400 shrink-0">{label}</span>
      {isUrl ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-[#004ac6] dark:text-blue-400 hover:underline inline-flex items-center gap-1"
        >
          <Icon name="description" className="text-[14px]" />
          {linkText}
        </a>
      ) : (
        <span className="font-semibold text-[#0b1c30] dark:text-white text-right break-all">{value}</span>
      )}
    </div>
  );
};

const StageCard: React.FC<{
  icon: string;
  title: string;
  time?: string;
  accentBg: string;
  children: React.ReactNode;
}> = ({ icon, title, time, accentBg, children }) => (
  <div className="bg-white dark:bg-[#131b2e] p-5 rounded-xl border border-[#e5eeff] dark:border-slate-800 shadow-2xs flex flex-col gap-3">
    <div className="flex items-center gap-2.5">
      <span className={`p-2 rounded-lg ${accentBg}`}>
        <Icon name={icon} className="text-[18px]" />
      </span>
      <div className="flex flex-col">
        <span className="text-[13.5px] font-bold text-[#0b1c30] dark:text-white">{title}</span>
        {time && <span className="text-[11px] text-[#565e74] dark:text-slate-400">{time}</span>}
      </div>
    </div>
    <div className="flex flex-col gap-1.5 pl-0.5">{children}</div>
  </div>
);

interface OrderDetailViewProps {
  order: Order;
  onUpdateOrder: (updated: Order) => void;
  onOpenInvoice: (order: Order) => void;
  onBack: () => void;
}

/** Full fulfillment workbench for a single order, shown on the nested [uid] route. */
export const OrderDetailView: React.FC<OrderDetailViewProps> = ({ order, onUpdateOrder, onOpenInvoice, onBack }) => {
  const { t } = useLocales();
  const [newNoteText, setNewNoteText] = useState('');
  const [isProcessingOpen, setIsProcessingOpen] = useState(false);
  const [isTransitOpen, setIsTransitOpen] = useState(false);
  const [isArrivedOpen, setIsArrivedOpen] = useState(false);
  const [isOutForDeliveryOpen, setIsOutForDeliveryOpen] = useState(false);
  const { mutate: addNote, isPending: isPostingNote } = useAddFulfillmentNote();
  const { mutate: updateStatus, isPending: isAdvancing } = useUpdateOrderStatus();
  const { mutate: markProcessed, isPending: isProcessing } = useMarkOrderProcessed();
  const { mutate: markInTransit, isPending: isDispatching } = useMarkOrderInTransit();
  const { mutate: markArrived, isPending: isCollecting } = useMarkOrderArrived();
  const { mutate: markOutForDelivery, isPending: isDispatchingOut } = useMarkOrderOutForDelivery();

  const isCancelled = order.rawStatus === 'cancelled';
  const currentStepIndex = TRACKING_LIFECYCLE.indexOf(order.rawStatus as (typeof TRACKING_LIFECYCLE)[number]);
  const nextStatus = currentStepIndex >= 0 && currentStepIndex < TRACKING_LIFECYCLE.length - 1
    ? TRACKING_LIFECYCLE[currentStepIndex + 1]
    : null;

  // Supplier-side journey, revealed stage by stage as each transition's details land.
  const p = order.processing;
  const hasTransit = !!(p && (p.shippedFromUsaAt || p.shippedBy || p.shippingReceipt || p.shippingNote || p.shippingCost != null || p.pickupAddress || p.pickupContact || p.courrier));
  const hasArrived = !!(p && (p.collectedAt || p.collectionNote));
  const hasDelivered = order.rawStatus === 'delivered';

  const advanceTo = (status: string) => {
    updateStatus(
      { uid: order.uid, status },
      {
        onSuccess: () => {
          onUpdateOrder({ ...order, rawStatus: status });
          toast.success(t('orders_status_updated', { status: t(`customers_order_status_${status}`) }));
        },
        onError: () => toast.error(t('orders_status_error')),
      }
    );
  };

  const handleAdvanceStatus = () => {
    if (!nextStatus) return;
    // Moving into "processed" means the supplier order must be placed first, so
    // walk the operator through the guided confirmation instead of advancing blindly.
    if (nextStatus === 'processed') {
      setIsProcessingOpen(true);
      return;
    }
    // Moving into "in_transit" captures the shipping details (carrier, pickup, receipt).
    if (nextStatus === 'in_transit') {
      setIsTransitOpen(true);
      return;
    }
    // Moving into "arrived_in_facility" confirms the parcel was collected and its
    // contents verified, checked against the supplier order reference.
    if (nextStatus === 'arrived_in_facility') {
      setIsArrivedOpen(true);
      return;
    }
    // Moving into "out_for_delivery" walks the operator through packing, labelling
    // and scanning the receipt QR code before dispatch.
    if (nextStatus === 'out_for_delivery') {
      setIsOutForDeliveryOpen(true);
      return;
    }
    advanceTo(nextStatus);
  };

  // Send the supplier-purchase details and receipt to the backend, which records
  // them and moves the order to "processed".
  const handleConfirmProcessing = (details: ProcessingDetails) => {
    if (!details.receipt) return;

    const parts: string[] = [];
    parts.push(`${t('orders_processing_seller_label')}: ${details.sellerName}`);
    parts.push(`${t('orders_processing_ref_label')}: ${details.reference}`);
    parts.push(`${t('orders_processing_total_label')}: ${details.total}`);
    parts.push(`${t('orders_processing_receipt_label')}: ${details.receipt.name}`);
    if (details.note) parts.push(details.note);
    const noteText = parts.join(' • ');

    markProcessed(
      {
        uid: order.uid,
        seller: details.sellerName,
        sellerOrderReference: details.reference,
        totalUsdAmount: details.total,
        processingNote: details.note,
        receipt: details.receipt,
      },
      {
        onSuccess: () => {
          onUpdateOrder({
            ...order,
            rawStatus: 'processed',
            notes: [...order.notes, { author: t('orders_note_you'), timestamp: t('just_now'), text: noteText }],
          });
          setIsProcessingOpen(false);
          toast.success(t('orders_status_updated', { status: t('customers_order_status_processed') }));
        },
        onError: () => toast.error(t('orders_status_error')),
      }
    );
  };

  // Send the shipping details and receipt to the backend, which records them and
  // moves the order to "in_transit".
  const handleConfirmTransit = (details: TransitDetails) => {
    const shippedAt = new Date().toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    markInTransit(
      {
        uid: order.uid,
        carrier: details.carrierId,
        shippingCost: details.shippingCost,
        shippingReceipt: details.shippingReceipt,
      },
      {
        onSuccess: () => {
          // Reflect the shipping details immediately; the backend set the authoritative
          // shippedFromUsaAt, so the exact value resolves on the next fetch.
          onUpdateOrder({
            ...order,
            rawStatus: 'in_transit',
            processing: {
              ...order.processing,
              shippedBy: details.shippedBy,
              shippedFromUsaAt: shippedAt,
              shippingCost: details.shippingCost ? Number(details.shippingCost) : order.processing?.shippingCost,
              shippingNote: details.shippingNote || order.processing?.shippingNote,
              shippingReceipt: details.shippingReceipt?.name ?? order.processing?.shippingReceipt,
              pickupAddress: details.pickupAddress || order.processing?.pickupAddress,
              pickupContact: details.pickupContact || order.processing?.pickupContact,
              // Snapshot the picked carrier so its details show at once; contact and
              // USA address resolve from the authoritative record on the next fetch.
              courrier: {
                ...order.processing?.courrier,
                name: details.shippedBy || order.processing?.courrier?.name,
                pickupLocation: details.pickupAddress || order.processing?.courrier?.pickupLocation,
                pickupContact: details.pickupContact || order.processing?.courrier?.pickupContact,
              },
            },
          });
          setIsTransitOpen(false);
          toast.success(t('orders_status_updated', { status: t('customers_order_status_in_transit') }));
        },
        onError: () => toast.error(t('orders_status_error')),
      }
    );
  };

  // Confirm the parcel was collected and verified, then move the order to
  // "arrived_in_facility". The backend rejects a mismatched reference, so surface
  // that distinctly and keep the modal open for a retry.
  const handleConfirmArrived = (details: ArrivedDetails) => {
    const collectedAt = new Date().toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    markArrived(
      {
        uid: order.uid,
        lastFour: details.lastFour,
        collectionNote: details.collectionNote || undefined,
      },
      {
        onSuccess: () => {
          onUpdateOrder({
            ...order,
            rawStatus: 'arrived_in_facility',
            processing: {
              ...order.processing,
              collectedAt,
              collectionNote: details.collectionNote || order.processing?.collectionNote,
            },
          });
          setIsArrivedOpen(false);
          toast.success(t('orders_status_updated', { status: t('customers_order_status_arrived_in_facility') }));
        },
        onError: (err: unknown) => {
          const message = (err as { error?: string })?.error;
          toast.error(
            message === 'lastFour_does_not_match_seller_order_reference'
              ? t('orders_arrived_ref_mismatch')
              : t('orders_status_error')
          );
        },
      }
    );
  };

  // Confirm the order is packed, labelled and its receipt QR code scanned (the modal
  // only confirms once the scan matches this order's uid), then move it to
  // "out_for_delivery" through the dedicated endpoint.
  const handleConfirmOutForDelivery = (_details: OutForDeliveryDetails) => {
    markOutForDelivery(
      { uid: order.uid },
      {
        onSuccess: () => {
          onUpdateOrder({ ...order, rawStatus: 'out_for_delivery' });
          setIsOutForDeliveryOpen(false);
          toast.success(t('orders_status_updated', { status: t('customers_order_status_out_for_delivery') }));
        },
        onError: () => toast.error(t('orders_status_error')),
      }
    );
  };

  const handlePostNote = (e: React.FormEvent) => {
    e.preventDefault();
    const note = newNoteText.trim();
    if (!note) return;
    addNote(
      { uid: order.uid, note },
      {
        onSuccess: () => {
          // Reflect the saved note immediately; the backend stores it on the order.
          onUpdateOrder({
            ...order,
            notes: [...order.notes, { author: t('orders_note_you'), timestamp: t('just_now'), text: note }],
          });
          setNewNoteText('');
          toast.success(t('orders_note_added'));
        },
        onError: () => toast.error(t('orders_note_error')),
      }
    );
  };

  return (
    <div className="flex flex-col gap-5">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#004ac6] dark:text-blue-400 hover:underline self-start"
      >
        <Icon name="arrow_back" className="text-[18px]" />
        <span>{t('back_to_orders')}</span>
      </button>

      {/* ORDER HEADER & ACTIONS BAR */}
      <div className="bg-white dark:bg-[#131b2e] p-5 rounded-xl border border-[#e5eeff] dark:border-slate-800 shadow-2xs flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-[#0b1c30] dark:text-white">
                {t('order_number', { number: order.orderNumber })}
              </h2>
              {order.paymentMethod && (
                <span className="px-2.5 py-1 bg-[#eff4ff] dark:bg-blue-950 text-[#004ac6] dark:text-blue-300 text-[11.5px] font-semibold rounded-lg flex items-center gap-1">
                  <Icon name="credit_card" className="text-[15px]" />
                  {order.paymentMethod}
                </span>
              )}
            </div>
            <span className="text-[12px] text-[#565e74] dark:text-slate-400 mt-1">
              {t('recorded_on', { date: order.dateStr })}
            </span>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => onOpenInvoice(order)}
              className="px-3 py-1.5 rounded-lg bg-[#dbe1ff] text-[#004ac6] hover:bg-[#b4c5ff] text-[12.5px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Icon name="receipt_long" className="text-[17px]" />
              <span>{t('tax_invoice_pdf')}</span>
            </button>
          </div>
        </div>

        {/* PROGRESS TIMELINE STEPPER — full backend lifecycle */}
        <div className="pt-3 pb-1 border-t border-[#f0f4ff] dark:border-slate-800">
          {isCancelled ? (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#ffdad6] dark:bg-red-950/40 text-[#93000a] dark:text-red-300 text-[13px] font-medium">
              <Icon name="cancel" className="text-[18px]" />
              <span>{t('customers_order_status_cancelled')}</span>
            </div>
          ) : (
            <div className="grid grid-cols-6 relative items-start">
              <div className="absolute left-0 right-0 top-[14px] sm:top-4 h-1 bg-[#dce9ff] dark:bg-slate-700 z-0">
                <div
                  className="bg-[#004ac6] h-full rounded-full transition-all duration-500"
                  style={{
                    width:
                      currentStepIndex < 0
                        ? '0%'
                        : currentStepIndex >= TRACKING_LIFECYCLE.length - 1
                          ? '100%'
                          : `${((currentStepIndex + 0.5) / TRACKING_LIFECYCLE.length) * 100}%`,
                  }}
                ></div>
              </div>

              {TRACKING_LIFECYCLE.map((step, idx) => {
                const state =
                  currentStepIndex < 0
                    ? 'pending'
                    : idx < currentStepIndex
                      ? 'completed'
                      : idx === currentStepIndex
                        ? idx === TRACKING_LIFECYCLE.length - 1
                          ? 'completed'
                          : 'in_progress'
                        : 'pending';
                return (
                  <div key={step} className="relative z-10 flex flex-col items-center text-center px-1">
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[12px] shadow-2xs font-semibold ${state === 'completed'
                          ? 'bg-[#004ac6] text-white'
                          : state === 'in_progress'
                            ? 'bg-[#bc4800] text-white ring-4 ring-[#ffdbcd] dark:ring-[#bc4800]/30'
                            : 'bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 text-[#737686]'
                        }`}
                    >
                      {state === 'completed' ? (
                        <Icon name="check" className="text-[15px]" />
                      ) : state === 'in_progress' ? (
                        <Icon name="sync" className="text-[16px] animate-spin" />
                      ) : (
                        <span>{idx + 1}</span>
                      )}
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-semibold text-[#0b1c30] dark:text-white mt-1.5 leading-tight line-clamp-2">
                      {t(`customers_order_status_${step}`, { defaultValue: step })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* "out_for_delivery" is the last operator-driven step; the move to
              "delivered" is not done from here, so hide the next-status button. */}
          {!isCancelled && nextStatus && order.rawStatus !== 'out_for_delivery' && (
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={handleAdvanceStatus}
                disabled={isAdvancing || isDispatching || isCollecting || isDispatchingOut}
                className="inline-flex items-center gap-1.5 px-3.5 h-10 bg-[#004ac6] hover:bg-[#003ea8] text-white text-[12.5px] font-bold rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <Icon name={isAdvancing ? 'progress_activity' : 'arrow_forward'} className={`text-[17px] ${isAdvancing ? 'animate-spin' : ''}`} />
                <span>{t('orders_next_step', { status: t(`customers_order_status_${nextStatus}`) })}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* SUPPLIER FULFILLMENT JOURNEY — stage cards, revealed as each transition lands */}
      {p && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#565e74] dark:text-slate-400">
              {t('orders_fulfillment_journey')}
            </span>
            {order.isPriority && (
              <span className="px-2.5 py-0.5 bg-[#ffdbcd] text-[#943700] dark:bg-amber-900/50 dark:text-amber-300 text-[11px] font-bold rounded flex items-center gap-1">
                <Icon name="priority_high" className="text-[14px]" />
                {t('orders_priority_order')}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Processed */}
            <StageCard
              icon="shopping_cart_checkout"
              title={t('orders_stage_processed')}
              time={p.processedAt}
              accentBg="bg-[#eff4ff] text-[#004ac6] dark:bg-blue-950 dark:text-blue-300"
            >
              <StageField label={t('orders_processing_seller_label')} value={p.seller} />
              <StageField label={t('orders_processing_ref_label')} value={maskReference(p.sellerOrderReference)} mono />
              <StageField label={t('orders_processing_total_label')} value={p.totalUsdAmount != null ? formatUsd(p.totalUsdAmount) : undefined} />
              <StageReceipt label={t('orders_processing_receipt_label')} value={p.receipt} linkText={t('view_receipt')} />
              <StageField label={t('orders_stage_note')} value={p.processingNote} />
            </StageCard>

            {/* In transit (shipped from USA) */}
            {hasTransit && (
              <StageCard
                icon="flight_takeoff"
                title={t('orders_stage_transit')}
                time={p.shippedFromUsaAt}
                accentBg="bg-[#ede9fe] text-[#6d28d9] dark:bg-violet-950 dark:text-violet-300"
              >
                <StageField label={t('orders_stage_shipped_by')} value={p.courrier?.name ?? p.shippedBy} />
                <StageField label={t('orders_stage_carrier_contact')} value={p.courrier?.contact} mono />
                <StageField label={t('orders_stage_shipping_cost')} value={p.shippingCost != null ? formatUsd(p.shippingCost) : undefined} />
                <StageField label={t('orders_stage_pickup_address')} value={p.courrier?.pickupLocation ?? p.pickupAddress} />
                <StageField label={t('orders_stage_pickup_contact')} value={p.courrier?.pickupContact ?? p.pickupContact} mono />
                <StageField label={t('orders_stage_usa_address')} value={p.courrier?.usaAddress} />
                <StageReceipt label={t('orders_stage_shipping_receipt')} value={p.shippingReceipt} linkText={t('view_receipt')} />
                <StageField label={t('orders_stage_note')} value={p.shippingNote} />
              </StageCard>
            )}

            {/* Arrived at facility (collected at destination hub) */}
            {hasArrived && (
              <StageCard
                icon="warehouse"
                title={t('orders_stage_arrived')}
                time={p.collectedAt}
                accentBg="bg-[#ffdbcd] text-[#943700] dark:bg-amber-900/40 dark:text-amber-300"
              >
                <StageField label={t('orders_stage_note')} value={p.collectionNote} />
              </StageCard>
            )}

            {/* Delivered */}
            {hasDelivered && (
              <StageCard
                icon="check_circle"
                title={t('orders_stage_delivered')}
                accentBg="bg-[#dcfce7] text-[#15803d] dark:bg-green-950 dark:text-green-300"
              >
                <p className="text-[12.5px] text-[#565e74] dark:text-slate-400 leading-snug">
                  {t('orders_stage_delivered_desc')}
                </p>
              </StageCard>
            )}
          </div>
        </div>
      )}

      {/* LINE ITEMS BREAKDOWN TABLE */}
      <div className="bg-white dark:bg-[#131b2e] rounded-xl border border-[#e5eeff] dark:border-slate-800 shadow-2xs overflow-hidden flex flex-col">
        <div className="p-4 bg-[#eff4ff]/60 dark:bg-slate-800/60 border-b border-[#e5eeff] dark:border-slate-700 flex items-center justify-between">
          <span className="text-[13px] font-bold text-[#0b1c30] dark:text-white">
            {t('order_items_skus', { count: order.items.length })}
          </span>
          <span className="text-[11.5px] text-[#004ac6] dark:text-blue-400 font-semibold">{t('all_items_in_stock')}</span>
        </div>

        <div className="p-4 flex flex-col divide-y divide-[#f0f4ff] dark:divide-slate-800">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <img
                src={item.image}
                alt={item.imageAlt}
                className="w-20 h-20 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 border border-[#e5eeff] dark:border-slate-700 shadow-2xs flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-[14px] text-[#0b1c30] dark:text-white truncate">{item.title}</h4>
                {item.subtitle && (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {item.variantImage && (
                      <img
                        src={item.variantImage}
                        alt={item.subtitle}
                        className="w-5 h-5 rounded object-cover border border-[#e5eeff] dark:border-slate-700 flex-shrink-0"
                      />
                    )}
                    <p className="text-[12px] text-[#565e74] dark:text-slate-400 truncate">{item.subtitle}</p>
                  </div>
                )}
                {item.sku && <span className="text-[11px] font-mono text-[#737686]">{t('sku_label', { sku: item.sku })}</span>}
              </div>
              <div className="text-right flex-shrink-0">
                <span className="text-[15px] font-semibold text-[#0b1c30] dark:text-white">{t('qty_label', { count: item.quantity })}</span>
                <span className="text-[15px] font-bold text-[#0b1c30] dark:text-white block mt-0.5">
                  {formatWithCurrency(item.price * item.quantity)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* TOTALS RECAP */}
        <div className="bg-[#eff4ff]/60 dark:bg-slate-800/60 p-4 border-t border-[#e5eeff] dark:border-slate-700 flex flex-col gap-1.5 text-[13px]">
          <div className="flex justify-between text-[#565e74] dark:text-slate-400">
            <span>{t('subtotal_plain')}</span>
            <span className="font-semibold text-[#0b1c30] dark:text-white">{formatWithCurrency(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-[#565e74] dark:text-slate-400">
            <span>{t('shipping_handling')}</span>
            <span className="font-semibold text-[#004ac6] dark:text-blue-400">{t('free_amount')}</span>
          </div>
          <div className="flex justify-between text-[#565e74] dark:text-slate-400">
            <span>{t('california_state_tax')}</span>
            <span className="font-semibold text-[#0b1c30] dark:text-white">{formatWithCurrency(order.tax)}</span>
          </div>
          <div className="flex justify-between items-baseline pt-2 mt-1 border-t border-[#dce9ff] dark:border-slate-700">
            <div className="flex flex-col">
              <span className="text-[14px] font-bold text-[#0b1c30] dark:text-white">{t('total_authorized_amount')}</span>
              <span className="text-[10.5px] text-[#737686]">{t('luxury_surcharges')}</span>
            </div>
            <span className="text-xl font-extrabold text-[#004ac6] dark:text-blue-400">{formatWithCurrency(order.totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* CUSTOMER & LOGISTICS DETAILS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Customer Profile Card */}
        <div className="bg-white dark:bg-[#131b2e] p-6 rounded-xl border border-[#e5eeff] dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#565e74] dark:text-slate-400">{t('customer_credentials')}</span>
              {order.customerTier && (
                <span className="px-2 py-0.5 bg-[#dae2fd] text-[#004ac6] text-[10.5px] font-bold rounded">{order.customerTier}</span>
              )}
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-[#dbe1ff] text-[#004ac6] flex items-center justify-center font-bold text-[14px]">
                {order.customerName.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[14px] text-[#0b1c30] dark:text-white">{order.customerName}</span>
                <span className="text-[12px] text-[#565e74] dark:text-slate-400">{order.customerEmail}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery & Billing Address Card */}
        <div className="bg-white dark:bg-[#131b2e] p-6 rounded-xl border border-[#e5eeff] dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#565e74] dark:text-slate-400">{t('destination_address')}</span>
            </div>
            <div className="flex flex-col gap-0.5 mb-3">
              <span className="font-semibold text-[13.5px] text-[#0b1c30] dark:text-white">{order.shippingAddress.name}</span>
              <p className="text-[12.5px] text-[#565e74] dark:text-slate-400 leading-relaxed">
                {order.shippingAddress.street}<br />
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}<br />
                {order.shippingAddress.country}
              </p>
              <span className="text-[11.5px] font-mono text-[#565e74] dark:text-slate-400 mt-1">{order.shippingAddress.phone}</span>
            </div>
          </div>
        </div>
      </div>

      {/* INTERNAL NOTES & WORKSHOP INSTRUCTIONS */}
      <div className="bg-white dark:bg-[#131b2e] p-6 rounded-xl border border-[#e5eeff] dark:border-slate-800 shadow-2xs flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Icon name="edit_note" className="text-[#737686] text-[18px]" />
            <span className="text-[13.5px] font-bold text-[#0b1c30] dark:text-white">{t('internal_notes')}</span>
          </div>
          <span className="text-[11px] text-[#737686]">{t('internal_only')}</span>
        </div>

        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
          {order.notes.map((nt, i) => (
            <div key={i} className="p-3 bg-[#eff4ff] dark:bg-slate-800 rounded-lg flex flex-col gap-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-[#004ac6] dark:text-blue-300">{nt.author}</span>
                <span className="text-[#565e74] dark:text-slate-400">{nt.timestamp}</span>
              </div>
              <p className="text-[12.5px] text-[#0b1c30] dark:text-slate-200 leading-snug">&quot;{nt.text}&quot;</p>
            </div>
          ))}
        </div>

        <form onSubmit={handlePostNote} className="flex items-end gap-2 mt-1">
          <textarea
            value={newNoteText}
            onChange={(e) => setNewNoteText(e.target.value)}
            placeholder={t('add_private_note')}
            rows={3}
            className="flex-1 px-3 py-2 bg-[#eff4ff] dark:bg-slate-800 text-[#0b1c30] dark:text-white text-[12.5px] rounded-lg border border-transparent focus:border-[#004ac6] focus:outline-none resize-y min-h-[72px]"
          />
          <button
            type="submit"
            disabled={!newNoteText.trim() || isPostingNote}
            className="px-3.5 h-9 bg-[#dce9ff] dark:bg-slate-700 hover:bg-[#b4c5ff] text-[#004ac6] dark:text-white text-[12.5px] font-semibold rounded-lg transition-colors disabled:opacity-40 cursor-pointer shrink-0 inline-flex items-center gap-1.5"
          >
            {isPostingNote && <Icon name="progress_activity" className="text-[16px] animate-spin" />}
            <span>{t('post_note')}</span>
          </button>
        </form>
      </div>

      <ProcessingConfirmModal
        isOpen={isProcessingOpen}
        onClose={() => setIsProcessingOpen(false)}
        order={order}
        onConfirm={handleConfirmProcessing}
        isPending={isProcessing}
      />

      <TransitConfirmModal
        isOpen={isTransitOpen}
        onClose={() => setIsTransitOpen(false)}
        order={order}
        onConfirm={handleConfirmTransit}
        isPending={isDispatching}
      />

      <ArrivedConfirmModal
        isOpen={isArrivedOpen}
        onClose={() => setIsArrivedOpen(false)}
        order={order}
        onConfirm={handleConfirmArrived}
        isPending={isCollecting}
      />

      <OutForDeliveryConfirmModal
        isOpen={isOutForDeliveryOpen}
        onClose={() => setIsOutForDeliveryOpen(false)}
        order={order}
        onConfirm={handleConfirmOutForDelivery}
        isPending={isDispatchingOut}
      />
    </div>
  );
};
