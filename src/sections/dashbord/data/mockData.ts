import { DropshipProduct, ScraperChannelStats, MarkupRule } from '../types';

export const INITIAL_PRODUCTS: DropshipProduct[] = [
  {
    id: 'prod-1',
    sku: 'FB-AMZ-8821-NVY',
    title: 'Cashmere Blend Overcoat',
    scrapedSubtitle: 'Amazon: "Men\'s Luxury Italian Wool Blend Winter Tailored..."',
    sourceMarketplace: 'amazon',
    sourceLabel: 'AMAZON US',
    sourceId: 'B08N5WRNW',
    sourceUrl: 'https://amazon.com/dp/B08N5WRNW',
    supplierInfo: 'Seller: Milano Imports LLC',
    category: 'Apparel',
    subCategory: 'Trench Coats',
    sourceCost: 145.0,
    retailPrice: 289.0,
    markupPercent: 99.3,
    marginPercent: 49.8,
    syncStatus: 'synced',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1544022613-e87ce7526edb?auto=format&fit=crop&w=300&q=80',
    imageAlt: 'Navy cashmere wool overcoat tailored silhouette',
    lastSyncTime: '3 mins ago'
  },
  {
    id: 'prod-2',
    sku: 'FB-EBY-4412-CML',
    title: 'Atelier Heritage Trench',
    scrapedSubtitle: 'eBay: "Heritage British Camel Gabardine Storm Trench..."',
    sourceMarketplace: 'ebay',
    sourceLabel: 'EBAY LUX',
    sourceId: '#3948192841',
    sourceUrl: 'https://ebay.com/itm/3948192841',
    supplierInfo: 'Top Rated Plus • 99.8%',
    category: 'Apparel',
    subCategory: 'Trench Coats',
    sourceCost: 180.0,
    retailPrice: 389.0,
    markupPercent: 116.0,
    marginPercent: 53.7,
    syncStatus: 'synced',
    inStock: true,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDQIdo7_fsxyOgL8_4sJYHyvFvOhYfLDe4FON1xCqtIO0TleI3YaTpclfeaaYdzIyFIrp1-LVOfkkgOM5SSDyLrI1wzpnzSJ1cLEyeP_sRZWBJZXbE5d2vBo3vlxI_yf-NxV5q1ncMp6Ene4ohIwToj1r6IVpWiTEz3VjQotwL49AlQU5FBoWPcUvb1_6qQnmNtVh0b7oM9X2IEgXLvKZUszpxhW3f1nJJsu42mA6FeFLUp0RxFnOA_',
    imageAlt: 'Heritage camel trench coat with horn buttons',
    lastSyncTime: '6 mins ago'
  },
  {
    id: 'prod-3',
    sku: 'FB-AMZ-9901-CGN',
    title: 'Italian Calfskin Weekender',
    scrapedSubtitle: 'Amazon: "Full Grain Leather Duffle Bag Vintage Travel..."',
    sourceMarketplace: 'amazon',
    sourceLabel: 'AMAZON PRIME',
    sourceId: 'B09JQK149M',
    sourceUrl: 'https://amazon.com/dp/B09JQK149M',
    supplierInfo: 'Supplier Listing Inactive',
    category: 'Leather Goods',
    subCategory: 'Weekender Duffles',
    sourceCost: 290.0,
    retailPrice: 580.0,
    markupPercent: 100.0,
    marginPercent: 50.0,
    syncStatus: 'depleted',
    statusLabel: 'Automated Paused: Out of Stock Enabled',
    inStock: false,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=300&q=80',
    imageAlt: 'Full grain cognac calfskin leather weekender bag',
    lastSyncTime: '12 mins ago'
  },
  {
    id: 'prod-4',
    sku: 'FB-ALI-7731-CHR',
    title: 'Merino Minimalist Knit',
    scrapedSubtitle: 'AliExpress: "100% Australian Merino Wool Pullover S..."',
    sourceMarketplace: 'other',
    sourceLabel: 'ALI DIRECT',
    sourceId: '#100500582',
    sourceUrl: 'https://aliexpress.com/item/100500582.html',
    supplierInfo: 'Hangzhou Wool Mills Direct',
    category: 'Apparel',
    subCategory: 'Cashmere Knitwear',
    sourceCost: 38.0,
    retailPrice: 149.0,
    markupPercent: 292.0,
    marginPercent: 74.5,
    syncStatus: 'synced',
    inStock: true,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjJzp4TmtmolkazRi8at6n73JKin-ho0tzdiH_5Nu0VdBkA049g48wR5JK-2JBj-DL7mq4fMvHaVmuiPq7Jo4t2SFuRI2g4zv8rbaHKvknUx0sKdN68aoWln31QkmFogYC-WwPVekrx6n-YvyjFV-Z5LC6xG6tFwtCEtbWiDmpq1IoMBjHwpTcjuLsztQdZm1zWdxz6CRNvp7mQNTEY9IiES_ltCR6uofcU5cFbi9lH3YE_WWPts4C',
    imageAlt: 'Minimalist merino ribbed knit sweater folded',
    lastSyncTime: '8 mins ago'
  },
  {
    id: 'prod-5',
    sku: 'FB-EBY-5012-BLK',
    title: 'Structured Wool Blazer',
    scrapedSubtitle: 'eBay: "Tailored Onyx Virgin Wool Single-Breasted At..."',
    sourceMarketplace: 'ebay',
    sourceLabel: 'EBAY LUX',
    sourceId: '#2250198214',
    sourceUrl: 'https://ebay.com/itm/2250198214',
    supplierInfo: 'Boutique Archive UK',
    category: 'Apparel',
    subCategory: 'Blazers',
    sourceCost: 165.0,
    retailPrice: 345.0,
    markupPercent: 109.0,
    marginPercent: 52.2,
    syncStatus: 'synced',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=300&q=80',
    imageAlt: 'Black structured virgin wool tailored blazer',
    lastSyncTime: '15 mins ago'
  },
  {
    id: 'prod-6',
    sku: 'FB-AMZ-104-IVR',
    title: 'Silk Twill Graphic Scarf',
    scrapedSubtitle: 'Amazon: "100% Pure Mulberry Silk Scarf Hand Rolled..."',
    sourceMarketplace: 'amazon',
    sourceLabel: 'AMAZON PRIME',
    sourceId: 'B07WQ8P90X',
    sourceUrl: 'https://amazon.com/dp/B07WQ8P90X',
    supplierInfo: 'Fulfilled by Amazon Prime',
    category: 'Jewelry & Acc',
    subCategory: 'Silk Scarves',
    sourceCost: 28.5,
    retailPrice: 89.0,
    markupPercent: 212.0,
    marginPercent: 68.0,
    syncStatus: 'price_shifted',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=300&q=80',
    imageAlt: 'Silk twill square graphic print scarf',
    lastSyncTime: '1 min ago'
  },
  {
    id: 'prod-7',
    sku: 'FB-ACC-004',
    title: 'Artisan Leather Cardholder',
    scrapedSubtitle: 'Amazon: "Handcrafted Cognac Calfskin Minimalist Card Case..."',
    sourceMarketplace: 'amazon',
    sourceLabel: 'AMAZON US',
    sourceId: 'B08F91KQ41',
    sourceUrl: 'https://amazon.com/dp/B08F91KQ41',
    supplierInfo: 'Artisan Workshop Firenze',
    category: 'Leather Goods',
    subCategory: 'Small Accessories',
    sourceCost: 95.0,
    retailPrice: 240.0,
    markupPercent: 152.0,
    marginPercent: 60.4,
    syncStatus: 'synced',
    inStock: true,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDojhRc_74rt8LEpQk7wa13rjsvoiVZ8balIxM8l2TZGwCA2YFWfVjQyLnFSRng3NlovfHRAT_E_GfCOSfCuYp2hU0TuWjdZmIy9aM0fHDg8LXf1DNKm36xTjLd4vPb-s095PnfG9KwU_jErMWjo4uIiu0XhrIHhhl2pIw29UBtyx2KU1YqEed2DRMjPd2kfrn9tEcR98le2Ipts5cRkrPke7aAo50sfxp2BeuDQwWmzMymr483Dnth',
    imageAlt: 'Handcrafted artisan cognac brown leather cardholder',
    lastSyncTime: '5 mins ago'
  }
];

