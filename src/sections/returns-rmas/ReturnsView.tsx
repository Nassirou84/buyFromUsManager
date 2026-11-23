'use client';

import useLocales from '@/locales/use-locales';
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import { toast } from 'sonner';
import { Icon } from '@/components/lucide-icon';
import {
  PRODUCT_RETURN_STATUSES,
  PRODUCT_RETURNS_PAGE_SIZE,
  ProductReturnStatus,
  RefundType,
  useGetProductReturns,
} from '@/api/returns/get-product-returns';
import { RETURN_DETAIL_SEED_KEY } from '@/api/returns/get-product-return';
import { mapApiProductReturn } from './mapper';
import { RmaStatus } from './types';
import { CARD, SECTION_LABEL, STATUS_LABEL_KEYS, getStatusBadgeClass } from './shared';

type StatusTab = 'All' | RmaStatus;

const STATUS_TABS: { key: StatusTab; labelKey: string }[] = [
  { key: 'All', labelKey: 'rma_tab_all' },
  ...PRODUCT_RETURN_STATUSES.map((status) => ({ key: status, labelKey: STATUS_LABEL_KEYS[status] })),
];

// Refund-type filter (maps to the backend `refundtype` exact filter).
const REFUND_TYPE_OPTIONS: { value: 'all' | RefundType; labelKey: string }[] = [
  { value: 'all', labelKey: 'rma_refund_type_all' },
  { value: 'refund', labelKey: 'rma_refund_type_refund' },
  { value: 'credit', labelKey: 'rma_refund_type_credit' },
];

