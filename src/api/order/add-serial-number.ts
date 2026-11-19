import axios from "@/utils/axios";
import { useMutation } from "@tanstack/react-query";

// POST /api/order_items/add_serial_number (HOST_API already includes /api) — records
// the serial number for a single order item (OrderItem.productSerialNumber). The
// order item is addressed by its numeric id, carried in the body.
const addSerialNumber = async (orderItemId: string | number, productSerialNumber: string) => {
  const response = await axios.post(`/order_items/add_serial_number`, {
    orderItemId,
    productSerialNumber,
  });
  return response.data;
};

const useAddSerialNumber = () =>
  useMutation({
    mutationFn: ({ orderItemId, productSerialNumber }: { orderItemId: string | number; productSerialNumber: string }) =>
      addSerialNumber(orderItemId, productSerialNumber),
  });

export default useAddSerialNumber;
export { addSerialNumber };
