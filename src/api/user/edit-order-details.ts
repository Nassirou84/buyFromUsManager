import axios from "@/utils/axios";
import { useMutation } from "@tanstack/react-query";

export type EditOrderDetailsPayload = {
  street: string;
  city: string;
  state: string;
  suite?: string;
  fullName?: string;
  phone?: string;
};

const editOrderDetails = async (uid: string, data: EditOrderDetailsPayload) => {
  try {
    const response = await axios.post(`/admin/edit/${uid}/order/details`, data);
    return response.data;
  } catch (error) {
    console.error("Failed to edit order details:", error);
    throw error;
  }
};

const useEditOrderDetails = () =>
  useMutation({
    mutationFn: ({ uid, data }: { uid: string; data: EditOrderDetailsPayload }) => editOrderDetails(uid, data),
  });

export default useEditOrderDetails;
export { editOrderDetails };
