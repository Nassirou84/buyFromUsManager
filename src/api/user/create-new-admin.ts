import { NewUserPayload } from '@/sections/users-roles/modals/AddUserModal';
import axios from "@/utils/axios";
import { useMutation } from '@tanstack/react-query';

const createNewAdmin = async (payload: NewUserPayload) => {
  const response = await axios.post('/admin/create', payload);
  return response.data;
}

const useCreateNewAdmin = () => useMutation({
  mutationFn: createNewAdmin
});

export { createNewAdmin };
export default useCreateNewAdmin;
