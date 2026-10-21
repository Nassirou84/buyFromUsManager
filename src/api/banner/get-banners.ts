import axios from "@/utils/axios";
import { useQuery } from '@tanstack/react-query';
import { Banner } from '@/types/marketing';

export const GET_BANNERS_QUERY_KEY = ['GET_BANNERS'];

// API Platform returns a plain array for application/json and a Hydra
// collection for JSON-LD, so accept both.
const getBanners = async (): Promise<Banner[]> => {
  const response = await axios.get('/banners');
  const data = response.data;
  if (Array.isArray(data)) return data;
  return data?.['hydra:member'] ?? data?.member ?? [];
}

const useGetBanners = () => useQuery({
  queryKey: GET_BANNERS_QUERY_KEY,
  queryFn: getBanners,
});

export { getBanners };
export default useGetBanners;
