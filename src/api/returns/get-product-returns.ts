import axios from "@/utils/axios";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export const GET_PRODUCT_RETURNS_QUERY_KEY = 'GET_PRODUCT_RETURNS';

// Returns per page, as the backend paginates the collection. ProductReturn sets no
// custom paginationItemsPerPage, so API Platform's default (30) applies.
export const PRODUCT_RETURNS_PAGE_SIZE = 30;

// Backend lifecycle (App\Enumeration\ProductReturnStatusEnum). These are the exact
// stored values the `status` SearchFilter (exact) matches on.
export type ProductReturnStatus =
  | 'initiated'
  | 'collected'
  | 'inspected'
  | 'approved'
  | 'completed'
  | 'rejected';

export const PRODUCT_RETURN_STATUSES: ProductReturnStatus[] = [
  'initiated',
  'collected',
  'inspected',
  'approved',
  'completed',
  'rejected',
];

// Resolution the customer asked for (App\Entity\ProductReturn::STORE_CREDIT / ::REFUND).
// Serialized under the `refundtype` key and matched by the `refundtype` exact filter.
export type RefundType = 'refund' | 'credit';

// Selected variant snapshot copied from the basket at checkout (OrderItem.variant,
// a free-form JSON column). `title`/`name` hold the label, `image` the variant photo.
export interface ApiVariant {
  title?: string;
  name?: string;
  image?: string;
  price?: number;
  [key: string]: unknown;
}

// Product fields exposed to product_return:read (see Product entity groups).
export interface ApiReturnProduct {
  title?: string;
  brand?: string;
  seller?: string;
  slug?: string;
  uid?: string;
  actualPrice?: number;
  coverImage?: string | null;
}

// The ordered line a return references. Under product_return:read it now embeds the
// product, the quantity/unit price, the raw variant and its computed label.
export interface ApiReturnOrderItem {
  product?: ApiReturnProduct;
  quantity?: number;
  unitPrice?: number;
  variant?: ApiVariant | null;
  variantLabel?: string | null;
}

// One returned line: how many of which order item, and why.
export interface ApiProductReturnItem {
  id?: number;
  quantity?: number;
  reason?: string;
  orderItem?: ApiReturnOrderItem;
}

// The order the return belongs to. Now embedded under product_return:read with the
// delivery details, totals and dates (Order entity groups).
export interface ApiReturnOrder {
  id?: number;
  uid?: string;
  fullName?: string;
  phone?: string;
  street?: string;
  suite?: string;
  city?: string;
  state?: string;
  country?: string;
  orderPrice?: number;
  discount?: number;
  taxes?: number;
  shippingFee?: number;
  isPriority?: boolean;
  promoCode?: string | null;
  createdAt?: string;
  deliveredAt?: string | null;
}

// Shape of one item in GET /product_returns (normalizationContext product_return:read).
export interface ApiProductReturn {
  id?: number;
  uid: string;
  status: ProductReturnStatus;
  refundtype: RefundType;
  email: string;
  createdAt: string;
  additionalDetails: string | null;
  returnOrder?: ApiReturnOrder;
  returnItems?: ApiProductReturnItem[];
}

// API Platform admin collection: GET /product_returns (product_return:read).
// `status` and `refundtype` are exact SearchFilters; passing several statuses issues
// an IN query (status[]=a&status[]=b). `keyword` is a partial, case-insensitive match
// on the return uid or its order uid (App\Filter\ProductReturnKeywordFilter).
export const getProductReturns = async (
  page: number,
  status?: ProductReturnStatus[],
  refundType?: RefundType,
  keyword?: string,
): Promise<{ returns: ApiProductReturn[]; totalItems: number }> => {
  const response = await axios.get('/product_returns', {
    params: {
      page,
      ...(status && status.length ? { status } : {}),
      ...(refundType ? { refundtype: refundType } : {}),
      ...(keyword ? { keyword } : {}),
    },
  });
  return {
    returns: response.data['member'] ?? [],
    totalItems: response.data['totalItems'] ?? 0,
  };
};

const useGetProductReturns = (
  page = 1,
  status?: ProductReturnStatus[],
  refundType?: RefundType,
  keyword?: string,
) =>
  useQuery({
    queryKey: [GET_PRODUCT_RETURNS_QUERY_KEY, page, status ?? null, refundType ?? null, keyword ?? ''],
    queryFn: () => getProductReturns(page, status, refundType, keyword),
    placeholderData: keepPreviousData,
  });

export default useGetProductReturns;
export { useGetProductReturns };
