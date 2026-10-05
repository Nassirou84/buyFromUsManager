import axios from '@/utils/axios';
import { useMutation } from '@tanstack/react-query';

const useUpdateUserPassword = () => useMutation({
  mutationFn: async (password: string) => {
    const response = await axios.post(`/change_password/update`,
      {
        password
      }
    );
    return response.data;
  }
});
export default useUpdateUserPassword;