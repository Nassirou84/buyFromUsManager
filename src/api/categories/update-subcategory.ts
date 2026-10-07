import axios from '@/utils/axios';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GET_CATEGORY_KEY } from './get-all-categories';
import { SubCategory } from "@/types/category";

const updateSubcategory = async (subcategoryId: number, data: Partial<SubCategory>) => {
  const response = await axios.patch(`/subcategories/${subcategoryId}`, data, {
    headers: {
      'Content-Type': 'application/merge-patch+json',
    },
  });
  return response.data;
};

const useUpdateSubcategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ subcategoryId, data }: { subcategoryId: number; data: Partial<SubCategory> }) => updateSubcategory(subcategoryId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [GET_CATEGORY_KEY],
      });
    },
  });
};

export default updateSubcategory;
export { useUpdateSubcategory };