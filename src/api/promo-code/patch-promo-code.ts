import axios from "@/utils/axios";
import { useMutation } from '@tanstack/react-query';
import { ApiPromoCode, PromoCodePayload } from './get-promo-codes';

const patchPromoCode = async ({ id, data }: { id: ApiPromoCode['id']; data: Partial<PromoCodePayload> }): Promise<ApiPromoCode> => {
  const response = await axios.patch(`/promo_codes/${id}`, data, {
    headers: {
      'Content-Type': 'application/merge-patch+json',
    },
  });
  return response.data;
}

const usePatchPromoCode = () => useMutation({
  mutationFn: patchPromoCode
});

export { patchPromoCode };
export default usePatchPromoCode;
