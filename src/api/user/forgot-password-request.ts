import axios from '@/utils/axios';
import { useMutation } from '@tanstack/react-query';

export const forgotPasswordRequest = async (email: string) => {
  const response = await axios.post(`/change_password/${encodeURIComponent(email)}/request`);
  return response.data;
};

const useForgotPasswordRequest = () => useMutation({ mutationFn: forgotPasswordRequest });

export default useForgotPasswordRequest;
