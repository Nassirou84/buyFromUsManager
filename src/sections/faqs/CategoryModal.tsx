import useLocales from '@/locales/use-locales';
import React, { useState } from 'react';
import { Icon } from '@/components/lucide-icon';
import { FaqCategory } from './types';
import { ACCORDION_OPTIONS, AccordionBehavior, slugify, TARGET_PAGES } from './constants';

export type CategoryFormValues = Pick<FaqCategory, 'title' | 'slug' | 'icon' | 'accordionBehavior' | 'targetPages'>;

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: CategoryFormValues) => void;
  isSaving?: boolean;
  /** The category being edited, or null/undefined to create one. */
  initialData?: FaqCategory | null;
  /** Slugs of the other categories, which this one must not reuse. */
  takenSlugs: string[];
}

const LABEL = 'text-xs font-semibold text-[#0b1c30] dark:text-gray-200';
const INPUT =
  'w-full h-10 px-3.5 text-sm text-[#0b1c30] dark:text-white bg-[#eff4ff] dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#004ac6]';

export const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose, onSave, isSaving = false, initialData, takenSlugs }) => {
  const { t } = useLocales();
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [slug, setSlug] = useState(initialData?.slug ?? '');
  // A new category's slug follows its title until the admin types one.
  const [slugTouched, setSlugTouched] = useState(!!initialData);
  const [icon, setIcon] = useState(initialData?.icon ?? 'help_outline');
  const [accordionBehavior, setAccordionBehavior] = useState<AccordionBehavior>(
    initialData?.accordionBehavior ?? 'multi-open'
  );
  const [targetPages, setTargetPages] = useState<string[]>(initialData?.targetPages ?? ['all_pages']);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  };

  const toggleTarget = (key: string, checked: boolean) =>
    setTargetPages(checked ? [...targetPages, key] : targetPages.filter((p) => p !== key));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalSlug = slugify(slug);
    if (!title.trim()) return setError(t('faqs_category_title_required'));
    if (!finalSlug) return setError(t('faqs_category_slug_required'));
    if (takenSlugs.includes(finalSlug)) return setError(t('faqs_category_slug_taken'));
    if (targetPages.length === 0) return setError(t('faqs_category_target_required'));

    onSave({
      title: title.trim(),
      slug: finalSlug,
      icon: icon.trim() || 'help_outline',
      accordionBehavior,
      targetPages,
    });
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150"
    >
      <div className="bg-white dark:bg-[#131b2e] rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-[#e5eeff] dark:border-gray-700 animate-in zoom-in-95 duration-150">
        <div className="p-6 bg-[#eff4ff] dark:bg-gray-800/80 flex items-center justify-between border-b border-[#e5eeff] dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#004ac6] flex items-center justify-center text-white shadow-xs">
              <Icon name={initialData ? 'edit' : 'add_circle'} className="text-[18px]" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-[#0b1c30] dark:text-white leading-tight">
                {t(initialData ? 'faqs_category_modal_edit' : 'faqs_category_modal_new')}
              </h3>
              <span className="text-xs text-[#565e74] dark:text-gray-400">{t('faqs_category_modal_subtitle')}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#565e74] hover:text-[#0b1c30] dark:hover:text-white rounded-lg transition-colors"
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">
          <div className="flex flex-col gap-1.5">
            <label className={LABEL}>{t('faqs_displayed_title')}</label>
            <input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className={INPUT}
              placeholder={t('faqs_category_title_placeholder')}
              autoFocus
              type="text"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={LABEL}>{t('faqs_anchor_slug')}</label>
            <div className="flex items-center bg-[#eff4ff] dark:bg-gray-800 px-3.5 h-10 rounded-lg focus-within:ring-1 focus-within:ring-[#004ac6]">
              <span className="text-[#737686] text-[13px] font-mono mr-1">/faq#</span>
              <input
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/-{2,}/g, '-'));
                }}
                onBlur={() => setSlug(slugify(slug))}
                className="w-full bg-transparent text-[13px] font-mono text-[#0b1c30] dark:text-white focus:outline-none"
                type="text"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className={LABEL}>{t('faqs_icon')}</label>
              <div className="flex items-center gap-1.5 h-10 px-3 bg-[#eff4ff] dark:bg-gray-800 rounded-lg focus-within:ring-1 focus-within:ring-[#004ac6]">
                <Icon name={icon || 'help_outline'} className="text-[18px] text-[#004ac6] dark:text-blue-400" />
                <input
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-full bg-transparent text-[13px] text-[#0b1c30] dark:text-white focus:outline-none"
                  type="text"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={LABEL}>{t('faqs_behavior')}</label>
              <select
                value={accordionBehavior}
                onChange={(e) => setAccordionBehavior(e.target.value as AccordionBehavior)}
                className="h-10 px-2.5 text-[13px] text-[#0b1c30] dark:text-white bg-[#eff4ff] dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#004ac6] cursor-pointer"
              >
                {ACCORDION_OPTIONS.map(({ value, labelKey }) => (
                  <option key={value} value={value}>{t(labelKey)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className={LABEL}>{t('faqs_targets')}</span>
            <div className="flex flex-col gap-1.5 text-[13px] text-[#0b1c30] dark:text-white">
              {TARGET_PAGES.map(({ key, labelKey }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={targetPages.includes(key)}
                    onChange={(e) => toggleTarget(key, e.target.checked)}
                    className="rounded accent-[#2563eb] w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs">{t(labelKey)}</span>
                </label>
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-[#004ac6] text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-[#2563eb] transition-colors disabled:opacity-60"
            >
              {t(initialData ? 'faqs_category_save' : 'faqs_category_create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
