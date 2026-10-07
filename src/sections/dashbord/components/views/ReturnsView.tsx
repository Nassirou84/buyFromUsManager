import useLocales from '@/locales/use-locales';
import React from 'react';

export const ReturnsView: React.FC = () => {
  const { t } = useLocales();

  const rmas = [
    {
      id: 'RMA-9041',
      orderNumber: '#ORD-2024-8898',
      customer: 'Charlotte Dubois',
      reason: t('rma_reason_wrong_size'),
      status: t('rma_status_processed_refunded'),
      amount: '$165.00',
      carrier: 'La Poste International',
      action: t('rma_action_inventory_returned')
    },
    {
      id: 'RMA-9040',
      orderNumber: '#ORD-2024-8842',
      customer: 'Julian Vance',
      reason: t('rma_reason_stitching_defect'),
      status: t('rma_status_under_review'),
      amount: '$345.00',
      carrier: 'FedEx Ground #789021',
      action: t('rma_action_awaiting_claim')
    }
  ];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="text-[11px] font-bold text-[#004ac6] dark:text-blue-400 uppercase tracking-wider mb-1">
          {t('operations_reverse_logistics')}
        </div>
        <h1 className="text-2xl font-bold text-[#0b1c30] dark:text-white">
          {t('returns_rmas_management')}
        </h1>
        <p className="text-[13px] text-[#565e74] dark:text-slate-400 mt-1">
          {t('returns_subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#131b2e] p-5 rounded-xl border border-[#e5eeff] dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-bold text-[#565e74] uppercase">{t('pending_inspections')}</span>
          <div className="text-2xl font-bold text-[#0b1c30] dark:text-white mt-2">{t('cases_count', { count: 2 })}</div>
          <span className="text-xs text-amber-600 font-semibold mt-1 block">{t('review_sla')}</span>
        </div>
        <div className="bg-white dark:bg-[#131b2e] p-5 rounded-xl border border-[#e5eeff] dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-bold text-[#565e74] uppercase">{t('supplier_refund_claims')}</span>
          <div className="text-2xl font-bold text-[#004ac6] dark:text-blue-400 mt-2">$510.00</div>
          <span className="text-xs text-slate-500 mt-1 block">{t('recovered_from_sellers')}</span>
        </div>
        <div className="bg-white dark:bg-[#131b2e] p-5 rounded-xl border border-[#e5eeff] dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-bold text-[#565e74] uppercase">{t('net_return_rate')}</span>
          <div className="text-2xl font-bold text-emerald-600 mt-2">1.18%</div>
          <span className="text-xs text-slate-500 mt-1 block">{t('below_luxury_average')}</span>
        </div>
      </div>

      <div className="bg-white dark:bg-[#131b2e] rounded-xl border border-[#e5eeff] dark:border-slate-800 overflow-hidden shadow-2xs">
        <div className="p-4 bg-[#eff4ff]/60 dark:bg-slate-800/60 border-b border-[#e5eeff] dark:border-slate-700 font-bold text-sm text-[#0b1c30] dark:text-white">
          {t('active_return_queue')}
        </div>
        <div className="divide-y divide-[#f0f4ff] dark:divide-slate-800">
          {rmas.map((r) => (
            <div key={r.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-[#004ac6]">{r.id}</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{r.orderNumber}</span>
                  <span className="text-xs text-slate-500">• {r.customer}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{t('reason_label', { reason: r.reason })}</p>
                <div className="text-[11px] text-slate-400 mt-0.5">{r.action}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-sm text-slate-900 dark:text-white">{r.amount}</span>
                <span className="px-2 py-0.5 bg-[#eff4ff] text-[#004ac6] text-xs font-bold rounded">
                  {r.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
