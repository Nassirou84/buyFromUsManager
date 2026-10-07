import { DropshipProduct, Order, ScraperChannelStats, MarkupRule } from '../types';

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
    sourceMarketplace: 'aliexpress',
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

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1',
    orderNumber: '#ORD-2024-8902',
    customerName: 'Elena Vance',
    customerEmail: 'elena.vance@vancemedia.com',
    customerTier: 'Gold Tier Member',
    itemCount: 3,
    shippingMethod: 'Free Express Dispatch',
    totalAmount: 1388.8,
    subtotal: 1280.0,
    tax: 108.8,
    shippingCost: 0.0,
    status: 'processing',
    dateStr: 'Oct 24, 2024 at 14:22 PST',
    timestamp: 'Today, 14:22',
    slaRemaining: '48m remaining',
    paymentMethod: 'Paid via Visa •••• 4242',
    trackingNumber: 'DHL-SF-9048-2810-US',
    carrier: 'DHL Express Worldwide (Pre-selected)',
    warehouseHub: 'SF Warehouse Hub #03',
    shippingAddress: {
      name: 'Elena Vance',
      street: '450 Sutter St, Suite 1400',
      city: 'San Francisco',
      state: 'CA',
      zip: '94108',
      country: 'United States',
      phone: '+1 (415) 890-4491',
      avsVerified: true
    },
    items: [
      {
        id: 'item-1',
        title: 'Atelier Trench Coat',
        subtitle: 'Color: Camel • Size: 38R',
        sku: 'FB-TRC-018',
        price: 680.0,
        quantity: 1,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDQIdo7_fsxyOgL8_4sJYHyvFvOhYfLDe4FON1xCqtIO0TleI3YaTpclfeaaYdzIyFIrp1-LVOfkkgOM5SSDyLrI1wzpnzSJ1cLEyeP_sRZWBJZXbE5d2vBo3vlxI_yf-NxV5q1ncMp6Ene4ohIwToj1r6IVpWiTEz3VjQotwL49AlQU5FBoWPcUvb1_6qQnmNtVh0b7oM9X2IEgXLvKZUszpxhW3f1nJJsu42mA6FeFLUp0RxFnOA_',
        imageAlt: 'High-end atelier camel wool trench coat'
      },
      {
        id: 'item-2',
        title: 'Cashmere Ribbed Turtleneck',
        subtitle: 'Color: Ivory • Size: M',
        sku: 'FB-KN-091',
        price: 360.0,
        quantity: 1,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjJzp4TmtmolkazRi8at6n73JKin-ho0tzdiH_5Nu0VdBkA049g48wR5JK-2JBj-DL7mq4fMvHaVmuiPq7Jo4t2SFuRI2g4zv8rbaHKvknUx0sKdN68aoWln31QkmFogYC-WwPVekrx6n-YvyjFV-Z5LC6xG6tFwtCEtbWiDmpq1IoMBjHwpTcjuLsztQdZm1zWdxz6CRNvp7mQNTEY9IiES_ltCR6uofcU5cFbi9lH3YE_WWPts4C',
        imageAlt: 'Luxurious ribbed ivory cashmere turtleneck'
      },
      {
        id: 'item-3',
        title: 'Leather Cardholder',
        subtitle: 'Color: Cognac • Fine Grain Calfskin',
        sku: 'FB-ACC-004',
        price: 240.0,
        quantity: 1,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDojhRc_74rt8LEpQk7wa13rjsvoiVZ8balIxM8l2TZGwCA2YFWfVjQyLnFSRng3NlovfHRAT_E_GfCOSfCuYp2hU0TuWjdZmIy9aM0fHDg8LXf1DNKm36xTjLd4vPb-s095PnfG9KwU_jErMWjo4uIiu0XhrIHhhl2pIw29UBtyx2KU1YqEed2DRMjPd2kfrn9tEcR98le2Ipts5cRkrPke7aAo50sfxp2BeuDQwWmzMymr483Dnth',
        imageAlt: 'Handcrafted artisan cognac brown leather cardholder'
      }
    ],
    notes: [
      {
        author: 'Marcus (Concierge Lead)',
        timestamp: 'Today, 14:26',
        text: 'Gift packaging requested - hand-written atelier welcome note included with signature wax seal #4. Elena is a VIP client returning after the Spring runway showcase.'
      }
    ],
    steps: [
      { title: 'Order Placed', time: '14:22 PST', status: 'completed' },
      { title: 'Payment Cleared', time: '14:23 PST', status: 'completed' },
      { title: 'Fulfillment & Packing', time: 'In Progress', status: 'in_progress' },
      { title: 'Courier Handover', time: 'Pending', status: 'pending' },
      { title: 'Delivered', time: 'ETA Oct 26', status: 'pending' }
    ]
  },
  {
    id: 'ord-2',
    orderNumber: '#ORD-2024-8901',
    customerName: 'Marcus Chen',
    customerEmail: 'm.chen@venturecap.sg',
    customerTier: 'Silver Member',
    itemCount: 1,
    shippingMethod: 'DHL Express',
    totalAmount: 420.0,
    subtotal: 388.0,
    tax: 32.0,
    shippingCost: 0.0,
    status: 'shipped',
    dateStr: 'Oct 24, 2024 at 13:45 PST',
    timestamp: 'Today, 13:45',
    paymentMethod: 'Paid via Apple Pay',
    trackingNumber: '#DHL-9921448201',
    carrier: 'DHL Express Worldwide',
    warehouseHub: 'SF Warehouse Hub #03',
    shippingAddress: {
      name: 'Marcus Chen',
      street: '725 Green St, Apt 4B',
      city: 'San Francisco',
      state: 'CA',
      zip: '94133',
      country: 'United States',
      phone: '+1 (415) 321-9870',
      avsVerified: true
    },
    items: [
      {
        id: 'item-201',
        title: 'Atelier Heritage Trench',
        subtitle: 'Color: Camel • Size: 40R',
        sku: 'FB-EBY-4412-CML',
        price: 389.0,
        quantity: 1,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDQIdo7_fsxyOgL8_4sJYHyvFvOhYfLDe4FON1xCqtIO0TleI3YaTpclfeaaYdzIyFIrp1-LVOfkkgOM5SSDyLrI1wzpnzSJ1cLEyeP_sRZWBJZXbE5d2vBo3vlxI_yf-NxV5q1ncMp6Ene4ohIwToj1r6IVpWiTEz3VjQotwL49AlQU5FBoWPcUvb1_6qQnmNtVh0b7oM9X2IEgXLvKZUszpxhW3f1nJJsu42mA6FeFLUp0RxFnOA_',
        imageAlt: 'Atelier Heritage Trench'
      }
    ],
    notes: [
      {
        author: 'Shipping Bot',
        timestamp: 'Today, 14:02',
        text: 'Electronic shipping label generated. Awaiting courier pick-up scan.'
      }
    ],
    steps: [
      { title: 'Order Placed', time: '13:45 PST', status: 'completed' },
      { title: 'Payment Cleared', time: '13:46 PST', status: 'completed' },
      { title: 'Fulfillment & Packing', time: 'Completed', status: 'completed' },
      { title: 'Courier Handover', time: '14:05 PST', status: 'completed' },
      { title: 'Delivered', time: 'In Transit', status: 'in_progress' }
    ]
  },
  {
    id: 'ord-3',
    orderNumber: '#ORD-2024-8900',
    customerName: 'Sophia Laurent',
    customerEmail: 'sophia@laurentdesign.fr',
    customerTier: 'Platinum Elite Member',
    itemCount: 5,
    shippingMethod: 'Standard Courier',
    totalAmount: 2450.0,
    subtotal: 2280.0,
    tax: 170.0,
    shippingCost: 0.0,
    status: 'delivered',
    dateStr: 'Oct 24, 2024 at 12:10 PST',
    timestamp: 'Today, 12:10',
    paymentMethod: 'Paid via Amex Centurion •••• 1004',
    trackingNumber: 'UPS-1Z9999999999',
    carrier: 'UPS Next Day Air',
    warehouseHub: 'NY Logistics Hub #01',
    shippingAddress: {
      name: 'Sophia Laurent',
      street: '150 Central Park South, Penthouse B',
      city: 'New York',
      state: 'NY',
      zip: '10019',
      country: 'United States',
      phone: '+1 (212) 555-0199',
      avsVerified: true
    },
    items: [
      {
        id: 'item-301',
        title: 'Cashmere Blend Overcoat',
        subtitle: 'Color: Navy • Size: 38L',
        sku: 'FB-AMZ-8821-NVY',
        price: 289.0,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1544022613-e87ce7526edb?auto=format&fit=crop&w=300&q=80',
        imageAlt: 'Navy coat'
      }
    ],
    notes: [
      {
        author: 'Dispatch Desk',
        timestamp: 'Today, 12:55',
        text: 'Signed by front desk concierge Jean-Luc.'
      }
    ],
    steps: [
      { title: 'Order Placed', time: '12:10 PST', status: 'completed' },
      { title: 'Payment Cleared', time: '12:11 PST', status: 'completed' },
      { title: 'Fulfillment & Packing', time: 'Completed', status: 'completed' },
      { title: 'Courier Handover', time: '12:30 PST', status: 'completed' },
      { title: 'Delivered', time: 'Signed at Desk', status: 'completed' }
    ]
  },
  {
    id: 'ord-4',
    orderNumber: '#ORD-2024-8899',
    customerName: 'David Kim',
    customerEmail: 'dkim@archstudio.io',
    customerTier: 'Gold Tier Member',
    itemCount: 2,
    shippingMethod: 'Standard Courier',
    totalAmount: 890.0,
    subtotal: 820.0,
    tax: 70.0,
    shippingCost: 0.0,
    status: 'delivered',
    dateStr: 'Oct 24, 2024 at 10:30 PST',
    timestamp: 'Today, 10:30',
    paymentMethod: 'Paid via Mastercard',
    trackingNumber: 'FEDEX-980128471',
    carrier: 'FedEx Priority Overnight',
    warehouseHub: 'SF Warehouse Hub #03',
    shippingAddress: {
      name: 'David Kim',
      street: '88 Colin P Kelly Jr St',
      city: 'San Francisco',
      state: 'CA',
      zip: '94107',
      country: 'United States',
      phone: '+1 (415) 777-2033',
      avsVerified: true
    },
    items: [
      {
        id: 'item-401',
        title: 'Structured Wool Blazer',
        subtitle: 'Color: Charcoal • Size: 42R',
        sku: 'FB-EBY-5012-BLK',
        price: 345.0,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=300&q=80',
        imageAlt: 'Wool blazer'
      }
    ],
    notes: [],
    steps: [
      { title: 'Order Placed', time: '10:30 PST', status: 'completed' },
      { title: 'Payment Cleared', time: '10:31 PST', status: 'completed' },
      { title: 'Fulfillment & Packing', time: 'Completed', status: 'completed' },
      { title: 'Courier Handover', time: '11:15 PST', status: 'completed' },
      { title: 'Delivered', time: 'Delivered', status: 'completed' }
    ]
  },
  {
    id: 'ord-5',
    orderNumber: '#ORD-2024-8898',
    customerName: 'Charlotte Dubois',
    customerEmail: 'c.dubois@modeparis.com',
    customerTier: 'Regular Member',
    itemCount: 1,
    shippingMethod: 'Customer Requested',
    totalAmount: 165.0,
    subtotal: 165.0,
    tax: 0.0,
    shippingCost: 0.0,
    status: 'cancelled',
    dateStr: 'Oct 23, 2024 at 18:20 PST',
    timestamp: 'Yesterday',
    paymentMethod: 'Refunded to Visa •••• 8820',
    warehouseHub: 'SF Warehouse Hub #03',
    shippingAddress: {
      name: 'Charlotte Dubois',
      street: '12 Boulevard Saint-Germain',
      city: 'Paris',
      state: 'IDF',
      zip: '75005',
      country: 'France',
      phone: '+33 1 42 68 55 00',
      avsVerified: true
    },
    items: [
      {
        id: 'item-501',
        title: 'Merino Minimalist Knit',
        subtitle: 'Color: Charcoal • Size: S',
        sku: 'FB-ALI-7731-CHR',
        price: 149.0,
        quantity: 1,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjJzp4TmtmolkazRi8at6n73JKin-ho0tzdiH_5Nu0VdBkA049g48wR5JK-2JBj-DL7mq4fMvHaVmuiPq7Jo4t2SFuRI2g4zv8rbaHKvknUx0sKdN68aoWln31QkmFogYC-WwPVekrx6n-YvyjFV-Z5LC6xG6tFwtCEtbWiDmpq1IoMBjHwpTcjuLsztQdZm1zWdxz6CRNvp7mQNTEY9IiES_ltCR6uofcU5cFbi9lH3YE_WWPts4C',
        imageAlt: 'Merino knit'
      }
    ],
    notes: [
      {
        author: 'Support Agent Chloe',
        timestamp: 'Yesterday, 19:10',
        text: 'Buyer ordered wrong size and requested immediate cancellation before courier dispatch.'
      }
    ],
    steps: [
      { title: 'Order Placed', time: '18:20 PST', status: 'completed' },
      { title: 'Payment Cleared', time: '18:21 PST', status: 'completed' },
      { title: 'Cancellation Requested', time: '18:45 PST', status: 'completed' },
      { title: 'Refund Dispatched', time: 'Full Refund $165.00', status: 'completed' },
      { title: 'Order Closed', time: 'Voided', status: 'completed' }
    ]
  },
  {
    id: 'ord-6',
    orderNumber: '#ORD-2024-8897',
    customerName: "Liam O'Connor",
    customerEmail: 'liam.oc@dublintech.ie',
    customerTier: 'Silver Member',
    itemCount: 2,
    shippingMethod: 'Standard Courier',
    totalAmount: 650.0,
    subtotal: 610.0,
    tax: 40.0,
    shippingCost: 0.0,
    status: 'delivered',
    dateStr: 'Oct 23, 2024 at 16:04 PST',
    timestamp: 'Yesterday',
    paymentMethod: 'Paid via PayPal',
    trackingNumber: 'DHL-UK-3920194',
    carrier: 'DHL Express Worldwide',
    warehouseHub: 'London Gateway Hub #02',
    shippingAddress: {
      name: "Liam O'Connor",
      street: '24 Fitzwilliam Square',
      city: 'Dublin',
      state: 'Leinster',
      zip: 'D02 HP27',
      country: 'Ireland',
      phone: '+353 1 676 1122',
      avsVerified: true
    },
    items: [
      {
        id: 'item-601',
        title: 'Silk Twill Graphic Scarf',
        subtitle: 'Color: Ivory Print • 90x90cm',
        sku: 'FB-AMZ-104-IVR',
        price: 89.0,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=300&q=80',
        imageAlt: 'Silk scarf'
      }
    ],
    notes: [],
    steps: [
      { title: 'Order Placed', time: '16:04 PST', status: 'completed' },
      { title: 'Payment Cleared', time: '16:05 PST', status: 'completed' },
      { title: 'Fulfillment & Packing', time: 'Completed', status: 'completed' },
      { title: 'Courier Handover', time: '17:00 PST', status: 'completed' },
      { title: 'Delivered', time: 'Delivered to recipient', status: 'completed' }
    ]
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
