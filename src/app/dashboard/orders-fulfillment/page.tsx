'use client';

import { useState } from 'react';
import { OrdersView } from '@/sections/orders-fulfillment/OrdersView';
import { TaxInvoiceModal } from '@/sections/orders-fulfillment/TaxInvoiceModal';
import { INITIAL_ORDERS } from '@/sections/orders-fulfillment/mockData';
import { Order } from '@/sections/orders-fulfillment/types';

export default function Page() {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);

  return (
    <>
      <OrdersView
        orders={orders}
        onUpdateOrder={(updated) =>
          setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)))
        }
        onOpenInvoice={setInvoiceOrder}
      />
      <TaxInvoiceModal
        order={invoiceOrder}
        isOpen={!!invoiceOrder}
        onClose={() => setInvoiceOrder(null)}
      />
    </>
  );
}
