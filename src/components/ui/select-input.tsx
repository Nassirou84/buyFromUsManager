import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectInputProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  options: SelectOption[];
  label?: string;
  error?: string;
  helperText?: string;
  placeholder?: string;
  leftIcon?: React.ReactNode;
  containerClassName?: string;
}

// Native <select> styled to match <Input>.
export const SelectInput = React.forwardRef<HTMLSelectElement, SelectInputProps>(({
  options,
  label,
  error,
  helperText,
  placeholder,
  leftIcon,
  className = '',
  containerClassName = '',
  disabled,
  id,
  ...props
}, ref) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  const fieldClassName = `w-full h-11 px-4 pr-10 appearance-none text-[14px] rounded-lg border transition-all duration-150 outline-none font-semibold cursor-pointer
            ${leftIcon ? 'pl-10' : ''}
            ${disabled
      ? 'bg-[#eff4ff] border-[#c3c6d7] text-[#0b1c30] dark:bg-slate-800/60 dark:border-slate-700 dark:text-slate-300 opacity-75 cursor-not-allowed'
      : 'bg-white border-[#c3c6d7] text-[#0b1c30] dark:bg-[#0b1220] dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-[#004ac6] focus:border-[#004ac6] dark:focus:ring-blue-500 dark:focus:border-blue-500'
    }
            ${error ? 'border-[#ba1a1a] dark:border-red-500 focus:ring-[#ba1a1a] focus:border-[#ba1a1a] dark:focus:ring-red-500 dark:focus:border-red-500' : ''}
            ${className}`;

  return (
    <div className={`space-y-1 w-full mb-2 ${containerClassName}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold text-[#434655] dark:text-slate-300 px-1 tracking-wide"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3 text-[#737686] dark:text-slate-400 pointer-events-none flex items-center">
            {leftIcon}
          </div>
        )}
        <select ref={ref} id={selectId} disabled={disabled} className={fieldClassName} {...props}>
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((o) => (
            <option key={o.value} value={o.value} disabled={o.disabled}>
              {o.label}
            </option>
          ))}
        </select>
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className="absolute right-3 w-4 h-4 text-[#737686] dark:text-slate-400 pointer-events-none"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 8l5 5 5-5" />
        </svg>
      </div>
      {error ? (
        <p className="text-xs text-[#ba1a1a] dark:text-red-400 px-1 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-[#737686] dark:text-slate-400 px-1">{helperText}</p>
      ) : null}
    </div>
  );
});

SelectInput.displayName = 'SelectInput';
