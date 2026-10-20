import React from 'react';
import useLocales from '@/locales/use-locales';
import { Icon } from '@/components/lucide-icon';
import { Step } from './constants';

const STEP_ICONS: Record<Step, string> = {
  source: 'travel_explore',
  review: 'edit_note',
  extras: 'tune',
};

interface ModalHeaderProps {
  step: Step;
  title?: string;
  description?: string;
  onClose: () => void;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({ step, title, description, onClose }) => {
  const { t } = useLocales();

  return (
    <div className="flex items-center justify-between border-b border-[#f0f4ff] dark:border-slate-800 pb-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#eff4ff] dark:bg-blue-950 text-[#004ac6] dark:text-blue-300 flex items-center justify-center font-bold shadow-2xs">
          <Icon name={STEP_ICONS[step]} className="text-[24px]" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-[#0b1c30] dark:text-white tracking-tight">
            {title ?? t('add_product_to_catalog')}
          </h3>
          <p className="text-[12.5px] text-[#565e74] dark:text-slate-400 mt-0.5">
            {description ?? t('add_product_process_note')}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
      >
        <Icon name="close" className="text-[22px]" />
      </button>
    </div>
  );
};
