import axios from '@/utils/axios';
import { useMutation } from '@tanstack/react-query';

const useUpdateUserPassword = () => useMutation({
  mutationFn: async ({
    currentPassword,
    newPassword
  }: { currentPassword: string; newPassword: string }): Promise<{
    success: boolean;
    error: string | null;
    message: string | null;
  }> => {
    const response = await axios.post(`/change_password/admin/update`,
      {
        currentPassword,
        newPassword
      }
    );
    return response.data;
  }
});
export default useUpdateUserPassword;