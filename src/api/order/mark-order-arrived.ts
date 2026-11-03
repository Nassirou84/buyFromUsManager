import axios from "@/utils/axios";
import { useMutation } from "@tanstack/react-query";

export interface MarkOrderArrivedPayload {
  /** Last four characters of the supplier order reference, used to confirm the
   * right parcel was collected. The backend rejects a value that doesn't match. */
  lastFour: string;
  collectionNote?: string;
}

// POST /admin/orders/{uid}/arrived_in_facility (HOST_API already includes /api) —
// records the collection and moves the order to "arrived_in_facility". The backend
// reads form params, so the payload is sent as multipart/form-data.
const markOrderArrived = async (uid: string, payload: MarkOrderArrivedPayload) => {
  const formData = new FormData();
  formData.append("lastFour", payload.lastFour);
  if (payload.collectionNote) formData.append("collectionNote", payload.collectionNote);

  const response = await axios.post(`/admin/orders/${uid}/arrived_in_facility`, formData);
  return response.data;
};

const useMarkOrderArrived = () =>
  useMutation({
    mutationFn: ({ uid, ...payload }: { uid: string } & MarkOrderArrivedPayload) =>
      markOrderArrived(uid, payload),
  });

export default useMarkOrderArrived;
export { markOrderArrived };
