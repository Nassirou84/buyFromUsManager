import axios from "@/utils/axios";
import { useMutation } from "@tanstack/react-query";

export interface MarkOrderProcessedPayload {
  seller: string;
  sellerOrderReference: string;
  totalUsdAmount: string;
  processingNote?: string;
  receipt: File;
}

// POST /admin/orders/{uid}/processed — records the supplier-purchase details and
// moves the order to the "processed" status. Sent as multipart/form-data because
// the purchase receipt is a required file upload.
const markOrderProcessed = async (uid: string, payload: MarkOrderProcessedPayload) => {
  const formData = new FormData();
  formData.append("seller", payload.seller);
  formData.append("sellerOrderReference", payload.sellerOrderReference);
  formData.append("totalUsdAmount", payload.totalUsdAmount);
  if (payload.processingNote) formData.append("processingNote", payload.processingNote);
  formData.append("receipt", payload.receipt);

  const response = await axios.post(`/admin/orders/${uid}/processed`, formData);
  return response.data;
};

const useMarkOrderProcessed = () =>
  useMutation({
    mutationFn: ({ uid, ...payload }: { uid: string } & MarkOrderProcessedPayload) =>
      markOrderProcessed(uid, payload),
  });

export default useMarkOrderProcessed;
export { markOrderProcessed };
