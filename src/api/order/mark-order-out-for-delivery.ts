import axios from "@/utils/axios";
import { useMutation } from "@tanstack/react-query";

// POST /admin/orders/{uid}/out_for_delivery (HOST_API already includes /api) —
// moves the order to "out_for_delivery". The uid comes from the route, so there
// is no request body.
const markOrderOutForDelivery = async (uid: string) => {
  const response = await axios.post(`/admin/orders/${uid}/out_for_delivery`);
  return response.data;
};

const useMarkOrderOutForDelivery = () =>
  useMutation({
    mutationFn: ({ uid }: { uid: string }) => markOrderOutForDelivery(uid),
  });

export default useMarkOrderOutForDelivery;
export { markOrderOutForDelivery };
