import React from 'react';

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'onBlur' | 'onFocus' | 'onKeyDown'>,
  Pick<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    'rows' | 'cols' | 'onChange' | 'onBlur' | 'onFocus' | 'onKeyDown'
  > {
  isTextArea?: boolean;
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(({
  isTextArea = false,
  rows = 4,
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = '',
  containerClassName = '',
  disabled,
  id,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  const fieldClassName = `w-full px-4 text-[14px] rounded-lg border transition-all duration-150 outline-none font-semibold
            ${isTextArea ? 'py-2.5 resize-y min-h-[88px]' : 'h-11'}
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
            ${disabled
      ? 'bg-[#eff4ff] border-[#c3c6d7] text-[#0b1c30] dark:bg-slate-800/60 dark:border-slate-700 dark:text-slate-300 opacity-75 cursor-not-allowed select-text'
      : 'bg-white border-[#c3c6d7] text-[#0b1c30] placeholder:text-[#737686] dark:bg-[#0b1220] dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500 focus:ring-2 focus:ring-[#004ac6] focus:border-[#004ac6] dark:focus:ring-blue-500 dark:focus:border-blue-500'
    }
            ${error ? 'border-[#ba1a1a] dark:border-red-500 focus:ring-[#ba1a1a] focus:border-[#ba1a1a] dark:focus:ring-red-500 dark:focus:border-red-500' : ''}
            ${className}`;

  return (
    <div className={`space-y-1 w-full mb-2 ${containerClassName}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-[#434655] dark:text-slate-300 px-1 tracking-wide"
        >
          {label}
        </label>
      )}
      <div className={`relative flex ${isTextArea ? 'items-start' : 'items-center'}`}>
        {leftIcon && (
          <div className={`absolute left-3 text-[#737686] dark:text-slate-400 pointer-events-none flex items-center ${isTextArea ? 'top-3' : ''}`}>
            {leftIcon}
          </div>
        )}
        {isTextArea ? (
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            id={inputId}
            disabled={disabled}
            rows={rows}
            className={fieldClassName}
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            ref={ref as React.Ref<HTMLInputElement>}
            id={inputId}
            disabled={disabled}
            className={fieldClassName}
            {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
          />
        )}
        {rightIcon && (
          <div className={`absolute right-3 text-[#737686] dark:text-slate-400 flex items-center ${isTextArea ? 'top-3' : ''}`}>
            {rightIcon}
          </div>
        )}
      </div>
      {error ? (
        <p className="text-xs text-[#ba1a1a] dark:text-red-400 px-1 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-[#737686] dark:text-slate-400 px-1">{helperText}</p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
