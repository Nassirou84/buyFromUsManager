'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import useLocales from '@/locales/use-locales';
import { useGetOrderByUid } from '@/api/user/get-order';
import { ORDER_DETAIL_SEED_KEY } from '@/api/order/get-orders';
import { OrderDetailView } from '@/sections/orders-fulfillment/OrderDetailView';
import { TaxInvoiceModal } from '@/sections/orders-fulfillment/TaxInvoiceModal';
import { PackagingSlipModal } from '@/sections/orders-fulfillment/PackagingSlipModal';
import { mapApiOrderToFulfillment } from '@/sections/orders-fulfillment/mapper';
import { Order } from '@/sections/orders-fulfillment/types';

export default function Page() {
  const { t } = useLocales();
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useParams();
  const uid = Array.isArray(params.uid) ? params.uid[0] : (params.uid ?? '');

  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [packagingSlipOrder, setPackagingSlipOrder] = useState<Order | null>(null);
  // Session-local edits (notes, dispatch) layered on top of the resolved order.
  const [edited, setEdited] = useState<Order | null>(null);

  // Seeded copy from the list (keyed by uid) for an instant paint; the authoritative
  // record is fetched by uid, so a hard refresh / deep link resolves on its own too.
  const seeded = queryClient.getQueryData<Order>([ORDER_DETAIL_SEED_KEY, uid]) ?? null;
  const { data: fetched } = useGetOrderByUid(uid || undefined, !!uid);

  const order = useMemo<Order | null>(() => {
    if (edited) return edited;
    if (fetched) return mapApiOrderToFulfillment(fetched, t);
    return seeded;
  }, [edited, fetched, seeded, t]);

  // Reset local edits when navigating to a different order.
  useEffect(() => setEdited(null), [uid]);

  const backToList = () => router.push('/dashboard/orders-fulfillment');

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <p className="text-[14px] text-[#565e74] dark:text-slate-400">{t('orders_load_error')}</p>
        <button
          type="button"
          onClick={backToList}
          className="text-[13px] font-semibold text-[#004ac6] dark:text-blue-400 hover:underline"
        >
          {t('back_to_orders')}
        </button>
      </div>
    );
  }

  return (
    <>
      <OrderDetailView
        order={order}
        onUpdateOrder={setEdited}
        onOpenInvoice={setInvoiceOrder}
        onOpenPackagingSlip={setPackagingSlipOrder}
        onBack={backToList}
      />
      <TaxInvoiceModal
        order={invoiceOrder}
        isOpen={!!invoiceOrder}
        onClose={() => setInvoiceOrder(null)}
      />
      <PackagingSlipModal
        order={packagingSlipOrder}
        isOpen={!!packagingSlipOrder}
        onClose={() => setPackagingSlipOrder(null)}
      />
    </>
  );
}
