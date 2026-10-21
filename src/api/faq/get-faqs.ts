import axios from "@/utils/axios";
import { useQuery } from '@tanstack/react-query';
import { FaqCategory } from '@/sections/faqs/types';

export const GET_FAQS_QUERY_KEY = ['GET_FAQS'];

const getFaqs = async (): Promise<FaqCategory[]> => {
  const response = await axios.get('/admin/faq');
  return response.data;
}

const useGetFaqs = () => useQuery({
  queryKey: GET_FAQS_QUERY_KEY,
  queryFn: getFaqs,
});

export { getFaqs };
export default useGetFaqs;
