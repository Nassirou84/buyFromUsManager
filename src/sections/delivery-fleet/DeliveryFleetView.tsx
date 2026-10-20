import useLocales from '@/locales/use-locales';
import React from 'react';

export const DeliveryFleetView: React.FC = () => {
  const { t } = useLocales();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="text-[11px] font-bold text-[#004ac6] dark:text-blue-400 uppercase tracking-wider mb-1">
          {t('ops_last_mile')}
        </div>
        <h1 className="text-2xl font-bold text-[#0b1c30] dark:text-white">
          {t('delivery_logistics_fleet')}
        </h1>
        <p className="text-[13px] text-[#565e74] dark:text-slate-400 mt-1">
          {t('delivery_subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#131b2e] p-5 rounded-xl border border-[#e5eeff] dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-[#0b1c30] dark:text-white">{t('dhl_express_hub')}</span>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded">{t('active_api')}</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">{t('dhl_next_pickup')}</p>
          <div className="mt-3 text-xs font-semibold text-[#004ac6]">{t('packages_ready_scan', { count: 84 })}</div>
        </div>

        <div className="bg-white dark:bg-[#131b2e] p-5 rounded-xl border border-[#e5eeff] dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-[#0b1c30] dark:text-white">{t('fedex_priority_fleet')}</span>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded">{t('active_api')}</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">{t('fedex_dispatch_status')}</p>
          <div className="mt-3 text-xs font-semibold text-[#004ac6]">{t('dispatches_in_transit', { count: 32 })}</div>
        </div>

        <div className="bg-white dark:bg-[#131b2e] p-5 rounded-xl border border-[#e5eeff] dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-[#0b1c30] dark:text-white">{t('london_gateway_courier')}</span>
            <span className="px-2 py-0.5 bg-blue-100 text-[#004ac6] text-xs font-bold rounded">{t('eu_uk_hub')}</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">{t('customs_clearance')}</p>
          <div className="mt-3 text-xs font-semibold text-[#004ac6]">{t('next_daylight_dispatch', { hours: 4 })}</div>
        </div>
      </div>
    </div>
  );
};
