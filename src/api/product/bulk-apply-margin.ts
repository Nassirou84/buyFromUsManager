import axios from "@/utils/axios";
import { useMutation } from "@tanstack/react-query";

const bulkApplyMargin = async (productUids: string[], margin: number) => {
  const response = await axios.post('/product/bulk-apply-margin', { productUids, margin });
  return response.data;
};

const useBulkApplyMargin = () => {
  return useMutation({
    mutationFn: ({
      productUids, margin
    }: { productUids: string[], margin: number }) => bulkApplyMargin(productUids, margin),
  });
};

export { useBulkApplyMargin };

export default bulkApplyMargin;