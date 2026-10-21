import axios from "@/utils/axios";
import { useMutation } from '@tanstack/react-query';
import { FaqCategory } from '@/sections/faqs/types';

// Replaces the stored FAQ tree with the given one and returns the saved tree (with the real ids).
// `faqsCount` is derived by the backend, so it is not sent.
const putFaqs = async (categories: FaqCategory[]): Promise<FaqCategory[]> => {
  const response = await axios.put('/admin/faq', {
    categories: categories.map(({ faqsCount: _faqsCount, ...category }) => category),
  });
  return response.data;
}

const usePutFaqs = () => useMutation({
  mutationFn: putFaqs
});

export { putFaqs };
export default usePutFaqs;
