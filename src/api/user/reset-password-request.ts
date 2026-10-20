import axios from '@/utils/axios';
import { useMutation } from '@tanstack/react-query';

const useResetPasswordRequest = () => useMutation({
  mutationFn: async (id: number) => {
    const response = await axios.post(`/admin/${id}/send-reset-link`);
    return response.data;
  }
});

export default useResetPasswordRequest;