import useLocales from '@/locales/use-locales';
import React, { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Icon } from '@/components/lucide-icon';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import useEditOrderDetails from '@/api/user/edit-order-details';
import useCancelOrder from '@/api/user/cancel-order';
import useResendOrderConfirmation from '@/api/user/resend-order-confirmation';
import { GET_CUSTOMER_ORDERS_QUERY_KEY } from '@/api/user/get-customer-orders';
import useGetOrder from '@/api/user/get-order';
import { CustomerOrder } from './types';
import { mapApiOrder } from './mapper';
import { PaymentIcon, storefrontProductUrl } from './shared';
import { formatWithCurrency } from '@/utils/lodash';

// The order can only be cancelled while it is still placed or being processed.
const CANCELLABLE_STATUSES = ['placed', 'processing'];

// Delivery lifecycle in order, matching the backend Order::STATUS_* constants.
// Drives the tracking stepper; `cancelled` is a terminal exception shown separately.
const TRACKING_STEPS = [
  'placed',
  'processing',
  'in_transit',
  'arrived_in_facility',
  'out_for_delivery',
  'delivered',
] as const;

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: CustomerOrder | null;
  onViewInvoice?: (order: CustomerOrder) => void;
}

const EMPTY = '—';

// Badge colours per Payment::STATUS_* value.
const PAYMENT_STATUS_STYLES: Record<string, string> = {
  completed: 'bg-[#d8f0dd] dark:bg-emerald-950/40 text-[#0b6b2e] dark:text-emerald-300',
  pending: 'bg-[#ffe9cc] dark:bg-amber-950/40 text-[#8a4b00] dark:text-amber-300',
  failed: 'bg-[#ffdad6] dark:bg-red-950/40 text-[#93000a] dark:text-red-300',
  refunded: 'bg-[#e5eeff] dark:bg-slate-700 text-[#565e74] dark:text-slate-300',
};

