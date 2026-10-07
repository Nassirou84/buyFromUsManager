import React from 'react';
import useLocales from '@/locales/use-locales';
import { Icon } from '@iconify/react';
import { SubCategory } from '@/types/category';
import { IconButton } from '@/sections/dashbord/components/common/IconButton';
import { Input } from '@/components/ui/input';
import { FormField } from './AddSubcategoryForm';

interface SubcategoryRowProps {
  sub: SubCategory;
  isEditing: boolean;
  onStartEdit: () => void;
  onSaveEdit: (updatedSub: Partial<SubCategory>) => void;
  onCancelEdit: () => void;
  onDelete: () => void;
}

export const SubcategoryRow: React.FC<SubcategoryRowProps> = ({
  sub,
  isEditing,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
}) => {
  const { t } = useLocales();

  const [editingMarkup, setEditingMarkup] = React.useState(sub.markup ?? 42);
  const [editingDescription, setEditingDescription] = React.useState(sub.description ?? '');
  const [editingName, setEditingName] = React.useState(sub.title ?? '');

  const handleEdit = () => {
    if (editingName && editingMarkup && editingDescription) {
      onSaveEdit({
        title: editingName,
        description: editingDescription,
        markup: editingMarkup,
      });
    }
  };

  const legacy = sub as SubCategory & {
    name?: string;
    productCount?: number;
    markupRule?: string;
    estimatedMargin?: number;
    scraperKeywords?: string[];
  };
  const displayName = legacy.name ?? sub.title;

  return (
    <div className="p-3.5 rounded-xl border border-[#e5eeff] dark:border-slate-800 bg-[#f8f9ff]/70 dark:bg-slate-900/40 hover:bg-[#eff4ff]/50 dark:hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
      <div className="flex items-start sm:items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#dbe1ff] dark:bg-blue-900/60 text-[#004ac6] dark:text-blue-300 flex items-center justify-center font-bold text-[13px] flex-shrink-0 mt-0.5 sm:mt-0">
          <Icon icon="material-symbols:subdirectory-arrow-right" className="text-[17px]" />
        </div>

        <div className="flex flex-col">
          {isEditing ? (
            <div className="flex flex-col items-start gap-1.5">
              <div className='flex gap-1.5'>
                <Input
                  label={t('titleLabel')}
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="h-8 px-2 bg-white dark:bg-slate-800 border border-[#004ac6] rounded text-[13px] font-bold text-[#0b1c30] dark:text-white"
                />
                <Input
                  type="number"
                  min="20"
                  max="85"
                  label={t('markupPercentLabel')}
                  value={editingMarkup}
                  onChange={(e) => setEditingMarkup(Number(e.target.value))}
                  className="h-8 px-2 bg-white dark:bg-slate-800 border border-[#004ac6] rounded text-[13px] font-bold text-[#0b1c30] dark:text-white"
                />
              </div>
              <FormField label={t('description')}>
                <textarea
                  value={editingDescription}
                  onChange={(e) => setEditingDescription(e.target.value)}
                  className="h-10 px-2 bg-white dark:bg-slate-800 border border-[#004ac6] rounded text-[13px] font-bold text-[#0b1c30] dark:text-white"
                />
              </FormField>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleEdit}
                  className="px-2 py-1 bg-[#004ac6] text-white text-[11px] font-bold rounded"
                >
                  {t('save')}
                </button>
                <button
                  type="button"
                  onClick={onCancelEdit}
                  className="px-2 py-1 bg-slate-200 text-slate-700 text-[11px] rounded"
                >
                  {t('cancel')}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-bold text-[14px] text-[#0b1c30] dark:text-white">{displayName}</span>
              <span className="px-2 py-0.5 bg-white dark:bg-slate-800 text-[#004ac6] dark:text-blue-300 text-[11px] font-bold rounded border border-[#dce9ff] dark:border-slate-700">
                {t('skusCount', { count: legacy.productCount ?? sub.productLength })}
              </span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 mt-1 text-[11.5px] text-[#565e74] dark:text-slate-400">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {t('marginOnSales', { markup: legacy.markup })}
            </span>
            {legacy.scraperKeywords && legacy.scraperKeywords.length > 0 && (
              <>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="text-slate-400 text-[10.5px]">
                  {t('autoMatch', { keywords: legacy.scraperKeywords.slice(0, 3).join(', ') })}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 self-end sm:self-auto">
        <IconButton icon="material-symbols:edit" tone="primary" title={t('editSubcategory')} onClick={onStartEdit} />
        {sub.productLength == 0 && (
          <IconButton icon="material-symbols:delete" tone="danger" title={t('deleteSubcategory')} onClick={onDelete} />
        )}
      </div>
    </div>
  );
};
