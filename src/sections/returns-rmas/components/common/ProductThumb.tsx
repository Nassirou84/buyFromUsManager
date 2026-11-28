import React from 'react';
import { Icon } from '@/components/lucide-icon';

interface ProductThumbProps {
  src?: string;
  alt: string;
  /** Size/shape classes, e.g. `w-10 h-10 rounded-md`. */
  className: string;
  iconClassName?: string;
}

// Product image with an inventory-icon placeholder when there is no photo.
export const ProductThumb: React.FC<ProductThumbProps> = ({ src, alt, className, iconClassName = 'text-[18px]' }) =>
  src ? (
    <img className={`${className} object-cover bg-slate-100 dark:bg-slate-700 shrink-0`} src={src} alt={alt} />
  ) : (
    <div
      className={`${className} bg-slate-100 dark:bg-slate-700 shrink-0 flex items-center justify-center text-[#c3c6d7] dark:text-slate-500`}
    >
      <Icon name="inventory" className={iconClassName} />
    </div>
  );
