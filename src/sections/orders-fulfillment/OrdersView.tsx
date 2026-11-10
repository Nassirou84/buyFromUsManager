import useLocales from '@/locales/use-locales';
import React, { useState } from 'react';
import { Icon } from '@/components/lucide-icon';
import { Order, OrderSummary, RawOrderStatus } from './types';
import { formatWithCurrency } from '@/utils/lodash';
import { CarrierPartnersModal } from './CarrierPartnersModal';
import { ScanOrderModal } from './ScanOrderModal';
import { ORDER_STATUS_FILTERS, mapApiOrderToFulfillment } from './mapper';
import { getOrders, ORDERS_PAGE_SIZE, OrderSort } from '@/api/order/get-orders';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

// Per-lifecycle-status badge styling, so each raw backend status reads distinctly
// (the in_transit / arrived_in_facility / out_for_delivery stages no longer share one look).
// Accent colours mirror the fulfillment-journey stage cards in OrderDetailView.
const STATUS_BADGE: Record<string, { classes: string; icon?: string; pulse?: boolean }> = {
  placed: { classes: 'bg-[#e5eeff] text-[#565e74] dark:bg-slate-700 dark:text-slate-200', icon: 'fiber_new' },
  processed: { classes: 'bg-[#ffdbcd] text-[#943700] dark:bg-amber-900/40 dark:text-amber-300', icon: 'shopping_cart_checkout' },
  in_transit: { classes: 'bg-[#ede9fe] text-[#6d28d9] dark:bg-violet-950 dark:text-violet-300', icon: 'flight_takeoff', pulse: true },
  arrived_in_facility: { classes: 'bg-[#cffafe] text-[#0e7490] dark:bg-cyan-950 dark:text-cyan-300', icon: 'warehouse' },
  out_for_delivery: { classes: 'bg-[#dae2fd] text-[#004ac6] dark:bg-blue-950 dark:text-blue-300', icon: 'local_shipping', pulse: true },
  delivered: { classes: 'bg-[#dcfce7] text-[#15803d] dark:bg-green-950 dark:text-green-300', icon: 'check_circle' },
  cancelled: { classes: 'bg-[#ffdad6] text-[#93000a] dark:bg-red-950/40 dark:text-red-300', icon: 'cancel' },
};

