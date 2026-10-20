import useLocales from '@/locales/use-locales';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Icon } from '@/components/lucide-icon';
import { Courier, CourierStatus, DispatchOrder, RouteStop } from './types';

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

const TYPE_LABEL_KEYS: Record<DispatchOrder['type'], string> = {
  'VIP White-Glove': 'fleet_type_vip',
  'Same-Day Express': 'fleet_type_express',
  'Standard Concierge': 'fleet_type_standard',
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
  const [selectedCourierId, setSelectedCourierId] = useState<string>(couriers[0]?.id || '');
  const [activeRosterFilter, setActiveRosterFilter] = useState<RosterFilter>('All');
  const [isAutoAssigning, setIsAutoAssigning] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const selectedCourier = couriers.find((c) => c.id === selectedCourierId) || couriers[0];
  // Batch assignments go to the hub courier (courier-3 in the sample data)
  const batchCourier = couriers.find((c) => c.id === 'courier-3') || selectedCourier;
  const selectedOrdersCount = dispatchOrders.filter((o) => o.isSelected).length;

  const handleToggleSelectOrder = (orderId: string) => {
    onUpdateDispatchOrders(
      dispatchOrders.map((o) => (o.id === orderId ? { ...o, isSelected: !o.isSelected } : o))
    );
  };

  const handleBatchAssign = () => {
    if (selectedOrdersCount === 0) {
      toast.error(t('fleet_toast_no_selection'));
      return;
    }

    onUpdateDispatchOrders(dispatchOrders.filter((o) => !o.isSelected));
    onUpdateCouriers(
      couriers.map((c) =>
        c.id === batchCourier.id
          ? {
              ...c,
              status: 'En Route' as const,
              currentStops: c.currentStops + selectedOrdersCount,
              nextStopEta: t('fleet_assigned_stops', { count: selectedOrdersCount }),
            }
          : c
      )
    );
    toast.success(t('fleet_toast_batch_assigned', { count: selectedOrdersCount, name: batchCourier.name }));
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
            return { ...c, currentStops: Math.min(c.maxStops, c.currentStops + 1) };
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
        vehicle: selectedCourier.vehicleNumber,
        zone: selectedCourier.zone,
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

  const handleAddCourier = () => {
    const name = window.prompt(t('fleet_add_prompt'));
    if (!name) return;
    onUpdateCouriers([
      ...couriers,
      {
        id: `courier-${Date.now()}`,
        name,
        vehicleType: 'electric_car',
        vehicleNumber: `Van #SF-${Math.floor(10 + Math.random() * 90)}`,
        zone: 'Abidjan / SF Hub',
        status: 'Idle at Hub',
        currentStops: 0,
        maxStops: 12,
        batteryPercent: 100,
        nextStopEta: t('fleet_available_for_assignment'),
        currentStopNumber: 0,
      },
    ]);
    toast.success(t('fleet_toast_courier_added', { name }));
  };

  const filteredCouriers = couriers.filter((c) => matchesFilter(c, activeRosterFilter));
  const countFor = (filter: RosterFilter) => couriers.filter((c) => matchesFilter(c, filter)).length;

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
            onClick={handleAddCourier}
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
              {filteredCouriers.map((courier) => {
                const isSelected = courier.id === selectedCourier?.id;
                const capacityPercentage = Math.round((courier.currentStops / courier.maxStops) * 100);

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
                            <Icon name={courier.vehicleType} className="text-[24px]" />
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
                            <span className="px-1.5 py-0.5 bg-[#dae2fd] text-[#131b2e] text-[11px] rounded font-medium">
                              {courier.vehicleNumber}
                            </span>
                          </div>
                          <span className="text-[12px] text-[#565e74] dark:text-slate-400 flex items-center gap-1">
                            <Icon name="map" className="text-[14px]" />
                            {courier.zone}
                          </span>
                        </div>
                      </div>
                      {getStatusBadge(courier)}
                    </div>

                    <div className="flex flex-col gap-1 pt-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-[#565e74] dark:text-slate-400 font-medium">{t('fleet_capacity_load')}</span>
                        <span
                          className={`font-semibold ${
                            courier.currentStops === 0
                              ? 'text-[#004ac6] dark:text-blue-400'
                              : courier.status === 'Near Capacity'
                              ? 'text-[#bc4800]'
                              : 'text-[#0b1c30] dark:text-white'
                          }`}
                        >
                          {t('fleet_stops_of', { current: courier.currentStops, max: courier.maxStops })} (
                          {courier.currentStops === 0 ? t('fleet_status_available') : `${capacityPercentage}%`})
                        </span>
                      </div>
                      <div className="w-full bg-[#e5eeff] dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${courier.status === 'Near Capacity' ? 'bg-[#bc4800]' : 'bg-[#2563eb]'}`}
                          style={{ width: `${capacityPercentage}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1 text-[#565e74] dark:text-slate-400 text-[11px]">
                      <div className="flex items-center gap-4 min-w-0">
                        <span className="flex items-center gap-1 min-w-0">
                          <Icon name="near_me" className="text-[16px] text-[#004ac6] dark:text-blue-400" />
                          <span className="truncate">{courier.nextStopEta}</span>
                        </span>
                        <span className="flex items-center gap-1 shrink-0">
                          <Icon name="battery_charging_full" className="text-[16px]" />
                          {courier.batteryPercent}%
                        </span>
                      </div>
                      {courier.currentStops === 0 ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBatchAssign();
                          }}
                          className="px-2.5 py-1 bg-[#2563eb] text-white text-[11px] rounded-lg hover:bg-[#004ac6] transition-colors flex items-center gap-1 font-semibold shrink-0"
                          type="button"
                        >
                          <Icon name="move_to_inbox" className="text-[14px]" />
                          {t('fleet_assign_orders', { count: 4 })}
                        </button>
                      ) : (
                        <button
                          className="text-[#004ac6] dark:text-blue-400 font-semibold hover:underline flex items-center gap-1 shrink-0"
                          type="button"
                        >
                          <span>{t('fleet_view_route')}</span>
                          <Icon name="arrow_forward" className="text-[14px]" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex items-center justify-between text-[#565e74] dark:text-slate-400 text-[11px] border-t border-[#f0f4ff] dark:border-slate-800">
              <span>{t('fleet_displaying', { count: filteredCouriers.length })}</span>
              <button
                onClick={() => toast.info(t('fleet_toast_view_all', { count: 18 }))}
                className="text-[#004ac6] dark:text-blue-400 hover:underline font-semibold flex items-center gap-1"
                type="button"
              >
                <span>{t('fleet_view_all', { count: 18 })}</span>
                <Icon name="expand_more" className="text-[14px]" />
              </button>
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
                  className="px-2.5 py-0.5 bg-[#2563eb] text-white rounded text-[11px] hover:bg-[#004ac6] transition-colors font-semibold"
                  type="button"
                >
                  {t('fleet_batch_to', { name: batchCourier?.name ?? '' })}
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
                          <span
                            className={`px-1.5 py-0.5 text-[10px] rounded uppercase font-semibold ${
                              order.type === 'VIP White-Glove'
                                ? 'bg-[#bc4800] text-white'
                                : order.type === 'Same-Day Express'
                                ? 'bg-[#dae2fd] text-[#131b2e]'
                                : 'bg-[#e5eeff] dark:bg-slate-700 text-[#0b1c30] dark:text-white'
                            }`}
                          >
                            {t(TYPE_LABEL_KEYS[order.type])}
                          </span>
                          <span className="text-[#565e74] dark:text-slate-400 text-[11px]">• {order.customerName}</span>
                        </div>
                        <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-[#565e74] dark:text-slate-400 text-[12px] mt-1">
                          <span className="flex items-center gap-1">
                            <Icon name="pin_drop" className="text-[14px]" />
                            {order.address}
                          </span>
                          <span>{t('fleet_items_value', { count: order.itemsCount, value: order.totalValue.toFixed(2) })}</span>
                          <span
                            className={`font-medium flex items-center gap-1 ${
                              order.slaMinutes <= 20 ? 'text-[#ba1a1a]' : 'text-[#565e74] dark:text-slate-400'
                            }`}
                          >
                            <Icon name="timer" className="text-[14px]" />
                            {order.slaRemaining}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 pl-6 md:pl-0">
                      <div className="flex flex-col text-right">
                        <span className="text-[11px] text-[#004ac6] dark:text-blue-400 font-semibold">
                          {t('fleet_match', { name: order.matchedCourier })}
                        </span>
                        <span className="text-[11px] text-[#565e74] dark:text-slate-400">{order.matchReason}</span>
                      </div>
                      <button
                        onClick={() => {
                          onUpdateDispatchOrders(dispatchOrders.filter((o) => o.id !== order.id));
                          toast.success(t('fleet_toast_order_assigned', { order: order.orderNumber, name: order.matchedCourier }));
                        }}
                        className="px-2.5 py-1.5 bg-white dark:bg-[#131b2e] hover:bg-[#e5eeff] dark:hover:bg-slate-700 text-[#0b1c30] dark:text-white rounded-lg text-[11px] transition-colors flex items-center gap-1 shadow-2xs font-semibold border border-[#e5eeff] dark:border-slate-700"
                        type="button"
                      >
                        <span>{t('fleet_assign')}</span>
                        <Icon name="arrow_drop_down" className="text-[14px]" />
                      </button>
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
                      <span className="px-1.5 py-0.5 bg-[#dae2fd] text-[#131b2e] text-[11px] rounded">
                        {selectedCourier.vehicleNumber}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#565e74] dark:text-slate-400">
                      {t('fleet_route_batch', { batch: '#R-881', distance: '18.4 mi', time: '~16:30' })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => toast.info(t('fleet_toast_call', { name: selectedCourier.name }))}
                    className="p-1.5 bg-white dark:bg-[#131b2e] hover:bg-[#e5eeff] dark:hover:bg-slate-700 text-[#0b1c30] dark:text-white rounded shadow-2xs"
                    title={t('fleet_call_courier')}
                    type="button"
                  >
                    <Icon name="call" className="text-[18px]" />
                  </button>
                  <button
                    onClick={() => toast.info(t('fleet_toast_radio', { name: selectedCourier.name }))}
                    className="p-1.5 bg-white dark:bg-[#131b2e] hover:bg-[#e5eeff] dark:hover:bg-slate-700 text-[#0b1c30] dark:text-white rounded shadow-2xs"
                    title={t('fleet_radio_chat')}
                    type="button"
                  >
                    <Icon name="chat" className="text-[18px]" />
                  </button>
                  <button
                    onClick={() => toast.info(t('fleet_toast_reroute'))}
                    className="px-2.5 py-1.5 bg-[#bc4800] text-white rounded text-[11px] hover:bg-[#943700] transition-colors flex items-center gap-1 font-semibold"
                    type="button"
                  >
                    <Icon name="alt_route" className="text-[14px]" />
                    <span>{t('fleet_reroute')}</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-4 relative pl-4 mt-1">
                <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-[#e5eeff] dark:bg-slate-700"></div>

                {routeStops.map((stop) => {
                  const isCompleted = stop.status === 'completed';
                  const isCurrent = stop.status === 'current';

                  return (
                    <div key={stop.id} className="relative flex items-start gap-4 z-10">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                          isCompleted
                            ? 'bg-[#2563eb] text-white'
                            : isCurrent
                            ? 'bg-[#004ac6] text-white ring-4 ring-[#dae2fd] dark:ring-blue-950 shadow-md animate-pulse'
                            : 'bg-[#e5eeff] dark:bg-slate-700 text-[#565e74] dark:text-slate-300'
                        }`}
                      >
                        {isCompleted ? (
                          <Icon name="check" className="text-[16px]" />
                        ) : isCurrent ? (
                          <Icon name="navigation" className="text-[16px]" />
                        ) : (
                          <span className="text-[11px] font-bold">{stop.stopNumber}</span>
                        )}
                      </div>

                      <div
                        className={`flex flex-col flex-1 p-3 rounded-lg transition-all ${
                          isCurrent
                            ? 'bg-[#eff4ff] dark:bg-slate-800 shadow-sm border border-[#2563eb]/20'
                            : 'bg-[#eff4ff]/60 dark:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`text-[13px] font-bold ${
                                isCurrent ? 'text-[#004ac6] dark:text-blue-400' : 'text-[#0b1c30] dark:text-white'
                              }`}
                            >
                              {stop.title}
                            </span>
                            {stop.orderNumber && (
                              <span className="px-1.5 py-0.5 bg-[#dae2fd] text-[#131b2e] text-[11px] rounded font-mono">
                                {stop.orderNumber}
                              </span>
                            )}
                          </div>
                          <span
                            className={`text-[11px] font-semibold whitespace-nowrap ${
                              isCurrent ? 'text-[#004ac6] dark:text-blue-400' : 'text-[#565e74] dark:text-slate-400'
                            }`}
                          >
                            {stop.time}
                          </span>
                        </div>

                        <span className="text-[12px] text-[#0b1c30] dark:text-slate-200 mt-0.5">{stop.details}</span>

                        {stop.isHighValueVault && (
                          <div className="flex items-center gap-1 mt-1.5">
                            <span className="px-1.5 py-0.5 bg-[#ffdbcd] text-[#943700] text-[11px] rounded font-semibold">
                              {t('fleet_high_value')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-[#eff4ff]/60 dark:bg-slate-800/60 p-3 rounded-lg flex flex-wrap items-center justify-between gap-2.5 text-[#565e74] dark:text-slate-400 text-[11px]">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Icon name="speed" className="text-[16px] text-[#004ac6] dark:text-blue-400" />
                    {t('fleet_efficiency')}: <strong>94%</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="eco" className="text-[16px]" />
                    {t('fleet_co2_saved')}: <strong>14.2 kg</strong>
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Icon name="sync" className="text-[16px] text-[#004ac6] dark:text-blue-400" />
                  <span>{t('fleet_telematics', { seconds: 22 })}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
