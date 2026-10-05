import ResetPasswordView from '@/sections/auth/reset-password-view'
import ResetPasswordMissingToken from '@/components/reset-password-missing-token';
import checkTokenValidity from '@/api/user/check-token-validity';
type PageProps = {
  searchParams: Promise<{ me?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  const { me: token } = await searchParams;

  if (!token) {
    return <ResetPasswordMissingToken />;
  }
  const res = await checkTokenValidity(token);
  if (!res || res.success === false) {
    return <ResetPasswordMissingToken />;
  }
  return (
    <ResetPasswordView token={token} />
  )
}