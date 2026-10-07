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

export const PromotionsView: React.FC = () => {
  const { t } = useLocales();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="text-[11px] font-bold text-[#004ac6] dark:text-blue-400 uppercase tracking-wider mb-1">
          {t('marketing_campaigns')}
        </div>
        <h1 className="text-2xl font-bold text-[#0b1c30] dark:text-white">
          {t('promotions_coupons_title')}
        </h1>
        <p className="text-[13px] text-[#565e74] dark:text-slate-400 mt-1">
          {t('promotions_subtitle')}
        </p>
      </div>

      <div className="bg-white dark:bg-[#131b2e] p-5 rounded-xl border border-[#e5eeff] dark:border-slate-800 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <span className="font-bold text-sm text-[#0b1c30] dark:text-white">{t('active_campaigns')}</span>
          <button className="px-3 py-1.5 bg-[#004ac6] text-white text-xs font-semibold rounded-lg">
            {t('new_promo_code')}
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          <div className="py-3 flex items-center justify-between">
            <div>
              <span className="font-mono font-bold text-sm text-[#004ac6]">ATELIER15</span>
              <p className="text-slate-500">{t('promo_atelier15')}</p>
            </div>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded">{t('active')}</span>
          </div>
          <div className="py-3 flex items-center justify-between">
            <div>
              <span className="font-mono font-bold text-sm text-[#004ac6]">VIPWELCOME</span>
              <p className="text-slate-500">{t('promo_vipwelcome')}</p>
            </div>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded">{t('active')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const BannersView: React.FC = () => {
  const { t } = useLocales();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="text-[11px] font-bold text-[#004ac6] dark:text-blue-400 uppercase tracking-wider mb-1">
          {t('marketing_merchandising')}
        </div>
        <h1 className="text-2xl font-bold text-[#0b1c30] dark:text-white">
          {t('banners_merchandising_title')}
        </h1>
        <p className="text-[13px] text-[#565e74] dark:text-slate-400 mt-1">
          {t('banners_subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#131b2e] p-5 rounded-xl border border-[#e5eeff] dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-bold uppercase text-slate-500">{t('hero_runway_showcase')}</span>
          <h3 className="font-bold text-base text-[#0b1c30] dark:text-white mt-1">{t('autumn_winter_atelier')}</h3>
          <p className="text-xs text-slate-500 mt-1">{t('connected_to_category')}</p>
          <div className="mt-3 px-2 py-1 bg-[#eff4ff] text-[#004ac6] font-semibold text-xs rounded inline-block">
            {t('conversion_rate', { rate: 4.8 })}
          </div>
        </div>

        <div className="bg-white dark:bg-[#131b2e] p-5 rounded-xl border border-[#e5eeff] dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-bold uppercase text-slate-500">{t('top_header_ribbon')}</span>
          <h3 className="font-bold text-base text-[#0b1c30] dark:text-white mt-1">{t('complimentary_courier')}</h3>
          <p className="text-xs text-slate-500 mt-1">{t('applies_worldwide')}</p>
          <div className="mt-3 px-2 py-1 bg-emerald-50 text-emerald-700 font-semibold text-xs rounded inline-block">
            {t('active_storefront')}
          </div>
        </div>
      </div>
    </div>
  );
};

export const UsersRolesView: React.FC = () => {
  const { t } = useLocales();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="text-[11px] font-bold text-[#004ac6] dark:text-blue-400 uppercase tracking-wider mb-1">
          {t('admin_access_control')}
        </div>
        <h1 className="text-2xl font-bold text-[#0b1c30] dark:text-white">
          {t('users_roles_title')}
        </h1>
        <p className="text-[13px] text-[#565e74] dark:text-slate-400 mt-1">
          {t('users_subtitle')}
        </p>
      </div>

      <div className="bg-white dark:bg-[#131b2e] rounded-xl border border-[#e5eeff] dark:border-slate-800 overflow-hidden shadow-2xs">
        <div className="p-4 bg-[#eff4ff]/60 border-b border-[#e5eeff] flex justify-between items-center">
          <span className="font-bold text-sm text-[#0b1c30]">{t('admin_team_roster')}</span>
          <button className="px-3 py-1.5 bg-[#004ac6] text-white text-xs font-semibold rounded-lg">
            {t('invite_operator')}
          </button>
        </div>
        <div className="divide-y divide-slate-100 text-xs">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#004ac6] text-white font-bold flex items-center justify-center">
                ER
              </div>
              <div>
                <span className="font-bold text-slate-900 block">Elena Rostova</span>
                <span className="text-slate-500">elena.rostova@flotboutique.com</span>
              </div>
            </div>
            <span className="px-2 py-0.5 bg-blue-50 text-[#004ac6] font-bold rounded">{t('head_of_operations')}</span>
          </div>

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center">
                MC
              </div>
              <div>
                <span className="font-bold text-slate-900 block">Marcus Chen</span>
                <span className="text-slate-500">marcus@flotboutique.com</span>
              </div>
            </div>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold rounded">{t('concierge_dispatch_lead')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SettingsView: React.FC = () => {
  const { t } = useLocales();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="text-[11px] font-bold text-[#004ac6] dark:text-blue-400 uppercase tracking-wider mb-1">
          {t('admin_configuration')}
        </div>
        <h1 className="text-2xl font-bold text-[#0b1c30] dark:text-white">
          {t('platform_settings_title')}
        </h1>
        <p className="text-[13px] text-[#565e74] dark:text-slate-400 mt-1">
          {t('settings_subtitle')}
        </p>
      </div>

      <div className="bg-white dark:bg-[#131b2e] p-5 rounded-xl border border-[#e5eeff] dark:border-slate-800 shadow-2xs flex flex-col gap-4 max-w-2xl">
        <div>
          <label className="text-xs font-bold text-[#0b1c30] block mb-1">
            {t('supplier_scraping_frequency')}
          </label>
          <select className="w-full h-10 px-3 bg-slate-50 text-xs rounded-lg border border-slate-200">
            <option>{t('freq_15_min')}</option>
            <option>{t('freq_5_min')}</option>
            <option>{t('freq_hourly')}</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-[#0b1c30] block mb-1">
            {t('base_currency')}
          </label>
          <select className="w-full h-10 px-3 bg-slate-50 text-xs rounded-lg border border-slate-200">
            <option>{t('currency_usd')}</option>
            <option>{t('currency_eur')}</option>
            <option>{t('currency_gbp')}</option>
          </select>
        </div>

        <div className="pt-2">
          <button className="px-4 py-2 bg-[#004ac6] text-white text-xs font-bold rounded-lg shadow-sm">
            {t('save_platform_changes')}
          </button>
        </div>
      </div>
    </div>
  );
};
