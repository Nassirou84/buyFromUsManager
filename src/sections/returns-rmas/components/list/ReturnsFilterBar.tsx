import React from 'react';
import useLocales from '@/locales/use-locales';
import { Icon } from '@/components/lucide-icon';
import { PRODUCT_RETURN_STATUSES, type RefundType } from '@/api/returns/get-product-returns';
import { type RmaStatus } from '../../types';
import { CARD, STATUS_LABEL_KEYS } from '../../shared';

export type StatusTab = 'All' | RmaStatus;
export type RefundFilter = 'all' | RefundType;

const STATUS_TABS: { key: StatusTab; labelKey: string }[] = [
  { key: 'All', labelKey: 'rma_tab_all' },
  ...PRODUCT_RETURN_STATUSES.map((status) => ({ key: status, labelKey: STATUS_LABEL_KEYS[status] })),
];

// Refund-type filter (maps to the backend `refundtype` exact filter).
const REFUND_TYPE_OPTIONS: { value: RefundFilter; labelKey: string }[] = [
  { value: 'all', labelKey: 'rma_refund_type_all' },
  { value: 'refund', labelKey: 'rma_refund_type_refund' },
  { value: 'credit', labelKey: 'rma_refund_type_credit' },
];

interface ReturnsFilterBarProps {
  activeTab: StatusTab;
  onTabChange: (tab: StatusTab) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  refundFilter: RefundFilter;
  onRefundFilterChange: (value: RefundFilter) => void;
}

// Status segments, search field and refund-type select.
export const ReturnsFilterBar: React.FC<ReturnsFilterBarProps> = ({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  refundFilter,
  onRefundFilterChange,
}) => {
  const { t } = useLocales();

  return (
    <div className={`${CARD} p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4`}>
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 xl:pb-0">
        {STATUS_TABS.map(({ key, labelKey }) => {
          const isActive = activeTab === key;
          const isInspection = key === 'inspected';
          const isRejected = key === 'rejected';
          return (
            <button
              key={key}
              onClick={() => onTabChange(key)}
              className={`px-3.5 py-1.5 rounded-lg text-[12px] font-semibold flex items-center gap-1.5 shrink-0 transition-all ${
                isActive
                  ? isInspection
                    ? 'bg-[#bc4800] text-white'
                    : isRejected
                    ? 'bg-[#ba1a1a] text-white'
                    : 'bg-[#2563eb] text-white'
                  : `bg-[#eff4ff] dark:bg-slate-800 hover:bg-[#e5eeff] dark:hover:bg-slate-700 ${
                      isInspection ? 'text-[#bc4800]' : 'text-[#0b1c30] dark:text-slate-200'
                    }`
              }`}
              type="button"
            >
              {isInspection && <span className="w-1.5 h-1.5 rounded-full bg-[#bc4800]"></span>}
              <span>{t(labelKey)}</span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 flex-wrap xl:flex-nowrap">
        <div className="relative min-w-[240px] flex-1">
          <Icon name="search" className="text-[18px] absolute left-2.5 top-1/2 -translate-y-1/2 text-[#737686]" />
          <input
            className="w-full h-9 pl-8 pr-3 bg-[#eff4ff] dark:bg-slate-800 text-[13px] text-[#0b1c30] dark:text-white placeholder:text-[#737686] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2563eb] transition-colors"
            placeholder={t('rma_search_placeholder')}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <select
          value={refundFilter}
          onChange={(e) => onRefundFilterChange(e.target.value as RefundFilter)}
          aria-label={t('rma_refund_type_label')}
          className="h-9 px-2.5 bg-[#eff4ff] dark:bg-slate-800 text-[#0b1c30] dark:text-white text-[12px] rounded-lg focus:outline-none cursor-pointer border-none"
        >
          {REFUND_TYPE_OPTIONS.map(({ value, labelKey }) => (
            <option key={value} value={value}>
              {t(labelKey)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
