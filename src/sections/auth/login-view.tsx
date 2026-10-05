'use client';

import Link from 'next/link';
import { toast } from 'sonner';
import { useState } from 'react';
import { useLocales } from '@/locales';
import React from 'react';
import { getFingerprint } from '@/utils/lodash';
import { useAuthContext } from '@/auth/hooks/use-auth-context';
import ResendCodeCountdown from '@/components/resend-code-countdown';


export default function LoginView() {
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const { t } = useLocales();

  const { login, is2FaRequired, confirm2FA, resend2FACode } = useAuthContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !email) {
      setError(t('please_fill_out_all_fields'));
      return;
    }
    if (!email.includes('@')) {
      setError(t('please_enter_a_valid_email_address'));
      return;
    }

    const fingerprint = await getFingerprint();

    login(email, password, fingerprint).then(() => {
      toast.success(t('you_have_successfully_signed_in'));
    }).catch((err) => {
      setError(t(err.message) || t('an_error_occurred_while_signing_in'));
    });
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!twoFactorCode) {
      setError(t('please_enter_your_two_factor_authentication_code'));
      return;
    }

    const fingerprint = await getFingerprint();

    confirm2FA(twoFactorCode, email, fingerprint).then(() => {
      toast.success(t('you_have_successfully_signed_in'));
    }).catch((err) => {
      setError(t(err.message) || t('an_error_occurred_while_signing_in'));
    });
  };

  const handleResend2FACode = async () => {
    try {
      const fingerprint = await getFingerprint();
      await resend2FACode(email, fingerprint);
      toast.success(t('resend_code_successfully'));
    } catch (err: unknown) {
      setError(t((err as Error).message) || t('an_error_occurred_while_sending_the_code'));
    }
  };

  if (is2FaRequired) {
    return (
      <form onSubmit={handle2FASubmit} className="space-y-4 max-w-[500px] mx-auto bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-3xl font-bold text-on-surface">{t('two_factor_authentication_required')}</h2>
        <p className="text-sm text-on-surface-variant mb-4">
          {t('please_enter_your_two_factor_authentication_code_to_continue')}
        </p>
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-lg text-xs font-medium">
            {error}
          </div>
        )}
        <div>
          <label className="block text-xs font-bold text-on-surface tracking-wider uppercase mb-1.5">
            {t('two_factor_authentication_code')}
          </label>
          <input
            type="code"
            value={twoFactorCode}
            onChange={(e) => setTwoFactorCode(e.target.value)}
            placeholder="123456"
            className="w-full h-11 border border-outline-variant rounded-lg px-4 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary-first focus:border-transparent transition-all"
          />
        </div>
        <button
          type="submit"
          className="w-full mt-2 py-3 bg-primary-first text-white font-sans text-sm font-bold rounded-xl shadow-lg hover:bg-primary-first/90 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-first focus:ring-offset-2"
        >
          {t('submit')}
        </button>
        <ResendCodeCountdown onResend={handleResend2FACode} />
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-[500px] mx-auto bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-3xl font-bold text-on-surface">{t('sign_in')}</h2>
      <p className="text-sm text-on-surface-variant mb-4">
        {t('sign_in_to_your_account_to_access_your_profile_and_order_history')}
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

      <div>
        <label className="block text-xs font-bold text-on-surface tracking-wider uppercase mb-1.5">
          {t('password')}
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full h-11 border border-outline-variant rounded-lg px-4 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary-first focus:border-transparent transition-all"
        />
      </div>

      <div className="flex justify-end">
        <Link href="/auth/forgot-password" className="text-xs font-bold text-primary-first hover:underline">
          {t('forgot_password')}
        </Link>
      </div>

      <button
        type="submit"
        className="w-full mt-2 py-3 bg-primary-first text-white font-sans text-sm font-bold rounded-xl shadow-lg hover:bg-primary-first/90 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-first focus:ring-offset-2"
      >
        {t('sign_in')}
      </button>
    </form>
  );
}
