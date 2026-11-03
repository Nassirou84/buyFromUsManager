import axios from "@/utils/axios";
import { useMutation } from "@tanstack/react-query";
import { ApiCourrier } from "./get-courriers";

// Fields in the Courrier entity's courrier:write group.
export interface AddCourrierPayload {
  name: string;
  contact: string;
  pickupLocation: string;
  pickupContact: string;
  usaAddress: string;
}

// POST /courriers (courrier:write) — registers a new carrier partner.
const addCourrier = async (payload: AddCourrierPayload): Promise<ApiCourrier> => {
  const response = await axios.post('/courriers', payload);
  return response.data;
};

const useAddCourrier = () =>
  useMutation({
    mutationFn: addCourrier,
  });

export default useAddCourrier;
export { addCourrier };