export const SCRAPER_CHANNELS: ScraperChannelStats[] = [
  {
    id: 'chan-1',
    name: 'Amazon US Pipeline',
    badge: 'ASIN API',
    rateLimitUsed: 48,
    rateLimitStatus: 'Optimal',
    activeSkus: 840,
    successRate: 99.8
  },
  {
    id: 'chan-2',
    name: 'eBay Luxury Crawler',
    badge: 'REST + DOM',
    rateLimitUsed: 62,
    rateLimitStatus: 'Good',
    activeSkus: 420,
    successRate: 98.9
  },
  {
    id: 'chan-3',
    name: 'AliExpress Direct',
    badge: 'VIP Gateway',
    rateLimitUsed: 31,
    rateLimitStatus: 'Fast',
    activeSkus: 222,
    successRate: 99.1
  }
];

export const MARKUP_RULES: MarkupRule[] = [
  {
    id: 'rule-1',
    category: 'Apparel > Outerwear',
    formula: 'Supplier Cost + 95% Markup + $15 Flat',
    estimatedMargin: 54,
    isActive: true
  },
  {
    id: 'rule-2',
    category: 'Leather Goods & Weekenders',
    formula: 'Supplier Cost + 110% Markup',
    estimatedMargin: 62,
    isActive: true
  },
  {
    id: 'rule-3',
    category: 'Silk & Small Accessories',
    formula: 'Supplier Cost + 180% Markup',
    estimatedMargin: 72,
    isActive: true
  }
];

export const CATEGORIES_TREE = [
  {
    name: 'Apparel',
    items: ['Trench Coats', 'Blazers', 'Cashmere Knitwear', 'Evening Wear', 'Trousers'],
    productCount: 890
  },
  {
    name: 'Leather Goods',
    items: ['Weekender Duffles', 'Tote Bags', 'Small Accessories', 'Belts & Wallets'],
    productCount: 340
  },
  {
    name: 'Jewelry & Accessories',
    items: ['Silk Scarves', 'Sunglasses', 'Fine Watches', 'Cufflinks'],
    productCount: 252
  }
];
