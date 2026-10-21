import useLocales from '@/locales/use-locales';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Icon } from '@/components/lucide-icon';
import { ItemCondition, RmaItem, RmaStatus } from './types';

interface ReturnsViewProps {
  rmas: RmaItem[];
  onUpdateRma: (updated: RmaItem) => void;
  onAddRma: (rma: RmaItem) => void;
}

type StatusTab = 'All' | RmaStatus;

const STATUS_TABS: { key: StatusTab; labelKey: string }[] = [
  { key: 'All', labelKey: 'rma_tab_all' },
  { key: 'Requested', labelKey: 'rma_tab_requested' },
  { key: 'In Transit', labelKey: 'rma_tab_in_transit' },
  { key: 'Inspection Pending', labelKey: 'rma_tab_inspection' },
  { key: 'Refunded', labelKey: 'rma_tab_refunded' },
  { key: 'Rejected', labelKey: 'rma_tab_rejected' },
];

const STATUS_LABEL_KEYS: Record<RmaStatus, string> = {
  Requested: 'rma_tab_requested',
  'In Transit': 'rma_tab_in_transit',
  'Inspection Pending': 'rma_tab_inspection',
  Refunded: 'rma_tab_refunded',
  Rejected: 'rma_tab_rejected',
};

const CONDITIONS: { value: ItemCondition; labelKey: string; descKey: string }[] = [
  { value: 'Pristine / Grade A', labelKey: 'rma_cond_a', descKey: 'rma_cond_a_desc' },
  { value: 'Grade B (Light Wear)', labelKey: 'rma_cond_b', descKey: 'rma_cond_b_desc' },
  { value: 'Damaged / Unsellable', labelKey: 'rma_cond_c', descKey: 'rma_cond_c_desc' },
];

const DISPOSITIONS: { value: string; labelKey: string }[] = [
  { value: 'Restock to SF Central Primary Inventory (Bin #W-04-18)', labelKey: 'rma_disp_restock' },
  { value: 'Route to Garment Care (Steam & Repackage)', labelKey: 'rma_disp_care' },
  { value: 'Allocate to VIP Exchange Hold Queue (Size 36R Waitlist)', labelKey: 'rma_disp_exchange' },
  { value: 'Transfer to Outlet / Private Archive Sale', labelKey: 'rma_disp_outlet' },
];

const PACKAGING_CHECKS: {
  key: keyof RmaItem['packagingCheck'];
  id: string;
  labelKey: string;
}[] = [
  { key: 'garmentBag', id: 'checkDustbag', labelKey: 'rma_check_garment' },
  { key: 'spareButtons', id: 'checkButtons', labelKey: 'rma_check_buttons' },
  { key: 'securityRibbon', id: 'checkSeal', labelKey: 'rma_check_ribbon' },
];

const CARD = 'bg-white dark:bg-[#131b2e] rounded-xl border border-[#e5eeff] dark:border-slate-800 shadow-2xs';
const SECTION_LABEL = 'text-[11px] font-semibold text-[#565e74] dark:text-slate-400 uppercase tracking-wider';

