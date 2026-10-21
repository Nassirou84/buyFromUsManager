import useLocales from '@/locales/use-locales';
import React from 'react';
import { Icon } from '@/components/lucide-icon';
import { ScraperChannelStats } from '../types';

interface ScraperThroughputCardsProps {
  channels: ScraperChannelStats[];
  onManageProxies: () => void;
}

export const ScraperThroughputCards: React.FC<ScraperThroughputCardsProps> = ({
  channels,
  onManageProxies,
}) => {
  const { t } = useLocales();
  return (
    <div className="bg-white dark:bg-[#131b2e] rounded-xl border border-[#e5eeff] dark:border-slate-800 p-5 shadow-2xs flex flex-col justify-between">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-[17px] font-bold text-[#0b1c30] dark:text-white tracking-tight">
              {t('connected_channels_throughput')}
            </h2>
            <p className="text-[12px] text-[#565e74] dark:text-slate-400 mt-0.5">
              {t('crawler_concurrency_desc')}
            </p>
          </div>

          <button
            type="button"
            onClick={onManageProxies}
            className="text-[12.5px] font-semibold text-[#004ac6] dark:text-blue-400 hover:text-[#003ea8] flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>{t('manage_proxies_api_keys')}</span>
            <Icon name="arrow_forward" className="text-[16px]"/>
          </button>
        </div>

        {/* 3 Channels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {channels.map((ch) => (
            <div
              key={ch.id}
              className="bg-[#eff4ff]/60 dark:bg-slate-800/60 p-4 rounded-xl border border-[#dce9ff] dark:border-slate-700/80 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="font-bold text-[13.5px] text-[#0b1c30] dark:text-white truncate">
                    {ch.name}
                  </span>
                  <span className="px-1.5 py-0.5 bg-[#dbe1ff] dark:bg-blue-900/60 text-[#004ac6] dark:text-blue-300 text-[10px] font-mono font-bold rounded">
                    {ch.badge}
                  </span>
                </div>

                <div className="mt-2">
                  <div className="flex items-center justify-between text-[11.5px] mb-1">
                    <span className="text-[#565e74] dark:text-slate-400">{t('rate_limit_used')}</span>
                    <span className="font-bold text-[#0b1c30] dark:text-white">
                      {ch.rateLimitUsed}% ({ch.rateLimitStatus})
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#dce9ff] dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="bg-[#004ac6] dark:bg-blue-500 h-full rounded-full transition-all"
                      style={{ width: `${ch.rateLimitUsed}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2.5 border-t border-[#dce9ff] dark:border-slate-700 flex items-center justify-between text-[11px]">
                <span className="font-semibold text-[#0b1c30] dark:text-white">
                  {t('active_skus', { count: ch.activeSkus })}
                </span>
                <span className="font-bold text-[#004ac6] dark:text-blue-400">
                  {t('success_rate', { rate: ch.successRate })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
