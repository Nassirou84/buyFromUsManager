import axios from "@/utils/axios";
import { useMutation } from "@tanstack/react-query";

// POST /admin/orders/{uid}/resend-confirmation — re-dispatches the order
// confirmation email for an existing order (admin-only).
const resendOrderConfirmation = async (uid: string) => {
  try {
    const response = await axios.post(`/admin/orders/${uid}/resend-confirmation`, {});
    return response.data;
  } catch (error) {
    console.error("Failed to resend order confirmation:", error);
    throw error;
  }
};

const useResendOrderConfirmation = () =>
  useMutation({
    mutationFn: ({ uid }: { uid: string }) => resendOrderConfirmation(uid),
  });

export default useResendOrderConfirmation;
export { resendOrderConfirmation };
