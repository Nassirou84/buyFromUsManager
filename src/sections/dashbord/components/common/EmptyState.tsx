import React from 'react';
import { Icon } from '@iconify/react';

interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description }) => (
  <div className="p-8 border-2 border-dashed border-[#dce9ff] dark:border-slate-800 rounded-xl text-center flex flex-col items-center justify-center text-[#565e74] dark:text-slate-400">
    <Icon icon={icon} className="text-[32px] text-[#004ac6] dark:text-blue-400 mb-1.5" />
    <span className="font-bold text-[13.5px] text-[#0b1c30] dark:text-white">{title}</span>
    {description && <p className="text-[12px] max-w-sm mt-1">{description}</p>}
  </div>
);
