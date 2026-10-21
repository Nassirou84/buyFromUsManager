import axios from "@/utils/axios";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export const GET_CUSTOMERS_QUERY_KEY = 'GET_CUSTOMERS';
export const CUSTOMERS_PAGE_SIZE = 30;

export type ApiCustomer = {
  id: number;
  email?: string | null;
  roles?: string[];
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  street?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  createdAt?: string | null;
  lastLoginAt?: string | null;
  ordersCount?: number | null;
  lastSevenDaysOrdersCount?: number | null;
};

export const getCustomers = async (
  page: number,
  keyword: string,
): Promise<{ customers: ApiCustomer[]; totalItems: number }> => {
  const response = await axios.get('/users', { params: { page, ...(keyword && { keyword }) } });
  return {
    customers: response.data['member'] ?? [],
    totalItems: response.data['totalItems'] ?? 0,
  };
};

const useGetCustomers = (page = 1, keyword = '') =>
  useQuery({
    queryKey: [GET_CUSTOMERS_QUERY_KEY, page, keyword],
    queryFn: () => getCustomers(page, keyword),
    placeholderData: keepPreviousData,
  });

export default useGetCustomers;
