import useLocales from '@/locales/use-locales';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Icon } from '@/components/lucide-icon';
import { Courier, CourierStatus, DispatchOrder, RouteStop } from './types';
import { AddDriverModal, NewDriverPayload } from './modals/AddDriverModal';
import useCreateDriver from '@/api/user/create-driver';
import useGetDrivers, { ApiDriver, GET_DRIVERS_QUERY_KEY } from '@/api/user/get-drivers';
import useGetOrdersAwaitingDelivery, { GET_ORDERS_AWAITING_DELIVERY_QUERY_KEY } from '@/api/order/get-orders-awaiting-delivery';
import useBatchAssignDelivery from '@/api/order/batch-assign-delivery';
import useGetAssignDeliveries from '@/api/order/get-assign-deliveries';
import { ApiOrder } from '@/api/user/get-customer-orders';

interface DeliveryFleetViewProps {
  couriers: Courier[];
  dispatchOrders: DispatchOrder[];
  routeStops: RouteStop[];
  onUpdateCouriers: (couriers: Courier[]) => void;
  onUpdateDispatchOrders: (orders: DispatchOrder[]) => void;
}

type RosterFilter = 'All' | 'Available' | 'En Route' | 'Off Shift';

const ROSTER_FILTERS: { key: RosterFilter; labelKey: string }[] = [
  { key: 'All', labelKey: 'fleet_filter_all' },
  { key: 'Available', labelKey: 'fleet_filter_available' },
  { key: 'En Route', labelKey: 'fleet_filter_en_route' },
  { key: 'Off Shift', labelKey: 'fleet_filter_off_shift' },
];

const STATUS_LABEL_KEYS: Record<CourierStatus, string> = {
  'En Route': 'fleet_status_en_route',
  Available: 'fleet_status_available',
  'Off Shift': 'fleet_status_off_shift',
  'Near Capacity': 'fleet_status_near_capacity',
  'Idle at Hub': 'fleet_status_idle',
};

const CARD = 'bg-white dark:bg-[#131b2e] rounded-xl border border-[#e5eeff] dark:border-slate-800 shadow-2xs';
const KPI_LABEL = 'text-[11px] font-semibold text-[#565e74] dark:text-slate-400 uppercase tracking-wider';
const KPI_FOOT = 'mt-4 pt-2.5 flex items-center justify-between text-[#565e74] dark:text-slate-400 text-[11px] bg-[#eff4ff]/60 dark:bg-slate-800/60 px-2.5 py-1.5 rounded-lg';

const matchesFilter = (c: Courier, filter: RosterFilter) => {
  if (filter === 'All') return true;
  if (filter === 'Available') return c.status === 'Idle at Hub' || c.status === 'Available';
  if (filter === 'En Route') return c.status === 'En Route' || c.status === 'Near Capacity';
  return c.status === 'Off Shift';
};

