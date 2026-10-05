// Server-side function to check the validity of a token by making an API request to the server. It uses Axios for HTTP requests and returns the response data indicating whether the token is valid or not.
import axios from '@/utils/axios';

const checkTokenValidity = async (token: string) => {
  try {
    const response = await axios.get(`/change_password/${token}/validate`);
    return response.data;
  } catch (error) {
    return error;
  }
}

export default checkTokenValidity;
