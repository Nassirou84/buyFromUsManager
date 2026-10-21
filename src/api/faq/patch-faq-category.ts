import axios from "@/utils/axios";
import { useMutation } from '@tanstack/react-query';
import { FaqCategory } from '@/sections/faqs/types';
import { FaqCategoryPayload } from './post-faq-category';

// Updates the settings of one category. Its questions are not touched.
const patchFaqCategory = async ({ id, data }: { id: FaqCategory['id']; data: Partial<FaqCategoryPayload> }): Promise<FaqCategory> => {
  const response = await axios.patch(`/admin/faq/categories/${id}`, data);
  return response.data;
}

const usePatchFaqCategory = () => useMutation({
  mutationFn: patchFaqCategory
});

export { patchFaqCategory };
export default usePatchFaqCategory;
