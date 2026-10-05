import axios from '@/utils/axios';

// ----------------------------------------------------------------------

function jwtDecode(token: string) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split('')
      .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
      .join('')
  );

  return JSON.parse(jsonPayload);
}

// ----------------------------------------------------------------------

export const isValidToken = (accessToken: string) => {
  if (!accessToken) {
    return false;
  }

  const decoded = jwtDecode(accessToken);

  const currentTime = Date.now() / 1000;

  return decoded.exp > currentTime;
};

// ----------------------------------------------------------------------

// Refresh a little before the token actually expires, so in-flight requests
// don't race the expiry boundary.
const REFRESH_BEFORE_EXPIRY_MS = 60_000;

let refreshTimer: ReturnType<typeof setTimeout> | undefined;

const scheduleTokenRefresh = (exp: number, onExpire: () => void) => {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
  }

  const timeLeft = exp * 1000 - Date.now() - REFRESH_BEFORE_EXPIRY_MS;

  refreshTimer = setTimeout(onExpire, Math.max(timeLeft, 0));
};

// ----------------------------------------------------------------------

// `onExpire` is called in the background, shortly before the access token
// expires, so callers can silently refresh it instead of reloading the page.
export const setSession = (accessToken: string | null, onExpire?: () => void) => {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = undefined;
  }

  if (accessToken) {
    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

    if (onExpire) {
      const { exp } = jwtDecode(accessToken);
      scheduleTokenRefresh(exp, onExpire);
    }
  } else {
    delete axios.defaults.headers.common.Authorization;
  }
};
