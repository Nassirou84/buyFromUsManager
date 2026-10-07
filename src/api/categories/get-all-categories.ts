import { useQuery } from "@tanstack/react-query";
import { toast } from 'sonner';
import axios from '@/utils/axios';
import { Category } from '@/types/category';

export const GET_CATEGORY_KEY = 'GET_CATEGORY_ALL';

export const getCategories = async () => {
  try {
    const categories = await axios.get('/admin/categories');
    return categories.data['member'];
  } catch (error) {
    toast.error(`Erreur`);
    throw error;
  }
};

export const useGetCategories = () =>
  useQuery({
    queryKey: [GET_CATEGORY_KEY],
    queryFn: (): Promise<Category[]> => getCategories(),
    retryDelay: 20000
  });