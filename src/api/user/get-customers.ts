import axios from "@/utils/axios";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export const GET_CUSTOMERS_QUERY_KEY = 'GET_CUSTOMERS';
export const CUSTOMERS_PAGE_SIZE = 30;

// A customer counts as "new" while their account is younger than this many days.
// Drives both the "New customer" segment badge (mapper) and the list's status filter.
export const NEW_CUSTOMER_DAYS = 14;

// The backend exposes no single-customer endpoint, so the list seeds the clicked
// customer into the cache under this key for the detail page to read.
export const GET_CUSTOMER_DETAIL_QUERY_KEY = 'GET_CUSTOMER_DETAIL';

export type ApiCustomerAddress = {
  label?: string | null;
  fullName?: string | null;
  street?: string | null;
  suite?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  phone?: string | null;
  what3words?: string | null;
  isDefault?: boolean | null;
};

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
  // Only returned by the single-customer endpoint (GET /users/{id}).
  addresses?: ApiCustomerAddress[] | null;
};

export const getCustomers = async (
  page: number,
  keyword: string,
  onlyNew = false,
): Promise<{ customers: ApiCustomer[]; totalItems: number }> => {
  // "New customers" = accounts created within the last NEW_CUSTOMER_DAYS. Uses the
  // backend's API Platform date filter on `createdAt` (?createdAt[after]=...).
  const createdAfter = onlyNew
    ? new Date(Date.now() - NEW_CUSTOMER_DAYS * 86_400_000).toISOString()
    : undefined;

  const response = await axios.get('/users', {
    params: {
      page,
      ...(keyword && { keyword }),
      ...(createdAfter && { 'createdAt[after]': createdAfter }),
    },
  });
  return {
    customers: response.data['member'] ?? [],
    totalItems: response.data['totalItems'] ?? 0,
  };
};

const useGetCustomers = (page = 1, keyword = '', onlyNew = false) =>
  useQuery({
    queryKey: [GET_CUSTOMERS_QUERY_KEY, page, keyword, onlyNew],
    queryFn: () => getCustomers(page, keyword, onlyNew),
    placeholderData: keepPreviousData,
  });

export default useGetCustomers;
