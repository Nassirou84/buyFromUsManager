import axios from "@/utils/axios";
import { useMutation } from "@tanstack/react-query";

// POST /admin/orders/{uid}/add-note — attaches a fulfillment note to the order.
const addFulfillmentNote = async (uid: string, note: string) => {
  const response = await axios.post(`/admin/orders/${uid}/add-note`, { note });
  return response.data;
};

const useAddFulfillmentNote = () =>
  useMutation({
    mutationFn: ({ uid, note }: { uid: string; note: string }) => addFulfillmentNote(uid, note),
  });

export default useAddFulfillmentNote;
export { addFulfillmentNote };
