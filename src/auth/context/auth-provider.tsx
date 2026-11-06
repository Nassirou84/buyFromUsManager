'use client';

import { useEffect, useReducer, useCallback, useMemo, useRef } from 'react';
import { AuthContext } from './auth-context';
import { isValidToken, isTokenExpiringSoon, setSession } from './utils';
import axios, { endpoints, registerAuthRefreshHandler } from '@/utils/axios';
import refreshTokenRequest from '@/api/user/refreshTokenRequest';
import { ActionMapType, AuthStateType, AuthUserType } from '../types';
import { FingerprintComponents } from '@/utils/lodash';
import { toast } from 'sonner';

enum Types {
  INITIAL = 'INITIAL',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  TFA_REQUIRED = 'TFA_REQUIRED',
}

type Payload = {
  [Types.INITIAL]: {
    user: AuthUserType | null;
    token: string | null;
  };
  [Types.LOGIN]: {
    user: AuthUserType | null;
    token: string | null;
  };
  [Types.TFA_REQUIRED]: undefined;
  [Types.LOGOUT]: undefined;
};

type ActionsType = ActionMapType<Payload>[keyof ActionMapType<Payload>];

const initialState: AuthStateType = {
  user: null,
  loading: true,
  token: null,
  is2FaRequired: false,
};

const reducer = (state: AuthStateType, action: ActionsType) => {
  if (action.type === Types.INITIAL) {
    return {
      loading: false,
      user: action.payload.user,
      token: action.payload.token,
      is2FaRequired: false,
    };
  }
  if (action.type === Types.LOGIN) {
    return {
      ...state,
      user: action.payload.user,
      token: action.payload.token,
      is2FaRequired: false,
    };
  }
  if (action.type === Types.TFA_REQUIRED) {
    return {
      ...state,
      user: null,
      is2FaRequired: true,
    };
  }
  if (action.type === Types.LOGOUT) {
    return {
      ...state,
      user: null,
      token: null,
      is2FaRequired: false,
    };
  }
  return state;
};

