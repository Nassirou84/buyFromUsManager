'use client';

import React from 'react';
import useLocales from '@/locales/use-locales';
import { Icon } from '@/components/lucide-icon';
import { Customer } from '@/sections/store-customers/types';
import { CARD, KPI_LABEL } from '@/sections/store-customers/shared';

interface IdentityCardProps {
  customer: Customer;
}

/** Identity & contact card: avatar, name, membership date, phone and email. */
export const IdentityCard: React.FC<IdentityCardProps> = ({ customer }) => {
  const { t } = useLocales();

  return (
    <div className={`${CARD} p-5 flex flex-col`}>
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className={KPI_LABEL}>{t('customers_identity')}</span>
          {customer.isVerified && (
            <span className="px-1.5 py-0.5 bg-[#dae2fd] text-[#004ac6] text-[11px] rounded font-medium">
              {t('customers_verified_account')}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 pt-1">
          <div className="w-14 h-14 rounded-full bg-[#2563eb] flex items-center justify-center text-white text-[15px] font-bold shadow-md">
            {customer.avatarInitials}
          </div>
          <div className="flex flex-col">
            <span className="text-[15px] text-[#0b1c30] dark:text-white font-bold">{customer.name}</span>
            <span className="text-[#565e74] dark:text-slate-400 text-[13px]">
              {t('customers_member_since', { date: customer.memberSince })}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1.5 pt-2 text-[13px]">
          <div className="flex items-center gap-2.5">
            <Icon name="call" className="text-[18px] text-[#737686]" />
            <span className="text-[#0b1c30] dark:text-white font-medium">{customer.phone}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Icon name="mail" className="text-[18px] text-[#737686]" />
            <span className="text-[#0b1c30] dark:text-white">{customer.email}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
