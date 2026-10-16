export interface SubCategory {
  id: number;
  title: string;
  icon: string;
  description: string;
  productLength: number;
  createdAt: string;
  markup: number;
}

export interface Category {
  '@id': string;
  '@type': string;
  id: number;
  title: string;
  icon: string;
  description: string;
  productLength: number;
  createdAt: string;
  subcategories: SubCategory[];
}