import axios from "@/utils/axios";
import { useQuery } from "@tanstack/react-query";
import { ApiCustomer } from "./get-customers";

export const GET_CUSTOMER_QUERY_KEY = 'GET_CUSTOMER';

// API Platform item operation: GET /users/{id} (admin-secured). Returns the base
// user fields plus the `addresses` array, which the collection endpoint omits.
export const getCustomer = async (id: string): Promise<ApiCustomer> => {
  const response = await axios.get(`/users/${id}`);
  return response.data;
};

const useGetCustomer = (id: string | undefined, enabled = true) =>
  useQuery({
    queryKey: [GET_CUSTOMER_QUERY_KEY, id],
    queryFn: () => getCustomer(id as string),
    enabled: enabled && !!id,
  });

export default useGetCustomer;
