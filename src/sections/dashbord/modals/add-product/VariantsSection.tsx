import React, { useRef } from 'react';
import useLocales from '@/locales/use-locales';
import { Icon } from '@/components/lucide-icon';
import { Input } from '@/components/ui/input';
import { ProductVariant } from '../../types';
import { ADD_LINK_CLASS, EMPTY_CLASS, REMOVE_BTN_CLASS, SECTION_CLASS, SECTION_TITLE_CLASS } from './constants';

interface VariantsSectionProps {
  variants: ProductVariant[];
  defaultPrice: number;
  className?: string;
  onChange: (variants: ProductVariant[]) => void;
}

const newId = () => `var-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

export const VariantsSection: React.FC<VariantsSectionProps> = ({ variants, defaultPrice, className = '', onChange }) => {
  const { t } = useLocales();
  const fileRef = useRef<HTMLInputElement>(null);
  const imageTarget = useRef<string | null>(null);

  const update = (id: string, patch: Partial<ProductVariant>) =>
    onChange(variants.map((v) => (v.id === id ? { ...v, ...patch } : v)));

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const id = imageTarget.current;
    e.target.value = '';
    if (!file || !id) return;
    const previous = variants.find((v) => v.id === id)?.image;
    if (previous?.startsWith('blob:')) URL.revokeObjectURL(previous);
    update(id, { image: URL.createObjectURL(file), imageFile: file });
  };

  return (
    <section className={`${SECTION_CLASS} ${className}`}>
      <div className="flex items-center justify-between">
        <span className={SECTION_TITLE_CLASS}>
          {t('variants')} ({variants.length})
        </span>
        <button
          type="button"
          onClick={() => onChange([...variants, { id: newId(), title: '', price: defaultPrice, image: '' }])}
          className={ADD_LINK_CLASS}
        >
          + {t('add_variant')}
        </button>
      </div>
      <input type="file" accept="image/*" ref={fileRef} onChange={handleImage} className="hidden" />
      {variants.length === 0 && <p className={EMPTY_CLASS}>{t('no_variants_yet')}</p>}
      {variants.map((v) => (
        <div
          key={v.id}
          className="flex items-start gap-3 p-2.5 bg-[#f8f9ff] dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700"
        >
          <button
            type="button"
            onClick={() => {
              imageTarget.current = v.id;
              fileRef.current?.click();
            }}
            aria-label={t('upload_variant_image')}
            className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-dashed border-[#c3c6d7] dark:border-slate-600 bg-white dark:bg-slate-900 flex items-center justify-center text-[#737686] cursor-pointer"
          >
            {v.image ? (
              <img src={v.image} alt={v.title} className="w-full h-full object-cover" />
            ) : (
              <Icon name="upload_file" className="text-[22px]" />
            )}
          </button>
          <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Input
              containerClassName="sm:col-span-2 mb-0"
              label={t('variant_title')}
              value={v.title}
              onChange={(e) => update(v.id, { title: e.target.value })}
              placeholder={t('variant_title_placeholder')}
            />
            <Input
              containerClassName="mb-0"
              label={t('variant_price')}
              type="number"
              min="0"
              step="1"
              value={v.price}
              onChange={(e) => update(v.id, { price: Number(e.target.value) })}
            />
          </div>
          <button
            type="button"
            aria-label={t('remove')}
            onClick={() => onChange(variants.filter((x) => x.id !== v.id))}
            className={`${REMOVE_BTN_CLASS} mt-1`}
          >
            <Icon name="close" className="text-[18px]" />
          </button>
        </div>
      ))}
      {variants.length > 0 && (
        <p className="text-[14px] font-bold text-[#737686] dark:text-slate-400">
          {t('product_price_note', { price: defaultPrice })}
        </p>
      )}
    </section>
  );
};
