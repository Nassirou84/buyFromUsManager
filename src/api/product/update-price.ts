import axios from "@/utils/axios";
import { useMutation } from "@tanstack/react-query";

const updatePrice = async (uid: string, newPrice: number) => {
  try {
    const response = await axios.post(`/product/change-price`, { newPrice: newPrice, uid: uid });
    return response.data;
  } catch (error) {
    console.error("Failed to update price:", error);
    throw error;
  }
};

const useUpdatePrice = () => {
  return useMutation({
    mutationFn: ({ uid, newPrice }: { uid: string; newPrice: number }) => updatePrice(uid, newPrice)
  });
};

export default useUpdatePrice;
export { updatePrice };