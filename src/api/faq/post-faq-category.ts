import axios from "@/utils/axios";
import { useMutation } from '@tanstack/react-query';
import { FaqCategory } from '@/sections/faqs/types';

export type FaqCategoryPayload = Pick<FaqCategory, 'title' | 'slug' | 'icon' | 'accordionBehavior' | 'targetPages'>;

// Creates an empty category at the end of the list and returns it with its real id.
const postFaqCategory = async (payload: FaqCategoryPayload): Promise<FaqCategory> => {
  const response = await axios.post('/admin/faq/categories', payload);
  return response.data;
}

const usePostFaqCategory = () => useMutation({
  mutationFn: postFaqCategory
});

export { postFaqCategory };
export default usePostFaqCategory;
