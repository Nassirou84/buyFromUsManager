import axios from "@/utils/axios";
import { useMutation, type UseMutationResult } from "@tanstack/react-query";

export interface ApproveReturnItemVars {
  /** ProductReturnItem.id (the returned line, not the order item). */
  itemId: number;
}

export interface ApproveReturnItemResponse {
  success: boolean;
}

// POST /product-returns/item/{itemId}/approve (admin only, no body). Sets the line's
// decision to "approved" and stamps decidedBy / decidedAt.
const approveReturnItem = async ({ itemId }: ApproveReturnItemVars): Promise<ApproveReturnItemResponse> => {
  const response = await axios.post<ApproveReturnItemResponse>(`/product-returns/item/${itemId}/approve`);
  return response.data;
};

export const useApproveReturnItem = (): UseMutationResult<ApproveReturnItemResponse, unknown, ApproveReturnItemVars> =>
  useMutation({
    mutationFn: approveReturnItem,
  });

export default useApproveReturnItem;
export { approveReturnItem };
