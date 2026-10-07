'use client';

import { useState } from 'react';
import { OrdersView } from '@/sections/dashbord/components/orders/OrdersView';
import { TaxInvoiceModal } from '@/sections/dashbord/modals/TaxInvoiceModal';
import { INITIAL_ORDERS } from '@/sections/dashbord/data/mockData';
import { Order } from '@/sections/dashbord/types';

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
