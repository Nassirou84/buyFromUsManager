import React from 'react';
import { Icon } from '@iconify/react';

interface IconButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  icon: string;
  iconClassName?: string;
  /** Hover color treatment. */
  tone?: 'neutral' | 'primary' | 'danger';
}

const TONES = {
  neutral: 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800',
  primary: 'text-slate-400 hover:text-[#004ac6] hover:bg-[#eff4ff] dark:hover:bg-slate-800',
  danger: 'text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40',
};

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  iconClassName = 'text-[17px]',
  tone = 'neutral',
  className = '',
  type = 'button',
  ...rest
}) => (
  <button
    type={type}
    className={`p-1.5 rounded transition-colors cursor-pointer ${TONES[tone]} ${className}`}
    {...rest}
  >
    <Icon icon={icon} className={iconClassName} />
  </button>
);
