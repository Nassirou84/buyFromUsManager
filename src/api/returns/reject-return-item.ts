import axios from "@/utils/axios";
import { useMutation, type UseMutationResult } from "@tanstack/react-query";

export interface RejectReturnItemVars {
  /** ProductReturnItem.id (the returned line, not the order item). */
  itemId: number;
}

export interface RejectReturnItemResponse {
  success: boolean;
}

// POST /product-returns/item/{itemId}/reject (admin only, no body). Sets the line's
// decision to "rejected" and stamps decidedBy / decidedAt.
const rejectReturnItem = async ({ itemId }: RejectReturnItemVars): Promise<RejectReturnItemResponse> => {
  const response = await axios.post<RejectReturnItemResponse>(`/product-returns/item/${itemId}/reject`);
  return response.data;
};

export const useRejectReturnItem = (): UseMutationResult<RejectReturnItemResponse, unknown, RejectReturnItemVars> =>
  useMutation({
    mutationFn: rejectReturnItem,
  });

export default useRejectReturnItem;
export { rejectReturnItem };
