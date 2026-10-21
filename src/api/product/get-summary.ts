import axios from '@/utils/axios';
import { useQuery } from '@tanstack/react-query';

export const GET_SUMMARY_QUERY_KEY = ['productSummary'];

const getProductSummary = async () => {
  try {
    const response = await axios.get('/admin/product/summary');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch product summary:', error);
    throw error;
  }
};


const useGetProductSummary = () => useQuery({
  queryKey: GET_SUMMARY_QUERY_KEY,
  queryFn: getProductSummary,
  staleTime: 5 * 60 * 1000, // 5 minutes
});

export default getProductSummary;
export { useGetProductSummary };