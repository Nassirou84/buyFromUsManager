import { ApiProductReturn, ApiProductReturnItem, ApiReturnOrder } from '@/api/returns/get-product-returns';
import { RmaItem, RmaLine, RmaOrder } from './types';

// Format the backend ISO timestamp to a short, locale-neutral label for the list.
const formatCreatedAt = (iso: string): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Date only (no time) for order milestones like the delivery date.
const formatDate = (iso?: string | null): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

// Assemble the order the return belongs to from the embedded returnOrder.
const toOrder = (order: ApiReturnOrder | undefined): RmaOrder | null => {
  if (!order) return null;
  const localityLine = [order.city, [order.state].filter(Boolean).join(' ')]
    .filter(Boolean)
    .join(', ');
  const addressLines = [order.street, order.suite, localityLine, order.country].filter(
    (l): l is string => Boolean(l && l.trim()),
  );

  return {
    uid: order.uid ?? '',
    fullName: order.fullName ?? '',
    phone: order.phone ?? '',
    addressLines,
    orderPrice: order.orderPrice ?? 0,
    discount: order.discount ?? 0,
    taxes: order.taxes ?? 0,
    shippingFee: order.shippingFee ?? 0,
    isPriority: order.isPriority ?? false,
    promoCode: order.promoCode ?? '',
    createdAtStr: formatCreatedAt(order.createdAt ?? ''),
    deliveredAtStr: formatDate(order.deliveredAt),
  };
};

// Assemble one return line from the embedded orderItem. The product cover is the
// "return image"; the selected variant carries its own label and photo.
const toLine = (item: ApiProductReturnItem): RmaLine => {
  const orderItem = item.orderItem;
  const product = orderItem?.product;
  const variant = orderItem?.variant ?? undefined;
  const variantImage = typeof variant?.image === 'string' ? variant.image : '';

  return {
    title: product?.title ?? '',
    productImage: product?.coverImage ?? '',
    variantImage,
    variantLabel: orderItem?.variantLabel ?? '',
    // Returned quantity (the line on the return), not the full ordered quantity.
    quantity: item.quantity ?? 0,
    unitPrice: orderItem?.unitPrice ?? product?.actualPrice ?? 0,
    reason: item.reason ?? '',
    condition: 'Pristine / Grade A',
    packagingCheck: {
      packagingKept: false,
      returnCauseChecked: false,
      itemMatch: false,
    },
  };
};

// Map one GET /product_returns row (product_return:read) to the view model.
// Each return line embeds its product and selected variant, and the return now
// carries the full order (customer, address, totals, dates).
export const mapApiProductReturn = (api: ApiProductReturn): RmaItem => {
  const lines = (api.returnItems ?? []).map(toLine);
  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);
  const first = lines[0];
  const order = toOrder(api.returnOrder);

  // Value of the returned items (unit price × returned quantity). The base for the
  // refund; fees aren't exposed by the backend, so they stay zero.
  const returnedValue = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);

  return {
    id: api.uid,
    orderRef: order?.uid ?? '',
    customerName: order?.fullName || api.email,
    customerEmail: api.email,
    customerCity: order ? order.addressLines.join(', ') : '',
    customerSegment: '',
    lifetimeSpend: '',
    returnRate: '',
    totalReturns: '',
    itemTitle: first?.title ?? '',
    itemPrice: first?.unitPrice ?? 0,
    itemSku: '',
    itemSize: '',
    itemMaterial: '',
    itemImage: first?.variantImage || first?.productImage || '',
    carrier: '',
    slaRemaining: '',
    status: api.status,
    bay: '',
    condition: 'Pristine / Grade A',
    packagingCheck: {
      packagingKept: false,
      returnCauseChecked: false,
      itemMatch: false,
    },
    dispositionRouting: '',
    customerNote: api.additionalDetails ?? '',
    originalPaid: order?.orderPrice ?? 0,
    logisticsFee: 0,
    restockingFee: 0,
    reimbursementTotal: returnedValue,
    payoutDestination: '',
    isStoreCreditBonusApplied: false,
    auditNotes: [],
    refundType: api.refundtype,
    createdAtStr: formatCreatedAt(api.createdAt),
    itemCount,
    lines,
    order,
  };
};
