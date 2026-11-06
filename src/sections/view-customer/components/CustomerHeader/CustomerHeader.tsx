'use client';

import React from 'react';
import useLocales from '@/locales/use-locales';
import { Icon } from '@/components/lucide-icon';
import { Customer } from '@/sections/store-customers/types';

interface CustomerHeaderProps {
  customer: Customer;
}

/** Page heading with the customer name, id and (for VIP Gold) the gold badge. */
export const CustomerHeader: React.FC<CustomerHeaderProps> = ({ customer }) => {
  const { t } = useLocales();

  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <div className="flex items-center gap-2.5 flex-wrap min-w-0">
        <div className="w-3 h-6 bg-[#2563eb] rounded-full"></div>
        <h1 className="text-[15px] text-[#0b1c30] dark:text-white font-bold">
          {t('customers_detail_title')}{' '}
          <span className="text-[#004ac6] dark:text-blue-400 font-bold">{customer.name}</span>{' '}
          <span className="text-[#565e74] dark:text-slate-400 font-mono font-normal text-[13px]">(#{customer.id})</span>
        </h1>
        {customer.segment === 'VIP Gold' && (
          <span className="px-2.5 py-1 rounded-full bg-[#ffdbcd] text-[#943700] text-[11px] font-semibold flex items-center gap-1">
            <Icon name="military_tech" className="text-[14px]" />
            {t('customers_gold_badge')}
          </span>
        )}
      </div>
    </div>
  );
};
