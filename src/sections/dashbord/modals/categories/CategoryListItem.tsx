import React from 'react';
import useLocales from '@/locales/use-locales';
import { Icon } from '@iconify/react';
import { Category } from '@/types/category';
import { IconBadge } from '@/sections/dashbord/components/common/IconBadge';
import { IconButton } from '@/sections/dashbord/components/common/IconButton';

interface CategoryListItemProps {
  category: Category;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

export const CategoryListItem: React.FC<CategoryListItemProps> = ({
  category,
  isSelected,
  onSelect,
  onDelete,
}) => {
  const { t } = useLocales();

  return (
  <div
    onClick={onSelect}
    className={`p-3 rounded-xl border transition-all cursor-pointer relative flex items-center justify-between group ${
      isSelected
        ? 'bg-white dark:bg-[#131b2e] border-[#004ac6] shadow-sm ring-1 ring-[#004ac6]/20'
        : 'bg-white/70 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 hover:bg-white dark:hover:bg-[#131b2e] hover:border-slate-300'
    }`}
  >
    {isSelected && <div className="absolute left-0 top-2 bottom-2 w-1.5 bg-[#004ac6] rounded-r" />}

    <div className="flex items-center gap-3 pl-1.5 min-w-0">
      <IconBadge
        icon={category.icon}
        iconClassName="text-[20px]"
        className={`w-9 h-9 rounded-lg transition-colors ${
          isSelected
            ? 'bg-[#eff4ff] dark:bg-blue-950 text-[#004ac6] dark:text-blue-300'
            : 'bg-slate-100 dark:bg-slate-800 text-[#565e74] dark:text-slate-400 group-hover:text-[#004ac6]'
        }`}
      />

      <div className="flex flex-col min-w-0">
        <span
          className={`font-bold text-[13.5px] truncate ${
            isSelected ? 'text-[#004ac6] dark:text-blue-400' : 'text-[#0b1c30] dark:text-white'
          }`}
        >
          {category.title}
        </span>
        <span className="text-[11.5px] text-[#565e74] dark:text-slate-400">
          {t('subcategoriesAndSkus', { subcategories: category.subcategories.length, skus: category.productLength })}
        </span>
      </div>
    </div>

    <div className="flex items-center gap-1 flex-shrink-0">
      <IconButton
        icon="material-symbols:delete"
        iconClassName="text-[16px]"
        tone="danger"
        title={t('deleteCategory')}
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 p-1 transition-all"
      />
      <Icon
        icon="material-symbols:chevron-right"
        className={`text-[18px] transition-transform ${
          isSelected ? 'text-[#004ac6] translate-x-0.5' : 'text-slate-300 dark:text-slate-600'
        }`}
      />
    </div>
  </div>
  );
};
