export interface SubCategory {
  id: string;
  title: string;
  icon: string;
  description: string;
  productLength: number;
  createdAt: string;
  markup: number;
}

export interface Category {
  [key: string]: any;
  id: string;
  title: string;
  icon: string;
  description: string;
  productLength: number;
  createdAt: string;
  subcategories: SubCategory[];
}