import axios from "@/utils/axios";
import { useQuery } from "@tanstack/react-query";
import { ApiProductReturn } from "./get-product-returns";

export const GET_PRODUCT_RETURN_BY_UID_QUERY_KEY = 'GET_PRODUCT_RETURN_BY_UID';

// The list seeds the clicked (already-mapped) return under this key so the [uid]
// detail page can paint instantly while the authoritative record is fetched.
export const RETURN_DETAIL_SEED_KEY = 'RETURN_DETAIL_SEED';

// Custom controller route: GET /product-returns/uid/{uid}. Returns the whole return
// serialized with the product_return:read group (items + their products and variants)
// as a plain JSON object — the same shape as one row of the collection.
export const getProductReturnByUid = async (uid: string): Promise<ApiProductReturn> => {
  const response = await axios.get(`/product-returns/uid/${uid}`);
  return response.data;
};

export const useGetProductReturnByUid = (uid: string | undefined, enabled = true) =>
  useQuery({
    queryKey: [GET_PRODUCT_RETURN_BY_UID_QUERY_KEY, uid],
    queryFn: () => getProductReturnByUid(uid as string),
    enabled: enabled && !!uid,
  });

export default useGetProductReturnByUid;
