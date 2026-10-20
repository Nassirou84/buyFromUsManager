import { NewSettingPayload } from '@/sections/platform-settings/modals/AddSettingModal';
import axios from "@/utils/axios";
import { useMutation } from '@tanstack/react-query';

const postSetting = async (payload: NewSettingPayload) => {
  const response = await axios.post('/settings', payload);
  return response.data;
}

const usePostSetting = () => useMutation({
  mutationFn: postSetting
});

export { postSetting };
export default usePostSetting;
