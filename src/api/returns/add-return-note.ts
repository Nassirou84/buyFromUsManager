import axios from "@/utils/axios";
import { useMutation, type UseMutationResult } from "@tanstack/react-query";

export interface AddReturnNoteVars {
  /** Product return uid. */
  uid: string;
  /** Inspector note. The backend keeps one note per return (ProductReturn.returnNote), so this replaces the previous one. */
  note: string;
}

export interface AddReturnNoteResponse {
  success: boolean;
}

// POST /product-returns/uid/{uid}/add-note (admin only). Body: { note } (required).
const addReturnNote = async ({ uid, note }: AddReturnNoteVars): Promise<AddReturnNoteResponse> => {
  const response = await axios.post<AddReturnNoteResponse>(`/product-returns/uid/${uid}/add-note`, { note });
  return response.data;
};

export const useAddReturnNote = (): UseMutationResult<AddReturnNoteResponse, unknown, AddReturnNoteVars> =>
  useMutation({
    mutationFn: addReturnNote,
  });

export default useAddReturnNote;
export { addReturnNote };
