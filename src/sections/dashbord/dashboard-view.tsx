"use client";
import { CatalogView } from './aside/CatalogView';
import { useState } from 'react';
import {
  SCRAPER_CHANNELS,
  MARKUP_RULES
} from './data/mockData';
import { MarkupRule } from './types';

export default function App() {

  const [globalSearch, setGlobalSearch] = useState('');

  const [channels] = useState(SCRAPER_CHANNELS);
  const [markupRules, setMarkupRules] = useState<MarkupRule[]>(MARKUP_RULES);


  return <CatalogView
    channels={channels}
    markupRules={markupRules}
    onUpdateRules={setMarkupRules}
    globalSearch={globalSearch}
  />
}
