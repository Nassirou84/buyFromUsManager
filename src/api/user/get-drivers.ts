import axios from "@/utils/axios";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export const GET_DRIVERS_QUERY_KEY = 'GET_DRIVERS';

export type ApiDriver = {
  id: number;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  createdAt?: string | null;
  allAssignedDeliveries?: number | null;
  allPendingDeliveries?: number | null;
  allCompletedDeliveries?: number | null;
};

export const getDrivers = async (
  page = 1,
  name = '',
): Promise<{ drivers: ApiDriver[]; all: number; page: number }> => {
  const response = await axios.get('/admin/drivers-list', {
    params: { page, ...(name && { name }) },
  });
  return {
    drivers: response.data['drivers'] ?? [],
    all: response.data['all'] ?? 0,
    page: response.data['page'] ?? page,
  };
};

const useGetDrivers = (page = 1, name = '') =>
  useQuery({
    queryKey: [GET_DRIVERS_QUERY_KEY, page, name],
    queryFn: () => getDrivers(page, name),
    placeholderData: keepPreviousData,
  });

export { useGetDrivers };
export default useGetDrivers;