export const ReturnsView: React.FC<ReturnsViewProps> = ({ rmas, onUpdateRma, onAddRma }) => {
  const { t } = useLocales();
  const [selectedId, setSelectedId] = useState<string>(rmas[0]?.id || '');
  const [activeTab, setActiveTab] = useState<StatusTab>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [reasonFilter, setReasonFilter] = useState('all');
  const [newNoteInput, setNewNoteInput] = useState('');

  const activeRma = rmas.find((r) => r.id === selectedId) || rmas[0];

  const updateActiveRma = (updater: (prev: RmaItem) => RmaItem) => {
    if (!activeRma) return;
    onUpdateRma(updater(activeRma));
  };

  const handleConditionSelect = (cond: ItemCondition) => {
    updateActiveRma((prev) => ({ ...prev, condition: cond }));
    toast.success(t('rma_toast_condition', { condition: t(CONDITIONS.find((c) => c.value === cond)!.labelKey) }));
  };

  const handlePostNote = () => {
    if (!newNoteInput.trim() || !activeRma) return;
    const newNote = {
      author: 'Elena Rostova',
      role: 'Head of Operations',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      message: newNoteInput.trim(),
    };
    updateActiveRma((prev) => ({ ...prev, auditNotes: [...prev.auditNotes, newNote] }));
    setNewNoteInput('');
    toast.success(t('rma_toast_note'));
  };

  const handleApproveRefund = () => {
    updateActiveRma((prev) => ({ ...prev, status: 'Refunded' }));
    toast.success(
      t('rma_toast_refund', {
        amount: activeRma.reimbursementTotal.toFixed(2),
        destination: activeRma.payoutDestination,
      })
    );
  };

  const handleIssueStoreCredit = () => {
    const bonusAmount = (activeRma.reimbursementTotal * 1.1).toFixed(2);
    updateActiveRma((prev) => ({ ...prev, status: 'Refunded', isStoreCreditBonusApplied: true }));
    toast.success(t('rma_toast_credit', { amount: bonusAmount, customer: activeRma.customerName }));
  };

  const handleReject = () => {
    updateActiveRma((prev) => ({ ...prev, status: 'Rejected' }));
    toast.error(t('rma_toast_reject', { id: activeRma.id }));
  };

  const handleManualRma = () => {
    if (!activeRma) return;
    const customerName = window.prompt(t('rma_manual_prompt'));
    if (!customerName) return;
    const newId = `RMA-2024-${Math.floor(1000 + Math.random() * 9000)}`;
    onAddRma({
      ...activeRma,
      id: newId,
      orderRef: `#ORD-2024-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName,
      status: 'Requested',
      slaRemaining: '48h SLA',
      auditNotes: [],
    });
    setSelectedId(newId);
    toast.success(t('rma_toast_case_created', { id: newId }));
  };

  const filteredRmas = rmas.filter((r) => {
    if (activeTab !== 'All' && r.status !== activeTab) return false;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      r.id.toLowerCase().includes(q) ||
      r.orderRef.toLowerCase().includes(q) ||
      r.customerName.toLowerCase().includes(q) ||
      r.itemTitle.toLowerCase().includes(q)
    );
  });

  const countFor = (tab: StatusTab) =>
    tab === 'All' ? rmas.length : rmas.filter((r) => r.status === tab).length;

  const getStatusBadgeClass = (status: RmaStatus) => {
    switch (status) {
      case 'Inspection Pending':
        return 'bg-[#ffdbcd] text-[#943700]';
      case 'Refunded':
        return 'bg-[#eff4ff] dark:bg-slate-800 text-[#0b1c30] dark:text-white';
      case 'Rejected':
        return 'bg-[#ffdad6] text-[#93000a]';
      default:
        return 'bg-[#dae2fd] text-[#004ac6]';
    }
  };

  const metrics = [
    {
      label: t('rma_metric_open_requests'),
      icon: 'assignment_return',
      iconBox: 'bg-[#eff4ff] dark:bg-slate-800 text-[#004ac6] dark:text-blue-400',
      value: '24',
      trend: (
        <span className="flex items-center gap-0.5 text-[#004ac6] dark:text-blue-400 text-[11px] font-semibold">
          <Icon name="trending_up" className="text-[14px]" />
          {t('rma_today_delta', { count: 3 })}
        </span>
      ),
      footLabel: t('rma_awaiting_dropoff'),
      footValue: t('rma_items_count', { count: 6 }),
      footClass: 'text-[#0b1c30] dark:text-white',
    },
    {
      label: t('rma_metric_quality_intake'),
      icon: 'verified',
      iconBox: 'bg-[#ffdbcd] text-[#943700]',
      value: '9',
      trend: (
        <span className="flex items-center gap-0.5 text-[#bc4800] text-[11px] font-semibold">
          <Icon name="schedule" className="text-[14px]" />
          {t('rma_bay_active')}
        </span>
      ),
      footLabel: t('rma_sla_breach_window'),
      footValue: t('rma_time_remaining', { time: '4h 12m' }),
      footClass: 'text-[#bc4800]',
    },
    {
      label: t('rma_metric_approved_refunds'),
      icon: 'payments',
      iconBox: 'bg-[#dae2fd] text-[#004ac6]',
      value: '$4,280',
      trend: (
        <span className="text-[#565e74] dark:text-slate-400 text-[11px]">{t('rma_items_count', { count: 14 })}</span>
      ),
      footLabel: t('rma_auto_payout'),
      footValue: t('rma_batch_rate', { rate: '98.2%' }),
      footClass: 'text-[#0b1c30] dark:text-white',
    },
    {
      label: t('rma_metric_health'),
      icon: 'query_stats',
      iconBox: 'bg-[#e5eeff] dark:bg-slate-800 text-[#004ac6] dark:text-blue-400',
      value: '1.8%',
      trend: (
        <span className="flex items-center gap-0.5 text-emerald-600 text-[11px] font-semibold">
          <Icon name="arrow_downward" className="text-[14px]" />
          {t('rma_mom', { value: '-0.3%' })}
        </span>
      ),
      footLabel: t('rma_primary_cause'),
      footValue: t('rma_sizing_fit_pct'),
      footClass: 'text-[#0b1c30] dark:text-white',
    },
  ];

  return (
    <div className="flex flex-col w-full gap-5">
      {/* Command header & breadcrumb strip */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1 text-[#565e74] dark:text-slate-400 text-[11px]">
            <span>{t('rma_breadcrumb_ops')}</span>
            <Icon name="chevron_right" className="text-[14px]" />
            <span className="text-[#004ac6] dark:text-blue-400 font-semibold">{t('rma_breadcrumb_returns')}</span>
            <Icon name="chevron_right" className="text-[14px]" />
            <span className="text-[#0b1c30] dark:text-white">{t('rma_breadcrumb_workbench')}</span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-[#0b1c30] dark:text-white tracking-tight">
              {t('rma_center_title')}
            </h1>
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-[#e5eeff] dark:bg-slate-800 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#004ac6] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#004ac6]"></span>
              </span>
              <span className="text-[11px] text-[#0b1c30] dark:text-slate-200 font-medium">
                {t('rma_pipeline_sla')}
              </span>
            </div>
          </div>

          <p className="text-[13px] text-[#565e74] dark:text-slate-400 max-w-2xl">{t('rma_center_desc')}</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => toast.success(t('rma_toast_export'))}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-[#131b2e] hover:bg-[#eff4ff] dark:hover:bg-slate-800 text-[#0b1c30] dark:text-white text-[13px] rounded-lg shadow-2xs transition-all border border-[#e5eeff] dark:border-slate-700 font-medium"
            type="button"
          >
            <Icon name="file_download" className="text-[18px]" />
            <span>{t('rma_export_report')}</span>
          </button>
          <button
            onClick={() => toast.info(t('rma_toast_batch'))}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-[#131b2e] hover:bg-[#eff4ff] dark:hover:bg-slate-800 text-[#0b1c30] dark:text-white text-[13px] rounded-lg shadow-2xs transition-all border border-[#e5eeff] dark:border-slate-700 font-medium"
            type="button"
          >
            <Icon name="fact_check" className="text-[18px]" />
            <span>{t('rma_batch_inspection')}</span>
          </button>
          <button
            onClick={handleManualRma}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#2563eb] hover:bg-[#004ac6] text-white text-[13px] rounded-lg shadow-sm transition-all font-semibold"
            type="button"
          >
            <Icon name="add_circle" className="text-[18px]" />
            <span>{t('rma_process_manual')}</span>
          </button>
        </div>
      </div>

      {/* Operational metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className={`${CARD} p-4 flex flex-col justify-between`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className={SECTION_LABEL}>{m.label}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${m.iconBox}`}>
                <Icon name={m.icon} className="text-[18px]" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-1.5">
              <span className="text-[28px] text-[#0b1c30] dark:text-white font-bold leading-none">{m.value}</span>
              {m.trend}
            </div>
            <div className="flex items-center justify-between text-[#565e74] dark:text-slate-400 text-[11px] bg-[#eff4ff]/60 dark:bg-slate-800/60 px-2.5 py-1 rounded-md">
              <span>{m.footLabel}</span>
              <span className={`font-semibold ${m.footClass}`}>{m.footValue}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar & status segments */}
      <div className={`${CARD} p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4`}>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 xl:pb-0">
          {STATUS_TABS.map(({ key, labelKey }) => {
            const isActive = activeTab === key;
            const isInspection = key === 'Inspection Pending';
            const isRejected = key === 'Rejected';
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-3.5 py-1.5 rounded-lg text-[12px] font-semibold flex items-center gap-1.5 shrink-0 transition-all ${
                  isActive
                    ? isInspection
                      ? 'bg-[#bc4800] text-white'
                      : isRejected
                      ? 'bg-[#ba1a1a] text-white'
                      : 'bg-[#2563eb] text-white'
                    : `bg-[#eff4ff] dark:bg-slate-800 hover:bg-[#e5eeff] dark:hover:bg-slate-700 ${
                        isInspection ? 'text-[#bc4800]' : 'text-[#0b1c30] dark:text-slate-200'
                      }`
                }`}
                type="button"
              >
                {isInspection && <span className="w-1.5 h-1.5 rounded-full bg-[#bc4800]"></span>}
                <span>{t(labelKey)}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                    isActive ? 'bg-white/20' : 'bg-[#dae2fd] dark:bg-slate-700 text-[#565e74] dark:text-slate-300'
                  }`}
                >
                  {countFor(key)}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 flex-wrap xl:flex-nowrap">
          <div className="relative min-w-[240px] flex-1">
            <Icon
              name="search"
              className="text-[18px] absolute left-2.5 top-1/2 -translate-y-1/2 text-[#737686]"
            />
            <input
              className="w-full h-9 pl-8 pr-3 bg-[#eff4ff] dark:bg-slate-800 text-[13px] text-[#0b1c30] dark:text-white placeholder:text-[#737686] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2563eb] transition-colors"
              placeholder={t('rma_search_placeholder')}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            value={reasonFilter}
            onChange={(e) => setReasonFilter(e.target.value)}
            className="h-9 px-2.5 bg-[#eff4ff] dark:bg-slate-800 text-[#0b1c30] dark:text-white text-[12px] rounded-lg focus:outline-none cursor-pointer border-none"
          >
            <option value="all">{t('rma_filter_reason_all')}</option>
            <option value="sizing">{t('rma_filter_reason_sizing')}</option>
            <option value="fabric">{t('rma_filter_reason_fabric')}</option>
            <option value="defect">{t('rma_filter_reason_defect')}</option>
            <option value="mind">{t('rma_filter_reason_mind')}</option>
          </select>
          <select className="h-9 px-2.5 bg-[#eff4ff] dark:bg-slate-800 text-[#0b1c30] dark:text-white text-[12px] rounded-lg focus:outline-none cursor-pointer border-none">
            <option>{t('rma_warehouse_sf')}</option>
            <option>{t('rma_warehouse_ny')}</option>
            <option>{t('rma_warehouse_paris')}</option>
          </select>
        </div>
      </div>

      {/* Master-detail workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Active RMA queue */}
        <div className="lg:col-span-5 flex flex-col gap-2.5">
          <div className="flex items-center justify-between px-1 py-0.5">
            <span className={SECTION_LABEL}>
              {t('rma_active_queue', { shown: filteredRmas.length, total: rmas.length })}
            </span>
            <div className="flex items-center gap-1 text-[#565e74] dark:text-slate-400 text-[11px]">
              <span>{t('rma_sort_sla')}</span>
              <Icon name="swap_vert" className="text-[16px]" />
            </div>
          </div>

          {filteredRmas.map((item) => {
            const isSelected = item.id === activeRma?.id;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                className={`bg-white dark:bg-[#131b2e] p-4 rounded-xl transition-all cursor-pointer flex flex-col gap-2.5 border ${
                  isSelected
                    ? 'shadow-md border-l-4 border-l-[#2563eb] border-[#2563eb]/20 bg-[#eff4ff]/50 dark:bg-slate-800/60'
                    : 'shadow-2xs border-[#e5eeff] dark:border-slate-800 hover:border-[#c3c6d7] dark:hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[15px] text-[#0b1c30] dark:text-white font-bold">#{item.id}</span>
                    <span className="px-1.5 py-0.5 bg-[#dae2fd] text-[#004ac6] text-[11px] rounded font-semibold">
                      {item.bay}
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1.5 ${getStatusBadgeClass(item.status)}`}
                  >
                    {item.status === 'Inspection Pending' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#bc4800] animate-pulse"></span>
                    )}
                    {t(STATUS_LABEL_KEYS[item.status])}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[13px] text-[#0b1c30] dark:text-white">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold">{item.customerName}</span>
                    <span className="px-1.5 py-0.5 bg-[#dae2fd] text-[#131b2e] text-[10px] rounded font-medium">
                      {item.customerSegment}
                    </span>
                  </div>
                  <span className="text-[#565e74] dark:text-slate-400 text-[11px]">
                    {t('rma_ref', { ref: item.orderRef })}
                  </span>
                </div>

                <div className="p-2.5 bg-[#eff4ff] dark:bg-slate-800 rounded-lg flex items-center gap-2.5">
                  <img
                    className="w-12 h-12 object-cover rounded-md bg-slate-100 dark:bg-slate-700 shrink-0"
                    src={item.itemImage}
                    alt={item.itemTitle}
                  />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[13px] text-[#0b1c30] dark:text-white font-semibold truncate">
                      {item.itemTitle}
                    </span>
                    <div className="flex items-center gap-2 text-[11px] text-[#565e74] dark:text-slate-400">
                      <span>${item.itemPrice.toFixed(2)}</span>
                      <span className="px-1.5 py-0.5 bg-[#dae2fd] dark:bg-slate-700 rounded text-[#0b1c30] dark:text-white">
                        {t(CONDITIONS.find((c) => c.value === item.condition)?.labelKey ?? 'rma_cond_a')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#565e74] dark:text-slate-400 pt-0.5">
                  <span className="flex items-center gap-1">
                    <Icon name="local_shipping" className="text-[14px]" />
                    {item.carrier}
                  </span>
                  <span className="font-semibold text-[#bc4800]">{t('rma_sla_label', { value: item.slaRemaining })}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail workbench */}
        {activeRma && (
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Detail header & customer dossier */}
            <div className={`${CARD} p-5 flex flex-col gap-4`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-[#f0f4ff] dark:border-slate-800">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl text-[#0b1c30] dark:text-white font-bold">#{activeRma.id}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#ffdbcd] text-[#943700] text-[11px] font-bold">
                      {t('rma_status_active', { status: t(STATUS_LABEL_KEYS[activeRma.status]) })}
                    </span>
                  </div>
                  <span className="text-[#565e74] dark:text-slate-400 text-[13px]">
                    {t('rma_linked_order')}{' '}
                    <a className="text-[#004ac6] dark:text-blue-400 font-semibold hover:underline" href="#">
                      {activeRma.orderRef}
                    </a>{' '}
                    • {t('rma_created_at')}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      toast.success(t('rma_toast_print', { bay: activeRma.bay }));
                      window.print();
                    }}
                    className="p-1.5 text-[#565e74] dark:text-slate-400 hover:text-[#0b1c30] dark:hover:text-white hover:bg-[#eff4ff] dark:hover:bg-slate-800 rounded transition-colors"
                    title={t('rma_print_title')}
                    type="button"
                  >
                    <Icon name="print" className="text-[20px]" />
                  </button>
                  <button
                    onClick={() => toast.info(t('rma_toast_comms'))}
                    className="p-1.5 text-[#565e74] dark:text-slate-400 hover:text-[#0b1c30] dark:hover:text-white hover:bg-[#eff4ff] dark:hover:bg-slate-800 rounded transition-colors"
                    title={t('rma_comms_title')}
                    type="button"
                  >
                    <Icon name="chat" className="text-[20px]" />
                  </button>
                  <button
                    onClick={() => toast.info(t('rma_toast_audit'))}
                    className="p-1.5 text-[#565e74] dark:text-slate-400 hover:text-[#0b1c30] dark:hover:text-white hover:bg-[#eff4ff] dark:hover:bg-slate-800 rounded transition-colors"
                    title={t('rma_audit_title')}
                    type="button"
                  >
                    <Icon name="history" className="text-[20px]" />
                  </button>
                </div>
              </div>

              {/* Customer summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#eff4ff]/60 dark:bg-slate-800/60 p-4 rounded-lg">
                <div className="flex flex-col">
                  <span className="text-[11px] text-[#565e74] dark:text-slate-400">{t('rma_customer_details')}</span>
                  <span className="text-[13px] text-[#0b1c30] dark:text-white font-semibold">{activeRma.customerName}</span>
                  <span className="text-[12px] text-[#565e74] dark:text-slate-400 truncate">{activeRma.customerEmail}</span>
                  <span className="text-[11px] text-[#565e74] dark:text-slate-400 mt-1">{activeRma.customerCity}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] text-[#565e74] dark:text-slate-400">{t('rma_account_standing')}</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="px-2 py-0.5 bg-[#dae2fd] text-[#131b2e] text-[11px] rounded font-semibold">
                      {activeRma.customerSegment}
                    </span>
                    <span className="text-[#0b1c30] dark:text-white text-[11px]">{t('rma_top_spender')}</span>
                  </div>
                  <span className="text-[11px] text-[#565e74] dark:text-slate-400 mt-1">
                    {t('rma_lifetime_spend', { value: activeRma.lifetimeSpend })}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] text-[#565e74] dark:text-slate-400">{t('rma_reverse_profile')}</span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-[16px] text-[#0b1c30] dark:text-white font-bold leading-none">
                      {activeRma.returnRate}
                    </span>
                    <span className="text-[#565e74] dark:text-slate-400 text-[11px]">{t('rma_return_rate_exemplary')}</span>
                  </div>
                  <span className="text-[11px] text-[#565e74] dark:text-slate-400 mt-1">
                    {t('rma_total_returns', { value: activeRma.totalReturns })}
                  </span>
                </div>
              </div>

              {/* Lifecycle stepper */}
              <div className="pt-2">
                <span className={`${SECTION_LABEL} block mb-4`}>{t('rma_lifecycle')}</span>
                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    { label: t('rma_step_initiated'), sub: 'Oct 22, 14:10', icon: 'check', state: 'done' },
                    { label: t('rma_step_label'), sub: 'DHL Express', icon: 'check', state: 'done' },
                    { label: t('rma_step_intake'), sub: 'Oct 24, 09:30', icon: 'check', state: 'done' },
                    {
                      label: t('rma_step_inspection'),
                      sub: t('rma_step_inspection_active', { bay: activeRma.bay }),
                      icon: 'microbiology',
                      state: 'active',
                    },
                    {
                      label: t('rma_step_refund'),
                      sub: activeRma.status === 'Refunded' ? t('rma_step_done') : t('rma_step_pending'),
                      icon: activeRma.status === 'Refunded' ? 'check' : '',
                      state: activeRma.status === 'Refunded' ? 'done' : 'todo',
                    },
                  ].map((step) => (
                    <div key={step.label} className="flex flex-col items-center text-center gap-1">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold z-10 ${
                          step.state === 'done'
                            ? 'bg-[#2563eb] text-white shadow-sm'
                            : step.state === 'active'
                            ? 'bg-[#bc4800] text-white ring-4 ring-[#ffdbcd] shadow-sm'
                            : 'bg-[#dae2fd] dark:bg-slate-700 text-[#565e74] dark:text-slate-300'
                        }`}
                      >
                        {step.icon ? <Icon name={step.icon} className="text-[16px]" /> : '5'}
                      </div>
                      <span
                        className={`text-[12px] ${
                          step.state === 'todo'
                            ? 'text-[#565e74] dark:text-slate-400'
                            : step.state === 'active'
                            ? 'font-bold text-[#bc4800]'
                            : 'font-semibold text-[#0b1c30] dark:text-white'
                        }`}
                      >
                        {step.label}
                      </span>
                      <span
                        className={`text-[10px] ${
                          step.state === 'active' ? 'text-[#bc4800] font-semibold' : 'text-[#565e74] dark:text-slate-400'
                        }`}
                      >
                        {step.sub}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quality grading card */}
            <div className={`${CARD} p-5 flex flex-col gap-4`}>
              <div className="flex items-center justify-between pb-2 border-b border-[#f0f4ff] dark:border-slate-800">
                <div className="flex items-center gap-1.5">
                  <Icon name="grading" className="text-[20px] text-[#004ac6] dark:text-blue-400" />
                  <span className="text-[15px] text-[#0b1c30] dark:text-white font-semibold">{t('rma_inspection_title')}</span>
                </div>
                <span className="text-[11px] text-[#565e74] dark:text-slate-400">{t('rma_inspector')}</span>
              </div>

              {/* Item bio */}
              <div className="flex flex-col sm:flex-row items-start gap-4 p-4 bg-[#eff4ff]/60 dark:bg-slate-800/60 rounded-lg">
                <img
                  className="w-20 h-24 object-cover rounded-lg bg-slate-100 dark:bg-slate-700 shrink-0"
                  src={activeRma.itemImage}
                  alt={activeRma.itemTitle}
                />
                <div className="flex flex-col flex-1 justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[15px] text-[#0b1c30] dark:text-white font-bold">{activeRma.itemTitle}</span>
                      <span className="text-[15px] text-[#0b1c30] dark:text-white font-bold">
                        ${activeRma.itemPrice.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-[12px] text-[#565e74] dark:text-slate-400 mt-0.5">
                      {t('rma_sku')}:{' '}
                      <span className="font-semibold text-[#0b1c30] dark:text-white">{activeRma.itemSku}</span> •{' '}
                      {t('rma_size')}: {activeRma.itemSize} • {t('rma_material')}: {activeRma.itemMaterial}
                    </p>
                  </div>
                  <div className="mt-2 pt-1 text-[11px] text-[#565e74] dark:text-slate-400">
                    {t('rma_customer_note')}:{' '}
                    <em className="text-[#0b1c30] dark:text-white">"{activeRma.customerNote}"</em>
                  </div>
                </div>
              </div>

              {/* Condition selector */}
              <div className="flex flex-col gap-1.5">
                <span className={SECTION_LABEL}>{t('rma_condition_title')}</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {CONDITIONS.map(({ value, labelKey, descKey }) => {
                    const selected = activeRma.condition === value;
                    return (
                      <label
                        key={value}
                        onClick={() => handleConditionSelect(value)}
                        className={`flex flex-col p-3.5 rounded-lg cursor-pointer transition-all border-2 ${
                          selected
                            ? 'bg-[#eff4ff] dark:bg-slate-800 border-[#2563eb] shadow-2xs'
                            : 'bg-[#eff4ff]/50 dark:bg-slate-800/40 hover:bg-[#eff4ff] dark:hover:bg-slate-800 border-transparent'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[13px] font-bold text-[#0b1c30] dark:text-white">{t(labelKey)}</span>
                          <Icon
                            name={selected ? 'check_circle' : 'radio_button_unchecked'}
                            className={`text-[20px] ${selected ? 'text-[#2563eb]' : 'text-[#737686]'}`}
                          />
                        </div>
                        <span className="text-[12px] text-[#565e74] dark:text-slate-400">{t(descKey)}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Packaging checklist */}
              <div className="flex flex-col gap-1.5 pt-1">
                <span className={SECTION_LABEL}>{t('rma_packaging_title')}</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {PACKAGING_CHECKS.map(({ key, id, labelKey }) => (
                    <div key={key} className="flex items-center gap-2.5 p-2.5 bg-[#eff4ff]/60 dark:bg-slate-800/60 rounded-lg">
                      <input
                        checked={activeRma.packagingCheck[key]}
                        onChange={(e) =>
                          updateActiveRma((prev) => ({
                            ...prev,
                            packagingCheck: { ...prev.packagingCheck, [key]: e.target.checked },
                          }))
                        }
                        className="w-4 h-4 rounded accent-[#2563eb] cursor-pointer"
                        id={id}
                        type="checkbox"
                      />
                      <label
                        className="text-[12px] text-[#0b1c30] dark:text-white cursor-pointer select-none font-medium"
                        htmlFor={id}
                      >
                        {t(labelKey)}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Disposition routing */}
              <div className="flex flex-col gap-1.5 pt-1">
                <span className={SECTION_LABEL}>{t('rma_disposition_title')}</span>
                <div className="flex items-center gap-4">
                  <select
                    value={activeRma.dispositionRouting}
                    onChange={(e) => updateActiveRma((prev) => ({ ...prev, dispositionRouting: e.target.value }))}
                    className="flex-1 h-10 px-3 bg-[#eff4ff] dark:bg-slate-800 text-[#0b1c30] dark:text-white text-[13px] rounded-lg focus:outline-none cursor-pointer"
                  >
                    {DISPOSITIONS.map(({ value, labelKey }) => (
                      <option key={value} value={value}>
                        {t(labelKey)}
                      </option>
                    ))}
                  </select>
                  <span className="px-3 py-1.5 bg-[#dae2fd] text-[#004ac6] rounded-lg text-[11px] font-semibold shrink-0">
                    {t('rma_immediate_sync')}
                  </span>
                </div>
              </div>
            </div>

            {/* Financial reconciliation */}
            <div className={`${CARD} p-5 flex flex-col gap-4`}>
              <div className="flex items-center justify-between pb-2 border-b border-[#f0f4ff] dark:border-slate-800">
                <div className="flex items-center gap-1.5">
                  <Icon name="receipt_long" className="text-[20px] text-[#004ac6] dark:text-blue-400" />
                  <span className="text-[15px] text-[#0b1c30] dark:text-white font-semibold">{t('rma_ledger_title')}</span>
                </div>
                <span className="text-[11px] text-[#0b1c30] dark:text-white font-medium">{t('rma_currency')}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1 text-[13px]">
                  <div className="flex items-center justify-between py-1 text-[#565e74] dark:text-slate-400">
                    <span>{t('rma_orig_paid')}</span>
                    <span className="font-semibold text-[#0b1c30] dark:text-white">
                      ${activeRma.originalPaid.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 text-[#565e74] dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <span>{t('rma_logistics_fee')}</span>
                      <span className="px-1.5 py-0.5 bg-[#dae2fd] text-[#004ac6] text-[10px] rounded font-semibold">
                        {t('rma_vip_waived')}
                      </span>
                    </div>
                    <span className="text-[#0b1c30] dark:text-white">${activeRma.logisticsFee.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 text-[#565e74] dark:text-slate-400">
                    <span>{t('rma_restock_fee')}</span>
                    <span className="text-[#0b1c30] dark:text-white">${activeRma.restockingFee.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between py-2.5 mt-1 border-t border-[#e5eeff] dark:border-slate-700 text-[15px] font-bold text-[#0b1c30] dark:text-white">
                    <span>{t('rma_total_due')}</span>
                    <span className="text-[#004ac6] dark:text-blue-400">${activeRma.reimbursementTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex flex-col justify-between p-4 bg-[#eff4ff]/60 dark:bg-slate-800/60 rounded-lg gap-2.5">
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col">
                      <span className="text-[13px] font-semibold text-[#0b1c30] dark:text-white">{t('rma_payout_dest')}</span>
                      <span className="text-[12px] text-[#565e74] dark:text-slate-400">{activeRma.payoutDestination}</span>
                    </div>
                    <Icon name="credit_card" className="text-[22px] text-[#004ac6] dark:text-blue-400" />
                  </div>

                  <div className="p-2.5 bg-[#dae2fd]/60 dark:bg-slate-700 rounded-md flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-1.5">
                      <Icon name="stars" className="text-[18px] text-[#004ac6] dark:text-blue-400" />
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-[#0b1c30] dark:text-white">{t('rma_offer_credit')}</span>
                        <span className="text-[11px] text-[#565e74] dark:text-slate-300">
                          {t('rma_credit_converts', { amount: (activeRma.reimbursementTotal * 1.1).toFixed(2) })}
                        </span>
                      </div>
                    </div>
                    <input
                      checked={activeRma.isStoreCreditBonusApplied}
                      onChange={(e) =>
                        updateActiveRma((prev) => ({ ...prev, isStoreCreditBonusApplied: e.target.checked }))
                      }
                      className="w-4 h-4 rounded accent-[#2563eb] cursor-pointer"
                      id="bonusToggle"
                      type="checkbox"
                    />
                  </div>
                </div>
              </div>

              {/* Audit notes */}
              <div className="flex flex-col gap-1.5 pt-1">
                <span className={SECTION_LABEL}>{t('rma_notes_title')}</span>
                {activeRma.auditNotes.map((note, idx) => (
                  <div key={idx} className="bg-[#eff4ff]/60 dark:bg-slate-800/60 p-2.5 rounded-lg flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-[#dae2fd] flex items-center justify-center text-[10px] font-bold text-[#131b2e] shrink-0 mt-0.5">
                      {note.author.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-[#0b1c30] dark:text-white">
                          {note.author} ({note.role})
                        </span>
                        <span className="text-[10px] text-[#565e74] dark:text-slate-400">{note.date}</span>
                      </div>
                      <p className="text-[12px] text-[#565e74] dark:text-slate-300 mt-0.5">{note.message}</p>
                    </div>
                  </div>
                ))}

                <div className="relative">
                  <input
                    className="w-full h-9 pl-3 pr-24 bg-[#eff4ff] dark:bg-slate-800 text-[13px] text-[#0b1c30] dark:text-white placeholder:text-[#737686] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2563eb] transition-colors"
                    placeholder={t('rma_note_placeholder')}
                    type="text"
                    value={newNoteInput}
                    onChange={(e) => setNewNoteInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handlePostNote();
                      }
                    }}
                  />
                  <button
                    onClick={handlePostNote}
                    className="absolute right-1 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-[#dae2fd] hover:bg-[#c3d0f7] dark:bg-slate-700 dark:hover:bg-slate-600 text-[#0b1c30] dark:text-white text-[11px] rounded font-medium"
                    type="button"
                  >
                    {t('rma_post_note')}
                  </button>
                </div>
              </div>

              {/* Execution actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-4 border-t border-[#f0f4ff] dark:border-slate-800">
                <button
                  onClick={handleReject}
                  className="w-full sm:w-auto px-4 py-2 text-[#ba1a1a] hover:bg-[#ffdad6]/40 text-[13px] rounded-lg transition-colors flex items-center justify-center gap-1.5 font-semibold"
                  type="button"
                >
                  <Icon name="cancel" className="text-[18px]" />
                  <span>{t('rma_reject_btn')}</span>
                </button>
                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  <button
                    onClick={handleIssueStoreCredit}
                    className="w-full sm:w-auto px-4 py-2 bg-[#eff4ff] hover:bg-[#dae2fd] dark:bg-slate-800 dark:hover:bg-slate-700 text-[#0b1c30] dark:text-white text-[13px] rounded-lg transition-colors flex items-center justify-center gap-1.5 font-medium"
                    type="button"
                  >
                    <Icon name="card_giftcard" className="text-[18px]" />
                    <span>{t('rma_issue_credit', { amount: (activeRma.reimbursementTotal * 1.1).toFixed(0) })}</span>
                  </button>
                  <button
                    onClick={handleApproveRefund}
                    className="w-full sm:w-auto px-5 py-2 bg-[#2563eb] hover:bg-[#004ac6] text-white text-[13px] rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 font-semibold"
                    type="button"
                  >
                    <Icon name="check_circle" className="text-[18px]" />
                    <span>{t('rma_approve_btn', { amount: activeRma.reimbursementTotal.toFixed(2) })}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
