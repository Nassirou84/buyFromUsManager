import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GET_CATEGORY_KEY } from './get-all-categories';
import axios from '@/utils/axios';

const postSubcategory = async (subcategory: any) => {
  const response = await axios.post('/subcategories', subcategory);
  return response.data;
};

const usePostSubcategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postSubcategory,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [GET_CATEGORY_KEY],
      });
    },
  });
};

export default postSubcategory;
export { usePostSubcategory };