type Props = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: Props) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const isInitialized = useRef(false);
  // Shared in-flight refresh, so a burst of 401s (or the timer firing alongside
  // a 401) only hits /token/refresh once and everyone awaits the same result.
  const refreshPromiseRef = useRef<Promise<string | null> | null>(null);
  // Pending retry after a transient refresh failure.
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Swap the (expiring/expired) access token for a fresh one using the refresh
  // token cookie. Returns the new token, or null on failure. Used by the
  // pre-expiry timer, the resume catch-up, and the 401 retry.
  const refreshSession = useCallback(async (): Promise<string | null> => {
    if (refreshPromiseRef.current) return refreshPromiseRef.current;

    const promise = (async () => {
      try {
        const { access_token, user } = await refreshTokenRequest();

        // A 2xx without a usable token means the refresh was rejected.
        if (!access_token || !isValidToken(access_token) || !user) {
          throw { response: { status: 401 } };
        }

        if (retryTimerRef.current) {
          clearTimeout(retryTimerRef.current);
          retryTimerRef.current = undefined;
        }
        setSession(access_token, refreshSession);
        dispatch({
          type: Types.LOGIN,
          payload: {
            user,
            token: access_token,
          },
        });
        return access_token as string;
      } catch (error) {
        const status = (error as { response?: { status?: number } })?.response?.status;

        // Only a definitive rejection of the refresh token ends the session,
        // so AuthGuard redirects to login.
        if (status === 401 || status === 403) {
          setSession(null);
          dispatch({ type: Types.LOGOUT });
          return null;
        }

        // Transient failure (offline, a network blip when the laptop wakes from
        // sleep, a 5xx): keep the user signed in and try again shortly instead
        // of bouncing them to the login screen. The online/visibility/focus
        // catch-up below also retries.
        if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
        retryTimerRef.current = setTimeout(() => {
          void refreshSession();
        }, 15_000);
        return null;
      } finally {
        refreshPromiseRef.current = null;
      }
    })();

    refreshPromiseRef.current = promise;
    return promise;
  }, []);

  // Let the axios interceptor refresh-and-retry any request that returns 401.
  useEffect(() => {
    registerAuthRefreshHandler(refreshSession);
    return () => registerAuthRefreshHandler(null);
  }, [refreshSession]);

  const initialize = useCallback(async () => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    try {
      const { access_token, user } = await refreshTokenRequest();

      if (access_token && isValidToken(access_token) && user) {
        setSession(access_token, refreshSession);
        dispatch({
          type: Types.INITIAL,
          payload: {
            token: access_token,
            user,
          },
        });
      } else {
        dispatch({
          type: Types.INITIAL,
          payload: {
            token: null,
            user: null,
          },
        });
      }
    } catch {
      dispatch({
        type: Types.INITIAL,
        payload: {
          token: null,
          user: null,
        },
      });
    }
  }, [refreshSession]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Timers are throttled/paused while the tab is hidden or the machine sleeps,
  // so the scheduled refresh can fire late. Catch up as soon as the tab is
  // visible again or the network is back.
  const tokenRef = useRef(state.token);
  tokenRef.current = state.token;

  useEffect(() => {
    const catchUp = () => {
      if (document.visibilityState === 'hidden') return;
      if (!tokenRef.current) return; // not logged in
      if (isTokenExpiringSoon(tokenRef.current)) refreshSession();
    };

    document.addEventListener('visibilitychange', catchUp);
    window.addEventListener('focus', catchUp);
    window.addEventListener('online', catchUp);
    return () => {
      document.removeEventListener('visibilitychange', catchUp);
      window.removeEventListener('focus', catchUp);
      window.removeEventListener('online', catchUp);
    };
  }, [refreshSession]);

  // Drop any pending refresh retry when the provider unmounts.
  useEffect(() => () => {
    if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
  }, []);

  const login = useCallback(async (email: string, password: string, fingerprint?: FingerprintComponents) => {
    const data = {
      email,
      password,
      fingerprint,
    };

    try {
      const response = await axios.post(
        endpoints.auth.login,
        data,
        { withCredentials: true }
      );

      if (!response.data.access_token || !response.data.user) {
        throw new Error(response.data.message || 'Login failed');
      }

      const { access_token, user } = response.data;

      const { roles } = user;
      if (roles?.findIndex((r: string) => r === 'ROLE_ADMIN') === -1) {
        toast.error("Access denied");
        logout();
        return;
      }

      setSession(access_token, refreshSession);

      dispatch({
        type: Types.LOGIN,
        payload: {
          user,
          token: access_token,
        },
      });
    } catch (error: unknown) {
      const err = error as { TFARequired?: boolean };
      if (err.TFARequired) {
        toast.info("Two-factor authentication required.");
        dispatch({
          type: Types.TFA_REQUIRED,
        });
        throw new Error("2FA required");
      } else {
        throw error;
      }
    }
  }, [refreshSession]);

  const confirm2FA = useCallback(async (code: string, email: string, fingerprint: FingerprintComponents) => {
    const response = await axios.post(endpoints.auth.confirm2FA, { code, email, fingerprint }, { withCredentials: true });

    if (!response.data.access_token || !response.data.user) {
      throw new Error(response.data.message || 'Two-factor authentication failed');
    }

    const { access_token, user } = response.data;
    setSession(access_token, refreshSession);

    dispatch({
      type: Types.LOGIN,
      payload: {
        user,
        token: access_token,
      },
    });
  }, [refreshSession]);

  const resend2FACode = useCallback(async (email: string, fingerprint: FingerprintComponents) => {
    const response = await axios.post(endpoints.auth.resend2FACode, { email, fingerprint }, { withCredentials: true });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Resend 2FA code failed');
    }
  }, []);

  const logout = useCallback(async () => {
    await axios.post(endpoints.auth.logout, {}, { withCredentials: true });
    setSession(null);
    dispatch({
      type: Types.LOGOUT,
    });
    window.location.reload();
  }, []);

  const checkAuthenticated = state.user ? 'authenticated' : 'unauthenticated';

  const status = state.loading ? 'loading' : checkAuthenticated;

  const memoizedValue = useMemo(
    () => ({
      user: state.user,
      method: 'jwt',
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
      is2FaRequired: state.is2FaRequired,
      login,
      logout,
      confirm2FA,
      resend2FACode,
    }),
    [login, logout, confirm2FA, resend2FACode, state.user, status, state.is2FaRequired]
  );

  return (
    <AuthContext.Provider value={memoizedValue}>
      {children}
    </AuthContext.Provider>
  );
}
