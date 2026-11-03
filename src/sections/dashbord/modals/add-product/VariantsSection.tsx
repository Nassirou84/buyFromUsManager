import React, { useRef } from 'react';
import useLocales from '@/locales/use-locales';
import { Icon } from '@/components/lucide-icon';
import { Input } from '@/components/ui/input';
import { ProductVariant } from '../../types';
import { ADD_LINK_CLASS, EMPTY_CLASS, REMOVE_BTN_CLASS, SECTION_CLASS, SECTION_TITLE_CLASS } from './constants';

interface VariantsSectionProps {
  variants: ProductVariant[];
  defaultPrice: number;
  sourceCost: number;
  className?: string;
  onChange: (variants: ProductVariant[]) => void;
}

const newId = () => `var-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

export const VariantsSection: React.FC<VariantsSectionProps> = ({ variants, defaultPrice, sourceCost, className = '', onChange }) => {
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

  const clearImage = (id: string) => {
    const previous = variants.find((v) => v.id === id)?.image;
    if (previous?.startsWith('blob:')) URL.revokeObjectURL(previous);
    update(id, { image: '', imageFile: undefined });
  };

  const handleClearAll = () => {
    variants.forEach((v) => {
      if (v.image?.startsWith('blob:')) URL.revokeObjectURL(v.image);
    });
    onChange([]);
  };

  // Scale each variant by the product's markup (retail price over source cost), applied to
  // the original scraped source price so recalculation stays idempotent. Variants keep their
  // relative differences while fitting the estimated margin.
  const markupMultiplier = sourceCost > 0 ? defaultPrice / sourceCost : 0;
  const handleRecalculatePrices = () => {
    if (markupMultiplier <= 0) return;
    onChange(variants.map((v) => ({ ...v, price: Math.round((v.sourcePrice ?? v.price) * markupMultiplier) })));
  };

  return (
    <section className={`${SECTION_CLASS} ${className}`}>
      <div className="flex items-center justify-between">
        <span className={SECTION_TITLE_CLASS}>
          {t('variants')} ({variants.length})
        </span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onChange([...variants, { id: newId(), title: '', price: defaultPrice, image: '' }])}
            className={ADD_LINK_CLASS}
          >
            + {t('add_variant')}
          </button>
          {variants.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-[13px] font-bold text-red-600 dark:text-red-400 hover:underline cursor-pointer"
            >
              {t('clear_all_variants')}
            </button>
          )}
        </div>
      </div>
      <input type="file" accept="image/*" ref={fileRef} onChange={handleImage} className="hidden" />
      {variants.length === 0 && <p className={EMPTY_CLASS}>{t('no_variants_yet')}</p>}
      {variants.map((v) => (
        <div
          key={v.id}
          className="flex items-start gap-3 p-2.5 bg-[#f8f9ff] dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700"
        >
          <div className="relative w-16 h-16 flex-shrink-0">
            <button
              type="button"
              onClick={() => {
                imageTarget.current = v.id;
                fileRef.current?.click();
              }}
              aria-label={t('upload_variant_image')}
              className="w-full h-full rounded-lg overflow-hidden border border-dashed border-[#c3c6d7] dark:border-slate-600 bg-white dark:bg-slate-900 flex items-center justify-center text-[#737686] cursor-pointer"
            >
              {v.image ? (
                <img src={v.image} alt={v.title} className="w-full h-full object-cover" />
              ) : (
                <Icon name="upload_file" className="text-[22px]" />
              )}
            </button>
            {v.image && (
              <button
                type="button"
                onClick={() => clearImage(v.id)}
                aria-label={t('remove_variant_image')}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center shadow-sm hover:bg-red-700 cursor-pointer"
              >
                <Icon name="close" className="text-[12px]" />
              </button>
            )}
          </div>
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
        <div className="flex items-center justify-between gap-3">
          <p className="text-[14px] font-bold text-[#737686] dark:text-slate-400">
            {t('product_price_note', { price: defaultPrice })}
          </p>
          <button
            type="button"
            onClick={handleRecalculatePrices}
            disabled={markupMultiplier <= 0}
            className="flex items-center gap-1.5 text-[13px] font-bold text-[#004ac6] dark:text-blue-400 hover:underline cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:no-underline"
          >
            <Icon name="autorenew" className="text-[16px]" />
            {t('recalculate_variant_prices')}
          </button>
        </div>
      )}
    </section>
  );
};
