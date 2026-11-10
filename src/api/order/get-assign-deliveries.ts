import axios from "@/utils/axios";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export const GET_ASSIGN_DELIVERIES_QUERY_KEY = 'GET_ASSIGN_DELIVERIES';

// The order fields exposed through the assignDelivery:read serialization group.
export interface AssignDeliveryOrder {
  uid?: string | null;
  fullName?: string | null;
  street?: string | null;
  city?: string | null;
  state?: string | null;
  status?: string | null;
  phone?: string | null;
  isPriority?: boolean | null;
  estimatedDeliveryAt?: string | null;
}

export interface ApiAssignDelivery {
  id: number;
  createdAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  signedName?: string | null;
  isCompleted: boolean;
  // The driver has started this trip but not yet completed it.
  isStarted?: boolean | null;
  assignOrder?: AssignDeliveryOrder | null;
}

// GET /driver/{driver}/assign-deliveries (HOST_API already includes /api) — the API Platform
// collection of deliveries assigned to a driver. We ask for plain JSON so the response is a
// bare array rather than a JSON-LD/Hydra envelope.
export const getAssignDeliveries = async (
  driverId: number | string,
): Promise<ApiAssignDelivery[]> => {
  const response = await axios.get(`/driver/${driverId}/assign-deliveries`, {
    headers: { Accept: 'application/json' },
  });
  const data = response.data;
  if (Array.isArray(data)) return data;
  // Fallback for a Hydra-shaped response, depending on the API Platform version.
  return data?.['member'] ?? data?.['hydra:member'] ?? [];
};

const useGetAssignDeliveries = (driverId?: number | string | null) =>
  useQuery({
    queryKey: [GET_ASSIGN_DELIVERIES_QUERY_KEY, driverId],
    queryFn: () => getAssignDeliveries(driverId as number | string),
    enabled: driverId != null && driverId !== '',
    placeholderData: keepPreviousData,
  });

export { useGetAssignDeliveries };
export default useGetAssignDeliveries;
