import axios from "@/utils/axios";
import { useMutation } from "@tanstack/react-query";

export type ToggleAdminAccessResponse = {
  success: boolean;
  id: number;
  isGrantedAccess: boolean;
};

const toggleAdminAccess = async (id: number): Promise<ToggleAdminAccessResponse> => {
  const response = await axios.patch(`/admin/${id}/toggle-access`);
  return response.data;
};

const useToggleAdminAccess = () => useMutation({
  mutationFn: (id: number) => toggleAdminAccess(id),
});

export { toggleAdminAccess };
export default useToggleAdminAccess;
