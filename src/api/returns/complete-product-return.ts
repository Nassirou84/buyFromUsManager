import axios from "@/utils/axios";
import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { type ApiProductReturn } from "./get-product-returns";

export interface CompleteProductReturnVars {
  /** Product return uid. */
  uid: string;
}

export interface CompleteProductReturnResponse {
  success: boolean;
  /** The completed return, serialized with product_return:read (same shape as GET by uid). */
  productReturn?: ApiProductReturn;
}

// Error codes in the rejected body ({ error }):
// - cannot_complete_return (409): not allowed in the current state, nothing was refunded.
// - refund_rejected (502): the gateway refused the refund; it's recorded and can be retried.
// - refund_outcome_unknown (502): the gateway outcome is unknown; retries are blocked
//   until the refund is reconciled.
export type CompleteProductReturnErrorCode =
  | 'cannot_complete_return'
  | 'refund_rejected'
  | 'refund_outcome_unknown';

export const getCompleteReturnErrorCode = (error: unknown): CompleteProductReturnErrorCode | null => {
  const code = (error as { error?: unknown } | null)?.error;
  return code === 'cannot_complete_return' || code === 'refund_rejected' || code === 'refund_outcome_unknown'
    ? code
    : null;
};

// POST /product-returns/{uid}/complete (admin only, no body). Applies the
// complete_return transition (collected -> completed), refunds the approved lines
// (gateway refund or store credit) and returns the updated return.
const completeProductReturn = async ({ uid }: CompleteProductReturnVars): Promise<CompleteProductReturnResponse> => {
  const response = await axios.post<CompleteProductReturnResponse>(`/product-returns/${uid}/complete`);
  return response.data;
};

export const useCompleteProductReturn = (): UseMutationResult<
  CompleteProductReturnResponse,
  unknown,
  CompleteProductReturnVars
> =>
  useMutation({
    mutationFn: completeProductReturn,
  });

export default useCompleteProductReturn;
export { completeProductReturn };
