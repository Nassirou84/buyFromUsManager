import React from 'react';
import { Icon } from '@iconify/react';
import { Category, SubCategory } from '@/types/category';
import { IconBadge } from '@/sections/dashbord/components/common/IconBadge';
import { SearchField } from '@/sections/dashbord/components/common/SearchField';
import { EmptyState } from '@/sections/dashbord/components/common/EmptyState';
import { SubcategoryRow } from './SubcategoryRow';
import { AddSubcategoryForm, NewSubcategoryValues } from './AddSubcategoryForm';
import useLocales from '@/locales/use-locales';

interface SubcategoriesPaneProps {
  category: Category;
  subcategories: SubCategory[];
  search: string;
  onSearchChange: (value: string) => void;
  isAdding: boolean;
  onToggleAdding: (open: boolean) => void;
  onAdd: (values: NewSubcategoryValues) => void;
  editingId: string | null;
  onStartEdit: (id: string) => void;
  onSaveEdit: (id: string, updatedSub: Partial<SubCategory>) => void;
  onCancelEdit: () => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export const SubcategoriesPane: React.FC<SubcategoriesPaneProps> = ({
  category,
  subcategories,
  search,
  onSearchChange,
  isAdding,
  onToggleAdding,
  onAdd,
  editingId,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onClose,
}) => {

  const { t } = useLocales();

  const name = (category as Category & { name?: string }).name ?? category.title;

  return (
    <div className="flex-1 bg-white dark:bg-[#131b2e] flex flex-col justify-between overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-[#e5eeff] dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#131b2e]">
        <div className="flex items-center gap-3">
          <IconBadge icon={category.icon} />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-[#0b1c30] dark:text-white">
                {t('subcategories', { name })}
              </h3>
              <span className="px-2 py-0.5 bg-[#dbe1ff] dark:bg-blue-900/60 text-[#004ac6] dark:text-blue-300 font-bold text-[11px] rounded">
                {t('total', { count: category.subcategories.length })}
              </span>
            </div>
            <p className="text-[12px] text-[#565e74] dark:text-slate-400 mt-0.5">
              {category.description || t('configuredSubcategoriesDescription')}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onToggleAdding(!isAdding)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#004ac6] hover:bg-[#003ea8] text-white text-[12.5px] font-bold rounded-lg shadow-sm transition-all cursor-pointer whitespace-nowrap"
        >
          <Icon icon="material-symbols:add" className="text-[17px]" />
          <span>{t('addSubcategory')}</span>
        </button>
      </div>

      <div className="px-5 py-2.5 bg-[#f8f9ff] dark:bg-slate-900/60 border-b border-[#e5eeff] dark:border-slate-800 flex items-center justify-between gap-3">
        <SearchField
          value={search}
          onChange={onSearchChange}
          placeholder={t('searchSubcategories', { name })}
          className="w-full max-w-sm"
        />
        <span className="text-[11.5px] text-[#565e74] dark:text-slate-400 hidden sm:inline">
          {t('totalOf', { count: subcategories.length, total: category.subcategories.length })}
        </span>
      </div>

      {isAdding && (
        <AddSubcategoryForm parentName={name} onSubmit={onAdd} onCancel={() => onToggleAdding(false)} />
      )}

      <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-2.5">
        {subcategories.map((sub) => (
          <SubcategoryRow
            key={sub.id}
            sub={sub}
            isEditing={editingId === sub.id}
            onStartEdit={() => onStartEdit(sub.id)}
            onSaveEdit={(updatedSub) => onSaveEdit(sub.id, updatedSub)}
            onCancelEdit={onCancelEdit}
            onDelete={() => onDelete(sub.id)}
          />
        ))}

        {subcategories.length === 0 && (
          <EmptyState
            icon="material-symbols:category"
            title={t('noSubcategoriesFound', { name })}
            description={t('clickAddSubcategory', { name })}
          />
        )}
      </div>

      <div className="p-4 bg-white dark:bg-[#131b2e] border-t border-[#e5eeff] dark:border-slate-800 flex items-center justify-between">
        <span className="text-[12px] text-[#565e74] dark:text-slate-400">
          {t('categoryTaxonomySynchronized')}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2 bg-[#004ac6] hover:bg-[#003ea8] text-white text-[13px] font-bold rounded-lg shadow-sm transition-all cursor-pointer"
        >
          {t('done')}
        </button>
      </div>
    </div>
  );
};
