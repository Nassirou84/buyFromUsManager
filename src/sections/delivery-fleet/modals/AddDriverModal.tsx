import useLocales from '@/locales/use-locales';
import React, { useState } from 'react';
import { Icon } from '@/components/lucide-icon';
import { Input } from '@/components/ui/input';

export interface NewDriverPayload {
  firstName: string;
  lastName: string;
  email: string;
}

interface AddDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (payload: NewDriverPayload) => void;
  isSubmitting?: boolean;
  errorMsg?: string;
}

export const AddDriverModal: React.FC<AddDriverModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  errorMsg: externalError = '',
}) => {
  const { t } = useLocales();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canSubmit = !!firstName.trim() && !!lastName.trim() && isEmailValid;

  const handleClose = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setErrorMsg('');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!isEmailValid) {
      setErrorMsg(t('please_enter_a_valid_email_address'));
      return;
    }

    onSubmit?.({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
    });
  };

  const displayedError = errorMsg || externalError;

  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }} className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-[#131b2e] rounded-2xl max-w-lg w-full max-h-[95vh] overflow-y-auto p-5 sm:p-6 shadow-2xl border border-[#dce9ff] dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#f0f4ff] dark:border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#dbe1ff] dark:bg-blue-900/60 text-[#004ac6] dark:text-blue-300 flex items-center justify-center font-bold shadow-2xs">
              <Icon name="person_add" className="text-[22px]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#0b1c30] dark:text-white">
                {t('fleet_add_driver_title')}
              </h3>
              <p className="text-[12px] text-[#565e74] dark:text-slate-400">
                {t('fleet_add_driver_subtitle')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        {displayedError && (
          <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-xl text-red-700 dark:text-red-300 text-[12px] flex items-center gap-2">
            <Icon name="error" className="text-[18px]" />
            <span>{displayedError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              id="add-driver-first-name"
              label={t('user_first_name')}
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              containerClassName="mb-0"
            />
            <Input
              id="add-driver-last-name"
              label={t('user_last_name')}
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              containerClassName="mb-0"
            />
          </div>

          <Input
            id="add-driver-email"
            label={t('user_email')}
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            containerClassName="mb-0"
          />

          <div className="flex items-start gap-2 p-3 bg-[#eff4ff] dark:bg-slate-800/60 rounded-xl text-[12px] text-[#565e74] dark:text-slate-300">
            <Icon name="mail" className="text-[18px] text-[#004ac6] dark:text-blue-400 shrink-0" />
            <span>{t('fleet_driver_credentials_hint')}</span>
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
              disabled={isSubmitting || !canSubmit}
              className="px-4 py-2 bg-[#004ac6] hover:bg-[#003ea8] text-white text-[13px] font-semibold rounded-lg disabled:opacity-40 cursor-pointer shadow-sm transition-all flex items-center gap-1.5"
            >
              <Icon name={isSubmitting ? 'sync' : 'check'} className="text-[17px]" />
              <span>{isSubmitting ? t('fleet_creating_driver') : t('fleet_create_driver')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
