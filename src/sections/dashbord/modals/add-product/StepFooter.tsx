import React from 'react';
import useLocales from '@/locales/use-locales';
import { PRIMARY_BTN_CLASS, SECONDARY_BTN_CLASS } from './constants';

interface StepFooterProps {
  onBack?: () => void;
  onCancel: () => void;
  submitLabel: string;
  submitDisabled?: boolean;
}

// Back / Cancel / submit row shared by the form steps; the submit button triggers the parent <form>.
export const StepFooter: React.FC<StepFooterProps> = ({ onBack, onCancel, submitLabel, submitDisabled }) => {
  const { t } = useLocales();

  return (
    <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#f0f4ff] dark:border-slate-800">
      {onBack ? (
        <button type="button" onClick={onBack} className={SECONDARY_BTN_CLASS}>
          {t('back')}
        </button>
      ) : (
        <span />
      )}
      <div className="flex items-center gap-2">
        <button type="button" onClick={onCancel} className={SECONDARY_BTN_CLASS}>
          {t('cancel')}
        </button>
        <button type="submit" disabled={submitDisabled} className={PRIMARY_BTN_CLASS}>
          {submitLabel}
        </button>
      </div>
    </div>
  );
};
