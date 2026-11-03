'use client';

import React from 'react';
import useLocales from '@/locales/use-locales';
import { Icon } from '@/components/lucide-icon';
import { CustomerAddress } from '@/sections/store-customers/types';
import { CARD } from '@/sections/store-customers/shared';

interface AddressesCardProps {
  addresses: CustomerAddress[];
  /** Fallback label when an address has neither a label nor a full name. */
  customerName: string;
}

const formatAddress = (address: CustomerAddress) =>
  [address.street, address.suite, address.city, address.state, address.country]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(', ');

/** Saved addresses grid. Highlights the customer's default address (or the first one). */
export const AddressesCard: React.FC<AddressesCardProps> = ({ addresses, customerName }) => {
  const { t } = useLocales();

  // The default saved address (falling back to the first one) is highlighted.
  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0] ?? null;

  return (
    <div className={`${CARD} lg:col-span-2 overflow-hidden`}>
      <div className="p-5 flex items-center gap-2.5 border-b border-[#f0f4ff] dark:border-slate-800">
        <Icon name="location_on" className="text-[20px] text-[#004ac6] dark:text-blue-400" />
        <h3 className="text-[15px] text-[#0b1c30] dark:text-white font-bold">{t('customers_addresses_title')}</h3>
        <span className="px-2.5 py-0.5 bg-[#dae2fd] text-[#004ac6] text-[11px] rounded-full font-bold">
          {addresses.length}
        </span>
      </div>

      {addresses.length === 0 ? (
        <p className="p-5 text-[13px] text-[#565e74] dark:text-slate-400">{t('customers_addresses_empty')}</p>
      ) : (
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((address, idx) => {
            const isSelected = address === defaultAddress;
            return (
              <div
                key={idx}
                className={`p-4 rounded-lg border flex flex-col gap-1.5 transition-colors ${isSelected
                  ? 'border-[#2563eb] bg-[#eff4ff] dark:bg-slate-800/70 ring-1 ring-[#2563eb]/30'
                  : 'border-[#e5eeff] dark:border-slate-800 bg-[#eff4ff]/40 dark:bg-slate-800/40'
                  }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-bold text-[#0b1c30] dark:text-white">
                    {address.label || address.fullName || customerName}
                  </span>
                  {isSelected && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#2563eb] text-white text-[11px] font-semibold shrink-0">
                      <Icon name="check_circle" className="text-[12px]" />
                      {t('customers_address_default')}
                    </span>
                  )}
                </div>
                <span className="text-[13px] text-[#565e74] dark:text-slate-300">{formatAddress(address) || '—'}</span>
                {address.phone && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-[#565e74] dark:text-slate-400">
                    <Icon name="call" className="text-[14px]" />
                    {address.phone}
                  </span>
                )}
                {address.what3words && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-[#565e74] dark:text-slate-400">
                    <Icon name="pin_drop" className="text-[14px]" />
                    {address.what3words}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
