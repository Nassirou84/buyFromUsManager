import axios from "@/utils/axios";
import { useQuery } from '@tanstack/react-query';
import { Setting } from '@/types/setting';

export const GET_SETTINGS_QUERY_KEY = ['GET_SETTINGS'];

// API Platform returns a plain array for application/json and a Hydra
// collection for JSON-LD, so accept both.
const getSettings = async (): Promise<Setting[]> => {
  const response = await axios.get('/settings');
  const data = response.data;
  if (Array.isArray(data)) return data;
  return data?.['hydra:member'] ?? data?.member ?? [];
}

const useGetSettings = () => useQuery({
  queryKey: GET_SETTINGS_QUERY_KEY,
  queryFn: getSettings,
});

export { getSettings };
export default useGetSettings;
