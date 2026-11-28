import React from 'react';
import useLocales from '@/locales/use-locales';
import { type RmaStatus } from '../../types';
import { STATUS_LABEL_KEYS, getStatusBadgeClass } from '../../shared';

interface StatusBadgeProps {
  status: RmaStatus;
  /** Show a pulsing dot while the return sits in the inspection bay. */
  pulse?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, pulse = false }) => {
  const { t } = useLocales();
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1.5 shrink-0 ${getStatusBadgeClass(status)}`}
    >
      {pulse && status === 'inspected' && (
        <span className="w-1.5 h-1.5 rounded-full bg-[#bc4800] animate-pulse"></span>
      )}
      {t(STATUS_LABEL_KEYS[status])}
    </span>
  );
};
