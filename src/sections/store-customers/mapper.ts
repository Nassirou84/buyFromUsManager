import { ApiOrder } from '@/api/user/get-customer-orders';
import { ApiCustomer } from '@/api/user/get-customers';
import { Customer, CustomerOrder, CustomerSegment } from './types';

const NEW_CUSTOMER_DAYS = 30;
export const RECENT_ORDER_DAYS = 7;
const EMPTY = '—';

export const isRecentOrder = (order: CustomerOrder) =>
  !!order.createdAt && Date.now() - new Date(order.createdAt).getTime() <= RECENT_ORDER_DAYS * 86_400_000;

export const mapApiOrder = (order: ApiOrder): CustomerOrder => {
  const createdAt = new Date(order.createdAt);
  return {
    id: String(order.id),
    orderNumber: order.uid ?? `#${order.id}`,
    createdAt: order.createdAt,
    date: createdAt.toLocaleDateString(),
    time: createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    store: [order.city, order.state].filter(Boolean).join(', ') || EMPTY,
    items: (order.products ?? []).map((item) => {
      const photos = item.product?.photos ?? [];
      return {
        name: item.product?.title ?? EMPTY,
        variant: '',
        quantity: item.quantity ?? 1,
        price: item.unitPrice ?? 0,
        image: (photos.find((p) => p.isCover) ?? photos[0])?.url ?? '',
      };
    }),
    totalAmount: order.orderPrice ?? 0,
    taxIncludedPercent: 0,
    deliveryStatus: order.status ?? EMPTY,
    paymentMethod: EMPTY,
  };
};

const formatDate = (value?: string | null) => (value ? new Date(value).toLocaleDateString() : EMPTY);

// The backend has no segment field. Until it does, accounts younger than 30 days are "new", the rest "regular".
const segmentFor = (createdAt?: string | null): CustomerSegment => {
  if (!createdAt) return 'Régulier';
  const ageInDays = (Date.now() - new Date(createdAt).getTime()) / 86_400_000;
  return ageInDays <= NEW_CUSTOMER_DAYS ? 'Nouveau client' : 'Régulier';
};

export const mapApiCustomer = (user: ApiCustomer): Customer => {
  const firstName = user.firstName?.trim() ?? '';
  const lastName = user.lastName?.trim() ?? '';
  const name = `${firstName} ${lastName}`.trim() || user.email || `#${user.id}`;
  const avatarInitials = `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase() || name[0]?.toUpperCase() || '?';

  return {
    id: String(user.id),
    name,
    email: user.email ?? '',
    phone: user.phone ?? '',
    avatarInitials,
    segment: segmentFor(user.createdAt),
    isVerified: false,
    location: {
      city: user.city ?? EMPTY,
      district: user.state ?? EMPTY,
      address: user.street ?? '',
    },
    ordersCount: user.ordersCount ?? 0,
    lastSevenDaysOrdersCount: user.lastSevenDaysOrdersCount ?? 0,
    lastActivity: formatDate(user.lastLoginAt),
    ltv: 0,
    lastOrderAmount: 0,
    preferredPayment: EMPTY,
    memberSince: formatDate(user.createdAt),
    deliveryAddress: {
      residence: user.street ?? EMPTY,
      district: user.state ?? EMPTY,
      city: user.city ?? EMPTY,
      preferredTimeSlot: EMPTY,
      assignedCarrier: EMPTY,
    },
    crmNotes: '',
    loyaltyPoints: 0,
    orders: [],
  };
};
