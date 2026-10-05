'use client';
import Link from 'next/link';
import useLocales from '@/locales/use-locales';
import { useState } from 'react';
import useGetResetPasswordRequest from '@/api/user/reset-password-request';
import { MailCheck } from 'lucide-react';
import { toast } from 'sonner';
import LoadingButton from '@/components/loadin-button/loading-button';

export default function ForgotPasswordView() {

  const { t } = useLocales();
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);

  const {
    mutateAsync: resetPasswordRequest,
    isPending
  } = useGetResetPasswordRequest();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError(t('email_is_required'));
      return;
    }

    try {
      await resetPasswordRequest(email);
      setSuccess(true);
    } catch (err: { error?: string } | unknown) {
      const error = err as { error?: string };
      toast.error(error?.error || t('an_error_occurred_while_sending_the_reset_password_email'));
    }
  }

  if (success) {
    return (
      <div className="space-y-4 max-w-[500px] mx-auto bg-white p-6 rounded-lg shadow-md mb-8 py-10">
        <div className="flex justify-center">
          <MailCheck className="w-12 h-12 text-primary-first mx-auto mb-4" />
        </div>
        <h2 className="text-2xl font-bold text-on-surface text-center">{t('email_sent')}</h2>
        <p className="text-sm text-on-surface-variant mb-4 text-center">
          {t('reset_password_email_sent', { email })}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-[500px] mx-auto bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-3xl font-bold text-on-surface">{t('forgot_password')}</h2>
      <p className="text-sm text-on-surface-variant mb-4">
        {t('enter_your_email_to_reset_your_password')}
      </p>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-lg text-xs font-medium">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-bold text-on-surface tracking-wider uppercase mb-1.5">
          {t('email_address')}
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="jane.doe@example.com"
          className="w-full h-11 border border-outline-variant rounded-lg px-4 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary-first focus:border-transparent transition-all"
        />
      </div>
      <LoadingButton
        size="lg"
        type="submit"
        className="w-full mt-2 py-4 bg-primary-first text-white font-sans text-sm font-bold rounded-xl shadow-lg hover:bg-primary-first/90 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-first focus:ring-offset-2"
        isLoading={isPending}
      >
        {t('send_reset_password_email')}
      </LoadingButton>
      <p className="text-center text-xs text-on-surface-variant mt-3">
        {t('remember_your_password')}{' '}<Link href="/auth/login" className="text-center text-xs font-bold text-primary-first hover:underline ">
          {t('sign_in_now')}
        </Link>
      </p>
    </form>
  );
}
