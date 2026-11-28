import React from 'react';
import { Icon } from '@/components/lucide-icon';
import { CARD, SECTION_LABEL } from '../../shared';

export interface MetricCardProps {
  label: string;
  icon: string;
  /** Classes for the icon tile (background + text color). */
  iconBox: string;
  value: React.ReactNode;
  trend?: React.ReactNode;
  footLabel: string;
  footValue: React.ReactNode;
  /** Classes for the footer value text. */
  footClass?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  icon,
  iconBox,
  value,
  trend,
  footLabel,
  footValue,
  footClass = 'text-[#0b1c30] dark:text-white',
}) => (
  <div className={`${CARD} p-4 flex flex-col justify-between`}>
    <div className="flex items-center justify-between mb-1.5">
      <span className={SECTION_LABEL}>{label}</span>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBox}`}>
        <Icon name={icon} className="text-[18px]" />
      </div>
    </div>
    <div className="flex items-baseline gap-2 mb-1.5">
      <span className="text-[28px] text-[#0b1c30] dark:text-white font-bold leading-none">{value}</span>
      {trend}
    </div>
    <div className="flex items-center justify-between text-[#565e74] dark:text-slate-400 text-[11px] bg-[#eff4ff]/60 dark:bg-slate-800/60 px-2.5 py-1 rounded-md">
      <span>{footLabel}</span>
      <span className={`font-semibold ${footClass}`}>{footValue}</span>
    </div>
  </div>
);
