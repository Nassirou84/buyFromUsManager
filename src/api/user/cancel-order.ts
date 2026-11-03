import axios from "@/utils/axios";
import { useMutation } from "@tanstack/react-query";

// API Platform item operation: POST /orders/{uid}/cancel (the controller looks the
// order up by its uid). Returns { success, message }.
const cancelOrder = async (uid: string) => {
  try {
    const response = await axios.post(`/admin/orders/${uid}/cancel`, {});
    return response.data;
  } catch (error) {
    console.error("Failed to cancel order:", error);
    throw error;
  }
};

const useCancelOrder = () =>
  useMutation({
    mutationFn: ({ uid }: { uid: string }) => cancelOrder(uid),
  });

export default useCancelOrder;
export { cancelOrder };
