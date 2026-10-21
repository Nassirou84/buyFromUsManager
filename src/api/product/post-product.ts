import axios from "@/utils/axios";
import { useMutation } from "@tanstack/react-query";
import type { Product } from "@/types/product";

export const postProduct = async (formData: FormData): Promise<Product> => {
  const response = await axios.post('/product/publish-product', formData);
  return response.data;
};

const usePostProduct = () => useMutation({
  mutationFn: (formData: FormData) => postProduct(formData),
});

export default usePostProduct;
