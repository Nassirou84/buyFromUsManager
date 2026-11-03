import { HOST_API } from '@/config-global';
import axios, { AxiosRequestConfig } from 'axios';
// config
// import { HOST_API } from 'src/config-global';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: HOST_API });

// ----------------------------------------------------------------------

export const endpoints = {
  auth: {
    me: '/auth/me',
    login: '/admin_login',
    logout: '/auth/logout',
    refreshToken: '/token/refresh',
    confirm2FA: '/2fa/verify',
    resend2FACode: '/resend-2fa-code',
  },
};

// ----------------------------------------------------------------------
// Reactive access-token refresh. The AuthProvider registers a handler that
// swaps the expired access token for a fresh one (using the refresh-token
// cookie). When any request comes back 401, we call it once and replay the
// request with the new token, so an expired token keeps the user signed in
// instead of bouncing them to the login page. Only a *failed* refresh clears
// the session (the handler itself does that), which lets AuthGuard redirect.

type RefreshHandler = () => Promise<string | null>;

let refreshHandler: RefreshHandler | null = null;

export const registerAuthRefreshHandler = (handler: RefreshHandler | null) => {
  refreshHandler = handler;
};

// Requests to these endpoints must never trigger a refresh-and-retry loop.
const AUTH_URLS = [endpoints.auth.refreshToken, endpoints.auth.login, endpoints.auth.logout];

type RetriableConfig = AxiosRequestConfig & { _retry?: boolean };

axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const response = error?.response;
    const original = error?.config as RetriableConfig | undefined;
    const isAuthUrl = !!original?.url && AUTH_URLS.some((url) => original.url!.includes(url));

    if (response?.status === 401 && refreshHandler && original && !original._retry && !isAuthUrl) {
      original._retry = true;
      try {
        const newToken = await refreshHandler();
        if (newToken) {
          original.headers = { ...original.headers, Authorization: `Bearer ${newToken}` };
          return axiosInstance(original);
        }
      } catch {
        // fall through to the normal rejection below
      }
    }

    return Promise.reject((response && response.data) || 'Something went wrong');
  }
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (args: string | [string, AxiosRequestConfig]) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosInstance.get(url, { ...config });

  return res.data;
};
