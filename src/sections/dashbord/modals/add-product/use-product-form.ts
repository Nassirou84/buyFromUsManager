import { useState } from 'react';
import { Marketplace, ProductCondition, ProductDetail, ProductVariant } from '../../types';

// `file` is set for uploads (sent as binary); scraped images only carry a remote `url`.
export interface ProductImage {
  url: string;
  file?: File;
}

export interface ProductFormValues {
  title: string;
  brand: string;
  productCondition: ProductCondition;
  category: number;
  subCategory: number;
  seller: Marketplace;
  scrappingUrl: string;
  supplierInfo: string;
  usdPrice: number;
  retailPrice: number;
  description: string;
  available: boolean;
  acceptReturn: boolean;
  sellerChoice: boolean;
  primeDelivery: boolean;
  returnPolicy: string;
  customerSays: string;
  overallRating: number;
  overallRatingsCounts: number;
  images: ProductImage[];
  details: ProductDetail[];
  features: string[];
  variants: ProductVariant[];
}

const INITIAL_VALUES: ProductFormValues = {
  title: '',
  brand: '',
  productCondition: 'new',
  category: 0,
  subCategory: 0,
  seller: 'other',
  scrappingUrl: '',
  supplierInfo: '',
  usdPrice: 0,
  retailPrice: 0,
  description: '',
  available: true,
  acceptReturn: false,
  sellerChoice: false,
  primeDelivery: false,
  returnPolicy: '',
  customerSays: '',
  overallRating: 0,
  overallRatingsCounts: 0,
  images: [],
  details: [],
  features: [],
  variants: [],
};

// Shared form state for the review and extras steps; each step edits it through `setField`.
export function useProductForm(initialValues?: Partial<ProductFormValues>) {
  const [values, setValues] = useState<ProductFormValues>({ ...INITIAL_VALUES, ...initialValues });

  const setField = <K extends keyof ProductFormValues>(
    key: K,
    value: ProductFormValues[K] | ((prev: ProductFormValues[K]) => ProductFormValues[K]),
  ) =>
    setValues((prev) => ({
      ...prev,
      [key]: typeof value === 'function' ? (value as (p: ProductFormValues[K]) => ProductFormValues[K])(prev[key]) : value,
    }));

  const patch = (next: Partial<ProductFormValues>) => setValues((prev) => ({ ...prev, ...next }));

  const reset = () => setValues(INITIAL_VALUES);

  return { values, setField, patch, reset };
}

export type SetField = ReturnType<typeof useProductForm>['setField'];

// Uploaded files go out as binary `images[]` parts; scraped remote URLs as `imageUrls[]`.
export function buildProductFormData(values: ProductFormValues): FormData {
  const { images, details, features, variants, ...rest } = values;
  const fd = new FormData();
  Object.entries(rest).forEach(([key, value]) => fd.append(key, String(value)));
  images.forEach((img) => {
    if (img.file) fd.append('images[]', img.file, img.file.name);
    else fd.append('imageUrls[]', img.url);
  });
  fd.append('details', JSON.stringify(details));
  fd.append('features', JSON.stringify(features));
  // Variant images are file-only (scraped urls are ignored): metadata as JSON, files as `variantImages[<index>]`.
  fd.append('variants', JSON.stringify(variants.map(({ id, title, price }) => ({ id, title, price }))));
  variants.forEach((v, i) => {
    if (v.imageFile) fd.append(`variantImages[${i}]`, v.imageFile, v.imageFile.name);
  });
  return fd;
}
