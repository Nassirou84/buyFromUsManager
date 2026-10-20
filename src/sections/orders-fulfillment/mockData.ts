import { Order } from './types';

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
