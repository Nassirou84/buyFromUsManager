import React from 'react';
import { Icon } from '@iconify/react';
import { toIconifyName } from '@/sections/dashbord/modals/categories/constants';

interface IconBadgeProps {
  /** Iconify id ("mdi:home") or bare Material name ("shopping_bag"). */
  icon: string;
  /** Tailwind classes for size/colors, e.g. "w-10 h-10 rounded-xl bg-... text-..." */
  className?: string;
  iconClassName?: string;
}

export const IconBadge: React.FC<IconBadgeProps> = ({
  icon,
  className = 'w-10 h-10 rounded-xl bg-[#eff4ff] dark:bg-blue-950 text-[#004ac6] dark:text-blue-300',
  iconClassName = 'text-[22px]',
}) => (
  <div className={`flex items-center justify-center font-bold flex-shrink-0 ${className}`}>
    <Icon icon={toIconifyName(icon)} className={iconClassName} />
  </div>
);
