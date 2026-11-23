'use client';

import useLocales from '@/locales/use-locales';
import React, { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Icon } from '@/components/lucide-icon';
import { ProductReturnStatus } from '@/api/returns/get-product-returns';
import { formatWithCurrency } from '@/utils/lodash';
import { ItemCondition, RmaItem, RmaLine } from './types';
import { CARD, SECTION_LABEL, STATUS_LABEL_KEYS, getStatusBadgeClass } from './shared';

// Return lifecycle (ProductReturnStatusEnum). The happy path runs in this order;
// `rejected` is a terminal branch handled separately.
const LIFECYCLE: { status: ProductReturnStatus; labelKey: string; icon: string }[] = [
  { status: 'initiated', labelKey: 'rma_status_initiated', icon: 'assignment_return' },
  { status: 'collected', labelKey: 'rma_status_collected', icon: 'local_shipping' },
  { status: 'inspected', labelKey: 'rma_status_inspected', icon: 'search' },
  { status: 'approved', labelKey: 'rma_status_approved', icon: 'task_alt' },
  { status: 'completed', labelKey: 'rma_status_completed', icon: 'check_circle' },
];

// Return-reason codes stored by the backend (ProductReturnReasonEnum) → i18n keys.
const REASON_LABEL_KEYS: Record<string, string> = {
  'rr.reason_changed': 'rma_reason_changed',
  'rr.reason_wrong': 'rma_reason_wrong',
  'rr.reason_defective': 'rma_reason_defective',
  'rr.reason_not_described': 'rma_reason_not_described',
  'rr.reason_late': 'rma_reason_late',
  'rr.reason_other': 'rma_reason_other',
};

type TrackState = 'done' | 'active' | 'todo' | 'rejected';
interface TrackStep {
  key: string;
  labelKey: string;
  icon: string;
  state: TrackState;
}

// Build the tracking timeline from the return's current status. Every stage up to
// the current one is complete, the current one is active, later ones are pending.
// A rejected return shows the stages it cleared plus a terminal "Rejected" node.
const buildTracking = (status: RmaItem['status']): TrackStep[] => {
  if (status === 'rejected') {
    return [
      ...LIFECYCLE.slice(0, 3).map((s): TrackStep => ({
        key: s.status,
        labelKey: s.labelKey,
        icon: 'check',
        state: 'done',
      })),
      { key: 'rejected', labelKey: 'rma_status_rejected', icon: 'cancel', state: 'rejected' },
    ];
  }

  const current = LIFECYCLE.findIndex((s) => s.status === status);
  return LIFECYCLE.map((s, idx): TrackStep => {
    const state: TrackState =
      idx < current ? 'done' : idx === current ? (status === 'completed' ? 'done' : 'active') : 'todo';
    return { key: s.status, labelKey: s.labelKey, icon: state === 'done' ? 'check' : s.icon, state };
  });
};

const CONDITIONS: { value: ItemCondition; labelKey: string; descKey: string }[] = [
  { value: 'Pristine / Grade A', labelKey: 'rma_cond_a', descKey: 'rma_cond_a_desc' },
  { value: 'Grade B (Light Wear)', labelKey: 'rma_cond_b', descKey: 'rma_cond_b_desc' },
  { value: 'Damaged / Unsellable', labelKey: 'rma_cond_c', descKey: 'rma_cond_c_desc' },
];

const PACKAGING_CHECKS: {
  key: keyof RmaLine['packagingCheck'];
  id: string;
  labelKey: string;
}[] = [
  { key: 'packagingKept', id: 'checkPackagingKept', labelKey: 'rma_check_packaging_kept' },
  { key: 'returnCauseChecked', id: 'checkReturnCause', labelKey: 'rma_check_return_cause' },
  { key: 'itemMatch', id: 'checkItemMatch', labelKey: 'rma_check_item_match' },
];

interface ReturnDetailViewProps {
  rma: RmaItem;
  onUpdate: (updated: RmaItem) => void;
  onBack: () => void;
}

