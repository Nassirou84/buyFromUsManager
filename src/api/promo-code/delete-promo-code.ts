import axios from "@/utils/axios";
import { useMutation } from '@tanstack/react-query';
import { ApiPromoCode } from './get-promo-codes';

const deletePromoCode = async (id: ApiPromoCode['id']) => {
  const response = await axios.delete(`/promo_codes/${id}`);
  return response.data;
}

const useDeletePromoCode = () => useMutation({
  mutationFn: deletePromoCode
});

export { deletePromoCode };
export default useDeletePromoCode;
