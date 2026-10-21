import { useMutation } from '@tanstack/react-query';
import type { Marketplace, ProductDetail, ProductVariant } from '@/sections/dashbord/types';

export interface ScrapedProduct {
  title: string;
  brand: string;
  description: string;
  source: Marketplace;
  sourceId: string;
  supplier: string;
  sourceCost: number;
  category: string;
  subCategory: string;
  inStock: boolean;
  images: string[];
  details: ProductDetail[];
  features: string[];
  variants: Omit<ProductVariant, 'id'>[];
}

// TODO: no scraper endpoint exists on the backend yet. Replace the body of this
// function with `axios.post('/admin/products/scrape', { url })` returning a
// ScrapedProduct; the modal only depends on that shape.
export const scrapeProduct = async (url: string): Promise<ScrapedProduct> => {
  await new Promise((resolve) => setTimeout(resolve, 800));

  if (url.includes('ebay')) {
    return {
      title: 'Virgin Wool Peacoat Double Breasted',
      brand: 'Savile Row',
      description: 'Authentic Tailored Luxury Winter Peacoat Navy, virgin wool with satin lining.',
      source: 'ebay',
      sourceId: '#409218201',
      supplier: 'Savile Row Vintage Outlet',
      sourceCost: 195,
      category: 'Apparel',
      subCategory: 'Outerwear',
      inStock: true,
      images: ['https://images.unsplash.com/photo-1544022613-e87ce7526edb?auto=format&fit=crop&w=300&q=80'],
      details: [{ name: 'Material', value: 'Virgin wool' },{ name: 'Lining', value: 'Satin' }],
      features: ['Double breasted','Tailored fit'],
      variants: [{ title: 'Navy / M', price: 420, image: 'https://images.unsplash.com/photo-1544022613-e87ce7526edb?auto=format&fit=crop&w=300&q=80' },{ title: 'Navy / L', price: 420, image: 'https://images.unsplash.com/photo-1544022613-e87ce7526edb?auto=format&fit=crop&w=300&q=80' }],
    };
  }
  if (url.includes('aliexpress')) {
    return {
      title: 'Silk Touch Satin Pajama Set',
      brand: 'Suzhou Silk',
      description: '100% Mulberry Silk Blend Luxury Sleepwear.',
      source: 'aliexpress',
      sourceId: '#100500982',
      supplier: 'Suzhou Silk Crafts Co.',
      sourceCost: 42,
      category: 'Apparel',
      subCategory: 'Sleepwear',
      inStock: true,
      images: ['https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=300&q=80'],
      details: [{ name: 'Material', value: 'Mulberry silk blend' },{ name: 'Care', value: 'Hand wash' }],
      features: ['Silk touch finish','Two-piece set'],
      variants: [{ title: 'Ivory', price: 99, image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=300&q=80' },{ title: 'Champagne', price: 99, image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=300&q=80' }],
    };
  }
  return {
    title: 'Italian Merino Wool Turtleneck Sweater',
    brand: 'Milano Knit',
    description: 'Fine Gauge Pure Wool Knit Slim Fit Pullover.',
    source: 'amazon',
    sourceId: 'B08X49KL2P',
    supplier: 'Milano Knitwear Ltd',
    sourceCost: 75,
    category: 'Apparel',
    subCategory: 'Knitwear',
    inStock: true,
    images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=300&q=80'],
    details: [{ name: 'Material', value: 'Merino wool' },{ name: 'Fit', value: 'Slim' }],
    features: ['Fine gauge knit','Turtleneck collar'],
    variants: [{ title: 'Grey / M', price: 165, image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=300&q=80' },{ title: 'Black / M', price: 165, image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=300&q=80' }],
  };
};

export const useScrapeProduct = () =>
  useMutation({ mutationFn: (url: string) => scrapeProduct(url) });