export const ReturnsView: React.FC = () => {
  const { t } = useLocales();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<StatusTab>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [refundFilter, setRefundFilter] = useState<'all' | RefundType>('all');
  const [page, setPage] = useState(1);

  const [debouncedSearch] = useDebounce(searchQuery, 400);

  // Any change to the filters narrows the result set, so the list goes back to the
  // first page whenever the search text, status tab or refund type changes.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, activeTab, refundFilter]);

  // Server-side filters map straight onto the backend collection filters:
  // `status` (exact), `refundtype` (exact) and `keyword` (partial on uid / order uid).
  const statusValues: ProductReturnStatus[] | undefined =
    activeTab === 'All' ? undefined : [activeTab];
  const refundType = refundFilter === 'all' ? undefined : refundFilter;
  const { data, isLoading, isFetching } = useGetProductReturns(
    page,
    statusValues,
    refundType,
    debouncedSearch.trim() || undefined,
  );

  const totalItems = data?.totalItems ?? 0;
  const rmas = useMemo(() => (data?.returns ?? []).map(mapApiProductReturn), [data]);

  // Page numbers with ellipsis: first, last, and a window around the current page.
  const totalPages = Math.max(1, Math.ceil(totalItems / PRODUCT_RETURNS_PAGE_SIZE));
  const rangeStart = totalItems === 0 ? 0 : (page - 1) * PRODUCT_RETURNS_PAGE_SIZE + 1;
  const rangeEnd = Math.min(rangeStart + rmas.length - 1, totalItems);

  const pageItems: (number | 'ellipsis-start' | 'ellipsis-end')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pageItems.push(i);
  } else {
    const start = Math.max(2, Math.min(page - 1, totalPages - 4));
    const end = Math.min(totalPages - 1, Math.max(page + 1, 5));
    pageItems.push(1);
    if (start > 2) pageItems.push('ellipsis-start');
    for (let i = start; i <= end; i++) pageItems.push(i);
    if (end < totalPages - 1) pageItems.push('ellipsis-end');
    pageItems.push(totalPages);
  }

  // Seed the clicked (already-mapped) return so the [uid] page paints instantly,
  // then navigate; the detail page still fetches the authoritative record by uid.
  const openReturn = (uid: string) => {
    const seed = rmas.find((r) => r.id === uid);
    if (seed) queryClient.setQueryData([RETURN_DETAIL_SEED_KEY, uid], seed);
    router.push(`/dashboard/returns-rmas/${uid}`);
  };

  const metrics = [
    {
      label: t('rma_metric_open_requests'),
      icon: 'assignment_return',
      iconBox: 'bg-[#eff4ff] dark:bg-slate-800 text-[#004ac6] dark:text-blue-400',
      value: '24',
      trend: (
        <span className="flex items-center gap-0.5 text-[#004ac6] dark:text-blue-400 text-[11px] font-semibold">
          <Icon name="trending_up" className="text-[14px]" />
          {t('rma_today_delta', { count: 3 })}
        </span>
      ),
      footLabel: t('rma_awaiting_dropoff'),
      footValue: t('rma_items_count', { count: 6 }),
      footClass: 'text-[#0b1c30] dark:text-white',
    },
    {
      label: t('rma_metric_quality_intake'),
      icon: 'verified',
      iconBox: 'bg-[#ffdbcd] text-[#943700]',
      value: '9',
      trend: (
        <span className="flex items-center gap-0.5 text-[#bc4800] text-[11px] font-semibold">
          <Icon name="schedule" className="text-[14px]" />
          {t('rma_bay_active')}
        </span>
      ),
      footLabel: t('rma_sla_breach_window'),
      footValue: t('rma_time_remaining', { time: '4h 12m' }),
      footClass: 'text-[#bc4800]',
    },
    {
      label: t('rma_metric_approved_refunds'),
      icon: 'payments',
      iconBox: 'bg-[#dae2fd] text-[#004ac6]',
      value: '$4,280',
      trend: (
        <span className="text-[#565e74] dark:text-slate-400 text-[11px]">{t('rma_items_count', { count: 14 })}</span>
      ),
      footLabel: t('rma_auto_payout'),
      footValue: t('rma_batch_rate', { rate: '98.2%' }),
      footClass: 'text-[#0b1c30] dark:text-white',
    },
    {
      label: t('rma_metric_health'),
      icon: 'query_stats',
      iconBox: 'bg-[#e5eeff] dark:bg-slate-800 text-[#004ac6] dark:text-blue-400',
      value: '1.8%',
      trend: (
        <span className="flex items-center gap-0.5 text-emerald-600 text-[11px] font-semibold">
          <Icon name="arrow_downward" className="text-[14px]" />
          {t('rma_mom', { value: '-0.3%' })}
        </span>
      ),
      footLabel: t('rma_primary_cause'),
      footValue: t('rma_sizing_fit_pct'),
      footClass: 'text-[#0b1c30] dark:text-white',
    },
  ];

  return (
    <div className="flex flex-col w-full gap-5">
      {/* Command header & breadcrumb strip */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1 text-[#565e74] dark:text-slate-400 text-[11px]">
            <span>{t('rma_breadcrumb_ops')}</span>
            <Icon name="chevron_right" className="text-[14px]" />
            <span className="text-[#004ac6] dark:text-blue-400 font-semibold">{t('rma_breadcrumb_returns')}</span>
            <Icon name="chevron_right" className="text-[14px]" />
            <span className="text-[#0b1c30] dark:text-white">{t('rma_breadcrumb_workbench')}</span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-[#0b1c30] dark:text-white tracking-tight">
              {t('rma_center_title')}
            </h1>
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-[#e5eeff] dark:bg-slate-800 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#004ac6] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#004ac6]"></span>
              </span>
              <span className="text-[11px] text-[#0b1c30] dark:text-slate-200 font-medium">
                {t('rma_pipeline_sla')}
              </span>
            </div>
          </div>

          <p className="text-[13px] text-[#565e74] dark:text-slate-400 max-w-2xl">{t('rma_center_desc')}</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => toast.success(t('rma_toast_export'))}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-[#131b2e] hover:bg-[#eff4ff] dark:hover:bg-slate-800 text-[#0b1c30] dark:text-white text-[13px] rounded-lg shadow-2xs transition-all border border-[#e5eeff] dark:border-slate-700 font-medium"
            type="button"
          >
            <Icon name="file_download" className="text-[18px]" />
            <span>{t('rma_export_report')}</span>
          </button>
          <button
            onClick={() => toast.info(t('rma_toast_batch'))}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-[#131b2e] hover:bg-[#eff4ff] dark:hover:bg-slate-800 text-[#0b1c30] dark:text-white text-[13px] rounded-lg shadow-2xs transition-all border border-[#e5eeff] dark:border-slate-700 font-medium"
            type="button"
          >
            <Icon name="fact_check" className="text-[18px]" />
            <span>{t('rma_batch_inspection')}</span>
          </button>
        </div>
      </div>

      {/* Operational metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className={`${CARD} p-4 flex flex-col justify-between`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className={SECTION_LABEL}>{m.label}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${m.iconBox}`}>
                <Icon name={m.icon} className="text-[18px]" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-1.5">
              <span className="text-[28px] text-[#0b1c30] dark:text-white font-bold leading-none">{m.value}</span>
              {m.trend}
            </div>
            <div className="flex items-center justify-between text-[#565e74] dark:text-slate-400 text-[11px] bg-[#eff4ff]/60 dark:bg-slate-800/60 px-2.5 py-1 rounded-md">
              <span>{m.footLabel}</span>
              <span className={`font-semibold ${m.footClass}`}>{m.footValue}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar & status segments */}
      <div className={`${CARD} p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4`}>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 xl:pb-0">
          {STATUS_TABS.map(({ key, labelKey }) => {
            const isActive = activeTab === key;
            const isInspection = key === 'inspected';
            const isRejected = key === 'rejected';
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
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
            <Icon
              name="search"
              className="text-[18px] absolute left-2.5 top-1/2 -translate-y-1/2 text-[#737686]"
            />
            <input
              className="w-full h-9 pl-8 pr-3 bg-[#eff4ff] dark:bg-slate-800 text-[13px] text-[#0b1c30] dark:text-white placeholder:text-[#737686] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2563eb] transition-colors"
              placeholder={t('rma_search_placeholder')}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            value={refundFilter}
            onChange={(e) => setRefundFilter(e.target.value as 'all' | RefundType)}
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

      {/* Return queue */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between px-1 py-0.5">
          <span className={SECTION_LABEL}>
            {t('rma_active_queue', { shown: rmas.length, total: totalItems })}
          </span>
          {isFetching && (
            <Icon name="progress_activity" className="text-[16px] text-[#565e74] dark:text-slate-400 animate-spin" />
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-[13px] text-[#565e74] dark:text-slate-400">
            <Icon name="progress_activity" className="text-[18px] animate-spin" />
            <span>{t('rma_loading')}</span>
          </div>
        ) : rmas.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-1.5 py-10 text-center">
            <Icon name="assignment_return" className="text-[28px] text-[#c3c6d7] dark:text-slate-600" />
            <span className="text-[13px] text-[#565e74] dark:text-slate-400">{t('rma_empty')}</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-2.5">
            {rmas.map((item) => (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() => openReturn(item.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openReturn(item.id);
                  }
                }}
                className="bg-white dark:bg-[#131b2e] p-4 rounded-xl transition-all cursor-pointer flex flex-col gap-2.5 border shadow-2xs border-[#e5eeff] dark:border-slate-800 hover:border-[#c3c6d7] dark:hover:border-slate-600 hover:shadow-md focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[15px] text-[#0b1c30] dark:text-white font-bold truncate">#{item.id}</span>
                    <span className="px-1.5 py-0.5 bg-[#eef2ff] dark:bg-slate-700 text-[#004ac6] dark:text-blue-300 text-[11px] rounded font-semibold shrink-0">
                      {t(item.refundType === 'credit' ? 'rma_refund_type_credit' : 'rma_refund_type_refund')}
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1.5 shrink-0 ${getStatusBadgeClass(item.status)}`}
                  >
                    {item.status === 'inspected' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#bc4800] animate-pulse"></span>
                    )}
                    {t(STATUS_LABEL_KEYS[item.status])}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 text-[12px]">
                  <span className="flex items-center gap-1.5 min-w-0 text-[#0b1c30] dark:text-white">
                    <Icon name="person" className="text-[14px] text-[#565e74] dark:text-slate-400 shrink-0" />
                    <span className="truncate font-medium" title={item.customerEmail}>{item.customerName}</span>
                  </span>
                  <span className="text-[#565e74] dark:text-slate-400 text-[11px] shrink-0">{item.createdAtStr}</span>
                </div>

                {item.orderRef && (
                  <div className="flex items-center gap-1.5 text-[11px] text-[#565e74] dark:text-slate-400">
                    <Icon name="receipt_long" className="text-[14px] shrink-0" />
                    <span className="truncate">{t('rma_order_number')}: {item.orderRef}</span>
                  </div>
                )}

                <div className="p-2.5 bg-[#eff4ff] dark:bg-slate-800 rounded-lg flex items-center gap-2.5">
                  {(() => {
                    const thumb = item.lines[0]?.productImage || item.lines[0]?.variantImage || '';
                    return thumb ? (
                      <img
                        className="w-10 h-10 object-cover rounded-md bg-slate-100 dark:bg-slate-700 shrink-0"
                        src={thumb}
                        alt={item.lines[0]?.title ?? ''}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-md bg-slate-100 dark:bg-slate-700 shrink-0 flex items-center justify-center text-[#c3c6d7] dark:text-slate-500">
                        <Icon name="inventory" className="text-[18px]" />
                      </div>
                    );
                  })()}
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[12px] text-[#0b1c30] dark:text-white font-semibold truncate">
                      {item.lines[0]?.title || t('rma_items_count', { count: item.itemCount })}
                    </span>
                    <span className="text-[11px] text-[#565e74] dark:text-slate-400 truncate">
                      {item.lines.length > 1
                        ? t('rma_items_count', { count: item.itemCount })
                        : item.lines[0]?.variantLabel || t('rma_items_count', { count: item.itemCount })}
                    </span>
                  </div>
                  <Icon name="chevron_right" className="text-[18px] text-[#c3c6d7] dark:text-slate-500 shrink-0" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PAGINATION — the loaded page is one slice of the server-side result set */}
        {!isLoading && totalItems > 0 && (
          <div className="mt-1 bg-white dark:bg-[#131b2e] px-4 py-3 rounded-xl border border-[#e5eeff] dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px]">
            <span className="text-[#565e74] dark:text-slate-400 whitespace-nowrap">
              {t('returns_showing_footer', { from: rangeStart, to: rangeEnd, total: totalItems })}
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                aria-label={t('returns_prev_page')}
                title={t('returns_prev_page')}
                className="p-1 rounded border border-[#c3c6d7] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0b1c30] dark:text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#eff4ff] dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <Icon name="chevron_left" className="text-[16px]" />
              </button>
              {pageItems.map((item) =>
                typeof item === 'number' ? (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setPage(item)}
                    aria-current={item === page ? 'page' : undefined}
                    className={
                      item === page
                        ? 'w-7 h-7 rounded bg-[#004ac6] text-white font-bold text-[12px] flex items-center justify-center shadow-xs cursor-pointer'
                        : 'w-7 h-7 rounded bg-white dark:bg-slate-800 border border-[#c3c6d7] dark:border-slate-700 hover:bg-[#eff4ff] dark:hover:bg-slate-700 text-[#0b1c30] dark:text-white text-[12px] flex items-center justify-center transition-colors cursor-pointer'
                    }
                  >
                    {item}
                  </button>
                ) : (
                  <span key={item} className="text-[#737686] px-0.5">...</span>
                )
              )}
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                aria-label={t('returns_next_page')}
                title={t('returns_next_page')}
                className="p-1 rounded border border-[#c3c6d7] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0b1c30] dark:text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#eff4ff] dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <Icon name="chevron_right" className="text-[16px]" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
