'use client';

import React from 'react';
import useLocales from '@/locales/use-locales';
import { Icon } from '@/components/lucide-icon';

interface BackButtonProps {
  onClick: () => void;
}

/** "Back to list" navigation button shown above the customer detail. */
export const BackButton: React.FC<BackButtonProps> = ({ onClick }) => {
  const { t } = useLocales();

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#131b2e] hover:bg-[#eff4ff] dark:hover:bg-slate-800 text-[#0b1c30] dark:text-white text-[13px] rounded-lg shadow-2xs transition-colors border border-[#e5eeff] dark:border-slate-700 font-medium self-start"
    >
      <Icon name="arrow_back" className="text-[18px]" />
      <span>{t('customers_back_to_list')}</span>
    </button>
  );
};
