import useLocales from '@/locales/use-locales';
import React, { useState } from 'react';
import { Icon } from '@/components/lucide-icon';

interface EditPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPasswordChanged?: () => void;
}

export const EditPasswordModal: React.FC<EditPasswordModalProps> = ({
  isOpen,
  onClose,
  onPasswordChanged,
}) => {
  const { t } = useLocales();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Password requirements calculation
  const hasMinLength = newPassword.length >= 8;
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const strengthScore = [hasMinLength, hasUpperCase, hasNumber, hasSpecial].filter(Boolean).length;
  const getStrengthLabel = () => {
    if (!newPassword) return '';
    if (strengthScore <= 1) return t('pw_weak');
    if (strengthScore <= 3) return t('pw_moderate');
    return t('pw_strong');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!currentPassword) {
      setErrorMsg(t('pw_err_current'));
      return;
    }

    if (!hasMinLength) {
      setErrorMsg(t('pw_err_min_length'));
      return;
    }

    if (!passwordsMatch) {
      setErrorMsg(t('pw_err_mismatch'));
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessMsg(t('pw_success'));
      setTimeout(() => {
        onPasswordChanged?.();
        handleClose();
      }, 1400);
    }, 600);
  };

  const handleClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setErrorMsg('');
    setSuccessMsg('');
    onClose();
  };

  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-[#131b2e] rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-[#dce9ff] dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#f0f4ff] dark:border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#dbe1ff] dark:bg-blue-900/60 text-[#004ac6] dark:text-blue-300 flex items-center justify-center font-bold shadow-2xs">
              <Icon name="lock_reset" className="text-[22px]"/>
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#0b1c30] dark:text-white">
                {t('change_password')}
              </h3>
              <p className="text-[12px] text-[#565e74] dark:text-slate-400">
                {t('head_of_operations_short')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Icon name="close" className="text-[20px]"/>
          </button>
        </div>

        {/* Notifications / Alerts */}
        {errorMsg && (
          <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-xl text-red-700 dark:text-red-300 text-[12px] flex items-center gap-2">
            <Icon name="error" className="text-[18px]"/>
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 rounded-xl text-emerald-700 dark:text-emerald-300 text-[12px] flex items-center gap-2">
            <Icon name="check_circle" className="text-[18px]"/>
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* Current Password */}
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-bold text-[#0b1c30] dark:text-slate-200">
              {t('current_password_req')}
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder={t('enter_current_password')}
                className="w-full h-9.5 pl-3 pr-10 bg-[#eff4ff] dark:bg-slate-800 text-[#0b1c30] dark:text-white text-[13px] rounded-lg border border-transparent focus:border-[#004ac6] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <Icon name={showCurrent ? 'visibility_off' : 'visibility'} className="text-[18px]"/>
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-[12px] font-bold text-[#0b1c30] dark:text-slate-200">
                {t('new_password_req')}
              </label>
              {newPassword && (
                <span
                  className={`text-[11px] font-bold ${
                    strengthScore <= 1
                      ? 'text-red-500'
                      : strengthScore <= 3
                      ? 'text-amber-500'
                      : 'text-emerald-600'
                  }`}
                >
                  {getStrengthLabel()}
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t('min_8_chars')}
                className="w-full h-9.5 pl-3 pr-10 bg-[#eff4ff] dark:bg-slate-800 text-[#0b1c30] dark:text-white text-[13px] rounded-lg border border-transparent focus:border-[#004ac6] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <Icon name={showNew ? 'visibility_off' : 'visibility'} className="text-[18px]"/>
              </button>
            </div>

            {/* Password requirements meter */}
            {newPassword && (
              <div className="grid grid-cols-4 gap-1 mt-1">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-1.5 rounded-full transition-all ${
                      strengthScore >= step
                        ? strengthScore <= 2
                          ? 'bg-amber-400'
                          : 'bg-emerald-500'
                        : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-bold text-[#0b1c30] dark:text-slate-200">
              {t('confirm_new_password_req')}
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('reenter_new_password')}
                className="w-full h-9.5 pl-3 pr-10 bg-[#eff4ff] dark:bg-slate-800 text-[#0b1c30] dark:text-white text-[13px] rounded-lg border border-transparent focus:border-[#004ac6] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <Icon name={showConfirm ? 'visibility_off' : 'visibility'} className="text-[18px]"/>
              </button>
            </div>
            {confirmPassword && (
              <span
                className={`text-[11px] font-medium mt-0.5 ${
                  passwordsMatch ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
                }`}
              >
                {passwordsMatch ? t('pw_match') : t('pw_no_match')}
              </span>
            )}
          </div>

          {/* Security policy note */}
          <div className="p-2.5 bg-[#f8f9ff] dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] text-[#565e74] dark:text-slate-400 leading-relaxed">
            {t('pw_policy_note')}
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f0f4ff] dark:border-slate-800">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[13px] font-semibold rounded-lg cursor-pointer transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !currentPassword || !passwordsMatch || !hasMinLength}
              className="px-4 py-2 bg-[#004ac6] hover:bg-[#003ea8] text-white text-[13px] font-semibold rounded-lg disabled:opacity-40 cursor-pointer shadow-sm transition-all flex items-center gap-1.5"
            >
              <Icon name={isSubmitting ? 'sync' : 'check'} className="text-[17px]"/>
              <span>{isSubmitting ? t('updating') : t('update_password')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
