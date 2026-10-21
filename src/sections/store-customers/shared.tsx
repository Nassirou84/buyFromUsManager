import React from 'react';
import { Icon } from '@/components/lucide-icon';

export const CARD = 'bg-white dark:bg-[#131b2e] rounded-xl border border-[#e5eeff] dark:border-slate-800 shadow-2xs';
export const KPI_LABEL = 'text-[11px] font-semibold text-[#565e74] dark:text-slate-400 uppercase tracking-wider';
export const TH = 'py-3 px-4 first:px-5 last:px-5';
export const TD = 'py-3.5 px-4 first:px-5 last:px-5';

export const PaymentIcon: React.FC<{ method: string }> = ({ method }) => {
  if (method.includes('Wave')) return <Icon name="waves" className="text-[16px] text-[#004ac6] dark:text-blue-400" />;
  if (method.includes('Orange')) return <Icon name="smartphone" className="text-[16px] text-[#bc4800]" />;
  if (method.includes('Carte')) return <Icon name="credit_card" className="text-[16px] text-[#004ac6] dark:text-blue-400" />;
  return <Icon name="payments" className="text-[16px] text-[#004ac6] dark:text-blue-400" />;
};
