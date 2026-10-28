import React, { useState } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useEditProduct } from '@/api/product/edit-product';
import { GET_SUMMARY_QUERY_KEY } from '@/api/product/get-summary';
import useLocales from '@/locales/use-locales';
import { Product } from '@/types/product';
import { Marketplace, ProductCondition } from '../../types';
import { Step } from '../add-product/constants';
import { ExtrasStep } from '../add-product/ExtrasStep';
import { ModalHeader } from '../add-product/ModalHeader';
import { ReviewStep } from '../add-product/ReviewStep';
import { Stepper } from '../add-product/Stepper';
import { ProductFormValues, useProductForm } from '../add-product/use-product-form';

const EDIT_STEPS: Step[] = ['review', 'extras'];
const MARKETPLACES: Marketplace[] = ['amazon', 'ebay', 'bestbuy', 'walmart', 'other'];
const CONDITIONS: ProductCondition[] = ['new', 'used', 'refurbished'];

// Seeds the shared product form from an existing catalog product (no scraping involved).
const toFormValues = (product: Product): Partial<ProductFormValues> => ({
  title: product.title ?? '',
  brand: product.brand ?? '',
  productCondition: CONDITIONS.find((c) => c === product.productCondition?.toLowerCase()) ?? 'new',
  category: product.category?.id ?? 0,
  subCategory: product.subcategory?.id ?? 0,
  seller: MARKETPLACES.find((m) => m === product.seller?.toLowerCase()) ?? 'other',
  scrappingUrl: product.scrappingUrl ?? '',
  usdPrice: product.usdPrice ?? 0,
  retailPrice: product.fullPrice ?? 0,
  description: product.description ?? '',
  available: product.isAvailable ?? true,
  acceptReturn: product.acceptReturn ?? false,
  sellerChoice: product.sellerChoice ?? false,
  primeDelivery: product.primeDelivery ?? false,
  returnPolicy: product.returnPolicy ?? '',
  customerSays: product.customerSays ?? '',
  overallRating: product.overallRating ?? 0,
  overallRatingsCounts: product.overallRatingsCounts ?? 0,
  images: (product.photos ?? []).filter((p) => !!p?.url).map((p) => ({ url: p.url })),
  details: (product.details ?? []).map((d) => ({ name: d.name, value: d.value })),
  features: [...(product.features ?? [])],
  variants: (product.variants ?? []).map((v, i) => ({
    id: String(v.id ?? `variant-${product.id}-${i}`),
    title: String(v.title ?? v.name ?? ''),
    price: Number(v.price ?? 0),
    image: String(v.image ?? v.photo ?? ''),
  })),
});

// New uploads are sent to the api as data URIs; their `url` is only a local blob preview.
const fileToDataUri = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

interface EditProductModalProps {
  product: Product;
  onClose: () => void;
}

// Mount it with `key={product.id}` so the form is seeded from the right product.
export const EditProductModal: React.FC<EditProductModalProps> = ({ product, onClose }) => {
  const { t } = useLocales();
  const queryClient = useQueryClient();
  const { mutateAsync: updateProduct, isPending } = useEditProduct();
  const { values, setField } = useProductForm(toFormValues(product));
  const [step, setStep] = useState<Step>('review');

  const editProduct = async () => {
    const title = values.title.trim();
    if (!title) {
      toast.error(t('titleRequired'));
      return;
    }
    if (!(values.usdPrice > 0) || !(values.retailPrice > 0)) {
      toast.error(t('priceRequired'));
      return;
    }
    if (values.variants.some((v) => !v.title.trim() || !(Number(v.price) >= 0))) {
      toast.error(t('variantsInvalid'));
      return;
    }

    // Drop half-filled rows the user left empty
    const details = values.details
      .map((d) => ({ name: d.name.trim(), value: d.value.trim() }))
      .filter((d) => d.name || d.value);
    if (details.some((d) => !d.name || !d.value)) {
      toast.error(t('detailsInvalid'));
      return;
    }
    const features = values.features.map((f) => f.trim()).filter(Boolean);

    const { images, variants, supplierInfo, category, ...rest } = values;
    try {
      const data = {
        ...rest,
        // The api rejects an unknown category, so only send it when one is set.
        ...(category ? { category } : {}),
        title,
        details,
        features,
        images: await Promise.all(
          images.map(async (img) => ({ url: img.file ? await fileToDataUri(img.file) : img.url })),
        ),
        variants: await Promise.all(
          variants.map(async (v) => ({
            id: v.id,
            title: v.title.trim(),
            price: v.price,
            image: v.imageFile ? await fileToDataUri(v.imageFile) : v.image,
          })),
        ),
      };
      await updateProduct({ productUid: product.uid ?? String(product.id), data });
    } catch {
      toast.error(t('productUpdateFailed'));
      return;
    }

    queryClient.invalidateQueries({ queryKey: ['GET_ALL_PRODUCTS'] });
    queryClient.invalidateQueries({ queryKey: GET_SUMMARY_QUERY_KEY });
    toast.success(t('productUpdated'));
    onClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 md:p-6"
    >
      <div className="bg-white dark:bg-[#131b2e] rounded-2xl max-w-4xl lg:max-w-5xl w-full p-5 sm:p-7 shadow-2xl border border-[#dce9ff] dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150 flex flex-col gap-5 max-h-[92vh] overflow-y-auto">
        <ModalHeader
          step={step}
          title={t('edit_product')}
          description={product.title}
          onClose={onClose}
        />
        <Stepper step={step} steps={EDIT_STEPS} />

        {step === 'review' && (
          <ReviewStep
            values={values}
            setField={setField}
            onNext={() => setStep('extras')}
            onCancel={onClose}
            preserveInitialPricing
          />
        )}

        {step === 'extras' && (
          <ExtrasStep
            values={values}
            setField={setField}
            onBack={() => setStep('review')}
            onSave={editProduct}
            onCancel={onClose}
            submitLabel={t('save_changes')}
            isSaving={isPending}
          />
        )}
      </div>
    </div>
  );
};
