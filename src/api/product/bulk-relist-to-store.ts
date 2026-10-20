import axios from "@/utils/axios";
import { useMutation } from "@tanstack/react-query";

const bulkRelistToStore = async (productUids: string[]) => {
  const response = await axios.post('/product/bulk-mark-as-available', { productUids });
  return response.data;
};

const useBulkRelistToStore = () => {
  return useMutation({
    mutationFn: (productUids: string[]) => bulkRelistToStore(productUids),
  });
};

export { useBulkRelistToStore };

export default bulkRelistToStore;