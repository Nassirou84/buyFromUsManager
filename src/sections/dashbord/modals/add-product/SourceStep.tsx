import React from 'react';
import useLocales from '@/locales/use-locales';
import { Icon } from '@/components/lucide-icon';
import { Input } from '@/components/ui/input';
import { SECONDARY_BTN_CLASS } from './constants';

interface SourceStepProps {
  url: string;
  isScraping: boolean;
  hasError: boolean;
  onUrlChange: (url: string) => void;
  onScrape: () => void;
  onManual: () => void;
  onCancel: () => void;
}

export const SourceStep: React.FC<SourceStepProps> = ({
  url,
  isScraping,
  hasError,
  onUrlChange,
  onScrape,
  onManual,
  onCancel,
}) => {
  const { t } = useLocales();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <div className="flex gap-2 items-end">
          <Input
            label={t('source_listing_url')}
            containerClassName="flex-1 mb-0"
            type="text"
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && url.trim() && !isScraping) onScrape();
            }}
            placeholder={t('source_url_placeholder')}
          />
          <button
            type="button"
            onClick={onScrape}
            disabled={isScraping || !url.trim()}
            className="px-4 h-11 bg-[#004ac6] hover:bg-[#003ea8] text-white text-[13px] font-semibold rounded-lg flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer shadow-xs"
          >
            <Icon name={isScraping ? 'sync' : 'bolt'} className="text-[17px]" />
            <span>{isScraping ? t('extracting') : t('scrape_listing')}</span>
          </button>
        </div>
        {hasError && <p className="text-[12px] text-red-600 dark:text-red-400">{t('scrape_failed')}</p>}
      </div>

      <div className="p-8 border-2 border-dashed border-[#dce9ff] dark:border-slate-700 rounded-xl text-center flex flex-col items-center justify-center text-[#565e74] dark:text-slate-400 min-h-[180px]">
        <Icon name="travel_explore" className="text-[36px] text-[#004ac6] dark:text-blue-400 mb-2" />
        <span className="font-bold text-[14px] text-[#0b1c30] dark:text-white">{t('step1_scrape')}</span>
        <p className="text-[12px] max-w-sm mt-1">{t('step1_desc')}</p>
      </div>

      <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#f0f4ff] dark:border-slate-800">
        <button
          type="button"
          onClick={onManual}
          className="text-[12.5px] text-[#004ac6] dark:text-blue-400 hover:underline font-semibold cursor-pointer"
        >
          {t('skip_enter_manually')}
        </button>
        <button type="button" onClick={onCancel} className={SECONDARY_BTN_CLASS}>
          {t('cancel')}
        </button>
      </div>
    </div>
  );
};
