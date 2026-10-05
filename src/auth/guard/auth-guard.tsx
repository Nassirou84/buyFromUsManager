import { useEffect, useCallback, useState } from 'react';
import { useAuthContext } from '../hooks';
import { paths } from '@/lib/paths';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function AuthGuard({ children }: Props) {
  const router = useRouter();

  const { authenticated, user, logout } = useAuthContext();

  const [checked, setChecked] = useState(false);

  const check = useCallback(() => {
    if (!authenticated) {
      const searchParams = new URLSearchParams({
        returnTo: window.location.pathname,
      }).toString();

      const href = `${paths.login}?${searchParams}`;

      router.replace(href);
    } else {
      if (!user) {
        toast.error("User not found");
        logout();
        return;
      }
      if (user.roles?.findIndex((r: string) => r === 'ROLE_ADMIN') === -1) {
        toast.error("Access denied");
        logout();
        return;
      }
      setChecked(true);
    }
  }, [authenticated, router]);

  useEffect(() => {
    check();
  }, [check]);

  if (!checked) {
    return null;
  }

  return <>{children}</>;
}
