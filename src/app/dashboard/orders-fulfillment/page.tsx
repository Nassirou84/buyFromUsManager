'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import useLocales from '@/locales/use-locales';
import useGetOrders, { ORDER_DETAIL_SEED_KEY, OrderSort, DEFAULT_ORDER_SORT } from '@/api/order/get-orders';
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

  // Debounce the uid search so each keystroke doesn't hit the backend.
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(timeout);
  }, [search]);

  // "all" fetches every status; otherwise the backend filters on the exact status.
  const statusValues = statusFilter === 'all' ? undefined : [statusFilter];
  const { data, isLoading, isFetching } = useGetOrders(1, statusValues, debouncedSearch || undefined, sort);
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
      onStatusFilterChange={setStatusFilter}
      sortValue={sort}
      onSortChange={setSort}
      searchValue={search}
      onSearchChange={setSearch}
      onScanOrder={(uid) => router.push(`/dashboard/orders-fulfillment/${encodeURIComponent(uid)}`)}
      onOpenOrder={(order) => {
        // Seed the detail page so it paints immediately, then navigate by uid.
        queryClient.setQueryData([ORDER_DETAIL_SEED_KEY, order.uid], order);
        router.push(`/dashboard/orders-fulfillment/${encodeURIComponent(order.uid)}`);
      }}
    />
  );
}
