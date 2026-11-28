import React from 'react';
import { toast } from 'sonner';
import useLocales from '@/locales/use-locales';
import { Icon } from '@/components/lucide-icon';

const HEADER_BUTTON =
  'flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-[#131b2e] hover:bg-[#eff4ff] dark:hover:bg-slate-800 text-[#0b1c30] dark:text-white text-[13px] rounded-lg shadow-2xs transition-all border border-[#e5eeff] dark:border-slate-700 font-medium';

// Command header & breadcrumb strip.
export const ReturnsHeader: React.FC = () => {
  const { t } = useLocales();

  return (
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
        <button onClick={() => toast.success(t('rma_toast_export'))} className={HEADER_BUTTON} type="button">
          <Icon name="file_download" className="text-[18px]" />
          <span>{t('rma_export_report')}</span>
        </button>
        <button onClick={() => toast.info(t('rma_toast_batch'))} className={HEADER_BUTTON} type="button">
          <Icon name="fact_check" className="text-[18px]" />
          <span>{t('rma_batch_inspection')}</span>
        </button>
      </div>
    </div>
  );
};
