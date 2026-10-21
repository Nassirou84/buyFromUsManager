import axios from "@/utils/axios";
import { useQuery } from '@tanstack/react-query';

export const GET_PROMO_CODES_QUERY_KEY = ['GET_PROMO_CODES'];

export type ApiPromoType = 'percentage' | 'fixed';

export type ApiPromoCode = {
  id: number;
  code: string;
  campaignLabel: string | null;
  type: ApiPromoType;
  discount: string; // numeric string, a percentage or a fixed amount depending on `type`
  terms: string | null;
  target: string | null;
  minSpend: number | null;
  maxClaims: number | null;
  currentClaims: number;
  isActive: boolean;
  startsAt: string | null;
  expiresAt: string | null;
  createdAt: string;
};

// Writable fields. `discount` is a string because the backend column is one.
export type PromoCodePayload = {
  code: string;
  campaignLabel: string | null;
  type: ApiPromoType;
  discount: string;
  terms: string;
  target?: string | null;
  minSpend: number | null;
  maxClaims: number | null;
  isActive: boolean;
  startsAt: string | null;
  expiresAt: string | null;
};

// API Platform returns a plain array for application/json and a Hydra
// collection for JSON-LD, so accept both.
const getPromoCodes = async (): Promise<ApiPromoCode[]> => {
  const response = await axios.get('/promo_codes');
  const data = response.data;
  if (Array.isArray(data)) return data;
  return data?.['hydra:member'] ?? data?.member ?? [];
}

const useGetPromoCodes = () => useQuery({
  queryKey: GET_PROMO_CODES_QUERY_KEY,
  queryFn: getPromoCodes,
});

export { getPromoCodes };
export default useGetPromoCodes;
