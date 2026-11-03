import axios from '@/utils/axios';
import { useQuery } from '@tanstack/react-query';
import { OrderSummary } from '@/sections/orders-fulfillment/types';

export const GET_ORDER_SUMMARY_KEY = 'getOrderSummary';

export const getOrderSummary = async (): Promise<OrderSummary> => {
  const response = await axios.get('/admin/orders-summary');
  return response.data;
};

const useGetOrderSummary = () => useQuery({
  queryKey: [GET_ORDER_SUMMARY_KEY],
  queryFn: getOrderSummary,
});

export default useGetOrderSummary;