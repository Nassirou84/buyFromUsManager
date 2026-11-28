import React from 'react';
import useLocales from '@/locales/use-locales';
import { type RmaItem } from '../../types';
import { CARD, SECTION_LABEL, getRefundTypeLabelKey } from '../../shared';
import { ReturnTracking } from './ReturnTracking';

const SummaryField: React.FC<{ label: string; value: React.ReactNode; truncate?: boolean }> = ({
  label,
  value,
  truncate = false,
}) => (
  <div className="flex flex-col">
    <span className="text-[11px] text-[#565e74] dark:text-slate-400">{label}</span>
    <span className={`text-[13px] text-[#0b1c30] dark:text-white font-semibold ${truncate ? 'truncate' : ''}`}>
      {value}
    </span>
  </div>
);

interface ReturnSummaryCardProps {
  rma: RmaItem;
}

// Summary card: customer, refund type, created date, then the lifecycle tracker.
export const ReturnSummaryCard: React.FC<ReturnSummaryCardProps> = ({ rma }) => {
  const { t } = useLocales();

  return (
    <div className={`${CARD} p-5 flex flex-col gap-4`}>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#eff4ff]/60 dark:bg-slate-800/60 p-4 rounded-lg">
        <SummaryField label={t('rma_customer_details')} value={rma.customerEmail} truncate />
        <SummaryField label={t('rma_refund_type_label')} value={t(getRefundTypeLabelKey(rma.refundType))} />
        <SummaryField label={t('rma_created_label')} value={rma.createdAtStr} />
      </div>

      <div className="pt-2">
        <span className={`${SECTION_LABEL} block mb-4`}>{t('rma_lifecycle')}</span>
        <ReturnTracking status={rma.status} />
      </div>
    </div>
  );
};
