import React, { useState } from 'react';
import useLocales from '@/locales/use-locales';
import { Icon } from '@iconify/react';
import { LoadinButton } from '@/components/loadin-button';
import { Input } from '@/components/ui/input';

export interface NewSubcategoryValues {
  name: string;
  markup: number;
  description: string;
}

interface AddSubcategoryFormProps {
  parentName: string;
  onSubmit: (values: NewSubcategoryValues & { description: string }) => void;
  onCancel: () => void;
}

export const FormField: React.FC<{ label: string; children: React.ReactNode; className?: string }> = ({
  label,
  children,
  className = '',
}) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    <label className="text-[11.5px] font-bold text-[#0b1c30] dark:text-slate-200">{label}</label>
    {children}
  </div>
);

export const AddSubcategoryForm: React.FC<AddSubcategoryFormProps> = ({ parentName, onSubmit, onCancel }) => {
  const { t } = useLocales();
  const [name, setName] = useState('');
  const [markup, setMarkup] = useState(42);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    onSubmit({
      name: name.trim(),
      markup: Number(markup) || 42,
      description: description.trim(),
    });
    setIsSubmitting(false);
    setName('');
    setMarkup(42);
    setDescription('');
    setIsSubmitting(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 bg-blue-50/70 dark:bg-blue-950/40 border-b border-blue-200 dark:border-blue-900 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-150"
    >
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-bold text-[#004ac6] dark:text-blue-300 flex items-center gap-1.5">
          <Icon icon="material-symbols:add-circle" className="text-[17px]" />
          {t('addSubcategoryTo', { name: parentName })}
        </span>
        <button
          type="button"
          onClick={onCancel}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <Icon icon="material-symbols:close" className="text-[18px]" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <FormField label={t('subcategoryTitle')}>
          <Input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('subcategoryNamePlaceholder')}
            className={`h-9 px-3 text-[12.5px]`}
          />
        </FormField>

        <FormField label={t('markupPercentage')}>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="20"
              max="85"
              value={markup}
              onChange={(e) => setMarkup(Number(e.target.value))}
              className={`h-9 px-3 w-20 font-mono text-[12.5px] font-bold`}
            />
            <span className="text-[12px] text-[#565e74] dark:text-slate-400 font-medium">{t('targetMarkup')}</span>
          </div>
        </FormField>
      </div>
      <FormField label={t('description')}>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t('enterBriefDescriptionForSubcategory')}
          className={`h-20 px-3 py-2 text-[12.5px]`}
        />
      </FormField>

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-slate-600 dark:text-slate-300 text-[12px] font-semibold rounded hover:bg-slate-200 dark:hover:bg-slate-800"
        >
          {t('cancel')}
        </button>
        <LoadinButton
          type="submit"
          isLoading={isSubmitting}
          disabled={!name.trim()}
          className="px-4 py-1.5 bg-[#004ac6] text-white text-[12px] font-bold rounded-lg shadow-sm disabled:opacity-40 cursor-pointer"
        >
          + {t('addTo', { name: parentName })}
        </LoadinButton>
      </div>
    </form>
  );
};