export const DeliveryFleetView: React.FC<DeliveryFleetViewProps> = ({
  couriers,
  dispatchOrders,
  routeStops,
  onUpdateCouriers,
  onUpdateDispatchOrders,
}) => {
  const { t } = useLocales();
  const queryClient = useQueryClient();
  const { mutate: createDriver, isPending: isCreatingDriver } = useCreateDriver();
  const { mutate: batchAssignDelivery, isPending: isBatchAssigning } = useBatchAssignDelivery();
  const { data: driversData } = useGetDrivers();
  const { data: awaitingData } = useGetOrdersAwaitingDelivery();
  const [selectedCourierId, setSelectedCourierId] = useState<string>(couriers[0]?.id || '');
  const [activeRosterFilter, setActiveRosterFilter] = useState<RosterFilter>('All');
  const [rosterPage, setRosterPage] = useState(1);
  const [itineraryFilter, setItineraryFilter] = useState<'out_for_delivery' | 'completed'>('out_for_delivery');
  const [isAutoAssigning, setIsAutoAssigning] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isAddDriverOpen, setIsAddDriverOpen] = useState(false);

  const selectedCourier = couriers.find((c) => c.id === selectedCourierId) || couriers[0];
  // Deliveries assigned to the selected courier, filtered by the itinerary toolbar.
  const { data: assignDeliveries = [], isLoading: isLoadingDeliveries } = useGetAssignDeliveries(selectedCourier?.id);
  const itineraryDeliveries = assignDeliveries.filter((d) =>
    itineraryFilter === 'completed' ? d.isCompleted : !d.isCompleted
  );

  // Group deliveries that share the same address so multi-order stops show together.
  const deliveryAddress = (d: (typeof itineraryDeliveries)[number]) =>
    [d.assignOrder?.street, d.assignOrder?.city, d.assignOrder?.state].filter(Boolean).join(', ');
  const itineraryGroups = itineraryDeliveries.reduce<
    { key: string; address: string; deliveries: typeof itineraryDeliveries }[]
  >((groups, delivery) => {
    const address = deliveryAddress(delivery);
    // Deliveries without an address stay ungrouped (unique key per delivery).
    const key = address ? address.trim().toLowerCase() : `no-address-${delivery.id}`;
    const group = groups.find((g) => g.key === key);
    if (group) {
      group.deliveries.push(delivery);
    } else {
      groups.push({ key, address, deliveries: [delivery] });
    }
    return groups;
  }, []);
  // Batch assignments go to the hub courier (courier-3 in the sample data)
  const batchCourier = couriers.find((c) => c.id === 'courier-3') || selectedCourier;
  const selectedOrdersCount = dispatchOrders.filter((o) => o.isSelected).length;

  // The backend only exposes a driver's identity and delivery counts; fleet-specific
  // fields (vehicle, zone, battery, capacity) aren't modelled, so we keep only real data.
  const mapDriverToCourier = (driver: ApiDriver): Courier => {
    const name = `${driver.firstName ?? ''} ${driver.lastName ?? ''}`.trim() || (driver.email ?? `Driver #${driver.id}`);
    const pending = driver.allPendingDeliveries ?? 0;
    return {
      id: String(driver.id),
      name,
      email: driver.email ?? undefined,
      status: pending > 0 ? 'En Route' : 'Idle at Hub',
      currentStops: pending,
      assignedCount: driver.allAssignedDeliveries ?? 0,
      completedCount: driver.allCompletedDeliveries ?? 0,
    };
  };

  // Seed the roster from the live drivers list once it loads (replacing the mock couriers).
  useEffect(() => {
    if (driversData?.drivers) {
      onUpdateCouriers(driversData.drivers.map(mapDriverToCourier));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driversData]);

  // The orders-awaiting-delivery endpoint returns plain order records; the SLA, courier
  // matching and service-type fields aren't modelled, so we keep only real order data.
  const mapOrderToDispatch = (order: ApiOrder): DispatchOrder => ({
    id: order.uid ?? String(order.id),
    orderNumber: order.uid ?? `#${order.id}`,
    customerName: order.fullName ?? '',
    address: [order.street, order.city, order.state, order.country].filter(Boolean).join(', '),
    itemsCount: order.products?.reduce((n, p) => n + (p.quantity ?? 1), 0) ?? 0,
    totalValue: order.orderPrice ?? 0,
    isPriority: order.isPriority ?? false,
  });

  // Seed the unassigned queue from the live awaiting-delivery orders once they load.
  useEffect(() => {
    if (awaitingData?.orders) {
      onUpdateDispatchOrders(awaitingData.orders.map(mapOrderToDispatch));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [awaitingData]);

  const handleToggleSelectOrder = (orderId: string) => {
    onUpdateDispatchOrders(
      dispatchOrders.map((o) => (o.id === orderId ? { ...o, isSelected: !o.isSelected } : o))
    );
  };

  const handleBatchAssign = () => {
    const selectedOrders = dispatchOrders.filter((o) => o.isSelected);
    if (selectedOrders.length === 0 || !batchCourier) {
      toast.error(t('fleet_toast_no_selection'));
      return;
    }

    batchAssignDelivery(
      {
        driver_id: batchCourier.id,
        // DispatchOrder.id holds the order uid (see mapOrderToDispatch).
        orders: selectedOrders.map((o) => ({ uid: o.id })),
      },
      {
        onSuccess: () => {
          // Drop the assigned orders from the queue and bump the courier's load so
          // the UI updates immediately, then let the server data win on refetch.
          onUpdateDispatchOrders(dispatchOrders.filter((o) => !o.isSelected));
          onUpdateCouriers(
            couriers.map((c) =>
              c.id === batchCourier.id
                ? {
                    ...c,
                    status: 'En Route' as const,
                    currentStops: c.currentStops + selectedOrders.length,
                    nextStopEta: t('fleet_assigned_stops', { count: selectedOrders.length }),
                  }
                : c
            )
          );
          queryClient.invalidateQueries({ queryKey: [GET_ORDERS_AWAITING_DELIVERY_QUERY_KEY] });
          queryClient.invalidateQueries({ queryKey: [GET_DRIVERS_QUERY_KEY] });
          toast.success(t('fleet_toast_batch_assigned', { count: selectedOrders.length, name: batchCourier.name }));
        },
        onError: () => {
          toast.error(t('fleet_toast_batch_failed'));
        },
      }
    );
  };

  const handleAutoAssign = () => {
    setIsAutoAssigning(true);
    toast.info(t('fleet_toast_optimizing'));

    setTimeout(() => {
      setIsAutoAssigning(false);
      onUpdateCouriers(
        couriers.map((c) => {
          if (c.id === batchCourier.id) {
            return { ...c, status: 'En Route' as const, currentStops: 4, nextStopEta: t('fleet_depot_dispatch') };
          }
          if (c.id === 'courier-1' || c.id === 'courier-2') {
            return { ...c, currentStops: Math.min(c.maxStops ?? Infinity, c.currentStops + 1) };
          }
          return c;
        })
      );
      onUpdateDispatchOrders([]);
      toast.success(t('fleet_toast_auto_assigned', { count: 12 }));
    }, 1200);
  };

  const handleExportManifest = () => {
    if (!selectedCourier) return;
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      const manifestText = t('fleet_manifest_text', {
        date: new Date().toLocaleString(),
        courier: selectedCourier.name,
        vehicle: selectedCourier.vehicleNumber ?? '—',
        zone: selectedCourier.zone ?? '—',
        stops: routeStops.map((s) => `${s.title} - ${s.status} (${s.time})`).join('\n'),
      });
      const blob = new Blob([manifestText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `manifest_${selectedCourier.name.replace(/[^a-z0-9]/gi, '_')}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(t('fleet_toast_manifest', { name: selectedCourier.name }));
    }, 800);
  };

  const handleAddDriver = (payload: NewDriverPayload) => {
    const name = `${payload.firstName} ${payload.lastName}`.trim();
    createDriver(payload, {
      onSuccess: () => {
        // Refetch the drivers list so the roster reflects the server state.
        queryClient.invalidateQueries({ queryKey: [GET_DRIVERS_QUERY_KEY] });
        setIsAddDriverOpen(false);
        toast.success(t('fleet_toast_courier_added', { name }));
      },
      onError: () => {
        toast.error(t('fleet_driver_create_failed'));
      },
    });
  };

  const filteredCouriers = couriers.filter((c) => matchesFilter(c, activeRosterFilter));
  const countFor = (filter: RosterFilter) => couriers.filter((c) => matchesFilter(c, filter)).length;

  // Client-side pagination for the courier roster.
  const ROSTER_PAGE_SIZE = 6;
  const rosterTotalPages = Math.max(1, Math.ceil(filteredCouriers.length / ROSTER_PAGE_SIZE));
  const rosterSafePage = Math.min(rosterPage, rosterTotalPages);
  const pagedCouriers = filteredCouriers.slice(
    (rosterSafePage - 1) * ROSTER_PAGE_SIZE,
    rosterSafePage * ROSTER_PAGE_SIZE
  );

  // Reset to the first page whenever the roster filter changes.
  useEffect(() => {
    setRosterPage(1);
  }, [activeRosterFilter]);

  const getStatusBadge = (courier: Courier) => {
    if (courier.isVipSpecialist) {
      return (
        <span className="px-2.5 py-1 bg-[#dae2fd] text-[#004ac6] text-[11px] rounded-full flex items-center gap-1 font-semibold">
          <Icon name="verified" className="text-[12px]" />
          {t('fleet_vip_specialist')}
        </span>
      );
    }
    if (courier.status === 'Near Capacity') {
      return (
        <span className="px-2.5 py-1 bg-[#ffdbcd] text-[#943700] text-[11px] rounded-full font-semibold">
          {t(STATUS_LABEL_KEYS[courier.status])}
        </span>
      );
    }
    if (courier.status === 'En Route') {
      return (
        <span className="px-2.5 py-1 bg-[#dae2fd] text-[#131b2e] text-[11px] rounded-full flex items-center gap-1.5 font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#2563eb] animate-pulse"></span>
          {t(STATUS_LABEL_KEYS[courier.status])}
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 bg-[#e5eeff] dark:bg-slate-700 text-[#0b1c30] dark:text-white text-[11px] rounded-full font-semibold">
        {t(STATUS_LABEL_KEYS[courier.status])}
      </span>
    );
  };

  return (
    <div className="flex flex-col w-full gap-6">
      <AddDriverModal
        isOpen={isAddDriverOpen}
        onClose={() => setIsAddDriverOpen(false)}
        onSubmit={handleAddDriver}
        isSubmitting={isCreatingDriver}
      />

      {/* Operational header & real-time pulse */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1 text-[#565e74] dark:text-slate-400 text-[11px]">
            <span>{t('fleet_breadcrumb_ops')}</span>
            <Icon name="chevron_right" className="text-[14px]" />
            <span className="text-[#004ac6] dark:text-blue-400 font-semibold">{t('fleet_breadcrumb_fleet')}</span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-[#0b1c30] dark:text-white tracking-tight">{t('fleet_title')}</h1>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#e5eeff] dark:bg-slate-800 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#004ac6] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#004ac6]"></span>
              </span>
              <span className="text-[11px] text-[#0b1c30] dark:text-slate-200">{t('fleet_active_couriers', { count: 18 })}</span>
              <span className="text-[#737686] text-[11px]">•</span>
              <span className="text-[11px] text-[#0b1c30] dark:text-white font-semibold">{t('fleet_sla', { value: '94.6%' })}</span>
              <span className="text-[#737686] text-[11px]">•</span>
              <span className="text-[11px] text-[#565e74] dark:text-slate-300">{t('fleet_zones', { count: 3 })}</span>
            </div>
          </div>

          <p className="text-[13px] text-[#565e74] dark:text-slate-400 max-w-3xl">{t('fleet_desc')}</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportManifest}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-[#131b2e] hover:bg-[#eff4ff] dark:hover:bg-slate-800 text-[#0b1c30] dark:text-white text-[13px] rounded-lg shadow-2xs transition-colors font-semibold border border-[#e5eeff] dark:border-slate-700 disabled:opacity-60"
            type="button"
          >
            <Icon name={isExporting ? 'sync' : 'ios_share'} className={`text-[18px] ${isExporting ? 'animate-spin' : ''}`} />
            <span>{isExporting ? t('fleet_exporting') : t('fleet_export_manifest')}</span>
          </button>

          <button
            onClick={() => setIsAddDriverOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-[#131b2e] hover:bg-[#eff4ff] dark:hover:bg-slate-800 text-[#0b1c30] dark:text-white text-[13px] rounded-lg shadow-2xs transition-colors font-semibold border border-[#e5eeff] dark:border-slate-700"
            type="button"
          >
            <Icon name="add_circle" className="text-[18px]" />
            <span>{t('fleet_add_courier')}</span>
          </button>

          <button
            onClick={handleAutoAssign}
            disabled={isAutoAssigning}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#2563eb] hover:bg-[#004ac6] text-white text-[13px] rounded-lg transition-all shadow-md font-semibold disabled:opacity-60"
            type="button"
          >
            <Icon name={isAutoAssigning ? 'autorenew' : 'magic_button'} className={`text-[18px] ${isAutoAssigning ? 'animate-spin' : ''}`} />
            <span>{isAutoAssigning ? t('fleet_optimizing') : t('fleet_auto_assign', { count: 12 })}</span>
          </button>
        </div>
      </div>

      {/* KPI tier */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className={`${CARD} p-5 flex flex-col justify-between`}>
          <div className="flex items-start justify-between">
            <div>
              <span className={KPI_LABEL}>{t('fleet_kpi_on_duty')}</span>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="text-2xl text-[#0b1c30] dark:text-white font-bold">18</span>
                <span className="text-[13px] text-[#565e74] dark:text-slate-400">{t('fleet_of_drivers', { count: 22 })}</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#eff4ff] dark:bg-slate-800 flex items-center justify-center text-[#004ac6] dark:text-blue-400">
              <Icon name="two_wheeler" className="text-[22px]" />
            </div>
          </div>
          <div className={KPI_FOOT}>
            <span className="text-[#004ac6] dark:text-blue-400 font-semibold">{t('fleet_n_en_route', { count: 14 })}</span>
            <span>{t('fleet_n_idle', { count: 4 })}</span>
            <span>{t('fleet_n_break', { count: 2 })}</span>
          </div>
        </div>

        <div className={`${CARD} p-5 flex flex-col justify-between`}>
          <div className="flex items-start justify-between">
            <div>
              <span className={KPI_LABEL}>{t('fleet_kpi_in_transit')}</span>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="text-2xl text-[#0b1c30] dark:text-white font-bold">64</span>
                <span className="text-[13px] text-[#004ac6] dark:text-blue-400 font-semibold">{t('fleet_vs_peak', { value: '+18.4%' })}</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#eff4ff] dark:bg-slate-800 flex items-center justify-center text-[#004ac6] dark:text-blue-400">
              <Icon name="local_shipping" className="text-[22px]" />
            </div>
          </div>
          <div className={KPI_FOOT}>
            <span>{t('fleet_zone_sf_metro')}: <strong>38</strong></span>
            <span>{t('fleet_zone_east_bay')}: <strong>16</strong></span>
            <span>{t('fleet_zone_peninsula')}: <strong>10</strong></span>
          </div>
        </div>

        <div className={`${CARD} p-5 flex flex-col justify-between`}>
          <div className="flex items-start justify-between">
            <div>
              <span className={KPI_LABEL}>{t('fleet_kpi_unassigned')}</span>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="text-2xl text-[#bc4800] font-bold">{dispatchOrders.length}</span>
                <span className="text-[13px] text-[#565e74] dark:text-slate-400">{t('fleet_orders_ready')}</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#ffdbcd] flex items-center justify-center text-[#bc4800]">
              <Icon name="pending_actions" className="text-[22px]" />
            </div>
          </div>
          <div className={KPI_FOOT}>
            <span className="text-[#bc4800] font-semibold">{t('fleet_oldest_waiting', { time: '18m' })}</span>
            <span>{t('fleet_n_vip', { count: 3 })}</span>
          </div>
        </div>

        <div className={`${CARD} p-5 flex flex-col justify-between`}>
          <div className="flex items-start justify-between">
            <div>
              <span className={KPI_LABEL}>{t('fleet_kpi_avg_window')}</span>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="text-2xl text-[#0b1c30] dark:text-white font-bold">
                  42<span className="text-[13px] font-normal">m</span>
                </span>
                <span className="text-[11px] text-[#004ac6] dark:text-blue-400 font-medium">{t('fleet_target', { value: '<60m' })}</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#eff4ff] dark:bg-slate-800 flex items-center justify-center text-[#004ac6] dark:text-blue-400">
              <Icon name="timer" className="text-[22px]" />
            </div>
          </div>
          <div className="mt-4 pt-2.5 flex items-center gap-1.5">
            <div className="w-full bg-[#e5eeff] dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div className="bg-[#2563eb] h-full rounded-full" style={{ width: '70%' }}></div>
            </div>
            <span className="text-[11px] text-[#565e74] dark:text-slate-400 whitespace-nowrap">{t('fleet_target_budget', { value: '70%' })}</span>
          </div>
        </div>
      </div>

      {/* Dual-panel operations grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Courier roster */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className={`${CARD} p-4 flex flex-col gap-4`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Icon name="badge" className="text-[20px] text-[#004ac6] dark:text-blue-400" />
                <span className="text-[15px] text-[#0b1c30] dark:text-white font-bold">{t('fleet_roster_title')}</span>
              </div>
              <span className="px-1.5 py-0.5 bg-[#dae2fd] text-[#131b2e] text-[11px] rounded font-semibold">
                {t('fleet_total', { count: couriers.length })}
              </span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {ROSTER_FILTERS.map(({ key, labelKey }) => (
                <button
                  key={key}
                  onClick={() => setActiveRosterFilter(key)}
                  className={`px-2.5 py-1.5 text-[11px] rounded-lg whitespace-nowrap transition-colors ${
                    activeRosterFilter === key
                      ? 'bg-[#2563eb] text-white font-semibold'
                      : 'bg-[#eff4ff] dark:bg-slate-800 text-[#0b1c30] dark:text-slate-200 hover:bg-[#e5eeff] dark:hover:bg-slate-700'
                  }`}
                  type="button"
                >
                  {t(labelKey)} ({countFor(key)})
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-2.5">
              {pagedCouriers.map((courier) => {
                const isSelected = courier.id === selectedCourier?.id;

                return (
                  <div
                    key={courier.id}
                    onClick={() => setSelectedCourierId(courier.id)}
                    className={`p-4 rounded-xl transition-all flex flex-col gap-2.5 cursor-pointer border ${
                      isSelected
                        ? 'bg-[#eff4ff] dark:bg-slate-800 ring-1 ring-[#2563eb]/30 border-[#2563eb]/40'
                        : 'bg-white dark:bg-[#131b2e] hover:bg-[#eff4ff]/60 dark:hover:bg-slate-800/60 border-[#e5eeff] dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="relative">
                          <div className="w-11 h-11 rounded-lg bg-[#e5eeff] dark:bg-slate-700 flex items-center justify-center text-[#004ac6] dark:text-blue-400">
                            <Icon name={courier.vehicleType ?? 'local_shipping'} className="text-[24px]" />
                          </div>
                          <span
                            className={`absolute -bottom-1 -right-1 w-3 h-3 border-2 border-white dark:border-[#131b2e] rounded-full ${
                              courier.status === 'Idle at Hub'
                                ? 'bg-[#565e74]'
                                : courier.status === 'Near Capacity'
                                ? 'bg-[#bc4800]'
                                : 'bg-[#2563eb]'
                            }`}
                          ></span>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[13px] font-bold text-[#0b1c30] dark:text-white">{courier.name}</span>
                            {courier.vehicleNumber && (
                              <span className="px-1.5 py-0.5 bg-[#dae2fd] text-[#131b2e] text-[11px] rounded font-medium">
                                {courier.vehicleNumber}
                              </span>
                            )}
                          </div>
                          {(courier.zone || courier.email) && (
                            <span className="text-[12px] text-[#565e74] dark:text-slate-400 flex items-center gap-1">
                              <Icon name={courier.zone ? 'map' : 'mail'} className="text-[14px]" />
                              <span className="truncate">{courier.zone ?? courier.email}</span>
                            </span>
                          )}
                        </div>
                      </div>
                      {getStatusBadge(courier)}
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                      <div className="flex flex-col gap-0.5 bg-[#eff4ff]/60 dark:bg-slate-800/60 rounded-lg py-2">
                        <span className="text-[15px] font-bold text-[#004ac6] dark:text-blue-400">{courier.currentStops}</span>
                        <span className="text-[11px] text-[#565e74] dark:text-slate-400 font-medium">{t('fleet_pending_deliveries')}</span>
                      </div>
                      <div className="flex flex-col gap-0.5 bg-[#eff4ff]/60 dark:bg-slate-800/60 rounded-lg py-2">
                        <span className="text-[15px] font-bold text-[#0b1c30] dark:text-white">{courier.assignedCount ?? 0}</span>
                        <span className="text-[11px] text-[#565e74] dark:text-slate-400 font-medium">{t('fleet_assigned_deliveries')}</span>
                      </div>
                      <div className="flex flex-col gap-0.5 bg-[#eff4ff]/60 dark:bg-slate-800/60 rounded-lg py-2">
                        <span className="text-[15px] font-bold text-[#0b1c30] dark:text-white">{courier.completedCount ?? 0}</span>
                        <span className="text-[11px] text-[#565e74] dark:text-slate-400 font-medium">{t('fleet_completed_deliveries')}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex items-center justify-between text-[#565e74] dark:text-slate-400 text-[11px] border-t border-[#f0f4ff] dark:border-slate-800">
              <span>{t('fleet_displaying', { count: pagedCouriers.length })}</span>
              <div className="flex items-center gap-1.5">
                <button
                  className="px-2.5 py-1 bg-white dark:bg-[#131b2e] rounded shadow-2xs border border-[#e5eeff] dark:border-slate-700 disabled:opacity-50"
                  disabled={rosterSafePage <= 1}
                  onClick={() => setRosterPage((p) => Math.max(1, p - 1))}
                  type="button"
                >
                  {t('fleet_prev')}
                </button>
                <span className="px-2.5 py-1 bg-[#2563eb] text-white rounded font-semibold">
                  {rosterSafePage} / {rosterTotalPages}
                </span>
                <button
                  className="px-2.5 py-1 bg-white dark:bg-[#131b2e] rounded shadow-2xs border border-[#e5eeff] dark:border-slate-700 disabled:opacity-50"
                  disabled={rosterSafePage >= rosterTotalPages}
                  onClick={() => setRosterPage((p) => Math.min(rosterTotalPages, p + 1))}
                  type="button"
                >
                  {t('fleet_next')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dispatch workbench & route timeline */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Unassigned order queue */}
          <div className={`${CARD} p-4 flex flex-col gap-4`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Icon name="inbox_customize" className="text-[20px] text-[#bc4800]" />
                <span className="text-[15px] text-[#0b1c30] dark:text-white font-bold">{t('fleet_queue_title')}</span>
                <span className="text-[11px] text-[#943700] font-bold bg-[#ffdbcd] px-2.5 py-0.5 rounded-full">
                  {t('fleet_awaiting_routing', { count: dispatchOrders.length })}
                </span>
              </div>

              <div className="flex items-center gap-1.5 bg-[#eff4ff] dark:bg-slate-800 px-2.5 py-1.5 rounded-lg">
                <span className="text-[11px] text-[#0b1c30] dark:text-white font-semibold">
                  {t('fleet_selected', { count: selectedOrdersCount })}
                </span>
                <span className="text-[#737686]">→</span>
                <button
                  onClick={handleBatchAssign}
                  disabled={isBatchAssigning}
                  className="px-2.5 py-0.5 bg-[#2563eb] text-white rounded text-[11px] hover:bg-[#004ac6] transition-colors font-semibold disabled:opacity-60"
                  type="button"
                >
                  {isBatchAssigning
                    ? t('fleet_assigning')
                    : t('fleet_batch_to', { name: batchCourier?.name ?? '' })}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              {dispatchOrders.length === 0 ? (
                <div className="p-8 text-center text-[#565e74] dark:text-slate-400 flex flex-col items-center gap-2 bg-[#eff4ff]/60 dark:bg-slate-800/60 rounded-lg">
                  <Icon name="task_alt" className="text-[36px] text-[#2563eb]" />
                  <span className="font-bold text-[#0b1c30] dark:text-white">{t('fleet_all_assigned')}</span>
                  <span className="text-xs">{t('fleet_all_assigned_desc')}</span>
                </div>
              ) : (
                dispatchOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-3 bg-[#eff4ff]/60 dark:bg-slate-800/60 hover:bg-[#eff4ff] dark:hover:bg-slate-800 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors border border-transparent hover:border-[#2563eb]/20"
                  >
                    <div className="flex items-start gap-2.5">
                      <input
                        checked={!!order.isSelected}
                        onChange={() => handleToggleSelectOrder(order.id)}
                        className="mt-1 rounded accent-[#2563eb] cursor-pointer w-4 h-4"
                        type="checkbox"
                      />
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[13px] font-bold text-[#0b1c30] dark:text-white">{order.orderNumber}</span>
                          {order.isPriority && (
                            <span className="px-1.5 py-0.5 text-[10px] rounded uppercase font-semibold bg-[#bc4800] text-white">
                              {t('fleet_order_priority')}
                            </span>
                          )}
                          {order.customerName && (
                            <span className="text-[#565e74] dark:text-slate-400 text-[11px]">• {order.customerName}</span>
                          )}
                        </div>
                        <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-[#565e74] dark:text-slate-400 text-[12px] mt-1">
                          {order.address && (
                            <span className="flex items-center gap-1">
                              <Icon name="pin_drop" className="text-[14px]" />
                              {order.address}
                            </span>
                          )}
                          <span>{t('fleet_items_value', { count: order.itemsCount, value: order.totalValue.toFixed(2) })}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Live route & multi-drop timeline */}
          {selectedCourier && (
            <div className={`${CARD} p-4 flex flex-col gap-4`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-[#eff4ff]/60 dark:bg-slate-800/60 p-3 rounded-lg">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-lg bg-[#2563eb] text-white flex items-center justify-center font-bold">
                    {selectedCourier.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[13px] font-bold text-[#0b1c30] dark:text-white">
                        {t('fleet_live_manifest', { name: selectedCourier.name })}
                      </span>
                      {selectedCourier.vehicleNumber && (
                        <span className="px-1.5 py-0.5 bg-[#dae2fd] text-[#131b2e] text-[11px] rounded">
                          {selectedCourier.vehicleNumber}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[#565e74] dark:text-slate-400">
                      {t('fleet_itinerary_subtitle', { count: itineraryDeliveries.length })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Itinerary toolbar: out for delivery vs completed (mapped to isCompleted) */}
              <div className="flex items-center gap-1.5 bg-[#eff4ff] dark:bg-slate-800 p-1 rounded-lg w-fit">
                {([
                  { key: 'out_for_delivery' as const, labelKey: 'fleet_itinerary_out_for_delivery' },
                  { key: 'completed' as const, labelKey: 'fleet_itinerary_completed' },
                ]).map(({ key, labelKey }) => (
                  <button
                    key={key}
                    onClick={() => setItineraryFilter(key)}
                    className={`px-3 py-1.5 text-[12px] rounded-md whitespace-nowrap transition-colors font-semibold ${
                      itineraryFilter === key
                        ? 'bg-[#2563eb] text-white shadow-2xs'
                        : 'text-[#565e74] dark:text-slate-300 hover:text-[#0b1c30] dark:hover:text-white'
                    }`}
                    type="button"
                  >
                    {t(labelKey)}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-2">
                {isLoadingDeliveries ? (
                  <div className="p-8 text-center text-[#565e74] dark:text-slate-400 flex flex-col items-center gap-2">
                    <Icon name="sync" className="text-[28px] animate-spin text-[#2563eb]" />
                    <span className="text-xs">{t('fleet_itinerary_loading')}</span>
                  </div>
                ) : itineraryDeliveries.length === 0 ? (
                  <div className="p-8 text-center text-[#565e74] dark:text-slate-400 flex flex-col items-center gap-2 bg-[#eff4ff]/60 dark:bg-slate-800/60 rounded-lg">
                    <Icon name="inbox" className="text-[32px] text-[#2563eb]" />
                    <span className="text-xs">{t('fleet_itinerary_empty')}</span>
                  </div>
                ) : (
                  itineraryGroups.map((group) => {
                    const isGrouped = group.deliveries.length > 1;

                    return (
                      <div
                        key={group.key}
                        className="rounded-lg bg-[#eff4ff]/60 dark:bg-slate-800/60 overflow-hidden"
                      >
                        {isGrouped && (
                          <div className="flex items-center justify-between gap-2 px-3 py-2 bg-[#e5eeff]/70 dark:bg-slate-700/50 border-b border-[#e5eeff] dark:border-slate-700">
                            <span className="flex items-center gap-1 text-[12px] font-semibold text-[#0b1c30] dark:text-white min-w-0">
                              <Icon name="pin_drop" className="text-[14px] flex-shrink-0" />
                              <span className="truncate">{group.address || t('fleet_itinerary_no_address')}</span>
                            </span>
                            <span className="px-1.5 py-0.5 bg-[#dae2fd] text-[#004ac6] text-[11px] rounded-full font-semibold whitespace-nowrap">
                              {t('fleet_itinerary_group_count', { count: group.deliveries.length })}
                            </span>
                          </div>
                        )}

                        <div className="flex flex-col divide-y divide-[#e5eeff]/70 dark:divide-slate-700/50">
                          {group.deliveries.map((delivery) => {
                            const order = delivery.assignOrder;
                            // The driver has picked up this stop and is on the way (not yet delivered).
                            const isCurrentTrip = !!delivery.isStarted && !delivery.isCompleted;
                            const startedAt = delivery.startedAt
                              ? new Date(delivery.startedAt).toLocaleString([], {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : undefined;

                            return (
                              <div
                                key={delivery.id}
                                className={`flex items-start gap-3 p-3 ${
                                  isCurrentTrip ? 'bg-[#dae2fd]/40 dark:bg-blue-950/30' : ''
                                }`}
                              >
                                <div
                                  className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                                    delivery.isCompleted
                                      ? 'bg-[#2563eb] text-white'
                                      : isCurrentTrip
                                      ? 'bg-[#004ac6] text-white ring-4 ring-[#dae2fd] dark:ring-blue-950 shadow-md animate-pulse'
                                      : 'bg-[#e5eeff] dark:bg-slate-700 text-[#565e74] dark:text-slate-300'
                                  }`}
                                >
                                  <Icon
                                    name={delivery.isCompleted ? 'check' : isCurrentTrip ? 'navigation' : 'local_shipping'}
                                    className="text-[16px]"
                                  />
                                </div>

                                <div className="flex flex-col flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="text-[13px] font-bold text-[#0b1c30] dark:text-white truncate">
                                        {order?.fullName || t('fleet_itinerary_no_recipient')}
                                      </span>
                                      {order?.uid && (
                                        <span className="px-1.5 py-0.5 bg-[#dae2fd] text-[#131b2e] text-[11px] rounded font-mono">
                                          {order.uid}
                                        </span>
                                      )}
                                      {order?.isPriority && (
                                        <span className="px-1.5 py-0.5 text-[10px] rounded uppercase font-semibold bg-[#bc4800] text-white">
                                          {t('fleet_order_priority')}
                                        </span>
                                      )}
                                    </div>
                                    {delivery.isCompleted ? (
                                      <span className="px-1.5 py-0.5 bg-[#dae2fd] text-[#004ac6] text-[11px] rounded font-semibold whitespace-nowrap">
                                        {t('fleet_itinerary_completed')}
                                      </span>
                                    ) : isCurrentTrip ? (
                                      <span className="px-1.5 py-0.5 bg-[#004ac6] text-white text-[11px] rounded font-semibold whitespace-nowrap flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                                        {t('fleet_itinerary_current_trip')}
                                      </span>
                                    ) : (
                                      <span className="px-1.5 py-0.5 bg-[#ffdbcd] text-[#943700] text-[11px] rounded font-semibold whitespace-nowrap">
                                        {t('fleet_itinerary_out_for_delivery')}
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-[#565e74] dark:text-slate-400 text-[12px] mt-1">
                                    {/* Grouped stops show the shared address in the group header instead. */}
                                    {!isGrouped && group.address && (
                                      <span className="flex items-center gap-1">
                                        <Icon name="pin_drop" className="text-[14px]" />
                                        {group.address}
                                      </span>
                                    )}
                                    {order?.phone && (
                                      <span className="flex items-center gap-1">
                                        <Icon name="call" className="text-[14px]" />
                                        {order.phone}
                                      </span>
                                    )}
                                    {isCurrentTrip && startedAt && (
                                      <span className="flex items-center gap-1 text-[#004ac6] dark:text-blue-400 font-semibold">
                                        <Icon name="schedule" className="text-[14px]" />
                                        {t('fleet_itinerary_started_at', { time: startedAt })}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