export const ReturnDetailView: React.FC<ReturnDetailViewProps> = ({ rma, onUpdate, onBack }) => {
  const { t } = useLocales();
  const [newNoteInput, setNewNoteInput] = useState('');

  const updateRma = (updater: (prev: RmaItem) => RmaItem) => onUpdate(updater(rma));

  // Translate a stored reason code, falling back to the raw value when unknown.
  const reasonLabel = (code: string) =>
    REASON_LABEL_KEYS[code] ? t(REASON_LABEL_KEYS[code]) : code;

  // Grade one returned line. Each item is inspected and classified on its own.
  const handleLineConditionSelect = (idx: number, cond: ItemCondition) => {
    updateRma((prev) => ({
      ...prev,
      lines: prev.lines.map((l, i) => (i === idx ? { ...l, condition: cond } : l)),
    }));
    toast.success(t('rma_toast_condition', { condition: t(CONDITIONS.find((c) => c.value === cond)!.labelKey) }));
  };

  // Toggle a packaging/accessory check on one returned line.
  const handleLinePackagingToggle = (
    idx: number,
    key: keyof RmaLine['packagingCheck'],
    checked: boolean,
  ) => {
    updateRma((prev) => ({
      ...prev,
      lines: prev.lines.map((l, i) =>
        i === idx ? { ...l, packagingCheck: { ...l.packagingCheck, [key]: checked } } : l,
      ),
    }));
  };

  const handlePostNote = () => {
    if (!newNoteInput.trim()) return;
    const newNote = {
      author: 'Elena Rostova',
      role: 'Head of Operations',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      message: newNoteInput.trim(),
    };
    updateRma((prev) => ({ ...prev, auditNotes: [...prev.auditNotes, newNote] }));
    setNewNoteInput('');
    toast.success(t('rma_toast_note'));
  };

  const handleApproveRefund = () => {
    updateRma((prev) => ({ ...prev, status: 'approved' }));
    toast.success(
      t('rma_toast_refund', {
        amount: formatWithCurrency(rma.reimbursementTotal),
        destination: rma.payoutDestination,
      })
    );
  };

  const handleIssueStoreCredit = () => {
    const bonusAmount = formatWithCurrency(rma.reimbursementTotal * 1.1);
    updateRma((prev) => ({ ...prev, status: 'approved', isStoreCreditBonusApplied: true }));
    toast.success(t('rma_toast_credit', { amount: bonusAmount, customer: rma.customerName }));
  };

  const handleReject = () => {
    updateRma((prev) => ({ ...prev, status: 'rejected' }));
    toast.error(t('rma_toast_reject', { id: rma.id }));
  };

  return (
    <div className="flex flex-col w-full gap-4">
      {/* Page header with back navigation */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-[#131b2e] hover:bg-[#eff4ff] dark:hover:bg-slate-800 text-[#0b1c30] dark:text-white text-[13px] rounded-lg shadow-2xs transition-all border border-[#e5eeff] dark:border-slate-700 font-medium shrink-0"
            type="button"
          >
            <Icon name="arrow_back" className="text-[18px]" />
            <span>{t('back_to_returns')}</span>
          </button>
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-xl text-[#0b1c30] dark:text-white font-bold truncate">#{rma.id}</span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold shrink-0 ${getStatusBadgeClass(rma.status)}`}
            >
              {t(STATUS_LABEL_KEYS[rma.status])}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => {
              toast.success(t('rma_toast_print', { bay: rma.bay }));
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
        </div>
      </div>

      {/* Summary card: refund type, created date, customer */}
      <div className={`${CARD} p-5 flex flex-col gap-4`}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#eff4ff]/60 dark:bg-slate-800/60 p-4 rounded-lg">
          <div className="flex flex-col">
            <span className="text-[11px] text-[#565e74] dark:text-slate-400">{t('rma_customer_details')}</span>
            <span className="text-[13px] text-[#0b1c30] dark:text-white font-semibold truncate">{rma.customerEmail}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-[#565e74] dark:text-slate-400">{t('rma_refund_type_label')}</span>
            <span className="text-[13px] text-[#0b1c30] dark:text-white font-semibold">
              {t(rma.refundType === 'credit' ? 'rma_refund_type_credit' : 'rma_refund_type_refund')}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-[#565e74] dark:text-slate-400">{t('rma_created_label')}</span>
            <span className="text-[13px] text-[#0b1c30] dark:text-white font-semibold">{rma.createdAtStr}</span>
          </div>
        </div>

        {/* Status tracking — derived from the return's current status */}
        <div className="pt-2">
          <span className={`${SECTION_LABEL} block mb-4`}>{t('rma_lifecycle')}</span>
          {(() => {
            const steps = buildTracking(rma.status);
            return (
              <div className="flex items-start">
                {steps.map((step, idx) => {
                  const isCurrent = step.state === 'active' || step.state === 'rejected';
                  return (
                    <React.Fragment key={step.key}>
                      <div className="flex flex-col items-center text-center gap-1 shrink-0 w-14">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                            step.state === 'done'
                              ? 'bg-[#2563eb] text-white shadow-sm'
                              : step.state === 'active'
                              ? 'bg-[#bc4800] text-white ring-4 ring-[#ffdbcd] shadow-sm'
                              : step.state === 'rejected'
                              ? 'bg-[#ba1a1a] text-white ring-4 ring-[#ffdad6] shadow-sm'
                              : 'bg-[#dae2fd] dark:bg-slate-700 text-[#565e74] dark:text-slate-300'
                          }`}
                        >
                          <Icon name={step.icon} className="text-[17px]" />
                        </div>
                        <span
                          className={`text-[11px] leading-tight ${
                            step.state === 'todo'
                              ? 'text-[#565e74] dark:text-slate-400'
                              : step.state === 'active'
                              ? 'font-bold text-[#bc4800]'
                              : step.state === 'rejected'
                              ? 'font-bold text-[#ba1a1a]'
                              : 'font-semibold text-[#0b1c30] dark:text-white'
                          }`}
                        >
                          {t(step.labelKey)}
                        </span>
                        {isCurrent && (
                          <span
                            className={`text-[10px] font-semibold ${
                              step.state === 'rejected' ? 'text-[#ba1a1a]' : 'text-[#bc4800]'
                            }`}
                          >
                            {t('rma_tracking_current')}
                          </span>
                        )}
                      </div>
                      {idx < steps.length - 1 && (
                        <div
                          className={`flex-1 h-0.5 mt-4 rounded-full ${
                            steps[idx + 1].state === 'done' || steps[idx + 1].state === 'active'
                              ? 'bg-[#2563eb]'
                              : steps[idx + 1].state === 'rejected'
                              ? 'bg-[#ba1a1a]'
                              : 'bg-[#dae2fd] dark:bg-slate-700'
                          }`}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Order details — the order this return belongs to */}
      {rma.order && (
        <div className={`${CARD} p-5 flex flex-col gap-4`}>
          <div className="flex items-center justify-between pb-2 border-b border-[#f0f4ff] dark:border-slate-800">
            <div className="flex items-center gap-1.5">
              <Icon name="receipt_long" className="text-[20px] text-[#004ac6] dark:text-blue-400" />
              <span className="text-[15px] text-[#0b1c30] dark:text-white font-semibold">{t('rma_order_details')}</span>
              {rma.order.isPriority && (
                <span className="px-2 py-0.5 rounded-full bg-[#ffdbcd] text-[#943700] text-[10px] font-bold">
                  {t('rma_order_priority')}
                </span>
              )}
            </div>
            {rma.order.uid && (
              <Link
                href={`/dashboard/orders-fulfillment/${rma.order.uid}`}
                className="flex items-center gap-1 text-[12px] font-semibold text-[#004ac6] dark:text-blue-400 hover:underline"
              >
                <span>{t('rma_view_order')}</span>
                <Icon name="chevron_right" className="text-[16px]" />
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Order & customer */}
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] text-[#565e74] dark:text-slate-400">{t('rma_order_number')}</span>
              <span className="text-[13px] text-[#0b1c30] dark:text-white font-semibold break-all">
                {rma.order.uid || '—'}
              </span>
              <span className="text-[13px] text-[#0b1c30] dark:text-white font-semibold mt-1.5">
                {rma.order.fullName || rma.customerEmail}
              </span>
              <span className="text-[12px] text-[#565e74] dark:text-slate-400 truncate">{rma.customerEmail}</span>
              {rma.order.phone && (
                <span className="text-[12px] text-[#565e74] dark:text-slate-400">{rma.order.phone}</span>
              )}
            </div>

            {/* Shipping address */}
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] text-[#565e74] dark:text-slate-400">{t('rma_shipping_address')}</span>
              {rma.order.addressLines.length > 0 ? (
                <div className="text-[12px] text-[#0b1c30] dark:text-white leading-snug">
                  {rma.order.addressLines.map((line, idx) => (
                    <p key={idx}>{line}</p>
                  ))}
                </div>
              ) : (
                <span className="text-[12px] text-[#565e74] dark:text-slate-400">—</span>
              )}
            </div>

            {/* Dates */}
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] text-[#565e74] dark:text-slate-400">{t('rma_order_placed')}</span>
              <span className="text-[13px] text-[#0b1c30] dark:text-white font-semibold">
                {rma.order.createdAtStr || '—'}
              </span>
              {rma.order.deliveredAtStr && (
                <>
                  <span className="text-[11px] text-[#565e74] dark:text-slate-400 mt-1.5">{t('rma_order_delivered')}</span>
                  <span className="text-[13px] text-[#0b1c30] dark:text-white font-semibold">
                    {rma.order.deliveredAtStr}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Order totals */}
          <div className="flex flex-col gap-1 text-[13px] bg-[#eff4ff]/60 dark:bg-slate-800/60 p-4 rounded-lg">
            {rma.order.discount > 0 && (
              <div className="flex items-center justify-between py-0.5 text-[#565e74] dark:text-slate-400">
                <span>{t('rma_order_subtotal')}</span>
                <span className="text-[#0b1c30] dark:text-white">
                  {formatWithCurrency(rma.order.orderPrice + rma.order.discount)}
                </span>
              </div>
            )}
            {rma.order.discount > 0 && (
              <div className="flex items-center justify-between py-0.5">
                <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                  {t('rma_order_discount')}
                  {rma.order.promoCode && (
                    <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded text-[10px] font-semibold uppercase tracking-wide">
                      {rma.order.promoCode}
                    </span>
                  )}
                </span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                  {formatWithCurrency(-rma.order.discount)}
                </span>
              </div>
            )}
            {rma.order.taxes > 0 && (
              <div className="flex items-center justify-between py-0.5 text-[#565e74] dark:text-slate-400">
                <span>{t('rma_order_taxes')}</span>
                <span className="text-[#0b1c30] dark:text-white">{formatWithCurrency(rma.order.taxes)}</span>
              </div>
            )}
            {rma.order.shippingFee > 0 && (
              <div className="flex items-center justify-between py-0.5 text-[#565e74] dark:text-slate-400">
                <span>{t('rma_order_shipping')}</span>
                <span className="text-[#0b1c30] dark:text-white">{formatWithCurrency(rma.order.shippingFee)}</span>
              </div>
            )}
            <div className="flex items-center justify-between py-1 text-[14px] font-bold text-[#0b1c30] dark:text-white">
              <span>{t('rma_order_total')}</span>
              <span className="text-[#004ac6] dark:text-blue-400">{formatWithCurrency(rma.order.orderPrice)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Quality grading card */}
      <div className={`${CARD} p-5 flex flex-col gap-4`}>
        <div className="flex items-center justify-between pb-2 border-b border-[#f0f4ff] dark:border-slate-800">
          <div className="flex items-center gap-1.5">
            <Icon name="grading" className="text-[20px] text-[#004ac6] dark:text-blue-400" />
            <span className="text-[15px] text-[#0b1c30] dark:text-white font-semibold">{t('rma_inspection_title')}</span>
          </div>
          <span className="text-[11px] text-[#565e74] dark:text-slate-400">{t('rma_inspector')}</span>
        </div>

        {/* Returned items — product (return) image, variant + variant image,
            returned quantity, unit price and reason, one row per line. */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className={SECTION_LABEL}>{t('rma_returned_items')}</span>
            <span className="text-[11px] text-[#565e74] dark:text-slate-400">
              {t('rma_items_count', { count: rma.itemCount })}
            </span>
          </div>

          {rma.lines.length === 0 ? (
            <p className="text-[12px] text-[#565e74] dark:text-slate-400 p-4 bg-[#eff4ff]/60 dark:bg-slate-800/60 rounded-lg">
              {t('rma_no_items')}
            </p>
          ) : (
            rma.lines.map((line, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3.5 p-3.5 bg-[#eff4ff]/60 dark:bg-slate-800/60 rounded-lg"
              >
                {/* Return (product) image */}
                {line.productImage ? (
                  <img
                    className="w-16 h-20 object-cover rounded-lg bg-slate-100 dark:bg-slate-700 shrink-0"
                    src={line.productImage}
                    alt={line.title}
                  />
                ) : (
                  <div className="w-16 h-20 rounded-lg bg-slate-100 dark:bg-slate-700 shrink-0 flex items-center justify-center text-[#c3c6d7] dark:text-slate-500">
                    <Icon name="inventory" className="text-[24px]" />
                  </div>
                )}

                <div className="flex flex-col flex-1 min-w-0 gap-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[14px] text-[#0b1c30] dark:text-white font-bold">
                      {line.title || t('rma_item_untitled')}
                    </span>
                    <span className="text-[14px] text-[#0b1c30] dark:text-white font-bold shrink-0">
                      {formatWithCurrency(line.unitPrice)}
                    </span>
                  </div>

                  {/* Variant: its photo alongside the variant label */}
                  {(line.variantLabel || line.variantImage) && (
                    <div className="flex items-center gap-2">
                      {line.variantImage && (
                        <img
                          className="w-7 h-7 object-cover rounded-md bg-slate-100 dark:bg-slate-700 shrink-0"
                          src={line.variantImage}
                          alt={line.variantLabel}
                        />
                      )}
                      {line.variantLabel && (
                        <span className="px-2 py-0.5 bg-[#dae2fd] dark:bg-slate-700 text-[#0b1c30] dark:text-white text-[11px] rounded font-medium">
                          {line.variantLabel}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-[11px] text-[#565e74] dark:text-slate-400">
                    <span className="font-semibold text-[#0b1c30] dark:text-white">
                      {t('rma_qty_short', { count: line.quantity })}
                    </span>
                    {line.reason && (
                      <span className="flex items-center gap-1">
                        <Icon name="help_outline" className="text-[13px]" />
                        {reasonLabel(line.reason)}
                      </span>
                    )}
                  </div>

                  {/* Per-item condition classification */}
                  <div className="flex flex-col gap-1 pt-1.5 mt-0.5 border-t border-[#dbe4ff] dark:border-slate-700">
                    <span className="text-[10px] font-semibold text-[#565e74] dark:text-slate-400 uppercase tracking-wider">
                      {t('rma_condition_title')}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {CONDITIONS.map(({ value, labelKey }) => {
                        const selected = line.condition === value;
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => handleLineConditionSelect(idx, value)}
                            aria-pressed={selected}
                            title={t(CONDITIONS.find((c) => c.value === value)!.descKey)}
                            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] transition-colors cursor-pointer ${
                              selected
                                ? 'bg-[#2563eb] text-white font-semibold shadow-2xs'
                                : 'bg-white dark:bg-slate-800 border border-[#c3c6d7] dark:border-slate-600 text-[#0b1c30] dark:text-white hover:bg-[#eff4ff] dark:hover:bg-slate-700 font-medium'
                            }`}
                          >
                            <Icon
                              name={selected ? 'check_circle' : 'radio_button_unchecked'}
                              className="text-[14px]"
                            />
                            {t(labelKey)}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Per-item packaging & accessories check */}
                  <div className="flex flex-col gap-1 pt-1.5">
                    <span className="text-[10px] font-semibold text-[#565e74] dark:text-slate-400 uppercase tracking-wider">
                      {t('rma_packaging_title')}
                    </span>
                    <div className="flex flex-wrap gap-x-3 gap-y-1.5">
                      {PACKAGING_CHECKS.map(({ key, id, labelKey }) => {
                        const inputId = `${id}-${idx}`;
                        return (
                          <div key={key} className="flex items-center gap-1.5">
                            <input
                              checked={line.packagingCheck[key]}
                              onChange={(e) => handleLinePackagingToggle(idx, key, e.target.checked)}
                              className="w-4 h-4 rounded accent-[#2563eb] cursor-pointer"
                              id={inputId}
                              type="checkbox"
                            />
                            <label
                              className="text-[11px] text-[#0b1c30] dark:text-white cursor-pointer select-none font-medium"
                              htmlFor={inputId}
                            >
                              {t(labelKey)}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}

          {rma.customerNote && (
            <div className="text-[11px] text-[#565e74] dark:text-slate-400 px-1">
              {t('rma_customer_note')}:{' '}
              <em className="text-[#0b1c30] dark:text-white">&quot;{rma.customerNote}&quot;</em>
            </div>
          )}
        </div>

      </div>

      {/* Financial reconciliation */}
      <div className={`${CARD} p-5 flex flex-col gap-4`}>
        <div className="flex items-center justify-between pb-2 border-b border-[#f0f4ff] dark:border-slate-800">
          <div className="flex items-center gap-1.5">
            <Icon name="receipt_long" className="text-[20px] text-[#004ac6] dark:text-blue-400" />
            <span className="text-[15px] text-[#0b1c30] dark:text-white font-semibold">{t('rma_ledger_title')}</span>
          </div>
          <span className="text-[11px] text-[#0b1c30] dark:text-white font-medium">
            {t('rma_currency')}: {process.env.NEXT_PUBLIC_APP_CURRENCY}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1 text-[13px]">
            <div className="flex items-center justify-between py-1 text-[#565e74] dark:text-slate-400">
              <span>{t('rma_orig_paid')}</span>
              <span className="font-semibold text-[#0b1c30] dark:text-white">{formatWithCurrency(rma.originalPaid)}</span>
            </div>
            <div className="flex items-center justify-between py-1 text-[#565e74] dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <span>{t('rma_logistics_fee')}</span>
                <span className="px-1.5 py-0.5 bg-[#dae2fd] text-[#004ac6] text-[10px] rounded font-semibold">
                  {t('rma_vip_waived')}
                </span>
              </div>
              <span className="text-[#0b1c30] dark:text-white">{formatWithCurrency(rma.logisticsFee)}</span>
            </div>
            <div className="flex items-center justify-between py-1 text-[#565e74] dark:text-slate-400">
              <span>{t('rma_restock_fee')}</span>
              <span className="text-[#0b1c30] dark:text-white">{formatWithCurrency(rma.restockingFee)}</span>
            </div>
            <div className="flex items-center justify-between py-2.5 mt-1 border-t border-[#e5eeff] dark:border-slate-700 text-[15px] font-bold text-[#0b1c30] dark:text-white">
              <span>{t('rma_total_due')}</span>
              <span className="text-[#004ac6] dark:text-blue-400">{formatWithCurrency(rma.reimbursementTotal)}</span>
            </div>
          </div>

          <div className="flex flex-col justify-between p-4 bg-[#eff4ff]/60 dark:bg-slate-800/60 rounded-lg gap-2.5">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="text-[13px] font-semibold text-[#0b1c30] dark:text-white">{t('rma_payout_dest')}</span>
                <span className="text-[12px] text-[#565e74] dark:text-slate-400">{rma.payoutDestination}</span>
              </div>
              <Icon name="credit_card" className="text-[22px] text-[#004ac6] dark:text-blue-400" />
            </div>

            <div className="p-2.5 bg-[#dae2fd]/60 dark:bg-slate-700 rounded-md flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-1.5">
                <Icon name="stars" className="text-[18px] text-[#004ac6] dark:text-blue-400" />
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-[#0b1c30] dark:text-white">{t('rma_offer_credit')}</span>
                  <span className="text-[11px] text-[#565e74] dark:text-slate-300">
                    {t('rma_credit_converts', { amount: formatWithCurrency(rma.reimbursementTotal * 1.1) })}
                  </span>
                </div>
              </div>
              <input
                checked={rma.isStoreCreditBonusApplied}
                onChange={(e) => updateRma((prev) => ({ ...prev, isStoreCreditBonusApplied: e.target.checked }))}
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
          {rma.auditNotes.map((note, idx) => (
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
              <span>{t('rma_issue_credit', { amount: formatWithCurrency(rma.reimbursementTotal * 1.1) })}</span>
            </button>
            <button
              onClick={handleApproveRefund}
              className="w-full sm:w-auto px-5 py-2 bg-[#2563eb] hover:bg-[#004ac6] text-white text-[13px] rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 font-semibold"
              type="button"
            >
              <Icon name="check_circle" className="text-[18px]" />
              <span>{t('rma_approve_btn', { amount: formatWithCurrency(rma.reimbursementTotal) })}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
