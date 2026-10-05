
type UserRole = 'ROLE_ADMIN' | 'ROLE_SUPERADMIN' | 'ROLE_USER';

export type Address = {
  isDefault: boolean;
  street: string;
  suite?: string;
  city: string;
  state: string;
  country?: string;
};

export type ShippingAddress = {
  fullName: string;
  phone: string;
  street: string;
  suite?: string;
  city: string;
  state: string;
  country?: string;
  email: string;
  shippingOption: 'free' | 'express';
};

export type TrustedDevice = {
  id: string;
  language: string;
  platform: string;
  timeZone: string;
  userAgent: string;
  createdAt: string;
};

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  roles?: UserRole[];
  createdAt?: string;
  phone?: string;
  what3words?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  addresses?: Address[];
  twoFactor?: boolean;
  twoFactorContactMethod?: 'email' | 'text';
  trustedDevices?: TrustedDevice[];
}

export default User;