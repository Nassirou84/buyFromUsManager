import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'default' | 'secondary' | 'success' | 'warning' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'sm',
  className = '',
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold tracking-wider uppercase rounded-full';

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  const variantStyles = {
    primary: 'bg-[#004ac6] text-white',
    default: 'bg-[#004ac6] text-white',
    secondary: 'bg-[#dae2fd] text-[#00174b]',
    success: 'bg-[#dcfce7] text-[#15803d]',
    warning: 'bg-[#fef9c3] text-[#a16207]',
    outline: 'border border-[#c3c6d7] text-[#434655]',
  };

  return (
    <span className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
};
