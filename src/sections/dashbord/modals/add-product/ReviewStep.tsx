import React, { useEffect } from 'react';
import { useGetCategories } from '@/api/categories/get-all-categories';
import useLocales from '@/locales/use-locales';
import { Icon } from '@/components/lucide-icon';
import { Input } from '@/components/ui/input';
import { SelectInput } from '@/components/ui/select-input';
import { Marketplace, ProductCondition } from '../../types';
import { SECONDARY_BTN_CLASS } from './constants';
import { ImagePicker } from './ImagePicker';
import { PricingCalculator } from './PricingCalculator';
import { StepFooter } from './StepFooter';
import { StockToggle } from './StockToggle';
import { ProductFormValues, SetField } from './use-product-form';
import { Product } from '@/types/product';

interface ReviewStepProps {
  values: ProductFormValues;
  setField: SetField;
  scrapedUrl?: string;
  onBack?: () => void;
  onNext: () => void;
  onCancel: () => void;
  onGenerateWithAi?: () => void;
  aiLoading?: boolean;
  // Edit mode: keep the stored retail price until the subcategory is changed
  preserveInitialPricing?: boolean;
  submitLabel?: string;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  values,
  setField,
  scrapedUrl,
  onBack,
  onNext,
  onCancel,
  onGenerateWithAi,
  aiLoading = false,
  preserveInitialPricing = false,
  submitLabel,
}) => {
  const { t } = useLocales();

  const { data: categories } = useGetCategories();

  const [subcategories, setSubcategories] = React.useState<{ value: string; label: string }[]>([]);
  const [margin, setMargin] = React.useState(0);
  const initialSubCategory = React.useRef(values.subCategory);

  const applyRetail = (newRetail: number) => {
    setField('retailPrice', newRetail);

    // Scale variant prices by the same proportion as the retail price change
    const oldRetail = values.retailPrice;
    if (oldRetail > 0 && newRetail !== oldRetail && values.variants.length > 0) {
      const ratio = newRetail / oldRetail;
      setField('variants', values.variants.map((v) => ({
        ...v,
        price: Math.ceil(Number(v.price) * ratio),
      })));
    }
  };

  const updateCost = (newCost: number) => {
    setField('usdPrice', newCost);
    const plus = Math.ceil(newCost * (margin / 100));
    applyRetail(newCost + Number(plus));
  };

  useEffect(() => {
    let subCategories: { value: string; label: string }[] = [];
    if (values.category) {
      subCategories = categories?.find((c) => c.id === values.category)?.subcategories.map((sc) => ({ value: String(sc.id), label: sc.title })) || [];
    } else {
      subCategories = categories?.flatMap((c) => (
        c.subcategories.map((sc) => ({ value: String(sc.id), label: sc.title }))
      )) || [];
    }
    setSubcategories(subCategories);
  }, [values.category, categories]);

  useEffect(() => {
    const allSubcategories = categories?.flatMap((c) => c.subcategories) || [];
    setMargin(allSubcategories.find((sc) => String(sc.id) === String(values.subCategory))?.markup || 0);
    if (preserveInitialPricing && values.subCategory === initialSubCategory.current) return;
    updateCost(values.usdPrice);
  }, [values.subCategory, categories, margin]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onNext();
      }}
      className="flex flex-col gap-5"
    >
      {scrapedUrl && (
        <div className="flex items-center gap-2 p-2.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-[12px] text-emerald-800 dark:text-emerald-300">
          <Icon name="check" className="text-[16px] flex-shrink-0" />
          <span className="flex-1 min-w-0 truncate">{t('scraped_review_notice', { url: scrapedUrl })}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Product Specifications & Pricing */}
        <div className="lg:col-span-7 flex flex-col gap-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              containerClassName="sm:col-span-2"
              label={t('product_title_req')}
              type="text"
              required
              value={values.title}
              onChange={(e) => setField('title', e.target.value)}
              placeholder={t('product_title_placeholder')}
            />
            <Input
              label={t('brand')}
              type="text"
              value={values.brand}
              onChange={(e) => setField('brand', e.target.value)}
              placeholder={t('brand_placeholder')}
            />
          </div>

          <SelectInput
            label={t('condition')}
            value={values.productCondition}
            onChange={(e) => setField('productCondition', e.target.value as ProductCondition)}
            options={[
              { value: 'new', label: t('condition_new') },
              { value: 'used', label: t('condition_used') },
              { value: 'refurbished', label: t('condition_reconditioned') },
            ]}
          />

          <Input
            isTextArea
            rows={3}
            label={t('description')}
            value={values.description}
            onChange={(e) => setField('description', e.target.value)}
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <SelectInput
              label={t('category')}
              value={values.category}
              onChange={(e) => setField('category', Number(e.target.value))}
              options={[
                { value: '0', label: t('select_category') },
                ...(categories?.map((c) => ({ value: String(c.id), label: c.title })) || []),
              ]}
            />
            <SelectInput
              label={t('subcategory')}
              value={values.subCategory}
              defaultValue="0"
              onChange={(e) => setField('subCategory', Number(e.target.value))}
              options={[
                { value: '0', label: t('select_subcategory') },
                ...subcategories
              ]}
            />
            <SelectInput
              label={t('source_channel')}
              value={values.seller}
              onChange={(e) => setField('seller', e.target.value as Marketplace)}
              options={[
                { value: 'other', label: t('direct_atelier_wholesale') },
                { value: 'amazon', label: t('amazon_us_prime_slash') },
                { value: 'bestbuy', label: t('bestbuy_us_prime_slash') },
                { value: 'ebay', label: t('ebay_luxury') },
                { value: 'walmart', label: 'Walmart US' },
              ]}
            />
          </div>

          <Input
            label={t('supplier_seller_credentials')}
            type="text"
            value={values.supplierInfo}
            onChange={(e) => setField('supplierInfo', e.target.value)}
            placeholder={t('supplier_placeholder')}
          />

          <PricingCalculator
            cost={values.usdPrice}
            retailPrice={values.retailPrice}
            onCostChange={updateCost}
            onRetailPriceChange={applyRetail}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Return policy"
              type="text"
              value={values.returnPolicy}
              onChange={(e) => setField('returnPolicy', e.target.value)}
            />
            <SelectInput
              label="Accepts returns"
              value={values.acceptReturn ? 'yes' : 'no'}
              onChange={(e) => setField('acceptReturn', e.target.value === 'yes')}
              options={[
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' },
              ]}
            />
          </div>

          <StockToggle inStock={values.available} onChange={(v) => setField('available', v)} />
        </div>

        {/* Right Column: Photography */}
        <div className="lg:col-span-5 flex flex-col gap-3.5">
          <ImagePicker images={values.images} altPrefix={values.title} onChange={(v) => setField('images', v)} />
          <StockToggle
            title={t('seller_choice')}
            description={t('seller_choice_desc')}
            inStock={values.sellerChoice}
            onChange={(v) => setField('sellerChoice', v)}
          />
          <StockToggle
            title={t('prime_delivery')}
            description={t('prime_delivery_desc')}
            inStock={values.primeDelivery}
            onChange={(v) => setField('primeDelivery', v)}
          />
          {onGenerateWithAi && (
            <button
              type="button"
              onClick={onGenerateWithAi}
              disabled={aiLoading}
              aria-busy={aiLoading}
              className={`${SECONDARY_BTN_CLASS} inline-flex items-center justify-center gap-1.5 w-full disabled:cursor-not-allowed disabled:opacity-80 ${aiLoading ? 'animate-pulse' : ''}`}
            >
              <Icon name="auto_awesome" className={`text-[16px] ${aiLoading ? 'animate-pulse' : ''}`} />
              {aiLoading ? t('ai_generating') : t('generate_and_translate_with_ai')}
            </button>
          )}
        </div>
      </div>

      <StepFooter
        onBack={onBack}
        onCancel={onCancel}
        submitLabel={submitLabel ?? t('next')}
        submitDisabled={!values.title.trim()}
      />
    </form>
  );
};
