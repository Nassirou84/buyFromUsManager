import axios from "@/utils/axios";
import { useMutation } from '@tanstack/react-query';
import { Banner, BannerPayload } from '@/types/marketing';

const postBanner = async (payload: BannerPayload): Promise<Banner> => {
  const { isActive, ...rest } = payload;
  const body = isActive === undefined ? rest : { ...rest, isActive: isActive ? 1 : 0 };
  const response = await axios.post('/banners', body);
  return response.data;
}

const usePostBanner = () => useMutation({
  mutationFn: postBanner
});

export { postBanner };
export default usePostBanner;
