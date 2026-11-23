import axios from "@/utils/axios";
import { useMutation } from "@tanstack/react-query";

export interface MarkOrderArrivedPayload {
  /** The tracking number of the parcel being confirmed. The backend matches its
   * last 4 characters against the order's stored tracking numbers, so either the
   * full number or just its last 4 characters is accepted. */
  trackingNumber: string;
  /** Recorded only on the call that confirms the final parcel (when the order
   * actually moves to "arrived_in_facility"). */
  collectionNote?: string;
}

/** Backend response for one parcel confirmation. The order only moves to
 * "arrived_in_facility" once every tracking number has been confirmed. */
export interface MarkOrderArrivedResponse {
  message: string;
  /** The order's current lifecycle status (stays "in_transit" until the last parcel). */
  status: string;
  /** True once every stored tracking number has been confirmed arrived. */
  allArrived: boolean;
  /** How many parcels have been confirmed so far. */
  arrivedCount: number;
  /** Total number of stored tracking numbers. */
  trackingNumbersCount: number;
  processed: unknown;
}

// POST /admin/orders/{uid}/arrived_in_facility (HOST_API already includes /api) —
// confirms ONE parcel by its tracking number (last-4 matched against the stored
// tracking numbers). The order only transitions to "arrived_in_facility" once every
// parcel has been confirmed. The backend reads form params, so the payload is sent
// as multipart/form-data.
const markOrderArrived = async (
  uid: string,
  payload: MarkOrderArrivedPayload
): Promise<MarkOrderArrivedResponse> => {
  const formData = new FormData();
  formData.append("trackingNumber", payload.trackingNumber);
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
