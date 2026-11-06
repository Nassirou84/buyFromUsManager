'use client';

import React from 'react';
import useLocales from '@/locales/use-locales';
import { Icon } from '@/components/lucide-icon';
import { BackButton } from '../BackButton';

interface CustomerUnavailableProps {
  /** Whether the customer record is still being fetched. */
  loading: boolean;
  onBack: () => void;
}

/** Shown in place of the detail when the customer is loading or cannot be found. */
export const CustomerUnavailable: React.FC<CustomerUnavailableProps> = ({ loading, onBack }) => {
  const { t } = useLocales();

  return (
    <div className="flex flex-col w-full gap-5">
      <BackButton onClick={onBack} />
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <div className="w-14 h-14 rounded-full bg-[#eff4ff] dark:bg-slate-800 flex items-center justify-center text-[#004ac6] dark:text-blue-400">
          <Icon name={loading ? 'hourglass_empty' : 'person_off'} className="text-[26px]" />
        </div>
        <p className="text-[13px] text-[#565e74] dark:text-slate-400 max-w-sm">
          {loading ? t('customers_detail_loading') : t('customers_detail_unavailable')}
        </p>
      </div>
    </div>
  );
};
