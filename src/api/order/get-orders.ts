import axios from "@/utils/axios";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ApiOrder } from "@/api/user/get-customer-orders";

export const GET_ALL_ORDERS_QUERY_KEY = 'GET_ALL_ORDERS';
export const ORDERS_PAGE_SIZE = 10;

// The list seeds the clicked (already-mapped) order under this key so the [uid]
// detail page paints instantly while the authoritative record is fetched.
export const ORDER_DETAIL_SEED_KEY = 'ORDER_DETAIL_SEED';

// How the admin list is sorted. Maps to the backend order_filter, which exposes
// `createdAt` and `isPriority` (config/services.yaml: my_order.order_filter).
export type OrderSort = 'newest' | 'oldest' | 'priority';
export const DEFAULT_ORDER_SORT: OrderSort = 'newest';

// API Platform order_filter query (`order[field]=asc|desc`). "priority" surfaces
// flagged orders first, then falls back to newest within each group.
const ORDER_SORT_PARAMS: Record<OrderSort, Record<string, 'asc' | 'desc'>> = {
  newest: { createdAt: 'desc' },
  oldest: { createdAt: 'asc' },
  priority: { isPriority: 'desc', createdAt: 'desc' },
};

// API Platform admin collection: GET /orders (order:read), paginated 10 per page.
// `status` filters on the backend lifecycle status (exact SearchFilter); passing
// several values issues an IN query (status[]=a&status[]=b), so a fulfillment
// column that spans multiple statuses (e.g. "shipped") can be filtered in one call.
// `sort` maps to the order_filter and is serialised as order[field]=direction.
export const getOrders = async (
  page: number,
  status?: string[],
  uid?: string,
  sort: OrderSort = DEFAULT_ORDER_SORT,
): Promise<{ orders: ApiOrder[]; totalItems: number }> => {
  const response = await axios.get('/orders', {
    params: {
      page,
      ...(status && status.length ? { status } : {}),
      ...(uid ? { uid } : {}),
      order: ORDER_SORT_PARAMS[sort],
    },
  });
  return {
    orders: response.data['member'] ?? [],
    totalItems: response.data['totalItems'] ?? 0,
  };
};

const useGetOrders = (page = 1, status?: string[], uid?: string, sort: OrderSort = DEFAULT_ORDER_SORT) =>
  useQuery({
    queryKey: [GET_ALL_ORDERS_QUERY_KEY, page, status ?? null, uid ?? '', sort],
    queryFn: () => getOrders(page, status, uid, sort),
    placeholderData: keepPreviousData,
  });

export default useGetOrders;
export { useGetOrders };
