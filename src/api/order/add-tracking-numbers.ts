import axios from "@/utils/axios";
import { useMutation } from "@tanstack/react-query";

/** One package tracking number plus its carrier name (free text, e.g. "USPS").
 * These are plain data on OrderProcessed, unrelated to the Courrier partner. */
export interface TrackingNumberEntry {
  trackingNumber: string;
  carrierName: string;
}

// POST /api/admin/orders/{uid}/tracking-numbers (HOST_API already includes /api) —
// appends one or many tracking numbers to the order's current OrderProcessed record.
// At least one must exist before the order can be moved to "in_transit". Sent as JSON.
const addTrackingNumbers = async (uid: string, trackingNumbers: TrackingNumberEntry[]) => {
  const response = await axios.post(`/admin/orders/${uid}/tracking-numbers`, {
    trackingNumbers,
  });
  return response.data;
};

const useAddTrackingNumbers = () =>
  useMutation({
    mutationFn: ({ uid, trackingNumbers }: { uid: string; trackingNumbers: TrackingNumberEntry[] }) =>
      addTrackingNumbers(uid, trackingNumbers),
  });

export default useAddTrackingNumbers;
export { addTrackingNumbers };
