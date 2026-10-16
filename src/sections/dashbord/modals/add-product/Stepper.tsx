import React from 'react';
import useLocales from '@/locales/use-locales';
import { STEP_ORDER, Step } from './constants';

interface StepperProps {
  step: Step;
}

export const Stepper: React.FC<StepperProps> = ({ step }) => {
  const { t } = useLocales();

  const labels: Record<Step, string> = {
    source: t('step_source_link'),
    review: t('step_review'),
    extras: t('step_details_variants'),
  };
  const stepIndex = STEP_ORDER.indexOf(step);

  return (
    <ol className="grid grid-cols-3 gap-2">
      {STEP_ORDER.map((key, idx) => {
        const isActive = key === step;
        const isDone = idx < stepIndex;
        return (
          <li
            key={key}
            className={`flex items-center gap-2 p-2 rounded-xl text-[12.5px] font-bold border ${isActive
              ? 'bg-[#eff4ff] dark:bg-slate-800 border-[#004ac6] text-[#004ac6] dark:text-blue-300'
              : 'border-[#dce9ff] dark:border-slate-700 text-[#565e74] dark:text-slate-400'
              }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${isActive || isDone ? 'bg-[#004ac6] text-white' : 'bg-slate-200 dark:bg-slate-700'
                }`}
            >
              {isDone ? '✓' : idx + 1}
            </span>
            <span>{labels[key]}</span>
          </li>
        );
      })}
    </ol>
  );
};
