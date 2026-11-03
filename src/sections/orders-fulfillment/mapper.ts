import { ApiOrder, ApiOrderProcessed, variantImageUrl, variantLabel } from '@/api/user/get-customer-orders';
import { Order, OrderProcessing, OrderStatus, RawOrderStatus } from './types';

type Translate = (key: string, options?: Record<string, unknown>) => string;

const EMPTY = '—';

// The backend lifecycle (Order::STATUS_*) is finer-grained than the fulfillment board's
// five columns, so the in-transit stages all collapse into "shipped".
const STATUS_MAP: Record<string, OrderStatus> = {
  placed: 'pending',
  processed: 'processing',
  in_transit: 'shipped',
  arrived_in_facility: 'shipped',
  out_for_delivery: 'shipped',
  delivered: 'delivered',
  cancelled: 'cancelled',
};

const mapStatus = (status?: string | null): OrderStatus => STATUS_MAP[status ?? ''] ?? 'pending';

// The backend lifecycle statuses (Order::STATUS_*), in flow order, used as the
// order list filter tabs. Each tab filters the collection server-side on its exact
// status (GET /orders?status[]=...). Labels reuse the shared customers_order_status_* keys.
export const ORDER_STATUS_FILTERS: { value: RawOrderStatus; labelKey: string }[] = [
  { value: 'placed', labelKey: 'customers_order_status_placed' },
  { value: 'processed', labelKey: 'customers_order_status_processed' },
  { value: 'in_transit', labelKey: 'customers_order_status_in_transit' },
  { value: 'arrived_in_facility', labelKey: 'customers_order_status_arrived_in_facility' },
  { value: 'out_for_delivery', labelKey: 'customers_order_status_out_for_delivery' },
  { value: 'delivered', labelKey: 'customers_order_status_delivered' },
  { value: 'cancelled', labelKey: 'customers_order_status_cancelled' },
];

// Canonical progress stages shown in the tracking stepper, with the index each
// fulfillment status has reached. `cancelled` only clears the first stage.
const STEP_KEYS = ['orders_step_placed', 'orders_step_processing', 'orders_step_shipped', 'orders_step_out_for_delivery', 'orders_step_delivered'];
const STATUS_STEP_INDEX: Record<OrderStatus, number> = {
  pending: 0,
  processing: 1,
  shipped: 3,
  delivered: 4,
  cancelled: 0,
};

const buildSteps = (status: OrderStatus, t: Translate): Order['steps'] => {
  const current = STATUS_STEP_INDEX[status];
  return STEP_KEYS.map((key, idx) => {
    let stepStatus: Order['steps'][number]['status'] = 'pending';
    if (status === 'delivered') stepStatus = 'completed';
    else if (status === 'cancelled') stepStatus = idx === 0 ? 'completed' : 'pending';
    else if (idx < current) stepStatus = 'completed';
    else if (idx === current) stepStatus = 'in_progress';
    return { title: t(key), time: '', status: stepStatus };
  });
};

const formatDate = (value?: string | null): string | undefined =>
  value ? new Date(value).toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : undefined;

// A string is only kept when it carries content, so empty fields leave their stage card clean.
const text = (value?: string | null): string | undefined => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

// The backend attaches a collection, but each row accumulates every stage's details,
// so the most recent record (by createdAt) is the authoritative one to surface.
const mapProcessing = (records?: ApiOrderProcessed[] | null): OrderProcessing | undefined => {
  if (!records || records.length === 0) return undefined;
  const latest = [...records].sort(
    (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
  )[0];
  return {
    seller: text(latest.seller),
    sellerOrderReference: text(latest.sellerOrderReference),
    totalUsdAmount: latest.totalUsdAmount ?? undefined,
    receipt: text(latest.receipt),
    processingNote: text(latest.processingNote),
    processedAt: formatDate(latest.processedAt),
    shippedFromUsaAt: formatDate(latest.shippedFromUsaAt),
    shippedBy: text(latest.shippedBy),
    shippingCost: latest.shippingCost ?? undefined,
    shippingReceipt: text(latest.shippingReceipt),
    shippingNote: text(latest.shippingNote),
    courrier: latest.courrier
      ? {
          name: text(latest.courrier.name),
          contact: text(latest.courrier.contact),
          pickupLocation: text(latest.courrier.pickupLocation),
          pickupContact: text(latest.courrier.pickupContact),
          usaAddress: text(latest.courrier.usaAddress),
        }
      : undefined,
    collectedAt: formatDate(latest.collectedAt),
    pickupAddress: text(latest.pickupAddress),
    pickupContact: text(latest.pickupContact),
    collectionNote: text(latest.collectionNote),
  };
};

export const mapApiOrderToFulfillment = (order: ApiOrder, t: Translate): Order => {
  const createdAt = order.createdAt ? new Date(order.createdAt) : null;
  const status = mapStatus(order.status);

  const items = (order.products ?? []).map((item) => {
    const photos = item.product?.photos ?? [];
    return {
      id: String(item.id),
      title: item.product?.title ?? EMPTY,
      subtitle: variantLabel(item.variant),
      sku: item.product?.uid ?? '',
      price: item.unitPrice ?? 0,
      quantity: item.quantity ?? 1,
      image: (photos.find((p) => p.isCover) ?? photos[0])?.url ?? '',
      imageAlt: item.product?.title ?? '',
      variantImage: variantImageUrl(item.variant),
      slug: item.product?.slug ?? undefined,
      scrapingUrl: item.product?.scrappingUrl ?? undefined,
    };
  });

  const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);

  return {
    id: String(order.id),
    uid: order.uid ?? String(order.id),
    rawStatus: order.status ?? '',
    orderNumber: order.uid ?? `#${order.id}`,
    customerName: order.fullName ?? EMPTY,
    customerEmail: '',
    customerTier: '',
    itemCount: items.reduce((sum, it) => sum + it.quantity, 0),
    shippingMethod: '',
    totalAmount: order.orderPrice ?? 0,
    subtotal,
    tax: 0,
    shippingCost: 0,
    status,
    isPriority: order.isPriority ?? false,
    processing: mapProcessing(order.orderProcesseds),
    dateStr: createdAt ? createdAt.toLocaleString() : EMPTY,
    timestamp: createdAt ? createdAt.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : EMPTY,
    paymentMethod: '',
    warehouseHub: '',
    items,
    shippingAddress: {
      name: order.fullName ?? '',
      street: order.street ?? '',
      city: order.city ?? '',
      state: order.state ?? '',
      zip: '',
      country: order.country ?? '',
      phone: order.phone ?? '',
      avsVerified: false,
    },
    notes: order.fulfillmentNote
      ? [{ author: t('orders_note_fulfillment'), timestamp: '', text: order.fulfillmentNote }]
      : [],
    steps: buildSteps(status, t),
  };
};
