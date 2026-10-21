import useLocales from '@/locales/use-locales';
import React from 'react';
import { Icon } from '@/components/lucide-icon';
import { PromoCode } from '@/types/marketing';

interface PromoAnalyticsModalProps {
  promo: PromoCode | null;
  onClose: () => void;
}

export const PromoAnalyticsModal: React.FC<PromoAnalyticsModalProps> = ({ promo, onClose }) => {
  const { t } = useLocales();

  if (!promo) return null;

  const claimPercent = promo.maxClaims
    ? Math.min(100, Math.round((promo.currentClaims / promo.maxClaims) * 100))
    : 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#131b2e] rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-[#e5eeff] dark:border-gray-700 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 bg-[#eff4ff] dark:bg-gray-800/80 flex items-center justify-between border-b border-[#e5eeff] dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#004ac6] flex items-center justify-center text-white shadow-xs">
              <Icon name="query_stats" className="text-[20px]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-[#dbe1ff] text-[#004ac6] font-bold text-xs uppercase tracking-wider rounded">
                  {promo.code}
                </span>
                <span className="text-xs font-semibold text-gray-500">{t('promo_analytics_title')}</span>
              </div>
              <h3 className="font-semibold text-base text-[#0b1c30] dark:text-white mt-0.5">
                {promo.campaignLabel}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#565e74] dark:text-gray-400 hover:text-[#0b1c30] dark:hover:text-white rounded-lg transition-colors"
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        {/* Analytics Body */}
        <div className="p-6 flex flex-col gap-6">
          {/* 3 Metric Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-[#eff4ff] dark:bg-gray-800/60 rounded-xl border border-[#e5eeff] dark:border-gray-700">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-gray-500">
                {t('promo_attributed_revenue')}
              </span>
              <div className="text-2xl font-bold text-[#0b1c30] dark:text-white mt-1">
                ${(promo.revenueGenerated || 42800).toLocaleString()}.00
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                <Icon name="trending_up" className="text-[14px]" /> {t('promo_vs_prior')}
              </span>
            </div>

            <div className="p-4 bg-[#eff4ff] dark:bg-gray-800/60 rounded-xl border border-[#e5eeff] dark:border-gray-700">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-gray-500">
                {t('promo_claim_conversion')}
              </span>
              <div className="text-2xl font-bold text-[#0b1c30] dark:text-white mt-1">
                {promo.conversionRate || 92.4}%
              </div>
              <span className="text-[11px] text-blue-600 font-semibold flex items-center gap-1 mt-1">
                {t('promo_high_intent')}
              </span>
            </div>

            <div className="p-4 bg-[#eff4ff] dark:bg-gray-800/60 rounded-xl border border-[#e5eeff] dark:border-gray-700">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-gray-500">
                {t('promo_total_claims')}
              </span>
              <div className="text-2xl font-bold text-[#0b1c30] dark:text-white mt-1">
                {promo.currentClaims}
                <span className="text-sm font-normal text-gray-500">
                  {promo.maxClaims ? ` / ${promo.maxClaims}` : ` (${t('promo_unlimited')})`}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-[#004ac6] h-full rounded-full"
                  style={{ width: `${claimPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Breakdown */}
          <div className="border border-gray-100 dark:border-gray-700 rounded-xl p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0b1c30] dark:text-white mb-3">
              {t('promo_audience_performance')}
            </h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500">{t('promo_discount_structure')}</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{promo.discountDisplay}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500">{t('promo_min_basket_req')}</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {promo.minSpend ? `$${promo.minSpend.toFixed(2)}` : t('promo_none')}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500">{t('promo_aov')}</span>
                <span className="font-semibold text-emerald-600 font-mono">{t('promo_aov_value')}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-gray-500">{t('promo_retention')}</span>
                <span className="font-semibold text-blue-600">{t('promo_retention_value')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-[#e5eeff] dark:border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#004ac6] text-white text-xs font-semibold rounded-lg hover:bg-[#2563eb] transition-colors"
          >
            {t('promo_close_report')}
          </button>
        </div>
      </div>
    </div>
  );
};
