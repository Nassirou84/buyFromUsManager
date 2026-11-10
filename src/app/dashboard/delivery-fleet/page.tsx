'use client';

import { useState } from 'react';
import { DeliveryFleetView } from '@/sections/delivery-fleet/DeliveryFleetView';
import { INITIAL_ROUTE_STOPS } from '@/sections/delivery-fleet/mockData';
import { Courier, DispatchOrder, RouteStop } from '@/sections/delivery-fleet/types';

export default function Page() {
  // Couriers and the unassigned queue are seeded from live endpoints inside DeliveryFleetView.
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [dispatchOrders, setDispatchOrders] = useState<DispatchOrder[]>([]);
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
