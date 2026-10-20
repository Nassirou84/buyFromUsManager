'use client';

import { useState } from 'react';
import { DeliveryFleetView } from '@/sections/delivery-fleet/DeliveryFleetView';
import { INITIAL_COURIERS, INITIAL_DISPATCH_ORDERS, INITIAL_ROUTE_STOPS } from '@/sections/delivery-fleet/mockData';
import { Courier, DispatchOrder, RouteStop } from '@/sections/delivery-fleet/types';

export default function Page() {
  const [couriers, setCouriers] = useState<Courier[]>(INITIAL_COURIERS);
  const [dispatchOrders, setDispatchOrders] = useState<DispatchOrder[]>(INITIAL_DISPATCH_ORDERS);
  const [routeStops] = useState<RouteStop[]>(INITIAL_ROUTE_STOPS);

  return (
    <DeliveryFleetView
      couriers={couriers}
      dispatchOrders={dispatchOrders}
      routeStops={routeStops}
      onUpdateCouriers={setCouriers}
      onUpdateDispatchOrders={setDispatchOrders}
    />
  );
}
