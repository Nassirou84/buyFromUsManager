import axios from "@/utils/axios";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ApiOrder } from "@/api/user/get-customer-orders";

export const GET_ORDERS_AWAITING_DELIVERY_QUERY_KEY = 'GET_ORDERS_AWAITING_DELIVERY';

// GET /admin/orders-awaiting-delivery (HOST_API already includes /api) — orders in the
// "out_for_delivery" status that still need to be routed to a courier, paginated 10/page.
export const getOrdersAwaitingDelivery = async (
  page = 1,
): Promise<{ orders: ApiOrder[]; total: number; page: number }> => {
  const response = await axios.get('/admin/orders-awaiting-delivery', { params: { page } });
  return {
    orders: response.data['orders'] ?? [],
    total: response.data['total'] ?? 0,
    page: Number(response.data['page'] ?? page),
  };
};

const useGetOrdersAwaitingDelivery = (page = 1) =>
  useQuery({
    queryKey: [GET_ORDERS_AWAITING_DELIVERY_QUERY_KEY, page],
    queryFn: () => getOrdersAwaitingDelivery(page),
    placeholderData: keepPreviousData,
  });

export { useGetOrdersAwaitingDelivery };
export default useGetOrdersAwaitingDelivery;
