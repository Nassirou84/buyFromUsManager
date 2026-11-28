'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import {
  PRODUCT_RETURNS_PAGE_SIZE,
  type ProductReturnStatus,
  useGetProductReturns,
} from '@/api/returns/get-product-returns';
import { RETURN_DETAIL_SEED_KEY } from '@/api/returns/get-product-return';
import { mapApiProductReturn } from './mapper';
import {
  type RefundFilter,
  ReturnsFilterBar,
  ReturnsHeader,
  ReturnsMetrics,
  ReturnsPagination,
  ReturnsQueue,
  type StatusTab,
} from './components';

export const ReturnsView: React.FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<StatusTab>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [refundFilter, setRefundFilter] = useState<RefundFilter>('all');
  const [page, setPage] = useState(1);

  const [debouncedSearch] = useDebounce(searchQuery, 400);

  // Any change to the filters narrows the result set, so the list goes back to the
  // first page whenever the search text, status tab or refund type changes.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, activeTab, refundFilter]);

  // Server-side filters map straight onto the backend collection filters:
  // `status` (exact), `refundtype` (exact) and `keyword` (partial on uid / order uid).
  const statusValues: ProductReturnStatus[] | undefined =
    activeTab === 'All' ? undefined : [activeTab];
  const refundType = refundFilter === 'all' ? undefined : refundFilter;
  const { data, isLoading, isFetching } = useGetProductReturns(
    page,
    statusValues,
    refundType,
    debouncedSearch.trim() || undefined,
  );

  const totalItems = data?.totalItems ?? 0;
  const rmas = useMemo(() => (data?.returns ?? []).map(mapApiProductReturn), [data]);

  // Seed the clicked (already-mapped) return so the [uid] page paints instantly,
  // then navigate; the detail page still fetches the authoritative record by uid.
  const openReturn = (uid: string): void => {
    const seed = rmas.find((r) => r.id === uid);
    if (seed) queryClient.setQueryData([RETURN_DETAIL_SEED_KEY, uid], seed);
    router.push(`/dashboard/returns-rmas/${uid}`);
  };

  return (
    <div className="flex flex-col w-full gap-5">
      <ReturnsHeader />
      <ReturnsMetrics />
      <ReturnsFilterBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        refundFilter={refundFilter}
        onRefundFilterChange={setRefundFilter}
      />
      <ReturnsQueue
        rmas={rmas}
        totalItems={totalItems}
        isLoading={isLoading}
        isFetching={isFetching}
        onOpen={openReturn}
        footer={
          !isLoading && totalItems > 0 && (
            <ReturnsPagination
              page={page}
              pageSize={PRODUCT_RETURNS_PAGE_SIZE}
              totalItems={totalItems}
              shownCount={rmas.length}
              onPageChange={setPage}
            />
          )
        }
      />
    </div>
  );
};
