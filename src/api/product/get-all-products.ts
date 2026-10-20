import { Product } from "@/types/product";
import axios from "@/utils/axios";
import { useQuery } from "@tanstack/react-query";

export type GetAllProductsFilters = {
  keyword?: string;
  category?: string;
  order?: string;
  subCategory?: string;
  seller?: string;
  isAvailable?: boolean;
  updatedAt?: string;
};

export const getAllProducts = async (page: number, filters: GetAllProductsFilters): Promise<{ products: Product[]; totalItems: number }> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());

  if (filters.keyword) {
    params.append('keyword', filters.keyword);
  }
  if (filters.category) {
    params.append('category.title', filters.category);
  }

  if (filters.subCategory) {
    params.append('subcategory.title', filters.subCategory);
  }

  if (filters.seller) {
    params.append('seller', filters.seller);
  }

  if (filters.isAvailable !== undefined) {
    params.append('isAvailable', filters.isAvailable ? '1' : '0');
  }

  if (filters.updatedAt) {
    params.append('updatedAt[after]', filters.updatedAt);
  }

  const response = await axios.get(`/admin/get-products?${params.toString()}${filters.order ? `&order${filters.order}` : ''
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