import useLocales from '@/locales/use-locales';
import React from 'react';
import { Icon } from '@/components/lucide-icon';

export const ScraperTicker: React.FC = () => {
  const { t } = useLocales();

  return (
    <div className="w-full bg-[#eff4ff] dark:bg-slate-800/80 border border-[#dce9ff] dark:border-slate-700 rounded-xl p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#dbe1ff] dark:bg-blue-900/50 flex items-center justify-center text-[#004ac6] dark:text-blue-300 flex-shrink-0">
          <Icon name="sync" className="text-[19px] animate-spin" style={{ animationDuration: '6s' }}/>
        </div>
        <div className="text-[13px] leading-relaxed">
          <span className="font-bold text-[#0b1c30] dark:text-white mr-1.5">
            {t('active_scraping_engine')}
          </span>
          <span className="text-[#434655] dark:text-slate-300">
            {t('scraper_ticker_desc', { total: '1,482', minutes: 15 })}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end md:self-auto flex-shrink-0">
        <span className="text-[11px] uppercase tracking-wider font-bold text-[#565e74] dark:text-slate-400">
          {t('sync_health')}
        </span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-slate-900 border border-[#dce9ff] dark:border-slate-700 text-[#004ac6] dark:text-blue-300 text-[11.5px] font-bold rounded-lg shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-[#004ac6] animate-pulse"></span>
          {t('operational', { rate: '99.2' })}
        </span>
      </div>
    </div>
  );
};
