import React from 'react';
import { Icon } from '@iconify/react';

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
}

export const SearchField: React.FC<SearchFieldProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
  inputClassName = 'w-full h-8 pl-8 pr-3 bg-white dark:bg-slate-800 text-[12px] text-[#0b1c30] dark:text-white rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#004ac6]',
}) => (
  <div className={`relative ${className}`}>
    <Icon
      icon="material-symbols:search"
      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#737686] text-[16px]"
    />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={inputClassName}
    />
  </div>
);
