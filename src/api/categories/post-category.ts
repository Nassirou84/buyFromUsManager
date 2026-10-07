import axios from "@/utils/axios";
import type { Category } from "@/types/category";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GET_CATEGORY_KEY } from './get-all-categories';


const postCategory = async (category: Partial<Category>) => {
  const response = await axios.post("/categories", category);
  return response.data;
};

export const usePostCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (category: Partial<Category>) => postCategory(category),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [GET_CATEGORY_KEY],
      });
    },
  });
};