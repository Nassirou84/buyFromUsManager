import User from "@/types/user";
import { FingerprintComponents } from "@/utils/lodash";

/* eslint-disable @typescript-eslint/no-explicit-any */
export type AuthUserType = User;

export type ActionMapType<M extends { [index: string]: any }> = {
  [Key in keyof M]: M[Key] extends undefined
  ? {
    type: Key;
  }
  : {
    type: Key;
    payload: M[Key];
  };
};

export type AuthStateType = {
  status?: string;
  loading: boolean;
  token: string | null;
  user: User | null;
  is2FaRequired: boolean;
};

type CanRemove = {
  login?: (email: string, password: string) => Promise<void>;
  confirmRegister?: (email: string, code: string) => Promise<void>;
  forgotPassword?: (email: string) => Promise<void>;
  resendCodeRegister?: (email: string) => Promise<void>;
  newPassword?: (
    email: string,
    code: string,
    password: string
  ) => Promise<void>;
};

export type JWTContextType = CanRemove & {
  user: AuthUserType | null;
  method: string;
  loading: boolean;
  authenticated: boolean;
  unauthenticated: boolean;
  is2FaRequired: boolean;
  resend2FACode: (email: string, fingerprint: FingerprintComponents) => Promise<void>;
  login: (email: string, password: string, fingerprint: FingerprintComponents) => Promise<void>;
  logout: () => Promise<void>;
  confirm2FA: (code: string, email: string, fingerprint: FingerprintComponents) => Promise<void>;
};
