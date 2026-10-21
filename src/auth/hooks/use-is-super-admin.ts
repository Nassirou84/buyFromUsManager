'use client';

import { useAuthContext } from './use-auth-context';

export const useIsSuperAdmin = () => {
  const { user } = useAuthContext();

  return user?.roles?.includes('ROLE_SUPER_ADMIN') ?? false;
};
