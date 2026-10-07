import { Product } from "@/types/product";
import axios from "@/utils/axios";
import { useQuery } from "@tanstack/react-query";

export type GetAllProductsFilters = {
  title?: string;
  category?: string;
  order?: string
};

export const getAllProducts = async (page: number, filters: GetAllProductsFilters): Promise<{ products: Product[]; totalItems: number }> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('isAvailable', '1');

  if (filters.title) {
    params.append('title', filters.title);
  }
  if (filters.category) {
    params.append('category.title', filters.category);
  }

  const response = await axios.get(`/products?${params.toString()}${filters.order ? `&order${filters.order}` : ''
    }`);
  return {
    products: response.data['member'],
    totalItems: response.data['totalItems'],
  };
};

const useGetAllProducts = (page: number = 1, filters: GetAllProductsFilters = {}) => useQuery({
  queryKey: ['GET_ALL_PRODUCTS', page, filters],
  queryFn: (): Promise<{ products: Product[]; totalItems: number }> => getAllProducts(page, filters),
});

export default useGetAllProducts;