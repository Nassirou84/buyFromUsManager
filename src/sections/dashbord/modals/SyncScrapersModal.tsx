import useLocales from '@/locales/use-locales';
import React, { useState, useEffect } from 'react';
import { Icon } from '@/components/lucide-icon';

interface SyncScrapersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncComplete: () => void;
}

export const SyncScrapersModal: React.FC<SyncScrapersModalProps> = ({
  isOpen,
  onClose,
  onSyncComplete,
}) => {
  const { t } = useLocales();
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setLogs([]);
      setProgress(0);
      setIsFinished(false);
      return;
    }

    const steps = [
      'sync_step_1',
      'sync_step_2',
      'sync_step_3',
      'sync_step_4',
      'sync_step_5',
      'sync_step_6',
      'sync_step_7',
      'sync_step_8',
      'sync_step_9',
      'sync_step_10'
    ];

    let current = 0;
    const interval = setInterval(() => {
      if (current < steps.length) {
        const nextStep = steps[current];
        setLogs((prev) => [...prev, nextStep]);
        current++;
        setProgress(Math.round((current / steps.length) * 100));
      } else {
        clearInterval(interval);
        setIsFinished(true);
        onSyncComplete();
      }
    }, 450);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#131b2e] rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#dbe1ff] text-[#004ac6] flex items-center justify-center">
              <Icon name={isFinished ? 'check_circle' : 'sync'} className={`text-[20px] ${!isFinished ? 'animate-spin' : ''}`}/>
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#0b1c30] dark:text-white">
                {t('multi_channel_scraper_sync')}
              </h3>
              <p className="text-[12px] text-[#565e74] dark:text-slate-400">
                {t('syncing_channels')}
              </p>
            </div>
          </div>
          {isFinished && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <Icon name="close" className="text-[20px]"/>
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-[12px] mb-1">
            <span className="font-semibold text-[#0b1c30] dark:text-slate-200">
              {isFinished ? t('sync_pipeline_complete') : t('scraping_upstream_listings')}
            </span>
            <span className="font-mono font-bold text-[#004ac6] dark:text-blue-400">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-[#dce9ff] dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="bg-[#004ac6] h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Terminal Log Output */}
        <div className="bg-[#0f172a] text-[#e2e8f0] p-3.5 rounded-lg font-mono text-[11.5px] h-52 overflow-y-auto border border-slate-700 flex flex-col gap-1.5 shadow-inner">
          {logs.map((log, i) => (
            <div key={i} className="leading-snug flex items-start gap-1.5">
              <span className="text-[#38bdf8] select-none">&gt;</span>
              <span className={log === 'sync_step_10' ? 'text-emerald-400 font-bold' : ''}>
                {t(log)}
              </span>
            </div>
          ))}
          {!isFinished && (
            <div className="flex items-center gap-1 text-slate-400 animate-pulse">
              <span>_</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#004ac6] hover:bg-[#003ea8] text-white text-[13px] font-semibold rounded-lg shadow-sm"
          >
            {isFinished ? t('dismiss_view_catalog') : t('run_in_background')}
          </button>
        </div>
      </div>
    </div>
  );
};
