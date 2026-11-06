import axios from "@/utils/axios";
import { useQuery } from "@tanstack/react-query";
import { ApiOrder } from "./get-customer-orders";

export const GET_ORDER_QUERY_KEY = 'GET_ORDER';
export const GET_ORDER_BY_UID_QUERY_KEY = 'GET_ORDER_BY_UID';

// API Platform item operation: GET /orders/{id}. Returns the full `order:read`
// payload for a single order, which carries more than the list collection exposes.
export const getOrder = async (id: string): Promise<ApiOrder> => {
  const response = await axios.get(`/orders/${id}`);
  return response.data;
};

const useGetOrder = (id: string | undefined, enabled = true) =>
  useQuery({
    queryKey: [GET_ORDER_QUERY_KEY, id],
    queryFn: () => getOrder(id as string),
    enabled: enabled && !!id,
  });

// GET /orders/uid/{uid}. Same full payload, addressed by the order's uid.
export const getOrderByUid = async (uid: string): Promise<ApiOrder> => {
  const response = await axios.get(`/orders/uid/${uid}`);
  return response.data;
};

export const useGetOrderByUid = (uid: string | undefined, enabled = true) =>
  useQuery({
    queryKey: [GET_ORDER_BY_UID_QUERY_KEY, uid],
    queryFn: () => getOrderByUid(uid as string),
    enabled: enabled && !!uid,
  });

export default useGetOrder;
export { useGetOrder };