interface OrdersViewProps {
  orders: Order[];
  /** Admin KPI summary (GET /admin/orders-summary); undefined while it loads. */
  summary?: OrderSummary;
  /** True on the first load (no cached orders yet); shows a full loader. */
  isLoading?: boolean;
  /** True during any fetch, including background refetches on filter change. */
  isFetching?: boolean;
  /** Active backend status; the orders list is filtered server-side to match. */
  statusFilter: 'all' | RawOrderStatus;
  onStatusFilterChange: (status: 'all' | RawOrderStatus) => void;
  /** Active sort; applied server-side via the backend order_filter. */
  sortValue: OrderSort;
  onSortChange: (sort: OrderSort) => void;
  /** Order uid search; filtered server-side (uid partial match). */
  searchValue: string;
  onSearchChange: (value: string) => void;
  /** Open the order whose uid was decoded from a scanned QR code. */
  onScanOrder: (uid: string) => void;
  onOpenOrder: (order: Order) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({ orders, summary, isLoading, isFetching, statusFilter, onStatusFilterChange, sortValue, onSortChange, searchValue, onSearchChange, onScanOrder, onOpenOrder }) => {
  const { t } = useLocales();
  const [isCarrierModalOpen, setIsCarrierModalOpen] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Day-over-day trend for yesterday's order count (null until both days are known
  // and the baseline is non-zero, to avoid a divide-by-zero / meaningless +∞).
  const ordersTrend = (() => {
    if (!summary || !summary.dayBeforeYesterdayOrders) return null;
    return ((summary.yesterdayOrders - summary.dayBeforeYesterdayOrders) / summary.dayBeforeYesterdayOrders) * 100;
  })();

  // Em dash stands in for a metric while the summary is still loading.
  const stat = (value?: number) => (value === undefined ? '—' : value.toLocaleString());

  // Exports a CSV manifest of every order the API returns for the active filter and
  // search — not just the page shown in the view. Fetches all pages (GET /orders is
  // paginated), maps each record, then builds one CSV row per order.
  const handleExportManifest = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const statusValues = statusFilter === 'all' ? undefined : [statusFilter];
      const uid = searchValue.trim() || undefined;

      const first = await getOrders(1, statusValues, uid, sortValue);
      const apiOrders = [...first.orders];
      const pageCount = Math.ceil(first.totalItems / ORDERS_PAGE_SIZE);
      for (let page = 2; page <= pageCount; page++) {
        const next = await getOrders(page, statusValues, uid, sortValue);
        apiOrders.push(...next.orders);
      }

      if (apiOrders.length === 0) {
        toast.error(t('orders_export_empty'));
        return;
      }

      const escape = (value: unknown) =>
        `"${(value == null ? '' : String(value)).replace(/"/g, '""')}"`;
      const rows = apiOrders
        .map((o) => mapApiOrderToFulfillment(o, t))
        .map((ord) =>
          [
            ord.orderNumber,
            t(`customers_order_status_${ord.rawStatus}`, { defaultValue: ord.rawStatus }),
            ord.customerName,
            ord.customerEmail,
            ord.itemCount,
            ord.shippingMethod,
            ord.totalAmount,
            ord.dateStr,
            ord.isPriority ? t('priority') : '',
          ]
            .map(escape)
            .join(',')
        );
      const csvContent = [t('orders_csv_headers'), ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders_flot_boutique_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(t('orders_toast_export'));
    } catch {
      toast.error(t('orders_export_error'));
    } finally {
      setIsExporting(false);
    }
  };

  // Both the status column and the uid search are applied by the backend
  // (GET /orders?status[]=…&uid=…), so the returned page is already filtered.

