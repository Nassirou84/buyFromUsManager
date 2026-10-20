'use client';

import { useState } from 'react';
import { FaqsView } from '@/sections/faqs/FaqsView';
import { INITIAL_FAQ_CATEGORIES } from '@/sections/faqs/mockData';
import { FaqCategory } from '@/sections/faqs/types';

export default function Page() {
  const [categories, setCategories] = useState<FaqCategory[]>(INITIAL_FAQ_CATEGORIES);

  return <FaqsView categories={categories} onUpdateCategories={setCategories} />;
}
