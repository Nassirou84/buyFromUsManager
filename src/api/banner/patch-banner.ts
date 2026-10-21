import axios from "@/utils/axios";
import { useMutation } from '@tanstack/react-query';
import { Banner, BannerPayload } from '@/types/marketing';

const patchBanner = async ({ id, data }: { id: Banner['id']; data: Partial<BannerPayload> }): Promise<Banner> => {
  const response = await axios.patch(`/banners/${id}`, data, {
    headers: {
      'Content-Type': 'application/merge-patch+json',
    },
  });
  return response.data;
}

const usePatchBanner = () => useMutation({
  mutationFn: patchBanner
});

export { patchBanner };
export default usePatchBanner;