  // Shows the order's actual current status (raw backend status), with a distinct
  // colour and icon per lifecycle stage (see STATUS_BADGE). The label falls back to
  // "pending" for any raw value without a dedicated key.
  const getStatusBadge = (order: Order) => {
    const label = t(`customers_order_status_${order.rawStatus}`, { defaultValue: t('pending') });
    const cfg = STATUS_BADGE[order.rawStatus] ?? { classes: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200' };
    return (
      <span className={`px-2.5 py-0.5 ${cfg.classes} text-[11px] font-bold rounded flex items-center gap-1`}>
        {cfg.pulse ? (
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping"></span>
        ) : cfg.icon ? (
          <Icon name={cfg.icon} className="text-[13px]" />
        ) : null}
        {label}
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* PAGE HEADER & LIVE METRICS */}
      <div className="flex flex-col gap-5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-[#004ac6] dark:text-blue-400 text-[11px] font-bold uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-[#004ac6] animate-pulse"></span>
              {t('ops_realtime_stream')}
            </div>
            <h1 className="text-2xl sm:text-[28px] font-bold text-[#0b1c30] dark:text-white tracking-tight">
              {t('orders_fulfillment_center')}
            </h1>
            <p className="text-[13px] text-[#565e74] dark:text-slate-400 mt-1">
              {t('orders_subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setIsCarrierModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-[#f8f9ff] text-[#0b1c30] dark:text-white text-[13px] font-semibold rounded-lg border border-[#c3c6d7] dark:border-slate-700 shadow-2xs transition-all cursor-pointer"
            >
              <Icon name="local_shipping" className="text-[17px] text-[#565e74] dark:text-slate-400"/>
              <span>{t('add_carrier_partner')}</span>
            </button>

            <button
              type="button"
              onClick={handleExportManifest}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#004ac6] hover:bg-[#003ea8] text-white text-[13px] font-semibold rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon name={isExporting ? 'progress_activity' : 'file_download'} className={`text-[17px] ${isExporting ? 'animate-spin' : ''}`}/>
              <span>{isExporting ? t('orders_exporting') : t('export_manifest')}</span>
            </button>
          </div>
        </div>

        {/* QUICK KPI RIBBON */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI 1 — orders placed yesterday, with the day-over-day trend */}
          <div className="bg-white dark:bg-[#131b2e] p-5 rounded-xl border border-[#e5eeff] dark:border-slate-800 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#565e74] dark:text-slate-400">
                {t('orders_yesterday')}
              </span>
              <span className="p-1.5 rounded-lg bg-[#eff4ff] dark:bg-blue-950 text-[#004ac6] dark:text-blue-300">
                <Icon name="shopping_bag" className="text-[18px]"/>
              </span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-[#0b1c30] dark:text-white">{stat(summary?.yesterdayOrders)}</span>
                {ordersTrend !== null && (
                  <span className={`text-[12px] font-bold ${ordersTrend >= 0 ? 'text-[#004ac6] dark:text-blue-400' : 'text-[#ba1a1a] dark:text-red-400'}`}>
                    {ordersTrend >= 0 ? '+' : ''}{ordersTrend.toFixed(1)}%
                  </span>
                )}
              </div>
              <span className="text-[12px] font-medium text-[#565e74] dark:text-slate-400">{t('lifetime_orders_label', { count: summary?.lifetimeOrders ?? 0 })}</span>
            </div>
          </div>

          {/* KPI 2 — priority orders still awaiting fulfillment */}
          <div className="bg-white dark:bg-[#131b2e] p-5 rounded-xl border border-[#ffdbcd] dark:border-amber-900/40 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#bc4800] dark:text-amber-400">
                {t('awaiting_fulfillment')}
              </span>
              <span className="p-1.5 rounded-lg bg-[#ffdbcd] text-[#943700]">
                <Icon name="pending_actions" className="text-[18px]"/>
              </span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-[#bc4800] dark:text-amber-400">{stat(summary?.priorityOrdersAwaiting)}</span>
                {!!summary?.priorityOrdersAwaiting && (
                  <span className="px-1.5 py-0.5 bg-[#ffdad6] text-[#ba1a1a] text-[10px] font-bold rounded">
                    {t('urgent')}
                  </span>
                )}
              </div>
              <span className="text-[12px] text-[#565e74] dark:text-slate-400">{t('priority_label')}</span>
            </div>
          </div>

          {/* KPI 3 — orders currently in transit, plus those awaiting delivery */}
          <div className="bg-white dark:bg-[#131b2e] p-5 rounded-xl border border-[#e5eeff] dark:border-slate-800 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#565e74] dark:text-slate-400">
                {t('in_transit')}
              </span>
              <span className="p-1.5 rounded-lg bg-[#dae2fd] text-[#004ac6]">
                <Icon name="local_shipping" className="text-[18px]"/>
              </span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-[#0b1c30] dark:text-white">{stat(summary?.ordersInTransit)}</span>
                <span className="text-[11.5px] text-[#565e74] dark:text-slate-400">{t('active_dispatches')}</span>
              </div>
              <span className="text-[12px] text-[#004ac6] dark:text-blue-400 font-medium">{t('awaiting_delivery_label', { count: summary?.ordersAwaitingDelivery ?? 0 })}</span>
            </div>
          </div>

          {/* KPI 4 — orders delivered yesterday, with the lifetime total */}
          <div className="bg-white dark:bg-[#131b2e] p-5 rounded-xl border border-[#e5eeff] dark:border-slate-800 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#565e74] dark:text-slate-400">
                {t('orders_delivered')}
              </span>
              <span className="p-1.5 rounded-lg bg-[#eff4ff] text-[#004ac6]">
                <Icon name="check_circle" className="text-[18px]"/>
              </span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-[#0b1c30] dark:text-white">{stat(summary?.yesterdayDeliveredOrders)}</span>
                <span className="text-[11.5px] text-[#737686]">{t('yesterday_label')}</span>
              </div>
              <span className="text-[12px] text-[#565e74] dark:text-slate-400">{t('lifetime_delivered_label', { count: summary?.lifetimeDeliveredOrders ?? 0 })}</span>
            </div>
          </div>
        </div>

        {/* FILTER BAR & STATUS PILLS */}
        <div className="bg-white dark:bg-[#131b2e] p-4 rounded-xl border border-[#e5eeff] dark:border-slate-800 shadow-2xs flex flex-col lg:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-2 w-full lg:max-w-[370px]">
            <Input
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t('orders_search_placeholder')}
              leftIcon={<Icon name="search" className="text-[16px]" />}
              className="h-9 text-[13px]"
              containerClassName="flex-1 mb-0"
            />
            <button
              type="button"
              onClick={() => setIsScanModalOpen(true)}
              title={t('orders_scan_title')}
              aria-label={t('orders_scan_title')}
              className="shrink-0 h-9 w-9 flex items-center justify-center rounded-lg border border-[#c3c6d7] dark:border-slate-700 bg-white dark:bg-[#0b1220] text-[#004ac6] dark:text-blue-400 hover:bg-[#eff4ff] dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Icon name="qr_code_scanner" className="text-[18px]" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => onStatusFilterChange('all')}
              className={`px-3 py-1.5 rounded-lg text-[12.5px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-[#dce9ff] dark:bg-blue-900 text-[#004ac6] dark:text-blue-200'
                  : 'text-[#565e74] dark:text-slate-400 hover:bg-[#eff4ff] dark:hover:bg-slate-800'
              }`}
            >
              {t('all_orders_count', { count: summary?.lifetimeOrders ?? 0 })}
            </button>
            {ORDER_STATUS_FILTERS.map(({ value, labelKey }) => (
              <button
                key={value}
                type="button"
                onClick={() => onStatusFilterChange(value)}
                className={`px-3 py-1.5 rounded-lg text-[12.5px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  statusFilter === value
                    ? 'bg-[#dce9ff] dark:bg-blue-900 text-[#004ac6] dark:text-blue-200'
                    : 'text-[#565e74] dark:text-slate-400 hover:bg-[#eff4ff] dark:hover:bg-slate-800'
                }`}
              >
                {t(labelKey)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ORDERS LIST */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#565e74] dark:text-slate-400 flex items-center gap-1.5">
            {t('active_queue')}
            {isFetching && !isLoading && <Spinner className="size-3.5 text-[#004ac6] dark:text-blue-400" />}
          </span>
          <div className="flex items-center gap-1.5 text-[#004ac6] dark:text-blue-400">
            <Icon name="tune" className="text-[15px]"/>
            <Select value={sortValue} onValueChange={(value) => onSortChange(value as OrderSort)}>
              <SelectTrigger
                aria-label={t('orders_sort_label')}
                className="h-7 w-auto gap-1 border-none bg-transparent px-1.5 py-0 text-[11px] font-semibold text-[#004ac6] dark:text-blue-400 shadow-none focus:ring-0 focus:ring-offset-0"
              >
                <SelectValue placeholder={t('orders_sort_label')} />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="newest">{t('orders_sort_newest')}</SelectItem>
                <SelectItem value="oldest">{t('orders_sort_oldest')}</SelectItem>
                <SelectItem value="priority">{t('orders_sort_priority')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white dark:bg-[#131b2e] p-12 rounded-xl border border-[#e5eeff] dark:border-slate-800 shadow-2xs flex flex-col items-center gap-3 text-center">
            <Spinner className="size-8 text-[#004ac6] dark:text-blue-400" />
            <p className="text-[13px] text-[#565e74] dark:text-slate-400">{t('orders_loading')}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white dark:bg-[#131b2e] p-12 rounded-xl border border-[#e5eeff] dark:border-slate-800 shadow-2xs flex flex-col items-center gap-3 text-center">
            <div className="w-14 h-14 rounded-xl bg-[#eff4ff] dark:bg-slate-800 flex items-center justify-center text-[#004ac6] dark:text-blue-400">
              <Icon name="inbox" className="text-[32px]" />
            </div>
            <h2 className="text-[15px] text-[#0b1c30] dark:text-white font-bold">{t('orders_empty_title')}</h2>
            <p className="text-[13px] text-[#565e74] dark:text-slate-400 max-w-sm">{t('orders_empty_hint')}</p>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {orders.map((ord) => (
            <div
              key={ord.id}
              onClick={() => onOpenOrder(ord)}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative hover:shadow-sm ${
                ord.isPriority
                  ? 'bg-white dark:bg-[#131b2e] border-[#bc4800] dark:border-amber-600 hover:border-[#943700] ring-1 ring-[#bc4800]/20'
                  : 'bg-white dark:bg-[#131b2e] border-[#e5eeff] dark:border-slate-800 hover:border-[#004ac6]'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5 pl-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[13.5px] text-[#004ac6] dark:text-blue-400">
                    {ord.orderNumber}
                  </span>
                  {ord.isPriority && (
                    <span className="px-2 py-0.5 bg-[#ffdbcd] text-[#943700] dark:bg-amber-900/50 dark:text-amber-300 text-[10px] font-bold rounded flex items-center gap-1">
                      <Icon name="priority_high" className="text-[12px]"/>
                      {t('priority')}
                    </span>
                  )}
                </div>
                {getStatusBadge(ord)}
              </div>

              <div className="flex items-center justify-between pl-1">
                <div className="flex flex-col">
                  <span className="font-bold text-[14px] text-[#0b1c30] dark:text-white">
                    {ord.customerName}
                  </span>
                  <span className="text-[12px] text-[#565e74] dark:text-slate-400">
                    {t('items_count', { count: ord.itemCount })}{ord.shippingMethod ? ` • ${ord.shippingMethod}` : ''}
                  </span>
                </div>
                <div className="text-right">
                  <span className={`text-[16px] font-bold ${ord.status === 'cancelled' ? 'line-through text-[#737686]' : 'text-[#0b1c30] dark:text-white'}`}>
                    {formatWithCurrency(ord.totalAmount)}
                  </span>
                  <span className="text-[11px] text-[#565e74] dark:text-slate-400 block">
                    {ord.timestamp}
                  </span>
                </div>
              </div>

              {ord.slaRemaining && (
                <div className="mt-2.5 pl-1 pt-1 flex items-center justify-between bg-[#eff4ff] dark:bg-slate-800/80 px-2.5 py-1.5 rounded-lg">
                  <span className="text-[11px] font-medium text-[#bc4800] dark:text-amber-400 flex items-center gap-1">
                    <Icon name="priority_high" className="text-[15px]"/>
                    {t('pack_sla', { value: ord.slaRemaining })}
                  </span>
                  <Icon name="arrow_forward" className="text-[#004ac6] text-[16px]"/>
                </div>
              )}

              {ord.trackingNumber && !ord.slaRemaining && (
                <div className="mt-2 flex items-center gap-1 text-[11.5px] text-[#737686] pl-1 font-mono">
                  <Icon name="tag" className="text-[14px]"/>
                  <span>{t('trk', { value: ord.trackingNumber })}</span>
                </div>
              )}
            </div>
          ))}
        </div>
        )}
      </div>

      <CarrierPartnersModal
        isOpen={isCarrierModalOpen}
        onClose={() => setIsCarrierModalOpen(false)}
      />

      <ScanOrderModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        onScan={(uid) => {
          setIsScanModalOpen(false);
          onScanOrder(uid);
        }}
      />
    </div>
  );
};
