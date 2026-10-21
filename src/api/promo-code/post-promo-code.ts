import axios from "@/utils/axios";
import { useMutation } from '@tanstack/react-query';
import { ApiPromoCode, PromoCodePayload } from './get-promo-codes';

const postPromoCode = async (payload: PromoCodePayload): Promise<ApiPromoCode> => {
  const response = await axios.post('/promo_codes', payload);
  return response.data;
}

const usePostPromoCode = () => useMutation({
  mutationFn: postPromoCode
});

export { postPromoCode };
export default usePostPromoCode;
