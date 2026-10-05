'use client';

import { AuthContext } from './auth-context';
import Loading from '@/app/loading';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export function AuthConsumer({ children }: Props) {
  return (
    <AuthContext.Consumer>
      {(auth) => (auth.loading ? <Loading /> : children)}
    </AuthContext.Consumer>
  );
}
