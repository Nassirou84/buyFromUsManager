import axios from "@/utils/axios";
import { useInfiniteQuery } from "@tanstack/react-query";

export const GET_CUSTOMER_ORDERS_QUERY_KEY = 'GET_CUSTOMER_ORDERS';
export const CUSTOMER_ORDERS_PAGE_SIZE = 10;

export type ApiOrderItem = {
  id: number;
  quantity?: number | null;
  unitPrice?: number | null;
  product?: {
    id: number;
    title?: string | null;
    photos?: { url?: string; isCover?: boolean }[];
  } | null;
};

export type ApiOrder = {
  id: number;
  uid?: string | null;
  orderPrice?: number | null;
  status?: string | null;
  city?: string | null;
  state?: string | null;
  createdAt: string;
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
