import { photo } from './photo';
import Category, { Subcategory } from './category';

type Variant = {
  [key: string]: string | number;
}

type ProductDetail = {
  name: string;
  value: string;
};

interface Product {
  '@id': string;
  '@type': string;
  id: number;
  title?: string;
  category?: Category;
  subcategory?: Subcategory;
  variants?: Variant[];
  createdAt?: string;
  updatedAt?: string;
  scrappingUrl?: string;
  seller?: string;
  brand?: string;
  photos?: photo[];
  description?: string;
  usdPrice?: number;
  available?: boolean;
  goodForAdd?: boolean;
  status?: string;
  uid?: string | null;
  lastScrappingAt?: string;
  productCondition?: string;
  acceptReturn?: boolean;
  returnPolicy?: string;
  overallRating?: number;
  overallRatingsCounts?: number;
  customerSays?: string | null;
  features?: string[];
  details?: ProductDetail[];
  slug?: string;
  actualPrice?: number;
  primeDelivery?: boolean;
  sellerChoice?: boolean;
}

export { Product, Variant };