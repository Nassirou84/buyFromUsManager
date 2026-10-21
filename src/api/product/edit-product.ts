import axios from '@/utils/axios';
import { useMutation } from '@tanstack/react-query';

const editProduct = async (productUid: string, data: any) => {
  const response = await axios.post(`/product/${productUid}/edit`, data);
  return response.data;
};

export const useEditProduct = () => useMutation({
  mutationFn: ({ productUid, data }: { productUid: string; data: any }) =>
    editProduct(productUid, data)
});