import axios from "@/utils/axios";
import { useQuery } from "@tanstack/react-query";

export type OrderInvoiceItem = {
  productName: string;
  qty: number;
  unit_price: number;
  sku: string;
  variant?: string | null;
};

export type OrderInvoice = {
  order: {
    reference: string;
    // Symfony serializes DateTime as { date, timezone_type, timezone }.
    createdAt?: { date?: string } | string | null;
    customer: {
      fullName?: string | null;
      phone?: string | null;
      email?: string | null;
      address?: string | null;
    };
    subtotal: number;
    discount: number;
    shipping_tier: string;
    shipping: number;
    taxRate: number;
    tax: number;
    total: number;
    items: OrderInvoiceItem[];
    currency: string;
    payment: {
      transactionId?: string | null;
      method?: string | null;
      amount?: number | null;
      status?: string | null;
      last4?: string | null;
    };
    paymentStatus?: string | null;
  };
  barcode: string;
};

// Same endpoint the storefront receipt uses. Admins pass accessToken=admin (the
// ReceiptController grants access to ROLE_ADMIN with that token).
export const getOrderInvoice = async (uid: string): Promise<OrderInvoice> => {
  const response = await axios.get(`/orders/${uid}/receipt`, { params: { accessToken: 'admin' } });
  return response.data;
};

const useGetOrderInvoice = (uid: string | undefined, enabled = true) =>
  useQuery({
    queryKey: ['GET_ORDER_INVOICE', uid],
    queryFn: () => getOrderInvoice(uid as string),
    enabled: enabled && !!uid,
  });

export default useGetOrderInvoice;
