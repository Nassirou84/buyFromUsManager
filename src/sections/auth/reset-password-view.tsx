"use client";
import useChangeUserPassword from '@/api/user/change-password';
import LoadingButton from '@/components/loadin-button/loading-button';
import useLocales from '@/locales/use-locales';
import { RectangleEllipsis } from 'lucide-react';
import React from 'react'
import Link from 'next/link';

export default function ResetPasswordView({ token }: { token: string }) {

  const { t } = useLocales();

  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState(false);

  const {
    mutateAsync: changePassword, isPending
  } = useChangeUserPassword();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError(t('please_fill_out_the_password_field'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('passwords_do_not_match'));
      return;
    }

    changePassword({ token, newPassword: password })
      .then(() => {
        setSuccess(true);
        setError('');
      })
      .catch((err) => {
        setError(err.message || t('an_error_occurred_while_changing_your_password'));
      });
  };

  if (success) {
    return (
      <div className="space-y-4 max-w-[500px] mx-auto bg-white p-6 rounded-lg shadow-md mb-8 py-10">
        <div className="flex justify-center">
          <RectangleEllipsis className="w-12 h-12 text-primary-first mx-auto mb-4" />
        </div>
        <h2 className="text-2xl font-bold text-on-surface text-center">{t('password_updated')}</h2>
        <p className="text-sm text-on-surface-variant mb-4 text-center">
          {t('your_password_has_been_successfully_updated')}
        </p>
        <Link href="/auth/login" className="w-full h-11 bg-primary-first text-on-primary rounded-lg font-sans text-sm font-bold tracking-wider hover:bg-primary-first/90 transition-all text-white flex items-center justify-center">
          {t('sign_in_now')}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-[500px] mx-auto bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-3xl font-bold text-on-surface">{t('new_password')}</h2>
      <p className="text-sm text-on-surface-variant mb-4">
        {t('enter_your_new_password_to_reset_it')}
      </p>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-lg text-xs font-medium">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-bold text-on-surface tracking-wider uppercase mb-1.5">
          {t('new_password')}
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full h-11 border border-outline-variant rounded-lg px-4 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary-first focus:border-transparent transition-all"
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-on-surface tracking-wider uppercase mb-1.5">
          {t('confirm_new_password')}
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full h-11 border border-outline-variant rounded-lg px-4 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary-first focus:border-transparent transition-all"
        />
      </div>
      <div>
        <LoadingButton
          size="lg"
          isLoading={isPending}
          type="submit"
          className="w-full h-11 bg-primary-first text-on-primary rounded-lg font-sans text-sm font-bold tracking-wider hover:bg-primary-first/90 transition-all text-white"
        >
          {t('reset_password')}
        </LoadingButton>
      </div>
    </form>
  )
}