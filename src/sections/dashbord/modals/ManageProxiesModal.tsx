import useLocales from '@/locales/use-locales';
import React from 'react';
import { Icon } from '@/components/lucide-icon';

interface ManageProxiesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ManageProxiesModal: React.FC<ManageProxiesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useLocales();

  if (!isOpen) return null;

  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#131b2e] rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#eff4ff] text-[#004ac6] flex items-center justify-center">
              <Icon name="vpn_key" className="text-[20px]"/>
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#0b1c30] dark:text-white">
                {t('proxies_scraper_gateways')}
              </h3>
              <p className="text-[12px] text-[#565e74] dark:text-slate-400">
                {t('proxies_desc')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600"
          >
            <Icon name="close" className="text-[20px]"/>
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {/* Proxy Pool */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-[#0b1c30] dark:text-white">
                {t('residential_proxy_pool')}
              </span>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10.5px] font-bold rounded">
                {t('active_ips', { count: 120 })}
              </span>
            </div>
            <p className="text-[12px] text-[#565e74] dark:text-slate-400">
              {t('proxy_rotation_desc', { count: 20 })}
            </p>
          </div>

          {/* Amazon API Credentials */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-[#0b1c30] dark:text-white">
                {t('amazon_paapi')}
              </span>
              <span className="px-2 py-0.5 bg-blue-100 text-[#004ac6] text-[10.5px] font-bold rounded">
                {t('rate_limit_pct', { value: 48 })}
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#737686]">
              {t('amazon_access_key', { key: 'AKIA••••••••••••92JA', region: 'us-west-2' })}
            </span>
          </div>

          {/* eBay Developer Keys */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-[#0b1c30] dark:text-white">
                {t('ebay_rest_api')}
              </span>
              <span className="px-2 py-0.5 bg-blue-100 text-[#004ac6] text-[10.5px] font-bold rounded">
                {t('rate_limit_pct', { value: 62 })}
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#737686]">
              {t('ebay_app_id', { id: 'FlotBout-Luxury-PRD-••••••••' })}
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#004ac6] text-white text-[13px] font-semibold rounded-lg shadow-sm"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
};
