import axios from "@/utils/axios";
import { useMutation, type UseMutationResult } from "@tanstack/react-query";

export interface UpdateReturnItemConditionVars {
  /** Product return uid. */
  uid: string;
  /** ProductReturnItem.id (the returned line, not the order item). */
  itemId: number;
  /** Inspection grade, stored as-is in ProductReturnItem.itemCondition (max 30 chars). */
  condition: string;
  /** Packaging / accessory checks that passed, stored in ProductReturnItem.itemControls. */
  controls: string[];
}

// PATCH /product-returns/uid/{uid}/item/{itemId}/condition (admin only). Records the
// inspection result of one returned line and stamps inspectedBy / inspectedAt.
// `condition` is required; `controls` only overwrites the stored list when non-empty.
// The response's `item` is not serialized with groups, so callers shouldn't rely on it.
export interface UpdateReturnItemConditionResponse {
  success: boolean;
}

const updateReturnItemCondition = async ({
  uid,
  itemId,
  condition,
  controls,
}: UpdateReturnItemConditionVars): Promise<UpdateReturnItemConditionResponse> => {
  const response = await axios.patch<UpdateReturnItemConditionResponse>(`/product-returns/uid/${uid}/item/${itemId}/condition`, {
    condition,
    controls,
  });
  return response.data;
};

export const useUpdateReturnItemCondition = (): UseMutationResult<
  UpdateReturnItemConditionResponse,
  unknown,
  UpdateReturnItemConditionVars
> =>
  useMutation({
    mutationFn: updateReturnItemCondition,
  });

export default useUpdateReturnItemCondition;
export { updateReturnItemCondition };
