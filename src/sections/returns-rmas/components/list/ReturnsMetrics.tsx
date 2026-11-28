import React from 'react';
import useLocales from '@/locales/use-locales';
import { Icon } from '@/components/lucide-icon';
import { MetricCard, type MetricCardProps } from './MetricCard';

// Operational metrics strip.
export const ReturnsMetrics: React.FC = () => {
  const { t } = useLocales();

  const metrics: MetricCardProps[] = [
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
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m) => (
        <MetricCard key={m.label} {...m} />
      ))}
    </div>
  );
};
