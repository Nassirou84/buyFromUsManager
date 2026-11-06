import axios from "@/utils/axios";
import { useMutation } from "@tanstack/react-query";

// POST /admin/orders/{uid}/status — advances the order's lifecycle status.
export const updateOrderStatus = async (uid: string, status: string) => {
  const response = await axios.post(`/admin/orders/${uid}/status`, { status });
  return response.data;
};

const useUpdateOrderStatus = () =>
  useMutation({
    mutationFn: ({ uid, status }: { uid: string; status: string }) => updateOrderStatus(uid, status),
  });

export default useUpdateOrderStatus;
export { useUpdateOrderStatus };
