import { NewDriverPayload } from '@/sections/delivery-fleet/modals/AddDriverModal';
import axios from "@/utils/axios";
import { useMutation } from '@tanstack/react-query';

const createDriver = async (payload: NewDriverPayload) => {
  const response = await axios.post('/admin/create-driver', payload);
  return response.data;
}

const useCreateDriver = () => useMutation({
  mutationFn: createDriver
});

export { createDriver };
export default useCreateDriver;
