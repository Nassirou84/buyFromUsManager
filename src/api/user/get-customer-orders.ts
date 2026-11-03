import axios from "@/utils/axios";
import { useInfiniteQuery } from "@tanstack/react-query";

export const GET_CUSTOMER_ORDERS_QUERY_KEY = 'GET_CUSTOMER_ORDERS';
export const CUSTOMER_ORDERS_PAGE_SIZE = 10;

// The ordered variant: a legacy plain-string label, or the newer object the
// backend now stores ({ id, title, image, price }).
export type ApiOrderItemVariant = {
  id?: string | null;
  title?: string | null;
  name?: string | null;
  image?: string | null;
  price?: number | null;
};

export type ApiOrderItem = {
  id: number;
  quantity?: number | null;
  unitPrice?: number | null;
  variant?: string | ApiOrderItemVariant | null;
  product?: {
    id: number;
    uid?: string | null;
    title?: string | null;
    slug?: string | null;
    /** Supplier page URL, admin-only (order:read:admin). */
    scrappingUrl?: string | null;
    photos?: { url?: string; isCover?: boolean }[];
  } | null;
};

// `variant` may be a string (legacy) or an object (current); normalize both.
export const variantLabel = (variant?: string | ApiOrderItemVariant | null): string =>
  typeof variant === 'string' ? variant : (variant?.title ?? variant?.name ?? '');

export const variantImageUrl = (variant?: string | ApiOrderItemVariant | null): string | undefined =>
  typeof variant === 'string' || !variant ? undefined : (variant.image ?? undefined);

// Supplier-side fulfillment record attached to an order. One row accumulates the
// details of each transition (processed → shipped from USA → collected at facility).
// Returned only by the single-order endpoint (order:read:admin).
export type ApiOrderProcessed = {
  id: number;
  createdAt?: string | null;
  processedAt?: string | null;
  seller?: string | null;
  sellerOrderReference?: string | null;
  totalUsdAmount?: number | null;
  receipt?: string | null;
  processingNote?: string | null;
  shippedFromUsaAt?: string | null;
  shippedBy?: string | null;
  shippingCost?: number | null;
  shippingReceipt?: string | null;
  shippingNote?: string | null;
  pickupAddress?: string | null;
  pickupContact?: string | null;
  collectedAt?: string | null;
  collectionNote?: string | null;
  /** Carrier partner assigned to the shipment (Courrier, order:read:admin group). */
  courrier?: {
    id: number;
    name?: string | null;
    contact?: string | null;
    pickupLocation?: string | null;
    pickupContact?: string | null;
    usaAddress?: string | null;
  } | null;
};

export type ApiPayment = {
  id: number;
  transactionId?: string | null;
  amount?: number | null;
  status?: string | null;
  paymentMethod?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  taxedAmount?: number | null;
};

export type ApiOrder = {
  id: number;
  uid?: string | null;
  orderPrice?: number | null;
  status?: string | null;
  /** Flagged as a priority order; highlighted in the fulfillment list. */
  isPriority?: boolean | null;
  fullName?: string | null;
  phone?: string | null;
  street?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  estimatedDeliveryAt?: string | null;
  /** Only returned by the single-order endpoint (GET /orders/{id}, order:read:details). */
  payments?: ApiPayment[];
  /** Fulfillment note, returned to admins by the single-order endpoint (order:read:admin). */
  fulfillmentNote?: string | null;
  /** Supplier-side processing records, returned by the single-order endpoint (order:read:admin). */
  orderProcesseds?: ApiOrderProcessed[] | null;
  products?: ApiOrderItem[];
};

export const getCustomerOrders = async (
  customerId: string,
  page: number,
): Promise<{ orders: ApiOrder[]; totalItems: number }> => {
  const response = await axios.get(`/customer/${customerId}/orders`, { params: { page } });
  return {
    orders: response.data['member'] ?? [],
    totalItems: response.data['totalItems'] ?? 0,
  };
};

// The endpoint returns the newest orders first, 10 per page.
const useGetCustomerOrders = (customerId: string | undefined, enabled = true) =>
  useInfiniteQuery({
    queryKey: [GET_CUSTOMER_ORDERS_QUERY_KEY, customerId],
    queryFn: ({ pageParam }) => getCustomerOrders(customerId as string, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages, lastPageParam) =>
      allPages.reduce((count, p) => count + p.orders.length, 0) < lastPage.totalItems && lastPage.orders.length > 0
        ? lastPageParam + 1
        : undefined,
    enabled: enabled && !!customerId,
  });

export default useGetCustomerOrders;
