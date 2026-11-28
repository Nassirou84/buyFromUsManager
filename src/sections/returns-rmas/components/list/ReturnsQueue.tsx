import React from 'react';
import useLocales from '@/locales/use-locales';
import { Icon } from '@/components/lucide-icon';
import { type RmaItem } from '../../types';
import { SECTION_LABEL } from '../../shared';
import { ReturnCard } from './ReturnCard';

interface ReturnsQueueProps {
  rmas: RmaItem[];
  totalItems: number;
  isLoading: boolean;
  isFetching: boolean;
  onOpen: (uid: string) => void;
  /** Rendered below the cards (e.g. pagination). */
  footer?: React.ReactNode;
}

// Queue heading plus the loading / empty / card-grid states.
export const ReturnsQueue: React.FC<ReturnsQueueProps> = ({
  rmas,
  totalItems,
  isLoading,
  isFetching,
  onOpen,
  footer,
}) => {
  const { t } = useLocales();

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between px-1 py-0.5">
        <span className={SECTION_LABEL}>{t('rma_active_queue', { shown: rmas.length, total: totalItems })}</span>
        {isFetching && (
          <Icon name="progress_activity" className="text-[16px] text-[#565e74] dark:text-slate-400 animate-spin" />
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-10 text-[13px] text-[#565e74] dark:text-slate-400">
          <Icon name="progress_activity" className="text-[18px] animate-spin" />
          <span>{t('rma_loading')}</span>
        </div>
      ) : rmas.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-1.5 py-10 text-center">
          <Icon name="assignment_return" className="text-[28px] text-[#c3c6d7] dark:text-slate-600" />
          <span className="text-[13px] text-[#565e74] dark:text-slate-400">{t('rma_empty')}</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-2.5">
          {rmas.map((item) => (
            <ReturnCard key={item.id} item={item} onOpen={onOpen} />
          ))}
        </div>
      )}

      {footer}
    </div>
  );
};
