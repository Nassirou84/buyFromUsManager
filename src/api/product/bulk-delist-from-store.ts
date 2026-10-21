import axios from "@/utils/axios";
import { useMutation } from "@tanstack/react-query";

const bulkDelistFromStore = async (productUids: string[]) => {
  const response = await axios.post('/product/bulk-mark-as-unavailable', { productUids });
  return response.data;
};

const useBulkDelistFromStore = () => {
  return useMutation({
    mutationFn: (productUids: string[]) => bulkDelistFromStore(productUids),
  });
};

export { useBulkDelistFromStore };

export default bulkDelistFromStore;