const ADDRESS_INPUT =
  'w-full h-9 px-3 bg-[#eff4ff] dark:bg-slate-800 rounded-lg text-[13px] text-[#0b1c30] dark:text-white placeholder:text-[#737686] focus:outline-none border border-transparent focus:border-[#2563eb]/40 transition-colors';

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ isOpen, onClose, order: orderProp, onViewInvoice }) => {
  const { t } = useLocales();
  const queryClient = useQueryClient();
  const { mutate: editOrderDetails, isPending } = useEditOrderDetails();
  const { mutate: cancelOrder, isPending: isCancelling } = useCancelOrder();
  const { mutate: resendConfirmation, isPending: isResending } = useResendOrderConfirmation();

  // When the modal opens, fetch the full order by id for the richer detail the list omits.
  // Only numeric backend ids are fetched; the passed-in order stays as the fallback.
  const canFetch = isOpen && !!orderProp?.id && /^\d+$/.test(orderProp.id);
  const { data: fetchedOrder } = useGetOrder(orderProp?.id, canFetch);

  // Local copy so a saved address shows immediately without reopening the modal.
  const [order, setOrder] = useState<CustomerOrder | null>(orderProp);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  // Confirmation dialogs for the footer's destructive / outward-facing actions.
  const [isResendDialogOpen, setIsResendDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    street: '',
    city: '',
    state: '',
    country: '',
    phone: '',
  });

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      // Let an open confirmation dialog handle Escape itself instead of closing the whole modal.
      if (e.key === 'Escape' && !isResendDialogOpen && !isCancelDialogOpen) onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose, isResendDialogOpen, isCancelDialogOpen]);

  // Sync the local copy and reset the form whenever a different order is opened.
  useEffect(() => {
    setOrder(orderProp);
    setIsEditingAddress(false);
    setAddressForm({
      fullName: orderProp?.shippingAddress?.fullName ?? '',
      street: orderProp?.shippingAddress?.street ?? '',
      city: orderProp?.shippingAddress?.city ?? '',
      state: orderProp?.shippingAddress?.state ?? '',
      country: orderProp?.shippingAddress?.country ?? '',
      phone: orderProp?.shippingAddress?.phone ?? '',
    });
  }, [orderProp]);

  // Replace the local copy with the fully-detailed order once the fetch resolves.
  useEffect(() => {
    if (fetchedOrder) setOrder(mapApiOrder(fetchedOrder));
  }, [fetchedOrder]);

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    editOrderDetails(
      {
        uid: order.orderNumber,
        data: {
          fullName: addressForm.fullName,
          street: addressForm.street,
          city: addressForm.city,
          state: addressForm.state,
          phone: addressForm.phone,
        },
      },
      {
        onSuccess: () => {
          // Reflect the change locally, then let the server data win on refetch.
          setOrder((prev) =>
            prev
              ? {
                ...prev,
                shippingAddress: {
                  ...prev.shippingAddress,
                  fullName: addressForm.fullName,
                  phone: addressForm.phone,
                  street: addressForm.street,
                  city: addressForm.city,
                  state: addressForm.state,
                  country: addressForm.country,
                },
              }
              : prev
          );
          queryClient.invalidateQueries({ queryKey: [GET_CUSTOMER_ORDERS_QUERY_KEY] });
          setIsEditingAddress(false);
          toast.success(t('customers_order_address_saved'));
        },
        onError: () => toast.error(t('customers_order_address_error')),
      }
    );
  };

  const handleResendConfirmation = () => {
    if (!order) return;
    resendConfirmation(
      { uid: order.orderNumber },
      {
        onSuccess: () => {
          setIsResendDialogOpen(false);
          toast.success(t('customers_order_resend_sent'));
        },
        onError: () => toast.error(t('customers_order_resend_error')),
      }
    );
  };

  const handleCancelOrder = () => {
    if (!order) return;
    cancelOrder(
      { uid: order.orderNumber },
      {
        onSuccess: () => {
          setOrder((prev) => (prev ? { ...prev, deliveryStatus: 'cancelled' } : prev));
          queryClient.invalidateQueries({ queryKey: [GET_CUSTOMER_ORDERS_QUERY_KEY] });
          setIsCancelDialogOpen(false);
          toast.success(t('customers_order_cancelled'));
        },
        onError: () => toast.error(t('customers_order_cancel_error')),
      }
    );
  };

  if (!isOpen || !order) return null;

  const canCancel = CANCELLABLE_STATUSES.includes(order.deliveryStatus);

  const isCancelled = order.deliveryStatus === 'cancelled';
  // Index of the current status in the lifecycle; -1 if the backend sent an unknown value.
  const currentStepIndex = TRACKING_STEPS.indexOf(order.deliveryStatus as (typeof TRACKING_STEPS)[number]);
  const isDelivered = order.deliveryStatus === 'delivered';
  // Once the parcel is out for delivery (or beyond), the shipping address is locked.
  const canEditAddress = !isCancelled && currentStepIndex < TRACKING_STEPS.indexOf('out_for_delivery');
  // Fill reaches the current step's dot centre; a delivered order fills the whole bar.
  const progressWidth = isDelivered
    ? '100%'
    : currentStepIndex >= 0
      ? `${((currentStepIndex + 0.5) / TRACKING_STEPS.length) * 100}%`
      : '0%';

  const formatDateTime = (value?: string) => (value ? new Date(value).toLocaleString() : EMPTY);
  const shippingLine = [
    order.shippingAddress?.street,
    order.shippingAddress?.city,
    order.shippingAddress?.state,
    order.shippingAddress?.country,
  ]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(', ');

  const itemsSubtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const META = 'text-[11px] font-semibold text-[#565e74] dark:text-slate-400 uppercase tracking-wider';

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="w-full max-w-6xl min-h-[70vh] bg-[#f8f9ff] dark:bg-[#0b1326] rounded-2xl shadow-2xl border border-[#e5eeff] dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        <div className="shrink-0 flex items-center justify-between gap-3 px-6 py-4 bg-white dark:bg-[#131b2e] border-b border-[#e5eeff] dark:border-slate-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-3 h-6 bg-[#2563eb] rounded-full"></div>
            <h2 className="text-[15px] text-[#0b1c30] dark:text-white font-bold truncate">
              {t('customers_order_modal_title', { order: order.orderNumber })}
            </h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#e5eeff] dark:bg-slate-700 text-[11px] font-semibold shrink-0">
              <Icon name="check_circle" className="text-[14px] text-[#004ac6] dark:text-blue-400" />
              {t(`customers_order_status_${order.deliveryStatus}`, { defaultValue: order.deliveryStatus })}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors shrink-0"
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 min-h-0 space-y-5">
          {/* Timeline & shipping */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-[#e5eeff] dark:border-slate-800 bg-white dark:bg-[#131b2e] p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <span className={META}>{t('customers_order_placed_on')}</span>
                <span className="text-[13px] text-[#0b1c30] dark:text-white font-medium">{order.date} {order.time}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className={META}>{t('customers_order_updated_on')}</span>
                <span className="text-[13px] text-[#0b1c30] dark:text-white font-medium">{formatDateTime(order.updatedAt)}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className={META}>{t('customers_order_eta')}</span>
                <span className="text-[13px] text-[#0b1c30] dark:text-white font-medium">{formatDateTime(order.estimatedDeliveryAt)}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className={META}>{t('customers_col_payment_short')}</span>
                <span className="inline-flex items-center gap-1.5 text-[13px] text-[#0b1c30] dark:text-white font-medium">
                  <PaymentIcon method={order.paymentMethod} />
                  {t(`customers_payment_type_${order.paymentMethod}`, { defaultValue: order.paymentMethod })}
                </span>
              </div>
              {order.payment && (
                <>
                  {order.payment.status && (
                    <div className="flex items-center justify-between gap-2">
                      <span className={META}>{t('customers_payment_status_label')}</span>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${PAYMENT_STATUS_STYLES[order.payment.status] ?? 'bg-[#e5eeff] dark:bg-slate-700 text-[#004ac6] dark:text-blue-400'}`}>
                        {t(`customers_payment_status_${order.payment.status}`, { defaultValue: order.payment.status })}
                      </span>
                    </div>
                  )}
                  {typeof order.payment.amount === 'number' && (
                    <div className="flex items-center justify-between gap-2">
                      <span className={META}>{t('customers_payment_amount')}</span>
                      <span className="text-[13px] text-[#0b1c30] dark:text-white font-medium">{formatWithCurrency(order.payment.amount)}</span>
                    </div>
                  )}
                  {order.payment.transactionId && (
                    <div className="flex items-center justify-between gap-2">
                      <span className={META}>{t('customers_payment_transaction')}</span>
                      <span className="text-[12px] text-[#0b1c30] dark:text-white font-mono truncate max-w-[55%]" title={order.payment.transactionId}>
                        {order.payment.transactionId}
                      </span>
                    </div>
                  )}
                  {order.payment.paidAt && (
                    <div className="flex items-center justify-between gap-2">
                      <span className={META}>{t('customers_payment_paid_on')}</span>
                      <span className="text-[13px] text-[#0b1c30] dark:text-white font-medium">{formatDateTime(order.payment.paidAt)}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="rounded-xl border border-[#e5eeff] dark:border-slate-800 bg-white dark:bg-[#131b2e] p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Icon name="local_shipping" className="text-[18px] text-[#004ac6] dark:text-blue-400" />
                  <span className={META}>{t('customers_order_shipping_title')}</span>
                </div>
                {!isEditingAddress && canEditAddress && (
                  <button
                    type="button"
                    onClick={() => setIsEditingAddress(true)}
                    className="inline-flex items-center gap-1 text-[#004ac6] dark:text-blue-400 hover:underline text-[12px] font-semibold"
                  >
                    <Icon name="edit" className="text-[16px]" />
                    <span>{t('customers_edit_address')}</span>
                  </button>
                )}
                {!isEditingAddress && !canEditAddress && (
                  <span className="inline-flex items-center gap-1 text-[#737686] dark:text-slate-500 text-[12px] font-semibold">
                    <Icon name="lock" className="text-[14px]" />
                    <span>{t('customers_address_locked')}</span>
                  </span>
                )}
              </div>

              {isEditingAddress ? (
                <form onSubmit={handleSaveAddress} className="flex flex-col gap-2 pt-1">
                  <input
                    className={ADDRESS_INPUT}
                    placeholder={t('customers_address_form_fullname')}
                    value={addressForm.fullName}
                    onChange={(e) => setAddressForm((f) => ({ ...f, fullName: e.target.value }))}
                  />
                  <input
                    className={ADDRESS_INPUT}
                    placeholder={t('customers_address_form_street')}
                    value={addressForm.street}
                    onChange={(e) => setAddressForm((f) => ({ ...f, street: e.target.value }))}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      className={ADDRESS_INPUT}
                      placeholder={t('customers_address_form_city')}
                      value={addressForm.city}
                      onChange={(e) => setAddressForm((f) => ({ ...f, city: e.target.value }))}
                    />
                    <input
                      className={ADDRESS_INPUT}
                      placeholder={t('customers_address_form_state')}
                      value={addressForm.state}
                      onChange={(e) => setAddressForm((f) => ({ ...f, state: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      className={ADDRESS_INPUT}
                      placeholder={t('customers_address_form_country')}
                      value={addressForm.country}
                      onChange={(e) => setAddressForm((f) => ({ ...f, country: e.target.value }))}
                    />
                    <input
                      className={ADDRESS_INPUT}
                      placeholder={t('customers_address_form_phone')}
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm((f) => ({ ...f, phone: e.target.value }))}
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={isPending}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#2563eb] hover:bg-[#004ac6] text-white text-[13px] rounded-lg transition-colors font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <Icon name={isPending ? 'progress_activity' : 'save'} className={`text-[18px] ${isPending ? 'animate-spin' : ''}`} />
                      <span>{t('save')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingAddress(false)}
                      disabled={isPending}
                      className="px-3.5 py-2 bg-[#eff4ff] dark:bg-slate-800 text-[#0b1c30] dark:text-white hover:bg-[#dae2fd] dark:hover:bg-slate-700 text-[13px] rounded-lg transition-colors font-medium disabled:opacity-60"
                    >
                      {t('cancel')}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  {order.shippingAddress?.fullName && (
                    <span className="text-[13px] font-bold text-[#0b1c30] dark:text-white">{order.shippingAddress.fullName}</span>
                  )}
                  <span className="text-[13px] text-[#565e74] dark:text-slate-300">{shippingLine || EMPTY}</span>
                  {order.shippingAddress?.phone && (
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-[#565e74] dark:text-slate-400 pt-0.5">
                      <Icon name="call" className="text-[14px]" />
                      {order.shippingAddress.phone}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Tracking */}
          <div className="rounded-xl border border-[#e5eeff] dark:border-slate-800 bg-white dark:bg-[#131b2e] p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Icon name="local_shipping" className="text-[18px] text-[#004ac6] dark:text-blue-400" />
              <span className="text-[13px] font-bold text-[#0b1c30] dark:text-white">{t('customers_order_tracking_title')}</span>
            </div>

            {isCancelled ? (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#ffdad6] dark:bg-red-950/40 text-[#93000a] dark:text-red-300 text-[13px] font-medium">
                <Icon name="cancel" className="text-[18px]" />
                <span>{t('customers_order_tracking_cancelled')}</span>
              </div>
            ) : (
              <div className="pt-2 pb-1">
                <div className="grid grid-cols-6 relative items-start">
                  <div className="absolute left-0 right-0 top-[14px] sm:top-4 h-1 bg-[#dce9ff] dark:bg-slate-700 z-0">
                    <div
                      className="bg-[#004ac6] h-full rounded-full transition-all duration-500"
                      style={{ width: progressWidth }}
                    ></div>
                  </div>

                  {TRACKING_STEPS.map((step, idx) => {
                    const state =
                      currentStepIndex < 0
                        ? 'upcoming'
                        : idx < currentStepIndex
                          ? 'completed'
                          : idx === currentStepIndex
                            ? isDelivered
                              ? 'completed'
                              : 'in_progress'
                            : 'upcoming';
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
              </div>
            )}
          </div>

          {/* Items */}
          <div className="rounded-xl border border-[#e5eeff] dark:border-slate-800 bg-white dark:bg-[#131b2e] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#f0f4ff] dark:border-slate-800 flex items-center gap-2">
              <Icon name="shopping_bag" className="text-[18px] text-[#004ac6] dark:text-blue-400" />
              <span className="text-[13px] font-bold text-[#0b1c30] dark:text-white">{t('customers_order_items_title')}</span>
              <span className="px-2 py-0.5 bg-[#dae2fd] text-[#004ac6] text-[11px] rounded-full font-bold">{order.items.length}</span>
            </div>

            {order.items.length === 0 ? (
              <p className="px-4 py-5 text-[13px] text-[#565e74] dark:text-slate-400">{t('customers_order_no_items')}</p>
            ) : (
              <div className="divide-y divide-[#f0f4ff] dark:divide-slate-800">
                {order.items.map((item, idx) => {
                  const href = storefrontProductUrl(item.slug);
                  return (
                  <div key={idx} className="flex items-center gap-3 px-4 py-3">
                    {item.image ? (
                      <img
                        className="w-12 h-12 object-cover rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0"
                        src={item.image}
                        alt={item.name}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0 flex items-center justify-center text-[#737686]">
                        <Icon name="shopping_bag" className="text-[20px]" />
                      </div>
                    )}
                    <div className="flex flex-col min-w-0 flex-1">
                      {href ? (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[13px] font-medium text-[#004ac6] dark:text-blue-400 hover:underline line-clamp-1"
                        >
                          {item.name}
                        </a>
                      ) : (
                        <span className="text-[13px] font-medium text-[#0b1c30] dark:text-white line-clamp-1">{item.name}</span>
                      )}
                      <span className="text-[#565e74] dark:text-slate-400 text-[11px]">
                        {item.variant ? `${item.variant} • ` : ''}{t('customers_qty', { count: item.quantity })}
                        {item.warranty ? ` • ${item.warranty}` : ''}
                        {item.batteryHealth ? ` • ${item.batteryHealth}` : ''}
                      </span>
                      <span className="text-[#737686] text-[11px]">
                        {t('customers_order_unit_price')}: {formatWithCurrency(item.price)}
                      </span>
                    </div>
                    <span className="text-[13px] font-bold text-[#0b1c30] dark:text-white whitespace-nowrap">
                      {formatWithCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Totals */}
          <div className="rounded-xl border border-[#e5eeff] dark:border-slate-800 bg-white dark:bg-[#131b2e] p-4 flex flex-col gap-2">
            {itemsSubtotal > 0 && (
              <div className="flex items-center justify-between text-[13px] text-[#565e74] dark:text-slate-300">
                <span>{t('customers_order_line_total')}</span>
                <span>{formatWithCurrency(itemsSubtotal)}</span>
              </div>
            )}
            {order.taxIncludedPercent > 0 && (
              <div className="flex items-center justify-between text-[11px] text-[#737686]">
                <span>{t('customers_vat_included', { percent: order.taxIncludedPercent })}</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-2 border-t border-[#f0f4ff] dark:border-slate-800">
              <span className="text-[13px] font-bold text-[#0b1c30] dark:text-white">{t('customers_order_grand_total')}</span>
              <span className="text-[15px] font-bold text-[#004ac6] dark:text-blue-400">{formatWithCurrency(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Footer: current status + cancellation */}
        <div className="shrink-0 flex items-center justify-between gap-3 px-6 py-4 bg-white dark:bg-[#131b2e] border-t border-[#e5eeff] dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-[#565e74] dark:text-slate-400 uppercase tracking-wider">
              {t('customers_order_status_label')}
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${order.deliveryStatus === 'cancelled'
                  ? 'bg-[#ffdad6] text-[#93000a]'
                  : 'bg-[#e5eeff] dark:bg-slate-700 text-[#004ac6] dark:text-blue-400'
                }`}
            >
              <Icon name={order.deliveryStatus === 'cancelled' ? 'cancel' : 'check_circle'} className="text-[14px]" />
              {t(`customers_order_status_${order.deliveryStatus}`, { defaultValue: order.deliveryStatus })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {onViewInvoice && (
              <button
                type="button"
                onClick={() => onViewInvoice(order)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#eff4ff] dark:bg-slate-800 text-[#0b1c30] dark:text-white hover:bg-[#dae2fd] dark:hover:bg-slate-700 text-[13px] rounded-lg transition-colors font-semibold"
              >
                <Icon name="picture_as_pdf" className="text-[18px] text-[#004ac6] dark:text-blue-400" />
                <span>{t('customers_order_view_invoice')}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsResendDialogOpen(true)}
              disabled={isResending}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#eff4ff] dark:bg-slate-800 text-[#0b1c30] dark:text-white hover:bg-[#dae2fd] dark:hover:bg-slate-700 text-[13px] rounded-lg transition-colors font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Icon name={isResending ? 'progress_activity' : 'forward_to_inbox'} className={`text-[18px] text-[#004ac6] dark:text-blue-400 ${isResending ? 'animate-spin' : ''}`} />
              <span>{t('customers_order_resend')}</span>
            </button>
            <button
              type="button"
              onClick={() => setIsCancelDialogOpen(true)}
              disabled={!canCancel || isCancelling}
              title={!canCancel ? t(`customers_order_status_${order.deliveryStatus}`, { defaultValue: order.deliveryStatus }) : undefined}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#ba1a1a] hover:bg-[#93000a] text-white text-[13px] rounded-lg transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#ba1a1a]"
            >
              <Icon name={isCancelling ? 'progress_activity' : 'cancel'} className={`text-[18px] ${isCancelling ? 'animate-spin' : ''}`} />
              <span>{t('customers_order_cancel')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Resend confirmation dialog */}
      <AlertDialog open={isResendDialogOpen} onOpenChange={setIsResendDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('customers_order_resend_confirm_title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('customers_order_resend_confirm')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isResending}>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              disabled={isResending}
              onClick={(e) => { e.preventDefault(); handleResendConfirmation(); }}
            >
              {t('customers_order_resend')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel order dialog */}
      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('customers_order_cancel_confirm_title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('customers_order_cancel_confirm')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              disabled={isCancelling}
              onClick={(e) => { e.preventDefault(); handleCancelOrder(); }}
              className="bg-[#ba1a1a] hover:bg-[#93000a] focus-visible:ring-[#ba1a1a]"
            >
              {t('customers_order_cancel')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
