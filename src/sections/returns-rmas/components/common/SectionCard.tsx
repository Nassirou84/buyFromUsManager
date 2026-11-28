import React from 'react';
import { Icon } from '@/components/lucide-icon';
import { CARD } from '../../shared';

interface SectionCardProps {
  icon: string;
  title: string;
  /** Rendered next to the title (e.g. a priority chip). */
  badge?: React.ReactNode;
  /** Rendered on the right side of the header row. */
  aside?: React.ReactNode;
  children: React.ReactNode;
}

// Detail-page card with an icon + title header row and a divider.
export const SectionCard: React.FC<SectionCardProps> = ({ icon, title, badge, aside, children }) => (
  <div className={`${CARD} p-5 flex flex-col gap-4`}>
    <div className="flex items-center justify-between pb-2 border-b border-[#f0f4ff] dark:border-slate-800">
      <div className="flex items-center gap-1.5">
        <Icon name={icon} className="text-[20px] text-[#004ac6] dark:text-blue-400" />
        <span className="text-[15px] text-[#0b1c30] dark:text-white font-semibold">{title}</span>
        {badge}
      </div>
      {aside}
    </div>
    {children}
  </div>
);
