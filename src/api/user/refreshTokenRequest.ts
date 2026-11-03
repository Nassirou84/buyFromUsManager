import rawAxios from "axios";
import { endpoints } from "@/utils/axios";
import { HOST_API } from "@/config-global";

// A dedicated client (no response interceptor) so refresh failures keep their
// HTTP status. The shared axios instance collapses errors to the response body,
// which hides whether a failure was a real auth rejection (401/403) or just a
// transient network blip — and the caller needs that difference to decide
// whether to end the session or simply retry.
const refreshClient = rawAxios.create({ baseURL: HOST_API });

const refreshTokenRequest = async () => {
  const { data } = await refreshClient.post(
    endpoints.auth.refreshToken,
    {},
    { withCredentials: true }
  );
  return data;
};

export default refreshTokenRequest;
