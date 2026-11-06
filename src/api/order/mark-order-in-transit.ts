import axios from "@/utils/axios";
import { useMutation } from "@tanstack/react-query";

export interface MarkOrderInTransitPayload {
  /** Courrier id of the selected carrier partner (backend `carrier`). */
  carrier: string;
  shippingCost: string;
  shippingReceipt?: File | null;
}

// POST /api/admin/orders/{uid}/in-transit (HOST_API already includes /api) — assigns
// the carrier, records the shipping cost/receipt and moves the order to "in_transit".
// Sent as multipart/form-data because the shipping receipt is a file upload.
const markOrderInTransit = async (uid: string, payload: MarkOrderInTransitPayload) => {
  const formData = new FormData();
  formData.append("carrier", payload.carrier);
  formData.append("shippingCost", payload.shippingCost);
  if (payload.shippingReceipt) formData.append("shippingReceipt", payload.shippingReceipt);

  const response = await axios.post(`/admin/orders/${uid}/in-transit`, formData);
  return response.data;
};

const useMarkOrderInTransit = () =>
  useMutation({
    mutationFn: ({ uid, ...payload }: { uid: string } & MarkOrderInTransitPayload) =>
      markOrderInTransit(uid, payload),
  });

export default useMarkOrderInTransit;
export { markOrderInTransit };
