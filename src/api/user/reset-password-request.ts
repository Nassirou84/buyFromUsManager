import axios from '@/utils/axios';
import { useMutation } from '@tanstack/react-query';

const useResetPasswordRequest = () => useMutation({
  mutationFn: async (email: string) => {
    const response = await axios.post(`/change_password/${email}/request`);
    return response.data;
  }
});
export default useResetPasswordRequest;