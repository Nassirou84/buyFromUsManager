import axios from "@/utils/axios";
import { useMutation } from '@tanstack/react-query';
import { Banner } from '@/types/marketing';

const deleteBanner = async (id: Banner['id']) => {
  const response = await axios.delete(`/banners/${id}`);
  return response.data;
}

const useDeleteBanner = () => useMutation({
  mutationFn: deleteBanner
});

export { deleteBanner };
export default useDeleteBanner;
