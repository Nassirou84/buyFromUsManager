import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import useLocales from '@/locales/use-locales';
import { Icon } from '@iconify/react';
import { AVAILABLE_ICONS, toIconifyName } from './constants';

export interface NewCategoryValues {
  name: string;
  icon: string;
  description: string;
}

interface AddCategoryFormProps {
  onSubmit: (values: NewCategoryValues) => void;
  onCancel: () => void;
}

export const AddCategoryForm: React.FC<AddCategoryFormProps> = ({ onSubmit, onCancel }) => {
  const { t } = useLocales();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('checkroom');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), icon, description: description.trim() });
    setName('');
    setDescription('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-3.5 bg-blue-50/80 dark:bg-blue-950/40 border-b border-blue-200 dark:border-blue-900 flex flex-col gap-2.5 animate-in slide-in-from-top-2 duration-150"
    >
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-bold text-[#004ac6] dark:text-blue-300">{t('addNewMasterCategory')}</span>
        <button
          type="button"
          onClick={onCancel}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <Icon icon="material-symbols:close" className="text-[16px]" />
        </button>
      </div>

      <Input
        label={t('categoryNamePlaceholder')}
        type="text"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <Input
        type="text"
        label={t('shortDescriptionOptional')}
        isTextArea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <div className="flex flex-col gap-1">
        <span className="text-[11px] font-semibold text-[#565e74] dark:text-slate-400">{t('chooseIcon')}</span>
        <div className="flex flex-wrap gap-1">
          {AVAILABLE_ICONS.slice(0, 7).map((iconName) => (
            <button
              key={iconName}
              type="button"
              onClick={() => setIcon(iconName)}
              className={`w-7 h-7 rounded flex items-center justify-center transition-all cursor-pointer ${icon === iconName
                ? 'bg-[#004ac6] text-white shadow-2xs'
                : 'bg-white dark:bg-slate-800 text-[#565e74] hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
                }`}
            >
              <Icon icon={toIconifyName(iconName)} className="text-[16px]" />
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-1.5 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="px-2.5 py-1 text-slate-600 dark:text-slate-300 text-[11.5px] rounded hover:bg-slate-200 dark:hover:bg-slate-800"
        >
          {t('cancel')}
        </button>
        <button
          type="submit"
          disabled={!name.trim()}
          className="px-3 py-1 bg-[#004ac6] text-white text-[11.5px] font-bold rounded shadow-xs disabled:opacity-40 cursor-pointer"
        >
          {t('createCategory')}
        </button>
      </div>
    </form>
  );
};
