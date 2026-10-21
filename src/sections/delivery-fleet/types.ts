export type CourierStatus = 'En Route' | 'Available' | 'Off Shift' | 'Near Capacity' | 'Idle at Hub';

export interface Courier {
  id: string;
  name: string;
  vehicleType: 'electric_car' | 'pedal_bike' | 'local_shipping';
  vehicleNumber: string;
  zone: string;
  status: CourierStatus;
  currentStops: number;
  maxStops: number;
  batteryPercent: number;
  nextStopEta: string;
  currentStopNumber: number;
  isVipSpecialist?: boolean;
}

export interface DispatchOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  address: string;
  itemsCount: number;
  totalValue: number;
  slaRemaining: string;
  slaMinutes: number;
  type: 'VIP White-Glove' | 'Same-Day Express' | 'Standard Concierge';
  matchedCourier: string;
  matchAffinity: number;
  matchReason: string;
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
