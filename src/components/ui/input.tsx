import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
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

  return (
    <div className={`space-y-1 w-full mb-2 ${containerClassName}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-[#434655] px-1 tracking-wide"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3 text-[#737686] pointer-events-none flex items-center">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          className={`w-full h-11 px-4 font-normal text-[15px] rounded-lg border transition-all duration-150 outline-none
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
            ${disabled
              ? 'bg-[#eff4ff] border-[#c3c6d7] text-[#0b1c30] opacity-75 cursor-not-allowed select-text'
              : 'bg-white border-[#c3c6d7] text-[#0b1c30] focus:ring-2 focus:ring-[#004ac6] focus:border-[#004ac6]'
            }
            ${error ? 'border-[#ba1a1a] focus:ring-[#ba1a1a] focus:border-[#ba1a1a]' : ''}
            ${className}`}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 text-[#737686] flex items-center">
            {rightIcon}
          </div>
        )}
      </div>
      {error ? (
        <p className="text-xs text-[#ba1a1a] px-1 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-[#737686] px-1">{helperText}</p>
      ) : null}
    </div>
  );
});
Input.displayName = 'Input';
