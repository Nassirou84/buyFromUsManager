import axios from "@/utils/axios";
import { useMutation } from "@tanstack/react-query";

export interface BatchAssignDeliveryPayload {
  // Driver (user) id the selected orders are assigned to.
  driver_id: number | string;
  // Orders to route, identified by their uid.
  orders: { uid: string }[];
}

interface BatchAssignDeliveryResponse {
  message: string;
  processed: number;
}

// POST /admin/batch-assign-delivery (HOST_API already includes /api) — assigns the given
// out_for_delivery orders to a driver. Returns how many orders were actually processed.
export const batchAssignDelivery = async (
  payload: BatchAssignDeliveryPayload,
): Promise<BatchAssignDeliveryResponse> => {
  const response = await axios.post('/admin/batch-assign-delivery', payload);
  return response.data;
};

const useBatchAssignDelivery = () =>
  useMutation({
    mutationFn: batchAssignDelivery,
  });

export { useBatchAssignDelivery };
export default useBatchAssignDelivery;
