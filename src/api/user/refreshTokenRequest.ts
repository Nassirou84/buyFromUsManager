
import axios, { endpoints } from "@/utils/axios";

const refreshTokenRequest = async () => {
  try {
    const data = await axios.post(endpoints.auth.refreshToken, {}, { withCredentials: true });
    if (data.status !== 200) {
      throw new Error(data.statusText || "Refresh token request failed");
    }
    return data.data;
  } catch (error) {
    console.error("Refresh token request failed:", error);
    throw error;
  }
};

export default refreshTokenRequest;