"use client";
import { CatalogView } from './aside/CatalogView';
import { useState } from 'react';
import {
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  SCRAPER_CHANNELS,
  MARKUP_RULES
} from './data/mockData';
import { DropshipProduct, Order, MarkupRule } from './types';

export default function App() {

  const [globalSearch, setGlobalSearch] = useState('');

  const [products, setProducts] = useState<DropshipProduct[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [channels] = useState(SCRAPER_CHANNELS);
  const [markupRules, setMarkupRules] = useState<MarkupRule[]>(MARKUP_RULES);


  return <CatalogView
    products={products}
    channels={channels}
    markupRules={markupRules}
    onUpdateProducts={setProducts}
    onUpdateRules={setMarkupRules}
    globalSearch={globalSearch}
  />
}
