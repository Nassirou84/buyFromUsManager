import useLocales from '@/locales/use-locales';
import React, { useState } from 'react';
import { Icon } from '@/components/lucide-icon';
import { Order, OrderStatus } from '../../types';
import { Trans } from 'react-i18next';

interface OrdersViewProps {
  orders: Order[];
  onUpdateOrder: (updated: Order) => void;
  onOpenInvoice: (order: Order) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  onUpdateOrder,
  onOpenInvoice,
}) => {
  const { t } = useLocales();
  const [selectedOrderId, setSelectedOrderId] = useState<string>(orders[0]?.id || '');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [newNoteText, setNewNoteText] = useState('');
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [labelGenerating, setLabelGenerating] = useState(false);
  const [notificationSent, setNotificationSent] = useState(false);

  const selectedOrder = orders.find((o) => o.id === selectedOrderId) || orders[0];

  // Tracking number edit state
  const [carrier, setCarrier] = useState(selectedOrder?.carrier || 'DHL Express Worldwide (Pre-selected)');
  const [trackingNumber, setTrackingNumber] = useState(selectedOrder?.trackingNumber || 'DHL-SF-9048-2810-US');

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = o.orderNumber.toLowerCase().includes(q);
      const matchCustomer = o.customerName.toLowerCase().includes(q);
      const matchEmail = o.customerEmail.toLowerCase().includes(q);
      const matchTracking = o.trackingNumber?.toLowerCase().includes(q);
      return matchNum || matchCustomer || matchEmail || matchTracking;
    }
    return true;
  });

  const handlePostNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !selectedOrder) return;

    const updated: Order = {
      ...selectedOrder,
      notes: [
        ...selectedOrder.notes,
        {
          author: 'Elena Rostova (Operations Head)',
          timestamp: t('just_now'),
          text: newNoteText.trim()
        }
      ]
    };
    onUpdateOrder(updated);
    setNewNoteText('');
  };

  const handleConfirmDispatch = () => {
    setLabelGenerating(true);
    setTimeout(() => {
      setLabelGenerating(false);
      setShowLabelModal(true);

      if (selectedOrder) {
        const updated: Order = {
          ...selectedOrder,
          status: 'shipped',
          trackingNumber: trackingNumber || 'DHL-SF-9048-2810-US',
          carrier: carrier,
          steps: selectedOrder.steps.map((st, idx) => {
            if (idx === 2) return { ...st, status: 'completed', time: '14:40 PST' };
            if (idx === 3) return { ...st, status: 'in_progress', time: t('courier_dispatched') };
            return st;
          })
        };
        onUpdateOrder(updated);
      }
    }, 600);
  };

  const handleResendNotification = () => {
    setNotificationSent(true);
    setTimeout(() => setNotificationSent(false), 3000);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'processing':
        return (
          <span className="px-2.5 py-0.5 bg-[#ffdbcd] text-[#943700] text-[11px] font-bold rounded flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#bc4800] animate-ping"></span>
            {t('status_processing')}
          </span>
        );
      case 'shipped':
        return (
          <span className="px-2.5 py-0.5 bg-[#dae2fd] text-[#004ac6] text-[11px] font-bold rounded flex items-center gap-1">
            <Icon name="local_shipping" className="text-[13px]"/>
            {t('status_shipped')}
          </span>
        );
      case 'delivered':
        return (
          <span className="px-2.5 py-0.5 bg-[#eff4ff] text-[#004ac6] text-[11px] font-bold rounded flex items-center gap-1">
            <Icon name="check_circle" className="text-[13px]"/>
            {t('status_delivered')}
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-0.5 bg-[#e5eeff] text-[#565e74] text-[11px] font-bold rounded flex items-center gap-1">
            <Icon name="cancel" className="text-[13px]"/>
            {t('status_cancelled_refunded')}
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-[11px] font-bold rounded">
            {t('pending')}
          </span>
        );
    }
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
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-[#f8f9ff] text-[#0b1c30] dark:text-white text-[13px] font-semibold rounded-lg border border-[#c3c6d7] dark:border-slate-700 shadow-2xs transition-all cursor-pointer"
            >
              <Icon name="calendar_today" className="text-[17px] text-[#565e74] dark:text-slate-400"/>
              <span>{t('last_7_days')}</span>
              <Icon name="expand_more" className="text-[16px] text-[#737686]"/>
            </button>

            <button
              type="button"
              onClick={() => alert(t('exporting_manifest'))}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#004ac6] hover:bg-[#003ea8] text-white text-[13px] font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <Icon name="file_download" className="text-[17px]"/>
              <span>{t('export_manifest')}</span>
            </button>
          </div>
        </div>

        {/* QUICK KPI RIBBON */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI 1 */}
          <div className="bg-white dark:bg-[#131b2e] p-5 rounded-xl border border-[#e5eeff] dark:border-slate-800 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#565e74] dark:text-slate-400">
                {t('orders_today')}
              </span>
              <span className="p-1.5 rounded-lg bg-[#eff4ff] dark:bg-blue-950 text-[#004ac6] dark:text-blue-300">
                <Icon name="shopping_bag" className="text-[18px]"/>
              </span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-[#0b1c30] dark:text-white">148</span>
                <span className="text-[12px] font-bold text-[#004ac6] dark:text-blue-400">+14.2%</span>
              </div>
              <span className="text-[12px] font-medium text-[#565e74] dark:text-slate-400">{t('volume_label', { amount: '$42,850.00' })}</span>
            </div>
            <div className="w-full bg-[#dce9ff] dark:bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-[#004ac6] h-full rounded-full" style={{ width: '72%' }}></div>
            </div>
          </div>

          {/* KPI 2 */}
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
                <span className="text-2xl font-bold text-[#bc4800] dark:text-amber-400">19</span>
                <span className="px-1.5 py-0.5 bg-[#ffdad6] text-[#ba1a1a] text-[10px] font-bold rounded">
                  {t('urgent')}
                </span>
              </div>
              <span className="text-[12px] text-[#565e74] dark:text-slate-400">{t('sla_2h')}</span>
            </div>
            <div className="w-full bg-[#dce9ff] dark:bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-[#bc4800] h-full rounded-full" style={{ width: '45%' }}></div>
            </div>
          </div>

          {/* KPI 3 */}
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
                <span className="text-2xl font-bold text-[#0b1c30] dark:text-white">84</span>
                <span className="text-[11.5px] text-[#565e74] dark:text-slate-400">{t('active_dispatches')}</span>
              </div>
              <span className="text-[12px] text-[#004ac6] dark:text-blue-400 font-medium">{t('on_time_pct', { value: '98.4' })}</span>
            </div>
            <div className="w-full bg-[#dce9ff] dark:bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-[#2563eb] h-full rounded-full" style={{ width: '88%' }}></div>
            </div>
          </div>

          {/* KPI 4 */}
          <div className="bg-white dark:bg-[#131b2e] p-5 rounded-xl border border-[#e5eeff] dark:border-slate-800 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#565e74] dark:text-slate-400">
                {t('returns_exceptions')}
              </span>
              <span className="p-1.5 rounded-lg bg-[#eff4ff] text-[#737686]">
                <Icon name="assignment_return" className="text-[18px]"/>
              </span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-[#0b1c30] dark:text-white">2</span>
                <span className="text-[11.5px] text-[#737686]">{t('review_required')}</span>
              </div>
              <span className="text-[12px] text-[#004ac6] font-medium">{t('resolving')}</span>
            </div>
            <div className="w-full bg-[#dce9ff] dark:bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-[#737686] h-full rounded-full" style={{ width: '12%' }}></div>
            </div>
          </div>
        </div>

        {/* FILTER BAR & STATUS PILLS */}
        <div className="bg-white dark:bg-[#131b2e] p-4 rounded-xl border border-[#e5eeff] dark:border-slate-800 shadow-2xs flex flex-col lg:flex-row gap-3 items-center justify-between">
          <div className="flex-1 w-full lg:max-w-md relative">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737686] text-[18px]"/>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('orders_search_placeholder')}
              className="w-full h-10.5 pl-9 pr-4 bg-[#eff4ff] dark:bg-slate-800 text-[13px] text-[#0b1c30] dark:text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#004ac6] border border-transparent focus:border-[#004ac6]/30"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-[12.5px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-[#dce9ff] dark:bg-blue-900 text-[#004ac6] dark:text-blue-200'
                  : 'text-[#565e74] dark:text-slate-400 hover:bg-[#eff4ff] dark:hover:bg-slate-800'
              }`}
            >
              {t('all_orders_count', { count: 248 })}
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-lg text-[12.5px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === 'pending'
                  ? 'bg-[#dce9ff] dark:bg-blue-900 text-[#004ac6] dark:text-blue-200'
                  : 'text-[#565e74] dark:text-slate-400 hover:bg-[#eff4ff] dark:hover:bg-slate-800'
              }`}
            >
              {t('pending_review')}
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('processing')}
              className={`px-3 py-1.5 rounded-lg text-[12.5px] font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'processing'
                  ? 'bg-[#bc4800] text-white shadow-xs'
                  : 'bg-[#ffdbcd] text-[#943700] hover:bg-[#ffdbcd]/80'
              }`}
            >
              <span>{t('status_processing')}</span>
              <span className="px-1.5 py-0.2 bg-[#ffede6] text-[#943700] rounded-full text-[10px] font-bold">
                19
              </span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('shipped')}
              className={`px-3 py-1.5 rounded-lg text-[12.5px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === 'shipped'
                  ? 'bg-[#dce9ff] dark:bg-blue-900 text-[#004ac6] dark:text-blue-200'
                  : 'text-[#565e74] dark:text-slate-400 hover:bg-[#eff4ff] dark:hover:bg-slate-800'
              }`}
            >
              {t('status_shipped')}
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('delivered')}
              className={`px-3 py-1.5 rounded-lg text-[12.5px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === 'delivered'
                  ? 'bg-[#dce9ff] dark:bg-blue-900 text-[#004ac6] dark:text-blue-200'
                  : 'text-[#565e74] dark:text-slate-400 hover:bg-[#eff4ff] dark:hover:bg-slate-800'
              }`}
            >
              {t('status_delivered')}
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('cancelled')}
              className={`px-3 py-1.5 rounded-lg text-[12.5px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === 'cancelled'
                  ? 'bg-[#dce9ff] dark:bg-blue-900 text-[#004ac6] dark:text-blue-200'
                  : 'text-[#565e74] dark:text-slate-400 hover:bg-[#eff4ff] dark:hover:bg-slate-800'
              }`}
            >
              {t('status_cancelled')}
            </button>
          </div>
        </div>
      </div>

      {/* MASTER-DETAIL SPLIT WORKBENCH */}
      <div className="grid grid-cols-12 gap-6 items-start">
        {/* LEFT PANE: MASTER ORDERS LIST (5 cols) */}
        <div className="col-span-12 xl:col-span-5 flex flex-col gap-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#565e74] dark:text-slate-400">
              {t('active_queue')}
            </span>
            <span className="text-[11px] font-semibold text-[#004ac6] dark:text-blue-400 flex items-center gap-1 cursor-pointer">
              <Icon name="tune" className="text-[15px]"/> Filter Applied
            </span>
          </div>

          <div className="flex flex-col gap-2.5 max-h-[920px] overflow-y-auto pr-1">
            {filteredOrders.map((ord) => {
              const isSelected = ord.id === selectedOrderId;

              return (
                <div
                  key={ord.id}
                  onClick={() => {
                    setSelectedOrderId(ord.id);
                    setTrackingNumber(ord.trackingNumber || '');
                    if (ord.carrier) setCarrier(ord.carrier);
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#dbe1ff]/70 to-white dark:from-blue-950/60 dark:to-[#131b2e] border-[#004ac6] shadow-sm'
                      : 'bg-white dark:bg-[#131b2e] border-[#e5eeff] dark:border-slate-800 hover:border-blue-200 hover:shadow-2xs'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#004ac6] rounded-l-xl"></div>
                  )}

                  <div className="flex items-center justify-between mb-1.5 pl-1">
                    <span className="font-bold text-[13.5px] text-[#004ac6] dark:text-blue-400">
                      {ord.orderNumber}
                    </span>
                    {getStatusBadge(ord.status)}
                  </div>

                  <div className="flex items-center justify-between pl-1">
                    <div className="flex flex-col">
                      <span className="font-bold text-[14px] text-[#0b1c30] dark:text-white">
                        {ord.customerName}
                      </span>
                      <span className="text-[12px] text-[#565e74] dark:text-slate-400">
                        {t('items_count', { count: ord.itemCount })} • {ord.shippingMethod}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className={`text-[16px] font-bold ${ord.status === 'cancelled' ? 'line-through text-[#737686]' : 'text-[#0b1c30] dark:text-white'}`}>
                        ${ord.totalAmount.toFixed(2)}
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
              );
            })}
          </div>
        </div>

        {/* RIGHT PANE: DETAIL & FULFILLMENT WORKBENCH (7 cols) */}
        {selectedOrder && (
          <div className="col-span-12 xl:col-span-7 flex flex-col gap-5">
            {/* ORDER HEADER & ACTIONS BAR */}
            <div className="bg-white dark:bg-[#131b2e] p-5 rounded-xl border border-[#e5eeff] dark:border-slate-800 shadow-2xs flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-col">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold text-[#0b1c30] dark:text-white">
                      {t('order_number', { number: selectedOrder.orderNumber })}
                    </h2>
                    <span className="px-2.5 py-1 bg-[#eff4ff] dark:bg-blue-950 text-[#004ac6] dark:text-blue-300 text-[11.5px] font-semibold rounded-lg flex items-center gap-1">
                      <Icon name="credit_card" className="text-[15px]"/>
                      {selectedOrder.paymentMethod}
                    </span>
                  </div>
                  <span className="text-[12px] text-[#565e74] dark:text-slate-400 mt-1">
                    {t('recorded_on', { date: selectedOrder.dateStr })}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="p-2 rounded-lg bg-[#eff4ff] hover:bg-[#dce9ff] text-[#565e74] hover:text-[#0b1c30] transition-colors"
                    title={t('print_packing_slip')}
                  >
                    <Icon name="print" className="text-[18px]"/>
                  </button>

                  <button
                    type="button"
                    onClick={handleResendNotification}
                    className="p-2 rounded-lg bg-[#eff4ff] hover:bg-[#dce9ff] text-[#565e74] hover:text-[#0b1c30] transition-colors relative"
                    title={t('resend_customer_notification')}
                  >
                    <Icon name="mark_email_read" className="text-[18px]"/>
                    {notificationSent && (
                      <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap shadow">
                        {t('sent')}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenInvoice(selectedOrder)}
                    className="px-3 py-1.5 rounded-lg bg-[#dbe1ff] text-[#004ac6] hover:bg-[#b4c5ff] text-[12.5px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Icon name="receipt_long" className="text-[17px]"/>
                    <span>{t('tax_invoice_pdf')}</span>
                  </button>
                </div>
              </div>

              {/* PROGRESS TIMELINE STEPPER */}
              <div className="pt-3 pb-1 border-t border-[#f0f4ff] dark:border-slate-800">
                <div className="grid grid-cols-5 relative items-center">
                  <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-[#dce9ff] dark:bg-slate-700 z-0">
                    <div
                      className="bg-[#004ac6] h-full rounded-full transition-all duration-500"
                      style={{
                        width:
                          selectedOrder.status === 'delivered'
                            ? '100%'
                            : selectedOrder.status === 'shipped'
                            ? '75%'
                            : selectedOrder.status === 'processing'
                            ? '50%'
                            : '20%'
                      }}
                    ></div>
                  </div>

                  {selectedOrder.steps.map((step, idx) => (
                    <div key={idx} className="relative z-10 flex flex-col items-center text-center">
                      <div
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[12px] shadow-2xs font-semibold ${
                          step.status === 'completed'
                            ? 'bg-[#004ac6] text-white'
                            : step.status === 'in_progress'
                            ? 'bg-[#bc4800] text-white ring-4 ring-[#ffdbcd]'
                            : 'bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 text-[#737686]'
                        }`}
                      >
                        {step.status === 'completed' ? (
                          <Icon name="check" className="text-[15px]"/>
                        ) : step.status === 'in_progress' ? (
                          <Icon name="sync" className="text-[16px] animate-spin"/>
                        ) : (
                          <span>{idx + 1}</span>
                        )}
                      </div>
                      <span className="text-[11px] sm:text-[12px] font-semibold text-[#0b1c30] dark:text-white mt-1 line-clamp-1">
                        {step.title}
                      </span>
                      <span className="text-[10px] text-[#565e74] dark:text-slate-400">
                        {step.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* FULFILLMENT DISPATCH CONTROL WORKBENCH */}
            <div className="bg-[#eff4ff] dark:bg-slate-800/80 p-5 rounded-xl border border-[#dce9ff] dark:border-slate-700 shadow-2xs flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon name="inventory" className="text-[#004ac6] text-[22px]"/>
                  <h3 className="text-[16px] font-bold text-[#0b1c30] dark:text-white">
                    {t('dispatch_carrier_assignment')}
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-[#565e74] dark:text-slate-300 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-[#dce9ff] dark:border-slate-700">
                  {selectedOrder.warehouseHub}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                <div className="flex flex-col gap-1">
                  <label className="text-[11.5px] font-bold text-[#565e74] dark:text-slate-400">
                    {t('logistics_partner')}
                  </label>
                  <div className="relative">
                    <select
                      value={carrier}
                      onChange={(e) => setCarrier(e.target.value)}
                      className="w-full h-10 px-3 bg-white dark:bg-slate-900 text-[#0b1c30] dark:text-white text-[13px] rounded-lg border border-[#c3c6d7] dark:border-slate-700 appearance-none focus:outline-none focus:border-[#004ac6]"
                    >
                      <option value="DHL Express Worldwide (Pre-selected)">{t('dhl_preselected')}</option>
                      <option value="FedEx Priority Overnight">FedEx Priority Overnight</option>
                      <option value="UPS Next Day Air">UPS Next Day Air</option>
                    </select>
                    <Icon name="expand_more" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#737686] pointer-events-none text-[18px]"/>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11.5px] font-bold text-[#565e74] dark:text-slate-400">
                    {t('tracking_number_awb')}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="w-full h-10 pl-3 pr-8 bg-white dark:bg-slate-900 text-[#0b1c30] dark:text-white font-mono text-[12.5px] rounded-lg border border-[#c3c6d7] dark:border-slate-700 focus:outline-none focus:border-[#004ac6]"
                    />
                    <button
                      type="button"
                      onClick={() => setTrackingNumber(`DHL-SF-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-US`)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[#737686] hover:text-[#004ac6]"
                      title={t('generate_awb_barcode')}
                    >
                      <Icon name="qr_code_scanner" className="text-[17px]"/>
                    </button>
                  </div>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={handleConfirmDispatch}
                    disabled={labelGenerating}
                    className="w-full h-10 bg-[#004ac6] hover:bg-[#003ea8] text-white text-[12.5px] font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Icon name={labelGenerating ? 'hourglass_top' : 'send'} className="text-[17px]"/>
                    <span>{labelGenerating ? t('generating') : t('confirm_generate_label')}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* LINE ITEMS BREAKDOWN TABLE */}
            <div className="bg-white dark:bg-[#131b2e] rounded-xl border border-[#e5eeff] dark:border-slate-800 shadow-2xs overflow-hidden flex flex-col">
              <div className="p-4 bg-[#eff4ff]/60 dark:bg-slate-800/60 border-b border-[#e5eeff] dark:border-slate-700 flex items-center justify-between">
                <span className="text-[13px] font-bold text-[#0b1c30] dark:text-white">
                  {t('order_items_skus', { count: selectedOrder.items.length })}
                </span>
                <span className="text-[11.5px] text-[#004ac6] dark:text-blue-400 font-semibold">
                  {t('all_items_in_stock')}
                </span>
              </div>

              <div className="p-4 flex flex-col divide-y divide-[#f0f4ff] dark:divide-slate-800">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                    <img
                      src={item.image}
                      alt={item.imageAlt}
                      className="w-15 h-15 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 border border-[#e5eeff] dark:border-slate-700 shadow-2xs flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-[14px] text-[#0b1c30] dark:text-white truncate">
                        {item.title}
                      </h4>
                      <p className="text-[12px] text-[#565e74] dark:text-slate-400">
                        {item.subtitle}
                      </p>
                      <span className="text-[11px] font-mono text-[#737686]">
                        {t('sku_label', { sku: item.sku })}
                      </span>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-[12px] text-[#565e74] dark:text-slate-400">
                        {t('qty_label', { count: item.quantity })}
                      </span>
                      <span className="text-[15px] font-bold text-[#0b1c30] dark:text-white block mt-0.5">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* TOTALS RECAP */}
              <div className="bg-[#eff4ff]/60 dark:bg-slate-800/60 p-4 border-t border-[#e5eeff] dark:border-slate-700 flex flex-col gap-1.5 text-[13px]">
                <div className="flex justify-between text-[#565e74] dark:text-slate-400">
                  <span>{t('subtotal_plain')}</span>
                  <span className="font-semibold text-[#0b1c30] dark:text-white">
                    ${selectedOrder.subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-[#565e74] dark:text-slate-400">
                  <span>{t('shipping_handling')}</span>
                  <span className="font-semibold text-[#004ac6] dark:text-blue-400">
                    {t('free_amount')}
                  </span>
                </div>
                <div className="flex justify-between text-[#565e74] dark:text-slate-400">
                  <span>{t('california_state_tax')}</span>
                  <span className="font-semibold text-[#0b1c30] dark:text-white">
                    ${selectedOrder.tax.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-baseline pt-2 mt-1 border-t border-[#dce9ff] dark:border-slate-700">
                  <div className="flex flex-col">
                    <span className="text-[14px] font-bold text-[#0b1c30] dark:text-white">
                      {t('total_authorized_amount')}
                    </span>
                    <span className="text-[10.5px] text-[#737686]">
                      {t('luxury_surcharges')}
                    </span>
                  </div>
                  <span className="text-xl font-extrabold text-[#004ac6] dark:text-blue-400">
                    ${selectedOrder.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* CUSTOMER & LOGISTICS DETAILS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Customer Profile Card */}
              <div className="bg-white dark:bg-[#131b2e] p-4.5 rounded-xl border border-[#e5eeff] dark:border-slate-800 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#565e74] dark:text-slate-400">
                      {t('customer_credentials')}
                    </span>
                    <span className="px-2 py-0.5 bg-[#dae2fd] text-[#004ac6] text-[10.5px] font-bold rounded">
                      {selectedOrder.customerTier}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#dbe1ff] text-[#004ac6] flex items-center justify-center font-bold text-[14px]">
                      {selectedOrder.customerName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-[14px] text-[#0b1c30] dark:text-white">
                        {selectedOrder.customerName}
                      </span>
                      <span className="text-[12px] text-[#565e74] dark:text-slate-400">
                        {selectedOrder.customerEmail}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 bg-[#eff4ff] dark:bg-slate-800 p-2.5 rounded-lg mb-3">
                    <div>
                      <span className="text-[11px] text-[#565e74] dark:text-slate-400 block">
                        {t('lifetime_orders')}
                      </span>
                      <span className="text-[14px] font-bold text-[#0b1c30] dark:text-white">
                        {t('orders_n')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-[#565e74] dark:text-slate-400 block">
                        {t('total_spend')}
                      </span>
                      <span className="text-[14px] font-bold text-[#004ac6] dark:text-blue-400">
                        $6,420.00
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => alert(t('customer_history_alert'))}
                  className="text-[#004ac6] dark:text-blue-400 hover:underline text-[12px] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Icon name="history" className="text-[15px]"/>
                  <span>{t('full_customer_history')}</span>
                </button>
              </div>

              {/* Delivery & Billing Address Card */}
              <div className="bg-white dark:bg-[#131b2e] p-4.5 rounded-xl border border-[#e5eeff] dark:border-slate-800 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#565e74] dark:text-slate-400">
                      {t('destination_address')}
                    </span>
                    <span className="text-[#004ac6] dark:text-blue-400 flex items-center gap-1 text-[11px] font-semibold">
                      <Icon name="verified" className="text-[14px]"/>
                      <span>{t('verified_avs')}</span>
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5 mb-3">
                    <span className="font-semibold text-[13.5px] text-[#0b1c30] dark:text-white">
                      {selectedOrder.shippingAddress.name}
                    </span>
                    <p className="text-[12.5px] text-[#565e74] dark:text-slate-400 leading-relaxed">
                      {selectedOrder.shippingAddress.street}<br />
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zip}<br />
                      {selectedOrder.shippingAddress.country}
                    </p>
                    <span className="text-[11.5px] font-mono text-[#565e74] dark:text-slate-400 mt-1">
                      {selectedOrder.shippingAddress.phone}
                    </span>
                  </div>
                </div>

                <div className="bg-[#eff4ff] dark:bg-slate-800 p-2 rounded-lg flex items-center gap-1.5 text-[#004ac6] dark:text-blue-300 text-[11.5px] font-medium">
                  <Icon name="check" className="text-[15px]"/>
                  <span>{t('billing_same_as_shipping')}</span>
                </div>
              </div>
            </div>

            {/* INTERNAL NOTES & WORKSHOP INSTRUCTIONS */}
            <div className="bg-white dark:bg-[#131b2e] p-4.5 rounded-xl border border-[#e5eeff] dark:border-slate-800 shadow-2xs flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Icon name="edit_note" className="text-[#737686] text-[18px]"/>
                  <span className="text-[13.5px] font-bold text-[#0b1c30] dark:text-white">
                    {t('internal_notes')}
                  </span>
                </div>
                <span className="text-[11px] text-[#737686]">
                  {t('internal_only')}
                </span>
              </div>

              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                {selectedOrder.notes.map((nt, i) => (
                  <div key={i} className="p-3 bg-[#eff4ff] dark:bg-slate-800 rounded-lg flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-[#004ac6] dark:text-blue-300">
                        {nt.author}
                      </span>
                      <span className="text-[#565e74] dark:text-slate-400">
                        {nt.timestamp}
                      </span>
                    </div>
                    <p className="text-[12.5px] text-[#0b1c30] dark:text-slate-200 leading-snug">
                      "{nt.text}"
                    </p>
                  </div>
                ))}
              </div>

              <form onSubmit={handlePostNote} className="flex gap-2 mt-1">
                <input
                  type="text"
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder={t('add_private_note')}
                  className="flex-1 h-9 px-3 bg-[#eff4ff] dark:bg-slate-800 text-[#0b1c30] dark:text-white text-[12.5px] rounded-lg border border-transparent focus:border-[#004ac6] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!newNoteText.trim()}
                  className="px-3.5 h-9 bg-[#dce9ff] dark:bg-slate-700 hover:bg-[#b4c5ff] text-[#004ac6] dark:text-white text-[12.5px] font-semibold rounded-lg transition-colors disabled:opacity-40 cursor-pointer"
                >
                  {t('post_note')}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Label Generated Modal */}
      {showLabelModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#131b2e] rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
              <Icon name="check_circle" className="text-[28px]"/>
            </div>
            <h3 className="text-lg font-bold text-center text-[#0b1c30] dark:text-white">
              {t('label_ready')}
            </h3>
            <p className="text-[13px] text-center text-[#565e74] dark:text-slate-400 mt-1">
              <Trans i18nKey="awb_dispatched" values={{ tracking: trackingNumber, carrier }} components={{ strong: <span className="font-mono font-bold text-[#004ac6]" /> }} />
            </p>

            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 mt-4 text-center">
              <div className="font-mono text-[11px] text-slate-500 mb-1">AIRWAY BILL BARCODE</div>
              <div className="h-10 bg-slate-800 dark:bg-black text-white flex items-center justify-center font-mono tracking-widest text-[12px] rounded">
                |||| | || ||||| ||| || | |||| ||
              </div>
              <div className="font-mono text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                {trackingNumber}
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                type="button"
                onClick={() => {
                  window.print();
                  setShowLabelModal(false);
                }}
                className="flex-1 py-2 bg-[#004ac6] text-white rounded-lg text-[13px] font-semibold"
              >
                {t('print_label')}
              </button>
              <button
                type="button"
                onClick={() => setShowLabelModal(false)}
                className="py-2 px-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg text-[13px] font-semibold"
              >
                {t('done')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
