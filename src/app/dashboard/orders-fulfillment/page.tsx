'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import useLocales from '@/locales/use-locales';
import useGetOrders, { ORDER_DETAIL_SEED_KEY, ORDERS_PAGE_SIZE, OrderSort, DEFAULT_ORDER_SORT } from '@/api/order/get-orders';
import useGetOrderSummary from '@/api/order/get-summary';
import { OrdersView } from '@/sections/orders-fulfillment/OrdersView';
import { RawOrderStatus } from '@/sections/orders-fulfillment/types';
import { mapApiOrderToFulfillment } from '@/sections/orders-fulfillment/mapper';

export default function Page() {
  const { t } = useLocales();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<'all' | RawOrderStatus>('all');
  const [sort, setSort] = useState<OrderSort>(DEFAULT_ORDER_SORT);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);

  // Debounce the uid search so each keystroke doesn't hit the backend.
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(timeout);
  }, [search]);

  // Any narrowing of the result set invalidates the current page number, so the
  // list goes back to the first page whenever the search text changes.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  // "all" fetches every status; otherwise the backend filters on the exact status.
  const statusValues = statusFilter === 'all' ? undefined : [statusFilter];
  const { data, isLoading, isFetching } = useGetOrders(page, statusValues, debouncedSearch || undefined, sort);
  const { data: summary } = useGetOrderSummary();

  const orders = useMemo(
    () => (data?.orders ?? []).map((o) => mapApiOrderToFulfillment(o, t)),
    [data, t]
  );

  return (
    <OrdersView
      orders={orders}
      summary={summary}
      isLoading={isLoading}
      isFetching={isFetching}
      statusFilter={statusFilter}
      onStatusFilterChange={(status) => {
        setStatusFilter(status);
        setPage(1);
      }}
      sortValue={sort}
      onSortChange={(value) => {
        setSort(value);
        setPage(1);
      }}
      searchValue={search}
      onSearchChange={setSearch}
      page={page}
      pageSize={ORDERS_PAGE_SIZE}
      totalItems={data?.totalItems ?? 0}
      onPageChange={setPage}
      onScanOrder={(uid) => router.push(`/dashboard/orders-fulfillment/${encodeURIComponent(uid)}`)}
      onOpenOrder={(order) => {
        // Seed the detail page so it paints immediately, then navigate by uid.
        queryClient.setQueryData([ORDER_DETAIL_SEED_KEY, order.uid], order);
        router.push(`/dashboard/orders-fulfillment/${encodeURIComponent(order.uid)}`);
      }}
    />
  );
}
