import axios from "@/utils/axios";
import { useMutation } from '@tanstack/react-query';
import { Setting } from '@/types/setting';

const patchSetting = async ({ id, data }: { id: Setting['id']; data: Partial<Omit<Setting, 'id'>> }) => {
  const response = await axios.patch(`/settings/${id}`, data, {
    headers: {
      'Content-Type': 'application/merge-patch+json',
    },
  });
  return response.data;
}

const usePatchSetting = () => useMutation({
  mutationFn: patchSetting
});

export { patchSetting };
export default usePatchSetting;
