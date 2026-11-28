import axios from "@/utils/axios";
import { useMutation } from '@tanstack/react-query';
import { ApiPromoCode } from './get-promo-codes';

export type TerminatePromoCodeResponse = {
  success: boolean;
  id: number;
  isActive: boolean;
  expiresAt: string | null;
};

// POST /admin/promo_codes/{id}/terminate (admin only, no body). Promo codes can't be
// edited or deleted (past orders and refunds depend on their terms), so this is the
// only way to end one: it deactivates the code and moves its expiry into the past.
const terminatePromoCode = async (id: ApiPromoCode['id']): Promise<TerminatePromoCodeResponse> => {
  const response = await axios.post(`/admin/promo_codes/${id}/terminate`);
  return response.data;
}

const useTerminatePromoCode = () => useMutation({
  mutationFn: terminatePromoCode
});

export { terminatePromoCode };
export default useTerminatePromoCode;
