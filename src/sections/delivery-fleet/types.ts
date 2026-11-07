export type CourierStatus = 'En Route' | 'Available' | 'Off Shift' | 'Near Capacity' | 'Idle at Hub';

export interface Courier {
  id: string;
  name: string;
  status: CourierStatus;
  currentStops: number;
  // Real delivery counts from the drivers-list endpoint.
  assignedCount?: number;
  completedCount?: number;
  email?: string;
  // Fleet metadata the backend doesn't model yet; only present on mock/sample couriers.
  vehicleType?: 'electric_car' | 'pedal_bike' | 'local_shipping';
  vehicleNumber?: string;
  zone?: string;
  maxStops?: number;
  batteryPercent?: number;
  nextStopEta?: string;
  currentStopNumber?: number;
  isVipSpecialist?: boolean;
}

export interface DispatchOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  address: string;
  itemsCount: number;
  totalValue: number;
  // Real flag from the order record; priority orders are highlighted in the queue.
  isPriority?: boolean;
  // Fleet/SLA/matching metadata the backend doesn't model; only on mock/sample orders.
  slaRemaining?: string;
  slaMinutes?: number;
  type?: 'VIP White-Glove' | 'Same-Day Express' | 'Standard Concierge';
  matchedCourier?: string;
  matchAffinity?: number;
  matchReason?: string;
  isSelected?: boolean;
}

export interface RouteStop {
  id: string;
  stopNumber: number;
  title: string;
  orderNumber?: string;
  status: 'completed' | 'current' | 'upcoming';
  time: string;
  details: string;
  isHighValueVault?: boolean;
}
