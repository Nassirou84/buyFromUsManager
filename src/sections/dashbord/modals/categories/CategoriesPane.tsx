import React from 'react';
import useLocales from '@/locales/use-locales';
import { Icon } from '@iconify/react';
import { Category } from '@/types/category';
import { SearchField } from '@/sections/dashbord/components/common/SearchField';
import { CategoryListItem } from './CategoryListItem';
import { AddCategoryForm, NewCategoryValues } from './AddCategoryForm';

interface CategoriesPaneProps {
  categories: Category[];
  totalCount?: number;
  selectedCategoryId: string;
  search: string;
  onSearchChange: (value: string) => void;
  isAdding: boolean;
  onToggleAdding: (open: boolean) => void;
  onSelect: (id: string) => void;
  onAdd: (values: NewCategoryValues) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

export const CategoriesPane: React.FC<CategoriesPaneProps> = ({
  categories,
  totalCount,
  selectedCategoryId,
  search,
  onSearchChange,
  isAdding,
  onToggleAdding,
  onSelect,
  onAdd,
  onDelete,
}) => {
  const { t } = useLocales();

  return (
  <div className="w-full md:w-80 lg:w-96 bg-[#f8f9ff] dark:bg-[#0f172a] border-r border-[#e5eeff] dark:border-slate-800 flex flex-col flex-shrink-0 justify-between overflow-hidden">
    <div className="p-3.5 border-b border-[#e5eeff] dark:border-slate-800 flex flex-col gap-2 bg-white dark:bg-[#131b2e]">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#565e74] dark:text-slate-400">
          {t('categoriesTotal', { count: totalCount ?? 0 })}
        </span>
        <button
          type="button"
          onClick={() => onToggleAdding(!isAdding)}
          className="text-[12px] font-bold text-[#004ac6] dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <Icon icon="material-symbols:add-circle" className="text-[16px]" />
          <span>+ {t('newCategory')}</span>
        </button>
      </div>

      <SearchField value={search} onChange={onSearchChange} placeholder={t('searchByName')} />
    </div>

    {isAdding && <AddCategoryForm onSubmit={onAdd} onCancel={() => onToggleAdding(false)} />}

    <div className="flex-1 overflow-y-auto p-2.5 flex flex-col gap-1.5 divide-y divide-transparent">
      {categories.map((category) => (
        <CategoryListItem
          key={category.id}
          category={category}
          isSelected={category.id === selectedCategoryId}
          onSelect={() => onSelect(category.id)}
          onDelete={(e) => onDelete(category.id, e)}
        />
      ))}

      {categories.length === 0 && (
        <div className="p-6 text-center text-xs text-[#565e74] dark:text-slate-400">
          {t('noCategoriesMatching', { search })}
        </div>
      )}
    </div>

    <div className="p-3 bg-white dark:bg-[#131b2e] border-t border-[#e5eeff] dark:border-slate-800 flex items-center justify-between">
      <span className="text-[11px] text-[#565e74] dark:text-slate-400">
        {t('clickCategoryToEdit')}
      </span>
      <button
        type="button"
        onClick={() => onToggleAdding(true)}
        className="text-[12px] font-bold text-[#004ac6] dark:text-blue-400 hover:underline cursor-pointer"
      >
        + {t('addCategory')}
      </button>
    </div>
  </div>
  );
};
