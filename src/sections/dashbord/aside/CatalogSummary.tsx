import useLocales from '@/locales/use-locales';
import React from 'react';
import { Icon } from '@/components/lucide-icon';

interface CatalogKpiCardsProps {
  productSummary: {
    count: number;
    amazon: number;
    ebay: number;
    other: number;
    unavailable: number;
    recently_updated: number;
  };
  markupSummary: {
    average: number;
    lowest: number;
    highest: number;
  };
  onFilterAlerts: () => void;
  onFilterChannel: (channel: 'all' | 'amazon' | 'ebay' | 'direct') => void;
}

export const CatalogSummary: React.FC<CatalogKpiCardsProps> = ({
  productSummary,
  markupSummary,
  onFilterAlerts,
  onFilterChannel,
}) => {
  const { t } = useLocales();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: {t('total_dropship_products')} */}
      <div
        onClick={() => onFilterChannel('all')}
        className="bg-white dark:bg-[#131b2e] p-5 rounded-xl border border-[#e5eeff] dark:border-slate-800 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between cursor-pointer"
      >
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#565e74] dark:text-slate-400">
              {t('total_storefront_products')}
            </span>
            <span className="p-1.5 rounded-lg bg-[#eff4ff] dark:bg-blue-950/60 text-[#004ac6] dark:text-blue-300">
              <Icon name="shopping_bag" className="text-[19px]" />
            </span>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#0b1c30] dark:text-white tracking-tight">
              {productSummary.count.toLocaleString()}
            </span>
            <span className="text-[12.5px] font-bold text-[#004ac6] dark:text-blue-400 flex items-center gap-0.5">
              {t('up_active')}
            </span>
          </div>
          <p className="text-[12px] text-[#565e74] dark:text-slate-400 mt-1">
            {t('across_channels', { count: 3 })}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-[#f0f4ff] dark:border-slate-800 flex items-center justify-between text-[11px] text-[#565e74] dark:text-slate-400">
          <div>
            <span className="font-bold text-[#0b1c30] dark:text-white mr-1">{productSummary.amazon}</span>
            <span>Amazon</span>
          </div>
          <div className="border-l border-[#e5eeff] dark:border-slate-700 pl-2">
            <span className="font-bold text-[#0b1c30] dark:text-white mr-1">{productSummary.ebay}</span>
            <span>eBay</span>
          </div>
          <div className="border-l border-[#e5eeff] dark:border-slate-700 pl-2">
            <span className="font-bold text-[#0b1c30] dark:text-white mr-1">{productSummary.other}</span>
            <span>{t('direct')}</span>
          </div>
        </div>
      </div>

      {/* Card 2: {t('active_scraper_sync')} */}
      <div className="bg-white dark:bg-[#131b2e] p-5 rounded-xl border border-[#e5eeff] dark:border-slate-800 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#565e74] dark:text-slate-400">
              {t('active_scraper_sync')}
            </span>
            <span className="p-1.5 rounded-lg bg-[#eff4ff] dark:bg-blue-950/60 text-[#004ac6] dark:text-blue-300">
              <Icon name="hub" className="text-[19px]" />
            </span>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#004ac6] dark:text-blue-400 tracking-tight">
              99.2%
            </span>
            <span className="px-2 py-0.5 bg-[#dce9ff] dark:bg-blue-950 text-[#004ac6] dark:text-blue-300 font-bold text-[11px] rounded-full">
              {t('healthy')}
            </span>
          </div>
          <p className="text-[12px] text-[#565e74] dark:text-slate-400 mt-1">
            {t('avg_crawl_interval')} <span className="font-semibold text-[#0b1c30] dark:text-slate-200">{t('mins_15', { count: 15 })}</span>
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-[#f0f4ff] dark:border-slate-800 flex items-center justify-between text-[11px] text-[#565e74] dark:text-slate-400">
          <span>{t('proxy_rotation')}</span>
          <span className="font-bold text-[#004ac6] dark:text-blue-400">
            {t('residential_ips', { count: 120 })}
          </span>
        </div>
      </div>

      {/* Card 3: Price & Margin Tracker */}
      <div className="bg-white dark:bg-[#131b2e] p-5 rounded-xl border border-[#e5eeff] dark:border-slate-800 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#565e74] dark:text-slate-400">
              {t('price_margin_tracker')}
            </span>
            <span className="p-1.5 rounded-lg bg-[#eff4ff] dark:bg-blue-950/60 text-[#004ac6] dark:text-blue-300">
              <Icon name="percent" className="text-[19px]" />
            </span>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#0b1c30] dark:text-white tracking-tight">
              {markupSummary.average}%
            </span>
            <span className="text-[12px] font-bold text-[#004ac6] dark:text-blue-400">
              {t('highest', { value: markupSummary.highest })}
            </span>
          </div>
          <p className="text-[12px] text-[#565e74] dark:text-slate-400 mt-1">
            {t('lowest', { value: markupSummary.lowest })}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-[#f0f4ff] dark:border-slate-800 flex items-center text-[11px] text-[#565e74] dark:text-slate-400">
          {t('rule')} <span className="font-semibold text-[#0b1c30] dark:text-slate-200 ml-2">{t('rule_cost_plus')}</span>
        </div>
      </div>

      {/* Card 4: Supplier Stock & Alerts */}
      <div
        onClick={onFilterAlerts}
        className="bg-white dark:bg-[#131b2e] p-5 rounded-xl border border-[#ffdbcd] dark:border-amber-900/40 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between cursor-pointer group"
      >
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#bc4800] dark:text-amber-400">
              {t('supplier_stock_alerts')}
            </span>
            <span className="p-1.5 rounded-lg bg-[#ffede6] dark:bg-amber-950/60 text-[#bc4800] dark:text-amber-400">
              <Icon name="notifications_active" className="text-[19px]" />
            </span>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#bc4800] dark:text-amber-400 tracking-tight">
              {productSummary.unavailable}
            </span>
            <span className="px-2 py-0.5 bg-[#ffdbcd] dark:bg-amber-950 text-[#943700] dark:text-amber-300 font-bold text-[11px] rounded">
              {t('marked_as_unavailable')}
            </span>
          </div>
          <p className="text-[12px] text-[#565e74] dark:text-slate-400 mt-1">
            <span className="font-semibold text-[#bc4800] dark:text-amber-400">{t('price_shifts', { count: productSummary.recently_updated })}</span> • {t('for_the_last_7_days')}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-[#ffede6] dark:border-slate-800 flex items-center justify-between text-[11px]">
          <span className="text-[#bc4800] dark:text-amber-400 font-medium">{t('reprice_pending')}</span>
          <span className="font-bold text-[#565e74] dark:text-slate-300">
            {t('auto_adjusting')}
          </span>
        </div>
      </div>
    </div>
  );
};
