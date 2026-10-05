import { useMutation } from '@tanstack/react-query';
import axios from '@/utils/axios';

const useChangeUserPassword = () => useMutation({
  mutationFn: async (data: { token: string; newPassword: string }) => {
    const response = await axios.post(`/change_password/change`, data);
    return response.data;
  }
});
export default useChangeUserPassword;
