'use client';

import { useState } from 'react';
import { ReturnsView } from '@/sections/returns-rmas/ReturnsView';
import { INITIAL_RMAS } from '@/sections/returns-rmas/mockData';
import { RmaItem } from '@/sections/returns-rmas/types';

export default function Page() {
  const [rmas, setRmas] = useState<RmaItem[]>(INITIAL_RMAS);

  return (
    <ReturnsView
      rmas={rmas}
      onUpdateRma={(updated) => setRmas((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))}
      onAddRma={(rma) => setRmas((prev) => [rma, ...prev])}
    />
  );
}
