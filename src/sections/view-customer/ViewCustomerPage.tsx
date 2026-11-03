'use client';

import useLocales from '@/locales/use-locales';
import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import useGetCustomerOrders from '@/api/user/get-customer-orders';
import useGetCustomer from '@/api/user/get-customer';
import { GET_CUSTOMER_DETAIL_QUERY_KEY } from '@/api/user/get-customers';
import { Customer, CustomerOrder } from '@/sections/store-customers/types';
import { isRecentOrder, mapApiCustomer, mapApiOrder } from '@/sections/store-customers/mapper';
import { InvoicePdfModal } from '@/sections/store-customers/InvoicePdfModal';
import { OrderDetailsModal } from '@/sections/store-customers/OrderDetailsModal';
import {
  AddressesCard,
  BackButton,
  CustomerHeader,
  CustomerUnavailable,
  IdentityCard,
  OrdersHistoryCard,
} from './components';

const ViewCustomerPage = () => {
  const { t } = useLocales();
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : (params.id ?? '');

  const [invoiceOrder, setInvoiceOrder] = useState<CustomerOrder | null>(null);
  const [detailOrder, setDetailOrder] = useState<CustomerOrder | null>(null);

  // The customer is loaded from the backend on mount. The list seeds a lighter copy
  // into the cache when a row is opened, so navigating there paints instantly while
  // the authoritative record (with the saved addresses) is fetched.
  const seeded = queryClient.getQueryData<Customer>([GET_CUSTOMER_DETAIL_QUERY_KEY, id]) ?? null;
  // Customers added locally have no backend id, so only numeric ids are fetched; those fall back to the seeded copy.
  const customerQuery = useGetCustomer(id || undefined, /^\d+$/.test(id));
  const customer = useMemo(
    () => (customerQuery.data ? mapApiCustomer(customerQuery.data) : seeded),
    [customerQuery.data, seeded]
  );

  const backToList = () => router.push('/dashboard/store-customers');

  // Customers added locally have no backend id, so only numeric ids are fetched.
  const ordersQuery = useGetCustomerOrders(id, /^\d+$/.test(id));
  const fetchedOrders = ordersQuery.data?.pages.flatMap((p) => p.orders.map(mapApiOrder));
  const totalOrders = customer?.ordersCount ?? 0;

  // Newest first, with the orders of the last 7 days grouped on top.
  const orders = useMemo(() => {
    const all = [...(fetchedOrders ?? customer?.orders ?? [])];
    const byDateDesc = (a: CustomerOrder, b: CustomerOrder) =>
      new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
    const recent = all.filter(isRecentOrder).sort(byDateDesc);
    const earlier = all.filter((o) => !isRecentOrder(o)).sort(byDateDesc);
    return [...recent, ...earlier];
  }, [fetchedOrders, customer?.orders]);
  const recentCount = customer?.lastSevenDaysOrdersCount ?? orders.filter(isRecentOrder).length;

  if (!customer) {
    return <CustomerUnavailable loading={customerQuery.isLoading} onBack={backToList} />;
  }

  // The footer loads more orders from the server when the list is backed by the
  // infinite query, and otherwise nudges the user to the full history.
  const showLoadMore = fetchedOrders ? ordersQuery.hasNextPage : true;
  const onLoadMore = fetchedOrders
    ? () => ordersQuery.fetchNextPage()
    : () => toast.info(t('customers_toast_full_history'));
  const loadMoreCount = fetchedOrders ? totalOrders : customer.ordersCount;

  return (
    <div className="flex flex-col w-full gap-5">
      <BackButton onClick={backToList} />

      <CustomerHeader customer={customer} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        <IdentityCard customer={customer} />
        <AddressesCard addresses={customer.addresses} customerName={customer.name} />
      </div>

      <OrdersHistoryCard
        customerName={customer.name}
        orders={orders}
        totalOrders={totalOrders}
        recentCount={recentCount}
        onSelectOrder={setDetailOrder}
        onViewInvoice={setInvoiceOrder}
        onResendNotification={(order) =>
          toast.success(t('customers_toast_notification', { order: order.orderNumber }))
        }
        onPrintStatement={() => {
          toast.success(t('customers_toast_statement', { name: customer.name }));
          window.print();
        }}
        isLoadingOrders={ordersQuery.isLoading}
        isOrdersError={ordersQuery.isError}
        showLoadMore={showLoadMore}
        loadMoreDisabled={ordersQuery.isFetchingNextPage}
        loadMoreCount={loadMoreCount}
        onLoadMore={onLoadMore}
      />

      <OrderDetailsModal
        isOpen={!!detailOrder}
        onClose={() => setDetailOrder(null)}
        order={detailOrder}
        onViewInvoice={setInvoiceOrder}
      />

      <InvoicePdfModal
        isOpen={!!invoiceOrder}
        onClose={() => setInvoiceOrder(null)}
        customer={customer}
        order={invoiceOrder}
      />
    </div>
  );
};

export default ViewCustomerPage;
