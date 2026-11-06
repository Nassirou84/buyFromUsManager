import axios from "@/utils/axios";
import { useQuery } from "@tanstack/react-query";

export const GET_ALL_COURRIERS_QUERY_KEY = 'GET_ALL_COURRIERS';

// Mirrors the backend Courrier entity (courrier:read group).
export interface ApiCourrier {
  id: number;
  name: string;
  contact: string;
  pickupLocation: string;
  pickupContact: string;
  usaAddress: string;
  createdAt: string;
}

// API Platform admin collection: GET /courriers (courrier:read).
export const getCourriers = async (): Promise<ApiCourrier[]> => {
  const response = await axios.get('/courriers');
  return response.data['member'] ?? [];
};

const useGetCourriers = () =>
  useQuery({
    queryKey: [GET_ALL_COURRIERS_QUERY_KEY],
    queryFn: getCourriers,
  });

export default useGetCourriers;
export { useGetCourriers };
