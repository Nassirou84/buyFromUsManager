import axios from "@/utils/axios";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export const ADMIN_USERS_QUERY_KEY = ['adminUsers'];

const getAdminUsers = async (page: number, name: string) => {
  const response = await axios.get('/admin/list', { params: { page, ...(name && { name }) } });
  return response.data;
};

const useGetAdminUsers = (page: number, name = '', enabled = true) => {
  return useQuery({
    queryKey: [...ADMIN_USERS_QUERY_KEY, page, name],
    queryFn: () => getAdminUsers(page, name),
    enabled,
    placeholderData: keepPreviousData,
  });
};

export default useGetAdminUsers;
